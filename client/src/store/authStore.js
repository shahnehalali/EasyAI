import { create } from 'zustand';
import { authApi } from '@/apis/authApi';

export const useAuthStore = create((set) => ({
  user: null,
  status: 'loading', // loading | authenticated | anonymous

  async loadSession() {
    try {
      const { user } = await authApi.me();
      set({ user, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'anonymous' });
    }
  },

  setUser(user) {
    set({ user, status: user ? 'authenticated' : 'anonymous' });
  },

  async logout() {
    await authApi.logout();
    set({ user: null, status: 'anonymous' });
  },
}));
