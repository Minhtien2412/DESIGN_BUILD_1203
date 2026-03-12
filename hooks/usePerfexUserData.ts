/**
 * Perfex CRM User Data Hooks
 * Hooks chuyên biệt để lấy data theo user đã đăng nhập
 * Tự động filter theo customerId/contactId/staffId
 * 
 * @author ThietKeResort Team
 * @created 2025-12-30
 */

import { usePerfexAuth } from '@/context/PerfexAuthContext';
import PerfexCRM, {
    PerfexEstimate,
    PerfexInvoice,
    PerfexProject,
    PerfexTask,
} from '@/services/perfexCRM';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ==================== TYPES ====================

interface DataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  total: number;
  lastFetched: Date | null;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  totalInvoices: number;
  unpaidInvoices: number;
  paidInvoices: number;
  totalEstimates: number;
  pendingEstimates: number;
  acceptedEstimates: number;
  totalRevenue: number;
  pendingPayments: number;
}

// ==================== MY PROJECTS HOOK ====================

/**
 * Hook lấy danh sách dự án của user đang login
 * - Customer: lấy projects theo clientid
 * - Staff: lấy projects được assign hoặc tạo bởi staff
 */
export function useMyProjects(params?: { status?: number; limit?: number }) {
  const { user, isAuthenticated, isStaff, getCustomerId } = usePerfexAuth();
  const [state, setState] = useState<DataState<PerfexProject>>({
    data: [],
    loading: true,
    error: null,
    total: 0,
    lastFetched: null,
  });

  const customerId = useMemo(() => getCustomerId(), [user]);

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, loading: false, data: [], total: 0 }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let result;

      if (isStaff()) {
        // Staff: lấy tất cả projects (có thể filter thêm theo assigned)
        result = await PerfexCRM.Projects.getAll({
          limit: params?.limit || 50,
          status: params?.status,
        });
      } else if (customerId) {
        // Customer: lấy projects theo clientid
        result = await PerfexCRM.Projects.getAll({
          clientid: customerId,
          limit: params?.limit || 50,
          status: params?.status,
        });
      } else {
        setState(prev => ({ ...prev, loading: false, data: [], total: 0 }));
        return;
      }

      setState({
        data: result.data,
        loading: false,
        error: null,
        total: result.total,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      console.error('[useMyProjects] Error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Không thể tải danh sách dự án',
      }));
    }
  }, [isAuthenticated, user, customerId, isStaff, params?.status, params?.limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects: state.data,
    loading: state.loading,
    error: state.error,
    total: state.total,
    lastFetched: state.lastFetched,
    refresh: fetchProjects,
  };
}

// ==================== MY TASKS HOOK ====================

/**
 * Hook lấy danh sách tasks của user đang login
 * - Customer: lấy tasks của projects mà customer sở hữu
 * - Staff: lấy tasks được assign cho staff
 */
