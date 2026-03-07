// src/components/events/EventGridViewer.jsx
import React, { useState, useEffect } from "react";
import {
  Container, Typography, Grid, Card, CardContent,
  Chip, IconButton, Modal, Box, Stack, CircularProgress,
  alpha, Avatar, Badge, Tooltip, Fade, Zoom, Grow,
  Button, Paper
} from "@mui/material";
import {
  Favorite, FavoriteBorder, Close,
  Star, StarBorder, Event, LocationOn,
  AccessTime, ConfirmationNumber, MusicNote,
  CalendarToday, Groups, Share, Info
} from "@mui/icons-material";
import { keyframes } from '@emotion/react';

// ============================================
// 🎨 IDENTIDAD VISUAL - PREMIUM
// ============================================
const colors = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  primaryGradient: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  textDark: '#1a1a1a',
  textLight: '#FFFFFF',
  gray600: '#666666',
  gray500: '#9E9E9E',
  gray400: '#BDBDBD',
  gray300: '#E0E0E0',
  gray200: '#EEEEEE',
  gray100: '#fafafa',
};

// Colores por tipo de evento
const eventTypeColors = {
  festival: '#3B82F6',
  concert: '#8B5CF6',
  club: '#EC4899',
  streaming: '#10B981',
  conference: '#F59E0B',
  workshop: '#6366F1',
  default: '#64748B'
};

// Traducción de tipos
const getSpanishEventType = (type) => {
  const types = {
    festival: 'Festival',
    concert: 'Concierto',
    club: 'Club',
    streaming: 'Streaming',
    conference: 'Conferencia',
    workshop: 'Taller'
  };
  return types[type] || type;
};

// Animaciones
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 ${alpha('#3B82F6', 0.4)}; }
  70% { box-shadow: 0 0 0 10px ${alpha('#3B82F6', 0)}; }
  100% { box-shadow: 0 0 0 0 ${alpha('#3B82F6', 0)}; }
