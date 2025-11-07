/**
 * Shadow System
 * Platform-specific elevation and shadow definitions
 */

import { Platform } from 'react-native';

// Shadow levels (0-5)
export const ShadowLevels = {
  0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  
  5: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

// Semantic shadows
export const Shadows = {
  // Card shadows
  card: ShadowLevels[2],
  cardHover: ShadowLevels[3],
  cardPressed: ShadowLevels[1],
  
  // Button shadows
  button: ShadowLevels[2],
  buttonHover: ShadowLevels[3],
  buttonPressed: ShadowLevels[1],
  
  // Modal shadows
  modal: ShadowLevels[4],
  modalLarge: ShadowLevels[5],
  
  // Bottom sheet
  bottomSheet: ShadowLevels[4],
  
  // Floating action button
  fab: ShadowLevels[3],
  fabHover: ShadowLevels[4],
  
  // Tab bar
  tabBar: Platform.select({
    ios: ShadowLevels[3],
    android: ShadowLevels[2],
    default: ShadowLevels[2],
  }),
  
  // Header
  header: Platform.select({
    ios: ShadowLevels[2],
    android: ShadowLevels[1],
    default: ShadowLevels[1],
  }),
  
  // Dropdown/Select
  dropdown: ShadowLevels[3],
  
  // Toast/Alert
  toast: ShadowLevels[3],
  
  // Image
  image: ShadowLevels[1],
  imageHover: ShadowLevels[2],
  
  // None
  none: ShadowLevels[0],
} as const;

// Helper function to get shadow by level
export const getShadow = (level: keyof typeof ShadowLevels) => {
  return ShadowLevels[level];
};

// Helper function to create custom shadow
export const createShadow = (
  offsetHeight: number,
  opacity: number,
  radius: number,
  elevation: number = offsetHeight
) => {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetHeight },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

// Color-specific shadows (for colored cards/buttons)
export const ColoredShadows = {
  primary: (opacity: number = 0.3) => ({
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4,
  }),
  
  secondary: (opacity: number = 0.3) => ({
    shadowColor: '#90B44C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4,
  }),
  
  success: (opacity: number = 0.3) => ({
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4,
  }),
  
  error: (opacity: number = 0.3) => ({
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4,
  }),
  
  warning: (opacity: number = 0.3) => ({
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4,
  }),
  
  info: (opacity: number = 0.3) => ({
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4,
  }),
} as const;

export type ShadowLevel = keyof typeof ShadowLevels;
export type SemanticShadow = keyof typeof Shadows;
