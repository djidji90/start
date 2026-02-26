// ============================================
// hooks/useSearch.js - VERSIÓN COMPLETA CORREGIDA
// ✅ Incluye downloads_count, likes_count, plays_count
// ✅ Compatible con lógica existente (solo añade campos)
// ✅ No rompe funcionalidad actual
// ============================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [structuredResults, setStructuredResults] = useState({
    songs: [],
    artists: [],
    genres: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [searchMetrics, setSearchMetrics] = useState(null);

  const apiConfig = useRef({
    // Configuración basada en tu backend Django
    baseUrl: window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1'
      ? 'https://api.djidjimusic.com/api2'
      : 'https://api.djidjimusic.com/api2',
    timeout: 8000,
    cacheDuration: 300000 // 5 minutos
  });

  const debounceTimer = useRef(null);
  const cache = useRef(new Map());
  const searchStartTime = useRef(0);
  const abortController = useRef(null);

  // Transformar resultados COMPATIBLE con tus vistas
  const transformResults = useCallback((apiData, searchQuery, isLegacy = false) => {
    console.log('🔄 Transformando datos API (compatibilidad):', {
      isLegacy,
      hasSuggestions: !!apiData.suggestions,
      isArray: Array.isArray(apiData),
      data: apiData
    });

    const structured = {
      songs: [],
      artists: [],
      genres: []
    };

    const allItems = [];

    // ============================================
    // 1. PARA VISTA LEGACY (array directo)
    // ============================================
    if (isLegacy) {
      if (Array.isArray(apiData)) {
        apiData.forEach((item, index) => {
          const songItem = {
            id: `legacy-${index}-${Date.now()}`,
            type: 'song',
            title: item.title || 'Sin título',
            artist: item.artist || 'Artista desconocido',
            genre: item.genre || 'Sin género',
            display: `${item.title || 'Sin título'} - ${item.artist || 'Artista desconocido'}`,
            score: 0, // Legacy no tiene score
            exact_match: false,
            raw: item,
            timestamp: Date.now(),
            isLegacyResult: true
          };

          structured.songs.push(songItem);
          allItems.push(songItem);
        });
      }
    }

    // ============================================
    // 2. PARA VISTA MODERNA (con suggestions) - VERSIÓN CORREGIDA
    // ============================================
    else if (apiData.suggestions && Array.isArray(apiData.suggestions)) {
      apiData.suggestions.forEach((item, index) => {
        const type = item.type || 'song';

        // ✅ VERSIÓN CORREGIDA: Incluye todos los campos necesarios
        const baseItem = {
          // Campos existentes (se mantienen igual)
          id: item.id || `temp-${index}-${Date.now()}`,
          type: type,
          title: item.title || 'Sin título',
          artist: item.artist || 'Artista desconocido',
          genre: item.genre || 'Sin género',
          name: item.name || item.title || 'Sin nombre',
          display: item.display || `${item.title || item.name || ''} - ${item.artist || ''}`,
          score: item.score || 0,
          exact_match: item.exact_match || false,
          raw: item,
          timestamp: Date.now(),
          
          // ✅ NUEVOS CAMPOS PARA MÉTRICAS (NO AFECTAN LÓGICA EXISTENTE)
          downloads_count: item.downloads_count !== undefined ? item.downloads_count : 0,
          likes_count: item.likes_count !== undefined ? item.likes_count : 0,
          plays_count: item.plays_count !== undefined ? item.plays_count : 0,
          
          // ✅ NUEVOS CAMPOS PARA IMAGEN/ARCHIVO
          image_url: item.image_url || null,
          file_key: item.file_key || null,
          is_public: item.is_public !== undefined ? item.is_public : true,
          
          // ✅ DATOS DEL ARTISTA/UPLOADER
          uploaded_by: item.uploaded_by || null
        };

        // Organizar por tipo según tu backend
        switch (type) {
          case 'song':
            structured.songs.push(baseItem);
            allItems.push(baseItem);
            break;

          case 'artist':
            structured.artists.push({
              ...baseItem,
              name: item.name || item.artist || 'Artista',
              // song_count viene de búsqueda completa, no de suggestions
            });
            allItems.push(baseItem);
            break;

          case 'genre':
            structured.genres.push({
              ...baseItem,
              name: item.name || item.genre || 'Género'
            });
            allItems.push(baseItem);
            break;
        }
      });
    }

    // ============================================
    // 3. PARA BÚSQUEDA COMPLETA (si implementas)
    // ============================================
    else if (apiData.results) {
      const { songs = [], artists = [], genres = [] } = apiData.results;

      songs.forEach(song => {
        const songItem = {
          id: song.id,
          type: 'song',
          title: song.title || 'Sin título',
          artist: song.artist || 'Artista desconocido',
          genre: song.genre || 'Sin género',
          display: `${song.title} - ${song.artist}`,
          score: 0,
          raw: song,
          timestamp: Date.now(),
          
          // ✅ MISMOS CAMPOS AÑADIDOS
          downloads_count: song.downloads_count !== undefined ? song.downloads_count : 0,
          likes_count: song.likes_count !== undefined ? song.likes_count : 0,
          plays_count: song.plays_count !== undefined ? song.plays_count : 0,
          image_url: song.image_url || null,
          file_key: song.file_key || null,
          is_public: song.is_public !== undefined ? song.is_public : true,
          uploaded_by: song.uploaded_by || null
        };
        structured.songs.push(songItem);
        allItems.push(songItem);
      });

      artists.forEach(artist => {
        const artistItem = {
          id: artist.id || `artist-${artist.name}`,
          type: 'artist',
          name: artist.name || 'Artista',
          display: `${artist.name} (artista)`,
          score: 0,
          raw: artist,
          timestamp: Date.now()
        };
        structured.artists.push(artistItem);
        allItems.push(artistItem);
      });

      genres.forEach(genre => {
        const genreItem = {
          id: genre.id || `genre-${genre.name}`,
          type: 'genre',
          name: genre.name || 'Género',
          display: `${genre.name} (género)`,
          score: 0,
          raw: genre,
          timestamp: Date.now()
        };
        structured.genres.push(genreItem);
        allItems.push(genreItem);
      });
    }

    // Ordenar (si hay score, sino por orden de llegada)
    structured.songs.sort((a, b) => (b.score || 0) - (a.score || 0));
    structured.artists.sort((a, b) => (b.score || 0) - (a.score || 0));
    structured.genres.sort((a, b) => (b.score || 0) - (a.score || 0));
    allItems.sort((a, b) => (b.score || 0) - (a.score || 0));

    return { structured, allItems };
  }, []);

  // Función para hacer peticiones compatibles
  const makeRequest = useCallback(async (url, options = {}) => {
    abortController.current = new AbortController();
    const timeoutId = setTimeout(() => abortController.current.abort(), apiConfig.current.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortController.current.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);
      return { 
        success: false, 
        error: error.name === 'AbortError' 
          ? new Error('La búsqueda tardó demasiado')
          : error 
      };
    }
  }, []);

  // Función principal COMPATIBLE con tus endpoints
  const search = useCallback(async (searchQuery, forceRefresh = false, options = {}) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setStructuredResults({ songs: [], artists: [], genres: [] });
      setIsOpen(false);
      setStatus('idle');
      setSearchMetrics(null);
      return;
    }

    const trimmedQuery = searchQuery.trim();
    const cacheKey = `search:${trimmedQuery.toLowerCase()}:${options.endpoint || 'suggestions'}`;

    // Verificar cache
    if (!forceRefresh && cache.current.has(cacheKey)) {
      const cachedData = cache.current.get(cacheKey);
      const cacheAge = Date.now() - cachedData.timestamp;

      if (cacheAge < apiConfig.current.cacheDuration) {
        console.log('📦 Usando cache:', trimmedQuery);
        setResults(cachedData.allItems);
        setStructuredResults(cachedData.structured);
        setIsOpen(true);
        setStatus('success');
        setSearchMetrics(cachedData.metrics);
        return;
      }
    }

    console.log('🔍 Iniciando búsqueda:', trimmedQuery);
    searchStartTime.current = Date.now();
    setLoading(true);
    setError(null);
    setStatus('searching');
    setIsOpen(true);

    try {
      const { 
        endpoint = 'suggestions', 
        limit = 8, 
        types = 'song',
        useLegacyFormat = false 
      } = options;

      let url;
      let isLegacyCall = false;

      // ============================================
      // CONSTRUIR URL SEGÚN TU BACKEND
      // ============================================
      if (endpoint === 'legacy-suggestions') {
        // Para: /api2/songs/search/suggestions/?q=query&limit=8
        url = `${apiConfig.current.baseUrl}/songs/search/suggestions/?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}`;
        isLegacyCall = true;
        console.log('🔗 Llamando a endpoint LEGACY');

      } else if (endpoint === 'suggestions') {
        // Para: /api2/suggestions/?query=texto&limit=8&types=song,artist,genre
        const params = new URLSearchParams({
          query: trimmedQuery,
          limit: Math.min(limit, 20),
          types: types
        });
        url = `${apiConfig.current.baseUrl}/suggestions/?${params.toString()}`;
        console.log('🔗 Llamando a endpoint MODERNO (suggestions)');

      } else if (endpoint === 'search-suggestions') {
        // Para: /api2/search/suggestions/?query=texto
        const params = new URLSearchParams({
          query: trimmedQuery,
          limit: Math.min(limit, 20),
          types: types
        });
        url = `${apiConfig.current.baseUrl}/search/suggestions/?${params.toString()}`;
        console.log('🔗 Llamando a endpoint MODERNO (search/suggestions)');

      } else {
        // Por defecto, usar suggestions
        const params = new URLSearchParams({
          query: trimmedQuery,
          limit: Math.min(limit, 20),
          types: types
        });
        url = `${apiConfig.current.baseUrl}/suggestions/?${params.toString()}`;
      }

      console.log('🌐 URL final:', url);

      // Hacer la petición
      const { success, data, error: requestError } = await makeRequest(url);

      if (!success) {
        throw requestError;
      }

      console.log('📊 Respuesta de API:', data);

      // Transformar resultados según el tipo de endpoint
      const { structured, allItems } = transformResults(data, trimmedQuery, isLegacyCall);

      // Calcular métricas
      const searchTime = Date.now() - searchStartTime.current;
      const metrics = {
        time: searchTime,
        fromCache: false,
        query: trimmedQuery,
        totalResults: allItems.length,
        songs: structured.songs.length,
        artists: structured.artists.length,
        genres: structured.genres.length,
        searchTime: `${searchTime}ms`,
        endpoint: endpoint,
        isLegacy: isLegacyCall,
        apiResponse: data._metadata || {}
      };

      console.log('🎯 Métricas:', metrics);

      // Actualizar estado
      setResults(allItems);
      setStructuredResults(structured);
      setStatus('success');
      setSearchMetrics(metrics);

      // Actualizar cache
      cache.current.set(cacheKey, {
        allItems,
        structured,
        metrics,
        timestamp: Date.now(),
        endpoint,
        params: { limit, types }
      });

    } catch (err) {
      console.error('❌ Error en búsqueda:', err);

      let errorMessage = 'Error al buscar. Intenta nuevamente.';
      let errorType = 'unknown';

      if (err.name === 'AbortError') {
        errorMessage = 'La búsqueda tardó demasiado. Revisa tu conexión.';
        errorType = 'timeout';
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
        errorType = 'network';
      } else if (err.message.includes('HTTP')) {
        errorMessage = `Error del servidor: ${err.message}`;
        errorType = 'http';
      }

      setError({ message: errorMessage, type: errorType, original: err });
      setResults([]);
      setStructuredResults({ songs: [], artists: [], genres: [] });
      setStatus('error');

      // Intentar usar cache si hay error
      if (cache.current.has(cacheKey)) {
        console.log('🔄 Usando cache por error');
        const cachedData = cache.current.get(cacheKey);
        setResults(cachedData.allItems);
        setStructuredResults(cachedData.structured);
        setStatus('partial-success');
        setError(null);
      }
    } finally {
      setLoading(false);
      abortController.current = null;
    }
  }, [makeRequest, transformResults]);

  // Debounce automático
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setStructuredResults({ songs: [], artists: [], genres: [] });
      setIsOpen(false);
      setStatus('idle');
      setSearchMetrics(null);
      return;
    }

    const debounceTime = trimmedQuery.length < 4 ? 500 : 350;

    debounceTimer.current = setTimeout(() => {
      // Por defecto usa el endpoint 'suggestions' (moderno)
      search(trimmedQuery, false, { endpoint: 'suggestions' });
    }, debounceTime);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, search]);

  // Función específica para compatibilidad legacy
  const searchLegacy = useCallback((searchQuery, limit = 8) => {
    if (searchQuery.trim().length >= 2) {
      search(searchQuery.trim(), false, { 
        endpoint: 'legacy-suggestions',
        limit,
        useLegacyFormat: true 
      });
    }
  }, [search]);

  // Búsqueda por tipo compatible
  const searchByType = useCallback((searchQuery, type = 'song', limit = 8) => {
    if (searchQuery.trim().length >= 2) {
      const types = type === 'all' ? 'song,artist,genre' : type;
      search(searchQuery.trim(), false, { 
        endpoint: 'suggestions',
        types,
        limit 
      });
    }
  }, [search]);

  // Resto de funciones
  const forceSearch = useCallback((options = {}) => {
    if (query.trim().length >= 2) {
      search(query.trim(), true, options);
    }
  }, [query, search]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setStructuredResults({ songs: [], artists: [], genres: [] });
    setError(null);
    setIsOpen(false);
    setStatus('idle');
    setSearchMetrics(null);

    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  const closeResults = useCallback(() => {
    setIsOpen(false);
  }, []);

  const retrySearch = useCallback(() => {
    if (query.trim().length >= 2) {
      search(query.trim(), true);
    }
  }, [query, search]);

  const cacheStats = useMemo(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.entries());

    return {
      size: cache.current.size,
      entries: entries.map(([key, value]) => ({
        key: key.substring(0, 30) + '...',
        age: Math.round((now - value.timestamp) / 1000),
        results: value.allItems.length,
        endpoint: value.endpoint || 'suggestions',
        isLegacy: key.includes('legacy-suggestions')
      }))
    };
  }, []);

  const clearCache = useCallback((key = null) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  // Método para diagnóstico/debug
  const debugSearch = useCallback(async (testQuery = "test") => {
    try {
      const url = `${apiConfig.current.baseUrl}/debug/suggestions/`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Debug error:', error);
      return { status: 'error', error: error.message };
    }
  }, []);

  return {
    // Estado
    query,
    setQuery,
    results,
    structuredResults,
    loading,
    error,
    isOpen,
    status,
    searchMetrics,
    cacheStats,

    // Acciones
    search,                     // Búsqueda moderna (default)
    searchLegacy,              // Búsqueda legacy específica
    searchByType,              // Búsqueda por tipo
    forceSearch,               // Forzar búsqueda (ignorar cache)
    clearSearch,               // Limpiar búsqueda
    closeResults,              // Cerrar resultados
    retrySearch,               // Reintentar búsqueda fallida
    clearCache,                // Limpiar cache
    debugSearch,               // Para diagnóstico

    // Helpers computados
    hasResults: results.length > 0,
    isValidQuery: query.trim().length >= 2,
    isEmptyResults: !loading && !error && results.length === 0 && query.trim().length >= 2,
    hasSongs: structuredResults.songs.length > 0,
    hasArtists: structuredResults.artists.length > 0,
    hasGenres: structuredResults.genres.length > 0,
    isLegacyResult: results.some(item => item.isLegacyResult),

    // Grupos de resultados
    groupedResults: {
      topResults: results.slice(0, 3),
      songs: structuredResults.songs,
      artists: structuredResults.artists,
      genres: structuredResults.genres
    }
  };
};

export default useSearch;