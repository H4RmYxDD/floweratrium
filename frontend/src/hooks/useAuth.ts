import useAuthStore from "../store/authStore";
import { tokenStore } from "../store/tokenStore";
import api from "../api/apiClient";
import type { User } from "../types/User";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export function useAuth() {
  const { setUser, logout: storeLogout } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    const { data } = await api.post<LoginResponse>("/login", credentials);
    tokenStore.set(data.token);
    setUser(data.user);
  };

  const logout = () => {
    tokenStore.clear();
    storeLogout();
  };

  return { login, logout };
}
