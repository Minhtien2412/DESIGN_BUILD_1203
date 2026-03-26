/**
 * Service Order — Unified types for the "Tìm thợ / Đặt thợ" module.
 * ─────────────────────────────────────────────────────────────────────
 * Single source of truth for the complete service lifecycle.
 *
 * Supersedes the overlapping enums in:
 *   - types/booking.ts            (BookingStatus)
 *   - types/booking-status.ts     (UnifiedTrackingStatus, ApiBookingStatus)
 *   - worker-location.service.ts  (TrackingStatus)
 *
 * Those files still exist for backward compatibility but new code
 * should import from this file.
 */

// ════════════════════════════════════════════════════════════════════
// 1. Status enum — full lifecycle
// ════════════════════════════════════════════════════════════════════

export type ServiceOrderStatus =
  | "draft" // Customer đang soạn yêu cầu
  | "submitted" // Đã gửi yêu cầu
  | "searching_provider" // Hệ thống đang tìm thợ (radar)
  | "providers_notified" // Đã gửi request đến thợ khu vực
  | "quoted" // Thợ đã gửi báo giá
  | "awaiting_customer_confirmation" // Chờ customer xác nhận giá
  | "confirmed" // Cả 2 bên đồng ý
  | "scheduled" // Đã lên lịch
  | "reschedule_requested" // Một bên yêu cầu đổi lịch
  | "provider_on_the_way" // Thợ đang đến
  | "in_progress" // Đang thi công
  | "completed" // Hoàn thành
  | "warranty_active" // Đang bảo hành
  | "cancelled" // Đã hủy
  | "closed"; // Kết thúc hoàn toàn

// ════════════════════════════════════════════════════════════════════
// 2. Status metadata (label, color, icon)
// ════════════════════════════════════════════════════════════════════

export interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
  icon: string; // Ionicons name
}

export const SERVICE_ORDER_STATUS_META: Record<ServiceOrderStatus, StatusMeta> =
  {
    draft: {
      label: "Nháp",
      color: "#9E9E9E",
      bgColor: "#F5F5F5",
      icon: "create-outline",
    },
    submitted: {
      label: "Đã gửi",
      color: "#FF9800",
      bgColor: "#FFF3E0",
      icon: "send-outline",
    },
    searching_provider: {
      label: "Đang tìm thợ",
      color: "#FF9800",
      bgColor: "#FFF3E0",
      icon: "search-outline",
    },
    providers_notified: {
      label: "Đã thông báo thợ",
      color: "#2196F3",
      bgColor: "#E3F2FD",
      icon: "notifications-outline",
    },
    quoted: {
      label: "Đã báo giá",
      color: "#673AB7",
      bgColor: "#EDE7F6",
      icon: "pricetag-outline",
    },
    awaiting_customer_confirmation: {
      label: "Chờ xác nhận",
      color: "#FF9800",
      bgColor: "#FFF3E0",
      icon: "time-outline",
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
      icon: "checkmark-circle-outline",
    },
    scheduled: {
      label: "Đã lên lịch",
      color: "#03A9F4",
      bgColor: "#E1F5FE",
      icon: "calendar-outline",
    },
    reschedule_requested: {
      label: "Yêu cầu đổi lịch",
      color: "#FF5722",
      bgColor: "#FBE9E7",
      icon: "swap-horizontal-outline",
    },
    provider_on_the_way: {
      label: "Thợ đang đến",
      color: "#03A9F4",
      bgColor: "#E1F5FE",
      icon: "navigate-outline",
    },
    in_progress: {
      label: "Đang thi công",
      color: "#FF5722",
      bgColor: "#FBE9E7",
      icon: "construct-outline",
    },
    completed: {
      label: "Hoàn thành",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
      icon: "checkmark-done-circle-outline",
    },
    warranty_active: {
      label: "Đang bảo hành",
      color: "#009688",
      bgColor: "#E0F2F1",
      icon: "shield-checkmark-outline",
    },
    cancelled: {
      label: "Đã hủy",
      color: "#F44336",
      bgColor: "#FFEBEE",
      icon: "close-circle-outline",
    },
    closed: {
      label: "Đã đóng",
      color: "#607D8B",
      bgColor: "#ECEFF1",
      icon: "lock-closed-outline",
    },
  };

// ════════════════════════════════════════════════════════════════════
// 3. Status ordering (for timeline/stepper)
// ════════════════════════════════════════════════════════════════════

/** Happy-path order for the stepper UI */
export const HAPPY_PATH_ORDER: ServiceOrderStatus[] = [
  "submitted",
  "searching_provider",
  "providers_notified",
  "quoted",
  "awaiting_customer_confirmation",
  "confirmed",
  "scheduled",
  "provider_on_the_way",
  "in_progress",
  "completed",
];

