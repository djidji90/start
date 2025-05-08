import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useConfig } from "../../hook/useConfig";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Modal,
  useTheme,
  styled,
  alpha,
  Menu,
  Chip,
  MenuItem,
  keyframes
} from "@mui/material";
import {
  Phone,
  Email,
  Favorite,
  FavoriteBorder,
  MoreVert,
  Close,
  Share,
  LocationOn
} from "@mui/icons-material";

// Animaciones
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Glassmorphism Style
const EventCardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '24px',
  background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  color: theme.palette.common.black,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
    '& .hover-overlay': {
      opacity: 1
    }
  }
}));

const DateBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  background: alpha(theme.palette.common.black, 0.3),
  backdropFilter: 'blur(4px)',
  padding: theme.spacing(1.5),
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  textAlign: 'center',
  zIndex: 2,
  '& .month': {
    fontWeight: 600,
    letterSpacing: '1px'
  },
  '& .day': {
    fontSize: '2rem',
    lineHeight: 1
  }
}));

const HoverOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: alpha(theme.palette.common.black, 0.2),
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 1
}));

// Función mejorada para construir URLs de imágenes
const getImageUrl = (path, baseURL) => {
  if (!path || typeof path !== "string") return "";
  
  // Extraer solo el pathname si es una URL absoluta
  let relativePath = path;
  try {
    const url = new URL(path);

    
    relativePath = url.pathname; // Obtiene "/media/events/descarga_1.jpg"
  } catch (e) {
    // No es una URL absoluta, usar el path directamente
  }

  // Eliminar "/media/" inicial si existe
  const cleanPath = relativePath.replace(/^\/?media\//, "");
  
  return `${baseURL.replace(/\/$/, "")}/api2/media/${cleanPath}`;
};

const CardActionMenu = React.memo(({ event }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const { contact, api } = useConfig();

  const handleClick = useCallback((e) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const handleContact = useCallback(() => {
    window.location.href = `tel:${contact.phone}`;
    handleClose();
  }, [contact.phone, handleClose]);

  const handleEmail = useCallback(() => {
    window.location.href = `mailto:${contact.email}`;
    handleClose();
  }, [contact.email, handleClose]);



  return (
    <>
      <Tooltip title="Más opciones">
        <IconButton onClick={handleClick} sx={{ color: 'white' }}>
          <MoreVert />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ '& .MuiPaper-root': {
          background: alpha(theme.palette.primary.dark, 0.9),
          backdropFilter: 'blur(12px)',
          color: 'white'
        }}}
      >
        <MenuItem onClick={handleContact}>
          <Phone fontSize="small" /> Contactar
        </MenuItem>
        <MenuItem onClick={handleEmail}>
          <Email fontSize="small" /> Enviar Correo
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Share fontSize="small" /> Compartir
        </MenuItem>
      </Menu>
    </>
  );
});

const EventDetailsModal = React.memo(({ open, onClose, event }) => {
  const theme = useTheme();
  const { api, contact } = useConfig(); // <== AÑADIDO contact
  const imageUrl = getImageUrl(event.image, api.baseURL);

  const handleGetTickets = () => {
    window.location.href = `tel:${contact.phone}`; // <== FUNCIÓN PARA LLAMAR
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        width: '90%',
        maxWidth: 800,
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: 24,
        outline: 'none'
      }}>
        <Box sx={{ 
          height: 200,
          background: `linear-gradient(0deg, ${theme.palette.background.paper} 0%, 
            ${alpha(theme.palette.primary.main, 0.2)} 100%), url(${imageUrl}) center/cover`,
          backgroundColor: theme.palette.background.default
        }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: alpha(theme.palette.common.black, 0.4),
              '&:hover': {
                background: alpha(theme.palette.common.black, 0.6)
              }
            }}
          >
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Box>

        <Box sx={{ p: 4 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>{event.title}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip icon={<LocationOn />} label={event.location} />
            <Chip label={`${event.attendees ?? +1} asistentes mas`} />
          </Box>
          <Typography variant="body1">{event.description}</Typography>

          <Button 
            variant="contained" 
            sx={{ mt: 4 }} 
            onClick={handleGetTickets} // <== AÑADIDA FUNCIÓN
          >
            Obtener Entradas
          </Button>
        </Box>
      </Box>
    </Modal>
  );
});


const EventCard = ({ event }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(event.isFavorite);
  const theme = useTheme();
  const { api } = useConfig();
  const imageUrl = getImageUrl(event.image, api.baseURL);

  const eventDate = useMemo(() => new Date(event.event_date), [event.event_date]);
  const formattedDate = useMemo(() => ({
    month: eventDate.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
    day: eventDate.getDate(),
    time: eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }), [eventDate]);

  const handleFavorite = useCallback((e) => {
    e.stopPropagation();
    setIsFavorite(prev => !prev);
  }, []);

  return (
    <EventCardContainer>
      <HoverOverlay className="hover-overlay" />

      <Box sx={{
        height: 240,
        position: 'relative',
        background: `url(${imageUrl}) center/cover, ${theme.palette.background.default}`,
        '&:before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '60%',
          background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.7) 100%)'
        }
      }} />

      <DateBadge>
        <Typography variant="subtitle2" className="month">{formattedDate.month}</Typography>
        <Typography variant="h3" className="day">{formattedDate.day}</Typography>
      </DateBadge>

      <Box sx={{ p: 3, position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{event.title}</Typography>
          <CardActionMenu event={event} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <LocationOn fontSize="small" />
          <Typography variant="subtitle1">{event.location}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setShowDetails(true)}
            sx={{
              flex: 1,
              borderRadius: '12px',
              padding: '12px 20px',
              background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, 
                ${theme.palette.primary.main} 100%)`,
              '&:hover': {
                animation: `${float} 2s infinite`
              }
            }}
          >
            Ver Detalles
          </Button>
          <Tooltip title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}>
            <IconButton
              onClick={handleFavorite}
              sx={{
                background: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.2),
                  animation: `${pulse} 0.8s`
                }
              }}
            >
              {isFavorite ? (
                <Favorite sx={{ color: theme.palette.secondary.main }} />
              ) : (
                <FavoriteBorder sx={{ color: 'white' }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <EventDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        event={event}
      />
    </EventCardContainer>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    event_date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    isFavorite: PropTypes.bool,
    description: PropTypes.string.isRequired,
    attendees: PropTypes.number
  }).isRequired
};

export default React.memo(EventCard);