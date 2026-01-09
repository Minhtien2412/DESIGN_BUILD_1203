/**
 * useDashboardData Hook
 * =====================
 * 
 * Custom hook để fetch real data từ Perfex CRM và Main API cho Dashboard
 * Kết hợp dữ liệu từ nhiều nguồn với caching và error handling
 * 
 * @author ThietKeResort Team
 * @created 2026-01-03
 */

import {
    PerfexCustomersService,
    PerfexInvoicesService,
    PerfexProjectsService,
    PerfexTasksService,
    type PerfexProject,
    type PerfexTask,
} from '@/services/perfexCRM';
import { useCallback, useEffect, useRef, useState } from 'react';

// ==================== TYPES ====================

export interface DashboardProject {
  id: string;
  name: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'on-hold' | 'cancelled' | 'finished';
  statusLabel: string;
  client: string;
  deadline?: string;
  daysLeft?: number;
}

export interface DashboardTask {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priorityLabel: string;
  status: string;
  statusLabel: string;
  dueDate?: string;
  isOverdue: boolean;
  projectName?: string;
}

export interface DashboardStats {
  projects: { total: number; active: number; completed: number };
  customers: { total: number; active: number };
  tasks: { total: number; pending: number; overdue: number };
  invoices: { total: number; unpaid: number; revenue: number };
}

export interface QuickAccessBadges {
  projects: string | null;
  chat: string | null;
  orders: string | null;
  crm: string | null;
}

export interface DashboardNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
}

export interface CoreModuleStats {
  projects: string;
  construction: string;
  contracts: string;
  qc: string;
}

// ==================== HELPERS ====================

const PROJECT_STATUS_MAP: Record<number, { key: DashboardProject['status']; label: string }> = {
  1: { key: 'not-started', label: 'Chưa bắt đầu' },
  2: { key: 'in-progress', label: 'Đang thực hiện' },
  3: { key: 'on-hold', label: 'Tạm dừng' },
  4: { key: 'cancelled', label: 'Đã hủy' },
  5: { key: 'finished', label: 'Hoàn thành' },
};

const TASK_PRIORITY_MAP: Record<number, { key: DashboardTask['priority']; label: string }> = {
  1: { key: 'low', label: 'Thấp' },
  2: { key: 'medium', label: 'Trung bình' },
  3: { key: 'high', label: 'Cao' },
  4: { key: 'urgent', label: 'Khẩn cấp' },
};

const TASK_STATUS_MAP: Record<number, string> = {
  1: 'Chưa bắt đầu',
  2: 'Đang làm',
  3: 'Testing',
  4: 'Chờ phản hồi',
  5: 'Hoàn thành',
};

