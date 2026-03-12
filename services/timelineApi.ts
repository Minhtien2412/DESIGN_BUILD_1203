/**
 * Timeline & Phases API Service
 * Production API: https://baotienweb.cloud/api/v1
 * 
 * Endpoints (12 total):
 * 
 * Phases (4 endpoints):
 * - GET /projects/{projectId}/phases - List all phases
 * - POST /projects/{projectId}/phases - Create new phase
 * - PUT /projects/{projectId}/phases/{phaseId} - Update phase
 * - DELETE /projects/{projectId}/phases/{phaseId} - Delete phase
 * 
 * Milestones (4 endpoints):
 * - GET /projects/{projectId}/milestones - List all milestones
 * - POST /projects/{projectId}/milestones - Create new milestone
 * - PUT /projects/{projectId}/milestones/{milestoneId} - Update milestone
 * - DELETE /projects/{projectId}/milestones/{milestoneId} - Delete milestone
 * 
 * Tasks (4 endpoints):
 * - GET /projects/{projectId}/tasks - List all tasks
 * - POST /projects/{projectId}/tasks - Create new task
 * - PUT /projects/{projectId}/tasks/{taskId} - Update task
 * - DELETE /projects/{projectId}/tasks/{taskId} - Delete task
 * 
 * Created: Nov 24, 2025
 * Status: ✅ Production Ready
 */

import { del, get, post, put } from './apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Phase Status
 */
export type PhaseStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';

/**
 * Milestone Status
 */
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

/**
 * Task Status
 */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED';

/**
 * Task Priority
 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Phase Interface
 */
export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: PhaseStatus;
  order: number;
  startDate?: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  progress: number;
  budget?: number;
  createdAt: string;
  updatedAt: string;
  milestonesCount?: number;
  tasksCount?: number;
  completedTasksCount?: number;
}

/**
 * Milestone Interface
 */
export interface Milestone {
  id: string;
  projectId: string;
  phaseId?: string;
  name: string;
  description?: string;
  status: MilestoneStatus;
  dueDate: string;
  completedDate?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tasksCount?: number;
  completedTasksCount?: number;
}

/**
 * Task Interface
 */
export interface Task {
  id: string;
  projectId: string;
  phaseId?: string;
  milestoneId?: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  dependencies?: string[];
}

/**
 * Create Phase Data
 */
