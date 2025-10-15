// global.d.ts

// Permitir importar archivos de estilos
declare module "*.css";
declare module "*.scss";
declare module "*.sass";

// Permitir importar imágenes y multimedia
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
declare module "*.mp3";
declare module "*.wav";
declare module "*.ogg";

// Permitir importar archivos JSON
declare module "*.json";

// Tipado global para import.meta.env (variables de entorno de Vite)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  // Añade más variables si las usas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
