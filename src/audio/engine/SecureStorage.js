// ============================================
// hooks/useDownload.js - VERSIÓN COMPLETA CON DESCARGA DIRECTA
// ✅ Almacenamiento en IndexedDB encriptado (AES-256)
// ✅ No se pueden compartir archivos
// ✅ Expiracion a los 7 días
// ✅ Descarga DIRECTA desde R2 (sin pasar por servidor)
// ✅ isDownloaded SÍNCRONO (para UI)
// ✅ getDownloadInfo rápido
// ✅ getOfflineAudioUrl - Para reproducir desde secure storage
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { secureStorage } from '../audio/engine/SecureStorage';

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
  ENABLE_LOGGING: true, // Cambiar a false en producción
  MIN_FILE_SIZE: 1024,
  URL_CACHE_TTL: 300000, // 5 minutos en ms
  DOWNLOAD_EXPIRY_DAYS: 7 // Días que dura la canción offline
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
  const urlCache = useRef(new Map());
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
  // INICIALIZACIÓN DE SECURE STORAGE
  // ============================================
  useEffect(() => {
    const initSecureStorage = async () => {
      try {
        log('info', 'Iniciando SecureStorage...');
        
        // Inicializar SecureStorage
        await secureStorage.init();
        
        // Limpiar expiradas
        const deleted = await secureStorage.cleanup();
        if (deleted > 0) {
          log('info', `Limpiadas ${deleted} canciones expiradas`);
        }
        
        // Obtener todas las canciones
        const songs = await secureStorage.getAllSongs();
        
        // Construir mapa de descargas para UI rápida
        const downloads = {};
        songs.forEach(song => {
          downloads[song.songId] = {
            id: song.songId,
            title: song.metadata?.title || 'Canción',
            artist: song.metadata?.artist || 'Artista',
            downloadedAt: song.downloadedAt,
            fileSize: song.fileSize,
            encrypted: true,
            storageType: 'indexeddb',
            expiresAt: song.expiresAt
          };
        });
        
        // Guardar en localStorage para UI síncrona
        localStorage.setItem(DOWNLOAD_CONFIG.STORAGE_KEY, JSON.stringify(downloads));
        
        // Actualizar estado
        setDownloadsMap(downloads);
        
        log('info', 'SecureStorage listo', { count: Object.keys(downloads).length });
        
      } catch (error) {
        log('error', 'Error iniciando SecureStorage', { error: error.message });
      }
    };
    
    initSecureStorage();
    
    // Limpiar cada hora
    const interval = setInterval(async () => {
      try {
        const deleted = await secureStorage.cleanup();
        if (deleted > 0) {
          log('info', `Cleanup automático: ${deleted} canciones eliminadas`);
          
          // Actualizar UI
          const songs = await secureStorage.getAllSongs();
          const downloads = {};
          songs.forEach(song => {
            downloads[song.songId] = {
              id: song.songId,
              title: song.metadata?.title,
              artist: song.metadata?.artist,
              downloadedAt: song.downloadedAt,
              fileSize: song.fileSize,
              encrypted: true,
              storageType: 'indexeddb',
              expiresAt: song.expiresAt
            };
          });
          
          localStorage.setItem(DOWNLOAD_CONFIG.STORAGE_KEY, JSON.stringify(downloads));
          setDownloadsMap(downloads);
        }
      } catch (error) {
        log('error', 'Error en cleanup automático', { error: error.message });
      }
    }, 60 * 60 * 1000);
    
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
      clearInterval(interval);
      window.removeEventListener('downloads-updated', handleUpdate);
      window.removeEventListener('download-completed', handleUpdate);
      window.removeEventListener('download-cancelled', handleUpdate);
    };
  }, [log]);

  // ============================================
  // ✅ isDownloaded (SÍNCRONA)
  // ============================================
  const isDownloaded = useCallback((songId) => {
    if (!songId) return false;
    try {
      const record = downloadsMap[songId];
      return !!(record?.fileSize);
    } catch {
      return false;
    }
  }, [downloadsMap]);

  // ============================================
  // ✅ getDownloadInfo (SÍNCRONA)
  // ============================================
  const getDownloadInfo = useCallback((songId) => {
    if (!songId) return null;
    return downloadsMap[songId] || null;
  }, [downloadsMap]);

  // ============================================
  // ✅ getAllDownloads
  // ============================================
  const getAllDownloads = useCallback(() => {
    try {
      return Object.values(downloadsMap)
        .filter(d => d?.fileSize)
        .sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
    } catch {
      return [];
    }
  }, [downloadsMap]);

  // ============================================
  // ✅ getStreamUrl (para streaming, no para descarga)
  // ============================================
  const getStreamUrl = useCallback(async (songId, token) => {
    try {
      // Verificar cache
      if (urlCache.current.has(songId)) {
        const cached = urlCache.current.get(songId);
        if (cached.expiresAt > Date.now()) {
          log('debug', 'URL en cache', { songId });
          return cached.url;
        }
      }
      
      // Obtener nueva URL del endpoint de streaming
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

      const streamUrl = response.data?.data?.stream_url;
      if (streamUrl) {
        // Cachear por 5 minutos
        urlCache.current.set(songId, {
          url: streamUrl,
          expiresAt: Date.now() + DOWNLOAD_CONFIG.URL_CACHE_TTL
        });
        log('info', 'URL de streaming obtenida', { songId });
        return streamUrl;
      }
      
      throw new Error('No se recibió URL de streaming');
      
    } catch (error) {
      log('error', 'Error obteniendo URL de streaming', { 
        songId, 
        error: error.message,
        status: error.response?.status 
      });
      throw new Error(`No se pudo obtener URL: ${error.message}`);
    }
  }, [log]);

  // ============================================
  // ✅ getDownloadUrl (NUEVA: obtiene URL directa de R2 para descarga)
  // ============================================
  const getDownloadUrl = useCallback(async (songId, token) => {
    try {
      // Intentar primero el endpoint de download-url (JSON)
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
          log('info', 'URL de descarga obtenida', { songId });
          return {
            url: response.data.download_url,
            filename: response.data.filename || `song_${songId}.mp3`,
            fileSize: response.data.file_size,
            expiresIn: response.data.expires_in
          };
        }
      } catch (error) {
        log('debug', 'Endpoint download-url no disponible, usando redirect', { songId });
      }
      
      // Fallback: usar endpoint de download con redirect
      const response = await fetch(
        `${DOWNLOAD_CONFIG.API_BASE_URL}/songs/${songId}/download/`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'audio/mpeg'
          },
          redirect: 'manual' // No seguir redirect automáticamente
        }
      );
      
      // Si es redirect (302), obtener la URL de Location
      if (response.status === 302 || response.status === 301) {
        const redirectUrl = response.headers.get('Location');
        if (redirectUrl) {
          // Extraer filename del Content-Disposition si es posible
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = `song_${songId}.mp3`;
          
          if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
              filename = match[1].replace(/['"]/g, '');
            }
          }
          
          return {
            url: redirectUrl,
            filename,
            fileSize: null,
            expiresIn: 3600
          };
        }
      }
      
      throw new Error('No se pudo obtener URL de descarga');
      
    } catch (error) {
      log('error', 'Error obteniendo URL de descarga', { 
        songId, 
        error: error.message,
        status: error.response?.status 
      });
      throw new Error(`No se pudo obtener URL de descarga: ${error.message}`);
    }
  }, [log]);

  // ============================================
  // ✅ downloadSong (VERSIÓN OPTIMIZADA - DESCARGA DIRECTA)
  // ============================================
  const downloadSong = useCallback(async (songId, songTitle = 'Canción', artistName = 'Artista') => {
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
  }, [downloading, errors]);

  // ============================================
  // ✅ getOfflineAudioUrl (CON SECURE STORAGE)
  // ============================================
  const getOfflineAudioUrl = useCallback(async (songId) => {
    try {
      log('debug', 'Obteniendo URL offline', { songId });
      
      const available = await secureStorage.isAvailable(songId);
      if (!available) {
        log('warn', 'Canción no disponible offline', { songId });
        return null;
      }
      
      const songData = await secureStorage.getSong(songId);
      if (!songData) {
        log('warn', 'No se pudo obtener datos', { songId });
        return null;
      }
      
      const url = URL.createObjectURL(songData.blob);
      
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
  // ✅ verifyDownload (CON SECURE STORAGE)
  // ============================================
  const verifyDownload = useCallback(async (songId) => {
    try {
      return await secureStorage.isAvailable(songId);
    } catch (error) {
      log('error', 'Error verificando descarga', { error: error.message });
      return false;
    }
  }, [log]);

  // ============================================
  // ✅ getDownloadStatus
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
          error: 'Archivo corrupto o expirado',
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
  // ✅ saveToSecureStorage
  // ============================================
  const saveToSecureStorage = useCallback(async (songId, blob, metadata) => {
    try {
      log('info', 'Guardando en SecureStorage', { songId, size: blob.size });
      
      await secureStorage.storeSong(songId, blob, {
        title: metadata.title,
        artist: metadata.artist
      });
      
      const downloadRecord = {
        id: songId,
        title: metadata.title,
        artist: metadata.artist,
        downloadedAt: Date.now(),
        fileSize: blob.size,
        encrypted: true,
        storageType: 'indexeddb',
        expiresAt: Date.now() + (DOWNLOAD_CONFIG.DOWNLOAD_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      };
      
      return downloadRecord;
      
    } catch (error) {
      log('error', 'Error guardando en SecureStorage', { error: error.message });
      throw error;
    }
  }, [log]);

  // ============================================
  // ✅ getSecureStats
  // ============================================
  const getSecureStats = useCallback(async () => {
    try {
      return await secureStorage.getStats();
    } catch (error) {
      log('error', 'Error obteniendo stats', { error: error.message });
      return null;
    }
  }, [log]);

  // ============================================
  // ✅ cleanupExpired
  // ============================================
  const cleanupExpired = useCallback(async () => {
    try {
      const deleted = await secureStorage.cleanup();
      
      if (deleted > 0) {
        // Actualizar UI
        const songs = await secureStorage.getAllSongs();
        const downloads = {};
        songs.forEach(song => {
          downloads[song.songId] = {
            id: song.songId,
            title: song.metadata?.title,
            artist: song.metadata?.artist,
            downloadedAt: song.downloadedAt,
            fileSize: song.fileSize,
            encrypted: true,
            storageType: 'indexeddb',
            expiresAt: song.expiresAt
          };
        });
        
        localStorage.setItem(DOWNLOAD_CONFIG.STORAGE_KEY, JSON.stringify(downloads));
        setDownloadsMap(downloads);
      }
      
      return deleted;
    } catch (error) {
      log('error', 'Error en cleanup', { error: error.message });
      return 0;
    }
  }, [log]);

  // ============================================
  // ✅ removeDownload (CON SECURE STORAGE)
  // ============================================
  const removeDownload = useCallback(async (songId) => {
    try {
      // Eliminar de SecureStorage
      await secureStorage.removeSong(songId);
      
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
      
      window.dispatchEvent(new Event('downloads-updated'));
      log('info', 'Descarga eliminada de SecureStorage', { songId });
      return true;
      
    } catch (error) {
      log('error', 'Error eliminando', { error: error.message });
      return false;
    }
  }, [log]);

  // ============================================
  // ✅ clearAllDownloads (CON SECURE STORAGE)
  // ============================================
  const clearAllDownloads = useCallback(async () => {
    try {
      // Limpiar SecureStorage
      await secureStorage.clearAll();
      
      // Limpiar localStorage
      localStorage.removeItem(DOWNLOAD_CONFIG.STORAGE_KEY);
      
      // Actualizar estado
      setDownloadsMap({});
      
      window.dispatchEvent(new Event('downloads-updated'));
      log('info', 'Todo limpiado de SecureStorage');
      return true;
      
    } catch (error) {
      log('error', 'Error limpiando todo', { error: error.message });
      return false;
    }
  }, [log]);

  // ============================================
  // ✅ getAuthToken
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
  // ✅ executeWithRetry
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
  // ✅ calculateSHA256
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
  // ✅ processQueue
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
  // ✅ executeDownload (VERSIÓN FINAL CON DESCARGA DIRECTA)
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
      
      // ✅ OBTENER URL DIRECTA DE R2 (nueva función)
      const downloadInfo = await executeWithRetry(
        () => getDownloadUrl(songId, token), 
        songId
      );
      
      if (!downloadInfo?.url) {
        throw new Error('No se pudo obtener URL de descarga');
      }

      log('info', 'URL de descarga obtenida', { 
        songId, 
        urlType: 'direct',
        fileSize: downloadInfo.fileSize 
      });

      // ✅ DESCARGAR DIRECTAMENTE DESDE R2
      const response = await executeWithRetry(async () => {
        return await axios({
          method: 'GET',
          url: downloadInfo.url,
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

      if (!response) throw new Error('No se pudo obtener respuesta');

      const blob = response.data;

      if (blob.size < DOWNLOAD_CONFIG.MIN_FILE_SIZE) {
        throw new Error('Archivo corrupto (tamaño insuficiente)');
      }

      const hash = await calculateSHA256(blob);

      // ✅ GUARDAR EN SECURE STORAGE
      const downloadRecord = await saveToSecureStorage(songId, blob, { 
        title: songTitle, 
        artist: artistName 
      });

      downloadRecord.hash = hash;
      downloadRecord.filename = downloadInfo.filename;

      // Guardar metadata en localStorage (para UI síncrona)
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

      log('info', '✅ Descarga completada y guardada en SecureStorage', { 
        songId, 
        size: (blob.size / 1024 / 1024).toFixed(2) + 'MB',
        from: 'R2 direct'
      });

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
  }, [getAuthToken, getDownloadUrl, executeWithRetry, calculateSHA256, saveToSecureStorage, processQueue, log]);

  // ============================================
  // ✅ cancelDownload
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
  // ✅ clearError
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
    // Acciones
    downloadSong,
    cancelDownload,
    removeDownload,
    clearAllDownloads,
    clearError,

    // Estados UI  
    downloading,  
    progress,  
    errors,  
    queue: queueVisual,  

    // Consultas síncronas  
    isDownloaded,        
    getDownloadInfo,     
    getAllDownloads,     

    // Funciones offline (SecureStorage)
    getOfflineAudioUrl,  
    getDownloadStatus,   
    verifyDownload,      
    getSecureStats,      
    cleanupExpired,

    // Utilidades  
    getAuthToken,
    getStreamUrl, // Para streaming
    getDownloadUrl // Para descargas directas
  };
};

export default useDownload;