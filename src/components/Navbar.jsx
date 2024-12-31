import React, { useState } from "react";
import { AppBar, Toolbar, Typography, InputBase, Box, Button, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";


const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    console.log(Buscando, {searchQuery});
    // Aquí podrías integrar una funcionalidad real de búsqueda
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(5px, 15px, orange)", // Gradiente futurista
        boxShadow: "10px 5px 40px(0,0,0,0.3)",
      }}
    >
      <Toolbar>
        {/* Menú */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Título de la página */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: "3px",
            color: "Window",
            textTransform: "lowercase",
            letterSpacing: "4px",
          }}
        >
          Djidji
        </Typography>

        {/* Enlaces a otras páginas */}
        <Box sx={{ display: "flex", gap: 3 }}>
          <Link to="/" style={linkStyle}>
            Inicio
          </Link>
          <Link to="/Noticias" style={linkStyle}>
            novedades
          </Link>
          <Link to="/SingInPage" style={linkStyle}>
            registrate
          </Link>
          <Link to="/StoragePageV2" style={linkStyle}>
            tienda
          </Link>
          <Link to="/AboutUs" style={linkStyle}>
            nosotros
          </Link>
          <Link to="/DetallesCancion" style={linkStyle}>
            artistas
          </Link>
          
        </Box>
        
        {/* Barra de búsqueda */}
        <SearchBox>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Buscar canciones o artistas..."
            inputProps={{ "aria-brailleroledescription": "search" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              ml: 1,
              backgroundColor: "turquoise",
              color: "#fff",
              "&:hover": { backgroundColor: "sandybrown " },
            }}
          >
            Buscar
          </Button>
        </SearchBox>

        {/* Iconos adicionales */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
          <IconButton color="inherit">
            <NotificationsIcon sx={{ color: "orange" }} />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircleIcon sx={{ color: "#FF4500" }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Estilo de los enlaces
const linkStyle = {
  textDecoration: "5px",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "1rem",
  padding: "8px 16px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "rgba(15px, 255, 255, 0.2)",
  },
};

// Estilización de Material-UI
const SearchBox = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.15)",
  borderRadius: theme.palette.AccountCircleIcon,
  padding: "10 8px",
  width: "50%",
  color: "white",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
}));

export default Navbar;