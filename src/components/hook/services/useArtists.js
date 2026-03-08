// src/components/hook/services/useArtists.js
import { useState, useEffect } from 'react';

/**
 * Hook para obtener artistas (usuarios) únicos desde el endpoint de canciones
 * @returns {Object} { artists, loading, error }
 */
const useArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener primera página
        const response = await fetch('https://api.djidjimusic.com/api2/songs/?page=1');
        
        if (!response.ok) {
          throw new Error('Error al cargar artistas');
        }

        const data = await response.json();
        
        // 2. Mapa para artistas únicos (usando username como clave)
        const artistsMap = new Map();
        
        // 3. Procesar resultados actuales
        data.results.forEach(song => {
          if (song.uploaded_by?.username) {
            const username = song.uploaded_by.username;
            
            if (!artistsMap.has(username)) {
              // ✅ CORREGIDO: Usamos uploaded_by para el nombre
              artistsMap.set(username, {
                id: song.uploaded_by.id,
                username: username,
                // Prioridad: full_name > username
                name: song.uploaded_by.full_name || username,
                avatar_url: song.uploaded_by.profile?.avatar_url || null,
                songs_count: 1,
                // Información adicional útil
                bio: song.uploaded_by.profile?.bio || null,
                location: song.uploaded_by.profile?.location || null,
                date_joined: song.uploaded_by.date_joined
              });
            } else {
              // Incrementar contador de canciones
              const existing = artistsMap.get(username);
              existing.songs_count += 1;
              artistsMap.set(username, existing);
            }
          }
        });

        // 4. Si hay más páginas, procesarlas
        let nextUrl = data.next;
        while (nextUrl) {
          const nextResponse = await fetch(nextUrl);
          const nextData = await nextResponse.json();
          
          nextData.results.forEach(song => {
            if (song.uploaded_by?.username) {
              const username = song.uploaded_by.username;
              
              if (!artistsMap.has(username)) {
                artistsMap.set(username, {
                  id: song.uploaded_by.id,
                  username: username,
                  name: song.uploaded_by.full_name || username,
                  avatar_url: song.uploaded_by.profile?.avatar_url || null,
                  songs_count: 1,
                  bio: song.uploaded_by.profile?.bio || null,
                  location: song.uploaded_by.profile?.location || null,
                  date_joined: song.uploaded_by.date_joined
                });
              } else {
                const existing = artistsMap.get(username);
                existing.songs_count += 1;
                artistsMap.set(username, existing);
              }
            }
          });
          
          nextUrl = nextData.next;
        }

        // 5. Convertir mapa a array y ordenar por número de canciones
        const artistsArray = Array.from(artistsMap.values())
          .sort((a, b) => b.songs_count - a.songs_count)
          .slice(0, 12); // Limitar a 12 artistas

        setArtists(artistsArray);
        setError(null);

      } catch (err) {
        console.error('Error fetching artists:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return { artists, loading, error };
};

export default useArtists;