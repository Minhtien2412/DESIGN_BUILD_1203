/**
 * Cloudinary Storage Provider
 * For image/video optimization and transformation
 *
 * Features:
 * - Automatic image optimization (WebP, quality)
 * - On-the-fly transformations
 * - Video transcoding
 * - AI-powered tagging
 *
 * @module services/storage/cloudinaryStorage
 */

import ENV from "@/config/env";
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
    StorageEventCallback,
    StorageStats,
    UploadOptions,
    UploadResult,
} from "./types";

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  cloudName: ENV.CLOUDINARY_CLOUD_NAME || "",
  apiKey: ENV.CLOUDINARY_API_KEY || "",
  apiSecret: ENV.CLOUDINARY_API_SECRET || "",
  uploadPreset: ENV.CLOUDINARY_UPLOAD_PRESET || "app_uploads",
};

// Transformation presets
export const TRANSFORM_PRESETS = {
  thumbnail: { width: 200, height: 200, crop: "fill", quality: "auto" },
  preview: { width: 800, height: 600, crop: "limit", quality: "auto:good" },
  avatar: {
    width: 150,
    height: 150,
    crop: "thumb",
    gravity: "face",
    radius: "max",
  },
  banner: { width: 1200, height: 400, crop: "fill", quality: "auto:best" },
  document: { format: "jpg", quality: 85, page: 1 }, // PDF to image
  optimized: { fetch_format: "auto", quality: "auto" },
};

// Helper to generate unique public ID
const generatePublicId = (
  originalName: string,
  folder: string = "",
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_");
  const folderPrefix = folder ? `${folder}/` : "";
  return `${folderPrefix}${baseName}_${timestamp}_${random}`;
};

class CloudinaryStorageClient {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;
  private uploadPreset: string;
  private eventListeners: Set<StorageEventCallback> = new Set();

  constructor(config = CLOUDINARY_CONFIG) {
    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.uploadPreset = config.uploadPreset;
  }

  // Get Cloudinary upload URL
  private getUploadUrl(resourceType: string = "auto"): string {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;
  }

  // Get Cloudinary delivery URL
  private getDeliveryUrl(
    publicId: string,
    resourceType: string = "image",
  ): string {
    return `https://res.cloudinary.com/${this.cloudName}/${resourceType}/upload/${publicId}`;
  }

  // Build transformation URL
  buildTransformUrl(
    publicId: string,
    transformations: Record<string, any>,
    resourceType: string = "image",
  ): string {
    const transforms = Object.entries(transformations)
      .map(([key, value]) => {
        const shortKey = this.getTransformKey(key);
        return `${shortKey}_${value}`;
      })
      .join(",");

    return `https://res.cloudinary.com/${this.cloudName}/${resourceType}/upload/${transforms}/${publicId}`;
  }

  // Map transformation keys to Cloudinary format
  private getTransformKey(key: string): string {
    const keyMap: Record<string, string> = {
      width: "w",
      height: "h",
      crop: "c",
      quality: "q",
      format: "f",
      gravity: "g",
      radius: "r",
      fetch_format: "f",
      page: "pg",
    };
    return keyMap[key] || key;
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
      optimize = true,
    } = options;

    // Build folder path
    const userFolder = userId ? `users/${userId}` : "";
    const fullFolder = [userFolder, folder].filter(Boolean).join("/");

    let fileData: string;
    let originalName: string;
    let mimeType: string;