function getDaysLeft(deadline?: string): number | undefined {
  if (!deadline) return undefined;
  const now = new Date();
  const due = new Date(deadline);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

// ==================== MAIN HOOK ====================

interface UseDashboardDataReturn {
  // Data
  projects: DashboardProject[];
  tasks: DashboardTask[];
  stats: DashboardStats;
  quickBadges: QuickAccessBadges;
  coreStats: CoreModuleStats;
  notifications: DashboardNotification[];
  
  // States
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  dataSource: 'api' | 'mock' | 'cache';
  
  // Actions
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  // States
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    projects: { total: 0, active: 0, completed: 0 },
    customers: { total: 0, active: 0 },
    tasks: { total: 0, pending: 0, overdue: 0 },
    invoices: { total: 0, unpaid: 0, revenue: 0 },
  });
  const [quickBadges, setQuickBadges] = useState<QuickAccessBadges>({
    projects: null,
    chat: null,
    orders: null,
    crm: null,
  });
  const [coreStats, setCoreStats] = useState<CoreModuleStats>({
    projects: '0 dự án',
    construction: '0 công trình',
    contracts: '0 hợp đồng',
    qc: '0 kiểm tra',
  });
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  
  const [loading, setLoading] = useState(false); // Don't block initial render
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'mock' | 'cache'>('mock');
  
  const isMounted = useRef(true);

  // Fetch all data with timeout protection
  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    console.log('[useDashboardData] 🔄 Fetching real data from CRM & API...');
    
    try {
      // Add timeout to prevent blocking
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      // Fetch từ Perfex CRM song song with timeout
      const fetchPromise = Promise.allSettled([
        PerfexProjectsService.getAll({ limit: 100 }),
        PerfexCustomersService.getAll({ limit: 100 }),
        PerfexTasksService.getAll({ limit: 100 }),
        PerfexInvoicesService.getAll({ limit: 100 }),
      ]);

      const results = await Promise.race([fetchPromise, timeoutPromise]) as PromiseSettledResult<any>[];
      
      const [projectsRes, customersRes, tasksRes, invoicesRes] = results;

      // Extract data safely
      const crmProjects = projectsRes.status === 'fulfilled' ? (projectsRes.value as any).data || [] : [];
      const crmCustomers = customersRes.status === 'fulfilled' ? (customersRes.value as any).data || [] : [];
      const crmTasks = tasksRes.status === 'fulfilled' ? (tasksRes.value as any).data || [] : [];
      const crmInvoices = invoicesRes.status === 'fulfilled' ? (invoicesRes.value as any).data || [] : [];

      console.log('[useDashboardData] ✅ CRM Data received:', {
        projects: crmProjects.length,
        customers: crmCustomers.length,
        tasks: crmTasks.length,
        invoices: crmInvoices.length,
      });

      // Check if we got real data
      const hasRealData = crmProjects.length > 0 || crmCustomers.length > 0;
      
      if (hasRealData) {
        setDataSource('api');
        
        // Transform projects
        const transformedProjects: DashboardProject[] = crmProjects
          .filter((p: PerfexProject) => p.status === 2) // Active only
          .slice(0, 5)
          .map((p: PerfexProject) => ({
            id: p.id,
            name: p.name,
            progress: p.progress || 0,
            status: PROJECT_STATUS_MAP[p.status]?.key || 'in-progress',
            statusLabel: PROJECT_STATUS_MAP[p.status]?.label || 'Đang thực hiện',
            client: p.clientid || 'N/A',
            deadline: p.deadline,
            daysLeft: getDaysLeft(p.deadline),
          }));
        
        // Transform tasks
        const transformedTasks: DashboardTask[] = crmTasks
          .filter((t: PerfexTask) => t.status !== 5 && (t.priority >= 3 || isOverdue(t.duedate)))
          .slice(0, 10)
          .map((t: PerfexTask) => ({
            id: t.id,
            name: t.name,
            priority: TASK_PRIORITY_MAP[t.priority]?.key || 'medium',
            priorityLabel: TASK_PRIORITY_MAP[t.priority]?.label || 'Trung bình',
            status: TASK_STATUS_MAP[t.status] || 'Chưa bắt đầu',
            statusLabel: TASK_STATUS_MAP[t.status] || 'Chưa bắt đầu',
            dueDate: t.duedate,
            isOverdue: isOverdue(t.duedate),
            projectName: t.rel_type === 'project' ? `Project #${t.rel_id}` : undefined,
          }));

        // Calculate stats
        const activeProjects = crmProjects.filter((p: PerfexProject) => p.status === 2).length;
        const completedProjects = crmProjects.filter((p: PerfexProject) => p.status === 5).length;
        const pendingTasks = crmTasks.filter((t: PerfexTask) => t.status === 1 || t.status === 2).length;
        const overdueTasks = crmTasks.filter((t: PerfexTask) => isOverdue(t.duedate) && t.status !== 5).length;
        const unpaidInvoices = crmInvoices.filter((i: any) => i.status === 1 || i.status === 4).length;
        const totalRevenue = crmInvoices.reduce((sum: number, i: any) => sum + parseFloat(i.total || '0'), 0);

        if (isMounted.current) {
          setProjects(transformedProjects);
          setTasks(transformedTasks);
          setStats({
            projects: { total: crmProjects.length, active: activeProjects, completed: completedProjects },
            customers: { total: crmCustomers.length, active: crmCustomers.filter((c: any) => c.active === 1).length },
            tasks: { total: crmTasks.length, pending: pendingTasks, overdue: overdueTasks },
            invoices: { total: crmInvoices.length, unpaid: unpaidInvoices, revenue: totalRevenue },
          });
          setQuickBadges({
            projects: activeProjects > 0 ? String(activeProjects) : null,
            chat: '5', // Will be replaced when messages API is connected
            orders: unpaidInvoices > 0 ? String(unpaidInvoices) : null,
            crm: null,
          });
          setCoreStats({
            projects: `${crmProjects.length} dự án`,
            construction: `${activeProjects} công trình`,
            contracts: `${crmInvoices.length} hợp đồng`,
            qc: `${pendingTasks} pending`,
          });
          
          // Generate notifications from real data
          const notifs: DashboardNotification[] = [];
          
          // Overdue tasks
          crmTasks
            .filter((t: PerfexTask) => isOverdue(t.duedate) && t.status !== 5)
            .slice(0, 3)
            .forEach((t: PerfexTask) => {
              notifs.push({
                id: `task-${t.id}`,
                type: 'task',
                title: 'Task quá hạn',
                message: t.name,
                time: formatTimeAgo(t.dateadded),
                read: false,
                icon: 'alert-circle',
                color: '#000000',
              });
            });
          
          // Unpaid invoices
          crmInvoices
            .filter((i: any) => i.status === 1 || i.status === 4)
            .slice(0, 2)
            .forEach((i: any) => {
              notifs.push({
                id: `invoice-${i.id}`,
                type: 'invoice',
                title: i.status === 4 ? 'Hóa đơn quá hạn' : 'Chờ thanh toán',
                message: `#${i.number} - ${formatCurrency(parseFloat(i.total))}`,
                time: formatTimeAgo(i.datecreated),
                read: false,
                icon: 'receipt',
                color: i.status === 4 ? '#000000' : '#0066CC',
              });
            });
          
          setNotifications(notifs.length > 0 ? notifs : getMockNotifications());
        }
      } else {
        // Fallback to mock data
        console.log('[useDashboardData] ⚠️ No CRM data, using mock fallback');
        setDataSource('mock');
        loadMockData();
      }

      if (isMounted.current) {
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      console.error('[useDashboardData] ❌ Error:', err);
      if (isMounted.current) {
        setError(err.message || 'Không thể tải dữ liệu');
        setDataSource('mock');
        loadMockData();
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Load mock data as fallback
  const loadMockData = useCallback(() => {
    setProjects([
      { id: '1', name: 'Villa Đà Lạt', progress: 75, status: 'in-progress', statusLabel: 'Đang thực hiện', client: 'Nguyễn Văn A', deadline: '2026-02-15', daysLeft: 43 },
      { id: '2', name: 'Resort Phú Quốc', progress: 45, status: 'in-progress', statusLabel: 'Đang thực hiện', client: 'Trần Văn B', deadline: '2026-03-20', daysLeft: 76 },
      { id: '3', name: 'Nhà phố Quận 7', progress: 90, status: 'in-progress', statusLabel: 'Đang thực hiện', client: 'Lê Văn C', deadline: '2026-01-20', daysLeft: 17 },
    ]);
    setTasks([
      { id: '1', name: 'Kiểm tra móng Villa', priority: 'urgent', priorityLabel: 'Khẩn cấp', status: 'Đang làm', statusLabel: 'Đang làm', dueDate: '2026-01-05', isOverdue: false, projectName: 'Villa Đà Lạt' },
      { id: '2', name: 'Nghiệm thu điện tầng 2', priority: 'high', priorityLabel: 'Cao', status: 'Chưa bắt đầu', statusLabel: 'Chưa bắt đầu', dueDate: '2026-01-03', isOverdue: true, projectName: 'Nhà phố Q7' },
    ]);
    setStats({
      projects: { total: 12, active: 5, completed: 6 },
      customers: { total: 48, active: 45 },
      tasks: { total: 156, pending: 23, overdue: 10 },
      invoices: { total: 89, unpaid: 15, revenue: 1250000000 },
    });
    setQuickBadges({ projects: '3', chat: '5', orders: '2', crm: null });
    setCoreStats({
      projects: '12 dự án',
      construction: '5 công trình',
      contracts: '8 hợp đồng',
      qc: '24 kiểm tra',
    });
    setNotifications(getMockNotifications());
  }, []);

  // Effect - delay fetch to avoid blocking initial render
  useEffect(() => {
    isMounted.current = true;
    
    // Delay fetch to allow UI to render first (non-blocking)
    const timer = setTimeout(() => {
      fetchData();
    }, 200);
    
    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [fetchData]);

  return {
    projects,
    tasks,
    stats,
    quickBadges,
    coreStats,
    notifications,
    loading,
    error,
    lastUpdated,
    dataSource,
    refresh: fetchData,
  };
}

// ==================== HELPERS ====================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMockNotifications(): DashboardNotification[] {
  return [
    { id: '1', type: 'task', title: 'Task mới được giao', message: 'Kiểm tra chất lượng bê tông', time: '5 phút trước', read: false, icon: 'checkmark-circle', color: '#0066CC' },
    { id: '2', type: 'project', title: 'Cập nhật tiến độ', message: 'Villa Đà Lạt đạt 75%', time: '1 giờ trước', read: false, icon: 'trending-up', color: '#0066CC' },
    { id: '3', type: 'message', title: 'Tin nhắn mới', message: 'Từ Nguyễn Văn A', time: '2 giờ trước', read: true, icon: 'chatbubble', color: '#999999' },
  ];
}

export default useDashboardData;
