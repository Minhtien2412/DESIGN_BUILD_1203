/**
 * File Upload Service - Tận dụng Multer + S3 từ backend
 * Hỗ trợ: Avatar, Documents, Project Files, Construction Photos
 */

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from './api';

export type UploadType = 'avatar' | 'document' | 'project' | 'construction-photo' | 'blueprint';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  thumbnail_url?: string;
  file_id?: string;
  message?: string;
}

/**
 * Upload Avatar với progress callback
 */
export async function uploadAvatar(
  uri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await apiFetch('/profile/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      url: response.data.avatar_url,
      thumbnail_url: response.data.thumbnail_url,
    };
  } catch (error: any) {
    console.error('[FileUpload] Avatar upload failed:', error);
    return {
      success: false,
      message: error.message || 'Upload thất bại',
    };
  }
}

/**
 * Pick và upload document (PDF, DOC, Excel)
 */
export async function pickAndUploadDocument(
  projectId?: string
): Promise<UploadResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, message: 'Đã hủy chọn file' };
    }

    const file = result.assets[0];
    const formData = new FormData();
    
    formData.append('document', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as any);

    if (projectId) {
      formData.append('projectId', projectId);
    }

    const response = await apiFetch('/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      url: response.data.document_url,
      file_id: response.data.id,
    };
  } catch (error: any) {
    console.error('[FileUpload] Document upload failed:', error);
    return {
      success: false,
      message: error.message || 'Upload tài liệu thất bại',
    };
  }
}

/**
 * Chụp và upload ảnh công trường
 */
export async function captureAndUploadConstructionPhoto(
  projectId: string,
  metadata?: {
    location?: string;
    description?: string;
    tags?: string[];
  }
): Promise<UploadResult> {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permission.granted) {
      return { success: false, message: 'Cần quyền truy cập camera' };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
      exif: true, // Lấy GPS và metadata
    });

    if (result.canceled) {
      return { success: false, message: 'Đã hủy chụp ảnh' };
    }

    const photo = result.assets[0];
    const formData = new FormData();
    
    formData.append('photo', {
      uri: photo.uri,
      name: `construction_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);

    formData.append('projectId', projectId);
    
    if (metadata?.location) formData.append('location', metadata.location);
    if (metadata?.description) formData.append('description', metadata.description);
    if (metadata?.tags) formData.append('tags', JSON.stringify(metadata.tags));

    // Thêm GPS nếu có
    if (photo.exif?.GPSLatitude && photo.exif?.GPSLongitude) {
      formData.append('gps', JSON.stringify({
        lat: photo.exif.GPSLatitude,
        lng: photo.exif.GPSLongitude,
      }));
    }

    const response = await apiFetch('/projects/photos/upload', {
      method: 'POST',
      body: formData,
    });

    return {
      success: true,
      url: response.data.photo_url,
      thumbnail_url: response.data.thumbnail_url,
      file_id: response.data.id,
    };
  } catch (error: any) {
    console.error('[FileUpload] Construction photo upload failed:', error);
    return {
      success: false,
      message: error.message || 'Upload ảnh thất bại',
    };
  }
}

/**
 * Upload multiple files (batch)
 */
export async function uploadMultipleFiles(
  files: Array<{ uri: string; name: string; type: string }>,
  uploadType: UploadType,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
      formData.append('type', uploadType);

      const response = await apiFetch('/files/upload', {
        method: 'POST',
        body: formData,
      });

      results.push({
        success: true,
        url: response.data.url,
        file_id: response.data.id,
      });
    } catch (error: any) {
      results.push({
        success: false,
        message: error.message || 'Upload thất bại',
      });
    }
  }

  return results;
}

/**
 * Delete uploaded file
 */
export async function deleteUploadedFile(fileId: string): Promise<boolean> {
  try {
    await apiFetch(`/files/${fileId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('[FileUpload] Delete failed:', error);
    return false;
  }
}

/**
 * Get file info
 */
export async function getFileInfo(fileId: string): Promise<any> {
  try {
    const response = await apiFetch(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('[FileUpload] Get file info failed:', error);
    return null;
  }
}

export default {
  uploadAvatar,
  pickAndUploadDocument,
  captureAndUploadConstructionPhoto,
  uploadMultipleFiles,
  deleteUploadedFile,
  getFileInfo,
};
