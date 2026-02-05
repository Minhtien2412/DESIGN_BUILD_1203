/**
 * Unified Notification Types
 *
 * This file defines the canonical notification types used throughout the app.
 * Both frontend and backend should align with these definitions.
 *
 * IMPORTANT: Backend uses UPPERCASE (INFO, SUCCESS, etc.)
 *            Frontend uses lowercase (info, success, etc.)
 *            The UnifiedNotificationContext handles normalization automatically.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Notification type - determines the visual style and icon
 *
 * Backend equivalent: INFO, SUCCESS, WARNING, ERROR, CALL, MESSAGE (uppercase)
 */
export type NotificationType =
  // Standard types (maps from backend)
  | "info"
  | "success"
  | "warning"
  | "error"
  | "message"
  | "call"
  | "system"
  | "event"
  | "live"
  // Extended app types
  | "task"
  | "project"
  | "meeting"
  | "alert"
  // Friend activity types
  | "friend_post"
  | "friend_livestream"
  | "friend_story"
  | "friend_reel"
  | "follow"
  | "like"
  | "comment"
  | "mention"
  | "share";

/**
 * Notification category - groups related notifications
 *
 * Backend equivalent: SYSTEM, EVENT, LIVE, MESSAGE (uppercase)
 */
export type NotificationCategory =
  | "system"
  | "event"
  | "live"
  | "message"
  | "call"
  | "project"
  | "payment"
  | "security"
  // Friend activity categories
  | "social"
  | "friend_activity"
  | "content";

/**
 * Notification priority - determines urgency
 *
 * Backend equivalent: LOW, NORMAL, HIGH, URGENT (uppercase)
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Notification source - where the notification originated
 */
export type NotificationSource =
  | "app"
  | "crm"
  | "system"
  | "push"
  | "websocket";

// ============================================================================
// Main Notification Interface
// ============================================================================

/**
 * Unified notification structure used throughout the app
 */
export interface UnifiedNotification {
  /** Unique identifier (string on frontend, could be number from backend) */
  id: string;

  /** Type determines visual style */
  type: NotificationType;

  /** Short title shown prominently */
  title: string;

  /** Full message body */
  message: string;

  /** Alias for message (expo-notifications compatibility) */
  body?: string;

  /** Whether user has read this notification */
  read: boolean;

  /** Alias for read (backend compatibility) */
  isRead?: boolean;

  /** ISO timestamp when notification was created */
  createdAt: string;

  /** Optional category for grouping */
  category?: NotificationCategory;

  /** Optional priority level */
  priority?: NotificationPriority;

  /** Arbitrary additional data (deep links, action data, etc.) */
  data?: Record<string, unknown>;

  /** Source of the notification */
  source?: NotificationSource;

  // -------------------------------------------------------------------------
  // Navigation fields
  // -------------------------------------------------------------------------

  /** Related entity type for navigation (e.g., "order", "project", "chat") */
  relatedType?: string;

  /** Related entity ID for navigation */
  relatedId?: string;

  /** Deep link URL for navigation */
  actionUrl?: string;

  // -------------------------------------------------------------------------
  // Friend Activity Fields
  // -------------------------------------------------------------------------

  /** ID of the user who triggered this notification */
  actorId?: string;

  /** Name of the user who triggered this notification */
  actorName?: string;

  /** Avatar URL of the actor */
  actorAvatar?: string;

  /** Type of content for friend activity */
  contentType?: "post" | "livestream" | "story" | "reel" | "comment";

  /** ID of the related content */
  contentId?: string;

  /** Preview text of the content */
  contentPreview?: string;

  /** Thumbnail URL for visual preview */
  thumbnailUrl?: string;
}

// ============================================================================
// Backend API Types
// ============================================================================

/**
 * Notification as returned from backend API (before normalization)
 *
 * Uses UPPERCASE enum values.
 */
export interface BackendNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "CALL" | "MESSAGE";
  category?: "SYSTEM" | "EVENT" | "LIVE" | "MESSAGE";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  read: boolean;
  data?: Record<string, unknown>;
  isSent?: boolean;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create notification request DTO (sent to backend)
 */
export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "CALL" | "MESSAGE";
  category?: "SYSTEM" | "EVENT" | "LIVE" | "MESSAGE";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  data?: Record<string, unknown>;
}

// ============================================================================
// Push Token Types
// ============================================================================

/**
 * Device platform for push tokens
 */
export type DevicePlatform =
  | "IOS"
  | "ANDROID"
  | "WEB"
  | "ios"
  | "android"
  | "web";

/**
 * Register push token request
 */
export interface RegisterPushTokenRequest {
  token: string;
  platform?: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
}

/**
 * Push token as stored in database
 */
export interface DeviceToken {
  id: number;
  userId: number;
  token: string;
  platform: "IOS" | "ANDROID" | "WEB";
  deviceId?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Friend Activity Types
// ============================================================================

/**
 * Data for friend activity notifications
 */
export interface FriendActivityData {
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  contentType: "post" | "livestream" | "story" | "reel" | "comment";
  contentId: string;
  contentPreview?: string;
  thumbnailUrl?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type guard to check if notification type is valid
 */
export const isValidNotificationType = (
  type: string,
): type is NotificationType => {
  const validTypes: NotificationType[] = [
    "info",
    "success",
    "warning",
    "error",
    "message",
    "call",
    "system",
    "event",
    "live",
    "task",
    "project",
    "meeting",
    "alert",
    "friend_post",
    "friend_livestream",
    "friend_story",
    "friend_reel",
    "follow",
    "like",
    "comment",
    "mention",
    "share",
  ];
  return validTypes.includes(type.toLowerCase() as NotificationType);
};

/**
 * Type guard to check if notification category is valid
 */
export const isValidNotificationCategory = (
  category: string,
): category is NotificationCategory => {
  const validCategories: NotificationCategory[] = [
    "system",
    "event",
    "live",
    "message",
    "call",
    "project",
    "payment",
    "security",
    "social",
    "friend_activity",
    "content",
  ];
  return validCategories.includes(
    category.toLowerCase() as NotificationCategory,
  );
};

/**
 * Type guard to check if notification priority is valid
 */
export const isValidNotificationPriority = (
  priority: string,
): priority is NotificationPriority => {
  const validPriorities: NotificationPriority[] = [
    "low",
    "normal",
    "high",
    "urgent",
  ];
  return validPriorities.includes(
    priority.toLowerCase() as NotificationPriority,
  );
};

/**
 * Normalize backend notification to frontend format
 */
export const normalizeNotification = (
  backend: BackendNotification,
): UnifiedNotification => ({
  id: String(backend.id),
  type: backend.type.toLowerCase() as NotificationType,
  title: backend.title,
  message: backend.message,
  read: backend.read,
  createdAt: backend.createdAt,
  category: backend.category?.toLowerCase() as NotificationCategory | undefined,
  priority: (backend.priority?.toLowerCase() ||
    "normal") as NotificationPriority,
  data: backend.data,
  source: "app",
});
