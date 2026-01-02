/**
 * Progress Photos Timeline Service
 * Manage construction progress photos with before/after comparisons
 */

import { BaseApiService } from './base.service';
import type { ApiResponse, PaginatedResponse } from './types';

// ==================== TYPES ====================

export type PhotoCategory = 
  | 'FOUNDATION'
  | 'STRUCTURE'
  | 'FRAMING'
  | 'ROOFING'
  | 'EXTERIOR'
  | 'INTERIOR'
  | 'MEP'
  | 'FINISHING'
  | 'LANDSCAPE'
  | 'OVERALL'
  | 'DEFECT'
  | 'OTHER';

export type PhotoPhase = 
  | 'PRE_CONSTRUCTION'
  | 'SITE_PREPARATION'
  | 'FOUNDATION'
  | 'STRUCTURE'
  | 'ENCLOSURE'
  | 'INTERIOR'
  | 'FINISHING'
  | 'COMPLETION'
  | 'POST_COMPLETION';

export interface ProgressPhoto {
  id: number;
  projectId: number;
  category: PhotoCategory;
  phase: PhotoPhase;
  location: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  width: number;
  height: number;
  capturedAt: string;
  uploadedBy: number;
  uploadedByName?: string;
  uploadedAt: string;
  tags: string[];
  notes?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  weather?: {
    temperature: number;
    condition: string;
  };
  comparisonGroupId?: number;
  metadata?: Record<string, any>;
}

export interface PhotoComparison {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  location: string;
  beforePhotoId: number;
  afterPhotoId: number;
  beforePhoto?: ProgressPhoto;
  afterPhoto?: ProgressPhoto;
  timeDifference?: number; // days
  createdBy: number;
  createdAt: string;
}

export interface PhotoTimeline {
  projectId: number;
  photos: TimelineGroup[];
  totalPhotos: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface TimelineGroup {
  date: string;
  photos: ProgressPhoto[];
  count: number;
  phases: PhotoPhase[];
  categories: PhotoCategory[];
}

export interface PhotoAnnotation {
  id: number;
  photoId: number;
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
  description?: string;
  color?: string;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
}

export interface CreatePhotoData {
  projectId: number;
  category: PhotoCategory;
  phase: PhotoPhase;
  location: string;
  description?: string;
  file: File | Blob;
  capturedAt?: string;
  tags?: string[];
  notes?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdatePhotoData {
  category?: PhotoCategory;
  phase?: PhotoPhase;
  location?: string;
  description?: string;
  tags?: string[];
  notes?: string;
}

export interface CreateComparisonData {
  projectId: number;
  name: string;
  description?: string;
  location: string;
  beforePhotoId: number;
  afterPhotoId: number;
}

export interface CreateAnnotationData {
  photoId: number;
  x: number;
  y: number;
  label: string;
  description?: string;
  color?: string;
}

export interface PhotoFilters {
  projectId?: number;
  category?: PhotoCategory;
  phase?: PhotoPhase;
  location?: string;
  tags?: string[];
  uploadedBy?: number;
  dateFrom?: string;
  dateTo?: string;
  hasAnnotations?: boolean;
  hasComparison?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'capturedAt' | 'uploadedAt' | 'location';
  sortOrder?: 'asc' | 'desc';
}

export interface TimelineFilters {
  projectId: number;
  dateFrom?: string;
  dateTo?: string;
  phase?: PhotoPhase;
  category?: PhotoCategory;
  location?: string;
  groupBy?: 'day' | 'week' | 'month';
}

// ==================== SERVICE ====================

class PhotoTimelineService extends BaseApiService {
  constructor() {
    super('PhotoTimeline', {
      retry: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
      },
      cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
      },
      offlineSupport: true,
    });
  }

  // ==================== PHOTOS ====================

  /**
   * Get photos with filters
   */
  async getPhotos(filters?: PhotoFilters): Promise<PaginatedResponse<ProgressPhoto>> {
    return this.get<PaginatedResponse<ProgressPhoto>>('/progress-photos', filters as any, {
      cache: true,
      deduplicate: true,
    });
  }

