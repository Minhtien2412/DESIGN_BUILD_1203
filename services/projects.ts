/**
 * Projects API Service
 * Kết nối với backend API: https://api.thietkeresort.com.vn/projects
 * 
 * Backend endpoints:
 * - GET    /projects       - List all projects with filters
 * - GET    /projects/:id   - Get project details
 * - POST   /projects       - Create new project
 * - PUT    /projects/:id   - Update project
 * - DELETE /projects/:id   - Delete project (soft delete)
 * - GET    /projects/stats - Get project statistics
 */

import { apiFetch } from './api';

// ============================================================================
// Type Definitions
// ============================================================================

export type ProjectStatus = 
  | 'planning'      // Đang lên kế hoạch
  | 'design'        // Đang thiết kế
  | 'bidding'       // Đang đấu thầu
  | 'in_progress'   // Đang thi công
  | 'paused'        // Tạm dừng
  | 'completed'     // Hoàn thành
  | 'cancelled';    // Đã hủy

export type ProjectType = 
  | 'villa'         // Biệt thự
  | 'resort'        // Khu nghỉ dưỡng
  | 'hotel'         // Khách sạn
  | 'restaurant'    // Nhà hàng
  | 'office'        // Văn phòng
  | 'apartment'     // Chung cư
  | 'commercial'    // Thương mại
  | 'residential'   // Dân cư
  | 'other';        // Khác

export interface Project {
  id: number;
  name: string;
  client_name?: string;
  project_type: ProjectType;
  status: ProjectStatus;
  budget?: number;
  location?: string;
  address?: string;
  area?: number;              // Diện tích (m²)
  start_date?: string;        // ISO date
  end_date?: string;          // ISO date
  completion_date?: string;   // ISO date
  description?: string;
  notes?: string;
  images?: string[];          // Array of image URLs
  thumbnail?: string;         // Main project image
  progress_percentage?: number; // 0-100
  team_members?: number[];    // User IDs
  owner_id?: number;          // Project owner/manager user ID
  created_at?: string;        // ISO date
  updated_at?: string;        // ISO date
  deleted_at?: string | null; // Soft delete timestamp
}

export interface ProjectFilters {
  status?: ProjectStatus | ProjectStatus[];
  project_type?: ProjectType | ProjectType[];
  owner_id?: number;
  search?: string;            // Search by name, client, location
  budget_min?: number;
  budget_max?: number;
  start_date_from?: string;   // ISO date
  start_date_to?: string;     // ISO date
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'budget' | 'start_date';
  sort_order?: 'asc' | 'desc';
}

export interface ProjectStats {
  total: number;
  by_status: Record<ProjectStatus, number>;
  by_type: Record<ProjectType, number>;
  total_budget: number;
  active_count: number;
  completed_count: number;
}

export interface CreateProjectData {
  name: string;
  client_name?: string;
  project_type: ProjectType;
  status?: ProjectStatus;
  budget?: number;
  location?: string;
  address?: string;
  area?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  notes?: string;
  images?: string[];
  thumbnail?: string;
  team_members?: number[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  progress_percentage?: number;
  completion_date?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Lấy danh sách projects với filter và pagination
 */
export async function fetchProjects(
  filters?: ProjectFilters
): Promise<PaginatedResponse<Project>> {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        statuses.forEach(s => params.append('status', s));
      }
      if (filters.project_type) {
        const types = Array.isArray(filters.project_type) ? filters.project_type : [filters.project_type];
        types.forEach(t => params.append('project_type', t));
      }
      if (filters.owner_id) params.append('owner_id', filters.owner_id.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.budget_min) params.append('budget_min', filters.budget_min.toString());
      if (filters.budget_max) params.append('budget_max', filters.budget_max.toString());
      if (filters.start_date_from) params.append('start_date_from', filters.start_date_from);
      if (filters.start_date_to) params.append('start_date_to', filters.start_date_to);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
    }

    const queryString = params.toString();
    const url = queryString ? `/projects?${queryString}` : '/projects';
    
