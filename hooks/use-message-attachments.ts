/**
 * useMessageAttachments Hook
 * ==========================
 *
 * Hook quản lý attachments trong chat message
 * Tích hợp với ChatAttachmentPicker và uploadService
 *
 * Features:
 * - Queue multiple attachments
 * - Track upload progress
 * - Cancel uploads
 * - Retry failed uploads
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { uploadService } from "@/services/api/upload.service";
import { useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface PendingAttachment {
  id: string;
  file: {
    uri: string;
    name: string;
    type: string;
    size?: number;
  };
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  uploadedUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface AttachmentResult {
  url: string;
  type: "image" | "video" | "file" | "audio" | "voice";
  name: string;
  size?: number;
  thumbnailUrl?: string;
}

interface UseMessageAttachmentsOptions {
  /** Maximum number of attachments allowed */
  maxAttachments?: number;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Callback when all uploads complete */
  onAllUploadsComplete?: (attachments: AttachmentResult[]) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useMessageAttachments(
  options: UseMessageAttachmentsOptions = {},
) {
  const {
    maxAttachments = 10,
    maxFileSize = 25 * 1024 * 1024, // 25MB
    onAllUploadsComplete,
    onError,
  } = options;

  // State
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ============================================
  // Add Attachment
  // ============================================

  const addAttachment = useCallback(
    (file: PendingAttachment["file"]) => {
      // Check limit
      if (attachments.length >= maxAttachments) {
        onError?.(`Tối đa ${maxAttachments} tệp đính kèm`);
        return false;
      }

      // Check file size
      if (file.size && file.size > maxFileSize) {
        const maxMB = Math.round(maxFileSize / (1024 * 1024));
        onError?.(`File quá lớn. Tối đa ${maxMB}MB`);
        return false;
      }

      const newAttachment: PendingAttachment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "pending",
        progress: 0,
      };

      setAttachments((prev) => [...prev, newAttachment]);
      return true;
    },
    [attachments.length, maxAttachments, maxFileSize, onError],
  );

  // ============================================
  // Remove Attachment
  // ============================================

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ============================================
  // Clear All
  // ============================================

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  // ============================================
  // Upload Single Attachment
  // ============================================

  const uploadSingle = useCallback(
    async (attachment: PendingAttachment): Promise<AttachmentResult | null> => {
      // Update status to uploading
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === attachment.id
            ? { ...a, status: "uploading", progress: 0 }
            : a,
        ),
      );

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id && a.status === "uploading"
                ? { ...a, progress: Math.min(a.progress + 10, 90) }
                : a,
            ),
          );
        }, 200);

        // Upload file
        const response = await uploadService.single({
          uri: attachment.file.uri,
          name: attachment.file.name,
          type: attachment.file.type,
        });

        clearInterval(progressInterval);

        // Determine type
        const isImage = attachment.file.type.startsWith("image/");
        const isVideo = attachment.file.type.startsWith("video/");
        const isAudio = attachment.file.type.startsWith("audio/");

        let type: AttachmentResult["type"] = "file";
        if (isImage) type = "image";
        else if (isVideo) type = "video";
        else if (isAudio) type = "audio";

        // Update to success
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === attachment.id
              ? {
                  ...a,
                  status: "success",
                  progress: 100,
                  uploadedUrl: response.url,
                  thumbnailUrl: response.thumbnailUrl,
                }
              : a,
          ),
        );

        return {
          url: response.url,
          type,
          name: attachment.file.name,
          size: attachment.file.size,
          thumbnailUrl: isImage ? response.url : response.thumbnailUrl,
        };
      } catch (error) {
        console.error("[useMessageAttachments] Upload error:", error);

        // Update to error
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === attachment.id
              ? {
                  ...a,
                  status: "error",
                  error: "Upload thất bại",
                }
              : a,
          ),
        );

        return null;
      }
    },
    [],
  );

  // ============================================
  // Upload All Attachments
  // ============================================

  const uploadAll = useCallback(async (): Promise<AttachmentResult[]> => {
    const pending = attachments.filter(
      (a) => a.status === "pending" || a.status === "error",
    );

    if (pending.length === 0) {
      // Return already uploaded ones
      return attachments
        .filter((a) => a.status === "success" && a.uploadedUrl)
        .map((a) => ({
          url: a.uploadedUrl!,
          type: getFileType(a.file.type),
          name: a.file.name,
          size: a.file.size,
          thumbnailUrl: a.thumbnailUrl,
        }));
    }

    setIsUploading(true);

    try {
      const results: AttachmentResult[] = [];

      // Upload sequentially to avoid overwhelming the server
      for (const attachment of pending) {
        const result = await uploadSingle(attachment);
        if (result) {
          results.push(result);
        }
      }

      // Add already uploaded ones
      const alreadyUploaded = attachments
        .filter(
          (a) =>
            a.status === "success" && a.uploadedUrl && !pending.includes(a),
        )
        .map((a) => ({
          url: a.uploadedUrl!,
          type: getFileType(a.file.type),
          name: a.file.name,
          size: a.file.size,
          thumbnailUrl: a.thumbnailUrl,
        }));

      const allResults = [...alreadyUploaded, ...results];
      onAllUploadsComplete?.(allResults);

      return allResults;
    } finally {
      setIsUploading(false);
    }
  }, [attachments, uploadSingle, onAllUploadsComplete]);

  // ============================================
  // Retry Failed Upload
  // ============================================

  const retryUpload = useCallback(
    async (id: string): Promise<AttachmentResult | null> => {
      const attachment = attachments.find((a) => a.id === id);
      if (!attachment || attachment.status !== "error") {
        return null;
      }

      setIsUploading(true);
      try {
        return await uploadSingle(attachment);
      } finally {
        setIsUploading(false);
      }
    },
    [attachments, uploadSingle],
  );

  // ============================================
  // Get Ready Attachments (for sending)
  // ============================================

  const getReadyAttachments = useCallback((): AttachmentResult[] => {
    return attachments
      .filter((a) => a.status === "success" && a.uploadedUrl)
      .map((a) => ({
        url: a.uploadedUrl!,
        type: getFileType(a.file.type),
        name: a.file.name,
        size: a.file.size,
        thumbnailUrl: a.thumbnailUrl,
      }));
  }, [attachments]);

  // ============================================
  // Computed Values
  // ============================================

  const pendingCount = attachments.filter(
    (a) => a.status === "pending" || a.status === "uploading",
  ).length;

  const errorCount = attachments.filter((a) => a.status === "error").length;

  const successCount = attachments.filter((a) => a.status === "success").length;

  const hasAttachments = attachments.length > 0;

  const canAddMore = attachments.length < maxAttachments;

  const totalProgress =
    attachments.length > 0
      ? attachments.reduce((sum, a) => sum + a.progress, 0) / attachments.length
      : 0;

  return {
    // State
    attachments,
    isUploading,

    // Actions
    addAttachment,
    removeAttachment,
    clearAttachments,
    uploadAll,
    retryUpload,
    getReadyAttachments,

    // Computed
    pendingCount,
    errorCount,
    successCount,
    hasAttachments,
    canAddMore,
    totalProgress,
    maxAttachments,
  };
}

// ============================================================================
// Helper
// ============================================================================

function getFileType(mimeType: string): AttachmentResult["type"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
}

export default useMessageAttachments;
