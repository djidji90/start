// src/context/TopUpContext.jsx
// ✅ Contexto global para el modal de recarga
// ✅ Evita múltiples instancias y parpadeos
// ✅ Un solo modal para toda la aplicación

import React, { createContext, useContext, useState, useCallback } from 'react';
import TopUpModal from '../../../components/wallet/TopUpModal';
import useWallet from '../../../components/hook/useWallet';

const TopUpContext = createContext(null);

export const useTopUp = () => {
  const context = useContext(TopUpContext);
  if (!context) {
    throw new Error('useTopUp debe usarse dentro de TopUpProvider');
  }
  return context;
};

export const TopUpProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [presetAmount, setPresetAmount] = useState(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);
  const { refresh: refreshBalance } = useWallet();

  const showTopUp = useCallback((amount = null, onSuccess = null) => {
    setPresetAmount(amount);
    setOnSuccessCallback(() => onSuccess);
    setIsOpen(true);
  }, []);

  const hideTopUp = useCallback(() => {
    setIsOpen(false);
    setPresetAmount(null);
    setOnSuccessCallback(null);
  }, []);

  const handleSuccess = useCallback(async (result) => {
    await refreshBalance();
    if (onSuccessCallback) {
      onSuccessCallback(result);
    }
    hideTopUp();
  }, [refreshBalance, onSuccessCallback, hideTopUp]);

  return (
    <TopUpContext.Provider value={{ showTopUp, hideTopUp }}>
      {children}
      <TopUpModal
        isOpen={isOpen}
        onClose={hideTopUp}
        onSuccess={handleSuccess}
        presetAmount={presetAmount}
      />
    </TopUpContext.Provider>
  );
};

export default TopUpProvider;