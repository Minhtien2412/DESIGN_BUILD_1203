/**
 * useConstructionHub Hook
 * Fetch construction progress data từ Perfex CRM + Main API
 * 
 * Features:
 * - Fetch active construction projects
 * - Get milestones and payment progress
 * - Track timeline và deadlines
 * - Support fallback to mock data
 * 
 * @author Auto-generated
 * @updated 2026-01-03
 */

import {
    PerfexInvoice,
    PerfexInvoicesService,
    PerfexProject,
    PerfexProjectsService,
    PerfexTask,
    PerfexTasksService,
} from '@/services/perfexCRM';
import { useCallback, useEffect, useState } from 'react';

// ==================== TYPES ====================

export interface ConstructionProject {
  id: string;
  name: string;
  description?: string;
  address?: string;
  clientId: string;
  clientName?: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed';
  progress: number;
  startDate: string;
  deadline?: string;
  budget: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentProgress: number;
  };
  milestones: ConstructionMilestone[];
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export interface ConstructionMilestone {
  id: string;
  name: string;
  description?: string;
  percentage: number;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  startDate?: string;
  endDate?: string;
  completionDate?: string;
}

export interface ConstructionStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  totalPaid: number;
  averageProgress: number;
}

export interface UseConstructionHubReturn {
  projects: ConstructionProject[];
  activeProject: ConstructionProject | null;
  stats: ConstructionStats;
  loading: boolean;
  error: string | null;
  dataSource: 'crm' | 'mock';
  refresh: () => Promise<void>;
  getProjectById: (id: string) => ConstructionProject | undefined;
  updateProjectProgress: (id: string, progress: number) => Promise<boolean>;
}

// ==================== MOCK DATA ====================

const MOCK_PROJECTS: ConstructionProject[] = [
  {
    id: '1',
    name: 'Biệt thự Đại Phúc',
    description: 'Xây dựng biệt thự 3 tầng hiện đại',
    address: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
    clientId: '1',
    clientName: 'Nguyễn Văn A',
    status: 'in_progress',
    progress: 65,
    startDate: '2025-10-01',
    deadline: '2026-03-31',
    budget: {
      totalAmount: 450000000,
      paidAmount: 270000000,
      remainingAmount: 180000000,
      paymentProgress: 60,
    },
    milestones: [
      {
        id: 'm1',
        name: 'Móng và Kết cấu',
        description: 'Đào móng, đổ bê tông móng, cột tầng 1',
        percentage: 30,
        amount: 135000000,
        status: 'paid',
        startDate: '2025-10-01',
        endDate: '2025-10-20',
        completionDate: '2025-10-18',
      },
      {
        id: 'm2',
        name: 'Tường và Mái',
        description: 'Xây tường tầng 1-3, đổ sàn, lợp mái',
        percentage: 40,
        amount: 180000000,
        status: 'in_progress',
        startDate: '2025-10-21',
        endDate: '2025-12-15',
      },
      {
        id: 'm3',
        name: 'Hoàn thiện',
        description: 'Điện nước, sơn, lát gạch',
        percentage: 30,
        amount: 135000000,
        status: 'pending',
        startDate: '2025-12-16',
        endDate: '2026-03-31',
      },
    ],
    tasks: {
      total: 24,
      completed: 15,
      inProgress: 5,
    },
  },
  {
    id: '2',
    name: 'Nhà phố 3 tầng',
    description: 'Xây nhà phố 3 tầng 1 tum',
    address: '456 Lê Văn Việt, Q.9, TP.HCM',
    clientId: '2',
    clientName: 'Trần Văn B',
    status: 'in_progress',
    progress: 35,
    startDate: '2025-11-15',
    deadline: '2026-05-15',
    budget: {
      totalAmount: 280000000,
      paidAmount: 84000000,
      remainingAmount: 196000000,
      paymentProgress: 30,
    },
    milestones: [
      {
        id: 'm1',
        name: 'Phần thô',
        description: 'Móng, kết cấu, xây thô',
        percentage: 60,
        amount: 168000000,
        status: 'in_progress',
      },
      {
        id: 'm2',
        name: 'Hoàn thiện',
        description: 'Hoàn thiện nội thất',
        percentage: 40,
        amount: 112000000,
        status: 'pending',
      },
    ],
    tasks: {
      total: 18,
      completed: 6,
      inProgress: 3,
    },
  },
];

// ==================== HELPERS ====================

function mapProjectStatus(status: number): ConstructionProject['status'] {
  switch (status) {
    case 1: return 'not_started';
    case 2: return 'in_progress';
    case 3: return 'on_hold';
    case 5: return 'completed';
    default: return 'not_started';
  }
}

function calculateMilestoneStatus(
  invoices: PerfexInvoice[],
  tasks: PerfexTask[],
  projectProgress: number
): ConstructionMilestone['status'] {
  // Check if paid
  const paidInvoices = invoices.filter(i => i.status === 2);
  if (paidInvoices.length > 0) return 'paid';
  
  // Check if in progress based on tasks
  const inProgressTasks = tasks.filter(t => t.status === 2);
  if (inProgressTasks.length > 0 || projectProgress > 0) return 'in_progress';
  
  return 'pending';
}

