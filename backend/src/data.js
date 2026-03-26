export const pharmacies = [
  {
    id: 'rx-001',
    name: 'Kacyiru Health Pharmacy',
    sector: 'Kacyiru',
    accepts: ['RSSB', 'Mutuelle', 'Private-A'],
    delivery: true,
    phone: '+250788000111',
    lat: -1.9447,
    lng: 30.0614,
    stocks: [
      { id: 'med-amox', name: 'Amoxicillin', strength: '500mg', priceRWF: 2500, requiresPrescription: true, quantity: 24 },
      { id: 'med-par', name: 'Paracetamol', strength: '500mg', priceRWF: 500, requiresPrescription: false, quantity: 100 },
    ]
  },
  {
    id: 'rx-002',
    name: 'Downtown City Pharmacy',
    sector: 'Nyarugenge',
    accepts: ['RSSB', 'Private-B'],
    delivery: false,
    phone: '+250788000222',
    lat: -1.9441,
    lng: 30.0619,
    stocks: [
      { id: 'med-amox', name: 'Amoxicillin', strength: '500mg', priceRWF: 2600, requiresPrescription: true, quantity: 8 },
      { id: 'med-ibup', name: 'Ibuprofen', strength: '200mg', priceRWF: 800, requiresPrescription: false, quantity: 40 },
    ]
  },
  {
    id: 'rx-003',
    name: 'Remera Family Pharmacy',
    sector: 'Remera',
    accepts: ['Mutuelle', 'Private-A', 'Private-B'],
    delivery: true,
    phone: '+250788000333',
    lat: -1.9570,
    lng: 30.1220,
    stocks: [
      { id: 'med-par', name: 'Paracetamol', strength: '500mg', priceRWF: 450, requiresPrescription: false, quantity: 0 },
      { id: 'med-azt', name: 'Azithromycin', strength: '250mg', priceRWF: 3500, requiresPrescription: true, quantity: 12 },
    ]
  }
];

// In-memory user storage (in production, use a database)
export const users = [];

// Helper function to find user by email
export function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

// Helper function to find user by id
export function findUserById(id) {
  return users.find(u => u.id === id);
}
