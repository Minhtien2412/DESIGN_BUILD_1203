import type { ColorSchemeName } from 'react-native';

export type DesignPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentFg: string;
  icon: string;
  chipBackground: string;
  chipText: string;
  shadow: string;
  overlay: string;
};

const lightPalette: DesignPalette = {
  background: '#F7FAF1',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF4E1',
  surfaceAlt: '#E6F1D6',
  border: '#DCE5C8',
  borderStrong: '#C3D29F',
  text: '#1F2612',
  textMuted: '#5E6B4A',
  accent: '#6A9330',
  accentSoft: '#90B44C',
  accentFg: '#FFFFFF',
  icon: '#4D5A33',
  chipBackground: '#E6F1D6',
  chipText: '#394425',
  shadow: 'rgba(87, 122, 43, 0.14)',
  overlay: 'rgba(30, 41, 18, 0.08)',
};

const darkPalette: DesignPalette = {
  background: '#0B1206',
  surface: '#131E0C',
  surfaceMuted: '#1B2A12',
  surfaceAlt: '#243416',
  border: 'rgba(157, 185, 120, 0.34)',
  borderStrong: 'rgba(165, 214, 106, 0.5)',
  text: '#E6F4D6',
  textMuted: 'rgba(218, 235, 201, 0.78)',
  accent: '#A5D66A',
  accentSoft: '#8FCF58',
  accentFg: '#0E1605',
  icon: '#C1D8A9',
  chipBackground: 'rgba(165, 214, 106, 0.16)',
  chipText: '#E8F7D0',
  shadow: 'rgba(6, 11, 3, 0.6)',
  overlay: 'rgba(9, 15, 5, 0.42)',
};

export const DesignPaletteMap: Record<'light' | 'dark', DesignPalette> = {
  light: lightPalette,
  dark: darkPalette,
};

export function getDesignPalette(scheme: ColorSchemeName | null | undefined): DesignPalette {
  if (scheme === 'dark') return darkPalette;
  return lightPalette;
}
