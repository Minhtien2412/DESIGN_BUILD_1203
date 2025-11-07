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
export function usePushNotifications() {
  const { token, user } = useAuth();
  const { add, markRead } = useNotifications();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    // Only register push notifications when not using Expo Go
    if (Platform.OS === 'web' || Constants.appOwnership === 'expo' || !Notifications) {
      console.log('Skipping push notification registration for Expo Go, web, or when notifications unavailable');
      return null;
    }

    if (!Constants.isDevice) {
      console.warn('Push notifications require a physical device');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Permission for push notifications denied');
      return null;
    }

    try {
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: '5e8b78ed-e5e4-42f1-9951-9b2b89f38e2b', // Replace with your actual project ID
      });
      
      console.log('Push token:', pushToken.data);
      
      // TODO: Send token to your server
      // await sendTokenToServer(pushToken.data, token);
      
      return pushToken.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }, [token]);

  // Handle notification received while app is running
  useEffect(() => {
    if (!Notifications) {
      console.log('[usePushNotifications] Skipping notification handler setup in Expo Go or when notifications unavailable');
      return;
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      // Extract notification data
      const { title, body, data } = notification.request.content;
      
      // Add to local notifications if not muted
      if (title) {
        add({
          title: title as string,
          body: body as string,
          type: (data?.type as any) || 'system',
          route: data?.route as string,
          params: data?.params as Record<string, string>,
          meta: data,
        });
      }
    });

    // Handle notification tap/response
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const { notification } = response;
      const { data } = notification.request.content;
      
      // Mark as read when user taps notification
      if (data?.notificationId) {
        markRead(data.notificationId as string);
      }
      
      // Navigate to specific screen if route provided
      if (data?.route) {
        // TODO: Implement navigation logic
        // router.push(data.route);
        console.log('Navigate to:', data.route);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [add, markRead]);

  // Auto-register when user is logged in
  useEffect(() => {
    if (user && token) {
      registerForPushNotifications();
    }
  }, [user, token, registerForPushNotifications]);

  // Set app icon badge count
  const updateBadgeCount = useCallback(async (count: number) => {
    if (Platform.OS === 'ios' && Notifications) {
      await Notifications.setBadgeCountAsync(count);
    }
  }, []);

  // Send test push notification (for development)
  const sendTestNotification = useCallback(async () => {
    if (!Notifications) {
      console.log('[usePushNotifications] Skipping test notification in Expo Go or when notifications unavailable');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test push notification',
        data: {
          type: 'system',
          route: '/notifications',
          notificationId: `test-${Date.now()}`,
        },
      },
      trigger: { seconds: 1 } as any,
    });
  }, []);

  return {
    registerForPushNotifications,
    updateBadgeCount,
    sendTestNotification,
  };
}

/**
 * Send push token to server for remote notifications
 * Call this after successful token registration
 */
export async function sendTokenToServer(pushToken: string, authToken: string) {
  try {
  const response = await fetch(buildApiUrl('/push-tokens'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token: pushToken,
        platform: Platform.OS,
        deviceId: Constants.deviceName || 'unknown',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    console.log('Push token sent to server successfully');
  } catch (error) {
    console.warn('Failed to send push token to server:', error);
  }
}