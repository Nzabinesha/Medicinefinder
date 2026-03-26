import 'dotenv/config';
import { getSupabase } from '../lib/supabase.js';
import { ensurePharmacyPortalUsers, pharmacyPortalEmail } from '../lib/pharmacyPortalAccounts.js';

const DEFAULT_SEED_PHARMACY_PASSWORD = 'PharmaSeed#Dev1';

const insuranceMapping = {
  'Britam': 'Britam',
  'Eden Care Medical': 'Eden Care Medical',
  'Radiant Insurance': 'Radiant Insurance',
  'Military Medical Insurance': 'Military Medical Insurance',
  'Old Mutual Insurance Rwanda': 'Old Mutual Insurance Rwanda',
  'Prime Insurance': 'Prime Insurance',
  'Sanlam Allianz Life Insurance Plc': 'Sanlam Allianz Life Insurance Plc',
  'SAHAM ASSURANCE RWANDA': 'SAHAM ASSURANCE RWANDA',
  'Sonarwa': 'Sonarwa',
  'Medical Insurance Scheme Of University Of Rwanda': 'Medical Insurance Scheme Of University Of Rwanda',
  'Zion Insurance Brokers Ltd': 'Zion Insurance Brokers Ltd',
};

const pharmacies = [
  {
    id: 'ph-001',
    name: 'Adrenaline Pharmacy Ltd',
    sector: 'Remera',
    address: 'Kigali - Remera, Rwanda',
    phone: '+250785636683',
    delivery: true,
    lat: -1.9570,
    lng: 30.1220,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Glucose (5% w/v)',
      'Ceftriaxone + Sulbactam',
      'Basiliximab',
      'Miconazole Nitrate',
      'Prasugrel',
      'Tacrolimus',
      'Ranibizumab',
      'Ferrous Sulphate',
      'Ornidazole',
      'Magnesium Hydroxide / Aluminium Hydroxide / Simethicone',
      'Sulphamethoxazole & Trimethoprim',
      'Clindamycin Phosphate + Tretinoin',
      'Azithromycin',
      'Ciprofloxacin',
    ],
  },
  {
    id: 'ph-002',
    name: 'PHARMACIE PHARMALAB',
    sector: 'Kacyiru',
    address: '25W6+RG9, Kacyiru, Kigali, Rwanda',
    phone: '+250788477537',
    delivery: true,
    lat: -1.9447,
    lng: 30.0614,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-003',
    name: 'Pharmacie Conseil',
    sector: 'Kinyinya',
    address: 'KN 78 St, Kinyinya, Kigali, Rwanda',
    phone: '+250788380066',
    delivery: true,
    lat: -1.9441,
    lng: 30.0619,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
      'Sanlam Allianz Life Insurance Plc',
      'SAHAM ASSURANCE RWANDA',
      'Sonarwa',
      'Medical Insurance Scheme Of University Of Rwanda',
      'Zion Insurance Brokers Ltd',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-004',
    name: 'AfriChem Rwanda Ltd',
    sector: 'Gikondo',
    address: 'KN 1 RD 67, Gikondo, Kigali, Rwanda',
    phone: '+250788300784',
    delivery: true,
    description: 'Leading supplier of quality chemical products',
    lat: -1.9570,
    lng: 30.1220,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-005',
    name: 'PHARMACIE CONTINENTALE',
    sector: 'Kimihurura',
    address: 'KG 1 Ave, Kimihurura, Kigali, Rwanda',
    phone: '+250788306878',
    delivery: true,
    description: 'Quality pharmaceuticals and healthcare services in Kigali',
    lat: -1.9480,
    lng: 30.0580,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
      'Sanlam Allianz Life Insurance Plc',
      'SAHAM ASSURANCE RWANDA',
      'Sonarwa',
      'Medical Insurance Scheme Of University Of Rwanda',
      'Zion Insurance Brokers Ltd',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-006',
    name: 'Kipharma',
    sector: 'Gisozi',
    address: 'KN 74 Street, Gisozi, Kigali, Rwanda',
    phone: '+250252572944',
    delivery: true,
    lat: -1.9440,
    lng: 30.0620,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-007',
    name: 'Oasis Pharmacy',
    sector: 'Masoro',
    address: '24FM+3P4, Masoro, Kigali, Rwanda',
    phone: '+250781958800',
    delivery: true,
    lat: -1.9450,
    lng: 30.06,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
    ],
  },
  {
    id: 'ph-008',
    name: 'Anik Industries',
    sector: 'Kacyiru',
    address: 'Bp. 211, Kacyiru, Kigali, Rwanda',
    phone: '+250252572164',
    delivery: true,
    description: 'Leading provider of quality industrial products',
    lat: -1.9460,
    lng: 30.059,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-009',
    name: 'DEPOT PHARMACEUTIQUE',
    sector: 'Kimironko',
    address: 'Kimironko, P.O.Box 2770, Kigali, Rwanda',
    phone: '+250252577571',
    delivery: true,
    description: 'Quality pharmaceuticals and healthcare services provider',
    lat: -1.944,
    lng: 30.062,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Hydrochloride',
      'Rifampin + Isoniazid',
      'Etoricoxib',
      'Phloroglucinol + Trimethyl Phloroglucinol',
      'Zinc Sulfate Monohydrate',
      'Magnesium Pidolate',
      'Ofloxacin + Ornidazole',
      'Metronidazole',
      'Artesunate',
      'Itraconazole',
      'Febuxostat',
      'Cyproheptadine Hydrochloride + Lysine Hydrochloride',
      'Artemether + Lumefantrine',
      'Atorvastatin + Ezetimibe',
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-010',
    name: 'BIOPHARMACIA',
    sector: 'Kacyiru',
    address: 'Kacyiru, P.O.Box 2513, Kigali, Rwanda',
    phone: '+250252504086',
    delivery: true,
    description: 'Innovative solutions for healthcare and pharmaceuticals',
    lat: -1.9435,
    lng: 30.0615,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-011',
    name: 'Unipharma Kipharma',
    sector: 'Remera',
    address: 'KN 74 Street, Remera, Kigali, Rwanda',
    phone: '+250252572944',
    delivery: true,
    lat: -1.944,
    lng: 30.062,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Hydrochloride',
      'Rifampin + Isoniazid',
      'Etoricoxib',
      'Phloroglucinol + Trimethyl Phloroglucinol',
      'Zinc Sulfate Monohydrate',
      'Magnesium Pidolate',
      'Ofloxacin + Ornidazole',
      'Metronidazole',
      'Artesunate',
      'Itraconazole',
      'Febuxostat',
      'Cyproheptadine Hydrochloride + Lysine Hydrochloride',
      'Artemether + Lumefantrine',
      'Atorvastatin + Ezetimibe',
    ],
  },
  {
    id: 'ph-012',
    name: 'Lifecare',
    sector: 'Kimironko',
    address: 'Bp. 5000, Kimironko, Kigali, Rwanda',
    phone: '+250252501313',
    delivery: true,
    lat: -1.947,
    lng: 30.058,
    insurance: [
      'Sanlam Allianz Life Insurance Plc',
      'SAHAM ASSURANCE RWANDA',
      'Sonarwa',
      'Medical Insurance Scheme Of University Of Rwanda',
      'Zion Insurance Brokers Ltd',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-013',
    name: 'Conseil Pharmacy',
    sector: 'Remera',
    address: 'Bp. 1072, Remera, Kigali, Rwanda',
    phone: '+250252572374',
    delivery: true,
    lat: -1.9455,
    lng: 30.0595,
    insurance: [
      'Sanlam Allianz Life Insurance Plc',
      'SAHAM ASSURANCE RWANDA',
      'Sonarwa',
      'Medical Insurance Scheme Of University Of Rwanda',
      'Zion Insurance Brokers Ltd',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-014',
    name: 'DEPOT PHARMACEUTIQUE ET MATERIEL MEDICAL KALISIMBI',
    sector: 'Ndera',
    address: 'Ndera, P.O.Box 4526, Kigali, Rwanda',
    phone: '+250252202549',
    delivery: true,
    description: 'Quality pharmaceuticals and medical supplies distributor',
    lat: -1.943,
    lng: 30.061,
    insurance: [
      'Sanlam Allianz Life Insurance Plc',
      'SAHAM ASSURANCE RWANDA',
      'Sonarwa',
      'Medical Insurance Scheme Of University Of Rwanda',
      'Zion Insurance Brokers Ltd',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-015',
    name: 'Moderne',
    sector: 'Nyamirambo',
    address: 'Nyamirambo, Kigali, Rwanda',
    phone: '+250788000000',
    delivery: true,
    lat: -1.942,
    lng: 30.06,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-016',
    name: 'Opa Pharmacy',
    sector: 'Remera',
    address: 'Remera, Kigali, Rwanda',
    phone: '+250788000001',
    delivery: true,
    lat: -1.956,
    lng: 30.121,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
  {
    id: 'ph-017',
    name: "Sara's Pharmacy",
    sector: 'Kimironko',
    address: 'Kimironko, Kigali, Rwanda',
    phone: '+250788000002',
    delivery: true,
    lat: -1.9465,
    lng: 30.0585,
    insurance: [
      'Britam',
      'Eden Care Medical',
      'Radiant Insurance',
      'Military Medical Insurance',
      'Old Mutual Insurance Rwanda',
      'Prime Insurance',
    ],
    stocks: [
      'Cyclobenzaprine Hydrochloride',
      'Azithromycin (suspension)',
      'Secnidazole',
      'Omeprazole',
      'Levonorgestrel',
      'Erythromycin',
      'Paracetamol',
      'Methyldopa',
      'Ibuprofen',
      'Linagliptin',
      'Bisoprolol Fumarate',
      'Clobetasol Propionate',
      'Tramadol Hydrochloride',
      'Methocarbamol + Paracetamol',
      'Deflazacort',
      'Nebivolol Hydrochlorothiazide',
      'Budesonide',
    ],
  },
];

function parseMedicine(medicineName) {
  const parts = medicineName.split('(');
  const name = parts[0].trim();
  const strength = parts[1] ? parts[1].replace(')', '').trim() : null;
  const prescriptionMeds = [
    'Ceftriaxone',
    'Basiliximab',
    'Tacrolimus',
    'Ranibizumab',
    'Levonorgestrel',
    'Tramadol',
    'Clobetasol',
    'Azithromycin',
    'Ciprofloxacin',
    'Ornidazole',
    'Secnidazole',
    'Clindamycin',
  ];
  const requiresPrescription = prescriptionMeds.some((med) => medicineName.toLowerCase().includes(med.toLowerCase()));
  return { name, strength, requiresPrescription };
}

function randomPrice() {
  return Math.floor(Math.random() * 4500) + 500;
}

function randomQuantity() {
  return Math.floor(Math.random() * 101);
}

export async function seedDatabase() {
  console.log('🌱 Starting Supabase seed...');
  const supabase = getSupabase();

  const { error: uPhDelErr } = await supabase.from('users').delete().eq('role', 'pharmacy');
  if (uPhDelErr) throw new Error(`clear pharmacy users: ${uPhDelErr.message}`);

  const { error: pDelErr } = await supabase.from('pharmacies').delete().neq('id', '');
  if (pDelErr) throw new Error(`clear pharmacies: ${pDelErr.message}`);

  const { error: mDelErr } = await supabase.from('medicines').delete().neq('id', -1);
  if (mDelErr) throw new Error(`clear medicines: ${mDelErr.message}`);

  const { error: iDelErr } = await supabase.from('insurance_types').delete().neq('id', -1);
  if (iDelErr) throw new Error(`clear insurance_types: ${iDelErr.message}`);

  const insuranceNames = Object.values(insuranceMapping);
  const { error: insErr } = await supabase.from('insurance_types').insert(insuranceNames.map((name) => ({ name })));
  if (insErr) throw new Error(`insurance_types: ${insErr.message}`);

  const { data: insRows } = await supabase.from('insurance_types').select('id, name');
  const insuranceMap = new Map((insRows || []).map((r) => [r.name, r.id]));

  const pharmRows = pharmacies.map((ph) => ({
    id: ph.id,
    name: ph.name,
    sector: ph.sector,
    address: ph.address,
    phone: ph.phone,
    delivery: ph.delivery,
    lat: ph.lat,
    lng: ph.lng,
    description: ph.description ?? null,
  }));
  const { error: phErr } = await supabase.from('pharmacies').insert(pharmRows);
  if (phErr) throw new Error(`pharmacies: ${phErr.message}`);

  const piRows = [];
  for (const pharmacy of pharmacies) {
    for (const insuranceName of pharmacy.insurance) {
      const insuranceId = insuranceMap.get(insuranceName);
      if (insuranceId) {
        piRows.push({ pharmacy_id: pharmacy.id, insurance_id: insuranceId });
      }
    }
  }
  if (piRows.length) {
    const { error: piErr } = await supabase.from('pharmacy_insurance').insert(piRows);
    if (piErr) throw new Error(`pharmacy_insurance: ${piErr.message}`);
  }

  const allMedicines = new Set();
  for (const pharmacy of pharmacies) {
    for (const medicine of pharmacy.stocks) {
      const parsed = parseMedicine(medicine);
      allMedicines.add(
        JSON.stringify({
          name: parsed.name,
          strength: parsed.strength,
          requires_prescription: parsed.requiresPrescription,
        })
      );
    }
  }

  const medicineMap = new Map();
  for (const medStr of allMedicines) {
    const med = JSON.parse(medStr);
    const { data: inserted, error: mErr } = await supabase
      .from('medicines')
      .insert({
        name: med.name,
        strength: med.strength,
        requires_prescription: med.requires_prescription,
      })
      .select('id')
      .single();
    if (mErr) throw new Error(`medicines: ${mErr.message}`);
    const key = `${med.name}${med.strength ? `(${med.strength})` : ''}`;
    medicineMap.set(key, inserted.id);
  }

  for (const pharmacy of pharmacies) {
    for (const medicineName of pharmacy.stocks) {
      const parsed = parseMedicine(medicineName);
      const key = `${parsed.name}${parsed.strength ? `(${parsed.strength})` : ''}`;
      const medicineId = medicineMap.get(key);
      if (!medicineId) continue;

      const { data: ex } = await supabase
        .from('pharmacy_stocks')
        .select('id')
        .eq('pharmacy_id', pharmacy.id)
        .eq('medicine_id', medicineId)
        .maybeSingle();
      if (ex) continue;

      const { error: sErr } = await supabase.from('pharmacy_stocks').insert({
        pharmacy_id: pharmacy.id,
        medicine_id: medicineId,
        price_rwf: randomPrice(),
        quantity: randomQuantity(),
      });
      if (sErr) throw new Error(`pharmacy_stocks: ${sErr.message}`);
    }
  }

  const portalPassword = process.env.SEED_PHARMACY_PASSWORD || DEFAULT_SEED_PHARMACY_PASSWORD;
  if (!process.env.SEED_PHARMACY_PASSWORD) {
    console.warn(
      `⚠️  SEED_PHARMACY_PASSWORD not set; pharmacy portal logins use default "${DEFAULT_SEED_PHARMACY_PASSWORD}" (Pharmacy Login).`
    );
  }
  const portalPharmacies = pharmRows.map(({ id, name, phone }) => ({ id, name, phone }));
  const { created: portalCreated } = await ensurePharmacyPortalUsers(supabase, portalPharmacies, portalPassword);
  if (portalCreated.length) {
    console.log(`🔐 ${portalCreated.length} pharmacy portal account(s) (email portal.{id}@medifinder.test)`);
    for (const row of portalCreated.slice(0, 3)) {
      console.log(`   • ${row.name}: ${pharmacyPortalEmail(row.pharmacyId)}`);
    }
    if (portalCreated.length > 3) console.log(`   • …and ${portalCreated.length - 3} more`);
  }

  console.log('✅ Supabase seeded successfully!');
}

const isMainModule =
  import.meta.url === `file://${process.argv[1]}` || import.meta.url.includes('seed.js');

if (isMainModule || process.argv[1]?.includes('seed.js')) {
  seedDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
