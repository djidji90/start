// src/pages/agent/AgentDashboardPage.jsx
// ✅ Dashboard principal del agente
// ✅ Muestra estadísticas diarias, comisiones, códigos y métricas globales

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AccountBalanceWallet as WalletIcon,
  QrCode as QrCodeIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { getAuthToken } from '../../components/hook/services/apia';

// ============================================
// COMPONENTES INTERNOS
// ============================================
import AgentEarningsCard from './AgentEarningsCard';
import AgentCodesList from './AgentCodesList';
import GenerateCodeForm from './GenerateCodeForm';
import AgentSearchUser from './AgentSearchUser';

// ============================================
// TARJETA DE ESTADÍSTICAS DIARIAS
// ============================================
const DailyStatsCard = ({ stats, loading, onRefresh }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, p: 2 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  const limitReached = stats?.limit_reached || false;
  const remaining = stats?.deposit_limit_remaining || 0;
  const used = stats?.deposits_total || 0;
  const dailyLimit = stats?.daily_limit || 0;
  const percentage = dailyLimit > 0 ? (used / dailyLimit) * 100 : 0;

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            📊 Estadísticas de hoy
          </Typography>
          <IconButton size="small" onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Depósitos realizados
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats?.deposits_count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {new Intl.NumberFormat().format(stats?.deposits_total || 0)} XAF
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Límite diario
              </Typography>
              <Typography variant="h4" fontWeight={700} color={limitReached ? 'error.main' : 'success.main'}>
                {limitReached ? 'Alcanzado' : `${Math.round(percentage)}%`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Restante: {new Intl.NumberFormat().format(remaining)} XAF
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 🆕 Códigos generados hoy */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Códigos generados hoy
            </Typography>
            <Typography variant="h6" fontWeight={700} color={theme.palette.primary.main}>
              {stats?.codes_generated_today || 0}
            </Typography>
          </Box>
        </Box>

        {limitReached && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Has alcanzado tu límite diario de depósitos. Mañana podrás continuar.
          </Alert>
        )}
      </Box>
    </Card>
  );
};

