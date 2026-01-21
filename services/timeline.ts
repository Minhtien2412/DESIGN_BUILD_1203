import type {
    AllocateResourceRequest,
    CalculateCriticalPathResponse,
    CreateBaselineRequest,
    CreateDependencyRequest,
    CreatePhaseRequest,
    CreateTaskRequest,
    CriticalPath,
    ResourceAllocation,
    TaskDependency,
    TimelineBaseline,
    TimelinePhase,
    TimelineStats,
    TimelineTask,
    UpdatePhaseRequest,
    UpdateTaskRequest,
    ValidateTimelineResponse,
} from '@/types/timeline';
import { apiFetch } from './api';

const BASE_URL = '/timeline';

// ==================== PHASES ====================

export const getPhases = async (projectId: string): Promise<TimelinePhase[]> => {
  return apiFetch(`${BASE_URL}/phases?projectId=${projectId}`);
};

export const getPhase = async (phaseId: string): Promise<TimelinePhase> => {
  return apiFetch(`${BASE_URL}/phases/${phaseId}`);
};

export const createPhase = async (data: CreatePhaseRequest): Promise<TimelinePhase> => {
  return apiFetch(`${BASE_URL}/phases`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updatePhase = async (
  phaseId: string,
  data: UpdatePhaseRequest
): Promise<TimelinePhase> => {
  return apiFetch(`${BASE_URL}/phases/${phaseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deletePhase = async (phaseId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/phases/${phaseId}`, {
    method: 'DELETE',
  });
};

export const reorderPhases = async (
  projectId: string,
  phaseIds: string[]
): Promise<TimelinePhase[]> => {
  return apiFetch(`${BASE_URL}/phases/reorder`, {
    method: 'POST',
    body: JSON.stringify({ projectId, phaseIds }),
  });
};

// ==================== TASKS ====================

export const getTasks = async (phaseId?: string, projectId?: string): Promise<TimelineTask[]> => {
  const params = new URLSearchParams();
  if (phaseId) params.append('phaseId', phaseId);
  if (projectId) params.append('projectId', projectId);
  return apiFetch(`${BASE_URL}/tasks?${params.toString()}`);
};

export const getTask = async (taskId: string): Promise<TimelineTask> => {
  return apiFetch(`${BASE_URL}/tasks/${taskId}`);
};

export const createTask = async (data: CreateTaskRequest): Promise<TimelineTask> => {
  return apiFetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTask = async (
  taskId: string,
  data: UpdateTaskRequest
): Promise<TimelineTask> => {
  return apiFetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  });
};

export const updateTaskProgress = async (
  taskId: string,
  progress: number
): Promise<TimelineTask> => {
  return apiFetch(`${BASE_URL}/tasks/${taskId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ progress }),
  });
};

export const bulkUpdateTasks = async (
  updates: { taskId: string; data: UpdateTaskRequest }[]
): Promise<TimelineTask[]> => {
  return apiFetch(`${BASE_URL}/tasks/bulk-update`, {
    method: 'POST',
    body: JSON.stringify({ updates }),
  });
};

// ==================== DEPENDENCIES ====================

export const getDependencies = async (projectId: string): Promise<TaskDependency[]> => {
  return apiFetch(`${BASE_URL}/dependencies?projectId=${projectId}`);
};

export const getTaskDependencies = async (taskId: string): Promise<{
  predecessors: TaskDependency[];
  successors: TaskDependency[];
}> => {
  return apiFetch(`${BASE_URL}/dependencies/task/${taskId}`);
};

export const createDependency = async (
  data: CreateDependencyRequest
): Promise<TaskDependency> => {
  return apiFetch(`${BASE_URL}/dependencies`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteDependency = async (dependencyId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/dependencies/${dependencyId}`, {
    method: 'DELETE',
  });
};

// ==================== CRITICAL PATH ====================

export const calculateCriticalPath = async (
  projectId: string
): Promise<CalculateCriticalPathResponse> => {
  return apiFetch(`${BASE_URL}/critical-path/${projectId}`);
};

export const getCriticalPath = async (projectId: string): Promise<CriticalPath | null> => {
  return apiFetch(`${BASE_URL}/critical-path/${projectId}/latest`);
};

// ==================== BASELINES ====================

export const getBaselines = async (projectId: string): Promise<TimelineBaseline[]> => {
  return apiFetch(`${BASE_URL}/baselines?projectId=${projectId}`);
};

export const getBaseline = async (baselineId: string): Promise<TimelineBaseline> => {
  return apiFetch(`${BASE_URL}/baselines/${baselineId}`);
};

export const createBaseline = async (
  data: CreateBaselineRequest
): Promise<TimelineBaseline> => {
  return apiFetch(`${BASE_URL}/baselines`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteBaseline = async (baselineId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/baselines/${baselineId}`, {
    method: 'DELETE',
  });
};

export const compareToBaseline = async (
  projectId: string,
  baselineId: string
): Promise<{
  baseline: TimelineBaseline;
  current: {
    phases: TimelinePhase[];
    tasks: TimelineTask[];
  };
  variance: {
    scheduleVariance: number; // days
    completionVariance: number; // percentage
    delayedTasks: string[];
  };
}> => {
  return apiFetch(`${BASE_URL}/baselines/${baselineId}/compare?projectId=${projectId}`);
};

// ==================== RESOURCE ALLOCATION ====================

export const getResourceAllocations = async (
  taskId?: string,
  userId?: string
): Promise<ResourceAllocation[]> => {
  const params = new URLSearchParams();
  if (taskId) params.append('taskId', taskId);
  if (userId) params.append('userId', userId);
  return apiFetch(`${BASE_URL}/resources?${params.toString()}`);
};

export const allocateResource = async (
  data: AllocateResourceRequest
): Promise<ResourceAllocation> => {
  return apiFetch(`${BASE_URL}/resources`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const removeResourceAllocation = async (allocationId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/resources/${allocationId}`, {
    method: 'DELETE',
  });
};

export const getResourceUtilization = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  userId: string;
  userName: string;
  totalAllocation: number; // percentage
  allocations: ResourceAllocation[];
  overallocated: boolean;
}> => {
  return apiFetch(
    `${BASE_URL}/resources/utilization/${userId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );
};

// ==================== STATS & ANALYTICS ====================

export const getTimelineStats = async (projectId: string): Promise<TimelineStats> => {
  return apiFetch(`${BASE_URL}/stats/${projectId}`);
};

export const validateTimeline = async (projectId: string): Promise<ValidateTimelineResponse> => {
  return apiFetch(`${BASE_URL}/validate/${projectId}`);
};

export const autoSchedule = async (
  projectId: string,
  options?: {
    respectDependencies?: boolean;
    respectResourceLimits?: boolean;
    startDate?: Date;
  }
): Promise<{
  phases: TimelinePhase[];
  tasks: TimelineTask[];
  adjustments: {
    taskId: string;
    oldStartDate: Date;
    newStartDate: Date;
    reason: string;
  }[];
}> => {
  return apiFetch(`${BASE_URL}/auto-schedule/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(options || {}),
  });
};

export const exportGanttChart = async (
  projectId: string,
  format: 'PDF' | 'PNG' | 'EXCEL' | 'MSP'
): Promise<Blob> => {
  const response = await apiFetch(
    `${BASE_URL}/export/${projectId}?format=${format}`,
    {
      method: 'GET',
    }
  );
  return response.blob();
};

// ==================== DRAG & DROP HELPERS ====================

export const moveTask = async (
  taskId: string,
  newPhaseId: string,
  newStartDate: Date,
  newEndDate: Date
): Promise<TimelineTask> => {
  return apiFetch(`${BASE_URL}/tasks/${taskId}/move`, {
    method: 'POST',
    body: JSON.stringify({
      phaseId: newPhaseId,
      startDate: newStartDate,
      endDate: newEndDate,
    }),
  });
};

export const resizeTask = async (
  taskId: string,
  newStartDate?: Date,
  newEndDate?: Date
): Promise<TimelineTask> => {
  return apiFetch(`${BASE_URL}/tasks/${taskId}/resize`, {
    method: 'POST',
    body: JSON.stringify({
      startDate: newStartDate,
      endDate: newEndDate,
    }),
  });
};
