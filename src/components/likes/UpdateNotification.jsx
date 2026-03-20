// src/App.jsx o src/components/UpdateNotification.jsx

import React, { useEffect, useState } from 'react';
import { Snackbar, Button, Alert } from '@mui/material';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Escuchar cuando el service worker cambia
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Nueva versión activada, recargando...');
        window.location.reload();
      });

      // Escuchar mensajes del service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
          console.log('🎉 Nueva versión disponible:', event.data.version);
          setShowUpdate(true);
        }
      });

      // Detectar nuevo service worker en espera
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nuevo worker instalado pero en espera
              setShowUpdate(true);
              setWaitingWorker(newWorker);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Enviar mensaje para saltar la espera
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
    setShowUpdate(false);
  };

  return (
    <Snackbar
      open={showUpdate}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={handleUpdate}>
            ACTUALIZAR
          </Button>
        }
      >
        🚀 ¡Nueva versión disponible!
      </Alert>
    </Snackbar>
  );
};

export default UpdateNotification;