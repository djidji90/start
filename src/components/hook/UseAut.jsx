// src/components/context/AuthContext.jsx - VERSIÓN CORREGIDA

import React, { createContext, useState, useEffect } from "react";
import { api } from "../hook/services/apia";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar tokens de localStorage al iniciar
  useEffect(() => {
    const initAuth = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (storedAccessToken && storedRefreshToken) {
        try {
          const decoded = jwtDecode(storedAccessToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expirado, intentar renovar
            const renewed = await refreshAccessToken(storedRefreshToken);
            if (!renewed) {
              logout();
            }
          } else {
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
            setIsAuthenticated(true);
            setUser({
              id: decoded.user_id || decoded.sub,
              username: decoded.username || decoded.email,
              email: decoded.email,
              roles: decoded.roles || []
            });
          }
        } catch (error) {
          console.warn("Token inválido:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Función para renovar token
  const refreshAccessToken = async (oldRefreshToken) => {
    try {
      const response = await api.post("/musica/api/token/refresh/", {
        refresh: oldRefreshToken
      });

      const { access } = response.data;
      if (access) {
        localStorage.setItem("accessToken", access);
        setAccessToken(access);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  const login = (accessToken, refreshToken) => {
    try {
      const decoded = jwtDecode(accessToken);

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setIsAuthenticated(true);
      setUser({
        id: decoded.user_id || decoded.sub,
        username: decoded.username || decoded.email,
        email: decoded.email,
        roles: decoded.roles || []
      });

      return { success: true, user: decoded };
    } catch (error) {
      console.error("Error decodificando token:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    login,
    logout,
    loading,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};