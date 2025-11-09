export const useConfig = () => {
  return {
    api: {
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
      tiendaNumber: import.meta.env.VITE_TIENDA_NUMERO || 1,
    },
    contact: {
      email: import.meta.env.VITE_CONTACT_EMAIL || "",
    },
    social: {
      instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || "",
    }
  };
};
