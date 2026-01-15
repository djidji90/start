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
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import djidji from "../assets/imagenes/djidji.png";

const Navbar = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [anchorEl, setAnchorEl] = useState(null);
  const [modeMenuAnchor, setModeMenuAnchor] = useState(null);
  const navigate = useNavigate();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const menuItems = [
    { label: "Inicio", path: "/" },
    { label: "Nosotros", path: "/AboutUs" },
    { label: "Regístrate", path: "/SingInPage" },
    { label: "Tienda", path: "/Todo" },
    { label: "Búsqueda", path: "/MainPage" },
    { label: "Descubre", path: "/TechStyleHub" },
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModeMenuOpen = (event) => {
    setModeMenuAnchor(event.currentTarget);
  };

  const handleModeMenuClose = () => {
    setModeMenuAnchor(null);
  };

  const handleModeSelect = (mode) => {
    setDarkMode(mode === "dark");
    handleModeMenuClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledAppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo y título */}
          <TitleContainer>
            <Logo src={djidji} alt="Logo" onClick={() => navigate("/")} />
            <Title variant="h6" onClick={() => navigate("/")}>
              Djidji 
            </Title>
          </TitleContainer>

          {/* Selector de modo claro/oscuro */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              color="inherit"
              onClick={handleModeMenuOpen}
              sx={{
                textTransform: "none",
                fontSize: "0.9rem",
                display: { xs: "none", sm: "flex" }
              }}
            >
              {darkMode ? "🌙 Oscuro" : "☀️ Claro"}
            </Button>
            
            {/* Versión móvil del selector de modo */}
            <IconButton
              color="inherit"
              onClick={handleModeMenuOpen}
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              {darkMode ? "🌙" : "☀️"}
            </IconButton>

            {/* Menú desplegable para selección de modo */}
            <Menu
              anchorEl={modeMenuAnchor}
              open={Boolean(modeMenuAnchor)}
              onClose={handleModeMenuClose}
            >
              <MenuItem 
                onClick={() => handleModeSelect("light")}
                selected={!darkMode}
              >
                ☀️ Modo Claro
              </MenuItem>
              <MenuItem 
                onClick={() => handleModeSelect("dark")}
                selected={darkMode}
              >
                🌙 Modo Oscuro
              </MenuItem>
            </Menu>

            {/* Menú desplegable móvil */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
              sx={{ display: { xs: "block", md: "none" } }}
              aria-controls="nav-menu"
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Menu
            id="nav-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "menu-button",
            }}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  handleMenuClose();
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>

          {/* Links de navegación desktop */}
          <NavButtonsContainer>
            {menuItems.map((item) => (
              <NavButton
                key={item.label}
                color="inherit"
                component={Link}
                to={item.path}
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

// Estilos (sin cambios)
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.95)"
      : "rgba(30, 30, 30, 0.95)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  color: theme.palette.text.primary,
  backdropFilter: "blur(10px)",
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  minWidth: 0,
}));

const Logo = styled("img")(({ theme }) => ({
  width: 40,
  height: "auto",
  marginRight: theme.spacing(1),
  cursor: "pointer",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  flexGrow: 0,
  fontWeight: 700,
  letterSpacing: 1.2,
  cursor: "pointer",
  color: theme.palette.primary.main,
  fontSize: "1.2rem",
}));

const NavButtonsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "0.95rem",
  textTransform: "capitalize",
  padding: theme.spacing(1, 2),
  transition: "all 0.3s ease",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: "transparent",
  },
}));

export default Navbar;