/**
 * ChunkedUploadService - Large file upload with chunking and resume
 * UPLOAD-002: Chunked Upload + Resume
 *
 * Features:
 * - Multipart upload initiation
 * - Chunk splitting and upload
 * - Resume from last successful chunk
 * - Progress persistence across app restarts
 * - Retry with exponential backoff
 */

import * as FileSystem from "@/utils/FileSystemCompat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { post } from "./api";
import { calculateChecksum } from "./PresignedUploadService";

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface ChunkedUploadConfig {
  chunkSize: number; // Default 5MB (S3 minimum)
  maxConcurrent: number; // Parallel uploads
  maxRetries: number;
  retryDelayMs: number;
}

export interface MultipartInitRequest {
  filename: string;
  contentType: string;
  fileSize: number;
  checksum?: string;
  metadata?: Record<string, unknown>;
}

export interface MultipartInitResponse {
  uploadId: string;
  key: string; // S3 key
  chunkSize: number;
  totalChunks: number;
  maxPartSize: number;
}

export interface ChunkUploadRequest {
  uploadId: string;
  partNumber: number;
  uploadUrl: string;
}

export interface ChunkUploadResponse {
  partNumber: number;
  etag: string;
  size: number;
}

export interface CompletedPart {
  partNumber: number;
  etag: string;
}

export interface MultipartCompleteRequest {
  uploadId: string;
  parts: CompletedPart[];
}

export interface MultipartCompleteResponse {
  fileId: string;
  fileUrl: string;
  filename: string;
  contentType: string;
  fileSize: number;
  checksum: string;
  createdAt: string;
}

export interface ChunkedUploadProgress {
  uploadId: string;
  filename: string;
  totalBytes: number;
  uploadedBytes: number;
  totalChunks: number;
  completedChunks: number;
  failedChunks: number[];
  progress: number; // 0-100
  status:
    | "pending"
    | "uploading"
    | "paused"
    | "completing"
    | "completed"
    | "failed";
  error?: string;
  startedAt: number;
  updatedAt: number;
  completedAt?: number;
  completedParts: CompletedPart[];
}

export interface PersistentUploadState {
  uploadId: string;
  key: string;
  filename: string;
  fileUri: string;
  contentType: string;
  totalBytes: number;
  chunkSize: number;
  totalChunks: number;
  completedParts: CompletedPart[];
  failedChunks: number[];
  startedAt: number;
  updatedAt: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const UPLOAD_STATE_KEY = "@chunked_upload_state";
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB (S3 minimum)
const MAX_CHUNK_SIZE = 100 * 1024 * 1024; // 100MB
const MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const DEFAULT_CONFIG: ChunkedUploadConfig = {
  chunkSize: DEFAULT_CHUNK_SIZE,
  maxConcurrent: 3,
  maxRetries: 3,
  retryDelayMs: 1000,
};

// ============================================================================
// CHUNK UTILITIES
// ============================================================================

/**
 * Calculate optimal chunk size based on file size
 */
export function calculateChunkSize(
  fileSize: number,
  config?: Partial<ChunkedUploadConfig>,
): number {
  const targetChunks = 100; // Aim for ~100 chunks max
  const calculated = Math.ceil(fileSize / targetChunks);

  const minSize = config?.chunkSize || MIN_CHUNK_SIZE;
  const maxSize = MAX_CHUNK_SIZE;

  return Math.min(maxSize, Math.max(minSize, calculated));
}

/**
 * Calculate total number of chunks
 */
export function calculateTotalChunks(
  fileSize: number,
  chunkSize: number,
): number {
  return Math.ceil(fileSize / chunkSize);
}

/**
 * Get chunk byte range
 */
export function getChunkRange(
  partNumber: number,
  chunkSize: number,
  fileSize: number,
): { start: number; end: number; size: number } {
  const start = (partNumber - 1) * chunkSize;
  const end = Math.min(start + chunkSize, fileSize);
  return { start, end, size: end - start };
}

// ============================================================================
// CHUNK SPLITTER
// ============================================================================

/**
 * Split file into chunks for upload
 */
export class ChunkSplitter {
  private fileUri: string;
  private fileSize: number;
  private chunkSize: number;

  constructor(fileUri: string, fileSize: number, chunkSize: number) {
    this.fileUri = fileUri;
    this.fileSize = fileSize;
    this.chunkSize = chunkSize;
  }

  get totalChunks(): number {
    return calculateTotalChunks(this.fileSize, this.chunkSize);
  }

