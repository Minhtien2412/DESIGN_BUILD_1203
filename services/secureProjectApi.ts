/**
 * Secure API Service - Production Ready
 * Hạn chế dữ liệu nhạy cảm trên local, sử dụng server để fetch
 */

import { ConstructionProject } from '../types/construction';
import { apiFetch } from './api';

// Chỉ những thông tin public được lưu local
interface PublicProjectInfo {
  id: string;
  project_name: string;
  project_type: string;
  description?: string;
  public_images?: string[];
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  created_at: string;
}

// Dữ liệu nhạy cảm chỉ fetch từ server
interface SensitiveProjectData {
  budget: {
    total_budget: number;
    estimated_cost: number;
    currency: string;
  };
  owner_name: string;
  owner_contact?: string;
  location: {
    address: string;
    ward: string;
    district: string;
    province: string;
    coordinates?: { lat: number; lng: number };
    land_area: number;
  };
  timeline: {
    start_date: string;
    estimated_end_date: string;
    milestones: any[];
  };
  land_documents: any[];
  design_files: any[];
  documents: any[];
}

class SecureProjectApiService {
  private readonly PUBLIC_CACHE_KEY = 'public_projects_cache';
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Lấy dữ liệu public (có thể cache local)
  async getPublicProjects(): Promise<{ projects: PublicProjectInfo[]; total: number }> {
    try {
      console.log('[SecureAPI] Fetching public project data...');
      
      // Kiểm tra cache local cho dữ liệu public
      const cached = this.getPublicCache();
      if (cached) {
        console.log('[SecureAPI] ✅ Using cached public data');
        return cached;
      }

      // Fetch từ server - chỉ lấy thông tin public
      const response = await apiFetch('/projects/public') as any;
      
      if (response?.data?.projects) {
        const publicData = {
          projects: response.data.projects.map(this.sanitizeProjectForLocal),
          total: response.data.total || 0
        };
        
        // Cache dữ liệu public
        this.setPublicCache(publicData);
        return publicData;
      }

      // Fallback về mock data public
      return this.getPublicMockData();
      
    } catch (error) {
      console.warn('[SecureAPI] Server unavailable, using public mock data');
      return this.getPublicMockData();
    }
  }

  // Lấy dữ liệu đầy đủ (bao gồm nhạy cảm) - chỉ từ server
  async getProjectDetails(id: string): Promise<ConstructionProject | null> {
    try {
      console.log('[SecureAPI] Fetching sensitive project data from server...');
      
      // KHÔNG cache dữ liệu nhạy cảm local - luôn fetch từ server
      const response = await apiFetch(`/projects/${id}/details`) as any;
      
      if (response?.data) {
        return this.mapServerResponseToProject(response.data);
      }
      
      return null;
      
    } catch (error) {
      console.error('[SecureAPI] Cannot access sensitive data without server connection');
      // KHÔNG fallback cho dữ liệu nhạy cảm
      throw new Error('Không thể truy cập dữ liệu nhạy cảm khi không có kết nối server');
    }
  }

  // Tạo dự án mới - chỉ qua server
  async createProject(projectData: any): Promise<ConstructionProject> {
    try {
      console.log('[SecureAPI] Creating project via secure server...');
      
      const response = await apiFetch('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': await this.getAuthToken()
        },
        body: JSON.stringify(projectData)
      }) as any;

      if (response?.data) {
        // Xóa cache public để force refresh
        this.clearPublicCache();
        return this.mapServerResponseToProject(response.data);
      }

