// src/components/profile/hooks/useProfileData.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para obtener y procesar datos del perfil de un usuario/artista
 * @param {string} username - Nombre de usuario del perfil a consultar
 * @returns {Object} Datos del perfil, canciones, estadísticas y estados
 */
const useProfileData = (username) => {
  // ============================================
  // 1. ESTADOS LOCALES
  // ============================================
  
  // Datos principales del perfil (extraídos de uploaded_by)
  const [profile, setProfile] = useState(null);
  
  // Lista de canciones del usuario
  const [songs, setSongs] = useState([]);
  
  // Estadísticas calculadas (totales)
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalLikes: 0,
    totalPlays: 0,
    totalDownloads: 0,
    genres: [], // Géneros únicos que cultiva
  });
  
  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Control de paginación (puede haber muchas canciones)
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });

  // ============================================
  // 2. FUNCIÓN PRINCIPAL PARA OBTENER DATOS
  // ============================================
  
  /**
   * Obtiene todas las canciones de un usuario
   * Maneja paginación automáticamente
   */
  const fetchUserSongs = useCallback(async (url = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir URL inicial si no se proporciona
      const apiUrl = url || `https://api.djidjimusic.com/api2/songs/?uploaded_by__username=${username}`;
      
      console.log('📡 Fetching:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo cargar el perfil`);
      }
      
      const data = await response.json();
      
      return data;
    } catch (err) {
      console.error('❌ Error en fetchUserSongs:', err);
      throw err;
    }
  }, [username]);

  /**
   * Carga inicial: obtiene primera página y extrae perfil
   */
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Obtener primera página
      const firstPageData = await fetchUserSongs();
      
      // 2. Si hay resultados, extraer perfil del primer uploaded_by
      if (firstPageData.results && firstPageData.results.length > 0) {
        const firstSong = firstPageData.results[0];
        setProfile(firstSong.uploaded_by);
        
        // Guardar todas las canciones (empezamos con las de primera página)
        setSongs(firstPageData.results);
      } else {
        // Usuario existe pero no tiene canciones
        setProfile(null);
        setSongs([]);
      }
      
      // 3. Guardar información de paginación
      setPagination({
        next: firstPageData.next,
        previous: firstPageData.previous,
        count: firstPageData.count || 0,
      });
      
      // 4. Calcular estadísticas (solo con primera página por ahora)
      if (firstPageData.results) {
        calculateStats(firstPageData.results, firstPageData.count || 0);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUserSongs]);

  /**
   * Carga todas las páginas para obtener TODAS las canciones
   * Útil para estadísticas precisas cuando hay muchos datos
   */
  const loadAllPages = useCallback(async () => {
    try {
      let allSongs = [...songs]; // Empezar con lo que ya tenemos
      let nextUrl = pagination.next;
      
      // Mientras haya más páginas, seguimos obteniendo
      while (nextUrl) {
        console.log('📡 Cargando página adicional:', nextUrl);
        const pageData = await fetchUserSongs(nextUrl);
        
        if (pageData.results) {
          allSongs = [...allSongs, ...pageData.results];
          setSongs(allSongs);
        }
        
        nextUrl = pageData.next;
      }
      
      // Recalcular estadísticas con TODAS las canciones
      calculateStats(allSongs, pagination.count);
      
    } catch (err) {
      console.error('❌ Error cargando páginas adicionales:', err);
      // No mostramos error al usuario, solo usamos las que tenemos
    }
  }, [songs, pagination.next, pagination.count, fetchUserSongs]);

  // ============================================
  // 3. CALCULAR ESTADÍSTICAS AGREGADAS
  // ============================================
  
  /**
   * Calcula estadísticas totales a partir de las canciones
   * @param {Array} songsList - Lista de canciones
   * @param {number} totalCount - Total real de canciones (paginación)
   */
  const calculateStats = (songsList, totalCount) => {
    // Inicializar acumuladores
    let totalLikes = 0;
    let totalPlays = 0;
    let totalDownloads = 0;
    const genresSet = new Set();
    
    // Recorrer cada canción y sumar estadísticas
    songsList.forEach(song => {
      totalLikes += song.likes_count || 0;
      totalPlays += song.plays_count || 0;
      totalDownloads += song.downloads_count || 0;
      
      // Añadir género al Set (evita duplicados)
      if (song.genre) {
        genresSet.add(song.genre);
      }
    });
    
    // Actualizar estado
    setStats({
      totalSongs: totalCount, // Usar el count real de la API
      totalLikes,
      totalPlays,
      totalDownloads,
      genres: Array.from(genresSet), // Convertir Set a Array
    });
  };

  // ============================================
  // 4. FUNCIONES PARA ORDENAR/FILTRAR CANCIONES
  // ============================================
  
  /**
   * Ordena las canciones según criterio
   * @param {string} criteria - 'popular', 'recent', 'likes', 'downloads'
   */
  const sortSongs = (criteria = 'popular') => {
    const sortedSongs = [...songs];
    
    switch(criteria) {
      case 'recent':
        // Más recientes primero (por created_at)
        sortedSongs.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        break;
        
      case 'likes':
        // Más likes primero
        sortedSongs.sort((a, b) => 
          (b.likes_count || 0) - (a.likes_count || 0)
        );
        break;
        
      case 'downloads':
        // Más descargas primero
        sortedSongs.sort((a, b) => 
          (b.downloads_count || 0) - (a.downloads_count || 0)
        );
        break;
        
      case 'popular':
      default:
        // Popularidad combinada (plays + likes + downloads)
        sortedSongs.sort((a, b) => {
          const scoreA = (a.plays_count || 0) + (a.likes_count || 0) * 2 + (a.downloads_count || 0) * 3;
          const scoreB = (b.plays_count || 0) + (b.likes_count || 0) * 2 + (b.downloads_count || 0) * 3;
          return scoreB - scoreA;
        });
    }
    
    setSongs(sortedSongs);
  };

  /**
   * Filtra canciones por género
   * @param {string} genre - Género a filtrar (null para quitar filtro)
   */
  const filterByGenre = (genre) => {
    if (!genre) {
      // Si no hay filtro, recargar datos originales
      loadInitialData();
      return;
    }
    
    const filtered = songs.filter(song => 
      song.genre?.toLowerCase() === genre.toLowerCase()
    );
    
    setSongs(filtered);
  };

  // ============================================
  // 5. EFECTO PRINCIPAL: CARGA INICIAL
  // ============================================
  
  useEffect(() => {
    if (username) {
      loadInitialData();
    }
  }, [username, loadInitialData]); // Se ejecuta cuando cambia el username

  // ============================================
  // 6. LO QUE DEVUELVE EL HOOK
  // ============================================
  
  return {
    // Datos del perfil
    profile,
    songs,
    stats,
    
    // Estados
    loading,
    error,
    hasMore: !!pagination.next, // Si hay más páginas
    
    // Acciones
    loadAllPages,      // Para cargar todas las canciones
    sortSongs,         // Para ordenar
    filterByGenre,     // Para filtrar por género
    refresh: loadInitialData, // Para recargar
    
    // Info de paginación
    pagination,
  };
};

export default useProfileData;