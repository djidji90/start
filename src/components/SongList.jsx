import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Stack,
  Pagination,
} from '@mui/material';
import {
  Search,
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  MoreVert,
} from '@mui/icons-material';
import { useSongs, useLikeSong, useSearchSuggestions } from '../hooks/useSongs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const SongList = ({ onSongSelect }) => {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 12,
    search: '',
    genre: '',
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useSongs(filters);
  const { data: suggestions } = useSearchSuggestions(searchQuery);
  const { mutate: likeSong } = useLikeSong();
  const [playingSong, setPlayingSong] = useState(null);

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      setFilters(prev => ({ ...prev, search: value, page: 1 }));
    }
  };

  const handleLike = (songId, e) => {
    e.stopPropagation();
    likeSong(songId);
  };

  const handlePlay = (song, e) => {
    e.stopPropagation();
    if (playingSong?.id === song.id) {
      setPlayingSong(null);
    } else {
      setPlayingSong(song);
      if (onSongSelect) onSongSelect(song);
    }
  };

  const handlePageChange = (event, newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error">
          Error cargando canciones: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar canciones, artistas o géneros..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        {/* Sugerencias */}
        {suggestions?.suggestions?.length > 0 && (
          <Box mt={1}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {suggestions.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion.display}
                  size="small"
                  onClick={() => handleSearch(suggestion.display.split(' (')[0])}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Lista de canciones */}
      <Grid container spacing={3}>
        {data?.results?.map((song) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => onSongSelect && onSongSelect(song)}
            >
              {/* Imagen/Portada */}
              <CardMedia
                component="div"
                sx={{
                  height: 140,
                  position: 'relative',
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {song.image_url ? (
                  <Box
                    component="img"
                    src={song.image_url}
                    alt={song.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Typography variant="h6" color="text.secondary">
                    {song.title.charAt(0)}
                  </Typography>
                )}
                
                {/* Botón de play */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                  }}
                  onClick={(e) => handlePlay(song, e)}
                >
                  {playingSong?.id === song.id ? <Pause /> : <PlayArrow />}
                </IconButton>
              </CardMedia>

              <CardContent>
                <Typography variant="h6" noWrap>
                  {song.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {song.artist}
                </Typography>
                
                <Stack direction="row" spacing={1} mt={1}>
                  {song.genre && (
                    <Chip label={song.genre} size="small" />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {song.duration}s
                  </Typography>
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleLike(song.id, e)}
                  >
                    {song.is_liked ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {song.likes_count}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(song.created_at), {
                      locale: es,
                      addSuffix: true,
                    })}
                  </Typography>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Paginación */}
      {data?.count > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(data.count / filters.pageSize)}
            page={filters.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Sin resultados */}
      {!isLoading && (!data?.results || data.results.length === 0) && (
        <Box textAlign="center" p={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron canciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filters.search
              ? `No hay resultados para "${filters.search}"`
              : 'Aún no hay canciones en la plataforma'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SongList;