export function getStatusIndex(status: ServiceOrderStatus): number {
  return HAPPY_PATH_ORDER.indexOf(status);
}

// ════════════════════════════════════════════════════════════════════
// 4. Backward-compatibility mappers
// ════════════════════════════════════════════════════════════════════

import type { ApiBookingStatus, UnifiedTrackingStatus } from "./booking-status";

/** Convert old ApiBookingStatus → ServiceOrderStatus */
export function fromApiStatus(api: ApiBookingStatus): ServiceOrderStatus {
  switch (api) {
    case "PENDING":
      return "submitted";
    case "CONFIRMED":
      return "confirmed";
    case "IN_PROGRESS":
      return "in_progress";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
  }
}

/** Convert old UnifiedTrackingStatus → ServiceOrderStatus */
export function fromTrackingStatus(
  t: UnifiedTrackingStatus,
): ServiceOrderStatus {
  switch (t) {
    case "searching":
      return "searching_provider";
    case "accepted":
      return "confirmed";
    case "arriving":
      return "provider_on_the_way";
    case "arrived":
      return "provider_on_the_way";
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
  }
}

/** Convert ServiceOrderStatus → ApiBookingStatus for backend sync */
export function toApiStatus(s: ServiceOrderStatus): ApiBookingStatus {
  switch (s) {
    case "draft":
    case "submitted":
    case "searching_provider":
    case "providers_notified":
    case "quoted":
    case "awaiting_customer_confirmation":
    case "reschedule_requested":
      return "PENDING";
    case "confirmed":
    case "scheduled":
    case "provider_on_the_way":
      return "CONFIRMED";
    case "in_progress":
      return "IN_PROGRESS";
    case "completed":
    case "warranty_active":
    case "closed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
  }
}

// ════════════════════════════════════════════════════════════════════
// 5. Allowed transitions (guards for state machine)
// ════════════════════════════════════════════════════════════════════

const TRANSITIONS: Partial<Record<ServiceOrderStatus, ServiceOrderStatus[]>> = {
  draft: ["submitted", "cancelled"],
  submitted: ["searching_provider", "cancelled"],
  searching_provider: ["providers_notified", "cancelled"],
  providers_notified: ["quoted", "cancelled"],
  quoted: ["awaiting_customer_confirmation", "cancelled"],
  awaiting_customer_confirmation: ["confirmed", "cancelled"],
  confirmed: ["scheduled", "cancelled"],
  scheduled: ["reschedule_requested", "provider_on_the_way", "cancelled"],
  reschedule_requested: ["scheduled", "cancelled"],
  provider_on_the_way: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: ["warranty_active", "closed"],
  warranty_active: ["closed"],
};

