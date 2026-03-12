/**
 * Badge Service
 * Manages app badge counts for notifications
 *
 * @created 20/01/2026
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// Lazy import expo-notifications to avoid crash in Expo Go SDK 53+
let Notifications: typeof import("expo-notifications") | null = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("[Badge] expo-notifications not available");
  }
}

class MessagingBadgeService {
  private _badgeCount: number = 0;

  get badgeCount(): number {
    return this._badgeCount;
  }

  async setBadgeCount(count: number): Promise<void> {
    this._badgeCount = Math.max(0, count);

    try {
      if (Platform.OS !== "web" && Notifications) {
        await Notifications.setBadgeCountAsync(this._badgeCount);
      }
    } catch (error) {
      console.warn("[MessagingBadge] Failed to set badge count:", error);
    }
  }

  async incrementBadge(): Promise<void> {
    await this.setBadgeCount(this._badgeCount + 1);
  }

  async decrementBadge(): Promise<void> {
    await this.setBadgeCount(this._badgeCount - 1);
  }

  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  async getBadgeCount(): Promise<number> {
    try {
      if (Platform.OS !== "web" && Notifications) {
        return await Notifications.getBadgeCountAsync();
      }
    } catch (error) {
      console.warn("[MessagingBadge] Failed to get badge count:", error);
    }
    return this._badgeCount;
  }
}

// Export singleton instance
export const messagingBadge = new MessagingBadgeService();
export default messagingBadge;
