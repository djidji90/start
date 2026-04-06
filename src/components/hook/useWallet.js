// src/components/hook/useWallet.js
// ✅ Hook para manejar estado del wallet
// ✅ Optimizado - Sin refresco automático agresivo
// ✅ Con cache y deduplicación
// ✅ Ready for production

import { useState, useEffect, useCallback, useRef } from 'react';
import { walletService } from './services/wallet';
import { useAuth } from './services/useAuth';
import { formatCurrency } from '../../utils/formatters';

export const useWallet = () => {
  const { isAuthenticated } = useAuth();
  
  // Estados
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    total: 0,
    currency: 'XAF'
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState({
    balance: false,
    transactions: false,
    purchase: false
  });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  
  // Refs para control
  const isMountedRef = useRef(true);
  const initialLoadDoneRef = useRef(false);
  
  // ============================================
  // FUNCIONES PRINCIPALES
  // ============================================
  
  /**
   * Obtener balance del usuario
   * @param {boolean} force - Forzar refresco (ignorar cache)
   */
  const fetchBalance = useCallback(async (force = false) => {
    if (!isAuthenticated) return;
    
    setIsLoading(prev => ({ ...prev, balance: true }));
    setError(null);
    
    try {
      const data = await walletService.getBalance(force);
      
      if (isMountedRef.current) {
        setBalance({
          available: data.available?.value ?? data.available ?? 0,
          pending: data.pending?.value ?? data.pending ?? 0,
          total: data.total?.value ?? data.total ?? 0,
          currency: data.currency || 'XAF'
        });
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      if (isMountedRef.current && err.status !== 429) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(prev => ({ ...prev, balance: false }));
      }
    }
  }, [isAuthenticated]);
  
  /**
   * Obtener historial de transacciones
   * @param {number} page - Número de página
   * @param {string} type - Tipo de transacción (opcional)
   */
  const fetchTransactions = useCallback(async (page = 1, type = null) => {
    if (!isAuthenticated) return;
    
    setIsLoading(prev => ({ ...prev, transactions: true }));
    setError(null);
    
    try {
      const data = await walletService.getTransactions({ page, type });
      
      if (isMountedRef.current) {
        setTransactions(data.results || []);
        setPagination({
          page: data.page || page,
          totalPages: data.total_pages || 1,
          total: data.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      if (isMountedRef.current && err.status !== 429) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(prev => ({ ...prev, transactions: false }));
      }
    }
  }, [isAuthenticated]);
  
  /**
   * Canjear código de recarga
   * @param {string} code - Código a canjear
   * @returns {Promise<Object>} Resultado
   */
  const redeemCode = useCallback(async (code) => {
    if (!isAuthenticated) throw new Error('Debes iniciar sesión');
    
    setError(null);
    
    try {
      const result = await walletService.redeemCode(code);
      // Refrescar balance después de recargar
      await fetchBalance(true);
      return result;
    } catch (err) {
      console.error('Error redeeming code:', err);
      
      // Manejo específico para rate limit
      if (err.status === 429) {
        setError({
          message: err.message,
          retryAfter: err.retryAfter,
          type: 'rate_limited'
        });
      } else {
        setError(err.message);
      }
      throw err;
    }
  }, [isAuthenticated, fetchBalance]);
  
  /**
   * Refrescar todos los datos (solo cuando es necesario)
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchBalance(true),
      fetchTransactions(pagination.page)
    ]);
  }, [fetchBalance, fetchTransactions, pagination.page]);
  
  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // ============================================
  // EFECTOS - SIN REFRESCO AUTOMÁTICO
  // ============================================
  
  // Cargar datos SOLO al montar y cuando cambia autenticación
  useEffect(() => {
    isMountedRef.current = true;
    
    if (isAuthenticated && !initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      fetchBalance();
      fetchTransactions();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [isAuthenticated, fetchBalance, fetchTransactions]);
  
  // ============================================
  // VALORES FORMATEADOS
  // ============================================
  
  const formattedAvailable = formatCurrency(balance.available, balance.currency);
  const formattedPending = formatCurrency(balance.pending, balance.currency);
  const formattedTotal = formatCurrency(balance.total, balance.currency);
  
  /**
   * Verificar si el usuario tiene saldo suficiente
   * @param {number} amount - Monto a verificar
   * @returns {boolean}
   */
  const hasSufficientFunds = useCallback((amount) => {
    return balance.available >= amount;
  }, [balance.available]);
  
  // ============================================
  // API PÚBLICA
  // ============================================
  
  return {
    // Datos
    balance,
    transactions,
    pagination,
    isLoading,
    error,
    
    // Valores formateados
    formattedAvailable,
    formattedPending,
    formattedTotal,
    
    // Acciones
    fetchBalance,
    fetchTransactions,
    redeemCode,
    refresh,
    clearError,
    
    // Utilidades
    hasSufficientFunds,
    isAuthenticated
  };
};

export default useWallet;