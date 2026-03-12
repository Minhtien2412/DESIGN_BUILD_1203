import * as timelineService from '@/services/timeline';
import type {
    AllocateResourceRequest,
    CalculateCriticalPathResponse,
    CreateDependencyRequest,
    CreatePhaseRequest,
    CreateTaskRequest,
    ResourceAllocation,
    TaskDependency,
    TimelineBaseline,
    TimelinePhase,
    TimelineStats,
    TimelineTask,
    UpdatePhaseRequest,
    UpdateTaskRequest,
    ValidateTimelineResponse
} from '@/types/timeline';
import { useCallback, useEffect, useState } from 'react';

// ==================== PHASES ====================

export const usePhases = (projectId: string) => {
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhases = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await timelineService.getPhases(projectId);
      setPhases(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch phases');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const createPhase = useCallback(
    async (data: CreatePhaseRequest) => {
      const newPhase = await timelineService.createPhase(data);
      setPhases((prev) => [...prev, newPhase]);
      return newPhase;
    },
    []
  );

  const updatePhase = useCallback(async (phaseId: string, data: UpdatePhaseRequest) => {
    const updatedPhase = await timelineService.updatePhase(phaseId, data);
    setPhases((prev) => prev.map((p) => (p.id === phaseId ? updatedPhase : p)));
    return updatedPhase;
  }, []);

  const deletePhase = useCallback(async (phaseId: string) => {
    await timelineService.deletePhase(phaseId);
    setPhases((prev) => prev.filter((p) => p.id !== phaseId));
  }, []);

  const reorderPhases = useCallback(async (phaseIds: string[]) => {
    const reordered = await timelineService.reorderPhases(projectId, phaseIds);
    setPhases(reordered);
    return reordered;
  }, [projectId]);

  return {
    phases,
    loading,
    error,
    refetch: fetchPhases,
    createPhase,
    updatePhase,
    deletePhase,
    reorderPhases,
  };
};

export const usePhase = (phaseId: string) => {
  const [phase, setPhase] = useState<TimelinePhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhase = useCallback(async () => {
    if (!phaseId) return;
    try {
      setLoading(true);
      const data = await timelineService.getPhase(phaseId);
      setPhase(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch phase');
    } finally {
      setLoading(false);
    }
  }, [phaseId]);

  useEffect(() => {
    fetchPhase();
  }, [fetchPhase]);

  return { phase, loading, error, refetch: fetchPhase };
};

// ==================== TASKS ====================

export const useTasks = (phaseId?: string, projectId?: string) => {
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await timelineService.getTasks(phaseId, projectId);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [phaseId, projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (data: CreateTaskRequest) => {
    const newTask = await timelineService.createTask(data);
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (taskId: string, data: UpdateTaskRequest) => {
    const updatedTask = await timelineService.updateTask(taskId, data);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    return updatedTask;
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    await timelineService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const updateProgress = useCallback(async (taskId: string, progress: number) => {
    const updatedTask = await timelineService.updateTaskProgress(taskId, progress);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    return updatedTask;
  }, []);

  const moveTask = useCallback(
    async (taskId: string, newPhaseId: string, newStartDate: Date, newEndDate: Date) => {
      const updatedTask = await timelineService.moveTask(
        taskId,
        newPhaseId,
        newStartDate,
        newEndDate
      );
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      return updatedTask;
    },
    []
  );

  const resizeTask = useCallback(
    async (taskId: string, newStartDate?: Date, newEndDate?: Date) => {
      const updatedTask = await timelineService.resizeTask(taskId, newStartDate, newEndDate);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      return updatedTask;
    },
    []
  );

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateProgress,
    moveTask,
    resizeTask,
  };
};

export const useTask = (taskId: string) => {
  const [task, setTask] = useState<TimelineTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const data = await timelineService.getTask(taskId);
      setTask(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return { task, loading, error, refetch: fetchTask };
};

// ==================== DEPENDENCIES ====================

export const useDependencies = (projectId: string) => {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDependencies = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await timelineService.getDependencies(projectId);
      setDependencies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dependencies');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const createDependency = useCallback(async (data: CreateDependencyRequest) => {
    const newDep = await timelineService.createDependency(data);
    setDependencies((prev) => [...prev, newDep]);
    return newDep;
  }, []);

  const deleteDependency = useCallback(async (dependencyId: string) => {
    await timelineService.deleteDependency(dependencyId);
    setDependencies((prev) => prev.filter((d) => d.id !== dependencyId));
  }, []);

  return {
    dependencies,
    loading,
    error,
    refetch: fetchDependencies,
    createDependency,
    deleteDependency,
  };
};

export const useTaskDependencies = (taskId: string) => {
  const [predecessors, setPredecessors] = useState<TaskDependency[]>([]);
  const [successors, setSuccessors] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDependencies = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const data = await timelineService.getTaskDependencies(taskId);
      setPredecessors(data.predecessors);
      setSuccessors(data.successors);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task dependencies');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  return { predecessors, successors, loading, error, refetch: fetchDependencies };
};

// ==================== CRITICAL PATH ====================

export const useCriticalPath = (projectId: string) => {
  const [criticalPath, setCriticalPath] = useState<CalculateCriticalPathResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await timelineService.calculateCriticalPath(projectId);
      setCriticalPath(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate critical path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { criticalPath, loading, error, calculate };
};

// ==================== BASELINES ====================

export const useBaselines = (projectId: string) => {
  const [baselines, setBaselines] = useState<TimelineBaseline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBaselines = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await timelineService.getBaselines(projectId);
      setBaselines(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch baselines');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBaselines();
  }, [fetchBaselines]);

  const createBaseline = useCallback(async (name: string, description?: string) => {
    const newBaseline = await timelineService.createBaseline({
      projectId,
      name,
      description,
    });
    setBaselines((prev) => [...prev, newBaseline]);
    return newBaseline;
  }, [projectId]);

  const deleteBaseline = useCallback(async (baselineId: string) => {
    await timelineService.deleteBaseline(baselineId);
    setBaselines((prev) => prev.filter((b) => b.id !== baselineId));
  }, []);

  return {
    baselines,
    loading,
    error,
    refetch: fetchBaselines,
    createBaseline,
    deleteBaseline,
  };
};

// ==================== RESOURCE ALLOCATION ====================

export const useResourceAllocations = (taskId?: string, userId?: string) => {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await timelineService.getResourceAllocations(taskId, userId);
      setAllocations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch allocations');
    } finally {
      setLoading(false);
    }
  }, [taskId, userId]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const allocateResource = useCallback(async (data: AllocateResourceRequest) => {
    const newAllocation = await timelineService.allocateResource(data);
    setAllocations((prev) => [...prev, newAllocation]);
    return newAllocation;
  }, []);

  const removeAllocation = useCallback(async (allocationId: string) => {
    await timelineService.removeResourceAllocation(allocationId);
    setAllocations((prev) => prev.filter((a) => a.id !== allocationId));
  }, []);

  return {
    allocations,
    loading,
    error,
    refetch: fetchAllocations,
    allocateResource,
    removeAllocation,
  };
};

// ==================== STATS & VALIDATION ====================

export const useTimelineStats = (projectId: string) => {
  const [stats, setStats] = useState<TimelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await timelineService.getTimelineStats(projectId);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useTimelineValidation = (projectId: string) => {
  const [validation, setValidation] = useState<ValidateTimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await timelineService.validateTimeline(projectId);
      setValidation(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate timeline');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { validation, loading, error, validate };
};
