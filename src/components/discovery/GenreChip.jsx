// src/components/discovery/GenreChip.jsx
import React from 'react';
import { Chip, Avatar, Box, Typography } from '@mui/material';
import { MusicNote } from '@mui/icons-material';

const GenreChip = ({ genre, count, image, onClick }) => {
  return (
    <Chip
      avatar={
        image ? (
          <Avatar src={image} alt={genre.name} />
        ) : (
          <Avatar>
            <MusicNote fontSize="small" />
          </Avatar>
        )
      }
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2">{genre.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            ({count})
          </Typography>
        </Box>
      }
      onClick={onClick}
      sx={{
        height: 40,
        borderRadius: 20,
        '&:hover': {
          bgcolor: 'primary.light',
          color: 'white',
          '& .MuiTypography-colorTextSecondary': {
            color: 'rgba(255,255,255,0.8)'
          }
        }
      }}
    />
  );
};

export default GenreChip;