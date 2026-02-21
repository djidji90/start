// ============================================
// components/Navbar.jsx - VERSIÓN PREMIUM SIN DESCARGAS
// ============================================

import React, { useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  styled,
  CssBaseline,
  createTheme,
  ThemeProvider,
  ListItemIcon,
  ListItemText,
  alpha,
  Tooltip,
  Divider
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
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
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // 🎯 Links de navegación principal
  const mainNavItems = [
    { label: "Inicio", path: "/", icon: <HomeIcon /> },
    { label: "Explorar", path: "/TechStyleHub", icon: <ExploreIcon /> },
    { label: "Tienda", path: "/Todo", icon: <StoreIcon /> },
    { label: "Buscar", path: "/MainPage", icon: <SearchIcon /> },
    { label: "Nosotros", path: "/AboutUs", icon: <InfoIcon /> },
  ];

  // 🎯 Menú móvil (navegación + utilidades)
  const mobileMenuItems = [
    ...mainNavItems,
    { type: 'divider' },
    { 
      label: darkMode ? "Modo claro" : "Modo oscuro", 
      action: () => setDarkMode(!darkMode),
      icon: darkMode ? <WbSunnyIcon /> : <NightlightRoundIcon />,
      isUtility: true 
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
    setMobileMenuOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledAppBar position="sticky" darkmode={darkMode ? "true" : "false"}>
        <Toolbar sx={{ justifyContent: "space-between", py: 0.5 }}>
          {/* ⚡ Lado izquierdo: Logo + Título */}
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

          {/* ⚡ Centro: Links principales - SOLO DESKTOP */}
          <NavLinksContainer>
            {mainNavItems.map((item) => (
              <NavLink
                key={item.label}
                component={Link}
                to={item.path}
                isactive={isActive(item.path) ? "true" : "false"}
                darkmode={darkMode ? "true" : "false"}
              >
                {item.label}
              </NavLink>
            ))}
          </NavLinksContainer>

          {/* ⚡ Lado derecho: Utilidades */}
          <UtilityContainer>
            {/* 🌙 Dark mode toggle */}
            <Tooltip title={darkMode ? "Modo claro" : "Modo oscuro"} arrow>
              <UtilityIconButton
                onClick={() => setDarkMode(!darkMode)}
                darkmode={darkMode ? "true" : "false"}
              >
                {darkMode ? <WbSunnyIcon /> : <NightlightRoundIcon />}
              </UtilityIconButton>
            </Tooltip>

            {/* ☰ Menú hamburguesa - SOLO MOBILE */}
            <Tooltip title="Menú" arrow>
              <MenuButton
                edge="end"
                aria-label="menu"
                onClick={handleMobileMenuToggle}
                darkmode={darkMode ? "true" : "false"}
                isopen={mobileMenuOpen ? "true" : "false"}
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </MenuButton>
            </Tooltip>
          </UtilityContainer>
        </Toolbar>

        {/* 📱 Menú móvil desplegable */}
        <MobileMenu open={mobileMenuOpen} darkmode={darkMode ? "true" : "false"}>
          {mobileMenuItems.map((item, index) => {
            if (item.type === 'divider') {
              return <MobileDivider key={index} darkmode={darkMode ? "true" : "false"} />;
            }
            
            return (
              <MobileMenuItem
                key={item.label}
                onClick={() => handleMobileItemClick(item)}
                isactive={item.path && isActive(item.path) ? "true" : "false"}
                darkmode={darkMode ? "true" : "false"}
                isutility={item.isUtility ? "true" : "false"}
              >
                <ListItemIcon sx={{ 
                  color: item.path && isActive(item.path) ? colors.primary : 'inherit',
                  minWidth: 44
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: item.isUtility ? 400 : 500
                  }}
                />
              </MobileMenuItem>
            );
          })}
        </MobileMenu>
      </StyledAppBar>
    </ThemeProvider>
  );
};

// ============================================
// ESTILOS OPTIMIZADOS
// ============================================

const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'darkmode' })(({ darkmode }) => ({
  background: darkmode === "true" ? alpha("#1A1D29", 0.95) : alpha("#FFF", 0.98),
  boxShadow: darkmode === "true" 
    ? `0 4px 20px ${alpha("#000", 0.25)}` 
    : `0 4px 20px ${alpha(colors.primary, 0.08)}`,
  color: darkmode === "true" ? "#FFF" : "#2D3047",
  backdropFilter: "blur(10px)",
  borderBottom: `2px solid ${alpha(colors.primary, darkmode === "true" ? 0.1 : 0.08)}`,
  transition: "all 0.3s ease",
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  zIndex: 1200,
}));

