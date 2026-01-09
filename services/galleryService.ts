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
    if (result.data) {
      // Transform Perfex project attachments to gallery format
      // Note: This depends on Perfex CRM project structure
      const project = result.data;
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

// Mock data fallback
export const MOCK_PHOTOS: GalleryPhoto[] = [
  {
    id: 'photo1',
    url: 'https://placehold.co/800x600/0066CC/white?text=Khung+Sắt',
    thumbnail: 'https://placehold.co/200x150/0066CC/white?text=Khung+Sắt',
    caption: 'Hoàn thành khung sắt tầng 1',
    uploadedAt: '2025-01-10T08:30:00Z',
    uploadedBy: 'Kỹ sư Minh',
    phase: 'Móng & khung',
    tags: ['khung-sat', 'tang-1'],
  },
  {
    id: 'photo2',
    url: 'https://placehold.co/800x600/28a745/white?text=Đổ+Bê+Tông',
    thumbnail: 'https://placehold.co/200x150/28a745/white?text=Đổ+Bê+Tông',
    caption: 'Đổ bê tông sàn tầng 2',
    uploadedAt: '2025-01-08T14:20:00Z',
    uploadedBy: 'Đội trưởng Hùng',
    phase: 'Bê tông',
    tags: ['be-tong', 'san', 'tang-2'],
  },
  {
    id: 'photo3',
    url: 'https://placehold.co/800x600/ffc107/black?text=Hệ+Thống+Điện',
    thumbnail: 'https://placehold.co/200x150/ffc107/black?text=Hệ+Thống+Điện',
    caption: 'Lắp đặt hệ thống điện',
    uploadedAt: '2025-01-05T10:00:00Z',
    uploadedBy: 'Thợ điện Tuấn',
    phase: 'M&E',
    tags: ['dien', 'he-thong'],
  },
  {
    id: 'photo4',
    url: 'https://placehold.co/800x600/dc3545/white?text=Ốp+Tường',
    thumbnail: 'https://placehold.co/200x150/dc3545/white?text=Ốp+Tường',
    caption: 'Ốp gạch tường phòng khách',
    uploadedAt: '2025-01-02T16:45:00Z',
    uploadedBy: 'Thợ xây Bình',
    phase: 'Hoàn thiện',
    tags: ['op-tuong', 'gach', 'phong-khach'],
  },
  {
    id: 'photo5',
    url: 'https://placehold.co/800x600/6f42c1/white?text=Sơn+Ngoại+Thất',
    thumbnail: 'https://placehold.co/200x150/6f42c1/white?text=Sơn+Ngoại+Thất',
    caption: 'Sơn ngoại thất hoàn thiện',
    uploadedAt: '2024-12-28T11:30:00Z',
    uploadedBy: 'Thợ sơn Đức',
    phase: 'Hoàn thiện',
    tags: ['son', 'ngoai-that'],
  },
  {
    id: 'photo6',
    url: 'https://placehold.co/800x600/17a2b8/white?text=Toàn+Cảnh',
    thumbnail: 'https://placehold.co/200x150/17a2b8/white?text=Toàn+Cảnh',
    caption: 'Tổng quan công trình sau 3 tháng',
    uploadedAt: '2024-12-25T09:00:00Z',
    uploadedBy: 'Giám sát Tùng',
    phase: 'Tổng quan',
    tags: ['tong-quan', 'progress'],
  },
];

export default {
  getProjectPhotos,
  getProjectPhotosFromPerfex,
  uploadPhoto,
  deletePhoto,
  bulkDeletePhotos,
  MOCK_PHOTOS,
};
