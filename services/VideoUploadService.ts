/**
 * VideoUploadService - Video upload with compression, progress tracking
 * VIDEO-006: User Upload Video
 *
 * Features:
 * - Video picker from gallery
 * - Metadata extraction (duration, resolution)
 * - Upload with progress tracking
 * - Cover frame selection
 * - Caption/hashtag management
 */

import * as FileSystem from "@/utils/FileSystemCompat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { post } from "./api";

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface VideoMetadata {
  uri: string;
  duration: number; // seconds
  width: number;
  height: number;
  fileSize: number; // bytes
  mimeType: string;
  filename: string;
}

export interface TrimConfig {
  startTime: number; // seconds
  endTime: number; // seconds
}

export interface UploadConfig {
  video: VideoMetadata;
  trim?: TrimConfig;
  coverFrameTime?: number; // seconds into video for cover
  caption: string;
  hashtags: string[];
  visibility: "public" | "followers" | "private";
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
}

export interface UploadProgress {
  uploadId: string;
  status: "preparing" | "uploading" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  bytesUploaded: number;
  totalBytes: number;
  error?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface UploadTask {
  id: string;
  config: UploadConfig;
  progress: UploadProgress;
  createdAt: number;
  completedAt?: number;
}

export interface PresignedUploadResponse {
  uploadId: string;
  uploadUrl: string;
  fields?: Record<string, string>;
  expiresAt: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const UPLOAD_TASKS_KEY = "@video_upload_tasks";
const MAX_VIDEO_DURATION = 180; // 3 minutes
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB
const SUPPORTED_FORMATS = ["video/mp4", "video/quicktime", "video/x-m4v"];

// ============================================================================
// VIDEO PICKER
// ============================================================================

export async function pickVideoFromGallery(): Promise<VideoMetadata | null> {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Cần quyền truy cập thư viện để chọn video");
  }

  // Launch picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: false,
    quality: 1,
    videoMaxDuration: MAX_VIDEO_DURATION,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];

  // Get file info
  const fileInfo = await FileSystem.getInfoAsync(asset.uri, { size: true });

  const metadata: VideoMetadata = {
    uri: asset.uri,
    duration: asset.duration ? asset.duration / 1000 : 0, // Convert ms to seconds
    width: asset.width || 0,
    height: asset.height || 0,
    fileSize: (fileInfo as { size?: number }).size || 0,
    mimeType: asset.mimeType || "video/mp4",
    filename: asset.fileName || `video_${Date.now()}.mp4`,
  };

  return metadata;
}

