/**
 * Construction Map Type Definitions
 * Shared types for construction map components and services
 */

// ============================================
// Core Data Types
// ============================================

export interface Task {
  id: string;
  projectId: string;
  stageId: string;
  name: string;
  label?: string;
  description?: string;
  x: number;
  y: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  assignee?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  dependencies?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Stage {
  id: string;
  projectId: string;
  name: string;
  number?: string;
  label?: string;
  description?: string;
  x: number;
  y: number;
  color?: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  order?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Link {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
  type: 'task-task' | 'stage-task' | 'stage-stage';
  label?: string;
  createdAt?: string;
}

export interface MapState {
  id?: string;
  projectId: string;
  zoom: number;
  pan: {
    x: number;
    y: number;
  };
  panX?: number;
  panY?: number;
  viewport?: {
    width: number;
    height: number;
  };
  updatedAt?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ProjectData {
  projectId: string;
  tasks: Task[];
  stages: Stage[];
  links: Link[];
  mapState?: MapState;
}

// Extended project type for UI components that need more metadata
export interface ConstructionProject extends ProjectData {
  id?: string;                     // Alternative ID field
  name?: string;                   // Display name
  description?: string;            // Project description
  status?: 'Planning' | 'InProgress' | 'OnHold' | 'Completed' | 'Cancelled';
  startDate?: string;
  endDate?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ProgressData {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  progressPercentage: number;
  stageProgress: Record<string, {
    total: number;
    completed: number;
    percentage: number;
  }>;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  database?: 'connected' | 'disconnected';
  websocket?: 'connected' | 'disconnected';
}

// ============================================
// WebSocket Event Types
// ============================================

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
}

export interface TaskMovedEvent {
  taskId: string;
  x: number;
  y: number;
  userId: string;
}

export interface TaskStatusChangedEvent {
  taskId: string;
  status: Task['status'];
  progress: number;
  userId: string;
}

export interface ZoomChangedEvent {
  zoom: number;
  userId: string;
}

export interface PanChangedEvent {
  x: number;
  y: number;
  userId: string;
}

export interface UserPresence {
  userId: string;
  username?: string;
  color?: string;
  cursor?: {
    x: number;
    y: number;
  };
  lastSeen: string;
}

// ============================================
// Component Props Types
// ============================================

export interface ConstructionMapCanvasProps {
  projectId: string;
  showControls?: boolean;
  showTaskList?: boolean;
  showStageList?: boolean;
  onTaskSelect?: (taskId: string) => void;
  onStageSelect?: (stageId: string) => void;
  autoSaveInterval?: number;
}

export interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  mapState: MapState | null;
  minZoom?: number;
  maxZoom?: number;
}

export interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onPress?: () => void;
  onUpdate?: (task: Partial<Task>) => void;
  onDelete?: () => void;
  compact?: boolean;
}

export interface StageCardProps {
  stage: Stage;
  taskCount?: number;
  completedTasks?: number;
  isSelected?: boolean;
  onPress?: () => void;
  onUpdate?: (stage: Partial<Stage>) => void;
  onDelete?: () => void;
  compact?: boolean;
}

// ============================================
// Hook Return Types
// ============================================

export interface UseConstructionMapReturn {
  // Canvas
  containerRef: React.RefObject<HTMLDivElement>;
  engine: any | null;
  
  // State
  loading: boolean;
  saving: boolean;
  syncing: boolean;
  error: string | null;
  
  // Data
  tasks: Task[];
  stages: Stage[];
  links: Link[];
  mapState: MapState | null;
  
  // View State
  zoom: number;
  selectedTaskIds: string[];
  selectedStageIds: string[];
  activeUsers: UserPresence[];
  
  // View Controls
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number) => void;
  resetView: () => void;
  
  // Task Operations
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, x: number, y: number) => Promise<Task>;
  
  // Stage Operations
  createStage: (stage: Partial<Stage>) => Promise<Stage>;
  updateStage: (id: string, updates: Partial<Stage>) => Promise<Stage>;
  deleteStage: (id: string) => Promise<void>;
  
  // Map State
  saveMapState: (state: Partial<MapState>) => Promise<void>;
  
  // Progress
  getProgress: () => Promise<ProgressData>;
}

export interface UseConstructionTasksReturn {
  // Data
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Computed
  tasksByStage: Record<string, Task[]>;
  stageProgress: Record<string, number>;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  
  // Operations
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export interface UseConstructionStagesReturn {
  // Data
  stages: Stage[];
  loading: boolean;
  error: string | null;
  
  // Computed
  activeStages: Stage[];
  completedStages: Stage[];
  
  // Operations
  createStage: (stage: Partial<Stage>) => Promise<Stage>;
  updateStage: (id: string, updates: Partial<Stage>) => Promise<Stage>;
  deleteStage: (id: string) => Promise<void>;
  refreshStages: () => Promise<void>;
  getStage: (id: string) => Stage | undefined;
}

export interface UseMapStateReturn {
  // Data
  mapState: MapState | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Operations
  saveMapState: (state: Partial<MapState>) => Promise<void>;
  loadMapState: () => Promise<void>;
  updateZoom: (zoom: number) => void;
  updatePan: (x: number, y: number) => void;
  updateViewport: (width: number, height: number) => void;
}

// ============================================
// Utility Types
// ============================================

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
export type StageStatus = Stage['status'];
export type LinkType = Link['type'];

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  stageId?: string;
  assignee?: string;
  tags?: string[];
  searchQuery?: string;
}

export interface StageFilters {
  status?: StageStatus[];
  searchQuery?: string;
}

export interface SortOptions {
  field: 'name' | 'status' | 'progress' | 'priority' | 'startDate' | 'endDate' | 'createdAt';
  direction: 'asc' | 'desc';
}
