// src/components/hook/services/useArtists.js
import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'djidji_artists_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const MAX_PAGES = 3; // Límite de páginas para no saturar
const FETCH_TIMEOUT = 8000; // 8 segundos

const useArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchWithTimeout = async (url, timeout = FETCH_TIMEOUT) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  const fetchArtists = useCallback(async (ignoreCache = false) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Intentar cargar desde caché (si no se ignora)
      if (!ignoreCache) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('📦 Artistas desde caché');
            setArtists(data);
            setLoading(false);
            return;
          }
        }
      }

      // 2. Fetch primera página con timeout
      console.log('🌐 Fetching artistas desde API');
      const response = await fetchWithTimeout('https://api.djidjimusic.com/api2/songs/?page=1');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 3. Procesar artistas únicos por ID
      const artistsMap = new Map();

      const processSong = (song) => {
        if (song.uploaded_by?.id) {
          const userId = song.uploaded_by.id;
          
          if (!artistsMap.has(userId)) {
            artistsMap.set(userId, {
              id: userId,
              username: song.uploaded_by.username,
              name: song.uploaded_by.full_name || song.uploaded_by.username,
              avatar_url: song.uploaded_by.profile?.avatar_url || null,
              songs_count: 1,
              bio: song.uploaded_by.profile?.bio || null,
              location: song.uploaded_by.profile?.location || null,
              date_joined: song.uploaded_by.date_joined
            });
          } else {
            const existing = artistsMap.get(userId);
            existing.songs_count += 1;
            artistsMap.set(userId, existing);
          }
        }
      };

      // Procesar primera página
      data.results.forEach(processSong);

      // Procesar páginas adicionales (limitado)
      let nextUrl = data.next;
      let pageCount = 1;

      while (nextUrl && pageCount < MAX_PAGES) {
        try {
          const nextResponse = await fetchWithTimeout(nextUrl);
          const nextData = await nextResponse.json();
          nextData.results.forEach(processSong);
          nextUrl = nextData.next;
          pageCount++;
        } catch (err) {
          console.warn(`Error en página ${pageCount + 1}:`, err);
          nextUrl = null; // Detener si falla una página
        }
      }

      // 4. Convertir a array y ordenar
      const artistsArray = Array.from(artistsMap.values())
        .sort((a, b) => b.songs_count - a.songs_count)
        .slice(0, 12);

      // 5. Guardar en caché
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: artistsArray,
        timestamp: Date.now()
      }));

      console.log('✅ Artistas cargados:', artistsArray.length);
      setArtists(artistsArray);
      setError(null);
      setRetryCount(0);

    } catch (err) {
      console.error('❌ Error fetching artists:', err);
      
      // Mensaje de error amigable
      let errorMessage = 'Error al cargar artistas';
      if (err.name === 'AbortError') {
        errorMessage = 'La conexión es lenta. Reintentando...';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'No hay conexión a internet';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);

      // Reintentar automáticamente (máximo 3 veces)
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  // Efecto inicial
  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // Forzar recarga ignorando caché
  const refetch = () => fetchArtists(true);

  return { 
    artists, 
    loading, 
    error,
    refetch
  };
};

export default useArtists;