/**
 * useProjectsHub Hook
 * Fetch data từ Perfex CRM cho Projects Hub Screen
 * 
 * Features:
 * - Fetch projects, customers, tasks từ CRM
 * - Calculate stats (total, active, completed, todos)
 * - Support fallback to mock data
 * - Loading & error states
 * 
 * @author Auto-generated
 * @updated 2026-01-03
 */

import {
    PerfexCustomer,
    PerfexCustomersService,
    PerfexProject,
    PerfexProjectsService,
    PerfexTask,
    PerfexTasksService,
} from '@/services/perfexCRM';
import { useCallback, useEffect, useState } from 'react';

// ==================== TYPES ====================

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
  pendingTodos: number;
  overdueTodos: number;
  totalCustomers: number;
}

export interface RecentProject {
  id: string;
  name: string;
  customerName: string;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'CANCELLED' | 'COMPLETED';
  image: string | null;
  startDate?: string;
  deadline?: string;
}

export interface UseProjectsHubReturn {
  stats: ProjectStats;
  recentProjects: RecentProject[];
  loading: boolean;
  error: string | null;
  dataSource: 'crm' | 'mock' | 'cache';
  refresh: () => Promise<void>;
}

// ==================== MOCK DATA (Fallback) ====================

const MOCK_STATS: ProjectStats = {
  totalProjects: 12,
  activeProjects: 5,
  completedProjects: 6,
  pendingProjects: 1,
  pendingTodos: 15,
  overdueTodos: 3,
  totalCustomers: 8,
};

const MOCK_RECENT_PROJECTS: RecentProject[] = [
  {
    id: '1',
    name: 'Biệt thự Đại Phúc',
    customerName: 'Nguyễn Văn A',
    progress: 75,
    status: 'IN_PROGRESS',
    image: null,
  },
  {
    id: '2',
    name: 'Nhà phố 3 tầng',
    customerName: 'Trần Văn B',
    progress: 45,
    status: 'IN_PROGRESS',
    image: null,
  },
  {
    id: '3',
    name: 'Văn phòng XYZ',
    customerName: 'Công ty ABC',
    progress: 100,
    status: 'COMPLETED',
    image: null,
  },
];

// ==================== HELPERS ====================

/**
 * Map Perfex status (1-5) to UI status string
 */
function mapProjectStatus(status: number): RecentProject['status'] {
  switch (status) {
    case 1: return 'NOT_STARTED';
    case 2: return 'IN_PROGRESS';
    case 3: return 'ON_HOLD';
    case 4: return 'CANCELLED';
    case 5: return 'COMPLETED';
    default: return 'NOT_STARTED';
  }
}

/**
 * Check if task is overdue
 */
function isTaskOverdue(task: PerfexTask): boolean {
  if (!task.duedate || task.status === 5) return false;
  const dueDate = new Date(task.duedate);
  return dueDate < new Date();
}

/**
 * Check if task is pending (not completed)
 */
function isTaskPending(task: PerfexTask): boolean {
  return task.status !== 5; // 5 = Complete
}

// ==================== HOOK ====================

export function useProjectsHub(): UseProjectsHubReturn {
  const [stats, setStats] = useState<ProjectStats>(MOCK_STATS);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>(MOCK_RECENT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'crm' | 'mock' | 'cache'>('mock');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch in parallel
      const [projectsRes, customersRes, tasksRes] = await Promise.allSettled([
        PerfexProjectsService.getAll({ limit: 100 }),
        PerfexCustomersService.getAll({ limit: 100 }),
        PerfexTasksService.getAll({ limit: 200 }),
      ]);

      // Process projects
      let projects: PerfexProject[] = [];
      if (projectsRes.status === 'fulfilled' && projectsRes.value?.data) {
        projects = projectsRes.value.data;
      }

      // Process customers
      let customers: PerfexCustomer[] = [];
      if (customersRes.status === 'fulfilled' && customersRes.value?.data) {
        customers = customersRes.value.data;
      }

      // Process tasks
      let tasks: PerfexTask[] = [];
      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data) {
        tasks = tasksRes.value.data;
      }

      // Check if we got any real data
      if (projects.length === 0 && customers.length === 0) {
        console.log('[useProjectsHub] No CRM data, using mock');
        setDataSource('mock');
        setStats(MOCK_STATS);
        setRecentProjects(MOCK_RECENT_PROJECTS);
        setLoading(false);
        return;
      }

      // Calculate stats from real data
      const calculatedStats: ProjectStats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 2).length, // 2 = In Progress
        completedProjects: projects.filter(p => p.status === 5).length, // 5 = Finished
        pendingProjects: projects.filter(p => p.status === 1).length, // 1 = Not Started
        pendingTodos: tasks.filter(isTaskPending).length,
        overdueTodos: tasks.filter(isTaskOverdue).length,
        totalCustomers: customers.length,
      };

      // Create customer lookup map
      const customerMap = new Map<string, PerfexCustomer>();
      customers.forEach(c => customerMap.set(c.userid, c));

      // Map recent projects (sort by date, take latest 5)
      const mappedProjects: RecentProject[] = projects
        .sort((a, b) => new Date(b.project_created).getTime() - new Date(a.project_created).getTime())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          customerName: customerMap.get(p.clientid)?.company || 'Khách hàng',
          progress: p.progress || 0,
          status: mapProjectStatus(p.status),
          image: null,
          startDate: p.start_date,
          deadline: p.deadline,
        }));

      setStats(calculatedStats);
      setRecentProjects(mappedProjects.length > 0 ? mappedProjects : MOCK_RECENT_PROJECTS);
      setDataSource('crm');
      console.log('[useProjectsHub] Loaded from CRM:', {
        projects: projects.length,
        customers: customers.length,
        tasks: tasks.length,
      });

    } catch (err) {
      console.error('[useProjectsHub] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setDataSource('mock');
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    recentProjects,
    loading,
    error,
    dataSource,
    refresh: fetchData,
  };
}

export default useProjectsHub;
