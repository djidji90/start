// src/components/hook/services/useArtists.js (VERSIÓN FINAL)
import { useState, useEffect } from 'react';

const useArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);

        const response = await fetch('https://api.djidjimusic.com/api2/songs/?page=1');
        
        if (!response.ok) {
          throw new Error('Error al cargar artistas');
        }

        const data = await response.json();

        // ✅ CORREGIDO: Usar ID como clave (ES ÚNICO)
        const artistsMap = new Map();

        // Procesar primera página
        data.results.forEach(song => {
          if (song.uploaded_by?.id) {  // Verificar que existe ID
            const userId = song.uploaded_by.id;
            const username = song.uploaded_by.username;

            if (!artistsMap.has(userId)) {  // ← USAR ID COMO CLAVE
              artistsMap.set(userId, {
                id: userId,
                username: username,
                name: song.uploaded_by.full_name || username,
                avatar_url: song.uploaded_by.profile?.avatar_url || null,
                songs_count: 1,
                bio: song.uploaded_by.profile?.bio || null,
                location: song.uploaded_by.profile?.location || null,
                date_joined: song.uploaded_by.date_joined
              });
            } else {
              const existing = artistsMap.get(userId);
              existing.songs_count += 1;
              artistsMap.set(userId, existing);
            }
          }
        });

        // Procesar páginas adicionales
        let nextUrl = data.next;
        while (nextUrl) {
          const nextResponse = await fetch(nextUrl);
          const nextData = await nextResponse.json();

          nextData.results.forEach(song => {
            if (song.uploaded_by?.id) {
              const userId = song.uploaded_by.id;
              const username = song.uploaded_by.username;

              if (!artistsMap.has(userId)) {
                artistsMap.set(userId, {
                  id: userId,
                  username: username,
                  name: song.uploaded_by.full_name || username,
                  avatar_url: song.uploaded_by.profile?.avatar_url || null,
                  songs_count: 1,
                  bio: song.uploaded_by.profile?.bio || null,
                  location: song.uploaded_by.profile?.location || null,
                  date_joined: song.uploaded_by.date_joined
                });
              } else {
                const existing = artistsMap.get(userId);
                existing.songs_count += 1;
                artistsMap.set(userId, existing);
              }
            }
          });

          nextUrl = nextData.next;
        }

        // Convertir a array y ordenar
        const artistsArray = Array.from(artistsMap.values())
          .sort((a, b) => b.songs_count - a.songs_count)
          .slice(0, 12);

        console.log('✅ Artistas cargados (por ID):', artistsArray);
        
        setArtists(artistsArray);
        setError(null);

      } catch (err) {
        console.error('❌ Error fetching artists:', err);
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