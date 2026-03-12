/**
 * Haptic Feedback Utilities
 * Provides consistent haptic feedback across the app
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light impact - for simple interactions like taps, selections
 */
export const lightImpact = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail if haptics not available
    }
  }
};

/**
 * Medium impact - for swipes, drags, moderate actions
 */
export const mediumImpact = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Silently fail
    }
  }
};

/**
 * Heavy impact - for important actions, confirmations
 */
export const heavyImpact = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Silently fail
    }
  }
};

/**
 * Success notification - for completed actions
 */
export const successNotification = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Silently fail
    }
  }
};

/**
 * Warning notification - for warnings, cautions
 */
export const warningNotification = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Silently fail
    }
  }
};

/**
 * Error notification - for errors, failures
 */
export const errorNotification = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Silently fail
    }
  }
};

/**
 * Selection changed - for picker changes, slider movement
 */
export const selectionChanged = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Silently fail
    }
  }
};

/**
 * Double tap feedback - special sequence for double tap detection
 */
export const doubleTapFeedback = async () => {
  try {
    await lightImpact();
    setTimeout(async () => {
      await mediumImpact();
    }, 50);
  } catch (error) {
    // Silently fail
  }
};

/**
 * Long press feedback - progressive feedback during long press
 */
export const longPressFeedback = async () => {
  try {
    await lightImpact();
    setTimeout(async () => {
      await heavyImpact();
    }, 300);
  } catch (error) {
    // Silently fail
  }
};

/**
 * Swipe feedback - feedback for swipe gestures
 */
export const swipeFeedback = async () => {
  try {
    await mediumImpact();
  } catch (error) {
    // Silently fail
  }
};

/**
 * Tab switch feedback - feedback for tab navigation
 */
export const tabSwitchFeedback = async () => {
  try {
    await selectionChanged();
  } catch (error) {
    // Silently fail
  }
};

/**
 * Menu open feedback - feedback when opening menus/modals
 */
export const menuOpenFeedback = async () => {
  try {
    await mediumImpact();
  } catch (error) {
    // Silently fail
  }
};

/**
 * Menu close feedback - feedback when closing menus/modals
 */
export const menuCloseFeedback = async () => {
  try {
    await lightImpact();
  } catch (error) {
    // Silently fail
  }
};

/**
 * Refresh feedback - feedback for pull to refresh
 */
export const refreshFeedback = async () => {
  try {
    await successNotification();
  } catch (error) {
    // Silently fail
  }
};

/**
 * Add to cart feedback - special sequence for adding items
 */
export const addToCartFeedback = async () => {
  try {
    await mediumImpact();
    setTimeout(async () => {
      await successNotification();
    }, 100);
  } catch (error) {
    // Silently fail
  }
};

/**
 * Remove feedback - feedback for deletions
 */
export const removeFeedback = async () => {
  try {
    await heavyImpact();
  } catch (error) {
    // Silently fail
  }
};

/**
 * Like/Heart animation feedback
 */
export const likeFeedback = async () => {
  try {
    await lightImpact();
    setTimeout(async () => {
      await mediumImpact();
    }, 80);
  } catch (error) {
    // Silently fail
  }
};

// Export all as namespace for convenience
export const HapticFeedback = {
  light: lightImpact,
  medium: mediumImpact,
  heavy: heavyImpact,
  success: successNotification,
  warning: warningNotification,
  error: errorNotification,
  selection: selectionChanged,
  doubleTap: doubleTapFeedback,
  longPress: longPressFeedback,
  swipe: swipeFeedback,
  tabSwitch: tabSwitchFeedback,
  menuOpen: menuOpenFeedback,
  menuClose: menuCloseFeedback,
  refresh: refreshFeedback,
  addToCart: addToCartFeedback,
  remove: removeFeedback,
  like: likeFeedback,
};
