// components/UploadManager.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Upload, 
  Music, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  BarChart2,
  Settings,
  CloudUpload,
  User,
  HardDrive
} from 'lucide-react';
import getUploadService from '../services/uploadService';
import UploadProgress from './UploadProgress';
import UploadQueue from './UploadQueue';
import QuotaDisplay from './QuotaDisplay';
import FileValidator from './FileValidator';

const UploadManager = () => {
  const [uploads, setUploads] = useState([]);
  const [queue, setQueue] = useState([]);
  const [quota, setQuota] = useState(null);
  const [serviceStatus, setServiceStatus] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const uploadService = getUploadService();

  // Inicializar servicio
  useEffect(() => {
    const init = async () => {
      try {
        // Cargar cuota inicial
        const quotaData = await uploadService.getUserQuota();
        setQuota(quotaData);
        
        // Cargar estado del servicio
        const status = uploadService.getServiceStatus();
        setServiceStatus(status);
        
        // Suscribirse a eventos
        setupEventListeners();
        
        // Verificar disponibilidad
        await uploadService.checkServiceAvailability();
        
      } catch (error) {
        console.error('Error inicializando UploadManager:', error);
      }
    };
    
    init();
    
    // Cleanup
    return () => {
      removeEventListeners();
    };
  }, []);

  // Configurar listeners de eventos
  const setupEventListeners = () => {
    window.addEventListener('upload-progress', handleUploadProgress);
    window.addEventListener('upload-success', handleUploadSuccess);
    window.addEventListener('upload-error', handleUploadError);
    window.addEventListener('upload-cancelled', handleUploadCancelled);
    window.addEventListener('upload-service-availability', handleServiceAvailability);
  };

  const removeEventListeners = () => {
    window.removeEventListener('upload-progress', handleUploadProgress);
    window.removeEventListener('upload-success', handleUploadSuccess);
    window.removeEventListener('upload-error', handleUploadError);
    window.removeEventListener('upload-cancelled', handleUploadCancelled);
    window.removeEventListener('upload-service-availability', handleServiceAvailability);
  };

  // Manejadores de eventos
  const handleUploadProgress = useCallback((event) => {
    const { uploadId, progress, speed, estimatedRemaining } = event.detail;
    
    setUploads(prev => prev.map(upload => 
      upload.id === uploadId 
        ? { ...upload, progress, speed, estimatedRemaining, status: 'uploading' }
        : upload
    ));
  }, []);

  const handleUploadSuccess = useCallback((event) => {
    const { uploadId, result } = event.detail;
    
    setUploads(prev => prev.map(upload => 
      upload.id === uploadId 
        ? { ...upload, status: 'completed', result, progress: 100 }
        : upload
    ));
    
    // Actualizar cuota
    updateQuota();
  }, []);

  const handleUploadError = useCallback((event) => {
    const { uploadId, error } = event.detail;
    
    setUploads(prev => prev.map(upload => 
      upload.id === uploadId 
        ? { ...upload, status: 'error', error: error.message }
        : upload
    ));
  }, []);

  const handleUploadCancelled = useCallback((event) => {
    const { uploadId } = event.detail;
    
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  }, []);

  const handleServiceAvailability = useCallback((event) => {
    setServiceStatus(prev => ({
      ...prev,
      available: event.detail.available
    }));
  }, []);

  // Actualizar cuota
  const updateQuota = async () => {
    try {
      const quotaData = await uploadService.getUserQuota({ forceRefresh: true });
      setQuota(quotaData);
    } catch (error) {
      console.warn('Error actualizando cuota:', error);
    }
  };

  // Manejar selección de archivos
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validatedFiles = fileArray.map(file => {
      const validation = uploadService.validateFile(file);
      return {
        file,
        validation,
        id: `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    });
    
    setSelectedFiles(prev => [...prev, ...validatedFiles]);
  };

  // Manejar drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  // Subir archivos
  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    
    for (const fileData of selectedFiles) {
      if (!fileData.validation.valid) {
        alert(`Archivo ${fileData.file.name} no válido: ${fileData.validation.errors.join(', ')}`);
        continue;
      }
      
      try {
        // Crear entrada en la UI
        const uploadEntry = {
          id: fileData.id,
          name: fileData.file.name,
          size: fileData.file.size,
          status: 'pending',
          progress: 0,
          startTime: Date.now(),
        };
        
        setUploads(prev => [...prev, uploadEntry]);
        
        // Iniciar upload
        const metadata = {
          artist: 'Artista Desconocido',
          title: fileData.file.name.replace(/\.[^/.]+$/, ''),
          original_name: fileData.file.name,
        };
        
        const result = await uploadService.uploadFile(fileData.file, metadata, {
          onProgress: (progress, details) => {
            console.log(`Progress for ${fileData.file.name}: ${progress}%`);
          }
        });
        
        console.log('Upload completado:', result);
        
      } catch (error) {
        console.error(`Error subiendo ${fileData.file.name}:`, error);
        
        // Actualizar estado en la UI
        setUploads(prev => prev.map(upload => 
          upload.id === fileData.id 
            ? { ...upload, status: 'error', error: error.message }
            : upload
        ));
      }
    }
    
    // Limpiar archivos seleccionados
    setSelectedFiles([]);
  };

  // Cancelar upload
  const handleCancelUpload = async (uploadId) => {
    try {
      await uploadService.cancelUpload(uploadId);
      setUploads(prev => prev.filter(upload => upload.id !== uploadId));
    } catch (error) {
      console.error('Error cancelando upload:', error);
    }
  };

  // Limpiar completados
  const handleClearCompleted = () => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  };

  // Obtener estadísticas
  const getUploadStats = () => {
    const total = uploads.length;
    const completed = uploads.filter(u => u.status === 'completed').length;
    const failed = uploads.filter(u => u.status === 'error').length;
    const inProgress = uploads.filter(u => u.status === 'uploading').length;
    
    return { total, completed, failed, inProgress };
  };

  if (!serviceStatus.available) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Servicio de Upload No Disponible</h2>
        <p className="text-gray-600 mb-4">
          El servicio de upload está temporalmente no disponible. Por favor, intenta más tarde.
        </p>
        <button
          onClick={() => uploadService.checkServiceAvailability()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const stats = getUploadStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <CloudUpload className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Upload Manager</h1>
                <p className="text-gray-600">Sube y administra tu música en DJI Music</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => updateQuota()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
              
              <button
                onClick={handleClearCompleted}
                disabled={stats.completed === 0}
                className={`px-4 py-2 rounded-lg ${
                  stats.completed === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                Limpiar Completados
              </button>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Uploads</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart2 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En Progreso</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Fallidos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Izquierdo - Upload y Cuota */}
          <div className="lg:col-span-2 space-y-8">
            {/* Área de Upload */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Subir Música</h2>
                <QuotaDisplay quota={quota} />
              </div>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Arrastra tus archivos de música aquí
                </h3>
                <p className="text-gray-500 mb-4">
                  o haz clic para seleccionar archivos
                </p>
                <p className="text-sm text-gray-400">
                  Formatos soportados: MP3, WAV, FLAC, M4A, OGG, AAC, WEBM, OPUS, AIFF
                </p>
                <p className="text-sm text-gray-400">
                  Tamaño máximo: 100MB por archivo
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg,.aac,.webm,.opus,.aiff"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
              
              {/* Archivos Seleccionados */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Archivos seleccionados ({selectedFiles.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {selectedFiles.map((fileData) => (
                      <FileValidator
                        key={fileData.id}
                        fileData={fileData}
                        onRemove={() => {
                          setSelectedFiles(prev => 
                            prev.filter(f => f.id !== fileData.id)
                          );
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    
                    <button
                      onClick={handleUpload}
                      disabled={selectedFiles.some(f => !f.validation.valid)}
                      className={`px-6 py-3 rounded-xl font-medium ${
                        selectedFiles.some(f => !f.validation.valid)
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Subir {selectedFiles.length} Archivo(s)
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Uploads en Progreso */}
            {uploads.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Uploads en Progreso ({stats.inProgress})
                </h2>
                
                <div className="space-y-4">
                  {uploads.map((upload) => (
                    <UploadProgress
                      key={upload.id}
                      upload={upload}
                      onCancel={() => handleCancelUpload(upload.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Panel Derecho - Información y Estadísticas */}
          <div className="space-y-8">
            {/* Estado del Servicio */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Estado del Servicio
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Disponibilidad</span>
                  <span className={`flex items-center ${
                    serviceStatus.available 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {serviceStatus.available ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Disponible
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        No Disponible
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uploads Concurrentes</span>
                  <span className="font-medium">
                    {serviceStatus.queue?.active || 0} / {serviceStatus.limits?.concurrent || 3}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Límite Diario</span>
                  <span className="font-medium">
                    {serviceStatus.limits?.daily?.used || 0} / {serviceStatus.limits?.daily?.max || 50}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tasa de Éxito</span>
                  <span className="font-medium">
                    {serviceStatus.performance?.successRate?.toFixed(1) || '100.0'}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Información de Cuota */}
            {quota && (
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Tu Espacio de Almacenamiento
                </h2>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Usado: {quota.formattedUsed}</span>
                    <span>Total: {quota.formattedTotal}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${quota.percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    {quota.percentage >= 90 ? (
                      <span className="text-red-600 font-medium">
                        ⚠️ Espacio casi lleno ({quota.percentage.toFixed(1)}%)
                      </span>
                    ) : quota.percentage >= 70 ? (
                      <span className="text-yellow-600">
                        Espacio disponible: {quota.formattedRemaining}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        Amplio espacio disponible
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <HardDrive className="w-4 h-4 mr-3" />
                    <span>Disponible: {quota.formattedRemaining}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Music className="w-4 h-4 mr-3" />
                    <span>Aprox. {quota.estimatedSongs} canciones más</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-3" />
                    <span>{quota.activeSessions || 0} sesiones activas</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Consejos y Mejores Prácticas */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                💡 Consejos para Uploads
              </h3>
              
              <ul className="space-y-2 text-blue-700 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Usa formatos de alta calidad (FLAC, WAV) para mejor audio</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>MP3 a 320kbps es ideal para equilibrio calidad/tamaño</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Agrega metadatos (artista, álbum, género) para mejor organización</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Mantén conexión estable durante uploads grandes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadManager;