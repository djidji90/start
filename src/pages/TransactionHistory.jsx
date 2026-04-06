// src/components/wallet/TransactionHistory.jsx
// ✅ Muestra el historial de transacciones del usuario
// ✅ Usa el endpoint /wallet/transactions/
// ✅ Con paginación, filtros y estados de carga
// ✅ Listo para producción

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Skeleton,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Payment as DepositIcon,
  ShoppingCart as PurchaseIcon,
  Receipt as RefundIcon,
  AccountBalanceWallet as WalletIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { formatCurrency, formatDate, formatTransactionType, formatTransactionStatus } from '../utils/formatters';
import { walletService } from '../components/hook/services/wallet';

// ============================================
// COMPONENTE: SKELETON LOADING
// ============================================
const TransactionSkeleton = () => (
  <Box sx={{ px: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Box key={i} sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
          <Skeleton variant="text" width={80} height={24} />
        </Box>
        {i < 5 && <Divider sx={{ mt: 2 }} />}
      </Box>
    ))}
  </Box>
);

// ============================================
// COMPONENTE: FILTROS
// ============================================
const TransactionFilters = ({ filterType, onFilterChange, onRefresh, refreshing }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Filtrar</InputLabel>
        <Select
          value={filterType}
          onChange={onFilterChange}
          label="Filtrar"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="deposit">📥 Recargas</MenuItem>
          <MenuItem value="purchase">🎵 Compras</MenuItem>
          <MenuItem value="refund">↩️ Reembolsos</MenuItem>
          <MenuItem value="withdrawal">💸 Retiros</MenuItem>
          <MenuItem value="fee">💰 Comisiones</MenuItem>
        </Select>
      </FormControl>

      <IconButton
        onClick={onRefresh}
        disabled={refreshing}
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
        }}
      >
        <RefreshIcon sx={{ animation: refreshing ? 'spin 0.5s linear infinite' : 'none' }} />
      </IconButton>
    </Box>
  );
};

// ============================================
// COMPONENTE: ITEM DE TRANSACCIÓN
// ============================================
const TransactionItem = ({ transaction, index, isLast }) => {
  const theme = useTheme();

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <DepositIcon sx={{ color: '#10B981' }} />;
      case 'purchase':
        return <PurchaseIcon sx={{ color: '#FF6B35' }} />;
      case 'refund':
        return <RefundIcon sx={{ color: '#F59E0B' }} />;
      case 'withdrawal':
        return <TrendingDownIcon sx={{ color: '#EF4444' }} />;
      case 'fee':
        return <TrendingUpIcon sx={{ color: '#6B7280' }} />;
      default:
        return <WalletIcon sx={{ color: '#6B7280' }} />;
    }
  };

  const getAmountColor = (type, amount) => {
    if (type === 'deposit') return '#10B981';
    if (type === 'purchase') return '#EF4444';
    if (type === 'withdrawal') return '#EF4444';
    if (type === 'fee') return '#6B7280';
    if (amount > 0) return '#10B981';
    return '#EF4444';
  };

  const getAmountSign = (type, amount) => {
    if (type === 'deposit') return '+';
    if (type === 'purchase') return '-';
    if (type === 'withdrawal') return '-';
    if (type === 'fee') return '-';
    if (amount > 0) return '+';
    return '';
  };

  const isPositive = transaction.transaction_type === 'deposit';
  const amount = Math.abs(transaction.amount);

  // Obtener descripción adicional si existe
  const getDescription = () => {
    if (transaction.metadata?.song_title) {
      return `Canción: ${transaction.metadata.song_title}`;
    }
    if (transaction.metadata?.code) {
      return `Código: ${transaction.metadata.code}`;
    }
    if (transaction.description) {
      return transaction.description;
    }
    return null;
  };

  const description = getDescription();

  return (
    <Fade in={true} timeout={300 + (index * 50)}>
      <Box>
        <ListItem sx={{ py: 2, px: 0 }}>
          <ListItemIcon>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(getAmountColor(transaction.transaction_type, transaction.amount), 0.1)
              }}
            >
              {getTransactionIcon(transaction.transaction_type)}
            </Box>
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {formatTransactionType(transaction.transaction_type)}
                </Typography>
                <Chip
                  label={formatTransactionStatus(transaction.status)}
                  size="small"
                  color={transaction.status === 'completed' ? 'success' : transaction.status === 'pending' ? 'warning' : 'error'}
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              </Box>
            }
            secondary={
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {formatDate(transaction.created_at, true)}
                </Typography>
                {transaction.reference && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    Ref: {transaction.reference.slice(0, 12)}...
                  </Typography>
                )}
                {description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {description}
                  </Typography>
                )}
              </Box>
            }
          />
          
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{
              color: getAmountColor(transaction.transaction_type, transaction.amount),
              minWidth: 100,
              textAlign: 'right'
            }}
          >
            {getAmountSign(transaction.transaction_type, transaction.amount)}{formatCurrency(amount, transaction.currency || 'XAF')}
          </Typography>
        </ListItem>
        {!isLast && <Divider />}
      </Box>
    </Fade>
  );
};

