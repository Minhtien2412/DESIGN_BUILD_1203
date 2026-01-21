/**
 * Progress Report Types
 * Các type cho module báo cáo tiến độ dự án
 */

export enum TaskStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  index: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  description?: string;
  subTasks?: SubTask[];
  images?: string[];
  hasVideo?: boolean;
  videoDuration?: string;
  reportNumber?: string;
}

export type ViewType = 'OVERVIEW' | 'DETAIL';

export interface Project {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  progress: number;
  currentTask?: string;
  tasks: Task[];
}
