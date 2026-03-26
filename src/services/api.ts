import { pharmacies, Pharmacy } from './data';
import { User } from '@/store/authStore';
import { API_BASE } from './apiBase';

export interface SearchParams {
  q?: string;
  loc?: string;
  insurance?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const ADMIN_EMAIL = 'nzabineshamerci99@gmail.com';
const ADMIN_PASSWORD = 'Merci';

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function searchPharmacies(params: SearchParams): Promise<Pharmacy[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set('q', params.q);
    if (params.loc) queryParams.set('loc', params.loc);
    if (params.insurance) queryParams.set('insurance', params.insurance);
    
    const response = await fetch(`${API_BASE}/pharmacies?${queryParams.toString()}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('API unavailable, using mock data', error);
  }
  
  // Fallback to mock data
  const { q, loc, insurance } = params;
  let results = pharmacies;
  if (loc) {
    results = results.filter(p => p.sector.toLowerCase().includes(loc.toLowerCase()));
  }
  if (insurance) {
    results = results.filter(p => p.accepts.map(a => a.toLowerCase()).includes(insurance.toLowerCase()));
  }
  if (q) {
    results = results.filter(p => p.stocks.some(s => s.name.toLowerCase().includes(q.toLowerCase())));
  }
  await new Promise(r => setTimeout(r, 200));
  return results;
}

export async function getPharmacy(id: string): Promise<Pharmacy | undefined> {
  try {
    const response = await fetch(`${API_BASE}/pharmacies/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('API unavailable, using mock data', error);
  }
  
  await new Promise(r => setTimeout(r, 150));
  return pharmacies.find(p => p.id === id);
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  } catch (error) {
    if (error instanceof Error && error.message !== 'Login failed') {
      throw error;
    }
    console.warn('API unavailable, using mock authentication', error);
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const user: User = {
      id: 'admin-1',
      email,
      name: 'Administrator',
      role: 'admin',
    };
    const token = `mock-token-admin-${Date.now()}`;
    return { user, token };
  }
  
  const user: User = {
    id: `user-${Date.now()}`,
    email,
    name: email.split('@')[0],
    role: 'user',
  };
  
  const token = `mock-token-${Date.now()}`;
  
  return { user, token };
}

export async function signupUser(
  name: string,
  email: string,
  password: string,
  phone?: string,
  role: 'user' | 'pharmacy' = 'user'
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, phone, role }),
    });
    
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  } catch (error) {
    if (error instanceof Error && error.message !== 'Signup failed') {
      throw error;
    }
    console.warn('API unavailable, using mock authentication', error);
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }
  
  if (!isStrongPassword(password)) {
    throw new Error('Password must be strong (min 8 chars, include uppercase, lowercase, number, and special character)');
  }
  
  const user: User = {
    id: role === 'pharmacy' ? `pharmacy-${Date.now()}` : `user-${Date.now()}`,
    email,
    name,
    phone,
    role,
  };
  
  const token = `mock-token-${Date.now()}`;
  
  return { user, token };
}

export async function getMedicineOptions(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/pharmacies/meta/medicines`);
    if (response.ok) {
      const items: Array<{ name: string }> = await response.json();
      return items.map(i => i.name);
    }
  } catch (error) {
    console.warn('API unavailable, using mock data', error);
  }

  const meds = new Set<string>();
  for (const p of pharmacies) {
    for (const s of p.stocks) {
      meds.add(s.name);
    }
  }
  return Array.from(meds.values()).sort((a, b) => a.localeCompare(b));
}

export async function getInsuranceTypeOptions(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/pharmacies/meta/insurance-types`);
    if (response.ok) {
      const items: Array<{ name: string }> = await response.json();
      return items.map(i => i.name);
    }
  } catch (error) {
    console.warn('API unavailable, using mock data', error);
  }

  const ins = new Set<string>();
  pharmacies.forEach(p => p.accepts.forEach(a => ins.add(a)));
  return Array.from(ins).sort((a, b) => a.localeCompare(b));
}

export async function adminCreatePharmacy(token: string, input: {
  id?: string;
  name: string;
  sector: string;
  address?: string;
  phone?: string;
  delivery?: boolean;
  lat?: number;
  lng?: number;
  description?: string;
  insuranceNames?: string[];
  loginEmail: string;
  loginPassword: string;
}): Promise<{ id: string; loginEmail?: string; loginPassword?: string; emailSent?: boolean }> {
  const response = await fetch(`${API_BASE}/admin/pharmacies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (response.ok) return await response.json();
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || 'Failed to create pharmacy');
}

export async function adminListPharmacies(token: string): Promise<Array<{ id: string; name: string; sector: string; phone?: string; address?: string; login_email?: string }>> {
  const response = await fetch(`${API_BASE}/admin/pharmacies`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) return await response.json();
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || 'Failed to fetch pharmacies');
}

export async function adminDeletePharmacy(token: string, pharmacyId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/pharmacies/${pharmacyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) return;
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || 'Failed to delete pharmacy');
}

export async function changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (response.ok) return;
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || 'Failed to change password');
}

export interface CreateOrderInput {
  pharmacyId: string;
  items: Array<{ name: string; medicineId: string; quantity: number }>;
  delivery: boolean;
  deliveryAddress?: string | null;
  prescriptionFile?: string | null;
  paymentMethod: 'cash' | 'insurance';
  paymentPhone?: string | null;
  paymentProof?: string | null;
  insuranceProvider?: string | null;
  insuranceDocuments?: string | null;
  insuranceCoveragePercent?: number | null;
}

export async function createOrder(token: string, input: CreateOrderInput) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (response.ok) return await response.json();
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || 'Failed to create order');
}

export async function getNotifications(token: string): Promise<Array<{ id: number; title: string; message: string; read: number; created_at: string }>> {
  const response = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) return await response.json();
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || 'Failed to fetch notifications');
}

export async function markNotificationRead(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) return;
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || 'Failed to update notification');
}

export interface OrderItem {
  name: string;
  strength?: string;
  quantity: number;
  priceRWF: number;
  total: number;
}

export interface Order {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyPhone: string;
  pharmacyAddress: string;
  items: OrderItem[];
  totalRWF: number;
  status: string;
  prescriptionStatus?: string | null;
  prescriptionFile?: string | null;
  delivery: boolean;
  deliveryAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getUserOrders(token: string): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch orders');
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

