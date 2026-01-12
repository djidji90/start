// src/app/random/page.jsx
'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import RandomSongs from '../../songs/RandomSongs';

export default function RandomSongsPage() {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
    }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <RandomSongs />
      </Container>
    </Box>
  );
}