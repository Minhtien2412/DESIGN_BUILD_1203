/**
 * MediaUploadService — High-level media picking + upload.
 *
 * Upload work is delegated to PresignedUploadService so every module
 * in the app uses the same presigned flow.  This class keeps the
 * picker helpers (camera, library, document) and the convenience
 * combo methods (pickAndUpload*).
 */
import {
    CompleteUploadResponse,
    PresignedUploadService,
} from "@/services/PresignedUploadService";
import { del } from "@/services/api";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

// ============================================================================
// TYPES (kept for backward-compat with consumers)
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
  maxSize?: number;
  quality?: number;
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

interface DocumentAsset {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function toUploadResult(r: CompleteUploadResponse): UploadResult {
  return {
    url: r.fileUrl,
    filename: r.filename,
    size: r.fileSize,
    mimetype: r.contentType,
    provider: "local",
  };
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

class MediaUploadServiceClass {
  // --------------------------------------------------------------------------
  // IMAGE PICKING
  // --------------------------------------------------------------------------

  async requestPermissions(type: "camera" | "library"): Promise<boolean> {
    if (Platform.OS === "web") return true;
    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  }

  async pickImage(
    options: PickImageOptions = {},
  ): Promise<ImagePicker.ImagePickerAsset | null> {
    const { source = "library", ...pickerOptions } = options;
    const hasPermission = await this.requestPermissions(source);
    if (!hasPermission) {
      throw new Error(
        `${source === "camera" ? "Camera" : "Photo library"} permission denied`,
      );
    }

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

    if (result.canceled || !result.assets?.[0]) return null;
    return result.assets[0];
  }

  async pickMultipleImages(
    maxCount = 10,
  ): Promise<ImagePicker.ImagePickerAsset[]> {
    const hasPermission = await this.requestPermissions("library");
    if (!hasPermission) throw new Error("Photo library permission denied");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxCount,
      quality: 0.8,
    });
    if (result.canceled || !result.assets) return [];
    return result.assets;
  }

  async pickVideo(): Promise<ImagePicker.ImagePickerAsset | null> {
    const hasPermission = await this.requestPermissions("library");
    if (!hasPermission) throw new Error("Photo library permission denied");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    return result.assets[0];
  }

  async pickDocument(
    type: string[] = ["application/pdf"],
  ): Promise<DocumentAsset | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name,
      size: asset.size,
      mimeType: asset.mimeType,
    };
  }

  // --------------------------------------------------------------------------
  // UPLOAD — delegates to PresignedUploadService
  // --------------------------------------------------------------------------

  async uploadFile(uri: string, options: UploadOptions): Promise<UploadResult> {
    const filename = uri.split("/").pop() || `file_${Date.now()}`;
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    const result = await PresignedUploadService.upload(uri, {
      filename,
      contentType: mimeType,
      onProgress: options.onProgress
        ? (p) => options.onProgress!(p.progress / 100)
        : undefined,
    });
    return toUploadResult(result);
  }

  async uploadMultiple(
    uris: string[],
    options: UploadOptions,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    for (const uri of uris) {
      results.push(await this.uploadFile(uri, options));
    }
    return results;
  }

  async pickAndUploadImage(
    options: UploadOptions,
    pickOptions?: PickImageOptions,
  ): Promise<UploadResult | null> {
    const asset = await this.pickImage(pickOptions);
    if (!asset) return null;
    return this.uploadFile(asset.uri, options);
  }

  async takePhotoAndUpload(
    options: UploadOptions,
  ): Promise<UploadResult | null> {
    const asset = await this.pickImage({ source: "camera" });
    if (!asset) return null;
    return this.uploadFile(asset.uri, options);
  }

  async pickAndUploadDocument(
    options: UploadOptions,
    documentTypes?: string[],
  ): Promise<UploadResult | null> {
    const doc = await this.pickDocument(documentTypes);
    if (!doc) return null;
    return this.uploadFile(doc.uri, options);
  }

  // --------------------------------------------------------------------------
  // DELETE — uses apiFetch (token refresh + API key automatic)
  // --------------------------------------------------------------------------

  async deleteFile(
    fileUrl: string,
    _provider: StorageProvider = "local",
  ): Promise<void> {
    await del<void>("/api/v1/upload/file", {
      data: { url: fileUrl },
    });
  }

  // --------------------------------------------------------------------------
  // UTILITY HELPERS
  // --------------------------------------------------------------------------

  getExtension(uri: string): string {
    return uri.split(".").pop()?.toLowerCase() || "";
  }

  isImage(uri: string): boolean {
    return ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(
      this.getExtension(uri),
    );
  }

  isVideo(uri: string): boolean {
    return ["mp4", "mov", "avi", "webm"].includes(this.getExtension(uri));
  }

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
