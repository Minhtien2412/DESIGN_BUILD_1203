/**
 * useFileUpload Hook
 * Handles file uploads to the backend API with progress tracking
 */

import { apiFetch } from '@/services/api';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export interface UploadOptions {
  category?: 'general' | 'projects' | 'profiles' | 'documents';
  description?: string;
  tags?: string[];
}

export interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  category: string;
  publicUrl: string;
  storageType: 'local' | 'gcs';
  uploadedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Pick image from gallery
   */
  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        throw new Error('Permission to access gallery is required');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick image');
      return null;
    }
  };

  /**
   * Take photo with camera
   */
  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        throw new Error('Permission to access camera is required');
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to take photo');
      return null;
    }
  };

  /**
   * Pick document (PDF, etc.)
   */
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick document');
      return null;
    }
  };

  /**
   * Upload file to server
   */
  const uploadFile = async (
    uri: string,
    options: UploadOptions = {}
  ): Promise<UploadedFile | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get file info
      const filename = uri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri,
        type,
        name: filename,
      } as any);

      if (options.category) {
        formData.append('category', options.category);
      }

      if (options.description) {
        formData.append('description', options.description);
      }

      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      });

      // Wrap XHR in Promise
      const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve(response.file);
              } else {
                reject(new Error(response.message || 'Upload failed'));
              }
            } catch (err) {
              reject(new Error('Invalid server response'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Upload timeout'));
      });

      // Start upload
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.thietkeresort.com.vn';
      xhr.open('POST', `${apiUrl}/api/upload`);
      
      // Add auth token from storage
      const token = await getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.setRequestHeader('x-api-key', 'thietke-resort-api-key-2024');
      
      xhr.send(formData);

      const result = await uploadPromise;
      setProgress(100);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Upload multiple files
   */
  const uploadMultiple = async (
    uris: string[],
    options: UploadOptions = {}
  ): Promise<UploadedFile[]> => {
    const results: UploadedFile[] = [];
    
    for (let i = 0; i < uris.length; i++) {
      const result = await uploadFile(uris[i], options);
      if (result) {
        results.push(result);
      }
    }

    return results;
  };

  /**
   * Delete file from server
   */
  const deleteFile = async (fileId: number): Promise<boolean> => {
    try {
      const response = await apiFetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      return response.success === true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      return false;
    }
  };

  /**
   * Get auth token from storage
   */
  const getAuthToken = async (): Promise<string | null> => {
    try {
      // Import dynamically to avoid circular dependencies
      const { getItem } = await import('@/utils/storage');
      return await getItem('auth_token');
    } catch {
      return null;
    }
  };

  return {
    // State
    uploading,
    progress,
    error,

    // Methods
    pickImage,
    takePhoto,
    pickDocument,
    uploadFile,
    uploadMultiple,
    deleteFile,

    // Utilities
    clearError: () => setError(null),
  };
}
