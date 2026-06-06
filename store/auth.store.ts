import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  session: unknown | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: unknown | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, session: null }),
      isLoggedIn: () => get().user !== null,
    }),
    {
      name: "boogiebugi-auth",
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
);
