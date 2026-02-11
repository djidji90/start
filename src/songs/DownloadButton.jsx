// components/DownloadButton.jsx
import React from 'react';
import { 
  Download, 
  CheckCircle, 
  Error as ErrorIcon,
  PauseCircle 
} from '@mui/icons-material';
import { 
  IconButton, 
  Tooltip, 
  CircularProgress,
  Box 
} from '@mui/material';
import useDownload from '../components/hook/services/useDownload';

const DownloadButton = ({ song, size = 'medium', showLabel = false }) => {
  const { 
    downloadSong, 
    downloading, 
    progress, 
    isDownloaded,
    errors,
    cancelDownload,
    clearError 
  } = useDownload();
  
  const songId = song?.id;
  const songTitle = song?.title || 'Canción';
  const artistName = song?.artist || 'Artista';
  
  // Estados
  const isDownloading = downloading[songId];
  const isAlreadyDownloaded = isDownloaded(songId);
  const currentProgress = progress[songId] || 0;
  const error = errors[songId];
  
  // Manejar clic
  const handleClick = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (error) {
      clearError(songId);
      return;
    }
    
    if (isDownloading) {
      cancelDownload(songId);
      return;
    }
    
    if (!isAlreadyDownloaded && !isDownloading) {
      downloadSong(songId, songTitle, artistName).catch(() => {
        // Error ya manejado en el hook
      });
    }
  };
  
  // Determinar tooltip
  let tooltipText = 'Descargar para escuchar sin conexión';
  let iconColor = 'default';
  
  if (error) {
    tooltipText = `Error: ${error}`;
    iconColor = 'error';
  } else if (isDownloading) {
    tooltipText = `Descargando... ${currentProgress}% (Click para cancelar)`;
    iconColor = 'warning';
  } else if (isAlreadyDownloaded) {
    tooltipText = 'Ya descargada ✓';
    iconColor = 'success';
  }
  
  // Determinar icono
  const getIcon = () => {
    if (error) {
      return <ErrorIcon fontSize={size} />;
    }
    
    if (isDownloading) {
      if (currentProgress > 0) {
        return (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress 
              variant="determinate" 
              value={currentProgress} 
              size={size === 'small' ? 20 : 24}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PauseCircle fontSize={size === 'small' ? 'inherit' : size} />
            </Box>
          </Box>
        );
      }
      return <CircularProgress size={size === 'small' ? 20 : 24} />;
    }
    
    if (isAlreadyDownloaded) {
      return <CheckCircle fontSize={size} />;
    }
    
    return <Download fontSize={size} />;
  };
  
  // Si no hay song, no renderizar
  if (!songId) return null;
  
  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <IconButton
        onClick={handleClick}
        disabled={isAlreadyDownloaded && !error}
        size={size}
        color={iconColor}
        sx={{
          position: 'relative',
          '&:hover': {
            transform: !isDownloading ? 'scale(1.1)' : 'none',
            transition: 'transform 0.2s'
          }
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default React.memo(DownloadButton);

