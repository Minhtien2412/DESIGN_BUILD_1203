/**
 * Tasks API Service
 * Backend: https://baotienweb.cloud/api/v1/tasks
 * 
 * Endpoints:
 * - POST /api/v1/tasks - Create a new task
 * - GET /api/v1/tasks - Get all tasks (optional projectId filter)
 * - GET /api/v1/tasks/:id - Get task by ID
 * - PUT /api/v1/tasks/:id - Update task
 * - DELETE /api/v1/tasks/:id - Delete task
 * - GET /api/v1/tasks/:id/progress - Get task progress
 */

import { apiFetch } from './api';

// ============================================================================
// Types
// ============================================================================

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId?: number;
  createdById: number;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  tags?: string[];
  attachments?: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    title: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId: number;
  assigneeId?: number;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  tags?: string[];
}

export interface TaskProgress {
  taskId: number;
  progress: number;
  status: TaskStatus;
  estimatedHours?: number;
  actualHours?: number;
  completedSubtasks: number;
  totalSubtasks: number;
}

export interface TasksResponse {
  data: Task[];
  total?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskDto): Promise<Task> {
  console.log('[TasksAPI] Creating task:', data.title);
  
  const response = await apiFetch<Task>('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  console.log('[TasksAPI] ✅ Task created:', response.id);
  return response;
}

/**
 * Get all tasks with optional project filter
 */
export async function getTasks(projectId?: number): Promise<Task[]> {
  console.log('[TasksAPI] Fetching tasks', projectId ? `for project ${projectId}` : '');
  
  const url = projectId 
    ? `/api/v1/tasks?projectId=${projectId}` 
    : '/api/v1/tasks';
  
  const response = await apiFetch<Task[] | TasksResponse>(url);
  
  // Handle both array and paginated response
  const tasks = Array.isArray(response) ? response : response.data;
  
  console.log('[TasksAPI] ✅ Fetched', tasks.length, 'tasks');
  return tasks;
}

/**
 * Get task by ID
 */
export async function getTask(id: number): Promise<Task> {
  console.log('[TasksAPI] Fetching task:', id);
  
  const response = await apiFetch<Task>(`/api/v1/tasks/${id}`);

  console.log('[TasksAPI] ✅ Task fetched:', response.title);
  return response;
}

/**
 * Update task
 */
export async function updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
  console.log('[TasksAPI] Updating task:', id);
  
  const response = await apiFetch<Task>(`/api/v1/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  console.log('[TasksAPI] ✅ Task updated:', response.id);
  return response;
}

/**
 * Delete task
 */
export async function deleteTask(id: number): Promise<void> {
  console.log('[TasksAPI] Deleting task:', id);
  
  await apiFetch(`/api/v1/tasks/${id}`, {
    method: 'DELETE',
  });

  console.log('[TasksAPI] ✅ Task deleted:', id);
}

/**
 * Get task progress
 */
export async function getTaskProgress(id: number): Promise<TaskProgress> {
  console.log('[TasksAPI] Fetching task progress:', id);
  
  const response = await apiFetch<TaskProgress>(`/api/v1/tasks/${id}/progress`);

  console.log('[TasksAPI] ✅ Task progress:', response.progress, '%');
  return response;
}

/**
 * Update task status (convenience method)
 */
export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  return updateTask(id, { status });
}

/**
 * Update task progress (convenience method)
 */
export async function updateTaskProgress(id: number, progress: number): Promise<Task> {
  return updateTask(id, { progress: Math.min(100, Math.max(0, progress)) });
}

/**
 * Assign task to user
 */
export async function assignTask(id: number, assigneeId: number): Promise<Task> {
  return updateTask(id, { assigneeId });
}

/**
 * Complete task (convenience method)
 */
export async function completeTask(id: number): Promise<Task> {
  return updateTask(id, { 
    status: 'COMPLETED',
    progress: 100,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Add attachment to task
 */
export async function addTaskAttachment(
  taskId: number,
  fileUrl: string,
  fileName: string,
  fileSize: number,
  mimeType: string
): Promise<TaskAttachment> {
  console.log('[TasksAPI] Adding attachment to task:', taskId);
  
  const response = await apiFetch<TaskAttachment>(`/api/v1/tasks/${taskId}/attachments`, {
    method: 'POST',
    body: JSON.stringify({
      fileUrl,
      fileName,
      fileSize,
      mimeType,
    }),
  });

  console.log('[TasksAPI] ✅ Attachment added:', fileName);
  return response;
}

/**
 * Get task attachments
 */
export async function getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
  console.log('[TasksAPI] Fetching attachments for task:', taskId);
  
  const response = await apiFetch<TaskAttachment[]>(`/api/v1/tasks/${taskId}/attachments`);

  console.log('[TasksAPI] ✅ Fetched', response.length, 'attachments');
  return response;
}

/**
 * Delete task attachment
 */
export async function deleteTaskAttachment(taskId: number, attachmentId: string): Promise<void> {
  console.log('[TasksAPI] Deleting attachment:', attachmentId);
  
  await apiFetch(`/api/v1/tasks/${taskId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });

  console.log('[TasksAPI] ✅ Attachment deleted');
}

// ============================================================================
// Export
// ============================================================================

export default {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskProgress,
  updateTaskStatus,
  updateTaskProgress,
  assignTask,
  completeTask,
  addTaskAttachment,
  getTaskAttachments,
  deleteTaskAttachment,
};
