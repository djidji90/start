// src/components/landing/InstallPWAButton.tsx
import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, alpha, useTheme } from '@mui/material';
import { InstallMobile, CheckCircle, Download } from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPWAButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  fullWidth?: boolean;
}

const InstallPWAButton: React.FC<InstallPWAButtonProps> = ({
  variant = 'contained',
  size = 'large',
  showIcon = true,
  fullWidth = false,
}) => {
  const theme = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  useEffect(() => {
    // Detectar si ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // Escuchar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('✅ Evento beforeinstallprompt capturado');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Escuchar cuando se completa la instalación
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setMessageType('success');
      setMessage('✅ ¡App instalada correctamente!');
      setShowMessage(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isInstalled) {
      setMessageType('info');
      setMessage('📱 La app ya está instalada. Puedes encontrarla en tu pantalla de inicio.');
      setShowMessage(true);
      return;
    }

    if (deferredPrompt) {
      // Usar el prompt nativo
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      } else {
        setMessageType('info');
        setMessage('Puedes instalar la app cuando quieras desde el menú del navegador');
        setShowMessage(true);
      }
    } else {
      // Fallback: mostrar instrucciones manuales
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        setMessageType('info');
        setMessage('📱 En Safari: toca el botón Compartir → "Añadir a pantalla de inicio"');
      } else if (isAndroid) {
        setMessageType('info');
        setMessage('📱 En Chrome: toca el menú ⋮ → "Instalar app"');
      } else {
        setMessageType('info');
        setMessage('📱 En escritorio: haz clic en el icono de instalación 🔽 en la barra de direcciones');
      }
      setShowMessage(true);
    }
  };

  // Determinar texto del botón
  const buttonText = isInstalled ? 'App instalada' : 'Instalar App';

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={showIcon && (isInstalled ? <CheckCircle /> : <InstallMobile />)}
        onClick={handleInstall}
        fullWidth={fullWidth}
        disabled={isInstalled}
        sx={{
          background: isInstalled 
            ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: '#fff',
          fontWeight: 600,
          borderRadius: 3,
          py: 1.2,
          px: 3,
          textTransform: 'none',
          fontSize: { xs: '0.9rem', sm: '1rem' },
          boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
            background: isInstalled 
              ? `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          },
          '&:disabled': {
            background: alpha(theme.palette.success.main, 0.5),
            color: alpha('#fff', 0.7),
          },
        }}
      >
        {buttonText}
      </Button>

      <Snackbar
        open={showMessage}
        autoHideDuration={5000}
        onClose={() => setShowMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 1400 }}
      >
        <Alert
          severity={messageType}
          onClose={() => setShowMessage(false)}
          sx={{
            bgcolor: messageType === 'info' ? theme.palette.primary.main : undefined,
            color: messageType === 'info' ? '#fff' : undefined,
            '& .MuiAlert-icon': messageType === 'info' ? { color: '#fff' } : undefined,
          }}
          icon={messageType === 'info' ? <Download /> : undefined}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InstallPWAButton;