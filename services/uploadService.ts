/**
 * File Upload Service
 * Handles image/document upload with progress tracking and compression
 */
import { ENV } from '@/config/env';
import { getToken } from '@/utils/storage';
import { Platform } from 'react-native';
import DocumentPicker, {
    DocumentPickerResponse,
    types,
} from 'react-native-document-picker';
import {
    Asset,
    ImagePickerResponse,
    launchCamera,
    launchImageLibrary,
} from 'react-native-image-picker';

// ============================================================================
// Types
// ============================================================================

export interface UploadOptions {
  maxSizeMB?: number;
  compressQuality?: number;
  multiple?: boolean;
  mediaType?: 'photo' | 'video' | 'mixed';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  urls?: string[];
  error?: string;
  fileId?: string;
  fileIds?: string[];
}

export interface FileMetadata {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

// ============================================================================
// Image Picker Functions
// ============================================================================

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (
  options: UploadOptions = {}
): Promise<Asset[] | null> => {
  try {
    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: options.mediaType || 'photo',
      quality: options.compressQuality || 0.8,
      maxWidth: 2048,
      maxHeight: 2048,
      selectionLimit: options.multiple ? 0 : 1, // 0 = unlimited
    });

    if (result.didCancel) {
      console.log('[Upload] User cancelled image picker');
      return null;
    }

    if (result.errorCode) {
      console.error('[Upload] Image picker error:', result.errorMessage);
      throw new Error(result.errorMessage);
    }

    return result.assets || null;
  } catch (error) {
    console.error('[Upload] Failed to pick image:', error);
    throw error;
  }
};

/**
 * Take photo with camera
 */
export const takePhoto = async (
  options: UploadOptions = {}
): Promise<Asset | null> => {
  try {
    const result: ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      quality: options.compressQuality || 0.8,
      maxWidth: 2048,
      maxHeight: 2048,
      saveToPhotos: true,
    });

    if (result.didCancel) {
      console.log('[Upload] User cancelled camera');
      return null;
    }

    if (result.errorCode) {
      console.error('[Upload] Camera error:', result.errorMessage);
      throw new Error(result.errorMessage);
    }

    return result.assets?.[0] || null;
  } catch (error) {
    console.error('[Upload] Failed to take photo:', error);
    throw error;
  }
};

/**
 * Pick document
 */
export const pickDocument = async (
  options: UploadOptions = {}
): Promise<DocumentPickerResponse[] | null> => {
  try {
    const result = await DocumentPicker.pick({
      type: [types.pdf, types.doc, types.docx, types.xls, types.xlsx, types.images],
      allowMultiSelection: options.multiple || false,
    });

    return result;
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      console.log('[Upload] User cancelled document picker');
      return null;
    }
    console.error('[Upload] Failed to pick document:', error);
    throw error;
  }
};

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Upload single file to server
 */
export const uploadFile = async (
  file: Asset | DocumentPickerResponse,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare form data
    const formData = new FormData();
    
    // Handle both Asset (image-picker) and DocumentPickerResponse (document-picker)
    const uri = 'uri' in file ? file.uri : file.uri;
    const name = 'fileName' in file ? file.fileName : file.name;
    const type = 'type' in file ? file.type : file.type;
    
    formData.append('file', {
      uri: Platform.OS === 'android' ? uri : uri?.replace('file://', ''),
      name: name || 'upload.jpg',
      type: type || 'image/jpeg',
    } as any);

    // Upload to backend
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
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
            resolve({
              success: true,
              url: response.url,
              fileId: response.id,
            });
          } catch (error) {
            reject(new Error('Invalid server response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send request
      xhr.open('POST', `${ENV.API_BASE_URL}/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('x-api-key', ENV.API_KEY);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('[Upload] Failed to upload file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (
  files: (Asset | DocumentPickerResponse)[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const results: string[] = [];
    const fileIds: string[] = [];
    let totalSize = 0;
    let uploadedSize = 0;

    // Calculate total size
    files.forEach((file) => {
      totalSize += ('fileSize' in file ? file.fileSize : file.size) || 0;
    });

    // Upload files sequentially
    for (const file of files) {
      const result = await uploadFile(file, (fileProgress) => {
        const currentProgress = uploadedSize + fileProgress.loaded;
        if (onProgress) {
          onProgress({
            loaded: currentProgress,
            total: totalSize,
            percentage: Math.round((currentProgress / totalSize) * 100),
          });
        }
      });

      if (result.success && result.url) {
        results.push(result.url);
        if (result.fileId) fileIds.push(result.fileId);
      }

      uploadedSize += ('fileSize' in file ? file.fileSize : file.size) || 0;
    }

    return {
      success: true,
      urls: results,
      fileIds,
    };
  } catch (error) {
    console.error('[Upload] Failed to upload multiple files:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * Upload image from gallery
 */
export const uploadImageFromGallery = async (
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const images = await pickImageFromGallery(options);
  if (!images || images.length === 0) {
    return { success: false, error: 'No image selected' };
  }

  if (options.multiple) {
    return uploadFiles(images, onProgress);
  } else {
    return uploadFile(images[0], onProgress);
  }
};

/**
 * Upload photo from camera
 */
export const uploadPhotoFromCamera = async (
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const photo = await takePhoto();
  if (!photo) {
    return { success: false, error: 'No photo taken' };
  }

  return uploadFile(photo, onProgress);
};

/**
 * Upload document
 */
export const uploadDocument = async (
  options: UploadOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const documents = await pickDocument(options);
  if (!documents || documents.length === 0) {
    return { success: false, error: 'No document selected' };
  }

  if (options.multiple) {
    return uploadFiles(documents, onProgress);
  } else {
    return uploadFile(documents[0], onProgress);
  }
};

/**
 * Delete uploaded file
 */
export const deleteFile = async (fileId: string): Promise<boolean> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${ENV.API_BASE_URL}/upload/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': ENV.API_KEY,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[Upload] Failed to delete file:', error);
    return false;
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (fileId: string): Promise<FileMetadata | null> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${ENV.API_BASE_URL}/upload/${fileId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': ENV.API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get file metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('[Upload] Failed to get file metadata:', error);
    return null;
  }
};
