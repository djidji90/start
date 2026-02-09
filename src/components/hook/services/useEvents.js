// src/hooks/useEvents.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../services/apia'; // Ajusta la ruta según tu estructura

const useEvents = (initialOptions = {}) => {
  const [state, setState] = useState({
    events: [],
    loading: false,
    error: null,
    pagination: {
      count: 0,
      next: null,
      previous: null,
      page: 1,
      pageSize: initialOptions.pageSize || 8,
    }
  });

  const [filters, setFilters] = useState({
    search: '',
    event_type: '',
    location: '',
    status: 'upcoming',
    ordering: 'date',
    ...initialOptions.filters,
  });

  const abortControllerRef = useRef(null);

  const fetchEvents = useCallback(async (customOptions = {}) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const options = {
        page: state.pagination.page,
        page_size: state.pagination.pageSize,
        ...filters,
        ...customOptions,
      };

      // Limpiar opciones vacías
      const cleanOptions = {};
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          cleanOptions[key] = value;
        }
      });

      console.log('Fetching events with params:', cleanOptions);

      const response = await api.get('/api2/events/', {
        params: cleanOptions,
        signal: abortControllerRef.current?.signal,
      });

      console.log('Events response:', response.data);

      setState({
        events: response.data.results || [],
        loading: false,
        error: null,
        pagination: {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
          page: options.page,
          pageSize: options.page_size,
        }
      });

      return response.data;
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return; // Ignorar abortos
      }
      
      console.error('Error fetching events:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar eventos',
      }));
      
      // Retornar array vacío en caso de error para que el UI siga funcionando
      return { results: [], count: 0 };
    }
  }, [filters, state.pagination.page, state.pagination.pageSize]);

  const getUpcomingEvents = useCallback(async (limit = 6) => {
    try {
      console.log('Fetching upcoming events, limit:', limit);
      
      const response = await api.get('/api2/events/', {
        params: {
          status: 'upcoming',
          ordering: 'date',
          page_size: limit,
        }
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error("Error obteniendo eventos próximos:", error);
      // Retornar array vacío en caso de error
      return [];
    }
  }, []);

  const toggleSaveEvent = useCallback(async (eventId, save = true) => {
    try {
      // Actualizar estado local primero para mejor UX
      setState(prev => ({
        ...prev,
        events: prev.events.map(event => 
          event.id === eventId 
            ? { ...event, isSaved: save }
            : event
        ),
      }));

      // Llamar a la API si es necesario
      // Aquí iría tu lógica de API para guardar/eliminar
      
      return true;
    } catch (error) {
      console.error(`Error guardando evento ${eventId}:`, error);
      
      // Revertir el cambio local si falla
      setState(prev => ({
        ...prev,
        events: prev.events.map(event => 
          event.id === eventId 
            ? { ...event, isSaved: !save } // Revertir
            : event
        ),
      }));
      
      throw error;
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }));
  }, []);

  // Efecto para cargar eventos al inicio o cuando cambian filtros
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    events: state.events,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    filters,
    fetchEvents,
    getUpcomingEvents,
    toggleSaveEvent,
    updateFilters,
    refetch: () => fetchEvents(),
  };
};

export default useEvents;