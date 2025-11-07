// Storage and File Upload Service
// Handles file uploads with presigned URLs, caching, and progress tracking

import { handleApiError } from '../utils/errorHandler';
import { apiClient } from './enhancedApi';
import { storage } from './storage';

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  fileUrl: string;
}

export class StorageService {
  private readonly CACHE_PREFIX = 'file_upload_cache_';
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Upload file with presigned URL
  async uploadFile(
    file: FileInfo,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Check cache first
      const cachedUrl = await this.getCachedUpload(file);
      if (cachedUrl) {
        return cachedUrl;
      }

      // Get presigned URL
      const presignedData = await this.getPresignedUrl(file);
      
      // Upload to S3/storage
      const formData = new FormData();
      
      // Add fields from presigned response
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add file last (required by S3)
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      // Upload with progress tracking
      const response = await fetch(presignedData.url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      // Cache the result
      await this.cacheUpload(file, presignedData.fileUrl);
      
      return presignedData.fileUrl;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get presigned URL from backend
  private async getPresignedUrl(file: FileInfo): Promise<PresignedUrlResponse> {
    const response = await apiClient.post('/storage/presigned-url', {
      filename: file.name,
      contentType: file.type,
      size: file.size,
    });
    
    return response.data;
  }

  // Cache management
  private async getCachedUpload(file: FileInfo): Promise<string | null> {
    try {
      const cacheKey = this.getCacheKey(file);
      const cached = await storage.get(cacheKey);
      
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        if (now - timestamp < this.CACHE_EXPIRY) {
          return url;
        } else {
          // Expired cache
          await storage.remove(cacheKey);
        }
      }
    } catch (error) {
      console.warn('Failed to check upload cache:', error);
    }
    
    return null;
  }

  private async cacheUpload(file: FileInfo, url: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(file);
      const cacheData = {
        url,
        timestamp: Date.now(),
      };
      
      await storage.set(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache upload:', error);
    }
  }

  private getCacheKey(file: FileInfo): string {
    const key = `${file.name}_${file.size}_${file.type}`;
    return `${this.CACHE_PREFIX}${key}`;
  }

  // Clear expired cache entries
  async clearExpiredCache(): Promise<void> {
    // Note: This would need getAllKeys support in storage wrapper
    console.log('Cache cleanup not implemented for current storage wrapper');
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    // Note: This would need getAllKeys support in storage wrapper  
    console.log('Cache clear all not implemented for current storage wrapper');
  }
}

// Export singleton
export const storageService = new StorageService();
export default storageService;
