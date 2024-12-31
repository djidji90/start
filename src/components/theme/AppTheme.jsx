import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Theme } from '@chakra-ui/react';

export default function AppTheme({ children }) {
  const theme = createTheme({
    palette: {
      mode: 'light', // Cambiar a 'dark' para modo oscuro
      primary: {
        main: '#6200ea',
      },
      secondary: {
        main: '#03dac6',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}