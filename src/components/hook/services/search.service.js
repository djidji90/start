// src/services/search.service.js
import axios from 'axios';

const API_BASE_URL = 'https://api.djidjimusic.com';

class SearchService {
  constructor() {
    this.controller = null;
  }

  // Cancelar request anterior
  cancelPreviousRequest() {
    if (this.controller) {
      this.controller.abort();
    }
    this.controller = new AbortController();
    return this.controller.signal;
  }

  // Búsqueda de sugerencias
  async searchSuggestions(query, signal) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_BASE_URL}/api2/suggestions/?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          signal,
        }
      );

      return response.data || [];
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelado:', error.message);
        return [];
      }
      console.error('Error en búsqueda:', error);
      throw error;
    }
  }

  // Búsqueda completa (canciones + artistas)
// En tu search.service.js, REEMPLAZAR searchAll con esta versión:

async searchAll(query, signal, maxResults = 50) {
  if (!query || query.trim().length < 2) {
    return {
      songs: [],
      artists: [],
      suggestions: [],
      albums: [],
      playlists: [],
      _metadata: { query: '', source: 'empty' }
    };
  }

  try {
    const token = localStorage.getItem('accessToken');
    
    // ✅ USAR EL NUEVO ENDPOINT COMPLETE_SEARCH
    const response = await axios.get(
      `${API_BASE_URL}/api2/search/complete/?q=${encodeURIComponent(query)}&limit=${maxResults}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'X-Request-Source': 'frontend-search'
        },
        signal,
        timeout: 10000 // 10 segundos timeout
      }
    );

    // ✅ LA RESPUESTA YA VIENE EN EL FORMATO CORRECTO
    return {
      songs: response.data.songs || [],
      artists: response.data.artists || [],
      suggestions: response.data.suggestions || [],
      albums: response.data.albums || [],
      playlists: response.data.playlists || [],
      _metadata: {
        ...response.data._metadata,
        normalized: true
      }
    };

  } catch (error) {
    if (axios.isCancel(error)) {
      return { 
        songs: [], artists: [], suggestions: [], albums: [], playlists: [],
        _metadata: { query, source: 'cancelled' }
      };
    }
    
    console.error('[SearchService] Error en búsqueda completa:', error);
    
    // ✅ FALLBACK: Si el nuevo endpoint falla, usar los viejos
    return await this._legacySearchAll(query, signal, maxResults);
  }
}

// ✅ MÉTODO DE FALLBACK (usar endpoints existentes)
async _legacySearchAll(query, signal, maxResults) {
  try {
    const token = localStorage.getItem('accessToken');
    
    const [songsResponse, artistsResponse, suggestionsResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/api2/songs/?search=${encodeURIComponent(query)}&limit=${maxResults}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        signal,
      }),
      axios.get(`${API_BASE_URL}/api2/artists/?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        signal,
      }),
      this.searchSuggestions(query, { signal }),
    ]);

    return {
      songs: songsResponse.data?.results || songsResponse.data || [],
      artists: artistsResponse.data?.artists || artistsResponse.data || [],
      suggestions: suggestionsResponse,
      albums: [],
      playlists: [],
      _metadata: {
        query,
        timestamp: Date.now(),
        source: 'legacy_fallback',
        total: 0
      }
    };
  } catch (error) {
    throw error;
  }
}

  // Cache simple en memoria (opcional para performance)
  cache = new Map();
  
  async searchWithCache(query, signal) {
    const cacheKey = query.toLowerCase().trim();
    
    // Si la query es muy corta, no cacheamos
    if (cacheKey.length < 3) {
      return this.searchAll(query, signal);
    }

    // Verificar cache (válido por 5 minutos)
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < 300000) { // 5 minutos
      return cached.data;
    }

    // Hacer búsqueda real
    const data = await this.searchAll(query, signal);
    
    // Actualizar cache
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
    });

    return data;
  }
}

export const searchService = new SearchService();