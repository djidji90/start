// src/components/profile/ProfileSkeleton.jsx
import React from 'react';
import {
  Box,
  Paper,
  Skeleton,
  Grid,
  alpha,
  useTheme
} from '@mui/material';

/**
 * Componente de esqueleto para mostrar mientras carga el perfil
 * Misma estructura que el perfil real pero con skeletons animados
 */
const ProfileSkeleton = () => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Skeleton */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(primaryColor, 0.05)} 0%, ${alpha(primaryColor, 0.02)} 100%)`,
          border: `1px solid ${alpha(primaryColor, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3,
        }}>
          {/* Avatar Skeleton */}
          <Skeleton
            variant="circular"
            width={{ xs: 100, sm: 120 }}
            height={{ xs: 100, sm: 120 }}
            sx={{ bgcolor: alpha(primaryColor, 0.1) }}
          />

          {/* Info Skeleton */}
          <Box sx={{ flex: 1, width: '100%' }}>
            {/* Nombre Skeleton */}
            <Skeleton
              variant="text"
              width={{ xs: '80%', sm: 300 }}
              height={40}
              sx={{ 
                bgcolor: alpha(primaryColor, 0.1),
                mb: 1,
                mx: { xs: 'auto', sm: 0 }
              }}
            />
            
            {/* Username Skeleton */}
            <Skeleton
              variant="text"
              width={{ xs: '60%', sm: 200 }}
              height={24}
              sx={{ 
                bgcolor: alpha(primaryColor, 0.1),
                mb: 2,
                mx: { xs: 'auto', sm: 0 }
              }}
            />

            {/* Bio Skeleton (2 líneas) */}
            <Skeleton
              variant="text"
              width="100%"
              height={20}
              sx={{ bgcolor: alpha(primaryColor, 0.1), mb: 1 }}
            />
            <Skeleton
              variant="text"
              width="80%"
              height={20}
              sx={{ bgcolor: alpha(primaryColor, 0.1), mb: 3 }}
            />

            {/* Chips Skeleton */}
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <Skeleton variant="rounded" width={120} height={32} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
              <Skeleton variant="rounded" width={140} height={32} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
              <Skeleton variant="rounded" width={160} height={32} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats Skeleton */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={6} sm={3} key={item}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: alpha(primaryColor, 0.05),
                border: `1px solid ${alpha(primaryColor, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Skeleton variant="rounded" width={40} height={40} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: alpha(primaryColor, 0.1), mb: 0.5 }} />
                  <Skeleton variant="text" width="80%" height={24} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Songs Header Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="text" width={150} height={32} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
        <Skeleton variant="rounded" width={200} height={40} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
      </Box>

      {/* Songs Grid Skeleton */}
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={item}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: alpha(primaryColor, 0.02),
                border: `1px solid ${alpha(primaryColor, 0.1)}`,
              }}
            >
              {/* Image Skeleton */}
              <Skeleton
                variant="rectangular"
                width="100%"
                height={{ xs: 140, sm: 160 }}
                sx={{ bgcolor: alpha(primaryColor, 0.1) }}
              />
              
              {/* Content Skeleton */}
              <Box sx={{ p: 1.5 }}>
                <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: alpha(primaryColor, 0.1), mb: 1 }} />
                <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: alpha(primaryColor, 0.1), mb: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton variant="text" width="30%" height={16} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
                  <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: alpha(primaryColor, 0.1) }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfileSkeleton;