// src/components/playlists/PlaylistCard.jsx
// ============================================
// 🎵 TARJETA — PLAYLIST CURADA
// ✅ Gestión premium de carátulas
// ✅ Gradientes por tipo de playlist
// ✅ Iconos específicos por categoría
// ✅ Manejo de playlists sin canciones
// ============================================

import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import MoodIcon from "@mui/icons-material/Mood";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CampaignIcon from "@mui/icons-material/Campaign";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import useAuth from "../hook/services/useAuth";

// ─── Etiquetas visuales por tipo ─────────────────────────────────────────────
const TYPE_LABELS = {
  featured:    { label: "Destacada", color: "#F59E0B", icon: <WhatshotIcon /> },
  temporal:    { label: "Temporal",  color: "#3B82F6", icon: <AccessTimeIcon /> },
  generica:    { label: "General",   color: "#6B7280", icon: <QueueMusicIcon /> },
  nicho:       { label: "Nicho",     color: "#8B5CF6", icon: <StarIcon /> },
  mood:        { label: "Mood",      color: "#EC4899", icon: <MoodIcon /> },
  promocional: { label: "Promo",     color: "#10B981", icon: <CampaignIcon /> },
};

// ─── Gradientes por tipo de playlist (para fallback) ─────────────────────────
const getTypeGradient = (playlistType, theme) => {
  const gradients = {
    featured: `linear-gradient(135deg, #F59E0B, #D97706)`,
    mood: `linear-gradient(135deg, #EC4899, #BE185D)`,
    nicho: `linear-gradient(135deg, #8B5CF6, #6D28D9)`,
    temporal: `linear-gradient(135deg, #3B82F6, #1E3A8A)`,
    promocional: `linear-gradient(135deg, #10B981, #047857)`,
    generica: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  };
  return gradients[playlistType] || gradients.generica;
};

// ─── URLs de imágenes por defecto (opcional) ─────────────────────────────────
const DEFAULT_COVERS = {
  featured: '/images/playlists/featured-default.jpg',
  mood: '/images/playlists/mood-default.jpg',
  nicho: '/images/playlists/nicho-default.jpg',
  temporal: '/images/playlists/temporal-default.jpg',
  promocional: '/images/playlists/promo-default.jpg',
  generica: '/images/playlists/generic-default.jpg',
};

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * PlaylistCard
 *
 * @param {Object}   playlist        - Objeto playlist de la API
 * @param {Function} onPlay          - (playlist) => void
 * @param {Function} onSave          - (playlist) => void
 * @param {boolean}  isSaved         - Si el usuario ya la guardó
 * @param {string}   savingId        - ID de la playlist que está siendo guardada
 * @param {string}   variant         - 'grid' | 'compact' | 'list'
 * @param {Function} onPreview       - (playlist) => void (para hover preview)
 * @param {Object}   previewData     - Datos precargados de la playlist
 * @param {boolean}  isLoadingPreview - Si está precargando
 */
