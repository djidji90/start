import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  CardMedia,
  Box,
  Snackbar,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Tooltip, // ✅ IMPORTADO - ANTES FALTABA
  Badge,
  alpha
} from "@mui/material";
import {
  GetApp,
  Comment,
  PlayArrow,
  Pause,
  Cancel as CancelIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Queue as QueueIcon,
} from "@mui/icons-material"; // ✅ CheckCircle existe? Si no, usa Check
import axios from "axios";
import { useConfig } from "../../hook/useConfig";
import CommentDialog from "./CommentDialog";
import LikeManager from "./LikeManager";
import useDownload from "../../hook/useDownload";

const SongCard = ({ song, onLikeToggle }) => {
  const { api: { baseURL } } = useConfig();
  
  // Hook de descarga optimizado
  const download = useDownload();
  
  const audioRef = useRef(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true); // ✅ Para evitar memory leaks

  const [isPlaying, setIsPlaying] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  // 🔥 ESTADOS CORREGIDOS
  const [downloaded, setDownloaded] = useState(false); // Estado REAL
  const [checkingStatus, setCheckingStatus] = useState(true); // Para loading
  const [downloadInfo, setDownloadInfo] = useState(null); // Info adicional

  const songId = song.id.toString();
  const isDownloading = download.downloading[songId];
  const downloadProgress = download.progress[songId] || 0;
  const downloadError = download.errors[songId];
  const queuePosition = download.getQueuePosition(songId);

  /* ================= VERIFICAR ESTADO REAL ================= */
  useEffect(() => {
    let isActive = true;
    
    const checkDownloadStatus = async () => {
      try {
        setCheckingStatus(true);
        
        // ✅ Usar la función async correctamente
        const status = await download.isDownloaded(songId);
        
        if (isActive) {
          setDownloaded(status);
          
          if (status) {
            // Si está descargada, obtener info adicional
            const info = download.getDownloadInfo(songId);
            setDownloadInfo(info);
          }
        }
      } catch (error) {
        console.error('Error checking download status:', error);
      } finally {
        if (isActive) {
          setCheckingStatus(false);
        }
      }
    };

    checkDownloadStatus();

    // ✅ Escuchar eventos para actualizar en tiempo real
    const handleDownloadComplete = (e) => {
      if (e.detail?.id === songId) {
        setDownloaded(true);
        setDownloadInfo(e.detail);
        setCheckingStatus(false);
      }
    };

    const handleDownloadsUpdated = () => {
      checkDownloadStatus();
    };

    window.addEventListener('download-completed', handleDownloadComplete);
    window.addEventListener('downloads-updated', handleDownloadsUpdated);

    return () => {
      isActive = false;
      window.removeEventListener('download-completed', handleDownloadComplete);
      window.removeEventListener('downloads-updated', handleDownloadsUpdated);
    };
  }, [download, songId]); // ✅ Dependencias correctas

  /* ================= CLEANUP ================= */
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      audioRef.current?.pause();
      audioRef.current = null;
      abortRef.current?.abort();
    };
  }, []);

  /* ================= STREAM ================= */
  const handleStream = useCallback(async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    try {
      abortRef.current = new AbortController();

      const { data } = await axios.get(
        `${baseURL}/api2/songs/${song.id}/stream/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          responseType: "blob",
          signal: abortRef.current.signal,
        }
      );

      const url = URL.createObjectURL(data);
      const audio = new Audio(url);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        if (mountedRef.current) {
          setSnackbar({
            open: true,
            message: "Error al reproducir la canción",
            severity: "error",
          });
        }
      };

      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      if (!axios.isCancel(err) && mountedRef.current) {
        setSnackbar({
          open: true,
          message:
            err.response?.status === 401
              ? "Debes iniciar sesión para reproducir"
              : "No se pudo reproducir",
          severity: "error",
        });
      }
    }
  }, [baseURL, song.id, isPlaying]);

  /* ================= DOWNLOAD ================= */
  const handleDownload = useCallback(async () => {
    try {
      setSnackbar({
        open: true,
        message: `Iniciando descarga: ${song.title}`,
        severity: "info",
      });

      const result = await download.downloadSong(
        songId,
        song.title,
        song.artist
      );

      if (mountedRef.current) {
        // ✅ Actualizar estado local
        setDownloaded(true);
        setDownloadInfo(result);
        
        setSnackbar({
          open: true,
          message: `✅ Descarga completada: ${song.title}`,
          severity: "success",
        });
      }

      console.log('Descarga exitosa:', result);

    } catch (error) {
      if (error.message.includes('cancelada') || !mountedRef.current) return;
      
      setSnackbar({
        open: true,
        message: `❌ Error: ${error.message}`,
        severity: "error",
      });
    }
  }, [download, songId, song.title, song.artist]);

  const handleCancelDownload = useCallback(() => {
    download.cancelDownload(songId);
    setSnackbar({
      open: true,
      message: `Descarga cancelada: ${song.title}`,
      severity: "warning",
    });
  }, [download, songId, song.title]);

  const handleRetryDownload = useCallback(() => {
    download.clearError(songId);
    handleDownload();
  }, [download, songId, handleDownload]);

  const handleRemoveFromHistory = useCallback(async () => {
    const success = await download.removeDownload(songId);
    if (success && mountedRef.current) {
      setDownloaded(false);
      setDownloadInfo(null);
      setSnackbar({
        open: true,
        message: `Eliminado del historial: ${song.title}`,
        severity: "info",
      });
    }
  }, [download, songId, song.title]);

  /* ================= RENDER BOTÓN DE DESCARGA ================= */
  const renderDownloadButton = () => {
    // Estado: Verificando
    if (checkingStatus) {
      return (
        <Tooltip title="Verificando estado...">
          <IconButton disabled size="small">
            <CircularProgress size={20} />
          </IconButton>
        </Tooltip>
      );
    }

    // Estado: Descargando
    if (isDownloading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`Cancelar descarga (${downloadProgress}%)`}>
            <IconButton onClick={handleCancelDownload} color="warning" size="small">
              <CancelIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress 
              variant="determinate" 
              value={downloadProgress} 
              size={30}
              color="warning"
            />
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography variant="caption" component="div" color="text.secondary">
                {`${Math.round(downloadProgress)}%`}
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    // Estado: En cola
    if (queuePosition) {
      return (
        <Tooltip title={`En cola: posición ${queuePosition}`}>
          <Badge badgeContent={queuePosition} color="warning">
            <IconButton disabled>
              <QueueIcon />
            </IconButton>
          </Badge>
        </Tooltip>
      );
    }

    // Estado: Error
    if (downloadError) {
      return (
        <Tooltip title={downloadError}>
          <IconButton onClick={handleRetryDownload} color="error" size="small">
            <ErrorIcon />
          </IconButton>
        </Tooltip>
      );
    }

    // ✅ ESTADO CORREGIDO: Usar variable local, no la promesa
    if (downloaded) {
      const fileSize = downloadInfo?.fileSize 
        ? (downloadInfo.fileSize / 1024 / 1024).toFixed(2) 
        : '?';
      
      // Mostrar ícono diferente según plataforma
      const storageIcon = downloadInfo?.storageType === 'cache' ? '📱' : '💾';
      
      return (
        <Tooltip title={`Descargada ${fileSize}MB ${storageIcon} - Click para eliminar`}>
          <IconButton onClick={handleRemoveFromHistory} color="success" size="small">
            <SuccessIcon />
          </IconButton>
        </Tooltip>
      );
    }

    // Estado: Por defecto
    return (
      <Tooltip title="Descargar canción">
        <IconButton onClick={handleDownload} size="small">
          <GetApp />
        </IconButton>
      </Tooltip>
    );
  };

  /* ================= IMAGE ================= */
  const cleanBaseURL = baseURL?.replace(/\/$/, "");
  const imageUrl = song.image
    ? song.image.startsWith("http")
      ? song.image.replace(
          `${cleanBaseURL}/media/`,
          `${cleanBaseURL}/api2/media/`
        )
      : `${cleanBaseURL}/api2/media/images/${song.image.split("/").pop()}`
    : "/djidji.png";

  /* ================= RENDER ================= */
  return (
    <Card sx={{ 
      maxWidth: 345, 
      m: 2, 
      borderRadius: 4, 
      boxShadow: isDownloading ? '0 0 0 2px #ff9800' : 
                 downloadError ? '0 0 0 2px #f44336' : 
                 downloaded ? '0 0 0 2px #4caf50' : 10,
      transition: 'all 0.3s ease',
      position: 'relative',
      opacity: checkingStatus ? 0.8 : 1
    }}>
      {/* Barra de progreso superior */}
      {isDownloading && (
        <LinearProgress 
          variant="determinate" 
          value={downloadProgress} 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            zIndex: 1
          }}
          color="warning"
        />
      )}

      {/* Badge de estado - AHORA USA downloaded EN VEZ DE isDownloaded */}
      {(isDownloading || queuePosition || downloadError || downloaded) && !checkingStatus && (
        <Chip
          label={
            isDownloading ? `${downloadProgress}%` :
            queuePosition ? `Cola ${queuePosition}` :
            downloadError ? 'Error' :
            'Descargada'
          }
          size="small"
          color={
            isDownloading ? 'warning' :
            queuePosition ? 'default' :
            downloadError ? 'error' :
            'success'
          }
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            fontWeight: 'bold'
          }}
        />
      )}

      {/* Skeleton mientras verifica */}
      {checkingStatus && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 4,
            zIndex: 2
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}

      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={song.title}
        sx={{
          opacity: isDownloading ? 0.7 : checkingStatus ? 0.5 : 1,
          filter: isDownloading ? 'blur(1px)' : 'none',
          transition: 'all 0.3s ease'
        }}
      />

      <CardContent>
        <Typography variant="h6" fontWeight={700}>
          {song.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {song.artist} · {song.genre}
        </Typography>
        
        {/* Información adicional si está descargada */}
        {downloaded && downloadInfo && (
          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
            📅 {new Date(downloadInfo.downloadedAt).toLocaleDateString()}
            {downloadInfo.storageType && ` • ${downloadInfo.storageType === 'cache' ? '📱 App' : '💾 PC'}`}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between" }}>
        <Box>
          <LikeManager
            songId={song.id}
            initialLikes={song.likes_count}
            initialLiked={song.is_liked}
            onLikeToggle={onLikeToggle}
          />

          {renderDownloadButton()}

          <IconButton onClick={() => setCommentsOpen(true)}>
            <Comment />
            <Typography variant="caption" ml={0.5}>
              {song.comments_count}
            </Typography>
          </IconButton>
        </Box>

        <IconButton
          color="primary"
          onClick={handleStream}
          disabled={checkingStatus}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      </CardActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <CommentDialog
        songId={song.id}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </Card>
  );
};

export default React.memo(SongCard);