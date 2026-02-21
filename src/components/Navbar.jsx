// ============================================
// components/Navbar.jsx - VERSIÓN FINAL SIN DESCARGAS
// ============================================

import React, { useState, useMemo } from "react";
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
  alpha,
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

// Paleta naranja consistente con Login
const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8B5C',
  primaryDark: '#E55A2B',
};

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Items de menú SIN DESCARGAS
  const menuItems = [
    { label: "Inicio", path: "/", icon: <HomeIcon /> },
    { label: "Nosotros", path: "/AboutUs", icon: <InfoIcon /> },
    { label: "Tienda", path: "/Todo", icon: <StoreIcon /> },
    { label: "Búsqueda", path: "/MainPage", icon: <SearchIcon /> },
    { label: "Descubre", path: "/TechStyleHub", icon: <ExploreIcon /> },
  ];

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const isActive = (path) => location.pathname === path;

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>  

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
            >  
              <MenuIcon />  
            </IconButton>  
          </Box>  

          {/* Menú móvil con iconos - SIN DESCARGAS */}  
          <Menu  
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
              }  
            }}  
          >  
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
                }}  
              >  
                <ListItemIcon sx={{ color: isActive(item.path) ? colors.primary : "inherit", minWidth: 36 }}>  
                  {item.icon}  
                </ListItemIcon>  
                <ListItemText primary={item.label} />  
              </MenuItem>  
            ))}  
          </Menu>  

          {/* Links desktop - SIN DESCARGAS */}  
          <NavButtonsContainer>  
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

// ============================================
// ESTILOS (sin cambios)
// ============================================
const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'darkmode' })(({ darkmode }) => ({
  background: darkmode === "true" ? alpha("#1A1D29", 0.95) : alpha("#FFF", 0.98),
  boxShadow: darkmode === "true" ? `0 4px 20px ${alpha("#000", 0.25)}` : `0 4px 20px ${alpha(colors.primary, 0.08)}`,
  color: darkmode === "true" ? "#FFF" : "#2D3047",
  backdropFilter: "blur(10px)",
  borderBottom: `2px solid ${alpha(colors.primary, darkmode === "true" ? 0.1 : 0.08)}`,
  transition: "all 0.3s ease",
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  minWidth: 0,
  gap: theme.spacing(1)
}));

const Logo = styled("img", { shouldForwardProp: (prop) => prop !== 'darkmode' })(({ darkmode }) => ({
  width: 42,
  height: "auto",
  cursor: "pointer",
  transition: "all 0.3s ease",
  filter: darkmode === "true" ? "brightness(0.9) saturate(1.2)" : "brightness(1) saturate(1.1)",
  "&:hover": {
    transform: "scale(1.05) rotate(5deg)",
    filter: darkmode === "true" ? "brightness(1.1) saturate(1.3)" : "brightness(1.1) saturate(1.2)"
  },
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
  "&:hover": {
    background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`
  },
}));

const NavButtonsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  gap: theme.spacing(1),
  [theme.breakpoints.up("md")]: {
    display: "flex",
    justifyContent: "center",
    flexGrow: 1
  }
}));

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isactive' && prop !== 'darkmode'
})(({ isactive, darkmode }) => ({
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

export default Navbar;