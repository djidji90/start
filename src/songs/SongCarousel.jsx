// src/components/songs/SongCarousel.jsx - VERSIÓN VERTICAL
import React from "react";
import { 
  Grid, 
  Box, 
  Typography 
} from "@mui/material";
import SongCard from "../songs/SongCard";

const SongCarousel = ({ songs = [], title }) => {
  if (!songs.length) return null;

  const handleLike = (songId, liked) => {
    console.log(
      `❤️ Canción ${liked ? "liked" : "unliked"}:`,
      songId
    );
  };

  const handleMoreActions = (song) => {
    console.log("Más opciones:", song);
  };

  return (
    <Box sx={{ mb: 6 }}>
      {/* Header opcional */}
      {title && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#1B5E20"
            }}
          >
            {title}
          </Typography>
        </Box>
      )}

      {/* Grid vertical responsivo */}
      <Grid container spacing={2}>
        {songs.map((song, index) => (
          <Grid 
            item 
            key={`${song.id}-${index}-${song.title || ''}-${song.artist || ''}`}
            xs={12}
            sm={6}
            md={4}
            lg={3}
          >
            <SongCard
              song={song}
              variant="default"
              showIndex={index + 1}
              onLike={handleLike}
              onMoreActions={() => handleMoreActions(song)}
              sx={{
                height: "100%",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SongCarousel;