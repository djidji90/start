// src/components/profile/ProfileSongs.jsx
import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  alpha,
  useTheme,
  Fade
} from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import SongCard from '../../songs/SongCard';

const ProfileSongs = ({ songs = [], loading = false }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  if (!loading && songs.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          mt: 4,
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: alpha(primaryColor, 0.02),
          border: `1px solid ${alpha(primaryColor, 0.1)}`,
        }}
      >
        <MusicNote sx={{ fontSize: 48, color: alpha('#000', 0.2), mb: 2 }} />
        <Typography variant="h6" sx={{ color: alpha('#000', 0.5), mb: 1 }}>
          🎵 No hay canciones todavía
        </Typography>
        <Typography variant="body2" sx={{ color: alpha('#000', 0.3) }}>
          Las canciones aparecerán aquí cuando el artista las publique
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {songs.map((song, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={song.id}>
            <Fade in timeout={300 + (index % 10) * 50}>
              <Box>
                <SongCard song={song} variant="compact" showIndex={false} />
              </Box>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default React.memo(ProfileSongs);