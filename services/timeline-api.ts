/**
 * Timeline API Service
 * Gantt Chart & Milestone Management
 */

import { del, get, patch, post } from './api';

// ==================== TYPES ====================

export interface Phase {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'ON_HOLD';
  startDate: string; // ISO string
  endDate: string; // ISO string
  progress: number; // 0-100
  color?: string; // Hex color for Gantt chart
  icon?: string; // Icon name
  order: number; // Display order
  tasks?: PhaseTask[];
  createdAt: string;
  updatedAt: string;
}

export interface PhaseTask {
  id: number;
  phaseId: number;
  name: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo?: number; // User ID
  startDate?: string;
  endDate?: string;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTimeline {
  projectId: number;
  phases: Phase[];
  totalProgress: number; // Overall project progress
  delayedPhases: Phase[];
  criticalPath: Phase[];
}

export interface TimelineNotification {
  id: number;
  projectId: number;
  phaseId?: number;
  type: 'PROGRESS_UPDATE' | 'PHASE_DELAYED' | 'PHASE_COMPLETED' | 'MILESTONE_REACHED';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreatePhaseDto {
  projectId: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  color?: string;
  icon?: string;
}

export interface UpdatePhaseDto {
  name?: string;
  description?: string;
  status?: Phase['status'];
  startDate?: string;
  endDate?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProgressDto {
  progress: number; // 0-100
  note?: string;
}

export interface CreatePhaseTaskDto {
  name: string;
  description?: string;
  assignedTo?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePhaseTaskDto {
  name?: string;
  description?: string;
  status?: PhaseTask['status'];
  progress?: number;
  startDate?: string;
  endDate?: string;
}

export interface ReorderPhasesDto {
  phaseOrders: Array<{ id: number; order: number }>;
}

// ==================== API FUNCTIONS ====================

/**
 * Get project timeline (Gantt Chart data)
 */
export async function getProjectTimeline(projectId: number): Promise<ProjectTimeline> {
  return get<ProjectTimeline>(`/timeline/projects/${projectId}`);
}

/**
 * Check delayed phases in project
 */
export async function checkDelayedPhases(projectId: number): Promise<Phase[]> {
  return get<Phase[]>(`/timeline/projects/${projectId}/check-delayed`);
}

/**
 * Create new phase (milestone)
 */
export async function createPhase(dto: CreatePhaseDto): Promise<Phase> {
  return post<Phase>('/timeline/phases', dto);
}

/**
 * Get phase by ID
 */
export async function getPhaseById(id: number): Promise<Phase> {
  return get<Phase>(`/timeline/phases/${id}`);
}

/**
 * Update phase
 */
export async function updatePhase(id: number, dto: UpdatePhaseDto): Promise<Phase> {
  return patch<Phase>(`/timeline/phases/${id}`, dto);
}

/**
 * Delete phase
 */
export async function deletePhase(id: number): Promise<void> {
  return del(`/timeline/phases/${id}`);
}

/**
 * Reorder phases (drag & drop)
 */
export async function reorderPhases(
  projectId: number,
  dto: ReorderPhasesDto
): Promise<Phase[]> {
  return patch<Phase[]>(`/timeline/phases/reorder?projectId=${projectId}`, dto);
}

/**
 * Update phase progress
 * Auto-sends notification to client
 */
export async function updatePhaseProgress(
  id: number,
  dto: UpdateProgressDto
): Promise<Phase> {
  return patch<Phase>(`/timeline/phases/${id}/progress`, dto);
}

/**
 * Create task for phase
 */
export async function createPhaseTask(
  phaseId: number,
  dto: CreatePhaseTaskDto
): Promise<PhaseTask> {
  return post<PhaseTask>(`/timeline/phases/${phaseId}/tasks`, dto);
}

/**
 * Update phase task
 * Auto-recalculates phase progress
 */
export async function updatePhaseTask(
  id: number,
  dto: UpdatePhaseTaskDto
): Promise<PhaseTask> {
  return patch<PhaseTask>(`/timeline/tasks/${id}`, dto);
}

/**
 * Delete phase task
 */
export async function deletePhaseTask(id: number): Promise<void> {
  return del(`/timeline/tasks/${id}`);
}

/**
 * Get project notifications
 */
export async function getProjectNotifications(
  projectId: number,
  unreadOnly: boolean = false
): Promise<TimelineNotification[]> {
  const url = `/timeline/projects/${projectId}/notifications${
    unreadOnly ? '?unreadOnly=true' : ''
  }`;
  return get<TimelineNotification[]>(url);
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(notificationIds: number[]): Promise<void> {
  return patch('/timeline/notifications/mark-read', { notificationIds });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate overall project progress from phases
 */
export function calculateProjectProgress(phases: Phase[]): number {
  if (phases.length === 0) return 0;
  const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
  return Math.round(totalProgress / phases.length);
}

/**
 * Get phase status color
 */
export function getPhaseStatusColor(status: Phase['status']): string {
  switch (status) {
    case 'NOT_STARTED':
      return '#9CA3AF'; // Gray
    case 'IN_PROGRESS':
      return '#3B82F6'; // Blue
    case 'COMPLETED':
      return '#0066CC'; // Green
    case 'DELAYED':
      return '#000000'; // Red
    case 'ON_HOLD':
      return '#0066CC'; // Orange
    default:
      return '#6B7280';
  }
}

/**
 * Get phase status label (Vietnamese)
 */
export function getPhaseStatusLabel(status: Phase['status']): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'Chưa bắt đầu';
    case 'IN_PROGRESS':
      return 'Đang thực hiện';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'DELAYED':
      return 'Trễ hạn';
    case 'ON_HOLD':
      return 'Tạm dừng';
    default:
      return 'Không xác định';
  }
}

/**
 * Check if phase is delayed
 */
export function isPhaseDelayed(phase: Phase): boolean {
  if (phase.status === 'COMPLETED') return false;
  const endDate = new Date(phase.endDate);
  const today = new Date();
  return today > endDate && phase.progress < 100;
}

/**
 * Calculate days remaining
 */
export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  };
  
  return `${start.toLocaleDateString('vi-VN', options)} - ${end.toLocaleDateString('vi-VN', options)}`;
}

/**
 * Calculate phase duration in days
 */
export function getPhaseDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
