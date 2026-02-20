// ============================================
// components/Navbar.jsx - VERSIÓN MEJORADA
// ============================================

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  styled,
  CssBaseline,
  useMediaQuery,
  Switch,
  createTheme,
  ThemeProvider,
  ListItemIcon,
  ListItemText,
  alpha,
  Badge,
  Tooltip,
  Chip,
  CircularProgress,
  Popper,
  Paper,
  Fade
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import djidji from "../assets/imagenes/djidji.png";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import StoreIcon from "@mui/icons-material/Store";
import SearchIcon from "@mui/icons-material/Search";
import ExploreIcon from "@mui/icons-material/Explore";
import DownloadIcon from "@mui/icons-material/Download";
import DownloadingIcon from "@mui/icons-material/Downloading";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ErrorIcon from "@mui/icons-material/Error";
import useDownload from "../components/hook/services/useDownload"; // ✅ Importar hook real
import useOffline from "../components/hook/services/useOffline"; // ✅ Para estado offline

// Paleta naranja consistente con Login
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
};

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [downloadAnchor, setDownloadAnchor] = useState(null); // ✅ Para popover de descargas
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Usar hooks reales en lugar de window.downloadAPI
  const download = useDownload();
  const { isOnline, isWifi } = useOffline();

  // ✅ Estados derivados
  const downloadCount = download.getAllDownloads()?.length || 0;
  const activeDownloadsCount = Object.keys(download.downloading || {}).length;
  const queueCount = download.queue?.length || 0;
  const hasDownloads = downloadCount > 0 || activeDownloadsCount > 0;

  // ✅ Calcular total en progreso (activas + cola)
  const totalInProgress = activeDownloadsCount + queueCount;

  // ✅ Obtener lista de descargas activas para el popover
  const getActiveDownloadsList = useCallback(() => {
    const active = [];
    
    // Descargas activas
    Object.entries(download.downloading || {}).forEach(([id]) => {
      const info = download.getDownloadInfo?.(id);
      active.push({
        id,
        title: info?.title || 'Descargando...',
        artist: info?.artist || '',
        progress: download.progress?.[id] || 0,
        status: 'downloading'
      });
    });

    // Cola
    (download.queue || []).forEach((item, index) => {
      active.push({
        id: item.songId,
        title: item.songTitle,
        artist: item.artistName,
        progress: 0,
        status: 'queued',
        position: index + 1
      });
    });

    return active.slice(0, 5); // Mostrar solo primeras 5
  }, [download]);

  const activeDownloadsList = getActiveDownloadsList();

  // ✅ Manejar popover
  const handleDownloadClick = (event) => {
    setDownloadAnchor(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setDownloadAnchor(null);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: colors.primary,
            light: colors.primaryLight,
            dark: colors.primaryDark,
          },
        },
      }),
    [darkMode]
  );

  const menuItems = [
    { label: "Inicio", path: "/", icon: <HomeIcon /> },
    { label: "Nosotros", path: "/AboutUs", icon: <InfoIcon /> },
    { label: "Tienda", path: "/Todo", icon: <StoreIcon /> },
    { label: "Búsqueda", path: "/MainPage", icon: <SearchIcon /> },
    { label: "Descubre", path: "/TechStyleHub", icon: <ExploreIcon /> },
  ];

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const open = Boolean(downloadAnchor);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledAppBar position="sticky" darkmode={darkMode ? "true" : "false"}>
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo y título */}
          <TitleContainer>
            <Logo 
              src={djidji} 
              alt="Logo djidjimusic" 
              onClick={() => navigate("/")}
              darkmode={darkMode ? "true" : "false"}
            />
            <Title 
              variant="h6" 
              onClick={() => navigate("/")}
              darkmode={darkMode ? "true" : "false"}
            >
              djidjimusic
            </Title>
          </TitleContainer>

          {/* Controles lado derecho */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            
            {/* ✅ BOTÓN DE DESCARGA MEJORADO */}
            <Tooltip title={
              hasDownloads 
                ? `${downloadCount} descargadas • ${totalInProgress} en progreso` 
                : "Mis Descargas"
            }>
              <IconButton
                onClick={handleDownloadClick}
                onMouseEnter={handleDownloadClick}
                sx={{
                  color: isActive('/downloads') ? colors.primary : 'inherit',
                  position: 'relative',
                  '&:hover': {
                    color: colors.primary,
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Badge 
                  badgeContent={downloadCount} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: colors.primary,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      minWidth: 18,
                      height: 18,
                      animation: hasDownloads ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' },
                      }
                    }
                  }}
                >
                  <DownloadIcon />
                </Badge>
                
                {/* Indicador de descargas activas */}
                {activeDownloadsCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: colors.primary,
                      animation: 'pulseActive 1.5s infinite',
                      '@keyframes pulseActive': {
                        '0%': { transform: 'scale(1)', opacity: 1 },
                        '50%': { transform: 'scale(1.5)', opacity: 0.7 },
                        '100%': { transform: 'scale(1)', opacity: 1 },
                      }
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

            {/* ✅ POPOVER DE DESCARGA - VISTA PREVIA */}
            <Popper 
              open={open} 
              anchorEl={downloadAnchor}
              placement="bottom-end"
              transition
              sx={{ zIndex: 9999 }}
              onMouseLeave={handleDownloadClose}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Paper
                    sx={{
                      mt: 1,
                      minWidth: 280,
                      maxWidth: 320,
                      background: darkMode ? alpha("#1A1D29", 0.98) : alpha("#FFF", 0.98),
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${alpha(colors.primary, 0.2)}`,
                      boxShadow: `0 8px 32px ${alpha(darkMode ? "#000" : colors.primary, 0.2)}`,
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}
                  >
                    {/* Header del popover */}
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Mis Descargas
                      </Typography>
                      <Chip 
                        size="small"
                        label={`${downloadCount} canciones`}
                        sx={{ 
                          bgcolor: alpha(colors.primary, 0.1),
                          color: colors.primary,
                          fontWeight: 600
                        }}
                      />
                    </Box>

                    {/* Lista de descargas activas */}
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {activeDownloadsList.length > 0 ? (
                        activeDownloadsList.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              p: 1.5,
                              borderBottom: `1px solid ${alpha(colors.primary, 0.05)}`,
                              '&:hover': { bgcolor: alpha(colors.primary, 0.02) }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              {item.status === 'downloading' ? (
                                <DownloadingIcon sx={{ fontSize: 16, color: colors.primary }} />
                              ) : (
                                <PendingIcon sx={{ fontSize: 16, color: colors.warning }} />
                              )}
                              <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>
                                {item.title}
                              </Typography>
                              {item.status === 'queued' && (
                                <Chip 
                                  label={`#${item.position}`}
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.6rem' }}
                                />
                              )}
                            </Box>
                            
                            {item.artist && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', ml: 3 }}>
                                {item.artist}
                              </Typography>
                            )}
                            
                            {item.status === 'downloading' && (
                              <Box sx={{ ml: 3, mt: 0.5 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={item.progress}
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: alpha(colors.primary, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: colors.primary
                                    }
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: colors.primary, mt: 0.25, display: 'block' }}>
                                  {item.progress}%
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          {downloadCount > 0 ? (
                            <>
                              <CheckCircleIcon sx={{ fontSize: 40, color: colors.success, mb: 1, opacity: 0.5 }} />
                              <Typography variant="body2" color="text.secondary">
                                {downloadCount} canciones descargadas
                              </Typography>
                            </>
                          ) : (
                            <>
                              <DownloadIcon sx={{ fontSize: 40, color: alpha(colors.primary, 0.3), mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                No hay descargas
                              </Typography>
                            </>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Footer con acción */}
                    <Box sx={{ 
                      p: 1.5, 
                      borderTop: `1px solid ${alpha(colors.primary, 0.1)}`,
                      display: 'flex',
                      gap: 1
                    }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={() => {
                          navigate('/downloads');
                          handleDownloadClose();
                        }}
                        sx={{
                          bgcolor: colors.primary,
                          '&:hover': { bgcolor: colors.primaryDark },
                          textTransform: 'none',
                          borderRadius: 2
                        }}
                      >
                        Ver todas
                      </Button>
                      {activeDownloadsCount > 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => {
                            // Cancelar todas? O mostrar opciones
                            handleDownloadClose();
                          }}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Fade>
              )}
            </Popper>

            {/* Switch dark mode */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {darkMode ? (
                <NightlightRoundIcon sx={{ color: alpha(colors.primary, 0.8) }} />
              ) : (
                <WbSunnyIcon sx={{ color: alpha(colors.primary, 0.8) }} />
              )}
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                size="small"
                sx={{
                  "& .MuiSwitch-thumb": { backgroundColor: darkMode ? "#333" : "#FFF" },
                  "& .MuiSwitch-track": { backgroundColor: darkMode ? alpha(colors.primary, 0.3) : alpha(colors.primary, 0.2) },
                }}
              />
            </Box>

            {/* Menú móvil */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
              sx={{ display: { xs: "flex", md: "none" }, color: darkMode ? "#FFF" : colors.primary }}
              aria-controls="nav-menu"
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Menú móvil */}
          <Menu
            id="nav-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                background: darkMode ? alpha("#1A1D29", 0.95) : alpha("#FFF", 0.95),
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                boxShadow: `0 8px 32px ${alpha(darkMode ? "#000" : colors.primary, 0.15)}`,
              }
            }}
          >
            {/* Item de descargas en móvil */}
            <MenuItem
              onClick={() => { navigate('/downloads'); handleMenuClose(); }}
              sx={{
                py: 1.5,
                px: 2,
                color: isActive('/downloads') ? colors.primary : "inherit",
                fontWeight: isActive('/downloads') ? 600 : 400,
                background: isActive('/downloads') ? alpha(colors.primary, darkMode ? 0.15 : 0.08) : "transparent",
                borderLeft: isActive('/downloads') ? `3px solid ${colors.primary}` : "3px solid transparent",
                borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
              }}
            >
              <ListItemIcon sx={{ color: isActive('/downloads') ? colors.primary : "inherit", minWidth: 36 }}>
                <Badge badgeContent={downloadCount} color="primary">
                  <DownloadIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary="Mis Descargas" 
                secondary={totalInProgress > 0 ? `${totalInProgress} en progreso` : null}
                secondaryTypographyProps={{ color: colors.primary }}
              />
            </MenuItem>

            {/* Resto de items */}
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={() => { navigate(item.path); handleMenuClose(); }}
                sx={{
                  py: 1.5,
                  px: 2,
                  color: isActive(item.path) ? colors.primary : "inherit",
                  fontWeight: isActive(item.path) ? 600 : 400,
                  background: isActive(item.path) ? alpha(colors.primary, darkMode ? 0.15 : 0.08) : "transparent",
                  borderLeft: isActive(item.path) ? `3px solid ${colors.primary}` : "3px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": { background: alpha(colors.primary, darkMode ? 0.2 : 0.1), borderLeft: `3px solid ${alpha(colors.primary, 0.7)}` }
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? colors.primary : "inherit", minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </MenuItem>
            ))}
          </Menu>

          {/* Links desktop */}
          <NavButtonsContainer>
            {/* Link de descargas desktop */}
            <NavButton
              component={Link}
              to="/downloads"
              isactive={isActive('/downloads') ? "true" : "false"}
              darkmode={darkMode ? "true" : "false"}
              startIcon={
                <Badge badgeContent={downloadCount} color="primary">
                  <DownloadIcon />
                </Badge>
              }
            >
              Mis Descargas
              {totalInProgress > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 0.75,
                    py: 0.25,
                    fontSize: '0.7rem',
                    bgcolor: alpha(colors.primary, 0.2),
                    color: colors.primary,
                    borderRadius: 1,
                    fontWeight: 600
                  }}
                >
                  {totalInProgress}
                </Box>
              )}
            </NavButton>

            {menuItems.map((item) => (
              <NavButton
                key={item.label}
                component={Link}
                to={item.path}
                isactive={isActive(item.path) ? "true" : "false"}
                darkmode={darkMode ? "true" : "false"}
                startIcon={item.icon}
              >
                {item.label}
              </NavButton>
            ))}
          </NavButtonsContainer>
        </Toolbar>
      </StyledAppBar>
    </ThemeProvider>
  );
};

