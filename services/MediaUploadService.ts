/**
 * Media Upload Service
 * Handles file uploads to the backend server
 * Supports local storage, S3, and Cloudinary
 */
import { ENV } from "@/config/env";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

// ============================================================================
// TYPES
// ============================================================================

export interface UploadResult {
  url: string;
  publicId?: string;
  filename: string;
  size: number;
  mimetype: string;
  provider: StorageProvider;
}

export type StorageProvider = "local" | "s3" | "cloudinary";

export type MediaFolder =
  | "products"
  | "products/thumbnails"
  | "products/gallery"
  | "avatars"
  | "projects"
  | "projects/before"
  | "projects/after"
  | "projects/progress"
  | "projects/documents"
  | "chat"
  | "chat/images"
  | "chat/videos"
  | "chat/files"
  | "chat/audio"
  | "designs"
  | "designs/2d"
  | "designs/3d"
  | "community"
  | "community/posts"
  | "portfolio"
  | "portfolio/works"
  | "documents"
  | "documents/contracts"
  | "videos"
  | "materials"
  | "labor";

export interface UploadOptions {
  folder: MediaFolder;
  provider?: StorageProvider;
  onProgress?: (progress: number) => void;
  maxSize?: number; // bytes
  quality?: number; // 0-1
  resize?: { width: number; height: number };
}

export interface PickImageOptions extends Omit<
  ImagePicker.ImagePickerOptions,
  "mediaTypes"
