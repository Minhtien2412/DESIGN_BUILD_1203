/**
 * Workflow Types — Upload / Download / Confirmation / Verification
 *
 * Shared type definitions for the entire confirmation workflow system:
 * - File upload & download state machines
 * - Signature, biometric, photo confirmation
 * - Verification & audit trail
 *
 * @created 2026-03-16 — Round 4 workflow standardization
 */

// ============================================================================
// File Metadata
// ============================================================================

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  createdBy: string;
}

// ============================================================================
// Upload States
// ============================================================================

export type UploadStatus =
  | "idle"
  | "picking"
  | "uploading"
  | "uploaded"
  | "failed"
  | "canceled";

export interface UploadState {
  status: UploadStatus;
  progress: number; // 0–100
  file?: FileMetadata;
  error?: string;
}

export const INITIAL_UPLOAD_STATE: UploadState = {
  status: "idle",
  progress: 0,
};

// ============================================================================
// Download States
// ============================================================================

export type DownloadStatus =
  | "idle"
  | "requesting"
  | "downloading"
  | "ready"
  | "failed";

export interface DownloadState {
  status: DownloadStatus;
  progress: number;
  localPath?: string;
  error?: string;
}

export const INITIAL_DOWNLOAD_STATE: DownloadState = {
  status: "idle",
  progress: 0,
};

// ============================================================================
// Confirmation Methods
// ============================================================================

export type ConfirmationMethod =
  | "manual_signature"
  | "biometric_face"
  | "biometric_fingerprint"
  | "photo_confirmation";

export interface ConfirmationMethodConfig {
  method: ConfirmationMethod;
  label: string;
  icon: string; // Ionicons name
  available: boolean;
  reason?: string; // Why unavailable
}

// ============================================================================
// Verification Status
// ============================================================================

export type VerificationStatus =
  | "pending"
  | "in_review"
  | "confirmed"
  | "rejected"
  | "expired";

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: "Chờ xác nhận",
  in_review: "Đang xem xét",
  confirmed: "Đã xác nhận",
  rejected: "Từ chối",
  expired: "Hết hạn",
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  pending: "#F59E0B",
  in_review: "#3B82F6",
  confirmed: "#10B981",
  rejected: "#EF4444",
  expired: "#9CA3AF",
};

// ============================================================================
// Signature Request
// ============================================================================

export interface SignatureRequest {
  id: string;
  recordId: string;
  recordType: string; // e.g. "acceptance", "work_order", "delivery"
  title: string;
  description?: string;
  requestedBy: string;
  requestedAt: string;
  expiresAt?: string;
  status: VerificationStatus;
  method?: ConfirmationMethod;
}

// ============================================================================
// Biometric Result
// ============================================================================

export interface BiometricResult {
  success: boolean;
  method: "face" | "fingerprint" | "iris";
  timestamp: string;
  deviceInfo?: string;
  error?: string;
}

// ============================================================================
// Photo Confirmation
// ============================================================================

export interface PhotoConfirmationPayload {
  imageUri: string;
  thumbnailUri?: string;
  timestamp: string;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  note?: string;
  fileId?: string; // After upload
}

// ============================================================================
// Audit Trail
// ============================================================================

export interface AuditItem {
  id: string;
  actorId: string;
  actorName: string;
  method: ConfirmationMethod;
  status: VerificationStatus;
  fileId?: string;
  recordId: string;
  recordType: string;
  timestamp: string;
  deviceInfo?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  note?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Confirmation Workflow State
// ============================================================================

export interface ConfirmationWorkflowState {
  recordId: string;
  recordType: string;
  status: VerificationStatus;
  method?: ConfirmationMethod;
  signature?: FileMetadata;
  biometric?: BiometricResult;
  photo?: PhotoConfirmationPayload;
  attachments: FileMetadata[];
  auditTrail: AuditItem[];
  createdAt: string;
  updatedAt: string;
}
