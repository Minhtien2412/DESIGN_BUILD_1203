// Enhanced Project API Service for Construction Projects
// Integrates with the available API endpoints for project management

import { ConstructionProject, ProjectStatus, ProjectType } from '../types/construction';
import { apiFetch } from './api';

export interface CreateProjectRequest {
  project_name: string;
  description?: string;
  project_type: ProjectType;
  location?: string;
  startDate?: string;
  endDate?: string;
  owner_name: string;
  budget?: number;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: ProjectStatus;
  progress?: number;
}

interface ApiResponse<T = any> {
  data?: T;
  projects?: T[];
  total?: number;
  url?: string;
}

class EnhancedProjectApiService {
  // Get all projects with API integration
  async getProjects(page = 1, limit = 20): Promise<{ projects: ConstructionProject[]; total: number }> {
    try {
      console.log('[ProjectApi] Fetching projects from API...');
      const response = await apiFetch<ApiResponse>(`/projects?page=${page}&limit=${limit}`);
      
      if (response.data?.projects) {
        return {
          projects: response.data.projects.map(this.mapApiProjectToLocal),
          total: response.data.total || 0
        };
      }
      
      // Fallback to designs endpoint if projects not available
      try {
        console.log('[ProjectApi] Trying designs endpoint...');
        const designsResponse = await apiFetch<ApiResponse>('/designs');
        if (designsResponse.data) {
          const designs = Array.isArray(designsResponse.data) ? designsResponse.data : [designsResponse.data];
          return {
            projects: designs.map(this.mapDesignToProject),
            total: designs.length
          };
        }
      } catch (designError) {
        console.warn('[ProjectApi] Designs endpoint also failed:', designError);
      }
      
      // Final fallback to mock data
      return this.getMockProjects();
    } catch (error) {
      console.warn('[ProjectApi] Failed to fetch projects:', error);
      return this.getMockProjects();
    }
  }

