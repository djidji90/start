// src/components/search/SearchContainer.jsx - NUEVA VERSIÓN
import React, { useRef, useState } from 'react';
import { Box, Alert, Snackbar, Button, Chip } from '@mui/material';
import { useSearch } from '../../hooks/useSearch'; // Ajusta la ruta según tu estructura
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';

const SearchContainer = () => {
  // Usar el hook de búsqueda
  const search = useSearch();
  const searchBarRef = useRef(null);
  const [showCacheNotification, setShowCacheNotification] = useState(false);

  // Handler para seleccionar items
  const handleSelectItem = (item, type) => {
    console.log(`[Search] Item seleccionado:`, { 
      type, 
      id: item.id, 
      name: item.name || item.title,
      raw: item 
    });
    
    // Aquí puedes agregar tu lógica:
    switch (type) {
      case 'song':
        // Ejemplo: Reproducir canción
        // playerContext.playSong(item);
        break;
      case 'artist':
        // Ejemplo: Navegar a artista
        // navigate(`/artist/${item.id}`);
        break;
      case 'genre':
        // Ejemplo: Navegar a género
        // navigate(`/genre/${item.name}`);
        break;
      case 'songs':
        // Ejemplo: Ver todas las canciones
        // navigate(`/search?type=songs&query=${search.query}`);
        break;
    }
    
    // Cerrar resultados después de seleccionar
    search.closeResults();
  };

  // Handler para errores de búsqueda
  const handleRetrySearch = () => {
    if (search.error && search.query.trim().length >= 2) {
      search.retrySearch();
    }
  };

  // Handler para notificación de caché
  React.useEffect(() => {
    if (search.searchMetrics?.fromCache) {
      setShowCacheNotification(true);
      const timer = setTimeout(() => {
        setShowCacheNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [search.searchMetrics]);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Barra de búsqueda */}
      <Box ref={searchBarRef} sx={{ mb: 2 }}>
        <SearchBar
          query={search.query}
          onQueryChange={search.setQuery}  // ✅ Compatible
          loading={search.loading}
          autoFocus={true}
          placeholder="Buscar canciones, artistas, géneros..."
        />
      </Box>

      {/* Estadísticas rápidas (opcional) */}
      {search.query.trim().length >= 2 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Query: "${search.query}"`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {search.hasResults && (
            <Chip 
              label={`${search.results.length} resultados`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {search.error && (
            <Chip 
              label={`Error: ${search.error.message}`}
              size="small"
              color="error"
              variant="outlined"
              onClick={handleRetrySearch}
              clickable
            />
          )}
          {search.searchMetrics && (
            <Chip 
              label={`${search.searchMetrics.time}ms`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Botones de control (opcional) */}
      {search.query.trim().length >= 2 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button 
            size="small" 
            variant="outlined"
            onClick={search.forceSearch}
            disabled={search.loading}
          >
            Buscar de nuevo
          </Button>
          <Button 
            size="small" 
            variant="outlined"
            onClick={search.clearSearch}
          >
            Limpiar
          </Button>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => search.searchByType(search.query, 'artist')}
          >
            Solo artistas
          </Button>
        </Box>
      )}

      {/* Resultados de búsqueda */}
      <SearchResults
        results={search.structuredResults}  // ✅ structuredResults tiene formato correcto
        loading={search.loading}
        error={search.error?.message}       // ✅ Solo pasa el mensaje
        isOpen={search.isOpen}
        onClose={search.closeResults}
        onSelect={handleSelectItem}
      />

      {/* Notificación de caché */}
      <Snackbar
        open={showCacheNotification}
        autoHideDuration={2000}
        onClose={() => setShowCacheNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="info" 
          sx={{ 
            width: '100%',
            bgcolor: '#E0F7FA',
            color: '#006064',
            '& .MuiAlert-icon': {
              color: '#00838F'
            }
          }}
        >
          📦 Resultados desde caché • {search.searchMetrics?.time}ms
        </Alert>
      </Snackbar>

      {/* Panel de debug (solo desarrollo) */}
      {process.env.NODE_ENV === 'development' && search.query && (
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: '#f5f5f5', 
          borderRadius: 1,
          fontSize: '0.8rem'
        }}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Debug: Estado de búsqueda
            </summary>
            <pre style={{ margin: 0, overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify({
                query: search.query,
                status: search.status,
                resultsCount: search.results.length,
                structured: {
                  songs: search.structuredResults.songs.length,
                  artists: search.structuredResults.artists.length,
                  genres: search.structuredResults.genres.length
                },
                loading: search.loading,
                error: search.error,
                metrics: search.searchMetrics,
                cacheSize: search.cacheStats?.size
              }, null, 2)}
            </pre>
          </details>
        </Box>
      )}
    </Box>
  );
};

export default SearchContainer;