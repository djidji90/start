// src/components/profile/hooks/useProfileData.js (versión corregida)
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para obtener y procesar datos del perfil de un usuario/artista
 */
const useProfileData = (username) => {
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
  const [loadingMore, setLoadingMore] = useState(false); // 🔥 NUEVO: estado separado para carga adicional
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });

  // Referencia para evitar múltiples cargas simultáneas
  const isLoadingMoreRef = useRef(false);

  // ============================================
  // 2. FUNCIÓN PRINCIPAL PARA OBTENER DATOS
  // ============================================

  const fetchUserSongs = useCallback(async (url = null) => {
    const apiUrl = url || `https://api.djidjimusic.com/api2/songs/?uploaded_by__username=${username}`;
    
    console.log('📡 Fetching:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar el perfil`);
    }
    
    return await response.json();
  }, [username]);

  // ============================================
  // 3. CARGA INICIAL
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
        setProfile(null);
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
  }, [fetchUserSongs]);

  // ============================================
  // 4. CARGA DE MÁS CANCIONES (CORREGIDA)
  // ============================================

  /**
   * Carga la siguiente página de canciones
   * Versión corregida que evita ciclos infinitos
   */
  const loadMoreSongs = useCallback(async () => {
    // Prevenir múltiples cargas simultáneas
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
        // ✅ IMPORTANTE: Usar función actualizadora para evitar closure con songs antiguas
        setSongs(prevSongs => {
          const newSongs = [...prevSongs, ...pageData.results];
          return newSongs;
        });
        
        // Actualizar paginación
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
  }, [loadingMore, pagination.next, fetchUserSongs]); // ✅ SOLO depende de lo necesario

  /**
   * Versión legacy para compatibilidad (pero ahora usa loadMoreSongs)
   */
  const loadAllPages = useCallback(() => {
    loadMoreSongs();
  }, [loadMoreSongs]);

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
    if (username) {
      loadInitialData();
    }
    
    // Limpiar al desmontar o cambiar username
    return () => {
      setProfile(null);
      setSongs([]);
      setLoading(true);
      setError(null);
      isLoadingMoreRef.current = false;
    };
  }, [username, loadInitialData]);

  // ============================================
  // 9. LO QUE DEVUELVE EL HOOK
  // ============================================

  return {
    profile,
    songs,
    stats,
    loading,
    loadingMore, // 🔥 NUEVO: para mostrar loader en scroll
    error,
    hasMore: !!pagination.next,
    loadMoreSongs, // 🔥 NUEVO: función específica para cargar más
    loadAllPages,  // Mantenido por compatibilidad
    sortSongs,
    filterByGenre,
    refresh: loadInitialData,
    pagination,
  };
};

export default useProfileData;