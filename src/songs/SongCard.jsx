// src/components/songs/SongCard.jsx - VERSIÓN ULTRA PREMIUM
import React, { useState } from "react";
import {
Card, CardContent, CardMedia, Typography,
IconButton, Box, Chip, Tooltip, Menu, MenuItem,
ListItemIcon, ListItemText, Divider, Snackbar, Alert,
Dialog, DialogTitle, DialogContent, DialogContentText,
DialogActions, Drawer, Fade, Zoom, alpha, useMediaQuery,
styled
} from "@mui/material";
import {
PlayArrow, Pause, Favorite, FavoriteBorder,
Download, CheckCircle, Cancel, Delete, MoreVert,
Info, Refresh, CalendarToday, Storage as StorageIcon,
Close as CloseIcon, Warning as WarningIcon,
GraphicEq as QualityIcon, Speed as SpeedIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useAudioPlayer } from "../components/hook/services/usePlayer";
import useDownload from "../components/hook/services/useDownload";

// ============================================ //
// SISTEMA DE DISEÑO PREMIUM AVANZADO
// ============================================ //
const designTokens = {
colors: {
primary: '#FF6B35',
success: '#10B981',
error: '#EF4444',
warning: '#F59E0B',
gray: {
50: '#F9FAFB',
100: '#F3F4F6',
200: '#E5E7EB',
300: '#D1D5DB',
400: '#9CA3AF',
500: '#6B7280',
600: '#4B5563',
700: '#374151',
800: '#1F2937',
900: '#111827'
}
},
shadows: {
card: '0 4px 20px -2px rgba(0,0,0,0.06)',
hover: '0 12px 28px -8px rgba(0,0,0,0.12)',
button: '0 4px 12px rgba(0,0,0,0.08)',
drawer: '0 -8px 32px rgba(0,0,0,0.08)'
},
borderRadius: {
card: 16,
button: 999,
menu: 12,
dialog: 20,
chip: 6
},
animation: {
default: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
smooth: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
bounce: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
}
};

// ============================================ //
// COMPONENTES STYLED
// ============================================ //
const ProgressBar = styled(Box)(({ value, color }) => ({
position: 'absolute',
top: 0,
left: 0,
right: 0,
height: 3,
zIndex: 10,
backgroundColor: alpha(color, 0.1),
overflow: 'hidden',
'&::after': {
content: '""',
position: 'absolute',
top: 0,
left: 0,
height: '100%',
width: ${value}%,
backgroundColor: color,
transition: 'width 0.3s linear',
backgroundImage: linear-gradient(90deg, ${alpha(color, 0.8)} 0%, ${color} 100%)
}
}));

const StatusDot = styled(Box)(({ color, isActive }) => ({
width: 10,
height: 10,
borderRadius: '50%',
backgroundColor: color,
position: 'absolute',
top: 12,
left: 12,
zIndex: 2,
boxShadow: '0 0 0 2px white',
animation: isActive ? 'pulse 2s infinite' : 'none',
'@keyframes pulse': {
'0%': { boxShadow: '0 0 0 2px white, 0 0 0 0 rgba(255,255,255,0.7)' },
'70%': { boxShadow: '0 0 0 2px white, 0 0 0 8px rgba(255,255,255,0)' },
'100%': { boxShadow: '0 0 0 2px white, 0 0 0 0 rgba(255,255,255,0)' }
}
}));

const MainButton = styled(IconButton)(({ theme, color, isActive }) => ({
position: 'absolute',
bottom: 16,
right: 16,
width: 56,
height: 56,
backgroundColor: alpha('#FFFFFF', 0.98),
color: color,
boxShadow: designTokens.shadows.button,
backdropFilter: 'blur(8px)',
border: 1px solid ${alpha(color, 0.2)},
transition: all ${designTokens.animation.bounce},
transform: isActive ? 'scale(1)' : 'scale(0.9)',
opacity: isActive ? 1 : 0,
'&:hover': {
backgroundColor: '#FFFFFF',
transform: 'scale(1.08)',
boxShadow: 0 16px 32px -12px ${alpha(color, 0.4)},
borderColor: alpha(color, 0.4)
}
}));

