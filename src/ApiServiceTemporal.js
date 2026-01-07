// src/services/ApiServiceTemporal.js
class ApiServiceTemporal {
  constructor() {
    this.baseURL = 'https://api.djidjimusic.com';
    this.useProxy = import.meta.env.DEV;
  }

  async request(endpoint, options = {}) {
    const url = this.useProxy 
      ? `/proxy${endpoint}`  // Configurar proxy en vite.config.js
      : `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    try {
      const response = await fetch(url, config);
      
      // Si es error CORS, intentar con proxy público
      if (response.status === 0 && this.useProxy) {
        console.log('⚠️ CORS error, usando proxy público...');
        return this.requestViaPublicProxy(endpoint, options);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async requestViaPublicProxy(endpoint, options) {
    // Proxy público temporal
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(this.baseURL + endpoint)}`;
    
    const response = await fetch(proxyUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });

    return await response.json();
  }

  async testConnection() {
    return this.request('/api2/health/');
  }

  async getSongs(limit = 5) {
    return this.request(`/api2/songs/?limit=${limit}`);
  }
}

export default new ApiServiceTemporal();