const Logo = styled("img", { shouldForwardProp: (prop) => prop !== 'darkmode' })(({ darkmode }) => ({
  width: 40,
  height: "auto",
  cursor: "pointer",
  transition: "all 0.3s ease",
  filter: darkmode === "true" ? "brightness(0.9) saturate(1.2)" : "brightness(1) saturate(1.1)",
  "&:hover": {
    transform: "scale(1.05) rotate(3deg)",
  },
}));

const Title = styled(Typography)({
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
    background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
});

const NavLinksContainer = styled(Box)(({ theme }) => ({
  display: "none",
  gap: theme.spacing(1),
  [theme.breakpoints.up("md")]: {
    display: "flex",
    justifyContent: "center",
    flex: 1,
    mx: 3
  }
}));

const NavLink = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isactive' && prop !== 'darkmode'
})(({ isactive, darkmode }) => ({
  fontWeight: isactive === "true" ? 600 : 400,
  fontSize: "0.95rem",
  textTransform: "capitalize",
  padding: "6px 16px",
  color: isactive === "true" 
    ? colors.primary 
    : darkmode === "true" 
      ? alpha("#FFF", 0.9) 
      : alpha("#2D3047", 0.8),
  position: "relative",
  transition: "all 0.3s ease",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 4,
    left: "50%",
    width: isactive === "true" ? "60%" : "0%",
    height: 2,
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    borderRadius: 1,
    transform: "translateX(-50%)",
    transition: "all 0.3s ease",
  },
  "&:hover": {
    color: colors.primary,
    backgroundColor: "transparent",
    "&::after": { width: "60%" },
  },
}));

const UtilityContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  zIndex: 1200,
});

const UtilityIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'darkmode'
})(({ darkmode }) => ({
  padding: 10,
  transition: 'all 0.2s ease',
  color: darkmode === "true" ? alpha("#FFF", 0.9) : alpha("#2D3047", 0.8),
  '&:hover': {
    color: colors.primary,
    transform: 'rotate(15deg)',
    backgroundColor: alpha(colors.primary, darkmode === "true" ? 0.1 : 0.05),
  },
}));

const MenuButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'darkmode' && prop !== 'isopen'
})(({ darkmode, isopen }) => ({
  display: { xs: "flex", md: "none" },
  padding: 10,
  transition: 'all 0.2s ease',
  color: darkmode === "true" ? "#FFF" : colors.primary,
  backgroundColor: isopen === "true" ? alpha(colors.primary, 0.1) : 'transparent',
  '&:hover': {
    transform: isopen === "true" ? 'rotate(90deg)' : 'rotate(0deg)',
    backgroundColor: alpha(colors.primary, 0.15),
  },
}));

const MobileMenu = styled(Box, { shouldForwardProp: (prop) => prop !== 'darkmode' && prop !== 'open' })(({ open, darkmode }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  background: darkmode === "true" ? alpha("#1A1D29", 0.98) : alpha("#FFF", 0.98),
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${alpha(colors.primary, 0.1)}`,
  borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
  transform: open ? "translateY(0)" : "translateY(-120%)",
  opacity: open ? 1 : 0,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  visibility: open ? "visible" : "hidden",
  zIndex: 1100,
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: darkmode === "true" 
    ? `0 8px 20px ${alpha("#000", 0.4)}` 
    : `0 8px 20px ${alpha(colors.primary, 0.15)}`,
}));

const MobileMenuItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isactive' && prop !== 'darkmode' && prop !== 'isutility'
})(({ isactive, darkmode, isutility }) => ({
  display: "flex",
  alignItems: "center",
  padding: "16px 24px",
  cursor: "pointer",
  color: isactive === "true" 
    ? colors.primary 
    : isutility === "true"
      ? darkmode === "true" ? alpha("#FFF", 0.8) : alpha("#2D3047", 0.7)
      : darkmode === "true" ? "#FFF" : "#2D3047",
  backgroundColor: isactive === "true" 
    ? alpha(colors.primary, darkmode === "true" ? 0.15 : 0.08)
    : "transparent",
  borderLeft: isactive === "true" ? `4px solid ${colors.primary}` : "4px solid transparent",
  transition: "all 0.2s ease",
  fontWeight: isutility === "true" ? 400 : 500,
  gap: 8,
  "&:hover": {
    backgroundColor: alpha(colors.primary, darkmode === "true" ? 0.1 : 0.05),
    borderLeftColor: alpha(colors.primary, 0.5),
    paddingLeft: 28,
  },
}));

const MobileDivider = styled(Divider, {
  shouldForwardProp: (prop) => prop !== 'darkmode'
})(({ darkmode }) => ({
  margin: '8px 16px',
  borderColor: alpha(colors.primary, darkmode === "true" ? 0.2 : 0.1),
}));

export default Navbar;