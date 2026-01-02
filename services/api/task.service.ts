/**
 * Task Service
 * Handles task management endpoints
 * 
 * Endpoints:
 * - GET /tasks - List tasks (paginated, with filters)
 * - POST /tasks - Create task
 * - GET /tasks/{id} - Get task details
 * - PUT /tasks/{id} - Update task
 * - DELETE /tasks/{id} - Delete task
 */

import { apiClient } from './client';
import type {
    CreateTaskData,
    PaginatedResponse,
    Task,
    TaskFilters,
    UpdateTaskData,
} from './types';

export const taskService = {
  /**
   * Get paginated list of tasks with filters
   * GET /tasks
   */
  list: async (filters?: TaskFilters): Promise<PaginatedResponse<Task>> => {
    console.log('[TaskService] 📋 Fetching tasks with filters:', filters);
    
    const params: Record<string, string> = {};
    if (filters?.projectId) params.projectId = String(filters.projectId);
    if (filters?.assigneeId) params.assigneeId = String(filters.assigneeId);
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);

    const response = await apiClient.get<any>('/tasks', params);
    
    // Handle different response formats from backend
    if (Array.isArray(response)) {
      console.log('[TaskService] ✅ Tasks fetched (array format):', response.length);
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
    
    console.log('[TaskService] ✅ Tasks fetched:', response.meta?.total || response.data?.length || 0, 'total');
    return response as PaginatedResponse<Task>;
  },

  /**
   * Get task by ID
   * GET /tasks/{id}
   */
  getById: async (id: number): Promise<Task> => {
    console.log('[TaskService] 📝 Fetching task:', id);
    
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    
    console.log('[TaskService] ✅ Task fetched:', response.title);
    return response;
  },

  /**
   * Create new task
   * POST /tasks
   */
  create: async (data: CreateTaskData): Promise<Task> => {
    console.log('[TaskService] ➕ Creating task:', data.title);
    
    const response = await apiClient.post<Task>('/tasks', data);
    
    console.log('[TaskService] ✅ Task created:', response.id);
    return response;
  },

  /**
   * Update task
   * PUT /tasks/{id}
   */
  update: async (id: number, data: UpdateTaskData): Promise<Task> => {
    console.log('[TaskService] ✏️ Updating task:', id);
    
    const response = await apiClient.put<Task>(`/tasks/${id}`, data);
    
    console.log('[TaskService] ✅ Task updated');
    return response;
  },

  /**
   * Delete task
   * DELETE /tasks/{id}
   */
  delete: async (id: number): Promise<void> => {
    console.log('[TaskService] 🗑️ Deleting task:', id);
    
    await apiClient.delete(`/tasks/${id}`);
    
    console.log('[TaskService] ✅ Task deleted');
  },

  /**
   * Helper: Get tasks by project
   */
  getByProject: async (projectId: number, filters?: Omit<TaskFilters, 'projectId'>): Promise<PaginatedResponse<Task>> => {
    return taskService.list({ ...filters, projectId });
  },

  /**
   * Helper: Get tasks assigned to user
   */
  getByAssignee: async (assigneeId: number, filters?: Omit<TaskFilters, 'assigneeId'>): Promise<PaginatedResponse<Task>> => {
    return taskService.list({ ...filters, assigneeId });
  },
};

export default taskService;
