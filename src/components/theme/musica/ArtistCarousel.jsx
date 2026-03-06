import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Fade,
  IconButton,
  Zoom,
  Button,
  Divider,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Share,
  LocationOn,
  Verified,
} from "@mui/icons-material";
import { motion } from "framer-motion";

// --- CONSTANTES ---
const IMAGE_HEIGHT = 160;
const IMAGE_HEIGHT_EXPANDED = 200;
const SKELETON_COUNT = 4;

// --- COMPONENTE ARTIST CARD MEMOIZADO ---
const ArtistCard = React.memo(({ artist, isExpanded, onToggleExpand }) => {
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggleExpand(artist.id);
    }
  }, [artist.id, onToggleExpand]);

  const handleLikeClick = useCallback((e) => {
    e.stopPropagation();
    setIsLiked(prev => !prev);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onToggleExpand(artist.id)}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-label={`Ver biografía de ${artist.name}`}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: isExpanded
            ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
            : `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
          "&:hover": {
            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
            transform: "translateY(-2px)",
            "@media (hover: hover)": {
              transform: "translateY(-4px)",
            },
          },
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }}
      >
        {/* Imagen con zoom al hover */}
        <Box
          sx={{
            position: "relative",
            height: isExpanded ? IMAGE_HEIGHT_EXPANDED : IMAGE_HEIGHT,
            transition: "height 0.3s ease",
            overflow: "hidden",
          }}
        >
          <motion.img
            src={`${artist.image}?w=600&q=80`}
            alt={artist.name}
            loading="lazy"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Gradiente sobre la imagen */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.7)} 0%, transparent 50%)`,
            }}
          />

          {/* Metadata superior - solo género */}
          <Box sx={{ 
            position: "absolute", 
            top: 12, 
            left: 12, 
            zIndex: 1
          }}>
            <Chip
              label={artist.genre}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.9),
                color: "white",
                fontWeight: 600,
                fontSize: "0.65rem",
                height: 22,
                backdropFilter: "blur(4px)",
              }}
            />
          </Box>

          {/* Seguidores y verificado */}
          <Box sx={{ 
            position: "absolute", 
            bottom: 12, 
            right: 12, 
            display: "flex", 
            alignItems: "center", 
            gap: 0.5,
            zIndex: 1
          }}>
            {artist.verified && (
              <Verified sx={{ 
                color: theme.palette.info.main, 
                fontSize: 16, 
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" 
              }} />
            )}
            <Chip
              label={artist.followers}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.common.black, 0.7),
                color: "white",
                fontWeight: 600,
                fontSize: "0.65rem",
                height: 22,
                backdropFilter: "blur(4px)",
              }}
            />
          </Box>

          {/* Avatar circular */}
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: 12,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `3px solid ${theme.palette.background.paper}`,
              overflow: "hidden",
              boxShadow: theme.shadows[3],
              zIndex: 2,
            }}
          >
            <img
              src={artist.avatar || artist.image}
              alt={`Avatar de ${artist.name}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </Box>

          {/* Nombre del artista */}
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              bottom: 12,
              left: 80,
              right: 70,
              color: "white",
              fontWeight: 700,
              fontSize: "1.1rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            {artist.name}
          </Typography>
        </Box>

        <CardContent sx={{ 
          p: 2, 
          pb: 1.5, 
          pt: 4
        }}>
          {/* BIO (truncada a 2 líneas) */}
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 400,
              lineHeight: 1.5,
              color: theme.palette.text.primary,
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}
          >
            {artist.bio}
          </Typography>

          {/* Frase destacada (opcional) */}
          {artist.tagline && !isExpanded && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 500,
                fontStyle: "italic",
                display: "block",
                mb: 1.5,
              }}
            >
              "{artist.tagline}"
            </Typography>
          )}

          {/* Acciones: solo like y share */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 1
          }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleLikeClick}
                aria-label={isLiked ? "Quitar like" : "Dar like"}
                sx={{ color: isLiked ? theme.palette.error.main : theme.palette.text.secondary }}
              >
                {isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: theme.palette.text.secondary }}
                aria-label="Compartir"
              >
                <Share fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* EXPANSIÓN: Solo biografía completa y ciudad */}
          <Zoom in={isExpanded} timeout={300}>
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              
              {/* Biografía completa */}
              <Typography 
                variant="body2" 
                sx={{ 
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                  mb: 2,
                }}
              >
                {artist.fullBio || artist.bio}
              </Typography>

              {/* Solo ciudad (contexto geográfico neutral) */}
              {artist.city && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    icon={<LocationOn sx={{ fontSize: '14px' }} />}
                    label={artist.city}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
              )}
            </Box>
          </Zoom>

          {/* Botón "Ver más" / "Ver menos" */}
          <Button
            fullWidth
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(artist.id);
            }}
            sx={{
              mt: 1,
              color: theme.palette.primary.main,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }
            }}
          >
            {isExpanded ? '← Ver menos' : 'Ver biografía completa →'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ArtistCard.displayName = "ArtistCard";

// --- COMPONENTE PRINCIPAL ---
const ArtistCarousel = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef(null);
  const theme = useTheme();

  const handleToggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // Ocultar hint de scroll después de que el usuario hace scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 10) {
        setShowScrollHint(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch de artistas
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          const mockArtists = [
            {
              id: 1,
              name: "Sita Richi",
              genre: "Gospel",
              followers: "1.2M",
              city: "Malabo",
              verified: true,
              tagline: "La voz que inspira a una generación",
              bio: "Cantante y compositora con más de 10 millones de streams en plataformas digitales. Su música fusiona gospel con ritmos locales.",
              fullBio: "Sita Richi comenzó su carrera en el coro de su iglesia en Malabo a los 12 años. Su talento innato y su voz prodigiosa la llevaron a grabar su primer álbum 'Fe y Esperanza' en 2015, que se convirtió en un éxito instantáneo en Guinea Ecuatorial. Desde entonces, ha lanzado 4 álbumes de estudio, ha realizado giras por toda África Central y ha colaborado con artistas de toda la región. Su música no solo entretiene, sino que también lleva un mensaje de esperanza y unidad para toda África. Es considerada una de las voces más importantes del gospel africano contemporáneo.",
              image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
              avatar: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=150&h=150&fit=crop",
            },
            {
              id: 2,
              name: "Mr. O",
              genre: "Hip Hop",
              followers: "850K",
              city: "Malabo",
              verified: true,
              tagline: "Leyenda viva del rap",
              bio: "Absoluta leyenda urbana, uno de los raperos más influyentes de nuestra historia. Sus letras crudas y realistas han marcado a toda una generación.",
              fullBio: "Mr. O irrumpió en la escena del hip hop guineano hace ya varios años. Creció en las calles de Malabo pero actualmente reside en España. Sus letras reflejan las realidades de la vida urbana en Guinea Ecuatorial. Ha lanzado varios álbumes y ha colaborado con artistas de Europa y África. Es conocido por hacer un rap consciente e intelectual. Sus temas son conocidos por la energía y la conexión con el público, y sigue siendo una figura fundamental en la escena underground de Guinea Ecuatorial.",
              image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
              avatar: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=150&h=150&fit=crop",
            },
            {
              id: 3,
              name: "Romy Solo",
              genre: "Afro Beats",
              followers: "2.1M",
              city: "Malabo",
              verified: true,
              tagline: "El ritmo que mueve África",
              bio: "Romi es uno de los artistas más talentosos del panorama musical guineano. Su fusión de afro beats con ritmos tradicionales crea una experiencia única.",
              fullBio: "Romy Solo comenzó a cantar siendo muy joven, antes de lanzar el mixtape que le hizo popular. Su mezcla única de afrobeat con ritmos tradicionales de Guinea Ecuatorial le ha valido el reconocimiento en toda África. Su mixtape 'My Guinea' se ha convertido en todo un himno que celebra nuestra patria y nuestra diversidad cultural. Su estilo ha influenciado a una nueva generación de artistas que buscan fusionar sonidos tradicionales africanos con géneros contemporáneos.",
              image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa",
              avatar: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=150&h=150&fit=crop",
            },
            {
              id: 4,
              name: "Titoy Bolabote",
              genre: "Tradicional",
              followers: "1.8M",
              city: "Baney",
              verified: true,
              tagline: "Guardián de la tradición",
              bio: "Artista natural de Baney, caracterizado por sus ritmos alegres que fusionan la música tradicional con sonidos contemporáneos.",
              fullBio: "Titoy Bolabote aprendió los ritmos tradicionales de su abuelo, un reconocido cantante de la comunidad. Ha dedicado su carrera a preservar y modernizar la música tradicional de Bioko, incorporando instrumentos autóctonos en producciones modernas. Ha recibido reconocimientos del Ministerio de Cultura por su labor de preservación cultural. Es considerado un embajador cultural de la isla de Bioko y sus canciones son una celebración de la identidad local.",
              image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
              avatar: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=150&h=150&fit=crop",
            },
            {
              id: 5,
              name: "El Esperado",
              genre: "Hip Hop",
              followers: "3.5M",
              city: "Malabo",
              verified: true,
              tagline: "La voz de la nueva generación",
              bio: "Joven rapero con un flow crudo que relata historias reales del día a día en las calles de Malabo. Su autenticidad le ha valido el reconocimiento.",
              fullBio: "A pesar de ser todavía muy joven, El Esperado se ha convertido en el referente del hip hop joven en Guinea Ecuatorial. Sus videoclips grabados en las calles de Malabo acumulan miles de vistas en YouTube. Sus temas tales como 'Mente Guineana' o 'La Música' están entre las pistas que no pueden faltar en mi celular. Es conocido por sus letras que hablan de la realidad social y las aspiraciones de la juventud guineana. Representa la nueva ola del hip hop consciente en la región.",
              image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
              avatar: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
            },
            {
              id: 6,
              name: "Teddy Bala",
              genre: "Afrobeat",
              followers: "4.2M",
              city: "Bata",
              verified: true,
              tagline: "La voz de seda",
              bio: "Artista de R&B y afro-beat conocido por su voz agradable y sus colaboraciones con algunos de los mejores artistas de nuestra época.",
              fullBio: "Teddy Bala es un joven artista residente en Bata, Guinea Ecuatorial. Su mixtape 'Marihuana' junto a 'Atasco' revolucionó la escena del R&B local. Su voz suave y sus letras en las que mezcla el inglés con el español le han valido el apodo de 'La voz de seda'. Ha colaborado con artistas nigerianos, cameruneses y guineanos. Su tema 'Only One' con Zagadem es uno de los más reproducidos en la historia de la música guineana. Es conocido por fusionar el R&B con ritmos africanos de una manera única y auténtica.",
              image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2",
              avatar: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=150&h=150&fit=crop",
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
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>
          Artistas Destacados
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[...Array(SKELETON_COUNT)].map((_, idx) => (
            <Skeleton 
              key={idx} 
              variant="rounded" 
              height={280} 
              sx={{ borderRadius: 3 }} 
              animation="wave"
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 800,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block",
        }}
      >
        Artistas Destacados
      </Typography>

      {/* Contenedor con SCROLL VERTICAL */}
      <Box
        ref={scrollContainerRef}
        sx={{
          height: "580px",
          overflowY: "auto",
          overflowX: "hidden",
          pr: 1,
          position: "relative",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "4px",
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
          WebkitOverflowScrolling: "touch",
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
            background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.95)}, transparent)`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 2, 
          pb: 2 
        }}>
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              isExpanded={expandedId === artist.id}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </Box>
      </Box>

      {/* Hint de scroll */}
      <Fade in={showScrollHint} timeout={1000}>
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            mt: 2,
            color: alpha(theme.palette.text.secondary, 0.6),
          }}
        >
          <span>↓</span> Desliza hacia abajo para ver más artistas ({artists.length} disponibles) <span>↓</span>
        </Typography>
      </Fade>

      {/* Instrucción final */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          mt: 1,
          color: alpha(theme.palette.text.secondary, 0.4),
        }}
      >
        Toca "Ver biografía completa" para leer la historia del artista
      </Typography>
    </Box>
  );
};

export default ArtistCarousel;