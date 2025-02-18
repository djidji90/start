import React, { useState, useMemo, useCallback } from "react";
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
  MenuItem
} from "@mui/material";
import {
  Phone,
  Email,
  Favorite,
  FavoriteBorder,
  PlayArrow,
  MoreVert,
  Info
} from "@mui/icons-material";

// Estilos mejorados
const EventCardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.85)} 0%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
  color: theme.palette.primary.contrastText,
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10]
  }
}));

const DateBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius * 2,
  textAlign: 'center',
  boxShadow: theme.shadows[3]
}));

const CardActionMenu = React.memo(({ event }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = useCallback((e) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);

  return (
    <>
      <IconButton onClick={handleClick} sx={{ color: 'white' }}>
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem component="a" href={`tel:${event.contactPhone || "+240 555 380 241"}`}>
          <Phone /> Contactar
        </MenuItem>
        <MenuItem component="a" href={`mailto:${event.contactEmail || "machimboleoncio@gmail.com"}`}>
          <Email /> Enviar Correo
        </MenuItem>
      </Menu>
    </>
  );
});

const EventDetailsModal = React.memo(({ open, onClose, event }) => (
  <Modal open={open} onClose={onClose}>
    <Box sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.paper',
      p: 4,
      borderRadius: 3,
      width: '90%',
      maxWidth: 600,
      boxShadow: 5
    }}>
      <Typography variant="h5">{event.title}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>{event.description}</Typography>
      <Button sx={{ mt: 3 }} variant="contained" onClick={onClose}>Cerrar</Button>
    </Box>
  </Modal>
));

const EventCard = ({ event }) => {
  const [showDetails, setShowDetails] = useState(false);
  const eventDate = useMemo(() => new Date(event.event_date), [event.event_date]);
  const formattedDate = useMemo(() => ({
    month: eventDate.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
    day: eventDate.getDate(),
    time: eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }), [eventDate]);

  return (
    <EventCardContainer>
      <Box sx={{ height: 180, background: `url(${event.image}) center/cover` }} />
      <DateBadge>
        <Typography variant="subtitle2">{formattedDate.month}</Typography>
        <Typography variant="h5" fontWeight="bold">{formattedDate.day}</Typography>
        <Typography variant="caption">{formattedDate.time}</Typography>
      </DateBadge>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">{event.title}</Typography>
          <CardActionMenu event={event} />
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>{event.location}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          <Button variant="contained" endIcon={<Info />} onClick={() => setShowDetails(true)}>
            Más Información
          </Button>
          <IconButton color="error">
            {event.isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        <EventDetailsModal open={showDetails} onClose={() => setShowDetails(false)} event={event} />
      </Box>
    </EventCardContainer>
  );
};

export default React.memo(EventCard, (prevProps, nextProps) =>
  prevProps.event.id === nextProps.event.id &&
  prevProps.event.is_active === nextProps.event.is_active &&
  prevProps.event.isFavorite === nextProps.event.isFavorite
);
