/**
 * useCRMTasks Hook
 * Fetch tasks từ Perfex CRM
 * 
 * Features:
 * - Fetch all tasks or by project
 * - Filter by status, priority
 * - Create, update, complete tasks
 * - Support fallback to mock data
 * 
 * @author Auto-generated
 * @updated 2026-01-03
 */

import {
    PerfexTask,
    PerfexTasksService,
} from '@/services/perfexCRM';
import { useCallback, useEffect, useState } from 'react';

// ==================== TYPES ====================

export interface CRMTask {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'testing' | 'awaiting_feedback' | 'complete';
  startDate: string;
  dueDate?: string;
  completedDate?: string;
  projectId?: string;
  assignee?: string;
  isOverdue: boolean;
}

export interface TasksStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface UseCRMTasksReturn {
  tasks: CRMTask[];
  stats: TasksStats;
  loading: boolean;
  error: string | null;
  dataSource: 'crm' | 'mock';
  refresh: () => Promise<void>;
  createTask: (data: Partial<CRMTask>) => Promise<CRMTask | null>;
  updateTask: (id: string, data: Partial<CRMTask>) => Promise<boolean>;
  completeTask: (id: string) => Promise<boolean>;
}

// ==================== MOCK DATA (Real structure from Perfex CRM) ====================

/**
 * Tasks mẫu theo cấu trúc thực tế Perfex CRM
 * Projects: 
 * - ID 1: Nhà Anh Khương Q9 (15 tỷ) - status: 1 (Chưa bắt đầu)
 * - ID 2: Biệt Thự 3 Tầng Anh Tiến Q7 (10 tỷ) - status: 2 (Đang tiến hành)
 */

const MOCK_TASKS: CRMTask[] = [
  {
    id: '1',
    name: 'Khảo sát mặt bằng - Nhà Anh Khương Q9',
    description: 'Khảo sát địa hình, đo đạc chi tiết khu đất Quận 9',
    priority: 'high',
    status: 'not_started',
    startDate: '2024-12-30',
    dueDate: '2025-01-05',
    projectId: '1',
    isOverdue: false,
  },
  {
    id: '2',
    name: 'Hoàn thiện bản vẽ kiến trúc - Biệt thự Anh Tiến',
    description: 'Hoàn thành bản vẽ 3D và bản vẽ kỹ thuật chi tiết',
    priority: 'urgent',
    status: 'in_progress',
    startDate: '2024-12-28',
    dueDate: '2025-01-03',
    projectId: '2',
    isOverdue: false,
  },
  {
    id: '3',
    name: 'Xin phép xây dựng - Nhà Anh Khương',
    description: 'Nộp hồ sơ xin cấp phép xây dựng tại Quận 9',
    priority: 'medium',
    status: 'not_started',
    startDate: '2025-01-06',
    dueDate: '2025-01-20',
    projectId: '1',
    isOverdue: false,
  },
  {
    id: '4',
    name: 'Đổ móng công trình - Biệt thự Q7',
    description: 'Thi công phần móng biệt thự 3 tầng',
    priority: 'high',
    status: 'not_started',
    startDate: '2025-01-10',
    dueDate: '2025-01-25',
    projectId: '2',
    isOverdue: false,
  },
  {
    id: '5',
    name: 'Lập dự toán chi tiết - Nhà Anh Khương',
    description: 'Dự toán vật liệu và nhân công cho dự án 15 tỷ',
    priority: 'high',
    status: 'complete',
    startDate: '2024-12-25',
    dueDate: '2024-12-30',
    completedDate: '2024-12-29',
    projectId: '1',
    isOverdue: false,
  },
];

// ==================== HELPERS ====================

function mapPerfexPriority(priority: number): CRMTask['priority'] {
  switch (priority) {
    case 1: return 'low';
    case 2: return 'medium';
    case 3: return 'high';
    case 4: return 'urgent';
    default: return 'medium';
  }
}

function mapPerfexStatus(status: number): CRMTask['status'] {
  switch (status) {
    case 1: return 'not_started';
    case 2: return 'in_progress';
    case 3: return 'testing';
    case 4: return 'awaiting_feedback';
    case 5: return 'complete';
    default: return 'not_started';
  }
}

function isTaskOverdue(task: PerfexTask): boolean {
  if (!task.duedate || task.status === 5) return false;
  return new Date(task.duedate) < new Date();
}

