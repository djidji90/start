import React from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Slide,
  SlideProps,
  Typography,
} from '@mui/material';
import { Update, Close, Refresh } from '@mui/icons-material';

interface SlideTransitionProps extends SlideProps {
  children: React.ReactElement;
}

function SlideTransition(props: SlideTransitionProps) {
  return <Slide {...props} direction="up" />;
}

interface UpdateNotificationProps {
  open: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  open,
  onUpdate,
  onDismiss,
}) => {
  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
      autoHideDuration={10000} // Se oculta sola después de 10 segundos
      onClose={onDismiss}
      sx={{ zIndex: 1400 }}
    >
      <Alert
        severity="info"
        icon={<Update sx={{ fontSize: '1.2rem' }} />}
        sx={{
          bgcolor: 'primary.main',
          color: '#fff',
          '& .MuiAlert-icon': { color: '#fff' },
          borderRadius: 2,
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          minWidth: { xs: '280px', sm: '360px' },
          maxWidth: '420px',
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              color="inherit"
              size="small"
              onClick={onUpdate}
              startIcon={<Refresh sx={{ fontSize: '1rem' }} />}
              sx={{
                fontWeight: 600,
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                },
              }}
            >
              Actualizar
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={onDismiss}
              sx={{
                minWidth: 0,
                p: 0.5,
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Close fontSize="small" />
            </Button>
          </Box>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          🚀 Nueva versión disponible
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Actualiza para disfrutar de las mejoras
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default UpdateNotification;