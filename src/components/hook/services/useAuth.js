// src/components/hook/services/useAuth.js
// ✅ Hook optimizado para autenticación
// ✅ Sin event listeners que causaban bucles infinitos
// ✅ Ready for production

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuthToken } from '../../../components/hook/services/apia';

/**
 * Hook para manejar la autenticación del usuario
 * Proporciona el usuario actual y estado de autenticación
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  /**
   * Cargar datos del usuario desde localStorage
   */
  const loadUser = useCallback(async () => {
    // Evitar cargas múltiples simultáneas
    if (loadingRef.current) return;
    
    const token = getAuthToken();
    
    if (!token) {
      if (mountedRef.current) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
      return;
    }

    loadingRef.current = true;
    
    try {
      // Intentar obtener datos del usuario desde localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (mountedRef.current) {
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar || null,
            isAuthenticated: true,
          });
          setIsAuthenticated(true);
        }
      } else {
        // Si hay token pero no hay datos de usuario, crear objeto básico
        if (mountedRef.current) {
          setUser({
            id: null,
            username: 'Usuario',
            isAuthenticated: true,
          });
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      if (mountedRef.current) {
        setUser({
          id: null,
          username: 'Usuario',
          isAuthenticated: true,
        });
        setIsAuthenticated(true);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  }, []);

  /**
   * Iniciar sesión (guardar token y datos)
   */
  const login = useCallback((token, userData) => {
    localStorage.setItem('accessToken', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    loadUser();
  }, [loadUser]);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (mountedRef.current) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Actualizar datos del usuario
   */
  const updateUser = useCallback((userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      loadUser();
    }
  }, [loadUser]);

  // Cargar usuario al montar
  useEffect(() => {
    mountedRef.current = true;
    loadUser();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    refresh: loadUser,
  };
};

export default useAuth;