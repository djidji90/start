// src/components/playlists/PlaylistsSection.jsx
// ============================================
// 🎵 PLAYLISTS SECTION — VERTICAL SCROLL
// ✅ Grid uniforme responsivo
// ✅ Sin carrusel horizontal
// ✅ Apple-style premium
// ============================================

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  Fade,
  alpha,
  Skeleton,
} from "@mui/material";

import useSmartPlaylists from "../../components/hook/services/useSmartPlaylists";
import PlaylistCard from "./PlaylistCard";

const FALLBACK_COVER = "/muneeb-s-4_M8uIfPEZw-unsplash.jpg";

const PlaylistsSection = ({ onPlayPlaylist }) => {
  const theme = useTheme();
  const sectionRef = useRef(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const { playlists, loading, getStream } = useSmartPlaylists({
    autoFetch: true,
  });

  const notify = (message) =>
    setSnackbar({ open: true, message });

  const handlePlay = useCallback(
    async (playlist) => {
      try {
        const data = await getStream(playlist);

        onPlayPlaylist?.(
          data?.songs || [],
          playlist?.name || "Playlist"
        );
      } catch (err) {
        console.error(err);
        notify("No se pudo cargar la playlist");
      }
    },
    [getStream, onPlayPlaylist]
  );

  const hero = useMemo(() => {
    const first = playlists?.[0];

    return {
      title: "Playlists",
      subtitle:
        first?.description ||
        "Descubre música creada para cada momento",
      image: first?.cover_url || FALLBACK_COVER,
      count: playlists?.length || 0,
    };
  }, [playlists]);

  // ───────────────── LOADING ─────────────────
  if (loading) {
    return (
      <Box sx={{ mb: 6 }}>
        <Skeleton
          variant="rectangular"
          height={240}
          sx={{ borderRadius: 4, mb: 3 }}
        />

        {/* Grid skeleton */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              sx={{
                aspectRatio: "4 / 3",
                borderRadius: 3,
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // ───────────────── RENDER ─────────────────
  return (
    <Box ref={sectionRef} sx={{ mb: 8 }}>

      {/* ================= HERO ================= */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 5,
          overflow: "hidden",
          mb: 4,
          height: { xs: 170, sm: 240, md: 280 },
          display: "flex",
          alignItems: "flex-end",
          p: { xs: 2, sm: 3 },
          backgroundImage: `url(${hero.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1))",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            fontWeight={900}
            sx={{
              color: "#fff",
              fontSize: { xs: "1.2rem", sm: "1.6rem" },
            }}
          >
            {hero.title}
          </Typography>

          <Typography
            sx={{
              color: alpha("#fff", 0.8),
              fontSize: "0.85rem",
              mt: 0.5,
            }}
          >
            {hero.subtitle}
          </Typography>

          <Typography
            sx={{
              color: alpha("#fff", 0.6),
              fontSize: "0.7rem",
              mt: 1,
            }}
          >
            {hero.count} playlists disponibles
          </Typography>
        </Box>
      </Box>

      {/* ================= GRID UNIFORME (TODOS LOS DISPOSITIVOS) ================= */}
      <Fade in timeout={300}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",        // móvil: 2 columnas
              sm: "1fr 1fr",        // tablet pequeña: 2 columnas
              md: "1fr 1fr 1fr",    // tablet: 3 columnas
              lg: "1fr 1fr 1fr 1fr", // desktop: 4 columnas
            },
            gap: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        >
          {playlists?.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onPlay={handlePlay}
            />
          ))}
        </Box>
      </Fade>

      {/* ================= EMPTY STATE ================= */}
      {!loading && playlists?.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" fontWeight={600}>
            No hay playlists aún
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Las nuevas playlists aparecerán aquí
          </Typography>
        </Box>
      )}

      {/* ================= SNACKBAR ================= */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() =>
          setSnackbar({ open: false, message: "" })
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlaylistsSection;