/**
 * Avatar Service
 * ==============
 *
 * Service chuyên biệt để upload avatar:
 * - Upload ảnh lên server
 * - Tự động xóa ảnh cũ khi upload ảnh mới
 * - Compress và resize ảnh trước khi upload
 * - Hỗ trợ chọn từ Gallery hoặc Camera
 *
 * @author ThietKeResort Team
 * @created 2026-01-09
 */

import { ENV } from "@/config/env";
import { del } from "@/services/api";
import { getToken } from "@/utils/storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

// Re-export types for compatibility
export interface Asset {
  uri?: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
  width?: number;
  height?: number;
}

// ============================================================================
// Types
// ============================================================================

export interface AvatarUploadOptions {
  maxSizeMB?: number;
  compressQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface AvatarUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  oldAvatarDeleted?: boolean;
  thumbnailUrl?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OPTIONS: AvatarUploadOptions = {
  maxSizeMB: 2,
  compressQuality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
};

const AVATAR_ENDPOINT = "/upload/avatar";
const DELETE_AVATAR_ENDPOINT = "/upload/avatar";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate image file
 */
const validateImage = (
  asset: Asset,
  options: AvatarUploadOptions,
): string | null => {
  // Check file size
  const maxBytes = (options.maxSizeMB || 2) * 1024 * 1024;
  if (asset.fileSize && asset.fileSize > maxBytes) {
    return `Ảnh quá lớn. Tối đa ${options.maxSizeMB}MB`;
  }

  // Check file type
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (asset.type && !validTypes.includes(asset.type)) {
    return "Chỉ hỗ trợ định dạng JPG, PNG, WEBP";
  }

  return null;
};

/**
 * Generate form data for upload
 */
const createFormData = (asset: Asset): FormData => {
  const formData = new FormData();

  const uri =
    Platform.OS === "android" ? asset.uri : asset.uri?.replace("file://", "");

  formData.append("avatar", {
    uri: uri,
    name: asset.fileName || `avatar_${Date.now()}.jpg`,
    type: asset.type || "image/jpeg",
  } as any);

  return formData;
};

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Pick avatar from gallery (using expo-image-picker)
 */
export const pickAvatarFromGallery = async (
  options: AvatarUploadOptions = {},
): Promise<Asset | null> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Cần quyền truy cập thư viện ảnh");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: mergedOptions.compressQuality,
      allowsEditing: true,
      aspect: [1, 1], // Square avatar
    });

    if (result.canceled) {
      console.log("[AvatarService] User cancelled picker");
      return null;
    }

    const imageAsset = result.assets?.[0];
    if (!imageAsset) {
      return null;
    }

    // Convert to our Asset format
    const asset: Asset = {
      uri: imageAsset.uri,
      fileName: imageAsset.fileName || `avatar_${Date.now()}.jpg`,
      fileSize: imageAsset.fileSize,
      type: imageAsset.mimeType || "image/jpeg",
      width: imageAsset.width,
      height: imageAsset.height,
    };

    // Validate
    const error = validateImage(asset, mergedOptions);
    if (error) {
      throw new Error(error);
    }

    return asset;
  } catch (error) {
    console.error("[AvatarService] Failed to pick image:", error);
    throw error;
  }
};

/**
 * Take photo with camera for avatar (using expo-image-picker)
 */
export const takeAvatarPhoto = async (
  options: AvatarUploadOptions = {},
): Promise<Asset | null> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Cần quyền truy cập camera");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: mergedOptions.compressQuality,
      allowsEditing: true,
      aspect: [1, 1], // Square avatar
      cameraType: ImagePicker.CameraType.front,
    });

    if (result.canceled) {
      console.log("[AvatarService] User cancelled camera");
      return null;
    }

    const imageAsset = result.assets?.[0];
    if (!imageAsset) {
      return null;
    }

    // Convert to our Asset format
    const asset: Asset = {
      uri: imageAsset.uri,
      fileName: imageAsset.fileName || `avatar_${Date.now()}.jpg`,
      fileSize: imageAsset.fileSize,
      type: imageAsset.mimeType || "image/jpeg",
      width: imageAsset.width,
      height: imageAsset.height,
    };

    // Validate
    const error = validateImage(asset, mergedOptions);
    if (error) {
      throw new Error(error);
    }

    return asset;
  } catch (error) {
    console.error("[AvatarService] Failed to take photo:", error);
    throw error;
  }
};

