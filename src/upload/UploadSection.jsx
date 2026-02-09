// src/upload/UploadSection.jsx
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  CircularProgress,
  Snackbar,
  Fade,
  Collapse,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  CheckCircle,
  Error as ErrorIcon,
  MusicNote,
  UploadFile,
  Info,
  Warning,
  Cancel,
  Replay,
  Storage,
  Speed,
  Schedule,
  Check,
  PlaylistAdd,
  QueueMusic,
  ClearAll,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useUploadManager } from '../components/hook/useUploadManager';

const UploadSection = () => {
  const {
    uploads,
    queue,
    quota,
    serviceStatus,
    isInitialized,
    uploadFiles,
    addToQueue,
    processQueue,
    removeFromQueue,
    clearQueue,
    clearCompletedUploads,
    clearAllUploads,
    cancelUpload,
    getStats,
    validateFile,
    checkAvailability,
  } = useUploadManager();

  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [confirmClearDialog, setConfirmClearDialog] = useState(false);
  const [confirmClearAllDialog, setConfirmClearAllDialog] = useState(false);
  const [stats, setStats] = useState(null);

  // Cargar estadísticas
  useEffect(() => {
    const newStats = getStats();
    setStats(newStats);
  }, [uploads, queue, getStats]);

  // Drag & Drop
  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const validationResults = acceptedFiles.map(file => ({
      file,
      validation: validateFile(file),
    }));

    const validFiles = validationResults.filter(r => r.validation && r.validation.valid);
    const invalidFiles = validationResults.filter(r => !r.validation || !r.validation.valid);

    // Agregar archivos válidos a la cola
    if (validFiles.length > 0) {
      const queueIds = addToQueue(
        validFiles.map(r => r.file),
        validFiles.map(() => ({}))
      );
      
      if (queueIds && queueIds.length > 0) {
        setSuccessMessage(`${validFiles.length} archivo(s) agregado(s) a la cola`);
      }
    }

    // Mostrar errores de validación
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles
        .map(({ file, validation }) => {
          if (!validation) return `${file.name}: Error de validación`;
          return `${file.name}: ${validation.errors ? validation.errors.join(', ') : 'Archivo inválido'}`;
        })
        .join('; ');
      
      setLocalError(`Algunos archivos no son válidos: ${errorMessages}`);
    }

    setLocalError(null);
  }, [validateFile, addToQueue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.webm', '.opus', '.aiff'],
      'application/zip': ['.zip'],
    },
    disabled: isProcessingQueue,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleProcessQueue = async () => {
    if (!queue || queue.length === 0) return;
    
    setIsProcessingQueue(true);
    try {
      const results = await processQueue();
      const successful = results ? results.filter(r => r.success).length : 0;
      const failed = results ? results.filter(r => !r.success).length : 0;
      
      if (successful > 0) {
        setSuccessMessage(`${successful} archivo(s) comenzaron a subirse`);
      }
      if (failed > 0) {
        setLocalError(`${failed} archivo(s) fallaron al procesarse`);
      }
    } catch (error) {
      setLocalError('Error procesando la cola de archivos');
      console.error('Error procesando cola:', error);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const handleCancelUpload = async (uploadId) => {
    try {
      await cancelUpload(uploadId);
      setSuccessMessage('Upload cancelado');
    } catch (error) {
      setLocalError('Error cancelando el upload');
      console.error('Error cancelando upload:', error);
    }
  };

  const handleRetryUpload = async (uploadId) => {
    // Implementar reintento si es necesario
    setLocalError('Reintento no implementado aún');
  };

  const handleCheckAvailability = async () => {
    try {
      const available = await checkAvailability();
      if (available) {
        setSuccessMessage('Servicio de upload disponible');
      } else {
        setLocalError('Servicio de upload no disponible');
      }
    } catch (error) {
      setLocalError('Error verificando disponibilidad');
      console.error('Error verificando disponibilidad:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond) return '0 B/s';
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds <= 0) return '--';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'uploading': return <UploadFile color="primary" />;
      case 'pending': return <CircularProgress size={20} />;
      case 'error': return <ErrorIcon color="error" />;
      case 'cancelled': return <Cancel color="warning" />;
      default: return <MusicNote />;
    }
  };

  const calculateOverallProgress = () => {
    if (!uploads || uploads.length === 0) return 0;
    
    const totalProgress = uploads.reduce((sum, upload) => sum + (upload.progress || 0), 0);
    return Math.round(totalProgress / uploads.length);
  };

  const completedUploads = uploads ? uploads.filter(u => u.status === 'completed').length : 0;
  const failedUploads = uploads ? uploads.filter(u => u.status === 'error').length : 0;
  const activeUploads = uploads ? uploads.filter(u => u.status === 'uploading' || u.status === 'pending').length : 0;

  const overallProgress = useMemo(() => calculateOverallProgress(), [uploads]);
  const hasUploads = uploads && uploads.length > 0;
  const hasQueue = queue && queue.length > 0;
  const hasContent = hasUploads || hasQueue;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1a1a1a' }}>
          Subir Música
        </Typography>
        
        {serviceStatus && (
          <Collapse in={showDetails}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Chip 
                    icon={serviceStatus.available ? <Check /> : <Warning />}
                    label={serviceStatus.available ? 'Servicio activo' : 'Servicio limitado'}
                    color={serviceStatus.available ? 'success' : 'warning'}
                    size="small"
                  />
                  {stats && (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        {stats.queueSize || 0} en cola
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.successRate || 0}% éxito
                      </Typography>
                    </>
                  )}
                  <Button 
                    size="small" 
                    onClick={() => setShowDetails(!showDetails)}
                    sx={{ ml: 'auto' }}
                  >
                    {showDetails ? 'Menos detalles' : 'Más detalles'}
                  </Button>
                </Stack>
                
                {showDetails && stats && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                      <Chip 
                        icon={<QueueMusic />}
                        label={`${stats.totalUploads || 0} total`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        icon={<Speed />}
                        label={`${formatFileSize(stats.completedBytes)} subidos`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        icon={<Schedule />}
                        label={`${stats.inProgress || 0} en progreso`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Collapse>
        )}
      </Box>

      {/* Cuota de almacenamiento */}
      {quota && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">
              <Storage fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Espacio disponible
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {quota.percentage || 0}% usado
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={quota.percentage || 0}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              mb: 0.5,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              }
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(quota.used || 0)} de {formatFileSize(quota.total || 0)} • {formatFileSize(quota.remaining || 0)} disponibles
          </Typography>
        </Paper>
      )}

      {/* Área de Drag & Drop */}
      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: isProcessingQueue ? 'not-allowed' : 'pointer',
          mb: 3,
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: isProcessingQueue ? 'grey.300' : 'primary.main',
            backgroundColor: isProcessingQueue ? 'background.paper' : 'action.hover',
          },
          opacity: isProcessingQueue ? 0.7 : 1,
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ 
          fontSize: 48, 
          color: isDragActive ? 'primary.main' : 'grey.400', 
          mb: 2,
          transition: 'color 0.2s',
        }} />
        <Typography variant="body1" gutterBottom fontWeight="medium">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz click para seleccionar'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Formatos soportados: MP3, WAV, FLAC, M4A, AAC, OGG, WEBM, OPUS, AIFF, ZIP
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          Máximo 100MB por archivo • {queue?.length || 0} archivos en cola
        </Typography>
      </Paper>

      {/* Estadísticas rápidas */}
      {hasContent && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {hasQueue && (
            <Chip 
              icon={<PlaylistAdd />}
              label={`${queue.length} en cola`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          {activeUploads > 0 && (
            <Chip 
              icon={<UploadFile />}
              label={`${activeUploads} subiendo`}
              color="secondary"
              variant="outlined"
              size="small"
            />
          )}
          {completedUploads > 0 && (
            <Chip 
              icon={<CheckCircle />}
              label={`${completedUploads} completados`}
              color="success"
              variant="outlined"
              size="small"
            />
          )}
          {failedUploads > 0 && (
            <Chip 
              icon={<ErrorIcon />}
              label={`${failedUploads} fallidos`}
              color="error"
              variant="outlined"
              size="small"
            />
          )}
          {hasUploads && overallProgress > 0 && overallProgress < 100 && (
            <Chip 
              label={`${overallProgress}% progreso total`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      )}

      {/* Progreso general */}
      {hasUploads && overallProgress < 100 && overallProgress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Progreso total de uploads</Typography>
            <Typography variant="caption" fontWeight="medium">
              {overallProgress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={overallProgress}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      )}

      {/* Cola de archivos */}
      {hasQueue && (
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle2" fontWeight="medium">
              Cola de archivos ({queue.length})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={handleProcessQueue}
                disabled={isProcessingQueue || queue.length === 0}
              >
                {isProcessingQueue ? 'Procesando...' : 'Procesar'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ClearAll />}
                onClick={() => clearQueue()}
                disabled={isProcessingQueue}
              >
                Limpiar
              </Button>
            </Stack>
          </Box>
          <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
            {queue.map((item, index) => (
              <React.Fragment key={item.id || index}>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <MusicNote />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.file?.name || 'Archivo sin nombre'}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {item.file?.size ? formatFileSize(item.file.size) : 'Tamaño desconocido'} • {item.file?.type ? item.file.type.split('/')[1]?.toUpperCase() || 'Audio' : 'Desconocido'}
                        {item.validation?.warnings?.length > 0 && ' ⚠️'}
                      </Typography>
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { wordBreak: 'break-word' },
                    }}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Eliminar de la cola">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeFromQueue(item.id)}
                        disabled={isProcessingQueue}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < queue.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Uploads en progreso */}
      {hasUploads && (
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle2" fontWeight="medium">
              Uploads en progreso ({activeUploads} activos)
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ClearAll />}
              onClick={() => setConfirmClearDialog(true)}
              disabled={completedUploads === 0}
            >
              Limpiar completados
            </Button>
          </Box>
          <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
            {uploads.map((upload, index) => (
              <React.Fragment key={upload.id || index}>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    {getStatusIcon(upload.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={upload.name || 'Upload sin nombre'}
                    secondary={
                      <Box>
                        <Typography variant="caption" component="span" color="text.secondary">
                          {formatFileSize(upload.size || 0)} • {upload.status || 'desconocido'}
                          {upload.progress > 0 && ` • ${upload.progress}%`}
                          {upload.speed && ` • ${formatSpeed(upload.speed)}`}
                          {upload.estimatedRemaining && ` • ${formatTimeRemaining(upload.estimatedRemaining)} restantes`}
                        </Typography>
                        {upload.status === 'uploading' && upload.progress > 0 && (
                          <LinearProgress 
                            variant="determinate" 
                            value={upload.progress}
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          />
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { 
                        wordBreak: 'break-word',
                        color: upload.error ? 'error.main' : 'inherit'
                      },
                    }}
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={0.5}>
                      {upload.status === 'error' && (
                        <Tooltip title="Reintentar">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleRetryUpload(upload.id)}
                          >
                            <Replay fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(upload.status === 'uploading' || upload.status === 'pending') && (
                        <Tooltip title="Cancelar">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleCancelUpload(upload.id)}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(upload.status === 'completed' || upload.status === 'cancelled') && (
                        <Tooltip title="Eliminar de la lista">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => {
                              // Esto debería manejarse con un método del hook
                              setLocalError('Use "Limpiar completados" para eliminar múltiples');
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < uploads.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
        {hasQueue && (
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleProcessQueue}
            disabled={isProcessingQueue || queue.length === 0}
            sx={{ minWidth: 150 }}
          >
            {isProcessingQueue ? 'Procesando...' : `Procesar ${queue.length} archivo(s)`}
          </Button>
        )}
        
        <Button
          variant="outlined"
          startIcon={<Check />}
          onClick={handleCheckAvailability}
        >
          Verificar servicio
        </Button>

        {hasContent && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setConfirmClearAllDialog(true)}
          >
            Limpiar todo
          </Button>
        )}
      </Box>

      {/* Panel de información */}
      <Collapse in={hasContent}>
        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: 'info.light', 
            borderColor: 'info.main',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5
          }}
          variant="outlined"
        >
          <Info color="info" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
              Cómo funciona el sistema de upload:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
              1. Arrastra archivos a la zona o haz click para seleccionar
              <br />
              2. Los archivos se validan y agregan a la cola
              <br />
              3. Haz click en "Procesar" para comenzar los uploads
              <br />
              4. Puedes cancelar uploads individuales en cualquier momento
              <br />
              5. Los uploads completados se pueden limpiar de la lista
            </Typography>
          </Box>
        </Paper>
      </Collapse>

      {/* Mensajes de error */}
      {localError && (
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ mt: 3 }}
            onClose={() => setLocalError(null)}
          >
            {localError}
          </Alert>
        </Fade>
      )}

      {/* Mensaje de éxito */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage(null)}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Diálogo de confirmación para limpiar completados */}
      <Dialog
        open={confirmClearDialog}
        onClose={() => setConfirmClearDialog(false)}
      >
        <DialogTitle>¿Limpiar uploads completados?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Se eliminarán {completedUploads} upload(s) completado(s) de la lista.
            Esta acción no afecta los archivos ya subidos al servidor.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearDialog(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
              clearCompletedUploads();
              setConfirmClearDialog(false);
              setSuccessMessage('Uploads completados limpiados');
            }}
            color="primary"
          >
            Limpiar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para limpiar todo */}
      <Dialog
        open={confirmClearAllDialog}
        onClose={() => setConfirmClearAllDialog(false)}
      >
        <DialogTitle>¿Limpiar todo?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Esta acción eliminará:
            <br />• {queue?.length || 0} archivo(s) de la cola
            <br />• {uploads?.length || 0} upload(s) en progreso
            <br />
            <br />
            <strong>Esta acción no se puede deshacer.</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearAllDialog(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
              clearAllUploads();
              setConfirmClearAllDialog(false);
              setSuccessMessage('Todo limpiado correctamente');
            }}
            color="error"
          >
            Limpiar Todo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadSection;