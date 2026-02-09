// components/upload/UploadButton.jsx
import React, { useRef, useState } from 'react';
import {
  Button,
  Box,
  LinearProgress,
  Typography,
  Chip,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  CircularProgress,
  Fade,
  Card,
  CardContent,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  MusicNote as MusicNoteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useUpload } from '../components/hook/services/useUpload';
import { styled } from '@mui/material/styles';

// Componentes estilizados
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.default,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '100%',
}));

const FileInfoCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
}));

const UploadButton = ({ 
  onUploadSuccess, 
  metadata = {},
  size = 'medium',
  variant = 'contained',
  fullWidth = false,
  showDetails = true,
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Usar nuestro hook
  const {
    startUpload,
    cancelUpload,
    resetUpload,
    status,
    progress,
    isUploading,
    isSuccess,
    isError,
    error,
    result,
    canCancel,
    canRetry,
    validateFile,
    getUploadMetrics,
  } = useUpload({
    onSuccess: (result) => {
      console.log('✅ Upload exitoso:', result);
      onUploadSuccess?.(result);
      
      // Auto-reset después de 8 segundos
      setTimeout(() => {
        resetUpload();
        setSelectedFile(null);
      }, 8000);
    },
    onError: (error) => {
      console.error('❌ Error en upload:', error);
    },
    onProgress: (progress) => {
      console.log(`📊 Progreso: ${progress}%`);
    },
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      // Mostrar error de validación
      alert(`Error: ${validation.errors.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    
    // Auto-start si es válido
    startUpload(file, {
      ...metadata,
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    }).catch(error => {
      // Error manejado por el hook
      console.error('Error iniciando upload:', error);
    });
    
    // Resetear input para permitir seleccionar el mismo archivo otra vez
    event.target.value = '';
  };

  const handleButtonClick = () => {
    if (isUploading && canCancel) {
      cancelUpload();
    } else if (isError && canRetry) {
      startUpload(selectedFile, metadata);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleReset = () => {
    resetUpload();
    setSelectedFile(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovered(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      alert(`Error: ${validation.errors.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    startUpload(file, {
      ...metadata,
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    }).catch(console.error);
  };

  // Determinar texto del botón
  const getButtonText = () => {
    if (isUploading) return `Subiendo... ${Math.round(progress)}%`;
    if (isSuccess) return '¡Subido!';
    if (isError) return 'Reintentar';
    return 'Seleccionar Archivo';
  };

  // Determinar icono del botón
  const getButtonIcon = () => {
    if (isUploading) return <CircularProgress size={20} color="inherit" />;
    if (isSuccess) return <CheckCircleIcon />;
    if (isError) return <RefreshIcon />;
    return <CloudUploadIcon />;
  };

  // Determinar color del botón
  const getButtonColor = () => {
    if (isUploading) return 'warning';
    if (isSuccess) return 'success';
    if (isError) return 'error';
    return 'primary';
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener métricas
  const metrics = getUploadMetrics();

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {/* Input de archivo oculto */}
      <VisuallyHiddenInput
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.webm,.opus"
      />
      
      {/* Zona de upload con drag & drop */}
      <UploadContainer
        elevation={isHovered ? 3 : 1}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          borderColor: isHovered ? 'primary.main' : 'divider',
          cursor: !isUploading ? 'pointer' : 'default',
        }}
      >
        <Stack spacing={2} alignItems="center">
          {/* Icono principal */}
          <Box sx={{ 
            color: isUploading ? 'warning.main' : 
                   isSuccess ? 'success.main' : 
                   isError ? 'error.main' : 'primary.main' 
          }}>
            {isUploading ? (
              <CircularProgress size={48} color="warning" />
            ) : (
              <MusicNoteIcon sx={{ fontSize: 48 }} />
            )}
          </Box>

          {/* Título */}
          <Typography variant="h6" align="center" gutterBottom>
            {isUploading ? 'Subiendo canción...' : 
             isSuccess ? '¡Canción subida!' : 
             isError ? 'Error al subir' : 
             'Subir nueva canción'}
          </Typography>

          {/* Descripción */}
          <Typography variant="body2" color="text.secondary" align="center">
            {isUploading ? 'Por favor espera mientras subimos tu archivo' :
             isSuccess ? 'Tu canción se ha procesado exitosamente' :
             isError ? 'Hubo un problema al subir tu archivo' :
             'Arrastra y suelta tu archivo aquí o haz clic para seleccionar'}
          </Typography>

          {/* Botón principal */}
          <Button
            component="label"
            variant={variant}
            color={getButtonColor()}
            size={size}
            startIcon={getButtonIcon()}
            onClick={handleButtonClick}
            disabled={isUploading && !canCancel}
            sx={{
              minWidth: 200,
              mt: 1,
              ...(fullWidth && { width: '100%' })
            }}
          >
            {getButtonText()}
          </Button>

          {/* Información de formatos */}
          {!selectedFile && !isUploading && (
            <Typography variant="caption" color="text.secondary">
              Formatos: MP3, WAV, OGG, M4A, FLAC, WEBM, OPUS • Máx: 100MB
            </Typography>
          )}
        </Stack>
      </UploadContainer>

      {/* Información del archivo seleccionado */}
      {selectedFile && showDetails && (
        <Fade in={!!selectedFile}>
          <FileInfoCard elevation={0}>
            <CardContent>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="flex-start"
                spacing={2}
              >
                <Box flex={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    {selectedFile.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip 
                      label={formatFileSize(selectedFile.size)} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={selectedFile.type || 'audio/*'} 
                      size="small" 
                      variant="outlined"
                    />
                  </Stack>
                </Box>
                
                {!isUploading && (
                  <Tooltip title="Remover archivo">
                    <IconButton 
                      size="small" 
                      onClick={handleReset}
                      disabled={isUploading}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </CardContent>
          </FileInfoCard>
        </Fade>
      )}

      {/* Barra de progreso */}
      {isUploading && (
        <ProgressContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                color={progress < 100 ? 'primary' : 'success'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          
          {/* Información de progreso */}
          {metrics && (
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Tiempo: {Math.round(metrics.duration / 1000)}s
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Velocidad: {metrics.speed} KB/s
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tamaño: {formatFileSize(metrics.fileSize)}
              </Typography>
            </Stack>
          )}
        </ProgressContainer>
      )}

      {/* Mensaje de error */}
      {isError && error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button 
                color="error" 
                size="small" 
                onClick={() => startUpload(selectedFile, metadata)}
              >
                Reintentar
              </Button>
              <IconButton 
                size="small" 
                color="inherit" 
                onClick={handleReset}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          }
        >
          <AlertTitle>Error al subir archivo</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Mensaje de éxito */}
      {isSuccess && result && (
        <Alert 
          severity="success" 
          sx={{ mt: 2 }}
          icon={<CheckCircleIcon fontSize="inherit" />}
          action={
            <IconButton 
              size="small" 
              color="inherit" 
              onClick={handleReset}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <AlertTitle>¡Subida exitosa!</AlertTitle>
          <Stack spacing={0.5}>
            <Typography variant="body2">
              Canción: {result.song?.title || selectedFile?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {result.uploadId?.substring(0, 12)}...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tiempo: {Math.round(metrics?.duration / 1000)} segundos
            </Typography>
          </Stack>
        </Alert>
      )}

      {/* Acciones adicionales */}
      {(isUploading || isError) && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {isUploading && canCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={cancelUpload}
            >
              Cancelar
            </Button>
          )}
          
          {isError && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={handleReset}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => startUpload(selectedFile, metadata)}
              >
                Reintentar
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

// Componente con props predeterminados para diferentes casos de uso
UploadButton.defaultProps = {
  size: 'medium',
  variant: 'contained',
  fullWidth: false,
  showDetails: true,
};

// Propiedades del componente
UploadButton.propTypes = {
  onUploadSuccess: PropTypes.func,
  metadata: PropTypes.object,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  fullWidth: PropTypes.bool,
  showDetails: PropTypes.bool,
};

export default UploadButton;