// ============================================
// COMPONENTE: VACÍO
// ============================================
const EmptyState = ({ onTopUp }) => {
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <WalletIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No hay transacciones
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Realiza tu primera recarga o compra para ver tu historial
      </Typography>
    </Box>
  );
};

// ============================================
// COMPONENTE: PRINCIPAL
// ============================================
const TransactionHistory = ({ onTopUp, compact = false, limit = null }) => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [filterType, setFilterType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async (page = 1, type = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { page, pageSize: compact ? (limit || 10) : 20 };
      if (type && type !== 'all') params.type = type;
      
      const data = await walletService.getTransactions(params);
      
      setTransactions(data.results || []);
      setPagination({
        page: data.page || page,
        totalPages: data.total_pages || 1,
        total: data.total || 0
      });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Error al cargar el historial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [compact, limit]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions(pagination.page, filterType);
  }, [fetchTransactions, pagination.page, filterType]);

  const handlePageChange = useCallback((event, newPage) => {
    fetchTransactions(newPage, filterType);
  }, [fetchTransactions, filterType]);

  const handleFilterChange = useCallback((event) => {
    const newType = event.target.value;
    setFilterType(newType);
    fetchTransactions(1, newType);
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions(1, 'all');
  }, [fetchTransactions]);

  // Modo compacto (para resumen en WalletPage)
  if (compact) {
    if (loading) {
      return <TransactionSkeleton />;
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      );
    }

    if (transactions.length === 0) {
      return <EmptyState onTopUp={onTopUp} />;
    }

    return (
      <Box>
        {transactions.slice(0, limit || 5).map((transaction, index) => (
          <TransactionItem
            key={transaction.id || transaction.reference}
            transaction={transaction}
            index={index}
            isLast={index === (limit || 5) - 1 || index === transactions.length - 1}
          />
        ))}
      </Box>
    );
  }

  // Modo completo (página dedicada)
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          📜 Historial de Transacciones
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Total: {pagination.total} transacciones
        </Typography>
      </Box>

      <TransactionFilters
        filterType={filterType}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {loading && transactions.length === 0 ? (
        <TransactionSkeleton />
      ) : error ? (
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      ) : transactions.length === 0 ? (
        <EmptyState onTopUp={onTopUp} />
      ) : (
        <>
          <List sx={{ py: 0 }}>
            {transactions.map((transaction, index) => (
              <TransactionItem
                key={transaction.id || transaction.reference}
                transaction={transaction}
                index={index}
                isLast={index === transactions.length - 1}
              />
            ))}
          </List>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size={compact ? 'small' : 'medium'}
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default TransactionHistory;