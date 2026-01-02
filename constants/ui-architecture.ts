/**
 * UI Architecture Registry - Định nghĩa kiến trúc giao diện theo vai trò
 * Phân chia layout, components, và styling cho từng loại user
 * @created 2025-12-23
 */

import { Dimensions, Platform } from 'react-native';

// ============================================================================
// SCREEN DIMENSIONS
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LAYOUT = {
  // Screen
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Padding
  screenPadding: 16,
  sectionPadding: 16,
  cardPadding: 12,
  
  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  // Header
  headerHeight: Platform.select({ ios: 44, android: 56, default: 56 }),
  statusBarHeight: Platform.select({ ios: 44, android: 24, default: 0 }),
  
  // Tab Bar
  tabBarHeight: Platform.select({ ios: 83, android: 60, default: 60 }),
  
  // Grid
  gridColumns: 2,
  productCardWidth: (SCREEN_WIDTH - 48) / 2,
  serviceCardWidth: (SCREEN_WIDTH - 64) / 3,
};

// ============================================================================
// COLOR PALETTES BY ROLE
// ============================================================================

export const COLOR_PALETTES = {
  // Guest - Neutral, exploration-focused
  guest: {
    primary: '#636E72',
    secondary: '#B2BEC3',
    accent: '#45B7D1',
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#E74C3C',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#2D3436',
    textSecondary: '#636E72',
    border: '#DFE6E9',
    gradient: ['#636E72', '#45B7D1'],
  },
  
  // User - Shopee-style, warm and engaging
  user: {
    primary: '#EE4D2D',
    secondary: '#F97316',
    accent: '#FF6B6B',
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#E74C3C',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#2D3436',
    textSecondary: '#636E72',
    border: '#E5E5E5',
    gradient: ['#EE4D2D', '#F97316'],
  },
  
  // Employee - Professional, productivity-focused
  employee: {
    primary: '#4ECDC4',
    secondary: '#00B894',
    accent: '#45B7D1',
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#E74C3C',
    background: '#F0F4F8',
    surface: '#FFFFFF',
    text: '#2D3436',
    textSecondary: '#636E72',
    border: '#DFE6E9',
    gradient: ['#4ECDC4', '#00B894'],
  },
  
  // Admin - Powerful, authoritative
  admin: {
    primary: '#6C5CE7',
    secondary: '#8B5CF6',
    accent: '#A29BFE',
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#E74C3C',
    background: '#F5F6FA',
    surface: '#FFFFFF',
    text: '#2D3436',
    textSecondary: '#636E72',
    border: '#DFE6E9',
    gradient: ['#6C5CE7', '#8B5CF6'],
  },
};

// ============================================================================
// TYPOGRAPHY SCALES
// ============================================================================

export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// ============================================================================
// COMPONENT STYLES BY ROLE
// ============================================================================

export type UserRole = 'guest' | 'user' | 'employee' | 'admin';

interface ButtonStyle {
  primary: {
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    height: number;
    fontSize: number;
  };
  secondary: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  };
}

interface CardStyle {
  backgroundColor: string;
  borderRadius: number;
  shadowColor: string;
  shadowOpacity: number;
  elevation: number;
  borderWidth: number;
  borderColor: string;
}

interface HeaderStyle {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  statusBarStyle: 'light-content' | 'dark-content';
}

