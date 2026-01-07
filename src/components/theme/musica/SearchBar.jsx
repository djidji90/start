// src/components/search/SearchBar.jsx - VERSIÓN INSPIRADA
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  IconButton,
  Typography,
  alpha,
  Alert,
  Fade,
  Chip,
  Avatar,
  Stack,
  Tooltip,
  Button,
  Divider,
  Badge,
  Zoom,
  Slide,
  Grow,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear,
  MusicNote,
  Person,
  Whatshot,
  Error,
  CheckCircle,
  HourglassEmpty,
  History,
  TrendingUp,
  Refresh,
  KeyboardArrowDown,
  PlayArrow,
  Download,
  Favorite,
  ChatBubble,
  CalendarToday,
  Close,
  ArrowForward,
  FilterList,
  Sort,
} from '@mui/icons-material';
import { useSearch, useSearchAnalytics } from '../../hooks/useSearch';
import { styled, keyframes } from '@mui/system';

// Animaciones personalizadas
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideInFromTop = keyframes`
  from { 
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const StyledSearchContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 700,
  margin: '0 auto',
  transition: 'all 0.3s ease',
}));

const SearchBar = () => {
  const theme = useTheme();
  const { 
    query, 
    setQuery, 
    results, 
    loading, 
    error, 
    isOpen, 
    status,
    searchMetrics,
    clearSearch, 
    closeResults,
    forceSearch,
    getSearchSuggestions,
    hasResults,
    isEmptyResults,
    isValidQuery
  } = useSearch();
  
  const { trackSearch } = useSearchAnalytics();
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Cargar historial inicial
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('dj_search_history') || '[]');
    setSearchHistory(savedHistory.slice(0, 8));
  }, []);

  // Guardar en historial cuando se realiza una búsqueda exitosa
  useEffect(() => {
    if (results.length > 0 && query.trim().length >= 2) {
      const newSearch = {
        query: query.trim(),
        timestamp: new Date().toISOString(),
        resultCount: results.length
      };
      
      const updatedHistory = [
        newSearch,
        ...searchHistory.filter(item => item.query.toLowerCase() !== query.trim().toLowerCase())
      ].slice(0, 8);
      
      setSearchHistory(updatedHistory);
      localStorage.setItem('dj_search_history', JSON.stringify(updatedHistory));
    }
  }, [results, query, searchHistory]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeResults();
        setShowHistory(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeResults]);

  // Navegación con teclado mejorada
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen && !showHistory) return;

      const items = showHistory ? searchHistory : results;
      const itemCount = items.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < itemCount - 1 ? prev + 1 : 0
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : itemCount - 1
          );
          break;
          
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < itemCount) {
            if (showHistory) {
              setQuery(items[selectedIndex].query);
              setShowHistory(false);
            } else {
              handleSelect(results[selectedIndex]);
            }
          } else if (query.trim().length >= 2) {
            forceSearch();
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          closeResults();
          setShowHistory(false);
          setSelectedIndex(-1);
          break;
          
        case 'Tab':
          if (showHistory) {
            setShowHistory(false);
          }
          break;
          
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showHistory, results, selectedIndex, query, searchHistory, forceSearch, closeResults, setQuery]);

  // Scroll a elemento seleccionado
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const handleSelect = useCallback((item) => {
    console.log('🎯 Item seleccionado:', item);
    trackSearch(query, results.length);
    
    // Feedback visual
    if (item.type === 'song') {
      // Simular reproducción
      console.log(`▶️ Reproduciendo: ${item.title} - ${item.artist}`);
    }
    
    clearSearch();
    setSelectedIndex(-1);
    setShowHistory(false);
  }, [query, results, trackSearch, clearSearch]);

  const handleHistorySelect = useCallback((historyItem) => {
    setQuery(historyItem.query);
    setShowHistory(false);
    inputRef.current?.focus();
  }, [setQuery]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('dj_search_history');
  }, []);

  // Avatar del item
  const getItemAvatar = (item, index) => {
    const colors = {
      song: theme.palette.primary.main,
      artist: theme.palette.secondary.main,
      genre: theme.palette.warning.main,
      suggestion: theme.palette.info.main,
    };

    const icons = {
      song: <MusicNote fontSize="small" />,
      artist: <Person fontSize="small" />,
      genre: <Whatshot fontSize="small" />,
      suggestion: <SearchIcon fontSize="small" />,
    };

    return (
      <Avatar
        sx={{
          bgcolor: colors[item.type] || theme.palette.grey[500],
          width: 36,
          height: 36,
          animation: selectedIndex === index ? `${pulse} 0.5s ease-in-out` : 'none',
        }}
      >
        {icons[item.type] || <SearchIcon />}
      </Avatar>
    );
  };

  // Texto del item
  const getItemText = (item) => {
    if (item.type === 'song') {
      return (
        <Box>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {item.title || 'Sin título'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.artist || 'Artista desconocido'}
          </Typography>
        </Box>
      );
    }
    
    if (item.type === 'artist') {
      return (
        <Typography variant="subtitle2" fontWeight={600}>
          {item.name || item.artist || 'Artista'}
        </Typography>
      );
    }
    
    return (
      <Typography variant="subtitle2" fontWeight={500}>
        {item.display || item.title || item.name || 'Sugerencia'}
      </Typography>
    );
  };

  // Subtexto del item
  const getItemSubtext = (item) => {
    const parts = [];
    
    if (item.type === 'song') {
      if (item.duration) {
        const mins = Math.floor(item.duration / 60);
        const secs = item.duration % 60;
        parts.push(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
      if (item.likes_count > 0) {
        parts.push(`❤️ ${item.likes_count}`);
      }
      if (item.genre) {
        parts.push(item.genre);
      }
      if (item.comments_count > 0) {
        parts.push(`💬 ${item.comments_count}`);
      }
    }
    
    if (item.type === 'artist' && item.song_count) {
      parts.push(`🎵 ${item.song_count} canciones`);
    }
    
    if (item.popularity) {
      parts.push(`🔥 ${item.popularity}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  // Acciones del item
  const getItemActions = (item) => (
    <Stack direction="row" spacing={0.5}>
      {item.type === 'song' && (
        <>
          <Tooltip title="Reproducir">
            <IconButton size="small" sx={{ color: 'primary.main' }}>
              <PlayArrow fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Añadir a favoritos">
            <IconButton size="small" sx={{ color: 'error.main' }}>
              <Favorite fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}
      <Chip 
        label={item.type === 'song' ? 'Canción' : 
               item.type === 'artist' ? 'Artista' : 
               item.type === 'genre' ? 'Género' : 'Sugerencia'}
        size="small"
        color={
          item.type === 'song' ? 'primary' :
          item.type === 'artist' ? 'secondary' :
          item.type === 'genre' ? 'warning' : 'default'
        }
        variant="outlined"
        sx={{ 
          height: 20,
          fontSize: '0.6rem',
          fontWeight: 500
        }}
      />
    </Stack>
  );

  // Estado visual inspirado en tu diseño anterior
  const getStatusInfo = () => {
    switch (status) {
      case 'searching':
        return { 
          icon: <HourglassEmpty fontSize="small" />, 
          text: 'Buscando en la biblioteca...', 
          color: 'info.main',
          variant: 'outlined'
        };
      case 'success':
        return { 
          icon: <CheckCircle fontSize="small" />, 
          text: `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`, 
          color: 'success.main',
          variant: 'filled'
        };
      case 'error':
        return { 
          icon: <Error fontSize="small" />, 
          text: 'Error en la búsqueda', 
          color: 'error.main',
          variant: 'filled'
        };
      case 'no-results':
        return { 
          icon: <SearchIcon fontSize="small" />, 
          text: 'No encontramos coincidencias', 
          color: 'warning.main',
          variant: 'outlined'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  const searchSuggestions = getSearchSuggestions(query);

  return (
    <StyledSearchContainer ref={containerRef}>
      {/* Campo de búsqueda principal */}
      <Paper
        elevation={focused ? 8 : 2}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `2px solid ${focused ? theme.palette.primary.main : 'transparent'}`,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon 
            sx={{ 
              color: focused ? 'primary.main' : 'text.secondary',
              transition: 'color 0.2s',
              fontSize: 24
            }} 
          />
          
          <TextField
            inputRef={inputRef}
            fullWidth
            placeholder="¿Qué canción tienes en mente? Busca por título, artista o género..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
              if (e.target.value.length >= 2) {
                setShowHistory(false);
              }
            }}
            onFocus={() => {
              setFocused(true);
              if (query.length === 0 && searchHistory.length > 0) {
                setShowHistory(true);
              }
            }}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            variant="standard"
            error={!!error}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '1rem',
                fontWeight: 400,
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.8
                }
              }
            }}
            sx={{
              '& .MuiInputBase-root': {
                height: 40,
              }
            }}
          />
          
          <Stack direction="row" spacing={0.5} alignItems="center">
            {/* Indicador de estado */}
            {statusInfo && (
              <Fade in={true}>
                <Chip
                  size="small"
                  icon={statusInfo.icon}
                  label={statusInfo.text}
                  color={statusInfo.color?.replace('.main', '')}
                  variant={statusInfo.variant}
                  sx={{ 
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}
                />
              </Fade>
            )}
            
            {/* Spinner de carga */}
            {loading && (
              <CircularProgress size={20} sx={{ mx: 1 }} />
            )}
            
            {/* Botón limpiar */}
            {query && !loading && (
              <Tooltip title="Limpiar búsqueda">
                <IconButton 
                  onClick={clearSearch} 
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' }
                  }}
                >
                  <Clear />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Panel de resultados/estados */}
      {(isOpen || showHistory) && (
        <Paper
          ref={listRef}
          elevation={12}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            maxHeight: 500,
            overflow: 'hidden',
            zIndex: theme.zIndex.modal,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            animation: `${slideInFromTop} 0.25s ease-out`,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: alpha(theme.palette.background.paper, 0.98),
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Cabecera */}
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary.main">
              {showHistory ? (
                <>
                  <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Historial de búsquedas
                </>
              ) : (
                <>
                  <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {hasResults ? `Resultados para "${query}"` : 'Buscar en Djidi Music'}
                </>
              )}
            </Typography>
            
            {showHistory && searchHistory.length > 0 && (
              <Button
                size="small"
                onClick={clearHistory}
                startIcon={<Clear />}
                sx={{ fontSize: '0.75rem' }}
              >
                Limpiar historial
              </Button>
            )}
          </Box>

          {/* Contenido */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* Historial de búsquedas */}
            {showHistory && !query && (
              <>
                {searchHistory.length > 0 ? (
                  <List disablePadding>
                    {searchHistory.map((item, index) => (
                      <ListItem
                        key={`history-${index}`}
                        button
                        selected={selectedIndex === index}
                        onClick={() => handleHistorySelect(item)}
                        sx={{
                          py: 2,
                          px: 2.5,
                          borderBottom: 1,
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ bgcolor: 'grey.300', width: 32, height: 32 }}>
                            <History fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={500}>
                              {item.query}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.timestamp).toLocaleDateString()} • {item.resultCount} resultados
                            </Typography>
                          }
                        />
                        <ArrowForward fontSize="small" color="action" />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <History sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                      No hay búsquedas recientes
                    </Typography>
                    <Typography variant="body2">
                      Comienza a buscar canciones y artistas
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* Estado de error */}
            {error && !showHistory && (
              <Alert 
                severity="error"
                sx={{ 
                  m: 2, 
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'error.light'
                }}
                action={
                  <Stack direction="row" spacing={1}>
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={forceSearch}
                      startIcon={<Refresh />}
                    >
                      Reintentar
                    </Button>
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={clearSearch}
                      startIcon={<Close />}
                    >
                      Limpiar
                    </Button>
                  </Stack>
                }
              >
                <Typography variant="body2" fontWeight={500}>{error}</Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Verifica tu conexión o intenta con otros términos
                </Typography>
              </Alert>
            )}

            {/* Estado sin resultados - INSPIRADO EN TU DISEÑO ANTERIOR */}
            {isEmptyResults && !showHistory && (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease'
              }}>
                <SearchIcon sx={{ 
                  fontSize: 64, 
                  mb: 3, 
                  color: 'text.disabled',
                  opacity: 0.7 
                }} />
                <Typography variant="h5" gutterBottom fontWeight={500}>
                  ¡Seguro te encanta la música guineana!
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                  No encontramos coincidencias para <strong>"{query}"</strong>
                </Typography>
                
                <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    💡 Sugerencias:
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" gap={1}>
                    {searchSuggestions.map((suggestion, index) => (
                      <Chip
                        key={index}
                        label={suggestion}
                        size="medium"
                        onClick={() => setQuery(suggestion)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { transform: 'translateY(-2px)' },
                          transition: 'transform 0.2s'
                        }}
                      />
                    ))}
                  </Stack>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    Aquí encontrarás a tus artistas favoritos... ¡suerte!
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Estado cargando */}
            {loading && !showHistory && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Buscando "<strong>{query}</strong>" en nuestra biblioteca...
                </Typography>
                <LinearProgress 
                  variant="indeterminate" 
                  sx={{ mt: 2, maxWidth: 200, mx: 'auto', height: 4, borderRadius: 2 }}
                />
              </Box>
            )}

            {/* Resultados encontrados */}
            {!loading && !error && hasResults && !showHistory && (
              <>
                {/* Estadísticas */}
                <Box sx={{ 
                  p: 2, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: alpha(theme.palette.background.default, 0.5)
                }}>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Chip
                      icon={<MusicNote />}
                      label={`${results.filter(r => r.type === 'song').length} canciones`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Person />}
                      label={`${results.filter(r => r.type === 'artist').length} artistas`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                    {searchMetrics && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        Encontrado en {searchMetrics.searchTime}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Lista de resultados */}
                <List disablePadding>
                  {results.map((item, index) => (
                    <Grow in={true} key={`${item.type}-${item.id}-${index}`} timeout={index * 50}>
                      <ListItem
                        button
                        selected={selectedIndex === index}
                        onClick={() => handleSelect(item)}
                        sx={{
                          py: 1.5,
                          px: 2.5,
                          borderBottom: 1,
                          borderColor: alpha(theme.palette.divider, 0.3),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            transform: 'translateX(4px)',
                          },
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            }
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48, mr: 2 }}>
                          {getItemAvatar(item, index)}
                        </ListItemIcon>
                        <ListItemText
                          primary={getItemText(item)}
                          secondary={
                            getItemSubtext(item) && (
                              <Typography variant="caption" color="text.secondary">
                                {getItemSubtext(item)}
                              </Typography>
                            )
                          }
                          sx={{ mr: 2 }}
                        />
                        {getItemActions(item)}
                      </ListItem>
                    </Grow>
                  ))}
                </List>
              </>
            )}
          </Box>

          {/* Footer del panel */}
          <Box sx={{ 
            p: 1.5, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.default, 0.8),
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {showHistory ? (
                  '🕐 Historial de búsquedas recientes'
                ) : (
                  <>
                    🔍 <strong>{results.length}</strong> resultado{results.length !== 1 ? 's' : ''} • 
                    💡 Usa <strong>↑↓</strong> para navegar • <strong>Enter</strong> para seleccionar
                  </>
                )}
              </Typography>
              
              {!showHistory && hasResults && (
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  sx={{ fontSize: '0.75rem' }}
                  onClick={() => {
                    // Navegar a página de búsqueda completa
                    console.log('Ver todos los resultados');
                  }}
                >
                  Ver todos
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Sugerencias y tips cuando el campo está vacío */}
      {!query && !isOpen && !showHistory && (
        <Slide in={!query} direction="up" timeout={300}>
          <Box sx={{ mt: 3 }}>
            {/* Sugerencias de búsqueda */}
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.03)
              }}
            >
              <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp fontSize="small" /> Búsquedas populares en Djidi Music
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {[
                  { label: 'Maluma', type: 'artist', color: 'secondary' },
                  { label: 'Reggaetón 2024', type: 'genre', color: 'warning' },
                  { label: 'Música para estudiar', type: 'playlist', color: 'info' },
                  { label: 'Shakira', type: 'artist', color: 'secondary' },
                  { label: 'Bad Bunny', type: 'artist', color: 'secondary' },
                  { label: 'Bachata moderna', type: 'genre', color: 'warning' },
                ].map((item, index) => (
                  <Chip
                    key={index}
                    icon={
                      item.type === 'artist' ? <Person fontSize="small" /> :
                      item.type === 'genre' ? <Whatshot fontSize="small" /> :
                      <MusicNote fontSize="small" />
                    }
                    label={item.label}
                    color={item.color}
                    variant="outlined"
                    onClick={() => setQuery(item.label)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: `${item.color}.main`,
                        color: 'white',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Stack>
            </Paper>

            {/* Tips de búsqueda */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                border: 1, 
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                💡 Tips para mejores resultados:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  • Busca por <strong>título de canción</strong> exacto
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • Escribe el <strong>nombre del artista</strong> completo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • Filtra por <strong>género musical</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • Usa <strong>comillas</strong> para búsquedas exactas
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Slide>
      )}
    </StyledSearchContainer>
  );
};

export default SearchBar;