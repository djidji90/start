// components/layout/MainLayout.jsx
import React from 'react';
import { Box } from '@mui/material';
import Navigation from './Navigation';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navigation />
      <main>
        {children}
      </main>
    </Box>
  );
};

export default MainLayout;