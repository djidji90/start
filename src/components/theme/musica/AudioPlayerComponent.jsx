// AudioPlayerComponent.jsx
import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";

const AudioPlayerComponent = ({ song }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef(new Audio(song.file_url));

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  React.useEffect(() => {
    audioRef.current = new Audio(song.file_url);
  }, [song]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Reproductor de Audio</Typography>
      <Typography variant="body1">{song.title} - {song.artist}</Typography>
      <Box mt={2}>
        <IconButton onClick={handleTogglePlay}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default AudioPlayerComponent;
