import React, { useState, useEffect } from "react";
import { Button, Box, Typography, Card, CardMedia, CardContent, Chip, CircularProgress } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const PokemonImageViewer = () => {
  const [pokemonId, setPokemonId] = useState(1); // Comienza con el primer Pokémon
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data = await response.json();
        const types = data.types.map((typeInfo) => typeInfo.type.name);
        const abilities = data.abilities.map((abilityInfo) => abilityInfo.ability.name);
        setPokemonData({
          name: data.name,
          image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
          types,
          abilities,
          weight: data.weight,
          height: data.height,
        });
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [pokemonId]);

  const handleNext = () => {
    setPokemonId(pokemonId + 1); // Avanza al siguiente Pokémon
  };

  const handlePrev = () => {
    if (pokemonId > 1) {
      setPokemonId(pokemonId - 1); // Retrocede al Pokémon anterior
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
        backgroundColor: "#f7f7f7",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: "bold", color: "#333" }}>
        Descubre Pokémon
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        pokemonData && (
          <Card
            sx={{
              maxWidth: 400,
              borderRadius: 3,
              boxShadow: 5,
              padding: 2,
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              image={pokemonData.image}
              alt={pokemonData.name}
              sx={{
                width: "300px",
                height: "300px",
                objectFit: "contain",
                marginBottom: 2,
              }}
            />
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  textTransform: "capitalize",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#3f51b5",
                }}
              >
                {pokemonData.name}
              </Typography>
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Tipo:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                  {pokemonData.types.map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      sx={{
                        backgroundColor: "#e0f7fa",
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Habilidades:
                </Typography>
                <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                  {pokemonData.abilities.map((ability) => (
                    <li key={ability} style={{ textTransform: "capitalize" }}>
                      {ability}
                    </li>
                  ))}
                </ul>
              </Box>
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Peso: <span style={{ fontWeight: "normal" }}>{pokemonData.weight} kg</span>
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Altura: <span style={{ fontWeight: "normal" }}>{pokemonData.height} m</span>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePrev}
          startIcon={<ArrowBack />}
          disabled={pokemonId === 1}
          sx={{
            borderRadius: 3,
            padding: "6px 12px",
            boxShadow: 2,
            backgroundColor: "#f1f1f1",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          Atrás
        </Button>
        <Button
          variant="outlined"
          onClick={handleNext}
          endIcon={<ArrowForward />}
          sx={{
            borderRadius: 3,
            padding: "6px 12px",
            boxShadow: 2,
            backgroundColor: "#f1f1f1",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          Adelante
        </Button>
      </Box>
    </Box>
  );
};

export default PokemonImageViewer;




