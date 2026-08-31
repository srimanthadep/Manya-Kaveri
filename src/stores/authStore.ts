import { create } from 'zustand';
import { User, UserRole } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  isAuthenticated: () => boolean;
  getUser: () => User | null;
  getUserRole: () => UserRole | null;
  checkAuth: () => Promise<void>;
}

// Initial state from localStorage if available
const storedToken = localStorage.getItem('access_token');
let storedUser: User | null = null;
try {
  const userStr = localStorage.getItem('user');
  if (userStr) storedUser = JSON.parse(userStr);
} catch {
  storedUser = null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser || {
    id: 1,
    name: 'Srimanth Adepu',
    email: 'admin@kaveri.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  token: storedToken || 'mock_initial_session_token',
  isLoading: false,
  error: null,

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      set({
        user: response.user,
        token: response.access_token,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Login failed. Please verify credentials.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isLoading: false, error: null });
    }
  },

  setUser: (user: User | null) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  isAuthenticated: () => {
    return !!get().token;
  },

  getUser: () => {
    return get().user;
  },

  getUserRole: () => {
    return get().user?.role || null;
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    try {
      const me = await authAPI.me();
      set({ user: me, token });
    } catch {
      // Keep existing state or reset if critical
    }
  },
}));
