/**
 * Projects API Client
 * Backend: https://baotienweb.cloud/api/v1/projects
 */

import { getItem } from '@/utils/storage';
import ENV from '../../config/env';
import { apiFetch } from '../api';

const BASE_URL = `${ENV.API_BASE_URL}/projects`;

// ==================== TYPES ====================

export interface Project {
  id: number;
  title: string;
  description: string | null;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  images: string[]; // NEW - array of image URLs
  clientId: number | null;
  engineerId: number | null; // NEW
  client: {
    id: number;
    name: string;
    email: string;
  } | null;
  engineer: { // NEW
    id: number;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    tasks: number;
    comments: number;
    files: number;
  };
}

export interface ProjectListResponse {
  value: Project[];
  Count: number;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  status?: Project['status'];
  budget?: number;
  startDate?: string;
  endDate?: string;
}

// ==================== AUTH HELPER ====================

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ==================== API METHODS ====================

/**
 * Get all projects for current user
 * Endpoint: GET /projects
 */
export async function getProjects(): Promise<ProjectListResponse> {
  const response = await apiFetch<ProjectListResponse>('/projects');
  return response;
}

/**
 * Get a single project by ID
 * Endpoint: GET /projects/:id
 */
export async function getProject(id: number): Promise<Project> {
  return await apiFetch<Project>(`/projects/${id}`);
}

/**
 * Create a new project
 * Endpoint: POST /projects
 */
export async function createProject(dto: CreateProjectDto): Promise<Project> {
  return await apiFetch<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

/**
 * Update a project
 * Endpoint: PATCH /projects/:id
 */
export async function updateProject(id: number, dto: UpdateProjectDto): Promise<Project> {
  return await apiFetch<Project>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto)
  });
}

/**
 * Delete a project
 * Endpoint: DELETE /projects/:id
 */
export async function deleteProject(id: number): Promise<void> {
  await apiFetch<void>(`/projects/${id}`, {
    method: 'DELETE'
  });
}

// ==================== EXPORTS ====================

export const projectsApi = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};

export default projectsApi;
