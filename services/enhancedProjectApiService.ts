/**
 * Enhanced Project API Service with Database Management
 * Tích hợp quản lý cơ sở dữ liệu, API calls, và error handling thông minh
 */

import { ProjectStatus, ProjectType } from '../types/construction';
import { apiFetch } from './api';
import { ApiErrorContext, apiErrorHandler } from './apiErrorHandler';
import { DatabaseEntity, databaseManager } from './databaseManager';
// Use permissive local aliases to avoid tight coupling to the construction types during migration
type ConstructionProject = any;
type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
// (removed DataClassification import in favor of local alias above)

// Database Project Entity
export interface ProjectEntity extends DatabaseEntity {
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description?: string;
  location?: string;
  budget?: number;
  images?: string[];
  metadata?: Record<string, any>;
}

export interface ProjectApiResponse<T> {
  data: T;
  source: 'api' | 'fallback' | 'cache' | 'database';
  error?: ApiErrorContext;
  recommendations?: string[];
}

export interface ProjectFilters {
  type?: ProjectType;
  status?: ProjectStatus;
  priceRange?: { min: number; max: number };
  location?: string;
  featured?: boolean;
}

class EnhancedProjectApiService {
  private cache = new Map<string, { data: any; timestamp: number; classification: DataClassification }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // ===========================================
  // DATABASE INTEGRATION METHODS
  // ===========================================

  /**
   * Tạo project mới trong database thông qua API
   */
  async createProjectInDatabase(projectData: Partial<ProjectEntity>): Promise<ProjectApiResponse<ProjectEntity | null>> {
    try {
      console.log('[ProjectAPI] 🔄 Creating project in database:', projectData.name);
      
      const result = await databaseManager.create<ProjectEntity>('projects', {
        name: projectData.name || '',
        type: (projectData.type || 'villa') as ProjectType,
        status: (projectData.status || 'planning') as ProjectStatus,
        description: projectData.description,
        location: projectData.location,
        budget: projectData.budget,
        images: projectData.images || [],
        metadata: projectData.metadata || {}
      });

      if (result.success && result.data) {
        console.log('[ProjectAPI] ✅ Project created in database');
        return {
          data: result.data,
          source: 'database'
        };
      } else {
        return {
          data: null,
          source: 'database',
          error: {
            endpoint: '/database/projects',
            method: 'POST',
            timestamp: new Date(),
            errorType: 'server',
            isRetryable: true,
            fallbackAvailable: false
          },
          recommendations: ['Kiểm tra kết nối database', 'Xem log để debug']
        };
      }
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/database/projects', 'POST');
      return {
        data: null,
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra API endpoint', 'Xác minh dữ liệu đầu vào']
      };
    }
  }

  /**
   * Lấy projects từ database
   */
  async getProjectsFromDatabase(filters?: ProjectFilters): Promise<ProjectApiResponse<ProjectEntity[]>> {
    try {
      console.log('[ProjectAPI] 🔄 Getting projects from database');
      
      const where: Record<string, any> = {};
      if (filters?.type) where.type = filters.type;
      if (filters?.status) where.status = filters.status;
      if (filters?.location) where.location = filters.location;

      const result = await databaseManager.read<ProjectEntity>(
        'projects',
        Object.keys(where).length > 0 ? where : undefined,
        'updatedAt DESC',
        20
      );

      if (result.success && result.data) {
        console.log('[ProjectAPI] ✅ Projects loaded from database:', result.data.length);
        return {
          data: result.data,
          source: 'database'
        };
      } else {
        return {
          data: [],
          source: 'database',
          error: {
            endpoint: '/database/projects',
            method: 'GET',
            timestamp: new Date(),
            errorType: 'server',
            isRetryable: true,
            fallbackAvailable: false
          },
          recommendations: ['Kiểm tra kết nối database', 'Kiểm tra quyền truy cập']
        };
      }
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/database/projects', 'GET');
      return {
        data: [],
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra API endpoint', 'Xem log database']
      };
    }
  }

