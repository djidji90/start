// src/components/search/SearchItem.jsx
import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  MusicNote,
  Person,
  Album,
  AccessTime,
} from '@mui/icons-material';

const SearchItem = ({ item, type, onClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'song':
        return <MusicNote />;
      case 'artist':
        return <Person />;
      case 'album':
        return <Album />;
      default:
        return <MusicNote />;
    }
  };

  const getSubtitle = () => {
    if (type === 'song') {
      return item.artist || 'Artista desconocido';
    }
    if (type === 'artist') {
      return `${item.song_count || 0} canciones`;
    }
    return '';
  };

  const getSecondaryText = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {getSubtitle()}
        </Typography>
        {item.duration && (
          <Chip
            size="small"
            icon={<AccessTime />}
            label={formatDuration(item.duration)}
            variant="outlined"
          />
        )}
      </Box>
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ListItem
      button
      onClick={() => onClick(item, type)}
      sx={{
        py: 2,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        borderRadius: 1,
        mb: 0.5,
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: type === 'song' ? 'primary.main' : 
                    type === 'artist' ? 'secondary.main' : 
                    'success.main',
          }}
        >
          {getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="subtitle1" fontWeight="medium">
            {item.title || item.name || 'Sin título'}
          </Typography>
        }
        secondary={getSecondaryText()}
      />
    </ListItem>
  );
};

export default SearchItem;