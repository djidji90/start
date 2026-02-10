import React, { useState, useMemo, useEffect } from "react";
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
  Switch,
  createTheme,
  ThemeProvider,
  ListItemIcon,
  ListItemText,
  alpha
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

// Paleta naranja consistente
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
};

const Navbar = () => {
  // Estado persistente para dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('djidjimusic-darkmode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Aplicar clase al body para compatibilidad CSS global
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('djidjimusic-darkmode', JSON.stringify(newMode));
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
        transitions: {
          duration: {
            enteringScreen: 300,
            leavingScreen: 300,
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

  const isActive = (path) => 
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledAppBar position="static" darkmode={darkMode ? "true" : "false"}>
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
            >
              djidjimusic
            </Title>
          </TitleContainer>

          {/* Controles lado derecho */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Switch dark mode persistente */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {darkMode ? (
                <NightlightRoundIcon sx={{ 
                  color: alpha(colors.primary, 0.8),
                  fontSize: "1.1rem"
                }} />
              ) : (
                <WbSunnyIcon sx={{ 
                  color: alpha(colors.primary, 0.8),
                  fontSize: "1.1rem"
                }} />
              )}
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                size="small"
                sx={{
                  "& .MuiSwitch-thumb": { 
                    backgroundColor: darkMode ? "#333" : "#FFF",
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  },
                  "& .MuiSwitch-track": { 
                    backgroundColor: darkMode ? alpha(colors.primary, 0.3) : alpha(colors.primary, 0.2) 
                  },
                  '&:focus-visible .MuiSwitch-thumb': {
                    boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.3)}`,
                  }
                }}
                aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              />
            </Box>

            {/* Menú móvil */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="Abrir menú de navegación"
              onClick={handleMenuClick}
              sx={{ 
                display: { xs: "flex", md: "none" }, 
                color: darkMode ? "#FFF" : colors.primary,
                '&:focus-visible': {
                  outline: `2px solid ${colors.primary}`,
                  outlineOffset: '2px',
                }
              }}
              aria-controls="nav-menu"
              aria-expanded={Boolean(anchorEl)}
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Menú móvil con mejor UX */}
          <Menu
            id="nav-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                maxWidth: 'calc(100vw - 32px)',
                background: darkMode 
                  ? `linear-gradient(135deg, ${alpha("#1A1D29", 0.98)} 0%, ${alpha("#2D3047", 0.98)} 100%)`
                  : `linear-gradient(135deg, ${alpha("#FFF", 0.98)} 0%, ${alpha("#F8F9FA", 0.98)} 100%)`,
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha(colors.primary, 0.15)}`,
                boxShadow: `0 12px 40px ${alpha(darkMode ? "#000" : colors.primary, 0.2)}`,
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <MenuItem
                  key={item.label}
                  onClick={() => { navigate(item.path); handleMenuClose(); }}
                  sx={{
                    py: 1.75,
                    px: 2.5,
                    color: active ? colors.primary : (darkMode ? "#E2E8F0" : "#2D3047"),
                    fontWeight: active ? 600 : 400,
                    background: active 
                      ? alpha(colors.primary, darkMode ? 0.15 : 0.08) 
                      : "transparent",
                    borderLeft: active 
                      ? `3px solid ${colors.primary}`
                      : "3px solid transparent",
                    transition: "all 0.25s ease",
                    "&:hover": { 
                      background: alpha(colors.primary, darkMode ? 0.2 : 0.12),
                      borderLeft: `3px solid ${alpha(colors.primary, 0.8)}`,
                      color: colors.primary,
                      fontWeight: 500,
                    },
                    "&:focus-visible": {
                      outline: `2px solid ${alpha(colors.primary, 0.5)}`,
                      outlineOffset: '-2px',
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: active ? colors.primary : (darkMode ? "#CBD5E1" : "#3E4C59"),
                    minWidth: 40,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{ 
                      fontWeight: active ? 600 : 400,
                      fontSize: '0.95rem',
                    }}
                  />
                </MenuItem>
              );
            })}
          </Menu>

          {/* Links desktop - mejor posicionados */}
          <NavButtonsContainer>
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <NavButton
                  key={item.label}
                  component={Link}
                  to={item.path}
                  isactive={active ? "true" : "false"}
                  darkmode={darkMode ? "true" : "false"}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </NavButton>
              );
            })}
          </NavButtonsContainer>
        </Toolbar>
      </StyledAppBar>
    </ThemeProvider>
  );
};

