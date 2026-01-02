/**
 * Push Notification Service
 * Handles registration, permissions, and notification handling
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiFetch } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface PushNotificationData {
  type: 'message' | 'call' | 'notification';
  conversationId?: number;
  messageId?: number;
  senderId?: number;
  senderName?: string;
  content?: string;
  [key: string]: any;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize push notifications
   */
  async initialize() {
    try {
      // Request permissions
      const token = await this.registerForPushNotifications();
      
      if (token) {
        this.expoPushToken = token;
        await this.sendTokenToServer(token);
        console.log('[PushNotification] ✅ Initialized with token:', token);
      }

      // Set up listeners
      this.setupListeners();

    } catch (error) {
      console.error('[PushNotification] Initialization failed:', error);
    }
  }

  /**
   * Register for push notifications
   */
  private async registerForPushNotifications(): Promise<string | null> {
    // Only works on physical devices
    if (!Device.isDevice) {
      console.warn('[PushNotification] Push notifications only work on physical devices');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[PushNotification] Permission not granted');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // TODO: Replace with actual project ID from app.json
      });

      // Android-specific channel setup
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3b82f6',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('calls', {
          name: 'Calls',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#10b981',
          sound: 'default',
        });
      }

      return tokenData.data;

    } catch (error) {
      console.error('[PushNotification] Registration failed:', error);
      return null;
    }
  }

  /**
   * Send push token to backend
   */
  private async sendTokenToServer(token: string) {
    try {
      await apiFetch('/api/v1/push-tokens', {
        method: 'POST',
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          deviceId: Device.modelId,
          deviceName: Device.modelName,
        }),
      });
      console.log('[PushNotification] Token registered on server');
    } catch (error) {
      console.error('[PushNotification] Failed to register token on server:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  private setupListeners() {
    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[PushNotification] Received:', notification);
        const data = notification.request.content.data as PushNotificationData;
        
        // Handle based on type
        if (data.type === 'message') {
          // Update message state via WebSocket or direct API call
          this.handleMessageNotification(data);
        }
      }
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[PushNotification] User tapped notification:', response);
        const data = response.notification.request.content.data as PushNotificationData;
        
        // Navigate based on type
        this.handleNotificationTap(data);
      }
    );
  }

  /**
   * Handle message notification (app in foreground)
   */
  private handleMessageNotification(data: PushNotificationData) {
    // This can trigger a refresh in MessageContext
    // or emit an event that components can listen to
    console.log('[PushNotification] New message from:', data.senderName);
  }

  /**
   * Handle notification tap (deep linking)
   */
  private handleNotificationTap(data: PushNotificationData) {
    // Use expo-router to navigate
    // router.push(`/messages/${data.conversationId}`);
    console.log('[PushNotification] Navigate to:', data);
  }

  /**
   * Schedule local notification (for testing or reminders)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: PushNotificationData,
    seconds: number = 0
  ) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default' as any,
          badge: 1,
        },
        trigger: seconds > 0 ? { seconds } as any : null,
      });
      
      console.log('[PushNotification] Scheduled notification:', id);
      return id;
    } catch (error) {
      console.error('[PushNotification] Failed to schedule:', error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Get current push token
   */
  getToken(): string | null {
    return this.expoPushToken;
  }
}

export const pushNotificationService = new PushNotificationService();
