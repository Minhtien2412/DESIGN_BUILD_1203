/**
 * PresignedUploadService - Secure file upload with presigned URLs
 * UPLOAD-001: Presigned Upload
 *
 * Features:
 * - Presigned URL generation
 * - Content validation (type, size, checksum)
 * - Upload completion confirmation
 * - Permission checks
 * - Rate limiting
 */

import * as FileSystem from "@/utils/FileSystemCompat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { post } from "./api";

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useCallback, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface PresignRequest {
  filename: string;
  contentType: string;
  fileSize: number;
  checksum?: string; // MD5 or SHA256
  checksumAlgorithm?: "md5" | "sha256";
  context?: UploadContext;
}

export interface UploadContext {
  type: "project" | "conversation" | "profile" | "video" | "document";
  id?: string; // projectId, conversationId, etc.
}

export interface PresignResponse {
  uploadId: string;
  uploadUrl: string;
  fields?: Record<string, string>; // For S3 POST
  headers?: Record<string, string>; // For PUT
  expiresAt: number;
  maxFileSize: number;
}

export interface CompleteUploadRequest {
  uploadId: string;
  checksum: string;
  checksumAlgorithm: "md5" | "sha256";
  metadata?: Record<string, unknown>;
}

export interface CompleteUploadResponse {
  fileId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  filename: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface UploadProgress {
  uploadId: string;
  filename: string;
  bytesUploaded: number;
  totalBytes: number;
  progress: number; // 0-100
  status: "pending" | "uploading" | "completing" | "completed" | "failed";
  error?: string;
  startedAt: number;
  completedAt?: number;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const UPLOAD_HISTORY_KEY = "@presigned_upload_history";
const RATE_LIMIT_KEY = "@upload_rate_limit";

// File size limits by content type
const SIZE_LIMITS: Record<string, number> = {
  "image/*": 20 * 1024 * 1024, // 20MB
  "video/*": 500 * 1024 * 1024, // 500MB
  "application/pdf": 50 * 1024 * 1024, // 50MB
  "application/*": 100 * 1024 * 1024, // 100MB default
  default: 50 * 1024 * 1024, // 50MB default
};

// Allowed content types
const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
  // Videos
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "video/webm",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
];

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_UPLOADS = 10; // Max 10 uploads per minute

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate file before upload
 */
export function validateFile(
  filename: string,
  contentType: string,
  fileSize: number,
): FileValidationResult {
  const errors: string[] = [];

  // Check content type
  if (!ALLOWED_TYPES.includes(contentType)) {
    errors.push(`Loại file không được hỗ trợ: ${contentType}`);
  }

  // Check file size
  const maxSize = getSizeLimit(contentType);
  if (fileSize > maxSize) {
    errors.push(`File quá lớn. Tối đa ${formatBytes(maxSize)}.`);
  }

  if (fileSize === 0) {
    errors.push("File rỗng.");
  }

  // Check filename
  if (!filename || filename.length > 255) {
    errors.push("Tên file không hợp lệ.");
  }

  // Check for dangerous extensions
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".sh", ".ps1", ".js"];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (dangerousExtensions.includes(ext)) {
    errors.push("Loại file không được phép.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get size limit for content type
 */
function getSizeLimit(contentType: string): number {
  if (contentType.startsWith("image/")) {
    return SIZE_LIMITS["image/*"];
  }
  if (contentType.startsWith("video/")) {
    return SIZE_LIMITS["video/*"];
  }
  if (contentType === "application/pdf") {
    return SIZE_LIMITS["application/pdf"];
  }
  if (contentType.startsWith("application/")) {
    return SIZE_LIMITS["application/*"];
  }
  return SIZE_LIMITS.default;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ============================================================================
// CHECKSUM
// ============================================================================

/**
 * Calculate file checksum
 */
export async function calculateChecksum(
  fileUri: string,
  algorithm: "md5" | "sha256" = "sha256",
): Promise<string> {
  try {
    // Read file as base64
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Calculate hash
    const digestAlgorithm =
      algorithm === "md5"
        ? Crypto.CryptoDigestAlgorithm.MD5
        : Crypto.CryptoDigestAlgorithm.SHA256;

    const hash = await Crypto.digestStringAsync(digestAlgorithm, content, {
      encoding: Crypto.CryptoEncoding.BASE64,
    });

    return hash;
  } catch (error) {
    console.error("[PresignedUpload] Checksum calculation failed:", error);
    throw new Error("Không thể tính checksum file");
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitData {
  timestamps: number[];
}

async function checkRateLimit(): Promise<{
  allowed: boolean;
  retryAfter?: number;
}> {
  try {
    const now = Date.now();
    const saved = await AsyncStorage.getItem(RATE_LIMIT_KEY);
    const data: RateLimitData = saved ? JSON.parse(saved) : { timestamps: [] };

    // Filter timestamps within window
    data.timestamps = data.timestamps.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW,
    );

    if (data.timestamps.length >= RATE_LIMIT_MAX_UPLOADS) {
      const oldestTimestamp = data.timestamps[0];
      const retryAfter = RATE_LIMIT_WINDOW - (now - oldestTimestamp);
      return { allowed: false, retryAfter };
    }

    // Add current timestamp
    data.timestamps.push(now);
    await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));

    return { allowed: true };
  } catch {
    // Allow on error
    return { allowed: true };
  }
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

class PresignedUploadServiceClass {
  private activeUploads: Map<
    string,
    { abort: () => void; progress: UploadProgress }
  > = new Map();
  private listeners: Map<string, Set<(progress: UploadProgress) => void>> =
    new Map();

  /**
   * Request presigned URL for upload
   */
  async getPresignedUrl(request: PresignRequest): Promise<PresignResponse> {
    // Validate file
    const validation = validateFile(
      request.filename,
      request.contentType,
      request.fileSize,
    );
    if (!validation.valid) {
      throw new Error(validation.errors.join("\n"));
    }

    // Check rate limit
    const rateLimit = await checkRateLimit();
    if (!rateLimit.allowed) {
      throw new Error(
        `Quá nhiều upload. Vui lòng thử lại sau ${Math.ceil((rateLimit.retryAfter || 0) / 1000)} giây.`,
      );
    }

    // Request presigned URL from server
    const response = await post<PresignResponse>("/api/v1/upload/presign", {
      filename: request.filename,
      contentType: request.contentType,
      size: request.fileSize,
      checksum: request.checksum,
      checksumAlgorithm: request.checksumAlgorithm,
      context: request.context,
    });

    return response;
  }

  /**
   * Upload file using presigned URL
   */
  async uploadFile(
    fileUri: string,
    presignResponse: PresignResponse,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<string> {
    const { uploadId, uploadUrl, headers } = presignResponse;

    // Initialize progress
    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
    const totalBytes = (fileInfo as { size?: number }).size || 0;

    const progress: UploadProgress = {
      uploadId,
      filename: fileUri.split("/").pop() || "file",
      bytesUploaded: 0,
      totalBytes,
      progress: 0,
      status: "uploading",
      startedAt: Date.now(),
    };

    this.notifyListeners(uploadId, progress);
    onProgress?.(progress);

    return new Promise((resolve, reject) => {
      let aborted = false;

      const uploadTask = FileSystem.createUploadTask(
        uploadUrl,
        fileUri,
        {
          httpMethod: "PUT",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: headers || {},
        },
        (uploadProgress) => {
          if (aborted) return;

          progress.bytesUploaded = uploadProgress.totalBytesSent;
          progress.progress = Math.round(
            (uploadProgress.totalBytesSent /
              uploadProgress.totalBytesExpectedToSend) *
              100,
          );

          this.notifyListeners(uploadId, progress);
          onProgress?.(progress);
        },
      );

      // Store abort function
      this.activeUploads.set(uploadId, {
        abort: () => {
          aborted = true;
          uploadTask.cancelAsync();
        },
        progress,
      });

      uploadTask
        .uploadAsync()
        .then((response) => {
          if (aborted) {
            reject(new Error("Upload đã bị hủy"));
            return;
          }

          if (response && response.status >= 200 && response.status < 300) {
            progress.status = "completing";
            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);
            resolve(uploadId);
          } else {
            progress.status = "failed";
            progress.error = `Upload failed: ${response?.status}`;
            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);
            reject(new Error(`Upload failed: ${response?.status}`));
          }
        })
        .catch((error) => {
          progress.status = "failed";
          progress.error = error.message;
          this.notifyListeners(uploadId, progress);
          onProgress?.(progress);
          reject(error);
        })
        .finally(() => {
          this.activeUploads.delete(uploadId);
        });
    });
  }

  /**
   * Complete upload - verify and save metadata
   */
  async completeUpload(
    request: CompleteUploadRequest,
  ): Promise<CompleteUploadResponse> {
    const response = await post<CompleteUploadResponse>(
      "/api/v1/upload/presign/complete",
      request,
    );

    // Update progress
    const upload = this.activeUploads.get(request.uploadId);
    if (upload) {
      upload.progress.status = "completed";
      upload.progress.completedAt = Date.now();
      this.notifyListeners(request.uploadId, upload.progress);
    }

    // Save to history
    await this.saveToHistory(response);

    return response;
  }

  /**
   * Full upload flow: presign -> upload -> complete
   */
  async upload(
    fileUri: string,
    options: {
      filename?: string;
      contentType: string;
      context?: UploadContext;
      metadata?: Record<string, unknown>;
      onProgress?: (progress: UploadProgress) => void;
    },
  ): Promise<CompleteUploadResponse> {
    const { contentType, context, metadata, onProgress } = options;

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
    const fileSize = (fileInfo as { size?: number }).size || 0;
    const filename =
      options.filename || fileUri.split("/").pop() || `file_${Date.now()}`;

    // Calculate checksum
    const checksum = await calculateChecksum(fileUri, "sha256");

    // Step 1: Get presigned URL
    const presignResponse = await this.getPresignedUrl({
      filename,
      contentType,
      fileSize,
      checksum,
      checksumAlgorithm: "sha256",
      context,
    });

    // Step 2: Upload file
    await this.uploadFile(fileUri, presignResponse, onProgress);

    // Step 3: Complete upload
    const result = await this.completeUpload({
      uploadId: presignResponse.uploadId,
      checksum,
      checksumAlgorithm: "sha256",
      metadata,
    });

    return result;
  }

  /**
   * Cancel an active upload
   */
  cancelUpload(uploadId: string): void {
    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      upload.abort();
      upload.progress.status = "failed";
      upload.progress.error = "Upload đã bị hủy";
      this.notifyListeners(uploadId, upload.progress);
      this.activeUploads.delete(uploadId);
    }
  }

  /**
   * Get active upload progress
   */
  getProgress(uploadId: string): UploadProgress | null {
    return this.activeUploads.get(uploadId)?.progress || null;
  }

  /**
   * Subscribe to upload progress
   */
  subscribe(
    uploadId: string,
    callback: (progress: UploadProgress) => void,
  ): () => void {
    const listeners = this.listeners.get(uploadId) || new Set();
    listeners.add(callback);
    this.listeners.set(uploadId, listeners);

    return () => {
      const current = this.listeners.get(uploadId);
      if (current) {
        current.delete(callback);
        if (current.size === 0) {
          this.listeners.delete(uploadId);
        }
      }
    };
  }

  private notifyListeners(uploadId: string, progress: UploadProgress): void {
    const listeners = this.listeners.get(uploadId);
    if (listeners) {
      listeners.forEach((cb) => cb(progress));
    }
  }

  private async saveToHistory(upload: CompleteUploadResponse): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(UPLOAD_HISTORY_KEY);
      const history: CompleteUploadResponse[] = saved ? JSON.parse(saved) : [];

      // Add to beginning, limit to 50
      history.unshift(upload);
      if (history.length > 50) {
        history.pop();
      }

      await AsyncStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignore history errors
    }
  }