    // Handle different input types
    if (typeof file === "string") {
      if (file.startsWith("data:")) {
        // Base64 data URL
        fileData = file;
        const [header] = file.split(",");
        mimeType =
          header.match(/data:([^;]+)/)?.[1] || "application/octet-stream";
        originalName = filename || `file_${Date.now()}`;
      } else if (file.startsWith("file://") || file.startsWith("content://")) {
        // React Native file URI
        const base64 = await FileSystem.readAsStringAsync(file, {
          encoding: FileSystem.EncodingType.Base64,
        });
        mimeType = this.getMimeTypeFromUri(file);
        fileData = `data:${mimeType};base64,${base64}`;
        originalName =
          filename || file.split("/").pop() || `file_${Date.now()}`;
      } else if (file.startsWith("http://") || file.startsWith("https://")) {
        // URL - Cloudinary can fetch directly
        fileData = file;
        mimeType = "application/octet-stream";
        originalName =
          filename || file.split("/").pop() || `file_${Date.now()}`;
      } else {
        throw new Error("Invalid file input");
      }
    } else if (file instanceof Blob) {
      // Convert Blob to base64
      fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      mimeType = file.type || "application/octet-stream";
      originalName =
        filename || (file instanceof File ? file.name : `file_${Date.now()}`);
    } else {
      throw new Error("Invalid file input type");
    }

    // Determine resource type
    const resourceType = this.getResourceType(mimeType);

    // Generate public ID
    const publicId = generatePublicId(originalName, fullFolder);

    // Build form data
    const formData = new FormData();
    formData.append("file", fileData);
    formData.append("upload_preset", this.uploadPreset);
    formData.append("public_id", publicId);

    if (fullFolder) {
      formData.append("folder", fullFolder);
    }

    // Add metadata as context
    if (Object.keys(metadata).length > 0) {
      const contextStr = Object.entries(metadata)
        .map(([k, v]) => `${k}=${v}`)
        .join("|");
      formData.append("context", contextStr);
    }

    // Eager transformations for thumbnails
    if (optimize && resourceType === "image") {
      formData.append(
        "eager",
        "c_thumb,w_200,h_200|c_limit,w_800,h_600|f_auto,q_auto",
      );
    }

