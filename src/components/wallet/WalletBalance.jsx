// src/components/wallet/WalletBalance.jsx
// ✅ Componente para mostrar saldo del usuario
// ✅ Listo para producción

import React, { useState } from 'react';
import useWallet from '../../components/hook/useWallet';
import TopUpModal from './TopUpModal';
import { formatCurrency } from '../../utils/formatters';
import './WalletBalance.css';  // ✅ Ruta corregida

/**
 * Componente WalletBalance
 * Muestra el saldo del usuario y botón de recarga
 * Colocar en header o sidebar
 */
const WalletBalance = ({ variant = 'compact', showIcon = true }) => {
  const { 
    balance, 
    formattedAvailable, 
    isLoading, 
    error,
    refresh 
  } = useWallet();
  
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  
  // Si está cargando
  if (isLoading.balance) {
    return (
      <div className="wallet-balance loading">
        <span className="wallet-icon">💰</span>
        <span className="wallet-amount">Cargando...</span>
      </div>
    );
  }
  
  // Si hay error
  if (error) {
    return (
      <div className="wallet-balance error">
        <span className="wallet-icon">⚠️</span>
        <span className="wallet-amount">Error</span>
        <button onClick={refresh} className="wallet-retry">⟳</button>
      </div>
    );
  }
  
  // Variante compacta (para header)
  if (variant === 'compact') {
    return (
      <>
        <div className="wallet-balance compact">
          {showIcon && <span className="wallet-icon">💰</span>}
          <span className="wallet-amount">{formattedAvailable}</span>
          <button 
            onClick={() => setShowTopUpModal(true)}
            className="wallet-topup-btn"
            title="Recargar saldo"
          >
            +
          </button>
        </div>
        
        <TopUpModal 
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          onSuccess={() => {
            setShowTopUpModal(false);
            refresh();
          }}
        />
      </>
    );
  }
  
  // Variante completa (para página de wallet)
  return (
    <>
      <div className="wallet-balance full">
        <div className="wallet-header">
          <h3>Mi Billetera</h3>
          <button onClick={refresh} className="wallet-refresh">
            🔄 Actualizar
          </button>
        </div>
        
        <div className="wallet-balances">
          <div className="balance-item available">
            <span className="balance-label">Disponible</span>
            <span className="balance-amount">{formattedAvailable}</span>
          </div>
          
          {balance.pending > 0 && (
            <div className="balance-item pending">
              <span className="balance-label">Pendiente (en camino)</span>
              <span className="balance-amount">
                {formatCurrency(balance.pending, balance.currency)}
              </span>
            </div>
          )}
          
          <div className="balance-item total">
            <span className="balance-label">Total</span>
            <span className="balance-amount">
              {formatCurrency(balance.total, balance.currency)}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowTopUpModal(true)}
          className="wallet-topup-full"
        >
          💰 Recargar saldo
        </button>
      </div>
      
      <TopUpModal 
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={() => {
          setShowTopUpModal(false);
          refresh();
        }}
      />
    </>
  );
};

export default WalletBalance;