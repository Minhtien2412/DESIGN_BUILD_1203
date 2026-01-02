/**
 * Modern Minimalist Theme
 * Primary Colors: Green, Black, White
 * Design Philosophy: Clean, Sophisticated, Timeless
 */

export const ModernTheme = {
  // Primary Palette - Green, Black, White
  colors: {
    // Primary Green (Sophisticated Emerald)
    primary: {
      main: '#0A6847',        // Deep emerald green
      light: '#10B981',       // Bright emerald  
      dark: '#064E3B',        // Forest green
      contrast: '#FFFFFF',    // White text on green
    },
    
    // Neutral Blacks & Grays
    neutral: {
      black: '#0A0A0A',       // Pure black
      charcoal: '#1A1A1A',    // Soft black
      gray900: '#2D2D2D',     // Dark gray
      gray700: '#4A4A4A',     // Medium gray
      gray500: '#6B6B6B',     // Mid gray
      gray300: '#9E9E9E',     // Light gray
      gray100: '#E5E5E5',     // Very light gray
      white: '#FFFFFF',       // Pure white
    },
    
    // Surfaces
    surface: {
      primary: '#FFFFFF',     // White background
      secondary: '#F8F8F8',   // Off-white
      elevated: '#FFFFFF',    // Elevated cards
      overlay: 'rgba(10, 10, 10, 0.85)',  // Black overlay
    },
    
    // Accent (minimal use)
    accent: {
      success: '#10B981',     // Green success
      error: '#1A1A1A',       // Black for errors (minimalist)
      warning: '#0A6847',     // Green warning
      info: '#0A6847',        // Green info
    },
    
    // Text
    text: {
      primary: '#1A1A1A',     // Dark text
      secondary: '#4A4A4A',   // Medium text
      tertiary: '#6B6B6B',    // Light text
      inverse: '#FFFFFF',     // White text
      disabled: '#9E9E9E',    // Disabled text
    },
    
    // Borders
    border: {
      light: '#E5E5E5',       // Light border
      medium: '#9E9E9E',      // Medium border
      dark: '#4A4A4A',        // Dark border
    },
  },
  
  // Typography (Modern Minimalist)
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 21,
      xxl: 28,
      xxxl: 36,
    },
    fontWeight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      black: '800' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
    },
  },
  
  // Spacing (8pt grid system)
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  // Shadows (Subtle elevation)
  shadows: {
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
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Animation
  animation: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      standard: 'ease-in-out',
      accelerate: 'ease-in',
      decelerate: 'ease-out',
    },
  },
};

// Export individual parts for convenience
export const colors = ModernTheme.colors;
export const typography = ModernTheme.typography;
export const spacing = ModernTheme.spacing;
export const borderRadius = ModernTheme.borderRadius;
export const shadows = ModernTheme.shadows;
export const animation = ModernTheme.animation;

export default ModernTheme;
