
export interface ColorInfo {
  hex: string;
  locked: boolean;
}

export interface Palette {
  id: string;
  name: string;
  colors: string[];
  timestamp: number;
}

export enum GenerationType {
  RANDOM = 'RANDOM',
  ANALOGOUS = 'ANALOGOUS',
  COMPLEMENTARY = 'COMPLEMENTARY',
  MONOCHROMATIC = 'MONOCHROMATIC',
  TRIADIC = 'TRIADIC',
  AI = 'AI'
}
