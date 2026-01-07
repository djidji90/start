// src/hooks/useSearch.js
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [structuredResults, setStructuredResults] = useState({
    songs: [],
    artists: [],
    suggestions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | searching | success | error
  const [searchMetrics, setSearchMetrics] = useState(null);

  const debounceTimer = useRef(null);
  const cache = useRef(new Map());
  const searchStartTime = useRef(0);

  // Limpiar cache viejo (más de 5 minutos)
  useEffect(() => {
    const cleanupOldCache = () => {
      const now = Date.now();
      for (const [key, value] of cache.current.entries()) {
        if (now - value.timestamp > 5 * 60 * 1000) {
          cache.current.delete(key);
        }
      }
    };

    const interval = setInterval(cleanupOldCache, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calcular puntuación de relevancia
  const calculateRelevanceScore = useCallback((item, searchQuery) => {
    const queryLower = searchQuery.toLowerCase();
    let score = 0;
    
    if (item.title?.toLowerCase().includes(queryLower)) score += 10;
    if (item.artist?.toLowerCase().includes(queryLower)) score += 8;
    if (item.name?.toLowerCase().includes(queryLower)) score += 8;
    if (item.display?.toLowerCase().includes(queryLower)) score += 5;
    if (item.likes_count > 0) score += Math.min(item.likes_count / 100, 5);
    if (item.type === 'song') score += 2;
    if (item.type === 'artist') score += 1;
    
    return score;
  }, []);

  // Transformar y priorizar resultados con estructura dual
  const transformAndPrioritizeResults = useCallback((songs, suggestions, searchQuery) => {
    const structured = {
      songs: [],
      artists: [],
      suggestions: []
    };

    const allItems = [];
    
    // Procesar canciones
    if (songs && Array.isArray(songs)) {
      structured.songs = songs.map(song => ({
        id: song.id,
        title: song.title || 'Sin título',
        artist: song.artist || 'Artista desconocido',
        genre: song.genre,
        duration: song.duration,
        likes_count: song.likes_count || 0,
        type: 'song',
        display: `${song.title || 'Sin título'} - ${song.artist || 'Artista desconocido'}`,
        raw: song,
        priority: 1,
        score: calculateRelevanceScore(song, searchQuery)
      }));
      allItems.push(...structured.songs);
    }

    // Procesar sugerencias
    if (suggestions && Array.isArray(suggestions)) {
      suggestions.forEach(suggestion => {
        const type = suggestion.type || 'suggestion';
        
        if (type === 'artist') {
          const artistItem = {
            ...suggestion,
            id: suggestion.id || `artist-${Date.now()}-${Math.random()}`,
            name: suggestion.name || suggestion.display || 'Artista',
            type: 'artist',
            priority: 2,
            score: calculateRelevanceScore(suggestion, searchQuery)
          };
          structured.artists.push(artistItem);
          allItems.push(artistItem);
        } else {
          const suggestionItem = {
            ...suggestion,
            id: suggestion.id || `suggestion-${Date.now()}-${Math.random()}`,
            display: suggestion.display || suggestion.title || suggestion.name || 'Sugerencia',
            type: 'suggestion',
            priority: 3,
            score: calculateRelevanceScore(suggestion, searchQuery)
          };
          structured.suggestions.push(suggestionItem);
          allItems.push(suggestionItem);
        }
      });
    }

    // Ordenar cada categoría por puntuación
    structured.songs.sort((a, b) => b.score - a.score);
    structured.artists.sort((a, b) => b.score - a.score);
    structured.suggestions.sort((a, b) => b.score - a.score);

    // Ordenar array plano por prioridad y puntuación
    allItems.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.score - a.score;
    });

    return { structured, allItems };
  }, [calculateRelevanceScore]);

  // Función principal de búsqueda
  const search = useCallback(async (searchQuery, forceRefresh = false) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setStructuredResults({ songs: [], artists: [], suggestions: [] });
      setIsOpen(false);
      setStatus('idle');
      setSearchMetrics(null);
      return;
    }

    const trimmedQuery = searchQuery.trim();
    const cacheKey = trimmedQuery.toLowerCase();

    // Verificar cache (si no es forzado)
    if (!forceRefresh && cache.current.has(cacheKey)) {
      const cachedData = cache.current.get(cacheKey);
      const cacheAge = Date.now() - cachedData.timestamp;
      
      // Usar cache si tiene menos de 30 segundos
      if (cacheAge < 30000) {
        console.log('📦 Usando cache para:', trimmedQuery);
        setResults(cachedData.allItems);
        setStructuredResults(cachedData.structured);
        setIsOpen(true);
        setStatus('success');
        setSearchMetrics(cachedData.metrics);
        return;
      }
    }

    console.log('🔍 Iniciando búsqueda para:', trimmedQuery);
    searchStartTime.current = Date.now();
    setLoading(true);
    setError(null);
    setStatus('searching');
    setIsOpen(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Configurar headers comunes
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Hacer las dos peticiones en paralelo con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const [songsResponse, suggestionsResponse] = await Promise.all([
        fetch(`https://api.djidjimusic.com/api2/songs/?search=${encodeURIComponent(trimmedQuery)}&limit=7`, {
          headers,
          signal: controller.signal
        }),
        fetch(`https://api.djidjimusic.com/api2/suggestions/?query=${encodeURIComponent(trimmedQuery)}`, {
          headers,
          signal: controller.signal
        })
      ]);

      clearTimeout(timeoutId);

      // Verificar errores HTTP
      if (!songsResponse.ok) {
        throw new Error(`Error en canciones: ${songsResponse.status}`);
      }
      if (!suggestionsResponse.ok) {
        throw new Error(`Error en sugerencias: ${suggestionsResponse.status}`);
      }

      // Procesar respuestas
      const songsData = await songsResponse.json();
      const suggestionsData = await suggestionsResponse.json();

      console.log('📊 Datos recibidos:', {
        canciones: songsData.results?.length || 0,
        sugerencias: suggestionsData.suggestions?.length || 0
      });

      // Transformar y priorizar resultados
      const { structured, allItems } = transformAndPrioritizeResults(
        songsData.results,
        suggestionsData.suggestions,
        trimmedQuery
      );

      // Calcular métricas
      const searchTime = Date.now() - searchStartTime.current;
      const metrics = {
        time: searchTime,
        fromCache: false,
        cached: false,
        query: trimmedQuery,
        totalResults: allItems.length,
        songs: structured.songs.length,
        artists: structured.artists.length,
        suggestions: structured.suggestions.length,
        searchTime: `${searchTime}ms`
      };

      console.log('🎯 Métricas de búsqueda:', metrics);

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
        timestamp: Date.now()
      });

    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      
      let errorMessage = 'Error al buscar. Intenta nuevamente.';
      
      if (err.name === 'AbortError') {
        errorMessage = 'La búsqueda tardó demasiado. Revisa tu conexión.';
      } else if (err.message.includes('status')) {
        errorMessage = `Error del servidor: ${err.message}`;
      } else if (!navigator.onLine) {
        errorMessage = 'Sin conexión a internet. Verifica tu red.';
      }

      setError(errorMessage);
      setResults([]);
      setStructuredResults({ songs: [], artists: [], suggestions: [] });
      setStatus('error');

      // Intentar usar cache si hay error
      if (cache.current.has(cacheKey)) {
        console.log('🔄 Usando cache por error');
        const cachedData = cache.current.get(cacheKey);
        setResults(cachedData.allItems);
        setStructuredResults(cachedData.structured);
        setStatus('success');
      }
    } finally {
      setLoading(false);
    }
  }, [transformAndPrioritizeResults]);

  // Debounce automático
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 2) {
      setResults([]);
      setStructuredResults({ songs: [], artists: [], suggestions: [] });
      setIsOpen(false);
      setStatus('idle');
      setSearchMetrics(null);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      search(trimmedQuery);
    }, 350);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, search]);

  // Función para forzar una nueva búsqueda (ignorar cache)
  const forceSearch = useCallback(() => {
    if (query.trim().length >= 2) {
      search(query.trim(), true);
    }
  }, [query, search]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setStructuredResults({ songs: [], artists: [], suggestions: [] });
    setError(null);
    setIsOpen(false);
    setStatus('idle');
    setSearchMetrics(null);
  }, []);

  // Cerrar resultados
  const closeResults = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Stats de cache
  const cacheStats = useMemo(() => {
    return {
      size: cache.current.size,
      keys: Array.from(cache.current.keys())
    };
  }, []);

  return {
    // Estado
    query,
    setQuery,
    results,                    // Array plano para SearchBar
    structuredResults,          // Objeto estructurado para MainPage
    loading,
    error,
    isOpen,
    status,
    searchMetrics,
    cacheStats,
    
    // Acciones
    search,                     // Exportada explícitamente
    clearSearch,
    closeResults,
    forceSearch,
    
    // Helpers
    hasResults: results.length > 0,
    isValidQuery: query.trim().length >= 2,
    isEmptyResults: !loading && !error && results.length === 0 && query.trim().length >= 2
  };
};

export default useSearch;