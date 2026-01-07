import React, { createContext, useState, useEffect } from "react";
import { api } from "./services/apia";
import { jwtDecode } from "jwt-decode"; // Importación nombrada, ES6

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar token de localStorage al iniciar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      
      if (storedToken) {
        try {
          // Verificar token válido
          const decoded = jwtDecode(storedToken);
          
          // Verificar expiración
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            console.warn("Token expirado");
            logout();
          } else {
            setAccessToken(storedToken);
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

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken); // Usar jwtDecode (con D mayúscula)
      
      // Guardar en localStorage
      localStorage.setItem("accessToken", newToken);
      
      // Actualizar estado
      setAccessToken(newToken);
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
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Opcional: Limpiar otros datos de usuario
    localStorage.removeItem("userData");
  };

  // Interceptor Axios: agrega Authorization automáticamente
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken") || accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [accessToken]);

  const value = {
    isAuthenticated,
    accessToken,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};