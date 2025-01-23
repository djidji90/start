import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  useTheme,
} from "@mui/material";
import NewsCard from "./NewsCard"; // Subcomponente para las tarjetas de noticias

// API simulada para cargar noticias y anuncios
const fetchMockData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        news: [
          {
            id: 1,
            title: "Novedades en el mundo de la música",
            description:
              "Descubre los nuevos lanzamientos y los artistas que están marcando tendencia este mes.",
            image: "https://via.placeholder.com/300",
          },
          {
            id: 2,
            title: "Conciertos imperdibles",
            description:
              "Consulta la lista de los conciertos más esperados en tu ciudad.",
            image: "https://via.placeholder.com/300",
          },
        ],
        ads: [
          {
            id: 1,
            title: "Promoción especial",
            description: "Obtén un 50% de descuento en tus suscripciones.",
            image: "https://via.placeholder.com/300",
          },
        ],
      });
    }, 1000);
  });
};

const NewsAndAdsSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchMockData();
        setData(response);
      } catch (err) {
        setError("Error al cargar noticias y anuncios.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [retry]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", marginTop: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => setRetry(!retry)}
          sx={{
            marginTop: 2,
            backgroundColor: theme.palette.secondary.main,
            "&:hover": {
              backgroundColor: theme.palette.secondary.dark,
            },
          }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: "#fafafa", borderRadius: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 4,
          color: theme.palette.primary.dark,
        }}
      >
        Noticias y Anuncios
      </Typography>

      <Grid container spacing={4}>
        {/* Noticias */}
        {data.news.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            No hay noticias disponibles en este momento.
          </Typography>
        ) : (
          data.news.map((newsItem) => (
            <Grid item xs={12} sm={6} md={4} key={newsItem.id}>
              <NewsCard newsItem={newsItem} />
            </Grid>
          ))
        )}

        {/* Anuncios */}
        {data.ads.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            No hay anuncios disponibles en este momento.
          </Typography>
        ) : (
          data.ads.map((ad) => (
            <Grid item xs={12} key={ad.id}>
              <NewsCard newsItem={ad} isAd />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default NewsAndAdsSection;

