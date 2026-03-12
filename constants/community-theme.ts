/**
 * Community Theme - Minimalist Monochrome Design
 * Phong cách tối giản, hiện đại, thống nhất với tab bar
 * 
 * Màu sắc chủ đạo:
 * - Primary: #1a1a1a (đen - active state)
 * - Secondary: #9ca3af (xám - inactive state)
 * - Background: #fafafa (trắng sáng)
 * - Surface: #ffffff (trắng)
 * - Accent: #2d2d2d (xám đen - buttons)
 * 
 * @author AI Assistant
 * @date 16/01/2026
 */

export const COMMUNITY_COLORS = {
  // Primary colors - monochrome
  primary: '#1a1a1a',
  primaryLight: '#404040',
  primaryDark: '#000000',
  
  // Secondary/Gray scale
  secondary: '#9ca3af',
  secondaryLight: '#d1d5db',
  secondaryDark: '#6b7280',
  
  // Backgrounds
  background: '#fafafa',
  surface: '#ffffff',
  surfaceElevated: '#f5f5f5',
  
  // Text
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  
  // Accent colors (subtle, minimal use)
  accent: '#2d2d2d',
  accentLight: '#404040',
  
  // Status colors (muted)
  success: '#4ade80',
  warning: '#fbbf24', 
  error: '#f87171',
  info: '#60a5fa',
  
  // UI elements
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  divider: '#e5e7eb',
  
  // Interactive states
  pressed: '#f3f4f6',
  ripple: 'rgba(0, 0, 0, 0.08)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Gradient (subtle)
  gradientStart: '#1a1a1a',
  gradientEnd: '#404040',
};

export const COMMUNITY_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const COMMUNITY_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const COMMUNITY_TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const COMMUNITY_SHADOWS = {
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Animation durations
export const COMMUNITY_ANIMATIONS = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// Icon sizes
export const COMMUNITY_ICONS = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
};

export default {
  COLORS: COMMUNITY_COLORS,
  SPACING: COMMUNITY_SPACING,
  RADIUS: COMMUNITY_RADIUS,
  TYPOGRAPHY: COMMUNITY_TYPOGRAPHY,
  SHADOWS: COMMUNITY_SHADOWS,
  ANIMATIONS: COMMUNITY_ANIMATIONS,
  ICONS: COMMUNITY_ICONS,
};