  /**
   * Get upload history
   */
  async getHistory(): Promise<CompleteUploadResponse[]> {
    try {
      const saved = await AsyncStorage.getItem(UPLOAD_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear upload history
   */
  async clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(UPLOAD_HISTORY_KEY);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const PresignedUploadService = new PresignedUploadServiceClass();

/**
 * Hook for presigned upload
 */
export function usePresignedUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      fileUri: string,
      options: {
        filename?: string;
        contentType: string;
        context?: UploadContext;
        metadata?: Record<string, unknown>;
      },
    ) => {
      setIsUploading(true);
      setError(null);
      setProgress(null);

      try {
        const result = await PresignedUploadService.upload(fileUri, {
          ...options,
          onProgress: setProgress,
        });
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload thất bại";
        setError(msg);
        throw e;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    if (progress?.uploadId) {
      PresignedUploadService.cancelUpload(progress.uploadId);
    }
  }, [progress?.uploadId]);

  return {
    upload,
    cancel,
    isUploading,
    progress,
    error,
  };
}

/**
 * Hook for upload history
 */
export function useUploadHistory() {
  const [history, setHistory] = useState<CompleteUploadResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await PresignedUploadService.getHistory();
      setHistory(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(async () => {
    await PresignedUploadService.clearHistory();
    setHistory([]);
  }, []);

  return {
    history,
    isLoading,
    load,
    clear,
  };
}
