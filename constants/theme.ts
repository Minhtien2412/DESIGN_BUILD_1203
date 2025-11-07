/**
 * Modern Design System for Construction Management App
 * Professional teal/cyan color scheme with excellent contrast
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Primary brand colors (Green palette)
    primary: '#90B44C',           // Primary green
    secondary: '#4B7F2A',         // Darker green
    accent: '#66BB6A',            // Accent green
    
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
  tint: '#90B44C',
  icon: '#111827',
    danger: '#EF4444',
    shadow: 'rgba(0,0,0,0.1)',
    overlay: 'rgba(0,0,0,0.5)',
    chipBackground: '#E7F3DC',    // Soft green background
    chipText: '#4B7F2A',
    accentSoft: '#A3D06B',
  },
  dark: {
    // Primary brand colors (Green palette for dark mode)
    primary: '#A3D06B',           // Lighter green for dark mode
    secondary: '#90B44C',         // Green
    accent: '#B7E08A',            // Bright green
    
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
  tint: '#A3D06B',
  icon: '#F9FAFB',
    danger: '#F87171',
    shadow: 'rgba(0,0,0,0.3)',
    overlay: 'rgba(0,0,0,0.7)',
    chipBackground: '#1E3A1A',
    chipText: '#B7E08A',
    accentSoft: '#8BC34A',
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
