import { create } from 'zustand';

export interface CartItem {
  pharmacyId: string;
  medicineId: string;
  name: string;
  priceRWF: number;
  quantity: number;
  requiresPrescription?: boolean;
}

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (pharmacyId: string, medicineId: string) => void;
  clear: () => void;
  total: () => number;
  setQuantity: (pharmacyId: string, medicineId: string, quantity: number) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  add: (item) => set((state) => {
    const idx = state.items.findIndex(i => i.pharmacyId === item.pharmacyId && i.medicineId === item.medicineId);
    if (idx >= 0) {
      const updated = [...state.items];
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity };
      return { items: updated };
    }
    return { items: [...state.items, item] };
  }),
  remove: (pharmacyId, medicineId) => set((state) => ({
    items: state.items.filter(i => !(i.pharmacyId === pharmacyId && i.medicineId === medicineId))
  })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.priceRWF * i.quantity, 0),
  setQuantity: (pharmacyId, medicineId, quantity) => set((state) => ({
    items: state.items.map(i => i.pharmacyId === pharmacyId && i.medicineId === medicineId ? { ...i, quantity: Math.max(1, quantity) } : i)
  }))
}));

