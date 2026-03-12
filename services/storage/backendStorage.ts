/**
 * Backend Storage Provider
 * Uses the existing backend API for document management
 * Fallback when Supabase is not configured
 *
 * @module services/storage/backendStorage
 */

import ENV from "@/config/env";
import { apiFetch } from "@/services/api";
import * as FileSystem from "expo-file-system";
import type {
    DownloadOptions,
    FileInfo,
    FolderInfo,
    IStorageProvider,
    ListFilesOptions,
    ListFilesResult,
    ShareOptions,
    ShareResult,
    StorageEvent,
    StorageEventCallback,
    StorageStats,
    UploadOptions,
    UploadResult,
} from "./types";

// Backend API base URL
const API_BASE_URL = ENV.API_BASE_URL || "https://baotienweb.cloud/api";

// Generate unique filename
const generateFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop() || "";
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_");
  return `${baseName}_${timestamp}_${random}.${ext}`;
};

// Get MIME type from filename
const getMimeTypeFromFilename = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    mp4: "video/mp4",
    mov: "video/quicktime",
    txt: "text/plain",
    json: "application/json",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

// Backend Storage Client
class BackendStorageClient {
  private eventListeners: Set<StorageEventCallback> = new Set();

  constructor() {
    console.log("[BackendStorage] Initialized with API:", API_BASE_URL);
  }

  // Get user folder path
  private getUserFolder(userId?: string): string {
    return userId ? `users/${userId}` : "public";
  }

  /**
   * Upload file to backend
   */
  async upload(
    file: File | Blob | string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const { filename = "file", folder = "", userId, metadata = {} } = options;

    const userFolder = this.getUserFolder(userId);
    const path = folder ? `${userFolder}/${folder}` : userFolder;
    const uniqueFilename = generateFilename(filename);
    const mimeType = getMimeTypeFromFilename(filename);

    console.log(`[BackendStorage] Uploading: ${uniqueFilename} to ${path}`);

    try {
      // Create FormData for upload
      const formData = new FormData();

      if (typeof file === "string") {
        // File is a URI/path
        if (file.startsWith("file://") || file.startsWith("/")) {
          // Local file path - use FileSystem
          const fileInfo = await FileSystem.getInfoAsync(file);
          if (!fileInfo.exists) {
            throw new Error("File not found");
          }

          // Create blob-like object for React Native FormData
          const blob = {
            uri: file,
            type: mimeType,
            name: uniqueFilename,
          } as unknown as Blob;

          formData.append("file", blob);
        } else if (file.startsWith("data:")) {
          // Base64 data URI
          const matches = file.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const dataUriMimeType = matches[1];

            // Create blob-like object for React Native
            const blob = {
              uri: file,
              type: dataUriMimeType,
              name: uniqueFilename,
            } as unknown as Blob;

            formData.append("file", blob);
          }
        } else {
          // Remote URL - download first
          throw new Error("Remote URL upload not supported yet");
        }
      } else if (file instanceof Blob) {
        formData.append("file", file, uniqueFilename);
      }

      // Add metadata
      formData.append("folder", path);
      if (metadata.tags) {
        formData.append("tags", JSON.stringify(metadata.tags));
      }
      if (metadata.description) {
        formData.append("description", metadata.description);
      }

      // Upload to backend
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          "X-API-Key": ENV.API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
      }

      const result = await response.json();