const MetadataChip = styled(Chip)({
height: 24,
fontSize: '0.7rem',
borderRadius: designTokens.borderRadius.chip,
backgroundColor: alpha(designTokens.colors.gray[500], 0.08),
color: designTokens.colors.gray[600],
'& .MuiChip-label': {
px: 1
}
});

// ============================================ //
// COMPONENTE PRINCIPAL
// ============================================ //
const SongCard = ({ song, showIndex = false, onLike, onMoreActions }) => {
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const [liked, setLiked] = useState(false);
const [isHovered, setIsHovered] = useState(false);
const [imageError, setImageError] = useState(false);
const [anchorEl, setAnchorEl] = useState(null);
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
const [downloadInfoDialog, setDownloadInfoDialog] = useState(false);

// Hooks
const player = useAudioPlayer();
const download = useDownload();

// Estados de la canción
const songStatus = player.getSongStatus(song.id);
const songId = song.id.toString();
const isDownloading = download.downloading[songId];
const downloadProgress = download.progress[songId] || 0;
const downloadError = download.errors[songId];
const isDownloaded = download.isDownloaded(songId);
const downloadInfo = isDownloaded ? download.getDownloadInfo(songId) : null;

// Determinar estado principal
const getPrimaryState = () => {
if (songStatus.isLoading) return 'loading';
if (isDownloading) return 'downloading';
if (downloadError) return 'error';
if (isDownloaded) return 'downloaded';
if (songStatus.isCurrent) return songStatus.isPlaying ? 'playing' : 'paused';
return 'idle';
};

const primaryState = getPrimaryState();
const isActive = primaryState !== 'idle' || isHovered;

// Colores por estado
const stateColors = {
idle: designTokens.colors.primary,
playing: '#F50057',
paused: '#00838F',
loading: designTokens.colors.warning,
downloading: designTokens.colors.success,
downloaded: designTokens.colors.success,
error: designTokens.colors.error
};

const currentColor = stateColors[primaryState];

// Tooltip por estado
const getTooltipText = () => {
switch (primaryState) {
case 'loading': return ${songStatus.loadingMessage || 'Cargando'} ${songStatus.loadingProgress}%;
case 'playing':
const current = player.formatTime(songStatus.playbackCurrentTime);
const total = player.formatTime(songStatus.playbackDuration);
return ${current} / ${total};
case 'paused': return 'Pausada';
case 'downloading': return Descargando ${downloadProgress}%;
case 'error': return Error: ${downloadError};
case 'downloaded':
const date = downloadInfo ? new Date(downloadInfo.downloadedAt).toLocaleDateString() : '';
return Descargada el ${date};
default: return ${song.title} · ${song.artist};
}
};

// Determinar ícono del botón principal
const getButtonIcon = () => {
if (songStatus.isLoading || isDownloading) return null;
if (primaryState === 'playing') return <Pause />;
if (primaryState === 'paused') return <PlayArrow />;
if (downloadError) return <Refresh />;
return <PlayArrow />;
};

// Manejar clic en botón principal
const handleMainButtonClick = async (e) => {
e.stopPropagation();

if (isDownloading) {  
  handleCancelDownload(e);  
  return;  
}  

if (downloadError) {  
  handleRetryDownload(e);  
  return;  
}  

if (songStatus.isCurrent) {  
  player.toggle();  
} else {  
  await player.playSongFromCard(song);  
}

};

// Handlers de descarga
const handleDownload = async (e) => {
e.stopPropagation();
handleMenuClose();

try {  
  setSnackbar({ open: true, message: `Descargando ${song.title}...`, severity: 'info' });  
  await download.downloadSong(songId, song.title, song.artist);  
  setSnackbar({ open: true, message: 'Canción descargada', severity: 'success' });  
} catch (error) {  
  setSnackbar({ open: true, message: 'Error en descarga', severity: 'error' });  
}

};

const handleCancelDownload = (e) => {
e.stopPropagation();
download.cancelDownload(songId);
setSnackbar({ open: true, message: 'Descarga cancelada', severity: 'info' });
};

const handleRetryDownload = (e) => {
e.stopPropagation();
download.clearError(songId);
handleDownload(e);
};

const handleRemoveDownload = () => {
setConfirmDialogOpen(false);
download.removeDownload(songId);
setSnackbar({ open: true, message: 'Eliminada del dispositivo', severity: 'success' });
};

// Menú
const handleMenuOpen = (event) => {
event.stopPropagation();
setAnchorEl(event.currentTarget);
};

const handleMenuClose = () => setAnchorEl(null);

// Información de descarga
const fileSize = downloadInfo ? (downloadInfo.fileSize / (1024 * 1024)).toFixed(1) : '0';
const downloadDate = downloadInfo ? new Date(downloadInfo.downloadedAt).toLocaleString() : '';

// URL de imagen
const imageUrl = imageError || !song.image_url ? "/djidji.png" : song.image_url;

// Metadata adicional (ejemplo)
const bitrate = song.bitrate || '320kbps';
const quality = song.quality || 'HD';

// ============================================ //
// MENÚ PREMIUM
// ============================================ //
const renderMenu = () => {
const menuItems = [
!isDownloading && !downloadError && !isDownloaded && {
label: 'Descargar',
icon: <Download fontSize="small" />,
onClick: handleDownload
},
isDownloading && {
label: 'Cancelar descarga',
icon: <Cancel fontSize="small" />,
onClick: handleCancelDownload,
color: designTokens.colors.error,
progress: ${downloadProgress}%
},
downloadError && {
label: 'Reintentar',
icon: <Refresh fontSize="small" />,
onClick: handleRetryDownload,
color: designTokens.colors.warning
},
isDownloaded && {
label: 'Información',
icon: <Info fontSize="small" />,
onClick: () => {
setDownloadInfoDialog(true);
handleMenuClose();
}
},
isDownloaded && {
label: 'Eliminar del dispositivo',
icon: <Delete fontSize="small" />,
onClick: () => {
setConfirmDialogOpen(true);
handleMenuClose();
},
color: designTokens.colors.error
},
(isDownloading || downloadError || isDownloaded) && { divider: true },
{
label: liked ? 'Quitar de favoritos' : 'Añadir a favoritos',
icon: liked ? <Favorite fontSize="small" color="error" /> : <FavoriteBorder fontSize="small" />,
onClick: (e) => {
e.stopPropagation();
handleMenuClose();
const newLikedState = !liked;
setLiked(newLikedState);
onLike?.(song.id, newLikedState);
}
}
].filter(Boolean);

// Mobile: Bottom Sheet  
if (isMobile) {  
  return (  
    <Drawer  
      anchor="bottom"  
      open={Boolean(anchorEl)}  
      onClose={handleMenuClose}  
      PaperProps={{  
        sx: {  
          borderTopLeftRadius: designTokens.borderRadius.dialog,  
          borderTopRightRadius: designTokens.borderRadius.dialog,  
          maxWidth: 480,  
          mx: 'auto'  
        }  
      }}  
    >  
      <Box sx={{ p: 2 }}>  
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>  
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Opciones</Typography>  
          <IconButton onClick={handleMenuClose} size="small">  
            <CloseIcon />  
          </IconButton>  
        </Box>  
          
        {menuItems.map((item, index) => (  
          item.divider ? (  
            <Divider key={`divider-${index}`} sx={{ my: 1.5 }} />  
          ) : (  
            <Box  
              key={item.label}  
              onClick={item.onClick}  
              role="menuitem"  
              tabIndex={0}  
              aria-label={item.label}  
              sx={{  
                display: 'flex',  
                alignItems: 'center',  
                justifyContent: 'space-between',  
                p: 2,  
                borderRadius: designTokens.borderRadius.menu,  
                cursor: 'pointer',  
                color: item.color,  
                '&:hover': { bgcolor: alpha(item.color || designTokens.colors.primary, 0.04) },  
                '&:focus': { outline: `2px solid ${designTokens.colors.primary}` }  
              }}  
            >  
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>  
                <ListItemIcon sx={{ minWidth: 40, color: item.color }}>  
                  {item.icon}  
                </ListItemIcon>  
                <ListItemText   
                  primary={item.label}  
                  primaryTypographyProps={{ fontWeight: 500 }}  
                />  
              </Box>  
              {item.progress && (  
                <Typography variant="caption" color="text.secondary">  
                  {item.progress}  
                </Typography>  
              )}  
            </Box>  
          )  
        ))}  
      </Box>  
    </Drawer>  
  );  
}  

// Desktop: Menu  
return (  
  <Menu  
    anchorEl={anchorEl}  
    open={Boolean(anchorEl)}  
    onClose={handleMenuClose}  
    onClick={(e) => e.stopPropagation()}  
    PaperProps={{  
      sx: {  
        borderRadius: designTokens.borderRadius.menu,  
        minWidth: 220,  
        boxShadow: designTokens.shadows.drawer,  
        mt: 1  
      }  
    }}  
  >  
    {menuItems.map((item, index) => (  
      item.divider ? (  
        <Divider key={`divider-${index}`} sx={{ my: 1 }} />  
      ) : (  
        <MenuItem   
          key={item.label}   
          onClick={item.onClick}  
          sx={{ py: 1.5, px: 2 }}  
          aria-label={item.label}  
        >  
          <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>  
            {item.icon}  
          </ListItemIcon>  
          <ListItemText   
            primary={item.label}  
            primaryTypographyProps={{ fontWeight: 500 }}  
          />  
          {item.progress && (  
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>  
              {item.progress}  
            </Typography>  
          )}  
        </MenuItem>  
      )  
    ))}  
  </Menu>  
);

};

// ============================================ //
// DIALOGOS PREMIUM
// ============================================ //
const renderDialogs = () => (
<>
{/* Confirmar eliminación */}
<Dialog
open={confirmDialogOpen}
onClose={() => setConfirmDialogOpen(false)}
PaperProps={{
sx: {
borderRadius: designTokens.borderRadius.dialog,
maxWidth: 400,
p: 1
}
}}
aria-labelledby="delete-dialog-title"
aria-describedby="delete-dialog-description"
>
<DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
<Delete sx={{ color: designTokens.colors.error }} />
<Typography variant="h6" sx={{ fontWeight: 700 }}>Eliminar canción</Typography>
</Box>
</DialogTitle>
<DialogContent>
<DialogContentText id="delete-dialog-description">
¿Eliminar "{song.title}" de tu dispositivo? Podrás volver a descargarla cuando quieras.
</DialogContentText>
</DialogContent>
<DialogActions sx={{ p: 2, pt: 0 }}>
<Button
onClick={() => setConfirmDialogOpen(false)}
sx={{ borderRadius: designTokens.borderRadius.button }}
aria-label="Cancelar eliminación"
>
Cancelar
</Button>
<Button
onClick={handleRemoveDownload}
variant="contained"
color="error"
sx={{
borderRadius: designTokens.borderRadius.button,
background: designTokens.colors.error,
'&:hover': { background: alpha(designTokens.colors.error, 0.9) }
}}
aria-label="Confirmar eliminación"
>
Eliminar
</Button>
</DialogActions>
</Dialog>

{/* Información de descarga */}  
  <Dialog  
    open={downloadInfoDialog}  
    onClose={() => setDownloadInfoDialog(false)}  
    PaperProps={{  
      sx: {  
        borderRadius: designTokens.borderRadius.dialog,  
        maxWidth: 400  
      }  
    }}  
    aria-labelledby="info-dialog-title"  
  >  
    <DialogTitle id="info-dialog-title" sx={{ pb: 1 }}>Información de descarga</DialogTitle>  
    <DialogContent>  
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>  
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>  
          <CheckCircle sx={{ color: designTokens.colors.success, fontSize: 20 }} />  
          <Typography variant="body2">{downloadInfo?.fileName || song.title}</Typography>  
        </Box>  
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>  
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>  
            <StorageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />  
            <Typography variant="body2" color="text.secondary">{fileSize} MB</Typography>  
          </Box>  
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>  
            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />  
            <Typography variant="body2" color="text.secondary">{downloadDate}</Typography>  
          </Box>  
        </Box>  
      </Box>  
    </DialogContent>  
    <DialogActions>  
      <Button onClick={() => setDownloadInfoDialog(false)} aria-label="Cerrar información">  
        Cerrar  
      </Button>  
    </DialogActions>  
  </Dialog>  
</>

);

return (
<>
<Card
onClick={(e) => !e.target.closest('button') && !e.target.closest('.MuiMenu-paper') && handleMainButtonClick(e)}
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
sx={{
borderRadius: designTokens.borderRadius.card,
overflow: "hidden",
cursor: "pointer",
bgcolor: theme.palette.mode === 'dark' ? designTokens.colors.gray[800] : "#FFFFFF",
border: 1px solid ${alpha(designTokens.colors.gray[300], 0.2)},
boxShadow: isHovered ? designTokens.shadows.hover : designTokens.shadows.card,
transition: all ${designTokens.animation.default},
position: "relative"
}}
>
{/* Barra de progreso superior */}
{(songStatus.isLoading || isDownloading) && (
<Fade in={true}>
<ProgressBar
value={songStatus.isLoading ? songStatus.loadingProgress : downloadProgress}
color={currentColor}
/>
</Fade>
)}

{/* Indicador de estado con animación */}  
    {(primaryState !== 'idle') && (  
      <StatusDot   
        color={currentColor}   
        isActive={primaryState === 'playing' || primaryState === 'downloading'}  
      />  
    )}  

    <Box sx={{ position: "relative" }}>  
      <CardMedia  
        component="img"  
        height={isMobile ? 180 : 220}  
        image={imageUrl}  
        alt={`Portada de ${song.title} por ${song.artist}`}  
        onError={() => setImageError(true)}  
        sx={{  
          objectFit: "cover",  
          opacity: (songStatus.isLoading || isDownloading) ? 0.7 : 1,  
          transition: `opacity ${designTokens.animation.default}`,  
          backgroundColor: imageError ? alpha(designTokens.colors.primary, 0.1) : "transparent"  
        }}  
      />  

      {/* Overlay de progreso con gradiente */}  
      {(songStatus.isLoading || isDownloading) && (  
        <Box  
          sx={{  
            position: "absolute",  
            top: 0,  
            left: 0,  
            right: 0,  
            bottom: 0,  
            background: `linear-gradient(135deg,   
              ${alpha(currentColor, 0.1)} 0%,   
              ${alpha('#000000', 0.2)} 100%)`,  
            pointerEvents: "none"  
          }}  
        />  
      )}  

      {/* Botón principal */}  
      <Tooltip title={getTooltipText()} arrow placement="top">  
        <MainButton  
          onClick={handleMainButtonClick}  
          color={currentColor}  
          isActive={isActive}  
          aria-label={getTooltipText()}  
          aria-pressed={primaryState === 'playing'}  
        >  
          {(songStatus.isLoading || isDownloading) ? (  
            <Box sx={{ position: 'relative', width: 28, height: 28 }}>  
              <CircularProgress  
                size={28}  
                value={songStatus.isLoading ? songStatus.loadingProgress : downloadProgress}  
                variant="determinate"  
                sx={{  
                  color: currentColor,  
                  position: 'absolute',  
                  '& .MuiCircularProgress-circle': {  
                    transition: 'stroke-dashoffset 0.3s ease'  
                  }  
                }}  
              />  
            </Box>  
          ) : (  
            getButtonIcon()  
          )}  
        </MainButton>  
      </Tooltip>  
    </Box>  

    {/* Contenido */}  
    <CardContent sx={{ p: 2.5 }}>  
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>  
        {/* Índice */}  
        {showIndex && (  
          <Box  
            sx={{  
              width: 28,  
              height: 28,  
              borderRadius: "50%",  
              bgcolor: alpha(currentColor, 0.1),  
              display: "flex",  
              alignItems: "center",  
              justifyContent: "center",  
              flexShrink: 0  
            }}  
          >  
            <Typography  
              variant="caption"  
              sx={{ color: currentColor, fontWeight: 600 }}  
              aria-label={`Canción número ${showIndex}`}  
            >  
              {showIndex}  
            </Typography>  
          </Box>  
        )}  

        {/* Información principal */}  
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>  
          <Typography  
            variant="subtitle1"  
            sx={{  
              fontWeight: 700,  
              lineHeight: 1.2,  
              mb: 0.5,  
              color: downloadError ? designTokens.colors.error : "text.primary",  
              overflow: "hidden",  
              textOverflow: "ellipsis",  
              whiteSpace: "nowrap"  
            }}  
          >  
            {song.title}  
          </Typography>  

          <Typography  
            variant="body2"  
            sx={{  
              color: "text.secondary",  
              mb: 1,  
              overflow: "hidden",  
              textOverflow: "ellipsis",  
              whiteSpace: "nowrap"  
            }}  
          >  
            {song.artist}  
          </Typography>  

          {/* Metadatos flexibles */}  
          <Box sx={{   
            display: "flex",   
            alignItems: "center",   
            gap: 1,  
            flexWrap: "wrap"  
          }}>  
            {song.genre && (  
              <MetadataChip  
                label={song.genre}  
                size="small"  
              />  
            )}  
              
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>  
              <AccessTime sx={{ fontSize: 14, color: designTokens.colors.gray[400] }} />  
              <Typography variant="caption" sx={{ color: designTokens.colors.gray[500] }}>  
                {player.formatTime(song.duration)}  
              </Typography>  
            </Box>  

            {bitrate && (  
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>  
                <SpeedIcon sx={{ fontSize: 14, color: designTokens.colors.gray[400] }} />  
                <Typography variant="caption" sx={{ color: designTokens.colors.gray[500] }}>  
                  {bitrate}  
                </Typography>  
              </Box>  
            )}  

            {quality && (  
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>  
                <QualityIcon sx={{ fontSize: 14, color: designTokens.colors.gray[400] }} />  
                <Typography variant="caption" sx={{ color: designTokens.colors.gray[500] }}>  
                  {quality}  
                </Typography>  
              </Box>  
            )}  

            {/* Indicador de descarga sutil */}  
            {isDownloaded && (  
              <Tooltip title="Descargada" arrow>  
                <CheckCircle   
                  sx={{   
                    fontSize: 16,   
                    color: designTokens.colors.success,  
                    ml: 'auto'  
                  }}   
                />  
              </Tooltip>  
            )}  
          </Box>  
        </Box>  

        {/* Botón de opciones */}  
        <Tooltip title="Más opciones" arrow>  
          <IconButton  
            size="small"  
            onClick={handleMenuOpen}  
            aria-label="Más opciones"  
            aria-haspopup="true"  
            aria-expanded={Boolean(anchorEl)}  
            sx={{  
              color: "text.secondary",  
              "&:hover": {  
                bgcolor: alpha(designTokens.colors.primary, 0.08)  
              }  
            }}  
          >  
            <MoreVert />  
          </IconButton>  
        </Tooltip>  
      </Box>  
    </CardContent>  
  </Card>  

  {/* Menú adaptativo */}  
  {renderMenu()}  

  {/* Diálogos */}  
  {renderDialogs()}  

  {/* Snackbar minimal */}  
  <Snackbar  
    open={snackbar.open}  
    autoHideDuration={3000}  
    onClose={() => setSnackbar({ ...snackbar, open: false })}  
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}  
  >  
    <Alert  
      onClose={() => setSnackbar({ ...snackbar, open: false })}  
      severity={snackbar.severity}  
      iconMapping={{  
        success: <CheckCircle fontSize="small" />,  
        error: <WarningIcon fontSize="small" />,  
        info: <Info fontSize="small" />  
      }}  
      sx={{  
        borderRadius: designTokens.borderRadius.button,  
        boxShadow: designTokens.shadows.drawer,  
        '& .MuiAlert-message': { fontWeight: 500 }  
      }}  
      aria-live="polite"  
    >  
      {snackbar.message}  
    </Alert>  
  </Snackbar>  
</>

);
};

export default React.memo(SongCard);