// src/context/AuthContext.jsx
import React, { createContext, useState } from "react";

export const AuthContext = createContext({
  auth: null,            // { token, adminId } or null
  setAuth: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(() => {
    const token = localStorage.getItem("adminToken");
    const adminId = localStorage.getItem("adminId");
    return token ? { token, adminId } : null;
  });

  const setAuth = ({ token, adminId }) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminId", adminId);
    setAuthState({ token, adminId });
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    setAuthState(null);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
