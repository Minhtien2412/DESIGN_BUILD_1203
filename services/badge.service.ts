/**
 * Badge Service
 * Manages app badge counts for notifications
 *
 * @created 20/01/2026
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

class MessagingBadgeService {
  private _badgeCount: number = 0;

  get badgeCount(): number {
    return this._badgeCount;
  }

  async setBadgeCount(count: number): Promise<void> {
    this._badgeCount = Math.max(0, count);

    try {
      if (Platform.OS !== "web") {
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
      if (Platform.OS !== "web") {
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
