// shims.d.ts

// Permite importar archivos .jsx como módulos válidos
declare module "*.jsx" {
  const value: any;
  export default value;
}

// Permite importar archivos .ts, .tsx sin errores adicionales
declare module "*.tsx" {
  const value: any;
  export default value;
}

// Permite importar archivos CSS
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Para imágenes y assets estáticos
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
declare module "*.webp";
