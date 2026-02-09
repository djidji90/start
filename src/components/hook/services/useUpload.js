// hooks/useUpload.js (versión actualizada)
import { useState, useCallback, useRef, useEffect } from 'react';
import { uploadService } from '../services/uploadService';

export function useUpload() {
  const [state, setState] = useState(() => {
    // Intentar cargar historial desde localStorage
    const savedHistory = localStorage.getItem('uploadHistory');
    return {
      isUploading: false,
      progress: 0,
      currentUpload: null,
      error: null,
      quota: null,
      uploadHistory: savedHistory ? JSON.parse(savedHistory) : [],
    };
  });

  const abortControllerRef = useRef(null);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    if (state.uploadHistory.length > 0) {
      localStorage.setItem('uploadHistory', JSON.stringify(state.uploadHistory));
    }
  }, [state.uploadHistory]);

  /**
   * Cargar cuota del usuario
   */
  const loadQuota = useCallback(async () => {
    try {
      const quotaData = await uploadService.getUserQuota();
      setState(prev => ({ ...prev, quota: quotaData }));
      return quotaData;
    } catch (error) {
      console.error('Error cargando cuota:', error);
      throw error;
    }
  }, []);

  /**
   * Subir archivo (flujo completo)
   */
  const uploadFile = useCallback(async (file) => {
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      currentUpload: {
        id: null,
        file,
        status: 'preparing',
        timestamp: new Date().toISOString(),
      },
    }));

    try {
      // Verificar cuota primero
      const quota = await loadQuota();
      if (file.size > quota.available_quota) {
        throw new Error(
          `Cuota insuficiente. Necesitas ${uploadService.formatBytes(file.size)} ` +
          `pero tienes ${uploadService.formatBytes(quota.available_quota)} disponibles.`
        );
      }

      // Subir archivo
      const result = await uploadService.uploadFile(
        file,
        (progress) => {
          setState(prev => ({
            ...prev,
            progress,
            currentUpload: {
              ...prev.currentUpload,
              status: progress < 100 ? 'uploading' : 'confirming',
            },
          }));
        }
      );

      // Obtener estado final
      const status = await uploadService.getUploadStatus(result.uploadId);
      
      // Crear entrada de historial
      const historyEntry = {
        id: result.uploadId,
        fileName: file.name,
        fileSize: file.size,
        status: status.status,
        timestamp: new Date().toISOString(),
        fileType: file.type,
        result: result,
        lastChecked: new Date().toISOString(),
      };

      // Actualizar estado
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        currentUpload: {
          ...prev.currentUpload,
          id: result.uploadId,
          status: status.status,
          result,
        },
        uploadHistory: [historyEntry, ...prev.uploadHistory.slice(0, 19)], // Mantener solo últimos 20
      }));

      // Recargar cuota
      await loadQuota();

      return { success: true, data: result };

    } catch (error) {
      console.error('Error en upload:', error);
      
      // Agregar al historial como fallido
      const failedEntry = {
        id: Date.now().toString(), // ID temporal
        fileName: file.name,
        fileSize: file.size,
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };

      setState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message,
        currentUpload: {
          ...prev.currentUpload,
          status: 'error',
          error: error.message,
        },
        uploadHistory: [failedEntry, ...prev.uploadHistory.slice(0, 19)],
      }));

      return { success: false, error: error.message };
    }
  }, [loadQuota]);

  /**
   * Cancelar upload actual
   */
  const cancelUpload = useCallback(async (uploadId) => {
    if (!uploadId) return;

    try {
      await uploadService.cancelUpload(uploadId, true);
      
      // Cancelar request si está en progreso
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        currentUpload: null,
        uploadHistory: prev.uploadHistory.map(upload =>
          upload.id === uploadId
            ? { ...upload, status: 'cancelled' }
            : upload
        ),
      }));

      await loadQuota();
    } catch (error) {
      console.error('Error cancelando upload:', error);
    }
  }, [loadQuota]);

  /**
   * Verificar estado de un upload específico
   */
  const checkStatus = useCallback(async (uploadId) => {
    try {
      const status = await uploadService.getUploadStatus(uploadId);
      
      // Actualizar en historial si existe
      setState(prev => ({
        ...prev,
        uploadHistory: prev.uploadHistory.map(upload =>
          upload.id === uploadId
            ? { 
                ...upload, 
                status: status.status, 
                lastChecked: new Date().toISOString(),
                result: { ...upload.result, status }
              }
            : upload
        ),
      }));

      return status;
    } catch (error) {
      console.error('Error verificando estado:', error);
      throw error;
    }
  }, []);

  /**
   * Limpiar historial
   */
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, uploadHistory: [] }));
    localStorage.removeItem('uploadHistory');
  }, []);

  /**
   * Eliminar un upload del historial
   */
  const removeFromHistory = useCallback((uploadId) => {
    setState(prev => ({
      ...prev,
      uploadHistory: prev.uploadHistory.filter(upload => upload.id !== uploadId),
    }));
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    ...state,
    
    // Acciones
    uploadFile,
    cancelUpload,
    checkStatus,
    loadQuota,
    clearError,
    clearHistory,
    removeFromHistory,
    
    // Helpers
    formatBytes: uploadService.formatBytes,
  };
}