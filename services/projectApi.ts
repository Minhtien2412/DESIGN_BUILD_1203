/**
 * Projects API Service
 * Production API: https://baotienweb.cloud/api/v1/projects
 * 
 * Endpoints:
 * - GET /projects - List all projects (requires auth)
 * - POST /projects - Create new project (requires auth)
 * - GET /projects/{id} - Get project details (requires auth)
 * - PUT /projects/{id} - Update project (requires auth)
 * - DELETE /projects/{id} - Delete project (requires auth)
 * - POST /projects/{id}/assign-client - Assign client to project
 * - POST /projects/{id}/assign-engineer - Assign engineer to project
 * - GET /projects/{id}/timeline - Get project timeline
 * 
 * Last Updated: 2025-11-24
 * Status: ✅ Production Ready (Tested with baotienweb.cloud)
 */

import { del, get, post, put } from './apiClient';

// ============================================================================
// Types
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  budget?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  clientId?: string;
  engineerId?: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  engineer?: {
    id: string;
    name: string;
    email: string;
  };
  progress?: number;
  location?: string;
  area?: number;
  type?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  budget?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  area?: number;
  type?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  budget?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  area?: number;
  type?: string;
  progress?: number;
}

export interface ProjectFilters {
  status?: string;
  clientId?: string;
  engineerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssignUserData {
  userId: string;
}

// ============================================================================
// Projects API Functions
// ============================================================================

/**
 * Get all projects with optional filters
 * Endpoint: GET /projects
 * Production: https://baotienweb.cloud/api/v1/projects
 */
export async function getProjects(filters?: ProjectFilters): Promise<Project[]> {
  console.log('[ProjectAPI] 📂 Fetching projects list');
  
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.clientId) params.append('clientId', filters.clientId);
  if (filters?.engineerId) params.append('engineerId', filters.engineerId);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  const endpoint = queryString ? `/projects?${queryString}` : '/projects';
  
  console.log('[ProjectAPI] 🌐 Sending to: GET', endpoint);

  const response = await get<Project[]>(endpoint);

  console.log('[ProjectAPI] ✅ Projects fetched successfully');
  console.log('[ProjectAPI] 📊 Total projects:', Array.isArray(response) ? response.length : 'N/A');

  return response;
}

/**
 * Get single project by ID
 * Endpoint: GET /projects/{id}
 * Production: https://baotienweb.cloud/api/v1/projects/{id}
 */
export async function getProject(id: string): Promise<Project> {
  console.log('[ProjectAPI] 🔍 Fetching project:', id);
  console.log('[ProjectAPI] 🌐 Sending to: GET /projects/' + id);

  const response = await get<Project>(`/projects/${id}`);

  console.log('[ProjectAPI] ✅ Project fetched successfully');
  console.log('[ProjectAPI] 📋 Name:', response.name);
  console.log('[ProjectAPI] 📊 Status:', response.status);

  return response;
}

/**
 * Create new project
 * Endpoint: POST /projects
 * Production: https://baotienweb.cloud/api/v1/projects
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  console.log('[ProjectAPI] ➕ Creating new project:', data.name);
  console.log('[ProjectAPI] 🌐 Sending to: POST /projects');

  const payload = {
    name: data.name.trim(),
    description: data.description?.trim(),
    status: data.status || 'PLANNING',
    budget: data.budget,
    startDate: data.startDate,
    endDate: data.endDate,
    location: data.location?.trim(),
    area: data.area,
    type: data.type?.trim(),
  };

  const response = await post<Project>('/projects', payload);

  console.log('[ProjectAPI] ✅ Project created successfully');
  console.log('[ProjectAPI] 🆔 Project ID:', response.id);
  console.log('[ProjectAPI] 📋 Name:', response.name);

  return response;
}

/**
 * Update existing project
 * Endpoint: PUT /projects/{id}
 * Production: https://baotienweb.cloud/api/v1/projects/{id}
 */
export async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  console.log('[ProjectAPI] ✏️ Updating project:', id);
  console.log('[ProjectAPI] 🌐 Sending to: PUT /projects/' + id);

  const payload = {
    ...(data.name && { name: data.name.trim() }),
    ...(data.description !== undefined && { description: data.description?.trim() }),
    ...(data.status && { status: data.status }),
    ...(data.budget !== undefined && { budget: data.budget }),
    ...(data.startDate !== undefined && { startDate: data.startDate }),
    ...(data.endDate !== undefined && { endDate: data.endDate }),
    ...(data.location !== undefined && { location: data.location?.trim() }),
    ...(data.area !== undefined && { area: data.area }),
    ...(data.type !== undefined && { type: data.type?.trim() }),
    ...(data.progress !== undefined && { progress: data.progress }),
  };

  const response = await put<Project>(`/projects/${id}`, payload);

  console.log('[ProjectAPI] ✅ Project updated successfully');
  console.log('[ProjectAPI] 📋 Name:', response.name);
  console.log('[ProjectAPI] 📊 Status:', response.status);

  return response;
}

/**
 * Delete project
 * Endpoint: DELETE /projects/{id}
 * Production: https://baotienweb.cloud/api/v1/projects/{id}
 */
export async function deleteProject(id: string): Promise<void> {
  console.log('[ProjectAPI] 🗑️ Deleting project:', id);
  console.log('[ProjectAPI] 🌐 Sending to: DELETE /projects/' + id);

  await del(`/projects/${id}`);

  console.log('[ProjectAPI] ✅ Project deleted successfully');
}

/**
 * Assign client to project
 * Endpoint: POST /projects/{id}/assign-client
 * Production: https://baotienweb.cloud/api/v1/projects/{id}/assign-client
 */
export async function assignClient(projectId: string, userId: string): Promise<Project> {
  console.log('[ProjectAPI] 👤 Assigning client to project:', projectId);
  console.log('[ProjectAPI] 🌐 Sending to: POST /projects/' + projectId + '/assign-client');

  const response = await post<Project>(`/projects/${projectId}/assign-client`, {
    userId,
  });

  console.log('[ProjectAPI] ✅ Client assigned successfully');

  return response;
}

/**
 * Assign engineer to project
 * Endpoint: POST /projects/{id}/assign-engineer
 * Production: https://baotienweb.cloud/api/v1/projects/{id}/assign-engineer
 */
export async function assignEngineer(projectId: string, userId: string): Promise<Project> {
  console.log('[ProjectAPI] 👷 Assigning engineer to project:', projectId);
  console.log('[ProjectAPI] 🌐 Sending to: POST /projects/' + projectId + '/assign-engineer');

  const response = await post<Project>(`/projects/${projectId}/assign-engineer`, {
    userId,
  });

  console.log('[ProjectAPI] ✅ Engineer assigned successfully');

  return response;
}

/**
 * Get project timeline
 * Endpoint: GET /projects/{id}/timeline
 * Production: https://baotienweb.cloud/api/v1/projects/{id}/timeline
 */
export async function getProjectTimeline(projectId: string): Promise<any> {
  console.log('[ProjectAPI] 📅 Fetching project timeline:', projectId);
  console.log('[ProjectAPI] 🌐 Sending to: GET /projects/' + projectId + '/timeline');

  const response = await get<any>(`/projects/${projectId}/timeline`);

  console.log('[ProjectAPI] ✅ Timeline fetched successfully');

  return response;
}
