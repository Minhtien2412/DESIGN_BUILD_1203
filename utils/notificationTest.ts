/**
 * Real-time Notification Test Utility
 * ====================================
 *
 * Test real-time notifications via WebSocket
 *
 * @author ThietKeResort Team
 * @created 2026-01-26
 */

import ENV from "@/config/env";
import { Platform } from "react-native";
import io, { Socket } from "socket.io-client";

// ============================================================================
// Types
// ============================================================================

export interface NotificationEvent {
  id: string;
  type: "message" | "call" | "system" | "project" | "task";
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationTestResult {
  connected: boolean;
  received: NotificationEvent[];
  errors: string[];
  latency: number | null;
}

// ============================================================================
// Notification Tester Class
// ============================================================================

class NotificationTester {
  private socket: Socket | null = null;
  private receivedNotifications: NotificationEvent[] = [];
  private errors: string[] = [];
  private connectionLatency: number | null = null;

  /**
   * Connect to notification namespace
   */
  async connect(token?: string): Promise<boolean> {
    const wsUrl = this.getWsUrl();
    const startTime = Date.now();

    console.log("[NotificationTest] Connecting to:", wsUrl + "/notifications");

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.errors.push("Connection timeout after 10 seconds");
        resolve(false);
      }, 10000);

      this.socket = io(wsUrl + "/notifications", {
        auth: token ? { token } : undefined,
        transports:
          Platform.OS === "web"
            ? ["polling", "websocket"]
            : ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 3,
      });

      this.socket.on("connect", () => {
        clearTimeout(timeout);
        this.connectionLatency = Date.now() - startTime;
        console.log("[NotificationTest] ✅ Connected!", {
          socketId: this.socket?.id,
          latency: this.connectionLatency + "ms",
        });

        // Subscribe to user's notifications
        if (token) {
          this.socket?.emit("subscribe", { token });
        }

        resolve(true);
      });

      this.socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        console.error("[NotificationTest] ❌ Connection error:", error.message);
        this.errors.push(error.message);
        resolve(false);
      });

      // Listen for notifications
      this.socket.on("notification", (notification: NotificationEvent) => {
        console.log(
          "[NotificationTest] 📬 Received notification:",
          notification,
        );
        this.receivedNotifications.push({
          ...notification,
          createdAt: notification.createdAt || new Date().toISOString(),
        });
      });

      // Listen for new messages
      this.socket.on(
        "new_message",
        (data: {
          conversationId: string;
          message: {
            id: string;
            content: string;
            senderId: string;
            senderName: string;
          };
        }) => {
          console.log("[NotificationTest] 💬 New message:", data);
          this.receivedNotifications.push({
            id: data.message.id,
            type: "message",
            title: `Tin nhắn từ ${data.message.senderName}`,
            body: data.message.content,
            data: { conversationId: data.conversationId },
            createdAt: new Date().toISOString(),
          });
        },
      );

      // Listen for incoming calls
      this.socket.on(
        "incoming_call",
        (data: {
          callId: string;
          callerId: string;
          callerName: string;
          type: "audio" | "video";
        }) => {
          console.log("[NotificationTest] 📞 Incoming call:", data);
          this.receivedNotifications.push({
            id: data.callId,
            type: "call",
            title: `Cuộc gọi ${data.type === "video" ? "video" : "thoại"}`,
            body: `${data.callerName} đang gọi cho bạn`,
            data: { callId: data.callId, callerId: data.callerId },
            createdAt: new Date().toISOString(),
          });
        },
      );

      // Listen for project updates
      this.socket.on(
        "project_update",
        (data: {
          projectId: string;
          projectName: string;
          updateType: string;
          message: string;
        }) => {
          console.log("[NotificationTest] 📊 Project update:", data);
          this.receivedNotifications.push({
            id: `project_${data.projectId}_${Date.now()}`,
            type: "project",
            title: `Cập nhật dự án: ${data.projectName}`,
            body: data.message,
            data: { projectId: data.projectId },
            createdAt: new Date().toISOString(),
          });
        },
      );
    });
  }

  /**
   * Disconnect from notification service
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("[NotificationTest] Disconnected");
    }
  }

  /**
   * Send test notification (requires server support)
   */
  sendTestNotification(): void {
    if (!this.socket?.connected) {
      console.warn("[NotificationTest] Not connected");
      return;
    }

    console.log("[NotificationTest] Sending test notification request...");
    this.socket.emit("send_test_notification", {
      type: "system",
      title: "Test Notification",
      body: "This is a test notification from the app",
    });
  }

  /**
   * Get current test results
   */
  getResults(): NotificationTestResult {
    return {
      connected: this.socket?.connected || false,
      received: this.receivedNotifications,
      errors: this.errors,
      latency: this.connectionLatency,
    };
  }

  /**
   * Clear received notifications
   */
  clearReceived(): void {
    this.receivedNotifications = [];
  }

  /**
   * Get WebSocket URL
   */
  private getWsUrl(): string {
    let url =
      ENV.WS_BASE_URL ||
      ENV.WS_URL ||
      ENV.API_BASE_URL ||
      "wss://baotienweb.cloud";

    // Remove trailing slash
    url = url.replace(/\/$/, "");

    // Convert http to ws
    if (url.startsWith("http://")) {
      url = url.replace("http://", "ws://");
    } else if (url.startsWith("https://")) {
      url = url.replace("https://", "wss://");
    }

    // Android emulator fix
    if (
      Platform.OS === "android" &&
      (url.includes("localhost") || url.includes("127.0.0.1"))
    ) {
      url = url
        .replace("localhost", "10.0.2.2")
        .replace("127.0.0.1", "10.0.2.2");
    }

    return url;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const notificationTester = new NotificationTester();

// ============================================================================
// Quick Test Function
// ============================================================================

/**
 * Run quick notification test
 */
export async function runNotificationTest(
  token?: string,
): Promise<NotificationTestResult> {
  console.log("\n========================================");
  console.log("[Notification Test] Starting...");
  console.log("========================================\n");

  const tester = new NotificationTester();

  // Connect
  const connected = await tester.connect(token);

  if (connected) {
    // Wait a bit to receive any pending notifications
    console.log("[Notification Test] Waiting for notifications (5 seconds)...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Send test notification
    tester.sendTestNotification();

    // Wait for response
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const results = tester.getResults();

  console.log("\n========================================");
  console.log("[Notification Test] Results");
  console.log("========================================");
  console.log("Connected:", results.connected);
  console.log("Latency:", results.latency ? results.latency + "ms" : "N/A");
  console.log("Received:", results.received.length, "notifications");
  console.log(
    "Errors:",
    results.errors.length > 0 ? results.errors.join(", ") : "None",
  );
  console.log("========================================\n");

  // Cleanup
  tester.disconnect();

  return results;
}

export default {
  NotificationTester,
  notificationTester,
  runNotificationTest,
};
