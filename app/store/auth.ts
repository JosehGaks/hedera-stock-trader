'use client';

import { create } from 'zustand';

interface User {
  accountId: string;
  publicKey: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async () => {
    try {
      set({ loading: true });
      // For now, we'll just set a mock user
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Sign in error:', error);
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true });
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ loading: false });
    }
  },
  setUser: (user) => set({ user }),
})); 