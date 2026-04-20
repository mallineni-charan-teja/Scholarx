import { useMemo, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContextObject";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("scholarx_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("scholarx_token", data.token);
    localStorage.setItem("scholarx_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
  };

  const logout = () => {
    localStorage.removeItem("scholarx_token");
    localStorage.removeItem("scholarx_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
