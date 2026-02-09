// components/Upload/UploadHistory.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MusicNote as MusicIcon,
  CheckCircle as SuccessIcon,
  AccessTime as ProcessingIcon,
  Error as ErrorIcon,
  Cancel as CancelledIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const UploadHistory = ({ uploads, formatBytes, onRefresh }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'ready':
        return <SuccessIcon color="success" />;
      case 'processing':
      case 'confirmed':
        return <ProcessingIcon color="warning" />;
      case 'error':
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'cancelled':
        return <CancelledIcon color="action" />;
      default:
        return <ProcessingIcon color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'ready':
        return 'success';
      case 'processing':
      case 'confirmed':
        return 'warning';
      case 'error':
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} horas`;
    
    return date.toLocaleDateString();
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Historial de Uploads
        </Typography>
        <Tooltip title="Actualizar estados">
          <IconButton size="small" onClick={() => uploads.forEach(u => onRefresh?.(u.id))}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {uploads.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No hay uploads recientes
        </Typography>
      ) : (
        <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
          {uploads.map((upload, index) => (
            <ListItem
              key={upload.id || index}
              sx={{
                borderBottom: '1px solid #f3f4f6',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemIcon>
                {getStatusIcon(upload.status)}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MusicIcon fontSize="small" color="action" />
                    <Typography variant="body1" noWrap sx={{ maxWidth: '200px' }}>
                      {upload.fileName}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Chip
                      label={upload.status}
                      size="small"
                      color={getStatusColor(upload.status)}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatBytes(upload.fileSize)} • {formatDate(upload.timestamp)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default UploadHistory;