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

import { ENV } from '@/config/env';
import { getToken } from '@/utils/storage';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

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

const AVATAR_ENDPOINT = '/upload/avatar';
const DELETE_AVATAR_ENDPOINT = '/upload/avatar';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate image file
 */
const validateImage = (asset: Asset, options: AvatarUploadOptions): string | null => {
  // Check file size
  const maxBytes = (options.maxSizeMB || 2) * 1024 * 1024;
  if (asset.fileSize && asset.fileSize > maxBytes) {
    return `Ảnh quá lớn. Tối đa ${options.maxSizeMB}MB`;
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (asset.type && !validTypes.includes(asset.type)) {
    return 'Chỉ hỗ trợ định dạng JPG, PNG, WEBP';
  }
  
  return null;
};

/**
 * Generate form data for upload
 */
const createFormData = (asset: Asset): FormData => {
  const formData = new FormData();
  
  const uri = Platform.OS === 'android' 
    ? asset.uri 
    : asset.uri?.replace('file://', '');
  
  formData.append('avatar', {
    uri: uri,
    name: asset.fileName || `avatar_${Date.now()}.jpg`,
    type: asset.type || 'image/jpeg',
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
  options: AvatarUploadOptions = {}
): Promise<Asset | null> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Cần quyền truy cập thư viện ảnh');
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: mergedOptions.compressQuality,
      allowsEditing: true,
      aspect: [1, 1], // Square avatar
    });

    if (result.canceled) {
      console.log('[AvatarService] User cancelled picker');
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
      type: imageAsset.mimeType || 'image/jpeg',
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
    console.error('[AvatarService] Failed to pick image:', error);
    throw error;
  }
};

/**
 * Take photo with camera for avatar (using expo-image-picker)
 */
export const takeAvatarPhoto = async (
  options: AvatarUploadOptions = {}
): Promise<Asset | null> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Cần quyền truy cập camera');
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: mergedOptions.compressQuality,
      allowsEditing: true,
      aspect: [1, 1], // Square avatar
      cameraType: ImagePicker.CameraType.front,
    });

    if (result.canceled) {
      console.log('[AvatarService] User cancelled camera');
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
      type: imageAsset.mimeType || 'image/jpeg',
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
    console.error('[AvatarService] Failed to take photo:', error);
    throw error;
  }
};

/**
 * Upload avatar to server
 * Server sẽ tự động xóa avatar cũ
 */
export const uploadAvatar = async (
  asset: Asset,
  onProgress?: (progress: AvatarUploadProgress) => void
): Promise<AvatarUploadResult> => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Vui lòng đăng nhập để thay đổi avatar' };
    }

    const formData = createFormData(asset);
    
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('[AvatarService] Upload success:', response);
            resolve({
              success: true,
              url: response.url || response.avatar,
              thumbnailUrl: response.thumbnailUrl || response.avatarThumbnail,
              oldAvatarDeleted: response.oldAvatarDeleted !== false,
            });
          } catch {
            resolve({ success: false, error: 'Invalid server response' });
          }
        } else {
          let errorMsg = 'Upload thất bại';
          try {
            const errResponse = JSON.parse(xhr.responseText);
            errorMsg = errResponse.message || errResponse.error || errorMsg;
          } catch {}
          console.error('[AvatarService] Upload failed:', xhr.status, errorMsg);
          resolve({ success: false, error: errorMsg });
        }
      });

      xhr.addEventListener('error', () => {
        console.error('[AvatarService] Network error');
        resolve({ success: false, error: 'Lỗi kết nối. Vui lòng kiểm tra mạng.' });
      });

      xhr.addEventListener('abort', () => {
        resolve({ success: false, error: 'Upload bị hủy' });
      });

      // Send request
      const uploadUrl = `${ENV.API_BASE_URL}${AVATAR_ENDPOINT}`;
      console.log('[AvatarService] Uploading to:', uploadUrl);
      
      xhr.open('POST', uploadUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('x-api-key', ENV.API_KEY);
      // Don't set Content-Type for FormData - browser/RN will set with boundary
      xhr.send(formData);
    });
  } catch (error) {
    console.error('[AvatarService] Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload thất bại',
    };
  }
};

/**
 * Delete current avatar
 */
export const deleteAvatar = async (): Promise<AvatarUploadResult> => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const response = await fetch(`${ENV.API_BASE_URL}${DELETE_AVATAR_ENDPOINT}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': ENV.API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('[AvatarService] Avatar deleted');
      return { success: true };
    } else {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.message || 'Xóa avatar thất bại' };
    }
  } catch (error) {
    console.error('[AvatarService] Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Xóa avatar thất bại',
    };
  }
};

/**
 * Pick and upload avatar (convenience function)
 * Chọn ảnh từ gallery và upload luôn
 */
export const pickAndUploadAvatar = async (
  source: 'gallery' | 'camera' = 'gallery',
  options: AvatarUploadOptions = {},
  onProgress?: (progress: AvatarUploadProgress) => void
): Promise<AvatarUploadResult> => {
  try {
    // Pick image
    const asset = source === 'camera'
      ? await takeAvatarPhoto(options)
      : await pickAvatarFromGallery(options);
    
    if (!asset) {
      return { success: false, error: 'Không có ảnh được chọn' };
    }

    // Upload
    return await uploadAvatar(asset, onProgress);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Thao tác thất bại',
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
