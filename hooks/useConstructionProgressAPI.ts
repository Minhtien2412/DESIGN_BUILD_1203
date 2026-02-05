/**
 * Hook for Construction Progress API integration
 * Kết nối FE với construction-progress.api.ts service
 */

import {
    ConstructionPhase,
    ConstructionTask,
    CreateDailyReportDto,
    CreatePhaseDto,
    CreateReportDto,
    CreateTaskDto,
    DailyReport,
    ProgressReport,
    ProgressStatus,
    ProgressUpdate,
    ProjectProgress,
    TaskPriority,
    addSubTask,
    calculateOverallProgress,
    completeSubTask,
    createDailyReport,
    createPhase,
    createProgressReport,
    createTask,
    getDailyReports,
    getPhaseDetail,
    getPhaseTasks,
    getProgressReports,
    getProjectPhases,
    getProjectProgress,
    getProjectTimeline,
    getTaskDetail,
    getTaskStatistics,
    updatePhase,
    updateTask,
    updateTaskProgress,
} from "@/services/construction-progress.api";
import { useCallback, useEffect, useState } from "react";

interface UseConstructionProgressOptions {
  projectId?: string;
  autoLoad?: boolean;
}

interface UseConstructionProgressResult {
  // Data
  projectProgress: ProjectProgress | null;
  phases: ConstructionPhase[];
  currentPhase: ConstructionPhase | null;
  tasks: ConstructionTask[];
  reports: ProgressReport[];
  dailyReports: DailyReport[];
  statistics: any;
  timeline: any;

  // Loading states
  loading: boolean;
  loadingPhases: boolean;
  loadingTasks: boolean;
  loadingReports: boolean;
  error: string | null;

  // Calculated
  overallProgress: number;
  delayedTasks: ConstructionTask[];
  completedTasks: ConstructionTask[];
  inProgressTasks: ConstructionTask[];

  // Actions - Load
  loadProjectProgress: (projectId: string) => Promise<void>;
  loadPhases: (projectId: string) => Promise<void>;
  loadPhaseDetail: (phaseId: string) => Promise<void>;
  loadPhaseTasks: (phaseId: string) => Promise<void>;
  loadTaskDetail: (taskId: string) => Promise<ConstructionTask | null>;
  loadReports: (params?: { page?: number; limit?: number }) => Promise<void>;
  loadDailyReports: (params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
  }) => Promise<void>;
  loadStatistics: () => Promise<void>;
  loadTimeline: () => Promise<void>;

  // Actions - Create/Update
  addPhase: (data: CreatePhaseDto) => Promise<ConstructionPhase | null>;
  editPhase: (
    phaseId: string,
    data: Partial<CreatePhaseDto>,
  ) => Promise<boolean>;
  addTask: (data: CreateTaskDto) => Promise<ConstructionTask | null>;
  editTask: (
    taskId: string,
    data: Partial<ConstructionTask>,
  ) => Promise<boolean>;
  updateProgress: (taskId: string, data: ProgressUpdate) => Promise<boolean>;
  toggleSubTask: (taskId: string, subTaskId: string) => Promise<boolean>;
  createSubTask: (taskId: string, name: string) => Promise<boolean>;
  submitReport: (data: CreateReportDto) => Promise<boolean>;
  submitDailyReport: (data: CreateDailyReportDto) => Promise<boolean>;

  // Refresh
  refresh: () => Promise<void>;
}

