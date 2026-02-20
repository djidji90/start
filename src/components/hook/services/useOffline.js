// ============================================
// hooks/useOffline.js
// Detecta y gestiona el estado offline/online
// ============================================

import { useState, useEffect, useCallback } from 'react';

const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [offlineAt, setOfflineAt] = useState(null);
  const [onlineAt, setOnlineAt] = useState(null);
  const [networkType, setNetworkType] = useState('unknown');

  // Detectar tipo de conexión (solo Chrome/Edge)
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection || 
                        navigator.mozConnection || 
                        navigator.webkitConnection;
      
      if (connection) {
        setNetworkType(connection.effectiveType || 'unknown');
        
        const updateNetworkType = () => {
          setNetworkType(connection.effectiveType);
        };
        
        connection.addEventListener('change', updateNetworkType);
        return () => connection.removeEventListener('change', updateNetworkType);
      }
    }
  }, []);

  // Manejar eventos de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOnlineAt(new Date().toISOString());
      setWasOffline(true);
      
      // Mostrar notificación de reconexión
      setTimeout(() => setWasOffline(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineAt(new Date().toISOString());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para ejecutar solo si hay conexión
  const withConnection = useCallback(async (callback, fallback = null) => {
    if (isOnline) {
      try {
        return await callback();
      } catch (error) {
        console.error('Error en operación online:', error);
        return fallback;
      }
    } else {
      console.warn('Operación cancelada: sin conexión');
      return fallback;
    }
  }, [isOnline]);

  // Verificar si es red móvil (para datos limitados)
  const isMobileData = useCallback(() => {
    return networkType === '4g' || networkType === '3g' || networkType === '2g';
  }, [networkType]);

  // Verificar si es WiFi (ideal para descargas grandes)
  const isWifi = useCallback(() => {
    return networkType === 'wifi' || networkType === 'ethernet';
  }, [networkType]);

  return {
    // Estados
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    networkType,
    
    // Timestamps
    offlineAt,
    onlineAt,
    
    // Utilidades
    withConnection,
    isMobileData,
    isWifi,
    
    // Helper para descargas condicionales
    canDownload: isOnline && !isMobileData(), // Solo en WiFi por defecto
    canStream: isOnline, // Streaming requiere conexión
    canPlayOffline: true, // Siempre se puede si está descargada
  };
};

export default useOffline;