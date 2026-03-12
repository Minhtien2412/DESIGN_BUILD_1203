/**
 * Notification Service - AI completion notifications
 * Uses expo-notifications for local and push notifications
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// Lazy load expo-notifications to avoid Expo Go SDK 53+ crash
let Notifications: typeof import("expo-notifications") | null = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("[notificationService] expo-notifications not available");
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

export interface AINotificationData {
  type:
    | "analysis_complete"
    | "report_ready"
    | "material_check"
    | "chat_response";
  projectId?: number;
  projectName?: string;
  resultId?: number;
  title: string;
  body: string;
}

class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Notifications) {
      console.log(
        "[notificationService] Notifications not available in Expo Go",
      );
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("ai-notifications", {
        name: "AI Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0D9488",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  }

  /**
   * Schedule notification for AI task completion
   */
  async scheduleAINotification(data: AINotificationData): Promise<string> {
    if (!Notifications) {
      console.log(
        "[notificationService] Notifications not available in Expo Go",
      );
      return "";
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn("Notification permission not granted");
      return "";
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: data.title,
        body: data.body,
        data: {
          type: data.type,
          projectId: data.projectId,
          projectName: data.projectName,
          resultId: data.resultId,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    return notificationId;
  }

  /**
   * Notify when photo analysis is complete
   */
  async notifyAnalysisComplete(
    projectName: string,
    completionPercentage: number,
    resultId: number,
  ): Promise<string> {
    return this.scheduleAINotification({
      type: "analysis_complete",
      projectName,
      resultId,
      title: "📸 Phân tích ảnh hoàn tất",
      body: `Dự án "${projectName}" - Tiến độ: ${completionPercentage}%. Nhấn để xem chi tiết.`,
    });
  }

  /**
   * Notify when AI report is ready
   */
  async notifyReportReady(
    projectName: string,
    reportType: string,
    resultId: number,
  ): Promise<string> {
    return this.scheduleAINotification({
      type: "report_ready",
      projectName,
      resultId,
      title: "📄 Báo cáo AI đã sẵn sàng",
      body: `Báo cáo ${reportType} cho dự án "${projectName}" đã được tạo. Nhấn để xem.`,
    });
  }

  /**
   * Notify when material check is complete
   */
  async notifyMaterialCheckComplete(
    materialType: string,
    isCompliant: boolean,
    resultId: number,
  ): Promise<string> {
    const icon = isCompliant ? "✅" : "⚠️";
    const status = isCompliant ? "Đạt chuẩn" : "Cần kiểm tra";

    return this.scheduleAINotification({
      type: "material_check",
      resultId,
      title: `${icon} Kiểm tra ${materialType}`,
      body: `Kết quả: ${status}. Nhấn để xem chi tiết đánh giá.`,
    });
  }

  /**
   * Notify AI chat response (for background mode)
   */
  async notifyChatResponse(message: string): Promise<string> {
    return this.scheduleAINotification({
      type: "chat_response",
      title: "💬 AI Assistant trả lời",
      body: message.length > 100 ? message.substring(0, 100) + "..." : message,
    });
  }

  /**
   * Cancel specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all AI notifications
   */
  async cancelAllNotifications(): Promise<void> {
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    if (!Notifications) return 0;
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(listener: (notification: any) => void): any {
    if (!Notifications) return { remove: () => {} };
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(listener: (response: any) => void): any {
    if (!Notifications) return { remove: () => {} };
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export const notificationService = new NotificationService();
