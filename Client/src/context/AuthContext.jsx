import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  clearToken,
  getStoredToken,
  storeToken,
} from "../api/client";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      if (!getStoredToken()) {
        setLoading(false);
        return;
      }

      try {
        const payload = await apiRequest("/auth/me");
        setUser(payload.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  useEffect(() => {
    window.addEventListener("parkops:unauthorized", logout);
    return () => window.removeEventListener("parkops:unauthorized", logout);
  }, [logout]);

  const authenticate = useCallback(async (endpoint, credentials) => {
    const payload = await apiRequest(endpoint, {
      method: "POST",
      body: credentials,
    });
    storeToken(payload.token);
    setUser(payload.user);
    return payload.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: (credentials) => authenticate("/auth/login", credentials),
      register: (credentials) => authenticate("/auth/register", credentials),
      logout,
    }),
    [authenticate, loading, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