    const response = await apiFetch<PaginatedResponse<Project>>(url);
    return response;
  } catch (error) {
    console.error('[ProjectsService] Error fetching projects:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết một project theo ID
 */
export async function getProjectDetails(id: number): Promise<Project> {
  try {
    const project = await apiFetch<Project>(`/projects/${id}`);
    return project;
  } catch (error) {
    console.error(`[ProjectsService] Error fetching project ${id}:`, error);
    throw error;
  }
}

/**
 * Tạo project mới
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  try {
    const project = await apiFetch<Project>('/projects', {
      method: 'POST',
      data,
    });
    return project;
  } catch (error) {
    console.error('[ProjectsService] Error creating project:', error);
    throw error;
  }
}

/**
 * Cập nhật project (partial update theo BACKEND_API_SPECS)
 * PATCH /projects/:id
 */
export async function updateProject(
  id: number,
  data: UpdateProjectData
): Promise<Project> {
  try {
    const project = await apiFetch<Project>(`/projects/${id}`, {
      method: 'PATCH',  // Changed to PATCH per backend specs
      data,
    });
    return project;
  } catch (error) {
    console.error(`[ProjectsService] Error updating project ${id}:`, error);
    throw error;
  }
}

/**
 * Update project status only
 * PATCH /projects/:id/status
 */
export async function updateProjectStatus(
  id: number,
  status: ProjectStatus
): Promise<Project> {
  try {
    const project = await apiFetch<Project>(`/projects/${id}`, {
      method: 'PATCH',
      data: { status },
    });
    return project;
  } catch (error) {
    console.error(`[ProjectsService] Error updating project status ${id}:`, error);
    throw error;
  }
}

/**
 * Xóa project (soft delete)
 */
export async function deleteProject(id: number): Promise<boolean> {
  try {
    await apiFetch(`/projects/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`[ProjectsService] Error deleting project ${id}:`, error);
    throw error;
  }
}

/**
 * Lấy thống kê projects
 */
export async function getProjectStats(): Promise<ProjectStats> {
  try {
    const stats = await apiFetch<ProjectStats>('/projects/stats');
    return stats;
  } catch (error) {
    console.error('[ProjectsService] Error fetching project stats:', error);
    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format project status to Vietnamese
 */
export function formatProjectStatus(status: ProjectStatus): string {
  const statusMap: Record<ProjectStatus, string> = {
    planning: 'Đang lên kế hoạch',
    design: 'Đang thiết kế',
    bidding: 'Đang đấu thầu',
    in_progress: 'Đang thi công',
    paused: 'Tạm dừng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };
  return statusMap[status] || status;
}

/**
 * Format project type to Vietnamese
 */
export function formatProjectType(type: ProjectType): string {
  const typeMap: Record<ProjectType, string> = {
    villa: 'Biệt thự',
    resort: 'Khu nghỉ dưỡng',
    hotel: 'Khách sạn',
    restaurant: 'Nhà hàng',
    office: 'Văn phòng',
    apartment: 'Chung cư',
    commercial: 'Thương mại',
    residential: 'Dân cư',
    other: 'Khác',
  };
  return typeMap[type] || type;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: ProjectStatus): string {
  const colorMap: Record<ProjectStatus, string> = {
    planning: '#3B82F6',    // Blue
    design: '#666666',      // Purple
    bidding: '#0066CC',     // Amber
    in_progress: '#0066CC', // Green
    paused: '#6B7280',      // Gray
    completed: '#0066CC',   // Emerald
    cancelled: '#000000',   // Red
  };
  return colorMap[status] || '#6B7280';
}

/**
 * Format budget to VND currency
 */
export function formatBudget(budget?: number): string {
  if (!budget) return 'Chưa xác định';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(budget);
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date?: string): string {
  if (!date) return 'Chưa xác định';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Calculate project progress status message
 */
export function getProgressMessage(progress?: number): string {
  if (progress === undefined || progress === null) return 'Chưa cập nhật';
  if (progress === 0) return 'Chưa bắt đầu';
  if (progress === 100) return 'Hoàn thành';
  return `${progress}% hoàn thành`;
}
