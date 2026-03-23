/**
 * Confirmation Contract Specification
 *
 * Defines the EXACT API contract between mobile app and backend
 * for the confirmation/verification workflow.
 *
 * This file serves as the single source of truth for:
 * - Request/response shapes
 * - Endpoint paths
 * - Status codes
 * - Error shapes
 *
 * Backend team: implement these endpoints to complete integration.
 * Frontend: confirmationService.ts consumes these types directly.
 *
 * @created 2026-03-16 — Round 5 contract alignment
 */

// ============================================================================
// Shared Error Shape — all endpoints return this on error
// ============================================================================

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // e.g. "CONFIRMATION_NOT_FOUND", "VALIDATION_ERROR"
    message: string; // Human-readable Vietnamese message
    details?: Record<string, string[]>; // Field-level validation errors
  };
}

// ============================================================================
// Record Types — what entities can be confirmed
// ============================================================================

export type ConfirmableRecordType =
  | "contract" // Hợp đồng
  | "quotation" // Báo giá
  | "delivery" // Giao hàng
  | "work_order" // Lệnh thi công
  | "inspection" // Nghiệm thu
  | "payment"; // Thanh toán

// ============================================================================
// ENDPOINT 1: Submit Confirmation
// POST /api/v1/confirmations
// ============================================================================

export interface SubmitConfirmationRequest {
  /** ID of the record being confirmed */
  recordId: string;
  /** Type of the record */
  recordType: ConfirmableRecordType;
  /** Confirmation method used */
  method:
    | "manual_signature"
    | "biometric_face"
    | "biometric_fingerprint"
    | "photo_confirmation";
  /** File ID of uploaded signature image (for manual_signature) */
  signatureFileId?: string;
  /** File ID of uploaded photo (for photo_confirmation) */
  photoFileId?: string;
  /** Whether biometric auth was verified locally (for biometric_*) */
  biometricVerified?: boolean;
  /** File IDs of supporting attachments */
  attachmentIds?: string[];
  /** Optional note from the confirmer */
  note?: string;
  /** GPS coordinates at time of confirmation */
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  /** Device info for audit trail */
  deviceInfo?: string;
}

export interface SubmitConfirmationResponse {
  success: true;
  data: {
    /** Server-generated confirmation ID */
    confirmationId: string;
    /** Current status after submission */
    status: "pending" | "in_review" | "confirmed" | "rejected";
    /** Server timestamp */
    confirmedAt: string;
  };
}

// Status codes: 201 Created, 400 Validation, 401 Unauthorized, 409 Already confirmed

// ============================================================================
// ENDPOINT 2: Get Confirmation Status
// GET /api/v1/confirmations/:recordType/:recordId/status
// ============================================================================

export interface GetConfirmationStatusResponse {
  success: true;
  data: {
    recordId: string;
    recordType: ConfirmableRecordType;
    status: "pending" | "in_review" | "confirmed" | "rejected" | "expired";
    method?: string;
    confirmedBy?: {
      id: string;
      name: string;
    };
    confirmedAt?: string;
    expiresAt?: string;
  };
}

// Status codes: 200 OK, 404 Not found

// ============================================================================
// ENDPOINT 3: Get Audit Trail
// GET /api/v1/confirmations/:recordType/:recordId/audit
// ============================================================================

export interface AuditTrailItem {
  id: string;
  action: "submitted" | "approved" | "rejected" | "expired" | "resubmitted";
  actorId: string;
  actorName: string;
  method: string;
  status: string;
  note?: string;
  fileId?: string;
  deviceInfo?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface GetAuditTrailResponse {
  success: true;
  data: AuditTrailItem[];
}

// Status codes: 200 OK, 404 Not found

// ============================================================================
// ENDPOINT 4: Get Attachments for a Record
// GET /api/v1/confirmations/:recordType/:recordId/attachments
// ============================================================================

export interface AttachmentItem {
  id: string;
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  category: "signature" | "photo" | "document" | "attachment";
  uploadedBy: string;
  uploadedAt: string;
}

export interface GetAttachmentsResponse {
  success: true;
  data: AttachmentItem[];
}

// Status codes: 200 OK

// ============================================================================
// ENDPOINT 5: Download/Preview File
// GET /api/v1/files/:fileId/download
// ============================================================================

export interface DownloadDescriptor {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  downloadUrl: string; // Presigned URL with expiry
  expiresAt: string;
}

export interface GetDownloadUrlResponse {
  success: true;
  data: DownloadDescriptor;
}

// Status codes: 200 OK, 404 Not found, 410 Expired

// ============================================================================
// ENDPOINT 6: Upload File (Presigned URL flow — ALREADY EXISTS)
// POST /api/v1/upload/presign              → get presigned URL
// PUT  {presignedUrl}                      → upload to cloud storage
// POST /api/v1/upload/presign/complete     → confirm upload complete
// ============================================================================

// These endpoints are already implemented. See PresignedUploadService.ts

// ============================================================================
// MAPPING: Real Backend Endpoints ↔ Confirmation
// ============================================================================

/**
 * The backend currently has these REAL endpoints that map to our contract:
 *
 * CONTRACT SIGNING (maps to manual_signature):
 *   POST /api/v1/contract/contracts/:id/sign
 *     body: { signatureData: base64, ipAddress?, deviceInfo? }
 *     → Creates signature record, returns updated contract
 *
 * QUOTATION APPROVAL (maps to confirmation):
 *   POST /api/v1/contract/quotations/:id/approve
 *   POST /api/v1/contract/quotations/:id/reject
 *     → These are simplified confirm/reject flows
 *
 * QC INSPECTION COMPLETION (maps to photo_confirmation):
 *   PATCH /api/v1/qc/inspections/:id/complete
 *     → Auto-creates bugs from FAILED items
 *
 * FILE UPLOAD (already working):
 *   POST /api/v1/upload/presign
 *   POST /api/v1/upload/presign/complete
 *
 * MISSING from backend (need to be implemented):
 *   - Generic /api/v1/confirmations endpoint (unified)
 *   - /api/v1/confirmations/:recordType/:recordId/audit
 *   - /api/v1/confirmations/:recordType/:recordId/attachments
 *   - /api/v1/files/:fileId/download (presigned download URL)
 *
 * INTERIM STRATEGY:
 *   confirmationService.ts will:
 *   1. Try the generic /confirmations endpoint
 *   2. Fall back to specific module endpoints when generic is unavailable
 *   3. Store local audit trail in AsyncStorage as fallback
 */

// ============================================================================
// Contract-specific signing endpoint alignment
// ============================================================================

export interface ContractSignRequest {
  contractId: string;
  partyId: string;
  signatureData: string; // base64 image
  ipAddress?: string;
  deviceInfo?: string;
}

export interface ContractSignResponse {
  success: true;
  data: {
    signatureId: string;
    contractId: string;
    partyId: string;
    status: "SIGNED" | "PENDING" | "REJECTED";
    signedAt: string;
  };
}

// POST /api/v1/contract/contracts/:id/sign
