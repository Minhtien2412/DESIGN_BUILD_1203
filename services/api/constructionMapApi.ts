/**
 * Construction Map API Service
 * Connects to backend NestJS Construction Map API
 */

import { apiClient } from './client';

// Re-export types from the central types file
export type { Link, MapState, ProgressData, ProjectData, Stage, Task } from '@/types/construction-map';

// Import types for use in this file
import type { MapState, ProgressData, ProjectData, Stage, Task } from '@/types/construction-map';

// ============================================
// DEMO DATA (Mock until backend is deployed)
// ============================================

const DEMO_DATA: Record<string, ProjectData> = {
  'villa-001': {
    projectId: 'villa-001',
    stages: [
      {
        id: 'stage-1',
        projectId: 'villa-001',
        name: 'Móng & Nền',
        number: '1',
        label: 'Móng & Nền',
        description: 'Xây dựng móng và nền công trình',
        x: 100,
        y: 100,
        color: '#3B82F6',
        status: 'completed',
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'stage-2',
        projectId: 'villa-001',
        name: 'Kết cấu',
        number: '2',
        label: 'Kết cấu',
        description: 'Thi công kết cấu bê tông cốt thép',
        x: 400,
        y: 100,
        color: '#0066CC',
        status: 'active',
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'stage-3',
        projectId: 'villa-001',
        name: 'Hoàn thiện',
        number: '3',
        label: 'Hoàn thiện',
        description: 'Hoàn thiện nội ngoại thất',
        x: 700,
        y: 100,
        color: '#0066CC',
        status: 'active',
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    tasks: [
      {
        id: 'task-1',
        stageId: 'stage-1',
        projectId: 'villa-001',
        name: 'Đào móng',
        label: 'Đào móng',
        description: 'Đào móng chiều sâu 2m',
        x: 150,
        y: 200,
        status: 'completed',
        progress: 100,
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-2',
        stageId: 'stage-1',
        projectId: 'villa-001',
        name: 'Đổ bê tông móng',
        label: 'Đổ bê tông móng',
        description: 'Đổ bê tông móng M200',
        x: 250,
        y: 200,
        status: 'completed',
        progress: 100,
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-3',
        stageId: 'stage-2',
        projectId: 'villa-001',
        name: 'Dựng cột tầng 1',
        label: 'Dựng cột tầng 1',
        description: 'Thi công cột BTCT tầng 1',
        x: 450,
        y: 200,
        status: 'in-progress',
        progress: 60,
        priority: 'high',
        assignedTo: 'Đội thi công A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-4',
        stageId: 'stage-2',
        projectId: 'villa-001',
        name: 'Đổ sàn tầng 1',
        label: 'Đổ sàn tầng 1',
        description: 'Đổ sàn BTCT tầng 1',
        x: 550,
        y: 200,
        status: 'pending',
        progress: 0,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-5',
        stageId: 'stage-3',
        projectId: 'villa-001',
        name: 'Sơn tường',
        label: 'Sơn tường',
        description: 'Sơn tường nội thất',
        x: 750,
        y: 200,
        status: 'pending',
        progress: 0,
        priority: 'low',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-6',
        stageId: 'stage-3',
        projectId: 'villa-001',
        name: 'Lắp thiết bị',
        label: 'Lắp thiết bị',
        description: 'Lắp thiết bị điện nước',
        x: 850,
        y: 200,
        status: 'pending',
        progress: 0,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    links: [
      {
        id: 'link-1',
        projectId: 'villa-001',
        sourceId: 'task-1',
        targetId: 'task-2',
        type: 'task-task',
        label: 'Phụ thuộc',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'link-2',
        projectId: 'villa-001',
        sourceId: 'task-2',
        targetId: 'task-3',
        type: 'task-task',
        label: 'Phụ thuộc',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'link-3',
        projectId: 'villa-001',
        sourceId: 'task-3',
        targetId: 'task-4',
        type: 'task-task',
        label: 'Phụ thuộc',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'link-4',
        projectId: 'villa-001',
        sourceId: 'task-4',
        targetId: 'task-5',
        type: 'task-task',
        label: 'Phụ thuộc',
        createdAt: new Date().toISOString(),
      },
    ],
  },
};

// ============================================
// API Methods
// ============================================

export const constructionMapApi = {
  // ==========================================
  // Projects
  // ==========================================

  /**
   * Get full project data (stages, tasks, links)
   * GET /api/construction-map/:projectId
   * DEMO: Returns mock data until backend is deployed
   */
  getProject: async (projectId: string): Promise<{ data: ProjectData }> => {
    // Return demo data if available
    if (DEMO_DATA[projectId]) {
      console.log(`[constructionMapApi] Returning DEMO data for ${projectId}`);
      return { data: DEMO_DATA[projectId] };
    }
    
    // Fallback to API call
    return apiClient.get(`/construction-map/${projectId}`);
  },

  /**
   * Calculate project progress
   * GET /api/construction-map/:projectId/progress
   */
  getProgress: async (projectId: string): Promise<{ data: ProgressData }> => {
    return apiClient.get(`/construction-map/${projectId}/progress`);
  },

  // ==========================================
  // Tasks
  // ==========================================

  /**
   * List all tasks for a project
   * GET /api/construction-map/:projectId/tasks
   */
  getTasks: async (projectId: string): Promise<{ data: Task[] }> => {
    return apiClient.get(`/construction-map/${projectId}/tasks`);
  },

  /**
   * Get single task by ID
   * GET /api/construction-map/tasks/:id
   */
  getTask: async (id: string): Promise<{ data: Task }> => {
    return apiClient.get(`/construction-map/tasks/${id}`);
  },

  /**
   * Create new task
   * POST /api/construction-map/tasks
   */
  createTask: async (data: Partial<Task>): Promise<{ data: Task }> => {
    return apiClient.post('/construction-map/tasks', data);
  },

  /**
   * Update task
   * PUT /api/construction-map/tasks/:id
   */
  updateTask: async (id: string, data: Partial<Task>): Promise<{ data: Task }> => {
    return apiClient.put(`/construction-map/tasks/${id}`, data);
  },

  /**
   * Move task to new position
   * PATCH /api/construction-map/tasks/:id/position
   */
  moveTask: async (
    id: string,
    x: number,
    y: number
  ): Promise<{ data: Task }> => {
    return apiClient.patch(`/construction-map/tasks/${id}/position`, { x, y });
  },

  /**
   * Update task status
   * PATCH /api/construction-map/tasks/:id/status
   */
  updateTaskStatus: async (
    id: string,
    status: Task['status']
  ): Promise<{ data: Task }> => {
    return apiClient.patch(`/construction-map/tasks/${id}/status`, { status });
  },

  /**
   * Update task progress
   * PATCH /api/construction-map/tasks/:id/progress
   */
  updateTaskProgress: async (
    id: string,
    progress: number
  ): Promise<{ data: Task }> => {
    return apiClient.patch(`/construction-map/tasks/${id}/progress`, { progress });
  },

  /**
   * Delete task
   * DELETE /api/construction-map/tasks/:id
   */
  deleteTask: async (id: string): Promise<{ data: { deleted: boolean } }> => {
    return apiClient.delete(`/construction-map/tasks/${id}`);
  },

  // ==========================================
  // Stages
  // ==========================================

  /**
   * List all stages for a project
   * GET /api/construction-map/:projectId/stages
   */
  getStages: async (projectId: string): Promise<{ data: Stage[] }> => {
    return apiClient.get(`/construction-map/${projectId}/stages`);
  },

  /**
   * Get single stage by ID
   * GET /api/construction-map/stages/:id
   */
  getStage: async (id: string): Promise<{ data: Stage }> => {
    return apiClient.get(`/construction-map/stages/${id}`);
  },

  /**
   * Create new stage
   * POST /api/construction-map/stages
   */
  createStage: async (data: Partial<Stage>): Promise<{ data: Stage }> => {
    return apiClient.post('/construction-map/stages', data);
  },

  /**
   * Update stage
   * PUT /api/construction-map/stages/:id
   */
  updateStage: async (id: string, data: Partial<Stage>): Promise<{ data: Stage }> => {
    return apiClient.put(`/construction-map/stages/${id}`, data);
  },

  /**
   * Delete stage
   * DELETE /api/construction-map/stages/:id
   */
  deleteStage: async (id: string): Promise<{ data: { deleted: boolean } }> => {
    return apiClient.delete(`/construction-map/stages/${id}`);
  },

  // ==========================================
  // Map State
  // ==========================================

  /**
   * Get map state (zoom, pan, viewport)
   * GET /api/construction-map/:projectId/state
   */
  getMapState: async (projectId: string): Promise<{ data: MapState }> => {
    return apiClient.get(`/construction-map/${projectId}/state`);
  },

  /**
   * Save map state
   * PUT /api/construction-map/:projectId/state
   */
  saveMapState: async (
    projectId: string,
    state: Partial<MapState>
  ): Promise<{ data: MapState }> => {
    return apiClient.put(`/construction-map/${projectId}/state`, state);
  },

  // ==========================================
  // Health Check
  // ==========================================

  /**
   * Health check endpoint
   * GET /api/construction-map/health
   */
  healthCheck: async (): Promise<{
    data: {
      status: 'ok' | 'error';
      timestamp: string;
      uptime: number;
      database: string;
      redis: string;
    };
  }> => {
    return apiClient.get('/construction-map/health');
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format task for display
 */
export function formatTask(task: Task): Task {
  return {
    ...task,
    startDate: task.startDate ? new Date(task.startDate).toISOString() : undefined,
    endDate: task.endDate ? new Date(task.endDate).toISOString() : undefined,
    createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : undefined,
    updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : undefined,
  };
}

/**
 * Get status color
 */
export function getStatusColor(status: Task['status']): string {
  const colors = {
    pending: '#FFB020',
    'in-progress': '#2E90FA',
    completed: '#12B76A',
    blocked: '#F04438',
  };
  return colors[status];
}

/**
 * Calculate stage progress from tasks
 */
export function calculateStageProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(totalProgress / tasks.length);
}

/**
 * Group tasks by stage
 */
export function groupTasksByStage(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((groups, task) => {
    const stageId = task.stageId;
    if (!groups[stageId]) {
      groups[stageId] = [];
    }
    groups[stageId].push(task);
    return groups;
  }, {} as Record<string, Task[]>);
}

/**
 * Validate task data
 */
export function validateTask(task: Partial<Task>): string[] {
  const errors: string[] = [];

  if (!task.label || task.label.trim() === '') {
    errors.push('Task label is required');
  }

  if (!task.stageId) {
    errors.push('Stage ID is required');
  }

  if (task.progress !== undefined && (task.progress < 0 || task.progress > 100)) {
    errors.push('Progress must be between 0 and 100');
  }

  if (task.x === undefined || task.y === undefined) {
    errors.push('Position (x, y) is required');
  }

  return errors;
}

/**
 * Validate stage data
 */
export function validateStage(stage: Partial<Stage>): string[] {
  const errors: string[] = [];

  if (!stage.label || stage.label.trim() === '') {
    errors.push('Stage label is required');
  }

  if (!stage.number || stage.number.trim() === '') {
    errors.push('Stage number is required');
  }

  if (stage.x === undefined || stage.y === undefined) {
    errors.push('Position (x, y) is required');
  }

  return errors;
}

export default constructionMapApi;
