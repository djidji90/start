import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  LocationOn,
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";

// Animaciones
const float = keyframes`
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
  100% { transform: translateY(0px) scale(1); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Estilos
const EventCardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '24px',
  background: `linear-gradient(145deg, 
    ${alpha(theme.palette.secondary.light, 0.9)} 0%, 
    ${alpha(theme.palette.primary.light, 0.85)} 100%)`,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  color: theme.palette.common.white,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  cursor: 'pointer',
  boxShadow: '0 8px 32px rgba(255, 105, 135, 0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(255, 105, 135, 0.3)',
    '& .hover-overlay': { opacity: 1 },
    '&:after': { opacity: 1 }
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, 
      ${alpha(theme.palette.primary.main, 0.2)}, 
      ${alpha(theme.palette.secondary.main, 0.2)})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 1
  }
}));

const DateBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: 'blur(8px)',
  padding: theme.spacing(1.5),
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  textAlign: 'center',
  zIndex: 2,
  '& .month': {
    fontWeight: 800,
    letterSpacing: '1px',
    color: theme.palette.common.white
  },
  '& .day': {
    fontSize: '2rem',
    lineHeight: 1,
    fontWeight: 900,
    color: theme.palette.secondary.light,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(90deg, 
    ${theme.palette.secondary.light} 0%, 
    ${theme.palette.primary.light} 100%)`,
  backgroundSize: '200% auto',
  borderRadius: '12px',
  padding: '12px 24px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundPosition: 'right center',
    animation: `${float} 1.5s infinite, ${gradientFlow} 4s infinite`,
    transform: 'scale(1.05)'
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

// Funciones auxiliares
const processSinglePath = (path, baseURL) => {
  if (!path || typeof path !== "string") return "";
  let relativePath = path;
  try {
    const url = new URL(path);
    relativePath = url.pathname;
  } catch (e) {}
  const cleanPath = relativePath.replace(/^\/?media\//, "");
  return `${baseURL.replace(/\/$/, "")}/api2/media/${cleanPath}`;
};

const getImageUrl = (path, baseURL) => {
  if (!path) return [];
  if (Array.isArray(path)) return path.map(p => processSinglePath(p, baseURL));
  return [processSinglePath(path, baseURL)];
};

// Componente CardActionMenu
const CardActionMenu = React.memo(({ event }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const { contact } = useConfig();

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
        sx={{
          '& .MuiPaper-root': {
            background: alpha(theme.palette.primary.dark, 0.9),
            backdropFilter: 'blur(12px)',
            color: 'white'
          }
        }}
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

// Componente EventDetailsModal
const EventDetailsModal = React.memo(({ open, onClose, event }) => {
  const theme = useTheme();
  const { api, contact } = useConfig();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const timeoutRef = useRef(null);
  const carouselRef = useRef(null);
  
  const imagesArray = useMemo(() => {
    if (!event.images) return event.image ? [event.image] : [];
    return Array.isArray(event.images) ? event.images : [event.images];
  }, [event.images, event.image]);

  const totalImages = imagesArray.length;
  const images = getImageUrl(imagesArray, api.baseURL);

  useEffect(() => {
    if (!autoPlay || totalImages <= 1) return;
    
    timeoutRef.current = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % totalImages);
    }, 5000);

    return () => clearInterval(timeoutRef.current);
  }, [autoPlay, totalImages, currentImageIndex]);

  const handleNextImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % totalImages);
    resetAutoPlay();
  }, [totalImages]);

  const handlePrevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + totalImages) % totalImages);
    resetAutoPlay();
  }, [totalImages]);

  const resetAutoPlay = () => {
    setAutoPlay(false);
    clearInterval(timeoutRef.current);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleGetTickets = () => {
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: 24,
          outline: 'none',
          background: `linear-gradient(145deg, 
            ${alpha(theme.palette.secondary.light, 0.95)} 0%, 
            ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
        }}
      >
        <Box 
          ref={carouselRef}
          sx={{ position: 'relative', height: 300 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          <Box sx={{
            display: 'flex',
            width: `${totalImages * 100}%`,
            transform: `translateX(-${currentImageIndex * (100 / totalImages)}%)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            height: '100%'
          }}>
            {images?.map((imageUrl, index) => (
              <Box key={index} sx={{
                flex: '0 0 100%',
                height: '100%',
                background: `url(${imageUrl}) center/cover`,
                backgroundColor: theme.palette.background.default
              }}/>
            ))}
          </Box>

          {totalImages > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  bgcolor: 'rgba(0,0,0,0.4)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }
                }}
              >
                <ChevronLeft sx={{ color: 'white' }}/>
              </IconButton>
              
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  bgcolor: 'rgba(0,0,0,0.4)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }
                }}
              >
                <ChevronRight sx={{ color: 'white' }}/>
              </IconButton>

              <Box sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1
              }}>
                {imagesArray?.map((_, index) => (
                  <Box key={index} sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: currentImageIndex === index ? 'primary.main' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.3s'
                  }}/>
                ))}
              </Box>
            </>
          )}

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
            <Chip label={`${event.attendees ?? 1} asistente mas`} />
          </Box>
          <Typography variant="body1">{event.description}</Typography>
          <Button variant="contained" sx={{ mt: 4 }} onClick={handleGetTickets}>
            Obtener Entradas
          </Button>
        </Box>
      </Box>
    </Modal>
  );
});

