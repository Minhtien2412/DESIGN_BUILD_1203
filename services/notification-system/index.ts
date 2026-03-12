/**
 * Notification System - Barrel Export
 * =====================================
 *
 * Import tất cả từ '@/services/notification-system':
 *
 *   import {
 *     notificationSystem,
 *     notificationRenderer,
 *     jobProgressManager,
 *     setDeeplinkHandler,
 *   } from '@/services/notification-system';
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 * @updated 2026-03-05 - Clean exports, remove confusing dual default/named
 */

// Types
export type {
    JobDoneEvent,
    JobEvent,
    JobFailedEvent,
    JobProgressEvent,
    JobStage,
    JobStatus,
    NotificationAckRequest,
    NotificationAckResponse,
    NotificationCategory,
    NotificationDisplayState,
    NotificationGroup,
    NotificationItem,
    NotificationListResponse,
    NotificationSeverity,
    NotificationUserSettings,
    NotificationWSEvent,
    PendingJob,
    PushNotificationEvent
} from "./types";

export { DEFAULT_NOTIFICATION_SETTINGS } from "./types";

// Core System (logic: queue, dedupe, grouping, rules)
export { notificationSystem } from "./NotificationSystem";

// Renderer (toast, badge, sound)
export {
    notificationRenderer,
    setDeeplinkHandler
} from "./NotificationRenderer";
export type { ToastConfig } from "./NotificationRenderer";

// Job Progress Manager (pending / in-progress tasks)
export { jobProgressManager } from "./JobProgressManager";
