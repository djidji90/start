// ============================================
// components/test/DownloadContextTest.jsx
// Componente para probar el contexto de forma aislada
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { DownloadProvider, useDownloadContext } from '../../context/DownloadContext';

// Componente hijo que usa el contexto
const DownloadTester = () => {
  const download = useDownloadContext();
  const [testSongs, setTestSongs] = useState([
    { id: '70', title: 'merci beaucoup', artist: 'pop_smoke', selected: false },
    { id: '69', title: 'three little birds', artist: 'bob marley', selected: false },
    { id: '65', title: 'soso', artist: 'omalay', selected: false },
    { id: '62', title: 'sonita', artist: 'vesmaly', selected: false },
    { id: '61', title: 'te quiero', artist: 'nico y mamita', selected: false }
  ]);

  // Verificar instancia única
  useEffect(() => {
    console.log('🔍 [DownloadTester] Usando instancia:', window.__DOWNLOAD_INSTANCE_ID__);
  }, []);

  const handleDownload = (song) => {
    download.downloadSong(song.id, song.title, song.artist)
      .then(result => {
        console.log(`✅ ${song.title} completada:`, result);
      })
      .catch(error => {
        if (!error.message.includes('cancelada')) {
          console.error(`❌ ${song.title}:`, error.message);
        }
      });
  };

  const handleDownloadAll = () => {
    testSongs.forEach(song => {
      handleDownload(song);
    });
  };

  const handleCancelAll = () => {
    // Cancelar activas
    Object.keys(download.downloading).forEach(id => {
      download.cancelDownload(id);
    });
    // Vaciar cola
    download.queue.forEach(item => {
      download.cancelDownload(item.songId);
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Test Aislado - DownloadContext
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Instancia ID:</strong> {window.__DOWNLOAD_INSTANCE_ID__ || 'Cargando...'}
      </Alert>

      <Grid container spacing={3}>
        {/* Panel de control */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              🎮 Panel de Control
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDownloadAll}
                fullWidth
              >
                Descargar Todas (5)
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleCancelAll}
                fullWidth
              >
                Cancelar Todo
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              📊 Estado Actual:
            </Typography>
            
            <Box sx={{ mb: 1 }}>
              <Chip 
                label={`Activas: ${Object.keys(download.downloading).length}`}
                color="warning"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Cola: ${download.queue.length}`}
                color="info"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Errores: ${Object.keys(download.errors).length}`}
                color="error"
                size="small"
              />
            </Box>

            {Object.keys(download.downloading).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Progreso:
                </Typography>
                {Object.entries(download.progress).map(([id, prog]) => (
                  <Box key={id} sx={{ mt: 1 }}>
                    <Typography variant="caption">
                      ID {id}: {prog}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={prog} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {download.queue.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  En cola:
                </Typography>
                {download.queue.map((item, i) => (
                  <Box key={item.songId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip label={i+1} size="small" />
                    <Typography variant="body2">{item.songTitle}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Lista de canciones */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            🎵 Canciones de Prueba
          </Typography>
          
          <Grid container spacing={2}>
            {testSongs.map(song => {
              const isDownloading = download.downloading[song.id];
              const progress = download.progress[song.id];
              const error = download.errors[song.id];
              const isDownloaded = download.isDownloaded(song.id);
              const queuePos = download.getQueuePosition(song.id);
              
              return (
                <Grid item xs={12} key={song.id}>
                  <Card variant="outlined" sx={{ 
                    bgcolor: isDownloading ? '#fff3e0' : 
                             error ? '#ffebee' :
                             isDownloaded ? '#e8f5e9' : 'white'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">
                            {song.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {song.artist} • ID: {song.id}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {queuePos && (
                            <Chip label={`Cola: ${queuePos}`} size="small" color="info" />
                          )}
                          
                          {isDownloading && (
                            <Chip 
                              label={`${progress}%`} 
                              size="small" 
                              color="warning"
                            />
                          )}
                          
                          {error && (
                            <Chip 
                              label="Error" 
                              size="small" 
                              color="error"
                            />
                          )}
                          
                          {isDownloaded && (
                            <Chip 
                              label="Descargada" 
                              size="small" 
                              color="success"
                            />
                          )}

                          <Button
                            variant={isDownloading ? "outlined" : "contained"}
                            color={isDownloading ? "error" : "primary"}
                            size="small"
                            onClick={() => isDownloading ? 
                              download.cancelDownload(song.id) : 
                              handleDownload(song)
                            }
                            disabled={isDownloaded}
                          >
                            {isDownloading ? 'Cancelar' : 'Descargar'}
                          </Button>
                        </Box>
                      </Box>

                      {isDownloading && (
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      {/* Segunda instancia de prueba (debería compartir el mismo estado) */}
      <Paper sx={{ mt: 4, p: 2, bgcolor: '#e3f2fd' }}>
        <Typography variant="h6" gutterBottom>
          🔄 Segunda Instancia (Comparte Estado)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Esta sección usa el MISMO contexto. Debería reflejar el mismo estado.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => handleDownload(testSongs[0])}
            size="small"
          >
            Descargar {testSongs[0].title}
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => download.cancelDownload(testSongs[0].id)}
            size="small"
          >
            Cancelar
          </Button>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Estado desde segunda instancia:
          </Typography>
          <Typography variant="body2">
            Activas: {Object.keys(download.downloading).length} | 
            Cola: {download.queue.length} | 
            Progreso: {JSON.stringify(download.progress)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

// Componente wrapper con el provider
const DownloadContextTest = () => {
  const [key, setKey] = useState(0); // Para forzar re-render si es necesario

  return (
    <DownloadProvider key={key}>
      <DownloadTester />
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => setKey(k => k + 1)}
        >
          Reinizar Provider
        </Button>
      </Box>
    </DownloadProvider>
  );
};

export default DownloadContextTest;