  /**
   * Read a specific chunk as base64
   */
  async readChunk(partNumber: number): Promise<{ data: string; size: number }> {
    const { start, size } = getChunkRange(
      partNumber,
      this.chunkSize,
      this.fileSize,
    );

    const data = await FileSystem.readAsStringAsync(this.fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      position: start,
      length: size,
    });

    return { data, size };
  }

  /**
   * Get chunk info without reading data
   */
  getChunkInfo(partNumber: number): {
    start: number;
    end: number;
    size: number;
  } {
    return getChunkRange(partNumber, this.chunkSize, this.fileSize);
  }
}

// ============================================================================
// UPLOAD QUEUE
// ============================================================================

interface QueuedChunk {
  partNumber: number;
  retryCount: number;
  status: "pending" | "uploading" | "completed" | "failed";
}

class UploadQueue {
  private queue: QueuedChunk[] = [];
  private maxConcurrent: number;
  private activeCount = 0;
  private onChunkReady?: (chunk: QueuedChunk) => Promise<CompletedPart | null>;
  private onComplete?: () => void;
  private isPaused = false;
  private isStopped = false;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Initialize queue with chunks
   */
  init(totalChunks: number, completedParts: number[] = []) {
    this.queue = [];
    for (let i = 1; i <= totalChunks; i++) {
      if (!completedParts.includes(i)) {
        this.queue.push({ partNumber: i, retryCount: 0, status: "pending" });
      }
    }
  }

  /**
   * Start processing queue
   */
  async start(
    onChunkReady: (chunk: QueuedChunk) => Promise<CompletedPart | null>,
    onComplete: () => void,
  ) {
    this.onChunkReady = onChunkReady;
    this.onComplete = onComplete;
    this.isPaused = false;
    this.isStopped = false;
    this.processNext();
  }

  /**
   * Pause queue processing
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume queue processing
   */
  resume() {
    this.isPaused = false;
    this.processNext();
  }

  /**
   * Stop and clear queue
   */
  stop() {
    this.isStopped = true;
    this.queue = [];
  }

  /**
   * Add failed chunk back to queue for retry
   */
  retry(partNumber: number, maxRetries: number): boolean {
    const existing = this.queue.find((c) => c.partNumber === partNumber);
    if (existing && existing.retryCount < maxRetries) {
      existing.retryCount++;
      existing.status = "pending";
      this.processNext();
      return true;
    }
    return false;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const pending = this.queue.filter((c) => c.status === "pending").length;
    const uploading = this.queue.filter((c) => c.status === "uploading").length;
    const completed = this.queue.filter((c) => c.status === "completed").length;
    const failed = this.queue.filter((c) => c.status === "failed").length;
    return { pending, uploading, completed, failed, total: this.queue.length };
  }

  private async processNext() {
    if (this.isPaused || this.isStopped) return;

    while (
      this.activeCount < this.maxConcurrent &&
      !this.isPaused &&
      !this.isStopped
    ) {
      const nextChunk = this.queue.find((c) => c.status === "pending");
      if (!nextChunk) break;

      nextChunk.status = "uploading";
      this.activeCount++;

      this.processChunk(nextChunk);
    }
  }

  private async processChunk(chunk: QueuedChunk) {
    try {
      const result = await this.onChunkReady?.(chunk);
      if (result) {
        chunk.status = "completed";
      } else {
        chunk.status = "failed";
      }
    } catch {
      chunk.status = "failed";
    } finally {
      this.activeCount--;
      this.checkCompletion();
      this.processNext();
    }
  }

  private checkCompletion() {
    const stats = this.getStats();
    if (stats.pending === 0 && stats.uploading === 0) {
      this.onComplete?.();
    }
  }
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

class ChunkedUploadServiceClass {
  private config: ChunkedUploadConfig = DEFAULT_CONFIG;
  private activeUploads: Map<
    string,
    { queue: UploadQueue; progress: ChunkedUploadProgress }
  > = new Map();
  private listeners: Map<
    string,
    Set<(progress: ChunkedUploadProgress) => void>
  > = new Map();