// ---------- Estilos optimizados ----------
const StyledAppBar = styled(AppBar, { 
  shouldForwardProp: (prop) => prop !== 'darkmode' 
})(({ darkmode }) => ({
  background: darkmode === "true" 
    ? `linear-gradient(135deg, ${alpha("#1A1D29", 0.97)} 0%, ${alpha("#2D3047", 0.97)} 100%)`
    : `linear-gradient(135deg, ${alpha("#FFF", 0.97)} 0%, ${alpha("#F8F9FA", 0.97)} 100%)`,
  boxShadow: darkmode === "true" 
    ? `0 4px 24px ${alpha("#000", 0.3)}, inset 0 1px 0 ${alpha("#FFF", 0.05)}`
    : `0 4px 24px ${alpha(colors.primary, 0.1)}, inset 0 1px 0 ${alpha("#FFF", 0.9)}`,
  color: darkmode === "true" ? "#FFF" : "#2D3047",
  backdropFilter: "blur(12px)",
  borderBottom: `2px solid ${alpha(colors.primary, darkmode === "true" ? 0.12 : 0.1)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
}));

const TitleContainer = styled(Box)(({ theme }) => ({ 
  display: "flex", 
  alignItems: "center", 
  flexGrow: 1, 
  minWidth: 0, 
  gap: theme.spacing(1.5),
  '@media (max-width: 600px)': {
    gap: theme.spacing(1),
  }
}));

const Logo = styled("img", { 
  shouldForwardProp: (prop) => prop !== 'darkmode' 
})(({ darkmode }) => ({
  width: 44,
  height: "auto",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  filter: darkmode === "true" 
    ? "brightness(0.85) saturate(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))" 
    : "brightness(1) saturate(1.05) drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
  "&:hover": { 
    transform: "scale(1.08) rotate(5deg)", 
    filter: darkmode === "true"
      ? "brightness(1) saturate(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.4))"
      : "brightness(1.1) saturate(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
  },
  "@media (max-width: 600px)": {
    width: 40,
  },
}));

const Title = styled(Typography)({
  fontWeight: 700,
  letterSpacing: "0.3px",
  cursor: "pointer",
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontSize: "1.35rem",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": { 
    background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
    transform: "translateY(-1px)",
  },
  "@media (max-width: 600px)": {
    fontSize: "1.2rem",
  },
});

const NavButtonsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: { 
    display: "flex", 
    justifyContent: "center", 
    flexGrow: 1,
    marginLeft: theme.spacing(10),
    marginRight: theme.spacing(2),
  }
}));

const NavButton = styled(Button, { 
  shouldForwardProp: (prop) => prop !== 'isactive' && prop !== 'darkmode' 
})(({ isactive, darkmode }) => ({
  fontWeight: isactive === "true" ? 600 : 400,
  fontSize: "0.92rem",
  textTransform: "capitalize",
  padding: "8px 18px",
  color: isactive === "true" 
    ? colors.primary 
    : darkmode === "true" 
      ? alpha("#FFF", 0.92)
      : alpha("#2D3047", 0.85),
  position: "relative",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: "8px",
  minWidth: "auto",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 4,
    left: "50%",
    width: isactive === "true" ? "75%" : "0%",
    height: 2,
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    borderRadius: 1,
    transform: "translateX(-50%)",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: isactive === "true" ? 1 : 0,
  },
  "&:hover": {
    color: colors.primary,
    backgroundColor: darkmode === "true" 
      ? alpha(colors.primary, 0.15)
      : alpha(colors.primary, 0.08),
    transform: "translateY(-1px)",
    "&::after": { 
      width: "75%",
      opacity: 1,
    },
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&:focus-visible": {
    outline: `2px solid ${alpha(colors.primary, 0.4)}`,
    outlineOffset: "2px",
  },
  "@media (min-width: 1200px)": {
    fontSize: "0.95rem",
    padding: "8px 20px",
  },
}));

export default Navbar;