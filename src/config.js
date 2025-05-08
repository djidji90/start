export const config = {
    API_URL: import.meta.env.VITE_API_BASE_URL,
    TIENDA_NUMERO: import.meta.env.VITE_TIENDA_NUMERO,
    CONTACT: {
      PHONE: import.meta.env.VITE_CONTACT_PHONE,
      EMAIL: import.meta.env.VITE_CONTACT_EMAIL,
      ADDRESS: import.meta.env.VITE_CONTACT_ADDRESS
    },
    SOCIAL: {
      FACEBOOK: import.meta.env.VITE_SOCIAL_FACEBOOK,
      INSTAGRAM: import.meta.env.VITE_SOCIAL_INSTAGRAM,
      LINKEDIN: import.meta.env.VITE_SOCIAL_LINKEDIN
    },
    
    // Validación solo en desarrollo
    ...(import.meta.env.DEV && {
      validate() {
        const required = [
          'VITE_API_BASE_URL',
          'VITE_TIENDA_NUMERO',
          'VITE_CONTACT_PHONE',
          'VITE_CONTACT_EMAIL'
        ];
        
        required.forEach(variable => {
          if (!import.meta.env[variable]) {
            console.error(`Falta variable de entorno requerida: ${variable}`);
          }
        });
      }
    })
  };
  
  if (import.meta.env.DEV) config.validate?.();