      // Map backend response to our format
      const uploadResult: UploadResult = {
        id: result.id || result.fileId || uniqueFilename,
        filename: uniqueFilename,
        path: result.path || `${path}/${uniqueFilename}`,
        url:
          result.url ||
          result.fileUrl ||
          `${API_BASE_URL}/files/${result.id || uniqueFilename}`,
        thumbnailUrl: result.thumbnailUrl,
        size: result.size || 0,
        mimeType: result.mimeType || result.contentType || mimeType,
        provider: "backend",
        createdAt: new Date(),
        metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
        },
      };

      // Emit event
      this.emitEvent({
        type: "file:created",
        fileId: uploadResult.id,
        userId: userId || "anonymous",
        path: uploadResult.path,
        timestamp: new Date(),
        metadata: { size: String(uploadResult.size) },
      });

      return uploadResult;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Upload error:", errorMessage);

      // Return a mock success for demo purposes when backend is unavailable
      if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
        console.warn("[BackendStorage] Network error, returning mock result");
        return this.createMockUploadResult(
          uniqueFilename,
          path,
          options,
          mimeType,
        );
      }

      throw error;
    }
  }

  /**
   * Create mock upload result for demo/offline mode
   */
  private createMockUploadResult(
    generatedFilename: string,
    path: string,
    options: UploadOptions,
    mimeType: string,
  ): UploadResult {
    const id = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      id,
      filename: generatedFilename,
      path: `${path}/${generatedFilename}`,
      url: `${API_BASE_URL}/files/${id}`,
      size: 0,
      mimeType,
      provider: "backend",
      createdAt: new Date(),
      metadata: {
        ...options.metadata,
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Download file from backend
   */
  async download(
    path: string,
    _options: DownloadOptions = {},
  ): Promise<Blob | string> {
    try {
      // Get download URL
      const downloadUrl = path.startsWith("http")
        ? path
        : `${API_BASE_URL}/files/download?path=${encodeURIComponent(path)}`;

      // Return blob for web or in-memory use
      const response = await fetch(downloadUrl, {
        headers: {
          "X-API-Key": ENV.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Download error:", errorMessage);
      throw error;
    }
  }

  /**
   * Delete file from backend
   */
  async delete(path: string): Promise<void> {
    try {
      const response = await apiFetch(
        `/files?path=${encodeURIComponent(path)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      this.emitEvent({
        type: "file:deleted",
        fileId: path,
        userId: "anonymous",
        path,
        timestamp: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Delete error:", errorMessage);
      // Don't throw for demo mode
      if (!errorMessage.includes("Network")) {
        throw error;
      }
    }
  }

  /**
   * List files in folder
   */
  async listFiles(options: ListFilesOptions = {}): Promise<ListFilesResult> {
    const {
      folder = "",
      limit = 50,
      offset = 0,
      search,
      sortBy = "name",
      sortOrder = "asc",
    } = options;

    try {
      const params = new URLSearchParams({
        folder,
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy,
        sortOrder,
      });

      if (search) {
        params.append("search", search);
      }

      const response = await apiFetch(`/files?${params.toString()}`);
      const data = await response.json();

      // Map to our format
      const files: FileInfo[] = (data.files || []).map(
        (file: Record<string, unknown>) => ({
          id: file.id || file.name,
          name: file.name || file.filename,
          path: file.path,
          size: file.size || 0,
          mimeType:
            file.mimeType || file.contentType || "application/octet-stream",
          url: file.url || "",
          thumbnailUrl: file.thumbnailUrl,
          createdAt: new Date((file.createdAt as string) || Date.now()),
          updatedAt: new Date(
            (file.updatedAt as string) ||
              (file.createdAt as string) ||
              Date.now(),
          ),
          metadata: file.metadata || {},
        }),
      );

      const folders: FolderInfo[] = (data.folders || []).map(
        (f: Record<string, unknown>) => ({
          id: f.id || f.name,
          name: f.name,
          path: f.path,
          fileCount: (f.itemCount || f.fileCount || 0) as number,
          totalSize: (f.totalSize || 0) as number,
          createdAt: new Date((f.createdAt as string) || Date.now()),
          updatedAt: new Date((f.updatedAt as string) || Date.now()),
        }),
      );

      return {
        files,
        folders,
        total: data.total || files.length + folders.length,
        hasMore: data.hasMore || false,
        nextOffset: data.nextOffset,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] List files error:", errorMessage);

      // Return empty list for demo/offline mode
      return {
        files: [],
        folders: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Create folder
   */
  async createFolder(path: string): Promise<FolderInfo> {
    try {
      const response = await apiFetch("/files/folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      });

      const data = await response.json();
      const now = new Date();

      return {
        id: data.id || path,
        name: path.split("/").pop() || path,
        path,
        fileCount: 0,
        totalSize: 0,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Create folder error:", errorMessage);

      // Return mock folder for demo mode
      const now = new Date();
      return {
        id: `folder_${Date.now()}`,
        name: path.split("/").pop() || path,
        path,
        fileCount: 0,
        totalSize: 0,
        createdAt: now,
        updatedAt: now,
      };
    }
  }

  /**
   * Delete folder
   */
  async deleteFolder(path: string, recursive = false): Promise<void> {
    try {
      await apiFetch(
        `/files/folder?path=${encodeURIComponent(path)}&recursive=${recursive}`,
        {
          method: "DELETE",
        },
      );

      this.emitEvent({
        type: "folder:deleted",
        folderId: path,
        userId: "anonymous",
        path,
        timestamp: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Delete folder error:", errorMessage);
    }
  }

  /**
   * Get storage stats
   */
  async getStats(userId?: string): Promise<StorageStats> {
    try {
      const response = await apiFetch(
        `/files/stats${userId ? `?userId=${userId}` : ""}`,
      );
      const data = await response.json();

      return {
        totalFiles: data.fileCount || data.totalFiles || 0,
        totalSize: data.totalSize || 0,
        usedQuota: data.usedQuota || data.usedSize || 0,
        maxQuota: data.maxQuota || data.quotaLimit || 1024 * 1024 * 1024, // 1GB default
        byType: data.byType || {},
        recentUploads: data.recentUploads || 0,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Get stats error:", errorMessage);

      // Return mock stats
      return {
        totalFiles: 0,
        totalSize: 0,
        usedQuota: 0,
        maxQuota: 1024 * 1024 * 1024, // 1GB
        byType: {},
        recentUploads: 0,
      };
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(path: string): Promise<FileInfo> {
    try {
      const response = await apiFetch(
        `/files/info?path=${encodeURIComponent(path)}`,
      );
      const data = await response.json();

      return {
        id: data.id || path,
        name: data.name || path.split("/").pop() || "",
        path: data.path || path,
        size: data.size || 0,
        mimeType: data.mimeType || "application/octet-stream",
        url: data.url || "",
        thumbnailUrl: data.thumbnailUrl,
        createdAt: new Date(data.createdAt || Date.now()),
        updatedAt: new Date(data.updatedAt || Date.now()),
        metadata: data.metadata || {},
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Get file info error:", errorMessage);
      // Return default file info
      const now = new Date();
      return {
        id: path,
        name: path.split("/").pop() || "",
        path,
        size: 0,
        mimeType: "application/octet-stream",
        url: "",
        createdAt: now,
        updatedAt: now,
      };
    }
  }

  /**
   * Move/rename file
   */
  async move(sourcePath: string, destPath: string): Promise<FileInfo> {
    try {
      const response = await apiFetch("/files/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: sourcePath, destination: destPath }),
      });

      const data = await response.json();

      this.emitEvent({
        type: "file:moved",
        fileId: sourcePath,
        userId: "anonymous",
        path: destPath,
        timestamp: new Date(),
        metadata: { from: sourcePath },
      });

      const now = new Date();
      return {
        id: data.id || destPath,
        name: destPath.split("/").pop() || "",
        path: destPath,
        size: data.size || 0,
        mimeType: data.mimeType || "application/octet-stream",
        url: data.url || "",
        createdAt: new Date(data.createdAt || Date.now()),
        updatedAt: now,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Move error:", errorMessage);
      throw error;
    }
  }

  /**
   * Copy file
   */
  async copy(sourcePath: string, destPath: string): Promise<FileInfo> {
    try {
      const response = await apiFetch("/files/copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: sourcePath, destination: destPath }),
      });

      const data = await response.json();
      const now = new Date();

      return {
        id: data.id || destPath,
        name: destPath.split("/").pop() || "",
        path: destPath,
        size: data.size || 0,
        mimeType: data.mimeType || "application/octet-stream",
        url: data.url || "",
        createdAt: now,
        updatedAt: now,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Copy error:", errorMessage);
      throw error;
    }
  }

  /**
   * Get public URL
   */
  getPublicUrl(path: string): string {
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}/files/${encodeURIComponent(path)}`;
  }

  /**
   * Get signed URL
   */
  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    try {
      const response = await apiFetch(
        `/files/signed-url?path=${encodeURIComponent(path)}&expiresIn=${expiresIn}`,
      );
      const data = await response.json();
      return data.url || this.getPublicUrl(path);
    } catch {
      return this.getPublicUrl(path);
    }
  }

  /**
   * Update metadata
   */
  async updateMetadata(
    path: string,
    metadata: Record<string, string>,
  ): Promise<FileInfo> {
    try {
      await apiFetch("/files/metadata", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path, metadata }),
      });

      return this.getFileInfo(path);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Update metadata error:", errorMessage);
      return this.getFileInfo(path);
    }
  }

  /**
   * Share file
   */
  async share(path: string, options: ShareOptions = {}): Promise<ShareResult> {
    const {
      userIds,
      teamIds,
      public: isPublic,
      expiresAt,
      permission,
    } = options;

    try {
      const response = await apiFetch("/files/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path,
          userIds,
          teamIds,
          public: isPublic,
          expiresAt: expiresAt?.toISOString(),
          permission,
        }),
      });

      const data = await response.json();

      return {
        shareId:
          data.shareId ||
          data.id ||
          Math.random().toString(36).substring(2, 10),
        shareUrl:
          data.shareUrl ||
          data.url ||
          `${API_BASE_URL}/shared/${data.shareId || data.id}`,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : expiresAt,
        password: data.password,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Share error:", errorMessage);

      // Return mock share link
      const shareId = Math.random().toString(36).substring(2, 10);
      return {
        shareId,
        shareUrl: `${API_BASE_URL}/shared/${shareId}`,
        expiresAt,
      };
    }
  }

  /**
   * Revoke share
   */
  async revokeShare(shareId: string): Promise<void> {
    try {
      await apiFetch(`/files/share/${shareId}`, {
        method: "DELETE",
      });

      this.emitEvent({
        type: "share:revoked",
        fileId: shareId,
        userId: "anonymous",
        path: "",
        timestamp: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[BackendStorage] Revoke share error:", errorMessage);
    }
  }

  // Event handling
  subscribe(callback: StorageEventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  private emitEvent(event: StorageEvent): void {
    this.eventListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("[BackendStorage] Event callback error:", error);
      }
    });
  }

  // Provider info
  get name(): "backend" {
    return "backend";
  }

  get displayName(): string {
    return "Backend Storage";
  }

  get icon(): string {
    return "🗄️";
  }
}

