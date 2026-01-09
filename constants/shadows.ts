/**
 * Shadow System
 * Platform-specific elevation and shadow definitions
 */


// Shadow levels (0-5)
export const ShadowLevels = {
  0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // @ts-ignore
  },
  
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1, // @ts-ignore
  },
  
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2, // @ts-ignore
  },
  
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // @ts-ignore
  },
  
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4, // @ts-ignore
  },
  
  5: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5, // @ts-ignore
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
  tabBar: ShadowLevels[2],
  
  // Header
  header: ShadowLevels[1],
  
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
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4, // @ts-ignore
  }),
  
  secondary: (opacity: number = 0.3) => ({
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4, // @ts-ignore
  }),
  
  success: (opacity: number = 0.3) => ({
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4, // @ts-ignore
  }),
  
  error: (opacity: number = 0.3) => ({
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4, // @ts-ignore
  }),
  
  warning: (opacity: number = 0.3) => ({
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4, // @ts-ignore
  }),
  
  info: (opacity: number = 0.3) => ({
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4, // @ts-ignore
  }),
} as const;

export type ShadowLevel = keyof typeof ShadowLevels;
export type SemanticShadow = keyof typeof Shadows;
