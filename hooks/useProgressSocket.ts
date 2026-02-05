/**
 * useProgressSocket Hook
 * Custom hook for easy subscription to real-time progress updates
 *
 * @created 2026-02-04
 *
 * Features:
 * - Auto-subscribe/unsubscribe on mount/unmount
 * - Handle connection state
 * - Optimistic updates
 * - Error handling with fallback
 */

import { useProgressWebSocket } from "@/context/ProgressWebSocketContext";
import type {
    ProgressUpdateData,
    ProjectProgress,
    TaskProgress,
} from "@/services/progressSocket";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface UseTaskProgressOptions {
  taskId: string | number;
  onUpdate?: (data: TaskProgress) => void;
  onError?: (error: string) => void;
  pollingInterval?: number; // Fallback polling in ms (default: 30000)
}

export interface UseProjectProgressOptions {
  projectId: string | number;
  onUpdate?: (data: ProjectProgress) => void;
  onError?: (error: string) => void;
  pollingInterval?: number;
}

export interface UseTaskProgressResult {
  taskProgress: TaskProgress | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
  refresh: () => Promise<void>;
}

export interface UseProjectProgressResult {
  projectProgress: ProjectProgress | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
  refresh: () => Promise<void>;
}

// ============================================================================
// useTaskProgress Hook
// ============================================================================

export function useTaskProgress({
  taskId,
  onUpdate,
  onError,
  pollingInterval = 30000,
}: UseTaskProgressOptions): UseTaskProgressResult {
  const { connected, subscribeToTask, connect } = useProgressWebSocket();
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert to number for WebSocket API
  const numericTaskId =
    typeof taskId === "string" ? parseInt(taskId, 10) || 0 : taskId;

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onErrorRef.current = onError;
  }, [onUpdate, onError]);

  // Handle real-time updates
  const handleUpdate = useCallback((data: ProgressUpdateData) => {
    if (data.progress && "taskId" in data.progress) {
      const taskProgress = data.progress as TaskProgress;
      setProgress(taskProgress);
      setLoading(false);
      setError(null);
      onUpdateRef.current?.(taskProgress);
    }
  }, []);

  // Fetch task progress (fallback API)
  const fetchProgress = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/tasks/${taskId}/progress`);
      // setProgress(response.data);

      // Mock data for now
      setProgress({
        taskId: numericTaskId,
        name: `Task ${taskId}`,
        status: "IN_PROGRESS",
        progress: Math.floor(Math.random() * 30) + 50,
        assignees: [{ id: 1, fullName: "Nguyễn Văn A" }],
        startDate: "2026-02-01",
        dueDate: "2026-02-10",
        completedDate: null,
        activityCount: { comments: 5, files: 3 },
        lastUpdated: new Date().toISOString(),
      });
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải tiến độ";
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
    }
  }, [taskId, numericTaskId]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchProgress();
  }, [fetchProgress]);

  // Subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setup = async () => {
      // Try to connect if not connected
      if (!connected) {
        try {
          await connect();
        } catch (err) {
          console.log(
            "[useTaskProgress] WebSocket not available, using polling",
          );
        }
      }

      // Subscribe if connected
      if (connected) {
        unsubscribe = subscribeToTask(numericTaskId, handleUpdate);
      }

      // Always fetch initial data
      await fetchProgress();

      // Setup polling as fallback if not connected
      if (!connected && pollingInterval > 0) {
        pollingRef.current = setInterval(fetchProgress, pollingInterval);
      }
    };

    setup();

    return () => {
      unsubscribe?.();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [
    taskId,
    numericTaskId,
    connected,
    subscribeToTask,
    connect,
    handleUpdate,
    fetchProgress,
    pollingInterval,
  ]);

  return { taskProgress: progress, loading, error, connected, refresh };
}

// ============================================================================
// useProjectProgress Hook
// ============================================================================

export function useProjectProgress({
  projectId,
  onUpdate,
  onError,
  pollingInterval = 30000,
}: UseProjectProgressOptions): UseProjectProgressResult {
  const { connected, subscribeToProject, connect } = useProgressWebSocket();
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert to number for WebSocket API
  const numericProjectId =
    typeof projectId === "string" ? parseInt(projectId, 10) || 0 : projectId;

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onErrorRef.current = onError;
  }, [onUpdate, onError]);

  const handleUpdate = useCallback((data: ProgressUpdateData) => {
    if (data.progress && "projectId" in data.progress) {
      const projectProgress = data.progress as ProjectProgress;
      setProgress(projectProgress);
      setLoading(false);
      setError(null);
      onUpdateRef.current?.(projectProgress);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/projects/${projectId}/progress`);

      // Mock data
      const overallProgress = Math.floor(Math.random() * 20) + 60;
      setProgress({
        projectId: numericProjectId,
        name: `Dự án ${projectId}`,
        status: "IN_PROGRESS",
        overallProgress,
        completedTasks: Math.floor(overallProgress / 10),
        totalTasks: 10,
        inProgressTasks: 3,
        todoTasks: 10 - Math.floor(overallProgress / 10) - 3,
        budget: {
          total: 5000000000,
          spent: 5000000000 * (overallProgress / 100),
          remaining: 5000000000 * (1 - overallProgress / 100),
          percentUsed: overallProgress,
        },
        timeline: {
          startDate: "2026-01-01",
          endDate: "2026-06-30",
          daysElapsed: 34,
          daysRemaining: 146,
          totalDays: 180,
          percentTimeElapsed: 19,
          isOverdue: false,
        },
        milestones: [
          { name: "Nền móng", progress: 100, completed: true },
          { name: "Khung kết cấu", progress: 80, completed: false },
          { name: "Hoàn thiện", progress: 20, completed: false },
        ],
        team: { members: 25, activeMembers: 20 },
        activity: {
          totalComments: 156,
          totalFiles: 89,
          lastActivityDate: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      });
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải tiến độ dự án";
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
    }
  }, [projectId, numericProjectId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setup = async () => {
      if (!connected) {
        try {
          await connect();
        } catch (err) {
          console.log(
            "[useProjectProgress] WebSocket not available, using polling",
          );
        }
      }

      if (connected) {
        unsubscribe = subscribeToProject(numericProjectId, handleUpdate);
      }

      await fetchProgress();

      if (!connected && pollingInterval > 0) {
        pollingRef.current = setInterval(fetchProgress, pollingInterval);
      }
    };

    setup();

    return () => {
      unsubscribe?.();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [
    projectId,
    numericProjectId,
    connected,
    subscribeToProject,
    connect,
    handleUpdate,
    fetchProgress,
    pollingInterval,
  ]);

  return { projectProgress: progress, loading, error, connected, refresh };
}

