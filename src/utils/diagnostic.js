// src/utils/diagnostic.js
import React from 'react';

export const runFullDiagnostic = async () => {
  console.group('🔍 DIAGNÓSTICO COMPLETO DEL PROYECTO');
  
  const diagnostics = {
    components: {},
    hooks: {},
    services: {},
    errors: [],
    warnings: [],
    suggestions: []
  };

  // 1. VERIFICAR COMPONENTES CRÍTICOS
  console.log('1. 📦 Verificando componentes...');
  
  try {
    // Verificar PlayerContext
    diagnostics.components.PlayerContext = {
      exists: false,
      hasPlaySong: false,
      hasUsePlayer: false
    };
    
    try {
      const PlayerContext = await import('../components/PlayerContext');
      diagnostics.components.PlayerContext.exists = true;
      diagnostics.components.PlayerContext.hasPlaySong = typeof PlayerContext?.PlayerProvider === 'function';
      diagnostics.components.PlayerContext.hasUsePlayer = typeof PlayerContext?.usePlayer === 'function';
    } catch (e) {
      diagnostics.errors.push(`PlayerContext no encontrado: ${e.message}`);
    }

    // Verificar SongCard
    try {
      await import('../components/songs/SongCard');
      diagnostics.components.SongCard = { exists: true };
    } catch (e) {
      diagnostics.errors.push(`SongCard no encontrado: ${e.message}`);
      diagnostics.suggestions.push('Crear SongCard.jsx en src/components/songs/');
    }

    // Verificar SearchResults
    try {
      const SearchResults = await import('../components/search/SearchResults');
      diagnostics.components.SearchResults = { 
        exists: true,
        exportsDefault: !!SearchResults.default
      };
    } catch (e) {
      diagnostics.errors.push(`SearchResults no encontrado: ${e.message}`);
    }

    // Verificar SearchBar
    try {
      const SearchBar = await import('../components/search/SearchBar');
      diagnostics.components.SearchBar = {
        exists: true,
        exportsDefault: !!SearchBar.default
      };
    } catch (e) {
      diagnostics.errors.push(`SearchBar no encontrado: ${e.message}`);
    }

    // Verificar PlayerBar
    try {
      await import('../components/theme/musica/PlayerBar');
      diagnostics.components.PlayerBar = { exists: true };
    } catch (e) {
      diagnostics.errors.push(`PlayerBar no encontrado: ${e.message}`);
    }

    // 2. VERIFICAR HOOKS
    console.log('2. 🪝 Verificando hooks...');
    
    try {
      const useSearch = await import('../hooks/useSearch');
      diagnostics.hooks.useSearch = {
        exists: true,
        hasUseSimpleSearch: typeof useSearch.useSimpleSearch === 'function',
        hasUseSearch: typeof useSearch.useSearch === 'function'
      };
    } catch (e) {
      diagnostics.errors.push(`useSearch no encontrado: ${e.message}`);
    }

    // 3. VERIFICAR SERVICIOS
    console.log('3. ⚙️ Verificando servicios...');
    
    try {
      const AudioEngine = await import('../services/AudioEngine');
      diagnostics.services.AudioEngine = {
        exists: true,
        hasPlayMethod: typeof AudioEngine?.audioEngine?.play === 'function'
      };
    } catch (e) {
      diagnostics.errors.push(`AudioEngine no encontrado: ${e.message}`);
    }

    try {
      const StreamManager = await import('../audio/engine/StreamManager');
      diagnostics.services.StreamManager = {
        exists: true,
        hasGetAudioMethod: typeof StreamManager?.streamManager?.getAudio === 'function'
      };
    } catch (e) {
      diagnostics.errors.push(`StreamManager no encontrado: ${e.message}`);
    }

    // 4. VERIFICAR ESTRUCTURA DE DATOS
    console.log('4. 🗂️ Verificando estructura de datos...');
    
    // Verificar localStorage
    const token = localStorage.getItem('accessToken');
    diagnostics.localStorage = {
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    };

    // 5. VERIFICAR ENDPOINTS
    console.log('5. 🌐 Verificando endpoints...');
    
    try {
      const testEndpoints = async () => {
        const baseURL = 'https://api.djidjimusic.com';
        const endpoints = [
          '/api2/songs/',
          '/api2/search/suggestions/',
          '/api2/songs/1/stream/'
        ];
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(baseURL + endpoint, {
              method: 'GET',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            diagnostics.endpoints = diagnostics.endpoints || {};
            diagnostics.endpoints[endpoint] = {
              status: response.status,
              ok: response.ok
            };
          } catch (e) {
            diagnostics.errors.push(`Error en endpoint ${endpoint}: ${e.message}`);
          }
        }
      };
      
      await testEndpoints();
    } catch (e) {
      diagnostics.warnings.push(`No se pudieron verificar endpoints: ${e.message}`);
    }

    // 6. ANALIZAR ERRORES COMUNES
    console.log('6. ⚠️ Analizando errores comunes...');
    
    // Verificar si hay clearResults en useSearch
    if (diagnostics.hooks.useSearch?.exists) {
      const useSearchModule = await import('../hooks/useSearch');
      const hookInstance = useSearchModule.useSearch ? useSearchModule.useSearch() : null;
      
      if (hookInstance && typeof hookInstance.clearResults !== 'function') {
        diagnostics.errors.push('useSearch no tiene método clearResults');
        diagnostics.suggestions.push('Agregar clearResults a useSearch o usar useSimpleSearch');
      }
    }

    // Verificar estructura de resultados
    if (diagnostics.hooks.useSearch?.exists) {
      const useSearchModule = await import('../hooks/useSearch');
      const hookInstance = useSearchModule.useSimpleSearch ? useSearchModule.useSimpleSearch() : null;
      
      if (hookInstance && hookInstance.results) {
        const hasSongs = Array.isArray(hookInstance.results.songs);
        const hasArtists = Array.isArray(hookInstance.results.artists);
        const hasSuggestions = Array.isArray(hookInstance.results.suggestions);
        
        diagnostics.dataStructure = {
          hasCorrectStructure: hasSongs && hasArtists && hasSuggestions,
          songsIsArray: hasSongs,
          artistsIsArray: hasArtists,
          suggestionsIsArray: hasSuggestions
        };
        
        if (!hasSongs || !hasArtists || !hasSuggestions) {
          diagnostics.errors.push('Estructura de results incorrecta. Debe ser: {songs: [], artists: [], suggestions: []}');
        }
      }
    }

    // 7. GENERAR REPORTE
    console.log('7. 📊 Generando reporte...');
    
    console.log('\n=== RESUMEN DEL DIAGNÓSTICO ===\n');
    
    // Componentes
    console.log('📦 COMPONENTES:');
    Object.entries(diagnostics.components).forEach(([name, info]) => {
      const status = info.exists ? '✅' : '❌';
      console.log(`${status} ${name}: ${info.exists ? 'EXISTE' : 'NO EXISTE'}`);
    });
    
    // Hooks
    console.log('\n🪝 HOOKS:');
    Object.entries(diagnostics.hooks).forEach(([name, info]) => {
      const status = info.exists ? '✅' : '❌';
      console.log(`${status} ${name}: ${info.exists ? 'EXISTE' : 'NO EXISTE'}`);
      if (info.exists) {
        console.log(`   - useSimpleSearch: ${info.hasUseSimpleSearch ? '✅' : '❌'}`);
        console.log(`   - useSearch: ${info.hasUseSearch ? '✅' : '❌'}`);
      }
    });
    
    // Errores
    if (diagnostics.errors.length > 0) {
      console.log('\n❌ ERRORES CRÍTICOS:');
      diagnostics.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    // Sugerencias
    if (diagnostics.suggestions.length > 0) {
      console.log('\n💡 SUGERENCIAS:');
      diagnostics.suggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
    }
    
    // Estructura de datos
    if (diagnostics.dataStructure) {
      console.log('\n🗂️ ESTRUCTURA DE DATOS:');
      console.log(`   • songs es array: ${diagnostics.dataStructure.songsIsArray ? '✅' : '❌'}`);
      console.log(`   • artists es array: ${diagnostics.dataStructure.artistsIsArray ? '✅' : '❌'}`);
      console.log(`   • suggestions es array: ${diagnostics.dataStructure.suggestionsIsArray ? '✅' : '❌'}`);
    }
    
    // 8. SOLUCIONES AUTOMÁTICAS
    console.log('\n🔧 SOLUCIONES RECOMENDADAS:\n');
    
    // Si falta SongCard
    if (!diagnostics.components.SongCard?.exists) {
      console.log('1. Crear SongCard.jsx:');
      console.log(`
// src/components/songs/SongCard.jsx
import React from 'react';
import { usePlayer } from '../PlayerContext';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Chip } from '@mui/material';
import { PlayArrow, Pause, FavoriteBorder, MoreVert, AccessTime } from '@mui/icons-material';

const SongCard = ({ song }) => {
  const { currentSong, isPlaying, playSong, pause } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;
  const isPlayingCurrent = isCurrentSong && isPlaying;

  const handlePlayClick = async (e) => {
    e.stopPropagation();
    if (isCurrentSong && isPlaying) {
      await pause();
    } else {
      await playSong(song);
    }
  };

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 1, borderRadius: 2 }}>
      <Box sx={{ width: 40 }}>
        <IconButton size="small" onClick={handlePlayClick}>
          {isPlayingCurrent ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
        </IconButton>
      </Box>
      
      <CardMedia
        component="img"
        sx={{ width: 48, height: 48, borderRadius: 1, mx: 2 }}
        image={song.cover || '/default-cover.jpg'}
        alt={song.title}
      />
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" noWrap fontWeight={isCurrentSong ? 600 : 400}>
          {song.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {song.artist}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTime fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          {song.duration ? \`\${Math.floor(song.duration / 60)}:\${(song.duration % 60).toString().padStart(2, '0')}\` : '--:--'}
        </Typography>
      </Box>
    </Card>
  );
};

export default SongCard;
      `);
    }
    
    // Si falta clearResults
    if (diagnostics.errors.some(e => e.includes('clearResults'))) {
      console.log('\n2. Solución para clearResults:');
      console.log(`
// En tu componente, usa useSimpleSearch en lugar de useSearch:
import { useSimpleSearch } from '../hooks/useSearch';

const MyComponent = () => {
  const { results, loading, error, search, clearResults } = useSimpleSearch();
  // clearResults ahora estará disponible
};
      `);
    }
    
    // Si la estructura de datos es incorrecta
    if (diagnostics.dataStructure && !diagnostics.dataStructure.hasCorrectStructure) {
      console.log('\n3. Corregir estructura de datos:');
      console.log(`
// En useSearch.js, asegurar que transformAndPrioritizeResults devuelva:
return {
  songs: [...],      // Array de canciones
  artists: [...],    // Array de artistas
  suggestions: [...] // Array de sugerencias
};
      `);
    }

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  } finally {
    console.groupEnd();
    
    // Devolver diagnóstico para uso programático
    return diagnostics;
  }
};

// Función para ejecutar desde consola del navegador
export const quickDiagnostic = () => {
  console.log('🚀 Ejecutando diagnóstico rápido...');
  
  // Verificar componentes básicos
  const checks = {
    'PlayerContext': () => {
      try {
        const ctx = require('../components/PlayerContext');
        return !!ctx.usePlayer;
      } catch {
        return false;
      }
    },
    'SongCard': () => {
      try {
        require('../components/songs/SongCard');
        return true;
      } catch {
        return false;
      }
    },
    'SearchBar': () => {
      try {
        const sb = require('../components/search/SearchBar');
        return !!sb.default;
      } catch {
        return false;
      }
    },
    'useSearch tiene clearResults': () => {
      try {
        const hook = require('../hooks/useSearch');
        const instance = hook.useSimpleSearch ? hook.useSimpleSearch() : null;
        return instance && typeof instance.clearResults === 'function';
      } catch {
        return false;
      }
    }
  };
  
  Object.entries(checks).forEach(([name, check]) => {
    try {
      const result = check();
      console.log(`${result ? '✅' : '❌'} ${name}`);
    } catch (e) {
      console.log(`❌ ${name}: Error - ${e.message}`);
    }
  });
};

// Para usar desde la consola del navegador
window.diagnoseApp = runFullDiagnostic;
window.quickCheck = quickDiagnostic;

console.log('🩺 Script de diagnóstico cargado. Usa:');
console.log('   diagnoseApp() - Para diagnóstico completo');
console.log('   quickCheck()  - Para verificación rápida');