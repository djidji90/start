import React, { useState } from 'react';
import SongCard from './SongCard'
import CommentSection from './CommentComponent'
import SearchBar from './SearchBar'
import { Grid, Container, Typography, Box } from '@mui/material';

const MusicPlayer = () => {
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Maneja la selección de canción
  const handleSongSelect = (songId) => {
    setSelectedSongId(songId);
  };

  // Maneja la búsqueda de canciones
  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedSongId(null);  // Reseteamos la canción seleccionada al buscar
  };

  return (
    <Container maxWidth="md">
      {/* Barra de búsqueda */}
      <Box mb={4}>
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
      </Box>

      {/* Contenedor para las canciones */}
      <Grid container spacing={3} mb={4}>
        {/* Aquí mostramos una lista de canciones. Este es un ejemplo con canciones estáticas */}
        {['Song 1', 'Song 2', 'Song 3'].map((song, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <SongCard
              songId={index + 1}
              songTitle={song}
              artist={`Artist ${index + 1}`}
              onSelect={handleSongSelect}
            />
          </Grid>
        ))}
      </Grid>

      {/* Mostrar la sección de comentarios si hay una canción seleccionada */}
      {selectedSongId && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Comentarios
          </Typography>
          <CommentSection songId={selectedSongId} />
        </Box>
      )}
    </Container>
  );
};

export default MusicPlayer;