export function canTransition(
  from: ServiceOrderStatus,
  to: ServiceOrderStatus,
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

// ════════════════════════════════════════════════════════════════════
// 6. Role-based CTA visibility
// ════════════════════════════════════════════════════════════════════

export type ServiceRole = "customer" | "provider" | "admin" | "accountant";

export interface StatusCTA {
  label: string;
  action: string; // action key (e.g. "confirm", "cancel", "reschedule")
  variant: "primary" | "secondary" | "danger";
}

/**
 * Returns the CTAs visible for a given role at a given status.
 */
export function getCTAsForStatus(
  status: ServiceOrderStatus,
  role: ServiceRole,
): StatusCTA[] {
  const ctas: StatusCTA[] = [];

  if (role === "customer") {
    switch (status) {
      case "draft":
        ctas.push({
          label: "Gửi yêu cầu",
          action: "submit",
          variant: "primary",
        });
        break;
      case "submitted":
      case "searching_provider":
      case "providers_notified":
        ctas.push({
          label: "Hủy yêu cầu",
          action: "cancel",
          variant: "danger",
        });
        break;
      case "quoted":
      case "awaiting_customer_confirmation":
        ctas.push({ label: "Xác nhận", action: "confirm", variant: "primary" });
        ctas.push({ label: "Từ chối", action: "cancel", variant: "danger" });
        break;
      case "confirmed":
      case "scheduled":
        ctas.push({
          label: "Đổi lịch",
          action: "reschedule",
          variant: "secondary",
        });
        ctas.push({
          label: "Hủy dịch vụ",
          action: "cancel",
          variant: "danger",
        });
        break;
      case "reschedule_requested":
        ctas.push({
          label: "Đồng ý",
          action: "accept_reschedule",
          variant: "primary",
        });
        ctas.push({
          label: "Từ chối",
          action: "reject_reschedule",
          variant: "danger",
        });
        break;
      case "completed":
        ctas.push({ label: "Đánh giá", action: "review", variant: "primary" });
        break;
      case "warranty_active":
        ctas.push({
          label: "Yêu cầu bảo hành",
          action: "claim_warranty",
          variant: "primary",
        });
        break;
    }
  }

  if (role === "provider") {
    switch (status) {
      case "providers_notified":
        ctas.push({ label: "Nhận việc", action: "accept", variant: "primary" });
        ctas.push({ label: "Từ chối", action: "decline", variant: "danger" });
        break;
      case "quoted":
        ctas.push({
          label: "Sửa báo giá",
          action: "edit_quote",
          variant: "secondary",
        });
        break;
      case "confirmed":
        ctas.push({
          label: "Gửi báo giá",
          action: "send_quote",
          variant: "primary",
        });
        break;
      case "scheduled":
        ctas.push({
          label: "Bắt đầu đi",
          action: "start_travel",
          variant: "primary",
        });
        ctas.push({
          label: "Đổi lịch",
          action: "reschedule",
          variant: "secondary",
        });
        break;
      case "provider_on_the_way":
        ctas.push({
          label: "Đã đến nơi",
          action: "arrive",
          variant: "primary",
        });
        break;
      case "in_progress":
        ctas.push({
          label: "Hoàn thành",
          action: "complete",
          variant: "primary",
        });
        break;
    }
  }

  if (role === "admin") {
    if (status !== "closed" && status !== "draft") {
      ctas.push({
        label: "Override trạng thái",
        action: "admin_override",
        variant: "secondary",
      });
    }
    if (status === "cancelled" || status === "completed") {
      ctas.push({ label: "Đóng", action: "close", variant: "secondary" });
    }
  }

  return ctas;
}

// ════════════════════════════════════════════════════════════════════
// 7. Service Order interface
// ════════════════════════════════════════════════════════════════════

export interface ServiceOrderAddress {
  fullAddress: string;
  district?: string;
  city?: string;
  latitude: number;
  longitude: number;
  note?: string;
  placeName?: string; // tên địa điểm đã lưu
}

export interface ServiceOrderQuote {
  amount: number;
  description: string;
  breakdown?: { item: string; amount: number }[];
  validUntil?: string; // ISO date
  createdAt: string;
}

export interface RescheduleRequest {
  requestedBy: ServiceRole;
  originalDate: string; // ISO date
  originalTime?: string;
  newDate: string;
  newTime?: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
}

export interface ServiceOrder {
  id: string;
  status: ServiceOrderStatus;
  customerId: string;
  providerId?: string;

  // What
  serviceCategory: string;
  serviceName: string;
  description?: string;
  images?: string[];

  // Where & When
  address: ServiceOrderAddress;
  scheduledDate?: string;
  scheduledTime?: string;

  // Money
  estimatedPrice?: number;
  quote?: ServiceOrderQuote;
  finalPrice?: number;
  paymentMethod?: "momo" | "vnpay" | "bank_transfer" | "cash";
  paymentStatus?: "pending" | "paid" | "refunded";

  // Negotiation
  reschedule?: RescheduleRequest;

  // Provider info (denormalized for display)
  providerInfo?: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    rating: number;
    category: string;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  // Warranty
  warrantyExpiry?: string;

  // Agreement
  agreementSigned?: boolean;
  agreementSignedAt?: string;
}

// ════════════════════════════════════════════════════════════════════
// 8. Cancel reason options
// ════════════════════════════════════════════════════════════════════

export const CANCEL_REASONS = [
  { id: "change_mind", label: "Tôi đổi ý" },
  { id: "found_other", label: "Tìm được thợ khác" },
  { id: "too_expensive", label: "Giá quá cao" },
  { id: "wrong_info", label: "Nhập sai thông tin" },
  { id: "schedule_conflict", label: "Lịch bị trùng" },
  { id: "provider_issue", label: "Vấn đề từ phía thợ" },
  { id: "other", label: "Lý do khác" },
] as const;

export type CancelReasonId = (typeof CANCEL_REASONS)[number]["id"];

// ════════════════════════════════════════════════════════════════════
// 9. Reschedule reason options
// ════════════════════════════════════════════════════════════════════

export const RESCHEDULE_REASONS = [
  { id: "personal", label: "Lý do cá nhân" },
  { id: "weather", label: "Thời tiết xấu" },
  { id: "traffic", label: "Kẹt xe / không di chuyển được" },
  { id: "emergency", label: "Việc khẩn cấp" },
  { id: "material_delay", label: "Vật tư chưa đủ" },
  { id: "other", label: "Lý do khác" },
] as const;
