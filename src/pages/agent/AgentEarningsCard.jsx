// src/pages/agent/AgentEarningsCard.jsx
// ✅ Muestra las comisiones del agente
// ✅ CORREGIDO - Íconos correctos de MUI

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  TrendingUp, 
  Today, 
  CalendarMonth, 
  Receipt 
} from '@mui/icons-material';
import { getAuthToken } from '../../components/hook/services/apia';

const EarningsCard = ({ title, amount, commission, icon, color }) => (
  <Box sx={{ textAlign: 'center', p: 1.5 }}>
    <Box sx={{ color: color, mb: 0.5 }}>{icon}</Box>
    <Typography variant="caption" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h6" fontWeight={700}>
      {new Intl.NumberFormat().format(amount)} XAF
    </Typography>
    <Typography variant="caption" color="success.main">
      Comisión: {new Intl.NumberFormat().format(commission)} XAF
    </Typography>
  </Box>
);

const AgentEarningsCard = () => {
  const theme = useTheme();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch('https://api.djidjimusic.com/wallet/agent/earnings/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al cargar comisiones');

      const data = await response.json();
      setEarnings(data);
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, p: 3, textAlign: 'center' }}>
        <CircularProgress size={32} />
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  const periods = [
    { key: 'today', title: 'Hoy', icon: <Today fontSize="small" />, color: theme.palette.info.main },
    { key: 'week', title: 'Esta semana', icon: <CalendarMonth fontSize="small" />, color: theme.palette.primary.main },
    { key: 'month', title: 'Este mes', icon: <Receipt fontSize="small" />, color: theme.palette.success.main },
    { key: 'total', title: 'Total acumulado', icon: <TrendingUp fontSize="small" />, color: theme.palette.warning.main }
  ];

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          💰 Mis Comisiones
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Ganas 10% de comisión por cada recarga que realizas
        </Typography>

        <Grid container spacing={1}>
          {periods.map((period) => (
            <Grid item xs={6} sm={3} key={period.key}>
              <EarningsCard
                title={period.title}
                amount={earnings?.[period.key]?.amount || 0}
                commission={earnings?.[period.key]?.commission || 0}
                icon={period.icon}
                color={period.color}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Últimas transacciones
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {earnings?.recent_transactions?.slice(0, 10).map((tx, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Recarga a {tx.user}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight={600}>
                    +{new Intl.NumberFormat().format(tx.amount)} XAF
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Comisión: {new Intl.NumberFormat().format(tx.commission)} XAF
                  </Typography>
                </Box>
              </Box>
              {index < 9 && <Divider sx={{ mt: 1 }} />}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AgentEarningsCard;