// ============================================
// hooks/useDownload.js - VERSIÓN CORREGIDA
// ✅ Soporte para endpoint JSON (/download-url/)
// ✅ Fetch en lugar de axios para evitar CORS
// ✅ Sintaxis corregida de axios
// ✅ Eliminado link.click() (no guarda en filesystem)
// ✅ isDownloaded SÍNCRONO (para UI)
// ✅ getOfflineAudioUrl - Para reproducir desde cache
// ✅ getDownloadStatus - Estado completo con verificación
// ✅ verifyDownload - Verifica integridad del archivo
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
  ENABLE_LOGGING: true, // Cambiar a false en producción
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
  const [downloadsMap, setDownloadsMap] = useState({});

  // ============================================
  // REFS
  // ============================================
  const abortControllers = useRef(new Map());
  const activeDownloads = useRef(0);
  const pendingResolvers = useRef(new Map());
  const queueRef = useRef([]);
  const instanceId = useRef(Math.random().toString(36).substring(7));

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
    try {
      const saved = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      setDownloadsMap(saved);
      log('info', 'Descargas cargadas', { count: Object.keys(saved).length });
    } catch (error) {
      log('error', 'Error cargando descargas', { error: error.message });
    }

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
  // ✅ FUNCIÓN: isDownloaded (SÍNCRONA)
  // ============================================
  const isDownloaded = useCallback((songId) => {
    if (!songId) return false;
    try {  
      const record = downloadsMap[songId];  
      if (record?.fileSize) return true;  
      const downloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');  
      return !!(downloads[songId]?.fileSize);  
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
      if (downloadsMap[songId]) return downloadsMap[songId];  
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
  // ✅ FUNCIÓN: verifyDownload (ASÍNCRONA)
  // ============================================
  const verifyDownload = useCallback(async (songId) => {
    try {
      const cache = await caches.open(DOWNLOAD_CONFIG.CACHE_NAME);
      const response = await cache.match(`/song/${songId}/audio`);
      if (!response) return false;
      const blob = await response.blob();
      return blob.size > DOWNLOAD_CONFIG.MIN_FILE_SIZE;
    } catch (error) {
      log('error', 'Error verificando descarga', { error: error.message });
      return false;
    }
  }, [log]);

  // ============================================
  // ✅ FUNCIÓN: getOfflineAudioUrl (ASÍNCRONA)
  // ============================================
  const getOfflineAudioUrl = useCallback(async (songId) => {
    try {
      log('debug', 'Obteniendo URL offline', { songId });
      
      const cache = await caches.open(DOWNLOAD_CONFIG.CACHE_NAME);
      const response = await cache.match(`/song/${songId}/audio`);
      
      if (!response) {
        log('warn', 'No encontrado en cache', { songId });
        return null;
      }
      
      const blob = await response.blob();
      
      if (blob.size < DOWNLOAD_CONFIG.MIN_FILE_SIZE) {
        log('warn', 'Archivo corrupto', { songId, size: blob.size });
        return null;
      }
      
      const url = URL.createObjectURL(blob);
      
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      }, 60000);
      
      log('info', 'URL offline generada', { songId });
      return url;
      
    } catch (error) {
      log('error', 'Error obteniendo URL offline', { error: error.message, songId });
      return null;
    }
  }, [log]);

  // ============================================
  // ✅ FUNCIÓN: getDownloadStatus (ASÍNCRONA)
  // ============================================
  const getDownloadStatus = useCallback(async (songId) => {
    if (!songId) return { 
      isDownloaded: false, 
      isDownloading: false, 
      url: null, 
      info: null,
      error: null,
      progress: 0
    };

    try {
      const isDownloading = downloading[songId] || false;
      const downloadProgress = progress[songId] || 0;
      const error = errors[songId] || null;
      
      if (isDownloading) {
        return {
          isDownloaded: false,
          isDownloading: true,
          progress: downloadProgress,
          error: null,
          url: null,
          info: null
        };
      }

      const info = getDownloadInfo(songId);
      if (!info) {
        return { 
          isDownloaded: false, 
          isDownloading: false, 
          progress: 0,
          error: null, 
          url: null, 
          info: null 
        };
      }

      const isValid = await verifyDownload(songId);
      if (!isValid) {
        return {
          isDownloaded: false,
          isDownloading: false,
          progress: 0,
          error: 'Archivo corrupto',
          url: null,
          info: info
        };
      }

      const url = await getOfflineAudioUrl(songId);

      return {
        isDownloaded: true,
        isDownloading: false,
        progress: 100,
        error: null,
        url: url,
        info: info
      };
    } catch (error) {
      log('error', 'Error en getDownloadStatus', { error: error.message });
      return { 
        isDownloaded: false, 
        isDownloading: false, 
        progress: 0,
        error: error.message, 
        url: null, 
        info: null 
      };
    }
  }, [downloading, progress, errors, getDownloadInfo, verifyDownload, getOfflineAudioUrl, log]);

  // ============================================
  // ✅ FUNCIÓN: removeDownload (MEJORADA)
  // ============================================
  const removeDownload = useCallback(async (songId) => {
    try {
      const downloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      delete downloads[songId];
      localStorage.setItem(DOWNLOAD_CONFIG.STORAGE_KEY, JSON.stringify(downloads));

      setDownloadsMap(prev => {  
        const newMap = { ...prev };  
        delete newMap[songId];  
        return newMap;  
      });  

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
  // ✅ FUNCIÓN: clearAllDownloads (MEJORADA)
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
  // ✅ FUNCIÓN: saveToCache
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
  // ✅ FUNCIÓN: executeWithRetry
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
  // ✅ FUNCIÓN: getDownloadUrl (CORREGIDA - USA JSON ENDPOINT)
  // ============================================
  const getDownloadUrl = useCallback(async (songId, token) => {
    try {
      // ✅ PRIMERO: Intentar con el endpoint JSON (nuevo, sin CORS)
      try {
        const response = await axios.get(
          `${DOWNLOAD_CONFIG.API_BASE_URL}/songs/${songId}/download-url/`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            timeout: DOWNLOAD_CONFIG.SIGNED_URL_TIMEOUT
          }
        );

        if (response.data?.download_url) {
          log('info', 'URL de descarga obtenida vía JSON', { songId });
          return response.data.download_url;
        }
      } catch (jsonError) {
        log('debug', 'Endpoint JSON no disponible, usando stream', { songId });
      }
      
      // ✅ SEGUNDO: Intentar con stream (para obtener URL firmada)
      try {
        const response = await axios.get(
          `${DOWNLOAD_CONFIG.API_BASE_URL}/songs/${songId}/stream/`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            timeout: DOWNLOAD_CONFIG.SIGNED_URL_TIMEOUT
          }
        );

        if (response.data?.data?.stream_url) {  
          log('debug', 'URL de streaming obtenida', { songId });  
          return response.data.data.stream_url;  
        }
      } catch (streamError) {
        log('debug', 'Stream endpoint falló', { songId });
      }
      
      // ❌ FALLBACK: Endpoint de descarga directa (último recurso)
      log('warn', 'Usando endpoint de descarga directa', { songId });
      return `${DOWNLOAD_CONFIG.API_BASE_URL}/songs/${songId}/download/`;
      
    } catch (error) {
      log('error', 'Error obteniendo URL', { 
        songId, 
        error: error.message,
        status: error.response?.status 
      });
      throw error;
    }
  }, [log]);

  // ============================================
  // ✅ FUNCIÓN: calculateSHA256
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
  // ✅ FUNCIÓN: processQueue
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
  // ✅ EJECUTAR DESCARGA (CORREGIDA - USA FETCH)
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
      const url = await executeWithRetry(() => getDownloadUrl(songId, token), songId);  

      log('info', 'URL obtenida, iniciando descarga', { songId, url: url.substring(0, 50) + '...' });

      // ✅ USAR FETCH EN LUGAR DE AXIOS PARA EVITAR CORS
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Obtener el tamaño total si está disponible
      const contentLength = response.headers.get('content-length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      // Leer el stream para obtener progreso
      const reader = response.body.getReader();
      const chunks = [];
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedSize += value.length;
        
        if (totalSize > 0) {
          const percent = Math.round((receivedSize * 100) / totalSize);
          setProgress(prev => ({ ...prev, [songId]: percent }));
        }
      }

      // Combinar chunks en un solo blob
      const blob = new Blob(chunks, { type: 'audio/mpeg' });

      if (blob.size < DOWNLOAD_CONFIG.MIN_FILE_SIZE) {  
        throw new Error('Archivo corrupto (tamaño insuficiente)');  
      }  

      const hash = await calculateSHA256(blob);  

      // Guardar en cache (para móvil) o no hacer nada extra
      const savedToStorage = await saveToCache(songId, blob, { 
        id: songId, 
        title: songTitle, 
        artist: artistName 
      });  

      // ✅ ELIMINADO: Trigger download en navegador (no queremos guardar en filesystem)
      // const blobUrl = URL.createObjectURL(blob);  
      // const link = document.createElement('a');  
      // link.href = blobUrl;  
      // link.download = fileName;  
      // link.click();  
      // setTimeout(() => URL.revokeObjectURL(blobUrl), 100);  

      // Guardar metadata  
      const downloadRecord = {  
        id: songId,  
        title: songTitle,  
        artist: artistName,  
        downloadedAt: new Date().toISOString(),  
        fileSize: blob.size,  
        hash: hash,  
        storageType: savedToStorage ? 'cache' : 'none'  
      };  

      const currentDownloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');  
      currentDownloads[songId] = downloadRecord;  
      localStorage.setItem(DOWNLOAD_CONFIG.STORAGE_KEY, JSON.stringify(currentDownloads));  

      setDownloadsMap(prev => ({ ...prev, [songId]: downloadRecord }));  

      const resolver = pendingResolvers.current.get(songId);  
      if (resolver) {  
        resolver.resolve(downloadRecord);  
        pendingResolvers.current.delete(songId);  
      }  

      window.dispatchEvent(new Event('download-completed'));  
      window.dispatchEvent(new Event('downloads-updated'));  

      log('info', '✅ Descarga completada', { 
        songId, 
        size: (blob.size / 1024 / 1024).toFixed(2) + 'MB' 
      });

    } catch (error) {  
      log('error', 'Error en descarga', { songId, error: error.message });  

      let errorMessage = 'Error al descargar';  
      if (error.name === 'AbortError') errorMessage = 'Descarga cancelada';  
      else if (error.message.includes('401')) errorMessage = 'Sesión expirada';  
      else if (error.message.includes('403')) errorMessage = 'Sin permiso';  
      else if (error.message.includes('404')) errorMessage = 'Canción no disponible';  
      else if (error.message.includes('429')) errorMessage = 'Límite alcanzado';  
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
  }, [getAuthToken, getDownloadUrl, saveToCache, executeWithRetry, processQueue, calculateSHA256, log]);

  // ============================================
  // ✅ DOWNLOAD SONG
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
  // ✅ CANCEL DOWNLOAD
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
  // ✅ CLEAR ERROR
  // ============================================
  const clearError = useCallback((songId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[songId];
      return newErrors;
    });
  }, []);

  // ============================================
  // ✅ API PÚBLICA
  // ============================================
  return {
    // ACCIONES
    downloadSong,
    cancelDownload,
    removeDownload,
    clearAllDownloads,
    clearError,

    // ESTADOS UI  
    downloading,  
    progress,  
    errors,  
    queue: queueVisual,  

    // CONSULTAS SÍNCRONAS  
    isDownloaded,        
    getDownloadInfo,     
    getAllDownloads,     

    // FUNCIONES PARA REPRODUCCIÓN OFFLINE
    getOfflineAudioUrl,  
    getDownloadStatus,   
    verifyDownload,      

    // UTILIDADES  
    getAuthToken
  };
};

export default useDownload;