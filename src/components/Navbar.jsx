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
  useMediaQuery,
  Switch,
  createTheme,
  ThemeProvider,
  ListItemIcon,
  ListItemText,
  alpha
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import djidjiLogo from "../assets/imagenes/djidji.png";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import StoreIcon from "@mui/icons-material/Store";
import SearchIcon from "@mui/icons-material/Search";
import ExploreIcon from "@mui/icons-material/Explore";

// Paleta principal
const colors = {
  primary: "#FF6B35",      // detalles activos y hover
  primaryLight: "#FF8B5C",
  primaryDark: "#E55A2B",
  titleBlue: "#1E90FF"     // título djidji
};

// Fuentes externas: asegúrate de importar 'Pacifico' en tu index.html o con Google Fonts
// <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">

const Navbar = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(false); // Light mode por defecto
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
        typography: {
          fontFamily: "'Roboto', sans-serif",
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

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledAppBar position="static" darkmode={darkMode ? "true" : "false"}>
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo y título */}
          <TitleContainer>
            <Logo
              src={djidjiLogo}
              alt="Logo djidji"
              onClick={() => navigate("/")}
            />
            <Title onClick={() => navigate("/")} variant="h6">
              djidji
            </Title>
          </TitleContainer>

          {/* Controles lado derecho */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 2 } }}>
            {/* Switch dark mode con iconos */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: { xs: 0.5, md: 1 } }}>
              {darkMode ? (
                <NightlightRoundIcon sx={{ fontSize: "1.2rem", color: alpha(colors.primary, 0.8) }} />
              ) : (
                <WbSunnyIcon sx={{ fontSize: "1.2rem", color: alpha(colors.primary, 0.8) }} />
              )}
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                size="small"
                sx={{
                  "& .MuiSwitch-thumb": { backgroundColor: darkMode ? "#333" : "#FFF" },
                  "& .MuiSwitch-track": { backgroundColor: darkMode ? alpha(colors.primary, 0.3) : alpha(colors.primary, 0.2) }
                }}
              />
            </Box>

            {/* Menú móvil */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
              sx={{
                display: { xs: "flex", md: "none" },
                color: darkMode ? "#FFF" : colors.primary,
                "&:hover": { backgroundColor: alpha(colors.primary, 0.1) }
              }}
              aria-controls="nav-menu"
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Menú móvil con iconos */}
          <Menu
            id="nav-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                background: darkMode
                  ? `linear-gradient(135deg, ${alpha("#1A1D29", 0.95)} 0%, ${alpha("#2D3047", 0.95)} 100%)`
                  : `linear-gradient(135deg, ${alpha("#FFF", 0.95)} 0%, ${alpha("#F8F9FA", 0.95)} 100%)`,
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
              },
            }}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  handleMenuClose();
                }}
                sx={{
                  py: 1.5,
                  px: 2,
                  color: isActive(item.path) ? colors.primary : "inherit",
                  fontWeight: isActive(item.path) ? 600 : 400,
                  background: isActive(item.path)
                    ? alpha(colors.primary, darkMode ? 0.15 : 0.08)
                    : "transparent",
                  borderLeft: isActive(item.path)
                    ? `3px solid ${colors.primary}`
                    : "3px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: alpha(colors.primary, darkMode ? 0.2 : 0.1),
                    borderLeft: `3px solid ${alpha(colors.primary, 0.7)}`,
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? colors.primary : "inherit", minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 400 }}
                />
              </MenuItem>
            ))}
          </Menu>

          {/* Links desktop */}
          <NavButtonsContainer>
            {menuItems.map((item) => (
              <NavButton
                key={item.label}
                color="inherit"
                component={Link}
                to={item.path}
                isactive={isActive(item.path) ? "true" : "false"}
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

// Estilos
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === "dark"
    ? `linear-gradient(135deg, ${alpha("#1A1D29", 0.95)} 0%, ${alpha("#2D3047", 0.95)} 100%)`
    : `linear-gradient(135deg, ${alpha("#FFF", 0.98)} 0%, ${alpha("#F8F9FA", 0.98)} 100%)`,
  boxShadow: theme.palette.mode === "dark"
    ? `0 4px 20px ${alpha("#000", 0.25)}`
    : `0 4px 20px ${alpha(colors.primary, 0.08)}`,
  color: theme.palette.mode === "dark" ? "#FFF" : "#2D3047",
  backdropFilter: "blur(10px)",
  borderBottom: `2px solid ${alpha(colors.primary, 0.08)}`,
  transition: "all 0.3s ease",
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  minWidth: 0,
  gap: theme.spacing(1),
}));

const Logo = styled("img")(({ theme }) => ({
  width: 42,
  height: "auto",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": { transform: "scale(1.05) rotate(5deg)" },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: "0.5px",
  cursor: "pointer",
  fontSize: "1.5rem",
  fontFamily: "'Pacifico', cursive",
  color: colors.titleBlue,
  transition: "all 0.3s ease",
  "&:hover": {
    color: alpha(colors.titleBlue, 0.8),
  },
}));

const NavButtonsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  gap: theme.spacing(1),
  [theme.breakpoints.up("md")]: {
    display: "flex",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  },
}));

const NavButton = styled(Button)(({ theme, isactive }) => ({
  fontWeight: isactive === "true" ? 600 : 400,
  fontSize: "0.9rem",
  textTransform: "capitalize",
  padding: theme.spacing(0.75, 1.5),
  color: isactive === "true" ? colors.primary : alpha("#2D3047", 0.8),
  position: "relative",
  transition: "all 0.3s ease",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "4px",
    left: "50%",
    width: isactive === "true" ? "70%" : "0%",
    height: "2px",
    background: colors.primary,
    transform: "translateX(-50%)",
    borderRadius: "1px",
    transition: "all 0.3s ease",
  },
  "&:hover": {
    color: colors.primary,
    "&::after": { width: "70%" },
  },
  "&:active": { transform: "translateY(1px)" },
}));

export default Navbar;