/**
 * Spacing System
 * 4px base unit system for consistent spacing
 */

const BASE_UNIT = 4;

export const Spacing = {
  0: 0,
  1: BASE_UNIT * 1,      // 4px
  2: BASE_UNIT * 2,      // 8px
  3: BASE_UNIT * 3,      // 12px
  4: BASE_UNIT * 4,      // 16px
  5: BASE_UNIT * 5,      // 20px
  6: BASE_UNIT * 6,      // 24px
  7: BASE_UNIT * 7,      // 28px
  8: BASE_UNIT * 8,      // 32px
  9: BASE_UNIT * 9,      // 36px
  10: BASE_UNIT * 10,    // 40px
  12: BASE_UNIT * 12,    // 48px
  14: BASE_UNIT * 14,    // 56px
  16: BASE_UNIT * 16,    // 64px
  20: BASE_UNIT * 20,    // 80px
  24: BASE_UNIT * 24,    // 96px
  32: BASE_UNIT * 32,    // 128px
} as const;

// Semantic spacing names
export const SpacingSemantic = {
  xs: Spacing[1],       // 4px
  sm: Spacing[2],       // 8px
  md: Spacing[4],       // 16px
  lg: Spacing[6],       // 24px
  xl: Spacing[8],       // 32px
  '2xl': Spacing[12],   // 48px
  '3xl': Spacing[16],   // 64px
} as const;

// Layout spacing
export const Layout = {
  // Container padding
  containerPadding: {
    horizontal: Spacing[4],  // 16px
    vertical: Spacing[4],    // 16px
  },
  
  // Section spacing
  sectionMargin: Spacing[6],  // 24px
  
  // Card spacing
  cardPadding: Spacing[4],    // 16px
  cardMargin: Spacing[3],     // 12px
  cardGap: Spacing[3],        // 12px
  
  // List spacing
  listItemPadding: Spacing[4],  // 16px
  listItemGap: Spacing[2],      // 8px
  
  // Form spacing
  formFieldGap: Spacing[4],     // 16px
  formSectionGap: Spacing[6],   // 24px
  
  // Button spacing
  buttonPadding: {
    horizontal: Spacing[6],     // 24px
    vertical: Spacing[3],       // 12px
  },
  buttonGap: Spacing[2],        // 8px
  
  // Screen padding
  screenPadding: {
    horizontal: Spacing[4],     // 16px
    vertical: Spacing[4],       // 16px
  },
  
  // Tab bar
  tabBarHeight: 60,
  tabBarPadding: Spacing[2],    // 8px
  
  // Header
  headerHeight: 56,
  headerPadding: Spacing[4],    // 16px
  
  // Bottom sheet
  bottomSheetRadius: Spacing[5], // 20px
  bottomSheetPadding: Spacing[5], // 20px
} as const;

// Responsive breakpoints
export const Breakpoints = {
  sm: 320,   // Small phones
  md: 375,   // Medium phones
  lg: 414,   // Large phones
  xl: 768,   // Tablets
  '2xl': 1024, // Large tablets / Small laptops
} as const;

// Border radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// Semantic border radius
export const BorderRadiusSemantic = {
  button: BorderRadius.md,       // 8px
  card: BorderRadius.lg,         // 12px
  input: BorderRadius.md,        // 8px
  modal: BorderRadius.xl,        // 16px
  bottomSheet: BorderRadius['2xl'], // 20px
  avatar: BorderRadius.full,     // Circle
  badge: BorderRadius.full,      // Pill
} as const;

// Icon sizes
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// Avatar sizes
export const AvatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
  '3xl': 96,
} as const;

export type SpacingKey = keyof typeof Spacing;
export type SpacingValue = typeof Spacing[SpacingKey];
