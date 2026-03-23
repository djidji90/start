import { useState, useEffect, useCallback } from 'react';

interface UseServiceWorkerReturn {
  waitingWorker: ServiceWorker | null;
  updateApp: () => void;
  dismissUpdate: () => void;
  showUpdateNotification: boolean;
  lastChecked: Date | null;
}

export const useServiceWorker = (): UseServiceWorkerReturn => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Función para forzar la actualización
  const updateApp = useCallback(() => {
    if (waitingWorker) {
      // Enviar mensaje para activar el nuevo worker
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      waitingWorker.addEventListener('statechange', (event) => {
        const target = event.target as ServiceWorker;
        if (target.state === 'activated') {
          console.log('✅ Nueva versión activada, recargando...');
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
    setShowUpdateNotification(false);
  }, [waitingWorker]);

  // Función para descartar la notificación
  const dismissUpdate = useCallback(() => {
    setShowUpdateNotification(false);
    setWaitingWorker(null);
    // Guardar que el usuario descartó esta versión
    localStorage.setItem('pwa_update_dismissed_version', Date.now().toString());
  }, []);

  // Configurar el Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker no soportado');
      return;
    }

    const setupServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker listo:', registration);

        // Detectar cuando hay una nueva versión esperando
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('🔄 Nueva versión detectada');

            newWorker.addEventListener('statechange', () => {
              console.log('📊 Estado del SW:', newWorker.state);
              
              // Cuando el nuevo worker está instalado y hay un controlador activo
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🎯 Nueva versión lista para activarse');
                setWaitingWorker(newWorker);
                setShowUpdateNotification(true);
              }
            });
          }
        });

        // Verificar actualizaciones periódicamente (cada 30 minutos)
        const checkInterval = setInterval(() => {
          registration.update();
          setLastChecked(new Date());
          console.log('🔍 Buscando actualizaciones...');
        }, 30 * 60 * 1000);

        // También verificar cuando la pestaña vuelve a estar activa
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            registration.update();
            console.log('👁️ Pestaña activa, verificando actualizaciones...');
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          clearInterval(checkInterval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      } catch (error) {
        console.error('❌ Error configurando Service Worker:', error);
      }
    };

    setupServiceWorker();
  }, []);

  return {
    waitingWorker,
    updateApp,
    dismissUpdate,
    showUpdateNotification,
    lastChecked,
  };
};