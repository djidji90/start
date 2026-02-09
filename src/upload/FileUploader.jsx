// Actualización del FileUploader.jsx para ser más flexible
// components/Upload/FileUploader.jsx (versión actualizada)
import React, { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  IconButton,
  CircularProgress,
  Button,
  Collapse,
} from '@mui/material';
import {
  CloudUpload as CloudIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import UploadProgress from '../upload/UploadProgress';
import QuotaDisplay from '../upload/QuotaDisplay';
import UploadHistory from '../upload/UploadHistory'; // Nuevo componente que vamos a crear
import { useUpload } from '../components/hook/services/useUpload'; // Asegúrate de tener este hook implementado

function FileUploader({ onUploadStart, onUploadEnd, isModal = false }) {
  const {
    isUploading,
    progress,
    currentUpload,
    error,
    quota,
    uploadHistory,
    uploadFile,
    cancelUpload,
    loadQuota,
    clearError,
    formatBytes,
    checkStatus,
  } = useUpload();

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Notificar inicio/fin de upload al componente padre
  useEffect(() => {
    if (isUploading && onUploadStart) {
      onUploadStart();
    }
    if (!isUploading && onUploadEnd) {
      onUploadEnd();
    }
  }, [isUploading, onUploadStart, onUploadEnd]);

  // Cargar cuota al iniciar
  useEffect(() => {
    loadQuota();
  }, [loadQuota]);

  // Handlers para drag & drop
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
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    // Validaciones
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
    if (!audioTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|aac|ogg)$/i)) {
      setError('Formato no soportado. Solo archivos de audio (MP3, WAV, FLAC, AAC, OGG)');
      return;
    }

    if (quota && file.size > quota.available_quota) {
      setError(`Cuota insuficiente. Disponible: ${formatBytes(quota.available_quota)}`);
      return;
    }

    // Limpiar mensajes previos
    clearError();
    setSuccessMessage(null);

    // Iniciar upload
    const result = await uploadFile(file);
    
    if (result.success) {
      setSuccessMessage({
        title: '¡Archivo subido exitosamente!',
        message: 'Tu canción está siendo procesada y estará disponible pronto.',
      });
    }
  };

  const handleButtonClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box sx={{ 
      p: isModal ? 3 : 0,
      minHeight: isModal ? '400px' : 'auto',
    }}>
      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        disabled={isUploading}
        style={{ display: 'none' }}
      />

      {/* Panel de Cuota */}
      <Box sx={{ mb: 4 }}>
        <QuotaDisplay 
          quota={quota}
          onRefresh={loadQuota}
          isLoading={!quota && !error}
        />
      </Box>

      {/* Área de Upload */}
      <Box
        onClick={!isUploading ? handleButtonClick : undefined}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: dragActive ? '3px dashed #10b981' : '3px dashed #d1d5db',
          borderRadius: '16px',
          padding: '60px 30px',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: dragActive ? '#ecfdf5' : '#f9fafb',
          transition: 'all 0.3s ease',
          mb: 4,
          opacity: isUploading ? 0.7 : 1,
          '&:hover': !isUploading && {
            borderColor: '#3b82f6',
            backgroundColor: '#eff6ff',
          },
        }}
      >
        <CloudIcon 
          sx={{ 
            fontSize: 64, 
            color: dragActive ? '#10b981' : '#9ca3af',
            mb: 3,
            animation: dragActive ? 'float 3s ease-in-out infinite' : 'none',
          }} 
        />
        
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {isUploading ? 'Subiendo archivo...' : 'Sube tu música'}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {isUploading 
            ? 'No cierres esta ventana' 
            : 'Arrastra archivos aquí o haz clic para seleccionar'}
        </Typography>
        
        <Typography variant="caption" color="text.disabled">
          Formatos soportados: MP3, WAV, FLAC, AAC, OGG • 
          Máximo: {quota ? formatBytes(quota.available_quota) : '...'}
        </Typography>
      </Box>

      {/* Progreso de Upload Actual */}
      {isUploading && currentUpload && (
        <Box sx={{ mb: 4 }}>
          <UploadProgress
            fileName={currentUpload.file?.name || 'Archivo'}
            progress={progress}
            status={currentUpload.status || 'uploading'}
            fileSize={currentUpload.file?.size}
            onCancel={cancelUpload}
            uploadId={currentUpload.id}
          />
        </Box>
      )}

      {/* Mensaje de Éxito */}
      <Collapse in={!!successMessage}>
        <Alert
          severity="success"
          icon={<CheckIcon fontSize="inherit" />}
          sx={{ mb: 3 }}
          action={
            <IconButton
              size="small"
              onClick={() => setSuccessMessage(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Typography variant="body1" fontWeight={600}>
            {successMessage?.title}
          </Typography>
          <Typography variant="body2">
            {successMessage?.message}
          </Typography>
        </Alert>
      </Collapse>

      {/* Mensaje de Error */}
      <Collapse in={!!error}>
        <Alert
          severity="error"
          icon={<ErrorIcon fontSize="inherit" />}
          sx={{ mb: 3 }}
          action={
            <Box>
              <IconButton
                size="small"
                onClick={clearError}
                sx={{ mr: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <Button
                size="small"
                startIcon={<ReplayIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Reintentar
              </Button>
            </Box>
          }
        >
          {error}
        </Alert>
      </Collapse>

      {/* Historial de Uploads (solo si hay historial) */}
      {uploadHistory.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <UploadHistory 
            uploads={uploadHistory}
            formatBytes={formatBytes}
            onRefresh={checkStatus}
          />
        </Box>
      )}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </Box>
  );
}

export default FileUploader;