  // Get single project by ID
  async getProject(id: string): Promise<ConstructionProject | null> {
    try {
      const response = await apiFetch<ApiResponse>(`/projects/${id}`);
      
      if (response.data) {
        return this.mapApiProjectToLocal(response.data);
      }
      
      // Try designs endpoint
      try {
        const designResponse = await apiFetch<ApiResponse>(`/designs/${id}`);
        if (designResponse.data) {
          return this.mapDesignToProject(designResponse.data);
        }
      } catch (designError) {
        console.warn('[ProjectApi] Design endpoint failed:', designError);
      }
      
      return null;
    } catch (error) {
      console.warn('[ProjectApi] Failed to fetch project:', error);
      return null;
    }
  }

  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<ConstructionProject> {
    try {
      const response = await apiFetch<ApiResponse>('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      });

      if (response.data) {
        return this.mapApiProjectToLocal(response.data);
      }
      
      throw new Error('Failed to create project');
    } catch (error) {
      console.error('[ProjectApi] Failed to create project:', error);
      // Return a mock project for now
      return this.createMockProject(projectData);
    }
  }

  // Update project
  async updateProject(id: string, updates: UpdateProjectRequest): Promise<ConstructionProject> {
    try {
      const response = await apiFetch<ApiResponse>(`/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (response.data) {
        return this.mapApiProjectToLocal(response.data);
      }
      
      throw new Error('Failed to update project');
    } catch (error) {
      console.error('[ProjectApi] Failed to update project:', error);
      throw error;
    }
  }

  // Upload project file using the files/upload endpoint
  async uploadProjectFile(projectId: string, file: File | Blob, fileName: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file, fileName);
      formData.append('projectId', projectId);

      const response = await apiFetch<ApiResponse>('/files/upload', {
        method: 'POST',
        body: formData
      });

      if (response.url) {
        return response.url;
      }
      
      throw new Error('Failed to upload file');
    } catch (error) {
      console.error('[ProjectApi] Failed to upload file:', error);
      throw error;
    }
  }

  // Get project contacts using the contacts endpoint
  async getProjectContacts(): Promise<Array<{ id: string; name: string; email: string; phone?: string; role: string }>> {
    try {
      const response = await apiFetch<ApiResponse>('/contacts');
      
      if (response.data) {
        const contacts = Array.isArray(response.data) ? response.data : [response.data];
        return contacts.map((contact: any) => ({
          id: contact.id || contact._id,
          name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          email: contact.email,
          phone: contact.phone,
          role: contact.role || 'contact'
        }));
      }
      
      return [];
    } catch (error) {
      console.warn('[ProjectApi] Failed to fetch contacts:', error);
      return [];
    }
  }

  // Get project bookings using the bookings endpoint
  async getProjectBookings(projectId: string): Promise<Array<{ 
    id: string; 
    title: string; 
    date: string; 
    time: string; 
    status: string; 
    description?: string 
  }>> {
    try {
      const response = await apiFetch<ApiResponse>(`/bookings?projectId=${projectId}`);
      
      if (response.data) {
        const bookings = Array.isArray(response.data) ? response.data : [response.data];
        return bookings.map((booking: any) => ({
          id: booking.id,
          title: booking.title || 'Project Meeting',
          date: booking.date || booking.scheduledDate,
          time: booking.time || booking.scheduledTime,
          status: booking.status || 'scheduled',
          description: booking.description || booking.notes
        }));
      }
      
      return [];
    } catch (error) {
      console.warn('[ProjectApi] Failed to fetch bookings:', error);
      return [];
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    try {
      await apiFetch(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('[ProjectApi] Failed to update booking status:', error);
      throw error;
    }
  }

  // Helper method to map API response to ConstructionProject type
  private mapApiProjectToLocal(apiProject: any): ConstructionProject {
    return {
      id: apiProject.id || apiProject._id,
      project_code: apiProject.project_code || `PRJ-${Date.now()}`,
      project_name: apiProject.project_name || apiProject.title || apiProject.name,
      project_type: this.mapProjectType(apiProject.project_type || apiProject.type),
      description: apiProject.description,
      owner_id: apiProject.owner_id || apiProject.clientId || 'unknown',
      owner_name: apiProject.owner_name || apiProject.clientName || 'Unknown Client',
      assigned_admin_id: apiProject.assigned_admin_id,
      location: {
        address: apiProject.location?.address || apiProject.location || '',
        ward: apiProject.location?.ward || '',
        district: apiProject.location?.district || '',
        province: apiProject.location?.province || '',
        land_area: apiProject.location?.land_area || 0
      },
      land_documents: [],
      status: this.mapProjectStatus(apiProject.status),
      budget: {
        total_budget: apiProject.budget?.total_budget || apiProject.budget || 0,
        estimated_cost: apiProject.budget?.estimated_cost || apiProject.budget || 0,
        currency: 'VND'
      },
      timeline: {
        start_date: apiProject.startDate || apiProject.timeline?.start_date || new Date().toISOString(),
        estimated_end_date: apiProject.endDate || apiProject.timeline?.estimated_end_date || new Date().toISOString(),
        milestones: []
      },
      design_files: apiProject.design_files || [],
      photos: apiProject.photos || [],
      documents: apiProject.documents || [],
      created_at: apiProject.createdAt || new Date().toISOString(),
      updated_at: apiProject.updatedAt || new Date().toISOString(),
      created_by: apiProject.created_by || apiProject.createdBy || 'system',
      last_updated_by: apiProject.last_updated_by || apiProject.updatedBy || 'system'
    };
  }

  // Helper to map designs to projects
  private mapDesignToProject(design: any): ConstructionProject {
    return {
      id: design.id || design._id,
      project_code: `DES-${design.id}`,
      project_name: design.title || design.name,
      project_type: 'nha_o',
      description: design.description,
      owner_id: design.clientId || 'unknown',
      owner_name: design.clientName || 'Design Client',
      assigned_admin_id: design.designerId,
      location: {
        address: design.location || '',
        ward: '',
        district: '',
        province: '',
        land_area: 0
      },
      land_documents: [],
      status: 'draft',
      budget: {
        total_budget: design.budget || 0,
        estimated_cost: design.budget || 0,
        currency: 'VND'
      },
      timeline: {
        start_date: design.createdAt || new Date().toISOString(),
        estimated_end_date: design.deadline || new Date().toISOString(),
        milestones: []
      },
      design_files: [],
      photos: [],
      documents: [],
      created_at: design.createdAt || new Date().toISOString(),
      updated_at: design.updatedAt || new Date().toISOString(),
      created_by: design.designerId || 'system',
      last_updated_by: design.designerId || 'system'
    };
  }

  // Helper to map project types
  private mapProjectType(type: string): ProjectType {
    const typeMap: Record<string, ProjectType> = {
      'house': 'nha_o',
      'villa': 'biet_thu',
      'townhouse': 'nha_pho',
      'apartment': 'chung_cu',
      'office': 'van_phong',
      'commercial': 'thuong_mai',
      'industrial': 'cong_nghiep'
    };
    return typeMap[type] || 'nha_o';
  }

  // Helper to map project status
  private mapProjectStatus(status: string): ProjectStatus {
    const statusMap: Record<string, ProjectStatus> = {
      'planning': 'draft',
      'pending': 'pending_review',
      'active': 'in_progress',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'on_hold': 'on_hold'
    };
    return statusMap[status] || 'draft';
  }

  // Create mock project for fallback
  private createMockProject(data: CreateProjectRequest): ConstructionProject {
    const id = `mock-${Date.now()}`;
    return {
      id,
      project_code: `PRJ-${id}`,
      project_name: data.project_name,
      project_type: data.project_type,
      description: data.description,
      owner_id: 'mock-owner',
      owner_name: data.owner_name,
      location: {
        address: data.location || '',
        ward: '',
        district: '',
        province: '',
        land_area: 0
      },
      land_documents: [],
      status: 'draft',
      budget: {
        total_budget: data.budget || 0,
        estimated_cost: data.budget || 0,
        currency: 'VND'
      },
      timeline: {
        start_date: data.startDate || new Date().toISOString(),
        estimated_end_date: data.endDate || new Date().toISOString(),
        milestones: []
      },
      design_files: [],
      photos: [],
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system',
      last_updated_by: 'system'
    };
  }

  // Mock data fallback
  private getMockProjects(): { projects: ConstructionProject[]; total: number } {
    const mockProjects: ConstructionProject[] = [
      {
        id: 'proj-1',
        project_code: 'PRJ-VRS-001',
        project_name: 'Villa Resort Sơn Trà',
        project_type: 'biet_thu',
        description: 'Dự án xây dựng villa nghỉ dưỡng cao cấp tại bán đảo Sơn Trà',
        owner_id: 'owner-1',
        owner_name: 'Công ty Du lịch Sơn Trà',
        location: {
          address: 'Bán đảo Sơn Trà, Đà Nẵng',
          ward: 'Thọ Quang',
          district: 'Sơn Trà',
          province: 'Đà Nẵng',
          land_area: 5000
        },
        land_documents: [],
        status: 'in_progress',
        budget: {
          total_budget: 15000000000,
          estimated_cost: 15000000000,
          currency: 'VND'
        },
        timeline: {
          start_date: '2024-01-15',
          estimated_end_date: '2025-06-30',
          milestones: []
        },
        design_files: [],
        photos: [],
        documents: [],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
        created_by: 'system',
        last_updated_by: 'system'
      },
      {
        id: 'proj-2',
        project_code: 'PRJ-HMK-002',
        project_name: 'Khách sạn 5 sao Mỹ Khê',
        project_type: 'thuong_mai',
        description: 'Khách sạn 30 tầng với đầy đủ tiện nghi hiện đại',
        owner_id: 'owner-2',
        owner_name: 'Tập đoàn Khách sạn Mỹ Khê',
        location: {
          address: 'Bãi biển Mỹ Khê, Đà Nẵng',
          ward: 'Phước Mỹ',
          district: 'Sơn Trà',
          province: 'Đà Nẵng',
          land_area: 8000
        },
        land_documents: [],
        status: 'pending_review',
        budget: {
          total_budget: 25000000000,
          estimated_cost: 25000000000,
          currency: 'VND'
        },
        timeline: {
          start_date: '2025-03-01',
          estimated_end_date: '2027-12-31',
          milestones: []
        },
        design_files: [],
        photos: [],
        documents: [],
        created_at: '2024-11-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
        created_by: 'system',
        last_updated_by: 'system'
      }
    ];

    return { projects: mockProjects, total: mockProjects.length };
  }
}

export const enhancedProjectApiService = new EnhancedProjectApiService();