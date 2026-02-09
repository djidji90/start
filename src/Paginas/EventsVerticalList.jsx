// src/components/events/EventsVerticalList.jsx
import React, { useState } from 'react';
import {
  Box, Typography, 
  CircularProgress, Paper,
  Chip, Stack, Grid, Fade,
  Card, CardMedia, CardContent,
  IconButton, Button
} from '@mui/material';
import {
  Whatshot, FilterList,
  Favorite, FavoriteBorder,
  LocationOn, CalendarToday,
  ArrowForward
} from '@mui/icons-material';

const EventsVerticalList = ({
  events = [],
  loading = false,
  error = null,
  title = "Eventos Próximos",
  subtitle = "Descubre los mejores eventos musicales",
  onEventClick,
  onEventSave,
  showFilters = false,
  filters = [],
  onFilterChange,
  itemsPerPage = 6,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

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

  const handleEventClick = (eventId) => {
    if (onEventClick) {
      onEventClick(eventId);
    }
    // Si no hay onEventClick, el EventCircularCard manejará el modal
  };

  return (
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

      {/* Grid Vertical de Eventos */}
      <Grid container spacing={3}>
        {visibleEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Fade in timeout={500}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  cursor: 'pointer',
                }}
                onClick={() => handleEventClick(event.id)}
              >
                {/* Imagen */}
                <CardMedia
                  component="img"
                  height="200"
                  image={event.image_url || '/default-event.jpg'}
                  alt={event.title}
                  sx={{
                    objectFit: 'cover',
                  }}
                />

                {/* Contenido */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.event_type}
                        size="small"
                        sx={{
                          bgcolor: '#f0f0f0',
                          textTransform: 'capitalize',
                        }}
                      />
                    </Box>
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEventSave) onEventSave(event.id, !event.isSaved);
                      }}
                    >
                      {event.isSaved ? (
                        <Favorite sx={{ color: '#FF4081' }} />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                  </Box>

                  {/* Información */}
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    
                    {event.price && (
                      <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                        {event.price} {event.currency || '€'}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
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
          label={`Mostrando ${visibleEvents.length} de ${events.length} eventos`}
          size="small"
          variant="outlined"
        />
      </Box>
    </Box>
  );
};

export default EventsVerticalList;