      throw new Error('Failed to create project');
      
    } catch (error) {
      console.error('[SecureAPI] Cannot create project without server connection');
      throw new Error('Không thể tạo dự án khi không có kết nối server bảo mật');
    }
  }

  // Upload file - chỉ qua server bảo mật
  async uploadProjectFile(projectId: string, file: File | Blob, fileName: string): Promise<string> {
    try {
      console.log('[SecureAPI] Uploading file via secure server...');
      
      const formData = new FormData();
      formData.append('file', file, fileName);
      formData.append('project_id', projectId);

      const response = await apiFetch('/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': await this.getAuthToken()
        },
        body: formData
      }) as any;

      if (response?.data?.url) {
        return response.data.url;
      }

      throw new Error('Upload failed');
      
    } catch (error) {
      console.error('[SecureAPI] Secure file upload failed');
      throw new Error('Không thể upload file khi không có kết nối server bảo mật');
    }
  }

  // Payments - luôn qua server
  async createPaymentCheckout(amount: number, projectId: string): Promise<{ checkout_url: string; payment_id: string }> {
    try {
      console.log('[SecureAPI] Creating secure payment checkout...');
      
      const response = await apiFetch('/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': await this.getAuthToken()
        },
        body: JSON.stringify({
          amount,
          project_id: projectId,
          return_url: 'app://payment-success',
          cancel_url: 'app://payment-cancel'
        })
      }) as any;

      if (response?.data) {
        return {
          checkout_url: response.data.checkout_url,
          payment_id: response.data.payment_id
        };
      }

      throw new Error('Payment checkout failed');
      
    } catch (error) {
      console.error('[SecureAPI] Secure payment creation failed');
      throw new Error('Không thể tạo thanh toán khi không có kết nối server bảo mật');
    }
  }

  // === PRIVATE METHODS ===

  private sanitizeProjectForLocal(project: any): PublicProjectInfo {
    // Chỉ lấy thông tin public, loại bỏ dữ liệu nhạy cảm
    return {
      id: project.id,
      project_name: project.project_name,
      project_type: project.project_type,
      description: project.description,
      public_images: project.public_images || [],
      status: project.status,
      created_at: project.created_at
    };
  }

  private mapServerResponseToProject(data: any): ConstructionProject {
    // Map đầy đủ dữ liệu từ server (bao gồm nhạy cảm)
    return {
      id: data.id,
      project_code: data.project_code,
      project_name: data.project_name,
      project_type: data.project_type,
      description: data.description,
      owner_id: data.owner_id,
      owner_name: data.owner_name,
      location: data.location,
      land_documents: data.land_documents || [],
      status: data.status,
      budget: data.budget,
      timeline: data.timeline,
      design_files: data.design_files || [],
      photos: data.photos || [],
      documents: data.documents || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by,
      last_updated_by: data.last_updated_by
    };
  }

  private async getAuthToken(): Promise<string> {
    // Lấy token từ secure storage, không hardcode
    try {
      const { getItem } = await import('../utils/storage');
      const token = await getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    } catch {
      return '';
    }
  }

  private getPublicCache(): { projects: PublicProjectInfo[]; total: number } | null {
    try {
      const cached = localStorage.getItem(this.PUBLIC_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < this.CACHE_EXPIRY) {
          return data.value;
        }
      }
    } catch {}
    return null;
  }

  private setPublicCache(data: { projects: PublicProjectInfo[]; total: number }) {
    try {
      localStorage.setItem(this.PUBLIC_CACHE_KEY, JSON.stringify({
        value: data,
        timestamp: Date.now()
      }));
    } catch {}
  }

  private clearPublicCache() {
    try {
      localStorage.removeItem(this.PUBLIC_CACHE_KEY);
    } catch {}
  }

  private getPublicMockData(): { projects: PublicProjectInfo[]; total: number } {
    // Mock data chỉ chứa thông tin public, không có dữ liệu nhạy cảm
    const mockProjects: PublicProjectInfo[] = [
      {
        id: 'mock-1',
        project_name: 'Villa Resort Mẫu',
        project_type: 'biet_thu',
        description: 'Dự án biệt thự nghỉ dưỡng (thông tin public)',
        public_images: [],
        status: 'planning',
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-2', 
        project_name: 'Nhà Phố Hiện Đại Mẫu',
        project_type: 'nha_pho',
        description: 'Dự án nhà phố hiện đại (thông tin public)',
        public_images: [],
        status: 'in_progress',
        created_at: new Date().toISOString()
      }
    ];

    return { projects: mockProjects, total: mockProjects.length };
  }
}

// Export singleton
export const secureProjectApiService = new SecureProjectApiService();
export default secureProjectApiService;