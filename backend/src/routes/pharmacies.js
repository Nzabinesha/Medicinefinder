import express from 'express';
import { searchPharmacies, getPharmacyById } from '../services/pharmacyService.js';
import { getSupabase } from '../lib/supabase.js';

export const pharmaciesRouter = express.Router();

pharmaciesRouter.get('/', async (req, res) => {
  try {
    const { q, loc, insurance } = req.query;
    const results = await searchPharmacies({ q, loc, insurance });
    res.json(results);
  } catch (error) {
    console.error('Error searching pharmacies:', error);
    res.status(500).json({ error: 'Failed to search pharmacies', message: error.message });
  }
});

pharmaciesRouter.get('/list/all', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: pharmacies, error } = await supabase
      .from('pharmacies')
      .select('id, name, sector, phone')
      .order('name');
    if (error) throw new Error(error.message);
    res.json(pharmacies || []);
  } catch (error) {
    console.error('Error getting pharmacies list:', error);
    res.status(500).json({ error: 'Failed to get pharmacies', message: error.message });
  }
});

pharmaciesRouter.get('/meta/medicines', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: meds, error } = await supabase.from('medicines').select('name').order('name');
    if (error) throw new Error(error.message);
    const seen = new Set();
    const distinct = [];
    for (const row of meds || []) {
      if (row.name && !seen.has(row.name)) {
        seen.add(row.name);
        distinct.push({ name: row.name });
      }
    }
    res.json(distinct);
  } catch (error) {
    console.error('Error getting medicines:', error);
    res.status(500).json({ error: 'Failed to get medicines', message: error.message });
  }
});

pharmaciesRouter.get('/meta/insurance-types', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: insurance, error } = await supabase.from('insurance_types').select('name').order('name');
    if (error) throw new Error(error.message);
    res.json(insurance || []);
  } catch (error) {
    console.error('Error getting insurance types:', error);
    res.status(500).json({ error: 'Failed to get insurance types', message: error.message });
  }
});

pharmaciesRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacy = await getPharmacyById(id);

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    console.error('Error getting pharmacy:', error);
    res.status(500).json({ error: 'Failed to get pharmacy', message: error.message });
  }
});