function mapPerfexTask(task: PerfexTask): CRMTask {
  return {
    id: task.id,
    name: task.name,
    description: task.description || '',
    priority: mapPerfexPriority(task.priority),
    status: mapPerfexStatus(task.status),
    startDate: task.startdate,
    dueDate: task.duedate,
    completedDate: task.datefinished,
    projectId: task.rel_type === 'project' ? task.rel_id : undefined,
    isOverdue: isTaskOverdue(task),
  };
}

// ==================== HOOK ====================

export function useCRMTasks(projectId?: string): UseCRMTasksReturn {
  const [tasks, setTasks] = useState<CRMTask[]>(MOCK_TASKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'crm' | 'mock'>('mock');

  const calculateStats = useCallback((taskList: CRMTask[]): TasksStats => {
    return {
      total: taskList.length,
      pending: taskList.filter(t => t.status === 'not_started').length,
      inProgress: taskList.filter(t => t.status === 'in_progress' || t.status === 'testing').length,
      completed: taskList.filter(t => t.status === 'complete').length,
      overdue: taskList.filter(t => t.isOverdue).length,
    };
  }, []);

  const [stats, setStats] = useState<TasksStats>(calculateStats(MOCK_TASKS));

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { limit: 100 };
      if (projectId) {
        params.rel_type = 'project';
        params.rel_id = projectId;
      }

      const response = await PerfexTasksService.getAll(params);
      
      if (response?.data && response.data.length > 0) {
        const mappedTasks = response.data.map(mapPerfexTask);
        setTasks(mappedTasks);
        setStats(calculateStats(mappedTasks));
        setDataSource('crm');
        console.log('[useCRMTasks] Loaded from CRM:', mappedTasks.length);
      } else {
        // Use mock data if no CRM data
        setTasks(MOCK_TASKS);
        setStats(calculateStats(MOCK_TASKS));
        setDataSource('mock');
      }
    } catch (err) {
      console.error('[useCRMTasks] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  }, [projectId, calculateStats]);

  const createTask = useCallback(async (data: Partial<CRMTask>): Promise<CRMTask | null> => {
    try {
      const priorityMap = { low: 1, medium: 2, high: 3, urgent: 4 };
      const statusMap = { not_started: 1, in_progress: 2, testing: 3, awaiting_feedback: 4, complete: 5 };

      const perfexData: Partial<PerfexTask> = {
        name: data.name || '',
        description: data.description,
        priority: priorityMap[data.priority || 'medium'],
        status: statusMap[data.status || 'not_started'],
        startdate: data.startDate || new Date().toISOString().split('T')[0],
        duedate: data.dueDate,
        is_public: 0,
        billable: 0,
        visible_to_client: 1,
      };

      if (data.projectId) {
        perfexData.rel_type = 'project';
        perfexData.rel_id = data.projectId;
      }

      const result = await PerfexTasksService.create(perfexData);
      const newTask = mapPerfexTask(result);
      
      setTasks(prev => [newTask, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + (newTask.status === 'not_started' ? 1 : 0),
      }));
      
      return newTask;
    } catch (err) {
      console.error('[useCRMTasks] Create error:', err);
      return null;
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<CRMTask>): Promise<boolean> => {
    try {
      const priorityMap = { low: 1, medium: 2, high: 3, urgent: 4 };
      const statusMap = { not_started: 1, in_progress: 2, testing: 3, awaiting_feedback: 4, complete: 5 };

      const perfexData: Partial<PerfexTask> = {};
      if (data.name) perfexData.name = data.name;
      if (data.description) perfexData.description = data.description;
      if (data.priority) perfexData.priority = priorityMap[data.priority];
      if (data.status) perfexData.status = statusMap[data.status];
      if (data.dueDate) perfexData.duedate = data.dueDate;

      await PerfexTasksService.update(id, perfexData);
      
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
      return true;
    } catch (err) {
      console.error('[useCRMTasks] Update error:', err);
      return false;
    }
  }, []);

  const completeTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      await PerfexTasksService.markComplete(id);
      
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, status: 'complete' as const, completedDate: new Date().toISOString() } : t
      ));
      
      setStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        pending: Math.max(0, prev.pending - 1),
      }));
      
      return true;
    } catch (err) {
      console.error('[useCRMTasks] Complete error:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    stats,
    loading,
    error,
    dataSource,
    refresh: fetchTasks,
    createTask,
    updateTask,
    completeTask,
  };
}

export default useCRMTasks;
