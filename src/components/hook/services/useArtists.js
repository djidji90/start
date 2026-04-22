// src/hooks/useArtists.js
import { useState, useEffect } from 'react';

const CACHE_KEY = 'djidji_artists_v4';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
const API_URL = 'https://api.djidjimusic.com/musica/api/artistas/';

const useArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, verified: 0 });

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Verificar caché
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp, stats: cachedStats } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('📦 Artistas desde caché');
            setArtists(data);
            setStats(cachedStats);
            setLoading(false);
            return;
          }
        }

        // 2. Fetch desde API
        console.log('🌐 Fetching artistas desde API...');
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        const artistsList = data.results || data;
        
        // 3. Calcular estadísticas
        const verified = artistsList.filter(a => a.is_verified).length;
        const statsData = {
          total: artistsList.length,
          verified,
          unverified: artistsList.length - verified,
        };

        console.log(`✅ ${artistsList.length} artistas cargados (${verified} verificados)`);

        // 4. Guardar en caché
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: artistsList,
          stats: statsData,
          timestamp: Date.now()
        }));

        setArtists(artistsList);
        setStats(statsData);

      } catch (err) {
        console.error('❌ Error fetching artists:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const refetch = () => {
    localStorage.removeItem(CACHE_KEY);
    window.location.reload();
  };

  return { artists, loading, error, stats, refetch };
};

export default useArtists;