/**
 * Modern Design System for Construction Management App
 * Professional teal/cyan color scheme with excellent contrast
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
  // Primary brand colors (Grab-like Green palette)
  primary: '#00B14F',           // Grab primary green
  secondary: '#008C3B',         // Darker green for emphasis
  accent: '#00C853',            // Bright accent green
    
    // Semantic colors
    success: '#10B981',           // Green
    warning: '#F59E0B',           // Amber
    error: '#EF4444',             // Red
    info: '#3B82F6',              // Blue
    
    // Text colors
    text: '#111827',              // Almost black
    textMuted: '#6B7280',         // Gray
    textInverse: '#FFFFFF',       // White for dark backgrounds
    
    // Background colors
    background: '#F9FAFB',        // Light gray
    surface: '#FFFFFF',           // White
    surfaceMuted: '#F3F4F6',      // Slightly darker
    surfaceAlt: '#E5E7EB',        // Alternative surface
    
    // Border colors
    border: '#E5E7EB',            // Light border
    borderStrong: '#D1D5DB',      // Stronger border
    
  // Tab bar (white/black as requested)
  tabIconDefault: '#9CA3AF',    // Inactive gray
  tabIconSelected: '#111827',   // Active black
    
    // Legacy (for compatibility)
  tint: '#00B14F',
  icon: '#111827',
    danger: '#EF4444',
    shadow: 'rgba(0,0,0,0.1)',
    overlay: 'rgba(0,0,0,0.5)',
    chipBackground: '#E6F6EC',    // Softer green background
    chipText: '#0E7A3E',
    accentSoft: '#8BE6A2',
  },
  dark: {
    // Primary brand colors (Grab-like for dark mode)
    primary: '#00C853',           // Slightly brighter for dark mode
    secondary: '#00B14F',         // Base green
    accent: '#4EEA8B',            // Bright accent
    
    // Semantic colors
    success: '#34D399',           // Lighter green
    warning: '#FBBF24',           // Lighter amber
    error: '#F87171',             // Lighter red
    info: '#60A5FA',              // Lighter blue
    
    // Text colors
    text: '#F9FAFB',              // Almost white
    textMuted: '#9CA3AF',         // Light gray
    textInverse: '#111827',       // Dark for light backgrounds
    
    // Background colors
    background: '#111827',        // Dark gray
    surface: '#1F2937',           // Slightly lighter
    surfaceMuted: '#374151',      // Even lighter
    surfaceAlt: '#4B5563',        // Alternative surface
    
    // Border colors
    border: '#374151',            // Dark border
    borderStrong: '#4B5563',      // Stronger border
    
  // Tab bar
  tabIconDefault: '#6B7280',
  tabIconSelected: '#F9FAFB',   // Active white
    
    // Legacy (for compatibility)
  tint: '#00C853',
  icon: '#F9FAFB',
    danger: '#F87171',
    shadow: 'rgba(0,0,0,0.3)',
    overlay: 'rgba(0,0,0,0.7)',
    chipBackground: '#0A2E1A',
    chipText: '#4EEA8B',
    accentSoft: '#27C26A',
  },
};

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
