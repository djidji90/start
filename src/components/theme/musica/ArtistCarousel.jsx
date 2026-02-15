import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Fade
} from "@mui/material";
import {
  Favorite,
  MusicNote,
  Share
} from "@mui/icons-material";

const ArtistCarousel = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const scrollContainerRef = useRef(null);
  const theme = useTheme();

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
              name: "Mr.o",
              genre: "hip hop",
              followers: "850K",
              bio: "absoluta leyenda urbana, uno de los raperos más influyentes de nuestra historia sin lugar a dudas.",
              image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 3,
              name: "romy solo",
              genre: "afro beats",
              followers: "2.1M",
              bio: "romi, es seguramente si no el mejor,uno de las mejores y más talentosos artistas del panorama musical guineano'.",
              image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 4,
              name: "titoy bolabote",
              genre: "musica tradicional buby",
              followers: "1.8M",
              bio: "artista y compositor natural de baney, carracterisco por sus ritmos alegres y pegajosos.",
              image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
            },
            {
              id: 5,
              name: "el esperado",
              genre: "hip hop",
              followers: "3.5M",
              bio: "joven Rapero y productor con un flow crudo y underground que relata historias reales del día a día en las calles de malabo.",
              image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 6,
              name: "Teddy bala",
              genre: "afrobeeat",
              followers: "4.2M",
              bio: "artista de r&b y afro-beat conocido por su voz , agradable y sus colaboraciones con algunos de los mejores artistas de nuestra epoca.",
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

  if (loading) {
    return (
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Artistas Destacados
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
        Artistas Destacados
      </Typography>

      {/* Contenedor con scroll vertical NATIVO - sin auto-scroll */}
      <Box
        ref={scrollContainerRef}
        sx={{
          height: "500px",
          overflowY: "auto",
          overflowX: "hidden",
          // Scrollbar elegante pero visible
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "4px", // Más delgado en móvil
          },
          "&::-webkit-scrollbar-track": {
            background: alpha(theme.palette.primary.main, 0.05),
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(theme.palette.primary.main, 0.3),
            borderRadius: "10px",
            "&:hover": {
              background: alpha(theme.palette.primary.main, 0.5),
            }
          },
          // Mejor experiencia táctil
          WebkitOverflowScrolling: "touch",
          // Indicador visual de que hay más contenido
          position: "relative",
        }}
      >
        {/* Gradiente inferior para indicar scroll */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40px",
            background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.9)}, transparent)`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pr: 1, pb: 2 }}>
          {artists.map((artist) => (
            <Card
              key={artist.id}
              onMouseEnter={() => setHoveredCard(artist.id)}
              onMouseLeave={() => setHoveredCard(null)}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                transition: "all 0.2s ease",
                // Efecto sutil al presionar en móvil
                "&:active": {
                  transform: "scale(0.98)",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
                // Hover solo en desktop (no interfiere en móvil)
                "@media (hover: hover)": {
                  "&:hover": {
                    transform: "scale(1.01)",
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                  }
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
                      height: 20,
                      backdropFilter: "blur(4px)"
                    }}
                  />
                </Box>

                {/* Contenido */}
                <CardContent sx={{ 
                  flex: 1, 
                  p: 1.5, // Padding reducido en móvil
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center"
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 0.3, 
                      lineHeight: 1.2,
                      fontSize: "0.9rem"
                    }}
                  >
                    {artist.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mb: 0.5, 
                      fontWeight: 500,
                      color: theme.palette.primary.main,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      fontSize: "0.65rem"
                    }}
                  >
                    {artist.genre}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "0.7rem"
                    }}
                  >
                    {artist.bio}
                  </Typography>
                </CardContent>
              </Box>

              {/* Acciones - más compactas en móvil */}
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-around", 
                py: 0.5,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.8)
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                  <Favorite sx={{ color: "text.secondary", fontSize: 14 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                    Me gusta
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                  <MusicNote sx={{ color: "text.secondary", fontSize: 14 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                    Música
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                  <Share sx={{ color: "text.secondary", fontSize: 14 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                    Compartir
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
      
      {/* Indicador sutil de scroll */}
      <Fade in timeout={1000}>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            textAlign: 'center', 
            mt: 1,
            color: alpha(theme.palette.text.secondary, 0.6),
            fontSize: '0.6rem'
          }}
        >
          Desliza hacia abajo para ver más artistas ↓
        </Typography>
      </Fade>
    </Box>
  );
};

export default ArtistCarousel;