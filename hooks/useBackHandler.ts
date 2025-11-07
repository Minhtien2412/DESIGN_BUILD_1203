/**
 * Back Button Handler Hook
 * Handles smart back navigation:
 * - On Home screen: Double press to exit
 * - On other screens: Navigate back to previous screen
 */

import { HapticFeedback } from '@/utils/haptics';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, BackHandler, Platform, ToastAndroid } from 'react-native';

interface UseBackHandlerOptions {
  /**
   * Enable double press to exit behavior
   * Default: true on root screens, false otherwise
   */
  enabled?: boolean;
  
  /**
   * Time window in ms for second press
   * Default: 2000ms (2 seconds)
   */
  timeout?: number;
  
  /**
   * Toast message to show on first press
   * Default: "Nhấn lại một lần nữa để thoát"
   */
  message?: string;
  
  /**
   * Show confirmation alert instead of toast
   * Default: false
   */
  useAlert?: boolean;
  
  /**
   * Custom callback on exit
   */
  onExit?: () => void;
}

/**
 * Hook to handle back button press with double-tap-to-exit pattern
 * 
 * Usage:
 * ```tsx
 * // In root tab screen (home, projects, etc.)
 * useBackHandler({ enabled: true });
 * 
 * // In detail screens (auto back navigation)
 * useBackHandler({ enabled: false });
 * ```
 */
export const useBackHandler = (options: UseBackHandlerOptions = {}) => {
  const {
    enabled = true,
    timeout = 2000,
    message = 'Nhấn lại một lần nữa để thoát',
    useAlert = false,
    onExit,
  } = options;

  const lastBackPress = useRef<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const now = Date.now();
      const timeSinceLastPress = now - lastBackPress.current;

      if (timeSinceLastPress < timeout) {
        // Second press within timeout - exit app
        HapticFeedback.warning();
        
        if (onExit) {
          onExit();
        }
        
        BackHandler.exitApp();
        return true;
      } else {
        // First press - show warning
        lastBackPress.current = now;
        HapticFeedback.light();

        if (useAlert) {
          showExitAlert();
        } else {
          showToast(message);
        }
        
        return true;
      }
    });

    return () => backHandler.remove();
  }, [enabled, timeout, message, useAlert, onExit]);

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      // iOS doesn't have native toast - could use a third-party library
      // For now, just haptic feedback
      HapticFeedback.warning();
    }
  };

  const showExitAlert = () => {
    Alert.alert(
      'Thoát ứng dụng',
      'Bạn có chắc chắn muốn thoát?',
      [
        {
          text: 'Ở lại',
          onPress: () => {
            HapticFeedback.light();
          },
          style: 'cancel',
        },
        {
          text: 'Thoát',
          onPress: () => {
            HapticFeedback.warning();
            if (onExit) {
              onExit();
            }
            BackHandler.exitApp();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
};

/**
 * Smart Back Handler Hook
 * - On Home screen (index): Double press to exit
 * - On other screens: Navigate back to previous screen
 * 
 * Usage:
 * ```tsx
 * // In any screen - automatically detects if it's home or not
 * useSmartBackHandler();
 * ```
 */
export const useSmartBackHandler = (options: Omit<UseBackHandlerOptions, 'enabled'> = {}) => {
  const {
    timeout = 2000,
    message = 'Nhấn lại một lần nữa để thoát',
    useAlert = false,
    onExit,
  } = options;

  const lastBackPress = useRef<number>(0);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Check if we're on the home screen (root tab)
      // Home is at segments: ['(tabs)'] or ['(tabs)', ''] 
      const segmentStr = segments.join('/');
      const isHomeScreen = segmentStr === '(tabs)' || segmentStr === '' || segments.length <= 1;

      console.log('[useSmartBackHandler] segments:', segments, 'segmentStr:', segmentStr, 'isHomeScreen:', isHomeScreen);

      if (isHomeScreen) {
        // HOME SCREEN: Double press to exit
        const now = Date.now();
        const timeSinceLastPress = now - lastBackPress.current;

        if (timeSinceLastPress < timeout) {
          // Second press within timeout - exit app
          HapticFeedback.warning();
          
          if (onExit) {
            onExit();
          }
          
          BackHandler.exitApp();
          return true;
        } else {
          // First press - show warning
          lastBackPress.current = now;
          HapticFeedback.light();

          if (useAlert) {
            Alert.alert(
              'Thoát ứng dụng',
              'Bạn có chắc chắn muốn thoát?',
              [
                {
                  text: 'Ở lại',
                  onPress: () => HapticFeedback.light(),
                  style: 'cancel',
                },
                {
                  text: 'Thoát',
                  onPress: () => {
                    HapticFeedback.warning();
                    if (onExit) onExit();
                    BackHandler.exitApp();
                  },
                  style: 'destructive',
                },
              ],
              { cancelable: true }
            );
          } else {
            if (Platform.OS === 'android') {
              ToastAndroid.show(message, ToastAndroid.SHORT);
            } else {
              HapticFeedback.warning();
            }
          }
          
          return true; // Prevent default back
        }
      } else {
        // OTHER SCREENS: Navigate back
        HapticFeedback.light();
        
        // Let expo-router handle the back navigation
        if (router.canGoBack()) {
          router.back();
          return true;
        }
        
        // If can't go back, treat as home screen
        const now = Date.now();
        const timeSinceLastPress = now - lastBackPress.current;

        if (timeSinceLastPress < timeout) {
          HapticFeedback.warning();
          if (onExit) onExit();
          BackHandler.exitApp();
          return true;
        } else {
          lastBackPress.current = now;
          if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
          }
          return true;
        }
      }
    });

    return () => backHandler.remove();
  }, [segments, timeout, message, useAlert, onExit, router]);
};

/**
 * Hook to detect back navigation (works on both iOS and Android)
 * Useful for cleanup tasks when user navigates back
 * 
 * Usage:
 * ```tsx
 * useBackNavigation(() => {
 *   // Cleanup or save state
 *   console.log('User navigated back');
 * });
 * ```
 */
export const useBackNavigation = (callback: () => void) => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        callback();
        return false; // Let default back action happen
      });

      return () => backHandler.remove();
    }
  }, [callback]);
};

/**
 * Hook to prevent back navigation
 * Useful for forms with unsaved changes
 * 
 * Usage:
 * ```tsx
 * const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 * 
 * usePreventBack({
 *   shouldPrevent: hasUnsavedChanges,
 *   onBackPress: () => {
 *     Alert.alert('Bạn có thay đổi chưa lưu. Bạn có muốn thoát?');
 *   },
 * });
 * ```
 */
export const usePreventBack = ({
  shouldPrevent,
  onBackPress,
}: {
  shouldPrevent: boolean;
  onBackPress?: () => void;
}) => {
  useEffect(() => {
    if (!shouldPrevent) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      HapticFeedback.warning();
      onBackPress?.();
      return true; // Prevent default back action
    });

    return () => backHandler.remove();
  }, [shouldPrevent, onBackPress]);
};
