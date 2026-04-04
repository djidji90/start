// src/components/wallet/TopUpModal.jsx
// ✅ Modal para recargar saldo con código
// ✅ Listo para producción

import React, { useState } from 'react';
import useWallet from '../../components/hook/useWallet';
import '../../components/wallet/WalletBalance.css'; // Opcional: estilos

/**
 * Modal de recarga de saldo
 * @param {boolean} isOpen - Controla visibilidad del modal
 * @param {function} onClose - Función para cerrar modal
 * @param {function} onSuccess - Función llamada tras recarga exitosa
 * @param {Object} presetAmount - Monto sugerido (opcional)
 */
const TopUpModal = ({ isOpen, onClose, onSuccess, presetAmount = null }) => {
  const { redeemCode, isLoading } = useWallet();
  
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Resetear estado al abrir modal
  const handleOpen = () => {
    setCode('');
    setError(null);
    setSuccess(null);
    setIsSubmitting(false);
  };
  
  // Procesar canje de código
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Ingresa un código de recarga');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await redeemCode(code.trim().toUpperCase());
      setSuccess({
        message: `¡Recarga exitosa! Se añadieron ${result.amount} XAF a tu saldo.`,
        amount: result.amount
      });
      
      // Notificar éxito
      if (onSuccess) onSuccess(result);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Error al canjear el código');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="topup-modal-overlay" onClick={onClose}>
      <div className="topup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="topup-modal-header">
          <h3>Recargar saldo</h3>
          <button className="topup-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="topup-modal-body">
          {/* Formulario de código */}
          <form onSubmit={handleSubmit}>
            <div className="topup-code-input">
              <label htmlFor="redeem-code">Código de recarga</label>
              <input
                id="redeem-code"
                type="text"
                placeholder="Ej: XAFABC12345"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoCapitalize="characters"
                autoComplete="off"
                disabled={isSubmitting}
              />
              <p className="topup-hint">
                ¿Tienes un código físico? Ingresa el código que compraste en una tienda autorizada.
              </p>
            </div>
            
            {error && (
              <div className="topup-error">
                ⚠️ {error}
              </div>
            )}
            
            {success && (
              <div className="topup-success">
                ✅ {success.message}
              </div>
            )}
            
            <button 
              type="submit" 
              className="topup-submit"
              disabled={isSubmitting || !code.trim()}
            >
              {isSubmitting ? 'Procesando...' : 'Canjear código'}
            </button>
          </form>
          
          {/* Información de métodos de recarga */}
          <div className="topup-methods">
            <p className="topup-methods-title">¿No tienes código?</p>
            <p className="topup-methods-text">
              Puedes recargar en cualquiera de nuestras oficinas o puntos de venta autorizados.
              Busca un agente DJI Music cerca de ti.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;