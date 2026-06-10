import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import { tokenStore } from "../store/tokenStore";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, []);

  return <>{children}</>;
}
