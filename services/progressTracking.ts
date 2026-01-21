/**
 * Progress Tracking Service
 * Integrates with /progress WebSocket namespace and REST API endpoints
 */

import { apiFetch } from './api';
import progressSocketManager from './progressSocket';

export interface TaskProgress {
  taskId: string;
  taskName: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string;
  result?: any;
  error?: string;
}

export interface ProjectProgress {
  projectId: string;
  projectName: string;
  overallProgress: number;
  phases: PhaseProgress[];
  milestones: Milestone[];
  lastUpdated: string;
}

export interface PhaseProgress {
  phaseId: string;
  phaseName: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  startDate?: string;
  endDate?: string;
  tasks: TaskProgress[];
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  completedDate?: string;
  isCompleted: boolean;
  progress: number;
}

/**
 * Lấy tiến độ của một task (từ Bull Queue)
 */
export async function getTaskProgress(taskId: string): Promise<TaskProgress | null> {
  try {
    const response = await apiFetch(`/tasks/${taskId}/progress`);
    return response.data;
  } catch (error) {
    console.error('[ProgressTracking] Get task progress failed:', error);
    return null;
  }
}

/**
 * Lấy tiến độ tổng thể dự án
 */
export async function getProjectProgress(projectId: string): Promise<ProjectProgress | null> {
  try {
    const response = await apiFetch(`/projects/${projectId}/progress`);
    return response.data;
  } catch (error) {
    console.error('[ProgressTracking] Get project progress failed:', error);
    return null;
  }
}

/**
 * Cập nhật tiến độ công việc
 */
export async function updateTaskProgress(
  taskId: string,
  progress: number,
  currentStep?: string
): Promise<boolean> {
  try {
    await apiFetch(`/tasks/${taskId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress, currentStep }),
    });
    return true;
  } catch (error) {
    console.error('[ProgressTracking] Update task progress failed:', error);
    return false;
  }
}

/**
 * Đánh dấu task hoàn thành
 */
export async function completeTask(
  taskId: string,
  result?: any
): Promise<boolean> {
  try {
    await apiFetch(`/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    });
    return true;
  } catch (error) {
    console.error('[ProgressTracking] Complete task failed:', error);
    return false;
  }
}

/**
 * Đánh dấu task thất bại
 */
export async function failTask(
  taskId: string,
  error: string
): Promise<boolean> {
  try {
    await apiFetch(`/tasks/${taskId}/fail`, {
      method: 'POST',
      body: JSON.stringify({ error }),
    });
    return true;
  } catch (error) {
    console.error('[ProgressTracking] Fail task failed:', error);
    return false;
  }
}

/**
 * Lấy danh sách tasks đang active
 */
export async function getActiveTasks(projectId?: string): Promise<TaskProgress[]> {
  try {
    const url = projectId 
      ? `/tasks/active?projectId=${projectId}`
      : '/tasks/active';
    
    const response = await apiFetch(url);
    return response.data;
  } catch (error) {
    console.error('[ProgressTracking] Get active tasks failed:', error);
    return [];
  }
}

/**
 * Subscribe to task progress updates via /progress WebSocket namespace
 */
export function subscribeToTaskProgress(
  taskId: string,
  onUpdate: (progress: TaskProgress) => void
): () => void {
  // Convert string taskId to number for backend API
  const taskIdNum = parseInt(taskId, 10);
  
  if (isNaN(taskIdNum)) {
    console.error('[ProgressTracking] Invalid taskId:', taskId);
    return () => {}; // Return no-op cleanup
  }

  // Subscribe via progressSocketManager
  return progressSocketManager.subscribeToTask(taskIdNum, (data) => {
    // Type guard: check if it's task progress data
    if (!data.taskId || !data.progress) {
      console.warn('[ProgressTracking] Invalid task update data');
      return;
    }
    
    // Access task-specific properties with type assertion
    const taskData = data.progress as {
      name?: string;
      status?: string;
      progress?: number;
      startDate?: string;
      completedDate?: string;
    };
    
    // Convert backend response to TaskProgress format
    const progress: TaskProgress = {
      taskId: data.taskId?.toString() || taskId,
      taskName: taskData.name || 'Unknown',
      status: mapBackendStatus(taskData.status),
      progress: taskData.progress || 0,
      currentStep: taskData.status,
      startedAt: taskData.startDate || undefined,
      completedAt: taskData.completedDate || undefined,
    };
    
    onUpdate(progress);
  });
}

