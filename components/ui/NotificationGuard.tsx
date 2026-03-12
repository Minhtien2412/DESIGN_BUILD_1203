import { useAuth } from '@/context/AuthContext';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Guard để tránh tự khởi tạo trong Expo Go
const canUseNativePush = Platform.OS !== "web" && Constants.appOwnership !== "expo";
let Notifications: typeof import("expo-notifications") | null = null;

if (canUseNativePush) {
  try {
    Notifications = require("expo-notifications");
  } catch (error) {
    console.log('[NotificationGuard] expo-notifications not available:', error);
  }
}

/**
 * Guard component that safely handles expo-notifications setup
 * Only works in Development Builds, gracefully degrades in Expo Go
 */
export function NotificationGuard({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      try {
        // Check if notifications are available
        if (!Notifications) {
          console.log('[NotificationGuard] Notifications not available');
          if (isMounted) setIsReady(true);
          return;
        }

        // Check if we're in Expo Go (limited functionality)
        const isExpoGo = !Notifications.setNotificationHandler;

        if (isExpoGo) {
          console.log('[NotificationGuard] Running in Expo Go - notifications limited');
          if (isMounted) setIsReady(true);
          return;
        }

        // Only setup notifications in Development Builds
        console.log('[NotificationGuard] Setting up notifications for Development Build');

        // Set notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        // Request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('[NotificationGuard] Notification permissions denied');
        } else {
          console.log('[NotificationGuard] Notification permissions granted');
        }

        // Get push token for current user
        if (user && finalStatus === 'granted') {
          try {
            const token = await Notifications.getExpoPushTokenAsync();
            console.log('[NotificationGuard] Push token:', token.data);

            // TODO: Send token to backend for push notifications
            // await apiFetch('/users/push-token', {
            //   method: 'POST',
            //   body: JSON.stringify({ token: token.data })
            // });

          } catch (tokenError) {
            console.log('[NotificationGuard] Failed to get push token:', tokenError);
          }
        }

      } catch (error) {
        console.log('[NotificationGuard] Setup failed:', error);
      } finally {
        if (isMounted) setIsReady(true);
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Show loading state while setting up
  if (!isReady) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}

/**
 * Hook to safely use notifications with guard
 */
export function useSafeNotifications() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported (not in Expo Go and available)
    const supported = !!(Notifications && Notifications.setNotificationHandler);
    setIsSupported(supported);

    if (!supported) {
      console.log('[useSafeNotifications] Notifications not supported');
    }
  }, []);

  return {
    isSupported,
    scheduleNotification: isSupported && Notifications ? Notifications.scheduleNotificationAsync : async () => null,
    dismissNotification: isSupported && Notifications ? Notifications.dismissNotificationAsync : async () => {},
    dismissAllNotifications: isSupported && Notifications ? Notifications.dismissAllNotificationsAsync : async () => {},
    getPermissionsAsync: isSupported && Notifications ? Notifications.getPermissionsAsync : async () => ({ status: 'denied' as const }),
    requestPermissionsAsync: isSupported && Notifications ? Notifications.requestPermissionsAsync : async () => ({ status: 'denied' as const }),
  };
}

/**
 * Utility function to check if running in Expo Go
 */
export function isExpoGo(): boolean {
  return !Notifications || !Notifications.setNotificationHandler;
}

/**
 * Safe notification scheduling with error handling
 */
export async function safeScheduleNotification(
  content: any, // Using any to avoid type issues when Notifications is null
  trigger?: any
) {
  if (isExpoGo() || !Notifications) {
    console.log('[safeScheduleNotification] Skipping - notifications not available:', content.title);
    return null;
  }

  try {
    return await Notifications.scheduleNotificationAsync({
      content,
      trigger: trigger || null,
    });
  } catch (error) {
    console.error('[safeScheduleNotification] Failed:', error);
    return null;
  }
}
