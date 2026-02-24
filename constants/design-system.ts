/**
 * Design System - UI/UX Optimization
 * Centralized design tokens and spacing system
 */

// ===== COLOR SYSTEM =====
export const ColorSystem = {
  // Primary Brand Colors (Professional Blue)
  primary: {
    main: '#0D9488',      // Professional blue
    light: '#3399FF',     // Light blue
    dark: '#004C99',      // Dark blue
    contrast: '#FFFFFF',   // Text trên primary
  },

  // Secondary Colors (Neutral Gray)
  secondary: {
    main: '#333333',      // Dark gray
    light: '#666666',     // Medium gray
    dark: '#000000',      // Pure black
    contrast: '#FFFFFF',
  },

  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#999999',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic Colors (Blue tones only)
  success: {
    main: '#0D9488',
    light: '#3399FF',
    dark: '#004C99',
    bg: '#E6F2FF',
  },

  error: {
    main: '#000000',
    light: '#333333',
    dark: '#000000',
    bg: '#F5F5F5',
  },

  warning: {
    main: '#14B8A6',
    light: '#33A3FF',
    dark: '#0D9488',
    bg: '#E6F2FF',
  },

  info: {
    main: '#0D9488',
    light: '#3399FF',
    dark: '#004C99',
    bg: '#E6F2FF',
  },

  // Background Colors
  background: {
    default: '#FFFFFF',
    paper: '#F9FAFB',
    elevated: '#FFFFFF',
    dark: '#111827',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    hint: '#D1D5DB',
  },

  // Border Colors
  border: {
    main: '#E5E7EB',
    light: '#F3F4F6',
    dark: '#D1D5DB',
  },

  // Overlay
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
};

// ===== SPACING SYSTEM (8px base) =====
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Component-specific
  cardPadding: 16,
  sectionPadding: 16,
  screenPadding: 16,
  gridGap: 8,
  listGap: 12,
};

// ===== TYPOGRAPHY SYSTEM =====
export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font Sizes
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights (Stronger by default)
  fontWeight: {
    regular: '500',      // Increased from 400
    medium: '600',       // Increased from 500
    semibold: '700',     // Increased from 600
    bold: '800',         // Increased from 700
    extrabold: '900',    // Increased from 800
  },

  // Text Styles (Bolder fonts)
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '800',   // Increased
      lineHeight: 1.2,
      color: ColorSystem.text.primary,
    },
    h2: {
      fontSize: 24,
      fontWeight: '800',   // Increased
      lineHeight: 1.3,
      color: ColorSystem.text.primary,
    },
    h3: {
      fontSize: 20,
      fontWeight: '700',   // Increased
      lineHeight: 1.4,
      color: ColorSystem.text.primary,
    },
    h4: {
      fontSize: 18,
      fontWeight: '700',   // Increased
      lineHeight: 1.4,
      color: ColorSystem.text.primary,
    },
    body1: {
      fontSize: 16,
      fontWeight: '500',   // Increased from 400
      lineHeight: 1.5,
      color: ColorSystem.text.primary,
    },
    body2: {
      fontSize: 14,
      fontWeight: '500',   // Increased from 400
      lineHeight: 1.5,
      color: ColorSystem.text.primary,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',   // Increased from 400
      lineHeight: 1.4,
      color: ColorSystem.text.secondary,
    },
    overline: {
      fontSize: 11,
      fontWeight: '700',   // Increased
      lineHeight: 1.5,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: ColorSystem.text.secondary,
    },
  },
};

// ===== BORDER RADIUS =====
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

// ===== SHADOWS =====
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

// ===== COMPONENT SIZES =====
export const ComponentSizes = {
  button: {
    small: {
      height: 32,
      paddingHorizontal: 12,
      fontSize: 12,
    },
    medium: {
      height: 40,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    large: {
      height: 48,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  },
  input: {
    small: {
      height: 36,
      fontSize: 13,
    },
    medium: {
      height: 44,
      fontSize: 14,
    },
    large: {
      height: 52,
      fontSize: 16,
    },
  },
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  },
};

// ===== LAYOUT CONSTANTS =====
export const Layout = {
  // Screen Dimensions
  screenPadding: Spacing.md,
  maxContentWidth: 1200,

  // Grid System
  grid: {
    columns: 12,
    gutter: Spacing.sm,
  },

  // Card Layouts
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadow: Shadows.sm,
  },

  // Header Heights
  header: {
    default: 56,
    large: 64,
  },

  // Bottom Tab Bar
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
};

// ===== ANIMATION TIMINGS =====
export const AnimationTimings = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// ===== Z-INDEX LAYERS =====
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// ===== BREAKPOINTS (for responsive design) =====
export const Breakpoints = {
  xs: 0,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get responsive value based on screen width
 */
export const getResponsiveValue = (
  width: number,
  values: { xs?: any; sm?: any; md?: any; lg?: any; xl?: any }
) => {
  if (width >= Breakpoints.xl) return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.xs;
  if (width >= Breakpoints.lg) return values.lg ?? values.md ?? values.sm ?? values.xs;
  if (width >= Breakpoints.md) return values.md ?? values.sm ?? values.xs;
  if (width >= Breakpoints.sm) return values.sm ?? values.xs;
  return values.xs;
};

/**
 * Create consistent card style
 */
export const createCardStyle = (elevated = false) => ({
  backgroundColor: ColorSystem.background.paper,
  borderRadius: BorderRadius.lg,
  padding: Spacing.cardPadding,
  ...(elevated ? Shadows.md : {}),
  borderWidth: 1,
  borderColor: ColorSystem.border.light,
});

/**
 * Create section container style
 */
export const createSectionStyle = () => ({
  paddingHorizontal: Spacing.sectionPadding,
  marginBottom: Spacing.lg,
});

/**
 * Export all design tokens
 */
export const DesignSystem = {
  colors: ColorSystem,
  spacing: Spacing,
  typography: Typography,
  borderRadius: BorderRadius,
  shadows: Shadows,
  sizes: ComponentSizes,
  layout: Layout,
  animation: AnimationTimings,
  zIndex: ZIndex,
  breakpoints: Breakpoints,
  utils: {
    getResponsiveValue,
    createCardStyle,
    createSectionStyle,
  },
};

export default DesignSystem;
