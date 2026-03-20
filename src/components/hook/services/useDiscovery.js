// ============================================
// src/hooks/services/useDiscovery.js
// HOOKS PARA DESCUBRIMIENTO DE MÚSICA
// ✅ Trending (popularidad combinada)
// ✅ Top descargas
// ✅ Top reproducciones
// ✅ Top likes
// ✅ Novedades
// ✅ Géneros
// ✅ Canciones por género
// ============================================

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'https://api.djidjimusic.com/api2';

// ============================================
// FUNCIONES FETCH (llamadas a la API)
// ============================================

/**
 * Obtiene canciones trending según algoritmo de popularidad
 * Fórmula: plays + (downloads × 2) + (likes × 3)
 */
const fetchTrending = async (limit = 20) => {
  const { data } = await axios.get(`${API_BASE_URL}/songs/trending/?limit=${limit}`);
  return data;
};

/**
 * Obtiene las canciones más descargadas
 */
const fetchTopDownloads = async (limit = 20) => {
  const { data } = await axios.get(`${API_BASE_URL}/songs/top-downloads/?limit=${limit}`);
  return data;
};

/**
 * Obtiene las canciones más reproducidas
 */
const fetchTopPlays = async (limit = 20) => {
  const { data } = await axios.get(`${API_BASE_URL}/songs/top-plays/?limit=${limit}`);
  return data;
};

/**
 * Obtiene las canciones con más likes
 */
const fetchTopLikes = async (limit = 20) => {
  const { data } = await axios.get(`${API_BASE_URL}/songs/top-likes/?limit=${limit}`);
  return data;
};

/**
 * Obtiene las canciones más recientes
 */
const fetchRecent = async (limit = 20) => {
  const { data } = await axios.get(`${API_BASE_URL}/songs/recent/?limit=${limit}`);
  return data;
};

/**
 * Obtiene lista de géneros con conteo de canciones
 */
const fetchGenres = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/genres/`);
  return data;
};

/**
 * Obtiene canciones de un género específico
 * @param {string} genre - Nombre del género
 * @param {string} sort - Orden: popular, recent, downloads, plays, likes
 * @param {number} limit - Límite de resultados
 */
const fetchSongsByGenre = async (genre, sort = 'popular', limit = 20) => {
  const encodedGenre = encodeURIComponent(genre);
  const { data } = await axios.get(
    `${API_BASE_URL}/genres/${encodedGenre}/songs/?sort=${sort}&limit=${limit}`
  );
  return data;
};

// ============================================
// HOOKS PRINCIPALES (con React Query)
// ============================================

/**
 * Hook: Canciones trending
 * @param {number} limit - Número de resultados (default: 20)
 */
export const useTrending = (limit = 20) => {
  return useQuery({
    queryKey: ['trending', limit],
    queryFn: () => fetchTrending(limit),
    staleTime: 5 * 60 * 1000,      // 5 minutos
    cacheTime: 10 * 60 * 1000,      // 10 minutos
    refetchOnWindowFocus: false,    // No recargar al enfocar ventana
    retry: 2,                       // Reintentar 2 veces si falla
  });
};

/**
 * Hook: Canciones más descargadas
 * @param {number} limit - Número de resultados (default: 20)
 */
export const useTopDownloads = (limit = 20) => {
  return useQuery({
    queryKey: ['topDownloads', limit],
    queryFn: () => fetchTopDownloads(limit),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook: Canciones más reproducidas
 * @param {number} limit - Número de resultados (default: 20)
 */
export const useTopPlays = (limit = 20) => {
  return useQuery({
    queryKey: ['topPlays', limit],
    queryFn: () => fetchTopPlays(limit),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook: Canciones con más likes
 * @param {number} limit - Número de resultados (default: 20)
 */
export const useTopLikes = (limit = 20) => {
  return useQuery({
    queryKey: ['topLikes', limit],
    queryFn: () => fetchTopLikes(limit),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook: Canciones más recientes
 * @param {number} limit - Número de resultados (default: 20)
 */
export const useRecent = (limit = 20) => {
  return useQuery({
    queryKey: ['recent', limit],
    queryFn: () => fetchRecent(limit),
    staleTime: 5 * 60 * 1000,      // Novedades se actualizan más seguido
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook: Lista de géneros
 */
export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: fetchGenres,
    staleTime: 30 * 60 * 1000,     // 30 minutos (los géneros cambian poco)
    cacheTime: 60 * 60 * 1000,      // 1 hora
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook: Canciones por género
 * @param {string} genre - Nombre del género
 * @param {string} sort - Orden (popular, recent, downloads, plays, likes)
 * @param {number} limit - Límite de resultados
 */
export const useSongsByGenre = (genre, sort = 'popular', limit = 20) => {
  return useQuery({
    queryKey: ['songsByGenre', genre, sort, limit],
    queryFn: () => fetchSongsByGenre(genre, sort, limit),
    enabled: !!genre,                // Solo ejecuta si hay género
    staleTime: 10 * 60 * 1000,       // 10 minutos
    cacheTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// ============================================
// HOOK COMBINADO PARA PÁGINA PRINCIPAL
// ============================================

/**
 * Hook que combina todas las secciones de la página principal
 * Ideal para el MainPage, carga todo en paralelo
 */
export const useDiscoveryMainPage = (limit = 10) => {
  const trending = useTrending(limit);
  const downloads = useTopDownloads(limit);
  const plays = useTopPlays(limit);
  const likes = useTopLikes(limit);
  const recent = useRecent(limit);
  const genres = useGenres();

  return {
    trending,
    downloads,
    plays,
    likes,
    recent,
    genres,
    // Estado combinado
    isLoading: trending.isLoading || downloads.isLoading || plays.isLoading || 
                likes.isLoading || recent.isLoading || genres.isLoading,
    isError: trending.isError || downloads.isError || plays.isError || 
             likes.isError || recent.isError || genres.isError,
    // Refrescar todo
    refetchAll: () => {
      trending.refetch();
      downloads.refetch();
      plays.refetch();
      likes.refetch();
      recent.refetch();
      genres.refetch();
    }
  };
};

// ============================================
// UTILIDADES DE FORMATEO
// ============================================

/**
 * Formatea números para mostrar (1.2K, 4.5M, etc.)
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Formatea duración (segundos a MM:SS)
 */
export const formatDuration = (seconds) => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Extrae artistas únicos de una lista de canciones
 */
export const extractArtists = (songs) => {
  return [...new Set(songs?.map(s => s.artist).filter(Boolean))];
};