// src/components/agent/AgentRoute.jsx
// ✅ Ruta protegida - Solo accesible para usuarios con rol de agente

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { getAuthToken } from '../../components/hook/services/apia';

const AgentRoute = ({ children }) => {
  const [isAgent, setIsAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAgentStatus = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setIsAgent(false);
          setLoading(false);
          return;
        }

        // Intentar acceder al dashboard de agente
        const response = await fetch('https://api.djidjimusic.com/wallet/agent/dashboard/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 200) {
          setIsAgent(true);
        } else if (response.status === 403) {
          setIsAgent(false);
        } else {
          setIsAgent(false);
        }
      } catch (error) {
        console.error('Error checking agent status:', error);
        setIsAgent(false);
      } finally {
        setLoading(false);
      }
    };

    checkAgentStatus();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAgent) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
        <Typography variant="h5" gutterBottom>
          🔒 Acceso restringido
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Esta página es solo para agentes autorizados.
        </Typography>
        <Button variant="contained" href="/">
          Volver al inicio
        </Button>
      </Box>
    );
  }

  return children;
};

export default AgentRoute;