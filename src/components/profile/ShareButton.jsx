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
  Paper,
  Stack,
  Avatar,
  Chip,
  Button
} from '@mui/material';
import {
  Share as ShareIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  CheckCircle,
  Close,
  ContentCopy,
  Download,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '@mui/material/styles';

/**
 * Botón para compartir perfil con branding de Guinea Ecuatorial
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
  const profileUrl = `${window.location.origin}/perfil/${profile?.slug || username}`;
  
  // Texto para compartir - ACTUALIZADO con el formato solicitado
  const shareText = profile?.full_name 
    ? `🎵 Escucha a ${profile.full_name} y descubre toda su música en DjidjiMusic 🦆\n🇬🇶 Puro talento nacional ⚡⚡`
    : `🎵 Escucha a @${username} y descubre toda su música en DjidjiMusic 🦆\n🇬🇶 Puro talento nacional ⚡⚡`;

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.full_name || username} | DjidjiMusic 🇬🇶`,
          text: shareText,
          url: profileUrl,
        });
        setSnackbar({
          open: true,
          message: '✓ Compartido con éxito',
          severity: 'success'
        });
      } else {
        setAnchorEl(document.getElementById('share-button'));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setSnackbar({
          open: true,
          message: '✗ Error al compartir',
          severity: 'error'
        });
      }
    }
    handleClose();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setSnackbar({
        open: true,
        message: '✓ Enlace copiado al portapapeles',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: '✗ No se pudo copiar',
        severity: 'error'
      });
    }
    handleClose();
  };

  const downloadQR = () => {
    const qrCanvas = document.querySelector('#qr-canvas canvas');
    if (qrCanvas) {
      const qrImage = qrCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${username}-djidjimusic-qr.png`;
      link.href = qrImage;
      link.click();
      
      setSnackbar({
        open: true,
        message: '✓ QR descargado',
        severity: 'success'
      });
    }
  };

  const handleOpenQR = () => {
    setQrOpen(true);
    handleClose();
  };

  const handleCloseQR = () => {
    setQrOpen(false);
  };

  const handleOpen = (event) => {
    event.stopPropagation();
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 280,
            maxWidth: 320,
            boxShadow: `0 8px 24px ${alpha('#000', 0.12)}`,
            mt: 1,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header con info del artista mejorada */}
        <Box sx={{ 
          p: 2.5, 
          background: `linear-gradient(135deg, ${alpha(primaryColor, 0.08)} 0%, ${alpha(primaryColor, 0.02)} 100%)`,
          borderBottom: `1px solid ${alpha(primaryColor, 0.1)}`
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              src={profile?.avatar} 
              sx={{ 
                width: 56, 
                height: 56, 
                border: `3px solid ${primaryColor}`,
                boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`
              }}
            >
              {profile?.full_name?.[0] || username[0]}
            </Avatar>
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {profile?.full_name || username}
                </Typography>
                {profile?.verified && (
                  <VerifiedIcon sx={{ fontSize: 16, color: primaryColor }} />
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                @{username}
              </Typography>
              
              {/* Badge de Guinea Ecuatorial */}
              <Chip 
                label="🇬🇶 Puro talento nacional"
                size="small"
                sx={{ 
                  mt: 1,
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: alpha(primaryColor, 0.1),
                  color: primaryColor,
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </Box>
          </Stack>
          
          {/* Bio del artista si existe */}
          {profile?.bio && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1.5, 
                color: 'text.secondary', 
                fontSize: '0.75rem',
                lineHeight: 1.4,
                fontStyle: 'italic'
              }}
            >
              "{profile.bio.length > 100 ? `${profile.bio.substring(0, 100)}...` : profile.bio}"
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Género musical si existe */}
        {profile?.genre && (
          <>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Género
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {Array.isArray(profile.genre) ? (
                  profile.genre.map(g => (
                    <Chip key={g} label={g} size="small" variant="outlined" />
                  ))
                ) : (
                  <Chip label={profile.genre} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
            <Divider />
          </>
        )}

        {/* Opciones de compartir */}
        <MenuItem onClick={copyLink} sx={{ py: 1.5, gap: 2 }}>
          <ContentCopy sx={{ color: primaryColor, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>Copiar enlace</Typography>
            <Typography variant="caption" color="text.secondary">
              Comparte el perfil
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem onClick={handleOpenQR} sx={{ py: 1.5, gap: 2 }}>
          <QrCodeIcon sx={{ color: primaryColor, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>Código QR</Typography>
            <Typography variant="caption" color="text.secondary">
              Escanea para seguir al artista
            </Typography>
          </Box>
        </MenuItem>

        {/* Footer con eslogan */}
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          bgcolor: alpha(primaryColor, 0.04),
          borderTop: `1px solid ${alpha(primaryColor, 0.08)}`
        }}>
          <Typography variant="caption" sx={{ 
            color: alpha(primaryColor, 0.7),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            <span>🇬🇶</span> Talento de Guinea Ecuatorial <span>🦆</span> <span>⚡⚡</span>
          </Typography>
        </Box>
      </Menu>

      {/* Modal QR mejorado con branding */}
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
            maxWidth: 380,
            width: '100%',
            p: 3,
            borderRadius: 4,
            textAlign: 'center',
            position: 'relative',
            background: `linear-gradient(135deg, #fff 0%, ${alpha(primaryColor, 0.02)} 100%)`
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

          {/* Info del artista */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar 
              src={profile?.avatar} 
              sx={{ width: 60, height: 60, border: `2px solid ${primaryColor}` }}
            >
              {profile?.full_name?.[0] || username[0]}
            </Avatar>
            <Box textAlign="left">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {profile?.full_name || username}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                @{username} <span>🇬🇶</span>
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Escanea el código QR para ver el perfil 🦆⚡⚡
          </Typography>

          {/* QR Code */}
          <Box
            id="qr-canvas"
            sx={{
              p: 2,
              bgcolor: '#ffffff',
              borderRadius: 3,
              display: 'inline-block',
              boxShadow: `0 8px 24px ${alpha('#000', 0.1)}`,
              mb: 2
            }}
          >
            <QRCodeSVG
              value={profileUrl}
              size={200}
              bgColor="#ffffff"
              fgColor={primaryColor}
              level="H"
            />
          </Box>

          {/* Botones de acción */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadQR}
              sx={{ borderRadius: 2 }}
            >
              Descargar QR
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<ContentCopy />}
              onClick={copyLink}
              sx={{ borderRadius: 2 }}
            >
              Copiar enlace
            </Button>
          </Stack>

          {/* Footer con eslogan */}
          <Typography variant="caption" sx={{ 
            color: alpha(primaryColor, 0.6), 
            display: 'block', 
            mt: 2,
            pt: 1,
            borderTop: `1px solid ${alpha(primaryColor, 0.1)}`
          }}>
            🇬🇶 DjidjiMusic - Puro talento nacional 🦆⚡⚡
          </Typography>
        </Paper>
      </Modal>

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