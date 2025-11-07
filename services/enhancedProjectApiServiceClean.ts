/**
 * Enhanced Project API Service with Database Integration
 * Version: 2.0 - Clean Implementation
 * 
 * Tích hợp database management với API service để cung cấp:
 * - CRUD operations cho projects thông qua database
 * - Error handling và fallback mechanisms
 * - Cache management
 * - Performance monitoring
 */

import { ApiErrorContext, apiErrorHandler } from './apiErrorHandler';
import { DatabaseEntity, databaseManager } from './databaseManager';

// Define DataClassification inline to avoid module path issues
enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal', 
  RESTRICTED = 'restricted'
}

// ===========================================
// TYPE DEFINITIONS  
// ===========================================

// Extend DatabaseEntity for project-specific fields
export interface ProjectEntity extends DatabaseEntity {
  name: string;
  type: 'villa' | 'apartment' | 'office' | 'restaurant' | 'hotel';
  status: 'planning' | 'designing' | 'constructing' | 'completed' | 'cancelled';
  description?: string;
  location?: string;
  budget?: number;
  images?: string[];
  metadata?: Record<string, any>;
}

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export interface ProjectApiResponse<T> {
  data: T;
  source: 'database' | 'cache' | 'fallback';
  error?: ApiErrorContext;
  recommendations?: string[];
}

export interface ProjectFilters {
  type?: string;
  status?: string;
  location?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

// ===========================================
// MAIN SERVICE CLASS
// ===========================================

class EnhancedProjectApiServiceClean {
  private cache = new Map<string, { data: any; timestamp: number; classification: DataClassification }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // ===========================================
  // DATABASE INTEGRATION METHODS
  // ===========================================

