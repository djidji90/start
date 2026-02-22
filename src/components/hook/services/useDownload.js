// ============================================
// hooks/useDownload.js - VERSIÓN COMPLETA OPTIMIZADA
// ✅ Almacenamiento en IndexedDB (no accesible como archivos)
// ✅ Ofuscación de claves
// ✅ Cifrado básico opcional
// ✅ Manejo inteligente de errores 429 con expiración automática
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { openDB } from 'idb'; // npm install idb

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
  STORAGE_KEY: 'djidji_downloads_metadata', // Solo metadata
  DB_NAME: 'djidji-audio-db',
  DB_VERSION: 1,
  STORE_NAME: 'audio_store',
  METADATA_STORE: 'metadata_store',
  ENABLE_LOGGING: false,
  MIN_FILE_SIZE: 1024,
  MOBILE_REGEX: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
  // 🔐 Clave de ofuscación (idealmente desde servidor)
  APP_SECRET: 'djidji-secret-key-change-in-production'
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
  // ESTADO DE METADATA (SÍNCRONO)
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
  const dbInitialized = useRef(false);
  // 🔥 Timestamps para errores 429 (expiración automática)
  const errorTimestamps = useRef({});

  // ============================================
  // LOGGING
  // ============================================
  const log = useCallback((level, message, data = {}) => {
    if (!DOWNLOAD_CONFIG.ENABLE_LOGGING) return;
    const timestamp = new Date().toISOString();
    console[level](`[Download][${timestamp}][${instanceId.current}] ${message}`, data);
  }, []);

  // ============================================
  // 🔐 FUNCIONES DE OFUSCACIÓN
  // ============================================
  
  /**
   * Genera una clave ofuscada para almacenamiento
   * El audio se guarda con esta clave, no con el ID real
   */
  const getObfuscatedKey = useCallback((songId) => {
    // Combinar songId con APP_SECRET y invertir
    const combined = `${songId}-${DOWNLOAD_CONFIG.APP_SECRET}-${instanceId.current}`;
    // Ofuscación simple (no es criptografía, solo dificulta)
    const obfuscated = btoa(combined).split('').reverse().join('');
    // Limitar longitud y añadir prefijo
    return `audio_${obfuscated.substring(0, 32)}`;
  }, []);

  /**
   * Deriva una clave para posible cifrado (opcional)
   */
  const deriveKey = useCallback(async (userId, songId) => {
    if (!userId) return null;
    
    try {
      const text = `${userId}-${songId}-${DOWNLOAD_CONFIG.APP_SECRET}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return new Uint8Array(hash);
    } catch (error) {
      log('warn', 'Error derivando clave', { error: error.message });
      return null;
    }
  }, [log]);

  // ============================================
  // 📦 INICIALIZACIÓN DE INDEXEDDB
  // ============================================
  const getDB = useCallback(async () => {
    try {
      const db = await openDB(DOWNLOAD_CONFIG.DB_NAME, DOWNLOAD_CONFIG.DB_VERSION, {
        upgrade(db) {
          // Store para audio (con keys ofuscadas)
          if (!db.objectStoreNames.contains(DOWNLOAD_CONFIG.STORE_NAME)) {
            db.createObjectStore(DOWNLOAD_CONFIG.STORE_NAME);
          }
          
          // Store para metadata (con keys reales)
          if (!db.objectStoreNames.contains(DOWNLOAD_CONFIG.METADATA_STORE)) {
            db.createObjectStore(DOWNLOAD_CONFIG.METADATA_STORE);
          }
          
          log('info', 'Base de datos IndexedDB inicializada');
        }
      });
      
      dbInitialized.current = true;
      return db;
    } catch (error) {
      log('error', 'Error abriendo IndexedDB', { error: error.message });
      throw error;
    }
  }, [log]);

  // ============================================
  // CARGA INICIAL DE METADATA
  // ============================================
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        // Cargar metadata de localStorage (síncrono)
        const saved = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
        setDownloadsMap(saved);
        log('info', 'Metadata cargada', { count: Object.keys(saved).length });
      } catch (error) {
        log('error', 'Error cargando metadata', { error: error.message });
      }
    };

    loadMetadata();

    // Escuchar cambios en metadata
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
  // 🔥 LIMPIEZA AUTOMÁTICA DE ERRORES EXPIRADOS
  // ============================================
  const clearExpiredErrors = useCallback(() => {
    const now = Date.now();
    let hasChanges = false;
    
    Object.entries(errorTimestamps.current).forEach(([songId, timestamp]) => {
      // Si pasó más de 1 hora (3600000 ms), limpiar
      if (now - timestamp > 60 * 60 * 1000) {
        delete errorTimestamps.current[songId];
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[songId];
          return newErrors;
        });
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      log('info', 'Errores 429 expirados limpiados');
    }
  }, [log]);

  // Ejecutar limpieza cada minuto
  useEffect(() => {
    const interval = setInterval(clearExpiredErrors, 60 * 1000);
    return () => clearInterval(interval);
  }, [clearExpiredErrors]);

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
      // Verificar si existe metadata con fileSize
      const record = downloadsMap[songId];
      if (record?.fileSize) {
        return true;
      }

      // Fallback a localStorage directo
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
  // ✅ saveToIndexedDB (reemplaza a Cache API)
  // ============================================
  const saveToIndexedDB = useCallback(async (songId, blob, metadata) => {
    try {
      const db = await getDB();
      
      // 1️⃣ Generar clave ofuscada para el audio
      const obfuscatedKey = getObfuscatedKey(songId);
      
      // 2️⃣ Guardar el audio en IndexedDB (con clave ofuscada)
      await db.put(DOWNLOAD_CONFIG.STORE_NAME, blob, obfuscatedKey);
      
      // 3️⃣ Guardar metadata con la clave ofuscada también
      const metadataWithRef = {
        ...metadata,
        obfuscatedKey, // Guardamos referencia para poder recuperar después
        storedAt: Date.now()
      };
      await db.put(DOWNLOAD_CONFIG.METADATA_STORE, metadataWithRef, songId);
      
      log('info', 'Guardado en IndexedDB', { 
        songId, 
        size: blob.size,
        obfuscatedKey: obfuscatedKey.substring(0, 10) + '...'
      });
      
      return true;
    } catch (error) {
      log('error', 'Error guardando en IndexedDB', { error: error.message });
      return false;
    }
  }, [getDB, getObfuscatedKey, log]);

  // ============================================
  // ✅ getOfflineAudioUrl (desde IndexedDB)
  // ============================================
  const getOfflineAudioUrl = useCallback(async (songId) => {
    try {
      const db = await getDB();
      
      // 1️⃣ Obtener metadata para conocer la clave ofuscada
      const metadata = await db.get(DOWNLOAD_CONFIG.METADATA_STORE, songId);
      
      if (!metadata?.obfuscatedKey) {
        log('warn', 'No metadata found or missing obfuscatedKey', { songId });
        return null;
      }
      
      // 2️⃣ Recuperar audio con la clave ofuscada
      const blob = await db.get(DOWNLOAD_CONFIG.STORE_NAME, metadata.obfuscatedKey);
      
      if (!blob) {
        log('warn', 'No audio found in IndexedDB', { songId });
        return null;
      }
      
      // 3️⃣ Verificar tamaño
      if (blob.size < DOWNLOAD_CONFIG.MIN_FILE_SIZE) {
        log('warn', 'Archivo corrupto (tamaño insuficiente)', { songId, size: blob.size });
        return null;
      }
      
      // 4️⃣ Crear URL blob
      const url = URL.createObjectURL(blob);
      
      // 5️⃣ Auto-limpiar después de 1 minuto
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
          log('debug', 'URL blob limpiada', { songId });
        } catch (e) {
          // Ignorar
        }
      }, 60000);
      
      log('info', 'URL offline generada desde IndexedDB', { 
        songId, 
        urlType: 'blob',
        size: blob.size
      });
      
      return url;
      
    } catch (error) {
      log('error', 'Error obteniendo URL offline', { error: error.message, songId });
      return null;
    }
  }, [getDB, log]);

  // ============================================
  // ✅ verifyDownload (verifica en IndexedDB)
  // ============================================
  const verifyDownload = useCallback(async (songId) => {
    try {
      const db = await getDB();
      
      // 1️⃣ Verificar metadata
      const metadata = await db.get(DOWNLOAD_CONFIG.METADATA_STORE, songId);
      if (!metadata?.obfuscatedKey) return false;
      
      // 2️⃣ Verificar audio
      const blob = await db.get(DOWNLOAD_CONFIG.STORE_NAME, metadata.obfuscatedKey);
      if (!blob) return false;
      
      // 3️⃣ Verificar tamaño
      return blob.size >= DOWNLOAD_CONFIG.MIN_FILE_SIZE;
    } catch (error) {
      log('error', 'Error verificando descarga', { error: error.message });
      return false;
    }
  }, [getDB, log]);

  // ============================================
  // ✅ getDownloadStatus (completo)
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
  // ✅ removeDownload (MEJORADA)
  // ============================================
  const removeDownload = useCallback(async (songId) => {
    try {
      const db = await getDB();
      
      // 1️⃣ Obtener metadata para conocer la clave ofuscada
      const metadata = await db.get(DOWNLOAD_CONFIG.METADATA_STORE, songId);
      
      // 2️⃣ Eliminar audio de IndexedDB
      if (metadata?.obfuscatedKey) {
        await db.delete(DOWNLOAD_CONFIG.STORE_NAME, metadata.obfuscatedKey);
      }
      
      // 3️⃣ Eliminar metadata de IndexedDB
      await db.delete(DOWNLOAD_CONFIG.METADATA_STORE, songId);
      
      // 4️⃣ Eliminar de localStorage
      const downloads = JSON.parse(localStorage.getItem(DOWNLOAD_CONFIG.STORAGE_KEY) || '{}');
      delete downloads[songId];
      localStorage.setItem(DOWNLOAD_CONFIG.STORAGE_KEY, JSON.stringify(downloads));

      // 5️⃣ Actualizar mapa
      setDownloadsMap(prev => {
        const newMap = { ...prev };
        delete newMap[songId];
        return newMap;
      });

      window.dispatchEvent(new Event('downloads-updated'));
      log('info', 'Descarga eliminada de IndexedDB', { songId });
      return true;
    } catch (error) {
      log('error', 'Error eliminando', { error: error.message });
      return false;
    }
  }, [getDB, log]);

  // ============================================
  // ✅ clearAllDownloads
  // ============================================
  const clearAllDownloads = useCallback(async () => {
    try {
      const db = await getDB();
      
      // Limpiar todos los stores
      await db.clear(DOWNLOAD_CONFIG.STORE_NAME);
      await db.clear(DOWNLOAD_CONFIG.METADATA_STORE);
      
      // Limpiar localStorage
      localStorage.removeItem(DOWNLOAD_CONFIG.STORAGE_KEY);
      setDownloadsMap({});

      window.dispatchEvent(new Event('downloads-updated'));
      log('info', 'Historial limpiado de IndexedDB');
      return true;
    } catch (error) {
      log('error', 'Error limpiando', { error: error.message });
      return false;
    }
  }, [getDB, log]);

  // ============================================
  // FUNCIÓN: getAuthToken
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

      // 📦 Guardar en IndexedDB
      const savedToStorage = await saveToIndexedDB(songId, blob, {
        id: songId,
        title: songTitle,
        artist: artistName,
        fileName,
        hash
      });

      // Guardar metadata en localStorage (para acceso síncrono)
      const downloadRecord = {
        id: songId,
        title: songTitle,
        artist: artistName,
        fileName,
        downloadedAt: new Date().toISOString(),
        fileSize: blob.size,
        hash: hash,
        storageType: 'indexeddb'
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
      else if (error.response?.status === 429) {
        errorMessage = 'Límite alcanzado';
        // 🔥 Guardar timestamp para expiración automática
        errorTimestamps.current[songId] = Date.now();
      }
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
  }, [getAuthToken, requestSignedUrl, saveToIndexedDB, executeWithRetry, processQueue, calculateSHA256, log]);

  // ============================================
  // 🔥 DOWNLOAD SONG (VERSIÓN MEJORADA)
  // ============================================
  const downloadSong = useCallback((songId, songTitle = 'Canción', artistName = 'Artista') => {
    // ✅ 1. Verificar si ya está descargada
    if (isDownloaded(songId)) {
      return Promise.reject(new Error('Ya tienes esta canción descargada'));
    }

    // ✅ 2. Verificar errores con expiración
    if (errors[songId]) {
      const errorTime = errorTimestamps.current[songId];
      const now = Date.now();
      
      // Si hay timestamp y NO ha pasado 1 hora, rechazar con tiempo restante
      if (errorTime && (now - errorTime) < 60 * 60 * 1000) {
        const minutesLeft = Math.ceil((60 * 60 * 1000 - (now - errorTime)) / 60000);
        const message = errors[songId].includes('429') || errors[songId].includes('Límite')
          ? `Límite de descargas. Espera ${minutesLeft} minutos para volver a intentar.`
          : errors[songId];
        return Promise.reject(new Error(message));
      }
      
      // Si pasó 1 hora, limpiar el error automáticamente
      if (errorTime) {
        delete errorTimestamps.current[songId];
        clearError(songId);
      }
    }

    // ✅ 3. Verificar si está descargando ahora
    if (downloading[songId]) {
      return Promise.reject(new Error('Ya se está descargando'));
    }

    // ✅ 4. Continuar con la descarga normal
    return new Promise((resolve, reject) => {
      queueRef.current = [...queueRef.current, { songId, songTitle, artistName, resolve, reject }];
      setQueueVisual([...queueRef.current]);
      setTimeout(() => processQueue(), 0);
    });
  }, [downloading, errors, isDownloaded, clearError, processQueue]);

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
    // También limpiar timestamp si existe
    if (errorTimestamps.current[songId]) {
      delete errorTimestamps.current[songId];
    }
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

    // ✅ CONSULTAS SÍNCRONAS
    isDownloaded,
    getDownloadInfo,
    getAllDownloads,

    // ✅ FUNCIONES OFFLINE (IndexedDB)
    getOfflineAudioUrl,
    getDownloadStatus,
    verifyDownload,

    // ✅ UTILIDADES
    getAuthToken
  };
};

export default useDownload;