export function useMyTasks(params?: { status?: number; limit?: number; projectId?: string }) {
  const { user, isAuthenticated, isStaff, getCustomerId } = usePerfexAuth();
  const [state, setState] = useState<DataState<PerfexTask>>({
    data: [],
    loading: true,
    error: null,
    total: 0,
    lastFetched: null,
  });

  const customerId = useMemo(() => getCustomerId(), [user]);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, loading: false, data: [], total: 0 }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let result;
      const baseParams: any = {
        limit: params?.limit || 100,
        status: params?.status,
      };

      if (params?.projectId) {
        // Lọc theo project cụ thể
        baseParams.rel_type = 'project';
        baseParams.rel_id = params.projectId;
      }

      if (isStaff() && user.staffId) {
        // Staff: lấy tasks được assign
        // Perfex API: assigned staff là trong task assignees
        result = await PerfexCRM.Tasks.getAll(baseParams);
        
        // Filter local theo staff assigned
        if (result.data && user.staffId) {
          result.data = result.data.filter((task: PerfexTask) => {
            const assignees = (task as any).assignees || [];
            return assignees.includes(user.staffId) || 
                   (task as any).addedfrom === user.staffId;
          });
          result.total = result.data.length;
        }
      } else if (customerId) {
        // Customer: lấy tasks liên quan đến projects của customer
        // Trước tiên lấy projects của customer
        const projectsResult = await PerfexCRM.Projects.getAll({ clientid: customerId, limit: 100 });
        const projectIds = projectsResult.data.map(p => p.id);

        if (projectIds.length > 0) {
          // Lấy tất cả tasks và filter theo projects
          result = await PerfexCRM.Tasks.getAll({
            ...baseParams,
            rel_type: 'project',
          });
          
          // Filter theo project IDs của customer
          if (result.data) {
            result.data = result.data.filter((task: PerfexTask) => 
              projectIds.includes((task as any).rel_id || '')
            );
            result.total = result.data.length;
          }
        } else {
          result = { data: [], total: 0 };
        }
      } else {
        result = { data: [], total: 0 };
      }

      setState({
        data: result.data || [],
        loading: false,
        error: null,
        total: result.total || 0,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      console.error('[useMyTasks] Error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Không thể tải danh sách công việc',
      }));
    }
  }, [isAuthenticated, user, customerId, isStaff, params?.status, params?.limit, params?.projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks: state.data,
    loading: state.loading,
    error: state.error,
    total: state.total,
    lastFetched: state.lastFetched,
    refresh: fetchTasks,
  };
}

// ==================== MY INVOICES HOOK ====================

/**
 * Hook lấy danh sách hóa đơn của customer đang login
 */
export function useMyInvoices(params?: { status?: number; limit?: number }) {
  const { user, isAuthenticated, isStaff, getCustomerId } = usePerfexAuth();
  const [state, setState] = useState<DataState<PerfexInvoice>>({
    data: [],
    loading: true,
    error: null,
    total: 0,
    lastFetched: null,
  });

  const customerId = useMemo(() => getCustomerId(), [user]);

  const fetchInvoices = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, loading: false, data: [], total: 0 }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let result;
      const baseParams: any = {
        limit: params?.limit || 50,
        status: params?.status,
      };

      if (isStaff()) {
        // Staff: lấy tất cả invoices
        result = await PerfexCRM.Invoices.getAll(baseParams);
      } else if (customerId) {
        // Customer: lấy invoices theo clientid
        result = await PerfexCRM.Invoices.getAll({
          ...baseParams,
          clientid: customerId,
        });
      } else {
        result = { data: [], total: 0 };
      }

      setState({
        data: result.data || [],
        loading: false,
        error: null,
        total: result.total || 0,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      console.error('[useMyInvoices] Error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Không thể tải danh sách hóa đơn',
      }));
    }
  }, [isAuthenticated, user, customerId, isStaff, params?.status, params?.limit]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Computed values
  const totalAmount = useMemo(() => 
    state.data.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0), 
    [state.data]
  );

  const unpaidAmount = useMemo(() =>
    state.data
      .filter(inv => inv.status !== 2) // 2 = Paid
      .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0),
    [state.data]
  );

  return {
    invoices: state.data,
    loading: state.loading,
    error: state.error,
    total: state.total,
    totalAmount,
    unpaidAmount,
    lastFetched: state.lastFetched,
    refresh: fetchInvoices,
  };
}

// ==================== MY ESTIMATES HOOK ====================

/**
 * Hook lấy danh sách báo giá của customer đang login
 */
