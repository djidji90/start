// src/components/playlists/PlaylistSkeleton.jsx
// ============================================
// 🎵 SKELETON — PLAYLIST CARD
// ============================================

import React from "react";
import { Box, Skeleton, alpha, useTheme } from "@mui/material";

/**
 * PlaylistSkeleton
 * Muestra N tarjetas fantasma mientras cargan las playlists.
 *
 * @param {number} count  - Cuántas tarjetas mostrar (default: 6)
 */
const PlaylistSkeleton = ({ count = 6 }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(6, 1fr)",
        },
        gap: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            // Entrada escalonada
            opacity: 0,
            animation: "skeletonFadeIn 0.4s ease forwards",
            animationDelay: `${i * 60}ms`,
            "@keyframes skeletonFadeIn": {
              to: { opacity: 1 },
            },
          }}
        >
          {/* Cover */}
          <Skeleton
            variant="rectangular"
            width="100%"
            sx={{ aspectRatio: "1 / 1" }}
            animation="wave"
          />

          <Box sx={{ p: 1.5 }}>
            {/* Nombre */}
            <Skeleton variant="text" width="80%" height={18} animation="wave" />
            {/* Tipo */}
            <Skeleton variant="text" width="50%" height={14} animation="wave" sx={{ mt: 0.5 }} />
            {/* Canciones */}
            <Skeleton variant="text" width="35%" height={12} animation="wave" sx={{ mt: 0.5 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default PlaylistSkeleton;