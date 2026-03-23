/**
 * Confirmation Service
 * Backend integration layer for the confirmation/verification workflow.
 *
 * Endpoint strategy (Round 5 alignment):
 *   1. Try unified /api/v1/confirmations/* endpoints
 *   2. Fall back to module-specific endpoints (contract signing, QC, etc.)
 *   3. Store local audit trail via AsyncStorage when backend unavailable
 *
 * See types/confirmation-contract.ts for the full contract spec.
 *
 * @created 2026-03-16 — Round 4 workflow standardization
 * @updated 2026-03-16 — Round 5 backend contract alignment
 */

import { get, post } from "@/services/api";
import type {
    ContractSignRequest,
    ContractSignResponse,
    GetAttachmentsResponse,
    GetAuditTrailResponse,
    GetConfirmationStatusResponse,
    GetDownloadUrlResponse,
    SubmitConfirmationRequest,
    SubmitConfirmationResponse,
} from "@/types/confirmation-contract";
import type {
    AuditItem,
    ConfirmationMethod,
    ConfirmationWorkflowState,
    FileMetadata,
    VerificationStatus,
} from "@/types/workflow";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUDIT_STORAGE_KEY = "confirmation_audit_trail";

// ============================================================================
// Local Audit Fallback — stores audit items when backend is unreachable
// ============================================================================

async function appendLocalAudit(item: AuditItem): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);
    const trail: AuditItem[] = raw ? JSON.parse(raw) : [];
    trail.push(item);
    // Keep last 200 entries to avoid unbounded growth
    const trimmed = trail.slice(-200);
    await AsyncStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent — audit storage is best-effort
  }
}

async function getLocalAudit(
  recordId: string,
  recordType: string,
): Promise<AuditItem[]> {
  try {
    const raw = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const trail: AuditItem[] = JSON.parse(raw);
    return trail.filter(
      (a) => a.recordId === recordId && a.recordType === recordType,
    );
  } catch {
    return [];
  }
}

// ============================================================================
// Submit Confirmation
// POST /api/v1/confirmations
// ============================================================================

export interface SubmitConfirmationParams {
  recordId: string;
  recordType: string;
  method: ConfirmationMethod;
  signatureFileId?: string;
  photoFileId?: string;
  biometricVerified?: boolean;
  attachmentIds?: string[];
  note?: string;
  geolocation?: { latitude: number; longitude: number; accuracy?: number };
  deviceInfo?: string;
}

export interface SubmitConfirmationResult {
  success: boolean;
  confirmationId?: string;
  status?: VerificationStatus;
  error?: string;
}

export async function submitConfirmation(
  params: SubmitConfirmationParams,
): Promise<SubmitConfirmationResult> {
  try {
    // Try unified endpoint first
    const response = await post<SubmitConfirmationResponse>(
      "/api/v1/confirmations",
      params as SubmitConfirmationRequest,
    );
    return {
      success: true,
      confirmationId: response.data.confirmationId,
      status: response.data.status as VerificationStatus,
    };
  } catch (primaryError) {
    // Fallback: try module-specific endpoints
    try {
      const fallbackResult = await tryModuleSpecificSubmit(params);
      if (fallbackResult) return fallbackResult;
    } catch {
      // Fallback also failed — proceed to local audit
    }

    // Store local audit entry for offline sync
    await appendLocalAudit({
      id: `local_${Date.now()}`,
      actorId: "",
      actorName: "",
      method: params.method,
      status: "pending",
      recordId: params.recordId,
      recordType: params.recordType,
      timestamp: new Date().toISOString(),
      deviceInfo: params.deviceInfo,
      geolocation: params.geolocation,
      note: params.note,
    });

    console.warn(
      "[confirmationService] All endpoints failed, stored locally:",
      primaryError,
    );
    return {
      success: false,
      error:
        primaryError instanceof Error
          ? primaryError.message
          : "Gửi xác nhận thất bại",
    };
  }
}

/**
 * Try module-specific submit (contract signing, quotation approval, etc.)
 */
