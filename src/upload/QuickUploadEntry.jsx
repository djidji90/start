// components/upload/QuickUploadEntry.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  Box,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Fade,
  alpha,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Close as CloseIcon,
  MusicNote as MusicNoteIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import UploadButton from './UploadButton';
import { useLocalStorage } from "../components/hook/services/useLocalStorage";
import { styled } from '@mui/material/styles';

// Componente estilizado
const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const QuickUploadEntry = ({ 
  showRecentUploads = true,
  maxHeight = 400,
  variant = 'outlined',
  onUploadSuccess,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [recentUploads, setRecentUploads] = useLocalStorage('dji_recent_uploads', []);
  const [showUploadComplete, setShowUploadComplete] = useState(false);
  const [lastUpload, setLastUpload] = useState(null);

  // Cargar uploads recientes al inicio
  useEffect(() => {
    const saved = localStorage.getItem('dji_recent_uploads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Limitar a últimos 3 uploads y filtrar por fecha (últimos 7 días)
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recent = parsed
          .filter(u => u.timestamp > weekAgo)
          .slice(0, 3);
        setRecentUploads(recent);
      } catch (e) {
        console.warn('Error cargando uploads recientes:', e);
      }
    }
  }, []);

  const handleUploadSuccess = (result) => {
    console.log('✅ Upload exitoso desde home:', result);
    
    // Guardar en historial local
    const uploadEntry = {
      id: result.uploadId,
      title: result.song?.title || result.metadata?.fileName || 'Canción subida',
      artist: result.song?.artist || 'Tú',
      timestamp: Date.now(),
      date: new Date().toLocaleDateString(),
      success: true,
    };

    const updated = [uploadEntry, ...recentUploads].slice(0, 5);
    setRecentUploads(updated);
    setLastUpload(uploadEntry);
    
    // Mostrar feedback de éxito
    setShowUploadComplete(true);
    setOpen(false);
    
    // Notificar al padre
    onUploadSuccess?.(result);
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      setShowUploadComplete(false);
    }, 5000);
  };

  const handleCloseUpload = () => {
    setOpen(false);
    setShowUploadComplete(false);
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'hace un momento';
    if (diff < 3600000) return `hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)} h`;
    if (diff < 604800000) return `hace ${Math.floor(diff / 86400000)} días`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Versión compacta para mobile
  if (compact) {
    return (
      <Fade in timeout={500}>
        <Box sx={{ position: 'relative' }}>
          <Tooltip title="Subir canción">
            <IconButton
              color="primary"
              onClick={() => setOpen(true)}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <UploadIcon />
            </IconButton>
          </Tooltip>

          <Collapse in={open}>
            <Box sx={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, mt: 1, minWidth: 300 }}>
              <Card elevation={4}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Subir canción</Typography>
                    <IconButton size="small" onClick={handleCloseUpload}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <UploadButton
                    fullWidth
                    onUploadSuccess={handleUploadSuccess}
                    metadata={{ source: 'home_mobile_upload' }}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Box>
          </Collapse>
        </Box>
      </Fade>
    );
  }

  return (
    <>
      {/* Mensaje de éxito temporal */}
      {showUploadComplete && lastUpload && (
        <Fade in timeout={300}>
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            onClose={() => setShowUploadComplete(false)}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2">
              ¡{lastUpload.title} subida exitosamente!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tu canción está siendo procesada y pronto estará disponible.
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Componente principal */}
      <StyledCard variant={variant} sx={{ maxHeight, overflow: 'hidden' }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MusicNoteIcon color="primary" sx={{ mr: 1.5 }} />
            <Box flex={1}>
              <Typography variant="h6" fontWeight={600}>
                Comparte tu música
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sube tus canciones y llega a miles de oyentes
              </Typography>
            </Box>
            
            {open && (
              <IconButton size="small" onClick={handleCloseUpload}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {/* Contenido principal */}
          {!open ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                ¿Eres artista o productor? Sube tu música y forma parte de la comunidad DjidjiMusic
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setOpen(true)}
                size="large"
                sx={{
                  borderRadius: 20,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Comenzar a subir
              </Button>

              {/* Uploads recientes (si hay) */}
              {showRecentUploads && recentUploads.length > 0 && (
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    TUS ÚLTIMAS SUBIDAS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                    {recentUploads.map((upload, index) => (
                      <Tooltip 
                        key={upload.id || index} 
                        title={`${upload.title} - ${formatTimeAgo(upload.timestamp)}`}
                      >
                        <Chip
                          size="small"
                          label={upload.title}
                          color="primary"
                          variant="outlined"
                          icon={<CheckCircleIcon fontSize="small" />}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Collapse in={open} timeout={300}>
              <Box sx={{ py: 2 }}>
                <UploadButton
                  fullWidth
                  onUploadSuccess={handleUploadSuccess}
                  metadata={{ 
                    source: 'home_quick_upload',
                    entryPoint: 'main_page_card',
                  }}
                  size="large"
                  variant="contained"
                  showDetails={true}
                />
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Formatos: MP3, WAV, FLAC, OGG, M4A • Máx: 100MB
                </Typography>
              </Box>
            </Collapse>
          )}
        </CardContent>
      </StyledCard>
    </>
  );
};

// Props y valores por defecto
QuickUploadEntry.defaultProps = {
  showRecentUploads: true,
  maxHeight: 400,
  variant: 'outlined',
  compact: false,
};

QuickUploadEntry.propTypes = {
  showRecentUploads: PropTypes.bool,
  maxHeight: PropTypes.number,
  variant: PropTypes.oneOf(['outlined', 'elevation']),
  onUploadSuccess: PropTypes.func,
  compact: PropTypes.bool,
};

export default QuickUploadEntry;