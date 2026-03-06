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
  Modal,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  MusicNote,
  Share,
  LocationOn,
  Verified,
  Close,
  PlayArrow,
  Mic,
  Album,
  TrendingUp,
  CalendarToday,
  Language,
  Instagram,
  Facebook,
  Twitter,
  YouTube,
  Podcasts,
} from "@mui/icons-material";
import { motion } from "framer-motion";

// --- CONSTANTES ---
const IMAGE_HEIGHT = 160;
const IMAGE_HEIGHT_EXPANDED = 200;
const SKELETON_COUNT = 4;

// --- COMPONENTE ARTIST CARD MEMOIZADO ---
const ArtistCard = React.memo(({ artist, isExpanded, onToggleExpand, onOpenProfile }) => {
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
          {/* BIO */}
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

          {/* Frase destacada */}
          {artist.tagline && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 500,
                fontStyle: "italic",
                display: "block",
                mb: 1.5,
                borderLeft: 2,
                borderColor: theme.palette.primary.main,
                pl: 1,
              }}
            >
              "{artist.tagline}"
            </Typography>
          )}

          {/* Acciones principales */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mt: 1 
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

            <Chip
              label={isExpanded ? "Ver menos" : "Ver más"}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(artist.id);
              }}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 500,
              }}
            />
          </Box>

          {/* EXPANSIÓN: Más información del artista */}
          <Zoom in={isExpanded} timeout={300}>
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              
              {/* Estadísticas rápidas */}
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-around",
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                p: 1.5,
                mb: 2,
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {artist.stats?.songs || 24}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Canciones
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {artist.stats?.albums || 3}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Álbumes
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {artist.stats?.monthlyListeners || '150K'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Oyentes/mes
                  </Typography>
                </Box>
              </Box>

              {/* Idiomas y etnia (identidad cultural) */}
              {(artist.languages || artist.ethnicity) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Identidad cultural
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {artist.ethnicity && (
                      <Chip
                        label={artist.ethnicity}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem' }}
                      />
                    )}
                    {artist.languages?.map((lang) => (
                      <Chip
                        key={lang}
                        label={lang}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Canciones populares (placeholder) */}
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Canciones populares
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 0.5,
                    borderRadius: 1,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                  }}>
                    <MusicNote sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {artist.topSongs?.[i-1] || `Éxito ${i} de ${artist.name}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {artist.topDurations?.[i-1] || '3:45'}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Botón para ver perfil completo */}
              <Button
                fullWidth
                variant="contained"
                startIcon={<Podcasts />}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile(artist);
                }}
                sx={{
                  mt: 1,
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                }}
              >
                Ver perfil completo
              </Button>
            </Box>
          </Zoom>
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
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef(null);
  const theme = useTheme();

  const handleToggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleOpenProfile = useCallback((artist) => {
    setSelectedArtist(artist);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setSelectedArtist(null);
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
              ethnicity: "Fang",
              languages: ["Español", "Fang"],
              verified: true,
              rank: 1,
              tagline: "La voz que inspira a una generación",
              bio: "Cantante y compositora con más de 10 millones de streams en plataformas digitales. Su música fusiona gospel con ritmos locales, creando un sonido único que ha traspasado fronteras. Ha colaborado con artistas internacionales y llevado la música guineana a escenarios de todo el mundo.",
              fullBio: "Sita Richi comenzó su carrera en el coro de su iglesia en Malabo a los 12 años. Su talento innato y su voz prodigiosa la llevaron a grabar su primer álbum 'Fe y Esperanza' en 2015, que se convirtió en un éxito instantáneo en Guinea Ecuatorial. Desde entonces, ha lanzado 4 álbumes de estudio, ha realizado giras por toda África Central y ha colaborado con artistas de la talla de ... Su música no solo entretiene, sino que también lleva un mensaje de esperanza y unidad para toda África.",
              image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
              avatar: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=150&h=150&fit=crop",
              stats: { songs: 34, albums: 4, monthlyListeners: '450K' },
              topSongs: ["Aleluya", "Fe Eterna", "Mi Guinea", "Esperanza"],
              topDurations: ["4:12", "3:58", "5:02", "4:30"],
              social: {
                instagram: "@sitarichi",
                twitter: "@sitarichi",
                facebook: "sitarichimusic",
                youtube: "@sitarichi"
              }
            },
            {
              id: 2,
              name: "Mr. O",
              genre: "Hip Hop",
              followers: "850K",
              city: "Bata",
              ethnicity: "Bubi",
              languages: ["Español", "Bubi", "Inglés"],
              verified: true,
              rank: 2,
              tagline: "Leyenda viva del rap",
              bio: "Absoluta leyenda urbana, uno de los raperos más influyentes de nuestra historia sin lugar a dudas. Sus letras crudas y realistas han marcado a toda una generación, narrando las historias de la calle con una autenticidad inigualable.",
              fullBio: "Mr. O irrumpió en la escena del hip hop guineano en 2010 con su mixtape 'Voces de la Calle'. Originario del barrio de Ela Nguema en Bata, sus letras reflejan las realidades de la vida urbana en Guinea Ecuatorial. Ha lanzado 7 álbumes y ha colaborado con artistas de toda África. Es conocido por su fundación 'Rap por la Paz' que trabaja con jóvenes en riesgo de exclusión social.",
              image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
              avatar: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=150&h=150&fit=crop",
              stats: { songs: 52, albums: 7, monthlyListeners: '380K' },
              topSongs: ["Barrio Bata", "Realidad", "Sin Cadenas", "Lucha"],
              topDurations: ["3:45", "4:20", "3:30", "5:10"],
              social: {
                instagram: "@mrofficial",
                twitter: "@mr_o",
                facebook: "mrohiphop"
              }
            },
            {
              id: 3,
              name: "Romy Solo",
              genre: "Afro Beats",
              followers: "2.1M",
              city: "Malabo",
              ethnicity: "Fang",
              languages: ["Español", "Fang", "Portugués"],
              verified: true,
              rank: 3,
              tagline: "El ritmo que mueve África",
              bio: "Romi es seguramente si no el mejor, uno de las mejores y más talentosos artistas del panorama musical guineano. Su fusión de afro beats con ritmos tradicionales bubis crea una experiencia única que ha conquistado a audiencias de toda África Central.",
              fullBio: "Romy Solo comenzó tocando la guitarra en bares de Malabo antes de ser descubierto por un productor nigeriano. Su mezcla única de afrobeat con ritmos tradicionales de Guinea Ecuatorial le ha valido el reconocimiento en toda África. Su álbum 'Raíces' fue nominado a los All Africa Music Awards. Actualmente prepara su primera gira internacional.",
              image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa",
              avatar: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=150&h=150&fit=crop",
              stats: { songs: 41, albums: 5, monthlyListeners: '620K' },
              topSongs: ["Bubi Dance", "Malabo Nights", "Amor Africano", "Bailando"],
              topDurations: ["4:05", "3:55", "4:45", "3:40"],
              social: {
                instagram: "@romysolo",
                twitter: "@romy_solo",
                youtube: "@romysolomusic"
              }
            },
            {
              id: 4,
              name: "Titoy Bolabote",
              genre: "Música Tradicional",
              followers: "1.8M",
              city: "Baney",
              ethnicity: "Bubi",
              languages: ["Bubi", "Español"],
              verified: true,
              rank: 4,
              tagline: "Guardián de la tradición bubi",
              bio: "Artista y compositor natural de Baney, caracterizado por sus ritmos alegres y pegajosos que fusionan la música tradicional bubi con sonidos contemporáneos. Es considerado el embajador cultural de la isla de Bioko.",
              fullBio: "Titoy Bolabote aprendió los ritmos tradicionales bubis de su abuelo, un reconocido tamborilero de la comunidad. Ha dedicado su carrera a preservar y modernizar la música tradicional de Bioko, incorporando instrumentos como el tambor bubi y la marimba en producciones modernas. Ha recibido reconocimientos del Ministerio de Cultura por su labor de preservación cultural.",
              image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
              avatar: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=150&h=150&fit=crop",
              stats: { songs: 28, albums: 6, monthlyListeners: '290K' },
              topSongs: ["Ritmo Bubi", "Baney", "Tradición", "Bioko"],
              topDurations: ["5:20", "4:45", "6:10", "4:30"],
              social: {
                facebook: "titoybolabote"
              }
            },
            {
              id: 5,
              name: "El Esperado",
              genre: "Hip Hop",
              followers: "3.5M",
              city: "Malabo",
              ethnicity: "Fang",
              languages: ["Español", "Fang"],
              verified: true,
              rank: 5,
              tagline: "La voz de la nueva generación",
              bio: "Joven rapero y productor con un flow crudo y underground que relata historias reales del día a día en las calles de Malabo. Su estilo único y su autenticidad le han valido el reconocimiento de toda una generación.",
              fullBio: "Con apenas 22 años, El Esperado se ha convertido en el referente del hip hop joven en Guinea Ecuatorial. Sus videoclips grabados en las calles de Malabo acumulan millones de vistas en YouTube. Su último álbum 'Generación X' debutó en el top 10 de África Central. Es conocido por sus letras que hablan de la realidad social y las aspiraciones de la juventud guineana.",
              image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
              avatar: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
              stats: { songs: 45, albums: 3, monthlyListeners: '780K' },
              topSongs: ["Malabo Flow", "Nueva Era", "Juventud", "Realidad"],
              topDurations: ["3:20", "4:00", "3:45", "4:30"],
              social: {
                instagram: "@elesperado",
                tiktok: "@elesperado",
                youtube: "@elesperadomusic"
              }
            },
            {
              id: 6,
              name: "Teddy Bala",
              genre: "Afrobeat",
              followers: "4.2M",
              city: "Bata",
              ethnicity: "Ndowe",
              languages: ["Español", "Inglés", "Francés"],
              verified: true,
              rank: 6,
              tagline: "La voz de seda del golfo",
              bio: "Artista de R&B y afro-beat conocido por su voz agradable y sus colaboraciones con algunos de los mejores artistas de nuestra época. Su música romántica ha conquistado los corazones de millones de oyentes.",
              fullBio: "Teddy Bala estudió música en Sudáfrica antes de regresar a Guinea Ecuatorial para revolucionar la escena del R&B local. Su voz suave y sus letras románticas le han valido el apodo de 'La voz de seda'. Ha colaborado con artistas nigerianos, cameruneses y sudafricanos. Su tema 'Amor sin fronteras' es uno de los más reproducidos en la historia de la música guineana.",
              image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2",
              avatar: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=150&h=150&fit=crop",
              stats: { songs: 37, albums: 8, monthlyListeners: '920K' },
              topSongs: ["Amor sin Fronteras", "Bata", "Contigo", "Seda"],
              topDurations: ["4:15", "3:50", "5:00", "3:35"],
              social: {
                instagram: "@teddybala",
                twitter: "@teddybala",
                youtube: "@teddybalamusic"
              }
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
              onOpenProfile={handleOpenProfile}
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

      {/* MODAL DE PERFIL COMPLETO */}
      <Modal
        open={!!selectedArtist}
        onClose={handleCloseProfile}
        aria-labelledby="modal-artist-profile"
        closeAfterTransition
      >
        <Fade in={!!selectedArtist}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 450,
            maxHeight: '85vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: 24,
            outline: 'none',
          }}>
            {selectedArtist && (
              <>
                {/* Cabecera con imagen de portada */}
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={`${selectedArtist.image}?w=600&h=200&fit=crop`}
                    alt={selectedArtist.name}
                    sx={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7))',
                    }}
                  />
                  
                  {/* Botón cerrar */}
                  <IconButton
                    onClick={handleCloseProfile}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: alpha(theme.palette.common.white, 0.8),
                      '&:hover': { bgcolor: theme.palette.common.white },
                    }}
                  >
                    <Close />
                  </IconButton>

                  {/* Avatar y nombre sobre imagen */}
                  <Box sx={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={selectedArtist.avatar}
                      sx={{ width: 56, height: 56, border: '2px solid white' }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
                        {selectedArtist.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {selectedArtist.verified && (
                          <Verified sx={{ color: theme.palette.info.main, fontSize: 16 }} />
                        )}
                        <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
                          {selectedArtist.followers} seguidores
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Contenido del perfil */}
                <Box sx={{ p: 3 }}>
                  {/* Género y ciudad */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label={selectedArtist.genre} 
                      size="small"
                      color="primary"
                    />
                    <Chip 
                      icon={<LocationOn />} 
                      label={selectedArtist.city} 
                      size="small"
                      variant="outlined"
                    />
                    {selectedArtist.ethnicity && (
                      <Chip 
                        label={selectedArtist.ethnicity} 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Idiomas */}
                  {selectedArtist.languages && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Idiomas
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selectedArtist.languages.map((lang) => (
                          <Chip
                            key={lang}
                            label={lang}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Biografía completa */}
                  <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {selectedArtist.fullBio || selectedArtist.bio}
                  </Typography>

                  {/* Frase destacada */}
                  {selectedArtist.tagline && (
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: 'primary.main',
                        fontStyle: 'italic',
                        mb: 3,
                        borderLeft: 3,
                        borderColor: 'primary.main',
                        pl: 2,
                      }}
                    >
                      "{selectedArtist.tagline}"
                    </Typography>
                  )}

                  {/* Estadísticas detalladas */}
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 3,
                    p: 2,
                    mb: 3,
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{selectedArtist.stats?.songs || 24}</Typography>
                      <Typography variant="caption">Canciones</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{selectedArtist.stats?.albums || 3}</Typography>
                      <Typography variant="caption">Álbumes</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{selectedArtist.stats?.monthlyListeners || '150K'}</Typography>
                      <Typography variant="caption">Oyentes/mes</Typography>
                    </Box>
                  </Box>

                  {/* Top canciones */}
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                    Canciones populares
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                    {selectedArtist.topSongs?.map((song, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5,
                        p: 1,
                        borderRadius: 2,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ width: 20 }}>
                          {index + 1}
                        </Typography>
                        <MusicNote sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {song}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedArtist.topDurations?.[index] || '3:45'}
                        </Typography>
                        <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  {/* Redes sociales */}
                  {selectedArtist.social && (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Redes sociales</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                        {selectedArtist.social.instagram && (
                          <IconButton size="small" sx={{ color: '#E4405F' }}>
                            <Instagram />
                          </IconButton>
                        )}
                        {selectedArtist.social.twitter && (
                          <IconButton size="small" sx={{ color: '#1DA1F2' }}>
                            <Twitter />
                          </IconButton>
                        )}
                        {selectedArtist.social.facebook && (
                          <IconButton size="small" sx={{ color: '#1877F2' }}>
                            <Facebook />
                          </IconButton>
                        )}
                        {selectedArtist.social.youtube && (
                          <IconButton size="small" sx={{ color: '#FF0000' }}>
                            <YouTube />
                          </IconButton>
                        )}
                      </Box>
                    </>
                  )}

                  {/* Acciones principales */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<PlayArrow />}
                      fullWidth
                      size="large"
                      sx={{ borderRadius: 2 }}
                    >
                      Escuchar ahora
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Share />}
                      size="large"
                      sx={{ borderRadius: 2 }}
                    >
                      Compartir
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default ArtistCarousel;