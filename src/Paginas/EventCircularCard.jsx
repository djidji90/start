// src/components/events/EventCircularCard.jsx - VERSIÓN CON AMPLIACIÓN
import React from 'react';
import {
  Card, CardMedia, CardContent,
  Typography, IconButton, Chip, Box,
  Fade, Tooltip, Modal, Backdrop
} from '@mui/material';
import {
  Favorite, FavoriteBorder,
  LocationOn, CalendarToday,
  Star, Close, AttachMoney,
  Groups, Description
} from '@mui/icons-material';

const EventCircularCard = ({ event, onSave, size = 200 }) => {
  const [hovered, setHovered] = React.useState(false);
  const [saved, setSaved] = React.useState(event?.isSaved || false);
  const [expanded, setExpanded] = React.useState(false); // Estado para expansión

  const handleSave = (e) => {
    e.stopPropagation();
    const newSavedState = !saved;
    setSaved(newSavedState);
    if (onSave) onSave(event.id, newSavedState);
  };

  const handleCardClick = () => {
    setExpanded(true); // Ampliar la card
  };

  const handleCloseExpanded = () => {
    setExpanded(false); // Cerrar la vista ampliada
  };

  // Colores por tipo de evento
  const getEventColor = (type) => {
    const colors = {
      festival: '#FF4081',
      concert: '#7C4DFF',
      club: '#00BCD4',
      streaming: '#4CAF50',
    };
    return colors[type] || '#2196F3';
  };

  // Formatear fecha
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

  // Formatear fecha corta
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Obtener icono por tipo
  const getEventIcon = (type) => {
    const icons = {
      festival: '🎪',
      concert: '🎵',
      club: '💃',
      streaming: '📹',
    };
    return icons[type] || '🎭';
  };

  // Renderizar detalles del evento
  const renderEventDetails = () => (
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
            icon={<Star />}
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

  return (
    <>
      {/* Card Circular Normal */}
      <Box 
        sx={{
          width: size,
          height: size,
          mx: 'auto',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Card
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            boxShadow: hovered ? 8 : 3,
            bgcolor: 'background.paper',
            position: 'relative',
          }}
        >
          {/* Imagen de fondo */}
          <CardMedia
            component="img"
            height="100%"
            image={event.image_url || '/default-event.jpg'}
            alt={event.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: hovered ? 'brightness(0.7)' : 'brightness(0.6)',
              transition: 'filter 0.3s ease',
            }}
          />

          {/* Overlay degradado */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(to bottom, 
                transparent 30%, 
                rgba(0, 0, 0, 0.8) 80%
              )`,
            }}
          />

          {/* Botón guardar */}
          <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
            <Tooltip title={saved ? "Quitar de guardados" : "Guardar evento"}>
              <IconButton
                size="small"
                onClick={handleSave}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                {saved ? (
                  <Favorite sx={{ color: '#FF4081', fontSize: 18 }} />
                ) : (
                  <FavoriteBorder sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Badge tipo de evento */}
          <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    {getEventIcon(event.event_type)}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.7rem', 
                    textTransform: 'capitalize',
                    fontWeight: 500 
                  }}>
                    {event.event_type}
                  </Typography>
                </Box>
              }
              size="small"
              sx={{
                bgcolor: `${getEventColor(event.event_type)}20`,
                color: getEventColor(event.event_type),
                border: `1px solid ${getEventColor(event.event_type)}40`,
                backdropFilter: 'blur(10px)',
              }}
            />
          </Box>

          {/* Badge destacado */}
          {event.is_featured && (
            <Box sx={{ position: 'absolute', top: 50, left: 12, zIndex: 2 }}>
              <Chip
                icon={<Star sx={{ fontSize: 14 }} />}
                label="Destacado"
                size="small"
                sx={{
                  bgcolor: '#FFD600',
                  color: '#000',
                  fontSize: '0.65rem',
                  height: 22,
                }}
              />
            </Box>
          )}

          {/* Contenido principal */}
          <CardContent
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              color: 'white',
              zIndex: 2,
            }}
          >
            <Fade in={hovered}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    lineHeight: 1.2,
                    fontSize: '1rem',
                  }}
                  noWrap
                >
                  {event.title}
                </Typography>

                {/* Información detallada (solo en hover) */}
                {hovered && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                      <Typography variant="caption" noWrap>
                        {event.location}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                      <Typography variant="caption">
                        {formatShortDate(event.date)}
                      </Typography>
                    </Box>

                    {event.price && (
                      <Chip
                        label={`${event.price} ${event.currency || '€'}`}
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Información mínima (sin hover) */}
                {!hovered && (
                  <>
                    <Typography variant="body2" noWrap sx={{ mb: 0.5 }}>
                      {event.location}
                    </Typography>
                    <Typography variant="caption">
                      {formatShortDate(event.date)}
                    </Typography>
                  </>
                )}
              </Box>
            </Fade>
          </CardContent>
        </Card>
      </Box>

      {/* Modal para vista ampliada */}
      <Modal
        open={expanded}
        onClose={handleCloseExpanded}
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
        <Fade in={expanded}>
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
              onClick={handleCloseExpanded}
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
              {/* Imagen del evento */}
              <Box sx={{ flex: 1 }}>
                <CardMedia
                  component="img"
                  image={event.image_url || '/default-event.jpg'}
                  alt={event.title}
                  sx={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
              </Box>

              {/* Detalles del evento */}
              <Box sx={{ flex: 2 }}>
                {renderEventDetails()}
                
                {/* Botones de acción */}
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <IconButton
                    onClick={handleSave}
                    sx={{
                      bgcolor: saved ? '#FF4081' : 'rgba(0,0,0,0.08)',
                      color: saved ? 'white' : 'inherit',
                      '&:hover': {
                        bgcolor: saved ? '#F50057' : 'rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    {saved ? <Favorite /> : <FavoriteBorder />}
                    <Typography sx={{ ml: 1 }}>
                      {saved ? 'Guardado' : 'Guardar'}
                    </Typography>
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default EventCircularCard;