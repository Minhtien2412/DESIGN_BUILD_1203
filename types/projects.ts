/**
 * Projects Module Types
 * Matching backend schema from PROJECT_MANAGEMENT_GUIDE.md
 */

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Project Interface
 */
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  progress?: number; // 0-100
  location?: string;
  clientName?: string;
  clientContact?: string;
  images?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  ownerId: number;
  owner?: {
    id: number;
    email: string;
    name?: string;
  };
  teamMembers?: TeamMember[];
  tasks?: Task[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Team Member Interface
 */
export interface TeamMember {
  id: number;
  projectId: number;
  userId: number;
  role: string;
  permissions?: string[];
  addedAt: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

/**
 * Task Interface
 */
export interface Task {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  assignedToId?: number;
  assignedTo?: {
    id: number;
    email: string;
    name?: string;
  };
  dependencies?: number[]; // Task IDs
  attachments?: string[];
  tags?: string[];
  createdById: number;
  createdBy?: {
    id: number;
    email: string;
    name?: string;
  };
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Comment Interface
 */
export interface Comment {
  id: number;
  projectId?: number;
  taskId?: number;
  content: string;
  attachments?: string[];
  authorId: number;
  author?: {
    id: number;
    email: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * DTOs for API calls
 */

export interface CreateProjectDto {
  name: string;
  description?: string;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  budget?: number;
  location?: string;
  clientName?: string;
  clientContact?: string;
  images?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  progress?: number;
  location?: string;
  clientName?: string;
  clientContact?: string;
  images?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FilterProjectsDto {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  search?: string;
  mine?: boolean; // My projects only
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddTeamMemberDto {
  userId: number;
  role: string;
  permissions?: string[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  assignedToId?: number;
  dependencies?: number[];
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  assignedToId?: number;
  dependencies?: number[];
  attachments?: string[];
  tags?: string[];
}

export interface FilterTasksDto {
  projectId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCommentDto {
  content: string;
  attachments?: string[];
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
}