export async function recordVideo(): Promise<VideoMetadata | null> {
  // Request camera permissions
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Cần quyền camera để quay video");
  }

  // Launch camera
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: false,
    quality: 1,
    videoMaxDuration: MAX_VIDEO_DURATION,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const fileInfo = await FileSystem.getInfoAsync(asset.uri, { size: true });

  return {
    uri: asset.uri,
    duration: asset.duration ? asset.duration / 1000 : 0,
    width: asset.width || 0,
    height: asset.height || 0,
    fileSize: (fileInfo as { size?: number }).size || 0,
    mimeType: asset.mimeType || "video/mp4",
    filename: asset.fileName || `recorded_${Date.now()}.mp4`,
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateVideo(metadata: VideoMetadata): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check duration
  if (metadata.duration > MAX_VIDEO_DURATION) {
    errors.push(`Video quá dài. Tối đa ${MAX_VIDEO_DURATION / 60} phút.`);
  }

  if (metadata.duration < 1) {
    errors.push("Video quá ngắn. Tối thiểu 1 giây.");
  }

  // Check file size
  if (metadata.fileSize > MAX_VIDEO_SIZE) {
    errors.push(`File quá lớn. Tối đa ${MAX_VIDEO_SIZE / (1024 * 1024)}MB.`);
  }

  // Check format
  if (!SUPPORTED_FORMATS.includes(metadata.mimeType)) {
    errors.push("Định dạng không hỗ trợ. Chỉ hỗ trợ MP4, MOV, M4V.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// HASHTAG UTILS
// ============================================================================

export function extractHashtags(text: string): string[] {
  const regex = /#[\w\u00C0-\u024F]+/g;
  const matches = text.match(regex) || [];
  return [...new Set(matches.map((tag) => tag.toLowerCase()))];
}

export function formatCaption(caption: string, hashtags: string[]): string {
  // Remove existing hashtags from caption
  let cleanCaption = caption.replace(/#[\w\u00C0-\u024F]+/g, "").trim();

  // Add hashtags at the end
  const hashtagStr = hashtags
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");

  return cleanCaption + (hashtagStr ? `\n\n${hashtagStr}` : "");
}

// ============================================================================
// UPLOAD TASK MANAGER
// ============================================================================

class UploadTaskManager {
  private tasks: Map<string, UploadTask> = new Map();
  private listeners: Map<string, Set<(progress: UploadProgress) => void>> =
    new Map();

  async initialize(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(UPLOAD_TASKS_KEY);
      if (saved) {
        const tasks = JSON.parse(saved) as UploadTask[];
        tasks.forEach((task) => this.tasks.set(task.id, task));
      }
    } catch {
      // Ignore load errors
    }
  }

  async createTask(config: UploadConfig): Promise<UploadTask> {
    const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const task: UploadTask = {
      id,
      config,
      progress: {
        uploadId: id,
        status: "preparing",
        progress: 0,
        bytesUploaded: 0,
        totalBytes: config.video.fileSize,
      },
      createdAt: Date.now(),
    };

    this.tasks.set(id, task);
    await this.persist();

    return task;
  }

  updateProgress(uploadId: string, update: Partial<UploadProgress>): void {
    const task = this.tasks.get(uploadId);
    if (!task) return;

    task.progress = { ...task.progress, ...update };

    if (update.status === "completed" || update.status === "failed") {
      task.completedAt = Date.now();
    }

    this.tasks.set(uploadId, task);
    this.notifyListeners(uploadId, task.progress);
    this.persist();
  }

  getTask(uploadId: string): UploadTask | null {
    return this.tasks.get(uploadId) || null;
  }

  getPendingTasks(): UploadTask[] {
    return Array.from(this.tasks.values()).filter(
      (t) =>
        t.progress.status === "preparing" || t.progress.status === "uploading",
    );
  }

  getRecentTasks(limit = 10): UploadTask[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

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
      }
    };
  }

  private notifyListeners(uploadId: string, progress: UploadProgress): void {
    const listeners = this.listeners.get(uploadId);
    if (listeners) {
      listeners.forEach((cb) => cb(progress));
    }
  }

  private async persist(): Promise<void> {
    try {
      const tasks = Array.from(this.tasks.values());
      await AsyncStorage.setItem(UPLOAD_TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore persist errors
    }
  }

  async removeTask(uploadId: string): Promise<void> {
    this.tasks.delete(uploadId);
    this.listeners.delete(uploadId);
    await this.persist();
  }

  async clearCompleted(): Promise<void> {
    const toRemove: string[] = [];
    this.tasks.forEach((task, id) => {
      if (
        task.progress.status === "completed" ||
        task.progress.status === "failed"
      ) {
        toRemove.push(id);
      }
    });

    toRemove.forEach((id) => {
      this.tasks.delete(id);
      this.listeners.delete(id);
    });

    await this.persist();
  }
}

// ============================================================================
// MAIN UPLOAD SERVICE
// ============================================================================

class VideoUploadServiceClass {
  private taskManager = new UploadTaskManager();
  private isInitialized = false;
  private activeUploads: Map<string, { abort: () => void }> = new Map();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.taskManager.initialize();
    this.isInitialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Start video upload
   */
  async uploadVideo(config: UploadConfig): Promise<UploadTask> {
    await this.ensureInitialized();

    // Validate video
    const validation = validateVideo(config.video);
    if (!validation.valid) {
      throw new Error(validation.errors.join("\n"));
    }

    // Create task
    const task = await this.taskManager.createTask(config);

    // Start upload in background
    this.processUpload(task.id, config).catch((error) => {
      this.taskManager.updateProgress(task.id, {
        status: "failed",
        error: error.message,
      });
    });

    return task;
  }

  private async processUpload(
    uploadId: string,
    config: UploadConfig,
  ): Promise<void> {
    try {
      // Step 1: Get presigned URL
      this.taskManager.updateProgress(uploadId, {
        status: "preparing",
        progress: 5,
      });

      const presigned = await this.getPresignedUrl(config);

      // Step 2: Upload file
      this.taskManager.updateProgress(uploadId, {
        status: "uploading",
        progress: 10,
      });

      await this.uploadToPresignedUrl(uploadId, config.video.uri, presigned);

      // Step 3: Notify server upload complete
      this.taskManager.updateProgress(uploadId, {
        status: "processing",
        progress: 90,
      });

      const result = await this.completeUpload(presigned.uploadId, config);

      // Done
      this.taskManager.updateProgress(uploadId, {
        status: "completed",
        progress: 100,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
      });
    } finally {
      this.activeUploads.delete(uploadId);
    }
  }

  private async getPresignedUrl(
    config: UploadConfig,
  ): Promise<PresignedUploadResponse> {
    const response = await post<PresignedUploadResponse>(
      "/api/v1/upload/presign",
      {
        contentType: config.video.mimeType,
        size: config.video.fileSize,
        filename: config.video.filename,
      },
    );

    return response;
  }

  private async uploadToPresignedUrl(
    uploadId: string,
    fileUri: string,
    presigned: PresignedUploadResponse,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let aborted = false;

      const uploadTask = FileSystem.createUploadTask(
        presigned.uploadUrl,
        fileUri,
        {
          httpMethod: "PUT",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            "Content-Type": "video/mp4",
            ...presigned.fields,
          },
        },
        (progress) => {
          if (aborted) return;

          const percent = Math.round(
            10 +
              (progress.totalBytesSent / progress.totalBytesExpectedToSend) *
                75,
          );

          this.taskManager.updateProgress(uploadId, {
            progress: percent,
            bytesUploaded: progress.totalBytesSent,
          });
        },
      );

      // Store abort function
      this.activeUploads.set(uploadId, {
        abort: () => {
          aborted = true;
          uploadTask.cancelAsync();
        },
      });

      uploadTask
        .uploadAsync()
        .then((response) => {
          if (aborted) {
            reject(new Error("Upload cancelled"));
            return;
          }

          if (response && response.status >= 200 && response.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${response?.status}`));
          }
        })
        .catch(reject);
    });
  }

  private async completeUpload(
    serverUploadId: string,
    config: UploadConfig,
  ): Promise<{ videoUrl: string; thumbnailUrl: string }> {
    const response = await post<{ videoUrl: string; thumbnailUrl: string }>(
      "/api/v1/upload/presign/complete",
      {
        uploadId: serverUploadId,
        caption: formatCaption(config.caption, config.hashtags),
        hashtags: config.hashtags,
        visibility: config.visibility,
        allowComments: config.allowComments,
        allowDuet: config.allowDuet,
        allowStitch: config.allowStitch,
        coverFrameTime: config.coverFrameTime,
        trim: config.trim,
        metadata: {
          duration: config.video.duration,
          width: config.video.width,
          height: config.video.height,
        },
      },
    );

    return response;
  }

  /**
   * Cancel an active upload
   */
  cancelUpload(uploadId: string): void {
    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      upload.abort();
      this.taskManager.updateProgress(uploadId, {
        status: "failed",
        error: "Đã hủy upload",
      });
    }
  }

  /**
   * Retry a failed upload
   */
  async retryUpload(uploadId: string): Promise<void> {
    const task = this.taskManager.getTask(uploadId);
    if (!task || task.progress.status !== "failed") {
      throw new Error("Không thể retry upload này");
    }

    this.taskManager.updateProgress(uploadId, {
      status: "preparing",
      progress: 0,
      error: undefined,
    });

    await this.processUpload(uploadId, task.config);
  }

  /**
   * Get upload progress
   */
  getProgress(uploadId: string): UploadProgress | null {
    const task = this.taskManager.getTask(uploadId);
    return task?.progress || null;
  }

  /**
   * Subscribe to upload progress
   */
  subscribe(
    uploadId: string,
    callback: (progress: UploadProgress) => void,
  ): () => void {
    return this.taskManager.subscribe(uploadId, callback);
  }

  /**
   * Get pending uploads
   */
  getPendingUploads(): UploadTask[] {
    return this.taskManager.getPendingTasks();
  }

  /**
   * Get recent uploads
   */
  getRecentUploads(limit = 10): UploadTask[] {
    return this.taskManager.getRecentTasks(limit);
  }

  /**
   * Clear completed uploads from history
   */
  async clearHistory(): Promise<void> {
    await this.taskManager.clearCompleted();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const VideoUploadService = new VideoUploadServiceClass();

/**
 * Hook for video upload with progress tracking
 */
export function useVideoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [currentUpload, setCurrentUpload] = useState<UploadTask | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const upload = useCallback(async (config: UploadConfig) => {
    setIsUploading(true);
    try {
      const task = await VideoUploadService.uploadVideo(config);
      setCurrentUpload(task);
      setProgress(task.progress);
      return task;
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  }, []);

  // Subscribe to progress updates
  useEffect(() => {
    if (!currentUpload) return;

    const unsubscribe = VideoUploadService.subscribe(currentUpload.id, (p) => {
      setProgress(p);
      if (p.status === "completed" || p.status === "failed") {
        setIsUploading(false);
      }
    });

    return unsubscribe;
  }, [currentUpload?.id]);

  const cancel = useCallback(() => {
    if (currentUpload) {
      VideoUploadService.cancelUpload(currentUpload.id);
    }
  }, [currentUpload]);

  const retry = useCallback(async () => {
    if (currentUpload) {
      setIsUploading(true);
      await VideoUploadService.retryUpload(currentUpload.id);
    }
  }, [currentUpload]);

  return {
    upload,
    cancel,
    retry,
    isUploading,
    progress,
    currentUpload,
  };
}

/**
 * Hook for picking video
 */
export function useVideoPicker() {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFromGallery = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await pickVideoFromGallery();
      setVideo(result);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lỗi khi chọn video";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const record = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await recordVideo();
      setVideo(result);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lỗi khi quay video";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setVideo(null);
    setError(null);
  }, []);

  return {
    video,
    isLoading,
    error,
    pickFromGallery,
    record,
    clear,
  };
}

/**
 * Hook for upload history
 */
export function useUploadHistory() {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await VideoUploadService.initialize();
      setUploads(VideoUploadService.getRecentUploads());
      setIsLoading(false);
    };
    load();
  }, []);

  const refresh = useCallback(() => {
    setUploads(VideoUploadService.getRecentUploads());
  }, []);

  const clearHistory = useCallback(async () => {
    await VideoUploadService.clearHistory();
    refresh();
  }, [refresh]);

  return {
    uploads,
    isLoading,
    refresh,
    clearHistory,
  };
}