  /**
   * Tạo project mới trong database
   */
  async createProject(projectData: Partial<ProjectEntity>): Promise<ProjectApiResponse<ProjectEntity | null>> {
    try {
      console.log('[ProjectAPI] 🔄 Creating project in database:', projectData.name);
      
      const result = await databaseManager.create<ProjectEntity>('projects', {
        name: projectData.name || '',
        type: (projectData.type || 'villa') as any,
        status: (projectData.status || 'planning') as any,
        description: projectData.description,
        location: projectData.location,
        budget: projectData.budget,
        images: projectData.images || [],
        metadata: projectData.metadata || {}
      });

      if (result.success && result.data) {
        console.log('[ProjectAPI] ✅ Project created in database');
        this.clearCache(); // Clear cache để refresh data
        
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
   * Lấy danh sách projects với filters
   */
  async getProjects(filters?: ProjectFilters): Promise<ProjectApiResponse<ProjectEntity[]>> {
    const cacheKey = `projects_${JSON.stringify(filters || {})}`;
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('[ProjectAPI] 📋 Cache hit for projects');
      return {
        data: cachedData,
        source: 'cache'
      };
    }

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
        
        // Cache the results
        this.setCacheWithClassification(cacheKey, result.data, 'public');
        
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
   * Lấy project theo ID
   */
  async getProjectById(id: string): Promise<ProjectApiResponse<ProjectEntity | null>> {
    const cacheKey = `project_${id}`;
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('[ProjectAPI] 📋 Cache hit for project:', id);
      return {
        data: cachedData,
        source: 'cache'
      };
    }

    try {
      console.log('[ProjectAPI] 🔄 Getting project by ID:', id);
      
      const result = await databaseManager.read<ProjectEntity>('projects', { id });

      if (result.success && result.data && result.data.length > 0) {
        console.log('[ProjectAPI] ✅ Project loaded from database');
        
        const project = result.data[0];
        this.setCacheWithClassification(cacheKey, project, 'public');
        
        return {
          data: project,
          source: 'database'
        };
      } else {
        return {
          data: null,
          source: 'database',
          error: {
            endpoint: `/database/projects/${id}`,
            method: 'GET',
            timestamp: new Date(),
            errorType: 'server',
            isRetryable: true,
            fallbackAvailable: false
          },
          recommendations: ['Kiểm tra project ID', 'Xác minh project tồn tại']
        };
      }
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, `/database/projects/${id}`, 'GET');
      return {
        data: null,
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra API endpoint', 'Xem log database']
      };
    }
  }

  /**
   * Cập nhật project
   */
  async updateProject(id: string, updates: Partial<ProjectEntity>): Promise<ProjectApiResponse<ProjectEntity | null>> {
    try {
      console.log('[ProjectAPI] 🔄 Updating project in database:', id);
      
      const result = await databaseManager.update<ProjectEntity>('projects', id, updates);

      if (result.success && result.data) {
        console.log('[ProjectAPI] ✅ Project updated in database');
        
        // Clear related cache
        this.clearCache();
        
        return {
          data: result.data,
          source: 'database'
        };
      } else {
        return {
          data: null,
          source: 'database',
          error: {
            endpoint: `/database/projects/${id}`,
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
      const errorContext = apiErrorHandler.analyzeApiError(error, `/database/projects/${id}`, 'PUT');
      return {
        data: null,
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra API endpoint', 'Xác minh dữ liệu']
      };
    }
  }

  /**
   * Xóa project
   */
  async deleteProject(id: string): Promise<ProjectApiResponse<boolean>> {
    try {
      console.log('[ProjectAPI] 🔄 Deleting project from database:', id);
      
      const result = await databaseManager.delete('projects', id);

      if (result.success) {
        console.log('[ProjectAPI] ✅ Project deleted from database');
        
        // Clear cache
        this.clearCache();
        
        return {
          data: true,
          source: 'database'
        };
      } else {
        return {
          data: false,
          source: 'database',
          error: {
            endpoint: `/database/projects/${id}`,
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
      const errorContext = apiErrorHandler.analyzeApiError(error, `/database/projects/${id}`, 'DELETE');
      return {
        data: false,
        source: 'database',
        error: errorContext,
        recommendations: ['Kiểm tra API endpoint', 'Xem log database']
      };
    }
  }

  /**
   * Tìm kiếm projects
   */
  async searchProjects(searchParams: {
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
  // CACHE MANAGEMENT
  // ===========================================

  private setCacheWithClassification(key: string, data: any, classification: 'public' | 'internal' | 'restricted'): void {
    const classificationMap = {
      'public': DataClassification.PUBLIC,
      'internal': DataClassification.INTERNAL,
      'restricted': DataClassification.RESTRICTED
    };

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      classification: classificationMap[classification]
    });
  }

  private isCacheValid(cacheEntry: { timestamp: number }): boolean {
    return Date.now() - cacheEntry.timestamp < this.CACHE_DURATION;
  }

  private getCachedData(key: string): any | null {
    const cacheEntry = this.cache.get(key);
    if (cacheEntry && this.isCacheValid(cacheEntry)) {
      return cacheEntry.data;
    }
    return null;
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // ===========================================
  // HEALTH CHECK & MONITORING
  // ===========================================

  /**
   * Kiểm tra tình trạng hệ thống
   */
  async getApiHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'offline';
    responseTime: number;
    cacheHitRate: number;
    databaseConnected: boolean;
    cacheSize: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Test database connection
      const isConnected = await databaseManager.validateConnection();
      const responseTime = Date.now() - startTime;
      
      return {
        status: isConnected ? 'healthy' : 'degraded',
        responseTime,
        cacheHitRate: 0.85, // Mock rate - would calculate from actual cache hits
        databaseConnected: isConnected,
        cacheSize: this.cache.size
      };
    } catch (error) {
      console.error('[HealthCheck] Failed:', error);
      return {
        status: 'offline',
        responseTime: Date.now() - startTime,
        cacheHitRate: 0,
        databaseConnected: false,
        cacheSize: 0
      };
    }
  }

  /**
   * Clear all cache (for administrative purposes)
   */
  async clearAllCache(): Promise<{ cleared: number }> {
    const cacheSize = this.cache.size;
    this.clearCache();
    console.log('[Cache] Cleared all cache entries:', cacheSize);
    
    return { cleared: cacheSize };
  }
}

// Export singleton instance
export const enhancedProjectApiService = new EnhancedProjectApiServiceClean();
export default enhancedProjectApiService;