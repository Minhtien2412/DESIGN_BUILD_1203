// @ts-nocheck
/**
 * Enhanced Project API Service with Smart Error Handling
 * Kết hợp security measures với error handling thông minh
 * Compatible với existing ConstructionProject structure
 */

import { ConstructionProject, ProjectStatus, ProjectType } from '../types/construction';
import { apiFetch } from './api';
import { ApiErrorContext, apiErrorHandler } from './apiErrorHandler';

export interface ProjectApiResponse<T> {
  data: T;
  source: 'api' | 'fallback' | 'cache';
  error?: ApiErrorContext;
  recommendations?: string[];
}

export interface ProjectFilters {
  project_type?: ProjectType;
  status?: ProjectStatus;
  budgetRange?: { min: number; max: number };
  location?: string;
  owner_id?: string;
}

class EnhancedProjectApiService {
  private cache = new Map<string, { data: any; timestamp: number; classification: 'public' | 'confidential' | 'restricted' }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Lấy danh sách projects với smart error handling
  async getProjects(filters?: ProjectFilters): Promise<ProjectApiResponse<ConstructionProject[]>> {
    const cacheKey = `projects_${JSON.stringify(filters || {})}`;
    
    try {
      console.log('[ProjectAPI] 🔄 Fetching projects with filters:', filters);
      
      // Thử kết nối API với smart retry
      const apiData = await apiErrorHandler.smartRetry(
        () => apiFetch('/construction-projects', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        '/construction-projects',
        'GET'
      ) as ConstructionProject[];

      // Cache dữ liệu public
      this.setCacheWithClassification(cacheKey, apiData, 'public');
      
      console.log('[ProjectAPI] ✅ Successfully fetched projects from API');
      return {
        data: this.applyFilters(apiData, filters),
        source: 'api'
      };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/construction-projects', 'GET');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[ProjectAPI] 🔄 API failed, trying fallback data...');
      
      // Kiểm tra cache trước
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('[ProjectAPI] ✅ Using cached data');
        return {
          data: this.applyFilters(cachedData, filters),
          source: 'cache',
          error: errorContext,
          recommendations
        };
      }

      // Sử dụng fallback data
      const fallbackData = this.getFallbackProjects();
      console.log('[ProjectAPI] ✅ Using fallback data');
      
      return {
        data: this.applyFilters(fallbackData, filters),
        source: 'fallback',
        error: errorContext,
        recommendations
      };
    }
  }

  // Lấy chi tiết project (cần auth cho sensitive data)
  async getProjectDetails(id: string): Promise<ProjectApiResponse<ConstructionProject | null>> {
    const cacheKey = `project_${id}`;
    
    try {
      console.log(`[ProjectAPI] 🔄 Fetching project details for ID: ${id}`);
      
      const apiData = await apiErrorHandler.smartRetry(
        () => apiFetch(`/construction-projects/${id}`),
        `/construction-projects/${id}`,
        'GET'
      ) as ConstructionProject;

      // Chỉ cache public data
      const publicData = this.sanitizeProjectForCache(apiData);
      this.setCacheWithClassification(cacheKey, publicData, 'public');
      
      console.log('[ProjectAPI] ✅ Successfully fetched project details from API');
      return {
        data: apiData,
        source: 'api'
      };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, `/construction-projects/${id}`, 'GET');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[ProjectAPI] 🔄 API failed, checking fallback...');
      
      // Kiểm tra cache
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('[ProjectAPI] ✅ Using cached project details');
        return {
          data: cachedData,
          source: 'cache',
          error: errorContext,
          recommendations
        };
      }

      // Fallback data
      const fallbackProject = this.getFallbackProjectById(id);
      if (fallbackProject) {
        console.log('[ProjectAPI] ✅ Using fallback project details');
        return {
          data: fallbackProject,
          source: 'fallback',
          error: errorContext,
          recommendations
        };
      }

      console.log('[ProjectAPI] ❌ No data available for project:', id);
      return {
        data: null,
        source: 'fallback',
        error: errorContext,
        recommendations
      };
    }
  }

  // Tạo project mới (cần auth)
  async createProject(projectData: Partial<ConstructionProject>): Promise<ProjectApiResponse<ConstructionProject>> {
    try {
      console.log('[ProjectAPI] 🔄 Creating new project...');
      
      // Sanitize sensitive data trước khi gửi
      const sanitizedData = this.sanitizeProjectData(projectData);
      
      const newProject = await apiErrorHandler.smartRetry(
        () => apiFetch('/construction-projects', {
          method: 'POST',
          body: JSON.stringify(sanitizedData),
          headers: { 'Content-Type': 'application/json' }
        }),
        '/construction-projects',
        'POST'
      ) as ConstructionProject;

      console.log('[ProjectAPI] ✅ Successfully created project');
      
      // Invalidate cache
      this.invalidateProjectCache();
      
      return {
        data: newProject,
        source: 'api'
      };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/construction-projects', 'POST');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[ProjectAPI] ❌ Failed to create project');
      
      // Trong trường hợp này, không có fallback vì create operation
      throw {
        error: errorContext,
        recommendations,
        userMessage: apiErrorHandler.getUserFriendlyMessage(errorContext)
      };
    }
  }

  // Upload file cho project
  async uploadProjectFile(projectId: string, file: File | any): Promise<ProjectApiResponse<{ fileId: string; url: string }>> {
    try {
      console.log(`[ProjectAPI] 🔄 Uploading file for project: ${projectId}`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      
      const uploadResult = await apiErrorHandler.smartRetry(
        () => apiFetch('/construction-projects/upload', {
          method: 'POST',
          body: formData
        }),
        '/construction-projects/upload',
        'POST'
      ) as { fileId: string; url: string };

      console.log('[ProjectAPI] ✅ File uploaded successfully');
      
      return {
        data: uploadResult,
        source: 'api'
      };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/construction-projects/upload', 'POST');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[ProjectAPI] ❌ File upload failed');
      
      throw {
        error: errorContext,
        recommendations,
        userMessage: 'Không thể tải file lên. Vui lòng thử lại sau.'
      };
    }
  }

  // Lấy connectivity status
  getApiStatus() {
    return apiErrorHandler.getConnectivityStatus();
  }

  // Helper methods
  private applyFilters(projects: ConstructionProject[], filters?: ProjectFilters): ConstructionProject[] {
    if (!filters) return projects;
    
    return projects.filter(project => {
      if (filters.project_type && project.project_type !== filters.project_type) return false;
      if (filters.status && project.status !== filters.status) return false;
      if (filters.owner_id && project.owner_id !== filters.owner_id) return false;
      if (filters.location && !project.location.address?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.budgetRange) {
        const budget = project.budget?.total || 0;
        if (budget < filters.budgetRange.min || budget > filters.budgetRange.max) return false;
      }
      return true;
    });
  }

  private sanitizeProjectForCache(project: ConstructionProject): ConstructionProject {
    // Loại bỏ sensitive data trước khi cache
    const sanitized = { ...project };
    
    // Remove sensitive fields
    delete (sanitized as any).budget;
    delete (sanitized as any).owner_name;
    delete (sanitized as any).land_documents;
    delete (sanitized as any).admin_notes;
    
    // Keep only public location info
    if (sanitized.location) {
      sanitized.location = {
        ...sanitized.location,
        coordinates: undefined as any,
        detailed_address: undefined as any
      };
    }
    
    return sanitized;
  }

  private sanitizeProjectData(projectData: Partial<ConstructionProject>): Partial<ConstructionProject> {
    // Sanitize dữ liệu trước khi gửi lên server
    return {
      ...projectData,
      // Remove any client-side only fields
      id: undefined // Server sẽ generate ID
    };
  }

  private setCacheWithClassification(key: string, data: any, classification: 'public' | 'confidential' | 'restricted'): void {
    if (classification === 'restricted') {
      console.log('[ProjectAPI] 🔒 Restricted data not cached locally');
      return;
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      classification
    });
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private invalidateProjectCache(): void {
    for (const [key] of this.cache) {
      if (key.startsWith('projects_')) {
        this.cache.delete(key);
      }
    }
  }

  private getFallbackProjects(): ConstructionProject[] {
    return [
      {
        id: 'fallback-001',
        project_code: 'BTM001',
        project_name: 'Biệt Thự Modern Phú Mỹ Hưng',
        project_type: 'biet_thu',
        status: 'completed',
        description: 'Biệt thự cao cấp với thiết kế hiện đại, tận dụng tối đa ánh sáng tự nhiên',
        owner_id: 'owner-001',
        owner_name: 'Nguyễn Văn A',
        location: {
          address: 'Phú Mỹ Hưng, Quận 7, TP.HCM',
          district: 'Quận 7',
          city: 'TP.HCM',
          coordinates: { lat: 10.7294, lng: 106.7196 }
        },
        land_documents: [],
        budget: {
          total: 8500000000,
          paid: 6000000000,
          remaining: 2500000000,
          breakdown: []
        },
        timeline: {
          start_date: '2024-01-15',
          end_date: '2024-12-15',
          milestones: []
        },
        specifications: {
          floors: 3,
          bedrooms: 5,
          bathrooms: 6,
          parking_spaces: 2,
          special_features: ['Swimming pool', 'Garden', 'Smart home system']
        },
        design_files: [],
        photos: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
        ],
        documents: [],
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-12-15T00:00:00Z',
        created_by: 'system',
        last_updated_by: 'system',
        notes: 'Project completed successfully',
        tags: ['luxury', 'modern', 'smart-home']
      },
      {
        id: 'fallback-002',
        project_code: 'BTC002',
        project_name: 'Biệt Thự Cổ Điển Thảo Điền',
        project_type: 'biet_thu',
        status: 'in_progress',
        description: 'Biệt thự phong cách cổ điển châu Âu với sân vườn rộng rãi',
        owner_id: 'owner-002',
        owner_name: 'Trần Thị B',
        location: {
          address: 'Thảo Điền, Quận 2, TP.HCM',
          district: 'Quận 2',
          city: 'TP.HCM',
          coordinates: { lat: 10.8031, lng: 106.7323 }
        },
        land_documents: [],
        budget: {
          total: 12000000000,
          paid: 5000000000,
          remaining: 7000000000,
          breakdown: []
        },
        timeline: {
          start_date: '2024-06-01',
          end_date: '2025-06-01',
          milestones: []
        },
        specifications: {
          floors: 2,
          bedrooms: 4,
          bathrooms: 5,
          parking_spaces: 3,
          special_features: ['Large garden', 'Classical architecture', 'Wine cellar']
        },
        design_files: [],
        photos: [
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
          'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800'
        ],
        documents: [],
        created_at: '2024-06-01T00:00:00Z',
        updated_at: '2024-12-30T00:00:00Z',
        created_by: 'system',
        last_updated_by: 'system',
        notes: 'Construction in progress, 60% completed',
        tags: ['classical', 'luxury', 'garden']
      },
      {
        id: 'fallback-003',
        project_code: 'NPT003',
        project_name: 'Nhà Phố Thương Mại Quận 1',
        project_type: 'nha_pho',
        status: 'approved',
        description: 'Nhà phố kết hợp thương mại và ở, thiết kế tối ưu diện tích',
        owner_id: 'owner-003',
        owner_name: 'Lê Văn C',
        location: {
          address: 'Quận 1, TP.HCM',
          district: 'Quận 1',
          city: 'TP.HCM',
          coordinates: { lat: 10.7769, lng: 106.7009 }
        },
        land_documents: [],
        budget: {
          total: 4200000000,
          paid: 0,
          remaining: 4200000000,
          breakdown: []
        },
        timeline: {
          start_date: '2025-02-01',
          end_date: '2026-02-01',
          milestones: []
        },
        specifications: {
          floors: 4,
          bedrooms: 3,
          bathrooms: 4,
          parking_spaces: 1,
          special_features: ['Commercial space on ground floor', 'Rooftop terrace']
        },
        design_files: [],
        photos: [
          'https://images.unsplash.com/photo-1600566753014-da149c47e1b4?w=800'
        ],
        documents: [],
        created_at: '2024-10-01T00:00:00Z',
        updated_at: '2024-12-20T00:00:00Z',
        created_by: 'system',
        last_updated_by: 'system',
        notes: 'Waiting for construction to start',
        tags: ['commercial', 'townhouse', 'mixed-use']
      }
    ];
  }

  private getFallbackProjectById(id: string): ConstructionProject | null {
    const fallbackProjects = this.getFallbackProjects();
    return fallbackProjects.find(project => project.id === id) || null;
  }
}

// Export singleton
export const enhancedProjectApiService = new EnhancedProjectApiService();
export default enhancedProjectApiService;