export function useMyEstimates(params?: { status?: number; limit?: number }) {
  const { user, isAuthenticated, isStaff, getCustomerId } = usePerfexAuth();
  const [state, setState] = useState<DataState<PerfexEstimate>>({
    data: [],
    loading: true,
    error: null,
    total: 0,
    lastFetched: null,
  });

  const customerId = useMemo(() => getCustomerId(), [user]);

  const fetchEstimates = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, loading: false, data: [], total: 0 }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let result;
      const baseParams: any = {
        limit: params?.limit || 50,
        status: params?.status,
      };

      if (isStaff()) {
        // Staff: lấy tất cả estimates
        result = await PerfexCRM.Estimates.getAll(baseParams);
      } else if (customerId) {
        // Customer: lấy estimates theo clientid
        result = await PerfexCRM.Estimates.getAll({
          ...baseParams,
          clientid: customerId,
        });
      } else {
        result = { data: [], total: 0 };
      }

      setState({
        data: result.data || [],
        loading: false,
        error: null,
        total: result.total || 0,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      console.error('[useMyEstimates] Error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Không thể tải danh sách báo giá',
      }));
    }
  }, [isAuthenticated, user, customerId, isStaff, params?.status, params?.limit]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  // Computed values
  const totalAmount = useMemo(() =>
    state.data.reduce((sum, est) => sum + parseFloat(est.total || '0'), 0),
    [state.data]
  );

  const pendingCount = useMemo(() =>
    state.data.filter(est => est.status === 1).length, // 1 = Draft/Pending
    [state.data]
  );

  const acceptedCount = useMemo(() =>
    state.data.filter(est => est.status === 4).length, // 4 = Accepted
    [state.data]
  );

  return {
    estimates: state.data,
    loading: state.loading,
    error: state.error,
    total: state.total,
    totalAmount,
    pendingCount,
    acceptedCount,
    lastFetched: state.lastFetched,
    refresh: fetchEstimates,
  };
}

// ==================== DASHBOARD STATS HOOK ====================

/**
 * Hook lấy thống kê tổng hợp cho dashboard
 * Tự động aggregate data từ projects, tasks, invoices, estimates
 */
export function useMyDashboardStats() {
  const { user, isAuthenticated, isStaff, getCustomerId } = usePerfexAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = useMemo(() => getCustomerId(), [user]);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = isStaff() ? {} : { clientid: customerId || undefined };

      // Fetch all data in parallel
      const [projectsRes, tasksRes, invoicesRes, estimatesRes] = await Promise.all([
        PerfexCRM.Projects.getAll({ ...params, limit: 500 }),
        PerfexCRM.Tasks.getAll({ limit: 500 }),
        PerfexCRM.Invoices.getAll({ ...params, limit: 500 }),
        PerfexCRM.Estimates.getAll({ ...params, limit: 500 }),
      ]);

      // Filter tasks for customer if needed
      let tasks = tasksRes.data;
      if (!isStaff() && customerId) {
        const projectIds = projectsRes.data.map(p => p.id);
        tasks = tasks.filter((task: any) => projectIds.includes(task.rel_id));
      }

      // Calculate stats
      const dashboardStats: DashboardStats = {
        totalProjects: projectsRes.data.length,
        activeProjects: projectsRes.data.filter((p: any) => p.status === '2' || p.status === '3').length,
        completedProjects: projectsRes.data.filter((p: any) => p.status === '4').length,
        
        totalTasks: tasks.length,
        pendingTasks: tasks.filter((t: any) => t.status !== '5').length,
        completedTasks: tasks.filter((t: any) => t.status === '5').length,
        
        totalInvoices: invoicesRes.data.length,
        unpaidInvoices: invoicesRes.data.filter((i: any) => i.status !== '2').length,
        paidInvoices: invoicesRes.data.filter((i: any) => i.status === '2').length,
        
        totalEstimates: estimatesRes.data.length,
        pendingEstimates: estimatesRes.data.filter((e: any) => e.status === '1').length,
        acceptedEstimates: estimatesRes.data.filter((e: any) => e.status === '4').length,
        
        totalRevenue: invoicesRes.data
          .filter((i: any) => i.status === '2')
          .reduce((sum: number, i: any) => sum + parseFloat(i.total || '0'), 0),
          
        pendingPayments: invoicesRes.data
          .filter((i: any) => i.status !== '2')
          .reduce((sum: number, i: any) => sum + parseFloat(i.total || '0'), 0),
      };

      setStats(dashboardStats);
      setLoading(false);
    } catch (error: any) {
      console.error('[useMyDashboardStats] Error:', error);
      setError(error.message || 'Không thể tải thống kê');
      setLoading(false);
    }
  }, [isAuthenticated, user, customerId, isStaff]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

