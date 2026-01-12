// src/hooks/useRandomSongs.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAudioPlayer } from '../../../components/hook/services/usePlayer';

export const useRandomSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const player = useAudioPlayer();

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || 
             localStorage.getItem('token') || 
             localStorage.getItem('auth_token');
    }
    return null;
  };

  const fetchRandomSongs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.get(
        'https://api.djidjimusic.com/api2/songs/random/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const transformedSongs = response.data.random_songs.map(song => ({
        ...song,
        id: song.id,
        title: song.title || 'Sin título',
        artist: song.artist || 'Artista desconocido',
        genre: song.genre || 'Sin género',
        duration: song.duration || 180,
        url: song.url || '',
        cover_image: song.cover_image || '',
      }));

      setSongs(transformedSongs);
      
    } catch (err) {
      console.error('Error fetching random songs:', err);
      
      let errorMessage = 'Error al obtener canciones aleatorias';
      
      if (err.response?.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (err.response?.status === 404) {
        errorMessage = 'No hay canciones disponibles en este momento.';
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const playSong = useCallback(async (song) => {
    try {
      const songForPlayer = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        duration: song.duration,
        url: song.url,
        cover_image: song.cover_image,
        album: song.album,
      };
      
      await player.playSongFromCard(songForPlayer);
    } catch (err) {
      console.error('Error playing song:', err);
    }
  }, [player]);

  useEffect(() => {
    fetchRandomSongs();
  }, [fetchRandomSongs]);

  return {
    songs,
    loading,
    error,
    refetch: fetchRandomSongs,
    playSong,
    getSongStatus: player.getSongStatus,
  };
};