const PlaylistCard = ({
  playlist,
  onPlay,
  onSave,
  isSaved = false,
  savingId = null,
  variant = 'grid',
  onPreview,
  previewData,
  isLoadingPreview = false,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!playlist) return null;

  const {
    id,
    name,
    description,
    cover_url,
    playlist_type,
    song_count = 0,
    featured = false,
  } = playlist;

  const hasNoSongs = song_count === 0;
  const typeInfo = TYPE_LABELS[playlist_type] ?? TYPE_LABELS.generica;
  const isSaving = savingId !== null && String(savingId) === String(id);
  
  // ─── Lógica de carátula ─────────────────────────────────────────────────────
  // Prioridad: 1. URL real (sin error) → 2. Default por tipo → 3. null (usar gradiente)
  let coverSrc = null;
  if (!imgError && cover_url) {
    coverSrc = cover_url;
  } else if (!imgError && DEFAULT_COVERS[playlist_type]) {
    // Opcional: usar imagen por defecto si existe en el proyecto
    coverSrc = DEFAULT_COVERS[playlist_type];
  }
  
  const useGradientFallback = !coverSrc || imgError;

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handlePlay = (e) => {
    e.stopPropagation();
    if (hasNoSongs) return;
    onPlay?.(playlist);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onSave?.(playlist);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (!hasNoSongs && onPreview && !previewData && !isLoadingPreview) {
      onPreview(playlist);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  // ─── Variante compact (para modo lista) ─────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Box
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s',
          cursor: hasNoSongs ? 'default' : 'pointer',
          opacity: hasNoSongs ? 0.6 : 1,
          '&:hover': !hasNoSongs && {
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            transform: 'translateX(4px)',
          },
          position: 'relative',
        }}
        onClick={handlePlay}
      >
        {/* Miniatura compacta */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: useGradientFallback
                ? getTypeGradient(playlist_type, theme)
                : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {coverSrc && !useGradientFallback ? (
              <Box
                component="img"
                src={coverSrc}
                alt={name}
                onError={() => setImgError(true)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              typeInfo.icon
            )}
          </Box>
          
          {hovered && !hasNoSongs && (
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': { bgcolor: theme.palette.primary.dark },
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {name}
            {hasNoSongs && (
              <Typography component="span" variant="caption" sx={{ ml: 0.5, color: theme.palette.warning.main }}>
                (pronto)
              </Typography>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {hasNoSongs ? 'Próximamente' : `${song_count} canciones`}
          </Typography>
        </Box>
        
        {isAuthenticated && !hasNoSongs && (
          <IconButton size="small" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <CircularProgress size={16} />
            ) : isSaved ? (
              <BookmarkIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        )}
      </Box>
    );
  }

  // ─── Variante grid (default) ────────────────────────────────────────────────
  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        cursor: hasNoSongs ? "default" : "pointer",
        position: "relative",
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        border: `1px solid ${alpha(
          featured ? "#F59E0B" : theme.palette.divider,
          featured ? 0.4 : 0.3
        )}`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: hovered && !hasNoSongs ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered && !hasNoSongs
          ? `0 12px 28px ${alpha(theme.palette.primary.main, 0.25)}`
          : `0 2px 8px ${alpha("#000", 0.08)}`,
        ...(featured && {
          boxShadow: hovered && !hasNoSongs
            ? `0 8px 24px ${alpha("#F59E0B", 0.3)}`
            : `0 2px 8px ${alpha("#F59E0B", 0.1)}`,
        }),
        ...(hasNoSongs && {
          opacity: 0.7,
          filter: "grayscale(0.1)",
        }),
      }}
      onClick={handlePlay}
    >
      {/* ── Cover / Media ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          overflow: "hidden",
        }}
      >
        {/* Imagen o fallback con gradiente */}
        {coverSrc && !useGradientFallback ? (
          <Box
            component="img"
            src={coverSrc}
            alt={name}
            onError={() => setImgError(true)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered && !hasNoSongs ? "scale(1.06)" : "scale(1)",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 1,
              background: getTypeGradient(playlist_type, theme),
              transition: "transform 0.4s ease",
              transform: hovered && !hasNoSongs ? "scale(1.06)" : "scale(1)",
            }}
          >
            {hasNoSongs ? (
              <WarningAmberIcon sx={{ fontSize: 48, color: alpha("#fff", 0.8) }} />
            ) : (
              <>
                {React.cloneElement(typeInfo.icon, { sx: { fontSize: 48, color: alpha("#fff", 0.9) } })}
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha("#fff", 0.8),
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {typeInfo.label}
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* Overlay para playlists sin canciones */}
        {hasNoSongs && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: "blur(2px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Chip
              label="Próximamente"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.9),
                color: "white",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
        )}

        {/* Overlay de reproducción (solo si tiene canciones) */}
        {!hasNoSongs && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.35)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton
              size="large"
              onClick={handlePlay}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                width: 48,
                height: 48,
                transform: hovered ? "scale(1)" : "scale(0.7)",
                transition: "transform 0.2s ease",
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                  transform: "scale(1.05)",
                },
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>
        )}

        {/* Chip de tipo — esquina superior izquierda */}
        <Chip
          label={typeInfo.label}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            height: 22,
            fontSize: "0.65rem",
            fontWeight: 700,
            bgcolor: alpha(typeInfo.color, 0.85),
            color: "#fff",
            backdropFilter: "blur(4px)",
            border: `1px solid ${alpha(typeInfo.color, 0.4)}`,
            zIndex: 2,
          }}
        />

        {/* Botón guardar — esquina superior derecha */}
        {isAuthenticated && !hasNoSongs && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              opacity: hovered ? 1 : 0.6,
              transition: "opacity 0.2s ease",
              zIndex: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={isSaved ? "Quitar de guardados" : "Guardar playlist"} arrow>
              <IconButton
                size="small"
                disabled={isSaving}
                onClick={handleSave}
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.85),
                  backdropFilter: "blur(4px)",
                  width: 28,
                  height: 28,
                  color: isSaved
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {isSaving ? (
                  <CircularProgress size={14} color="inherit" />
                ) : isSaved ? (
                  <BookmarkIcon sx={{ fontSize: 16 }} />
                ) : (
                  <BookmarkBorderIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* ── Info ──────────────────────────────────────────────────────────────── */}
      <Box sx={{ p: 1.5 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          noWrap
          title={name}
          sx={{ fontSize: "0.85rem", lineHeight: 1.3 }}
        >
          {name}
          {hasNoSongs && (
            <Typography
              component="span"
              variant="caption"
              sx={{
                ml: 0.5,
                color: theme.palette.warning.main,
                fontSize: "0.65rem",
              }}
            >
              (pronto)
            </Typography>
          )}
        </Typography>

        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            title={description}
            sx={{ display: "block", fontSize: "0.7rem", mt: 0.3 }}
          >
            {description}
          </Typography>
        )}

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            fontSize: "0.68rem",
            color: hasNoSongs
              ? alpha(theme.palette.warning.main, 0.7)
              : alpha(theme.palette.text.secondary, 0.7),
          }}
        >
          {hasNoSongs ? "Próximamente" : `${song_count} ${song_count === 1 ? "canción" : "canciones"}`}
        </Typography>
      </Box>

      {/* ── Preview Panel (hover) ─────────────────────────────────────────────── */}
      {hovered && !hasNoSongs && previewData?.songs?.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: "100%",
            left: 8,
            right: 8,
            mb: 1,
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.98),
            backdropFilter: "blur(8px)",
            boxShadow: theme.shadows[4],
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            zIndex: 10,
          }}
        >
          <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
            🎵 Preview
          </Typography>
          {previewData.songs.slice(0, 3).map((song, idx) => (
            <Box
              key={song.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 0.5,
                px: 0.5,
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.({ ...playlist, songs: [song] });
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                {idx + 1}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" noWrap fontWeight={500}>
                  {song.title}
                </Typography>
              </Box>
              <PlayArrowIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
            </Box>
          ))}
          {previewData.songs.length > 3 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 0.5 }}>
              +{previewData.songs.length - 3} más
            </Typography>
          )}
        </Box>
      )}

      {/* Loading overlay para preview */}
      {isLoadingPreview && hovered && !hasNoSongs && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 15,
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}
    </Box>
  );
};

export default PlaylistCard;