import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext({ user: null, loading: true, login: async () => {}, register: async () => {}, logout: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("echosplit_token");
    if (!token) { setLoading(false); return; }
    api.me()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("echosplit_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { access_token, user } = await api.login({ email, password });
    localStorage.setItem("echosplit_token", access_token);
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const { access_token, user } = await api.register({ name, email, password });
    localStorage.setItem("echosplit_token", access_token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("echosplit_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
