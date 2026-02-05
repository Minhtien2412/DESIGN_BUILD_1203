/**
 * Supabase Storage Provider
 * Primary storage for per-user document management
 *
 * Features:
 * - Per-user folders with Row Level Security (RLS)
 * - Real-time file sync
 * - Automatic thumbnail generation
 * - Presigned URLs for secure access
 *
 * @module services/storage/supabaseStorage
 */

import ENV from "@/config/env";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
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

// Supabase configuration
const SUPABASE_URL = ENV.SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY || "";
const DEFAULT_BUCKET = "documents";

// File type mappings
const MIME_TYPE_ICONS: Record<string, string> = {
  "application/pdf": "📄",
  "image/": "🖼️",
  "video/": "🎬",
  "audio/": "🎵",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument": "📊",
  "application/zip": "📦",
  "text/": "📃",
};

// Helper to get MIME type icon
const getMimeIcon = (mimeType: string): string => {
  for (const [key, icon] of Object.entries(MIME_TYPE_ICONS)) {
    if (mimeType.startsWith(key)) return icon;
  }
  return "📁";
};

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

// Supabase Storage Client
class SupabaseStorageClient {
  private baseUrl: string;
  private apiKey: string;
  private bucket: string;
  private authToken: string | null = null;
  private eventListeners: Set<StorageEventCallback> = new Set();

  constructor(
    url: string = SUPABASE_URL,
    apiKey: string = SUPABASE_ANON_KEY,
    bucket: string = DEFAULT_BUCKET,
  ) {
    this.baseUrl = url;
    this.apiKey = apiKey;
    this.bucket = bucket;
  }