async function tryModuleSpecificSubmit(
  params: SubmitConfirmationParams,
): Promise<SubmitConfirmationResult | null> {
  const { recordId, recordType, method } = params;

  // Contract signing
  if (recordType === "contract" && method === "manual_signature") {
    const body: ContractSignRequest = {
      contractId: recordId,
      partyId: "", // filled by backend from auth token
      signatureData: params.signatureFileId || "",
      deviceInfo: params.deviceInfo,
    };
    const res = await post<ContractSignResponse>(
      `/api/v1/contract/contracts/${encodeURIComponent(recordId)}/sign`,
      body,
    );
    return {
      success: true,
      confirmationId: res.data.signatureId,
      status: res.data.status === "SIGNED" ? "confirmed" : "in_review",
    };
  }

  // Quotation approval
  if (recordType === "quotation") {
    await post(
      `/api/v1/contract/quotations/${encodeURIComponent(recordId)}/approve`,
      { note: params.note, deviceInfo: params.deviceInfo },
    );
    return {
      success: true,
      confirmationId: `q_${recordId}`,
      status: "confirmed",
    };
  }

  // QC inspection completion
  if (recordType === "inspection") {
    await post(
      `/api/v1/qc/inspections/${encodeURIComponent(recordId)}/complete`,
      { note: params.note },
    );
    return {
      success: true,
      confirmationId: `insp_${recordId}`,
      status: "confirmed",
    };
  }

  return null;
}

// ============================================================================
// Get Confirmation Status
// GET /api/v1/confirmations/:recordType/:recordId/status
// ============================================================================

export async function getConfirmationStatus(
  recordId: string,
  recordType: string,
): Promise<ConfirmationWorkflowState | null> {
  try {
    const response = await get<GetConfirmationStatusResponse>(
      `/api/v1/confirmations/${encodeURIComponent(recordType)}/${encodeURIComponent(recordId)}/status`,
    );
    const d = response.data;
    return {
      recordId: d.recordId,
      recordType: d.recordType,
      status: d.status as VerificationStatus,
      method: d.method as ConfirmationMethod | undefined,
      attachments: [],
      auditTrail: [],
      createdAt: d.confirmedAt || "",
      updatedAt: d.confirmedAt || "",
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Get Audit Trail (backend + local fallback)
// GET /api/v1/confirmations/:recordType/:recordId/audit
// ============================================================================

export async function getAuditTrail(
  recordId: string,
  recordType: string,
): Promise<AuditItem[]> {
  try {
    const response = await get<GetAuditTrailResponse>(
      `/api/v1/confirmations/${encodeURIComponent(recordType)}/${encodeURIComponent(recordId)}/audit`,
    );
    // Map API response to internal AuditItem shape (add recordId/recordType)
    return (response.data || []).map((item) => ({
      ...item,
      recordId,
      recordType,
      method: item.method as ConfirmationMethod,
      status: item.status as VerificationStatus,
    }));
  } catch {
    // Fallback to local audit trail
    return getLocalAudit(recordId, recordType);
  }
}

// ============================================================================
// Get Attached Files for a Record
// GET /api/v1/confirmations/:recordType/:recordId/attachments
// ============================================================================

export async function getRecordAttachments(
  recordId: string,
  recordType: string,
): Promise<FileMetadata[]> {
  try {
    const response = await get<GetAttachmentsResponse>(
      `/api/v1/confirmations/${encodeURIComponent(recordType)}/${encodeURIComponent(recordId)}/attachments`,
    );
    return (response.data || []).map((a) => ({
      id: a.id,
      filename: a.filename,
      originalName: a.originalName,
      contentType: a.contentType,
      size: a.size,
      url: a.url,
      thumbnailUrl: a.thumbnailUrl,
      createdAt: a.uploadedAt,
      createdBy: a.uploadedBy,
    }));
  } catch {
    return [];
  }
}

// ============================================================================
// Get Download URL for a file
// GET /api/v1/files/:fileId/download
// ============================================================================

export async function getDownloadUrl(
  fileId: string,
): Promise<{ url: string; expiresAt: string } | null> {
  try {
    const response = await get<GetDownloadUrlResponse>(
      `/api/v1/files/${encodeURIComponent(fileId)}/download`,
    );
    return {
      url: response.data.downloadUrl,
      expiresAt: response.data.expiresAt,
    };
  } catch {
    return null;
  }
}