> {
  source?: "camera" | "library";
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_URL = ENV.API_BASE_URL || "https://baotienweb.cloud/api/v1";
const API_KEY = ENV.API_KEY || "nhaxinh-api-2025-secret-key";

const DEFAULT_OPTIONS: Partial<UploadOptions> = {
  provider: "local",
  quality: 0.8,
  maxSize: 10 * 1024 * 1024, // 10MB
};

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  mp4: "video/mp4",
  mov: "video/quicktime",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Document picker result type
interface DocumentAsset {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

class MediaUploadServiceClass {
  private authToken: string | null = null;

  /**
   * Set auth token for authenticated uploads
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // --------------------------------------------------------------------------
  // IMAGE PICKING
  // --------------------------------------------------------------------------

  /**
   * Request camera/library permissions
   */
  async requestPermissions(type: "camera" | "library"): Promise<boolean> {
    if (Platform.OS === "web") return true;

    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    }
  }

  /**
   * Pick image from camera or library
   */
  async pickImage(
    options: PickImageOptions = {},
  ): Promise<ImagePicker.ImagePickerAsset | null> {
    const { source = "library", ...pickerOptions } = options;

    // Request permission
    const hasPermission = await this.requestPermissions(source);
    if (!hasPermission) {
      throw new Error(
        `${source === "camera" ? "Camera" : "Photo library"} permission denied`,
      );
    }

    // Launch picker
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            ...pickerOptions,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            ...pickerOptions,
          });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    return result.assets[0];
  }

  /**
   * Pick multiple images from library
   */
  async pickMultipleImages(
    maxCount = 10,
  ): Promise<ImagePicker.ImagePickerAsset[]> {
    const hasPermission = await this.requestPermissions("library");
    if (!hasPermission) {
      throw new Error("Photo library permission denied");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxCount,
      quality: 0.8,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets;
  }

  /**
   * Pick video from library
   */
  async pickVideo(): Promise<ImagePicker.ImagePickerAsset | null> {
    const hasPermission = await this.requestPermissions("library");
    if (!hasPermission) {
      throw new Error("Photo library permission denied");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    return result.assets[0];
  }

  /**
   * Pick document (PDF, DOC, etc.)
   */
  async pickDocument(
    type: string[] = ["application/pdf"],
  ): Promise<DocumentAsset | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType,
      };
    } catch (error) {
      console.error("[MediaUpload] Pick document error:", error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // UPLOAD METHODS
  // --------------------------------------------------------------------------

  /**
   * Upload single file from URI
   */
  async uploadFile(uri: string, options: UploadOptions): Promise<UploadResult> {
    const {
      folder,
      provider = "local",
      onProgress,
    } = { ...DEFAULT_OPTIONS, ...options };

    // Prepare FormData
    const formData = new FormData();
    const filename = uri.split("/").pop() || `file_${Date.now()}`;
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    formData.append("file", {
      uri: Platform.OS === "web" ? uri : uri.replace("file://", ""),
      name: filename,
      type: mimeType,
    } as any);

    // Upload
    const url = `${API_URL}/upload/single?folder=${folder}&provider=${provider}`;

    return this.performUpload(url, formData, onProgress);
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    uris: string[],
    options: UploadOptions,
  ): Promise<UploadResult[]> {
    const {
      folder,
      provider = "local",
      onProgress,
    } = { ...DEFAULT_OPTIONS, ...options };

    const formData = new FormData();

    uris.forEach((uri, index) => {
      const filename = uri.split("/").pop() || `file_${index}_${Date.now()}`;
      const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = MIME_TYPES[ext] || "application/octet-stream";

      formData.append("files", {
        uri: Platform.OS === "web" ? uri : uri.replace("file://", ""),
        name: filename,
        type: mimeType,
      } as any);
    });

    const url = `${API_URL}/upload/multiple?folder=${folder}&provider=${provider}`;

    return this.performUpload(url, formData, onProgress);
  }

  /**
   * Pick and upload image in one step
   */
  async pickAndUploadImage(
    options: UploadOptions,
    pickOptions?: PickImageOptions,
  ): Promise<UploadResult | null> {
    const asset = await this.pickImage(pickOptions);
    if (!asset) return null;

    return this.uploadFile(asset.uri, options);
  }

  /**
   * Take photo and upload
   */
  async takePhotoAndUpload(
    options: UploadOptions,
  ): Promise<UploadResult | null> {
    const asset = await this.pickImage({ source: "camera" });
    if (!asset) return null;

    return this.uploadFile(asset.uri, options);
  }

  /**
   * Pick and upload document
   */
  async pickAndUploadDocument(
    options: UploadOptions,
    documentTypes?: string[],
  ): Promise<UploadResult | null> {
    const doc = await this.pickDocument(documentTypes);
    if (!doc) return null;

    return this.uploadFile(doc.uri, options);
  }

  // --------------------------------------------------------------------------
  // DELETE
  // --------------------------------------------------------------------------

  /**
   * Delete file from storage
   */
  async deleteFile(
    url: string,
    provider: StorageProvider = "local",
  ): Promise<void> {
    const response = await fetch(`${API_URL}/upload/file`, {
      method: "DELETE",
      headers: this.getHeaders(),
      body: JSON.stringify({ url, provider }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete file");
    }
  }

  // --------------------------------------------------------------------------
  // PRESIGNED URL (S3)
  // --------------------------------------------------------------------------

  /**
   * Get presigned URL for direct S3 upload (large files)
   */
  async getPresignedUrl(
    filename: string,
    contentType: string,
    folder: MediaFolder,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const response = await fetch(`${API_URL}/upload/presigned-url`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ filename, contentType, folder }),
    });

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    return response.json();
  }

  /**
   * Upload directly to S3 using presigned URL
   */
  async uploadToPresignedUrl(
    presignedUrl: string,
    file: Blob | File,
    contentType: string,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    // For web, use XMLHttpRequest for progress
    if (Platform.OS === "web" && onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            onProgress(e.loaded / e.total);
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.send(file);
      });
    }

    // For mobile, use fetch
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async performUpload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    // For web with progress, use XMLHttpRequest
    if (Platform.OS === "web" && onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            onProgress(e.loaded / e.total);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("POST", url);
        xhr.setRequestHeader("X-API-Key", API_KEY);
        if (this.authToken) {
          xhr.setRequestHeader("Authorization", `Bearer ${this.authToken}`);
        }
        xhr.send(formData);
      });
    }

    // Standard fetch upload
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        ...(this.authToken
          ? { Authorization: `Bearer ${this.authToken}` }
          : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Upload failed");
    }

    return response.json();
  }

  /**
   * Get file extension from URI
   */
  getExtension(uri: string): string {
    return uri.split(".").pop()?.toLowerCase() || "";
  }

  /**
   * Check if file type is image
   */
  isImage(uri: string): boolean {
    const ext = this.getExtension(uri);
    return ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext);
  }

  /**
   * Check if file type is video
   */
  isVideo(uri: string): boolean {
    const ext = this.getExtension(uri);
    return ["mp4", "mov", "avi", "webm"].includes(ext);
  }

  /**
   * Format file size to human readable
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}

// Export singleton instance
export const MediaUploadService = new MediaUploadServiceClass();

// Also export class for testing
export { MediaUploadServiceClass };
