import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import EventCard from './EventCard';
import axios from 'axios';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async (pageNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events`, {
        params: {
          page: pageNumber,
          limit: 6 // Ajusta según tu API
        }
      });

      setEvents(prev => [...prev, ...response.data.data]);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Error cargando eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 3,
        mb: 4
      }}>
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </Box>

      {error && (
        <Box sx={{ textAlign: 'center', color: 'error.main', mb: 2 }}>
          {error}
        </Box>
      )}

      {page < totalPages && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleLoadMore}
            disabled={loading}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '12px',
              minWidth: '200px'
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Cargar más eventos'
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EventList;