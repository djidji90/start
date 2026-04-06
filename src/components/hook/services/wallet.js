// src/components/hook/services/wallet.js
// ✅ Servicio optimizado para llamadas a la API del wallet
// ✅ Con cache, deduplicación de peticiones y manejo de errores
// ✅ Ready for production

import api from "/src/components/hook/services/apia.js";

// ============================================
// CACHE CONFIGURATION
// ============================================

const cache = new Map();
const pendingRequests = new Map();

const CACHE_TTL = {
  balance: 30000,      // 30 segundos
  transactions: 15000, // 15 segundos
  earnings: 60000,     // 60 segundos
  holds: 15000,        // 15 segundos
};

const getCached = (key, ttl) => {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  return null;
};

const setCached = (key, data, ttl) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
};

const clearCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

const dedupe = async (key, fn, ttl) => {
  // Si hay una petición en curso, reutilizarla
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Verificar cache
  const cached = getCached(key, ttl);
  if (cached) {
    return cached;
  }
  
  // Hacer la petición
  const promise = fn().then(result => {
    setCached(key, result, ttl);
    return result;
  }).finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
};

// ============================================
// WALLET SERVICE
// ============================================

export const walletService = {
  /**
   * Obtener balance del usuario autenticado
   * @param {boolean} forceRefresh - Forzar actualización
   * @returns {Promise<Object>} Datos de balance
   */
  async getBalance(forceRefresh = false) {
    if (forceRefresh) {
      cache.delete('balance');
    }
    
    return dedupe('balance', async () => {
      const response = await api.get('/wallet/balance/');
      return response.data;
    }, CACHE_TTL.balance);
  },
  
  /**
   * Obtener historial de transacciones
   * @param {Object} params - Parámetros de paginación y filtros
   * @returns {Promise<Object>} Lista de transacciones
   */
  async getTransactions(params = {}) {
    const { page = 1, pageSize = 20, type = null } = params;
    const cacheKey = `transactions_${page}_${pageSize}_${type || 'all'}`;
    
    return dedupe(cacheKey, async () => {
      let url = `/wallet/transactions/?page=${page}&page_size=${pageSize}`;
      if (type) url += `&transaction_type=${type}`;
      const response = await api.get(url);
      return response.data;
    }, CACHE_TTL.transactions);
  },
  
  /**
   * Comprar una canción
   * @param {number|string} songId - ID de la canción
   * @param {number|null} price - Precio (opcional)
   * @returns {Promise<Object>} Resultado de la compra
   */
  async purchaseSong(songId, price = null) {
    const payload = price ? { price } : {};
    const response = await api.post(`/wallet/songs/${songId}/purchase/`, payload);
    
    // Invalidar cache relacionado
    clearCache('balance');
    clearCache('transactions');
    
    return response.data;
  },
  
  /**
   * Canjear código de recarga
   * @param {string} code - Código de recarga
   * @returns {Promise<Object>} Resultado del canje
   */
  async redeemCode(code) {
    const response = await api.post('/wallet/redeem/', { code });
    
    // Invalidar cache relacionado
    clearCache('balance');
    clearCache('transactions');
    
    return response.data;
  },
  
  /**
   * Obtener ganancias del artista (solo para artistas)
   * @returns {Promise<Object>} Datos de ganancias
   */
  async getArtistEarnings() {
    return dedupe('earnings', async () => {
      const response = await api.get('/wallet/artist/earnings/');
      return response.data;
    }, CACHE_TTL.earnings);
  },
  
  /**
   * Obtener holds del artista (solo para artistas)
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Object>} Lista de holds
   */
  async getArtistHolds(params = {}) {
    const { page = 1, pageSize = 20 } = params;
    const cacheKey = `holds_${page}_${pageSize}`;
    
    return dedupe(cacheKey, async () => {
      const response = await api.get(`/wallet/artist/holds/?page=${page}&page_size=${pageSize}`);
      return response.data;
    }, CACHE_TTL.holds);
  },
  
  /**
   * Liberar hold (solo admin)
   * @param {number} holdId - ID del hold
   * @returns {Promise<Object>} Resultado de la liberación
   */
  async releaseHold(holdId) {
    const response = await api.post('/wallet/admin/holds/release/', { hold_id: holdId });
    clearCache('holds');
    return response.data;
  },
  
  /**
   * Limpiar toda la cache manualmente
   */
  clearCache() {
    cache.clear();
    pendingRequests.clear();
  }
};

export default walletService;