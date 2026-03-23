import { useCallback, useEffect, useState } from "react";

import { del, get, patch, post, put } from "@/services/api";

// Types matching backend
export interface Task {
  id: string;
  projectId: string;
  stageId: string;
  label: string;
  description?: string;
  status: "pending" | "in-progress" | "done" | "late";
  progress: number;
  x: number;
  y: number;
  width: number;
  height: number;
  assignedWorkers?: string[];
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
  notes?: string;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Stage {
  id: string;
  projectId: string;
  number: string;
  label: string;
  description?: string;
  status: "upcoming" | "active" | "completed";
  x: number;
  y: number;
  startDate?: string;
  endDate?: string;
  tasks?: Task[];
}

export interface Link {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
  type: "dependency" | "stage-task";
  style?: {
    color?: string;
    width?: number;
    dashArray?: string;
  };
}

export interface MapState {
  projectId: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  selectedTaskIds: string[];
  version: number;
  lastModified?: string;
}

export interface ProjectData {
  id: string;
  stages: Stage[];
  tasks: Task[];
  links: Link[];
}

export interface ProgressData {
  overall: number;
  byStage: Record<string, number>;
}

/**
 * Hook for Construction Map REST API
 * Manages fetching and mutations for project data
 */
export function useConstructionMapAPI(projectId: string) {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch full project data
  const fetchProject = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const projectData = await get(`/construction-map/${projectId}`);
      setData(projectData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch on mount and projectId change
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Get progress statistics
  const getProgress = useCallback(async (): Promise<ProgressData | null> => {
    try {
      return await get(`/construction-map/${projectId}/progress`);
    } catch (err) {
      console.error("Error fetching progress:", err);
      return null;
    }
  }, [projectId]);

  // Create new task
  const createTask = useCallback(
    async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newTask = await post("/construction-map/tasks", taskData);

        // Optimistically update local state
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: [...prev.tasks, newTask],
          };
        });

        return newTask;
      } catch (err) {
        console.error("Error creating task:", err);
        throw err;
      }
    },
    [],
  );

  // Update task position (for drag & drop)
  const updateTaskPosition = useCallback(
    async (taskId: string, x: number, y: number) => {
      try {
        const updatedTask = await patch(
          `/construction-map/tasks/${taskId}/position`,
          { x, y },
        );

        // Optimistically update local state
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId ? { ...task, x, y } : task,
            ),
          };
        });

        return updatedTask;
      } catch (err) {
        console.error("Error updating task position:", err);
        throw err;
      }
    },
    [],
  );

  // Update task status
  const updateTaskStatus = useCallback(
    async (taskId: string, status: Task["status"]) => {
      try {
        const updatedTask = await patch(
          `/construction-map/tasks/${taskId}/status`,
          { status },
        );

        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task,
            ),
          };
        });

        return updatedTask;
      } catch (err) {
        console.error("Error updating task status:", err);
        throw err;
      }
    },
    [],
  );

  // Update full task
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      try {
        const updatedTask = await put(
          `/construction-map/tasks/${taskId}`,
          updates,
        );

        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task,
            ),
          };
        });

        return updatedTask;
      } catch (err) {
        console.error("Error updating task:", err);
        throw err;
      }
    },
    [],
  );

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await del(`/construction-map/tasks/${taskId}`);

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.filter((task) => task.id !== taskId),
        };
      });
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  }, []);

  // Create stage
  const createStage = useCallback(
    async (stageData: Omit<Stage, "id" | "tasks">) => {
      try {
        const newStage = await post("/construction-map/stages", stageData);

        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            stages: [...prev.stages, newStage],
          };
        });

        return newStage;
      } catch (err) {
        console.error("Error creating stage:", err);
        throw err;
      }
    },
    [],
  );

  // Save map state (zoom, pan, selections)
  const saveMapState = useCallback(
    async (state: Omit<MapState, "projectId" | "version" | "lastModified">) => {
      try {
        return await put(`/construction-map/${projectId}/state`, state);
      } catch (err) {
        console.error("Error saving map state:", err);
        throw err;
      }
    },
    [projectId],
  );

  // Load map state
  const loadMapState = useCallback(async (): Promise<MapState | null> => {
    try {
      return await get(`/construction-map/${projectId}/state`);
    } catch (err) {
      console.error("Error loading map state:", err);
      return null;
    }
  }, [projectId]);

  return {
    // Data
    data,
    loading,
    error,

    // Actions
    refresh: fetchProject,
    getProgress,
    createTask,
    updateTask,
    updateTaskPosition,
    updateTaskStatus,
    deleteTask,
    createStage,
    saveMapState,
    loadMapState,
  };
}
