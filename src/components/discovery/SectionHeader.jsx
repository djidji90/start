// ============================================
// src/components/discovery/SectionHeader.jsx
// ENCABEZADO PROFESIONAL PARA SECCIONES
// ✅ Título con icono
// ✅ Subtítulo opcional
// ✅ Botón "Ver todo"
// ✅ Total de elementos (opcional)
// ✅ Diseño responsivo
// ============================================

import React from 'react';
import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

/**
 * SectionHeader - Encabezado profesional para secciones de descubrimiento
 * 
 * @param {Object} props
 * @param {string|React.ReactNode} props.title - Título de la sección
 * @param {string} props.subtitle - Subtítulo opcional
 * @param {React.ReactNode} props.icon - Icono a mostrar (opcional)
 * @param {string} props.actionLabel - Texto del botón de acción (ej: "Ver todo")
 * @param {function} props.onAction - Función al hacer click en acción
 * @param {number} props.total - Total de elementos (para mostrar conteo)
 * @param {boolean} props.compact - Versión compacta (menos padding)
 * @param {React.ReactNode} props.children - Elementos adicionales (ej: filtros)
 */
const SectionHeader = ({
  title,
  subtitle,
  icon,
  actionLabel = 'Ver todo',
  onAction,
  total,
  compact = false,
  children,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        mb: compact ? 1.5 : 2.5,
        mt: compact ? 1 : 2,
        px: compact ? 0 : 0.5,
        ...rest.sx
      }}
    >
      {/* Lado izquierdo - Título e icono */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1, sm: 0 } }}>
        {icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              mr: 0.5
            }}
          >
            {icon}
          </Box>
        )}

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant={compact ? 'subtitle1' : 'h6'}
              component="h2"
              fontWeight={600}
              sx={{
                fontSize: compact ? '1rem' : { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              {title}
            </Typography>

            {total !== undefined && total > 0 && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  px: 1,
                  py: 0.3,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              >
                {total}
              </Typography>
            )}
          </Box>

          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.3,
                fontSize: '0.75rem'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Lado derecho - Acciones */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'center' }}>
        {children}

        {actionLabel && onAction && (
          <Button
            endIcon={<ArrowForward />}
            size={compact ? 'small' : 'medium'}
            onClick={onAction}
            sx={{
              textTransform: 'none',
              fontSize: compact ? '0.75rem' : '0.85rem',
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
                '& .MuiButton-endIcon': {
                  transform: 'translateX(4px)'
                }
              },
              '& .MuiButton-endIcon': {
                transition: 'transform 0.2s ease'
              }
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

// ============================================
// VARIANTES PREDEFINIDAS
// ============================================

/**
 * Versión compacta para móviles o espacios reducidos
 */
SectionHeader.Compact = (props) => (
  <SectionHeader {...props} compact={true} />
);

/**
 * Versión con filtros integrados
 */
SectionHeader.WithFilters = ({ filters, ...props }) => (
  <SectionHeader {...props}>
    {filters}
  </SectionHeader>
);

/**
 * Versión sin botón de acción
 */
SectionHeader.Static = ({ title, subtitle, icon, total }) => (
  <SectionHeader
    title={title}
    subtitle={subtitle}
    icon={icon}
    total={total}
    actionLabel={null}
  />
);

export default SectionHeader;