// ============================================
// context/DownloadContext.jsx
// Contexto global para useDownload
// Elimina instancias múltiples y logs duplicados
// ============================================

import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import useDownload from './hooks/useDownload';

// Crear contexto
const DownloadContext = createContext(null);

// Hook personalizado para usar el contexto
export const useDownloadContext = () => {
  const context = useContext(DownloadContext);
  
  if (!context) {
    throw new Error('useDownloadContext debe usarse dentro de DownloadProvider');
  }
  
  return context;
};

// Provider component
export const DownloadProvider = ({ children }) => {
  // 🔥 Una sola instancia del hook para toda la app
  const downloadManager = useDownload();
  const instanceId = useRef(Math.random().toString(36).substring(7));
  const [isReady, setIsReady] = useState(false);

  // Exponer globalmente para debugging (solo desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.__DOWNLOAD_MANAGER__ = downloadManager;
      window.__DOWNLOAD_INSTANCE_ID__ = instanceId.current;
      console.log(`🔧 [DownloadContext] Instancia única ID: ${instanceId.current}`);
    }
    
    setIsReady(true);
    
    return () => {
      if (process.env.NODE_ENV === 'development') {
        delete window.__DOWNLOAD_MANAGER__;
        delete window.__DOWNLOAD_INSTANCE_ID__;
      }
    };
  }, [downloadManager]);

  // Si no está listo, mostrar nada (evita flashes)
  if (!isReady) {
    return null;
  }

  return (
    <DownloadContext.Provider value={downloadManager}>
      {children}
    </DownloadContext.Provider>
  );
};

// ============================================
// HOOK DE CONVENIENCIA CON VERIFICACIÓN
// ============================================
export const useDownload = () => {
  const context = useContext(DownloadContext);
  
  if (!context) {
    // En lugar de error, crear instancia local (útil para componentes aislados)
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️ useDownload usado sin DownloadProvider. ' +
        'Se creará instancia local, pero es mejor usar el contexto.'
      );
    }
    // Fallback a instancia local (para componentes que no están en el árbol)
    return import('../hooks/useDownload').then(mod => mod.default());
  }
  
  return context;
};

// ============================================
// COMPONENTE DE DEBUG (opcional)
// ============================================
export const DownloadDebug = () => {
  const download = useDownloadContext();
  const [showDebug, setShowDebug] = useState(false);

  if (process.env.NODE_ENV !== 'development') return null;
  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 9999,
          padding: '4px 8px',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          cursor: 'pointer',
          opacity: 0.5
        }}
      >
        🐞 Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 60,
        left: 20,
        zIndex: 9999,
        background: '#1a1a1a',
        color: '#00ff00',
        padding: 16,
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 12,
        maxWidth: 400,
        maxHeight: 400,
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        border: '1px solid #333'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong>📊 DOWNLOAD MANAGER</strong>
        <button
          onClick={() => setShowDebug(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      <div><strong>Activas:</strong> {Object.keys(download.downloading).length}</div>
      <div><strong>En cola:</strong> {download.queue.length}</div>
      <div><strong>Errores:</strong> {Object.keys(download.errors).length}</div>
      
      {Object.keys(download.downloading).length > 0 && (
        <>
          <div style={{ marginTop: 12, fontWeight: 'bold' }}>Descargando:</div>
          {Object.entries(download.progress).map(([id, prog]) => (
            <div key={id} style={{ fontSize: 11 }}>
              {id}: {prog}%
            </div>
          ))}
        </>
      )}
      
      {download.queue.length > 0 && (
        <>
          <div style={{ marginTop: 12, fontWeight: 'bold' }}>Cola:</div>
          {download.queue.map((item, i) => (
            <div key={item.songId} style={{ fontSize: 11 }}>
              {i+1}. {item.songTitle}
            </div>
          ))}
        </>
      )}
      
      <div style={{ marginTop: 12, fontSize: 10, color: '#666' }}>
        ID: {window.__DOWNLOAD_INSTANCE_ID__}
      </div>
    </div>
  );
};