`;

// Funciones helper fuera del componente
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getInitials = (title) => {
  return title
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const EventGridViewer = () => {
  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('djidjiEventFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [showWelcomeTip, setShowWelcomeTip] = useState(() => {
    const tipClosed = localStorage.getItem('djidjiEventTipClosed');
    return !tipClosed;
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem('djidjiEventFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.djidjimusic.com/api2/events/');
      const data = await response.json();
      setEvents(data.results || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (eventId, e) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleEventClick = (event) => {
    const isPast = new Date(event.event_date) < new Date();
    if (!isPast) {
      setSelectedEvent(event);
      setModalOpen(true);
    }
  };

  const closeWelcomeTip = () => {
    setShowWelcomeTip(false);
    localStorage.setItem('djidjiEventTipClosed', 'true');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={48} sx={{ color: colors.primary }} />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1.5, sm: 2, md: 2.5 }, 
      maxWidth: '1200px', 
      mx: 'auto',
      bgcolor: 'background.default'
    }}>
      {/* Welcome Tip - como el de Pokémon */}
      {showWelcomeTip && (
        <Box sx={{
          bgcolor: alpha(colors.primary, 0.08),
          borderRadius: 2,
          p: 2,
          mb: 3,
          border: `1px solid ${alpha(colors.primary, 0.15)}`,
          animation: 'fadeIn 0.5s ease',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(-10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Avatar sx={{ 
              bgcolor: colors.primary, 
              width: 32, 
              height: 32,
              fontSize: '0.875rem'
            }}>
              <MusicNote sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} color={colors.primary} gutterBottom>
                🇬🇶 Eventos musicales en tu ciudad
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Descubre los próximos conciertos, festivales y eventos que se celebraran en tu ciudad.
                Guarda tus favoritos para no perdérte ninguno 😚
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={closeWelcomeTip}
              sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Header minimalista - como el de Pokémon */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3 
      }}>
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: colors.primary }}>
            🎪 Próximos Eventos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {events.length} eventos • {favorites.length} en tu agenda
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' }
        }}>
          <Tooltip title="Eventos destacados">
            <Button
              variant="outlined"
              startIcon={<Star />}
              onClick={() => {}}
              size="small"
              sx={{ 
                borderRadius: 2,
                borderColor: alpha(colors.primary, 0.3),
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: alpha(colors.primary, 0.04)
                }
              }}
            >
              Destacados
            </Button>
          </Tooltip>
          
          <Tooltip title="Ver todos">
            <Button
              variant="contained"
              startIcon={<Event />}
              onClick={() => {}}
              size="small"
              sx={{ 
                borderRadius: 2,
                bgcolor: colors.primary,
                '&:hover': { bgcolor: colors.primaryDark }
              }}
            >
              Calendario
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Grid de eventos - estilo Pokémon premium */}
      <Grid container spacing={1.5}>
        {events.map((event, index) => {
          const mainType = event.event_type || 'default';
          const bgColor = eventTypeColors[mainType] || eventTypeColors.default;
          const isFavorite = favorites.includes(event.id);
          const isPast = new Date(event.event_date) < new Date();
          const initials = getInitials(event.title);
          const isHovered = hoveredEvent === event.id;

          return (
            <Grid item xs={6} sm={4} md={3} key={event.id}>
              <Card 
                onClick={() => handleEventClick(event)}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
                sx={{
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: isPast ? 'default' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isPast ? 0.6 : 1,
                  filter: isPast ? 'grayscale(0.6)' : 'none',
                  border: isFavorite ? `2px solid ${bgColor}` : 'none',
                  animation: index % 2 === 0 ? `${floatAnimation} 3s ease-in-out infinite` : 'none',
                  '&:hover': !isPast && {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 30px ${alpha(bgColor, 0.2)}`,
                    '& .event-image': {
                      transform: 'scale(1.08)'
                    }
                  }
                }}
              >
                {/* Indicador favorito */}
                {isFavorite && (
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    bgcolor: bgColor,
                    color: 'white',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: `${pulseGlow} 2s infinite`,
                  }}>
                    <Favorite sx={{ fontSize: 14 }} />
                  </Box>
                )}

                {/* Imagen del evento */}
                <Box sx={{ 
                  height: 140, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: alpha(bgColor, 0.1),
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Número/ID del evento */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor: alpha('#000', 0.7),
                    color: 'white',
                    borderRadius: 1,
                    px: 1,
                    py: 0.25,
                    zIndex: 2
                  }}>
                    <Typography variant="caption" fontWeight={500}>
                      #{index + 1}
                    </Typography>
                  </Box>

                  {/* Fecha destacada */}
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: alpha('#fff', 0.9),
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    zIndex: 2,
                    border: `1px solid ${alpha(bgColor, 0.3)}`
                  }}>
                    <Typography variant="caption" fontWeight={600} color={bgColor}>
                      {formatShortDate(event.event_date)}
                    </Typography>
                  </Box>

                  {/* Imagen o iniciales */}
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="event-image"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                    />
                  ) : (
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(bgColor, 0.2)
                    }}>
                      <Typography variant="h2" fontWeight={700} color={alpha(bgColor, 0.5)}>
                        {initials}
                      </Typography>
                    </Box>
                  )}

                  {/* Overlay de hover con más info */}
                  {isHovered && !isPast && (
                    <Fade in timeout={200}>
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: alpha('#000', 0.7),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 1,
                        zIndex: 3
                      }}>
                        <Typography variant="caption" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14 }} />
                          {event.location || 'Ubicación por confirmar'}
                        </Typography>
                        {event.price && event.price !== '0.00' && (
                          <Chip
                            label={`${event.price} €`}
                            size="small"
                            sx={{ bgcolor: '#fff', color: bgColor, fontWeight: 600 }}
                          />
                        )}
                      </Box>
                    </Fade>
                  )}
                </Box>

                {/* Contenido de la card */}
                <CardContent sx={{ p: 1.5 }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={600} 
                    sx={{ 
                      mb: 1,
                      lineHeight: 1.2,
                      fontSize: '0.875rem',
                      textTransform: 'capitalize',
                      color: isPast ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    {event.title}
                  </Typography>

                  {/* Tipo de evento */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip
                      label={getSpanishEventType(event.event_type)}
                      size="small"
                      sx={{
                        bgcolor: alpha(bgColor, 0.9),
                        color: 'white',
                        fontSize: '0.65rem',
                        height: 20,
                        flex: 1,
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal de detalles - estilo Pokémon premium */}
      {selectedEvent && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Box sx={{
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            animation: 'modalSlide 0.3s ease',
            '@keyframes modalSlide': {
              from: { opacity: 0, transform: 'scale(0.95) translateY(20px)' },
              to: { opacity: 1, transform: 'scale(1) translateY(0)' }
            }
          }}>
            {/* Header del modal con color según tipo */}
            <Box sx={{
              bgcolor: alpha(eventTypeColors[selectedEvent.event_type] || colors.primary, 0.15),
              p: 3,
              position: 'relative',
              borderBottom: `4px solid ${eventTypeColors[selectedEvent.event_type] || colors.primary}`
            }}>
              <IconButton
                onClick={() => setModalOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  bgcolor: 'white',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <Close />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* Imagen del evento en modal */}
                <Box sx={{ 
                  width: 120, 
                  height: 120,
                  flexShrink: 0,
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: `0 8px 16px ${alpha('#000', 0.2)}`
                }}>
                  {selectedEvent.image_url ? (
                    <img
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(eventTypeColors[selectedEvent.event_type] || colors.primary, 0.2)
                    }}>
                      <Typography variant="h2" fontWeight={700} color={alpha(eventTypeColors[selectedEvent.event_type] || colors.primary, 0.5)}>
                        {getInitials(selectedEvent.title)}
                      </Typography>
                    </Box>
                  )}
                  
                  <IconButton
                    onClick={(e) => toggleFavorite(selectedEvent.id, e)}
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      right: -8,
                      bgcolor: 'white',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    {favorites.includes(selectedEvent.id) ? 
                      <Favorite sx={{ color: '#ff4081' }} /> : 
                      <FavoriteBorder />
                    }
                  </IconButton>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Evento
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ 
                    mb: 1,
                    fontSize: '1.25rem',
                    lineHeight: 1.2
                  }}>
                    {selectedEvent.title}
                  </Typography>
                  
                  <Chip
                    label={getSpanishEventType(selectedEvent.event_type)}
                    size="small"
                    sx={{
                      bgcolor: eventTypeColors[selectedEvent.event_type] || colors.primary,
                      color: 'white',
                      fontWeight: 600,
                      mb: 2
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip title="Fecha">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(selectedEvent.event_date)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Contenido del modal */}
            <Box sx={{ p: 3 }}>
              {/* Ubicación */}
              {selectedEvent.location && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <LocationOn sx={{ fontSize: 20, color: colors.primary }} />
                    Ubicación
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      {selectedEvent.location}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Descripción */}
              {selectedEvent.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Info sx={{ fontSize: 20, color: colors.primary }} />
                    Descripción
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {selectedEvent.description}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Precio */}
              {selectedEvent.price && selectedEvent.price !== '0.00' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <ConfirmationNumber sx={{ fontSize: 20, color: colors.primary }} />
                    Precio
                  </Typography>
                  <Chip
                    label={`${selectedEvent.price} €`}
                    sx={{
                      bgcolor: alpha(colors.primary, 0.1),
                      color: colors.primaryDark,
                      fontWeight: 600,
                      fontSize: '1rem',
                      height: 36,
                      px: 2
                    }}
                  />
                </Box>
              )}

              {/* Conexión Musical - como en Pokémon */}
              <Box sx={{
                bgcolor: alpha(colors.primary, 0.05),
                borderRadius: 2,
                p: 2.5,
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                position: 'relative',
                mb: 2
              }}>
                <Avatar sx={{ 
                  position: 'absolute',
                  top: -12,
                  left: 16,
                  bgcolor: colors.primary,
                  width: 24,
                  height: 24
                }}>
                  <MusicNote sx={{ fontSize: 14 }} />
                </Avatar>
                
                <Typography variant="subtitle2" fontWeight={600} color={colors.primary} gutterBottom>
                  🇬🇶 Ritmo Ecuatoguineano
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Publicar tu evento en esta plataforma es muy sencillo, solo tienes que enviarnos los datos del mismo a nuestro, más info. vista de nuestras redes sociales.
                </Typography>
              </Box>

              {/* CTA final - como en Pokémon */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha('#000', 0.1)}`
              }}>
                <Typography variant="caption" color="text.secondary">
                  {favorites.includes(selectedEvent.id) ? '⭐ En tu agenda' : '✨ Nuevo evento'}
                </Typography>
                
                <Button
                  variant="text"
                  startIcon={<Share />}
                  onClick={() => {}}
                  sx={{ color: colors.primary, fontWeight: 600 }}
                >
                  Compartir
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default EventGridViewer;