// ============================================
// components/context/StorageBadge.jsx
// Muestra de dónde viene una canción descargada
// 📱 App (cache) | 💾 PC (filesystem) | ☁️ No descargada
// ============================================

import React from 'react';
import { Chip, Tooltip, alpha } from '@mui/material';
import {
  Cloud as CloudIcon,
  Computer as ComputerIcon,
  Smartphone as SmartphoneIcon,
} from '@mui/icons-material';

const StorageBadge = ({ 
  storageType = 'none', 
  size = null,
  showSize = true,
  onClick = null,
  sx = {}
}) => {
  // Configuración por tipo de almacenamiento
  const config = {
    cache: {
      icon: SmartphoneIcon,
      label: 'App',
      color: '#4caf50',
      bgColor: alpha('#4caf50', 0.1),
      tooltip: 'Guardado en la app (reproducción offline)'
    },
    filesystem: {
      icon: ComputerIcon,
      label: 'PC',
      color: '#2196f3',
      bgColor: alpha('#2196f3', 0.1),
      tooltip: 'Guardado en tu ordenador (requiere internet para reproducir)'
    },
    none: {
      icon: CloudIcon,
      label: 'Cloud',
      color: '#9e9e9e',
      bgColor: alpha('#9e9e9e', 0.1),
      tooltip: 'No descargada - disponible online'
    }
  };

  const type = storageType || 'none';
  const { icon: Icon, label, color, bgColor, tooltip } = config[type];
  
  // Formatear tamaño si se proporciona
  const formatSize = (bytes) => {
    if (!bytes) return null;
    const mb = bytes / 1024 / 1024;
    if (mb < 1) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  const sizeText = size && showSize ? formatSize(size) : null;
  const displayLabel = sizeText || label;

  return (
    <Tooltip title={tooltip} arrow>
      <Chip
        icon={<Icon sx={{ color: `${color} !important` }} />}
        label={displayLabel}
        size="small"
        onClick={onClick}
        sx={{
          bgcolor: bgColor,
          color: color,
          fontWeight: 500,
          border: `1px solid ${alpha(color, 0.2)}`,
          '&:hover': onClick ? {
            bgcolor: alpha(color, 0.2),
            cursor: 'pointer'
          } : {},
          '& .MuiChip-icon': { 
            color: color 
          },
          ...sx
        }}
      />
    </Tooltip>
  );
};

// Versión simplificada para listas
export const CompactStorageBadge = ({ storageType }) => {
  const icons = {
    cache: '📱',
    filesystem: '💾',
    none: '☁️'
  };
  
  return (
    <Tooltip title={
      storageType === 'cache' ? 'En app (offline)' :
      storageType === 'filesystem' ? 'En PC' :
      'En la nube'
    }>
      <span style={{ fontSize: '1.2rem', cursor: 'help' }}>
        {icons[storageType] || '☁️'}
      </span>
    </Tooltip>
  );
};

export default StorageBadge;