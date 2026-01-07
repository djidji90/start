import React, { useState, useEffect, useRef } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  useTheme,
  useMediaQuery,
  Fade
} from "@mui/material";
import SearchBar from "../../../components/search/SearchBar";
import SearchResults from "../../../components/search/SearchResults";
import { useSearch } from "../../../components/hook/services/useSearch";
import SongCarousel from "../../../songs/SongCarousel";
import ArtistCarousel from "../../../components/theme/musica/ArtistCarousel";
import PopularSongs from "../../../components/theme/musica/PopularSongs";

const MainPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { 
    query,
    setQuery,
    structuredResults = { songs: [], artists: [], suggestions: [] }, 
    loading, 
    error, 
    closeResults,
    isOpen: hookIsOpen
  } = useSearch();

  const [showResults, setShowResults] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);

  const searchBarRef = useRef(null);
  const resultsRef = useRef(null);

  /* -------------------- CANCIONES INICIALES -------------------- */
  useEffect(() => {
    setSelectedSongs([
      { 
        id: 1, 
        title: "Malo", 
        artist: "Jordi", 
        genre: "Hip Hop", 
        duration: 180,
        cover: null
      },
      { 
        id: 2, 
        title: "Badeko Ya Basy", 
        artist: "Franco", 
        genre: "Rumba", 
        duration: 240,
        cover: null
      },
      { 
        id: 3, 
        title: "FD", 
        artist: "DDD", 
        genre: "Pop", 
        duration: 210,
        cover: null
      }
    ]);
  }, []);

  /* -------------------- CONTROL DE RESULTADOS -------------------- */
  useEffect(() => {
    const hasResults =
      structuredResults?.songs?.length > 0 ||
      structuredResults?.artists?.length > 0;

    if (hookIsOpen || (hasResults && query.length >= 2)) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [hookIsOpen, structuredResults, query]);

  /* -------------------- CLICK FUERA -------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showResults &&
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target)
      ) {
        handleCloseResults();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showResults]);

  const handleCloseResults = () => {
    setShowResults(false);
    closeResults?.();
  };

  /* -------------------- SELECCIÓN DE CANCIONES -------------------- */
  const handleSelectResult = (item, type) => {
    if (type === "song") {
      setSelectedSongs(prev => [
        {
          ...item,
          id: `${item.id}-${Date.now()}`,
          title: item.title || "Sin título",
          artist: item.artist || "Artista desconocido",
          genre: item.genre || "Desconocido",
          cover: item.cover || null
        },
        ...prev
      ]);
    }

    if (type === "artist") {
      setSelectedSongs([
        { 
          id: Date.now(), 
          title: `${item.name} - Hit 1`, 
          artist: item.name,
          genre: "Artista",
          duration: 180,
          cover: null
        },
        { 
          id: Date.now() + 1, 
          title: `${item.name} - Hit 2`, 
          artist: item.name,
          genre: "Artista",
          duration: 200,
          cover: null
        }
      ]);
    }

    handleCloseResults();
  };

  /* ============================ RENDER ============================ */
  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      pt: { xs: 3, md: 6 },
      pb: 8
    }}>
      <Container maxWidth="lg">
        {/* HEADER MINIMALISTA */}
        <Box sx={{ 
          textAlign: "center", 
          mb: { xs: 4, md: 6 },
          px: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant="h1"
            sx={{ 
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 300,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              mb: 1
            }}
          >
            djidjimusic
          </Typography>
          <Typography 
            variant="subtitle1"
            sx={{ 
              color: "#666",
              fontWeight: 300,
              fontSize: "1.1rem"
            }}
          >
            {/* Espacio intencionalmente vacío para minimalismo */}
          </Typography>
        </Box>

        {/* BÚSQUEDA */}
        <Box 
          ref={searchBarRef} 
          sx={{ 
            maxWidth: 600, 
            mx: "auto", 
            mb: 8,
            position: "relative" 
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: "12px",
              backgroundColor: "#fafafa",
              border: "1px solid #eaeaea",
              overflow: "hidden",
              transition: "border-color 0.2s ease",
              "&:hover": {
                borderColor: "#d0d0d0"
              }
            }}
          >
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              loading={loading}
              autoFocus={!isMobile}
            />
          </Paper>

          {/* RESULTADOS DE BÚSQUEDA */}
          {showResults && (
            <Fade in timeout={200}>
              <Box 
                ref={resultsRef}
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  mt: 1
                }}
              >
                <SearchResults
                  results={structuredResults}
                  loading={loading}
                  error={error}
                  isOpen={showResults}
                  onClose={handleCloseResults}
                  onSelect={handleSelectResult}
                />
              </Box>
            </Fade>
          )}
        </Box>

        {/* ARTIST CAROUSEL CON ESTILO INSTAGRAM */}
        <Box sx={{ mb: 8 }}>
          <ArtistCarousel />
        </Box>

        {/* CONTENIDO PRINCIPAL */}
        <Box sx={{ mb: 8 }}>
          {selectedSongs.length > 0 ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h6"
                  sx={{ 
                    color: "#1a1a1a",
                    fontWeight: 400,
                    fontSize: "1.25rem",
                    mb: 2
                  }}
                >
                  {/* Título intencionalmente vacío */}
                </Typography>
                
                <SongCarousel
                  songs={selectedSongs}
                  title={null}
                />
              </Box>
            </>
          ) : (
            <Box sx={{ 
              textAlign: "center", 
              py: 8 
            }}>
              <Typography 
                variant="h6"
                sx={{ 
                  color: "#888",
                  fontWeight: 300,
                  fontSize: "1.1rem"
                }}
              >
                {/* Mensaje intencionalmente vacío */}
              </Typography>
            </Box>
          )}
        </Box>

        {/* POPULAR SONGS */}
        <Box>
          <PopularSongs />
        </Box>
      </Container>
    </Box>
  );
};

export default MainPage;