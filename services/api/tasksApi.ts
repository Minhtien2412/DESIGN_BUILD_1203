/**
 * Tasks API Client
 * Backend: https://baotienweb.cloud/api/v1/tasks
 */

import { getItem } from '@/utils/storage';
import ENV from '../../config/env';
import { apiFetch } from '../api';

const BASE_URL = `${ENV.API_BASE_URL}/tasks`;

// ==================== TYPES ====================

export interface TaskListResponse {
  value: Task[];
  Count: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: number;
  assignedToId: number | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    title: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: number;
  assignedToId?: number;
  priority?: Task['priority'];
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignedToId?: number;
  dueDate?: string;
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
 * Get all tasks (optionally filtered by project)
 * Endpoint: GET /tasks?projectId=123
 */
export async function getTasks(projectId?: number): Promise<TaskListResponse> {
  const params = projectId ? `?projectId=${projectId}` : '';
  return await apiFetch<TaskListResponse>(`/tasks${params}`);
}

/**
 * Get a single task by ID
 * Endpoint: GET /tasks/:id
 */
export async function getTask(id: number): Promise<Task> {
  return await apiFetch<Task>(`/tasks/${id}`);
}

/**
 * Create a new task
 * Endpoint: POST /tasks
 */
export async function createTask(dto: CreateTaskDto): Promise<Task> {
  return await apiFetch<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

/**
 * Update a task
 * Endpoint: PATCH /tasks/:id
 */
export async function updateTask(id: number, dto: UpdateTaskDto): Promise<Task> {
  return await apiFetch<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto)
  });
}

/**
 * Delete a task
 * Endpoint: DELETE /tasks/:id
 */
export async function deleteTask(id: number): Promise<void> {
  await apiFetch<void>(`/tasks/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Get my assigned tasks
 * Endpoint: GET /tasks/my-tasks
 */
export async function getMyTasks(): Promise<TaskListResponse> {
  return await apiFetch<TaskListResponse>('/tasks/my-tasks');
}

// ==================== EXPORTS ====================

export const tasksApi = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks
};

export default tasksApi;
