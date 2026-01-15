import React, { useState, useEffect } from "react";
import { 
  Grid, Box, Typography, Card, CardMedia, CardContent, 
  Chip, IconButton, Modal, Button, alpha, Avatar,
  Tooltip, CircularProgress
} from "@mui/material";
import { 
  Shuffle, Favorite, FavoriteBorder, 
  Close, MusicNote, Casino, Psychology,
  Height, FitnessCenter, AutoAwesome
} from "@mui/icons-material";

// Colores por tipo Pokémon
const typeColors = {
  fire: '#FF4422', water: '#3399FF', grass: '#77CC55',
  electric: '#FFCC33', psychic: '#FF5599', normal: '#AAAA99',
  fighting: '#BB5544', poison: '#AA5599', ground: '#DDBB55',
  flying: '#8899FF', bug: '#AABB22', rock: '#BBAA66',
  ghost: '#6666BB', dragon: '#7766EE', dark: '#775544',
  steel: '#AAAABB', fairy: '#EE99EE', ice: '#66CCFF'
};

// Traducción tipos
const getSpanishType = (type) => ({
  fire: 'Fuego', water: 'Agua', grass: 'Planta',
  electric: 'Eléctrico', psychic: 'Psíquico', normal: 'Normal',
  fighting: 'Lucha', poison: 'Veneno', ground: 'Tierra',
  flying: 'Volador', bug: 'Bicho', rock: 'Roca',
  ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada', ice: 'Hielo'
}[type] || type);

