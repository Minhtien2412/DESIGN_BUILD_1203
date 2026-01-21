/**
 * Upload Service
 * Handles file upload endpoints
 * 
 * Endpoints:
 * - POST /upload/single - Upload single file
 * - POST /upload/multiple - Upload multiple files
 * - DELETE /upload/file - Delete file
 * - POST /upload/presigned-url - Get presigned URL for direct S3 upload
 */

import { apiClient } from './client';
import type {
    MultiUploadResponse,
    PresignedUrlResponse,
    UploadResponse,
} from './types';

export const uploadService = {
  /**
   * Upload single file
   * POST /upload/single
   */
  single: async (file: {
    uri: string;
    name?: string;
    type?: string;
  }): Promise<UploadResponse> => {
    console.log('[UploadService] 📤 Uploading file:', file.name);
    
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || file.uri.split('/').pop() || 'file',
      type: file.type || 'application/octet-stream',
    } as any);

    const response = await apiClient.post<UploadResponse>('/upload/single', formData);
    
    console.log('[UploadService] ✅ File uploaded:', response.url);
    return response;
  },

  /**
   * Upload multiple files
   * POST /upload/multiple
   */
  multiple: async (files: {
    uri: string;
    name?: string;
    type?: string;
  }[]): Promise<MultiUploadResponse> => {
    console.log('[UploadService] 📤 Uploading', files.length, 'files');
    
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', {
        uri: file.uri,
        name: file.name || `file-${index}`,
        type: file.type || 'application/octet-stream',
      } as any);
    });

    const response = await apiClient.post<MultiUploadResponse>('/upload/multiple', formData);
    
    console.log('[UploadService] ✅ Files uploaded:', response.files.length);
    return response;
  },

  /**
   * Delete uploaded file
   * DELETE /upload/file
   */
  delete: async (fileUrl: string): Promise<void> => {
    console.log('[UploadService] 🗑️ Deleting file:', fileUrl);
    
    await apiClient.delete('/upload/file', {
      body: JSON.stringify({ url: fileUrl }),
    });
    
    console.log('[UploadService] ✅ File deleted');
  },

  /**
   * Get presigned URL for direct S3 upload
   * POST /upload/presigned-url
   */
  getPresignedUrl: async (filename: string, contentType: string): Promise<PresignedUrlResponse> => {
    console.log('[UploadService] 🔗 Getting presigned URL for:', filename);
    
    const response = await apiClient.post<PresignedUrlResponse>('/upload/presigned-url', {
      filename,
      contentType,
    });
    
    console.log('[UploadService] ✅ Presigned URL generated');
    return response;
  },

  /**
   * Helper: Upload image from local URI
   */
  uploadImage: async (imageUri: string): Promise<UploadResponse> => {
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    return uploadService.single({
      uri: imageUri,
      name: filename,
      type,
    });
  },

  /**
   * Helper: Upload document from local URI
   */
  uploadDocument: async (documentUri: string, name?: string): Promise<UploadResponse> => {
    const filename = name || documentUri.split('/').pop() || 'document.pdf';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `application/${match[1]}` : 'application/octet-stream';

    return uploadService.single({
      uri: documentUri,
      name: filename,
      type,
    });
  },
};

export default uploadService;