  /**
   * Cập nhật project trong database
   */
  async updateProjectInDatabase(id: string, updates: Partial<ProjectEntity>): Promise<ProjectApiResponse<ProjectEntity | null>> {
    try {
      console.log('[ProjectAPI] 🔄 Updating project in database:', id);
      
      const result = await databaseManager.update<ProjectEntity>('projects', id, updates);

      if (result.success && result.data) {
        console.log('[ProjectAPI] ✅ Project updated in database');
        return {
          data: result.data,
          source: 'database'
        };
      } else {
        return {
          data: null,
          source: 'database',
          error: {
            endpoint: '/database/projects',
            method: 'PUT',
            timestamp: new Date(),
            errorType: 'server',
            isRetryable: true,
            fallbackAvailable: false
          },
          recommendations: ['Kiểm tra project ID', 'Xác minh quyền cập nhật']
        };
      }
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/database/projects', 'PUT');
      return {
        data: null,
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra API endpoint', 'Xác minh dữ liệu']
      };
    }
  }

  /**
   * Xóa project khỏi database
   */
  async deleteProjectFromDatabase(id: string): Promise<ProjectApiResponse<boolean>> {
    try {
      console.log('[ProjectAPI] 🔄 Deleting project from database:', id);
      
      const result = await databaseManager.delete('projects', id);

      if (result.success) {
        console.log('[ProjectAPI] ✅ Project deleted from database');
        return {
          data: true,
          source: 'database'
        };
      } else {
        return {
          data: false,
          source: 'database',
          error: {
            endpoint: '/database/projects',
            method: 'DELETE',
            timestamp: new Date(),
            errorType: 'server',
            isRetryable: true,
            fallbackAvailable: false
          },
          recommendations: ['Kiểm tra project ID', 'Xác minh quyền xóa']
        };
      }
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/database/projects', 'DELETE');
      return {
        data: false,
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra API endpoint', 'Xem log database']
      };
    }
  }

  /**
   * Tìm kiếm projects trong database
   */
  async searchProjectsInDatabase(searchParams: {
    query?: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
  }): Promise<ProjectApiResponse<ProjectEntity[]>> {
    try {
      console.log('[ProjectAPI] 🔄 Searching projects in database');
      
      const result = await databaseManager.search<ProjectEntity>(
        'projects',
        searchParams.query || '',
        ['name', 'description', 'location'],
        searchParams.filters,
        searchParams.limit || 20,
        searchParams.offset || 0
      );

      if (result.success && result.data) {
        console.log('[ProjectAPI] ✅ Search completed:', result.data.length, 'results');
        return {
          data: result.data,
          source: 'database'
        };
      } else {
        return {
          data: [],
          source: 'database',
          error: {
            endpoint: '/database/search',
            method: 'POST',
            timestamp: new Date(),
            errorType: 'server',
            isRetryable: true,
            fallbackAvailable: false
          },
          recommendations: ['Kiểm tra cú pháp tìm kiếm', 'Xem log database']
        };
      }
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/database/search', 'POST');
      return {
        data: [],
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra API endpoint', 'Xác minh tham số tìm kiếm']
      };
    }
  }

  /**
   * Lấy thống kê database
   */
  async getDatabaseStats(): Promise<ProjectApiResponse<any>> {
    try {
      console.log('[ProjectAPI] 🔄 Getting database stats');
      
      const result = await databaseManager.getStats();

      if (result.success) {
        console.log('[ProjectAPI] ✅ Database stats loaded');
        return {
          data: result.data,
          source: 'database'
        };
      } else {
        return {
          data: null,
          source: 'database',
          error: {
            endpoint: '/database/stats',
            method: 'GET',
            timestamp: new Date(),
            errorType: 'server',
            isRetryable: true,
            fallbackAvailable: false
          },
          recommendations: ['Kiểm tra quyền admin', 'Xem log database']
        };
      }
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/database/stats', 'GET');
      return {
        data: null,
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra kết nối database']
      };
    }
  }

  // ===========================================
  // EXISTING API METHODS (preserved)
  // ===========================================

