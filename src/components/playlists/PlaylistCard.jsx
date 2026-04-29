// src/components/playlists/PlaylistCard.jsx
// ============================================
// 🎵 PLAYLIST CARD — OPCIÓN C
// Cover full 3/4 · Un solo overlay · Jerarquía mínima
// ============================================

import React, { useState } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import BookmarkIcon       from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import PlayArrowIcon      from "@mui/icons-material/PlayArrow";
import useAuth            from "../hook/services/useAuth";

// ─── Gradientes de fallback por tipo (cuando no hay cover) ───────────────────
const TYPE_GRADIENTS = {
  featured:    ["#92400E", "#78350F"],
  temporal:    ["#1E3A5F", "#1E40AF"],
  generica:    ["#1F2937", "#374151"],
  nicho:       ["#2E1065", "#4C1D95"],
  mood:        ["#4A044E", "#831843"],
  promocional: ["#064E3B", "#065F46"],
};

const TYPE_LABELS = {
  featured:    "Destacada",
  temporal:    "Temporal",
  generica:    "General",
  nicho:       "Nicho",
  mood:        "Mood",
  promocional: "Promo",
};

// ─── Componente ───────────────────────────────────────────────────────────────

const PlaylistCard = ({
  playlist,
  onPlay,
  onSave,
  isSaved  = false,
  savingId = null,
}) => {
  const { isAuthenticated } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);

  if (!playlist) return null;

  const { id, name, playlist_type, cover_url, song_count = 0 } = playlist;

  // ✅ Normalizar a String — evita comparación number !== string
  const isSaving  = savingId !== null && String(savingId) === String(id);
  const coverSrc  = cover_url && !imgError ? cover_url : null;
  const [g1, g2]  = TYPE_GRADIENTS[playlist_type] ?? TYPE_GRADIENTS.generica;
  const typeLabel = TYPE_LABELS[playlist_type]     ?? "General";

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay?.(playlist)}
      sx={{
        position: "relative",
        aspectRatio: "3 / 4",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >

      {/* ── Capa 1: imagen o gradiente de fallback ────────────────── */}
      {coverSrc ? (
        <Box
          component="img"
          src={coverSrc}
          alt={name}
          onError={() => setImgError(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
        />
      ) : (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(155deg, ${g1} 0%, ${g2} 100%)`,
          }}
        />
      )}

      {/* ── Capa 2: único overlay fade hacia abajo ────────────────── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
        }}
      />

      {/* ── Tipo — arriba izquierda ───────────────────────────────── */}
      <Typography
        sx={{
          position: "absolute",
          top: 10,
          left: 11,
          fontSize: "0.58rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {typeLabel}
      </Typography>

      {/* ── Guardar — arriba derecha (solo autenticado) ───────────── */}
      {isAuthenticated && (
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onSave?.(playlist); }}
          disabled={isSaving}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            p: 0.5,
            color: isSaved ? "#fff" : "rgba(255,255,255,0.4)",
            opacity: hovered || isSaved ? 1 : 0,
            transition: "opacity 0.2s ease, color 0.15s ease",
            "&:hover": { color: "#fff", bgcolor: "transparent" },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {isSaving
            ? <CircularProgress size={14} sx={{ color: "rgba(255,255,255,0.7)" }} />
            : isSaved
              ? <BookmarkIcon       sx={{ fontSize: 17 }} />
              : <BookmarkBorderIcon sx={{ fontSize: 17 }} />
          }
        </IconButton>
      )}

      {/* ── Play — centro, aparece al hover ──────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: hovered
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.75)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        <IconButton
          onClick={(e) => { e.stopPropagation(); onPlay?.(playlist); }}
          sx={{
            width: 44,
            height: 44,
            bgcolor: "rgba(255,255,255,0.92)",
            color: "#000",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <PlayArrowIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Box>

      {/* ── Info — abajo ─────────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 1.2, sm: 1.5 },
        }}
      >
        <Typography
          noWrap
          title={name}
          sx={{
            color: "#fff",
            fontWeight: 600,
            fontSize: { xs: "0.8rem", sm: "0.88rem" },
            lineHeight: 1.3,
          }}
        >
          {name}
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.42)",
            fontSize: "0.63rem",
            mt: 0.4,
            lineHeight: 1,
          }}
        >
          {song_count} {song_count === 1 ? "canción" : "canciones"}
        </Typography>
      </Box>
    </Box>
  );
};

export default PlaylistCard;