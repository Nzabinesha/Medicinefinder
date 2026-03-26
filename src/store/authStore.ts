import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: 'user' | 'pharmacy' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string, role?: 'user' | 'pharmacy') => Promise<void>;
  logout: () => void;
  setUser: (user: User | null, token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        const { loginUser } = await import('@/services/api');
        const result = await loginUser(email, password);
        set({
          user: result.user,
          token: result.token,
        });
      },
      signup: async (name: string, email: string, password: string, phone?: string, role: 'user' | 'pharmacy' = 'user') => {
        const { signupUser } = await import('@/services/api');
        const result = await signupUser(name, email, password, phone, role);
        set({
          user: result.user,
          token: result.token,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
        });
      },
      setUser: (user: User | null, token: string | null) => {
        set({
          user,
          token,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useIsAuthenticated = () => useAuthStore(state => state.user !== null);

