// src/components/hook/usePurchase.js
// ✅ Con manejo de error 429 (contador regresivo)
// ✅ Con verificación de saldo antes de comprar
// ✅ Con integración con TopUpContext

import { useState, useCallback, useRef, useEffect } from 'react';
import { walletService } from '../../components/hook/services/wallet';
import useDownload from '../../components/hook/services/useDownload';
import { useTopUp } from '../../components/hook/services/TopUpContext';
import { useWallet } from '../../components/hook/useWallet';
import { formatCurrency } from '../../utils/formatters';

export const usePurchase = (song) => {
  const { id: songId, title: songTitle, artist: artistName, price } = song;
  
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(null);
  
  const purchaseLock = useRef(false);
  const rateLimitTimerRef = useRef(null);
  
  const downloadHook = useDownload();
  const { showTopUp } = useTopUp();
  const { balance, refresh: refreshBalance } = useWallet();
  
  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) {
        clearTimeout(rateLimitTimerRef.current);
      }
    };
  }, []);
  
  // ✅ Verificar saldo antes de comprar
  const hasSufficientBalance = useCallback(() => {
    const available = balance?.available || 0;
    const songPrice = price || 0;
    
    if (available < songPrice) {
      setPurchaseError({
        type: 'insufficient_funds',
        message: `Saldo insuficiente. Dispones de ${formatCurrency(available)} y necesitas ${formatCurrency(songPrice)}.`,
        required: songPrice,
        current: available,
        currency: 'XAF',
        songTitle: songTitle
      });
      
      // Preguntar si quiere recargar
      const shouldRecharge = window.confirm(
        `⚠️ Saldo insuficiente\n\n` +
        `Disponible: ${formatCurrency(available)}\n` +
        `Necesitas: ${formatCurrency(songPrice)}\n\n` +
        `¿Quieres recargar saldo ahora?`
      );
      
      if (shouldRecharge) {
        showTopUp(songPrice);
      }
      
      return false;
    }
    return true;
  }, [balance, price, songTitle, showTopUp]);
  
  /**
   * Compra y descarga la canción
   */
  const purchaseAndDownload = useCallback(async () => {
    // ✅ Verificar saldo ANTES de intentar comprar
    if (!hasSufficientBalance()) {
      return { success: false, message: 'Saldo insuficiente' };
    }
    
    // Evitar ejecución simultánea
    if (purchaseLock.current) {
      return { success: false, message: 'Compra en progreso' };
    }
    
    // Si hay rate limit activo, no intentar
    if (rateLimitRemaining > 0) {
      setPurchaseError({
        type: 'rate_limited',
        message: `⏳ Límite de compras alcanzado. Espera ${rateLimitRemaining} segundos.`,
        retryAfter: rateLimitRemaining
      });
      return { success: false, message: 'Rate limit activo' };
    }
    
    purchaseLock.current = true;
    setIsPurchasing(true);
    setPurchaseError(null);
    
    try {
      // 1. Comprar canción
      const purchaseResult = await walletService.purchaseSong(songId, price);
      
      // 2. Descargar canción
      const downloadResult = await downloadHook.downloadSong(songId, songTitle, artistName);
      
      // 3. Refrescar balance
      await refreshBalance();
      
      return {
        success: true,
        purchased: true,
        downloaded: true,
        purchaseResult,
        downloadResult
      };
      
    } catch (error) {
      const status = error.response?.status || error.status;
      const data = error.response?.data;
      
      // ============================================
      // ERROR 429 - RATE LIMIT (con contador regresivo)
      // ============================================
      if (status === 429) {
        const retryAfter = error.retryAfter || 
                          error.response?.headers?.['retry-after'] || 
                          data?.retry_after || 
                          60;
        
        setRateLimitRemaining(retryAfter);
        setPurchaseError({
          type: 'rate_limited',
          message: `⏳ Demasiadas compras. Espera ${retryAfter} segundos antes de intentar nuevamente.`,
          retryAfter: retryAfter
        });
        
        // Contador regresivo visual
        if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
        
        const updateTimer = () => {
          setRateLimitRemaining(prev => {
            const newValue = prev - 1;
            if (newValue <= 0) {
              setPurchaseError(null);
              return 0;
            }
            rateLimitTimerRef.current = setTimeout(updateTimer, 1000);
            return newValue;
          });
        };
        rateLimitTimerRef.current = setTimeout(updateTimer, 1000);
      }
      
      // ============================================
      // ERROR 402 - SALDO INSUFICIENTE (backend)
      // ============================================
      else if (status === 402) {
        const required = data?.required || price;
        const current = data?.current_balance || 0;
        
        setPurchaseError({
          type: 'insufficient_funds',
          message: data?.message || `Saldo insuficiente. Necesitas ${formatCurrency(required)}.`,
          required: required,
          current: current,
          currency: data?.currency || 'XAF',
          songTitle: songTitle
        });
        
        // ✅ Abrir modal de recarga global
        showTopUp(required);
      }
      
      // ============================================
      // ERROR 409 - DUPLICADO (idempotencia)
      // ============================================
      else if (status === 409) {
        setPurchaseError({
          type: 'duplicate',
          message: 'Esta transacción ya fue procesada. No se cobrará nuevamente.',
        });
      }
      
      // ============================================
      // ERRORES GENÉRICOS
      // ============================================
      else {
        setPurchaseError({
          type: 'purchase_failed',
          message: error.message || data?.message || 'Error al procesar la compra. Intenta nuevamente.',
          status: status
        });
      }
      
      throw error;
      
    } finally {
      setIsPurchasing(false);
      purchaseLock.current = false;
    }
  }, [songId, songTitle, artistName, price, downloadHook, rateLimitRemaining, showTopUp, refreshBalance, hasSufficientBalance]);
  
  /**
   * Maneja la acción de descarga
   */
  const handleDownload = useCallback(async () => {
    if (downloadHook.isDownloaded(songId)) {
      const info = downloadHook.getDownloadInfo(songId);
      return {
        alreadyDownloaded: true,
        info,
        success: true
      };
    }
    
    return purchaseAndDownload();
  }, [songId, downloadHook, purchaseAndDownload]);
  
  /**
   * Limpiar error
   */
  const clearPurchaseError = useCallback(() => {
    setPurchaseError(null);
    if (rateLimitTimerRef.current) {
      clearTimeout(rateLimitTimerRef.current);
    }
    setRateLimitRemaining(null);
  }, []);
  
  const isAlreadyDownloaded = downloadHook.isDownloaded(songId);
  const downloadInfo = downloadHook.getDownloadInfo(songId);
  const isCurrentlyDownloading = downloadHook.downloading?.[songId] || false;
  
  const buttonText = (() => {
    if (isPurchasing) return 'Procesando...';
    if (isCurrentlyDownloading) return 'Descargando...';
    if (isAlreadyDownloaded) return 'Reproducir offline';
    if (rateLimitRemaining > 0) return `Esperar ${rateLimitRemaining}s`;
    return `Descargar por ${formatCurrency(price)}`;
  })();
  
  const isButtonDisabled = isPurchasing || isCurrentlyDownloading || rateLimitRemaining > 0;
  
  return {
    isPurchasing,
    purchaseError,
    isAlreadyDownloaded,
    isCurrentlyDownloading,
    downloadInfo,
    rateLimitRemaining,
    isButtonDisabled,
    
    purchaseAndDownload,
    handleDownload,
    clearPurchaseError,
    
    buttonText,
    
    showTopUpRequired: purchaseError?.type === 'insufficient_funds',
    topUpInfo: purchaseError?.type === 'insufficient_funds' ? {
      required: purchaseError.required,
      current: purchaseError.current,
      currency: purchaseError.currency,
      songTitle: purchaseError.songTitle
    } : null,
    
    showRateLimit: purchaseError?.type === 'rate_limited',
    rateLimitInfo: purchaseError?.type === 'rate_limited' ? {
      retryAfter: purchaseError.retryAfter,
      message: purchaseError.message
    } : null
  };
};

export default usePurchase; 