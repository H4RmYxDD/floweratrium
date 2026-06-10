import { create } from "zustand";

interface User {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role?: string;
  createdAt?: string; 
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
  isLoggedIn: () => get().user !== null,
}));

export default useAuthStore;
