import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
  useTheme,
  styled,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Close, CloudUpload, MusicNote, Image } from '@mui/icons-material';
import axios from 'axios';

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

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    width: '100%',
    maxWidth: '600px',
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[10],
  },
}));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const UploadSongModal = ({ open, onClose, onUploadSuccess }) => {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    duration: '',
  });
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState({ open: false, severity: 'info', message: '' });

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Header con token de autorización (Bearer)
  const getAuthHeader = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken") || ''}`
  }), []);

  // Mapa de errores comunes
  const errorMap = useMemo(() => ({
    401: "Sesión expirada - Por favor vuelva a iniciar sesión",
    403: "No tienes permiso para esta acción",
    404: "Recurso no encontrado",
    429: "solo puedes subir 5 canciones cada hora",
    ECONNABORTED: "Timeout - El servidor no respondió a tiempo",
    "Network Error": "Error de conexión - Verifique su internet",
  }), []);

  const handleError = useCallback((error) => {
    if (axios.isCancel(error)) return;

    const errorMessage = errorMap[error.response?.status] ||
                         errorMap[error.code] ||
                         errorMap[error.message] ||
                         "Error desconocido";
    
    setErrors(prev => ({
      ...prev,
      server: errorMessage
    }));
    setFeedback({ open: true, severity: 'error', message: errorMessage });
  }, [errorMap]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación inmediata:
    let error = null;
    if (value.trim() === '') {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} es requerido`;
    } else if (name === 'title' && value.length > 255) {
      error = 'El título no puede exceder 255 caracteres';
    } else if (name === 'artist' && value.length > 255) {
      error = 'El artista no puede exceder 255 caracteres';
    } else if (name === 'genre' && value.length > 100) {
      error = 'El género no puede exceder 100 caracteres';
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setErrors(prev => ({ ...prev, file: 'Selecciona un archivo de audio' }));
      return;
    }

    const validExtensions = ['.mp3', '.wav', '.ogg', '.webm', '.m4a'];
    const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setErrors(prev => ({
        ...prev,
        file: 'Formato de archivo no soportado'
      }));
      setFile(null);
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        file: 'El archivo excede el límite de 20MB'
      }));
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setErrors(prev => ({ ...prev, file: null }));

    // Extraer duración si es posible
    if (window.FileReader) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const audio = new Audio(e.target.result);
        audio.onloadedmetadata = function() {
          setFormData(prev => ({
            ...prev,
            duration: Math.round(audio.duration)
          }));
        };
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (!selectedImage) {
      setImage(null);
      setErrors(prev => ({ ...prev, image: null }));
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(selectedImage.type)) {
      setErrors(prev => ({
        ...prev,
        image: 'Formato de imagen no soportado (solo JPG, PNG, WEBP)'
      }));
      setImage(null);
      return;
    }

    if (selectedImage.size > 2 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'La imagen excede el límite de 2MB'
      }));
      setImage(null);
      return;
    }

    // Previsualización
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage({
        file: selectedImage,
        preview: e.target.result,
      });
      setErrors(prev => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(selectedImage);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.artist.trim()) newErrors.artist = 'El artista es requerido';
    if (!formData.genre.trim()) newErrors.genre = 'El género es requerido';
    if (!file) newErrors.file = 'Selecciona un archivo de audio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrors(prev => ({ ...prev, server: null }));

    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist', formData.artist);
    data.append('genre', formData.genre);
    if (formData.duration) data.append('duration', formData.duration);
    data.append('file', file);
    if (image?.file) data.append('image', image.file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api2/songs/`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeader(),
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setFeedback({ open: true, severity: 'success', message: 'Canción subida exitosamente!' });
      onUploadSuccess(response.data);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error uploading song:', error);
      handleError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      genre: '',
      duration: '',
    });
    setFile(null);
    setImage(null);
    setErrors({});
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  const handleFeedbackClose = () => {
    setFeedback(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <StyledDialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            Sube tu Nueva Canción
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={isUploading}
            sx={{ color: theme.palette.text.secondary }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ my: 1 }} />

        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Título"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  disabled={isUploading}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Artista"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  error={!!errors.artist}
                  helperText={errors.artist}
                  disabled={isUploading}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Género"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  error={!!errors.genre}
                  helperText={errors.genre}
                  disabled={isUploading}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Duración (segundos)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  disabled={isUploading}
                  InputProps={{
                    endAdornment: (
                      <Typography variant="body2" color="text.secondary">
                        seg
                      </Typography>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Sección archivo de audio */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Archivo de audio*
                    </Typography>
                    <Button
                      component="label"
                      variant="outlined"
                      color="primary"
                      startIcon={<MusicNote />}
                      fullWidth
                      disabled={isUploading}
                      sx={{
                        py: 2,
                        borderStyle: 'dashed',
                        borderWidth: file ? '1px' : '2px',
                        backgroundColor: file ? theme.palette.action.selected : 'inherit',
                      }}
                    >
                      {file ? file.name : 'Seleccionar archivo'}
                      <VisuallyHiddenInput
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".mp3,.wav,.ogg,.webm,.m4a"
                      />
                    </Button>
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.file}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Formatos soportados: MP3, WAV, OGG, WEBM, M4A. Máx. 20MB
                    </Typography>
                  </Box>

                  {/* Sección imagen */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Imagen de portada (opcional)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        src={image?.preview}
                        variant="rounded"
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: theme.palette.grey[200],
                        }}
                      >
                        <Image fontSize="large" color="disabled" />
                      </Avatar>
                      <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        startIcon={<Image />}
                        disabled={isUploading}
                      >
                        {image ? 'Cambiar' : 'Añadir'}
                        <VisuallyHiddenInput
                          type="file"
                          ref={imageInputRef}
                          onChange={handleImageChange}
                          accept="image/jpeg,image/png,image/webp"
                        />
                      </Button>
                    </Box>
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.image}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Formatos soportados: JPG, PNG, WEBP. Máx. 2MB
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {isUploading && (
              <Box sx={{ width: '100%', mt: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" textAlign="center" mt={1}>
                  Subiendo {uploadProgress}%
                </Typography>
              </Box>
            )}

            {errors.server && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {errors.server}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <Divider sx={{ my: 1 }} />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isUploading}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={
              isUploading ||
              !file ||
              Object.values(errors).some(error => error !== null)
            }
            startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {isUploading ? 'Subiendo...' : 'Subir Canción'}
          </Button>
        </DialogActions>
      </StyledDialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={handleFeedbackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleFeedbackClose} severity={feedback.severity} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UploadSongModal;
