import { getSupabase } from '../lib/supabase.js';

const nowIso = () => new Date().toISOString();

export async function getPharmacyStock(pharmacyId) {
  const supabase = getSupabase();
  const { data: stocks, error } = await supabase
    .from('pharmacy_stocks')
    .select('id, price_rwf, quantity, medicines ( id, name, strength, requires_prescription )')
    .eq('pharmacy_id', pharmacyId);
  if (error) throw new Error(error.message);

  const rows = stocks || [];
  rows.sort((a, b) => (a.medicines?.name || '').localeCompare(b.medicines?.name || ''));

  return rows.map((stock) => {
    const m = stock.medicines;
    return {
      id: `med-${m?.id}`,
      stockId: stock.id,
      medicineId: m?.id,
      name: m?.name,
      strength: m?.strength || undefined,
      priceRWF: stock.price_rwf,
      requiresPrescription: !!m?.requires_prescription,
      quantity: stock.quantity,
    };
  });
}

export async function updateStock(pharmacyId, medicineId, quantity, priceRWF) {
  const supabase = getSupabase();
  const { data: existing, error: findErr } = await supabase
    .from('pharmacy_stocks')
    .select('id')
    .eq('pharmacy_id', pharmacyId)
    .eq('medicine_id', medicineId)
    .maybeSingle();
  if (findErr) throw new Error(findErr.message);
  if (!existing) throw new Error('Stock not found');

  const { error } = await supabase
    .from('pharmacy_stocks')
    .update({ quantity, price_rwf: priceRWF })
    .eq('pharmacy_id', pharmacyId)
    .eq('medicine_id', medicineId);
  if (error) throw new Error(error.message);

  return getPharmacyStock(pharmacyId);
}

function mapPharmacyOrderRow(order, items) {
  return {
    id: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    items: items.map(
      (item) =>
        `${item.medicine_name}${item.medicine_strength ? ` ${item.medicine_strength}` : ''} x ${item.quantity}`
    ),
    itemDetails: items,
    total: order.total_rwf,
    finalTotal: order.final_total_rwf ?? order.total_rwf,
    discountRWF: order.discount_rwf || 0,
    status: order.status,
    paymentMethod: order.payment_method,
    paymentPhone: order.payment_phone,
    paymentProof: order.payment_proof,
    paymentStatus: order.payment_status,
    insuranceProvider: order.insurance_provider,
    insuranceStatus: order.insurance_status,
    insuranceDocuments: order.insurance_documents,
    coveragePercent: order.coverage_percent,
    prescriptionStatus: order.prescription_status,
    prescriptionFile: order.prescription_file,
    delivery: order.delivery === true || order.delivery === 't',
    address: order.delivery_address,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

async function loadOrderItems(supabase, orderId) {
  const { data, error } = await supabase
    .from('order_items')
    .select('quantity, price_rwf, medicines ( name, strength )')
    .eq('order_id', orderId);
  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    quantity: row.quantity,
    price_rwf: row.price_rwf,
    medicine_name: row.medicines?.name,
    medicine_strength: row.medicines?.strength ?? null,
  }));
}

export async function getPharmacyOrders(pharmacyId, status = null) {
  const supabase = getSupabase();
  let query = supabase.from('orders').select('*').eq('pharmacy_id', pharmacyId).order('created_at', { ascending: false });
  if (status) {
    query = query.eq('status', status);
  }
  const { data: orders, error } = await query;
  if (error) throw new Error(error.message);

  const out = [];
  for (const order of orders || []) {
    const items = await loadOrderItems(supabase, order.id);
    out.push(mapPharmacyOrderRow(order, items));
  }
  return out;
}

