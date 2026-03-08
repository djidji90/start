// src/components/profile/ShareButton.jsx
import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Box,
  Typography,
  Divider,
  alpha,
  Modal,
  Paper
} from '@mui/material';
import {
  Share as ShareIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  CheckCircle,
  Close
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '@mui/material/styles';

/**
 * Botón para compartir perfil - VERSIÓN SIMPLIFICADA
 * @param {Object} profile - Datos del perfil
 * @param {string} username - Nombre de usuario
 */
const ShareButton = ({ profile, username }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const [anchorEl, setAnchorEl] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // URL del perfil
  const profileUrl = `${window.location.origin}/perfil/${username}`;
  
  // Texto para compartir (simple y efectivo)
  const shareText = profile?.full_name 
    ? `🎵 Escucha a ${profile.full_name} en DjidjiMusic` 
    : `🎵 Descubre el perfil de @${username} en DjidjiMusic`;

  // ============================================
  // OPCIÓN 1: COMPARTIR NATIVO (Web Share API)
  // ============================================
  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: profile?.full_name || username,
          text: shareText,
          url: profileUrl,
        });
        setSnackbar({
          open: true,
          message: '✅ Compartido con éxito',
          severity: 'success'
        });
      } else {
        // Si no hay Web Share API, mostrar menú con opciones manuales
        setAnchorEl(document.getElementById('share-button'));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setSnackbar({
          open: true,
          message: '❌ Error al compartir',
          severity: 'error'
        });
      }
    }
    handleClose();
  };

  // ============================================
  // OPCIÓN 2: COPIAR ENLACE
  // ============================================
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setSnackbar({
        open: true,
        message: '✅ Enlace copiado al portapapeles',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: '❌ No se pudo copiar',
        severity: 'error'
      });
    }
    handleClose();
  };

  // ============================================
  // OPCIÓN 3: CÓDIGO QR
  // ============================================
  const handleOpenQR = () => {
    setQrOpen(true);
    handleClose();
  };

  const handleCloseQR = () => {
    setQrOpen(false);
  };

  const handleOpen = (event) => {
    event.stopPropagation();
    // Intentar compartir nativo primero
    if (navigator.share) {
      handleNativeShare();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Compartir perfil" arrow>
        <IconButton
          id="share-button"
          onClick={handleOpen}
          sx={{
            bgcolor: alpha(primaryColor, 0.1),
            color: primaryColor,
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: alpha(primaryColor, 0.2),
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ShareIcon />
        </IconButton>
      </Tooltip>

      {/* Menú de opciones (solo para escritorio sin Web Share) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: `0 8px 20px ${alpha('#000', 0.15)}`,
            mt: 1,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${alpha('#000', 0.1)}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: primaryColor }}>
            Compartir perfil
          </Typography>
        </Box>

        <MenuItem onClick={copyLink} sx={{ py: 1 }}>
          <LinkIcon sx={{ mr: 2, color: primaryColor, fontSize: 20 }} />
          <Typography>Copiar enlace</Typography>
        </MenuItem>

        <MenuItem onClick={handleOpenQR} sx={{ py: 1 }}>
          <QrCodeIcon sx={{ mr: 2, color: primaryColor, fontSize: 20 }} />
          <Typography>Código QR</Typography>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: alpha('#000', 0.5) }}>
            En móvil: usa el botón compartir del sistema
          </Typography>
        </Box>
      </Menu>

      {/* Modal del Código QR */}
      <Modal
        open={qrOpen}
        onClose={handleCloseQR}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper
          sx={{
            maxWidth: 400,
            width: '100%',
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={handleCloseQR}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'text.secondary',
            }}
          >
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {profile?.full_name || username}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Escanea para ver el perfil
          </Typography>

          <Box sx={{
            p: 2,
            bgcolor: '#ffffff',
            borderRadius: 2,
            display: 'inline-block',
            mb: 2,
          }}>
            <QRCodeSVG
              value={profileUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
          </Box>

          <Typography variant="caption" sx={{ color: alpha('#000', 0.5), display: 'block' }}>
            {profileUrl}
          </Typography>
        </Paper>
      </Modal>

      {/* Snackbar de confirmación */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity}
          icon={snackbar.severity === 'success' ? <CheckCircle /> : null}
          sx={{ 
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha('#000', 0.15)}`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareButton;