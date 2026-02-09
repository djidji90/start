// contexts/UploadContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import getUploadService from '../services/uploadService';

const UploadContext = createContext();

const uploadReducer = (state, action) => {
  switch (action.type) {
    case 'SET_UPLOADS':
      return { ...state, uploads: action.payload };
    
    case 'ADD_UPLOAD':
      return { ...state, uploads: [...state.uploads, action.payload] };
    
    case 'UPDATE_UPLOAD':
      return {
        ...state,
        uploads: state.uploads.map(upload =>
          upload.id === action.payload.id
            ? { ...upload, ...action.payload.updates }
            : upload
        ),
      };
    
    case 'REMOVE_UPLOAD':
      return {
        ...state,
        uploads: state.uploads.filter(upload => upload.id !== action.payload),
      };
    
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    
    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, action.payload] };
    
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter(item => item.id !== action.payload),
      };
    
    case 'CLEAR_QUEUE':
      return { ...state, queue: [] };
    
    case 'SET_QUOTA':
      return { ...state, quota: action.payload };
    
    case 'SET_SERVICE_STATUS':
      return { ...state, serviceStatus: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    default:
      return state;
  }
};

export const UploadProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uploadReducer, {
    uploads: [],
    queue: [],
    quota: null,
    serviceStatus: { available: true },
    isInitialized: false,
  });

  const uploadService = getUploadService();

  // Inicializar
  const initialize = useCallback(async () => {
    try {
      const quotaData = await uploadService.getUserQuota();
      const serviceStatus = uploadService.getServiceStatus();
      
      dispatch({ type: 'SET_QUOTA', payload: quotaData });
      dispatch({ type: 'SET_SERVICE_STATUS', payload: serviceStatus });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      
      return { success: true };
    } catch (error) {
      console.error('[UploadContext] Error initializing:', error);
      return { success: false, error };
    }
  }, [uploadService]);

  // Subir archivo
  const uploadFile = useCallback(async (file, metadata = {}, options = {}) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Agregar a estado
    dispatch({
      type: 'ADD_UPLOAD',
      payload: {
        id: uploadId,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        startTime: Date.now(),
        file,
      },
    });

    try {
      const result = await uploadService.uploadFile(file, metadata, options);
      
      dispatch({
        type: 'UPDATE_UPLOAD',
        payload: {
          id: uploadId,
          updates: {
            status: 'completed',
            result,
            progress: 100,
            completedAt: Date.now(),
          },
        },
      });

      // Actualizar cuota
      const quotaData = await uploadService.getUserQuota({ forceRefresh: true });
      dispatch({ type: 'SET_QUOTA', payload: quotaData });

      return { success: true, uploadId, result };
    } catch (error) {
      dispatch({
        type: 'UPDATE_UPLOAD',
        payload: {
          id: uploadId,
          updates: {
            status: 'error',
            error: error.message,
            failedAt: Date.now(),
          },
        },
      });

      return { success: false, uploadId, error };
    }
  }, [uploadService]);

  // Cancelar upload
  const cancelUpload = useCallback(async (uploadId, options = {}) => {
    try {
      await uploadService.cancelUpload(uploadId, options);
      dispatch({ type: 'REMOVE_UPLOAD', payload: uploadId });
      return { success: true };
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
      };
    });

    queueItems.forEach(item => {
      dispatch({ type: 'ADD_TO_QUEUE', payload: item });
    });

    return queueItems.map(item => item.id);
  }, [uploadService]);

  // Procesar cola
  const processQueue = useCallback(async () => {
    const queueItems = [...state.queue];
    
    // Limpiar cola
    dispatch({ type: 'CLEAR_QUEUE' });
    
    const results = [];
    
    for (const item of queueItems) {
      if (!item.validation.valid) {
        results.push({
          id: item.id,
          success: false,
          error: `Validación falló: ${item.validation.errors.join(', ')}`,
        });
        continue;
      }

      try {
        const result = await uploadFile(item.file, item.metadata);
        results.push({
          id: item.id,
          success: true,
          uploadId: result.uploadId,
        });
      } catch (error) {
        results.push({
          id: item.id,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }, [state.queue, uploadFile]);

  // Validar archivo
  const validateFile = useCallback((file) => {
    return uploadService.validateFile(file);
  }, [uploadService]);

  // Actualizar cuota
  const updateQuota = useCallback(async () => {
    try {
      const quotaData = await uploadService.getUserQuota({ forceRefresh: true });
      dispatch({ type: 'SET_QUOTA', payload: quotaData });
      return { success: true, quota: quotaData };
    } catch (error) {
      return { success: false, error };
    }
  }, [uploadService]);

  // Verificar disponibilidad
  const checkAvailability = useCallback(async () => {
    try {
      const available = await uploadService.checkServiceAvailability();
      dispatch({
        type: 'SET_SERVICE_STATUS',
        payload: { ...state.serviceStatus, available },
      });
      return available;
    } catch (error) {
      dispatch({
        type: 'SET_SERVICE_STATUS',
        payload: { ...state.serviceStatus, available: false },
      });
      return false;
    }
  }, [uploadService, state.serviceStatus]);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const totalUploads = state.uploads.length;
    const completed = state.uploads.filter(u => u.status === 'completed').length;
    const failed = state.uploads.filter(u => u.status === 'error').length;
    const inProgress = state.uploads.filter(u => 
      u.status === 'uploading' || u.status === 'pending'
    ).length;
    
    const totalBytes = state.uploads.reduce((sum, upload) => sum + (upload.size || 0), 0);
    const completedBytes = state.uploads
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
      queueSize: state.queue.length,
    };
  }, [state.uploads, state.queue]);

  const value = {
    // Estado
    ...state,
    
    // Métodos
    initialize,
    uploadFile,
    cancelUpload,
    addToQueue,
    processQueue,
    validateFile,
    updateQuota,
    checkAvailability,
    getStats,
    
    // Utilidades
    removeFromQueue: (itemId) => 
      dispatch({ type: 'REMOVE_FROM_QUEUE', payload: itemId }),
    clearQueue: () => dispatch({ type: 'CLEAR_QUEUE' }),
    clearCompletedUploads: () => 
      dispatch({ 
        type: 'SET_UPLOADS', 
        payload: state.uploads.filter(u => u.status !== 'completed') 
      }),
    clearAllUploads: () => {
      dispatch({ type: 'SET_UPLOADS', payload: [] });
      dispatch({ type: 'CLEAR_QUEUE' });
    },
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};