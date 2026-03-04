// src/components/hook/services/useUpload.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { uploadService } from './apia';

// ============================================
// CONSTANTES
// ============================================
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/aac', 'audio/ogg'];
const MAX_CONCURRENT_UPLOADS = 3;

export const useUpload = (options = {}) => {
  const {
    autoRefreshQuota = true,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError
  } = options;

  // ============================================
  // ESTADOS
  // ============================================
  const [quota, setQuota] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Referencias para control de concurrencia
  const queueRef = useRef([]);
  const activeUploadsRef = useRef(0);
  const abortControllersRef = useRef(new Map());

  // ============================================
  // UTILIDADES
  // ============================================
  const formatBytes = useCallback((bytes) => {
    if (bytes === 0 || !bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem("accessToken") ||
           localStorage.getItem("access_token") ||
           localStorage.getItem("token") ||
           localStorage.getItem("auth_token") ||
           localStorage.getItem("jwt_token") ||
           localStorage.getItem("django_token");
  }, []);

  // ============================================
  // VALIDACIONES
  // ============================================
  const validateFile = useCallback((file) => {
    const errors = [];
    
    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      errors.push({
        field: 'size',
        message: `Archivo demasiado grande. Máximo ${formatBytes(MAX_FILE_SIZE)} (actual: ${formatBytes(file.size)})`
      });
    }
    
    if (file.size === 0) {
      errors.push({
        field: 'size',
        message: 'El archivo está vacío'
      });
    }
    
    // Validar tipo
    const fileType = file.type || 'audio/mpeg';
    const isAllowedType = ALLOWED_TYPES.includes(fileType) || 
                         file.name.match(/\.(mp3|wav|flac|m4a|aac|ogg)$/i);
    
    if (!isAllowedType) {
      errors.push({
        field: 'type',
        message: 'Tipo de archivo no soportado. Usa MP3, WAV, FLAC, M4A, AAC u OGG'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }, [formatBytes]);

  // ============================================
  // REFRESCAR CUOTA (VERSIÓN CORREGIDA)
  // ============================================
  const refreshQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await uploadService.getQuota();
      
      // Transformar la respuesta al formato que esperamos
      // Basado en la estructura real que vimos:
      // {
      //   limits: { total_storage_gb: 5, file_size_mb: 100 },
      //   totals: { size_gb: 0, count: 0 },
      //   pending: { size_bytes: 32175542, count: 73 },
      //   daily: { size: { max_bytes: 524288000, used_bytes: 0, remaining_bytes: 524288000 } },
      //   active_sessions: 16,
      //   reset_at: "..."
      // }
      
      const totalStorageBytes = (data.limits?.total_storage_gb || 5) * 1024 * 1024 * 1024;
      const usedBytes = (data.totals?.size_gb || 0) * 1024 * 1024 * 1024;
      const pendingBytes = data.pending?.size_bytes || 0;
      const freeBytes = totalStorageBytes - usedBytes - pendingBytes;
      
      const formattedQuota = {
        // Campos principales (compatibilidad con código existente)
        limit: totalStorageBytes,
        used: usedBytes,
        pending: pendingBytes,
        free: freeBytes > 0 ? freeBytes : 0,
        
        // Campos adicionales útiles
        daily_limit: data.daily?.size?.max_bytes || 524288000,
        daily_used: data.daily?.size?.used_bytes || 0,
        daily_remaining: data.daily?.size?.remaining_bytes || 524288000,
        uploads_today: data.daily?.uploads?.used || 0,
        uploads_today_max: data.daily?.uploads?.max || 50,
        active_sessions: data.active_sessions || 0,
        reset_at: data.reset_at,
        
        // Datos originales (por si acaso)
        raw: data
      };
      
      console.log('📊 Quota formateada:', {
        limit: formatBytes(formattedQuota.limit),
        used: formatBytes(formattedQuota.used),
        pending: formatBytes(formattedQuota.pending),
        free: formatBytes(formattedQuota.free)
      });
      
      setQuota(formattedQuota);
      setError(null);
      return formattedQuota;
    } catch (err) {
      console.error('Error fetching quota:', err);
      setError('Error al obtener cuota');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [formatBytes]);

  // ============================================
  // VERIFICAR CUOTA DISPONIBLE (VERSIÓN CORREGIDA)
  // ============================================
  const hasEnoughQuota = useCallback((fileSize) => {
    if (!quota) {
      console.log('⚠️ No hay información de cuota, asumiendo que sí hay espacio');
      return true;
    }
    
    // Calcular espacio pendiente de uploads en curso
    const pendingTotal = uploads
      .filter(u => ['pending', 'requesting', 'uploading', 'confirming'].includes(u.status))
      .reduce((sum, u) => sum + u.file.size, 0);
    
    const available = quota.free - pendingTotal;
    const enough = available >= fileSize;
    
    console.log('📊 Verificando cuota:', {
      free: formatBytes(quota.free),
      pendingTotal: formatBytes(pendingTotal),
      available: formatBytes(available),
      fileSize: formatBytes(fileSize),
      enough
    });
    
    return enough;
  }, [quota, uploads, formatBytes]);

  // ============================================
  // PREPARAR METADATA
  // ============================================
  const prepareMetadata = useCallback((file, metadata = {}) => {
    return {
      // Metadata del usuario (solo lo que existe)
      ...(metadata.artist && { artist: metadata.artist }),
      ...(metadata.title && { title: metadata.title }),
      ...(metadata.genre && { genre: metadata.genre }),
      ...(metadata.album && { album: metadata.album }),
      ...(metadata.year && { year: metadata.year }),
      ...(metadata.track_number && { track_number: metadata.track_number }),
      ...(metadata.lyrics && { lyrics: metadata.lyrics }),
      ...(metadata.composer && { composer: metadata.composer }),
      
      // Metadata técnica (siempre)
      original_filename: file.name,
      file_size: file.size,
      file_type: file.type || 'audio/mpeg',
      client: 'web-uploader',
      client_version: '1.0.0',
      upload_timestamp: new Date().toISOString(),
      
      // Todo lo demás que el usuario quiera enviar
      ...metadata
    };
  }, []);

  // ============================================
  // SUBIR A R2
  // ============================================
  const uploadToR2 = useCallback((uploadData, file, uploadId, onProgress) => {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      abortControllersRef.current.set(uploadId, controller);
      
      const xhr = new XMLHttpRequest();
      xhr.timeout = 5 * 60 * 1000; // 5 minutos
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percent,
            bytesPerSecond: e.loaded / ((Date.now() - startTime) / 1000)
          });
        }
      });

      xhr.addEventListener('load', () => {
        abortControllersRef.current.delete(uploadId);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: true,
            etag: xhr.getResponseHeader('ETag'),
            status: xhr.status
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        abortControllersRef.current.delete(uploadId);
        reject(new Error('Network error'));
      });
      
      xhr.addEventListener('abort', () => {
        abortControllersRef.current.delete(uploadId);
        reject(new Error('Upload cancelled'));
      });
      
      xhr.addEventListener('timeout', () => {
        abortControllersRef.current.delete(uploadId);
        reject(new Error('Upload timeout'));
      });

      const startTime = Date.now();
      xhr.open(uploadData.method || 'PUT', uploadData.upload_url);
      
      if (uploadData.suggested_content_type) {
        xhr.setRequestHeader('Content-Type', uploadData.suggested_content_type);
      }
      
      xhr.setRequestHeader('X-Upload-ID', uploadData.upload_id);
      xhr.send(file);
    });
  }, []);

  // ============================================
  // PROCESAR COLA DE UPLOADS
  // ============================================
  const processQueue = useCallback(async () => {
    if (activeUploadsRef.current >= MAX_CONCURRENT_UPLOADS) return;
    if (queueRef.current.length === 0) return;
    
    const nextJob = queueRef.current.shift();
    if (!nextJob) return;
    
    activeUploadsRef.current++;
    
    try {
      const { file, metadata, localId } = nextJob;
      
      // 1. Solicitar URL
      setUploads(prev => prev.map(u => 
        u.id === localId ? { ...u, status: 'requesting' } : u
      ));
      
      const fileData = {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'audio/mpeg',
        metadata: prepareMetadata(file, metadata)
      };
      
      const uploadData = await uploadService.requestUploadUrl(fileData);
      
      // 2. Actualizar con datos del backend
      setUploads(prev => prev.map(u => 
        u.id === localId ? { 
          ...u, 
          status: 'uploading',
          uploadId: uploadData.upload_id,
          fileKey: uploadData.file_key,
          expiresAt: uploadData.expires_at
        } : u
      ));
      
      if (onUploadStart) onUploadStart({ localId, uploadData });
      
      // 3. Subir a R2
      await uploadToR2(uploadData, file, localId, (progress) => {
        setUploads(prev => prev.map(u => 
          u.id === localId ? { ...u, progress: progress.percent } : u
        ));
        if (onUploadProgress) onUploadProgress({ localId, ...progress });
      });
      
      // 4. Confirmar
      setUploads(prev => prev.map(u => 
        u.id === localId ? { ...u, status: 'confirming' } : u
      ));
      
      const confirmation = await uploadService.confirmUpload(uploadData.upload_id);
      
      // 5. Completado
      setUploads(prev => prev.map(u => 
        u.id === localId ? { 
          ...u, 
          status: 'completed',
          completedAt: Date.now(),
          confirmation 
        } : u
      ));
      
      if (onUploadComplete) onUploadComplete({ localId, confirmation });
      
      // 6. Actualizar cuota
      await refreshQuota();
      
    } catch (err) {
      console.error('Upload error:', err);
      
      setUploads(prev => prev.map(u => 
        u.id === nextJob.localId ? { 
          ...u, 
          status: 'failed',
          error: err.message || 'Error desconocido',
          errorDetails: err.response?.data || err
        } : u
      ));
      
      if (onUploadError) onUploadError({ localId: nextJob.localId, error: err });
      
    } finally {
      activeUploadsRef.current--;
      processQueue();
    }
  }, [prepareMetadata, uploadToR2, refreshQuota, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]);

  // ============================================
  // AGREGAR ARCHIVO A COLA
  // ============================================
  const uploadFile = useCallback(async (file, metadata = {}) => {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      throw {
        type: 'VALIDATION_ERROR',
        errors: validation.errors
      };
    }
    
    // Validar cuota
    if (!hasEnoughQuota(file.size)) {
      throw {
        type: 'QUOTA_ERROR',
        message: `Espacio insuficiente. Disponible: ${formatBytes(quota?.free || 0)}`
      };
    }
    
    // Crear ID local
    const localId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear registro
    const newUpload = {
      id: localId,
      file,
      metadata,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
    
    setUploads(prev => [...prev, newUpload]);
    
    // Añadir a cola
    queueRef.current.push({ localId, file, metadata });
    
    // Procesar cola
    processQueue();
    
    return localId;
  }, [validateFile, hasEnoughQuota, quota, formatBytes, processQueue]);

  // ============================================
  // CANCELAR UPLOAD
  // ============================================
  const cancelUpload = useCallback(async (localId, deleteFromR2 = true) => {
    const upload = uploads.find(u => u.id === localId);
    if (!upload) return false;
    
    if (upload.uploadId) {
      try {
        await uploadService.cancelUpload(upload.uploadId, deleteFromR2);
      } catch (err) {
        console.error('Error cancelando en backend:', err);
      }
    }
    
    const controller = abortControllersRef.current.get(localId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(localId);
    }
    
    queueRef.current = queueRef.current.filter(job => job.localId !== localId);
    setUploads(prev => prev.filter(u => u.id !== localId));
    await refreshQuota();
    
    return true;
  }, [uploads, refreshQuota]);

  // ============================================
  // CANCELAR TODOS
  // ============================================
  const cancelAll = useCallback(async (deleteFromR2 = true) => {
    const pendingUploads = uploads.filter(u => 
      ['pending', 'requesting', 'uploading', 'confirming'].includes(u.status)
    );
    
    for (const upload of pendingUploads) {
      await cancelUpload(upload.id, deleteFromR2);
    }
  }, [uploads, cancelUpload]);

  // ============================================
  // REINTENTAR UPLOAD FALLIDO
  // ============================================
  const retryUpload = useCallback(async (localId) => {
    const failedUpload = uploads.find(u => u.id === localId && u.status === 'failed');
    if (!failedUpload) return false;
    
    setUploads(prev => prev.filter(u => u.id !== localId));
    return uploadFile(failedUpload.file, failedUpload.metadata);
  }, [uploads, uploadFile]);

  // ============================================
  // VERIFICAR ESTADO
  // ============================================
  const checkStatus = useCallback(async (uploadId) => {
    return uploadService.checkUploadStatus(uploadId);
  }, []);

  // ============================================
  // LIMPIAR COMPLETADOS
  // ============================================
  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.status !== 'completed'));
  }, []);

  // ============================================
  // ESTADÍSTICAS
  // ============================================
  const stats = {
    total: uploads.length,
    pending: uploads.filter(u => u.status === 'pending').length,
    requesting: uploads.filter(u => u.status === 'requesting').length,
    uploading: uploads.filter(u => u.status === 'uploading').length,
    confirming: uploads.filter(u => u.status === 'confirming').length,
    completed: uploads.filter(u => u.status === 'completed').length,
    failed: uploads.filter(u => u.status === 'failed').length,
    
    totalBytes: uploads.reduce((sum, u) => sum + u.fileSize, 0),
    uploadedBytes: uploads
      .filter(u => u.status === 'completed')
      .reduce((sum, u) => sum + u.fileSize, 0),
    pendingBytes: uploads
      .filter(u => ['pending', 'requesting', 'uploading', 'confirming'].includes(u.status))
      .reduce((sum, u) => sum + u.fileSize, 0),
    
    progress: uploads.length > 0
      ? Math.round((uploads.filter(u => u.status === 'completed').length / uploads.length) * 100)
      : 0
  };

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    if (autoRefreshQuota) {
      refreshQuota();
    }
    
    const handleAuthExpired = () => {
      setError('Sesión expirada. Por favor inicia sesión nuevamente.');
    };
    
    window.addEventListener('auth:expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [autoRefreshQuota, refreshQuota]);

  return {
    // Estado
    quota,
    uploads,
    stats,
    isLoading,
    error,
    
    // Acciones principales
    uploadFile,
    cancelUpload,
    cancelAll,
    retryUpload,
    checkStatus,
    clearCompleted,
    refreshQuota,
    
    // Validaciones
    validateFile,
    hasEnoughQuota,
    
    // Constantes
    MAX_FILE_SIZE,
    ALLOWED_TYPES,
    MAX_CONCURRENT_UPLOADS,
    
    // Utilidades
    formatBytes,
    getAuthToken
  };
};