/**
 * Notification Renderer
 * ======================
 *
 * Telegram-inspired: tách hiển thị (Renderer) khỏi logic (System).
 * Renderer nhận events từ System và quyết định cách show:
 *   - Toast (in-app popup)
 *   - Native push (FCM/APNS) - delegate to expo-notifications
 *   - Sound / Vibrate
 *
 * Sau này thêm kênh mới (email, SMS) không sửa rule lõi.
 *
 * Stability improvements:
 *   - Safe expo-notifications import (no crash in Expo Go)
 *   - Vibration throttle (prevents spam buzzing)
 *   - Try-catch around all Toast/deeplink calls
 *   - Pending toast queue for early notifications
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 * @updated 2026-03-05 - Stability hardening
 */

import Constants from "expo-constants";
import { Platform, Vibration } from "react-native";
import Toast from "react-native-toast-message";

import { notificationSystem } from "./NotificationSystem";
import type { NotificationGroup, NotificationItem } from "./types";

// ============================================================================
// SAFE EXPO-NOTIFICATIONS (lazy, Expo Go safe)
// ============================================================================

const isExpoGo = Constants.appOwnership === "expo";
let ExpoNotifications: typeof import("expo-notifications") | null = null;

if (!isExpoGo) {
  try {
    ExpoNotifications = require("expo-notifications");
  } catch {
    // Module not available in this build
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface ToastConfig {
  /** Duration in ms */
  visibilityTime: number;
  /** Top offset for safe area */
  topOffset: number;
  /** Show preview text or just title */
  showPreview: boolean;
}

const DEFAULT_TOAST_CONFIG: ToastConfig = {
  visibilityTime: 4000,
  topOffset: 50,
  showPreview: true,
};

// ============================================================================
// TOAST CALLBACKS (for deeplink navigation)
// ============================================================================

type DeeplinkHandler = (deeplink: string) => void;
let deeplinkHandler: DeeplinkHandler | null = null;

export function setDeeplinkHandler(handler: DeeplinkHandler | null): void {
  deeplinkHandler = handler;
}

// ============================================================================
// NOTIFICATION RENDERER
// ============================================================================

class NotificationRenderer {
  private toastConfig: ToastConfig = { ...DEFAULT_TOAST_CONFIG };
  private unsubscribe: (() => void) | null = null;

  // Vibration throttle: prevent buzz-spam
  private lastVibrateAt = 0;
  private static readonly VIBRATE_THROTTLE_MS = 1500;

  // Toast readiness: queue early notifications until Toast component mounts
  private toastReady = false;
  private pendingToasts: Array<() => void> = [];
  private static readonly MAX_PENDING_TOASTS = 5;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Connect to NotificationSystem and start rendering.
   * Call this once in app root (e.g. _layout.tsx).
   */
  start(): void {
    if (this.unsubscribe) return; // Already started

    const settings = notificationSystem.getSettings();
    this.toastConfig.showPreview = settings.showPreview;

    // Allow Toast component time to mount before showing
    setTimeout(() => {
      this.toastReady = true;
      this.flushPendingToasts();
    }, 600);

    this.unsubscribe = notificationSystem.subscribe((event) => {
      try {
        switch (event.type) {
          case "show_toast":
            this.showToast(event.notification);
            break;
          case "show_group_toast":
            this.showGroupToast(event.group);
            break;
          case "badge_update":
            this.updateBadge(event.count);
            break;
          case "settings_changed":
            this.toastConfig.showPreview = event.settings.showPreview;
            break;
        }
      } catch (error) {
        console.warn("[NotificationRenderer] Event handler error:", error);
      }
    });

    console.log("[NotificationRenderer] Started");
  }

  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.toastReady = false;
    this.pendingToasts = [];
    console.log("[NotificationRenderer] Stopped");
  }

  // ==========================================================================
  // VIBRATION (throttled)
  // ==========================================================================

  private vibrateIfAllowed(): void {
    const settings = notificationSystem.getSettings();
    if (!settings.vibrateEnabled) return;
    if (Platform.OS === "web") return;

    const now = Date.now();
    if (now - this.lastVibrateAt < NotificationRenderer.VIBRATE_THROTTLE_MS) {
      return; // Throttled — skip
    }
    this.lastVibrateAt = now;

    try {
      Vibration.vibrate(200);
    } catch {
      // Ignore on unsupported platforms
    }
  }

  // ==========================================================================
  // TOAST SAFETY WRAPPER
  // ==========================================================================

  private safeShowToast(fn: () => void): void {
    if (this.toastReady) {
      try {
        fn();
      } catch (error) {
        console.warn("[NotificationRenderer] Toast.show error:", error);
      }
    } else if (
      this.pendingToasts.length < NotificationRenderer.MAX_PENDING_TOASTS
    ) {
      this.pendingToasts.push(fn);
    }
  }

  private flushPendingToasts(): void {
    const queue = this.pendingToasts.splice(0);
    for (const fn of queue) {
      try {
        fn();
      } catch {
        /* noop */
      }
    }
  }

  // ==========================================================================
  // TOAST RENDERING
  // ==========================================================================

  private showToast(notification: NotificationItem): void {
    this.vibrateIfAllowed();

    const toastType = this.mapSeverityToToastType(notification.severity);

    this.safeShowToast(() => {
      Toast.show({
        type: toastType,
        text1: notification.title,
        text2: this.toastConfig.showPreview ? notification.body : undefined,
        position: "top",
        visibilityTime: this.toastConfig.visibilityTime,
        topOffset: this.toastConfig.topOffset,
        props: {
          notificationId: notification.id,
          category: notification.category,
          deeplink: notification.deeplink,
        },
        onPress: () => {
          try {
            Toast.hide();
          } catch {
            /* noop */
          }
          notificationSystem.markAsRead(notification.id);
          if (notification.deeplink && deeplinkHandler) {
            try {
              deeplinkHandler(notification.deeplink);
            } catch (err) {
              console.warn("[NotificationRenderer] Deeplink error:", err);
            }
          }
        },
      });
    });
  }

  private showGroupToast(group: NotificationGroup): void {
    this.vibrateIfAllowed();

    this.safeShowToast(() => {
      Toast.show({
        type: "info",
        text1: group.title,
        text2: `${group.count} thông báo mới`,
        position: "top",
        visibilityTime: this.toastConfig.visibilityTime,
        topOffset: this.toastConfig.topOffset,
        props: {
          groupKey: group.groupKey,
          category: group.category,
          deeplink: group.deeplink,
        },
        onPress: () => {
          try {
            Toast.hide();
          } catch {
            /* noop */
          }
          if (deeplinkHandler) {
            try {
              deeplinkHandler("/notification-center");
            } catch {
              /* noop */
            }
          }
        },
      });
    });
  }

  // ==========================================================================
  // BADGE
  // ==========================================================================

  private updateBadge(count: number): void {
    if (!ExpoNotifications) return;
    try {
      ExpoNotifications.setBadgeCountAsync(Math.max(0, count)).catch(() => {});
    } catch {
      // noop
    }
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private mapSeverityToToastType(
    severity: string,
  ): "success" | "error" | "info" {
    switch (severity) {
      case "success":
        return "success";
      case "error":
      case "critical":
        return "error";
      default:
        return "info";
    }
  }

  setToastConfig(config: Partial<ToastConfig>): void {
    this.toastConfig = { ...this.toastConfig, ...config };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const notificationRenderer = new NotificationRenderer();
export default notificationRenderer;