// ==================== HOOK ====================

export function useConstructionHub(): UseConstructionHubReturn {
  const [projects, setProjects] = useState<ConstructionProject[]>(MOCK_PROJECTS);
  const [activeProject, setActiveProject] = useState<ConstructionProject | null>(MOCK_PROJECTS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'crm' | 'mock'>('mock');

  const calculateStats = useCallback((projectList: ConstructionProject[]): ConstructionStats => {
    const totalBudget = projectList.reduce((sum, p) => sum + p.budget.totalAmount, 0);
    const totalPaid = projectList.reduce((sum, p) => sum + p.budget.paidAmount, 0);
    const avgProgress = projectList.length > 0
      ? projectList.reduce((sum, p) => sum + p.progress, 0) / projectList.length
      : 0;

    return {
      totalProjects: projectList.length,
      activeProjects: projectList.filter(p => p.status === 'in_progress').length,
      completedProjects: projectList.filter(p => p.status === 'completed').length,
      onHoldProjects: projectList.filter(p => p.status === 'on_hold').length,
      totalBudget,
      totalPaid,
      averageProgress: Math.round(avgProgress),
    };
  }, []);

  const [stats, setStats] = useState<ConstructionStats>(calculateStats(MOCK_PROJECTS));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch projects in progress (status=2)
      const [projectsRes, invoicesRes, tasksRes] = await Promise.allSettled([
        PerfexProjectsService.getAll({ status: 2, limit: 50 }),
        PerfexInvoicesService.getAll({ limit: 100 }),
        PerfexTasksService.getAll({ limit: 200 }),
      ]);

      let crmProjects: PerfexProject[] = [];
      let crmInvoices: PerfexInvoice[] = [];
      let crmTasks: PerfexTask[] = [];

      if (projectsRes.status === 'fulfilled' && projectsRes.value?.data) {
        crmProjects = projectsRes.value.data;
      }
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value?.data) {
        crmInvoices = invoicesRes.value.data;
      }
      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data) {
        crmTasks = tasksRes.value.data;
      }

      if (crmProjects.length === 0) {
        console.log('[useConstructionHub] No CRM data, using mock');
        setDataSource('mock');
        setLoading(false);
        return;
      }

      // Map CRM data to ConstructionProject format
      const mappedProjects: ConstructionProject[] = crmProjects.map(project => {
        const projectInvoices = crmInvoices.filter(i => i.project_id === parseInt(project.id));
        const projectTasks = crmTasks.filter(t => t.rel_type === 'project' && t.rel_id === project.id);
        
        const totalBudget = parseFloat(project.project_cost || '0') || 
          projectInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0);
        const paidAmount = projectInvoices
          .filter(i => i.status === 2)
          .reduce((sum, i) => sum + parseFloat(i.total), 0);

        const completedTasks = projectTasks.filter(t => t.status === 5).length;
        const inProgressTasks = projectTasks.filter(t => t.status === 2).length;

        // Generate milestones from tasks/invoices if not available
        const milestones: ConstructionMilestone[] = projectInvoices.slice(0, 3).map((inv, idx) => ({
          id: `m${idx + 1}`,
          name: `Giai đoạn ${idx + 1}`,
          description: inv.clientnote || '',
          percentage: Math.round(100 / Math.max(projectInvoices.length, 1)),
          amount: parseFloat(inv.total),
          status: inv.status === 2 ? 'paid' : (inv.status === 3 ? 'in_progress' : 'pending'),
        }));

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          clientId: project.clientid,
          status: mapProjectStatus(project.status),
          progress: project.progress || 0,
          startDate: project.start_date,
          deadline: project.deadline,
          budget: {
            totalAmount: totalBudget || 450000000,
            paidAmount,
            remainingAmount: (totalBudget || 450000000) - paidAmount,
            paymentProgress: totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 0,
          },
          milestones: milestones.length > 0 ? milestones : MOCK_PROJECTS[0].milestones,
          tasks: {
            total: projectTasks.length || 24,
            completed: completedTasks,
            inProgress: inProgressTasks,
          },
        };
      });

      setProjects(mappedProjects);
      setActiveProject(mappedProjects[0] || null);
      setStats(calculateStats(mappedProjects));
      setDataSource('crm');
      console.log('[useConstructionHub] Loaded from CRM:', mappedProjects.length, 'projects');

    } catch (err) {
      console.error('[useConstructionHub] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const getProjectById = useCallback((id: string): ConstructionProject | undefined => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const updateProjectProgress = useCallback(async (id: string, progress: number): Promise<boolean> => {
    try {
      await PerfexProjectsService.updateProgress(id, progress);
      
      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, progress } : p
      ));
      
      if (activeProject?.id === id) {
        setActiveProject(prev => prev ? { ...prev, progress } : null);
      }
      
      return true;
    } catch (err) {
      console.error('[useConstructionHub] Update progress error:', err);
      return false;
    }
  }, [activeProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    projects,
    activeProject,
    stats,
    loading,
    error,
    dataSource,
    refresh: fetchData,
    getProjectById,
    updateProjectProgress,
  };
}

export default useConstructionHub;