  // Set auth token for authenticated requests
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Get headers for requests
  private getHeaders(contentType?: string): HeadersInit {
    const headers: HeadersInit = {
      apikey: this.apiKey,
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    return headers;
  }

  // Build storage URL
  private buildUrl(path: string, isPublic: boolean = false): string {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    if (isPublic) {
      return `${this.baseUrl}/storage/v1/object/public/${this.bucket}/${cleanPath}`;
    }
    return `${this.baseUrl}/storage/v1/object/${this.bucket}/${cleanPath}`;
  }

  // Upload file
  async upload(
    file: File | Blob | string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const {
      folder = "",
      filename,
      userId,
      accessLevel = "private",
      metadata = {},
      onProgress,
    } = options;

    // Build path: {userId}/{folder}/{filename}
    const userFolder = userId ? `${userId}/` : "";
    const subFolder = folder ? `${folder}/` : "";
    let fileData: Blob;
    let originalName: string;
    let mimeType: string;

    // Handle different file input types
    if (typeof file === "string") {
      // Base64 or URI
      if (file.startsWith("data:")) {
        // Base64 data URL
        const [header, base64Data] = file.split(",");
        mimeType =
          header.match(/data:([^;]+)/)?.[1] || "application/octet-stream";
        const arrayBuffer = decode(base64Data);
        fileData = new Blob([arrayBuffer], { type: mimeType });
        originalName = filename || `file_${Date.now()}`;
      } else if (file.startsWith("file://") || file.startsWith("content://")) {
        // Local file URI (React Native)
        const fileInfo = await FileSystem.getInfoAsync(file);
        if (!fileInfo.exists) {
          throw new Error("File not found");
        }
        const base64 = await FileSystem.readAsStringAsync(file, {
          encoding: FileSystem.EncodingType.Base64,
        });
        mimeType = this.getMimeTypeFromUri(file);
        const arrayBuffer = decode(base64);
        fileData = new Blob([arrayBuffer], { type: mimeType });
        originalName =
          filename || file.split("/").pop() || `file_${Date.now()}`;
      } else {
        throw new Error("Invalid file input");
      }
    } else if (file instanceof Blob) {
      fileData = file;
      mimeType = file.type || "application/octet-stream";
      originalName =
        filename || (file instanceof File ? file.name : `file_${Date.now()}`);
    } else {
      throw new Error("Invalid file input type");
    }

    // Generate unique filename
    const finalFilename = generateFilename(originalName);
    const storagePath = `${userFolder}${subFolder}${finalFilename}`;

    // Upload to Supabase
    const uploadUrl = this.buildUrl(storagePath);

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          ...this.getHeaders(mimeType),
          "x-upsert": "true",
        },
        body: fileData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const result = await response.json();

      // Get public URL
      const publicUrl = this.buildUrl(storagePath, true);

      const uploadResult: UploadResult = {
        id: result.Id || storagePath,
        url: publicUrl,
        signedUrl:
          accessLevel === "private"
            ? await this.getSignedUrl(storagePath)
            : undefined,
        filename: finalFilename,
        path: storagePath,
        size: fileData.size,
        mimeType,
        provider: "supabase",
        createdAt: new Date(),
        metadata,
      };

      // Emit event
      this.emitEvent({
        type: "file:created",
        fileId: uploadResult.id,
        userId: userId || "anonymous",
        path: storagePath,
        timestamp: new Date(),
        metadata,
      });

      return uploadResult;
    } catch (error: any) {
      console.error("[SupabaseStorage] Upload error:", error);
      throw error;
    }
  }

  // Download file
  async download(
    path: string,
    options: DownloadOptions = {},
  ): Promise<Blob | string> {
    const url = await this.getSignedUrl(path);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Download failed");
    }

    if (options.asBlob) {
      return response.blob();
    }

    // Return as base64 for React Native
    if (Platform.OS !== "web") {
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    return response.blob();
  }

  // Delete file
  async delete(path: string): Promise<void> {
    const url = this.buildUrl(path);

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Delete failed");
    }

    this.emitEvent({
      type: "file:deleted",
      path,
      userId: "current",
      timestamp: new Date(),
    });
  }

  // Move file
  async move(fromPath: string, toPath: string): Promise<FileInfo> {
    const url = `${this.baseUrl}/storage/v1/object/move`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders("application/json"),
      body: JSON.stringify({
        bucketId: this.bucket,
        sourceKey: fromPath,
        destinationKey: toPath,
      }),
    });

    if (!response.ok) {
      throw new Error("Move failed");
    }

    return this.getFileInfo(toPath);
  }

  // Copy file
  async copy(fromPath: string, toPath: string): Promise<FileInfo> {
    const url = `${this.baseUrl}/storage/v1/object/copy`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders("application/json"),
      body: JSON.stringify({
        bucketId: this.bucket,
        sourceKey: fromPath,
        destinationKey: toPath,
      }),
    });

    if (!response.ok) {
      throw new Error("Copy failed");
    }

    return this.getFileInfo(toPath);
  }

  // List files
  async listFiles(options: ListFilesOptions = {}): Promise<ListFilesResult> {
    const {
      folder = "",
      limit = 100,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "desc",
      search,
    } = options;

    const url = `${this.baseUrl}/storage/v1/object/list/${this.bucket}`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders("application/json"),
      body: JSON.stringify({
        prefix: folder,
        limit,
        offset,
        sortBy: { column: sortBy, order: sortOrder },
        search,
      }),
    });

    if (!response.ok) {
      throw new Error("List files failed");
    }

    const items = await response.json();

    const files: FileInfo[] = [];
    const folders: FolderInfo[] = [];

    for (const item of items) {
      if (item.id === null) {
        // It's a folder
        folders.push({
          id: item.name,
          name: item.name,
          path: `${folder}${item.name}`,
          fileCount: 0,
          totalSize: 0,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        });
      } else {
        // It's a file
        files.push({
          id: item.id,
          name: item.name,
          path: `${folder}${item.name}`,
          size: item.metadata?.size || 0,
          mimeType: item.metadata?.mimetype || "application/octet-stream",
          url: this.buildUrl(`${folder}${item.name}`, true),
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          metadata: item.metadata,
        });
      }
    }

    return {
      files,
      folders,
      total: files.length + folders.length,
      hasMore: items.length === limit,
      nextOffset: offset + items.length,
    };
  }

  // Create folder
  async createFolder(path: string): Promise<FolderInfo> {
    // Supabase creates folders implicitly when uploading files
    // We create a placeholder file to create the folder
    const placeholderPath = `${path}/.keep`;

    await this.upload(new Blob([""], { type: "text/plain" }), {
      folder: path,
      filename: ".keep",
    });

    return {
      id: path,
      name: path.split("/").pop() || path,
      path,
      fileCount: 0,
      totalSize: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Delete folder
  async deleteFolder(path: string, recursive: boolean = false): Promise<void> {
    if (!recursive) {
      const { files } = await this.listFiles({ folder: path });
      if (files.length > 0) {
        throw new Error(
          "Folder not empty. Use recursive=true to delete all contents.",
        );
      }
    }

    const url = `${this.baseUrl}/storage/v1/object/${this.bucket}`;
    const { files, folders } = await this.listFiles({
      folder: path,
      limit: 1000,
    });

    // Delete all files
    const filePaths = files.map((f) => f.path);
    if (filePaths.length > 0) {
      await fetch(url, {
        method: "DELETE",
        headers: this.getHeaders("application/json"),
        body: JSON.stringify({ prefixes: filePaths }),
      });
    }

    // Recursively delete subfolders
    for (const folder of folders) {
      await this.deleteFolder(folder.path, true);
    }
  }

  // Get public URL
  getPublicUrl(path: string): string {
    return this.buildUrl(path, true);
  }

  // Get signed URL
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const url = `${this.baseUrl}/storage/v1/object/sign/${this.bucket}/${path}`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders("application/json"),
      body: JSON.stringify({ expiresIn }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate signed URL");
    }

    const { signedURL } = await response.json();
    return `${this.baseUrl}${signedURL}`;
  }

  // Get file info
  async getFileInfo(path: string): Promise<FileInfo> {
    const url = this.buildUrl(path);

    const response = await fetch(url, {
      method: "HEAD",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("File not found");
    }

    return {
      id: path,
      name: path.split("/").pop() || path,
      path,
      size: parseInt(response.headers.get("content-length") || "0", 10),
      mimeType:
        response.headers.get("content-type") || "application/octet-stream",
      url: this.buildUrl(path, true),
      createdAt: new Date(response.headers.get("last-modified") || Date.now()),
      updatedAt: new Date(response.headers.get("last-modified") || Date.now()),
    };
  }

  // Update metadata
  async updateMetadata(
    path: string,
    metadata: Record<string, string>,
  ): Promise<FileInfo> {
    // Supabase doesn't support direct metadata updates
    // This would require database integration
    console.warn(
      "[SupabaseStorage] Metadata update requires database integration",
    );
    return this.getFileInfo(path);
  }

  // Share file
  async share(path: string, options: ShareOptions): Promise<ShareResult> {
    const expiresIn = options.expiresAt
      ? Math.floor((options.expiresAt.getTime() - Date.now()) / 1000)
      : 86400 * 7; // 7 days default

    const signedUrl = await this.getSignedUrl(path, expiresIn);

    return {
      shareId: `share_${Date.now()}`,
      shareUrl: signedUrl,
      expiresAt: options.expiresAt || new Date(Date.now() + expiresIn * 1000),
    };
  }

  // Revoke share
  async revokeShare(shareId: string): Promise<void> {
    // Signed URLs can't be revoked in Supabase
    // Would need to implement token-based sharing via database
    console.warn(
      "[SupabaseStorage] Share revocation requires custom implementation",
    );
  }

  // Get storage stats
  async getStats(userId?: string): Promise<StorageStats> {
    const folder = userId ? `${userId}/` : "";
    const { files } = await this.listFiles({ folder, limit: 10000 });

    const stats: StorageStats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      usedQuota: 0,
      maxQuota: 1024 * 1024 * 1024, // 1GB default
      byType: {},
      recentUploads: 0,
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const file of files) {
      const type = file.mimeType.split("/")[0] || "other";
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, size: 0 };
      }
      stats.byType[type].count++;
      stats.byType[type].size += file.size;

      if (file.createdAt >= weekAgo) {
        stats.recentUploads++;
      }
    }

    stats.usedQuota = stats.totalSize;
    return stats;
  }

  // Subscribe to storage events
  subscribe(callback: StorageEventCallback): () => void {
    this.eventListeners.add(callback);
    return () => {
      this.eventListeners.delete(callback);
    };
  }

  // Emit event to listeners
  private emitEvent(event: StorageEvent): void {
    this.eventListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("[SupabaseStorage] Event listener error:", error);
      }
    });
  }

  // Helper: Get MIME type from URI
  private getMimeTypeFromUri(uri: string): string {
    const ext = uri.split(".").pop()?.toLowerCase() || "";
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
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      mp4: "video/mp4",
      mov: "video/quicktime",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      zip: "application/zip",
      txt: "text/plain",
      json: "application/json",
      xml: "application/xml",
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      dwg: "application/acad",
      dxf: "application/dxf",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorageClient();

// Export class for custom instances
export { SupabaseStorageClient };

// Provider implementation
export const supabaseStorageProvider: IStorageProvider = {
  name: "supabase",
  upload: (file, options) => supabaseStorage.upload(file, options),
  download: (path, options) => supabaseStorage.download(path, options),
  delete: (path) => supabaseStorage.delete(path),
  move: (from, to) => supabaseStorage.move(from, to),
  copy: (from, to) => supabaseStorage.copy(from, to),
  createFolder: (path) => supabaseStorage.createFolder(path),
  deleteFolder: (path, recursive) =>
    supabaseStorage.deleteFolder(path, recursive),
  listFiles: (options) => supabaseStorage.listFiles(options),
  getPublicUrl: (path) => supabaseStorage.getPublicUrl(path),
  getSignedUrl: (path, expiresIn) =>
    supabaseStorage.getSignedUrl(path, expiresIn),
  getFileInfo: (path) => supabaseStorage.getFileInfo(path),
  updateMetadata: (path, metadata) =>
    supabaseStorage.updateMetadata(path, metadata),
  share: (path, options) => supabaseStorage.share(path, options),
  revokeShare: (shareId) => supabaseStorage.revokeShare(shareId),
  getStats: (userId) => supabaseStorage.getStats(userId),
  subscribe: (callback) => supabaseStorage.subscribe(callback),
};
