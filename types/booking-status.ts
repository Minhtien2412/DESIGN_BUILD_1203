/**
 * Unified Booking Status Types
 * Single source of truth for booking lifecycle statuses.
 *
 * Merges the two incompatible status enums:
 *   - servicesApi.ts:  PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED
 *   - worker-location: searching | accepted | arriving | arrived | in_progress | completed | cancelled
 *
 * The unified type uses the Grab-style granular statuses for live tracking
 * while keeping backward compatibility with the simpler API statuses.
 */

// ============================================================================
// Unified tracking status (granular, Grab-style)
// ============================================================================

export type UnifiedTrackingStatus =
  | "searching" // Looking for available worker
  | "accepted" // Worker accepted the job
  | "arriving" // Worker en route
  | "arrived" // Worker at customer location
  | "in_progress" // Work in progress
  | "completed" // Done
  | "cancelled"; // Cancelled by either party

// ============================================================================
// API booking status (simplified, for backend CRUD)
// ============================================================================

export type ApiBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

// ============================================================================
// Mapping
// ============================================================================

/** Map granular tracking status → API status for backend sync */
export function trackingToApiStatus(
  tracking: UnifiedTrackingStatus,
): ApiBookingStatus {
  switch (tracking) {
    case "searching":
      return "PENDING";
    case "accepted":
    case "arriving":
    case "arrived":
      return "CONFIRMED";
    case "in_progress":
      return "IN_PROGRESS";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
  }
}

/** Map API status → best-guess tracking status */
export function apiToTrackingStatus(
  api: ApiBookingStatus,
): UnifiedTrackingStatus {
  switch (api) {
    case "PENDING":
      return "searching";
    case "CONFIRMED":
      return "accepted";
    case "IN_PROGRESS":
      return "in_progress";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
  }
}

// ============================================================================
// Status display helpers
// ============================================================================

export interface StatusDisplay {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export function getTrackingStatusDisplay(
  status: UnifiedTrackingStatus,
): StatusDisplay {
  switch (status) {
    case "searching":
      return {
        label: "Đang tìm thợ",
        color: "#FF9800",
        bgColor: "#FFF3E0",
        icon: "search",
      };
    case "accepted":
      return {
        label: "Thợ đã nhận",
        color: "#2196F3",
        bgColor: "#E3F2FD",
        icon: "checkmark-circle",
      };
    case "arriving":
      return {
        label: "Đang đến",
        color: "#03A9F4",
        bgColor: "#E1F5FE",
        icon: "navigate",
      };
    case "arrived":
      return {
        label: "Đã đến nơi",
        color: "#009688",
        bgColor: "#E0F2F1",
        icon: "home",
      };
    case "in_progress":
      return {
        label: "Đang làm việc",
        color: "#FF5722",
        bgColor: "#FBE9E7",
        icon: "construct",
      };
    case "completed":
      return {
        label: "Hoàn thành",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
        icon: "checkmark-done-circle",
      };
    case "cancelled":
      return {
        label: "Đã hủy",
        color: "#F44336",
        bgColor: "#FFEBEE",
        icon: "close-circle",
      };
  }
}

export function getApiStatusDisplay(status: ApiBookingStatus): StatusDisplay {
  switch (status) {
    case "PENDING":
      return {
        label: "Chờ xác nhận",
        color: "#FF9800",
        bgColor: "#FFF3E0",
        icon: "time",
      };
    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
        icon: "checkmark-circle",
      };
    case "IN_PROGRESS":
      return {
        label: "Đang thực hiện",
        color: "#2196F3",
        bgColor: "#E3F2FD",
        icon: "construct",
      };
    case "COMPLETED":
      return {
        label: "Hoàn thành",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
        icon: "checkmark-done-circle",
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        color: "#F44336",
        bgColor: "#FFEBEE",
        icon: "close-circle",
      };
  }
}

// ============================================================================
// Timeline step definitions (for live-tracking stepper)
// ============================================================================

export interface StatusStep {
  status: UnifiedTrackingStatus;
  label: string;
  icon: string;
}

export const TRACKING_STEPS: StatusStep[] = [
  { status: "accepted", label: "Thợ đã nhận", icon: "checkmark-circle" },
  { status: "arriving", label: "Đang đến", icon: "navigate" },
  { status: "arrived", label: "Đã đến nơi", icon: "home" },
  { status: "in_progress", label: "Đang làm việc", icon: "construct" },
  { status: "completed", label: "Hoàn thành", icon: "checkmark-done-circle" },
];

export const STATUS_ORDER: UnifiedTrackingStatus[] = [
  "searching",
  "accepted",
  "arriving",
  "arrived",
  "in_progress",
  "completed",
];

export function getStatusIndex(status: UnifiedTrackingStatus): number {
  return STATUS_ORDER.indexOf(status);
}