export async function updateOrderStatus(pharmacyId, orderId, status) {
  const supabase = getSupabase();
  const { data: orderRow, error: oErr } = await supabase
    .from('orders')
    .select('id, customer_email')
    .eq('id', orderId)
    .eq('pharmacy_id', pharmacyId)
    .maybeSingle();
  if (oErr) throw new Error(oErr.message);
  if (!orderRow) throw new Error('Order not found');

  const { error: uErr } = await supabase
    .from('orders')
    .update({ status, updated_at: nowIso() })
    .eq('id', orderId)
    .eq('pharmacy_id', pharmacyId);
  if (uErr) throw new Error(uErr.message);

  if (orderRow.customer_email) {
    await supabase.from('notifications').insert({
      user_email: orderRow.customer_email,
      pharmacy_id: pharmacyId,
      role_target: 'user',
      title: 'Order status updated',
      message: `Order ${orderId} status is now ${status}.`,
      read: false,
    });
  }

  return getPharmacyOrders(pharmacyId);
}

export async function updatePrescriptionStatus(pharmacyId, orderId, prescriptionStatus) {
  const supabase = getSupabase();
  const { data: orderRow, error: oErr } = await supabase
    .from('orders')
    .select('id, customer_email')
    .eq('id', orderId)
    .eq('pharmacy_id', pharmacyId)
    .maybeSingle();
  if (oErr) throw new Error(oErr.message);
  if (!orderRow) throw new Error('Order not found');

  const { error: uErr } = await supabase
    .from('orders')
    .update({ prescription_status: prescriptionStatus, updated_at: nowIso() })
    .eq('id', orderId)
    .eq('pharmacy_id', pharmacyId);
  if (uErr) throw new Error(uErr.message);

  if (orderRow.customer_email) {
    await supabase.from('notifications').insert({
      user_email: orderRow.customer_email,
      pharmacy_id: pharmacyId,
      role_target: 'user',
      title: `Prescription ${prescriptionStatus}`,
      message: `Prescription for order ${orderId} was ${prescriptionStatus}.`,
      read: false,
    });
  }

  return getPharmacyOrders(pharmacyId);
}

export async function updatePaymentStatus(pharmacyId, orderId, paymentStatus) {
  const supabase = getSupabase();
  const { data: order, error: oErr } = await supabase
    .from('orders')
    .select('id, customer_email')
    .eq('id', orderId)
    .eq('pharmacy_id', pharmacyId)
    .maybeSingle();
  if (oErr) throw new Error(oErr.message);
  if (!order) throw new Error('Order not found');

  const { error: uErr } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus, updated_at: nowIso() })
    .eq('id', orderId)
    .eq('pharmacy_id', pharmacyId);
  if (uErr) throw new Error(uErr.message);

  if (order.customer_email) {
    await supabase.from('notifications').insert({
      user_email: order.customer_email,
      pharmacy_id: pharmacyId,
      role_target: 'user',
      title: `Payment ${paymentStatus}`,
      message: `Payment for order ${orderId} was ${paymentStatus}.`,
      read: false,
    });
  }
  return getPharmacyOrders(pharmacyId);
}

export async function updateInsuranceStatus(pharmacyId, orderId, insuranceStatus, coveragePercent = null) {
  const supabase = getSupabase();
  const { data: order, error: oErr } = await supabase
    .from('orders')
    .select('id, customer_email, total_rwf')
    .eq('id', orderId)
    .eq('pharmacy_id', pharmacyId)
    .maybeSingle();
  if (oErr) throw new Error(oErr.message);
  if (!order) throw new Error('Order not found');

  let discount = 0;
  let finalTotal = order.total_rwf;
  if (insuranceStatus === 'approved' && coveragePercent) {
    discount = (order.total_rwf * Number(coveragePercent)) / 100;
    finalTotal = order.total_rwf - discount;
  }

  const { error: uErr } = await supabase
    .from('orders')
    .update({
      insurance_status: insuranceStatus,
      coverage_percent: coveragePercent,
      discount_rwf: discount,
      final_total_rwf: finalTotal,
      updated_at: nowIso(),
    })
    .eq('id', orderId)
    .eq('pharmacy_id', pharmacyId);
  if (uErr) throw new Error(uErr.message);

  if (order.customer_email) {
    await supabase.from('notifications').insert({
      user_email: order.customer_email,
      pharmacy_id: pharmacyId,
      role_target: 'user',
      title: `Insurance ${insuranceStatus}`,
      message: `Insurance for order ${orderId} was ${insuranceStatus}.`,
      read: false,
    });
  }
  return getPharmacyOrders(pharmacyId);
}

