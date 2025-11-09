import { config } from "../../config";

export const useConfig = () => {
  return {
    api: {
      baseURL: config.API_URL,
      tiendaNumber: config.TIENDA_NUMERO
    },
    contact: config.CONTACT,
    social: config.SOCIAL
  };
};