// src/pages/wallet/WalletPage.jsx
// ✅ Página principal del monedero virtual
// ✅ Muestra saldo, estadísticas, historial y recargas
// ✅ Listo para producción

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Skeleton,
  Zoom,
  Fade,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
  QrCode as QrCodeIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";

// ========== IMPORTS LOCALES ==========
import useWallet from "../components/hook/useWallet";
import { walletService } from "../components/hook/services/wallet";
import TopUpModal from "../components/wallet/TopUpModal";
import TransactionHistory from "./TransactionHistory";
import { formatCurrency, formatDate } from "../utils/formatters";

// ============================================
// COMPONENTE: TARJETA DE SALDO
// ============================================
const WalletBalanceCard = ({ balance, isLoading, onRefresh }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          mb: 3,
        }}
      >
        <Skeleton
          variant="text"
          width={120}
          height={24}
          sx={{ bgcolor: alpha("#fff", 0.3), mb: 2 }}
        />
        <Skeleton
          variant="text"
          width={200}
          height={48}
          sx={{ bgcolor: alpha("#fff", 0.3), mb: 1 }}
        />
        <Skeleton
          variant="text"
          width={100}
          height={16}
          sx={{ bgcolor: alpha("#fff", 0.3) }}
        />
      </Paper>
    );
  }

  const available = balance?.available || 0;
  const pending = balance?.pending || 0;
  const currency = balance?.currency || "XAF";

  return (
    <Zoom in={true} timeout={500}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          mb: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decoración de fondo */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: alpha("#fff", 0.08),
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: alpha("#fff", 0.05),
            zIndex: 0,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Saldo disponible
            </Typography>
            <IconButton
              size="small"
              onClick={onRefresh}
              sx={{ color: "white", opacity: 0.8 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
            {formatCurrency(available, currency)}
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {pending > 0 && `+ ${formatCurrency(pending, currency)} en camino`}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Total gastado
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(balance?.total_spent || 0, currency)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Total recargado
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(balance?.total_deposited || 0, currency)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Zoom>
  );
};

// ============================================
// COMPONENTE: ESTADÍSTICAS RÁPIDAS
// ============================================
const QuickStats = ({ transactions, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Skeleton variant="rounded" width="33%" height={80} />
        <Skeleton variant="rounded" width="33%" height={80} />
        <Skeleton variant="rounded" width="33%" height={80} />
      </Box>
    );
  }

  // Calcular estadísticas desde transacciones
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyPurchases =
    transactions
      ?.filter(
        (tx) =>
          tx.transaction_type === "purchase" &&
          tx.status === "completed" &&
          new Date(tx.created_at) >= firstDayOfMonth,
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

  const monthlyDeposits =
    transactions
      ?.filter(
        (tx) =>
          tx.transaction_type === "deposit" &&
          tx.status === "completed" &&
          new Date(tx.created_at) >= firstDayOfMonth,
      )
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;

  const totalPurchases =
    transactions?.filter(
      (tx) => tx.transaction_type === "purchase" && tx.status === "completed",
    ).length || 0;

  const stats = [
    {
      label: "Gastado este mes",
      value: formatCurrency(monthlyPurchases),
      icon: <ArrowDownwardIcon sx={{ fontSize: 16 }} />,
      color: "#EF4444",
    },
    {
      label: "Recargado este mes",
      value: formatCurrency(monthlyDeposits),
      icon: <ArrowUpwardIcon sx={{ fontSize: 16 }} />,
      color: "#10B981",
    },
    {
      label: "Total compras",
      value: totalPurchases.toString(),
      icon: <ShoppingCartIcon sx={{ fontSize: 16 }} />,
      color: "#FF6B35",
    },
  ];

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      {stats.map((stat, index) => (
        <Fade in={true} timeout={300 + index * 100} key={stat.label}>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: "auto" },
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(stat.color, 0.08),
              border: `1px solid ${alpha(stat.color, 0.15)}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              <Typography
                variant="caption"
                sx={{
                  color: stat.color,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </Typography>
            </Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: stat.color }}
            >
              {stat.value}
            </Typography>
          </Paper>
        </Fade>
      ))}
    </Box>
  );
};

// ============================================
// COMPONENTE: BOTONES DE ACCIÓN RÁPIDA
// ============================================
const QuickActions = ({ onTopUp, onViewHistory }) => {
  const theme = useTheme();

  const actions = [
    {
      label: "Recargar",
      icon: <QrCodeIcon />,
      onClick: onTopUp,
      color: theme.palette.primary.main,
    },
    {
      label: "Historial",
      icon: <HistoryIcon />,
      onClick: onViewHistory,
      color: theme.palette.text.secondary,
    },
  ];

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.label === "Recargar" ? "contained" : "outlined"}
          onClick={action.onClick}
          startIcon={action.icon}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            ...(action.label === "Recargar" && {
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }),
          }}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
};

// ============================================
// COMPONENTE: SECCIÓN PARA ARTISTAS
// ============================================
const ArtistSection = () => {
  const [earnings, setEarnings] = useState(null);
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isArtist, setIsArtist] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const checkArtistAndFetch = async () => {
      try {
        // Intentar obtener earnings (solo funciona si es artista)
        const earningsData = await walletService.getArtistEarnings();
        setIsArtist(true);
        setEarnings(earningsData);

        // Obtener holds
        const holdsData = await walletService.getArtistHolds({
          page: 1,
          pageSize: 5,
        });
        setHolds(holdsData.results || []);
      } catch (error) {
        // Si error 403, no es artista
        if (error.response?.status !== 403) {
          console.error("Error fetching artist data:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkArtistAndFetch();
  }, []);

  if (loading || !isArtist) return null;

  return (
    <Fade in={true}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.secondary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <TrendingUpIcon sx={{ color: theme.palette.secondary.main }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Panel de Artista
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Ganancias totales
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {formatCurrency(earnings?.total || 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Este mes
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {formatCurrency(earnings?.month || 0)}
            </Typography>
          </Box>
          {holds.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Pagos pendientes
              </Typography>
              <Typography variant="h6" fontWeight={700} color="warning.main">
                {holds.length}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Fade>
  );
};

// ============================================
// PÁGINA PRINCIPAL
// ============================================
const WalletPage = () => {
  const theme = useTheme();
  const { balance, isLoading, refresh, fetchTransactions } = useWallet();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const refreshTimeoutRef = useRef(null);

  // Cargar transacciones para estadísticas
  const loadTransactions = useCallback(async () => {
    try {
      const data = await walletService.getTransactions({
        page: 1,
        pageSize: 50,
      });
      setTransactions(data.results || []);
    } catch (error) {
      console.error("Error loading transactions for stats:", error);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await refresh();
      await loadTransactions();
      setSnackbar({
        open: true,
        message: "Saldo actualizado",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar",
        severity: "error",
      });
    } finally {
      // Mantener el estado refreshing por al menos 500ms para feedback visual
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => setRefreshing(false), 500);
    }
  }, [refresh, loadTransactions, refreshing]);

  const handleTopUpSuccess = useCallback(async () => {
    setShowTopUpModal(false);
    await handleRefresh();
    setSnackbar({
      open: true,
      message: "¡Recarga exitosa!",
      severity: "success",
    });
  }, [handleRefresh]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Pull-to-refresh para móviles
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (touchY > touchStartY + 80 && scrollTop === 0 && !refreshing) {
        handleRefresh();
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [handleRefresh, refreshing]);

  return (
    <Container maxWidth="md" sx={{ py: 2, pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WalletIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight={700}>
            Mi Billetera
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} disabled={refreshing} size="small">
          <RefreshIcon
            sx={{
              animation: refreshing ? "spin 0.5s linear infinite" : "none",
            }}
          />
        </IconButton>
      </Box>

      {/* Tarjeta de saldo */}
      <WalletBalanceCard
        balance={balance}
        isLoading={isLoading.balance}
        onRefresh={handleRefresh}
      />

      {/* Acciones rápidas */}
      <QuickActions
        onTopUp={() => setShowTopUpModal(true)}
        onViewHistory={() => setTabValue(1)}
      />

      {/* Estadísticas rápidas */}
      <QuickStats
        transactions={transactions}
        isLoading={isLoading.transactions}
      />

      {/* Sección para artistas (solo visible si es artista) */}
      <ArtistSection />

      {/* Tabs: Resumen / Historial completo */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            "& .MuiTab-root": {
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Resumen" />
          <Tab label="Historial completo" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 ? (
            // Resumen: últimos movimientos
            <>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Últimos movimientos
              </Typography>
              {transactions.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <WalletIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                  />
                  <Typography color="text.secondary" variant="body2">
                    No hay movimientos recientes
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setShowTopUpModal(true)}
                    sx={{ mt: 2 }}
                    variant="outlined"
                  >
                    Recargar saldo
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {transactions.slice(0, 5).map((tx, index) => (
                    <Box key={tx.id || index}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {tx.transaction_type === "deposit"
                              ? "Recarga"
                              : tx.transaction_type === "purchase"
                                ? "Compra"
                                : "Transacción"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(tx.created_at, false)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            color:
                              tx.transaction_type === "deposit"
                                ? "#10B981"
                                : "#EF4444",
                          }}
                        >
                          {tx.transaction_type === "deposit" ? "+" : "-"}
                          {formatCurrency(Math.abs(tx.amount), tx.currency)}
                        </Typography>
                      </Box>
                      {index < Math.min(transactions.length, 5) - 1 && (
                        <Divider sx={{ mt: 1.5 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </>
          ) : (
            // Historial completo (componente existente)
            <TransactionHistory />
          )}
        </Box>
      </Paper>

      {/* Modal de recarga */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={handleTopUpSuccess}
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ fontSize: "0.85rem" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Animación de refresco (pull-to-refresh) */}
      {refreshing && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pt: 1,
            zIndex: 1300,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Container>
  );
};

export default WalletPage;
