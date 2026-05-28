export type DesignLayer = {
  id: string;
  name: string;
  type: 'text' | 'box' | 'service-list';

  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;

  text?: string;
  services?: string[];

  fontSize?: number;
  fontWeight?: number;
  color?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
};