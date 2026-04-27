// src/components/playlists/PlaylistGrid.jsx
// ============================================
// 🎵 GRILLA — PLAYLISTS CURADAS
// ============================================

import React from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import PlaylistCard    from "./PlaylistCard";
import PlaylistSkeleton from "./PlaylistSkeleton";

// Etiquetas legibles para cada grupo
const GROUP_TITLES = {
  featured:    "✨ Destacadas",
  mood:        "🎭 Por Estado de Ánimo",
  temporal:    "⏳ Temporales",
  nicho:       "🎯 De Nicho",
  generica:    "🎵 Generales",
  promocional: "🚀 Promocionales",
};

// Orden en que aparecen los grupos
const GROUP_ORDER = ["featured", "mood", "temporal", "nicho", "generica", "promocional"];

// ─── Sub-componente: fila de grupo ────────────────────────────────────────────
const GroupRow = ({ groupKey, playlists, onPlay, onSave, savedIds, savingId }) => {
  const theme = useTheme();
  if (!playlists?.length) return null;

  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{
          mb: 2,
          fontSize: "0.9rem",
          color: alpha(theme.palette.text.primary, 0.85),
          letterSpacing: "0.02em",
        }}
      >
        {GROUP_TITLES[groupKey] ?? groupKey}
      </Typography>

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
        {playlists.map((playlist, i) => (
          <Box
            key={playlist.id}
            sx={{
              opacity: 0,
              animation: "cardIn 0.35s ease forwards",
              animationDelay: `${i * 50}ms`,
              "@keyframes cardIn": {
                from: { opacity: 0, transform: "translateY(10px)" },
                to:   { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <PlaylistCard
              playlist={playlist}
              onPlay={onPlay}
              onSave={onSave}
              isSaved={savedIds.has(String(playlist.id))}
              savingId={savingId}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * PlaylistGrid
 *
 * @param {Array}    playlists   - Array plano (modo flat)
 * @param {Object}   grouped     - Objeto agrupado { featured: [], mood: [], ... } (modo grouped)
 * @param {boolean}  groupedMode - Si true usa `grouped`, si false usa `playlists`
 * @param {boolean}  loading
 * @param {string}   error
 * @param {Function} onPlay      - (playlist) => void
 * @param {Function} onSave      - (playlist) => void
 * @param {Array}    savedIds    - IDs de playlists ya guardadas por el usuario
 * @param {string}   savingId    - ID de la playlist que está siendo guardada ahora
 * @param {number}   skeletonCount
 */
const PlaylistGrid = ({
  playlists    = [],
  grouped      = {},
  groupedMode  = false,
  loading      = false,
  error        = null,
  onPlay,
  onSave,
  savedIds     = [],
  savingId     = null,
  skeletonCount = 6,
}) => {
  const theme = useTheme();

  // Convertir savedIds a Set para lookup O(1)
  const savedSet = React.useMemo(
    () => new Set(savedIds.map(String)),
    [savedIds]
  );

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return <PlaylistSkeleton count={skeletonCount} />;
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error) {
    return (
      <Box
        sx={{
          py: 4,
          textAlign: "center",
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.06),
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
        }}
      >
        <Typography variant="body2">⚠️ {error}</Typography>
      </Box>
    );
  }

  // ✅ FIX: some() en lugar de every() para detectar vacío real.
  // La API devuelve todos los grupos aunque estén vacíos [], así que
  // comprobamos si AL MENOS uno tiene items, no si todos están vacíos.
  const isEmpty = groupedMode
    ? !GROUP_ORDER.some(k => grouped[k]?.length > 0)
    : playlists.length === 0;

  if (isEmpty) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          🎵 No hay playlists disponibles por el momento.
        </Typography>
      </Box>
    );
  }

  // ── Modo agrupado ──────────────────────────────────────────────
  if (groupedMode) {
    return (
      <Box>
        {GROUP_ORDER.map(key => (
          <GroupRow
            key={key}
            groupKey={key}
            playlists={grouped[key]}
            onPlay={onPlay}
            onSave={onSave}
            savedIds={savedSet}
            savingId={savingId}
          />
        ))}
      </Box>
    );
  }

  // ── Modo plano ─────────────────────────────────────────────────
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
      {playlists.map((playlist, i) => (
        <Box
          key={playlist.id}
          sx={{
            opacity: 0,
            animation: "cardIn 0.35s ease forwards",
            animationDelay: `${i * 50}ms`,
            "@keyframes cardIn": {
              from: { opacity: 0, transform: "translateY(10px)" },
              to:   { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <PlaylistCard
            playlist={playlist}
            onPlay={onPlay}
            onSave={onSave}
            isSaved={savedSet.has(String(playlist.id))}
            savingId={savingId}
          />
        </Box>
      ))}
    </Box>
  );
};

export default PlaylistGrid;