// Componente principal EventCard
const EventCard = ({ event }) => {
   const theme = useTheme()
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(event.isFavorite);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Referencias corregidas
  const timeoutRef = useRef(null);
  const carouselRef = useRef(null);

  const { api } = useConfig();

  const imagesArray = useMemo(() => {
    if (!event.images && !event.image) return [];
    if (!event.images) return event.image ? [event.image] : [];
    return Array.isArray(event.images) ? event.images : [event.images];
  }, [event.images, event.image]);

  const totalImages = imagesArray.length;
  const images = getImageUrl(imagesArray, api.baseURL);

  useEffect(() => {
    if (!autoPlay || totalImages <= 1) return;
    
    timeoutRef.current = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % totalImages);
    }, 5000);

    return () => clearInterval(timeoutRef.current);
  }, [autoPlay, totalImages, currentImageIndex]);

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

  const handleNextImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % totalImages);
    resetAutoPlay();
  }, [totalImages]);

  const handlePrevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + totalImages) % totalImages);
    resetAutoPlay();
  }, [totalImages]);

  const resetAutoPlay = () => {
    setAutoPlay(false);
    clearInterval(timeoutRef.current);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <EventCardContainer>
      <HoverOverlay className="hover-overlay" />

      <Box 
        ref={carouselRef}
        sx={{
          height: 240,
          position: 'relative',
          overflow: 'hidden',
          '&:hover .carousel-arrows': {
            opacity: 1
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        <Box sx={{
          display: 'flex',
          width: `${totalImages * 100}%`,
          transform: `translateX(-${currentImageIndex * (100 / totalImages)}%)`,
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%'
        }}>
          {images?.map((imageUrl, index) => (
            <Box key={index} sx={{
              flex: '0 0 100%',
              height: '100%',
              position: 'relative',
              background: `url(${imageUrl}) center/cover`,
              '&:before': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '60%',
                background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.7) 100%)'
              }
            }}/>
          ))}
        </Box>

        {totalImages > 1 && (
          <>
            <IconButton
              className="carousel-arrows"
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                opacity: 0,
                transition: 'opacity 0.3s',
                bgcolor: 'rgba(0,0,0,0.4)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }
              }}>
              <ChevronLeft sx={{ color: 'white' }}/>
            </IconButton>
            
            <IconButton
              className="carousel-arrows"
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                opacity: 0,
                transition: 'opacity 0.3s',
                bgcolor: 'rgba(0,0,0,0.4)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }
              }}>
              <ChevronRight sx={{ color: 'white' }}/>
            </IconButton>

            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1
            }}>
              {imagesArray?.map((_, index) => (
                <Box key={index} sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: currentImageIndex === index ? 'primary.main' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.3s'
                }}/>
              ))}
            </Box>
          </>
        )}

        {imagesArray.length === 0 && (
          <Box sx={{ 
            height: '100%', 
            background: theme.palette.background.default,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h6">Sin imágenes</Typography>
          </Box>
        )}
      </Box>

      <DateBadge>
        <Typography variant="subtitle2" className="month">{formattedDate.month}</Typography>
        <Typography variant="h3" className="day">{formattedDate.day}</Typography>
      </DateBadge>

      <Box sx={{ p: 3, position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {event.title}
          </Typography>
          <CardActionMenu event={event} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <LocationOn fontSize="small" sx={{ color: 'secondary.light' }} />
          <Typography variant="subtitle1">{event.location}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <GradientButton
            variant="contained"
            onClick={() => setShowDetails(true)}
          >
            ¡sepa Màs!
          </GradientButton>
          <Tooltip title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}>
            <IconButton
              onClick={handleFavorite}
              sx={{
                background: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.2),
                  animation: `${float} 0.8s`
                }
              }}
            >
              {isFavorite ? (
                <Favorite sx={{ color: theme.palette.secondary.light }} />
              ) : (
                <FavoriteBorder sx={{ color: 'white' }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
       {imagesArray.length === 0 && (
      <Box sx={{ 
        height: '100%', 
        background: theme.palette.background.default, // <-- Ahora theme está definido
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h6">Sin imágenes</Typography>
      </Box>
    )}

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
    images: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    image: PropTypes.string,
    isFavorite: PropTypes.bool,
    description: PropTypes.string.isRequired,
    attendees: PropTypes.number
  }).isRequired
};

export default React.memo(EventCard);