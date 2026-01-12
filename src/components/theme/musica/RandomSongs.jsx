import React, { useEffect, useCallback, useMemo, useRef, useReducer } from "react";
import { Box, CircularProgress, Typography, Button, useTheme } from "@mui/material";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Virtual } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import SongCard from "./SongCard";
import { useConfig } from "../../../components/hook//useConfig";

// Action Types
const FETCH_INIT = 'FETCH_INIT';
const FETCH_SUCCESS = 'FETCH_SUCCESS';
const FETCH_FAILURE = 'FETCH_FAILURE';
const UPDATE_SONG = 'UPDATE_SONG';

// Reducer optimizado
const songsReducer = (state, action) => {
  switch (action.type) {
    case FETCH_INIT:
      return { ...state, loading: true, error: null };
    case FETCH_SUCCESS:
      return { ...state, loading: false, songs: action.payload };
    case FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case UPDATE_SONG:
      return {
        ...state,
        songs: state.songs.map(song => 
          song.id === action.payload.id ? {
            ...song,
            likes_count: Math.max(action.payload.likes_count, 0),
            is_liked: action.payload.is_liked
          } : song
        )
      };
    default:
      return state;
  }
};

// Custom hook mejorado con cancelación de solicitudes
const useSongsManager = (baseURL) => {
  const [state, dispatch] = useReducer(songsReducer, {
    songs: [],
    loading: true,
    error: null
  });
  
  const abortController = useRef(new AbortController());

  const fetchSongs = useCallback(async () => {
    try {
      dispatch({ type: FETCH_INIT });
      abortController.current.abort();
      abortController.current = new AbortController();

      const { data } = await axios.get(`${baseURL}/api2/songs/random/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ''}` },
        signal: abortController.current.signal
      });
      
      dispatch({ type: FETCH_SUCCESS, payload: data?.random_songs || [] });
    } catch (err) {
      if (!axios.isCancel(err)) {
        const errorMessage = err.response?.data?.detail || "Error al cargar canciones";
        dispatch({ type: FETCH_FAILURE, payload: errorMessage });
      }
    }
  }, [baseURL]);

  const updateSongState = useCallback((updatedSong) => {
    dispatch({ type: UPDATE_SONG, payload: updatedSong });
  }, []);

  useEffect(() => {
    const controller = abortController.current;
    fetchSongs();
    return () => controller.abort();
  }, [fetchSongs]);

  return { ...state, fetchSongs, updateSongState };
};

// Componente principal optimizado
const RandomSongs = () => {
  const { api } = useConfig();
  const theme = useTheme();
  const { songs, loading, error, fetchSongs, updateSongState } = useSongsManager(api.baseURL);

  // Configuración de Swiper memoizada
  const swiperConfig = useMemo(() => ({
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
      rotate: 35,
      stretch: -15,
      depth: 100,
      modifier: 1,
      slideShadows: false,
    },
    pagination: { 
      clickable: true,
      dynamicBullets: true 
    },
    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 10 },
      768: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
    },
    modules: [EffectCoverflow, Pagination, Virtual]
  }), []);

  // Manejador de likes optimizado con rollback
  const handleLikeToggle = useCallback((songId, currentLikes, isLiked) => {
    const originalLikes = currentLikes;
    const originalLikedState = isLiked;
    
    try {
      const newCount = isLiked 
        ? Math.max(currentLikes - 1, 0)
        : currentLikes + 1;
      
      updateSongState({
        id: songId,
        likes_count: newCount,
        is_liked: !isLiked
      });
    } catch (err) {
      updateSongState({
        id: songId,
        likes_count: originalLikes,
        is_liked: originalLikedState
      });
    }
  }, [updateSongState]);

  // Renderizado optimizado de SongCards
  const renderSongCard = useCallback((song) => (
    <SongCard
      key={song.id}
      song={song}
      onLikeToggle={handleLikeToggle}
    />
  ), [handleLikeToggle]);

  // Gestión de estados de renderizado
  const renderState = useMemo(() => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (!songs.length) return 'empty';
    return 'content';
  }, [loading, error, songs.length]);

  // Componentes de estado memoizados
  const stateComponents = useMemo(() => ({
    loading: (
      <Box sx={styles.loadingContainer(theme)}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Cargando recomendaciones...
        </Typography>
      </Box>
    ),
    error: (
      <Box sx={styles.errorContainer(theme)}>
        <Typography variant="h6" color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button 
          variant="contained"
          onClick={fetchSongs}
          sx={styles.button(theme)}
          aria-label="Reintentar carga de canciones"
        >
          Reintentar
        </Button>
      </Box>
    ),
    empty: (
      <Box sx={styles.emptyContainer(theme)}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          No hay canciones disponibles
        </Typography>
        <Button 
          variant="outlined"
          onClick={fetchSongs}
          sx={styles.button(theme)}
          aria-label="Recargar canciones"
        >
          Recargar
        </Button>
      </Box>
    ),
    content: (
      <Swiper {...swiperConfig}>
        {songs.map(song => (
          <SwiperSlide key={song.id} style={{ width: 'auto', marginRight: '30px' }}>
            {renderSongCard(song)}
          </SwiperSlide>
        ))}
      </Swiper>
    )
  }), [error, fetchSongs, songs, swiperConfig, renderSongCard, theme]);

  return stateComponents[renderState];
};

// Estilos optimizados
const styles = {
  loadingContainer: theme => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
    flexDirection: "column",
    backgroundColor: theme.palette.background.default
  }),
  errorContainer: theme => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
    flexDirection: "column",
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    textAlign: 'center'
  }),
  emptyContainer: theme => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
    flexDirection: "column",
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper
  }),
  button: theme => ({
    px: 4,
    py: 1.5,
    borderRadius: '8px',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[3]
    }
  })
};

export default React.memo(RandomSongs);