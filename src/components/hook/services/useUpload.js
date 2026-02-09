// useUpload.js - VERSIÓN SIMPLIFICADA Y REUTILIZABLE
import { useState, useCallback, useEffect } from 'react';
import getUploadService from '../services/uploadService';

export const useUpload = () => {
  const [files, setFiles] = useState([]);        // Archivos seleccionados
  const [uploads, setUploads] = useState([]);    // Uploads en progreso/completados
  const [quota, setQuota] = useState(null);      // Cuota del usuario
  const [loading, setLoading] = useState(false); // Estado de carga general
  const [error, setError] = useState(null);      // Error general

  const uploadService = getUploadService();

  // 1. INICIALIZAR: Cargar cuota al montar
  useEffect(() => {
    const init = async () => {
      try {
        const quotaData = await uploadService.getUserQuota();
        setQuota(quotaData);
      } catch (err) {
        console.warn('Error cargando cuota:', err);
      }
    };
    init();
  }, []);

  // 2. VALIDAR ARCHIVO (usa tu servicio)
  const validateFile = useCallback((file) => {
    return uploadService.validateFile(file);
  }, []);

  // 3. SUBIR ARCHIVO INDIVIDUAL
  const uploadFile = useCallback(async (file, metadata = {}) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear entrada en uploads
    const uploadEntry = {
      id: uploadId,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      startTime: Date.now(),
    };
    
    setUploads(prev => [...prev, uploadEntry]);
    setError(null);

    try {
      const result = await uploadService.uploadFile(file, metadata, {
        onProgress: (progress) => {
          // Actualizar progreso
          setUploads(prev => prev.map(u => 
            u.id === uploadId 
              ? { ...u, progress, status: 'uploading' }
              : u
          ));
        }
      });

      // Completado exitosamente
      setUploads(prev => prev.map(u => 
        u.id === uploadId 
          ? { ...u, status: 'completed', progress: 100, result }
          : u
      ));

      // Actualizar cuota
      const newQuota = await uploadService.getUserQuota({ forceRefresh: true });
      setQuota(newQuota);

      return { success: true, uploadId, result };

    } catch (err) {
      // Error
      setUploads(prev => prev.map(u => 
        u.id === uploadId 
          ? { ...u, status: 'error', error: err.message }
          : u
      ));
      setError(err.message);
      return { success: false, uploadId, error: err };
    }
  }, []);

  // 4. SUBIR MÚLTIPLES ARCHIVOS
  const uploadFiles = useCallback(async (fileList, metadataArray = []) => {
    setLoading(true);
    setError(null);
    
    const results = await Promise.allSettled(
      fileList.map((file, index) => 
        uploadFile(file, metadataArray[index] || {})
      )
    );

    setLoading(false);
    
    // Estadísticas
    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;

    return {
      total: fileList.length,
      successful,
      failed: fileList.length - successful,
      results,
    };
  }, [uploadFile]);

  // 5. CANCELAR UPLOAD
  const cancelUpload = useCallback(async (uploadId) => {
    try {
      await uploadService.cancelUpload(uploadId);
      setUploads(prev => prev.filter(u => u.id !== uploadId));
      return { success: true, uploadId };
    } catch (err) {
      setError(`Error cancelando: ${err.message}`);
      return { success: false, uploadId, error: err };
    }
  }, []);

  // 6. ACTUALIZAR CUOTA
  const updateQuota = useCallback(async () => {
    try {
      const quotaData = await uploadService.getUserQuota({ forceRefresh: true });
      setQuota(quotaData);
      return quotaData;
    } catch (err) {
      console.warn('Error actualizando cuota:', err);
      return null;
    }
  }, []);

  // 7. LIMPIAR
  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.status !== 'completed'));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setUploads([]);
    setError(null);
  }, []);

  // 8. ESTADÍSTICAS
  const getStats = useCallback(() => {
    const total = uploads.length;
    const completed = uploads.filter(u => u.status === 'completed').length;
    const uploading = uploads.filter(u => u.status === 'uploading').length;
    const failed = uploads.filter(u => u.status === 'error').length;

    return { total, completed, uploading, failed };
  }, [uploads]);

  return {
    // ESTADO
    files,
    setFiles,
    uploads,
    quota,
    loading,
    error,
    
    // MÉTODOS
    validateFile,
    uploadFile,
    uploadFiles,
    cancelUpload,
    updateQuota,
    clearCompleted,
    clearAll,
    getStats,
    
    // SERVICIO (por si necesitas acceder directamente)
    service: uploadService,
  };
};