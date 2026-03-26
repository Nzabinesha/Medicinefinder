import express from 'express';
import { getSupabase } from '../lib/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { findUserById } from '../services/userService.js';

export const ordersRouter = express.Router();

async function resolveCustomerEmail(req) {
  let email = req.user.email;
  if (!email && req.user.userId) {
    const u = await findUserById(req.user.userId);
    email = u?.email;
  }
  return email;
}

async function fetchStockByMedicineId(supabase, pharmacyId, numericMedicineId) {
  const { data } = await supabase
    .from('pharmacy_stocks')
    .select('price_rwf, quantity, medicine_id, medicines ( id, name )')
    .eq('pharmacy_id', pharmacyId)
    .eq('medicine_id', numericMedicineId)
    .maybeSingle();
  if (!data) return null;
  const m = data.medicines;
  return {
    price_rwf: data.price_rwf,
    quantity: data.quantity,
    medicine_id: m?.id,
    medicine_name: m?.name,
  };
}

// full column select for fuzzy matching
const stockSelectFuzzy =
  'price_rwf, quantity, medicine_id, medicines ( id, name, strength )';

async function tryStocksByMedicineNameIlike(supabase, pharmacyId, pattern) {
  const { data: meds } = await supabase.from('medicines').select('id').ilike('name', pattern);
  const medIds = (meds || []).map((m) => m.id);
  if (!medIds.length) return [];
  const { data } = await supabase
    .from('pharmacy_stocks')
    .select(stockSelectFuzzy)
    .eq('pharmacy_id', pharmacyId)
    .in('medicine_id', medIds);
  return data || [];
}

function rowToStock(row) {
  const m = row.medicines;
  if (!m) return null;
  return {
    price_rwf: row.price_rwf,
    quantity: row.quantity,
    medicine_id: m.id,
    medicine_name: m.name,
    strength: m.strength,
  };
}

function matchStockFromRows(rows, cleanName, baseName) {
  const normalize = (str) => str.replace(/[()%]/g, '').trim().toLowerCase();
  const normalizedSearch = normalize(cleanName);

  for (const row of rows) {
    const s = rowToStock(row);
    if (!s) continue;
    const dbName = normalize(s.medicine_name || '');
    const dbFull = normalize(`${s.medicine_name || ''} ${s.strength || ''}`);
    const dbFullParen = normalize(`${s.medicine_name || ''} (${s.strength || ''})`);

    if (
      dbName === normalizedSearch ||
      dbFull === normalizedSearch ||
      dbFullParen === normalizedSearch ||
      dbName.includes(normalizedSearch) ||
      normalizedSearch.includes(dbName) ||
      (baseName && dbName === normalize(baseName))
    ) {
      return s;
    }
  }
  return null;
}

ordersRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      pharmacyId,
      items,
      delivery,
      deliveryAddress,
      prescriptionFile,
      paymentMethod = 'cash',
      paymentPhone = null,
      paymentProof = null,
      insuranceProvider = null,
      insuranceDocuments = null,
      insuranceCoveragePercent = null,
    } = req.body;

    if (!pharmacyId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Pharmacy ID and items are required',
      });
    }

    const supabase = getSupabase();
    let totalRwf = 0;
    const orderItems = [];

    for (const item of items) {
      let stock = null;

      let numericMedicineId = null;
      if (item.medicineId) {
        const match = item.medicineId.toString().match(/(\d+)$/);
        if (match) {
          numericMedicineId = parseInt(match[1], 10);
        } else if (!Number.isNaN(parseInt(item.medicineId, 10))) {
          numericMedicineId = parseInt(item.medicineId, 10);
        }
      }

      if (numericMedicineId) {
        stock = await fetchStockByMedicineId(supabase, pharmacyId, numericMedicineId);
      }

      if (!stock && item.name) {
        const cleanName = item.name.trim().replace(/\s+/g, ' ');
        const nameParts = cleanName.split(/\s+(?=\d|%)/);
        const baseName = nameParts[0]?.trim() || cleanName;

        const { data: exactRows } = await supabase
          .from('pharmacy_stocks')
          .select(stockSelectFuzzy)
          .eq('pharmacy_id', pharmacyId);

        const rows = exactRows || [];
        for (const row of rows) {
          const m = row.medicines;
          if (!m) continue;
          const n = (m.name || '').trim();
          if (n.toLowerCase() === cleanName.toLowerCase()) {
            stock = rowToStock(row);
            break;
          }
        }

        if (!stock && baseName) {
          for (const row of rows) {
            const m = row.medicines;
            if (!m) continue;
            if ((m.name || '').trim().toLowerCase() === baseName.toLowerCase()) {
              stock = rowToStock(row);
              break;
            }
          }
        }

        if (!stock) {
          const ilikeRows = await tryStocksByMedicineNameIlike(supabase, pharmacyId, `%${cleanName}%`);
          stock = matchStockFromRows(ilikeRows, cleanName, baseName);
        }

        if (!stock) {
          stock = matchStockFromRows(rows, cleanName, baseName);
        }
      }

      if (!stock) {
        const { data: availableMedicines } = await supabase
          .from('pharmacy_stocks')
          .select('quantity, medicines ( id, name, strength )')
          .eq('pharmacy_id', pharmacyId);

        console.error(`[Order Error] Medicine not found:`, {
          searched: item.name,
          medicineId: item.medicineId,
          pharmacyId,
          available: (availableMedicines || []).map(
            (m) => `${m.medicines?.name || ''} ${m.medicines?.strength || ''}`.trim()
          ),
        });

        return res.status(400).json({
          error: 'Invalid item',
          message: `Medicine "${item.name}" not found in pharmacy stock. Please verify the medicine is available at this pharmacy.`,
        });
      }

      if (stock.quantity < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Only ${stock.quantity} available for ${item.name}`,
        });
      }

      const itemTotal = stock.price_rwf * item.quantity;
      totalRwf += itemTotal;

      orderItems.push({
        medicineId: stock.medicine_id,
        quantity: item.quantity,
        priceRwf: stock.price_rwf,
      });
    }

    const medIds = orderItems.map((i) => i.medicineId);
    const { data: medFlags } = await supabase.from('medicines').select('requires_prescription').in('id', medIds);
    const needsPrescription = (medFlags || []).some((m) => m.requires_prescription);

    const prescriptionStatus = needsPrescription ? (prescriptionFile ? 'pending' : 'pending') : null;

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const user = req.user;
    let customerName = user?.name || 'Guest';
    const customerEmail = await resolveCustomerEmail(req);
    if (!customerEmail) {
      return res.status(400).json({ error: 'Validation error', message: 'Could not resolve user email for order' });
    }
    if ((!customerName || customerName === 'Guest') && user?.userId) {
      const u = await findUserById(user.userId);
      if (u?.name) customerName = u.name;
    }
    const customerPhone = user?.phone ?? null;

    let discountRwf = 0;
    if (insuranceCoveragePercent && Number(insuranceCoveragePercent) > 0) {
      discountRwf = (totalRwf * Number(insuranceCoveragePercent)) / 100;
    }
    const finalTotalRwf = totalRwf - discountRwf;
    const insuranceStatus = insuranceProvider ? 'pending' : 'not_required';
    const paymentStatus = paymentMethod === 'cash' ? (paymentProof ? 'pending_verification' : 'pending') : 'pending';

    const { error: orderErr } = await supabase.from('orders').insert({
      id: orderId,
      pharmacy_id: pharmacyId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      total_rwf: totalRwf,
      status: 'pending',
      prescription_status: prescriptionStatus,
      prescription_file: prescriptionFile || null,
      delivery: !!delivery,
      delivery_address: deliveryAddress || null,
      payment_method: paymentMethod,
      payment_phone: paymentPhone,
      payment_proof: paymentProof,
      payment_status: paymentStatus,
      insurance_provider: insuranceProvider,
      insurance_status: insuranceStatus,
      insurance_documents: insuranceDocuments,
      coverage_percent: insuranceCoveragePercent ? Number(insuranceCoveragePercent) : null,
      discount_rwf: discountRwf,
      final_total_rwf: finalTotalRwf,
    });

    if (orderErr) {
      console.error(orderErr);
      return res.status(500).json({ error: 'Failed to create order', message: orderErr.message });
    }

    const itemRows = orderItems.map((it) => ({
      order_id: orderId,
      medicine_id: it.medicineId,
      quantity: it.quantity,
      price_rwf: it.priceRwf,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(itemRows);
    if (itemsErr) {
      await supabase.from('orders').delete().eq('id', orderId);
      console.error(itemsErr);
      return res.status(500).json({ error: 'Failed to create order items', message: itemsErr.message });
    }

    await supabase.from('notifications').insert({
      user_email: customerEmail,
      pharmacy_id: pharmacyId,
      role_target: 'pharmacy',
      title: 'New order received',
      message: `Order ${orderId} was placed and needs review.`,
      read: false,
    });

    res.status(201).json({
      id: orderId,
      message: 'Order created successfully',
      prescriptionStatus,
      paymentStatus,
      insuranceStatus,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    });
  }
});

ordersRouter.get('/', authenticateToken, async (req, res) => {
  try {
    const email = await resolveCustomerEmail(req);
    if (!email) {
      return res.status(400).json({ error: 'Validation error', message: 'Could not resolve user email' });
    }

    const supabase = getSupabase();
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        pharmacy_id,
        customer_name,
        customer_email,
        customer_phone,
        total_rwf,
        status,
        prescription_status,
        prescription_file,
        delivery,
        delivery_address,
        payment_method,
        payment_phone,
        payment_proof,
        payment_status,
        insurance_provider,
        insurance_status,
        insurance_documents,
        coverage_percent,
        discount_rwf,
        final_total_rwf,
        created_at,
        updated_at,
        pharmacies ( name, phone, address )
      `
      )
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to get orders', message: error.message });
    }

    const ordersWithItems = [];
    for (const order of orders || []) {
      const { data: items } = await supabase
        .from('order_items')
        .select('quantity, price_rwf, medicines ( name, strength )')
        .eq('order_id', order.id);

      const p = order.pharmacies;
      ordersWithItems.push({
        id: order.id,
        pharmacyId: order.pharmacy_id,
        pharmacyName: p?.name,
        pharmacyPhone: p?.phone,
        pharmacyAddress: p?.address,
        items: (items || []).map((row) => ({
          name: row.medicines?.name,
          strength: row.medicines?.strength || undefined,
          quantity: row.quantity,
          priceRWF: row.price_rwf,
          total: row.price_rwf * row.quantity,
        })),
        totalRWF: order.total_rwf,
        status: order.status,
        prescriptionStatus: order.prescription_status,
        prescriptionFile: order.prescription_file,
        delivery: order.delivery === true || order.delivery === 't',
        deliveryAddress: order.delivery_address,
        paymentMethod: order.payment_method,
        paymentPhone: order.payment_phone,
        paymentProof: order.payment_proof,
        paymentStatus: order.payment_status,
        insuranceProvider: order.insurance_provider,
        insuranceStatus: order.insurance_status,
        insuranceDocuments: order.insurance_documents,
        coveragePercent: order.coverage_percent,
        discountRWF: order.discount_rwf,
        finalTotalRWF: order.final_total_rwf || order.total_rwf,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      });
    }

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      error: 'Failed to get orders',
      message: error.message,
    });
  }
});
