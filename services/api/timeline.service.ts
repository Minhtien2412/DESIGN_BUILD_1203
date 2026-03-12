/**
 * Timeline Service
 * Handles project timeline and phase management endpoints
 * 
 * Endpoints:
 * - GET /timeline/projects/{projectId} - Get project timeline
 * - GET /timeline/projects/{projectId}/check-delayed - Check for delays
 * - POST /timeline/phases - Create phase
 * - GET /timeline/phases/{id} - Get phase details
 * - PATCH /timeline/phases/{id} - Update phase
 * - DELETE /timeline/phases/{id} - Delete phase
 * - PATCH /timeline/phases/reorder - Reorder phases
 * - PATCH /timeline/phases/{id}/progress - Update phase progress
 * - POST /timeline/phases/{id}/tasks - Create phase task
 * - PATCH /timeline/tasks/{id} - Update phase task
 * - DELETE /timeline/tasks/{id} - Delete phase task
 * - GET /timeline/projects/{projectId}/notifications - Get timeline notifications
 * - PATCH /timeline/notifications/mark-read - Mark notifications as read
 */

import { apiClient } from './client';
import type {
    CreatePhaseData,
    CreatePhaseTaskData,
    Phase,
    PhaseTask,
    ProjectTimeline,
    ReorderPhasesData,
    UpdatePhaseData,
    UpdatePhaseProgressData,
} from './types';

export const timelineService = {
  /**
   * Get project timeline
   * GET /timeline/projects/{projectId}
   */
  getProjectTimeline: async (projectId: number): Promise<ProjectTimeline> => {
    console.log('[TimelineService] 📅 Fetching timeline for project:', projectId);
    
    const response = await apiClient.get<ProjectTimeline>(`/timeline/projects/${projectId}`);
    
    console.log('[TimelineService] ✅ Timeline fetched:', response.phases.length, 'phases');
    return response;
  },

  /**
   * Check if project has delays
   * GET /timeline/projects/{projectId}/check-delayed
   */
  checkDelayed: async (projectId: number): Promise<{ isDelayed: boolean; delayedPhases: Phase[] }> => {
    console.log('[TimelineService] ⏰ Checking delays for project:', projectId);
    
    const response = await apiClient.get<{ isDelayed: boolean; delayedPhases: Phase[] }>(
      `/timeline/projects/${projectId}/check-delayed`
    );
    
    console.log('[TimelineService] ✅ Delay check complete:', response.isDelayed ? 'DELAYED' : 'ON TRACK');
    return response;
  },

  /**
   * Create new phase
   * POST /timeline/phases
   */
  createPhase: async (data: CreatePhaseData): Promise<Phase> => {
    console.log('[TimelineService] ➕ Creating phase:', data.name);
    
    const response = await apiClient.post<Phase>('/timeline/phases', data);
    
    console.log('[TimelineService] ✅ Phase created:', response.id);
    return response;
  },

  /**
   * Get phase by ID
   * GET /timeline/phases/{id}
   */
  getPhase: async (phaseId: number): Promise<Phase> => {
    console.log('[TimelineService] 📋 Fetching phase:', phaseId);
    
    const response = await apiClient.get<Phase>(`/timeline/phases/${phaseId}`);
    
    console.log('[TimelineService] ✅ Phase fetched:', response.name);
    return response;
  },

  /**
   * Update phase
   * PATCH /timeline/phases/{id}
   */
  updatePhase: async (phaseId: number, data: UpdatePhaseData): Promise<Phase> => {
    console.log('[TimelineService] ✏️ Updating phase:', phaseId);
    
    const response = await apiClient.patch<Phase>(`/timeline/phases/${phaseId}`, data);
    
    console.log('[TimelineService] ✅ Phase updated');
    return response;
  },

  /**
   * Delete phase
   * DELETE /timeline/phases/{id}
   */
  deletePhase: async (phaseId: number): Promise<void> => {
    console.log('[TimelineService] 🗑️ Deleting phase:', phaseId);
    
    await apiClient.delete(`/timeline/phases/${phaseId}`);
    
    console.log('[TimelineService] ✅ Phase deleted');
  },

  /**
   * Reorder phases
   * PATCH /timeline/phases/reorder
   */
  reorderPhases: async (data: ReorderPhasesData): Promise<Phase[]> => {
    console.log('[TimelineService] 🔄 Reordering phases for project:', data.projectId);
    
    const response = await apiClient.patch<Phase[]>('/timeline/phases/reorder', data);
    
    console.log('[TimelineService] ✅ Phases reordered');
    return response;
  },

  /**
   * Update phase progress
   * PATCH /timeline/phases/{id}/progress
   */
  updatePhaseProgress: async (phaseId: number, data: UpdatePhaseProgressData): Promise<Phase> => {
    console.log('[TimelineService] 📊 Updating progress for phase:', phaseId);
    
    const response = await apiClient.patch<Phase>(`/timeline/phases/${phaseId}/progress`, data);
    
    console.log('[TimelineService] ✅ Progress updated to', data.progress, '%');
    return response;
  },

  /**
   * Create phase task
   * POST /timeline/phases/{id}/tasks
   */
  createPhaseTask: async (phaseId: number, data: Omit<CreatePhaseTaskData, 'phaseId'>): Promise<PhaseTask> => {
    console.log('[TimelineService] ➕ Creating task for phase:', phaseId);
    
    const response = await apiClient.post<PhaseTask>(`/timeline/phases/${phaseId}/tasks`, data);
    
    console.log('[TimelineService] ✅ Phase task created');
    return response;
  },

  /**
   * Update phase task
   * PATCH /timeline/tasks/{id}
   */
  updatePhaseTask: async (taskId: number, data: Partial<PhaseTask>): Promise<PhaseTask> => {
    console.log('[TimelineService] ✏️ Updating phase task:', taskId);
    
    const response = await apiClient.patch<PhaseTask>(`/timeline/tasks/${taskId}`, data);
    
    console.log('[TimelineService] ✅ Phase task updated');
    return response;
  },

  /**
   * Delete phase task
   * DELETE /timeline/tasks/{id}
   */
  deletePhaseTask: async (taskId: number): Promise<void> => {
    console.log('[TimelineService] 🗑️ Deleting phase task:', taskId);
    
    await apiClient.delete(`/timeline/tasks/${taskId}`);
    
    console.log('[TimelineService] ✅ Phase task deleted');
  },

  /**
   * Get timeline notifications
   * GET /timeline/projects/{projectId}/notifications
   */
  getNotifications: async (projectId: number): Promise<any[]> => {
    console.log('[TimelineService] 🔔 Fetching notifications for project:', projectId);
    
    const response = await apiClient.get<any[]>(`/timeline/projects/${projectId}/notifications`);
    
    console.log('[TimelineService] ✅ Notifications fetched:', response.length);
    return response;
  },

  /**
   * Mark notifications as read
   * PATCH /timeline/notifications/mark-read
   */
  markNotificationsRead: async (notificationIds: number[]): Promise<void> => {
    console.log('[TimelineService] ✅ Marking', notificationIds.length, 'notifications as read');
    
    await apiClient.patch('/timeline/notifications/mark-read', { notificationIds });
    
    console.log('[TimelineService] ✅ Notifications marked as read');
  },
};

export default timelineService;
