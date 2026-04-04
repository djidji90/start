// src/components/hook/services/wallet.js
// ✅ Servicio para llamadas a la API del wallet
// ✅ Listo para producción

import api from './apia';

/**
 * Servicio de wallet - Comunicación con el backend
 * Todos los métodos devuelven Promesas
 */
export const walletService = {
  /**
   * Obtener balance del usuario autenticado
   * @returns {Promise<Object>} Datos de balance
   */
  async getBalance() {
    const response = await api.get('/wallet/balance/');
    return response.data;
  },
  
  /**
   * Obtener historial de transacciones
   * @param {Object} params - Parámetros de paginación y filtros
   * @returns {Promise<Object>} Lista de transacciones
   */
  async getTransactions(params = {}) {
    const { page = 1, pageSize = 20, type = null } = params;
    let url = `/wallet/transactions/?page=${page}&page_size=${pageSize}`;
    if (type) url += `&transaction_type=${type}`;
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Comprar una canción
   * @param {number|string} songId - ID de la canción
   * @param {number|null} price - Precio (opcional, se obtiene del backend)
   * @returns {Promise<Object>} Resultado de la compra
   */
  async purchaseSong(songId, price = null) {
    const payload = price ? { price } : {};
    const response = await api.post(`/wallet/songs/${songId}/purchase/`, payload);
    return response.data;
  },
  
  /**
   * Canjear código de recarga
   * @param {string} code - Código de recarga
   * @returns {Promise<Object>} Resultado del canje
   */
  async redeemCode(code) {
    const response = await api.post('/api/wallet/redeem/', { code });
    return response.data;
  },
  
  /**
   * Obtener ganancias del artista (solo para artistas)
   * @returns {Promise<Object>} Datos de ganancias
   */
  async getArtistEarnings() {
    const response = await api.get('/wallet/artist/earnings/');
    return response.data;
  },
  
  /**
   * Obtener holds del artista (solo para artistas)
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Object>} Lista de holds
   */
  async getArtistHolds(params = {}) {
    const { page = 1, pageSize = 20 } = params;
    const response = await api.get(`/wallet/artist/holds/?page=${page}&page_size=${pageSize}`);
    return response.data;
  },
  
  /**
   * Liberar hold (solo admin)
   * @param {number} holdId - ID del hold
   * @returns {Promise<Object>} Resultado de la liberación
   */
  async releaseHold(holdId) {
    const response = await api.post('/wallet/admin/holds/release/', { hold_id: holdId });
    return response.data;
  }
};