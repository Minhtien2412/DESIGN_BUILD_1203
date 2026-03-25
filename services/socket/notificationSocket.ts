/**
 * Notification Socket — Singleton Service
 * ==========================================
 * The ONE AND ONLY socket connection to /notifications.
 *
 * All consumers (UnifiedNotificationContext, NotificationControllerContext,
 * BadgeSyncService, etc.) MUST subscribe to events from this service
 * instead of creating their own io("/notifications") connections.
 *
 * Lifecycle:
 *   login  → notificationSocket.connect(userId)
 *   logout → notificationSocket.disconnect()
 *   token refresh → handled automatically on reconnect_attempt
 *
 * @author ThietKeResort Team
 */

import {
    buildNamespaceUrl,
    buildSocketOptions,
    getAccessToken,
    logConnectError,
} from "@/services/socket/socketConfig";
import type { Socket } from "@/utils/socketIo";
import { getSocketIo } from "@/utils/socketIo";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export type NotificationSocketEvent =
  | "connect"
  | "disconnect"
  | "registered"
  | "notification"
  | "notification.created"
  | "broadcast"
  | "job.progress"
  | "job.done"
  | "job.failed"
  | "badge.sync"
  | "notification:new"
  | "missedCall"
  | "friend_new_post"
  | "friend_start_livestream"
  | "friend_new_story"
  | "friend_new_reel"
  | "force_disconnect"
  | "error";

/**
 * Listener receives the raw event data exactly as the server sends it.
 */
type EventListener = (data: any) => void;

// ────────────────────────────────────────────────
// Singleton
// ────────────────────────────────────────────────

class NotificationSocketService {
  private static instance: NotificationSocketService;

  private socket: Socket | null = null;
  private userId: number | null = null;
  private connecting = false;
  private _connected = false;

  /** Per-event subscriber sets */
  private listeners = new Map<string, Set<EventListener>>();

  private constructor() {}

  static getInstance(): NotificationSocketService {
    if (!NotificationSocketService.instance) {
      NotificationSocketService.instance = new NotificationSocketService();
    }
    return NotificationSocketService.instance;
  }

  // ──────────────── Public API ────────────────

  get connected(): boolean {
    return this._connected && !!this.socket?.connected;
  }

  get rawSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Open the ONE notification socket connection.
   * Safe to call multiple times — will no-op if already connected for the same user.
   */
  async connect(userId: number): Promise<void> {
    if (this.socket?.connected && this.userId === userId) {
      return; // already connected
    }

    if (this.connecting) return;
    this.connecting = true;

    // Disconnect previous if user changed
    if (this.socket && this.userId !== userId) {
      this.internalDisconnect();
    }

    this.userId = userId;

    const wsUrl = buildNamespaceUrl("notifications");

    try {
      const token = await getAccessToken();
      if (!token) {
        console.warn("[NotificationSocket] No token, skipping connect");
        this.connecting = false;
        return;
      }

      const io = await getSocketIo();

      const socket = io(
        wsUrl,
        buildSocketOptions(token, {
          reconnectionAttempts: 10,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10_000,
        }),
      );

      // ---- Core lifecycle events ----

      socket.on("connect", () => {
        console.log("[NotificationSocket] Connected, id:", socket.id);
        this._connected = true;

        // Register user with backend
        socket.emit("register", { userId });

        this.emit("connect", { socketId: socket.id });
      });

      socket.on("disconnect", (reason: string) => {
        console.log("[NotificationSocket] Disconnected:", reason);
        this._connected = false;
        this.emit("disconnect", { reason });
      });

      socket.on("connect_error", (error: Error) => {
        const msg = (error as any)?.message || "";
        logConnectError(
          "NotificationSocket",
          "notifications",
          wsUrl,
          error as any,
          token,
        );
        this._connected = false;

        // If auth failed, try to refresh token immediately
        if (
          msg.includes("jwt expired") ||
          msg.includes("Invalid token") ||
          msg.includes("Authentication")
        ) {
          getAccessToken()
            .then((fresh) => {
              if (fresh) {
                (socket as any).auth = { token: fresh };
              } else {
                // No fresh token → stop reconnecting to avoid spam
                console.warn(
                  "[NotificationSocket] No fresh token — stopping reconnect",
                );
                socket.disconnect();
              }
            })
            .catch(() => {
              socket.disconnect();
            });
        }
      });

      // Token refresh before reconnect
      socket.io.on("reconnect_attempt", async (attempt: number) => {
        console.log("[NotificationSocket] Reconnect attempt:", attempt);
        try {
          const freshToken = await getAccessToken();
          if (freshToken) {
            (socket as any).auth = { token: freshToken };
          } else {
            console.warn(
              "[NotificationSocket] No token for reconnect — giving up",
            );
            socket.disconnect();
          }
        } catch (err) {
          console.warn("[NotificationSocket] Token refresh failed:", err);
          socket.disconnect();
        }
      });

      socket.io.on("reconnect", () => {
        console.log("[NotificationSocket] Reconnected");
        this._connected = true;
        socket.emit("register", { userId });
        this.emit("connect", { socketId: socket.id, reconnected: true });
      });

      socket.io.on("reconnect_failed", () => {
        console.error(
          "[NotificationSocket] Reconnect failed after max attempts",
        );
      });

      // ---- Business events — forward to subscribers ----

      const forwardEvents: NotificationSocketEvent[] = [
        "registered",
        "notification",
        "notification.created",
        "broadcast",
        "job.progress",
        "job.done",
        "job.failed",
        "badge.sync",
        "notification:new",
        "missedCall",
        "friend_new_post",
        "friend_start_livestream",
        "friend_new_story",
        "friend_new_reel",
        "force_disconnect",
        "error",
      ];

      for (const eventName of forwardEvents) {
        socket.on(eventName, (data: any) => {
          this.emit(eventName, data);
        });
      }

      this.socket = socket;
    } catch (error) {
      console.error("[NotificationSocket] Init failed:", error);
      this._connected = false;
    } finally {
      this.connecting = false;
    }
  }

  /**
   * Disconnect and tear down the singleton socket.
   * Call on logout.
   */
  disconnect(): void {
    this.internalDisconnect();
    this.userId = null;
  }

  /**
   * Subscribe to a notification socket event.
   * Returns an unsubscribe function.
   */
  on(
    event: NotificationSocketEvent | string,
    listener: EventListener,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /**
   * Emit to server (pass-through).
   * Use for e.g. subscribe_friend_activities.
   */
  emitToServer(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(
        `[NotificationSocket] Cannot emit "${event}" — socket not connected`,
      );
    }
  }

  // ──────────────── Internal ────────────────

  private internalDisconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this._connected = false;
    this.connecting = false;
  }

  /** Fan out an event to all subscribers */
  private emit(event: string, data: any): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((fn) => {
        try {
          fn(data);
        } catch (err) {
          console.error(
            `[NotificationSocket] Listener error on "${event}":`,
            err,
          );
        }
      });
    }
  }
}

// ────────────────────────────────────────────────
// Export singleton
// ────────────────────────────────────────────────

export const notificationSocket = NotificationSocketService.getInstance();
