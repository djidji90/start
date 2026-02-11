// components/DownloadProgress.jsx
import React from 'react';
import { 
  LinearProgress, 
  Box, 
  Typography,
  IconButton,
  Fade
} from '@mui/material';
import { Close, Download } from '@mui/icons-material';
import useDownload from '../components/hook/services/useDownload';

const DownloadProgress = () => {
  const { downloading, progress } = useDownload();
  
  // Encontrar todas las descargas activas
  const activeDownloads = Object.entries(downloading)
    .filter(([_, isDownloading]) => isDownloading)
    .map(([songId]) => ({
      songId,
      progress: progress[songId] || 0
    }));
  
  // Si no hay descargas activas, no mostrar
  if (activeDownloads.length === 0) {
    return null;
  }
  
  // Mostrar solo la primera descarga para simplificar
  const mainDownload = activeDownloads[0];
  
  return (
    <Fade in={true}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          bgcolor: 'background.paper',
          boxShadow: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <Download sx={{ mr: 1, color: 'primary.main' }} />
          
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <Typography variant="caption" display="block" color="text.secondary">
              Descargando...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={mainDownload.progress}
              sx={{ 
                height: 4,
                borderRadius: 2,
                mt: 0.5
              }}
            />
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              {mainDownload.progress}%
            </Typography>
          </Box>
          
          {activeDownloads.length > 1 && (
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                mr: 1
              }}
            >
              +{activeDownloads.length - 1}
            </Typography>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default React.memo(DownloadProgress);
