// src/hooks/useArtistDetail.js
import { useState, useEffect } from 'react';

const CACHE_PREFIX = 'djidji_artist_v3_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const API_BASE = 'https://api.djidjimusic.com/musica/api/artistas';

const useArtistDetail = (slug) => {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('No se proporcionó slug');
      return;
    }

    const fetchArtist = async () => {
      try {
        setLoading(true);
        setError(null);

        const cacheKey = `${CACHE_PREFIX}${slug}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
              console.log(`📦 Artista "${slug}" desde caché`);
              setArtist(data);
              setLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem(cacheKey);
          }
        }

        // 🆕 URL CORRECTA con /profile/
        console.log(`🌐 Fetching artista "${slug}" desde API...`);
        const response = await fetch(`${API_BASE}/${slug}/profile/`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Artista no encontrado');
          }
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Perfil cargado:`, {
          nombre: data.full_name || data.username,
          canciones: data.songs?.length || 0,
          stats: data.stats
        });
        
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));

        setArtist(data);
      } catch (err) {
        console.error('❌ Error fetching artist:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [slug]);

  const refetch = () => {
    const cacheKey = `${CACHE_PREFIX}${slug}`;
    localStorage.removeItem(cacheKey);
    window.location.reload();
  };

  return { artist, loading, error, refetch };
};

export default useArtistDetail;