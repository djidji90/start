// components/Upload/UploadButton.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import FileUploader from './FileUploader';

const UploadButton = () => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!uploading) {
      setOpen(false);
    }
  };

  const handleUploadStart = () => {
    setUploading(true);
  };

  const handleUploadEnd = () => {
    setUploading(false);
    // Podrías querer cerrar automáticamente después de un upload exitoso
    // setTimeout(() => setOpen(false), 2000);
  };

  return (
    <>
      {/* Versión desktop: Botón normal */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 2 }}>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleOpen}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            borderRadius: '50px',
            px: 3,
            py: 1,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Subir Música
        </Button>
      </Box>

      {/* Versión móvil: Floating Action Button */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Tooltip title="Subir música">
          <Fab
            color="primary"
            onClick={handleOpen}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <UploadIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* Modal de Upload */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : '12px',
            minHeight: fullScreen ? '100vh' : 'auto',
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UploadIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Subir Música
            </Typography>
          </Box>
          
          <IconButton
            onClick={handleClose}
            disabled={uploading}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {/* Aquí va nuestro componente FileUploader */}
          <Box sx={{ maxHeight: fullScreen ? 'calc(100vh - 140px)' : '70vh', overflow: 'auto' }}>
            <FileUploader 
              onUploadStart={handleUploadStart}
              onUploadEnd={handleUploadEnd}
              isModal={true}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #e5e7eb', p: 2 }}>
          <Button
            onClick={handleClose}
            disabled={uploading}
            sx={{ color: 'text.secondary' }}
          >
            {uploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                Subiendo...
              </Box>
            ) : (
              'Cerrar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadButton;