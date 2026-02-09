// src/hooks/useRandomSongs.js - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback, useRef } from "react";

const useRandomSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  const isMounted = useRef(true);

  // 🔥🔥🔥 CORRECCIÓN CRÍTICA - USAR MISMA KEY QUE STREAMMANAGER
  const getAuthToken = useCallback(() => {
    // ORDEN CORRECTO: "accessToken" PRIMERO (la key que usa tu app)
    return localStorage.getItem("accessToken") ||        // <-- ESTA ES LA KEY QUE USA TU APP
           localStorage.getItem("access_token") ||       // <-- Por compatibilidad
           localStorage.getItem("token") ||              // <-- Por compatibilidad
           localStorage.getItem("auth_token") ||
           localStorage.getItem("jwt_token") ||
           localStorage.getItem("django_token");
  }, []);

  const fetchRandomSongs = useCallback(async () => {
    // 1. Obtener token usando la función CORREGIDA
    const token = getAuthToken();
    
    // DEBUG: Ver qué key encontró
    console.log(`[useRandomSongs] Token obtenido: ${token ? `SÍ (${token.substring(0, 20)}...)` : 'NO'}`);
    
    if (!token) {
      if (isMounted.current) {
        setError("🔐 No estás autenticado. Inicia sesión para continuar.");
        setIsAuthenticated(false);
        setLoading(false);
      }
      return;
    }

    if (isMounted.current) {
      setLoading(true);
      setError(null);
      setIsAuthenticated(true);
    }

    try {
      const endpoint = "https://api.djidjimusic.com/api2/songs/random/";
      
     

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      console.log("📡 Respuesta HTTP:", response.status, response.statusText);

      // Manejar diferentes tipos de respuestas
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = `Error HTTP ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            console.error("📝 Error JSON:", errorData);
            
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (jsonError) {
            console.error("❌ No se pudo parsear error como JSON:", jsonError);
          }
        }
        
        throw new Error(errorMessage);
      }

      // Parsear respuesta exitosa
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("❌ La API no devolvió JSON válido");
      }

      const data = await response.json();
      console.log("✅ Datos recibidos:", data);

      if (!isMounted.current) return;

      // PROCESAR SEGÚN TU VISTA: {"random_songs": [...]}
      if (data.random_songs && Array.isArray(data.random_songs)) {
        const validSongs = data.random_songs.filter(
          (song) => song && song.id && song.title
        );
        
        if (validSongs.length === 0) {
          setError("⚠️ No hay canciones con datos completos disponibles.");
        }
        
        setSongs(validSongs);
        console.log(`🎵 ${validSongs.length} canciones cargadas`);
        
      } else if (data.error) {
        setError(`⚠️ ${data.error}`);
        setSongs([]);
        
      } else if (Array.isArray(data)) {
        setSongs(data);
        
        
      } else {
        console.warn("⚠️ Estructura de respuesta inesperada:", data);
        setError("❌ Formato de respuesta inesperado de la API");
        setSongs([]);
      }

    } catch (err) {
      console.error("❌ Error en fetchRandomSongs:", err);
      
      if (!isMounted.current) return;

      const errorMessage = err.message || "Error desconocido";
      
      // 🔥 CORRECCIÓN: Limpiar las keys correctas
      if (errorMessage.includes("401") || errorMessage.includes("autenticación") || errorMessage.includes("credenciales")) {
        setError("🔐 Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
        setIsAuthenticated(false);
        
        // LIMPIAR LAS KEYS CORRECTAS (las que usa tu app)
        localStorage.removeItem("accessToken");    // <-- CORREGIDO
        localStorage.removeItem("refreshToken");   // <-- CORREGIDO
        localStorage.removeItem("access_token");   // <-- Por compatibilidad
        
      } else if (errorMessage.includes("403") || errorMessage.includes("permiso")) {
        setError("⛔ No tienes permisos para acceder a las canciones.");
        
      } else if (errorMessage.includes("404")) {
        setError("🎵 No hay canciones disponibles en este momento.");
        
      } else if (errorMessage.includes("500")) {
        setError("💥 Error interno del servidor. Por favor, intenta más tarde.");
        
      } else if (errorMessage.includes("Network") || errorMessage.includes("Failed to fetch") || errorMessage.includes("CORS")) {
        setError("🌐 Error de conexión. Verifica tu internet y que la API esté disponible.");
        
      } else if (errorMessage.includes("JSON")) {
        setError("📄 Error en la respuesta del servidor (formato inválido).");
        
      } else {
        setError(`❌ ${errorMessage}`);
      }
      
      setSongs([]);
      
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [getAuthToken]);

  useEffect(() => {
    isMounted.current = true;
    
    const timer = setTimeout(() => {
      fetchRandomSongs();
    }, 100);
    
    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [fetchRandomSongs]);

  // Función para reintentar
  const retryWithCurrentToken = useCallback(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      setError(null);
      fetchRandomSongs();
    } else {
      setError("❌ Aún no hay token disponible. Inicia sesión primero.");
    }
  }, [fetchRandomSongs, getAuthToken]);

  // Función para formatear duración
  const formatDuration = useCallback((seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calcular estadísticas
  const totalDuration = songs.reduce((sum, song) => sum + (song.duration || 0), 0);
  const artists = [...new Set(songs.map(song => song.artist).filter(Boolean))];
  const genres = [...new Set(songs.map(song => song.genre).filter(Boolean))];

  return { 
    // Estado
    songs, 
    loading, 
    error, 
    isAuthenticated,
    
    // Métodos
    refresh: fetchRandomSongs,
    retryAuth: retryWithCurrentToken,
    clearError: () => setError(null),
    formatDuration,
    
    // Propiedades calculadas
    hasSongs: songs.length > 0,
    totalSongs: songs.length,
    totalDuration,
    formattedTotalDuration: formatDuration(totalDuration),
    artists,
    genres,
    artistsCount: artists.length,
    genresCount: genres.length,
    
    // Funciones de filtrado
    getSongsByArtist: (artist) => songs.filter(s => s.artist === artist),
    getSongsByGenre: (genre) => songs.filter(s => s.genre === genre),
    
    // Estado compuesto para UI
    isEmpty: songs.length === 0 && !loading && !error,
    showLoading: loading && songs.length === 0,
    showError: error && !loading,
    showContent: !loading && !error && songs.length > 0
  };
};

export default useRandomSongs;