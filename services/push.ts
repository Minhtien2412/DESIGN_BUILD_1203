/**
 * Push Notification Service
 * 
 * Handles Firebase Cloud Messaging (FCM) push notifications:
 * - Register device token
 * - Handle incoming notifications
 * - Navigate to appropriate screen based on notification type
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiFetch } from './api';
// Conditionally import to avoid Expo Go runtime issues
let Notifications: typeof import('expo-notifications') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require('expo-notifications');
} catch (e) {
  console.log('[push] expo-notifications not available:', e);
}

/**
 * Configure notification behavior
 */
const isExpoGo = Constants.appOwnership === 'expo';
if (Notifications && !isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Request push notification permissions and register device token with backend
 * 
 * Call this after successful login to enable incoming call notifications.
 * 
 * @returns The Expo push token if successful, null otherwise
 * 
 * @example
 * ```typescript
 * await registerForPushNotifications();
 * ```
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!Notifications || isExpoGo) {
      console.warn('⚠️ Push registration skipped in Expo Go or without notifications module');
      return null;
    }
    // Check if running on physical device (required for push notifications)
    if (!Platform.isTV && !__DEV__) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ Push notification permission denied');
        return null;
      }

      // Get Expo push token
      const projectId = (Constants as any).expoConfig?.extra?.eas?.projectId ?? (Constants as any).easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      const token = tokenData.data;
      console.log('✅ Expo Push Token:', token);

      // Register token with backend
      await apiFetch('/user/fcm-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      console.log('✅ FCM token registered with backend');
      
      return token;
    } else {
      console.warn('⚠️ Push notifications require a physical device');
      return null;
    }
  } catch (error) {
    console.error('❌ FCM token registration error:', error);
    return null;
  }
}

/**
 * Unregister device token (call on logout)
 * 
 * @example
 * ```typescript
 * await unregisterPushNotifications();
 * ```
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    await apiFetch('/user/fcm-token', {
      method: 'DELETE',
    });
    console.log('✅ FCM token unregistered');
  } catch (error) {
    console.error('❌ FCM token unregistration error:', error);
  }
}

/**
 * Setup notification listeners
 * 
 * This should be called in the root layout (_layout.tsx) to handle:
 * - Foreground notifications (app is open)
 * - Background notifications (app is in background)
 * - Notification taps
 * 
 * @param onNotification Callback for foreground notifications
 * @param onNotificationTap Callback for notification taps
 * @returns Cleanup function to remove listeners
 * 
 * @example
 * ```typescript
 * // In app/_layout.tsx
 * useEffect(() => {
 *   const cleanup = setupNotificationListeners(
 *     (notification) => {
 *       console.log('Received notification:', notification);
 *     },
 *     (response) => {
 *       const data = response.notification.request.content.data;
 *       if (data.type === 'call') {
 *         router.push(`/call?roomId=${data.roomId}`);
 *       }
 *     }
 *   );
 *   return cleanup;
 * }, []);
 * ```
 */
export function setupNotificationListeners(
  onNotification?: (notification: any) => void,
  onNotificationTap?: (response: any) => void
): () => void {
  if (!Notifications || isExpoGo) {
    return () => {};
  }
  // Listener for notifications received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('📬 Notification received (foreground):', notification);
      onNotification?.(notification);
    }
  );

  // Listener for notification taps (when user taps notification)
  const tapSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('👆 Notification tapped:', response);
      onNotificationTap?.(response);
    }
  );

  // Return cleanup function
  return () => {
    foregroundSubscription.remove();
    tapSubscription.remove();
  };
}

/**
 * Get the last notification response (useful for cold starts)
 * 
 * Call this on app mount to check if the app was opened via a notification tap.
 * 
 * @returns The last notification response if available
 * 
 * @example
 * ```typescript
 * const lastResponse = await getLastNotificationResponse();
 * if (lastResponse?.notification.request.content.data.type === 'call') {
 *   // Handle call notification
 * }
 * ```
 */
export async function getLastNotificationResponse(): Promise<any | null> {
  if (!Notifications || isExpoGo) return null;
  return await Notifications.getLastNotificationResponseAsync();
}

/**
 * Create a local notification channel (Android only)
 * 
 * Required for Android 8.0+ to show notifications with custom sounds/vibration.
 * 
 * @example
 * ```typescript
 * await createNotificationChannel();
 * ```
 */
export async function createNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android' && Notifications && !isExpoGo) {
    await Notifications.setNotificationChannelAsync('calls', {
      name: 'Cuộc gọi',
      description: 'Thông báo cuộc gọi đến',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableLights: true,
      lightColor: '#00FF00',
    });

    console.log('✅ Notification channel created');
  }
}

/**
 * Schedule a local notification (for testing)
 * 
 * @param title Notification title
 * @param body Notification body
 * @param data Custom data payload
 * @param delaySeconds Delay in seconds before showing
 * 
 * @example
 * ```typescript
 * await scheduleTestNotification('Test Call', 'Incoming call from John', { type: 'call' }, 5);
 * ```
 */
export async function scheduleTestNotification(
  title: string,
  body: string,
  data: Record<string, any> = {},
  delaySeconds = 5
): Promise<string> {
  if (!Notifications || isExpoGo) {
    console.warn('Local notifications not available in this environment');
    return 'disabled';
  }
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: {
      type: (Notifications as any).SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
    },
  });

  console.log(`✅ Test notification scheduled (ID: ${notificationId})`);
  return notificationId;
}