  // Lấy danh sách projects với smart error handling
  async getProjects(filters?: ProjectFilters): Promise<ProjectApiResponse<ConstructionProject[]>> {
    const cacheKey = `projects_${JSON.stringify(filters || {})}`;
    
    try {
      console.log('[ProjectAPI] 🔄 Fetching projects with filters:', filters);
      
      // Thử kết nối API với smart retry
      const apiData = await apiErrorHandler.smartRetry(
        () => apiFetch('/projects', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        '/projects',
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
      const errorContext = apiErrorHandler.analyzeApiError(error, '/projects', 'GET');
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
        () => apiFetch(`/projects/${id}`),
        `/projects/${id}`,
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
      const errorContext = apiErrorHandler.analyzeApiError(error, `/projects/${id}`, 'GET');
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
        () => apiFetch('/projects', {
          method: 'POST',
          body: JSON.stringify(sanitizedData),
          headers: { 'Content-Type': 'application/json' }
        }),
        '/projects',
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
      const errorContext = apiErrorHandler.analyzeApiError(error, '/projects', 'POST');
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
        () => apiFetch('/projects/upload', {
          method: 'POST',
          body: formData
        }),
        '/projects/upload',
        'POST'
      ) as { fileId: string; url: string };

      console.log('[ProjectAPI] ✅ File uploaded successfully');
      
      return {
        data: uploadResult,
        source: 'api'
      };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/projects/upload', 'POST');
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
      if (filters.type && project.type !== filters.type) return false;
      if (filters.status && project.status !== filters.status) return false;
      if (filters.featured !== undefined && project.featured !== filters.featured) return false;
      if (filters.location && !project.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.priceRange) {
        const price = project.estimatedCost;
        if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
      }
      return true;
    });
  }

  private sanitizeProjectForCache(project: ConstructionProject): ConstructionProject {
    // Loại bỏ sensitive data trước khi cache
    const { clientContact, internalNotes, costBreakdown, ...publicData } = project;
    return {
      ...publicData,
      clientContact: undefined,
      internalNotes: undefined,
      costBreakdown: undefined
    } as ConstructionProject;
  }

  private sanitizeProjectData(projectData: Partial<ConstructionProject>): Partial<ConstructionProject> {
    // Sanitize dữ liệu trước khi gửi lên server
    return {
      ...projectData,
      // Remove any client-side only fields
      id: undefined // Server sẽ generate ID
    };
  }

  private setCacheWithClassification(key: string, data: any, classification: DataClassification): void {
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
        id: 'fallback-villa-001',
        name: 'Biệt Thự Hiện Đại Phú Mỹ Hưng',
        type: 'villa',
        status: 'completed',
        description: 'Biệt thự cao cấp với thiết kế hiện đại, tận dụng tối đa ánh sáng tự nhiên',
        location: 'Phú Mỹ Hưng, Quận 7, TP.HCM',
        area: 450,
        floors: 3,
        bedrooms: 5,
        bathrooms: 6,
        estimatedCost: 8500000000,
        duration: 18,
        featured: true,
        images: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-15')
      },
      {
        id: 'fallback-villa-002',
        name: 'Biệt Thự Cổ Điển Thảo Điền',
        type: 'villa',
        status: 'in_progress',
        description: 'Biệt thự phong cách cổ điển châu Âu với sân vườn rộng rãi',
        location: 'Thảo Điền, Quận 2, TP.HCM',
        area: 600,
        floors: 2,
        bedrooms: 4,
        bathrooms: 5,
        estimatedCost: 12000000000,
        duration: 24,
        featured: true,
        images: [
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
          'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800'
        ],
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-12-30')
      },
      {
        id: 'fallback-townhouse-001',
        name: 'Nhà Phố Thương Mại Quận 1',
        type: 'townhouse',
        status: 'planning',
        description: 'Nhà phố kết hợp thương mại và ở, thiết kế tối ưu diện tích',
        location: 'Quận 1, TP.HCM',
        area: 120,
        floors: 4,
        bedrooms: 3,
        bathrooms: 4,
        estimatedCost: 4200000000,
        duration: 12,
        featured: false,
        images: [
          'https://images.unsplash.com/photo-1600566753014-da149c47e1b4?w=800'
        ],
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-12-20')
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