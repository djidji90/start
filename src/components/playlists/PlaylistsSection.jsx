// ============================================
// 🎵 PLAYLISTS SECTION — APPLE LEVEL FINAL
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

// ============================================
// 🎵 SECTION COMPONENT
// ============================================

const PlaylistsSection = ({ onPlayPlaylist }) => {
  const theme = useTheme();
  const sectionRef = useRef(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const {
    playlists,
    loading,
    getStream,
    clearFilter,
  } = useSmartPlaylists({ autoFetch: true });

  const notify = (message) =>
    setSnackbar({ open: true, message });

  // ============================================
  // 🎯 PLAY HANDLER
  // ============================================
  const handlePlay = useCallback(
    async (playlist) => {
      try {
        const data = await getStream(playlist);

        onPlayPlaylist?.(
          data?.songs || [],
          playlist?.name || "Playlist"
        );
      } catch (err) {
        console.error("Playlist load error:", err);
        notify("No se pudo cargar la playlist");
      }
    },
    [getStream, onPlayPlaylist]
  );

  // ============================================
  // 🎯 HERO (APPLE STYLE SIMPLE)
  // ============================================
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

  // ============================================
  // 🎨 RENDER SKELETON
  // ============================================
  if (loading) {
    return (
      <Box sx={{ mb: 6 }}>
        <Skeleton
          variant="rectangular"
          height={220}
          sx={{ borderRadius: 4, mb: 3 }}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={220}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // ============================================
  // 🎨 RENDER MAIN
  // ============================================
  return (
    <Box ref={sectionRef} sx={{ mb: 8 }}>

      {/* ================= HERO ================= */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 5,
          overflow: "hidden",
          mb: 4,
          height: { xs: 200, sm: 240, md: 280 },
          display: "flex",
          alignItems: "flex-end",
          p: 3,
          backgroundImage: `url(${hero.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* overlay estilo Apple */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.15))",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {hero.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: alpha("#fff", 0.8),
              mt: 0.5,
              maxWidth: 300,
            }}
          >
            {hero.subtitle}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: alpha("#fff", 0.7),
              mt: 1,
              display: "block",
            }}
          >
            {hero.count} playlists disponibles
          </Typography>
        </Box>
      </Box>

      {/* ================= GRID ================= */}
      <Fade in timeout={300}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {playlists?.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={{
                ...playlist,
                cover_url:
                  playlist.cover_url || FALLBACK_COVER,
              }}
              onPlay={handlePlay}
            />
          ))}
        </Box>
      </Fade>

      {/* ================= EMPTY STATE ================= */}
      {!loading && playlists?.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            opacity: 0.7,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            No hay playlists aún
          </Typography>
          <Typography variant="body2">
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
      >
        <Alert severity="info" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlaylistsSection;