// src/components/hook/services/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../../../components/hook/services/apia';

/**
 * Hook para manejar la autenticación del usuario
 * Proporciona el usuario actual y estado de autenticación
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Cargar datos del usuario desde localStorage
   */
  const loadUser = useCallback(() => {
    const token = getAuthToken();
    
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Intentar obtener datos del usuario desde localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar || null,
          isAuthenticated: true,
        });
        setIsAuthenticated(true);
      } else {
        // Si hay token pero no hay datos de usuario, creamos un objeto básico
        // Esto permite que el comentario funcione aunque no tengamos el perfil completo
        setUser({
          id: null,
          username: 'Usuario',
          isAuthenticated: true,
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setUser({
        id: null,
        username: 'Usuario',
        isAuthenticated: true,
      });
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
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
    window.dispatchEvent(new Event('auth:change'));
  }, [loadUser]);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('auth:change'));
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
    loadUser();
    
    // Escuchar cambios en localStorage (para múltiples pestañas)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        loadUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:change', loadUser);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:change', loadUser);
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