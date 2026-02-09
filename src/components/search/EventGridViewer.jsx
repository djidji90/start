// EventGridViewer.jsx - Cards circulares con sombra intensa
import React, { useState, useEffect } from "react";
import {
  Container, Typography, Grid, Card, CardMedia, CardContent,
  Chip, IconButton, Modal, Box, Stack, CircularProgress,
  alpha, Avatar, Badge, Tooltip
} from "@mui/material";
import {
  Favorite, FavoriteBorder, Close, CalendarToday,
  LocationOn, AccessTime, Star, StarBorder
} from "@mui/icons-material";

const EventGridViewer = () => {
  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.djidjimusic.com/api2/events/')
      .then(res => res.json())
      .then(data => {
        setEvents(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const saved = localStorage.getItem('eventFavorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('eventFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (eventId, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#D4AF37' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Título */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 300,
            color: "primary.main",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2.5rem',
            letterSpacing: '0.05em',
            mb: 1
          }}
        >
          Eventos Musicales
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          ¡Ponte al día con los próximos eventos!
        </Typography>
      </Box>

      {/* Grid de eventos con cards circulares */}
      <Grid container spacing={2} justifyContent="center">
        {events.map((event) => {
          const isFavorite = favorites.includes(event.id);
          const isPast = new Date(event.event_date) < new Date();
          const initials = event.title
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          return (
            <Grid item xs={6} sm={4} md={3} key={event.id}>
              <Tooltip title={isPast ? "Evento pasado" : "Ver detalles"} arrow>
                <Card
                  onClick={() => !isPast && (() => {
                    setSelectedEvent(event);
                    setModalOpen(true);
                  })()}
                  sx={{
                    cursor: isPast ? 'default' : 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: '50%',
                    width: 150,
                    height: 150,
                    margin: '0 auto',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isPast 
                      ? `0 8px 16px ${alpha('#000', 0.1)}`
                      : `0 15px 35px ${alpha('#D4AF37', 0.3)}, 0 5px 15px ${alpha('#000', 0.2)}`,
                    border: `2px solid ${isPast ? alpha('#ccc', 0.3) : alpha('#D4AF37', 0.2)}`,
                    overflow: 'visible',
                    '&:hover': !isPast && {
                      transform: 'scale(1.05)',
                      boxShadow: `0 25px 50px ${alpha('#D4AF37', 0.4)}, 0 10px 20px ${alpha('#000', 0.3)}`,
                      borderColor: alpha('#D4AF37', 0.4),
                    }
                  }}
                >
                  {/* Fondo con gradiente */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: isPast 
                      ? `linear-gradient(135deg, ${alpha('#ccc', 0.8)} 0%, ${alpha('#999', 0.9)} 100%)`
                      : `linear-gradient(135deg, ${alpha('#D4AF37', 0.9)} 0%, ${alpha('#8B7355', 0.8)} 100%)`,
                    zIndex: 1,
                  }} />

                  {/* Imagen circular o iniciales */}
                  {event.image_url ? (
                    <Avatar
                      src={event.image_url}
                      alt={event.title}
                      sx={{
                        width: 130,
                        height: 130,
                        marginTop: '-15px',
                        border: `3px solid ${alpha('#fff', 0.8)}`,
                        boxShadow: `0 4px 12px ${alpha('#000', 0.2)}`,
                        zIndex: 2,
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 130,
                        height: 130,
                        marginTop: '-15px',
                        bgcolor: alpha('#fff', 0.9),
                        color: '#D4AF37',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        border: `3px solid ${alpha('#fff', 0.8)}`,
                        boxShadow: `0 4px 12px ${alpha('#000', 0.2)}`,
                        zIndex: 2,
                      }}
                    >
                      {initials}
                    </Avatar>
                  )}

                  {/* Botón favorito */}
                  <IconButton
                    size="small"
                    onClick={(e) => toggleFavorite(event.id, e)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 3,
                      backgroundColor: alpha('#fff', 0.9),
                      width: 28,
                      height: 28,
                      '&:hover': {
                        backgroundColor: alpha('#fff', 1),
                      }
                    }}
                  >
                    {isFavorite ? (
                      <Star sx={{ color: '#FFD700', fontSize: 16 }} />
                    ) : (
                      <StarBorder sx={{ color: '#666', fontSize: 16 }} />
                    )}
                  </IconButton>

                  {/* Chip de precio */}
                  {event.price && event.price !== '0.00' && !isPast && (
                    <Chip
                      label={`$${event.price}`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: alpha('#fff', 0.95),
                        color: '#8B7355',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        height: 20,
                        zIndex: 3,
                        border: `1px solid ${alpha('#D4AF37', 0.3)}`,
                        boxShadow: `0 2px 4px ${alpha('#000', 0.1)}`,
                      }}
                    />
                  )}

                  {/* Badge para eventos pasados */}
                  {isPast && (
                    <Badge
                      badgeContent="PASADO"
                      color="default"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        '& .MuiBadge-badge': {
                          backgroundColor: alpha('#666', 0.9),
                          color: '#fff',
                          fontSize: '0.6rem',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '10px',
                        }
                      }}
                    />
                  )}
                </Card>
              </Tooltip>

              {/* Info debajo del círculo */}
              <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 500,
                    fontFamily: "'Cormorant Garamond', serif",
                    color: isPast ? 'text.disabled' : 'text.primary',
                    fontSize: '0.9rem',
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {event.title.length > 20 
                    ? `${event.title.substring(0, 20)}...` 
                    : event.title}
                </Typography>
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    color: isPast ? 'text.disabled' : 'text.secondary',
                    fontSize: '0.75rem',
                  }}
                >
                  {formatDate(event.event_date)}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal - Mantenido similar */}
      {selectedEvent && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
        >
          <Box sx={{
            maxWidth: 500,
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: `0 24px 48px ${alpha('#000', 0.2)}`,
            overflow: 'hidden'
          }}>
            {/* Imagen */}
            {selectedEvent.image_url && (
              <Box sx={{ height: 200, overflow: 'hidden' }}>
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}

            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 500,
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#333'
                  }}
                >
                  {selectedEvent.title}
                </Typography>
                <IconButton 
                  onClick={() => setModalOpen(false)}
                  sx={{ color: '#666' }}
                >
                  <Close />
                </IconButton>
              </Box>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                    🗓️ Fecha y Hora
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#333' }}>
                    {formatDate(selectedEvent.event_date)}
                  </Typography>
                </Box>

                {selectedEvent.location && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      📍 Ubicación
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#333' }}>
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                )}

                {selectedEvent.description && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      📝 Descripción
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6 }}>
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        </Modal>
      )}
    </Container>
  );
};

export default EventGridViewer;