// src/upload/UploadModal.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  alpha,
  IconButton,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
  Fade,
  Avatar,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SpeedIcon from '@mui/icons-material/Speed';
import ImageIcon from '@mui/icons-material/Image';
import PublicIcon from '@mui/icons-material/Public';
import { useUpload } from '../components/hook/services/useUpload';

// Constantes
const GENRES = [
  'cacha', 'afro-beat', 'Reggaetón', 'Nzanga', 'bikutsy',
  'rumba', 'afro-trap', 'drill', 'musica-annobonesa', 'Hip Hop',
  'Electrónica', 'zouk', 'Indie', 'cultura-buby', 'gozpel',
  'EcuaBeats', 'Otro'
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

// ============================================
// COMPONENTES INTERNOS
// ============================================

// DropZone con glassmorphism y responsive
const FileDropZone = React.memo(({ dragActive, onDrag, onDrop, onFileSelect, formatBytes }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  
  return (
    <>
      <input
        type="file"
        accept="audio/*"
        onChange={onFileSelect}
        style={{ display: 'none' }}
        id="file-upload-input"
      />
      <label htmlFor="file-upload-input">
        <Paper
          elevation={0}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          sx={{
            backdropFilter: 'blur(10px)',
            background: 'rgba(255,255,255,0.8)',
            border: `2px dashed ${dragActive ? primaryColor : alpha('#000', 0.15)}`,
            borderRadius: 3,
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: primaryColor,
              bgcolor: alpha(primaryColor, 0.02)
            }
          }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: { xs: 36, sm: 48 }, 
              color: alpha('#000', 0.3),
              mb: 2
            }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '1.1rem', sm: '1.5rem' } }} gutterBottom>
            Selecciona o arrastra tu música
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#000', 0.5), mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            MP3, WAV, FLAC, M4A • {formatBytes(MAX_FILE_SIZE)} máx
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#000', 0.4), fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Formatos compatibles con alta calidad
          </Typography>
        </Paper>
      </label>
    </>
  );
});

