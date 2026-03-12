/**
 * iOS-style Navigation Theme
 * Consistent header styling across iOS, Android & Web
 */

import { Platform } from 'react-native';
import { Colors } from './theme';

export const NAVIGATION_THEME = {
  // iOS-style header configuration
  headerStyle: {
    backgroundColor: Colors.light.surface,
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.border,
    height: Platform.select({
      ios: 32,
      android: 40,
      default: 40,
    }),
  },
  
  headerTitleStyle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    letterSpacing: -0.4,
  },
  
  headerTitleAlign: 'center' as const,
  
  headerBackTitleStyle: {
    fontSize: 17,
    fontWeight: '400' as const,
    color: Colors.light.primary,
  },
  
  headerTintColor: Colors.light.primary,
  
  headerBackTitleVisible: Platform.OS === 'ios',
  
  // Custom back button styling
  headerLeftContainerStyle: {
    paddingLeft: Platform.select({
      ios: 8,
      android: 4,
      default: 4,
    }),
  },
  
  headerRightContainerStyle: {
    paddingRight: Platform.select({
      ios: 16,
      android: 16,
      default: 16,
    }),
  },
  
  // Animation
  animation: 'slide_from_right' as const,
  
  // Status bar
  statusBarStyle: 'dark' as const,
  statusBarColor: Colors.light.surface,
  statusBarTranslucent: false,
  
  // Gesture
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  
  // Card style for smooth transitions
  cardStyle: {
    backgroundColor: Colors.light.background,
  },
  
  // Custom animations for iOS feel
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
};

// Dark mode variant
export const NAVIGATION_THEME_DARK = {
  ...NAVIGATION_THEME,
  headerStyle: {
    ...NAVIGATION_THEME.headerStyle,
    backgroundColor: Colors.dark.surface,
    borderBottomColor: Colors.dark.border,
  },
  headerTitleStyle: {
    ...NAVIGATION_THEME.headerTitleStyle,
    color: Colors.dark.text,
  },
  headerTintColor: Colors.dark.primary,
  statusBarStyle: 'light' as const,
  statusBarColor: Colors.dark.surface,
  cardStyle: {
    backgroundColor: Colors.dark.background,
  },
};

// Helper function to get navigation options
export const getScreenOptions = (title?: string, options?: any) => ({
  ...NAVIGATION_THEME,
  title,
  headerShown: true,
  ...options,
});

// Preset options for common screens
export const SCREEN_OPTIONS = {
  // No header (for tabs, auth, etc.)
  noHeader: {
    headerShown: false,
  },
  
  // Modal presentation
  modal: {
    ...NAVIGATION_THEME,
    presentation: 'modal' as const,
    animation: 'slide_from_bottom' as const,
    headerShown: true,
  },
  
  // Fullscreen (for media, etc.)
  fullscreen: {
    headerShown: false,
    presentation: 'fullScreenModal' as const,
    animation: 'fade' as const,
  },
  
  // Transparent header (for scrollable content)
  transparent: {
    ...NAVIGATION_THEME,
    headerTransparent: true,
    headerStyle: {
      ...NAVIGATION_THEME.headerStyle,
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
    },
  },
};