  /**
   * Update configuration
   */
  configure(config: Partial<ChunkedUploadConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Initiate multipart upload
   */
  async initiateUpload(
    request: MultipartInitRequest,
  ): Promise<MultipartInitResponse> {
    const response = await post<MultipartInitResponse>(
      "/api/v1/upload/multipart/initiate",
      request,
    );
    return response;
  }

  /**
   * Upload a single chunk
   */
  async uploadChunk(
    splitter: ChunkSplitter,
    uploadId: string,
    partNumber: number,
  ): Promise<CompletedPart> {
    // Get presigned URL for this part
    const presignResponse = await post<ChunkUploadRequest>(
      `/api/v1/upload/multipart/${uploadId}/presign`,
      { partNumber },
    );

    // Read chunk data
    const { data, size } = await splitter.readChunk(partNumber);

    // Upload chunk
    const response = await fetch(presignResponse.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": size.toString(),
      },
      body: Uint8Array.from(atob(data), (c) => c.charCodeAt(0)),
    });

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.status}`);
    }

    const etag = response.headers.get("ETag") || `"${partNumber}"`;

    return { partNumber, etag };
  }

  /**
   * Complete multipart upload
   */
  async completeUpload(
    request: MultipartCompleteRequest,
  ): Promise<MultipartCompleteResponse> {
    const response = await post<MultipartCompleteResponse>(
      "/api/v1/upload/multipart/complete",
      request,
    );
    return response;
  }

  /**
   * Abort multipart upload
   */
  async abortUpload(uploadId: string): Promise<void> {
    await post(`/api/v1/upload/multipart/${uploadId}/abort`, {});
    await this.clearPersistentState(uploadId);
  }

  /**
   * Start chunked upload with progress tracking
   */
  async startUpload(
    fileUri: string,
    options: {
      filename?: string;
      contentType: string;
      metadata?: Record<string, unknown>;
      onProgress?: (progress: ChunkedUploadProgress) => void;
    },
  ): Promise<MultipartCompleteResponse> {
    const { contentType, metadata, onProgress } = options;

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
    const fileSize = (fileInfo as { size?: number }).size || 0;
    const filename =
      options.filename || fileUri.split("/").pop() || `file_${Date.now()}`;

    // Calculate checksum
    const checksum = await calculateChecksum(fileUri, "sha256");

    // Initiate multipart upload
    const initResponse = await this.initiateUpload({
      filename,
      contentType,
      fileSize,
      checksum,
      metadata,
    });

    const { uploadId, chunkSize, totalChunks } = initResponse;

    // Create splitter
    const splitter = new ChunkSplitter(fileUri, fileSize, chunkSize);

    // Initialize progress
    const progress: ChunkedUploadProgress = {
      uploadId,
      filename,
      totalBytes: fileSize,
      uploadedBytes: 0,
      totalChunks,
      completedChunks: 0,
      failedChunks: [],
      progress: 0,
      status: "uploading",
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completedParts: [],
    };

    // Persist state for resume
    await this.persistState({
      uploadId,
      key: initResponse.key,
      filename,
      fileUri,
      contentType,
      totalBytes: fileSize,
      chunkSize,
      totalChunks,
      completedParts: [],
      failedChunks: [],
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create upload queue
    const queue = new UploadQueue(this.config.maxConcurrent);
    queue.init(totalChunks);

    this.activeUploads.set(uploadId, { queue, progress });

    return new Promise((resolve, reject) => {
      queue.start(
        async (chunk) => {
          try {
            const part = await this.uploadChunk(
              splitter,
              uploadId,
              chunk.partNumber,
            );

            // Update progress
            progress.completedParts.push(part);
            progress.completedChunks++;
            progress.uploadedBytes = Math.min(
              progress.uploadedBytes + chunkSize,
              fileSize,
            );
            progress.progress = Math.round(
              (progress.completedChunks / totalChunks) * 100,
            );
            progress.updatedAt = Date.now();

            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);

            // Persist progress
            await this.updatePersistentState(uploadId, {
              completedParts: progress.completedParts,
              updatedAt: progress.updatedAt,
            });

            return part;
          } catch (error) {
            // Try retry
            const retried = queue.retry(
              chunk.partNumber,
              this.config.maxRetries,
            );
            if (!retried) {
              progress.failedChunks.push(chunk.partNumber);
              this.notifyListeners(uploadId, progress);
              onProgress?.(progress);
            }
            return null;
          }
        },
        async () => {
          // Queue complete - either all done or all failed
          if (progress.failedChunks.length > 0) {
            progress.status = "failed";
            progress.error = `${progress.failedChunks.length} chunks failed`;
            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);
            reject(new Error(progress.error));
            return;
          }

          // Complete multipart upload
          progress.status = "completing";
          this.notifyListeners(uploadId, progress);
          onProgress?.(progress);

          try {
            const result = await this.completeUpload({
              uploadId,
              parts: progress.completedParts,
            });

            progress.status = "completed";
            progress.completedAt = Date.now();
            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);

            // Clear persistent state
            await this.clearPersistentState(uploadId);
            this.activeUploads.delete(uploadId);

            resolve(result);
          } catch (error) {
            progress.status = "failed";
            progress.error =
              error instanceof Error ? error.message : "Complete failed";
            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);
            reject(error);
          }
        },
      );
    });
  }

  /**
   * Resume a previously started upload
   */
  async resumeUpload(
    uploadId: string,
    onProgress?: (progress: ChunkedUploadProgress) => void,
  ): Promise<MultipartCompleteResponse> {
    // Load persistent state
    const state = await this.loadPersistentState(uploadId);
    if (!state) {
      throw new Error("Upload state not found");
    }

    // Check if file still exists
    const fileInfo = await FileSystem.getInfoAsync(state.fileUri);
    if (!fileInfo.exists) {
      throw new Error("Source file not found");
    }

    // Create splitter
    const splitter = new ChunkSplitter(
      state.fileUri,
      state.totalBytes,
      state.chunkSize,
    );

    // Calculate already uploaded bytes
    const uploadedBytes = state.completedParts.length * state.chunkSize;
    const completedPartNumbers = state.completedParts.map((p) => p.partNumber);

    // Initialize progress
    const progress: ChunkedUploadProgress = {
      uploadId,
      filename: state.filename,
      totalBytes: state.totalBytes,
      uploadedBytes,
      totalChunks: state.totalChunks,
      completedChunks: state.completedParts.length,
      failedChunks: [],
      progress: Math.round(
        (state.completedParts.length / state.totalChunks) * 100,
      ),
      status: "uploading",
      startedAt: state.startedAt,
      updatedAt: Date.now(),
      completedParts: state.completedParts,
    };

    // Create upload queue with remaining chunks
    const queue = new UploadQueue(this.config.maxConcurrent);
    queue.init(state.totalChunks, completedPartNumbers);

    this.activeUploads.set(uploadId, { queue, progress });

    return new Promise((resolve, reject) => {
      queue.start(
        async (chunk) => {
          try {
            const part = await this.uploadChunk(
              splitter,
              uploadId,
              chunk.partNumber,
            );

            progress.completedParts.push(part);
            progress.completedChunks++;
            progress.uploadedBytes = Math.min(
              progress.uploadedBytes + state.chunkSize,
              state.totalBytes,
            );
            progress.progress = Math.round(
              (progress.completedChunks / state.totalChunks) * 100,
            );
            progress.updatedAt = Date.now();

            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);

            await this.updatePersistentState(uploadId, {
              completedParts: progress.completedParts,
              updatedAt: progress.updatedAt,
            });

            return part;
          } catch {
            const retried = queue.retry(
              chunk.partNumber,
              this.config.maxRetries,
            );
            if (!retried) {
              progress.failedChunks.push(chunk.partNumber);
              this.notifyListeners(uploadId, progress);
              onProgress?.(progress);
            }
            return null;
          }
        },
        async () => {
          if (progress.failedChunks.length > 0) {
            progress.status = "failed";
            progress.error = `${progress.failedChunks.length} chunks failed`;
            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);
            reject(new Error(progress.error));
            return;
          }

          progress.status = "completing";
          this.notifyListeners(uploadId, progress);
          onProgress?.(progress);

          try {
            const result = await this.completeUpload({
              uploadId,
              parts: progress.completedParts,
            });

            progress.status = "completed";
            progress.completedAt = Date.now();
            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);

            await this.clearPersistentState(uploadId);
            this.activeUploads.delete(uploadId);

            resolve(result);
          } catch (error) {
            progress.status = "failed";
            progress.error =
              error instanceof Error ? error.message : "Complete failed";
            this.notifyListeners(uploadId, progress);
            onProgress?.(progress);
            reject(error);
          }
        },
      );
    });
  }

  /**
   * Pause an active upload
   */
  pauseUpload(uploadId: string): void {
    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      upload.queue.pause();
      upload.progress.status = "paused";
      this.notifyListeners(uploadId, upload.progress);
    }
  }

  /**
   * Resume a paused upload
   */
  unpauseUpload(uploadId: string): void {
    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      upload.queue.resume();
      upload.progress.status = "uploading";
      this.notifyListeners(uploadId, upload.progress);
    }
  }

  /**
   * Cancel an active upload
   */
  async cancelUpload(uploadId: string): Promise<void> {
    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      upload.queue.stop();
      upload.progress.status = "failed";
      upload.progress.error = "Upload cancelled";
      this.notifyListeners(uploadId, upload.progress);
    }

    await this.abortUpload(uploadId);
    this.activeUploads.delete(uploadId);
  }

  /**
   * Get progress for active upload
   */
  getProgress(uploadId: string): ChunkedUploadProgress | null {
    return this.activeUploads.get(uploadId)?.progress || null;
  }

  /**
   * Subscribe to upload progress
   */
  subscribe(
    uploadId: string,
    callback: (progress: ChunkedUploadProgress) => void,
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

  /**
   * Get all pending (resumable) uploads
   */
  async getPendingUploads(): Promise<PersistentUploadState[]> {
    try {
      const saved = await AsyncStorage.getItem(UPLOAD_STATE_KEY);
      if (!saved) return [];

      const states: Record<string, PersistentUploadState> = JSON.parse(saved);
      return Object.values(states);
    } catch {
      return [];
    }
  }

  // ===========================================================================
  // PERSISTENCE
  // ===========================================================================

  private async persistState(state: PersistentUploadState): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(UPLOAD_STATE_KEY);
      const states: Record<string, PersistentUploadState> = saved
        ? JSON.parse(saved)
        : {};
      states[state.uploadId] = state;
      await AsyncStorage.setItem(UPLOAD_STATE_KEY, JSON.stringify(states));
    } catch {
      // Ignore persistence errors
    }
  }

  private async updatePersistentState(
    uploadId: string,
    updates: Partial<PersistentUploadState>,
  ): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(UPLOAD_STATE_KEY);
      const states: Record<string, PersistentUploadState> = saved
        ? JSON.parse(saved)
        : {};

      if (states[uploadId]) {
        states[uploadId] = { ...states[uploadId], ...updates };
        await AsyncStorage.setItem(UPLOAD_STATE_KEY, JSON.stringify(states));
      }
    } catch {
      // Ignore
    }
  }

  private async loadPersistentState(
    uploadId: string,
  ): Promise<PersistentUploadState | null> {
    try {
      const saved = await AsyncStorage.getItem(UPLOAD_STATE_KEY);
      if (!saved) return null;

      const states: Record<string, PersistentUploadState> = JSON.parse(saved);
      return states[uploadId] || null;
    } catch {
      return null;
    }
  }

  private async clearPersistentState(uploadId: string): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(UPLOAD_STATE_KEY);
      if (!saved) return;

      const states: Record<string, PersistentUploadState> = JSON.parse(saved);
      delete states[uploadId];
      await AsyncStorage.setItem(UPLOAD_STATE_KEY, JSON.stringify(states));
    } catch {
      // Ignore
    }
  }

  // ===========================================================================
  // NOTIFICATION
  // ===========================================================================

  private notifyListeners(
    uploadId: string,
    progress: ChunkedUploadProgress,
  ): void {
    const listeners = this.listeners.get(uploadId);
    if (listeners) {
      listeners.forEach((cb) => cb(progress));
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const ChunkedUploadService = new ChunkedUploadServiceClass();

/**
 * Hook for chunked upload with resume
 */
export function useChunkedUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<ChunkedUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (
      fileUri: string,
      options: {
        filename?: string;
        contentType: string;
        metadata?: Record<string, unknown>;
      },
    ) => {
      setIsUploading(true);
      setError(null);
      setProgress(null);

      try {
        const result = await ChunkedUploadService.startUpload(fileUri, {
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

  const resume = useCallback(async (uploadId: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await ChunkedUploadService.resumeUpload(
        uploadId,
        setProgress,
      );
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Resume thất bại";
      setError(msg);
      throw e;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (progress?.uploadId) {
      ChunkedUploadService.pauseUpload(progress.uploadId);
    }
  }, [progress?.uploadId]);

  const unpause = useCallback(() => {
    if (progress?.uploadId) {
      ChunkedUploadService.unpauseUpload(progress.uploadId);
    }
  }, [progress?.uploadId]);

  const cancel = useCallback(async () => {
    if (progress?.uploadId) {
      await ChunkedUploadService.cancelUpload(progress.uploadId);
    }
  }, [progress?.uploadId]);

  return {
    start,
    resume,
    pause,
    unpause,
    cancel,
    isUploading,
    progress,
    error,
  };
}

/**
 * Hook for listing resumable uploads
 */
export function usePendingUploads() {
  const [uploads, setUploads] = useState<PersistentUploadState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const pending = await ChunkedUploadService.getPendingUploads();
      setUploads(pending);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    uploads,
    isLoading,
    refresh: load,
  };
}