export function useConstructionProgress(
  options: UseConstructionProgressOptions = {},
): UseConstructionProgressResult {
  const { projectId, autoLoad = true } = options;

  // State
  const [projectProgress, setProjectProgress] =
    useState<ProjectProgress | null>(null);
  const [phases, setPhases] = useState<ConstructionPhase[]>([]);
  const [currentPhase, setCurrentPhase] = useState<ConstructionPhase | null>(
    null,
  );
  const [tasks, setTasks] = useState<ConstructionTask[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculated values
  const overallProgress = calculateOverallProgress(phases);
  const delayedTasks = tasks.filter((t) => t.status === ProgressStatus.DELAYED);
  const completedTasks = tasks.filter(
    (t) => t.status === ProgressStatus.COMPLETED,
  );
  const inProgressTasks = tasks.filter(
    (t) => t.status === ProgressStatus.IN_PROGRESS,
  );

  // Load project progress
  const loadProjectProgress = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectProgress(id);
      setProjectProgress(data);
      if (data.phases) {
        setPhases(data.phases);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load progress");
      console.error("Error loading project progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load phases
  const loadPhases = useCallback(async (id: string) => {
    try {
      setLoadingPhases(true);
      const data = await getProjectPhases(id);
      setPhases(data);
    } catch (err) {
      console.error("Error loading phases:", err);
    } finally {
      setLoadingPhases(false);
    }
  }, []);

  // Load phase detail
  const loadPhaseDetail = useCallback(async (phaseId: string) => {
    try {
      const data = await getPhaseDetail(phaseId);
      setCurrentPhase(data);
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Error loading phase detail:", err);
    }
  }, []);

  // Load phase tasks
  const loadPhaseTasks = useCallback(async (phaseId: string) => {
    try {
      setLoadingTasks(true);
      const data = await getPhaseTasks(phaseId);
      setTasks(data);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Load task detail
  const loadTaskDetail = useCallback(
    async (taskId: string): Promise<ConstructionTask | null> => {
      try {
        return await getTaskDetail(taskId);
      } catch (err) {
        console.error("Error loading task detail:", err);
        return null;
      }
    },
    [],
  );

  // Load reports
  const loadReports = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      if (!projectId) return;
      try {
        setLoadingReports(true);
        const data = await getProgressReports(projectId, params);
        setReports(data.data);
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoadingReports(false);
      }
    },
    [projectId],
  );

  // Load daily reports
  const loadDailyReports = useCallback(
    async (params?: {
      startDate?: string;
      endDate?: string;
      page?: number;
    }) => {
      if (!projectId) return;
      try {
        const data = await getDailyReports(projectId, params);
        setDailyReports(data.data);
      } catch (err) {
        console.error("Error loading daily reports:", err);
      }
    },
    [projectId],
  );

  // Load statistics
  const loadStatistics = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await getTaskStatistics(projectId);
      setStatistics(data);
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  }, [projectId]);

  // Load timeline
  const loadTimeline = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await getProjectTimeline(projectId);
      setTimeline(data);
    } catch (err) {
      console.error("Error loading timeline:", err);
    }
  }, [projectId]);

  // Add phase
  const addPhase = useCallback(
    async (data: CreatePhaseDto): Promise<ConstructionPhase | null> => {
      try {
        const newPhase = await createPhase(data);
        setPhases((prev) => [...prev, newPhase]);
        return newPhase;
      } catch (err) {
        console.error("Error creating phase:", err);
        return null;
      }
    },
    [],
  );

  // Edit phase
  const editPhase = useCallback(
    async (
      phaseId: string,
      data: Partial<CreatePhaseDto>,
    ): Promise<boolean> => {
      try {
        const updated = await updatePhase(phaseId, data);
        setPhases((prev) => prev.map((p) => (p.id === phaseId ? updated : p)));
        return true;
      } catch (err) {
        console.error("Error updating phase:", err);
        return false;
      }
    },
    [],
  );

  // Add task
  const addTask = useCallback(
    async (data: CreateTaskDto): Promise<ConstructionTask | null> => {
      try {
        const newTask = await createTask(data);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } catch (err) {
        console.error("Error creating task:", err);
        return null;
      }
    },
    [],
  );

  // Edit task
  const editTask = useCallback(
    async (
      taskId: string,
      data: Partial<ConstructionTask>,
    ): Promise<boolean> => {
      try {
        const updated = await updateTask(taskId, data);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        return true;
      } catch (err) {
        console.error("Error updating task:", err);
        return false;
      }
    },
    [],
  );

  // Update progress
  const updateProgress = useCallback(
    async (taskId: string, data: ProgressUpdate): Promise<boolean> => {
      try {
        const updated = await updateTaskProgress(taskId, data);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        return true;
      } catch (err) {
        console.error("Error updating progress:", err);
        return false;
      }
    },
    [],
  );

  // Toggle sub-task
  const toggleSubTask = useCallback(
    async (taskId: string, subTaskId: string): Promise<boolean> => {
      try {
        await completeSubTask(taskId, subTaskId);
        // Reload task to get updated subtasks
        const updated = await getTaskDetail(taskId);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        return true;
      } catch (err) {
        console.error("Error toggling subtask:", err);
        return false;
      }
    },
    [],
  );

  // Create sub-task
  const createSubTask = useCallback(
    async (taskId: string, name: string): Promise<boolean> => {
      try {
        await addSubTask(taskId, name);
        const updated = await getTaskDetail(taskId);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        return true;
      } catch (err) {
        console.error("Error creating subtask:", err);
        return false;
      }
    },
    [],
  );

  // Submit report
  const submitReport = useCallback(
    async (data: CreateReportDto): Promise<boolean> => {
      try {
        const newReport = await createProgressReport(data);
        setReports((prev) => [newReport, ...prev]);
        return true;
      } catch (err) {
        console.error("Error submitting report:", err);
        return false;
      }
    },
    [],
  );

  // Submit daily report
  const submitDailyReport = useCallback(
    async (data: CreateDailyReportDto): Promise<boolean> => {
      try {
        const newReport = await createDailyReport(data);
        setDailyReports((prev) => [newReport, ...prev]);
        return true;
      } catch (err) {
        console.error("Error submitting daily report:", err);
        return false;
      }
    },
    [],
  );

  // Refresh
  const refresh = useCallback(async () => {
    if (projectId) {
      await loadProjectProgress(projectId);
    }
  }, [projectId, loadProjectProgress]);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad && projectId) {
      loadProjectProgress(projectId);
    }
  }, [autoLoad, projectId, loadProjectProgress]);

  return {
    // Data
    projectProgress,
    phases,
    currentPhase,
    tasks,
    reports,
    dailyReports,
    statistics,
    timeline,

    // Loading
    loading,
    loadingPhases,
    loadingTasks,
    loadingReports,
    error,

    // Calculated
    overallProgress,
    delayedTasks,
    completedTasks,
    inProgressTasks,

    // Actions - Load
    loadProjectProgress,
    loadPhases,
    loadPhaseDetail,
    loadPhaseTasks,
    loadTaskDetail,
    loadReports,
    loadDailyReports,
    loadStatistics,
    loadTimeline,

    // Actions - Create/Update
    addPhase,
    editPhase,
    addTask,
    editTask,
    updateProgress,
    toggleSubTask,
    createSubTask,
    submitReport,
    submitDailyReport,

    // Refresh
    refresh,
  };
}

// Export types
export { ProgressStatus, TaskPriority };
export type {
    ConstructionPhase,
    ConstructionTask, CreateDailyReportDto, CreatePhaseDto, CreateReportDto, CreateTaskDto, DailyReport, ProgressReport, ProgressUpdate, ProjectProgress
};