// Export singleton instance
export const backendStorageClient = new BackendStorageClient();

// IStorageProvider implementation
export const backendStorageProvider: IStorageProvider = {
  name: "backend",

  upload: (file, options) => backendStorageClient.upload(file, options),
  download: (path, options) => backendStorageClient.download(path, options),
  delete: (path) => backendStorageClient.delete(path),
  listFiles: (options) => backendStorageClient.listFiles(options),
  createFolder: (path) => backendStorageClient.createFolder(path),
  deleteFolder: (path, recursive) =>
    backendStorageClient.deleteFolder(path, recursive),
  getStats: (userId) => backendStorageClient.getStats(userId),
  getFileInfo: (path) => backendStorageClient.getFileInfo(path),
  getPublicUrl: (path) => backendStorageClient.getPublicUrl(path),
  getSignedUrl: (path, expiresIn) =>
    backendStorageClient.getSignedUrl(path, expiresIn),
  updateMetadata: (path, metadata) =>
    backendStorageClient.updateMetadata(path, metadata),
  move: (source, dest) => backendStorageClient.move(source, dest),
  copy: (source, dest) => backendStorageClient.copy(source, dest),
  share: (path, options) => backendStorageClient.share(path, options),
  revokeShare: (shareId) => backendStorageClient.revokeShare(shareId),
  subscribe: (callback) => backendStorageClient.subscribe(callback),
};
