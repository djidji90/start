// src/components/hook/usePurchase.js
// ✅ Hook que orquesta compra + descarga
// ✅ Integra walletService + useDownload existente
// ✅ Listo para producción

import { useState, useCallback } from 'react';
import { walletService } from './services/wallet';
import useDownload from '../../components/hook/services/useDownload'; // Tu hook existente
import { formatCurrency } from '../../utils/formatters';
import { generatePurchaseKey } from '../../utils/idempotency';

/**
 * Hook para manejar compra y descarga de canciones
 * @param {Object} song - Objeto de la canción
 * @param {number} song.id - ID de la canción
 * @param {string} song.title - Título de la canción
 * @param {string} song.artist - Artista
 * @param {number} song.price - Precio de la canción
 */
export const usePurchase = (song) => {
  const { id: songId, title: songTitle, artist: artistName, price } = song;
  
  // Estados
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  
  // Hook de descarga existente
  const downloadHook = useDownload();
  const { 
    downloadSong, 
    isDownloaded, 
    getDownloadInfo,
    downloading
  } = downloadHook;
  
  // ============================================
  // FUNCIONES PRINCIPALES
  // ============================================
  
  /**
   * Compra y descarga la canción (flujo completo)
   * @returns {Promise<Object>} Resultado de la operación
   */
  const purchaseAndDownload = useCallback(async () => {
    setIsPurchasing(true);
    setPurchaseError(null);
    
    try {
      // 1. Intentar comprar (el backend verifica saldo y descuenta)
      const purchaseResult = await walletService.purchaseSong(songId, price);
      
      // 2. Si compra exitosa, iniciar descarga
      const downloadResult = await downloadSong(songId, songTitle, artistName);
      
      return {
        success: true,
        purchased: true,
        downloaded: true,
        purchaseResult,
        downloadResult
      };
      
    } catch (error) {
      // Manejo específico de errores
      const status = error.response?.status;
      const data = error.response?.data;
      
      if (status === 402) {
        // Saldo insuficiente
        setPurchaseError({
          type: 'insufficient_funds',
          message: data?.message || 'Saldo insuficiente para descargar esta canción',
          required: data?.required || price,
          current: data?.current_balance || 0,
          currency: data?.currency || 'XAF',
          song: {
            id: songId,
            title: songTitle,
            price: price
          }
        });
      } else if (status === 409) {
        // Conflicto (posible duplicado)
        setPurchaseError({
          type: 'duplicate',
          message: 'Esta transacción ya fue procesada',
        });
      } else if (status === 429) {
        // Rate limit
        setPurchaseError({
          type: 'rate_limited',
          message: data?.message || 'Demasiadas solicitudes. Espera un momento.',
          retryAfter: data?.retry_after || 60
        });
      } else {
        // Error genérico
        setPurchaseError({
          type: 'purchase_failed',
          message: error.message || 'Error al procesar la compra'
        });
      }
      
      throw error;
      
    } finally {
      setIsPurchasing(false);
    }
  }, [songId, songTitle, artistName, price, downloadSong]);
  
  /**
   * Maneja la acción de descarga (con verificación de compra previa)
   * @returns {Promise<Object>}
   */
  const handleDownload = useCallback(async () => {
    // Si ya está descargada, no necesita comprar
    if (isDownloaded(songId)) {
      const info = getDownloadInfo(songId);
      return {
        alreadyDownloaded: true,
        info,
        success: true
      };
    }
    
    // Si no está descargada, comprar y descargar
    return purchaseAndDownload();
  }, [songId, isDownloaded, getDownloadInfo, purchaseAndDownload]);
  
  /**
   * Limpiar error de compra
   */
  const clearPurchaseError = useCallback(() => {
    setPurchaseError(null);
  }, []);
  
  // ============================================
  // VALORES DERIVADOS
  // ============================================
  
  const isAlreadyDownloaded = isDownloaded(songId);
  const downloadInfo = getDownloadInfo(songId);
  const isCurrentlyDownloading = downloading[songId] || false;
  
  // Textos para UI
  const buttonText = useCallback(() => {
    if (isPurchasing) return 'Procesando...';
    if (isCurrentlyDownloading) return 'Descargando...';
    if (isAlreadyDownloaded) return 'Reproducir offline';
    return `Descargar por ${formatCurrency(price)}`;
  }, [isPurchasing, isCurrentlyDownloading, isAlreadyDownloaded, price]);
  
  // ============================================
  // API PÚBLICA
  // ============================================
  
  return {
    // Estado
    isPurchasing,
    purchaseError,
    isAlreadyDownloaded,
    isCurrentlyDownloading,
    downloadInfo,
    
    // Acciones
    purchaseAndDownload,
    handleDownload,
    clearPurchaseError,
    
    // Utilidades UI
    buttonText: buttonText(),
    
    // Para modales de recarga
    showTopUpRequired: purchaseError?.type === 'insufficient_funds',
    topUpInfo: purchaseError?.type === 'insufficient_funds' ? {
      required: purchaseError.required,
      current: purchaseError.current,
      currency: purchaseError.currency,
      songTitle: purchaseError.song?.title
    } : null
  };
};

export default usePurchase;