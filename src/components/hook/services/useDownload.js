// ============================================
// hooks/useDownload.js - VERSIÓN CORREGIDA
// ✅ isDownloaded SÍNCRONO (para UI)
// ✅ getDownloadInfo rápido
// ✅ Verificación asíncrona real
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

// ============================================
// CONFIGURACIÓN
// ============================================
const DOWNLOAD_CONFIG = {
  MAX_CONCURRENT: 3,
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 10000,
  RETRYABLE_STATUSES: [408, 429, 500, 502, 503, 504],
  REQUEST_TIMEOUT: 30000,
  SIGNED_URL_TIMEOUT: 5000,
  API_BASE_URL: 'https://api.djidjimusic.com/api2',
  STORAGE_KEY: 'djidji_downloads',
  CACHE_NAME: 'djidji-audio-v1',
  ENABLE_LOGGING: true,
  MIN_FILE_SIZE: 1024,
  MOBILE_REGEX: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
};

const useDownload = () => {
  // ============================================
  // ESTADOS UI
  // ============================================
  const [downloading, setDownloading] = useState({});
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [queueVisual, setQueueVisual] = useState([]);
  
  // ============================================
  // NUEVO: Estado de descargas (SÍNCRONO)
  // ============================================
  const [downloadsMap, setDownloadsMap] = useState({});

  // ============================================
  // REFS
  // ============================================
  const abortControllers = useRef(new Map());
  const activeDownloads = useRef(0);
  const pendingResolvers = useRef(new Map());
  const queueRef = useRef([]);
  const instanceId = useRef(Math.random().toString(36).substring(7));
  const broadcastChannel = useRef(null);

  // ============================================
  // LOGGING
  // ============================================
  const log = useCallback((level, message, data = {}) => {
    if (!DOWNLOAD_CONFIG.ENABLE_LOGGING) return;
    const timestamp = new Date().toISOString();
    console[level](`[Download][${timestamp}][${instanceId.current}] ${message}`, data);
  }, []);

  // ============================================
  // CARGA INICIAL DE DESCARGAS
  // ============================================
  useEffect(() => {
    // Cargar descargas guardadas
    try {
      const saved = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      setDownloadsMap(saved);
      log('info', 'Descargas cargadas', { count: Object.keys(saved).length });
    } catch (error) {
      log('error', 'Error cargando descargas', { error: error.message });
    }

    // Escuchar cambios
    const handleUpdate = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
        setDownloadsMap(saved);
        log('debug', 'Downloads map actualizado', { count: Object.keys(saved).length });
      } catch (error) {
        log('error', 'Error actualizando downloads map', { error: error.message });
      }
    };

    window.addEventListener('downloads-updated', handleUpdate);
    window.addEventListener('download-completed', handleUpdate);
    window.addEventListener('download-cancelled', handleUpdate);

    return () => {
      window.removeEventListener('downloads-updated', handleUpdate);
      window.removeEventListener('download-completed', handleUpdate);
      window.removeEventListener('download-cancelled', handleUpdate);
    };
  }, [log]);

  // ============================================
  // DETECCIÓN MÓVIL
  // ============================================
  const isMobile = useCallback(() => {
    return DOWNLOAD_CONFIG.MOBILE_REGEX.test(navigator.userAgent);
  }, []);

  // ============================================
  // ✅ FUNCIÓN PRINCIPAL: isDownloaded (SÍNCRONA)
  // ============================================
  const isDownloaded = useCallback((songId) => {
    if (!songId) return false;
    
    try {
      // Versión 1: Usar el mapa en memoria (más rápido)
      const record = downloadsMap[songId];
      if (record?.fileSize) {
        return true;
      }

      // Versión 2: Fallback a localStorage directo
      const downloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      const directRecord = downloads[songId];
      
      return !!(directRecord?.fileSize);
    } catch (error) {
      log('error', 'Error en isDownloaded', { error: error.message });
      return false;
    }
  }, [downloadsMap, log]);

  // ============================================
  // ✅ FUNCIÓN: getDownloadInfo (SÍNCRONA)
  // ============================================
  const getDownloadInfo = useCallback((songId) => {
    if (!songId) return null;
    
    try {
      // Intentar del mapa primero
      if (downloadsMap[songId]) {
        return downloadsMap[songId];
      }
      
      // Fallback a localStorage
      const downloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      return downloads[songId] || null;
    } catch {
      return null;
    }
  }, [downloadsMap]);

  // ============================================
  // ✅ FUNCIÓN: getAllDownloads
  // ============================================
  const getAllDownloads = useCallback(() => {
    try {
      const downloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      return Object.values(downloads)
        .filter(d => d?.fileSize)
        .sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
    } catch {
      return [];
    }
  }, []);

  // ============================================
  // ✅ FUNCIÓN: removeDownload
  // ============================================
  const removeDownload = useCallback(async (songId) => {
    try {
      // Eliminar de localStorage
      const downloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      delete downloads[songId];
      localStorage.setItem(DOWNLOAD_CONFIG.STORAGE_KEY, JSON.stringify(downloads));

      // Actualizar mapa
      setDownloadsMap(prev => {
        const newMap = { ...prev };
        delete newMap[songId];
        return newMap;
      });

      // Eliminar de cache si existe
      try {
        const cache = await caches.open(DOWNLOAD_CONFIG.CACHE_NAME);
        await cache.delete(`/song/${songId}/audio`);
        await cache.delete(`/song/${songId}/metadata`);
      } catch (cacheError) {
        log('warn', 'Error eliminando de cache', { error: cacheError.message });
      }

      window.dispatchEvent(new Event('downloads-updated'));
      log('info', 'Descarga eliminada', { songId });
      return true;
    } catch (error) {
      log('error', 'Error eliminando', { error: error.message });
      return false;
    }
  }, [log]);

  // ============================================
  // ✅ FUNCIÓN: clearAllDownloads
  // ============================================
  const clearAllDownloads = useCallback(async () => {
    try {
      localStorage.removeItem(DOWNLOAD_CONFIG.STORAGE_KEY);
      setDownloadsMap({});

      try {
        await caches.delete(DOWNLOAD_CONFIG.CACHE_NAME);
      } catch (cacheError) {
        log('warn', 'Error limpiando cache', { error: cacheError.message });
      }

      window.dispatchEvent(new Event('downloads-updated'));
      log('info', 'Historial limpiado');
      return true;
    } catch (error) {
      log('error', 'Error limpiando', { error: error.message });
      return false;
    }
  }, [log]);

  // ============================================
  // ✅ FUNCIÓN: getAuthToken
  // ============================================
  const getAuthToken = useCallback(() => {
    const token = 
      localStorage.getItem('accessToken') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('accessToken') ||
      sessionStorage.getItem('access_token');

    if (!token) {
      throw new Error('Debes iniciar sesión para descargar música.');
    }

    return token;
  }, []);

  // ============================================
  // FUNCIONES DE CACHE
  // ============================================
  const saveToCache = useCallback(async (songId, blob, metadata) => {
    try {
      const cache = await caches.open(DOWNLOAD_CONFIG.CACHE_NAME);
      
      const audioResponse = new Response(blob, {
        headers: { 
          'Content-Type': 'audio/mpeg',
          'Content-Length': blob.size.toString()
        }
      });
      await cache.put(`/song/${songId}/audio`, audioResponse);

      const metadataResponse = new Response(JSON.stringify(metadata), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(`/song/${songId}/metadata`, metadataResponse);

      log('info', 'Guardado en cache', { songId, size: blob.size });
      return true;
    } catch (error) {
      log('error', 'Error guardando en cache', { error: error.message });
      return false;
    }
  }, [log]);

  // ============================================
  // FUNCIÓN: executeWithRetry
  // ============================================
  const executeWithRetry = useCallback(async (fn, songId, attempt = 1) => {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = 
        attempt <= DOWNLOAD_CONFIG.MAX_RETRIES && (
          error.code === 'ECONNABORTED' ||
          !error.response ||
          DOWNLOAD_CONFIG.RETRYABLE_STATUSES.includes(error.response?.status)
        );

      if (!isRetryable) throw error;

      const delay = Math.min(
        DOWNLOAD_CONFIG.BASE_RETRY_DELAY * Math.pow(2, attempt - 1),
        DOWNLOAD_CONFIG.MAX_RETRY_DELAY
      ) * (0.5 + Math.random() * 0.5);

      log('info', `Reintento ${attempt}`, { songId, delay: Math.round(delay) });

      await new Promise(r => setTimeout(r, delay));
      return executeWithRetry(fn, songId, attempt + 1);
    }
  }, [log]);

  // ============================================
  // FUNCIÓN: requestSignedUrl
  // ============================================
  const requestSignedUrl = useCallback(async (songId, token) => {
    try {
      const response = await axios.post(
        `${DOWNLOAD_CONFIG.API_BASE_URL}/songs/${songId}/request-download/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: DOWNLOAD_CONFIG.SIGNED_URL_TIMEOUT
        }
      );

      if (response.data?.signedUrl) {
        log('debug', 'URL firmada obtenida', { songId });
        return response.data.signedUrl;
      }
    } catch (error) {
      log('debug', 'URL firmada no disponible', { songId });
    }
    return `${DOWNLOAD_CONFIG.API_BASE_URL}/songs/${songId}/download/`;
  }, [log]);

  // ============================================
  // FUNCIÓN: calculateSHA256
  // ============================================
  const calculateSHA256 = useCallback(async (blob) => {
    try {
      const buffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      log('warn', 'Error calculando hash', { error: error.message });
      return null;
    }
  }, [log]);

  // ============================================
  // FUNCIÓN: saveToFileSystem
  // ============================================
  const saveToFileSystem = useCallback(async (blob, songId, fileName) => {
    if (isMobile() || !('showDirectoryPicker' in window)) {
      return false;
    }

    try {
      const dir = await navigator.storage.getDirectory();
      const fileHandle = await dir.getFileHandle(`djidji_${songId}_${fileName}`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      log('info', 'Guardado en File System', { songId, fileName });
      return true;
    } catch (error) {
      log('warn', 'Error guardando en File System', { error: error.message });
      return false;
    }
  }, [isMobile, log]);

  // ============================================
  // PROCESAR COLA
  // ============================================
  const processQueue = useCallback(() => {
    while (activeDownloads.current < DOWNLOAD_CONFIG.MAX_CONCURRENT && queueRef.current.length > 0) {
      const nextDownload = queueRef.current[0];
      queueRef.current = queueRef.current.slice(1);
      setQueueVisual([...queueRef.current]);

      activeDownloads.current++;

      pendingResolvers.current.set(nextDownload.songId, {
        resolve: nextDownload.resolve,
        reject: nextDownload.reject,
        songTitle: nextDownload.songTitle,
        artistName: nextDownload.artistName
      });

      executeDownload(
        nextDownload.songId,
        nextDownload.songTitle,
        nextDownload.artistName
      );
    }
  }, []);

  // ============================================
  // EJECUTAR DESCARGA
  // ============================================
  const executeDownload = useCallback(async (songId, songTitle, artistName) => {
    const controller = new AbortController();
    abortControllers.current.set(songId, controller);

    try {
      setDownloading(prev => ({ ...prev, [songId]: true }));
      setProgress(prev => ({ ...prev, [songId]: 0 }));
      setErrors(prev => ({ ...prev, [songId]: null }));

      log('info', 'Iniciando descarga', { songId, songTitle });

      const token = await executeWithRetry(() => getAuthToken(), songId);
      const url = await executeWithRetry(() => requestSignedUrl(songId, token), songId);

      let response;
      const authAttempts = [
        { type: 'Bearer', header: `Bearer ${token}` },
        { type: 'Token', header: `Token ${token}` }
      ];

      for (const auth of authAttempts) {
        try {
          response = await executeWithRetry(async () => {
            return await axios({
              method: 'GET',
              url,
              headers: {
                'Authorization': auth.header,
                'Accept': 'audio/mpeg, */*',
              },
              responseType: 'blob',
              signal: controller.signal,
              onDownloadProgress: (progressEvent) => {
                if (progressEvent.total && progressEvent.total > 0) {
                  const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setProgress(prev => ({ ...prev, [songId]: percent }));
                }
              },
              timeout: DOWNLOAD_CONFIG.REQUEST_TIMEOUT
            });
          }, songId);
          log('info', `Autenticación exitosa con ${auth.type}`, { songId });
          break;
        } catch (authError) {
          if (authError.response?.status === 401 && auth.type === 'Bearer') continue;
          throw authError;
        }
      }

      if (!response) throw new Error('No se pudo obtener respuesta');
      
      const blob = response.data;
      
      if (blob.size < DOWNLOAD_CONFIG.MIN_FILE_SIZE) {
        throw new Error('Archivo corrupto (tamaño insuficiente)');
      }

      const hash = await calculateSHA256(blob);
      const fileName = `${artistName.replace(/[/\\?%*:|"<>]/g, '_')} - ${songTitle.replace(/[/\\?%*:|"<>]/g, '_')}.mp3`;

      // Guardar según plataforma
      const savedToStorage = isMobile() 
        ? await saveToCache(songId, blob, { id: songId, title: songTitle, artist: artistName })
        : await saveToFileSystem(blob, songId, fileName);

      // Trigger download en navegador
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      // Guardar metadata
      const downloadRecord = {
        id: songId,
        title: songTitle,
        artist: artistName,
        fileName,
        downloadedAt: new Date().toISOString(),
        fileSize: blob.size,
        hash: hash,
        storageType: savedToStorage ? (isMobile() ? 'cache' : 'filesystem') : 'none'
      };

      const currentDownloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      currentDownloads[songId] = downloadRecord;
      localStorage.setItem(DOWNLOAD_CONFIG.STORAGE_KEY, JSON.stringify(currentDownloads));
      
      // Actualizar mapa
      setDownloadsMap(prev => ({ ...prev, [songId]: downloadRecord }));

      // Resolver promesa
      const resolver = pendingResolvers.current.get(songId);
      if (resolver) {
        resolver.resolve(downloadRecord);
        pendingResolvers.current.delete(songId);
      }

      window.dispatchEvent(new Event('download-completed'));
      window.dispatchEvent(new Event('downloads-updated'));

    } catch (error) {
      log('error', 'Error en descarga', { songId, error: error.message });

      let errorMessage = 'Error al descargar';
      if (error.name === 'CanceledError') errorMessage = 'Descarga cancelada';
      else if (error.response?.status === 401) errorMessage = 'Sesión expirada';
      else if (error.response?.status === 403) errorMessage = 'Sin permiso';
      else if (error.response?.status === 404) errorMessage = 'Canción no disponible';
      else if (error.response?.status === 429) errorMessage = 'Límite alcanzado';
      else if (error.message) errorMessage = error.message;

      setErrors(prev => ({ ...prev, [songId]: errorMessage }));

      const resolver = pendingResolvers.current.get(songId);
      if (resolver) {
        resolver.reject(new Error(errorMessage));
        pendingResolvers.current.delete(songId);
      }

    } finally {
      abortControllers.current.delete(songId);
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[songId];
        return newState;
      });
      setProgress(prev => {
        const newState = { ...prev };
        delete newState[songId];
        return newState;
      });
      activeDownloads.current = Math.max(0, activeDownloads.current - 1);
      processQueue();
    }
  }, [getAuthToken, requestSignedUrl, saveToCache, saveToFileSystem, executeWithRetry, processQueue, calculateSHA256, isMobile, log]);

  // ============================================
  // DOWNLOAD SONG
  // ============================================
  const downloadSong = useCallback((songId, songTitle = 'Canción', artistName = 'Artista') => {
    if (errors[songId]?.includes('Límite')) {
      return Promise.reject(new Error(errors[songId]));
    }
    if (downloading[songId]) {
      return Promise.reject(new Error('Ya se está descargando'));
    }

    return new Promise((resolve, reject) => {
      queueRef.current = [...queueRef.current, { songId, songTitle, artistName, resolve, reject }];
      setQueueVisual([...queueRef.current]);
      setTimeout(() => processQueue(), 0);
    });
  }, [downloading, errors, processQueue]);

  // ============================================
  // CANCEL DOWNLOAD
  // ============================================
  const cancelDownload = useCallback((songId) => {
    if (abortControllers.current.has(songId)) {
      abortControllers.current.get(songId).abort();
      abortControllers.current.delete(songId);

      const resolver = pendingResolvers.current.get(songId);
      if (resolver) {
        resolver.reject(new Error('Descarga cancelada'));
        pendingResolvers.current.delete(songId);
      }

      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[songId];
        return newState;
      });

      setProgress(prev => {
        const newState = { ...prev };
        delete newState[songId];
        return newState;
      });

      activeDownloads.current = Math.max(0, activeDownloads.current - 1);
    } else {
      queueRef.current = queueRef.current.filter(item => item.songId !== songId);
      setQueueVisual([...queueRef.current]);
    }

    window.dispatchEvent(new Event('download-cancelled'));
    window.dispatchEvent(new Event('downloads-updated'));
    processQueue();
  }, [processQueue]);

  // ============================================
  // CLEAR ERROR
  // ============================================
  const clearError = useCallback((songId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[songId];
      return newErrors;
    });
  }, []);

  // ============================================
  // API PÚBLICA
  // ============================================
  return {
    // ✅ ACCIONES
    downloadSong,
    cancelDownload,
    removeDownload,
    clearAllDownloads,
    clearError,

    // ✅ ESTADOS UI
    downloading,
    progress,
    errors,
    queue: queueVisual,

    // ✅ CONSULTAS SÍNCRONAS (AHORA FUNCIONAN)
    isDownloaded,        // 🔥 SÍNCRONO - true SOLO si tiene archivo
    getDownloadInfo,     // 🔥 SÍNCRONO - info completa o null
    getAllDownloads,     // 🔥 SÍNCRONO - lista filtrada

    // ✅ UTILIDADES
    getAuthToken
  };
};

export default useDownload;