// Push Notifications Service
// Handles registration, permissions, and notification processing

import Constants from 'expo-constants';
import type * as NotificationTypes from 'expo-notifications';
import { Platform } from 'react-native';
import { handleApiError } from '../utils/errorHandler';
import { apiClient } from './enhancedApi';
// Conditionally import expo-notifications to avoid Expo Go errors (SDK 53+)
let Notifications: typeof import('expo-notifications') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('[pushNotifications] expo-notifications not available:', error);
}

// Configure notification behavior when available and not in Expo Go
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

export interface PushNotificationConfig {
  onNotificationReceived?: (notification: NotificationTypes.Notification) => void;
  onNotificationTapped?: (response: NotificationTypes.NotificationResponse) => void;
  onTokenUpdate?: (token: string) => void;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationSubscription: any | null = null;
  private responseSubscription: any | null = null;
  private config: PushNotificationConfig = {};

  async initialize(config?: PushNotificationConfig) {
    this.config = { ...this.config, ...config };

    try {
      if (!Notifications || isExpoGo) {
        console.warn('[pushNotifications] Skipping initialization in Expo Go or without notifications module');
        return null;
      }
      // Register for push notifications
      const token = await this.registerForPushNotificationsAsync();
      if (token) {
        this.expoPushToken = token;
        
        // Register with backend
        await this.registerTokenWithBackend(token);
        
        // Notify config callback
        this.config.onTokenUpdate?.(token);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      return token;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw handleApiError(error);
    }
  }

  private async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Notifications || isExpoGo) {
      console.warn('[pushNotifications] Registration skipped (Expo Go or Notifications not available)');
      return null;
    }
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
        token = null;
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  private async registerTokenWithBackend(token: string) {
    try {
      const deviceId = Constants.deviceId || Constants.installationId;
      const platform = Platform.OS;

      await apiClient.registerPushToken({
        token,
        platform,
        deviceId,
      });

      console.log('Push token registered with backend');
    } catch (error) {
      console.error('Failed to register push token with backend:', error);
      // Don't throw - allow notifications to work locally even if backend registration fails
    }
  }

  private setupNotificationListeners() {
    // Handle notifications received while app is running
    if (!Notifications || isExpoGo) return;
    this.notificationSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.config.onNotificationReceived?.(notification);
      }
    );

    // Handle notification taps
    this.responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        this.config.onNotificationTapped?.(response);
      }
    );
  }

  // Send a local notification (for testing or immediate feedback)
  async sendLocalNotification(title: string, body: string, data?: any) {
    try {
      if (!Notifications) throw new Error('Notifications module not available');
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
      
      return identifier;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      throw handleApiError(error);
    }
  }

  // Get notification permissions status
  async getPermissionStatus() {
    if (!Notifications) return 'undetermined' as any;
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Request permissions explicitly
  async requestPermissions() {
    if (!Notifications) return 'denied' as any;
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }

  // Get current expo push token
  getExpoPushToken() {
    return this.expoPushToken;
  }

  // Clear all notifications
  async clearAllNotifications() {
    if (!Notifications) return;
    await Notifications.dismissAllNotificationsAsync();
  }

  // Clear specific notification
  async clearNotification(identifier: string) {
    if (!Notifications) return;
    await Notifications.dismissNotificationAsync(identifier);
  }

  // Get notification badge count
  async getBadgeCount() {
    if (!Notifications) return 0;
    return await Notifications.getBadgeCountAsync();
  }

  // Set notification badge count
  async setBadgeCount(count: number) {
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  }

  // Clear badge
  async clearBadge() {
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(0);
  }

  // Update configuration
  updateConfig(config: Partial<PushNotificationConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Cleanup
  destroy() {
    this.notificationSubscription?.remove();
    this.responseSubscription?.remove();
    this.notificationSubscription = null;
    this.responseSubscription = null;
  }

  // Handle deep links from notifications
  handleNotificationData(data: any) {
    if (!data) return null;

    // Parse notification data for navigation
    const { type, chatId, messageId, userId } = data;

    switch (type) {
      case 'message':
        return { 
          screen: 'chat', 
          params: { chatId, messageId } 
        };
      case 'friend_request':
        return { 
          screen: 'profile', 
          params: { userId } 
        };
      case 'system':
        return { 
          screen: 'notifications' 
        };
      default:
        return { 
          screen: 'home' 
        };
    }
  }

  // For debugging - get last notification
  async getLastNotificationResponse() {
    if (!Notifications) return null;
    return await Notifications.getLastNotificationResponseAsync();
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
export { PushNotificationService };

// Helper function for React components
export const usePushNotifications = () => {
  return {
    initialize: pushNotificationService.initialize.bind(pushNotificationService),
    sendLocal: pushNotificationService.sendLocalNotification.bind(pushNotificationService),
    getToken: pushNotificationService.getExpoPushToken.bind(pushNotificationService),
    getPermissionStatus: pushNotificationService.getPermissionStatus.bind(pushNotificationService),
    requestPermissions: pushNotificationService.requestPermissions.bind(pushNotificationService),
    clearAll: pushNotificationService.clearAllNotifications.bind(pushNotificationService),
    setBadge: pushNotificationService.setBadgeCount.bind(pushNotificationService),
    clearBadge: pushNotificationService.clearBadge.bind(pushNotificationService),
    handleData: pushNotificationService.handleNotificationData.bind(pushNotificationService),
  };
};