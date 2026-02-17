// src/components/search/SearchResults.jsx - VERSIÓN COMPATIBLE
import React from "react";
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  IconButton,
  ListItemIcon,
  Alert,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  MusicNote as MusicIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  PlayArrow,
  Star,
} from "@mui/icons-material";

const SearchResults = ({
  results = {},      // Ahora recibe structuredResults directamente
  loading = false,
  error = null,
  isOpen = false,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  // Extraer datos del structuredResults
  const songs = results.songs || [];
  const artists = results.artists || [];
  const genres = results.genres || [];

  const hasResults = songs.length > 0 || artists.length > 0 || genres.length > 0;
  const totalResults = songs.length + artists.length + genres.length;

  const handleSelect = (item, type) => {
    if (onSelect) {
      onSelect(item, type);
    }
    if (onClose) {
      onClose();
    }
  };

  const formatSecondaryInfo = (item, type) => {
    const parts = [];

    if (type === 'song') {
      if (item.artist) parts.push(item.artist);
      if (item.genre && item.genre !== 'Sin género') parts.push(item.genre);
    } else if (type === 'artist' && item.song_count) {
      parts.push(`${item.song_count} canciones`);
    } else if (type === 'genre' && item.song_count) {
      parts.push(`${item.song_count} canciones`);
    }

    // Agregar score si existe y es relevante
    if (item.score !== undefined && item.score > 0) {
      parts.push(`⭐ ${item.score}`);
    }

    // Agregar exact match
    if (item.exact_match) {
      parts.push('🎯 Exacto');
    }

    return parts.join(' • ');
  };

  const getItemTitle = (item, type) => {
    if (type === 'song') return item.title || 'Sin título';
    if (type === 'artist') return item.name || 'Artista';
    if (type === 'genre') return item.name || 'Género';
    return item.display || 'Item';
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        right: 0,
        zIndex: 1300,
        borderRadius: 2,
        overflow: "hidden",
        border: "2px solid #B2EBF2",
        maxHeight: 450,
        overflowY: "auto",
        boxShadow: "0 10px 40px rgba(0, 131, 143, 0.15)",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          bgcolor: "#E0F7FA",
          borderBottom: "1px solid #B2EBF2",
        }}
      >
        <Typography 
          variant="subtitle2" 
          fontWeight={600}
          sx={{ color: "#006064" }}
        >
          {hasResults ? `Resultados (${totalResults})` : 'Resultados de búsqueda'}
        </Typography>
        <IconButton 
          size="small" 
          onClick={onClose}
          sx={{ color: "#00838F" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* CONTENT */}
      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        {loading && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CircularProgress size={24} sx={{ color: "#00838F" }} />
            <Typography 
              variant="caption" 
              display="block" 
              mt={1}
              sx={{ color: "#006064" }}
            >
              Buscando…
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert 
              severity="error"
              sx={{ 
                borderRadius: 1,
                bgcolor: '#FFEBEE',
                border: '1px solid #FFCDD2'
              }}
            >
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          </Box>
        )}

        {!loading && !error && !hasResults && (
          <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
            <SearchIcon sx={{ fontSize: 36, mb: 1, color: "#B2EBF2" }} />
            <Typography variant="body2" sx={{ color: "#006064", mb: 1 }}>
              No se encontraron resultados
            </Typography>
            <Typography variant="caption" sx={{ color: "#00838F" }}>
              Intenta con otras palabras clave
            </Typography>
          </Box>
        )}

        {/* SONGS */}
        {songs.length > 0 && (
          <>
            <SectionTitle icon={<MusicIcon />} label={`Canciones (${songs.length})`} />

            <List disablePadding>
              {songs.slice(0, 5).map((song, index) => (
                <ListItemButton
                  key={`song-${song.id || index}-${index}`}
                  onClick={() => handleSelect(song, "song")}
                  sx={{
                    px: 2,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(0, 131, 143, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '4px',
                      bgcolor: '#E0F7FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00838F'
                    }}>
                      <MusicIcon fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      noWrap
                      sx={{ color: "#006064", fontWeight: 500 }}
                    >
                      {getItemTitle(song, 'song')}
                    </Typography>

                    <Typography variant="caption" sx={{ 
                      color: "#00838F",
                      display: 'block',
                      mt: 0.5
                    }}>
                      {formatSecondaryInfo(song, 'song')}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(song, "song");
                    }}
                    sx={{ color: "#00838F" }}
                  >
                    <PlayArrow fontSize="small" />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>

            {songs.length > 5 && (
              <>
                <Divider sx={{ borderColor: "#B2EBF2" }} />
                <ActionItem
                  label={`Ver todas las canciones (${songs.length})`}
                  onClick={() => onSelect && onSelect(songs, "songs")}
                />
              </>
            )}
          </>
        )}

        {/* ARTISTS */}
        {artists.length > 0 && (
          <>
            {songs.length > 0 && (
              <Divider sx={{ borderColor: "#B2EBF2", my: 1 }} />
            )}

            <SectionTitle icon={<PersonIcon />} label={`Artistas (${artists.length})`} />

            <List disablePadding>
              {artists.slice(0, 5).map((artist, index) => (
                <ListItemButton
                  key={`artist-${artist.id || index}-${index}`}
                  onClick={() => handleSelect(artist, "artist")}
                  sx={{
                    px: 2,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(0, 131, 143, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%',
                      bgcolor: '#E0F7FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00838F'
                    }}>
                      <PersonIcon fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      noWrap
                      sx={{ color: "#006064", fontWeight: 500 }}
                    >
                      {getItemTitle(artist, 'artist')}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: "#00838F",
                      display: 'block',
                      mt: 0.5
                    }}>
                      {formatSecondaryInfo(artist, 'artist')}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        {/* GENRES */}
        {genres.length > 0 && (
          <>
            {(songs.length > 0 || artists.length > 0) && (
              <Divider sx={{ borderColor: "#B2EBF2", my: 1 }} />
            )}

            <SectionTitle icon={<CategoryIcon />} label={`Géneros (${genres.length})`} />

            <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {genres.slice(0, 6).map((genre, index) => (
                <Box
                  key={`genre-${genre.id || index}-${index}`}
                  onClick={() => handleSelect(genre, "genre")}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: '16px',
                    bgcolor: '#E0F7FA',
                    border: '1px solid #B2EBF2',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(0, 131, 143, 0.1)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ color: "#00838F", fontWeight: 500 }}
                  >
                    {getItemTitle(genre, 'genre')}
                  </Typography>
                  {genre.song_count && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 1,
                        color: "#006064",
                        fontSize: '0.7rem'
                      }}
                    >
                      ({genre.song_count})
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>

      {/* FOOTER */}
      {hasResults && !loading && !error && (
        <Box sx={{ 
          p: 1.5, 
          borderTop: 1, 
          borderColor: "#B2EBF2",
          bgcolor: "#E0F7FA",
        }}>
          <Typography 
            variant="caption" 
            align="center" 
            sx={{ 
              color: "#006064", 
              display: 'block',
              fontFamily: "'Segoe UI', Roboto, sans-serif"
            }}
          >
            Haz clic para seleccionar • Esc para cerrar
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

/* -------- Componentes Helper -------- */

const SectionTitle = ({ icon, label }) => (
  <Box
    sx={{
      px: 2,
      py: 1.5,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      bgcolor: "rgba(178, 235, 242, 0.3)",
      borderBottom: "1px solid #B2EBF2",
      borderTop: "1px solid #B2EBF2",
    }}
  >
    {React.cloneElement(icon, { 
      sx: { color: "#00838F", fontSize: 18 } 
    })}
    <Typography 
      variant="caption" 
      fontWeight={600} 
      sx={{ color: "#006064" }}
    >
      {label}
    </Typography>
  </Box>
);

const ActionItem = ({ label, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      px: 2,
      py: 1.5,
      cursor: "pointer",
      color: "#00838F",
      fontSize: "0.85rem",
      fontWeight: 500,
      textAlign: "center",
      transition: 'background-color 0.2s',
      "&:hover": {
        bgcolor: "rgba(0, 131, 143, 0.08)",
      },
    }}
  >
    {label}
  </Box>
);

export default SearchResults;