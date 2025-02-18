import React, { useState, useEffect } from "react";
import { 
  Button, Box, Typography, Card, CardMedia, CardContent, Chip, 
  CircularProgress, IconButton, Tooltip, LinearProgress 
} from "@mui/material";
import { ArrowBack, ArrowForward, Shuffle, Favorite, FavoriteBorder, Casino } from "@mui/icons-material";

// Colores por tipo Pokémon
const typeColors = {
  fire: '#FF4422',
  water: '#3399FF',
  grass: '#77CC55',
  electric: '#FFCC33',
  psychic: '#FF5599',
  normal: '#AAAA99',
  fighting: '#BB5544',
  poison: '#AA5599',
  ground: '#DDBB55',
  flying: '#8899FF',
  bug: '#AABB22',
  rock: '#BBAA66',
  ghost: '#6666BB',
  dragon: '#7766EE',
  dark: '#775544',
  steel: '#AAAABB',
  fairy: '#EE99EE',
  ice: '#66CCFF'
};

// Estilos CSS para animaciones
const styles = `
  @keyframes bounce {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .animated-card {
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .animated-card:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }
  
  .bounce-animation {
    animation: bounce 2s infinite;
  }
  
  .pulse-animation {
    animation: pulse 2s infinite;
  }
`;

const PokemonImageViewer = () => {
  const [pokemonId, setPokemonId] = useState(1);
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => 
    JSON.parse(localStorage.getItem('pokemonFavorites')) || []
  );

  // Efecto de sonido simple
  const playSound = (type) => {
    const audio = new Audio(type === 'click' 
      ? '/sounds/click.mp3' 
      : '/sounds/pokemon.mp3');
    audio.play();
  };

  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data = await response.json();
        
        const types = data.types.map(t => t.type.name);
        const stats = data.stats.reduce((acc, stat) => {
          acc[stat.stat.name] = stat.base_stat;
          return acc;
        }, {});

        setPokemonData({
          name: data.name,
          image: data.sprites.other["official-artwork"].front_default,
          types,
          abilities: data.abilities.map(a => a.ability.name),
          weight: data.weight,
          height: data.height,
          stats
        });
        
        playSound('pokemon');
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [pokemonId]);

  const handleNavigation = (direction) => {
    playSound('click');
    setPokemonId(prev => direction === 'next' ? prev + 1 : Math.max(1, prev - 1));
  };

  const handleRandom = () => {
    playSound('click');
    setPokemonId(Math.floor(Math.random() * 1025) + 1);
  };

  const toggleFavorite = () => {
    const newFavorites = favorites.includes(pokemonData.name)
      ? favorites.filter(name => name !== pokemonData.name)
      : [...favorites, pokemonData.name];
    
    setFavorites(newFavorites);
    localStorage.setItem('pokemonFavorites', JSON.stringify(newFavorites));
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #ff6b6b 30%, #4ecdc4 90%)',
      py: 4,
      px: 2
    }}>
      <style>{styles}</style>
      
      <Typography variant="h2" sx={{
        textAlign: 'center',
        mb: 4,
        fontFamily: '"Luckiest Guy", cursive',
        color: '#fff',
        textShadow: '3px 3px 0 #000',
        animation: 'bounce 2s infinite'
      }}>
    conozca a los djidji pokemon !!!
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          onClick={() => handleNavigation('prev')}
          startIcon={<ArrowBack />}
          disabled={pokemonId === 1}
          sx={{
            borderRadius: '20px',
            bgcolor: '#ff6b6b',
            '&:hover': { bgcolor: '#ff5252' }
          }}
        >
          Anterior
        </Button>
        
        <Tooltip title="¡Poké-sorpresa!">
          <Button
            variant="contained"
            onClick={handleRandom}
            endIcon={<Shuffle />}
            sx={{
              borderRadius: '20px',
              bgcolor: '#4ecdc4',
              '&:hover': { bgcolor: '#3daca4' }
            }}
          >
            Aleatorio
          </Button>
        </Tooltip>
        
        <Button
          variant="contained"
          onClick={() => handleNavigation('next')}
          endIcon={<ArrowForward />}
          sx={{
            borderRadius: '20px',
            bgcolor: '#ff6b6b',
            '&:hover': { bgcolor: '#ff5252' }
          }}
        >
          Siguiente
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <img 
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
            alt="Loading" 
            className="pulse-animation"
            style={{ width: '100px' }}
          />
        </Box>
      ) : pokemonData && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card className="animated-card" sx={{
            maxWidth: 400,
            borderRadius: 4,
            overflow: 'visible',
            position: 'relative',
            p: 2,
            background: `linear-gradient(145deg, ${typeColors[pokemonData.types[0]] || '#fff'} 30%, #f7f7f7 90%)`
          }}>
            <IconButton
              onClick={toggleFavorite}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                color: favorites.includes(pokemonData.name) ? '#ff4081' : '#fff'
              }}
            >
              {favorites.includes(pokemonData.name) ? <Favorite /> : <FavoriteBorder />}
            </IconButton>

            <CardMedia
              component="img"
              image={pokemonData.image}
              alt={pokemonData.name}
              sx={{
                width: '300px',
                height: '300px',
                objectFit: 'contain',
                filter: 'drop-shadow(5px 5px 5px rgba(0,0,0,0.3))'
              }}
            />

            <CardContent>
              <Typography variant="h4" sx={{
                textTransform: 'capitalize',
                fontFamily: '"Press Start 2P", cursive',
                textAlign: 'center',
                color: '#fff',
                textShadow: '2px 2px 0 #000'
              }}>
                {pokemonData.name}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', my: 2 }}>
                {pokemonData.types.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    sx={{
                      bgcolor: typeColors[type] || '#fff',
                      color: '#fff',
                      fontWeight: 'bold',
                      textShadow: '1px 1px 0 #000'
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>Estadísticas:</Typography>
                {Object.entries(pokemonData.stats).map(([stat, value]) => (
                  <Box key={stat} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {stat.replace('-', ' ')}:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, value)} 
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#eee',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: typeColors[pokemonData.types[0]]
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          endIcon={<Casino />}
          sx={{
            bgcolor: '#ffe66d',
            color: '#333',
            '&:hover': { bgcolor: '#ffdd33' }
          }}
        >
          ¡Juego de Adivinanzas!
        </Button>
      </Box>
    </Box>
  );
};

export default PokemonImageViewer;