export interface CreatePhaseData {
  name: string;
  description?: string;
  order: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

/**
 * Update Phase Data
 */
export interface UpdatePhaseData {
  name?: string;
  description?: string;
  status?: PhaseStatus;
  order?: number;
  startDate?: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  progress?: number;
  budget?: number;
}

/**
 * Create Milestone Data
 */
export interface CreateMilestoneData {
  name: string;
  description?: string;
  phaseId?: string;
  dueDate: string;
}

/**
 * Update Milestone Data
 */
export interface UpdateMilestoneData {
  name?: string;
  description?: string;
  status?: MilestoneStatus;
  phaseId?: string;
  dueDate?: string;
  completedDate?: string;
  progress?: number;
}

/**
 * Create Task Data
 */
export interface CreateTaskData {
  name: string;
  description?: string;
  phaseId?: string;
  milestoneId?: string;
  priority: TaskPriority;
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
}

/**
 * Update Task Data
 */
export interface UpdateTaskData {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  phaseId?: string;
  milestoneId?: string;
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  dependencies?: string[];
}

/**
 * Filters
 */
export interface PhaseFilters {
  status?: PhaseStatus;
  page?: number;
  limit?: number;
}

export interface MilestoneFilters {
  phaseId?: string;
  status?: MilestoneStatus;
  page?: number;
  limit?: number;
}

export interface TaskFilters {
  phaseId?: string;
  milestoneId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// PHASE API FUNCTIONS
// ============================================================================

/**
 * Get all phases for a project
 * Endpoint: GET /projects/{projectId}/phases
 * 
 * @param {string} projectId - Project ID
 * @param {PhaseFilters} filters - Optional filters
 * @returns {Promise<Phase[]>} List of phases
 * @throws {ApiError} If request fails
 * 
 * @example
 * const phases = await getPhases('project-123');
 * console.log(`Found ${phases.length} phases`);
 */
export async function getPhases(
  projectId: string,
  filters?: PhaseFilters
): Promise<Phase[]> {
  console.log(`[TimelineAPI] 📋 Fetching phases for project ${projectId}`);

  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const endpoint = queryString
    ? `/projects/${projectId}/phases?${queryString}`
    : `/projects/${projectId}/phases`;

  const response = await get<Phase[]>(endpoint);

  console.log('[TimelineAPI] ✅ Phases fetched successfully');
  console.log('[TimelineAPI] 📊 Total phases:', response.length);

  return response;
}

/**
 * Create new phase
 * Endpoint: POST /projects/{projectId}/phases
 * 
 * @param {string} projectId - Project ID
 * @param {CreatePhaseData} data - Phase data
 * @returns {Promise<Phase>} Created phase
 * @throws {ApiError} If request fails
 * 
 * @example
 * const phase = await createPhase('project-123', {
 *   name: 'Khảo sát & Thiết kế',
 *   order: 1,
 *   startDate: '2025-01-01',
 * });
 */
export async function createPhase(
  projectId: string,
  data: CreatePhaseData
): Promise<Phase> {
  console.log(`[TimelineAPI] ➕ Creating phase for project ${projectId}:`, data.name);

  const response = await post<Phase>(`/projects/${projectId}/phases`, data);

  console.log('[TimelineAPI] ✅ Phase created successfully');
  console.log('[TimelineAPI] 🆔 Phase ID:', response.id);

  return response;
}

/**
 * Update existing phase
 * Endpoint: PUT /projects/{projectId}/phases/{phaseId}
 * 
 * @param {string} projectId - Project ID
 * @param {string} phaseId - Phase ID
 * @param {UpdatePhaseData} data - Update data
 * @returns {Promise<Phase>} Updated phase
 * @throws {ApiError} If request fails
 * 
 * @example
 * const updated = await updatePhase('project-123', 'phase-1', {
 *   status: 'COMPLETED',
 *   progress: 100,
 * });
 */
export async function updatePhase(
  projectId: string,
  phaseId: string,
  data: UpdatePhaseData
): Promise<Phase> {
  console.log(`[TimelineAPI] ✏️ Updating phase ${phaseId}`);

  const response = await put<Phase>(
    `/projects/${projectId}/phases/${phaseId}`,
    data
  );

  console.log('[TimelineAPI] ✅ Phase updated successfully');

  return response;
}

/**
 * Delete phase
 * Endpoint: DELETE /projects/{projectId}/phases/{phaseId}
 * 
 * @param {string} projectId - Project ID
 * @param {string} phaseId - Phase ID
 * @returns {Promise<void>}
 * @throws {ApiError} If request fails
 * 
 * @example
 * await deletePhase('project-123', 'phase-1');
 */
export async function deletePhase(
  projectId: string,
  phaseId: string
): Promise<void> {
  console.log(`[TimelineAPI] 🗑️ Deleting phase ${phaseId}`);

  await del(`/projects/${projectId}/phases/${phaseId}`);

  console.log('[TimelineAPI] ✅ Phase deleted successfully');
}

// ============================================================================
// MILESTONE API FUNCTIONS
// ============================================================================

/**
 * Get all milestones for a project
 * Endpoint: GET /projects/{projectId}/milestones
 * 
 * @param {string} projectId - Project ID
 * @param {MilestoneFilters} filters - Optional filters
 * @returns {Promise<Milestone[]>} List of milestones
 * @throws {ApiError} If request fails
 * 
 * @example
 * const milestones = await getMilestones('project-123', {
 *   phaseId: 'phase-1',
 *   status: 'IN_PROGRESS',
 * });
 */
export async function getMilestones(
  projectId: string,
  filters?: MilestoneFilters
): Promise<Milestone[]> {
  console.log(`[TimelineAPI] 🎯 Fetching milestones for project ${projectId}`);

  const params = new URLSearchParams();
  if (filters?.phaseId) params.append('phaseId', filters.phaseId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const endpoint = queryString
    ? `/projects/${projectId}/milestones?${queryString}`
    : `/projects/${projectId}/milestones`;

  const response = await get<Milestone[]>(endpoint);

  console.log('[TimelineAPI] ✅ Milestones fetched successfully');
  console.log('[TimelineAPI] 📊 Total milestones:', response.length);

  return response;
}

/**
 * Create new milestone
 * Endpoint: POST /projects/{projectId}/milestones
 * 
 * @param {string} projectId - Project ID
 * @param {CreateMilestoneData} data - Milestone data
 * @returns {Promise<Milestone>} Created milestone
 * @throws {ApiError} If request fails
 * 
 * @example
 * const milestone = await createMilestone('project-123', {
 *   name: 'Hoàn thành thiết kế',
 *   phaseId: 'phase-1',
 *   dueDate: '2025-02-15',
 * });
 */
export async function createMilestone(
  projectId: string,
  data: CreateMilestoneData
): Promise<Milestone> {
  console.log(`[TimelineAPI] ➕ Creating milestone for project ${projectId}:`, data.name);

  const response = await post<Milestone>(`/projects/${projectId}/milestones`, data);

  console.log('[TimelineAPI] ✅ Milestone created successfully');
  console.log('[TimelineAPI] 🆔 Milestone ID:', response.id);

  return response;
}

/**
 * Update existing milestone
 * Endpoint: PUT /projects/{projectId}/milestones/{milestoneId}
 * 
 * @param {string} projectId - Project ID
 * @param {string} milestoneId - Milestone ID
 * @param {UpdateMilestoneData} data - Update data
 * @returns {Promise<Milestone>} Updated milestone
 * @throws {ApiError} If request fails
 * 
 * @example
 * const updated = await updateMilestone('project-123', 'milestone-1', {
 *   status: 'COMPLETED',
 *   completedDate: '2025-02-10',
 * });
 */
export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  data: UpdateMilestoneData
): Promise<Milestone> {
  console.log(`[TimelineAPI] ✏️ Updating milestone ${milestoneId}`);

  const response = await put<Milestone>(
    `/projects/${projectId}/milestones/${milestoneId}`,
    data
  );

  console.log('[TimelineAPI] ✅ Milestone updated successfully');

  return response;
}

/**
 * Delete milestone
 * Endpoint: DELETE /projects/{projectId}/milestones/{milestoneId}
 * 
 * @param {string} projectId - Project ID
 * @param {string} milestoneId - Milestone ID
 * @returns {Promise<void>}
 * @throws {ApiError} If request fails
 * 
 * @example
 * await deleteMilestone('project-123', 'milestone-1');
 */
export async function deleteMilestone(
  projectId: string,
  milestoneId: string
): Promise<void> {
  console.log(`[TimelineAPI] 🗑️ Deleting milestone ${milestoneId}`);

  await del(`/projects/${projectId}/milestones/${milestoneId}`);

  console.log('[TimelineAPI] ✅ Milestone deleted successfully');
}

// ============================================================================
// TASK API FUNCTIONS
// ============================================================================

/**
 * Get all tasks for a project
 * Endpoint: GET /projects/{projectId}/tasks
 * 
 * @param {string} projectId - Project ID
 * @param {TaskFilters} filters - Optional filters
 * @returns {Promise<Task[]>} List of tasks
 * @throws {ApiError} If request fails
 * 
 * @example
 * const tasks = await getTasks('project-123', {
 *   status: 'IN_PROGRESS',
 *   priority: 'HIGH',
 * });
 */
export async function getTasks(
  projectId: string,
  filters?: TaskFilters
): Promise<Task[]> {
  console.log(`[TimelineAPI] ✅ Fetching tasks for project ${projectId}`);

  const params = new URLSearchParams();
  if (filters?.phaseId) params.append('phaseId', filters.phaseId);
  if (filters?.milestoneId) params.append('milestoneId', filters.milestoneId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const endpoint = queryString
    ? `/projects/${projectId}/tasks?${queryString}`
    : `/projects/${projectId}/tasks`;

  const response = await get<Task[]>(endpoint);

  console.log('[TimelineAPI] ✅ Tasks fetched successfully');
  console.log('[TimelineAPI] 📊 Total tasks:', response.length);

  return response;
}

/**
 * Create new task
 * Endpoint: POST /projects/{projectId}/tasks
 * 
 * @param {string} projectId - Project ID
 * @param {CreateTaskData} data - Task data
 * @returns {Promise<Task>} Created task
 * @throws {ApiError} If request fails
 * 
 * @example
 * const task = await createTask('project-123', {
 *   name: 'Vẽ bản vẽ mặt bằng',
 *   phaseId: 'phase-1',
 *   priority: 'HIGH',
 *   assignedTo: 'user-456',
 *   dueDate: '2025-01-20',
 * });
 */
export async function createTask(
  projectId: string,
  data: CreateTaskData
): Promise<Task> {
  console.log(`[TimelineAPI] ➕ Creating task for project ${projectId}:`, data.name);

  const response = await post<Task>(`/projects/${projectId}/tasks`, data);

  console.log('[TimelineAPI] ✅ Task created successfully');
  console.log('[TimelineAPI] 🆔 Task ID:', response.id);

  return response;
}

/**
 * Update existing task
 * Endpoint: PUT /projects/{projectId}/tasks/{taskId}
 * 
 * @param {string} projectId - Project ID
 * @param {string} taskId - Task ID
 * @param {UpdateTaskData} data - Update data
 * @returns {Promise<Task>} Updated task
 * @throws {ApiError} If request fails
 * 
 * @example
 * const updated = await updateTask('project-123', 'task-1', {
 *   status: 'COMPLETED',
 *   progress: 100,
 *   actualHours: 8,
 * });
 */
export async function updateTask(
  projectId: string,
  taskId: string,
  data: UpdateTaskData
): Promise<Task> {
  console.log(`[TimelineAPI] ✏️ Updating task ${taskId}`);

  const response = await put<Task>(
    `/projects/${projectId}/tasks/${taskId}`,
    data
  );

  console.log('[TimelineAPI] ✅ Task updated successfully');

  return response;
}

/**
 * Delete task
 * Endpoint: DELETE /projects/{projectId}/tasks/{taskId}
 * 
 * @param {string} projectId - Project ID
 * @param {string} taskId - Task ID
 * @returns {Promise<void>}
 * @throws {ApiError} If request fails
 * 
 * @example
 * await deleteTask('project-123', 'task-1');
 */
export async function deleteTask(
  projectId: string,
  taskId: string
): Promise<void> {
  console.log(`[TimelineAPI] 🗑️ Deleting task ${taskId}`);

  await del(`/projects/${projectId}/tasks/${taskId}`);

  console.log('[TimelineAPI] ✅ Task deleted successfully');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate phase progress based on tasks
 * 
 * @param {Task[]} tasks - Tasks in the phase
 * @returns {number} Progress percentage (0-100)
 */
export function calculatePhaseProgress(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;

  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(totalProgress / tasks.length);
}

/**
 * Calculate milestone progress based on tasks
 * 
 * @param {Task[]} tasks - Tasks in the milestone
 * @returns {number} Progress percentage (0-100)
 */
export function calculateMilestoneProgress(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

/**
 * Check if milestone is overdue
 * 
 * @param {Milestone} milestone - Milestone to check
 * @returns {boolean} True if overdue
 */
export function isMilestoneOverdue(milestone: Milestone): boolean {
  if (milestone.status === 'COMPLETED') return false;
  
  const dueDate = new Date(milestone.dueDate);
  const now = new Date();
  
  return now > dueDate;
}

/**
 * Get task status color
 * 
 * @param {TaskStatus} status - Task status
 * @returns {string} Hex color code
 */
export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    TODO: '#94a3b8',
    IN_PROGRESS: '#0D9488',
    REVIEW: '#0D9488',
    COMPLETED: '#0D9488',
    BLOCKED: '#000000',
  };
  
  return colors[status] || '#94a3b8';
}

/**
 * Get task priority color
 * 
 * @param {TaskPriority} priority - Task priority
 * @returns {string} Hex color code
 */
export function getTaskPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    LOW: '#0D9488',
    MEDIUM: '#0D9488',
    HIGH: '#0D9488',
    URGENT: '#000000',
  };
  
  return colors[priority] || '#94a3b8';
}
