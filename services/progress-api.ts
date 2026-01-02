/**
 * Construction Progress API Service
 * API endpoints for managing construction progress with role-based access
 */

import type {
    AddCommentDto,
    AssignMemberDto,
    ConfirmTaskDto,
    ConstructionProject,
    ConstructionTask,
    CreateProjectDto,
    CreateTaskDto,
    ProgressRole,
    ProjectMember,
    ProjectReview,
    SubmitReviewDto,
    TaskComment,
    UpdateProjectDto,
    UpdateTaskStatusDto,
} from '@/types/construction-progress';
import { apiFetch } from './api';

const BASE_PATH = '/construction-progress';

// ==================== PROJECTS ====================

/**
 * Get all projects for current user (filtered by role)
 */
export async function getProjects(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ projects: ConstructionProject[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const query = queryParams.toString();
  return apiFetch(`${BASE_PATH}/projects${query ? `?${query}` : ''}`);
}

/**
 * Get project by ID
 */
export async function getProject(projectId: string): Promise<ConstructionProject> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}`);
}

/**
 * Create new project (Manager only)
 */
export async function createProject(dto: CreateProjectDto): Promise<ConstructionProject> {
  return apiFetch(`${BASE_PATH}/projects`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Update project (Manager/Engineer)
 */
export async function updateProject(
  projectId: string, 
  dto: UpdateProjectDto
): Promise<ConstructionProject> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

/**
 * Delete project (Manager only)
 */
export async function deleteProject(projectId: string): Promise<void> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}`, {
    method: 'DELETE',
  });
}

// ==================== PROJECT MEMBERS ====================

/**
 * Get project members
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}/members`);
}

/**
 * Assign member to project (Manager only)
 */
export async function assignMember(dto: AssignMemberDto): Promise<ProjectMember> {
  return apiFetch(`${BASE_PATH}/projects/${dto.projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId: dto.userId, role: dto.role }),
  });
}

/**
 * Update member role (Manager only)
 */
export async function updateMemberRole(
  projectId: string,
  memberId: string,
  role: ProgressRole
): Promise<ProjectMember> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

/**
 * Remove member from project (Manager only)
 */
export async function removeMember(projectId: string, memberId: string): Promise<void> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

// ==================== TASKS ====================

/**
 * Get project tasks
 */
export async function getProjectTasks(projectId: string): Promise<ConstructionTask[]> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}/tasks`);
}

/**
 * Get task by ID
 */
export async function getTask(taskId: string): Promise<ConstructionTask> {
  return apiFetch(`${BASE_PATH}/tasks/${taskId}`);
}

/**
 * Create new task (Manager/Engineer)
 */
export async function createTask(dto: CreateTaskDto): Promise<ConstructionTask> {
  return apiFetch(`${BASE_PATH}/projects/${dto.projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Update task details (Manager/Engineer)
 */
export async function updateTask(
  taskId: string,
  dto: Partial<CreateTaskDto>
): Promise<ConstructionTask> {
  return apiFetch(`${BASE_PATH}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

/**
 * Update task status (role-based)
 * - Contractor: Can update IN_PROGRESS, PENDING_CHECK
 * - Engineer: Can update COMPLETED
 * - Client: Can update APPROVED
 */
export async function updateTaskStatus(dto: UpdateTaskStatusDto): Promise<ConstructionTask> {
  return apiFetch(`${BASE_PATH}/tasks/${dto.taskId}/status`, {
    method: 'POST',
    body: JSON.stringify({
      status: dto.status,
      note: dto.note,
      mediaIds: dto.mediaIds,
    }),
  });
}

/**
 * Update task progress percent (Contractor)
 */
export async function updateTaskProgress(
  taskId: string,
  progressPercent: number,
  note?: string
): Promise<ConstructionTask> {
  return apiFetch(`${BASE_PATH}/tasks/${taskId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ progressPercent, note }),
  });
}

/**
 * Delete task (Manager only)
 */
export async function deleteTask(taskId: string): Promise<void> {
  return apiFetch(`${BASE_PATH}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

// ==================== TASK CONFIRMATIONS ====================

/**
 * Confirm task (role-based confirmations like Shopee)
 * - CONTRACTOR_CONFIRM: Contractor confirms work is done
 * - ENGINEER_CHECK: Engineer confirms quality check
 * - CLIENT_APPROVE: Client confirms final approval
 */
export async function confirmTask(dto: ConfirmTaskDto): Promise<ConstructionTask> {
  return apiFetch(`${BASE_PATH}/tasks/${dto.taskId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      type: dto.type,
      status: dto.status,
      note: dto.note,
      mediaIds: dto.mediaIds,
    }),
  });
}

// ==================== COMMENTS ====================

/**
 * Get task comments
 */
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  return apiFetch(`${BASE_PATH}/tasks/${taskId}/comments`);
}

/**
 * Add comment to task
 */
export async function addComment(dto: AddCommentDto): Promise<TaskComment> {
  return apiFetch(`${BASE_PATH}/tasks/${dto.taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      content: dto.content,
      mediaIds: dto.mediaIds,
    }),
  });
}

/**
 * Delete comment (own comment only)
 */
export async function deleteComment(taskId: string, commentId: string): Promise<void> {
  return apiFetch(`${BASE_PATH}/tasks/${taskId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

// ==================== REVIEWS ====================

/**
 * Get project reviews
 */
export async function getProjectReviews(projectId: string): Promise<ProjectReview[]> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}/reviews`);
}

/**
 * Submit project review (Client only, after completion)
 */
export async function submitReview(dto: SubmitReviewDto): Promise<ProjectReview> {
  return apiFetch(`${BASE_PATH}/projects/${dto.projectId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

// ==================== MEDIA ====================

/**
 * Upload media for task
 */
export async function uploadTaskMedia(
  taskId: string,
  formData: FormData
): Promise<{ id: string; url: string }[]> {
  return apiFetch(`${BASE_PATH}/tasks/${taskId}/media`, {
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type, let browser set it with boundary
    },
  });
}

// ==================== STATISTICS ====================

/**
 * Get project statistics
 */
export async function getProjectStats(projectId: string): Promise<{
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  progressPercent: number;
  daysRemaining: number;
  daysElapsed: number;
}> {
  return apiFetch(`${BASE_PATH}/projects/${projectId}/stats`);
}

/**
 * Get user's dashboard stats
 */
export async function getDashboardStats(): Promise<{
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingActions: number;
  recentActivities: {
    id: string;
    type: string;
    message: string;
    projectId: string;
    projectName: string;
    createdAt: string;
  }[];
}> {
  return apiFetch(`${BASE_PATH}/dashboard`);
}

// ==================== EXPORT ====================

export const progressApi = {
  // Projects
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  
  // Members
  getProjectMembers,
  assignMember,
  updateMemberRole,
  removeMember,
  
  // Tasks
  getProjectTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTaskProgress,
  deleteTask,
  
  // Confirmations
  confirmTask,
  
  // Comments
  getTaskComments,
  addComment,
  deleteComment,
  
  // Reviews
  getProjectReviews,
  submitReview,
  
  // Media
  uploadTaskMedia,
  
  // Statistics
  getProjectStats,
  getDashboardStats,
};

export default progressApi;
