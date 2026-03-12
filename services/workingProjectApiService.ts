/**
 * Working Enhanced Project API Service
 * Simplified version với fallback data hoạt động
 */

import { apiFetch } from './api';
import { ApiErrorContext, apiErrorHandler } from './apiErrorHandler';

// Simplified types for fallback data
export interface ProjectData {
  id: string;
  project_code: string;
  project_name: string;
  project_type: string;
  status: string;
  description?: string;
  owner_name: string;
  location: {
    address: string;
    district: string;
    province: string;
  };
  budget: {
    estimated_cost: number;
    currency: string;
  };
  timeline: {
    start_date: string;
    estimated_end_date: string;
  };
  specifications?: {
    floors: number;
    bedrooms?: number;
    bathrooms?: number;
    parking_spaces?: number;
    special_features?: string[];
  };
  photos: string[];
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
}

export interface ProjectApiResponse<T> {
  data: T;
  source: 'api' | 'fallback' | 'cache';
  error?: ApiErrorContext;
  recommendations?: string[];
}

export interface ProjectFilters {
  project_type?: string;
  status?: string;
  owner_id?: string;
}

class WorkingProjectApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Lấy danh sách projects với smart error handling
  async getProjects(filters?: ProjectFilters): Promise<ProjectApiResponse<ProjectData[]>> {
    const cacheKey = `projects_${JSON.stringify(filters || {})}`;
    
    try {
      console.log('[WorkingProjectAPI] 🔄 Fetching projects with filters:', filters);
      
      // Thử kết nối API với smart retry
      const apiData = await apiErrorHandler.smartRetry(
        () => apiFetch('/construction-projects', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        '/construction-projects',
        'GET'
      ) as ProjectData[];

      // Cache dữ liệu
      this.setCache(cacheKey, apiData);
      
      console.log('[WorkingProjectAPI] ✅ Successfully fetched projects from API');
      return {
        data: this.applyFilters(apiData, filters),
        source: 'api'
      };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/construction-projects', 'GET');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[WorkingProjectAPI] 🔄 API failed, trying fallback data...');
      
      // Kiểm tra cache trước
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('[WorkingProjectAPI] ✅ Using cached data');
        return {
          data: this.applyFilters(cachedData, filters),
          source: 'cache',
          error: errorContext,
          recommendations
        };
      }

      // Sử dụng fallback data
      const fallbackData = this.getFallbackProjects();
      console.log('[WorkingProjectAPI] ✅ Using fallback data');
      
      return {
        data: this.applyFilters(fallbackData, filters),
        source: 'fallback',
        error: errorContext,
        recommendations
      };
    }
  }

  // Lấy chi tiết project
  async getProjectDetails(id: string): Promise<ProjectApiResponse<ProjectData | null>> {
    const cacheKey = `project_${id}`;
    
    try {
      console.log(`[WorkingProjectAPI] 🔄 Fetching project details for ID: ${id}`);
      
      const apiData = await apiErrorHandler.smartRetry(
        () => apiFetch(`/construction-projects/${id}`),
        `/construction-projects/${id}`,
        'GET'
      ) as ProjectData;

      this.setCache(cacheKey, apiData);
      
      console.log('[WorkingProjectAPI] ✅ Successfully fetched project details from API');
      return {
        data: apiData,
        source: 'api'
      };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, `/construction-projects/${id}`, 'GET');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[WorkingProjectAPI] 🔄 API failed, checking fallback...');
      
      // Kiểm tra cache
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('[WorkingProjectAPI] ✅ Using cached project details');
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
        console.log('[WorkingProjectAPI] ✅ Using fallback project details');
        return {
          data: fallbackProject,
          source: 'fallback',
          error: errorContext,
          recommendations
        };
      }

      console.log('[WorkingProjectAPI] ❌ No data available for project:', id);
      return {
        data: null,
        source: 'fallback',
        error: errorContext,
        recommendations
      };
    }
  }

  // Create project (simplified for testing)
  async createProject(projectData: any): Promise<ProjectApiResponse<ProjectData>> {
    try {
      console.log('[WorkingProjectAPI] 🔄 Creating new project...');
      
      const newProject = await apiErrorHandler.smartRetry(
        () => apiFetch('/construction-projects', {
          method: 'POST',
          body: JSON.stringify(projectData),
          headers: { 'Content-Type': 'application/json' }
        }),
        '/construction-projects',
        'POST'
      ) as ProjectData;

      console.log('[WorkingProjectAPI] ✅ Successfully created project');
      this.invalidateProjectCache();
      
      return {
        data: newProject,
        source: 'api'
      };
      
    } catch (error) {
      const errorContext = apiErrorHandler.analyzeApiError(error, '/construction-projects', 'POST');
      const recommendations = apiErrorHandler.getErrorRecommendations(errorContext);
      
      console.log('[WorkingProjectAPI] ❌ Failed to create project');
      
      throw {
        error: errorContext,
        recommendations,
        userMessage: apiErrorHandler.getUserFriendlyMessage(errorContext)
      };
    }
  }

  // Lấy connectivity status
  getApiStatus() {
    return apiErrorHandler.getConnectivityStatus();
  }

  // Helper methods
  private applyFilters(projects: ProjectData[], filters?: ProjectFilters): ProjectData[] {
    if (!filters) return projects;
    
    return projects.filter(project => {
      if (filters.project_type && project.project_type !== filters.project_type) return false;
      if (filters.status && project.status !== filters.status) return false;
      if (filters.owner_id && project.owner_name !== filters.owner_id) return false;
      return true;
    });
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
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

  private getFallbackProjects(): ProjectData[] {
    return [
      {
        id: 'fallback-001',
        project_code: 'BTM001',
        project_name: 'Biệt Thự Modern Phú Mỹ Hưng',
        project_type: 'biet_thu',
        status: 'completed',
        description: 'Biệt thự cao cấp với thiết kế hiện đại, tận dụng tối đa ánh sáng tự nhiên',
        owner_name: 'Nguyễn Văn A',
        location: {
          address: 'Đường Nguyễn Lương Bằng, Phú Mỹ Hưng',
          district: 'Quận 7',
          province: 'TP.HCM'
        },
        budget: {
          estimated_cost: 8500000000,
          currency: 'VND'
        },
        timeline: {
          start_date: '2024-01-15',
          estimated_end_date: '2024-12-15'
        },
        specifications: {
          floors: 3,
          bedrooms: 5,
          bathrooms: 6,
          parking_spaces: 2,
          special_features: ['Swimming pool', 'Garden', 'Smart home system']
        },
        photos: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
        ],
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-12-15T00:00:00Z',
        notes: 'Project completed successfully with excellent quality',
        tags: ['luxury', 'modern', 'smart-home']
      },
      {
        id: 'fallback-002',
        project_code: 'BTC002',
        project_name: 'Biệt Thự Cổ Điển Thảo Điền',
        project_type: 'biet_thu',
        status: 'in_progress',
        description: 'Biệt thự phong cách cổ điển châu Âu với sân vườn rộng rãi',
        owner_name: 'Trần Thị B',
        location: {
          address: 'Đường Nguyễn Văn Hưởng, Thảo Điền',
          district: 'Quận 2',
          province: 'TP.HCM'
        },
        budget: {
          estimated_cost: 12000000000,
          currency: 'VND'
        },
        timeline: {
          start_date: '2024-06-01',
          estimated_end_date: '2025-06-01'
        },
        specifications: {
          floors: 2,
          bedrooms: 4,
          bathrooms: 5,
          parking_spaces: 3,
          special_features: ['Large garden', 'Classical architecture', 'Wine cellar']
        },
        photos: [
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
          'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800'
        ],
        created_at: '2024-06-01T00:00:00Z',
        updated_at: '2024-12-30T00:00:00Z',
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
        owner_name: 'Lê Văn C',
        location: {
          address: 'Đường Lê Lợi',
          district: 'Quận 1',
          province: 'TP.HCM'
        },
        budget: {
          estimated_cost: 4200000000,
          currency: 'VND'
        },
        timeline: {
          start_date: '2025-02-01',
          estimated_end_date: '2026-02-01'
        },
        specifications: {
          floors: 4,
          bedrooms: 3,
          bathrooms: 4,
          parking_spaces: 1,
          special_features: ['Commercial space on ground floor', 'Rooftop terrace']
        },
        photos: [
          'https://images.unsplash.com/photo-1600566753014-da149c47e1b4?w=800'
        ],
        created_at: '2024-10-01T00:00:00Z',
        updated_at: '2024-12-20T00:00:00Z',
        notes: 'Waiting for construction to start',
        tags: ['commercial', 'townhouse', 'mixed-use']
      },
      {
        id: 'fallback-004',
        project_code: 'CC004',
        project_name: 'Chung Cư Cao Cấp Landmark 81',
        project_type: 'chung_cu',
        status: 'in_progress',
        description: 'Chung cư cao cấp với view sông Sài Gòn tuyệt đẹp',
        owner_name: 'Nguyễn Thị D',
        location: {
          address: 'Đường Võ Văn Kiệt, Vinhomes Central Park',
          district: 'Quận Bình Thạnh',
          province: 'TP.HCM'
        },
        budget: {
          estimated_cost: 6800000000,
          currency: 'VND'
        },
        timeline: {
          start_date: '2024-09-01',
          estimated_end_date: '2025-03-01'
        },
        specifications: {
          floors: 1,
          bedrooms: 3,
          bathrooms: 2,
          parking_spaces: 1,
          special_features: ['River view', 'High floor', 'Premium finishing']
        },
        photos: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
        ],
        created_at: '2024-08-15T00:00:00Z',
        updated_at: '2024-12-25T00:00:00Z',
        notes: 'Interior renovation in progress',
        tags: ['luxury', 'high-rise', 'river-view']
      },
      {
        id: 'fallback-005',
        project_code: 'VP005',
        project_name: 'Văn Phòng Tech Hub Quận 7',
        project_type: 'van_phong',
        status: 'pending_review',
        description: 'Văn phòng hiện đại dành cho các công ty công nghệ',
        owner_name: 'Công ty TNHH ABC Tech',
        location: {
          address: 'Đường Nguyễn Hữu Thọ',
          district: 'Quận 7',
          province: 'TP.HCM'
        },
        budget: {
          estimated_cost: 15000000000,
          currency: 'VND'
        },
        timeline: {
          start_date: '2025-03-01',
          estimated_end_date: '2025-12-01'
        },
        specifications: {
          floors: 6,
          special_features: ['Open workspace', 'Meeting rooms', 'Cafe area', 'Rooftop garden']
        },
        photos: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
        ],
        created_at: '2024-11-01T00:00:00Z',
        updated_at: '2024-12-28T00:00:00Z',
        notes: 'Awaiting approval for construction permit',
        tags: ['office', 'tech', 'modern', 'co-working']
      }
    ];
  }

  private getFallbackProjectById(id: string): ProjectData | null {
    const fallbackProjects = this.getFallbackProjects();
    return fallbackProjects.find(project => project.id === id) || null;
  }
}

// Export singleton
export const workingProjectApiService = new WorkingProjectApiService();
export default workingProjectApiService;
