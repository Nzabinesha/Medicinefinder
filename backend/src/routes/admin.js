import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getSupabase } from '../lib/supabase.js';
import bcrypt from 'bcryptjs';

export const adminRouter = express.Router();

adminRouter.use(authenticateToken);
adminRouter.use(requireAdmin);

adminRouter.get('/pharmacies', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: pharmacies, error: pErr } = await supabase
      .from('pharmacies')
      .select('id, name, sector, phone, address')
      .order('name');
    if (pErr) throw new Error(pErr.message);

    const { data: pharmacyUsers, error: uErr } = await supabase
      .from('users')
      .select('email, pharmacy_id')
      .eq('role', 'pharmacy');
    if (uErr) throw new Error(uErr.message);

    const emailByPharmacy = new Map();
    for (const u of pharmacyUsers || []) {
      if (u.pharmacy_id && u.email) {
        emailByPharmacy.set(u.pharmacy_id, u.email);
      }
    }

    const rows = (pharmacies || []).map((p) => ({
      id: p.id,
      name: p.name,
      sector: p.sector,
      phone: p.phone,
      address: p.address,
      login_email: emailByPharmacy.get(p.id) ?? null,
    }));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pharmacies', message: error.message });
  }

});

adminRouter.post('/pharmacies', async (req, res) => {
  try {
    const supabase = getSupabase();
    const {
      id,
      name,
      sector,
      address,
      phone,
      delivery,
      lat,
      lng,
      description,
      insuranceNames = [],
      loginEmail,
      loginPassword,
    } = req.body || {};

    if (!name || !sector || !loginEmail || !loginPassword) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'name, sector, loginEmail and loginPassword are required',
      });
    }

    const pharmacyId = id || `ph-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userId = `pharmacy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const { error: pInsErr } = await supabase.from('pharmacies').insert({
      id: pharmacyId,
      name,
      sector,
      address: address || null,
      phone: phone || null,
      delivery: !!delivery,
      lat: typeof lat === 'number' ? lat : null,
      lng: typeof lng === 'number' ? lng : null,
      description: description || null,
    });
    if (pInsErr) {
      return res.status(500).json({ error: 'Failed to create pharmacy', message: pInsErr.message });
    }

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', loginEmail).maybeSingle();
    if (existingUser) {
      await supabase.from('pharmacies').delete().eq('id', pharmacyId);
      return res.status(409).json({ error: 'Conflict', message: 'Pharmacy email already exists' });
    }

    const hashedPassword = await bcrypt.hash(loginPassword, 10);
    const { error: uInsErr } = await supabase.from('users').insert({
      id: userId,
      email: loginEmail,
      name,
      phone: phone || null,
      password: hashedPassword,
      role: 'pharmacy',
      pharmacy_id: pharmacyId,
    });
    if (uInsErr) {
      await supabase.from('pharmacies').delete().eq('id', pharmacyId);
      return res.status(500).json({ error: 'Failed to create pharmacy user', message: uInsErr.message });
    }

    const insuranceList = Array.isArray(insuranceNames) ? insuranceNames : [];
    for (const insName of insuranceList) {
      const { data: it } = await supabase.from('insurance_types').select('id').eq('name', insName).maybeSingle();
      if (it?.id) {
        const { error: linkErr } = await supabase
          .from('pharmacy_insurance')
          .insert({ pharmacy_id: pharmacyId, insurance_id: it.id });
        if (linkErr && linkErr.code !== '23505' && linkErr.code !== 23505) {
          await supabase.from('users').delete().eq('id', userId);
          await supabase.from('pharmacies').delete().eq('id', pharmacyId);
          return res.status(500).json({ error: 'Failed to link insurance', message: linkErr.message });
        }
      }
    }

    res.status(201).json({ id: pharmacyId, loginEmail, loginPassword, emailSent: false });
  } catch (error) {
    console.error('Error creating pharmacy:', error);
    res.status(500).json({ error: 'Failed to create pharmacy', message: error.message });
  }
});

adminRouter.delete('/pharmacies/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { id } = req.params;
    await supabase.from('users').delete().eq('pharmacy_id', id).eq('role', 'pharmacy');
    const { error } = await supabase.from('pharmacies').delete().eq('id', id);
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pharmacy', message: error.message });
  }
});
