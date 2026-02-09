// src/components/events/EventsCircularGrid.jsx - VERSIÓN CON CARDS GRANDES
import React, { useState } from 'react';
import {
  Box, Typography, 
  CircularProgress, Paper,
  Chip, Stack, Grid, Fade,
  Button, IconButton, Modal, Backdrop
} from '@mui/material';
import {
  Whatshot, FilterList,
  ArrowForward, Close,
  LocationOn, CalendarToday,
  AttachMoney, Groups, Description,
  Favorite, FavoriteBorder
} from '@mui/icons-material';
import EventCircularCard from './EventCircularCard';

const EventsCircularGrid = ({
  events = [],
  loading = false,
  error = null,
  title = "eventos y novedades",
  subtitle = "toda la informacion relacionada con tus artistas favoritos",
  onEventSave,
  showFilters = false,
  filters = [],
  onFilterChange,
  itemsPerPage = 9,
  cardSize = 280, // Nuevo prop para tamaño de card
  gridColumns = 3, // Nuevo prop para número de columnas
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Calcular columnas responsivas
  const getGridColumns = () => {
    if (gridColumns === 1) return { xs: 12 };
    if (gridColumns === 2) return { xs: 12, sm: 6 };
    return { xs: 12, sm: 6, md: 4 };
  };

  // Estados de carga/error/vacío
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="h6" color="error" sx={{ mb: 1 }}>
          Error cargando eventos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      </Paper>
    );
  }

  if (!events?.length) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="h6" color="text.secondary">
          No hay eventos disponibles
        </Typography>
      </Paper>
    );
  }

  const visibleEvents = events.slice(0, visibleCount);
  const hasMore = events.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + itemsPerPage);
  };

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = (eventId, save) => {
    if (onEventSave) {
      onEventSave(eventId, save);
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(prev => ({
          ...prev,
          isSaved: save
        }));
      }
    }
  };

  // Renderizar detalles del evento
  const renderEventDetails = (event) => {
    if (!event) return null;

    const getEventColor = (type) => {
      const colors = {
        festival: '#FF4081',
        concert: '#7C4DFF',
        club: '#00BCD4',
        streaming: '#4CAF50',
      };
      return colors[type] || '#2196F3';
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('es-ES', options);
    };

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 3 }}>
          {event.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ color: getEventColor(event.event_type), fontSize: 24 }} />
            <Typography variant="h6">
              <strong>Lugar:</strong> {event.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ color: getEventColor(event.event_type), fontSize: 24 }} />
            <Typography variant="h6">
              <strong>Fecha:</strong> {formatDate(event.date)}
            </Typography>
          </Box>
          
          {event.price && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney sx={{ color: getEventColor(event.event_type), fontSize: 24 }} />
              <Typography variant="h6">
                <strong>Precio:</strong> {event.price} {event.currency || '€'}
              </Typography>
            </Box>
          )}
          
          {event.capacity && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Groups sx={{ color: getEventColor(event.event_type), fontSize: 24 }} />
              <Typography variant="h6">
                <strong>Capacidad:</strong> {event.capacity} personas
              </Typography>
            </Box>
          )}
        </Box>
        
        {event.description && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Description /> Descripción del Evento
            </Typography>
            <Typography variant="h6" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
              {event.description}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Chip
            label={event.event_type.toUpperCase()}
            size="large"
            sx={{
              bgcolor: getEventColor(event.event_type),
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              px: 2,
              py: 1
            }}
          />
          {event.is_featured && (
            <Chip
              icon={<Whatshot />}
              label="EVENTO DESTACADO"
              size="large"
              sx={{
                bgcolor: '#FFD600',
                color: '#000',
                fontWeight: 700,
                fontSize: '1rem',
                px: 2,
                py: 1
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box sx={{ mb: 8 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h2" 
            fontWeight={800} 
            sx={{ 
              mb: 1,
              fontSize: { xs: '2rem', md: '2.5rem' },
              background: 'linear-gradient(45deg, #FF4081 30%, #7C4DFF 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
        </Box>

        {/* Filtros */}
        {showFilters && filters.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip
                icon={<FilterList />}
                label="TODOS"
                size="large"
                color={activeFilter === 'all' ? 'primary' : 'default'}
                onClick={() => {
                  setActiveFilter('all');
                  onFilterChange?.('all');
                }}
                sx={{ fontWeight: 600, px: 2 }}
              />
              {filters.map((filter) => (
                <Chip
                  key={filter}
                  label={filter.toUpperCase()}
                  size="large"
                  color={activeFilter === filter ? 'primary' : 'default'}
                  onClick={() => {
                    setActiveFilter(filter);
                    onFilterChange?.(filter);
                  }}
                  sx={{ fontWeight: 600, px: 2 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Grid de Cards Circulares GRANDES */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {visibleEvents.map((event) => (
            <Grid item {...getGridColumns()} key={event.id}>
              <Fade in timeout={600}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    }
                  }}
                >
                  <EventCircularCard
                    event={event}
                    onSave={onEventSave}
                    // NO pasamos onClick para que use su modal interno
                    size={cardSize}
                  />
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Botón Ver Más */}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button
              variant="contained"
              onClick={handleLoadMore}
              endIcon={<ArrowForward />}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #FF4081 30%, #7C4DFF 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #F50057 30%, #651FFF 90%)',
                }
              }}
            >
              VER MÁS EVENTOS
            </Button>
          </Box>
        )}

        {/* Contador */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Chip
            label={`${visibleEvents.length} de ${events.length} eventos`}
            size="large"
            variant="outlined"
            sx={{ 
              fontSize: '1rem', 
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          />
        </Box>
      </Box>

      {/* Modal para detalles ampliados */}
      {selectedEvent && (
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Fade in={modalOpen}>
            <Box
              sx={{
                position: 'relative',
                width: '95%',
                maxWidth: 1200, // Modal más ancho
                maxHeight: '95vh',
                overflowY: 'auto',
                bgcolor: 'background.paper',
                borderRadius: 4,
                boxShadow: 24,
                p: 5,
              }}
            >
              {/* Botón cerrar */}
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' },
                  width: 50,
                  height: 50
                }}
              >
                <Close sx={{ fontSize: 28 }} />
              </IconButton>

              {/* Contenido del modal */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 6 }}>
                {/* Card Circular Ampliada */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: 400
                }}>
                  <EventCircularCard
                    event={selectedEvent}
                    onSave={handleSaveEvent}
                    size={320} // Card gigante en modal
                  />
                </Box>

                {/* Detalles del evento */}
                <Box sx={{ flex: 2 }}>
                  {renderEventDetails(selectedEvent)}
                  
                  {/* Botón de acción */}
                  <Box sx={{ display: 'flex', gap: 3, mt: 5 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleSaveEvent(selectedEvent.id, !selectedEvent.isSaved)}
                      startIcon={selectedEvent.isSaved ? <Favorite /> : <FavoriteBorder />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: selectedEvent.isSaved 
                          ? '#FF4081' 
                          : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      }}
                    >
                      {selectedEvent.isSaved ? 'QUITAR DE GUARDADOS' : 'GUARDAR EVENTO'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Modal>
      )}
    </>
  );
};

export default EventsCircularGrid;