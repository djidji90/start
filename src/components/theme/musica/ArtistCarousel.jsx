import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import {
  Favorite,
  MusicNote,
  Share
} from "@mui/icons-material";

const ArtistCarouselReact = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Función para obtener artistas desde la API
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        
        // Simulando una respuesta de API
        setTimeout(() => {
          const mockArtists = [
            {
              id: 1,
              name: "sita richi",
              genre: "gozpel",
              followers: "1.2M",
              bio: "Cantante y compositora con más de 10 millones de streams en plataformas digitales.",
              image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 2,
              name: "ngal madounga",
              genre: "afro beats",
              followers: "850K",
              bio: "Banda de rock con una fusión única de sonidos latinos y rock clásico.",
              image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 3,
              name: "angel glamour",
              genre: "afro beats",
              followers: "2.1M",
              bio: "Voz principal del reconocido grupo 'Soul Harmony'.",
              image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 4,
              name: "titoy bolabote",
              genre: "musica tradicional buby",
              followers: "1.8M",
              bio: "Productor musical y DJ con más de 50 releases en sellos internacionales.",
              image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
            },
            {
              id: 5,
              name: "Dani Dmas",
              genre: "hip hop",
              followers: "3.5M",
              bio: "Rapero y productor pionero del movimiento underground.",
              image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 6,
              name: "La Bella",
              genre: "reggaeton",
              followers: "4.2M",
              bio: "Reina del reggaeton latino, con colaboraciones internacionales.",
              image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
          ];
          setArtists(mockArtists);
          setLoading(false);
        }, 800);
      } catch (err) {
        setLoading(false);
        console.error("Error fetching artists:", err);
      }
    };

    fetchArtists();
  }, []);

  // Auto-scroll vertical mecánico (sin controles)
  useEffect(() => {
    if (!scrollContainerRef.current || artists.length === 0) return;

    const container = scrollContainerRef.current;
    let animationFrameId;
    let lastTime = 0;
    const speed = 0.6; // Velocidad fija para móvil

    const scrollVertical = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 16) {
        container.scrollTop += speed * (deltaTime / 16);
        
        // Reiniciar scroll si llega al final
        if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
          container.scrollTop = 0;
        }
        
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(scrollVertical);
    };

    animationFrameId = requestAnimationFrame(scrollVertical);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [artists.length]);

  if (loading) {
    return (
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Artistas
        </Typography>
        <Box sx={{ display: "flex", overflowX: "auto", gap: 2, pb: 2 }}>
          {[...Array(4)].map((_, idx) => (
            <Box key={idx} sx={{ minWidth: 150 }}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Artistas
      </Typography>

      {/* Contenedor con scroll vertical automático */}
      <Box
        ref={scrollContainerRef}
        sx={{
          height: "500px",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none"
          },
          WebkitOverflowScrolling: "touch"
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {artists.map((artist) => (
            <Card
              key={artist.id}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                transition: "transform 0.2s ease",
                "&:active": {
                  transform: "scale(0.98)"
                }
              }}
            >
              <Box sx={{ display: "flex", height: 120 }}>
                {/* Imagen del artista */}
                <Box sx={{ width: 120, flexShrink: 0, position: "relative" }}>
                  <img
                    src={artist.image}
                    alt={artist.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                  <Chip
                    label={artist.followers}
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      backgroundColor: alpha(theme.palette.primary.main, 0.9),
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                      height: 20
                    }}
                  />
                </Box>

                {/* Contenido */}
                <CardContent sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                    {artist.name}
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ mb: 1, fontWeight: 500 }}>
                    {artist.genre}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {artist.bio}
                  </Typography>
                </CardContent>
              </Box>

              {/* Acciones (pequeñas en móvil) */}
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-around", 
                py: 1,
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Favorite fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary">Me gusta</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MusicNote fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary">Música</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Share fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary">Compartir</Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ArtistCarouselReact;