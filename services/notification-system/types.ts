/**
 * Notification System - Unified Type Definitions
 * ================================================
 *
 * Kiến trúc lấy cảm hứng từ Telegram Desktop:
 * - Tách System (logic) và Manager/Renderer (hiển thị)
 * - Hỗ trợ 2 loại: Pending (job progress) + Push (real-time)
 * - Chuẩn hóa event schema cho WS
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 */

// ============================================================================
// 1. NOTIFICATION CATEGORIES & SEVERITY
// ============================================================================

/** Phân loại thông báo theo domain */
export type NotificationCategory =
  | "booking"
  | "chat"
  | "call"
  | "project"
  | "task"
  | "payment"
  | "system"
  | "security"
  | "social"
  | "crm"
  | "report"
  | "delivery"
  | "meeting"
  | "livestream";

/** Mức độ ưu tiên */
export type NotificationSeverity =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "critical";

/** Trạng thái hiển thị */
export type NotificationDisplayState =
  | "queued" // Đang xếp hàng chờ show
  | "displayed" // Đã hiện toast
  | "dismissed" // User bỏ qua
  | "tapped" // User bấm vào
  | "grouped" // Đã gộp vào group
  | "muted"; // Bị mute, chỉ lưu center

// ============================================================================
// 2. PUSH NOTIFICATION (Server → Client real-time)
// ============================================================================

/** Schema chuẩn cho WS event notification.created */
export interface PushNotificationEvent {
  type: "notification.created";
  id: string;
  userId: number;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  /** Deep link path, e.g. "/bookings/BK1024" */
  deeplink?: string;
  createdAt: string;
  /** Dùng để dedupe khi reconnect, e.g. "booking:BK1024:created" */
  dedupeKey?: string;
  /** Dữ liệu bổ sung (actor info, images, etc.) */
  data?: Record<string, unknown>;
  /** Nếu true, chỉ lưu center, không show toast */
  silent?: boolean;
}

// ============================================================================
// 3. JOB/PENDING NOTIFICATION (Client chờ server xử lý)
// ============================================================================

export type JobStage =
  | "queued"
  | "processing"
  | "exporting"
  | "uploading"
  | "finalizing";
export type JobStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

/** WS event: job.progress */
export interface JobProgressEvent {
  type: "job.progress";
  jobId: string;
  stage: JobStage;
  progress: number; // 0-100
  message: string;
}

/** WS event: job.done */
export interface JobDoneEvent {
  type: "job.done";
  jobId: string;
  result: Record<string, unknown>;
  message?: string;
}

/** WS event: job.failed */
export interface JobFailedEvent {
  type: "job.failed";
  jobId: string;
  error: string;
  message?: string;
}

/** Union tất cả job events */
export type JobEvent = JobProgressEvent | JobDoneEvent | JobFailedEvent;

/** State của 1 pending job trong client store */
export interface PendingJob {
  jobId: string;
  /** Mô tả ngắn, e.g. "Đang tạo booking…" */
  label: string;
  stage: JobStage;
  status: JobStatus;
  progress: number;
  message: string;
  createdAt: number; // timestamp
  updatedAt: number;
  /** Route để quay lại xem kết quả */
  resultRoute?: string;
  /** Result data khi done */
  result?: Record<string, unknown>;
  /** Error message khi fail */
  error?: string;
}

// ============================================================================
// 4. UNIFIED NOTIFICATION ITEM (lưu trong store/center)
// ============================================================================

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  deeplink?: string;
  createdAt: string;
  read: boolean;
  displayState: NotificationDisplayState;
  dedupeKey?: string;
  data?: Record<string, unknown>;
  /** Nguồn gốc: ws = real-time, rest = API fetch, local = client tạo */
  source: "ws" | "rest" | "local" | "push";
  /** Nếu thuộc 1 group */
  groupKey?: string;
}

// ============================================================================
// 5. GROUPED NOTIFICATION (gộp nhiều item cùng loại)
// ============================================================================

export interface NotificationGroup {
  groupKey: string;
  category: NotificationCategory;
  /** Tiêu đề đã gộp, e.g. "Bạn có 5 tin nhắn mới" */
  title: string;
  count: number;
  latestAt: string;
  /** IDs của các notification trong nhóm */
  itemIds: string[];
  /** Deep link chung cho group */
  deeplink?: string;
}

// ============================================================================
// 6. USER SETTINGS (mute / quiet hours / per-category)
// ============================================================================

export interface NotificationUserSettings {
  /** Global mute */
  globalMute: boolean;
  /** Quiet hours: hh:mm format */
  quietHoursStart: string | null; // e.g. "22:00"
  quietHoursEnd: string | null; // e.g. "07:00"
  /** Muted categories - vẫn lưu nhưng không toast/sound */
  mutedCategories: NotificationCategory[];
  /** Muted threads - e.g. chat threads */
  mutedThreads: string[];
  /** Sound enabled */
  soundEnabled: boolean;
  /** Vibrate enabled */
  vibrateEnabled: boolean;
  /** Show preview in toast */
  showPreview: boolean;
  /** Group similar notifications */
  groupingEnabled: boolean;
  /** Group window in ms (default 2000) */
  groupingWindowMs: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationUserSettings = {
  globalMute: false,
  quietHoursStart: null,
  quietHoursEnd: null,
  mutedCategories: [],
  mutedThreads: [],
  soundEnabled: true,
  vibrateEnabled: true,
  showPreview: true,
  groupingEnabled: true,
  groupingWindowMs: 2000,
};

// ============================================================================
// 7. WS EVENT UNION TYPE (tất cả events client cần handle)
// ============================================================================

export type NotificationWSEvent =
  | PushNotificationEvent
  | JobProgressEvent
  | JobDoneEvent
  | JobFailedEvent
  | {
      type: "notification.updated";
      id: string;
      changes: Partial<NotificationItem>;
    }
  | { type: "notification.deleted"; id: string }
  | {
      type: "badge.sync";
      counts: Record<NotificationCategory, number>;
      total: number;
    };

// ============================================================================
// 8. API RESPONSE TYPES
// ============================================================================

export interface NotificationListResponse {
  success: boolean;
  notifications: NotificationItem[];
  unread: number;
  total: number;
  cursor?: string;
  hasMore: boolean;
}

export interface NotificationAckRequest {
  /** IDs đã nhận */
  notificationIds: string[];
  /** Timestamp client đã nhận */
  receivedAt: string;
}

export interface NotificationAckResponse {
  success: boolean;
  acknowledged: number;
}
