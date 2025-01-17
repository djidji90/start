export const apiClient = async (endpoint, options = {}) => {
    const BASE_URL = "https://api.tumusica.com"; // Cambia por tu URL real
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);
  
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText} (${response.status})`);
    }
  
    return await response.json();
  };
  