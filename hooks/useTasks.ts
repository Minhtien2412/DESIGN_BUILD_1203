import { useCallback, useEffect, useState } from 'react';
import tasksApi, { Task } from '../services/api/tasksApi';

/**
 * Hook to fetch and manage tasks from backend API
 * Uses real API endpoints: GET /tasks (protected)
 * 
 * Features:
 * - Fetch all tasks or filter by project
 * - Create, update, delete tasks
 * - Get my assigned tasks
 * - Real-time task status updates
 */
export function useTasks(projectId?: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchTasks = useCallback(async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await tasksApi.getTasks(projectId);
      // Backend returns { value: Task[], Count: number }
      setTasks(response.value || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load tasks');
      setError(error);
      console.error('[useTasks] Error:', err);
      setTasks([]);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [projectId]);

  const createTask = useCallback(async (data: {
    title: string;
    description?: string;
    projectId: number;
    assignedToId?: number;
    priority?: Task['priority'];
    dueDate?: string;
  }) => {
    try {
      const newTask = await tasksApi.createTask(data);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('[useTasks] Create task error:', err);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (taskId: number, data: {
    title?: string;
    description?: string;
    status?: Task['status'];
    priority?: Task['priority'];
    assignedToId?: number;
    dueDate?: string;
  }) => {
    try {
      const updatedTask = await tasksApi.updateTask(taskId, data);
      setTasks(prev => 
        prev.map(t => t.id === taskId ? updatedTask : t)
      );
      return updatedTask;
    } catch (err) {
      console.error('[useTasks] Update task error:', err);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await tasksApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('[useTasks] Delete task error:', err);
      throw err;
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: number, status: Task['status']) => {
    return updateTask(taskId, { status });
  }, [updateTask]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRetry = useCallback(async () => {
    await fetchTasks(true);
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    retrying,
    refresh: handleRetry,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  };
}

/**
 * Hook to fetch tasks assigned to current user
 */
export function useMyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchMyTasks = useCallback(async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await tasksApi.getMyTasks();
      setTasks(response.value || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load my tasks');
      setError(error);
      console.error('[useMyTasks] Error:', err);
      setTasks([]);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const handleRetry = useCallback(async () => {
    await fetchMyTasks(true);
  }, [fetchMyTasks]);

  return {
    tasks,
    loading,
    error,
    retrying,
    refresh: handleRetry,
  };
}
