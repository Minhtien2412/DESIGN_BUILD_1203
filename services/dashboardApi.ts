/**
 * Dashboard API Service
 * 
 * Production Backend: https://baotienweb.cloud/api/v1
 * Endpoints: 3 role-based dashboards
 * 
 * Created: Nov 24, 2025
 * Status: ✅ Production Ready
 */

import { get } from './apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DashboardStats {
  totalUsers?: number;
  totalProjects?: number;
  totalRevenue?: number;
  activeProjects?: number;
  completedProjects?: number;
  pendingTasks?: number;
  completedTasks?: number;
  pendingInspections?: number;
  recentActivities?: Activity[];
  revenueByMonth?: RevenueData[];
  projectsByStatus?: StatusData[];
}

export interface Activity {
  id: string;
  type: 'project' | 'task' | 'payment' | 'qc' | 'user';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  projectId?: string;
  projectName?: string;
  metadata?: Record<string, any>;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target?: number;
}

export interface StatusData {
  status: string;
  count: number;
  percentage?: number;
}

export interface AdminDashboard extends DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalRevenue: number;
  usersByRole?: UserRoleData[];
  systemHealth?: SystemHealth;
  topEngineers?: EngineerData[];
  topClients?: ClientData[];
}

export interface EngineerDashboard extends DashboardStats {
  assignedProjects: number;
  completedProjects: number;
  pendingTasks: number;
  completedTasks: number;
  pendingInspections: number;
  upcomingDeadlines?: Deadline[];
  myProjects?: ProjectSummary[];
  performanceStats?: PerformanceStats;
}

export interface ClientDashboard extends DashboardStats {
  myProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalInvestment?: number;
  totalPaid?: number;
  totalPending?: number;
  upcomingPayments?: PaymentSchedule[];
  projectProgress?: ProjectProgress[];
  recentUpdates?: ProjectUpdate[];
}

export interface UserRoleData {
  role: string;
  count: number;
  percentage?: number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastBackup?: string;
  issues?: string[];
}

export interface EngineerData {
  id: string;
  name: string;
  projectsCompleted: number;
  rating?: number;
  tasksCompleted?: number;
}

export interface ClientData {
  id: string;
  name: string;
  totalSpent: number;
  projectsCount: number;
  activeProjects?: number;
}

export interface Deadline {
  id: string;
  projectId: string;
  projectName: string;
  taskName: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  progress: number;
  dueDate?: string;
  client?: string;
}

export interface PerformanceStats {
  tasksCompletedThisMonth: number;
  averageTaskCompletionTime: number;
  onTimeDeliveryRate: number;
  qualityScore?: number;
}

export interface PaymentSchedule {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
}

export interface ProjectProgress {
  projectId: string;
  projectName: string;
  progress: number;
  currentPhase: string;
  lastUpdate: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  projectName: string;
  updateType: 'progress' | 'milestone' | 'issue' | 'completion';
  message: string;
  timestamp: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get Admin Dashboard Data
 * 
 * Endpoint: GET /dashboard/admin
 * Access: Admin only
 * 
 * @returns {Promise<AdminDashboard>} Admin dashboard statistics
 * @throws {ApiError} If request fails
 * 
 * @example
 * const dashboard = await getAdminDashboard();
 * console.log(`Total Users: ${dashboard.totalUsers}`);
 * console.log(`Total Revenue: ${dashboard.totalRevenue}`);
 */
export async function getAdminDashboard(): Promise<AdminDashboard> {
  console.log('[DashboardAPI] 📊 Fetching admin dashboard...');
  
  try {
    const data = await get<AdminDashboard>('/dashboard/admin');
    
    console.log('[DashboardAPI] ✅ Admin dashboard fetched successfully:', {
      totalUsers: data.totalUsers,
      totalProjects: data.totalProjects,
      totalRevenue: data.totalRevenue,
      activitiesCount: data.recentActivities?.length || 0,
    });
    
    return data;
  } catch (error) {
    console.error('[DashboardAPI] ❌ Failed to fetch admin dashboard:', error);
    throw error;
  }
}

/**
 * Get Engineer Dashboard Data
 * 
 * Endpoint: GET /dashboard/engineer
 * Access: Engineer only
 * 
 * @returns {Promise<EngineerDashboard>} Engineer dashboard statistics
 * @throws {ApiError} If request fails
 * 
 * @example
 * const dashboard = await getEngineerDashboard();
 * console.log(`Assigned Projects: ${dashboard.assignedProjects}`);
 * console.log(`Pending Tasks: ${dashboard.pendingTasks}`);
 */
export async function getEngineerDashboard(): Promise<EngineerDashboard> {
  console.log('[DashboardAPI] 👷 Fetching engineer dashboard...');
  
  try {
    const data = await get<EngineerDashboard>('/dashboard/engineer');
    
    console.log('[DashboardAPI] ✅ Engineer dashboard fetched successfully:', {
      assignedProjects: data.assignedProjects,
      pendingTasks: data.pendingTasks,
      pendingInspections: data.pendingInspections,
      projectsCount: data.myProjects?.length || 0,
    });
    
    return data;
  } catch (error) {
    console.error('[DashboardAPI] ❌ Failed to fetch engineer dashboard:', error);
    throw error;
  }
}

/**
 * Get Client Dashboard Data
 * 
 * Endpoint: GET /dashboard/client
 * Access: Client only
 * 
 * @returns {Promise<ClientDashboard>} Client dashboard statistics
 * @throws {ApiError} If request fails
 * 
 * @example
 * const dashboard = await getClientDashboard();
 * console.log(`My Projects: ${dashboard.myProjects}`);
 * console.log(`Total Investment: ${dashboard.totalInvestment}`);
 */
export async function getClientDashboard(): Promise<ClientDashboard> {
  console.log('[DashboardAPI] 👤 Fetching client dashboard...');
  
  try {
    const data = await get<ClientDashboard>('/dashboard/client');
    
    console.log('[DashboardAPI] ✅ Client dashboard fetched successfully:', {
      myProjects: data.myProjects,
      activeProjects: data.activeProjects,
      totalInvestment: data.totalInvestment,
      totalPaid: data.totalPaid,
      progressCount: data.projectProgress?.length || 0,
    });
    
    return data;
  } catch (error) {
    console.error('[DashboardAPI] ❌ Failed to fetch client dashboard:', error);
    throw error;
  }
}

/**
 * Refresh Dashboard Data (Force Re-fetch)
 * 
 * Helper function to refresh dashboard data based on user role
 * 
 * @param {string} role - User role ('ADMIN' | 'ENGINEER' | 'CLIENT')
 * @returns {Promise<DashboardStats>} Dashboard data
 * 
 * @example
 * const dashboard = await refreshDashboard('ADMIN');
 */
export async function refreshDashboard(
  role: 'ADMIN' | 'ENGINEER' | 'CLIENT'
): Promise<DashboardStats> {
  console.log(`[DashboardAPI] 🔄 Refreshing dashboard for role: ${role}`);
  
  switch (role) {
    case 'ADMIN':
      return await getAdminDashboard();
    case 'ENGINEER':
      return await getEngineerDashboard();
    case 'CLIENT':
      return await getClientDashboard();
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}

// Export as object for backwards compatibility
export const dashboardApi = {
  getAdminDashboard,
  getEngineerDashboard,
  getClientDashboard,
  refreshDashboard,
};
