/**
 * useConfirmationWorkflow Hook
 * Master orchestrator for the confirmation/verification workflow.
 * Coordinates between biometric, signature, photo, and file upload flows.
 *
 * Usage:
 *   const workflow = useConfirmationWorkflow({ recordId, recordType });
 *   await workflow.confirmWithBiometric();       // Face ID / Fingerprint
 *   await workflow.confirmWithSignature(uri);     // Drawn signature
 *   await workflow.confirmWithPhoto();            // Camera capture
 *
 * @created 2026-03-16 — Round 4 workflow standardization
 */

import { useBiometric } from "@/hooks/useBiometric";
import { useFileUpload } from "@/hooks/useFileUpload";
import { usePhotoConfirmation } from "@/hooks/usePhotoConfirmation";
import { useSignatureFlow } from "@/hooks/useSignatureFlow";
import {
    submitConfirmation,
    type SubmitConfirmationResult,
} from "@/services/confirmationService";
import type {
    AuditItem,
    ConfirmationMethod,
    ConfirmationMethodConfig,
    FileMetadata,
    VerificationStatus,
} from "@/types/workflow";
import { useCallback, useMemo, useState } from "react";
import { Platform } from "react-native";

// ============================================================================
// Config
// ============================================================================

export interface UseConfirmationWorkflowOptions {
  recordId: string;
  recordType: string; // e.g. "acceptance", "work_order", "delivery"
}

export interface UseConfirmationWorkflowResult {
  // Available methods
  availableMethods: ConfirmationMethodConfig[];

  // Current state
  status: VerificationStatus;
  isSubmitting: boolean;
  error: string | null;

  // Sub-hooks exposed
  signature: ReturnType<typeof useSignatureFlow>;
  photo: ReturnType<typeof usePhotoConfirmation>;
  biometric: ReturnType<typeof useBiometric>;

  // Actions
  confirmWithBiometric: (note?: string) => Promise<SubmitConfirmationResult>;
  confirmWithSignature: (
    signatureUri: string,
    note?: string,
  ) => Promise<SubmitConfirmationResult>;
  confirmWithPhoto: (note?: string) => Promise<SubmitConfirmationResult>;
  addAttachment: (uri: string) => Promise<FileMetadata | null>;

  // Data
  attachments: FileMetadata[];
  auditTrail: AuditItem[];

