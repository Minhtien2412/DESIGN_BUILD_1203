/**
 * useConstructionTasks Hook
 * Simplified hook for task management without canvas
 */

import { useState, useCallback, useEffect } from 'react';
import { constructionMapApi, Task, groupTasksByStage, calculateStageProgress } from '../services/api/constructionMapApi';

export interface UseConstructionTasksProps {
  projectId: string;
  stageId?: string; // Optional: filter by stage
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseConstructionTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
  
  // Computed
  tasksByStage: Record<string, Task[]>;
  stageProgress: Record<string, number>;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

export function useConstructionTasks({
  projectId,
  stageId,
  autoRefresh = false,
  refreshInterval = 30000,
}: UseConstructionTasksProps): UseConstructionTasksReturn {
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await constructionMapApi.getTasks(projectId);
      let loadedTasks = res.data;
      
      // Filter by stage if specified
      if (stageId) {
        loadedTasks = loadedTasks.filter(t => t.stageId === stageId);
      }
      
      setTasks(loadedTasks);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      setLoading(false);
    }
  }, [projectId, stageId]);
  
  // Create task
  const createTask = useCallback(async (data: Partial<Task>): Promise<Task | null> => {
    try {
      const res = await constructionMapApi.createTask({ ...data, projectId });
      const newTask = res.data;
      
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [projectId]);
  
  // Update task
  const updateTask = useCallback(async (id: string, data: Partial<Task>): Promise<Task | null> => {
    try {
      const res = await constructionMapApi.updateTask(id, data);
      const updatedTask = res.data;
      
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      return updatedTask;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);
  
  // Delete task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      await constructionMapApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);
  
  // Refresh
  const refreshTasks = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);
  
  // Computed values
  const tasksByStage = groupTasksByStage(tasks);
  
  const stageProgress: Record<string, number> = {};
  Object.entries(tasksByStage).forEach(([sId, stageTasks]) => {
    stageProgress[sId] = calculateStageProgress(stageTasks);
  });
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  // Effects
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  
  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(refreshTasks, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, refreshInterval, refreshTasks]);
  
  return {
    tasks,
    loading,
    error,
    
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
    
    tasksByStage,
    stageProgress,
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
  };
}
