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
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  MusicNote,
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
        aria-label={`Ver perfil de ${artist.name}`}
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

          {/* Metadata superior */}
          <Box sx={{ 
            position: "absolute", 
            top: 12, 
            left: 12, 
            right: 12,
            display: "flex", 
            gap: 0.5, 
            flexWrap: "wrap",
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
            {artist.city && (
              <Chip
                icon={<LocationOn sx={{ fontSize: "12px !important", color: "white" }} />}
                label={artist.city}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.common.black, 0.6),
                  color: "white",
                  fontSize: "0.65rem",
                  height: 22,
                  backdropFilter: "blur(4px)",
                  "& .MuiChip-icon": { ml: 0.5 },
                }}
              />
            )}
            {artist.rank && (
              <Chip
                label={`🔥 #${artist.rank} en ${artist.city || "tu ciudad"}`}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.warning.main, 0.9),
                  color: "white",
                  fontSize: "0.65rem",
                  height: 22,
                  backdropFilter: "blur(4px)",
                }}
              />
            )}
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

          {/* Avatar circular (opcional) */}
          {artist.avatar && (
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
                src={artist.avatar}
                alt={`Avatar de ${artist.name}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </Box>
          )}

          {/* Nombre del artista */}
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              bottom: 12,
              left: artist.avatar ? 80 : 12,
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
          pt: artist.avatar ? 4 : 2
        }}>
          {/* BIO - Ahora más visible */}
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 400,
              lineHeight: 1.5,
              color: theme.palette.text.primary,
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: isExpanded ? "unset" : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}
          >
            {artist.bio}
          </Typography>

          {/* Frase destacada y acciones */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mt: 1 
          }}>
            {artist.tagline && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  fontStyle: "italic",
                  maxWidth: "60%",
                }}
              >
                "{artist.tagline}"
              </Typography>
            )}

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
                aria-label="Ver música"
              >
                <MusicNote fontSize="small" />
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

          {/* Expansión con más información */}
          <Zoom in={isExpanded} timeout={300}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {artist.stats?.songs || 24} canciones • {artist.stats?.albums || 3} álbumes
              </Typography>
              <Chip
                label="Ver perfil completo"
                size="small"
                clickable
                component="a"
                href={`/artist/${artist.id}`}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                }}
              />
            </Box>
          </Zoom>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ArtistCard.displayName = "ArtistCard";

// --- COMPONENTE PRINCIPAL CON SCROLL VERTICAL ---
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
              rank: 1,
              tagline: "La voz que inspira a una generación",
              bio: "Cantante y compositora con más de 10 millones de streams en plataformas digitales. Su música fusiona gospel con ritmos locales, creando un sonido único que ha traspasado fronteras. Ha colaborado con artistas internacionales y llevado la música guineana a escenarios de todo el mundo.",
              image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
              avatar: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=150&h=150&fit=crop",
              stats: { songs: 34, albums: 4 }
            },
            {
              id: 2,
              name: "Mr. O",
              genre: "Hip Hop",
              followers: "850K",
              city: "Bata",
              verified: true,
              rank: 2,
              tagline: "Leyenda viva del rap",
              bio: "Absoluta leyenda urbana, uno de los raperos más influyentes de nuestra historia sin lugar a dudas. Sus letras crudas y realistas han marcado a toda una generación, narrando las historias de la calle con una autenticidad inigualable.",
              image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
              avatar: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=150&h=150&fit=crop",
              stats: { songs: 52, albums: 7 }
            },
            {
              id: 3,
              name: "Romy Solo",
              genre: "Afro Beats",
              followers: "2.1M",
              city: "Malabo",
              verified: true,
              rank: 3,
              tagline: "El ritmo que mueve África",
              bio: "Romi es seguramente si no el mejor, uno de las mejores y más talentosos artistas del panorama musical guineano. Su fusión de afro beats con ritmos tradicionales bubis crea una experiencia única que ha conquistado a audiencias de toda África Central.",
              image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa",
              avatar: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=150&h=150&fit=crop",
              stats: { songs: 41, albums: 5 }
            },
            {
              id: 4,
              name: "Titoy Bolabote",
              genre: "Música Tradicional",
              followers: "1.8M",
              city: "Baney",
              verified: true,
              rank: 4,
              tagline: "Guardian de la tradición bubi",
              bio: "Artista y compositor natural de Baney, caracterizado por sus ritmos alegres y pegajosos que fusionan la música tradicional bubi con sonidos contemporáneos. Es considerado el embajador cultural de la isla de Bioko.",
              image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
              avatar: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=150&h=150&fit=crop",
              stats: { songs: 28, albums: 6 }
            },
            {
              id: 5,
              name: "El Esperado",
              genre: "Hip Hop",
              followers: "3.5M",
              city: "Malabo",
              verified: true,
              rank: 5,
              tagline: "La voz de la nueva generación",
              bio: "Joven rapero y productor con un flow crudo y underground que relata historias reales del día a día en las calles de Malabo. Su estilo único y su autenticidad le han valido el reconocimiento de toda una generación.",
              image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
              avatar: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
              stats: { songs: 45, albums: 3 }
            },
            {
              id: 6,
              name: "Teddy Bala",
              genre: "Afrobeat",
              followers: "4.2M",
              city: "Bata",
              verified: true,
              rank: 6,
              tagline: "La voz de seda del golfo",
              bio: "Artista de R&B y afro-beat conocido por su voz agradable y sus colaboraciones con algunos de los mejores artistas de nuestra época. Su música romántica ha conquistado los corazones de millones de oyentes.",
              image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2",
              avatar: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=150&h=150&fit=crop",
              stats: { songs: 37, albums: 8 }
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
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Artistas Destacados
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[...Array(SKELETON_COUNT)].map((_, idx) => (
            <Skeleton 
              key={idx} 
              variant="rounded" 
              height={240} 
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

      {/* Contenedor con SCROLL VERTICAL (como original pero mejorado) */}
      <Box
        ref={scrollContainerRef}
        sx={{
          height: "520px",
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

      {/* Hint de scroll que desaparece al hacer scroll */}
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

      {/* Contador de artistas */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          mt: 1,
          color: alpha(theme.palette.text.secondary, 0.4),
          fontSize: '0.6rem'
        }}
      >
        Toca cualquier artista para ver su biografía completa
      </Typography>
    </Box>
  );
};

export default ArtistCarousel;