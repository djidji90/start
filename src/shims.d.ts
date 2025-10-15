// Permite importar cualquier archivo JSX
declare module "*.jsx" {
  import type { FC } from "react";
  const component: FC<any>;
  export default component;
}

// Permite importar archivos CSS
declare module "*.css";

// Permite importar imágenes si las usas en React
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