  /**
   * Get photo by ID
   */
  async getPhoto(id: number): Promise<ApiResponse<ProgressPhoto>> {
    return this.get<ApiResponse<ProgressPhoto>>(`/progress-photos/${id}`, undefined, {
      cache: true,
    });
  }

  /**
   * Upload progress photo
   */
  async uploadPhoto(data: CreatePhotoData): Promise<ApiResponse<ProgressPhoto>> {
    const formData = new FormData();
    formData.append('file', data.file as any);
    formData.append('projectId', data.projectId.toString());
    formData.append('category', data.category);
    formData.append('phase', data.phase);
    formData.append('location', data.location);
    
    if (data.description) formData.append('description', data.description);
    if (data.capturedAt) formData.append('capturedAt', data.capturedAt);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.notes) formData.append('notes', data.notes);
    if (data.coordinates) formData.append('coordinates', JSON.stringify(data.coordinates));

    const result = await this.post<ApiResponse<ProgressPhoto>>('/progress-photos', formData, {
      offlineQueue: false, // Don't queue photo uploads
    });

    await this.invalidateCache('/progress-photos');

    return result;
  }

  /**
   * Update photo metadata
   */
  async updatePhoto(id: number, data: UpdatePhotoData): Promise<ApiResponse<ProgressPhoto>> {
    const result = await this.put<ApiResponse<ProgressPhoto>>(`/progress-photos/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/progress-photos');
    await this.invalidateCache(`/progress-photos/${id}`);

    return result;
  }

  /**
   * Delete photo
   */
  async deletePhoto(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/progress-photos/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/progress-photos');

    return result;
  }

  // ==================== TIMELINE ====================

  /**
   * Get photo timeline
   */
  async getTimeline(filters: TimelineFilters): Promise<ApiResponse<PhotoTimeline>> {
    return this.get<ApiResponse<PhotoTimeline>>('/progress-photos/timeline', filters as any, {
      cache: true,
      deduplicate: true,
    });
  }

  /**
   * Get photos by date range
   */
  async getPhotosByDateRange(
    projectId: number,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ProgressPhoto[]>> {
    return this.get<ApiResponse<ProgressPhoto[]>>('/progress-photos/date-range', {
      projectId,
      startDate,
      endDate,
    }, {
      cache: true,
    });
  }

  /**
   * Get photos by location
   */
  async getPhotosByLocation(
    projectId: number,
    location: string
  ): Promise<ApiResponse<ProgressPhoto[]>> {
    return this.get<ApiResponse<ProgressPhoto[]>>('/progress-photos/by-location', {
      projectId,
      location,
    }, {
      cache: true,
    });
  }

  /**
   * Get photos by phase
   */
  async getPhotosByPhase(
    projectId: number,
    phase: PhotoPhase
  ): Promise<ApiResponse<ProgressPhoto[]>> {
    return this.get<ApiResponse<ProgressPhoto[]>>('/progress-photos/by-phase', {
      projectId,
      phase,
    }, {
      cache: true,
    });
  }

  // ==================== COMPARISONS ====================

  /**
   * Get comparisons for project
   */
  async getComparisons(projectId: number): Promise<ApiResponse<PhotoComparison[]>> {
    return this.get<ApiResponse<PhotoComparison[]>>('/progress-photos/comparisons', {
      projectId,
    }, {
      cache: true,
    });
  }

  /**
   * Get comparison by ID
   */
  async getComparison(id: number): Promise<ApiResponse<PhotoComparison>> {
    return this.get<ApiResponse<PhotoComparison>>(`/progress-photos/comparisons/${id}`, undefined, {
      cache: true,
    });
  }

  /**
   * Create before/after comparison
   */
  async createComparison(data: CreateComparisonData): Promise<ApiResponse<PhotoComparison>> {
    const result = await this.post<ApiResponse<PhotoComparison>>('/progress-photos/comparisons', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/progress-photos/comparisons');

    return result;
  }

  /**
   * Update comparison
   */
  async updateComparison(
    id: number,
    data: Partial<CreateComparisonData>
  ): Promise<ApiResponse<PhotoComparison>> {
    const result = await this.put<ApiResponse<PhotoComparison>>(
      `/progress-photos/comparisons/${id}`,
      data,
      { offlineQueue: true }
    );

    await this.invalidateCache('/progress-photos/comparisons');

    return result;
  }

  /**
   * Delete comparison
   */
  async deleteComparison(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/progress-photos/comparisons/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/progress-photos/comparisons');

    return result;
  }

  // ==================== ANNOTATIONS ====================

  /**
   * Get annotations for photo
   */
  async getAnnotations(photoId: number): Promise<ApiResponse<PhotoAnnotation[]>> {
    return this.get<ApiResponse<PhotoAnnotation[]>>(`/progress-photos/${photoId}/annotations`, undefined, {
      cache: false, // Don't cache annotations (real-time)
    });
  }

  /**
   * Create annotation
   */
  async createAnnotation(data: CreateAnnotationData): Promise<ApiResponse<PhotoAnnotation>> {
    return this.post<ApiResponse<PhotoAnnotation>>(
      `/progress-photos/${data.photoId}/annotations`,
      data,
      { offlineQueue: true }
    );
  }

  /**
   * Update annotation
   */
  async updateAnnotation(
    photoId: number,
    annotationId: number,
    data: Partial<CreateAnnotationData>
  ): Promise<ApiResponse<PhotoAnnotation>> {
    return this.put<ApiResponse<PhotoAnnotation>>(
      `/progress-photos/${photoId}/annotations/${annotationId}`,
      data,
      { offlineQueue: true }
    );
  }

  /**
   * Delete annotation
   */
  async deleteAnnotation(photoId: number, annotationId: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      `/progress-photos/${photoId}/annotations/${annotationId}`,
      { offlineQueue: true }
    );
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk upload photos
   */
  async bulkUpload(
    files: Array<{ file: File | Blob; data: Omit<CreatePhotoData, 'file'> }>
  ): Promise<ApiResponse<ProgressPhoto[]>> {
    const formData = new FormData();
    
    files.forEach((item, index) => {
      formData.append(`files[${index}]`, item.file as any);
      formData.append(`data[${index}]`, JSON.stringify(item.data));
    });

    const result = await this.post<ApiResponse<ProgressPhoto[]>>('/progress-photos/bulk-upload', formData, {
      offlineQueue: false,
    });

    await this.invalidateCache('/progress-photos');

    return result;
  }

  /**
   * Bulk delete photos
   */
  async bulkDelete(photoIds: number[]): Promise<ApiResponse<void>> {
    const result = await this.post<ApiResponse<void>>('/progress-photos/bulk-delete', { photoIds }, {
      offlineQueue: true,
    });

    await this.invalidateCache('/progress-photos');

    return result;
  }

  /**
   * Bulk update tags
   */
  async bulkUpdateTags(photoIds: number[], tags: string[]): Promise<ApiResponse<void>> {
    const result = await this.post<ApiResponse<void>>('/progress-photos/bulk-update-tags', {
      photoIds,
      tags,
    }, {
      offlineQueue: true,
    });

    await this.invalidateCache('/progress-photos');

    return result;
  }

  // ==================== SEARCH & ANALYTICS ====================

  /**
   * Search photos
   */
  async searchPhotos(query: string, filters?: PhotoFilters): Promise<PaginatedResponse<ProgressPhoto>> {
    return this.get<PaginatedResponse<ProgressPhoto>>('/progress-photos/search', {
      ...filters,
      q: query,
    } as any, {
      deduplicate: true,
    });
  }

  /**
   * Get locations for project
   */
  async getLocations(projectId: number): Promise<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>('/progress-photos/locations', { projectId }, {
      cache: true,
    });
  }

  /**
   * Get tags for project
   */
  async getTags(projectId: number): Promise<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>('/progress-photos/tags', { projectId }, {
      cache: true,
    });
  }

  /**
   * Get photo statistics
   */
  async getStatistics(projectId: number): Promise<ApiResponse<{
    totalPhotos: number;
    byCategory: Record<PhotoCategory, number>;
    byPhase: Record<PhotoPhase, number>;
    byMonth: Record<string, number>;
    topLocations: Array<{ location: string; count: number }>;
  }>> {
    return this.get<ApiResponse<any>>('/progress-photos/statistics', { projectId }, {
      cache: true,
    });
  }
}

// Export singleton instance
export const photoTimelineService = new PhotoTimelineService();
export default photoTimelineService;
