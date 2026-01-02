/**
 * Modern Minimalist Design System
 * Emerald Green - Black - White palette
 * Sophisticated, Clean, Timeless
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Primary colors (Deep Emerald Green)
    primary: '#0A6847',           // Deep emerald green
    secondary: '#4A4A4A',         // Charcoal gray
    accent: '#10B981',            // Bright emerald
    
    // Semantic colors
    success: '#10B981',           // Bright green
    warning: '#0A6847',           // Deep green
    error: '#1A1A1A',             // Black (minimalist)
    info: '#0A6847',              // Deep green
    
    // Text colors (High contrast)
    text: '#1A1A1A',              // Soft black
    textMuted: '#6B6B6B',         // Medium gray
    textInverse: '#FFFFFF',       // Pure white
    
    // Background colors (Clean white base)
    background: '#FFFFFF',        // Pure white
    surface: '#FFFFFF',           // Pure white
    surfaceMuted: '#F8F8F8',      // Off white
    surfaceAlt: '#F8F8F8',        // Off white
    card: '#FFFFFF',              // Pure white cards
    
    // Border colors (Subtle)
    border: '#E5E5E5',            // Very light border
    borderStrong: '#9E9E9E',      // Medium border
    
    // Tab bar
    tabIconDefault: '#6B6B6B',    // Gray
    tabIconSelected: '#0A6847',   // Deep emerald
    
    // Legacy compatibility
    tint: '#0A6847',              // Deep emerald
    icon: '#1A1A1A',              // Soft black
    danger: '#1A1A1A',
    shadow: 'rgba(0,0,0,0.05)',   // Very subtle shadow
    overlay: 'rgba(10,10,10,0.85)',
    chipBackground: '#F8F8F8',
    chipText: '#4A4A4A',
    accentSoft: '#E6F7F1',        // Light emerald tint
    
    // Additional elements
    gold: '#0A6847',
    goldLight: '#E6F7F1',
    goldDark: '#064E3B',
    marble: '#F8F8F8',
    charcoal: '#1A1A1A',
  },
  dark: {
    // Primary colors (dark mode)
    primary: '#10B981',           // Bright emerald
    secondary: '#9E9E9E',         // Light gray
    accent: '#10B981',            // Bright emerald
    
    // Semantic colors
    success: '#10B981',           // Bright green
    warning: '#10B981',           // Bright green
    error: '#E5E5E5',             // Light gray
    info: '#10B981',              // Bright green
    
    // Text colors (dark contrast)
    text: '#FAFAFA',              // Off white
    textMuted: '#9E9E9E',         // Light gray
    textInverse: '#0A0A0A',       // Pure black
    
    // Background colors (Deep black base)
    background: '#0A0A0A',        // Pure black
    surface: '#1A1A1A',           // Soft black
    surfaceMuted: '#2D2D2D',      // Dark gray
    surfaceAlt: '#2D2D2D',        // Dark gray
    card: '#1A1A1A',              // Soft black cards
    
    // Border colors
    border: '#2D2D2D',            // Dark border
    borderStrong: '#4A4A4A',      // Medium border
    
    // Tab bar
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#10B981',   // Bright emerald
    
    // Legacy compatibility
    tint: '#10B981',
    icon: '#FAFAFA',
    danger: '#E5E5E5',
    shadow: 'rgba(0,0,0,0.4)',
    overlay: 'rgba(10,10,10,0.9)',
    chipBackground: '#2D2D2D',
    chipText: '#10B981',
    accentSoft: '#0A2D20',
    
    // Additional elements
    gold: '#0A6847',
    goldLight: '#2A3A2A',
    goldDark: '#3A8A3A',
    marble: '#1E1E1E',
    charcoal: '#121212',
  },
};

// Default colors export for backward compatibility
// Use Colors.light or Colors.dark for theme-aware colors
export const DefaultColors = Colors.light;

// Common color shortcuts (default to light theme)
export const { 
  primary, 
  secondary, 
  accent, 
  success, 
  warning, 
  error, 
  info,
  text, 
  textMuted, 
  textInverse,
  background, 
  surface, 
  border 
} = Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
