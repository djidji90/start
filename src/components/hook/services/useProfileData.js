// src/components/profile/hooks/useProfileData.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para obtener y procesar datos del perfil de un usuario/artista
 */
const useProfileData = (identifier) => {
  // ============================================
  // 1. ESTADOS LOCALES
  // ============================================

  const [profile, setProfile] = useState(null);
  const [songs, setSongs] = useState([]);
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalLikes: 0,
    totalPlays: 0,
    totalDownloads: 0,
    genres: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });

  const isLoadingMoreRef = useRef(false);

  // ✅ DETECTAR SI ES ID O USERNAME
  const isId = !isNaN(identifier) && identifier !== '';

  // ============================================
  // 2. FUNCIÓN PRINCIPAL PARA OBTENER DATOS
  // ============================================

  const fetchUserSongs = useCallback(async (url = null) => {
    // 🔥 Usar el endpoint sin filtros (el backend no filtra)
    const apiUrl = url || 'https://api.djidjimusic.com/api2/songs/';
    
    console.log('📡 Fetching:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar el perfil`);
    }
    
    return await response.json();
  }, []); // Sin dependencias porque la URL es fija

  // ============================================
  // 3. CARGA INICIAL CON FILTRO MANUAL
  // ============================================

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener TODAS las canciones (el backend no filtra)
      const allData = await fetchUserSongs();
      
      if (allData.results?.length > 0) {
        // 🔥 FILTRO MANUAL - ELIMINAR CUANDO EL BACKEND FUNCIONE
        let filteredSongs = [];
        
        if (isId) {
          // Filtrar por ID numérico
          filteredSongs = allData.results.filter(song => 
            song.uploaded_by?.id === Number(identifier)
          );
          console.log(`🔍 Filtrando por ID ${identifier}: ${filteredSongs.length} canciones`);
        } else {
          // Filtrar por username
          filteredSongs = allData.results.filter(song => 
            song.uploaded_by?.username === identifier
          );
          console.log(`🔍 Filtrando por username ${identifier}: ${filteredSongs.length} canciones`);
        }
        
        if (filteredSongs.length > 0) {
          const firstSong = filteredSongs[0];
          setProfile(firstSong.uploaded_by);
          setSongs(filteredSongs);
          calculateStats(filteredSongs, filteredSongs.length);
        } else {
          // Usuario existe pero no tiene canciones
          setProfile({ 
            username: identifier,
            full_name: identifier,
            profile: { bio: null, avatar_url: null, location: null }
          });
          setSongs([]);
        }
        
        // ⚠️ Paginación deshabilitada porque tenemos que filtrar manualmente
        setPagination({
          next: null,
          previous: null,
          count: filteredSongs.length,
        });
        
      } else {
        setProfile(null);
        setSongs([]);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUserSongs, identifier, isId]);

  // ============================================
  // 4. CARGA DE MÁS CANCIONES (DESHABILITADA)
  // ============================================

  const loadMoreSongs = useCallback(async () => {
    // ⚠️ Deshabilitado porque ya no hay paginación con filtro manual
    console.log('⏸️ Carga adicional deshabilitada (filtro manual activo)');
    return;
  }, []);

  // ============================================
  // 5. CALCULAR ESTADÍSTICAS AGREGADAS
  // ============================================

  const calculateStats = (songsList, totalCount) => {
    let totalLikes = 0;
    let totalPlays = 0;
    let totalDownloads = 0;
    const genresSet = new Set();

    songsList.forEach(song => {
      totalLikes += song.likes_count || 0;
      totalPlays += song.plays_count || 0;
      totalDownloads += song.downloads_count || 0;
      if (song.genre) genresSet.add(song.genre);
    });

    setStats({
      totalSongs: totalCount,
      totalLikes,
      totalPlays,
      totalDownloads,
      genres: Array.from(genresSet),
    });
  };

  // ============================================
  // 6. ORDENAR CANCIONES
  // ============================================

  const sortSongs = useCallback((criteria = 'popular') => {
    setSongs(prevSongs => {
      const sorted = [...prevSongs];
      
      switch(criteria) {
        case 'recent':
          sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'likes':
          sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
          break;
        case 'downloads':
          sorted.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
          break;
        case 'popular':
        default:
          sorted.sort((a, b) => {
            const scoreA = (a.plays_count || 0) + (a.likes_count || 0) * 2 + (a.downloads_count || 0) * 3;
            const scoreB = (b.plays_count || 0) + (b.likes_count || 0) * 2 + (b.downloads_count || 0) * 3;
            return scoreB - scoreA;
          });
      }
      
      return sorted;
    });
  }, []);

  // ============================================
  // 7. FILTRAR POR GÉNERO
  // ============================================

  const filterByGenre = useCallback((genre) => {
    if (!genre) {
      loadInitialData();
      return;
    }

    setSongs(prevSongs => 
      prevSongs.filter(song => song.genre?.toLowerCase() === genre.toLowerCase())
    );
  }, [loadInitialData]);

  // ============================================
  // 8. EFECTO PRINCIPAL
  // ============================================

  useEffect(() => {
    if (identifier) {
      loadInitialData();
    }
    
    return () => {
      setProfile(null);
      setSongs([]);
      setLoading(true);
      setError(null);
      isLoadingMoreRef.current = false;
    };
  }, [identifier, loadInitialData]);

  // ============================================
  // 9. LO QUE DEVUELVE EL HOOK
  // ============================================

  return {
    profile,
    songs,
    stats,
    loading,
    loadingMore: false, // Deshabilitado
    error,
    hasMore: false, // Deshabilitado
    loadMoreSongs,
    loadAllPages: loadMoreSongs,
    sortSongs,
    filterByGenre,
    refresh: loadInitialData,
    pagination,
  };
};

export default useProfileData;