// ============================================================================
// useMultipleTasksProgress Hook
// ============================================================================

export interface UseMultipleTasksProgressOptions {
  taskIds: (string | number)[];
  onUpdate?: (taskId: string | number, data: TaskProgress) => void;
}

export function useMultipleTasksProgress({
  taskIds,
  onUpdate,
}: UseMultipleTasksProgressOptions) {
  const { connected, subscribeToTask, connect } = useProgressWebSocket();
  const [tasksProgress, setTasksProgress] = useState<
    Map<string | number, TaskProgress>
  >(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    const setup = async () => {
      if (!connected) {
        try {
          await connect();
        } catch (err) {
          console.log("[useMultipleTasksProgress] WebSocket not available");
        }
      }

      taskIds.forEach((taskId) => {
        if (connected) {
          // Convert to number for WebSocket API
          const numericId =
            typeof taskId === "string" ? parseInt(taskId, 10) || 0 : taskId;
          const unsubscribe = subscribeToTask(
            numericId,
            (data: ProgressUpdateData) => {
              if (data.progress && "taskId" in data.progress) {
                const taskProgress = data.progress as TaskProgress;
                setTasksProgress((prev) =>
                  new Map(prev).set(taskId, taskProgress),
                );
                onUpdate?.(taskId, taskProgress);
              }
            },
          );
          unsubscribes.push(unsubscribe);
        }
      });

      setLoading(false);
    };

    setup();

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [taskIds.join(","), connected, subscribeToTask, connect, onUpdate]);

  return { tasksProgress, loading, connected };
}

export default useTaskProgress;
