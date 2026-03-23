// src/types/qrcode.react.d.ts
declare module 'qrcode.react' {
  import { CSSProperties } from 'react';
  ;
  export interface QRCodeProps {
    /**
     * The value to encode in the QR code
     */
    value: string;
    /**
     * The size of the QR code in pixels
     * @default 128
     */
    size?: number;
    /**
     * Error correction level
     * @default 'L'
     */
    level?: 'L' | 'M' | 'Q' | 'H';
    /**
     * Include margin around the QR code
     * @default false
     */
    includeMargin?: boolean;
    /**
     * Background color
     * @default '#FFFFFF'
     */
    bgColor?: string;
    /**
     * Foreground color
     * @default '#000000'
     */
    fgColor?: string;
    /**
     * Inline style for the SVG element
     */
    style?: CSSProperties;
    /**
     * Class name for the SVG element
     */
    className?: string;
    /**
     * Image settings for embedding an image in the QR code
     */
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate: boolean;
    };
    /**
     * Render as canvas or svg
     * @default 'canvas'
     */
    renderAs?: 'canvas' | 'svg';
  }
  
  const QRCode: React.ComponentType<QRCodeProps>;
  export default QRCode;
}