    // Upload
    try {
      const response = await fetch(this.getUploadUrl(resourceType), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Upload failed");
      }

      const result = await response.json();

      // Build result
      const uploadResult: UploadResult = {
        id: result.asset_id || result.public_id,
        url: result.secure_url,
        signedUrl: result.secure_url,
        filename: originalName,
        path: result.public_id,
        size: result.bytes,
        mimeType: `${resourceType}/${result.format}`,
        provider: "cloudinary",
        publicId: result.public_id,
        createdAt: new Date(result.created_at),
        metadata,
      };

      // Add thumbnail if available
      if (result.eager && result.eager[0]) {
        uploadResult.thumbnailUrl = result.eager[0].secure_url;
      }

      return uploadResult;
    } catch (error: any) {
      console.error("[CloudinaryStorage] Upload error:", error);
      throw error;
    }
  }

  // Download file
  async download(
    path: string,
    options: DownloadOptions = {},
  ): Promise<Blob | string> {
    let url = this.getPublicUrl(path);

    // Apply transformations if requested
    if (options.transform) {
      url = this.buildTransformUrl(path, options.transform);
    }

    if (Platform.OS !== "web") {
      // React Native - download to cache
      const localPath = `${FileSystem.cacheDirectory}${path.split("/").pop()}`;
      const downloadResult = await FileSystem.downloadAsync(url, localPath);

      if (downloadResult.status !== 200) {
        throw new Error("Download failed");
      }

      return options.asBlob
        ? FileSystem.readAsStringAsync(localPath, {
            encoding: FileSystem.EncodingType.Base64,
          })
        : localPath;
    }

    // Web
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Download failed");
    }
    return response.blob();
  }

  // Delete file
  async delete(path: string): Promise<void> {
    // Cloudinary deletion requires signed request
    // Should call backend API
    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ENV.API_KEY,
        },
        body: JSON.stringify({ publicId: path }),
      },
    );

    if (!response.ok) {
      throw new Error("Delete failed");
    }
  }

  // Move file (rename)
  async move(fromPath: string, toPath: string): Promise<FileInfo> {
    // Cloudinary rename
    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/rename`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ENV.API_KEY,
        },
        body: JSON.stringify({
          fromPublicId: fromPath,
          toPublicId: toPath,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Move failed");
    }

    return this.getFileInfo(toPath);
  }

  // Copy file (not natively supported, need to download and re-upload)
  async copy(fromPath: string, toPath: string): Promise<FileInfo> {
    const sourceUrl = this.getPublicUrl(fromPath);

    // Upload from URL
    const result = await this.upload(sourceUrl, {
      filename: toPath.split("/").pop(),
      folder: toPath.split("/").slice(0, -1).join("/"),
    });

    return this.getFileInfo(result.path);
  }

  // List files (requires Admin API - should call backend)
  async listFiles(options: ListFilesOptions = {}): Promise<ListFilesResult> {
    const { folder = "", limit = 100, search } = options;

    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/list?` +
        `folder=${folder}&maxResults=${limit}${search ? `&expression=${search}` : ""}`,
      {
        headers: { "X-API-Key": ENV.API_KEY },
      },
    );

    if (!response.ok) {
      return { files: [], folders: [], total: 0, hasMore: false };
    }

    const data = await response.json();

    const files: FileInfo[] = (data.resources || []).map((item: any) => ({
      id: item.asset_id,
      name: item.public_id.split("/").pop(),
      path: item.public_id,
      size: item.bytes,
      mimeType: `${item.resource_type}/${item.format}`,
      url: item.secure_url,
      thumbnailUrl: this.buildTransformUrl(
        item.public_id,
        TRANSFORM_PRESETS.thumbnail,
      ),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.created_at),
    }));

    const folders: FolderInfo[] = (data.folders || []).map((item: any) => ({
      id: item.path,
      name: item.name,
      path: item.path,
      fileCount: 0,
      totalSize: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return {
      files,
      folders,
      total: data.total_count || files.length,
      hasMore: !!data.next_cursor,
      nextOffset: data.next_cursor,
    };
  }

  // Create folder
  async createFolder(path: string): Promise<FolderInfo> {
    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/folder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ENV.API_KEY,
        },
        body: JSON.stringify({ folder: path }),
      },
    );

    if (!response.ok) {
      // Cloudinary creates folders implicitly
      console.warn(
        "[CloudinaryStorage] Folder creation note: folders are created automatically on upload",
      );
    }

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
    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/folder`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ENV.API_KEY,
        },
        body: JSON.stringify({ folder: path }),
      },
    );

    if (!response.ok) {
      throw new Error("Delete folder failed");
    }
  }

  // Get public URL
  getPublicUrl(path: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${path}`;
  }

  // Get signed URL (Cloudinary URLs are public by default)
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    // For private delivery, need to call backend
    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/sign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ENV.API_KEY,
        },
        body: JSON.stringify({ publicId: path, expiresIn }),
      },
    );

    if (!response.ok) {
      return this.getPublicUrl(path);
    }

    const { signedUrl } = await response.json();
    return signedUrl;
  }

  // Get file info
  async getFileInfo(path: string): Promise<FileInfo> {
    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/resource?publicId=${path}`,
      {
        headers: { "X-API-Key": ENV.API_KEY },
      },
    );

    if (!response.ok) {
      throw new Error("File not found");
    }

    const data = await response.json();

    return {
      id: data.asset_id,
      name: path.split("/").pop() || path,
      path,
      size: data.bytes,
      mimeType: `${data.resource_type}/${data.format}`,
      url: data.secure_url,
      thumbnailUrl: this.buildTransformUrl(path, TRANSFORM_PRESETS.thumbnail),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.created_at),
      metadata: data.context?.custom || {},
    };
  }

  // Update metadata
  async updateMetadata(
    path: string,
    metadata: Record<string, string>,
  ): Promise<FileInfo> {
    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/metadata`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ENV.API_KEY,
        },
        body: JSON.stringify({ publicId: path, metadata }),
      },
    );

    if (!response.ok) {
      throw new Error("Metadata update failed");
    }

    return this.getFileInfo(path);
  }

  // Share file
  async share(path: string, options: ShareOptions): Promise<ShareResult> {
    const signedUrl = await this.getSignedUrl(
      path,
      options.expiresAt
        ? Math.floor((options.expiresAt.getTime() - Date.now()) / 1000)
        : 86400 * 7,
    );

    return {
      shareId: `cld_share_${Date.now()}`,
      shareUrl: signedUrl,
      expiresAt:
        options.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  // Revoke share
  async revokeShare(shareId: string): Promise<void> {
    console.warn(
      "[CloudinaryStorage] Share revocation requires invalidating the resource",
    );
  }

  // Get storage stats
  async getStats(userId?: string): Promise<StorageStats> {
    const folder = userId ? `users/${userId}` : "";

    const response = await fetch(
      `${ENV.API_BASE_URL}/storage/cloudinary/usage${folder ? `?folder=${folder}` : ""}`,
      {
        headers: { "X-API-Key": ENV.API_KEY },
      },
    );

    if (!response.ok) {
      return {
        totalFiles: 0,
        totalSize: 0,
        usedQuota: 0,
        maxQuota: 0,
        byType: {},
        recentUploads: 0,
      };
    }

    const data = await response.json();

    return {
      totalFiles: data.resources || 0,
      totalSize: data.storage?.usage || 0,
      usedQuota: data.storage?.usage || 0,
      maxQuota: data.storage?.limit || 0,
      byType: {
        image: { count: data.derived_resources || 0, size: 0 },
        video: { count: 0, size: 0 },
      },
      recentUploads: 0,
    };
  }

  // Subscribe to events
  subscribe(callback: StorageEventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  // Helper: Get resource type from MIME
  private getResourceType(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "raw";
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
      mp4: "video/mp4",
      mov: "video/quicktime",
      pdf: "application/pdf",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  // Get optimized URL with transformations
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: "auto" | "webp" | "jpg" | "png";
      crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
    } = {},
  ): string {
    const transforms: Record<string, any> = {
      fetch_format: options.format || "auto",
      quality: options.quality || "auto",
    };

    if (options.width) transforms.width = options.width;
    if (options.height) transforms.height = options.height;
    if (options.crop) transforms.crop = options.crop;

    return this.buildTransformUrl(publicId, transforms);
  }

  // Get video thumbnail
  getVideoThumbnail(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      startOffset?: number;
    } = {},
  ): string {
    const transforms: Record<string, any> = {
      resource_type: "video",
      format: "jpg",
      width: options.width || 400,
      height: options.height || 300,
      crop: "fill",
    };

    if (options.startOffset) {
      transforms.start_offset = options.startOffset;
    }

    return this.buildTransformUrl(publicId, transforms, "video");
  }
}