const PokemonGridViewer = () => {
  const [pokemons, setPokemons] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('djidjiPokemonFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showTip, setShowTip] = useState(() => {
    const tipClosed = localStorage.getItem('djidjiTipClosed');
    return !tipClosed;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Obtener Pokémon iniciales
  useEffect(() => {
    fetchInitialPokemons();
  }, []);

  // Persistir favoritos
  useEffect(() => {
    localStorage.setItem('djidjiPokemonFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchInitialPokemons = async () => {
    setIsLoading(true);
    const ids = [1, 4, 7, 25, 133, 150, 151, 155, 158, 161, 163, 165]; // Mix populares
    await fetchPokemonsByIds(ids);
    setIsLoading(false);
  };

  const fetchPokemonsByIds = async (ids) => {
    const promises = ids.map(id => 
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(r => r.json())
        .catch(() => null)
    );
    
    const results = await Promise.all(promises);
    const validPokemons = results
      .filter(p => p !== null)
      .map(formatPokemonData);
    
    setPokemons(validPokemons);
  };

  const formatPokemonData = (pokemon) => ({
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprites.other?.["official-artwork"]?.front_default || 
           pokemon.sprites.front_default,
    types: pokemon.types.map(t => t.type.name),
    abilities: pokemon.abilities.map(a => a.ability.name).slice(0, 2),
    weight: pokemon.weight / 10,
    height: pokemon.height / 10,
    stats: pokemon.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {})
  });

  // Mezclar Pokémon
  const shufflePokemons = async () => {
    setIsLoading(true);
    const randomIds = [];
    while (randomIds.length < 12) {
      const id = Math.floor(Math.random() * 251) + 1;
      if (!randomIds.includes(id)) randomIds.push(id);
    }
    await fetchPokemonsByIds(randomIds);
    setIsLoading(false);
  };

  // Generar un equipo musical
  const generateMusicTeam = async () => {
    setIsLoading(true);
    // Tipos que suenan "musicales"
    const musicalTypes = ['normal', 'psychic', 'fairy', 'electric', 'water'];
    const teamIds = [];
    
    for (let i = 0; i < 6; i++) {
      let found = false;
      while (!found) {
        const id = Math.floor(Math.random() * 251) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (response.ok) {
          const data = await response.json();
          const types = data.types.map(t => t.type.name);
          if (types.some(t => musicalTypes.includes(t))) {
            teamIds.push(id);
            found = true;
          }
        }
      }
    }
    
    await fetchPokemonsByIds(teamIds);
    setIsLoading(false);
  };

  const toggleFavorite = (pokemonId, e) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(pokemonId) 
      ? favorites.filter(id => id !== pokemonId)
      : [...favorites, pokemonId];
    setFavorites(newFavorites);
  };

  const handlePokemonClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedPokemon(null), 300);
  };

  const closeTip = () => {
    setShowTip(false);
    localStorage.setItem('djidjiTipClosed', 'true');
  };

  return (
    <Box sx={{ 
      p: { xs: 1.5, sm: 2, md: 2.5 }, 
      maxWidth: '1200px', 
      mx: 'auto',
      bgcolor: 'background.default'
    }}>
      {/* Tip contextual */}
      {showTip && (
        <Box sx={{
          bgcolor: alpha('#1B5E20', 0.08),
          borderRadius: 2,
          p: 2,
          mb: 3,
          border: `1px solid ${alpha('#1B5E20', 0.15)}`,
          animation: 'fadeIn 0.5s ease',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(-10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Avatar sx={{ 
              bgcolor: '#1B5E20', 
              width: 32, 
              height: 32,
              fontSize: '0.875rem'
            }}>
              <MusicNote sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} color="#1B5E20" gutterBottom>
                🇬🇶 Mientras la música suena...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Estos Djidji-Pokémon están aquí para acompañarte entre canción y canción. 
                Cada uno tiene su ritmo, como cada género musical de Guinea Ecuatorial.
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={closeTip}
              sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Header minimalista */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3 
      }}>
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#1B5E20' }}>
            Djidji-Pokémon
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {pokemons.length} criaturas • {favorites.length} en tu colección
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' }
        }}>
          <Tooltip title="Generar equipo musical">
            <Button
              variant="outlined"
              startIcon={<Psychology />}
              onClick={generateMusicTeam}
              size="small"
              sx={{ 
                borderRadius: 2,
                borderColor: alpha('#1B5E20', 0.3),
                color: '#1B5E20',
                '&:hover': {
                  borderColor: '#1B5E20',
                  bgcolor: alpha('#1B5E20', 0.04)
                }
              }}
            >
              Equipo Musical
            </Button>
          </Tooltip>
          
          <Tooltip title="Descubrir nuevos Pokémon">
            <Button
              variant="contained"
              startIcon={<Shuffle />}
              onClick={shufflePokemons}
              size="small"
              sx={{ 
                borderRadius: 2,
                bgcolor: '#1B5E20',
                '&:hover': { bgcolor: '#15501B' }
              }}
            >
              Explorar
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} sx={{ color: '#1B5E20' }} />
        </Box>
      )}

      {/* Grid de Pokémon */}
      <Grid container spacing={1.5}>
        {pokemons.map(pokemon => {
          const mainType = pokemon.types[0];
          const bgColor = typeColors[mainType] || '#f5f5f5';
          const isFavorite = favorites.includes(pokemon.id);
          
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={pokemon.id}>
              <Card 
                onClick={() => handlePokemonClick(pokemon)}
                sx={{
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  border: isFavorite ? `2px solid ${typeColors[mainType]}` : 'none',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 12px 24px ${alpha(bgColor, 0.2)}`,
                    '& .pokemon-image': {
                      transform: 'scale(1.08)'
                    }
                  }
                }}
              >
                {/* Indicador favorito */}
                {isFavorite && (
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    bgcolor: typeColors[mainType],
                    color: 'white',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Favorite sx={{ fontSize: 14 }} />
                  </Box>
                )}

                {/* Imagen */}
                <Box sx={{ 
                  height: 140, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: alpha(bgColor, 0.1),
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor: alpha('#000', 0.7),
                    color: 'white',
                    borderRadius: 1,
                    px: 1,
                    py: 0.25
                  }}>
                    <Typography variant="caption" fontWeight={500}>
                      #{pokemon.id}
                    </Typography>
                  </Box>
                  
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="pokemon-image"
                    style={{
                      width: '90%',
                      height: '90%',
                      objectFit: 'contain',
                      transition: 'transform 0.5s ease'
                    }}
                  />
                </Box>

                {/* Contenido */}
                <CardContent sx={{ p: 1.5 }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={600} 
                    sx={{ 
                      textTransform: 'capitalize',
                      mb: 1,
                      lineHeight: 1.2,
                      fontSize: '0.875rem'
                    }}
                  >
                    {pokemon.name}
                  </Typography>

                  {/* Tipos */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {pokemon.types.map(type => (
                      <Chip
                        key={type}
                        label={getSpanishType(type)}
                        size="small"
                        sx={{
                          bgcolor: alpha(typeColors[type] || 'grey.300', 0.9),
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 20,
                          flex: 1,
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal de detalles */}
      {selectedPokemon && (
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Box sx={{
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            animation: 'modalSlide 0.3s ease',
            '@keyframes modalSlide': {
              from: { opacity: 0, transform: 'scale(0.95) translateY(20px)' },
              to: { opacity: 1, transform: 'scale(1) translateY(0)' }
            }
          }}>
            {/* Header del modal */}
            <Box sx={{
              bgcolor: alpha(typeColors[selectedPokemon.types[0]] || '#666', 0.15),
              p: 3,
              position: 'relative',
              borderBottom: `4px solid ${typeColors[selectedPokemon.types[0]] || '#666'}`
            }}>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  bgcolor: 'white',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <Close />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ 
                  width: 120, 
                  height: 120,
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  <img
                    src={selectedPokemon.image}
                    alt={selectedPokemon.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }}
                  />
                  
                  <IconButton
                    onClick={(e) => toggleFavorite(selectedPokemon.id, e)}
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      right: -8,
                      bgcolor: 'white',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    {favorites.includes(selectedPokemon.id) ? 
                      <Favorite sx={{ color: '#ff4081' }} /> : 
                      <FavoriteBorder />
                    }
                  </IconButton>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    #{selectedPokemon.id.toString().padStart(3, '0')}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ 
                    textTransform: 'capitalize',
                    mb: 1
                  }}>
                    {selectedPokemon.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {selectedPokemon.types.map(type => (
                      <Chip
                        key={type}
                        label={getSpanishType(type)}
                        sx={{
                          bgcolor: typeColors[type] || 'grey.300',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Tooltip title="Altura">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Height sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Altura
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedPokemon.height} m
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
                    
                    <Tooltip title="Peso">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FitnessCenter sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Peso
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedPokemon.weight} kg
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Contenido del modal */}
            <Box sx={{ p: 3 }}>
              {/* Habilidades */}
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2
              }}>
                <AutoAwesome sx={{ fontSize: 20, color: 'primary.main' }} />
                Habilidades
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {selectedPokemon.abilities.map(ability => (
                  <Chip
                    key={ability}
                    label={ability.replace(/-/g, ' ')}
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>

              {/* Estadísticas */}
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Estadísticas
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 2, 
                mb: 3 
              }}>
                {Object.entries(selectedPokemon.stats).map(([stat, value]) => (
                  <Box key={stat} sx={{ 
                    bgcolor: alpha('#000', 0.02), 
                    borderRadius: 2, 
                    p: 1.5 
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ 
                        textTransform: 'capitalize',
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}>
                        {stat.replace(/-/g, ' ')}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {value}
                      </Typography>
                    </Box>
                    <Box sx={{
                      height: 6,
                      bgcolor: alpha('#000', 0.1),
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: `${Math.min(100, (value / 255) * 100)}%`,
                        height: '100%',
                        bgcolor: typeColors[selectedPokemon.types[0]] || '#666',
                        borderRadius: 3
                      }} />
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Conexión Musical */}
              <Box sx={{
                bgcolor: alpha('#1B5E20', 0.05),
                borderRadius: 2,
                p: 2.5,
                border: `1px solid ${alpha('#1B5E20', 0.1)}`,
                position: 'relative'
              }}>
                <Avatar sx={{ 
                  position: 'absolute',
                  top: -12,
                  left: 16,
                  bgcolor: '#1B5E20',
                  width: 24,
                  height: 24
                }}>
                  <MusicNote sx={{ fontSize: 14 }} />
                </Avatar>
                
                <Typography variant="subtitle2" fontWeight={600} color="#1B5E20" gutterBottom>
                  🇬🇶 Ritmo Ecuatoguineano
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Cada Pokémon tiene su cadencia única, igual que los ritmos tradicionales 
                  de Guinea Ecuatorial. Mientras {selectedPokemon.name} muestra su energía, 
                  nuestros artistas preparan la próxima canción que descubrirás.
                </Typography>
              </Box>

              {/* CTA final */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3,
                pt: 2,
                borderTop: `1px solid ${alpha('#000', 0.1)}`
              }}>
                <Typography variant="caption" color="text.secondary">
                  {favorites.includes(selectedPokemon.id) ? '⭐ En tu colección' : '✨ Descubierto'}
                </Typography>
                
                <Button
                  variant="text"
                  startIcon={<Shuffle />}
                  onClick={() => {
                    handleCloseModal();
                    setTimeout(shufflePokemons, 300);
                  }}
                  sx={{ color: '#1B5E20', fontWeight: 600 }}
                >
                  Explorar más
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default PokemonGridViewer;