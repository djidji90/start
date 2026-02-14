// src/components/search/SearchBar.jsx - VERSIÓN MEJORADA
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Paper,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear,
  History,
  TrendingUp
} from '@mui/icons-material';

const SearchBar = ({ 
  query = "", 
  onQueryChange, 
  loading = false,
  autoFocus = false,
  placeholder = "Que cancion tienes en mente?...",
  // 🔥 NUEVAS PROPS OPCIONALES (100% compatibles)
  recentSearches = [],      // Para historial (opcional)
  trendingSearches = [],    // Para tendencias (opcional)
  onSearch = null,          // Callback cuando busca
  suggestions = []          // Sugerencias (opcional)
}) => {
  const [focused, setFocused] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus (sin cambios)
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 🔥 NUEVO: Debounce suave (opcional)
  useEffect(() => {
    if (!onSearch) return;
    
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        onSearch(query);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    onQueryChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onQueryChange("");
      setShowRecent(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }

    if (e.key === 'Enter' && query.trim().length >= 2) {
      setShowRecent(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
      onSearch?.(query); // 🔥 Llamar búsqueda si existe
    }
  };

  // 🔥 NUEVO: Seleccionar búsqueda reciente
  const handleSelectRecent = (term) => {
    onQueryChange(term);
    setShowRecent(false);
    onSearch?.(term);
  };

  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%',
        // 🔥 Sombra suave que aparece al enfocar
        transition: 'all 0.3s ease'
      }}
    >
      {/* 🔥 EFECTO GLOW al enfocar (MUY sutil) */}
      <Box
        sx={{
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: 3,
          background: focused 
            ? 'linear-gradient(45deg, #00838F20, #00BCD420, #00838F20)'
            : 'transparent',
          filter: 'blur(8px)',
          opacity: focused ? 0.6 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 0
        }}
      />

      <TextField
        fullWidth
        inputRef={inputRef}
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => {
          setFocused(true);
          setShowRecent(recentSearches.length > 0); // 🔥 Mostrar historial
        }}
        onBlur={() => {
          setFocused(false);
          // Delay para poder hacer clic en sugerencias
          setTimeout(() => setShowRecent(false), 200);
        }}
        onKeyDown={handleKeyDown}
        variant="outlined"
        InputProps={{
          startAdornment: (
            <SearchIcon 
              sx={{ 
                mr: 1, 
                // 🔥 Icono más grande y con transición
                fontSize: focused ? 28 : 24,
                color: focused ? '#00838F' : '#006064',
                transition: 'all 0.2s ease',
                transform: focused ? 'scale(1.1)' : 'scale(1)'
              }} 
            />
          ),
          endAdornment: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {loading && (
                <Fade in={loading}>
                  <CircularProgress 
                    size={20} 
                    sx={{ 
                      mr: 1,
                      color: '#00838F'
                    }} 
                  />
                </Fade>
              )}
              {query && !loading && (
                <Fade in={!!query}>
                  <IconButton 
                    onClick={handleClear} 
                    size="small"
                    sx={{ 
                      color: '#00838F',
                      // 🔥 Efecto hover más suave
                      '&:hover': {
                        bgcolor: '#00838F10',
                        transform: 'rotate(90deg)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Clear />
                  </IconButton>
                </Fade>
              )}
            </Box>
          ),
          sx: {
            borderRadius: 3, // 🔥 Más redondeado
            bgcolor: 'white',
            // 🔥 Sombra interior más elegante
            boxShadow: focused 
              ? 'inset 0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(0,131,143,0.15)'
              : 'inset 0 1px 2px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.02)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: 'white',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 6px 16px rgba(0,131,143,0.1)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00838F',
              }
            },
            '&.Mui-focused': {
              bgcolor: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00838F',
                borderWidth: '2px',
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: focused ? '#00838F' : '#E0F2F1',
              transition: 'border-color 0.2s ease'
            }
          }
        }}
        sx={{
          position: 'relative',
          zIndex: 1,
          '& .MuiInputBase-input': {
            color: '#006064',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: '1rem',
            padding: '14px 16px', // 🔥 Más padding
            '&::placeholder': {
              color: '#90A4AE',
              opacity: 1,
              fontStyle: 'italic', // 🔥 Cursiva sutil
              letterSpacing: '0.3px'
            }
          }
        }}
      />

      {/* 🔥 SUGERENCIAS / HISTORIAL (OPCIONAL - NO ROMPE) */}
      {showRecent && (recentSearches.length > 0 || trendingSearches.length > 0) && (
        <Fade in={showRecent}>
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              borderRadius: 2,
              overflow: 'hidden',
              zIndex: 1000,
              border: '1px solid #E0F2F1',
              boxShadow: '0 8px 24px rgba(0,131,143,0.15)'
            }}
          >
            {/* Búsquedas recientes */}
            {recentSearches.length > 0 && (
              <Box sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 1 }}>
                  <History sx={{ fontSize: 16, color: '#00838F' }} />
                  <Typography variant="caption" sx={{ color: '#006064', fontWeight: 600 }}>
                    Búsquedas recientes
                  </Typography>
                </Box>
                {recentSearches.map((term, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleSelectRecent(term)}
                    sx={{
                      px: 2,
                      py: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      color: '#006064',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': {
                        bgcolor: '#00838F10'
                      }
                    }}
                  >
                    <History sx={{ fontSize: 14, color: '#90A4AE' }} />
                    <Typography variant="body2">{term}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Tendencias */}
            {trendingSearches.length > 0 && (
              <Box sx={{ p: 1, borderTop: '1px solid #E0F2F1' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: '#00838F' }} />
                  <Typography variant="caption" sx={{ color: '#006064', fontWeight: 600 }}>
                    Tendencias
                  </Typography>
                </Box>
                {trendingSearches.map((term, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleSelectRecent(term)}
                    sx={{
                      px: 2,
                      py: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      color: '#006064',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': {
                        bgcolor: '#00838F10'
                      }
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 14, color: '#90A4AE' }} />
                    <Typography variant="body2">{term}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default SearchBar;