import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import {
  Pause,
  PlayArrow,
  ChevronLeft,
  ChevronRight,
  Favorite,
  Share,
  MusicNote
} from "@mui/icons-material";

const ArtistCarouselReact = () => {
  const [artists, setArtists] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const autoPlayRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const totalSlides = artists.length;

  useEffect(() => {
    autoPlayRef.current = nextSlide;
  });

  useEffect(() => {
    const play = () => autoPlayRef.current();
    if (isAutoPlay && totalSlides > 0) {
      const interval = setInterval(play, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, totalSlides]);

  // Función para obtener artistas desde la API
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        // Esta sería la llamada a tu API real
        // const response = await fetch('/api/artists/featured/');
        // const data = await response.json();
        // setArtists(data);
        
        // Simulando una respuesta de API con un delay
        setTimeout(() => {
          const mockArtists = [
            {
              id: 1,
              name: "sita richi",
              genre: "gozpel",
              followers: "1.2M",
              bio: "Cantante y compositora con más de 10 millones de streams en plataformas digitales. Su último álbum 'Dreams' ha sido aclamado por la crítica especializada y cuenta con colaboraciones internacionales.",
              image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 2,
              name: "ngal madounga",
              genre: "afro beats",
              followers: "850K",
              bio: "Banda de rock con una fusión única de sonidos latinos y rock clásico. Han recorrido más de 15 países en su última gira mundial 'Horizons', recibiendo elogios por sus energéticas presentaciones en vivo.",
              image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 3,
              name: "angel glamour",
              genre: "afro beats",
              followers: "2.1M",
              bio: "Voz principal del reconocido grupo 'Soul Harmony'. Con una voz que evoca a las grandes divas del jazz, María ha revolucionado la escena musical local y se presenta regularmente en los festivales más importantes del país.",
              image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            },
            {
              id: 4,
              name: "titoy bolabote",
              genre: "musica tradicional buby",
              followers: "1.8M",
              bio: "Productor musical y DJ con más de 50 releases en sellos internacionales. Conocido por sus sets energéticos y su sonido característico, ha compartido escenario con los artistas más importantes de la escena electrónica mundial.",
              image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
            },
          ];
          setArtists(mockArtists);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Error al cargar los artistas");
        setLoading(false);
        console.error("Error fetching artists:", err);
      }
    };

    fetchArtists();
  }, []);

  const nextSlide = () => {
    if (totalSlides > 0) {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }
  };

  const prevSlide = () => {
    if (totalSlides > 0) {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const goToSlide = (index) => {
    if (totalSlides > 0) {
      setCurrentIndex(index);
    }
  };

  if (error) {
    return (
      <Box sx={{ width: "90%", margin: "0 auto", textAlign: "center", py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "90%", margin: "0 auto", textAlign: "center", py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Nuestros Artistas Destacados
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[...Array(2)].map((_, idx) => (
            <Card key={idx} sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
              <Skeleton variant="rectangular" width="100%" height={300} sx={{ flex: 1 }} />
              <CardContent sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="40%" height={30} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="circular" width={40} height={40} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : artists.length === 0 ? (
        <Typography>No hay artistas disponibles</Typography>
      ) : (
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            {artists.map((artist, idx) => (
              <Card
                key={artist.id}
                sx={{
                  minWidth: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  borderRadius: 0,
                }}
              >
                <Box sx={{ position: "relative", flex: 1, minHeight: { xs: 300, md: 400 } }}>
                  <img
                    src={artist.image}
                    alt={artist.name}
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      filter: "brightness(0.9)"
                    }}
                  />
                  <Chip
                    label={`${artist.followers} seguidores`}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      backgroundColor: alpha(theme.palette.primary.main, 0.85),
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <CardContent sx={{ 
                  flex: 1, 
                  textAlign: "left", 
                  display: "flex", 
                  flexDirection: "column",
                  justifyContent: "center",
                  py: 4 
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {artist.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 500 }}>
                    {artist.genre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {artist.bio}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton color="primary" sx={{ bgcolor: "primary.light" }}>
                      <Favorite />
                    </IconButton>
                    <IconButton color="primary" sx={{ bgcolor: "primary.light" }}>
                      <MusicNote />
                    </IconButton>
                    <IconButton color="primary" sx={{ bgcolor: "primary.light" }}>
                      <Share />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Botones de navegación */}
          {artists.length > 1 && (
            <>
              <IconButton
                onClick={prevSlide}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 8,
                  transform: "translateY(-50%)",
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "white"
                  }
                }}
                size="large"
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={nextSlide}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 8,
                  transform: "translateY(-50%)",
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "white"
                  }
                }}
                size="large"
              >
                <ChevronRight />
              </IconButton>

              {/* Autoplay toggle */}
              <IconButton
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                sx={{ 
                  position: "absolute", 
                  top: 16, 
                  right: 16, 
                  bgcolor: "background.paper",
                  boxShadow: 2,
                }}
              >
                {isAutoPlay ? <Pause /> : <PlayArrow />}
              </IconButton>

              {/* Indicadores */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: alpha("#000", 0.4),
                  borderRadius: 2,
                  px: 1,
                  py: 0.5
                }}
              >
                {artists.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: idx === currentIndex ? "primary.main" : "grey.400",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: idx === currentIndex ? "primary.dark" : "grey.500"
                      }
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ArtistCarouselReact;