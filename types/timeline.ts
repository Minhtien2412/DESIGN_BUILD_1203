// Timeline & Gantt Chart Types

export enum TimelineViewMode {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DependencyType {
  FINISH_TO_START = 'FINISH_TO_START', // Task B can start after Task A finishes
  START_TO_START = 'START_TO_START', // Task B can start when Task A starts
  FINISH_TO_FINISH = 'FINISH_TO_FINISH', // Task B can finish when Task A finishes
  START_TO_FINISH = 'START_TO_FINISH', // Task B can finish when Task A starts
}

export enum PhaseStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
}

export interface TimelinePhase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: PhaseStatus;
  color: string; // Hex color for visualization
  order: number;
  budget?: number;
  actualCost?: number;
  completionPercentage: number;
  milestoneId?: string; // Link to contract milestone
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineTask {
  id: string;
  phaseId: string;
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0-100
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  actualHours?: number;
  isMilestone: boolean;
  isCritical: boolean; // Part of critical path
  color?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDependency {
  id: string;
  projectId: string;
  predecessorId: string; // Task that must be completed first
  successorId: string; // Task that depends on predecessor
  type: DependencyType;
  lagDays?: number; // Delay after predecessor (can be negative for lead time)
  createdAt: Date;
}

export interface CriticalPath {
  id: string;
  projectId: string;
  tasks: string[]; // Array of task IDs in critical path order
  totalDuration: number; // In days
  slack: number; // Total float/slack in days
  calculatedAt: Date;
}

export interface TimelineBaseline {
  id: string;
  projectId: string;
  name: string;
  description: string;
  createdAt: Date;
  phases: TimelinePhase[];
  tasks: TimelineTask[];
}

export interface ResourceAllocation {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  role: string;
  allocationPercentage: number; // 0-100, how much of their time
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface TimelineStats {
  totalPhases: number;
  completedPhases: number;
  activePhases: number;
  delayedPhases: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  onHoldTasks: number;
  overdueTasks: number;
  criticalTasks: number;
  overallProgress: number; // 0-100
  estimatedCompletionDate: Date;
  actualCompletionDate?: Date;
  scheduleVariance: number; // Days ahead/behind schedule
  totalSlack: number; // Total float in project
}

export interface GanttChartSettings {
  viewMode: TimelineViewMode;
  showWeekends: boolean;
  showDependencies: boolean;
  showCriticalPath: boolean;
  showBaseline: boolean;
  showProgress: boolean;
  showResourceNames: boolean;
  colorByPriority: boolean;
  colorByStatus: boolean;
  zoom: number; // 50-200%
}

// Request/Response Types

export interface CreatePhaseRequest {
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color?: string;
  order?: number;
  budget?: number;
  milestoneId?: string;
}

export interface UpdatePhaseRequest {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: PhaseStatus;
  color?: string;
  order?: number;
  budget?: number;
  actualCost?: number;
  completionPercentage?: number;
  milestoneId?: string;
}

export interface CreateTaskRequest {
  phaseId: string;
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  priority?: TaskPriority;
  assigneeId?: string;
  estimatedHours?: number;
  isMilestone?: boolean;
  tags?: string[];
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
  assigneeId?: string;
  estimatedHours?: number;
  actualHours?: number;
  isMilestone?: boolean;
  tags?: string[];
}

export interface CreateDependencyRequest {
  projectId: string;
  predecessorId: string;
  successorId: string;
  type: DependencyType;
  lagDays?: number;
}

export interface CreateBaselineRequest {
  projectId: string;
  name: string;
  description?: string;
}

export interface AllocateResourceRequest {
  taskId: string;
  userId: string;
  allocationPercentage: number;
  startDate: Date;
  endDate: Date;
}

export interface CalculateCriticalPathResponse {
  criticalPath: CriticalPath;
  criticalTasks: TimelineTask[];
  nearCriticalTasks: TimelineTask[]; // Tasks with slack < 5 days
}

export interface TimelineConflict {
  type: 'RESOURCE_OVERALLOCATION' | 'CIRCULAR_DEPENDENCY' | 'INVALID_DATES';
  taskId?: string;
  resourceId?: string;
  message: string;
  severity: 'WARNING' | 'ERROR';
}

export interface ValidateTimelineResponse {
  isValid: boolean;
  conflicts: TimelineConflict[];
  warnings: string[];
}