export const COMPONENT_STYLES: Record<UserRole, {
  button: ButtonStyle;
  card: CardStyle;
  header: HeaderStyle;
}> = {
  guest: {
    button: {
      primary: {
        backgroundColor: '#45B7D1',
        textColor: '#FFFFFF',
        borderRadius: 8,
        height: 48,
        fontSize: 16,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '#45B7D1',
        textColor: '#45B7D1',
      },
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      shadowColor: '#000000',
      shadowOpacity: 0.05,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#E5E5E5',
    },
    header: {
      backgroundColor: '#FFFFFF',
      textColor: '#2D3436',
      iconColor: '#636E72',
      statusBarStyle: 'dark-content',
    },
  },
  
  user: {
    button: {
      primary: {
        backgroundColor: '#EE4D2D',
        textColor: '#FFFFFF',
        borderRadius: 8,
        height: 48,
        fontSize: 16,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '#EE4D2D',
        textColor: '#EE4D2D',
      },
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      elevation: 3,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    header: {
      backgroundColor: '#EE4D2D',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      statusBarStyle: 'light-content',
    },
  },
  
  employee: {
    button: {
      primary: {
        backgroundColor: '#4ECDC4',
        textColor: '#FFFFFF',
        borderRadius: 10,
        height: 50,
        fontSize: 16,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '#4ECDC4',
        textColor: '#4ECDC4',
      },
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      shadowColor: '#4ECDC4',
      shadowOpacity: 0.1,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#E8F5F4',
    },
    header: {
      backgroundColor: '#4ECDC4',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      statusBarStyle: 'light-content',
    },
  },
  
  admin: {
    button: {
      primary: {
        backgroundColor: '#6C5CE7',
        textColor: '#FFFFFF',
        borderRadius: 10,
        height: 50,
        fontSize: 16,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '#6C5CE7',
        textColor: '#6C5CE7',
      },
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      shadowColor: '#6C5CE7',
      shadowOpacity: 0.1,
      elevation: 4,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    header: {
      backgroundColor: '#6C5CE7',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      statusBarStyle: 'light-content',
    },
  },
};

// ============================================================================
// HOME SCREEN LAYOUTS BY ROLE
// ============================================================================

export interface HomeSection {
  id: string;
  type: 'banner' | 'quick-actions' | 'services-grid' | 'products-carousel' | 'category-list' | 'stats-cards' | 'task-list' | 'chart' | 'notifications';
  title?: string;
  showViewAll?: boolean;
  viewAllRoute?: string;
}

export const HOME_LAYOUTS: Record<UserRole, HomeSection[]> = {
  guest: [
    { id: 'banner', type: 'banner' },
    { id: 'explore', type: 'quick-actions', title: 'Khám phá' },
    { id: 'services', type: 'services-grid', title: 'Dịch vụ nổi bật', showViewAll: true, viewAllRoute: '/services' },
    { id: 'products', type: 'products-carousel', title: 'Sản phẩm bán chạy', showViewAll: true, viewAllRoute: '/shopping' },
  ],
  
  user: [
    { id: 'banner', type: 'banner' },
    { id: 'quick', type: 'quick-actions' },
    { id: 'categories', type: 'category-list' },
    { id: 'services', type: 'services-grid', title: 'Dịch vụ thiết kế', showViewAll: true, viewAllRoute: '/services' },
    { id: 'products', type: 'products-carousel', title: 'Gợi ý cho bạn', showViewAll: true, viewAllRoute: '/shopping' },
    { id: 'projects', type: 'products-carousel', title: 'Dự án của bạn', showViewAll: true, viewAllRoute: '/(tabs)/projects' },
  ],
  
  employee: [
    { id: 'stats', type: 'stats-cards', title: 'Tổng quan hôm nay' },
    { id: 'tasks', type: 'task-list', title: 'Nhiệm vụ cần làm', showViewAll: true, viewAllRoute: '/projects' },
    { id: 'quick', type: 'quick-actions' },
    { id: 'projects', type: 'products-carousel', title: 'Dự án đang thực hiện', showViewAll: true, viewAllRoute: '/projects' },
    { id: 'notifications', type: 'notifications', title: 'Thông báo mới' },
  ],
  
  admin: [
    { id: 'stats', type: 'stats-cards', title: 'Tổng quan hệ thống' },
    { id: 'chart', type: 'chart', title: 'Doanh thu tuần này' },
    { id: 'quick', type: 'quick-actions' },
    { id: 'projects', type: 'products-carousel', title: 'Dự án đang hoạt động', showViewAll: true, viewAllRoute: '/projects' },
    { id: 'tasks', type: 'task-list', title: 'Cần phê duyệt', showViewAll: true, viewAllRoute: '/admin/pending' },
    { id: 'notifications', type: 'notifications', title: 'Cảnh báo hệ thống' },
  ],
};

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const ANIMATIONS = {
  // Duration (ms)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Easing curves
  easing: {
    linear: [0, 0, 1, 1],
    easeOut: [0.25, 0.46, 0.45, 0.94],
    easeIn: [0.55, 0.085, 0.68, 0.53],
    easeInOut: [0.455, 0.03, 0.515, 0.955],
    spring: [0.43, 0.13, 0.23, 0.96],
  },
  
  // Spring config
  spring: {
    default: { damping: 15, stiffness: 150 },
    gentle: { damping: 20, stiffness: 100 },
    bouncy: { damping: 10, stiffness: 200 },
    stiff: { damping: 25, stiffness: 300 },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getColorPalette = (role: UserRole) => COLOR_PALETTES[role];
export const getComponentStyle = (role: UserRole) => COMPONENT_STYLES[role];
export const getHomeLayout = (role: UserRole) => HOME_LAYOUTS[role];

/**
 * Get responsive value based on screen width
 */
export const responsive = <T>(small: T, medium: T, large: T): T => {
  if (LAYOUT.isSmallDevice) return small;
  if (LAYOUT.isMediumDevice) return medium;
  return large;
};

/**
 * Calculate grid item width
 */
export const gridItemWidth = (columns: number, gap: number = LAYOUT.spacing.md): number => {
  return (SCREEN_WIDTH - LAYOUT.screenPadding * 2 - gap * (columns - 1)) / columns;
};
