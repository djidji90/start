// components/layout/Navigation.jsx
import React from 'react';
import { AppBar, Toolbar, Button, Box, Typography, Container } from '@mui/material';
import { MusicNote, CloudUpload } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        mb: 4
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo/Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <MusicNote sx={{ mr: 1, color: '#1a1a1a' }} />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 300,
                color: '#1a1a1a',
                textDecoration: 'none',
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              djidjimusic
            </Typography>
          </Box>
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/"
              startIcon={<MusicNote />}
              sx={{
                color: location.pathname === '/' ? '#1a1a1a' : '#666666',
                fontWeight: location.pathname === '/' ? 600 : 400,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Inicio
            </Button>
            
            <Button
              component={RouterLink}
              to="/upload"
              startIcon={<CloudUpload />}
              sx={{
                color: location.pathname === '/upload' ? '#1a1a1a' : '#666666',
                fontWeight: location.pathname === '/upload' ? 600 : 400,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Subir Música
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;