/**
 * Upload avatar to server
 * Server sẽ tự động xóa avatar cũ
 */
export const uploadAvatar = async (
  asset: Asset,
  onProgress?: (progress: AvatarUploadProgress) => void,
): Promise<AvatarUploadResult> => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: "Vui lòng đăng nhập để thay đổi avatar" };
    }

    const fileUri = asset.uri;
    if (!fileUri) {
      return { success: false, error: "No file URI" };
    }

    const uploadUrl = `${ENV.API_BASE_URL}${AVATAR_ENDPOINT}`;
    console.log("[AvatarService] Uploading to:", uploadUrl);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "x-api-key": ENV.API_KEY,
    };

    let status: number;
    let body: string;

    // Native upload with progress tracking
    if (
      Platform.OS !== "web" &&
      typeof (FileSystem as any).createUploadResumable === "function"
    ) {
      const task = (FileSystem as any).createUploadResumable(
        fileUri,
        uploadUrl,
        {
          httpMethod: "POST",
          uploadType: (FileSystem as any).FileSystemUploadType.MULTIPART,
          fieldName: "avatar",
          mimeType: asset.type || "image/jpeg",
          headers,
        },
        (data: any) => {
          const total = data.totalBytesExpectedToSend ?? 0;
          const sent = data.totalBytesSent ?? 0;
          if (onProgress && total > 0) {
            onProgress({
              loaded: sent,
              total,
              percentage: Math.round((sent / total) * 100),
            });
          }
        },
      );
      const result = await task.uploadAsync();
      if (!result) {
        return { success: false, error: "Upload bị hủy" };
      }
      status = result.status;
      body = result.body;
    } else {
      // Web fallback (no progress tracking)
      const formData = createFormData(asset);
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers,
        body: formData,
      });
      status = response.status;
      body = await response.text();
    }

    if (status >= 200 && status < 300) {
      try {
        const data = JSON.parse(body);
        console.log("[AvatarService] Upload success:", data);
        return {
          success: true,
          url: data.url || data.avatar,
          thumbnailUrl: data.thumbnailUrl || data.avatarThumbnail,
          oldAvatarDeleted: data.oldAvatarDeleted !== false,
        };
      } catch {
        return { success: false, error: "Invalid server response" };
      }
    }

    let errorMsg = "Upload thất bại";
    try {
      const errData = JSON.parse(body);
      errorMsg = errData.message || errData.error || errorMsg;
    } catch {}
    console.error("[AvatarService] Upload failed:", status, errorMsg);
    return { success: false, error: errorMsg };
  } catch (error) {
    console.error("[AvatarService] Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload thất bại",
    };
  }
};

/**
 * Delete current avatar
 */
export const deleteAvatar = async (): Promise<AvatarUploadResult> => {
  try {
    await del(DELETE_AVATAR_ENDPOINT);
    console.log("[AvatarService] Avatar deleted");
    return { success: true };
  } catch (error) {
    console.error("[AvatarService] Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Xóa avatar thất bại",
    };
  }
};

/**
 * Pick and upload avatar (convenience function)
 * Chọn ảnh từ gallery và upload luôn
 */
export const pickAndUploadAvatar = async (
  source: "gallery" | "camera" = "gallery",
  options: AvatarUploadOptions = {},
  onProgress?: (progress: AvatarUploadProgress) => void,
): Promise<AvatarUploadResult> => {
  try {
    // Pick image
    const asset =
      source === "camera"
        ? await takeAvatarPhoto(options)
        : await pickAvatarFromGallery(options);

    if (!asset) {
      return { success: false, error: "Không có ảnh được chọn" };
    }

    // Upload
    return await uploadAvatar(asset, onProgress);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Thao tác thất bại",
    };
  }
};

// ============================================================================
// Export
// ============================================================================

export default {
  pickFromGallery: pickAvatarFromGallery,
  takePhoto: takeAvatarPhoto,
  upload: uploadAvatar,
  delete: deleteAvatar,
  pickAndUpload: pickAndUploadAvatar,
};