/**
 * Subscribe to project progress updates via /progress WebSocket namespace
 */
export function subscribeToProjectProgress(
  projectId: string,
  onUpdate: (progress: ProjectProgress) => void
): () => void {
  // Convert string projectId to number for backend API
  const projectIdNum = parseInt(projectId, 10);
  
  if (isNaN(projectIdNum)) {
    console.error('[ProgressTracking] Invalid projectId:', projectId);
    return () => {}; // Return no-op cleanup
  }

  // Subscribe via progressSocketManager
  return progressSocketManager.subscribeToProject(projectIdNum, (data) => {
    // Type guard: check if it's project progress data
    if (!data.projectId || !data.progress) {
      console.warn('[ProgressTracking] Invalid project update data');
      return;
    }
    
    // Access project-specific properties with type assertion
    const projectData = data.progress as {
      name?: string;
      overallProgress?: number;
      milestones?: { name: string; progress: number; completed: boolean }[];
    };
    
    // Convert backend milestones to Milestone interface
    const milestones: Milestone[] = (projectData.milestones || []).map((m, index) => ({
      id: `milestone-${index}`,
      name: m.name,
      targetDate: new Date().toISOString(), // Backend doesn't provide, use default
      isCompleted: m.completed,
      progress: m.progress,
    }));
    
    // Convert backend response to ProjectProgress format
    const progress: ProjectProgress = {
      projectId: data.projectId?.toString() || projectId,
      projectName: projectData.name || 'Unknown',
      overallProgress: projectData.overallProgress || 0,
      phases: [], // Backend doesn't return phases, can be extended
      milestones,
      lastUpdated: data.timestamp || new Date().toISOString(),
    };
    
    onUpdate(progress);
  });
}

/**
 * Map backend status to TaskProgress status
 */
function mapBackendStatus(backendStatus?: string): TaskProgress['status'] {
  switch (backendStatus) {
    case 'TODO':
      return 'pending';
    case 'IN_PROGRESS':
      return 'active';
    case 'COMPLETED':
      return 'completed';
    default:
      return 'pending';
  }
}

/**
 * Tạo background task mới
 */
export async function createBackgroundTask(
  taskName: string,
  taskType: string,
  data: any,
  priority: number = 0
): Promise<string | null> {
  try {
    const response = await apiFetch('/tasks/create', {
      method: 'POST',
      body: JSON.stringify({
        name: taskName,
        type: taskType,
        data,
        priority,
      }),
    });
    
    return response.data.taskId;
  } catch (error) {
    console.error('[ProgressTracking] Create background task failed:', error);
    return null;
  }
}

/**
 * Export report về tiến độ dự án
 */
export async function exportProjectProgressReport(
  projectId: string,
  format: 'pdf' | 'excel' = 'pdf'
): Promise<{ url: string } | null> {
  try {
    const response = await apiFetch(`/projects/${projectId}/progress/export`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
    
    return { url: response.data.downloadUrl };
  } catch (error) {
    console.error('[ProgressTracking] Export report failed:', error);
    return null;
  }
}

export default {
  getTaskProgress,
  getProjectProgress,
  updateTaskProgress,
  completeTask,
  failTask,
  getActiveTasks,
  subscribeToTaskProgress,
  subscribeToProjectProgress,
  createBackgroundTask,
  exportProjectProgressReport,
};
