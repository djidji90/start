// hooks/useDownload.js
import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const useDownload = () => {
  const [downloading, setDownloading] = useState({});
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const abortControllers = useRef(new Map());

  // Obtener token (compatible con tu StreamManager)
  const getAuthToken = useCallback(() => {
    // Buscar en todos los lugares posibles
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

  // Cancelar descarga específica
  const cancelDownload = useCallback((songId) => {
    if (abortControllers.current.has(songId)) {
      abortControllers.current.get(songId).abort();
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
    }
  }, []);

  // Descargar canción principal
  const downloadSong = useCallback(async (songId, songTitle = 'Canción', artistName = 'Artista') => {
    // Evitar duplicados
    if (downloading[songId]) {
      return;
    }

    const controller = new AbortController();
    abortControllers.current.set(songId, controller);

    try {
      // 1. Estado inicial
      setDownloading(prev => ({ ...prev, [songId]: true }));
      setProgress(prev => ({ ...prev, [songId]: 0 }));
      setErrors(prev => ({ ...prev, [songId]: null }));

      // 2. Obtener token
      const token = getAuthToken();
      if (!token) return;

      // 3. Preparar URL
      const API_BASE = 'https://api.djidjimusic.com/api2';
      const url = `${API_BASE}/songs/${songId}/download/`;

      // 4. Intentar con ambos tipos de autenticación
      const authAttempts = [
        { type: 'Bearer', header: `Bearer ${token}` },
        { type: 'Token', header: `Token ${token}` }
      ];

      let lastError;
      let response;

      for (const auth of authAttempts) {
        try {
          console.log(`[Download] Intentando con ${auth.type}...`);
          
          response = await axios({
            method: 'GET',
            url,
            headers: {
              'Authorization': auth.header,
              'Accept': 'audio/mpeg, */*',
              'X-Requested-With': 'XMLHttpRequest'
            },
            responseType: 'blob',
            signal: controller.signal,
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total && progressEvent.total > 0) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(prev => ({ ...prev, [songId]: percent }));
              }
            },
            timeout: 30000 // 30 segundos timeout
          });

          console.log(`[Download] Éxito con ${auth.type}`);
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          console.warn(`[Download] ${auth.type} falló:`, err.message);
          
          // Si es error de autenticación, continuar con siguiente
          if (err.response?.status === 401) continue;
          // Si es cancelación, salir
          if (err.name === 'CanceledError' || err.message.includes('canceled')) {
            throw err;
          }
        }
      }

      // Si todas las autenticaciones fallaron
      if (lastError && !response) {
        throw lastError;
      }

      // 5. Procesar respuesta
      const blob = response.data;
      const blobType = blob.type || 'audio/mpeg';
      
      if (!blobType.includes('audio')) {
        console.warn('[Download] El archivo no parece ser audio:', blobType);
      }

      // 6. Crear nombre de archivo seguro
      const safeArtist = (artistName || 'Artista')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 50);
      
      const safeTitle = (songTitle || 'Canción')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 50);
      
      const fileName = `${safeArtist} - ${safeTitle}.mp3`;

      // 7. Descargar archivo
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();

      // 8. Limpiar
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      // 9. Guardar en historial
      const downloadRecord = {
        id: songId,
        title: songTitle,
        artist: artistName,
        fileName,
        downloadedAt: new Date().toISOString(),
        fileSize: blob.size,
        mimeType: blobType
      };

      try {
        const currentDownloads = JSON.parse(localStorage.getItem('djidji_downloads') || '{}');
        currentDownloads[songId] = downloadRecord;
        localStorage.setItem('djidji_downloads', JSON.stringify(currentDownloads));
      } catch (storageError) {
        console.warn('[Download] Error guardando en localStorage:', storageError);
      }

      // 10. Actualizar estado final
      setDownloading(prev => ({ ...prev, [songId]: false }));
      
      // Disparar evento para otros componentes
      window.dispatchEvent(new CustomEvent('download-completed', { 
        detail: downloadRecord 
      }));

      return downloadRecord;

    } catch (error) {
      // Manejo de errores
      console.error('[Download] Error completo:', error);
      
      let errorMessage = 'Error al descargar la canción';
      
      if (error.name === 'CanceledError' || error.message.includes('canceled')) {
        errorMessage = 'Descarga cancelada';
      } else if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Sesión expirada. Vuelve a iniciar sesión.';
            break;
          case 403:
            errorMessage = 'No tienes permiso para descargar esta canción.';
            break;
          case 404:
            errorMessage = 'Canción no disponible para descarga.';
            break;
          case 429:
            errorMessage = 'Demasiadas descargas. Intenta más tarde.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Servidor no disponible. Intenta más tarde.';
            break;
          default:
            errorMessage = `Error ${error.response.status}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors(prev => ({ ...prev, [songId]: errorMessage }));
      throw new Error(errorMessage);
      
    } finally {
      // Siempre limpiar
      abortControllers.current.delete(songId);
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[songId];
        return newState;
      });
    }
  }, [downloading, getAuthToken]);

  // Verificar si está descargada
  const isDownloaded = useCallback((songId) => {
    try {
      const downloads = JSON.parse(localStorage.getItem('djidji_downloads') || '{}');
      return !!downloads[songId];
    } catch {
      return false;
    }
  }, []);

  // Obtener info de descarga
  const getDownloadInfo = useCallback((songId) => {
    try {
      const downloads = JSON.parse(localStorage.getItem('djidji_downloads') || '{}');
      return downloads[songId] || null;
    } catch {
      return null;
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback((songId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[songId];
      return newErrors;
    });
  }, []);

  // Eliminar descarga del historial
  const removeDownload = useCallback((songId) => {
    try {
      const downloads = JSON.parse(localStorage.getItem('djidji_downloads') || '{}');
      delete downloads[songId];
      localStorage.setItem('djidji_downloads', JSON.stringify(downloads));
      
      // Disparar evento
      window.dispatchEvent(new Event('downloads-updated'));
      
      return true;
    } catch {
      return false;
    }
  }, []);

  // Obtener todas las descargas
  const getAllDownloads = useCallback(() => {
    try {
      const downloads = JSON.parse(localStorage.getItem('djidji_downloads') || '{}');
      return Object.values(downloads).sort((a, b) => 
        new Date(b.downloadedAt) - new Date(a.downloadedAt)
      );
    } catch {
      return [];
    }
  }, []);

  // Limpiar todo
  const clearAllDownloads = useCallback(() => {
    try {
      localStorage.removeItem('djidji_downloads');
      window.dispatchEvent(new Event('downloads-updated'));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    // Acciones
    downloadSong,
    cancelDownload,
    removeDownload,
    clearAllDownloads,
    
    // Estados
    downloading,
    progress,
    errors,
    
    // Consultas
    isDownloaded,
    getDownloadInfo,
    getAllDownloads,
    
    // Utilidades
    clearError,
    getAuthToken
  };
};

export default useDownload;
