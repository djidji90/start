// hooks/useUploadManager.js
import { useState, useEffect, useCallback, useRef } from 'react';
import getUploadService from '../../components/hook/services/uploadService';

export const useUploadManager = () => {
  const [uploads, setUploads] = useState([]);
  const [queue, setQueue] = useState([]);
  const [quota, setQuota] = useState(null);
  const [serviceStatus, setServiceStatus] = useState({ available: true });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const uploadService = getUploadService();
  const eventListeners = useRef(new Set());

  // Inicializar
  const initialize = useCallback(async () => {
    try {
      // Cargar cuota
      const quotaData = await uploadService.getUserQuota();
      setQuota(quotaData);
      
      // Cargar estado del servicio
      const status = uploadService.getServiceStatus();
      setServiceStatus(status);
      
      // Verificar disponibilidad
      await uploadService.checkServiceAvailability();
      
      setIsInitialized(true);
      console.log('[useUploadManager] Inicializado correctamente');
      
    } catch (error) {
      console.error('[useUploadManager] Error inicializando:', error);
      setServiceStatus(prev => ({ ...prev, available: false }));
    }
  }, [uploadService]);

  // Configurar event listeners
  const setupEventListeners = useCallback(() => {
    const handlers = {
      'upload-progress': (event) => {
        const { uploadId, progress, speed, estimatedRemaining } = event.detail;
        
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { 
                ...upload, 
                progress, 
                speed, 
                estimatedRemaining,
                status: 'uploading',
                lastUpdate: Date.now()
              }
            : upload
        ));
      },
      
      'upload-success': (event) => {
        const { uploadId, result } = event.detail;
        
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { 
                ...upload, 
                status: 'completed', 
                result, 
                progress: 100,
                completedAt: Date.now()
              }
            : upload
        ));
        
        // Actualizar cuota
        updateQuota();
      },
      
      'upload-error': (event) => {
        const { uploadId, error } = event.detail;
        
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { 
                ...upload, 
                status: 'error', 
                error: error.message,
                failedAt: Date.now()
              }
            : upload
        ));
      },
      
      'upload-cancelled': (event) => {
        const { uploadId } = event.detail;
        
        setUploads(prev => prev.filter(upload => upload.id !== uploadId));
        setQueue(prev => prev.filter(item => item.uploadId !== uploadId));
      },
      
      'upload-service-availability': (event) => {
        setServiceStatus(prev => ({
          ...prev,
          available: event.detail.available,
          lastCheck: Date.now()
        }));
      }
    };

    // Agregar listeners
    Object.entries(handlers).forEach(([eventName, handler]) => {
      window.addEventListener(eventName, handler);
      eventListeners.current.add({ eventName, handler });
    });

    return () => {
      // Cleanup listeners
      eventListeners.current.forEach(({ eventName, handler }) => {
        window.removeEventListener(eventName, handler);
      });
      eventListeners.current.clear();
    };
  }, []);

  // Efecto de inicialización
  useEffect(() => {
    initialize();
    const cleanup = setupEventListeners();
    
    return cleanup;
  }, [initialize, setupEventListeners]);

  // Actualizar cuota
  const updateQuota = useCallback(async (forceRefresh = false) => {
    try {
      const quotaData = await uploadService.getUserQuota({ forceRefresh });
      setQuota(quotaData);
    } catch (error) {
      console.warn('[useUploadManager] Error actualizando cuota:', error);
    }
  }, [uploadService]);

  // Subir archivo
  const uploadFile = useCallback(async (file, metadata = {}, options = {}) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear entrada en estado
    const uploadEntry = {
      id: uploadId,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
      file
    };
    
    setUploads(prev => [...prev, uploadEntry]);
    
    try {
      const result = await uploadService.uploadFile(file, metadata, {
        onProgress: (progress, details) => {
          // El event listener manejará la actualización del progreso
          console.log(`Progress for ${file.name}: ${progress}%`);
        },
        ...options
      });
      
      return { success: true, uploadId, result };
      
    } catch (error) {
      // El event listener manejará el error
      console.error(`[useUploadManager] Error subiendo ${file.name}:`, error);
      return { success: false, uploadId, error };
    }
  }, [uploadService]);

  // Subir múltiples archivos
  const uploadFiles = useCallback(async (files, metadataArray = [], options = {}) => {
    const results = await Promise.allSettled(
      files.map((file, index) => 
        uploadFile(file, metadataArray[index] || {}, options)
      )
    );
    
    return {
      total: files.length,
      successful: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length,
      results: results.map((result, index) => ({
        file: files[index]?.name,
        status: result.status,
        value: result.status === 'fulfilled' ? result.value : undefined,
        reason: result.status === 'rejected' ? result.reason : undefined,
      })),
    };
  }, [uploadFile]);

  // Cancelar upload
  const cancelUpload = useCallback(async (uploadId, options = {}) => {
    try {
      await uploadService.cancelUpload(uploadId, options);
      setUploads(prev => prev.filter(upload => upload.id !== uploadId));
      return { success: true, uploadId };
    } catch (error) {
      console.error(`[useUploadManager] Error cancelando upload ${uploadId}:`, error);
      return { success: false, uploadId, error };
    }
  }, [uploadService]);

  // Verificar estado de upload
  const getUploadStatus = useCallback(async (uploadId) => {
    try {
      const status = await uploadService.getUploadStatus(uploadId);
      return { success: true, status };
    } catch (error) {
      return { success: false, error };
    }
  }, [uploadService]);

  // Agregar a cola
  const addToQueue = useCallback((files, metadataArray = []) => {
    const fileArray = Array.isArray(files) ? files : [files];
    
    const queueItems = fileArray.map((file, index) => {
      const validation = uploadService.validateFile(file);
      
      return {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        metadata: metadataArray[index] || {},
        validation,
        addedAt: Date.now(),
        uploadId: null
      };
    });
    
    setQueue(prev => [...prev, ...queueItems]);
    
    return queueItems.map(item => item.id);
  }, [uploadService]);

  // Procesar cola
  const processQueue = useCallback(async () => {
    const itemsToProcess = [...queue];
    
    // Limpiar cola
    setQueue([]);
    
    const results = [];
    
    for (const item of itemsToProcess) {
      if (!item.validation.valid) {
        results.push({
          id: item.id,
          success: false,
          error: `Validación falló: ${item.validation.errors.join(', ')}`
        });
        continue;
      }
      
      try {
        const result = await uploadFile(item.file, item.metadata);
        results.push({
          id: item.id,
          success: true,
          uploadId: result.uploadId
        });
      } catch (error) {
        results.push({
          id: item.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }, [queue, uploadFile]);

  // Eliminar de cola
  const removeFromQueue = useCallback((itemId) => {
    setQueue(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Limpiar cola
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // Limpiar uploads completados
  const clearCompletedUploads = useCallback(() => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  }, []);

  // Limpiar todos los uploads
  const clearAllUploads = useCallback(() => {
    setUploads([]);
    setQueue([]);
  }, []);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const totalUploads = uploads.length;
    const completed = uploads.filter(u => u.status === 'completed').length;
    const failed = uploads.filter(u => u.status === 'error').length;
    const inProgress = uploads.filter(u => 
      u.status === 'uploading' || u.status === 'pending'
    ).length;
    
    const totalBytes = uploads.reduce((sum, upload) => sum + (upload.size || 0), 0);
    const completedBytes = uploads
      .filter(u => u.status === 'completed')
      .reduce((sum, upload) => sum + (upload.size || 0), 0);
    
    const successRate = totalUploads > 0 ? (completed / totalUploads) * 100 : 0;
    
    return {
      totalUploads,
      completed,
      failed,
      inProgress,
      totalBytes,
      completedBytes,
      successRate: Math.round(successRate * 100) / 100,
      queueSize: queue.length,
    };
  }, [uploads, queue]);

  // Verificar disponibilidad
  const checkAvailability = useCallback(async () => {
    try {
      const available = await uploadService.checkServiceAvailability();
      setServiceStatus(prev => ({ ...prev, available }));
      return available;
    } catch (error) {
      setServiceStatus(prev => ({ ...prev, available: false }));
      return false;
    }
  }, [uploadService]);

  return {
    // Estado
    uploads,
    queue,
    quota,
    serviceStatus,
    isInitialized,
    
    // Métodos
    initialize,
    updateQuota,
    uploadFile,
    uploadFiles,
    cancelUpload,
    getUploadStatus,
    addToQueue,
    processQueue,
    removeFromQueue,
    clearQueue,
    clearCompletedUploads,
    clearAllUploads,
    getStats,
    checkAvailability,
    
    // Utilidades
    validateFile: uploadService.validateFile.bind(uploadService),
    getServiceStatus: uploadService.getServiceStatus.bind(uploadService),
    getMetrics: uploadService.getDetailedMetrics.bind(uploadService),
  };
};