// Barra de progreso con accent sutil
const UploadProgress = React.memo(({ upload, formatBytes }) => {
  const theme = useTheme();
  const [speed, setSpeed] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (upload?.status === 'uploading' && upload.bytesUploaded > 0) {
      const interval = setInterval(() => {
        if (upload.startTime && upload.bytesUploaded > 0) {
          const elapsed = (Date.now() - upload.startTime) / 1000;
          const currentSpeed = upload.bytesUploaded / elapsed;
          setSpeed(currentSpeed);
          
          if (currentSpeed > 0) {
            const remaining = (upload.totalBytes - upload.bytesUploaded) / currentSpeed;
            setTimeRemaining(remaining);
          }
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [upload?.status, upload?.bytesUploaded, upload?.totalBytes, upload?.startTime]);

  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={upload?.progress || 0}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          '& .MuiLinearProgress-bar': {
            bgcolor: theme.palette.primary.main,
            borderRadius: 2
          }
        }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" sx={{ color: alpha('#000', 0.5) }}>
          {upload?.progress || 0}%
        </Typography>
        
        {speed > 0 && (
          <Tooltip title="Velocidad">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedIcon sx={{ fontSize: 14, color: alpha('#000', 0.3) }} />
              <Typography variant="caption" sx={{ color: alpha('#000', 0.5) }}>
                {formatBytes(speed)}/s
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" sx={{ color: alpha('#000', 0.3) }}>
          {formatBytes(upload?.bytesUploaded || 0)} subidos
        </Typography>
        <Typography variant="caption" sx={{ color: alpha('#000', 0.3) }}>
          {formatBytes(upload?.totalBytes || 0)} total
        </Typography>
      </Box>
    </Box>
  );
});

// Metadata Form con preview elegante y responsive
const MetadataForm = React.memo(({ metadata, onChange, errors, audioPreview, coverPreview, onCoverSelect }) => {
  const theme = useTheme();
  
  return (
    <Box>
      {/* Tarjeta de preview - dark y elegante, responsive */}
      <Paper
        sx={{
          p: { xs: 2, sm: 4 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {/* Cover si existe - con layout responsive */}
          {coverPreview ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 3 }, 
              alignItems: { xs: 'center', sm: 'center' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Avatar 
                src={coverPreview} 
                sx={{ 
                  width: { xs: 80, sm: 100 }, 
                  height: { xs: 80, sm: 100 }, 
                  borderRadius: 2,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }} 
                variant="rounded"
              />
              <Box sx={{ width: '100%' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {metadata.title || 'Título'}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.7, 
                    mb: 2,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {metadata.artist || 'Artista'}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', sm: 'flex-start' } 
                }}>
                  <Chip 
                    label={metadata.genre} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} 
                  />
                  {metadata.album && (
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>
                      {metadata.album}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            // Preview minimal sin cover
            <>
              <Typography variant="overline" sx={{ opacity: 0.5, letterSpacing: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                VISTA PREVIA
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2.125rem' },
                  wordBreak: 'break-word'
                }}
              >
                {metadata.title || 'Título de la canción'}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.7, 
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  wordBreak: 'break-word'
                }}
              >
                {metadata.artist || 'Nombre del artista'}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                <Chip 
                  label={metadata.genre} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} 
                />
                {metadata.album && (
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>
                    {metadata.album}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ opacity: 0.5 }}>
                  {metadata.year}
                </Typography>
              </Box>
            </>
          )}
        </Box>
        
        {/* Decoración de fondo sutil */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: { xs: 150, sm: 200 },
            height: { xs: 150, sm: 200 },
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            zIndex: 1
          }}
        />
      </Paper>

      {/* Preview de audio - compacto */}
      {audioPreview && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: alpha('#000', 0.02), borderRadius: 2 }}>
          <Typography variant="caption" sx={{ color: alpha('#000', 0.5), display: 'block', mb: 1 }}>
            Vista previa
          </Typography>
          <audio controls src={audioPreview} style={{ width: '100%', height: 32 }} />
        </Paper>
      )}

      {/* Upload de portada - minimal */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: `1px dashed ${alpha('#000', 0.1)}` }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <ImageIcon sx={{ color: alpha('#000', 0.3), fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: alpha('#000', 0.7) }}>
              Portada (opcional)
            </Typography>
          </Box>
          <input
            type="file"
            accept="image/*"
            onChange={onCoverSelect}
            style={{ display: 'none' }}
            id="cover-upload-input"
          />
          <label htmlFor="cover-upload-input" style={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              component="span"
              size="small"
              variant="outlined"
              fullWidth={true}
              sx={{ 
                borderColor: alpha('#000', 0.2),
                color: alpha('#000', 0.7),
                '&:hover': { borderColor: theme.palette.primary.main }
              }}
            >
              {coverPreview ? 'Cambiar' : 'Subir'}
            </Button>
          </label>
        </Box>
      </Paper>

      {/* Formulario - ultra limpio */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Artista"
            value={metadata.artist}
            onChange={(e) => onChange('artist', e.target.value)}
            error={!!errors.artist}
            helperText={errors.artist}
            required
            variant="standard"
            placeholder="Nombre del artista"
            size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Canción"
            value={metadata.title}
            onChange={(e) => onChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            required
            variant="standard"
            placeholder="Título de la canción"
            size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Género"
            value={metadata.genre}
            onChange={(e) => onChange('genre', e.target.value)}
            variant="standard"
            size="small"
          >
            {GENRES.map((genre) => (
              <MenuItem key={genre} value={genre}>
                {genre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={7} sm={8}>
          <TextField
            fullWidth
            label="Álbum"
            value={metadata.album}
            onChange={(e) => onChange('album', e.target.value)}
            variant="standard"
            placeholder="Opcional"
            size="small"
          />
        </Grid>

        <Grid item xs={5} sm={4}>
          <TextField
            fullWidth
            label="Año"
            type="number"
            value={metadata.year}
            onChange={(e) => onChange('year', parseInt(e.target.value) || 2024)}
            error={!!errors.year}
            helperText={errors.year}
            variant="standard"
            inputProps={{ min: 1900, max: 2100 }}
            size="small"
          />
        </Grid>
      </Grid>
    </Box>
  );
});

// ============================================
// COMPONENTE PRINCIPAL - CORREGIDO
// ============================================
const UploadModal = ({ open, onClose }) => {
  const theme = useTheme();
  const {
    quota,
    uploads = [], // 👈 VALOR POR DEFECTO: array vacío si es undefined
    uploadFile,
    cancelUpload,
    formatBytes,
    validateFile,
    hasEnoughQuota
  } = useUpload({
    onUploadComplete: (data) => {
      console.log('Upload completo:', data);
    }
  });

  // Estados
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [metadata, setMetadata] = useState({
    artist: '',
    title: '',
    genre: 'Otro',
    album: '' ,
    year: new Date().getFullYear() ,
  });
  const [metadataErrors, setMetadataErrors] = useState({});
  const [step, setStep] = useState(0); // 0: selección, 1: metadata, 2: subiendo, 3: completado
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [localUploadId, setLocalUploadId] = useState(null);

  // ✅ CORREGIDO: Usar optional chaining y valor por defecto
  const currentUpload = useMemo(() => 
    uploads?.find(u => u.id === localUploadId) || null,
    [uploads, localUploadId]
  );

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSelectedFile(null);
        setSelectedCover(null);
        setAudioPreview(null);
        setCoverPreview(null);
        setMetadata({
          artist: '',
          title: '',
          genre: 'Otro',
          album: '',
          year: new Date().getFullYear()
        });
        setMetadataErrors({});
        setStep(0);
        setUploadError(null);
        setLocalUploadId(null);
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !currentUpload && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUpload, onClose, open]);

  // Previews
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setAudioPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedCover) {
      const url = URL.createObjectURL(selectedCover);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedCover]);

  // Auto-avanzar paso cuando se completa upload
  useEffect(() => {
    if (currentUpload?.status === 'completed') {
      setStep(3);
    }
  }, [currentUpload?.status]);

  // ============================================
  // VALIDACIONES
  // ============================================
  const validateMetadata = useCallback(() => {
    const errors = {};
    if (!metadata.artist.trim()) errors.artist = 'Artista requerido';
    if (!metadata.title.trim()) errors.title = 'Título requerido';
    if (metadata.year < 1900 || metadata.year > 2100) errors.year = 'Año inválido';
    return errors;
  }, [metadata]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleFile = useCallback((file) => {
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.errors[0]?.message);
      return;
    }

    if (!hasEnoughQuota(file.size)) {
      setUploadError(`Espacio insuficiente. Disponible: ${formatBytes(quota?.free || 0)}`);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    
    const suggestedTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    setMetadata(prev => ({
      ...prev,
      title: prev.title || suggestedTitle
    }));
    
    setStep(1);
  }, [validateFile, hasEnoughQuota, quota, formatBytes]);

  const handleCoverSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_COVER_SIZE) {
        setUploadError(`La imagen no puede superar los ${formatBytes(MAX_COVER_SIZE)}`);
        return;
      }
      setSelectedCover(file);
    }
  }, [formatBytes]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [handleFile]);

  const handleMetadataChange = useCallback((field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    if (metadataErrors[field]) {
      setMetadataErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [metadataErrors]);

  const handleUpload = useCallback(async () => {
    const errors = validateMetadata();
    if (Object.keys(errors).length > 0) {
      setMetadataErrors(errors);
      return;
    }
    
    setUploadError(null);
    
    try {
      const metadataWithCover = {
        ...metadata,
        cover: selectedCover
      };
      const id = await uploadFile(selectedFile, metadataWithCover);
      setLocalUploadId(id);
      setStep(2);
    } catch (err) {
      setUploadError(err.message || 'Error al iniciar upload');
    }
  }, [selectedFile, metadata, selectedCover, validateMetadata, uploadFile]);

  const handleClose = useCallback(() => {
    if (currentUpload?.status === 'uploading') {
      if (window.confirm('¿Cancelar la subida?')) {
        cancelUpload(currentUpload.id);
        onClose();
      }
    } else {
      onClose();
    }
  }, [currentUpload, cancelUpload, onClose]);

  // ============================================
  // RENDER
  // ============================================
  const primaryColor = theme.palette.primary.main;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          margin: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' }
        }
      }}
    >
      {/* Header minimal */}
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        p: { xs: 2, sm: 3 },
        pb: { xs: 1, sm: 2 },
        borderBottom: `1px solid ${alpha('#000', 0.05)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MusicNoteIcon sx={{ color: primaryColor, fontSize: { xs: 20, sm: 24 } }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {step === 0 && 'Subir música'}
              {step === 1 && 'Detalles de la canción'}
              {step === 2 && 'Subiendo...'}
              {step === 3 && '¡Completado!'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#000', 0.4), display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              <PublicIcon sx={{ fontSize: 14 }} />
              Comparte tu talento con el mundo
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleClose} 
          size="small"
          disabled={currentUpload?.status === 'uploading'}
          sx={{ color: alpha('#000', 0.3) }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Stepper minimal - responsive */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: { xs: 1, sm: 2 }, 
          mb: 4,
          px: { xs: 1, sm: 0 }
        }}>
          {[0, 1, 2, 3].map((index) => (
            <React.Fragment key={index}>
              <Box
                sx={{
                  width: { xs: 6, sm: 8 },
                  height: { xs: 6, sm: 8 },
                  borderRadius: '50%',
                  bgcolor: step === index ? primaryColor : step > index ? primaryColor : alpha('#000', 0.1),
                  opacity: step > index ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              />
              {index < 3 && (
                <Box
                  sx={{
                    width: { xs: 15, sm: 40 },
                    height: 1,
                    bgcolor: step > index ? primaryColor : alpha('#000', 0.1),
                    opacity: step > index ? 0.3 : 1
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Quota - solo cuando es relevante */}
        {quota && step < 2 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ color: alpha('#000', 0.5) }}>
                Espacio disponible
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {formatBytes(quota.free)} / {formatBytes(quota.limit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((quota.limit - quota.free) / quota.limit) * 100}
              sx={{
                height: 2,
                borderRadius: 1,
                bgcolor: alpha('#000', 0.05),
                '& .MuiLinearProgress-bar': {
                  bgcolor: primaryColor
                }
              }}
            />
          </Box>
        )}

        {/* Error */}
        {uploadError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 1 }}
            onClose={() => setUploadError(null)}
          >
            {uploadError}
          </Alert>
        )}

        {/* STEP 0: Selección */}
        <Fade in={step === 0} timeout={400}>
          <Box>
            <FileDropZone
              dragActive={dragActive}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFileSelect={(e) => handleFile(e.target.files?.[0])}
              formatBytes={formatBytes}
            />
          </Box>
        </Fade>

        {/* STEP 1: Metadata */}
        <Fade in={step === 1} timeout={400}>
          <Box>
            {/* Archivo seleccionado - minimal */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                mb: 3, 
                borderRadius: 1,
                borderColor: alpha('#000', 0.1)
              }}
            >
              <Typography variant="caption" sx={{ color: alpha('#000', 0.5), display: 'block', mb: 0.5 }}>
                Archivo seleccionado
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-word', maxWidth: { xs: '100%', sm: '70%' } }}>
                  {selectedFile?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#000', 0.5) }}>
                  {formatBytes(selectedFile?.size || 0)}
                </Typography>
              </Box>
            </Paper>

            <MetadataForm
              metadata={metadata}
              onChange={handleMetadataChange}
              errors={metadataErrors}
              audioPreview={audioPreview}
              coverPreview={coverPreview}
              onCoverSelect={handleCoverSelect}
            />
          </Box>
        </Fade>

        {/* STEP 2: Subiendo */}
        <Fade in={step === 2} timeout={400}>
          <Box>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: { xs: 3, sm: 4 }, 
                borderRadius: 2,
                borderColor: alpha('#000', 0.1),
                textAlign: 'center'
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, wordBreak: 'break-word' }}>
                {metadata.title}
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#000', 0.5), mb: 4, wordBreak: 'break-word' }}>
                {metadata.artist}
              </Typography>
              
              <UploadProgress upload={currentUpload} formatBytes={formatBytes} />
            </Paper>
          </Box>
        </Fade>

        {/* STEP 3: Completado - con mensaje emocional */}
        <Fade in={step === 3} timeout={400}>
          <Box>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: { xs: 3, sm: 5 }, 
                borderRadius: 2,
                borderColor: alpha('#000', 0.1),
                textAlign: 'center'
              }}
            >
              <CheckCircleIcon 
                sx={{ 
                  fontSize: { xs: 48, sm: 56 }, 
                  color: primaryColor,
                  mb: 2
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                ¡Tu música ya forma parte del movimiento!
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#000', 0.5), mb: 2, wordBreak: 'break-word' }}>
                {metadata.title} — {metadata.artist}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#000', 0.4) }}>
                Sonará en Guinea Ecuatorial y el mundo 🌍
              </Typography>
            </Paper>
          </Box>
        </Fade>
      </DialogContent>

      {/* Actions minimales y responsive */}
      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 }, 
        pt: { xs: 1, sm: 2 }, 
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        gap: { xs: 1, sm: 0 },
        borderTop: `1px solid ${alpha('#000', 0.05)}`
      }}>
        {step === 0 && (
          <Button 
            onClick={handleClose}
            size="small"
            fullWidth={true}
            sx={{ color: alpha('#000', 0.5) }}
          >
            Cancelar
          </Button>
        )}

        {step === 1 && (
          <>
            <Button 
              onClick={() => setStep(0)}
              size="small"
              fullWidth={true}
              sx={{ color: alpha('#000', 0.5) }}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!metadata.artist || !metadata.title}
              size="small"
              fullWidth={true}
              sx={{
                borderRadius: 1.5,
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              Subir
            </Button>
          </>
        )}

        {step === 3 && (
          <Button
            variant="contained"
            onClick={onClose}
            size="small"
            fullWidth={true}
            sx={{
              borderRadius: 1.5,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UploadModal;