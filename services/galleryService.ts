/**
 * Gallery Service
 * Handle project gallery/photos related API calls
 * Works with both Backend API and Perfex CRM
 */

import { BackendResult, deleteReq, getJson, postJson } from './backendClient';
import { PerfexProjectsService } from './perfexCRM';

// Types
export interface GalleryPhoto {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy?: string;
  projectId?: string;
  phase?: string;
  tags?: string[];
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface GalleryListResponse {
  photos: GalleryPhoto[];
  total: number;
}

export interface UploadPhotoInput {
  projectId: string;
  image: string; // Base64 encoded
  caption?: string;
  phase?: string;
  tags?: string[];
}

// API Endpoints
const ENDPOINTS = {
  projectPhotos: (projectId: string) => `/api/projects/${projectId}/gallery`,
  upload: '/api/gallery/upload',
  delete: (photoId: string) => `/api/gallery/${photoId}`,
  bulkDelete: '/api/gallery/bulk-delete',
};

/**
 * Get photos for a specific project
 */
export async function getProjectPhotos(
  projectId: string,
  page = 1,
  limit = 50
): Promise<BackendResult<GalleryListResponse>> {
  return getJson<GalleryListResponse>(ENDPOINTS.projectPhotos(projectId), {
    query: { page, limit },
    retry: 2,
  });
}

/**
 * Try to get photos from Perfex CRM project files
 * Fallback method using Perfex API
 */
export async function getProjectPhotosFromPerfex(
  projectId: string
): Promise<GalleryPhoto[]> {
  try {
    // Get project details which may include files/attachments
    const result = await PerfexProjectsService.getById(projectId);
    if ((result as any).ok && (result as any).data) {
      // Transform Perfex project attachments to gallery format
      // Note: This depends on Perfex CRM project structure
      const project = (result as any).data;
      const photos: GalleryPhoto[] = [];
      
      // If project has files array (common in Perfex)
      // @ts-ignore - Perfex may have different structure
      if (project.files && Array.isArray(project.files)) {
        // @ts-ignore
        project.files.forEach((file: any, index: number) => {
          if (isImageFile(file.file_name || file.name)) {
            photos.push({
              id: file.id?.toString() || `file-${index}`,
              url: file.url || file.file_url || '',
              thumbnail: file.thumbnail || file.url || file.file_url || '',
              caption: file.description || file.file_name || '',
              uploadedAt: file.dateadded || file.created_at || new Date().toISOString(),
              uploadedBy: file.staffid?.toString() || 'staff',
              projectId: projectId,
            });
          }
        });
      }
      
      return photos;
    }
    return [];
  } catch (error) {
    console.error('Error fetching photos from Perfex:', error);
    return [];
  }
}

/**
 * Check if file is an image based on extension
 */
function isImageFile(fileName: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const ext = fileName?.toLowerCase().slice(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

/**
 * Upload a photo to project gallery
 */
export async function uploadPhoto(
  input: UploadPhotoInput
): Promise<BackendResult<GalleryPhoto>> {
  return postJson<GalleryPhoto>(ENDPOINTS.upload, input);
}

/**
 * Delete a photo from gallery
 */
export async function deletePhoto(
  photoId: string
): Promise<BackendResult<{ success: boolean }>> {
  return deleteReq(ENDPOINTS.delete(photoId));
}

/**
 * Delete multiple photos
 */
export async function bulkDeletePhotos(
  photoIds: string[]
): Promise<BackendResult<{ success: boolean; deleted: number }>> {
  return postJson(ENDPOINTS.bulkDelete, { photoIds });
}

// Empty photos array - data comes from API/CRM only
export const MOCK_PHOTOS: GalleryPhoto[] = [];

export default {
  getProjectPhotos,
  getProjectPhotosFromPerfex,
  uploadPhoto,
  deletePhoto,
  bulkDeletePhotos,
  MOCK_PHOTOS,
};