// ---------- Estilos (sin cambios) ----------
const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'darkmode' })(({ darkmode }) => ({
  background: darkmode === "true" ? alpha("#1A1D29", 0.95) : alpha("#FFF", 0.98),
  boxShadow: darkmode === "true" ? `0 4px 20px ${alpha("#000", 0.25)}` : `0 4px 20px ${alpha(colors.primary, 0.08)}`,
  color: darkmode === "true" ? "#FFF" : "#2D3047",
  backdropFilter: "blur(10px)",
  borderBottom: `2px solid ${alpha(colors.primary, darkmode === "true" ? 0.1 : 0.08)}`,
  transition: "all 0.3s ease",
}));

const TitleContainer = styled(Box)(({ theme }) => ({ display: "flex", alignItems: "center", flexGrow: 1, minWidth: 0, gap: theme.spacing(1) }));

const Logo = styled("img", { shouldForwardProp: (prop) => prop !== 'darkmode' })(({ darkmode }) => ({
  width: 42,
  height: "auto",
  cursor: "pointer",
  transition: "all 0.3s ease",
  filter: darkmode === "true" ? "brightness(0.9) saturate(1.2)" : "brightness(1) saturate(1.1)",
  "&:hover": { transform: "scale(1.05) rotate(5deg)", filter: darkmode === "true" ? "brightness(1.1) saturate(1.3)" : "brightness(1.1) saturate(1.2)" },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: "0.5px",
  cursor: "pointer",
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontSize: "1.3rem",
  transition: "all 0.3s ease",
  "&:hover": { background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)` },
}));

const NavButtonsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  gap: theme.spacing(1),
  [theme.breakpoints.up("md")]: { display: "flex", justifyContent: "center", flexGrow: 1 }
}));

const NavButton = styled(Button, { shouldForwardProp: (prop) => prop !== 'isactive' && prop !== 'darkmode' })(({ isactive, darkmode }) => ({
  fontWeight: isactive === "true" ? 600 : 400,
  fontSize: "0.9rem",
  textTransform: "capitalize",
  padding: "6px 16px",
  color: isactive === "true" ? colors.primary : darkmode === "true" ? alpha("#FFF", 0.9) : alpha("#2D3047", 0.8),
  position: "relative",
  transition: "all 0.3s ease",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 2,
    left: "50%",
    width: isactive === "true" ? "70%" : "0%",
    height: 2,
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    borderRadius: 1,
    transform: "translateX(-50%)",
    transition: "all 0.3s ease",
  },
  "&:hover": {
    color: colors.primary,
    backgroundColor: "transparent",
    "&::after": { width: "70%" },
  },
}));

// Componente LinearProgress local para no importar
const LinearProgress = ({ variant, value, sx }) => (
  <Box sx={{ ...sx, position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      bgcolor: alpha(colors.primary, 0.1),
      borderRadius: sx?.borderRadius
    }}>
      <Box sx={{ 
        width: `${value}%`, 
        height: '100%', 
        bgcolor: colors.primary,
        borderRadius: sx?.borderRadius,
        transition: 'width 0.3s ease'
      }} />
    </Box>
  </Box>
);

export default Navbar;