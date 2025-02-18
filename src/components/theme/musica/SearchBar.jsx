import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme
} from "@mui/material";
import { 
  ArrowBack, 
  ArrowForward, 
  Refresh, 
  CalendarToday,
  Search as SearchIcon
} from "@mui/icons-material";
import { debounce } from "lodash";
import SongCard from "./SongCard";
import EventCard from './NewsCard'

const SongSearchPage = () => {
  const [state, setState] = useState({
    searchTerms: "",
    filters: { artist: "", genre: "", title: "" },
    songs: [],
    events: [],
    suggestions: [],
    showSuggestions: false,
    pagination: { current: 1, total: 1, pageSize: 12 },
    status: {
      loading: false,
      error: null,
      downloadProgress: 0,
      isDownloading: false,
      eventsLoading: false,
      eventsError: null
    },
  });

  const searchController = useRef(new AbortController());
  const eventsController = useRef(new AbortController());
  const downloadController = useRef(null);
  const searchContainerRef = useRef(null);
  const theme = useTheme();

  const getAuthHeader = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
  }), []);

  const errorMap = useMemo(() => ({
    401: "Sesión expirada - Por favor vuelva a iniciar sesión",
    403: "No tienes permiso para esta acción",
    404: "Recurso no encontrado",
    429: "Demasiadas solicitudes - Por favor espere",
    ECONNABORTED: "Timeout - El servidor no respondió a tiempo",
    "Network Error": "Error de conexión - Verifique su internet",
  }), []);

  const handleError = useCallback((error, type = 'general') => {
    if (axios.isCancel(error)) return;
    
    const errorMessage = errorMap[error.response?.status] || 
                        errorMap[error.code] || 
                        errorMap[error.message] || 
                        "Error desconocido";

    setState(prev => ({
      ...prev,
      status: {
        ...prev.status,
        ...(type === 'events' ? { 
          eventsError: errorMessage,
          eventsLoading: false 
        } : {
          error: errorMessage,
          loading: false
        })
      }
    }));
  }, [errorMap]);

  const fetchEvents = useCallback(async () => {
    try {
      eventsController.current.abort();
      eventsController.current = new AbortController();

      setState(prev => ({ 
        ...prev, 
        status: { ...prev.status, eventsLoading: true, eventsError: null }
      }));

      const response = await axios.get("http://127.0.0.1:8000/api2/events/", {
        headers: getAuthHeader(),
        signal: eventsController.current.signal
      });

      setState(prev => ({
        ...prev,
        events: response.data.results || [],
        status: { ...prev.status, eventsLoading: false }
      }));
    } catch (error) {
      if (!axios.isCancel(error)) handleError(error, 'events');
    }
  }, [getAuthHeader, handleError]);

  const fetchSuggestions = useCallback(debounce(async (query) => {
    if (!query || query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [], showSuggestions: false }));
      return;
    }
  
    try {
      const response = await axios.get("http://127.0.0.1:8000/api2/songs/suggestions/", {
        params: { query },
        headers: getAuthHeader(),
        signal: searchController.current.signal
      });
  
      setState(prev => ({
        ...prev,
        suggestions: response.data?.suggestions || [],
        showSuggestions: true
      }));
    } catch (error) {
      if (!axios.isCancel(error)) {
        setState(prev => ({ ...prev, suggestions: [], showSuggestions: false }));
      }
    }
  }, 300), [getAuthHeader]);

  const searchSongs = useCallback(async (page = 1, newQuery = false) => {
    try {
      searchController.current.abort();
      searchController.current = new AbortController();

      setState(prev => ({
        ...prev,
        status: { ...prev.status, loading: true, error: null },
        ...(newQuery && { songs: [] }),
      }));

      const params = new URLSearchParams({
        ...state.filters,
        page,
        page_size: state.pagination.pageSize,
      });

      const response = await axios.get("http://127.0.0.1:8000/api2/songs/", {
        params,
        signal: searchController.current.signal,
        headers: getAuthHeader(),
      });

      setState(prev => ({
        ...prev,
        songs: response.data.results || [],
        pagination: {
          ...prev.pagination,
          current: page,
          total: Math.ceil((response.data.count || 0) / prev.pagination.pageSize),
        },
        status: { ...prev.status, loading: false },
      }));
    } catch (error) {
      handleError(error);
    }
  }, [state.filters, state.pagination.pageSize, getAuthHeader, handleError]);

  const handleSearchInput = useCallback((e) => {
    const value = e.target.value;
    setState(prev => ({
      ...prev,
      searchTerms: value,
      filters: { ...prev.filters, artist: value },
      showSuggestions: value.length > 1
    }));
    fetchSuggestions(value);
  }, [fetchSuggestions]);

  const handleSuggestionClick = useCallback((suggestion) => {
    const searchQuery = suggestion.type === 'song' ? suggestion.title : 
                       suggestion.type === 'artist' ? suggestion.artist : 
                       suggestion.genre;
  
    setState(prev => ({
      ...prev,
      searchTerms: searchQuery,
      filters: {
        artist: suggestion.type === 'artist' ? searchQuery : '',
        genre: suggestion.type === 'genre' ? searchQuery : '',
        title: suggestion.type === 'song' ? searchQuery : ''
      },
      showSuggestions: false
    }));
    searchSongs(1, true);
  }, [searchSongs]);

  const handleLike = useCallback(async (songId) => {
    const originalSongs = [...state.songs];
    try {
      setState(prev => ({
        ...prev,
        songs: prev.songs.map(song =>
          song.id === songId 
            ? { ...song, likes: song.likes + (song.liked ? -1 : 1), liked: !song.liked }
            : song
        )
      }));

      await axios.post(
        `http://127.0.0.1:8000/api2/songs/${songId}/like/`,
        {},
        { headers: getAuthHeader() }
      );
    } catch (error) {
      setState(prev => ({ ...prev, songs: originalSongs }));
      handleError(error);
    }
  }, [state.songs, getAuthHeader, handleError]);

  const handleDownload = useCallback(async (songId, title) => {
    try {
      downloadController.current = new AbortController();
      
      setState(prev => ({
        ...prev,
        status: { ...prev.status, isDownloading: true, downloadProgress: 0 },
      }));

      const response = await axios.get(
        `http://127.0.0.1:8000/api2/songs/${songId}/download/`,
        {
          responseType: "blob",
          headers: getAuthHeader(),
          signal: downloadController.current.signal,
          onDownloadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
      
            setState((prev) => ({
              ...prev,
              status: { ...prev.status, downloadProgress: percent },
            }));
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.mp3`);
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error);
    } finally {
      setState(prev => ({
        ...prev,
        status: { ...prev.status, isDownloading: false, downloadProgress: 0 },
      }));
    }
  }, [getAuthHeader, handleError]);

  const handlePageChange = useCallback((direction) => {
    const newPage = direction === "next" 
      ? state.pagination.current + 1 
      : state.pagination.current - 1;
    searchSongs(newPage);
  }, [state.pagination.current, searchSongs]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setState(prev => ({ ...prev, showSuggestions: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchEvents();
    return () => {
      searchController.current.abort();
      eventsController.current.abort();
      downloadController.current?.abort();
    };
  }, [fetchEvents]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: "bold", 
        color: "primary.main",
        textAlign: "center",
        mb: 4
      }}>
        Encuentra tu canción favorita
      </Typography>

      {/* Buscador */}
      <Box sx={{ position: "relative", mb: 4 }} ref={searchContainerRef}>
        <TextField
          fullWidth
          variant="outlined"
          label="¿Qué canción tienes en mente?"
          value={state.searchTerms}
          onChange={handleSearchInput}
          onKeyPress={(e) => e.key === "Enter" && searchSongs(1, true)}
          InputProps={{
            endAdornment: (
              <>
                {state.status.loading && <CircularProgress size={24} />}
                <IconButton
                  edge="end"
                  onClick={() => searchSongs(1, true)}
                  disabled={state.status.loading}
                >
                  <SearchIcon />
                </IconButton>
              </>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': { boxShadow: 3 }
            }
          }}
        />

        {/* Sugerencias */}
        {state.showSuggestions && state.suggestions.length > 0 && (
          <Box sx={{
            position: "absolute",
            width: "100%",
            bgcolor: "background.paper",
            boxShadow: 3,
            zIndex: 1,
            maxHeight: 300,
            overflow: "auto",
            mt: 1,
            borderRadius: 2
          }}>
            <List dense>
              {state.suggestions.map((suggestion) => (
                <ListItem
                  button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    '&:hover': { bgcolor: "action.hover" },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 1.5
                  }}
                >
                  <ListItemText
                    primary={suggestion.display}
                    secondary={
                      suggestion.type === "song" 
                        ? `${suggestion.artist} • ${suggestion.genre}`
                        : `Tipo: ${suggestion.type}`
                    }
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                  <Chip
                    label={suggestion.type}
                    size="small"
                    color={
                      suggestion.type === "song" ? "primary" :
                      suggestion.type === "artist" ? "secondary" : "success"
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>

      {/* Manejo de errores */}
      {state.status.error && (
        <Alert 
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => searchSongs(state.pagination.current)}
              endIcon={<Refresh />}
            >
              Reintentar
            </Button>
          }
        >
          {state.status.error}
        </Alert>
      )}

      {/* Lista de canciones */}
      <Grid container spacing={3}>
        {state.songs.map((song) => (
          <Grid item xs={12} sm={6} md={4} key={song.id}>
            <SongCard
              song={song}
              onLike={() => handleLike(song.id)}
              onDownload={() => handleDownload(song.id, song.title)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Paginación */}
      {state.songs.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
          <IconButton
            onClick={() => handlePageChange("prev")}
            disabled={state.pagination.current === 1 || state.status.loading}
            sx={{ 
              bgcolor: "primary.main", 
              color: "white",
              '&:hover': { bgcolor: "primary.dark" }
            }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography sx={{ mx: 2, alignSelf: "center" }}>
            Página {state.pagination.current} de {state.pagination.total}
          </Typography>
          
          <IconButton
            onClick={() => handlePageChange("next")}
            disabled={state.pagination.current === state.pagination.total}
            sx={{ 
              bgcolor: "primary.main", 
              color: "white",
              '&:hover': { bgcolor: "primary.dark" }
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      )}

      {/* Eventos */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{
          fontWeight: 'bold',
          color: 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CalendarToday />
          Próximos Eventos
        </Typography>

        {state.status.eventsLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {state.status.eventsError && (
          <Alert 
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchEvents}
                endIcon={<Refresh />}
              >
                Reintentar
              </Button>
            }
          >
            {state.status.eventsError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {state.events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>

        {state.events.length === 0 && !state.status.eventsLoading && (
          <Typography sx={{ textAlign: 'center', my: 4 }}>
            No hay eventos próximos
          </Typography>
        )}
      </Box>

      {/* Descargas */}
      {state.status.isDownloading && (
        <Box sx={{ 
          position: "fixed", 
          bottom: 20, 
          left: "50%", 
          transform: "translateX(-50%)",
          width: 400, 
          bgcolor: "background.paper",
          boxShadow: 3,
          borderRadius: 2,
          p: 2
        }}>
          <LinearProgress
            variant="determinate"
            value={state.status.downloadProgress}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="caption">
              Descargando... {state.status.downloadProgress}%
            </Typography>
            <Button 
              size="small" 
              onClick={() => downloadController.current?.abort()}
              color="error"
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      )}

      {/* Carga general */}
      {state.status.loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}
    </Box>
  );
};

export default SongSearchPage;