// Construction Project Service
// Handles all construction project related API calls and business logic

import {
    ConstructionProject,
    CreateProjectFormData,
    LandDocument,
    ProjectListResponse,
    ProjectStatsResponse,
    ProjectTemplate,
    UpdateProjectFormData
} from '@/types/construction';
import { getItem } from '@/utils/storage';
import { apiFetch } from './api';

export class ConstructionProjectService {
  private static instance: ConstructionProjectService;
  
  public static getInstance(): ConstructionProjectService {
    if (!ConstructionProjectService.instance) {
      ConstructionProjectService.instance = new ConstructionProjectService();
    }
    return ConstructionProjectService.instance;
  }

  /**
   * Create a new construction project
   */
  async createProject(formData: CreateProjectFormData): Promise<ConstructionProject> {
    const currentUserId = await getItem('auth:currentUserId') || 'user_123';
    
    // Prepare project data for server (excluding files)
    const projectData = {
      project_name: formData.project_name,
      project_type: formData.project_type,
      description: formData.description,
      location: formData.location,
      estimated_budget: formData.estimated_budget,
      preferred_start_date: formData.preferred_start_date,
      specifications: formData.specifications,
      notes: formData.notes,
      owner_id: currentUserId,
      status: 'draft' as const,
      project_code: this.generateProjectCode(),
      created_by: currentUserId,
      last_updated_by: currentUserId,
      // File information stored as metadata only
      has_documents: formData.land_documents.length > 0,
      has_photos: formData.photos ? formData.photos.length > 0 : false,
      document_count: formData.land_documents.length,
      photo_count: formData.photos ? formData.photos.length : 0
    };

    try {
      const project = await apiFetch<ConstructionProject>('/construction-projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      // Store files locally on client side
      await this.storeFilesLocally(project.id, {
        land_documents: formData.land_documents,
        photos: formData.photos || []
      });

      console.log('✅ Construction project created:', project.id);
      return project;
    } catch (error) {
      console.error('❌ Failed to create construction project:', error);
      throw error;
    }
  }

  /**
   * Get projects list with filtering and pagination
   */
  async getProjects(params: {
    page?: number;
    limit?: number;
    status?: string;
    project_type?: string;
    owner_id?: string;
    search?: string;
  } = {}): Promise<ProjectListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    try {
      const response = await apiFetch<ProjectListResponse>(
        `/construction-projects?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      return {
        projects: [],
        total: 0,
        page: 1,
        limit: 10,
        has_more: false
      };
    }
  }

  /**
   * Get single project by ID
   */
  async getProject(projectId: string): Promise<ConstructionProject | null> {
    try {
      const project = await apiFetch<ConstructionProject>(`/construction-projects/${projectId}`);
      return project;
    } catch (error) {
      console.error('❌ Failed to fetch project:', error);
      return null;
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updates: UpdateProjectFormData): Promise<ConstructionProject> {
    const currentUserId = await getItem('auth:currentUserId');
    
    const updateData = {
      ...updates,
      last_updated_by: currentUserId,
      updated_at: new Date().toISOString(),
    };

    try {
      const project = await apiFetch<ConstructionProject>(`/construction-projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      console.log('✅ Project updated:', projectId);
      return project;
    } catch (error) {
      console.error('❌ Failed to update project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      await apiFetch(`/construction-projects/${projectId}`, {
        method: 'DELETE',
      });
      console.log('✅ Project deleted:', projectId);
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(ownerId?: string): Promise<ProjectStatsResponse> {
    const params = ownerId ? `?owner_id=${ownerId}` : '';
    
    try {
      const stats = await apiFetch<ProjectStatsResponse>(`/construction-projects/stats${params}`);
      return stats;
    } catch (error) {
      console.error('❌ Failed to fetch project stats:', error);
      return {
        total_projects: 0,
        by_status: {} as any,
        by_type: {} as any,
        total_value: 0,
        average_project_value: 0
      };
    }
  }

  /**
   * Get project templates
   */
  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    try {
      const templates = await apiFetch<ProjectTemplate[]>('/construction-projects/templates');
      return templates;
    } catch (error) {
      console.error('❌ Failed to fetch project templates:', error);
      return [];
    }
  }

  /**
   * Store files locally on client side (không upload lên server)
   */
  private async storeFilesLocally(projectId: string, files: {
    land_documents: File[];
    photos: File[];
  }): Promise<void> {
    try {
      // Convert files to base64 concurrently
      const documentPromises = files.land_documents.map(async (file) => ({
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        data: await this.fileToBase64(file)
      }));

      const photoPromises = files.photos.map(async (file) => ({
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        data: await this.fileToBase64(file)
      }));

      const [processedDocuments, processedPhotos] = await Promise.all([
        Promise.all(documentPromises),
        Promise.all(photoPromises)
      ]);

      const fileData = {
        projectId,
        land_documents: processedDocuments,
        photos: processedPhotos,
        stored_at: new Date().toISOString()
      };

      // Store in local storage
      await this.setItem(`project_files_${projectId}`, JSON.stringify(fileData));
      console.log(`📁 Files stored locally for project ${projectId}:`, {
        documents: files.land_documents.length,
        photos: files.photos.length
      });
    } catch (error) {
      console.error('❌ Failed to store files locally:', error);
    }
  }

  /**
   * Get locally stored files for a project
   */
  async getLocalFiles(projectId: string): Promise<{
    land_documents: any[];
    photos: any[];
  }> {
    try {
      const storedData = await this.getItem(`project_files_${projectId}`);
      if (storedData) {
        const fileData = JSON.parse(storedData);
        return {
          land_documents: fileData.land_documents || [],
          photos: fileData.photos || []
        };
      }
    } catch (error) {
      console.error('❌ Failed to get local files:', error);
    }
    
    return { land_documents: [], photos: [] };
  }

  /**
   * Convert file to base64 for local storage
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Storage helpers
   */
  private async setItem(key: string, value: string): Promise<void> {
    // Use existing storage utility
    const { setItem } = await import('@/utils/storage');
    return setItem(key, value);
  }

  private async getItem(key: string): Promise<string | null> {
    // Use existing storage utility
    const { getItem } = await import('@/utils/storage');
    return getItem(key);
  }

  /**
   * Upload land documents (deprecated - now using client-side storage)
   * @deprecated Use storeFilesLocally instead for client-side file management
   */
  async uploadLandDocuments(projectId: string, files: File[]): Promise<LandDocument[]> {
    console.warn('⚠️ uploadLandDocuments is deprecated. Files are now stored client-side.');
    
    // Return mock documents for compatibility
    return files.map((file, index) => ({
      id: `doc_${projectId}_${index}_${Date.now()}`,
      document_name: file.name,
      file_size: file.size,
      document_type: 'so_do' as const,
      uploaded_at: new Date().toISOString(),
      file_url: '', // No URL since stored locally
      verified: false
    }));
  }

  /**
   * Upload project photos (deprecated - now using client-side storage)
   * @deprecated Use storeFilesLocally instead for client-side file management
   */
  async uploadProjectPhotos(projectId: string, files: File[]): Promise<string[]> {
    console.warn('⚠️ uploadProjectPhotos is deprecated. Files are now stored client-side.');
    
    // Return mock URLs for compatibility
    return files.map((file, index) => 
      `local://${projectId}/photo_${index}_${Date.now()}`
    );
  }

  /**
   * Assign admin to project
   */
  async assignAdmin(projectId: string, adminId: string): Promise<void> {
    try {
      await apiFetch(`/construction-projects/${projectId}/assign-admin`, {
        method: 'POST',
        body: JSON.stringify({ admin_id: adminId }),
      });
      console.log('✅ Admin assigned to project:', { projectId, adminId });
    } catch (error) {
      console.error('❌ Failed to assign admin:', error);
      throw error;
    }
  }

  /**
   * Update project status
   */
  async updateProjectStatus(
    projectId: string, 
    status: ConstructionProject['status'],
    notes?: string
  ): Promise<void> {
    try {
      await apiFetch(`/construction-projects/${projectId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });
      console.log('✅ Project status updated:', { projectId, status });
    } catch (error) {
      console.error('❌ Failed to update project status:', error);
      throw error;
    }
  }

  /**
   * Generate unique project code
   */
  private generateProjectCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `PROJ_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Get projects for current user
   */
  async getMyProjects(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ProjectListResponse> {
    const currentUserId = await getItem('auth:currentUserId');
    if (!currentUserId) {
      return {
        projects: [],
        total: 0,
        page: 1,
        limit: 10,
        has_more: false
      };
    }
    return this.getProjects({ ...params, owner_id: currentUserId });
  }

  /**
   * Validate project data
   */
  validateProjectData(data: CreateProjectFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.project_name?.trim()) {
      errors.push('Tên dự án không được để trống');
    }

    if (!data.project_type) {
      errors.push('Loại dự án không được để trống');
    }

    if (!data.location?.address?.trim()) {
      errors.push('Địa chỉ xây dựng không được để trống');
    }

    if (!data.location?.land_area || data.location.land_area <= 0) {
      errors.push('Diện tích đất phải lớn hơn 0');
    }

    if (!data.estimated_budget || data.estimated_budget <= 0) {
      errors.push('Ngân sách dự kiến phải lớn hơn 0');
    }

    if (data.land_documents.length === 0) {
      errors.push('Cần tải lên ít nhất một tài liệu sổ đất');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Get status display text
   */
  getStatusText(status: ConstructionProject['status']): string {
    const statusMap = {
      draft: 'Bản nháp',
      pending_review: 'Chờ duyệt',
      approved: 'Đã duyệt',
      in_progress: 'Đang thi công',
      on_hold: 'Tạm dừng',
      completed: 'Hoàn thành',
      cancelled: 'Hủy bỏ'
    };
    return statusMap[status] || status;
  }

  /**
   * Get project type display text
   */
  getProjectTypeText(type: ConstructionProject['project_type']): string {
    const typeMap = {
      nha_o: 'Nhà ở',
      biet_thu: 'Biệt thự',
      nha_pho: 'Nhà phố',
      chung_cu: 'Chung cư',
      van_phong: 'Văn phòng',
      thuong_mai: 'Thương mại',
      cong_nghiep: 'Công nghiệp',
      khac: 'Khác'
    };
    return typeMap[type] || type;
  }
}

// Export singleton instance
export const constructionProjectService = ConstructionProjectService.getInstance();
