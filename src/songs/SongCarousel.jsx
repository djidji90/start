import React, { useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";
import SongCard from "../songs/SongCard";

const SongCarousel = ({ songs = [], title }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === "left"
      ? -clientWidth * 0.9
      : clientWidth * 0.9;

    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth"
    });
  };

  if (!songs.length) return null;

  return (
    <Box sx={{ position: "relative", mb: 6 }}>
      {/* Header opcional */}
      {title && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1B5E20"
            }}
          >
            {title}
          </Typography>
        </Box>
      )}

      {/* Botón izquierda */}
      <IconButton
        onClick={() => scroll("left")}
        sx={{
          position: "absolute",
          left: -18,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: "white",
          border: "1px solid #E0E0E0",
          boxShadow: "0 2px 8px rgba(0,0,0,.1)",
          "&:hover": {
            bgcolor: "#F5F5F5"
          }
        }}
      >
        <ChevronLeft />
      </IconButton>

      {/* Carrusel */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          px: 1
        }}
      >
        {songs.map((song, index) => (
          <Box
            key={song.id || index}
            sx={{
              minWidth: {
                xs: "85%",
                sm: "45%",
                md: "30%"
              },
              scrollSnapAlign: "start"
            }}
          >
            <SongCard
              song={song}
              variant="default"
              showIndex={index + 1}
              onLike={(songId, liked) => {
                console.log(
                  `❤️ Canción ${liked ? "liked" : "unliked"}:`,
                  songId
                );
              }}
              onMoreActions={(song) => {
                console.log("Más opciones:", song);
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Botón derecha */}
      <IconButton
        onClick={() => scroll("right")}
        sx={{
          position: "absolute",
          right: -18,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: "white",
          border: "1px solid #E0E0E0",
          boxShadow: "0 2px 8px rgba(0,0,0,.1)",
          "&:hover": {
            bgcolor: "#F5F5F5"
          }
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

export default SongCarousel;
