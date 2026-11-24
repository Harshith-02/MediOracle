import { create } from 'zustand';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  roles: string[];
  facility_id?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: string;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchActiveRole: (role: string) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('medioracle_token'),
  isAuthenticated: !!localStorage.getItem('medioracle_token'),
  isLoading: true,
  activeRole: 'FACILITY',

  initAuth: async () => {
    const token = localStorage.getItem('medioracle_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      const user: User = res.data;
      const initialRole = user.roles[0] || 'FACILITY';
      set({ user, isAuthenticated: true, activeRole: initialRole, isLoading: false });
    } catch (err) {
      localStorage.removeItem('medioracle_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    
    // FastAPI OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', email.trim().toLowerCase());
    params.append('password', pass);

    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, roles } = res.data;
    if (!access_token) {
      throw new Error('Access token missing in login response');
    }

    localStorage.setItem('medioracle_token', access_token);

    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user: User = meRes.data;

    set({
      token: access_token,
      user,
      isAuthenticated: true,
      activeRole: roles[0] || 'FACILITY',
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('medioracle_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  switchActiveRole: (role: string) => {
    set({ activeRole: role });
  },
}));
