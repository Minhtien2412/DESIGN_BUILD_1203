/**
 * Construction Progress API Service
 * API kết nối quản lý tiến độ xây dựng
 */

import { get, patch, post } from "./api";

// Types
export enum ProgressStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DELAYED = "DELAYED",
  ON_HOLD = "ON_HOLD",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface ConstructionPhase {
  id: string;
  name: string;
  description?: string;
  order: number;
  startDate: string;
  endDate?: string;
  plannedEndDate: string;
  status: ProgressStatus;
  progress: number;
  tasks: ConstructionTask[];
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionTask {
  id: string;
  phaseId: string;
  name: string;
  description?: string;
  assignedTo?: string;
  assignedWorkers?: string[];
  startDate?: string;
  endDate?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: ProgressStatus;
  progress: number;
  priority: TaskPriority;
  dependencies?: string[];
  subTasks?: SubTask[];
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  taskId: string;
  name: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface ProgressReport {
  id: string;
  projectId: string;
  reportDate: string;
  reportNumber: string;
  title: string;
  summary: string;
  overallProgress: number;
  phaseProgress: {
    phaseId: string;
    phaseName: string;
    progress: number;
    status: ProgressStatus;
  }[];
  issues?: string[];
  nextSteps?: string[];
  images?: string[];
  videoUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface ProgressUpdate {
  taskId: string;
  progress: number;
  status?: ProgressStatus;
  notes?: string;
  images?: string[];
}

export interface DailyReport {
  id: string;
  projectId: string;
  date: string;
  weather: string;
  workersPresent: number;
  totalWorkers: number;
  tasksCompleted: string[];
  tasksInProgress: string[];
  issues?: string[];
  notes?: string;
  images?: string[];
  createdBy: string;
  createdAt: string;
}

export interface ProjectProgress {
  projectId: string;
  projectName: string;
  startDate: string;
  plannedEndDate: string;
  estimatedEndDate: string;
  overallProgress: number;
  budgetUsed: number;
  budgetTotal: number;
  phases: ConstructionPhase[];
  recentReports: ProgressReport[];
  delays?: {
    phaseId: string;
    phaseName: string;
    delayDays: number;
    reason?: string;
  }[];
  status: ProgressStatus;
}

export interface CreatePhaseDto {
  projectId: string;
  name: string;
  description?: string;
  order: number;
  plannedStartDate: string;
  plannedEndDate: string;
}

export interface CreateTaskDto {
  phaseId: string;
  name: string;
  description?: string;
  assignedWorkers?: string[];
  plannedStartDate: string;
  plannedEndDate: string;
  priority?: TaskPriority;
  dependencies?: string[];
}

export interface CreateReportDto {
  projectId: string;
  title: string;
  summary: string;
  overallProgress: number;
  phaseProgress: {
    phaseId: string;
    progress: number;
    status: ProgressStatus;
  }[];
  issues?: string[];
  nextSteps?: string[];
  images?: string[];
}

export interface CreateDailyReportDto {
  projectId: string;
  date: string;
  weather: string;
  workersPresent: number;
  totalWorkers: number;
  tasksCompleted: string[];
  tasksInProgress: string[];
  issues?: string[];
  notes?: string;
  images?: string[];
}

// API Functions
const BASE_PATH = "/construction-progress";

/**
 * Get project progress overview
 */
export const getProjectProgress = async (
  projectId: string,
): Promise<ProjectProgress> => {
  return get<ProjectProgress>(`${BASE_PATH}/projects/${projectId}`);
};

/**
 * Get all phases of a project
 */
export const getProjectPhases = async (
  projectId: string,
): Promise<ConstructionPhase[]> => {
  return get<ConstructionPhase[]>(`${BASE_PATH}/projects/${projectId}/phases`);
};

/**
 * Get single phase detail
 */
export const getPhaseDetail = async (
  phaseId: string,
): Promise<ConstructionPhase> => {
  return get<ConstructionPhase>(`${BASE_PATH}/phases/${phaseId}`);
};

/**
 * Create new phase
 */
export const createPhase = async (
  data: CreatePhaseDto,
): Promise<ConstructionPhase> => {
  return post<ConstructionPhase>(`${BASE_PATH}/phases`, data);
};

/**
 * Update phase
 */
export const updatePhase = async (
  phaseId: string,
  data: Partial<CreatePhaseDto>,
): Promise<ConstructionPhase> => {
  return patch<ConstructionPhase>(`${BASE_PATH}/phases/${phaseId}`, data);
};

/**
 * Get tasks of a phase
 */
export const getPhaseTasks = async (
  phaseId: string,
): Promise<ConstructionTask[]> => {
  return get<ConstructionTask[]>(`${BASE_PATH}/phases/${phaseId}/tasks`);
};

/**
 * Get single task detail
 */
export const getTaskDetail = async (
  taskId: string,
): Promise<ConstructionTask> => {
  return get<ConstructionTask>(`${BASE_PATH}/tasks/${taskId}`);
};

/**
 * Create new task
 */
export const createTask = async (
  data: CreateTaskDto,
): Promise<ConstructionTask> => {
  return post<ConstructionTask>(`${BASE_PATH}/tasks`, data);
};

/**
 * Update task
 */
export const updateTask = async (
  taskId: string,
  data: Partial<ConstructionTask>,
): Promise<ConstructionTask> => {
  return patch<ConstructionTask>(`${BASE_PATH}/tasks/${taskId}`, data);
};

/**
 * Update task progress
 */
export const updateTaskProgress = async (
  taskId: string,
  data: ProgressUpdate,
): Promise<ConstructionTask> => {
  return patch<ConstructionTask>(`${BASE_PATH}/tasks/${taskId}/progress`, data);
};

/**
 * Complete sub-task
 */
export const completeSubTask = async (
  taskId: string,
  subTaskId: string,
): Promise<SubTask> => {
  return patch<SubTask>(
    `${BASE_PATH}/tasks/${taskId}/subtasks/${subTaskId}/complete`,
    {},
  );
};

/**
 * Add sub-task
 */
export const addSubTask = async (
  taskId: string,
  name: string,
): Promise<SubTask> => {
  return post<SubTask>(`${BASE_PATH}/tasks/${taskId}/subtasks`, { name });
};

/**
 * Get progress reports
 */
export const getProgressReports = async (
  projectId: string,
  params?: { page?: number; limit?: number },
): Promise<{ data: ProgressReport[]; total: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  const queryString = queryParams.toString();
  const url = queryString
    ? `${BASE_PATH}/projects/${projectId}/reports?${queryString}`
    : `${BASE_PATH}/projects/${projectId}/reports`;
  return get(url);
};

/**
 * Create progress report
 */
export const createProgressReport = async (
  data: CreateReportDto,
): Promise<ProgressReport> => {
  return post<ProgressReport>(`${BASE_PATH}/reports`, data);
};

/**
 * Get daily reports
 */
export const getDailyReports = async (
  projectId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
): Promise<{ data: DailyReport[]; total: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  const queryString = queryParams.toString();
  const url = queryString
    ? `${BASE_PATH}/projects/${projectId}/daily-reports?${queryString}`
    : `${BASE_PATH}/projects/${projectId}/daily-reports`;
  return get(url);
};

/**
 * Create daily report
 */
export const createDailyReport = async (
  data: CreateDailyReportDto,
): Promise<DailyReport> => {
  return post<DailyReport>(`${BASE_PATH}/daily-reports`, data);
};

/**
 * Get task statistics
 */
export const getTaskStatistics = async (projectId: string) => {
  return get(`${BASE_PATH}/projects/${projectId}/statistics`);
};

/**
 * Get timeline/Gantt data
 */
export const getProjectTimeline = async (projectId: string) => {
  return get(`${BASE_PATH}/projects/${projectId}/timeline`);
};

// Helper functions
export const getStatusLabel = (status: ProgressStatus): string => {
  const labels: Record<ProgressStatus, string> = {
    [ProgressStatus.NOT_STARTED]: "Chưa bắt đầu",
    [ProgressStatus.IN_PROGRESS]: "Đang thực hiện",
    [ProgressStatus.COMPLETED]: "Hoàn thành",
    [ProgressStatus.DELAYED]: "Chậm tiến độ",
    [ProgressStatus.ON_HOLD]: "Tạm dừng",
  };
  return labels[status] || status;
};

export const getStatusColor = (status: ProgressStatus): string => {
  const colors: Record<ProgressStatus, string> = {
    [ProgressStatus.NOT_STARTED]: "#9CA3AF",
    [ProgressStatus.IN_PROGRESS]: "#3B82F6",
    [ProgressStatus.COMPLETED]: "#10B981",
    [ProgressStatus.DELAYED]: "#EF4444",
    [ProgressStatus.ON_HOLD]: "#F59E0B",
  };
  return colors[status] || "#9CA3AF";
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  const labels: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: "Thấp",
    [TaskPriority.MEDIUM]: "Trung bình",
    [TaskPriority.HIGH]: "Cao",
    [TaskPriority.CRITICAL]: "Khẩn cấp",
  };
  return labels[priority] || priority;
};

export const getPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: "#9CA3AF",
    [TaskPriority.MEDIUM]: "#3B82F6",
    [TaskPriority.HIGH]: "#F59E0B",
    [TaskPriority.CRITICAL]: "#EF4444",
  };
  return colors[priority] || "#9CA3AF";
};

export const calculateOverallProgress = (
  phases: ConstructionPhase[],
): number => {
  if (phases.length === 0) return 0;
  const total = phases.reduce((sum, phase) => sum + phase.progress, 0);
  return Math.round(total / phases.length);
};

export const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDateRange = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
  };
  return `${startDate.toLocaleDateString("vi-VN", options)} - ${endDate.toLocaleDateString("vi-VN", options)}`;
};
