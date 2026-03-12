/**
 * Project Service
 * Handles project management endpoints
 * 
 * Endpoints:
 * - GET /projects - List projects (paginated, with filters)
 * - POST /projects - Create project
 * - GET /projects/{id} - Get project details
 * - PUT /projects/{id} - Update project
 * - DELETE /projects/{id} - Delete project
 * - POST /projects/{id}/assign-client - Assign client to project
 * - POST /projects/{id}/assign-engineer - Assign engineer to project
 * - GET /projects/{id}/timeline - Get project timeline
 */

import { apiClient } from './client';
import type {
    AssignUserData,
    CreateProjectData,
    PaginatedResponse,
    Project,
    ProjectFilters,
    ProjectTimeline,
    UpdateProjectData,
} from './types';

export const projectService = {
  /**
   * Get paginated list of projects with filters
   * GET /projects
   */
  list: async (filters?: ProjectFilters): Promise<PaginatedResponse<Project>> => {
    console.log('[ProjectService] 📋 Fetching projects with filters:', filters);
    
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.clientId) params.clientId = String(filters.clientId);
    if (filters?.engineerId) params.engineerId = String(filters.engineerId);
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);

    const response = await apiClient.get<any>('/projects', params);
    
    // Handle different response formats from backend
    if (Array.isArray(response)) {
      console.log('[ProjectService] ✅ Projects fetched (array format):', response.length);
      return {
        data: response,
        meta: {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          total: response.length,
          totalPages: 1,
        },
      };
    }
    
    console.log('[ProjectService] ✅ Projects fetched:', response.meta?.total || response.data?.length || 0, 'total');
    return response as PaginatedResponse<Project>;
  },

  /**
   * Get project by ID
   * GET /projects/{id}
   */
  getById: async (id: number): Promise<Project> => {
    console.log('[ProjectService] 🏗️ Fetching project:', id);
    
    const response = await apiClient.get<Project>(`/projects/${id}`);
    
    console.log('[ProjectService] ✅ Project fetched:', response.name);
    return response;
  },

  /**
   * Create new project
   * POST /projects
   */
  create: async (data: CreateProjectData): Promise<Project> => {
    console.log('[ProjectService] ➕ Creating project:', data.name);
    
    const response = await apiClient.post<Project>('/projects', data);
    
    console.log('[ProjectService] ✅ Project created:', response.id);
    return response;
  },

  /**
   * Update project
   * PUT /projects/{id}
   */
  update: async (id: number, data: UpdateProjectData): Promise<Project> => {
    console.log('[ProjectService] ✏️ Updating project:', id);
    
    const response = await apiClient.put<Project>(`/projects/${id}`, data);
    
    console.log('[ProjectService] ✅ Project updated');
    return response;
  },

  /**
   * Delete project
   * DELETE /projects/{id}
   */
  delete: async (id: number): Promise<void> => {
    console.log('[ProjectService] 🗑️ Deleting project:', id);
    
    await apiClient.delete(`/projects/${id}`);
    
    console.log('[ProjectService] ✅ Project deleted');
  },

  /**
   * Assign client to project
   * POST /projects/{id}/assign-client
   */
  assignClient: async (projectId: number, data: AssignUserData): Promise<Project> => {
    console.log('[ProjectService] 👤 Assigning client to project:', projectId);
    
    const response = await apiClient.post<Project>(`/projects/${projectId}/assign-client`, data);
    
    console.log('[ProjectService] ✅ Client assigned');
    return response;
  },

  /**
   * Assign engineer to project
   * POST /projects/{id}/assign-engineer
   */
  assignEngineer: async (projectId: number, data: AssignUserData): Promise<Project> => {
    console.log('[ProjectService] 👷 Assigning engineer to project:', projectId);
    
    const response = await apiClient.post<Project>(`/projects/${projectId}/assign-engineer`, data);
    
    console.log('[ProjectService] ✅ Engineer assigned');
    return response;
  },

  /**
   * Get project timeline
   * GET /projects/{id}/timeline
   */
  getTimeline: async (projectId: number): Promise<ProjectTimeline> => {
    console.log('[ProjectService] 📅 Fetching project timeline:', projectId);
    
    const response = await apiClient.get<ProjectTimeline>(`/projects/${projectId}/timeline`);
    
    console.log('[ProjectService] ✅ Timeline fetched:', response.phases.length, 'phases');
    return response;
  },
};

export default projectService;
