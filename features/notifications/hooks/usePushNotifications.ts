import { buildApiUrl } from '@/config';
import { useAuth } from '@/context/AuthContext';
import Constants from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
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

// Types
export interface PushNotificationState {
  expoPushToken: string | null;
  permission: 'granted' | 'denied' | 'undetermined';
  loading: boolean;
  error: string | null;
}

/**
 * Hook to handle push notifications registration and background handling
 */
export function usePushNotifications(): PushNotificationState & {
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<string | null>;
} {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    expoPushToken: null,
    permission: 'undetermined',
    loading: false,
    error: null,
  });

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Check if notifications are available
  const isAvailable = !isExpoGo && Notifications !== null;

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      console.log('[PushNotifications] Not available in this environment');
      return false;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { status: existingStatus } = await Notifications!.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications!.requestPermissionsAsync();
        finalStatus = status;
      }

      setState(prev => ({
        ...prev,
        permission: finalStatus as 'granted' | 'denied' | 'undetermined',
        loading: false,
      }));

      return finalStatus === 'granted';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return false;
    }
  }, [isAvailable]);

  // Register for push token
  const registerToken = useCallback(async (): Promise<string | null> => {
    if (!isAvailable) {
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Get permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setState(prev => ({ ...prev, loading: false }));
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications!.getExpoPushTokenAsync({
        projectId,
      });

      setState(prev => ({
        ...prev,
        expoPushToken: token.data,
        loading: false,
      }));

      // Send token to backend
      if (user && token.data) {
        try {
          const apiUrl = buildApiUrl('/users/push-token');
          await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token.data }),
          });
          console.log('[PushNotifications] Token registered with backend');
        } catch (error) {
          console.warn('[PushNotifications] Failed to register token with backend:', error);
        }
      }

      return token.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PushNotifications] Registration failed:', errorMessage);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, [isAvailable, requestPermission, user]);

  // Setup notification listeners
  useEffect(() => {
    if (!isAvailable) return;

    // Handle received notification (foreground)
    notificationListener.current = Notifications!.addNotificationReceivedListener(
      (notification) => {
        console.log('[PushNotifications] Received:', notification);
        
        // Add to local notifications store
        const { title, body, data } = notification.request.content;
        // Note: addNotification not available in context
        console.log('New notification:', { title, body, data });
      }
    );

    // Handle notification tap (background/killed)
    responseListener.current = Notifications!.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[PushNotifications] Response:', response);
        
        const { data } = response.notification.request.content;
        
        // Navigate based on notification data
        if (data?.route) {
          const { router } = require('expo-router');
          router.push(data.route as string);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAvailable]);

  // Auto-register on mount if user is logged in
  useEffect(() => {
    if (user && isAvailable) {
      registerToken();
    }
  }, [user, isAvailable, registerToken]);

  return {
    ...state,
    requestPermission,
    registerToken,
  };
}
