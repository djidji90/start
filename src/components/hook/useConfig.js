// hook/useConfig.js
import { api } from "./services/apia"; // instancia Axios

export const useConfig = () => {
  return {
    api, // ahora devuelve directamente la instancia Axios
    // puedes agregar otras configs si quieres
    tiendaNumber: import.meta.env.VITE_TIENDA_NUMERO || 1,
    contact: {
      email: import.meta.env.VITE_CONTACT_EMAIL || "contacto@djidjimusic.com",
    },
    social: {
      facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || "https://facebook.com/djidjimusic",
    },
  };
};
