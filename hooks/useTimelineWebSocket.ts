/**
 * Timeline WebSocket Hook
 * Real-time updates for project timeline and phase progress
 * 
 * Events listened to:
 * - phaseCreated: New phase added to project
 * - phaseUpdated: Phase details changed
 * - phaseDeleted: Phase removed from project
 * - phaseProgressUpdated: Phase progress percentage changed
 * - phaseReordered: Phase order changed (drag & drop)
 * - taskCreated: New task added to phase
 * - taskUpdated: Task details changed
 * - taskDeleted: Task removed from phase
 */

import { useWebSocket } from '@/context/WebSocketContext';
import { Phase, PhaseTask } from '@/services/timeline-api';
import { useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface TimelineWebSocketEvents {
  onPhaseCreated?: (phase: Phase) => void;
  onPhaseUpdated?: (phase: Phase) => void;
  onPhaseDeleted?: (phaseId: number) => void;
  onPhaseProgressUpdated?: (data: { phaseId: number; progress: number }) => void;
  onPhaseReordered?: (data: { phases: { id: number; order: number }[] }) => void;
  onTaskCreated?: (task: PhaseTask) => void;
  onTaskUpdated?: (task: PhaseTask) => void;
  onTaskDeleted?: (taskId: number) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useTimelineWebSocket(
  projectId: number | string | undefined,
  events: TimelineWebSocketEvents
) {
  const { socket, connected } = useWebSocket();

  // ============================================================================
  // Join Project Room
  // ============================================================================

  useEffect(() => {
    if (!socket || !connected || !projectId) {
      return;
    }

    const projectIdNum = typeof projectId === 'string' ? Number(projectId) : projectId;

    // Join project-specific room for timeline updates
    socket.emit('timeline:join', { projectId: projectIdNum });
    console.log(`[Timeline WS] Joined project ${projectIdNum} timeline room`);

    return () => {
      // Leave room on unmount
      socket.emit('timeline:leave', { projectId: projectIdNum });
      console.log(`[Timeline WS] Left project ${projectIdNum} timeline room`);
    };
  }, [socket, connected, projectId]);

  // ============================================================================
  // Phase Events
  // ============================================================================

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    // Phase Created
    if (events.onPhaseCreated) {
      const handler = (phase: Phase) => {
        console.log('[Timeline WS] Phase created:', phase);
        events.onPhaseCreated?.(phase);
      };
      socket.on('timeline:phaseCreated', handler);
    }

    // Phase Updated
    if (events.onPhaseUpdated) {
      const handler = (phase: Phase) => {
        console.log('[Timeline WS] Phase updated:', phase);
        events.onPhaseUpdated?.(phase);
      };
      socket.on('timeline:phaseUpdated', handler);
    }

    // Phase Deleted
    if (events.onPhaseDeleted) {
      const handler = (data: { phaseId: number }) => {
        console.log('[Timeline WS] Phase deleted:', data.phaseId);
        events.onPhaseDeleted?.(data.phaseId);
      };
      socket.on('timeline:phaseDeleted', handler);
    }

    // Phase Progress Updated
    if (events.onPhaseProgressUpdated) {
      const handler = (data: { phaseId: number; progress: number }) => {
        console.log('[Timeline WS] Phase progress updated:', data);
        events.onPhaseProgressUpdated?.(data);
      };
      socket.on('timeline:phaseProgressUpdated', handler);
    }

    // Phase Reordered
    if (events.onPhaseReordered) {
      const handler = (data: { phases: { id: number; order: number }[] }) => {
        console.log('[Timeline WS] Phases reordered:', data);
        events.onPhaseReordered?.(data);
      };
      socket.on('timeline:phaseReordered', handler);
    }

    // Cleanup listeners
    return () => {
      socket.off('timeline:phaseCreated');
      socket.off('timeline:phaseUpdated');
      socket.off('timeline:phaseDeleted');
      socket.off('timeline:phaseProgressUpdated');
      socket.off('timeline:phaseReordered');
    };
  }, [socket, connected, events]);

  // ============================================================================
  // Task Events
  // ============================================================================

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    // Task Created
    if (events.onTaskCreated) {
      const handler = (task: PhaseTask) => {
        console.log('[Timeline WS] Task created:', task);
        events.onTaskCreated?.(task);
      };
      socket.on('timeline:taskCreated', handler);
    }

    // Task Updated
    if (events.onTaskUpdated) {
      const handler = (task: PhaseTask) => {
        console.log('[Timeline WS] Task updated:', task);
        events.onTaskUpdated?.(task);
      };
      socket.on('timeline:taskUpdated', handler);
    }

    // Task Deleted
    if (events.onTaskDeleted) {
      const handler = (data: { taskId: number }) => {
        console.log('[Timeline WS] Task deleted:', data.taskId);
        events.onTaskDeleted?.(data.taskId);
      };
      socket.on('timeline:taskDeleted', handler);
    }

    // Cleanup listeners
    return () => {
      socket.off('timeline:taskCreated');
      socket.off('timeline:taskUpdated');
      socket.off('timeline:taskDeleted');
    };
  }, [socket, connected, events]);

  // ============================================================================
  // Return Value
  // ============================================================================

  return {
    connected,
    socket,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default useTimelineWebSocket;
