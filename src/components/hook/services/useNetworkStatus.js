// src/hooks/useNetworkStatus.js
import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = () => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    type: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    listeners: []
  });

  // Detectar cambios de conexión
  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const newStatus = {
      isOnline,
      type: connection ? connection.type : 'unknown',
      effectiveType: connection ? connection.effectiveType : 'unknown',
      downlink: connection ? connection.downlink : 0,
      rtt: connection ? connection.rtt : 0
    };
    
    setStatus(prev => ({ ...prev, ...newStatus }));
    
    // Notificar listeners
    status.listeners.forEach(listener => listener(newStatus));
  }, [status.listeners]);

  // Calcular calidad de red
  const getNetworkQuality = useCallback(() => {
    if (!status.isOnline) return 'offline';
    
    if (status.effectiveType === 'slow-2g' || status.effectiveType === '2g') {
      return 'slow';
    } else if (status.effectiveType === '3g' || status.downlink < 1) {
      return 'moderate';
    } else {
      return 'good';
    }
  }, [status.isOnline, status.effectiveType, status.downlink]);

  // Efectos
  useEffect(() => {
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    }
    
    updateNetworkStatus();
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  return {
    status: getNetworkQuality(),
    isOnline: status.isOnline,
    details: status,
    
    // Métodos para listeners
    onStatusChange: (callback) => {
      setStatus(prev => ({
        ...prev,
        listeners: [...prev.listeners, callback]
      }));
      
      // Retornar función para remover listener
      return () => {
        setStatus(prev => ({
          ...prev,
          listeners: prev.listeners.filter(listener => listener !== callback)
        }));
      };
    },
    
    offStatusChange: (callback) => {
      setStatus(prev => ({
        ...prev,
        listeners: prev.listeners.filter(listener => listener !== callback)
      }));
    },
    
    // Verificar latencia
    checkLatency: async () => {
      const start = Date.now();
      try {
        await fetch('https://api.djidjimusic.com/api2/health/', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        return Date.now() - start;
      } catch {
        return Infinity;
      }
    }
  };
};