import React from "react";
import { MusicProvider } from "./MusicContext";
import HomePage from "./HomePage";
import Player from "./Player";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1db954", // Verde estilo Spotify
    },
    secondary: {
      main: "#ff4081", // Rosa vibrante
    },
  },
});

const Aplicacion = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MusicProvider>
        <HomePage />
        <Player />
      </MusicProvider>
    </ThemeProvider>
  );
};

export default Aplicacion;