  // Reset
  reset: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useConfirmationWorkflow(
  options: UseConfirmationWorkflowOptions,
): UseConfirmationWorkflowResult {
  const { recordId, recordType } = options;

  // Sub-hooks
  const biometricHook = useBiometric();
  const signatureHook = useSignatureFlow();
  const photoHook = usePhotoConfirmation();
  const { uploadFile } = useFileUpload();

  // State
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<FileMetadata[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditItem[]>([]);

  // Available confirmation methods
  const availableMethods: ConfirmationMethodConfig[] = useMemo(() => {
    const methods: ConfirmationMethodConfig[] = [
      {
        method: "manual_signature",
        label: "Ký tay",
        icon: "create-outline",
        available: true,
      },
      {
        method: "photo_confirmation",
        label: "Chụp ảnh xác nhận",
        icon: "camera-outline",
        available: true,
      },
    ];

    // Biometric
    if (Platform.OS !== "web") {
      if (biometricHook.capabilities.biometricType === "FaceID") {
        methods.push({
          method: "biometric_face",
          label: "Face ID",
          icon: "scan-outline",
          available:
            biometricHook.capabilities.isAvailable &&
            biometricHook.capabilities.isEnrolled,
          reason: !biometricHook.capabilities.isEnrolled
            ? "Face ID chưa được cài đặt"
            : undefined,
        });
      }
      if (
        biometricHook.capabilities.biometricType === "TouchID" ||
        biometricHook.capabilities.biometricType === "Fingerprint"
      ) {
        methods.push({
          method: "biometric_fingerprint",
          label:
            biometricHook.capabilities.biometricType === "TouchID"
              ? "Touch ID"
              : "Vân tay",
          icon: "finger-print-outline",
          available:
            biometricHook.capabilities.isAvailable &&
            biometricHook.capabilities.isEnrolled,
          reason: !biometricHook.capabilities.isEnrolled
            ? "Vân tay chưa được cài đặt"
            : undefined,
        });
      }
    }

    return methods;
  }, [biometricHook.capabilities]);

  // Helper: create audit entry
  const createLocalAudit = (
    method: ConfirmationMethod,
    resultStatus: VerificationStatus,
  ): AuditItem => ({
    id: `local_${Date.now()}`,
    actorId: "", // Will be filled by BE
    actorName: "",
    method,
    status: resultStatus,
    recordId,
    recordType,
    timestamp: new Date().toISOString(),
    deviceInfo: `${Platform.OS} ${Platform.Version}`,
  });

  // ── Biometric Confirmation ──

  const confirmWithBiometric = useCallback(
    async (note?: string): Promise<SubmitConfirmationResult> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const authResult = await biometricHook.authenticate(
          "Xác nhận bằng sinh trắc học",
        );
        if (!authResult.success) {
          setError(authResult.error || "Xác thực thất bại");
          return { success: false, error: authResult.error };
        }

        const method: ConfirmationMethod =
          biometricHook.capabilities.biometricType === "FaceID"
            ? "biometric_face"
            : "biometric_fingerprint";

        const result = await submitConfirmation({
          recordId,
          recordType,
          method,
          biometricVerified: true,
          note,
          deviceInfo: `${Platform.OS} ${Platform.Version}`,
        });

        if (result.success) {
          setStatus(result.status || "confirmed");
          setAuditTrail((prev) => [
            ...prev,
            createLocalAudit(method, result.status || "confirmed"),
          ]);
        } else {
          setError(result.error || "Gửi xác nhận thất bại");
        }

        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lỗi xác nhận";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [biometricHook, recordId, recordType],
  );

  // ── Signature Confirmation ──

  const confirmWithSignature = useCallback(
    async (
      signatureUri: string,
      note?: string,
    ): Promise<SubmitConfirmationResult> => {
      setIsSubmitting(true);
      setError(null);

      try {
        signatureHook.setSignature(signatureUri);
        const fileMeta = await signatureHook.uploadSignature();

        const result = await submitConfirmation({
          recordId,
          recordType,
          method: "manual_signature",
          signatureFileId: fileMeta?.id,
          note,
          deviceInfo: `${Platform.OS} ${Platform.Version}`,
        });

        if (result.success) {
          setStatus(result.status || "in_review");
          setAuditTrail((prev) => [
            ...prev,
            createLocalAudit("manual_signature", result.status || "in_review"),
          ]);
        } else {
          setError(result.error || "Gửi chữ ký thất bại");
        }

        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lỗi ký xác nhận";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [recordId, recordType, signatureHook],
  );

  // ── Photo Confirmation ──

  const confirmWithPhoto = useCallback(
    async (note?: string): Promise<SubmitConfirmationResult> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const photoData = await photoHook.capturePhoto();
        if (!photoData) {
          setIsSubmitting(false);
          return { success: false, error: "Chưa chụp ảnh" };
        }

        // Upload the photo
        const uploaded = await uploadFile(photoData.imageUri, {
          category: "documents",
          description: "Ảnh xác nhận hiện trường",
          tags: ["photo_confirmation", recordType],
        });

        const result = await submitConfirmation({
          recordId,
          recordType,
          method: "photo_confirmation",
          photoFileId: uploaded ? String(uploaded.id) : undefined,
          note: note || photoData.note,
          geolocation: photoData.geolocation
            ? {
                latitude: photoData.geolocation.latitude,
                longitude: photoData.geolocation.longitude,
              }
            : undefined,
          deviceInfo: `${Platform.OS} ${Platform.Version}`,
        });

        if (result.success) {
          setStatus(result.status || "in_review");
          setAuditTrail((prev) => [
            ...prev,
            createLocalAudit(
              "photo_confirmation",
              result.status || "in_review",
            ),
          ]);
        } else {
          setError(result.error || "Gửi ảnh xác nhận thất bại");
        }

        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lỗi xác nhận ảnh";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [photoHook, recordId, recordType, uploadFile],
  );

  // ── Add Attachment ──

  const addAttachment = useCallback(
    async (uri: string): Promise<FileMetadata | null> => {
      try {
        const uploaded = await uploadFile(uri, {
          category: "documents",
          tags: ["attachment", recordType],
        });

        if (!uploaded) return null;

        const meta: FileMetadata = {
          id: String(uploaded.id),
          filename: uploaded.filename,
          originalName: uploaded.originalName,
          contentType: uploaded.mimetype,
          size: uploaded.size,
          url: uploaded.publicUrl,
          createdAt: uploaded.uploadedAt,
          createdBy: "",
        };

        setAttachments((prev) => [...prev, meta]);
        return meta;
      } catch {
        return null;
      }
    },
    [recordType, uploadFile],
  );

  // ── Reset ──

  const reset = useCallback(() => {
    setStatus("pending");
    setIsSubmitting(false);
    setError(null);
    setAttachments([]);
    setAuditTrail([]);
    signatureHook.clear();
    photoHook.clear();
  }, [signatureHook, photoHook]);

  return {
    availableMethods,
    status,
    isSubmitting,
    error,
    signature: signatureHook,
    photo: photoHook,
    biometric: biometricHook,
    confirmWithBiometric,
    confirmWithSignature,
    confirmWithPhoto,
    addAttachment,
    attachments,
    auditTrail,
    reset,
  };
}
