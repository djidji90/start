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
} from "@mui/material";
import { GetApp, Comment, PlayArrow, Pause } from "@mui/icons-material";
import axios from "axios";
import { useConfig } from "../../hook/useConfig";
import CommentDialog from "./CommentDialog";
import LikeManager from "./LikeManager";

const SongCard = ({ song, onLikeToggle }) => {
  const { api: { baseURL } } = useConfig();

  const audioRef = useRef(null);
  const abortRef = useRef(null);
  const cancelDownloadRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      abortRef.current?.abort();
      cancelDownloadRef.current?.cancel();
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
        setSnackbar({
          open: true,
          message: "Error al reproducir la canción",
          severity: "error",
        });
      };

      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      if (!axios.isCancel(err)) {
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
    if (downloading) return;

    setDownloading(true);
    cancelDownloadRef.current = axios.CancelToken.source();

    try {
      const { data } = await axios.get(
        `${baseURL}/api2/songs/${song.id}/download/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          responseType: "blob",
          cancelToken: cancelDownloadRef.current.token,
          onDownloadProgress: (e) => {
            if (e.total) {
              setDownloadProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        }
      );

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${song.title.replace(/[^a-z0-9]/gi, "_")}.webm`;
      link.click();
      URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "Descarga completada",
        severity: "success",
      });
    } catch (err) {
      if (!axios.isCancel(err)) {
        setSnackbar({
          open: true,
          message:
            err.response?.status === 401
              ? "Inicia sesión para descargar"
              : "Error en la descarga",
          severity: "error",
        });
      }
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  }, [baseURL, song.id, song.title, downloading]);

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
    <Card sx={{ maxWidth: 345, m: 2, borderRadius: 4, boxShadow: 10 }}>
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={song.title}
      />

      <CardContent>
        <Typography variant="h6" fontWeight={700}>
          {song.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {song.artist} · {song.genre}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between" }}>
        <Box>
          <LikeManager
            songId={song.id}
            initialLikes={song.likes_count}
            initialLiked={song.is_liked}
            onLikeToggle={onLikeToggle}
          />

          <IconButton onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <CircularProgress size={22} value={downloadProgress} />
            ) : (
              <GetApp />
            )}
          </IconButton>

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
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      </CardActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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
  