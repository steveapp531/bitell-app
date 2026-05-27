import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bitell_token");
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("bitell_token");
        localStorage.removeItem("bitell_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = useCallback((token, userData) => {
    localStorage.setItem("bitell_token", token);
    localStorage.setItem("bitell_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  }, [persistSession]);

  const register = useCallback(async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem("bitell_token");
    localStorage.removeItem("bitell_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      const userData = res.data.user;
      localStorage.setItem("bitell_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
