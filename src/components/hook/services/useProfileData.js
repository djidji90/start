// src/components/hook/services/useProfileData.js
import { useState, useEffect, useCallback, useRef } from 'react';

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

  // ============================================
  // 2. DETECTAR TIPO DE IDENTIFICADOR
  // ============================================
  
  // ✅ NUEVO: Detectar si es ID numérico o username string
  const isId = !isNaN(identifier) && identifier !== '';

  // ============================================
  // 3. FUNCIÓN PRINCIPAL PARA OBTENER DATOS
  // ============================================

  const fetchUserSongs = useCallback(async (url = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Construir URL según el tipo de identificador
      let apiUrl;
      if (url) {
        apiUrl = url;
      } else if (isId) {
        apiUrl = `https://api.djidjimusic.com/api2/songs/?uploaded_by__id=${identifier}`;
      } else {
        apiUrl = `https://api.djidjimusic.com/api2/songs/?uploaded_by__username=${identifier}`;
      }

      console.log('📡 Fetching perfil:', { 
        identifier, 
        isId, 
        apiUrl 
      });

      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 404) {
          return { results: [], count: 0, next: null, previous: null };
        }
        throw new Error(`Error ${response.status}: No se pudo cargar el perfil`);
      }

      const data = await response.json();
      return data;

    } catch (err) {
      console.error('❌ Error en fetchUserSongs:', err);
      throw err;
    }
  }, [identifier, isId]);

  // ============================================
  // 4. CARGA INICIAL
  // ============================================

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const firstPageData = await fetchUserSongs();
      
      if (firstPageData.results?.length > 0) {
        const firstSong = firstPageData.results[0];
        setProfile(firstSong.uploaded_by);
        setSongs(firstPageData.results);
        calculateStats(firstPageData.results, firstPageData.count || 0);
      } else {
        // Usuario existe pero no tiene canciones, crear perfil mínimo
        setProfile({ 
          username: identifier,
          full_name: identifier,
          profile: { bio: null, avatar_url: null, location: null }
        });
        setSongs([]);
      }
      
      setPagination({
        next: firstPageData.next,
        previous: firstPageData.previous,
        count: firstPageData.count || 0,
      });
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUserSongs, identifier]);

  // ============================================
  // 5. CARGA DE MÁS CANCIONES
  // ============================================

  const loadMoreSongs = useCallback(async () => {
    if (loadingMore || isLoadingMoreRef.current || !pagination.next) {
      return;
    }

    try {
      setLoadingMore(true);
      isLoadingMoreRef.current = true;
      
      const nextUrl = pagination.next;
      console.log('📡 Cargando más canciones:', nextUrl);
      
      const pageData = await fetchUserSongs(nextUrl);
      
      if (pageData.results) {
        setSongs(prevSongs => {
          const newSongs = [...prevSongs, ...pageData.results];
          return newSongs;
        });
        
        setPagination(prev => ({
          ...prev,
          next: pageData.next,
          previous: pageData.previous,
        }));
      }
      
    } catch (err) {
      console.error('❌ Error cargando más canciones:', err);
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [loadingMore, pagination.next, fetchUserSongs]);

  // ============================================
  // 6. CALCULAR ESTADÍSTICAS
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
  // 7. ORDENAR CANCIONES
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
  // 8. FILTRAR POR GÉNERO
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
  // 9. EFECTO PRINCIPAL
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
  // 10. LO QUE DEVUELVE EL HOOK
  // ============================================

  return {
    profile,
    songs,
    stats,
    loading,
    loadingMore,
    error,
    hasMore: !!pagination.next,
    loadMoreSongs,
    loadAllPages: loadMoreSongs,
    sortSongs,
    filterByGenre,
    refresh: loadInitialData,
    pagination,
  };
};

export default useProfileData;