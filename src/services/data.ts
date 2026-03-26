// Mock data fallback when API is unavailable
export interface MedicineStock {
  id: string;
  name: string;
  strength?: string;
  priceRWF: number;
  quantity: number;
  requiresPrescription?: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  sector: string;
  address?: string;
  phone?: string;
  delivery: boolean;
  lat: number;
  lng: number;
  accepts: string[];
  stocks: MedicineStock[];
}

export const pharmacies: Pharmacy[] = [
  // Sample pharmacies - backend will provide real data
  {
    id: '1',
    name: 'Sample Pharmacy',
    sector: 'Kacyiru',
    delivery: true,
    lat: -1.9441,
    lng: 30.0619,
    accepts: ['RSSB', 'Mutuelle'],
    stocks: []
  }
];

