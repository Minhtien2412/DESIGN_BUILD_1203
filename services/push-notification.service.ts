/**
 * Push Notification Service
 * Handles registration, permissions, and notification handling
 */

import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { apiFetch } from "./api";

function getExpoProjectId(): string | undefined {
  const easFromEasConfig = (Constants as any)?.easConfig?.projectId;
  const easFromExpoConfig = (Constants as any)?.expoConfig?.extra?.eas?.projectId;
  const easFromManifest = (Constants as any)?.manifest?.extra?.eas?.projectId;

  return (
    easFromEasConfig ||
    easFromExpoConfig ||
    easFromManifest ||
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  );
}

// Lazy load expo-notifications to avoid Expo Go SDK 53+ crash
let Notifications: typeof import("expo-notifications") | null = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn(
      "[push-notification.service] expo-notifications not available",
    );
  }
}

// Configure notification behavior (only if Notifications available)
if (Notifications) {
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

interface PushNotificationData {
  type:
    | "message"
    | "call"
    | "notification"
    | "order"
    | "task"
    | "project"
    | "meeting"
    | "system";
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
    if (!Notifications) {
      console.log("[PushNotification] Notifications not available in Expo Go");
      return;
    }

    try {
      // Request permissions
      const token = await this.registerForPushNotifications();

      if (token) {
        this.expoPushToken = token;
        await this.sendTokenToServer(token);
        console.log("[PushNotification] ✅ Initialized with token:", token);
      }

      // Set up listeners
      this.setupListeners();
    } catch (error) {
      console.error("[PushNotification] Initialization failed:", error);
    }
  }

  /**
   * Register for push notifications
   */
  private async registerForPushNotifications(): Promise<string | null> {
    if (!Notifications) {
      console.log("[PushNotification] Notifications not available in Expo Go");
      return null;
    }

    // Only works on physical devices
    if (!Device.isDevice) {
      console.warn(
        "[PushNotification] Push notifications only work on physical devices",
      );
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("[PushNotification] Permission not granted");
        return null;
      }

      const projectId = getExpoProjectId();
      if (!projectId) {
        console.warn(
          "[PushNotification] Missing EAS projectId. Set EXPO_PUBLIC_EAS_PROJECT_ID or add extra.eas.projectId in app config.",
        );
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      // Android-specific channel setup
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("messages", {
          name: "Messages",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#3b82f6",
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("calls", {
          name: "Calls",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: "#0066CC",
          sound: "default",
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error("[PushNotification] Registration failed:", error);
      return null;
    }
  }

  /**
   * Send push token to backend
   */
  private async sendTokenToServer(token: string) {
    try {
      await apiFetch("/api/v1/push-tokens", {
        method: "POST",
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          deviceId: Device.modelId,
          deviceName: Device.modelName,
        }),
      });
      console.log("[PushNotification] Token registered on server");
    } catch (error) {
      console.error(
        "[PushNotification] Failed to register token on server:",
        error,
      );
    }
  }

  /**
   * Set up notification listeners
   */
  private setupListeners() {
    if (!Notifications) return;

    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[PushNotification] Received:", notification);
        const data = notification.request.content.data as PushNotificationData;

        // Handle based on type
        if (data.type === "message") {
          // Update message state via WebSocket or direct API call
          this.handleMessageNotification(data);
        }
      },
    );

    // Listener for when user taps on notification - use notification navigator
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          console.log("[PushNotification] User tapped notification:", response);

          // Use notification navigator service for deep linking
          try {
            const { handleNotificationTap } =
              await import("./notificationNavigator");
            const result = handleNotificationTap(response);
            console.log("[PushNotification] Navigation result:", result);
          } catch (error) {
            console.warn("[PushNotification] Navigator fallback:", error);
            const data = response.notification.request.content
              .data as PushNotificationData;
            this.handleNotificationTap(data);
          }
        },
      );
  }

  /**
   * Handle message notification (app in foreground)
   */
  private handleMessageNotification(data: PushNotificationData) {
    // This can trigger a refresh in MessageContext
    // or emit an event that components can listen to
    console.log("[PushNotification] New message from:", data.senderName);
  }

  /**
   * Handle notification tap (deep linking) - Fallback method
   */
  private async handleNotificationTap(data: PushNotificationData) {
    try {
      const { router } = await import("expo-router");

      // Navigate based on type
      if (data.type === "message" && data.conversationId) {
        router.push(`/chat/${data.conversationId}` as any);
      } else if (data.type === "order" && data.conversationId) {
        router.push(`/order/${data.conversationId}` as any);
      } else {
        router.push("/notifications");
      }
    } catch (error) {
      console.error("[PushNotification] Navigation failed:", error);
    }
  }

  /**
   * Schedule local notification (for testing or reminders)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: PushNotificationData,
    seconds: number = 0,
  ) {
    if (!Notifications) {
      console.log("[PushNotification] Notifications not available in Expo Go");
      return null;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: "default" as any,
          badge: 1,
        },
        trigger: seconds > 0 ? ({ seconds } as any) : null,
      });

      console.log("[PushNotification] Scheduled notification:", id);
      return id;
    } catch (error) {
      console.error("[PushNotification] Failed to schedule:", error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string) {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number) {
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    if (!Notifications) return 0;
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
