import React, { useState, useEffect } from "react";
import { 
  Grid, Box, Typography, Card, CardMedia, CardContent, 
  Chip, IconButton, CircularProgress, alpha
} from "@mui/material";
import { Favorite, FavoriteBorder, Shuffle } from "@mui/icons-material";

const typeColors = {
  fire: '#FF4422', water: '#3399FF', grass: '#77CC55',
  electric: '#FFCC33', psychic: '#FF5599', normal: '#AAAA99'
};

const PokemonGridViewer = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchPokemons = async () => {
      setLoading(true);
      try {
        // Obtener múltiples Pokémon
        const promises = [];
        for (let i = 1; i <= 12; i++) {
          promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(r => r.json()));
        }
        
        const results = await Promise.all(promises);
        const formattedPokemons = results.map(pokemon => ({
          id: pokemon.id,
          name: pokemon.name,
          image: pokemon.sprites.other["official-artwork"].front_default,
          types: pokemon.types.map(t => t.type.name),
          abilities: pokemon.abilities.map(a => a.ability.name).slice(0, 2)
        }));
        
        setPokemons(formattedPokemons);
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  const toggleFavorite = (pokemonId) => {
    setFavorites(prev => 
      prev.includes(pokemonId) 
        ? prev.filter(id => id !== pokemonId)
        : [...prev, pokemonId]
    );
  };

  const shufflePokemons = () => {
    setPokemons(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 'lg', mx: 'auto' }}>
      {/* Header compacto */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h6" fontWeight="bold">
          Pokémon ({pokemons.length})
        </Typography>
        
        <IconButton onClick={shufflePokemons} size="small" title="Mezclar">
          <Shuffle />
        </IconButton>
      </Box>

      {/* Grid de Pokémon */}
      <Grid container spacing={1.5}>
        {pokemons.map(pokemon => {
          const mainType = pokemon.types[0];
          const bgColor = typeColors[mainType] || '#f5f5f5';
          
          return (
            <Grid item xs={6} sm={4} md={3} key={pokemon.id}>
              <Card sx={{
                height: '100%',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                },
                position: 'relative',
                border: `2px solid ${alpha(bgColor, 0.3)}`
              }}>
                {/* Favorito */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(pokemon.id);
                  }}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    color: favorites.includes(pokemon.id) ? '#ff4081' : 'grey.400',
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  {favorites.includes(pokemon.id) ? 
                    <Favorite fontSize="small" /> : 
                    <FavoriteBorder fontSize="small" />
                  }
                </IconButton>

                {/* Imagen */}
                <Box sx={{ 
                  height: 120, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: alpha(bgColor, 0.1),
                  p: 1
                }}>
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>

                {/* Contenido */}
                <CardContent sx={{ p: 1.5 }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="bold" 
                    sx={{ 
                      textTransform: 'capitalize',
                      mb: 0.5
                    }}
                  >
                    #{pokemon.id.toString().padStart(3, '0')} {pokemon.name}
                  </Typography>

                  {/* Tipos */}
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                    {pokemon.types.map(type => (
                      <Chip
                        key={type}
                        label={type}
                        size="small"
                        sx={{
                          bgcolor: typeColors[type] || 'grey.300',
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 20
                        }}
                      />
                    ))}
                  </Box>

                  {/* Habilidades */}
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    display: 'block',
                    fontStyle: 'italic'
                  }}>
                    {pokemon.abilities.join(' • ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer informativo */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 3,
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="caption" color="text.secondary">
          {favorites.length} favoritos
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Pokémon API
        </Typography>
      </Box>
    </Box>
  );
};

export default PokemonGridViewer;