// Export singleton
export const cloudinaryStorage = new CloudinaryStorageClient();

// Export class
export { CloudinaryStorageClient };

// Provider implementation
export const cloudinaryStorageProvider: IStorageProvider = {
  name: "cloudinary",
  upload: (file, options) => cloudinaryStorage.upload(file, options),
  download: (path, options) => cloudinaryStorage.download(path, options),
  delete: (path) => cloudinaryStorage.delete(path),
  move: (from, to) => cloudinaryStorage.move(from, to),
  copy: (from, to) => cloudinaryStorage.copy(from, to),
  createFolder: (path) => cloudinaryStorage.createFolder(path),
  deleteFolder: (path, recursive) =>
    cloudinaryStorage.deleteFolder(path, recursive),
  listFiles: (options) => cloudinaryStorage.listFiles(options),
  getPublicUrl: (path) => cloudinaryStorage.getPublicUrl(path),
  getSignedUrl: (path, expiresIn) =>
    cloudinaryStorage.getSignedUrl(path, expiresIn),
  getFileInfo: (path) => cloudinaryStorage.getFileInfo(path),
  updateMetadata: (path, metadata) =>
    cloudinaryStorage.updateMetadata(path, metadata),
  share: (path, options) => cloudinaryStorage.share(path, options),
  revokeShare: (shareId) => cloudinaryStorage.revokeShare(shareId),
  getStats: (userId) => cloudinaryStorage.getStats(userId),
  subscribe: (callback) => cloudinaryStorage.subscribe(callback),
};
