// services/ProductionApiService.js - VERSIÓN ROBUSTA
class ProductionApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://api.djidjimusic.com';
  }

  async request(endpoint, options = {}) {
    const url = this.baseURL + endpoint;
    
    const config = {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    try {
      console.log(`📤 Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      // Verificar content-type
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!isJson) {
        // Si no es JSON, leer como texto para debugging
        const text = await response.text();
        console.warn(`⚠️ Respuesta no JSON: ${contentType}`, text.substring(0, 200));
        
        // Si es HTML, probablemente es una página de error 404
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error(`Endpoint no encontrado (${response.status}): ${endpoint}`);
        }
        
        throw new Error(`Respuesta no válida: ${contentType}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.detail || 'Error desconocido'}`);
      }
      
      return data;
      
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // Solo endpoints que sabemos que funcionan
  async testConnection() {
    return this.request('/api2/health/');
  }

  async getSongs(limit = 5) {
    return this.request(`/api2/songs/?limit=${limit}`);
  }

  async getSong(id) {
    return this.request(`/api2/songs/${id}/`);
  }

  // Endpoints opcionales (podrían no existir)
  async getArtists() {
    try {
      return await this.request('/api2/artists/');
    } catch (error) {
      console.warn('Endpoint /api2/artists/ no disponible');
      return { results: [] };
    }
  }

  async getEvents() {
    try {
      return await this.request('/api2/events/');
    } catch (error) {
      console.warn('Endpoint /api2/events/ no disponible');
      return { results: [] };
    }
  }
}

export default new ProductionApiService();