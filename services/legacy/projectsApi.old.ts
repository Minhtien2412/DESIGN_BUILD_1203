/**
 * Projects API Service
 * Based on FRONTEND-INTEGRATION-GUIDE.md
 * 
 * Endpoints:
 * - GET /api/projects - Get list of projects
 * - GET /api/projects/:id - Get project details
 * - POST /api/projects - Create new project
 * - PUT /api/projects/:id - Update project
 * - DELETE /api/projects/:id - Delete project
 */

import { del, get, post, put } from './apiClient';

// ============================================================================
// Types
// ============================================================================

export interface ProjectMember {
  userId: string;
  role: string;
  permissions: string[];
  fullName?: string;
  email?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  budget: number;
  startDate: string;
  endDate: string;
  owner: {
    id: string;
    fullName: string;
    email?: string;
  };
  members: ProjectMember[];
  createdAt: string;
  updatedAt?: string;
  progress?: number;
  category?: string;
  location?: string;
  images?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProjectsParams extends PaginationParams {
  status?: Project['status'];
  search?: string;
}

export interface ProjectsResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProjectData {
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  category?: string;
  location?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: Project['status'];
  progress?: number;
}

// ============================================================================
// Projects API Functions
// ============================================================================

/**
 * Get list of projects with pagination and filters
 */
export async function getProjects(params: ProjectsParams = {}): Promise<ProjectsResponse> {
  console.log('[ProjectsAPI] Fetching projects with params:', params);
  
  const response = await get<ProjectsResponse>('/api/projects', {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.status && { status: params.status }),
      ...(params.search && { search: params.search }),
    },
  });

  console.log('[ProjectsAPI] ✅ Fetched', response.data.length, 'projects');
  
  return response;
}

/**
 * Get project details by ID
 */
export async function getProject(id: string): Promise<Project> {
  console.log('[ProjectsAPI] Fetching project:', id);
  
  const response = await get<Project>(`/api/projects/${id}`);

  console.log('[ProjectsAPI] ✅ Project fetched:', response.name);
  
  return response;
}

/**
 * Create new project
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  console.log('[ProjectsAPI] Creating project:', data.name);
  
  const response = await post<Project>('/api/projects', data);

  console.log('[ProjectsAPI] ✅ Project created:', response.id);
  
  return response;
}

/**
 * Update existing project
 */
export async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  console.log('[ProjectsAPI] Updating project:', id);
  
  const response = await put<Project>(`/api/projects/${id}`, data);

  console.log('[ProjectsAPI] ✅ Project updated:', response.id);
  
  return response;
}

/**
 * Delete project
 */
export async function deleteProject(id: string): Promise<void> {
  console.log('[ProjectsAPI] Deleting project:', id);
  
  await del(`/api/projects/${id}`);

  console.log('[ProjectsAPI] ✅ Project deleted');
}

/**
 * Add member to project
 */
export async function addProjectMember(
  projectId: string,
  data: {
    userId: string;
    role: string;
    permissions: string[];
  }
): Promise<Project> {
  console.log('[ProjectsAPI] Adding member to project:', projectId);
  
  const response = await post<Project>(`/api/projects/${projectId}/members`, data);

  console.log('[ProjectsAPI] ✅ Member added to project');
  
  return response;
}

/**
 * Remove member from project
 */
export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  console.log('[ProjectsAPI] Removing member from project:', projectId);
  
  await del(`/api/projects/${projectId}/members/${userId}`);

  console.log('[ProjectsAPI] ✅ Member removed from project');
}

/**
 * Update project member permissions
 */
export async function updateProjectMember(
  projectId: string,
  userId: string,
  data: {
    role?: string;
    permissions?: string[];
  }
): Promise<Project> {
  console.log('[ProjectsAPI] Updating member permissions:', projectId, userId);
  
  const response = await put<Project>(`/api/projects/${projectId}/members/${userId}`, data);

  console.log('[ProjectsAPI] ✅ Member permissions updated');
  
  return response;
}

/**
 * Get project milestones
 */
export async function getProjectMilestones(projectId: string): Promise<any[]> {
  console.log('[ProjectsAPI] Fetching milestones for project:', projectId);
  
  const response = await get<{ data: any[] }>(`/api/projects/${projectId}/milestones`);

  return response.data;
}

/**
 * Get project tasks
 */
export async function getProjectTasks(projectId: string): Promise<any[]> {
  console.log('[ProjectsAPI] Fetching tasks for project:', projectId);
  
  const response = await get<{ data: any[] }>(`/api/projects/${projectId}/tasks`);

  return response.data;
}

/**
 * Get project files/documents
 */
export async function getProjectFiles(projectId: string): Promise<any[]> {
  console.log('[ProjectsAPI] Fetching files for project:', projectId);
  
  const response = await get<{ data: any[] }>(`/api/projects/${projectId}/files`);

  return response.data;
}

// ============================================================================
// Export
// ============================================================================

export default {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateProjectMember,
  getProjectMilestones,
  getProjectTasks,
  getProjectFiles,
};
