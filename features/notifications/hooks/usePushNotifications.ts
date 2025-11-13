import { buildApiUrl } from '@/config';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/features/notifications';
import Constants from 'expo-constants';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// Conditionally import expo-notifications to avoid issues in Expo Go
const isExpoGo = Platform.OS !== 'web' && Constants.appOwnership === 'expo';

let Notifications: typeof import("expo-notifications") | null = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (error) {
    console.log('[usePushNotifications] expo-notifications not available:', error);
  }
}

// Configure push notification handling only when not in Expo Go
if (!isExpoGo && Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Always show notification in foreground
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
}

/**
 * Hook to handle push notifications registration and background handling
 */
export function usePushNotifications() { return null; }
