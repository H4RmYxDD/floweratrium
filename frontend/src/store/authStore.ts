import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userId: string | null;

  setUserId: (userId: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,

      setToken: (token) => set({ token }),
      setUserId: (userId) => set({ userId }),

      logout: () => set({ token: null }),

      isLoggedIn: () => get().token !== null,
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuth;
