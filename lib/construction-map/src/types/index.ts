/**
 * Core types for Construction Map Library
 */

export interface Point {
  x: number;
  y: number;
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EngineConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  enableWebGL?: boolean;
  maxZoom?: number;
  minZoom?: number;
  initialZoom?: number;
  backgroundColor?: string;
  gridEnabled?: boolean;
  gridSpacing?: number;
}

export interface CameraState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'late';
export type StageStatus = 'upcoming' | 'active' | 'completed';

export interface TaskData {
  id: string;
  stageId: string;
  label: string;
  description?: string;
  status: TaskStatus;
  progress: number; // 0-100
  x: number; // Canvas position
  y: number;
  width?: number;
  height?: number;
  assignedWorkers?: string[];
  startDate?: Date;
  endDate?: Date;
  dependencies?: string[];
  notes?: string;
  photos?: string[];
}

export interface StageData {
  id: string;
  number: string; // "01", "02", "03", "04"
  label: string;
  description?: string;
  status: StageStatus;
  x: number; // Canvas position
  y: number;
  startDate?: Date;
  endDate?: Date;
  taskIds?: string[];
}

export interface LinkData {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'dependency' | 'stage-task';
  style?: {
    color?: string;
    width?: number;
    dashArray?: number[];
  };
}

export interface MapState {
  projectId: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  selectedTaskIds: string[];
  version: number;
  lastModified: Date;
}

export interface ConstructionProject {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  stages: StageData[];
  tasks: TaskData[];
  links: LinkData[];
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  camera: CameraState;
  timestamp: number;
  deltaTime: number;
}

export interface EventHandler<T = any> {
  (data: T): void;
}

export type EventMap = {
  'task-selected': TaskData;
  'task-deselected': TaskData;
  'task-moved': TaskData;
  'task-created': TaskData;
  'task-deleted': string;
  'task-status-changed': { taskId: string; status: TaskStatus };
  'stage-selected': StageData;
  'zoom-changed': { zoom: number };
  'pan-changed': { x: number; y: number };
  'viewport-changed': BBox;
  'data-loaded': ConstructionProject;
  'data-changed': any;
  'error': Error;
};

export interface StatusConfig {
  color: string;
  fill: string;
  progress: number;
  label: string;
}

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  pending: {
    color: '#9e9e9e',
    fill: '#f0f0f0',
    progress: 0,
    label: 'Chưa bắt đầu',
  },
  'in-progress': {
    color: '#ffb300',
    fill: '#fff8e1',
    progress: 0.5,
    label: 'Đang thực hiện',
  },
  done: {
    color: '#4caf50',
    fill: '#e8f5e9',
    progress: 1,
    label: 'Hoàn thành',
  },
  late: {
    color: '#e53935',
    fill: '#ffebee',
    progress: 0.3,
    label: 'Trễ hạn',
  },
};
