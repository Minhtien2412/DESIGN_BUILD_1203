/**
 * Modern Theme - Minimalist Emerald Green + Black + White
 * Updated: 12/15/2025
 * 
 * Usage:
 * import { MODERN_COLORS } from '@/constants/modern-theme';
 * backgroundColor: MODERN_COLORS.primary
 */

export const MODERN_COLORS = {
  // Primary - Deep Emerald Green (Sophisticated)
  primary: '#0A6847',
  primaryLight: '#10B981',
  primaryDark: '#064E3B',
  primaryBg: '#E6F7F1',
  
  // Secondary - Charcoal Gray (Minimalist)
  secondary: '#4A4A4A',
  secondaryLight: '#6B6B6B',
  secondaryDark: '#1A1A1A',
  secondaryBg: '#F8F8F8',
  
  // Gradients (Subtle, Modern)
  gradientPrimary: ['#10B981', '#0A6847'],  // Emerald gradient
  gradientSecondary: ['#4A4A4A', '#1A1A1A'], // Charcoal gradient
  gradientPurple: ['#0A6847', '#064E3B'],   // Deep green (no purple)
  gradientBlue: ['#10B981', '#0A6847'],     // Use green instead
  
  // E-commerce Special (Emerald Theme)
  flashSale: '#0A6847',    // Deep emerald for hot items
  discount: '#10B981',     // Bright emerald for discounts
  new: '#10B981',         // Bright emerald for new items
  favorite: '#10B981',     // Bright emerald for wishlist
  
  // Neutrals - Clean Minimalist
  background: '#FFFFFF',   // Pure white background
  surface: '#FFFFFF',      // Pure white cards
  surfaceHover: '#F8F8F8', // Off-white hover
  border: '#E5E5E5',       // Light gray borders
  divider: '#E5E5E5',      // Light gray dividers
  
  // Gray Scale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Orange Scale (for warnings/alerts)
  orange50: '#FFF7ED',
  orange500: '#F97316',
  
  // Text (High Contrast)
  text: '#1A1A1A',         // Soft black primary text
  textSecondary: '#4A4A4A', // Charcoal secondary text
  textTertiary: '#737373',  // Gray tertiary text
  textDisabled: '#9E9E9E',  // Light gray disabled
  textOnPrimary: '#FFFFFF', // White on green
  
  // Semantic Colors (Minimalist - use blacks/greens)
  success: '#10B981',
  warning: '#0A6847',      // Use deep green instead of orange
  danger: '#1A1A1A',       // Use black instead of red (minimalist)
  info: '#0A6847',         // Use deep green
  error: '#EF4444',        // Error red for important alerts
  
  // Overlays (Darker for sophistication)
  overlay: 'rgba(10, 10, 10, 0.85)',
  overlayLight: 'rgba(10, 10, 10, 0.3)',
  overlayDark: 'rgba(10, 10, 10, 0.95)',
} as const;

/**
 * Modern Shadow Presets
 */
export const MODERN_SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

/**
 * Modern Spacing Scale (based on 4px grid)
 */
export const MODERN_SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Modern Border Radius
 */
export const MODERN_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

/**
 * Typography Scale
 */
export const MODERN_TYPOGRAPHY = {
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
  },
  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line Heights (absolute values for React Native)
  // React Native requires absolute pixel values, not multipliers
  lineHeight: {
    tight: 16,    // ~1.2x for small text
    normal: 20,   // ~1.5x for body text (sm=12, md=14)
    relaxed: 24,  // ~1.75x for larger text
  },
} as const;

/**
 * Helper function to create gradient background style
 * 
 * Usage:
 * import { LinearGradient } from 'expo-linear-gradient';
 * <LinearGradient colors={MODERN_COLORS.gradientPrimary} ...>
 */
export const createGradient = (colors: readonly string[]) => ({
  colors,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});

/**
 * Modern Dimensions
 */
import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MODERN_DIMENSIONS = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  
  // Product Grid (2 columns)
  productCardWidth: (SCREEN_WIDTH - (MODERN_SPACING.md * 2) - MODERN_SPACING.xs) / 2,
  
  // Common Heights
  headerHeight: 56,
  tabBarHeight: 60,
  searchBarHeight: 44,
  bannerHeight: 160,
  buttonHeight: 48,
  inputHeight: 48,
} as const;

/**
 * Export all as default for convenience
 */
export default {
  colors: MODERN_COLORS,
  shadows: MODERN_SHADOWS,
  spacing: MODERN_SPACING,
  radius: MODERN_RADIUS,
  typography: MODERN_TYPOGRAPHY,
  dimensions: MODERN_DIMENSIONS,
};
