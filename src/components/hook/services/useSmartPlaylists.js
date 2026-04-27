// src/components/hook/services/useSmartPlaylists.js
// ============================================
// 🎯 HOOK INTELIGENTE PARA PLAYLISTS CURADAS
// ✅ CORREGIDO: Sin bucles infinitos
// ============================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import playlistService from './playlistService.';
import useAuth from './useAuth';

const STORAGE_KEY = 'saved_playlists';

const useSmartPlaylists = ({ autoFetch = true } = {}) => {
  const { isAuthenticated } = useAuth();
  
  // Estados principales
  const [playlists, setPlaylists] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache de streams
  const [streamCache, setStreamCache] = useState({});
  
  // Favoritos (persistidos localmente)
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  // Filtros
  const [activeFilter, setActiveFilter] = useState(null);
  
  // ✅ Ref para evitar montajes múltiples
  const hasFetched = useRef(false);
  
  // ============================================
  // 📥 CARGAR PLAYLISTS (estable, sin cambios en cada render)
  // ============================================
  
  const fetchPlaylists = useCallback(async () => {
    // ✅ Evitar llamadas duplicadas si ya hay datos
    if (playlists.length > 0 && !error) {
      console.log('[useSmartPlaylists] Already loaded, skipping fetch');
      return playlists;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await playlistService.getAll();
      
      // Solo playlists con canciones
      const validPlaylists = (response.playlists || []).filter(
        p => p.song_count > 0
      );
      
      setPlaylists(validPlaylists);
      setGrouped(response.grouped || {});
      
      return validPlaylists;
    } catch (err) {
      console.error('[useSmartPlaylists] Error fetching:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [playlists.length, error]); // ✅ Dependencias correctas
  
  // ============================================
  // 💾 CACHE DE STREAMS
  // ============================================
  
  const getStream = useCallback(async (playlist) => {
    if (!playlist?.slug) return null;
    
    // Si ya está en caché, devolver inmediatamente
    if (streamCache[playlist.id]) {
      console.log(`📦 Cache hit: ${playlist.name}`);
      return streamCache[playlist.id];
    }
    
    console.log(`🌊 Cache miss: ${playlist.name}, cargando stream...`);
    
    try {
      const streamData = await playlistService.getStream(playlist.slug);
      
      // Transformar al formato del player
      const songs = (streamData.songs || []).map(s => ({
        id: String(s.song_id || s.id),
        title: s.title,
        artist: s.artist,
        duration: s.duration,
        genre: s.genre,
        cover: s.image_key || s.cover_url || null,
        stream_url: s.stream_url,
        plays_count: s.plays_count || 0,
      }));
      
      const cachedData = {
        ...streamData,
        songs,
        cachedAt: Date.now(),
      };
      
      // Guardar en caché
      setStreamCache(prev => ({
        ...prev,
        [playlist.id]: cachedData
      }));
      
      return cachedData;
    } catch (err) {
      console.error(`[useSmartPlaylists] Error loading stream ${playlist.slug}:`, err);
      throw err;
    }
  }, [streamCache]);
  
  // ============================================
  // 💖 FAVORITOS (con persistencia)
  // ============================================
  
  // ✅ Guardar en localStorage SOLO cuando savedIds cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
  }, [savedIds]);
  
  const savePlaylist = useCallback(async (playlistId) => {
    const id = String(playlistId);
    
    if (!isAuthenticated) {
      setSavedIds(prev => [...new Set([...prev, id])]);
      return { success: true, local: true };
    }
    
    try {
      await playlistService.save(playlistId);
      setSavedIds(prev => [...new Set([...prev, id])]);
      return { success: true };
    } catch (err) {
      console.error('[useSmartPlaylists] Error saving:', err);
      throw err;
    }
  }, [isAuthenticated]);
  
  const unsavePlaylist = useCallback(async (playlistId) => {
    const id = String(playlistId);
    
    setSavedIds(prev => prev.filter(x => x !== id));
    
    if (!isAuthenticated) {
      return { success: true, local: true };
    }
    
    try {
      await playlistService.unsave(playlistId);
      return { success: true };
    } catch (err) {
      console.error('[useSmartPlaylists] Error unsaving:', err);
      setSavedIds(prev => [...prev, id]);
      throw err;
    }
  }, [isAuthenticated]);
  
  // ============================================
  // 🔍 FILTROS
  // ============================================
  
  const filterByType = useCallback((type) => {
    setActiveFilter(type);
  }, []);
  
  const clearFilter = useCallback(() => {
    setActiveFilter(null);
  }, []);
  
  // Playlists filtradas
  const filteredPlaylists = useMemo(() => {
    if (!activeFilter) return playlists;
    return playlists.filter(p => p.playlist_type === activeFilter);
  }, [playlists, activeFilter]);
  
  // Grouped filtrado
  const filteredGrouped = useMemo(() => {
    if (activeFilter) return {};
    
    const result = { ...grouped };
    Object.keys(result).forEach(key => {
      result[key] = (result[key] || []).filter(p => p.song_count > 0);
      if (result[key].length === 0) delete result[key];
    });
    return result;
  }, [grouped, activeFilter]);
  
  // ============================================
  // 🔄 AUTO-FETCH (CORREGIDO - SIN BUCLE)
  // ============================================
  
  useEffect(() => {
    // ✅ Solo ejecutar una vez al montar si autoFetch está activado
    // Y si no hay datos ya cargados
    if (autoFetch && !hasFetched.current && playlists.length === 0 && !loading) {
      hasFetched.current = true;
      fetchPlaylists();
    }
  }, [autoFetch, fetchPlaylists, playlists.length, loading]); // ✅ Dependencias correctas
  
  // ============================================
  // 📤 EXPORTAR
  // ============================================
  
  return {
    // Datos
    playlists: filteredPlaylists,
    grouped: filteredGrouped,
    total: filteredPlaylists.length,
    allPlaylists: playlists,
    
    // Cache
    streamCache,
    getStream,
    clearCache: useCallback(() => setStreamCache({}), []),
    
    // Favoritos
    savedIds,
    savePlaylist,
    unsavePlaylist,
    isSaved: useCallback((id) => savedIds.includes(String(id)), [savedIds]),
    
    // Filtros
    activeFilter,
    filterByType,
    clearFilter,
    
    // Estados
    loading,
    error,
    refresh: useCallback(() => {
      hasFetched.current = false;
      setPlaylists([]); // Limpiar para forzar refetch
      fetchPlaylists();
    }, [fetchPlaylists]),
    isAuthenticated,
  };
};

export default useSmartPlaylists;