// src/hooks/useAudioCache.js
import { useState, useEffect, useCallback } from 'react';

const CACHE_VERSION = '1.0.0';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const CACHE_PREFIX = 'audio_cache_';

export const useAudioCache = () => {
  const [cacheInfo, setCacheInfo] = useState({
    totalSize: 0,
    itemCount: 0,
    isSupported: false
  });

  // Verificar soporte de Cache API
  useEffect(() => {
    const isSupported = 'caches' in window;
    setCacheInfo(prev => ({ ...prev, isSupported }));
    
    if (isSupported) {
      updateCacheInfo();
    }
  }, []);

  // Obtener información del cache
  const updateCacheInfo = useCallback(async () => {
    if (!cacheInfo.isSupported) return;
    
    try {
      const cache = await caches.open(`${CACHE_PREFIX}${CACHE_VERSION}`);
      const keys = await cache.keys();
      
      let totalSize = 0;
      
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
      
      setCacheInfo({
        totalSize,
        itemCount: keys.length,
        isSupported: true
      });
    } catch (error) {
      console.error('Error updating cache info:', error);
    }
  }, [cacheInfo.isSupported]);

  // Guardar audio en cache
  const setAudio = useCallback(async (key, audioBlob, metadata = {}) => {
    if (!cacheInfo.isSupported || audioBlob.size > MAX_CACHE_SIZE) {
      return false;
    }
    
    try {
      const cache = await caches.open(`${CACHE_PREFIX}${CACHE_VERSION}`);
      
      // Crear respuesta con metadata
      const response = new Response(audioBlob, {
        headers: {
          'Content-Type': audioBlob.type || 'audio/mpeg',
          'Content-Length': audioBlob.size,
          'X-Cache-Metadata': JSON.stringify({
            ...metadata,
            cachedAt: Date.now(),
            size: audioBlob.size
          })
        }
      });
      
      await cache.put(`audio:${key}`, response);
      
      // Actualizar info del cache
      await updateCacheInfo();
      
      // Notificar al Service Worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'AUDIO_CACHED',
          key: `audio:${key}`,
          metadata
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error caching audio:', error);
      return false;
    }
  }, [cacheInfo.isSupported, updateCacheInfo]);

  // Obtener audio del cache
  const getAudio = useCallback(async (key) => {
    if (!cacheInfo.isSupported) return null;
    
    try {
      const cache = await caches.open(`${CACHE_PREFIX}${CACHE_VERSION}`);
      const response = await cache.match(`audio:${key}`);
      
      if (!response) return null;
      
      // Verificar si está expirado (7 días)
      const metadata = JSON.parse(response.headers.get('X-Cache-Metadata') || '{}');
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      
      if (Date.now() - metadata.cachedAt > sevenDays) {
        await cache.delete(`audio:${key}`);
        await updateCacheInfo();
        return null;
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error getting cached audio:', error);
      return null;
    }
  }, [cacheInfo.isSupported, updateCacheInfo]);

  // Limpiar cache
  const clear = useCallback(async () => {
    if (!cacheInfo.isSupported) return;
    
    try {
      const cacheNames = await caches.keys();
      const audioCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));
      
      await Promise.all(audioCaches.map(name => caches.delete(name)));
      
      setCacheInfo({
        totalSize: 0,
        itemCount: 0,
        isSupported: true
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }, [cacheInfo.isSupported]);

  return {
    isSupported: cacheInfo.isSupported,
    getAudio,
    setAudio,
    clear,
    getInfo: () => cacheInfo,
    getSize: () => cacheInfo.totalSize,
    
    // Métodos adicionales
    hasAudio: async (key) => {
      if (!cacheInfo.isSupported) return false;
      const cache = await caches.open(`${CACHE_PREFIX}${CACHE_VERSION}`);
      const response = await cache.match(`audio:${key}`);
      return !!response;
    },
    
    // Limpiar cache viejo
    cleanupOldCache: async () => {
      if (!cacheInfo.isSupported) return;
      
      const cache = await caches.open(`${CACHE_PREFIX}${CACHE_VERSION}`);
      const keys = await cache.keys();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const metadata = JSON.parse(response.headers.get('X-Cache-Metadata') || '{}');
          
          if (Date.now() - metadata.cachedAt > thirtyDays) {
            await cache.delete(key);
          }
        }
      }
      
      await updateCacheInfo();
    }
  };
};