export async function getPharmacyIdFromUser(userId, jwtPharmacyId) {
  const supabase = getSupabase();
  const { data: user } = await supabase.from('users').select('pharmacy_id').eq('id', userId).maybeSingle();
  const fromDb = user?.pharmacy_id || null;
  if (fromDb) return fromDb;
  if (jwtPharmacyId && typeof jwtPharmacyId === 'string') return jwtPharmacyId;
  return null;
}

export async function addStock(pharmacyId, medicineId, quantity, priceRWF) {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('pharmacy_stocks')
    .select('id')
    .eq('pharmacy_id', pharmacyId)
    .eq('medicine_id', medicineId)
    .maybeSingle();
  if (existing) throw new Error('Stock already exists for this medicine');

  const { error } = await supabase.from('pharmacy_stocks').insert({
    pharmacy_id: pharmacyId,
    medicine_id: medicineId,
    quantity,
    price_rwf: priceRWF,
  });
  if (error) throw new Error(error.message);

  return getPharmacyStock(pharmacyId);
}

export async function deleteStock(pharmacyId, medicineId) {
  const supabase = getSupabase();
  const { data: stock } = await supabase
    .from('pharmacy_stocks')
    .select('id')
    .eq('pharmacy_id', pharmacyId)
    .eq('medicine_id', medicineId)
    .maybeSingle();
  if (!stock) throw new Error('Stock not found');

  const { error } = await supabase.from('pharmacy_stocks').delete().eq('pharmacy_id', pharmacyId).eq('medicine_id', medicineId);
  if (error) throw new Error(error.message);

  return getPharmacyStock(pharmacyId);
}

export async function getAllMedicines() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('medicines')
    .select('id, name, strength, requires_prescription')
    .order('name');
  if (error) throw new Error(error.message);
  return (data || []).map((m) => ({
    id: m.id,
    name: m.name,
    strength: m.strength,
    requiresPrescription: !!m.requires_prescription,
  }));
}

export async function getPharmacyInsurance(pharmacyId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('pharmacy_insurance')
    .select('insurance_id, insurance_types ( id, name )')
    .eq('pharmacy_id', pharmacyId);
  if (error) throw new Error(error.message);
  return (data || [])
    .map((row) => row.insurance_types)
    .filter(Boolean)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export async function getAllInsuranceTypes() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('insurance_types').select('id, name').order('name');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addInsurancePartner(pharmacyId, insuranceId) {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('pharmacy_insurance')
    .select('id')
    .eq('pharmacy_id', pharmacyId)
    .eq('insurance_id', insuranceId)
    .maybeSingle();
  if (existing) throw new Error('Insurance partner already added');

  const { error } = await supabase.from('pharmacy_insurance').insert({ pharmacy_id: pharmacyId, insurance_id: insuranceId });
  if (error) throw new Error(error.message);

  return getPharmacyInsurance(pharmacyId);
}

export async function removeInsurancePartner(pharmacyId, insuranceId) {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('pharmacy_insurance')
    .select('id')
    .eq('pharmacy_id', pharmacyId)
    .eq('insurance_id', insuranceId)
    .maybeSingle();
  if (!existing) throw new Error('Insurance partner not found');

  const { error } = await supabase.from('pharmacy_insurance').delete().eq('pharmacy_id', pharmacyId).eq('insurance_id', insuranceId);
  if (error) throw new Error(error.message);

  return getPharmacyInsurance(pharmacyId);
}

export async function getOrderDetails(pharmacyId, orderId) {
  const supabase = getSupabase();
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).eq('pharmacy_id', pharmacyId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error('Order not found');

  const items = await loadOrderItems(supabase, orderId);
  return mapPharmacyOrderRow(order, items);
}