// ============================================
// 🆕 TARJETA DE ESTADÍSTICAS GLOBALES
// ============================================
const GlobalStatsCard = ({ stats, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, p: 2 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  const usageRate = stats?.codes_usage_rate || 0;

  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          📈 Mi actividad global
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.info.main, 0.08), borderRadius: 2 }}>
              <CodeIcon sx={{ fontSize: 24, color: theme.palette.info.main }} />
              <Typography variant="h5" fontWeight={700}>
                {stats?.total_codes_generated || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Códigos generados
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 24, color: theme.palette.success.main }} />
              <Typography variant="h5" fontWeight={700}>
                {stats?.total_codes_used || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Códigos usados
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Tasa de uso
            </Typography>
            <Typography variant="caption" fontWeight={600} color={usageRate > 50 ? 'success.main' : 'warning.main'}>
              {usageRate}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={usageRate} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: usageRate > 50 ? theme.palette.success.main : theme.palette.warning.main
              }
            }} 
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Valor total códigos
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {new Intl.NumberFormat().format(stats?.total_codes_value || 0)} XAF
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Depósitos directos
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {new Intl.NumberFormat().format(stats?.total_amount_deposited || 0)} XAF
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================================
// 🆕 ACTIVIDAD RECIENTE (Códigos + Depósitos)
// ============================================
const RecentActivityCard = ({ activities, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, p: 2 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No hay actividad reciente
        </Typography>
      </Card>
    );
  }

  const getActivityIcon = (type) => {
    if (type === 'code_generated') return <QrCodeIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
    if (type === 'deposit_made') return <MoneyIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />;
    return <HistoryIcon sx={{ fontSize: 20 }} />;
  };

  const getActivityText = (activity) => {
    if (activity.type === 'code_generated') {
      return `Generado código ${activity.code} de ${new Intl.NumberFormat().format(activity.amount)} ${activity.currency}`;
    }
    if (activity.type === 'deposit_made') {
      return `Recarga de ${new Intl.NumberFormat().format(activity.amount)} XAF a ${activity.user_name || activity.user}`;
    }
    return 'Actividad registrada';
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          🕐 Actividad reciente
        </Typography>
        <Box sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
          {activities.map((activity, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                {getActivityIcon(activity.type)}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    {getActivityText(activity)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(activity.created_at).toLocaleString()}
                  </Typography>
                  {activity.type === 'code_generated' && activity.status === 'usado' && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      ✅ Canjeado por {activity.used_by_name || activity.used_by}
                    </Typography>
                  )}
                </Box>
              </Box>
              {index < activities.length - 1 && <Divider sx={{ mt: 1 }} />}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================================
// DEPÓSITOS RECIENTES (Mantener compatibilidad)
// ============================================
const RecentDepositsCard = ({ deposits, loading }) => {
  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, p: 2 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  if (!deposits || deposits.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No hay depósitos recientes
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Últimos depósitos realizados
        </Typography>
        <Box sx={{ mt: 1 }}>
          {deposits.slice(0, 5).map((deposit, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {deposit.user}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(deposit.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  +{new Intl.NumberFormat().format(deposit.amount)} XAF
                </Typography>
              </Box>
              {index < deposits.length - 1 && <Divider sx={{ mt: 1 }} />}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================================
// TARJETA DE LÍMITES
// ============================================
const LimitsCard = ({ limits, loading }) => {
  if (loading) return null;

  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Límites de agente
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Depósito máximo por transacción</Typography>
            <Typography variant="body2" fontWeight={600}>
              {new Intl.NumberFormat().format(limits?.per_transaction || 0)} XAF
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2">Límite diario total</Typography>
            <Typography variant="body2" fontWeight={600}>
              {new Intl.NumberFormat().format(limits?.daily_limit || 0)} XAF
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const AgentDashboardPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const response = await fetch('https://api.djidjimusic.com/wallet/agent/dashboard/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = () => {
    fetchDashboard();
    setSnackbar({ open: true, message: 'Dashboard actualizado', severity: 'success' });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const dailyStats = dashboardData?.daily_stats || {};
  const limits = dashboardData?.limits || {};
  const recentDeposits = dashboardData?.recent_deposits || [];
  const globalStats = dashboardData?.stats || {};
  const recentActivities = dashboardData?.recent_activities || [];

  return (
    <Container maxWidth="lg" sx={{ py: 3, pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Panel de Agente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona recargas, códigos y comisiones
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} disabled={loading}>
          <RefreshIcon sx={{ animation: loading ? 'spin 0.5s linear infinite' : 'none' }} />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Grid de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <DailyStatsCard stats={dailyStats} loading={loading} onRefresh={fetchDashboard} />
        </Grid>
        <Grid item xs={12} md={6}>
          <GlobalStatsCard stats={globalStats} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <RecentDepositsCard deposits={recentDeposits} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecentActivityCard activities={recentActivities} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <LimitsCard limits={limits} loading={loading} />
        </Grid>
      </Grid>

      {/* Tabs para funcionalidades adicionales */}
      <Paper sx={{ mt: 2, borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': { py: 1.5, textTransform: 'none', fontWeight: 600 }
          }}
        >
          <Tab icon={<MoneyIcon />} label="Generar código" />
          <Tab icon={<HistoryIcon />} label="Mis códigos" />
          <Tab icon={<TrendingUpIcon />} label="Comisiones" />
          <Tab icon={<WalletIcon />} label="Buscar usuario" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <GenerateCodeForm onSuccess={fetchDashboard} />}
          {tabValue === 1 && <AgentCodesList />}
          {tabValue === 2 && <AgentEarningsCard />}
          {tabValue === 3 && <AgentSearchUser />}
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AgentDashboardPage;