// ==================== RECENT ACTIVITY HOOK ====================

interface ActivityItem {
  id: string;
  type: 'project' | 'task' | 'invoice' | 'estimate';
  title: string;
  description: string;
  date: string;
  status?: string;
  amount?: number;
}

/**
 * Hook lấy hoạt động gần đây
 */
export function useMyRecentActivity(limit: number = 10) {
  const { user, isAuthenticated, isStaff, getCustomerId } = usePerfexAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = useMemo(() => getCustomerId(), [user]);

  const fetchActivity = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setActivities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = isStaff() ? {} : { clientid: customerId || undefined };

      // Fetch recent data
      const [projectsRes, invoicesRes, estimatesRes] = await Promise.all([
        PerfexCRM.Projects.getAll({ ...params, limit: 5 }),
        PerfexCRM.Invoices.getAll({ ...params, limit: 5 }),
        PerfexCRM.Estimates.getAll({ ...params, limit: 5 }),
      ]);

      // Convert to activity items
      const items: ActivityItem[] = [
        ...projectsRes.data.map((p: any) => ({
          id: `project-${p.id}`,
          type: 'project' as const,
          title: p.name,
          description: `Dự án ${getProjectStatusText(p.status)}`,
          date: p.start_date || p.datecreated || '',
          status: p.status,
        })),
        ...invoicesRes.data.map((i: any) => ({
          id: `invoice-${i.id}`,
          type: 'invoice' as const,
          title: `Hóa đơn #${i.number || i.id}`,
          description: getInvoiceStatusText(i.status),
          date: i.date || i.datecreated || '',
          status: i.status,
          amount: parseFloat(i.total || '0'),
        })),
        ...estimatesRes.data.map((e: any) => ({
          id: `estimate-${e.id}`,
          type: 'estimate' as const,
          title: `Báo giá #${e.number || e.id}`,
          description: getEstimateStatusText(e.status),
          date: e.date || e.datecreated || '',
          status: e.status,
          amount: parseFloat(e.total || '0'),
        })),
      ];

      // Sort by date (newest first) and limit
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(items.slice(0, limit));
      setLoading(false);
    } catch (error: any) {
      console.error('[useMyRecentActivity] Error:', error);
      setError(error.message || 'Không thể tải hoạt động gần đây');
      setLoading(false);
    }
  }, [isAuthenticated, user, customerId, isStaff, limit]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activities,
    loading,
    error,
    refresh: fetchActivity,
  };
}

// ==================== HELPER FUNCTIONS ====================

function getProjectStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    '1': 'Chưa bắt đầu',
    '2': 'Đang tiến hành',
    '3': 'Tạm dừng',
    '4': 'Hoàn thành',
    '5': 'Đã hủy',
  };
  return statusMap[status] || 'Không xác định';
}

function getInvoiceStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    '1': 'Chưa thanh toán',
    '2': 'Đã thanh toán',
    '3': 'Thanh toán một phần',
    '4': 'Quá hạn',
    '5': 'Đã hủy',
  };
  return statusMap[status] || 'Không xác định';
}

function getEstimateStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    '1': 'Đang chờ',
    '2': 'Đã gửi',
    '3': 'Từ chối',
    '4': 'Đã chấp nhận',
    '5': 'Hết hạn',
  };
  return statusMap[status] || 'Không xác định';
}

// ==================== EXPORTS ====================

export {
    getEstimateStatusText, getInvoiceStatusText, getProjectStatusText
};

    export type {
        ActivityItem, DashboardStats, DataState
    };

