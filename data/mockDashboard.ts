/**
 * Dashboard Data Types - Production
 * 
 * Purpose: Types and empty data for dashboard screens
 * Data from API/CRM only - no mock data
 * Cleaned for production
 */

import { AdminDashboard, ClientDashboard, EngineerDashboard } from '@/services/dashboardApi';

// ============================================================================
// EMPTY ADMIN DASHBOARD - Data from API only
// ============================================================================

export const mockAdminDashboard: AdminDashboard = {
  totalUsers: 0,
  totalProjects: 0,
  totalRevenue: 0,
  activeProjects: 0,
  completedProjects: 0,
  pendingTasks: 0,
  completedTasks: 0,
  usersByRole: [],
  systemHealth: {
    status: 'healthy',
    uptime: 0,
    lastBackup: '',
    issues: [],
  },
  recentActivities: [],
  revenueByMonth: [],
  projectsByStatus: [],
  topEngineers: [],
  topClients: [],
};

// ============================================================================
// EMPTY ENGINEER DASHBOARD - Data from API only
// ============================================================================

export const mockEngineerDashboard: EngineerDashboard = {
  assignedProjects: 0,
  completedProjects: 0,
  pendingTasks: 0,
  completedTasks: 0,
  pendingInspections: 0,
  activeProjects: 0,
  totalProjects: 0,
  myProjects: [],
  upcomingDeadlines: [],
  performanceStats: {
    tasksCompletedThisMonth: 0,
    averageTaskCompletionTime: 0,
    onTimeDeliveryRate: 0,
    qualityScore: 0,
  },
  recentActivities: [],
};

// ============================================================================
// EMPTY CLIENT DASHBOARD - Data from API only
// ============================================================================

export const mockClientDashboard: ClientDashboard = {
  myProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalInvestment: 0,
  totalPaid: 0,
  totalPending: 0,
  projectProgress: [],
  upcomingPayments: [],
  recentUpdates: [],
  recentActivities: [],
};

// ============================================================================
// EMPTY USERS DATA - Data from API only
// ============================================================================

export const mockUsers: any[] = [];
