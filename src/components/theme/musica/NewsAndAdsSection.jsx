import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Skeleton,
  useTheme,
} from "@mui/material";

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
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        ) : (
          data.news.map((newsItem) => (
            <Grid item xs={12} sm={6} md={4} key={newsItem.id}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  ":hover": {
                    boxShadow: 20,
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={newsItem.image}
                  alt={newsItem.title}
                  sx={{
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                    {newsItem.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {newsItem.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}

        {/* Anuncios */}
        {data.ads.length === 0 ? (
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        ) : (
          data.ads.map((ad) => (
            <Grid item xs={12} key={ad.id}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  ":hover": {
                    boxShadow: 20,
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={ad.image}
                  alt={ad.title}
                  sx={{
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: theme.palette.secondary.main }}>
                    {ad.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ad.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default NewsAndAdsSection;

