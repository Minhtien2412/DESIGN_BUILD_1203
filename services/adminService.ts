/**
 * Admin Dashboard Service
 * Provides admin dashboard data and statistics
 * Falls back to mock data when API is unavailable
 */

import { apiFetch } from "./api";
import { mockAdminDashboard, mockAdminStats } from "./mockDataService";

// ============================================
// Types
// ============================================

export interface DashboardOverview {
  totalRevenue: number;
  monthlyRevenue: number;
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  newClientsThisMonth: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export interface RevenueDataPoint {
  month: string;
  value: number;
}

export interface ProjectsByStatus {
  planning: number;
  in_progress: number;
  review: number;
  completed: number;
}

export interface TopPerformer {
  name: string;
  projects: number;
  revenue: number;
}

export interface RecentActivity {
  action: string;
  detail: string;
  time: string;
}

export interface AdminDashboard {
  overview: DashboardOverview;
  revenueChart: RevenueDataPoint[];
  projectsByStatus: ProjectsByStatus;
  topPerformers: TopPerformer[];
  recentActivities: RecentActivity[];
}

export interface UserStats {
  total: number;
  active: number;
  newThisWeek: number;
  byRole: {
    admin: number;
    manager: number;
    staff: number;
    client: number;
  };
}

export interface ProjectStats {
  total: number;
  thisMonth: number;
  completionRate: number;
}

export interface FinanceStats {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

export interface AdminStats {
  users: UserStats;
  projects: ProjectStats;
  finance: FinanceStats;
}

// ============================================
// API Functions
// ============================================

/**
 * Get admin dashboard data
 */
export async function getAdminDashboard(): Promise<AdminDashboard> {
  try {
    const response = await apiFetch<AdminDashboard>("/admin/dashboard");
    return response;
  } catch (error) {
    console.log("[Admin] Dashboard API unavailable, using mock data");
    return mockAdminDashboard as AdminDashboard;
  }
}

/**
 * Get dashboard overview
 */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  try {
    const response = await apiFetch<DashboardOverview>(
      "/admin/dashboard/overview",
    );
    return response;
  } catch (error) {
    return mockAdminDashboard.overview as DashboardOverview;
  }
}

/**
 * Get revenue chart data
 */
export async function getRevenueChart(months = 6): Promise<RevenueDataPoint[]> {
  try {
    const response = await apiFetch<RevenueDataPoint[]>(
      `/admin/dashboard/revenue?months=${months}`,
    );
    return response;
  } catch (error) {
    return mockAdminDashboard.revenueChart.slice(-months) as RevenueDataPoint[];
  }
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(): Promise<ProjectsByStatus> {
  try {
    const response = await apiFetch<ProjectsByStatus>(
      "/admin/dashboard/projects-status",
    );
    return response;
  } catch (error) {
    return mockAdminDashboard.projectsByStatus as ProjectsByStatus;
  }
}

/**
 * Get top performers
 */
export async function getTopPerformers(limit = 5): Promise<TopPerformer[]> {
  try {
    const response = await apiFetch<TopPerformer[]>(
      `/admin/dashboard/top-performers?limit=${limit}`,
    );
    return response;
  } catch (error) {
    return mockAdminDashboard.topPerformers.slice(0, limit) as TopPerformer[];
  }
}

/**
 * Get recent activities
 */
export async function getRecentActivities(
  limit = 10,
): Promise<RecentActivity[]> {
  try {
    const response = await apiFetch<RecentActivity[]>(
      `/admin/dashboard/activities?limit=${limit}`,
    );
    return response;
  } catch (error) {
    return mockAdminDashboard.recentActivities.slice(
      0,
      limit,
    ) as RecentActivity[];
  }
}

/**
 * Get admin stats
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const response = await apiFetch<AdminStats>("/admin/stats");
    return response;
  } catch (error) {
    console.log("[Admin] Stats API unavailable, using mock data");
    return mockAdminStats as AdminStats;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await apiFetch<UserStats>("/admin/stats/users");
    return response;
  } catch (error) {
    return mockAdminStats.users as UserStats;
  }
}

/**
 * Get project statistics
 */
export async function getProjectStats(): Promise<ProjectStats> {
  try {
    const response = await apiFetch<ProjectStats>("/admin/stats/projects");
    return response;
  } catch (error) {
    return mockAdminStats.projects as ProjectStats;
  }
}

/**
 * Get finance statistics
 */
export async function getFinanceStats(): Promise<FinanceStats> {
  try {
    const response = await apiFetch<FinanceStats>("/admin/stats/finance");
    return response;
  } catch (error) {
    return mockAdminStats.finance as FinanceStats;
  }
}

// ============================================
// Admin User Management
// ============================================

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "CLIENT";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const response = await apiFetch<AdminUser[]>("/admin/users");
    return response;
  } catch (error) {
    // Return mock users
    return [
      {
        id: 1,
        email: "admin@thietkeresort.com",
        name: "Admin",
        role: "ADMIN",
        status: "active",
        createdAt: "2025-01-01T00:00:00Z",
        lastLogin: new Date().toISOString(),
      },
      {
        id: 2,
        email: "manager@thietkeresort.com",
        name: "Manager",
        role: "MANAGER",
        status: "active",
        createdAt: "2025-01-15T00:00:00Z",
        lastLogin: new Date().toISOString(),
      },
    ];
  }
}

export async function updateUserRole(
  userId: number,
  role: AdminUser["role"],
): Promise<AdminUser> {
  try {
    const response = await apiFetch<AdminUser>(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    return response;
  } catch (error) {
    throw new Error("Unable to update user role");
  }
}

export async function suspendUser(userId: number): Promise<AdminUser> {
  try {
    const response = await apiFetch<AdminUser>(
      `/admin/users/${userId}/suspend`,
      {
        method: "POST",
      },
    );
    return response;
  } catch (error) {
    throw new Error("Unable to suspend user");
  }
}

// ============================================
// System Health
// ============================================

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  apiLatency: number;
  databaseStatus: "connected" | "disconnected";
  cacheStatus: "active" | "inactive";
  lastChecked: string;
}

export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiFetch<SystemHealth>("/admin/health");
    return response;
  } catch (error) {
    return {
      status: "degraded",
      uptime: 0,
      apiLatency: 0,
      databaseStatus: "disconnected",
      cacheStatus: "inactive",
      lastChecked: new Date().toISOString(),
    };
  }
}

export default {
  // Dashboard
  getAdminDashboard,
  getDashboardOverview,
  getRevenueChart,
  getProjectsByStatus,
  getTopPerformers,
  getRecentActivities,
  // Stats
  getAdminStats,
  getUserStats,
  getProjectStats,
  getFinanceStats,
  // User Management
  getAdminUsers,
  updateUserRole,
  suspendUser,
  // System
  getSystemHealth,
};
