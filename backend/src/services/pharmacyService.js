import { getSupabase } from '../lib/supabase.js';

function boolDelivery(v) {
  return v === true || v === 1 || v === 't';
}

function formatStocks(stockRows) {
  return (stockRows || []).map((row) => {
    const m = row.medicines;
    return {
      id: `med-${m?.id}`,
      name: m?.name,
      strength: m?.strength || undefined,
      priceRWF: row.price_rwf,
      requiresPrescription: !!m?.requires_prescription,
      quantity: row.quantity,
    };
  });
}

async function loadStocksForPharmacies(supabase, pharmacyIds) {
  if (!pharmacyIds.length) return new Map();
  const { data, error } = await supabase
    .from('pharmacy_stocks')
    .select('pharmacy_id, price_rwf, quantity, medicines ( id, name, strength, requires_prescription )')
    .in('pharmacy_id', pharmacyIds);
  if (error) throw new Error(error.message);
  const map = new Map();
  for (const row of data || []) {
    const pid = row.pharmacy_id;
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid).push(row);
  }
  for (const [, rows] of map) {
    rows.sort((a, b) => (a.medicines?.name || '').localeCompare(b.medicines?.name || ''));
  }
  return map;
}

async function loadInsuranceNamesForPharmacies(supabase, pharmacyIds) {
  if (!pharmacyIds.length) return new Map();
  const { data, error } = await supabase
    .from('pharmacy_insurance')
    .select('pharmacy_id, insurance_types ( name )')
    .in('pharmacy_id', pharmacyIds);
  if (error) throw new Error(error.message);
  const map = new Map();
  for (const row of data || []) {
    const name = row.insurance_types?.name;
    if (!name) continue;
    if (!map.has(row.pharmacy_id)) map.set(row.pharmacy_id, []);
    map.get(row.pharmacy_id).push(name);
  }
  return map;
}

function formatPharmacyRow(pharmacy, acceptsMap, stockMap) {
  const accepts = acceptsMap.get(pharmacy.id) || [];
  const stocks = formatStocks(stockMap.get(pharmacy.id) || []);
  return {
    id: pharmacy.id,
    name: pharmacy.name,
    sector: pharmacy.sector,
    address: pharmacy.address,
    phone: pharmacy.phone,
    delivery: boolDelivery(pharmacy.delivery),
    lat: pharmacy.lat,
    lng: pharmacy.lng,
    description: pharmacy.description,
    accepts,
    stocks,
  };
}

export async function searchPharmacies(params) {
  const supabase = getSupabase();
  const { q, loc, insurance } = params;

  let query = supabase.from('pharmacies').select('*');
  if (loc) {
    query = query.ilike('sector', `%${loc}%`);
  }
  const { data: pharmacies, error } = await query;
  if (error) throw new Error(error.message);

  let list = pharmacies || [];

  if (insurance) {
    const { data: types } = await supabase
      .from('insurance_types')
      .select('id')
      .ilike('name', `%${insurance}%`);
    const typeIds = (types || []).map((t) => t.id);
    if (!typeIds.length) {
      return [];
    }
    const { data: pi } = await supabase.from('pharmacy_insurance').select('pharmacy_id').in('insurance_id', typeIds);
    const allowed = new Set((pi || []).map((r) => r.pharmacy_id));
    list = list.filter((p) => allowed.has(p.id));
  }

  if (q) {
    const term = `%${q}%`;
    const { data: medRows } = await supabase.from('medicines').select('id').ilike('name', term);
    const medIds = (medRows || []).map((m) => m.id);
    if (!medIds.length) {
      return [];
    }
    const { data: ps } = await supabase.from('pharmacy_stocks').select('pharmacy_id').in('medicine_id', medIds);
    const allowed = new Set((ps || []).map((r) => r.pharmacy_id));
    list = list.filter((p) => allowed.has(p.id));
  }

  const ids = list.map((p) => p.id);
  const [acceptsMap, stockMap] = await Promise.all([
    loadInsuranceNamesForPharmacies(supabase, ids),
    loadStocksForPharmacies(supabase, ids),
  ]);

  return list.map((p) => formatPharmacyRow(p, acceptsMap, stockMap));
}

export async function getPharmacyById(id) {
  const supabase = getSupabase();
  const { data: pharmacy, error } = await supabase.from('pharmacies').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!pharmacy) return null;

  const [acceptsMap, stockMap] = await Promise.all([
    loadInsuranceNamesForPharmacies(supabase, [id]),
    loadStocksForPharmacies(supabase, [id]),
  ]);

  return formatPharmacyRow(pharmacy, acceptsMap, stockMap);
}
