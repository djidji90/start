// src/components/events/EventsCircularGrid.jsx
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
  AttachMoney, Groups, Description
} from '@mui/icons-material';
import EventCircularCard from '../Paginas/EventCircularCard';

const EventsCircularGrid = ({
  events = [],
  loading = false,
  error = null,
  title = "Eventos Próximos",
  subtitle = "Descubre los mejores eventos musicales",
  onEventSave,
  showFilters = false,
  filters = [],
  onFilterChange,
  itemsPerPage = 6,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Estados de carga/error/vacío
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 1 }}>
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
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
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
      // Actualizar el evento seleccionado si está en el modal
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(prev => ({
          ...prev,
          isSaved: save
        }));
      }
    }
  };

  // Función para renderizar detalles del evento en el modal
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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {event.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ color: getEventColor(event.event_type) }} />
            <Typography variant="body1">
              <strong>Lugar:</strong> {event.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ color: getEventColor(event.event_type) }} />
            <Typography variant="body1">
              <strong>Fecha:</strong> {formatDate(event.date)}
            </Typography>
          </Box>
          
          {event.price && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney sx={{ color: getEventColor(event.event_type) }} />
              <Typography variant="body1">
                <strong>Precio:</strong> {event.price} {event.currency || '€'}
              </Typography>
            </Box>
          )}
          
          {event.capacity && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Groups sx={{ color: getEventColor(event.event_type) }} />
              <Typography variant="body1">
                <strong>Capacidad:</strong> {event.capacity} personas
              </Typography>
            </Box>
          )}
        </Box>
        
        {event.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description /> Descripción
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {event.description}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={event.event_type}
            sx={{
              bgcolor: `${getEventColor(event.event_type)}20`,
              color: getEventColor(event.event_type),
              fontWeight: 600,
            }}
          />
          {event.is_featured && (
            <Chip
              icon={<Whatshot />}
              label="Evento Destacado"
              sx={{
                bgcolor: '#FFD600',
                color: '#000',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box sx={{ mb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Whatshot sx={{ mr: 2, color: '#FF4081' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {/* Filtros */}
        {showFilters && filters.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
            <Chip
              icon={<FilterList />}
              label="Todos"
              size="small"
              color={activeFilter === 'all' ? 'primary' : 'default'}
              onClick={() => {
                setActiveFilter('all');
                onFilterChange?.('all');
              }}
            />
            {filters.map((filter) => (
              <Chip
                key={filter}
                label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                size="small"
                color={activeFilter === filter ? 'primary' : 'default'}
                onClick={() => {
                  setActiveFilter(filter);
                  onFilterChange?.(filter);
                }}
              />
            ))}
          </Stack>
        )}

        {/* Grid de Cards Circulares */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {visibleEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Fade in timeout={500}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {/* USAMOS EventCircularCard SIN onClick */}
                  <EventCircularCard
                    event={event}
                    onSave={onEventSave}
                    // NO pasamos onClick para que use su modal interno
                    size={180} // Tamaño ajustado para grid
                  />
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Botón Ver Más */}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Ver más eventos
            </Button>
          </Box>
        )}

        {/* Contador */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Chip
            label={`${visibleEvents.length} de ${events.length} eventos`}
            size="small"
            variant="outlined"
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
                width: '90%',
                maxWidth: 800,
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
              }}
            >
              {/* Botón cerrar */}
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' }
                }}
              >
                <Close />
              </IconButton>

              {/* Contenido del modal */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Card Circular Ampliada */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <EventCircularCard
                    event={selectedEvent}
                    onSave={handleSaveEvent}
                    size={220}
                  />
                </Box>

                {/* Detalles del evento */}
                <Box sx={{ flex: 2 }}>
                  {renderEventDetails(selectedEvent)}
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