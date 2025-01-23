import React, { useRef, useState } from "react";
import { IconButton, Typography, Box } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";

const AudioPlayer = ({ streamUrl }) => {
  const audioRef = useRef(null); // Referencia para el elemento de audio
  const [isPlaying, setIsPlaying] = useState(false); // Estado de reproducción
  const [error, setError] = useState(""); // Estado de errores

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Error al intentar reproducir el audio:", err);
        setError("No se pudo reproducir el audio.");
      });
      setIsPlaying(true);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <IconButton onClick={handlePlayPause} sx={{ color: "primary.main" }}>
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>
      <Typography variant="body2" color="textSecondary">
        {error || (isPlaying ? "Reproduciendo..." : "Pausado")}
      </Typography>
      <audio ref={audioRef} src={streamUrl} onEnded={() => setIsPlaying(false)} />
    </Box>
  );
};

export default AudioPlayer;
