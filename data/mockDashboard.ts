/**
 * Mock Dashboard Data for Offline Testing
 * 
 * Purpose: Test dashboard screens without backend connection
 * Usage: Import and use when API calls fail
 * Created: Nov 24, 2025
 */

import { AdminDashboard, ClientDashboard, EngineerDashboard } from '@/services/dashboardApi';

// ============================================================================
// MOCK ADMIN DASHBOARD
// ============================================================================

export const mockAdminDashboard: AdminDashboard = {
  totalUsers: 156,
  totalProjects: 42,
  totalRevenue: 8500000000, // 8.5 tỷ VND
  activeProjects: 12,
  completedProjects: 28,
  pendingTasks: 45,
  completedTasks: 183,
  
  usersByRole: [
    { role: 'CLIENT', count: 98, percentage: 62.8 },
    { role: 'ENGINEER', count: 48, percentage: 30.8 },
    { role: 'ADMIN', count: 10, percentage: 6.4 },
  ],
  
  systemHealth: {
    status: 'healthy',
    uptime: 99.8,
    lastBackup: '2025-11-24T02:00:00Z',
    issues: [],
  },
  
  recentActivities: [
    {
      id: '1',
      type: 'project',
      title: 'Dự án mới được tạo',
      description: 'Villa Vũng Tàu - Nguyễn Văn A',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 phút trước
      userId: 'user-1',
      userName: 'Admin User',
      projectId: 'proj-1',
      projectName: 'Villa Vũng Tàu',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Thanh toán đợt 2',
      description: 'Nhà phố Thủ Đức - 500,000,000 VND',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 phút trước
      userId: 'user-2',
      userName: 'Trần Thị B',
    },
    {
      id: '3',
      type: 'qc',
      title: 'QC hoàn thành',
      description: 'Biệt thự Đà Lạt - Giai đoạn hoàn thiện',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 giờ trước
      userId: 'user-3',
      userName: 'KS. Lê Văn C',
    },
    {
      id: '4',
      type: 'user',
      title: 'Người dùng mới',
      description: 'Phạm Văn D đăng ký tài khoản',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 giờ trước
      userId: 'user-4',
      userName: 'Phạm Văn D',
    },
    {
      id: '5',
      type: 'task',
      title: 'Task hoàn thành',
      description: 'Lắp đặt điện nước - Nhà phố Quận 2',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 giờ trước
      userId: 'user-5',
      userName: 'KS. Nguyễn E',
    },
  ],
  
  revenueByMonth: [
    { month: '2025-07', revenue: 650000000, target: 800000000 },
    { month: '2025-08', revenue: 920000000, target: 800000000 },
    { month: '2025-09', revenue: 780000000, target: 850000000 },
    { month: '2025-10', revenue: 1100000000, target: 900000000 },
    { month: '2025-11', revenue: 850000000, target: 900000000 },
  ],
  
  projectsByStatus: [
    { status: 'active', count: 12, percentage: 28.6 },
    { status: 'completed', count: 28, percentage: 66.7 },
    { status: 'on_hold', count: 2, percentage: 4.7 },
  ],
  
  topEngineers: [
    { id: 'eng-1', name: 'KS. Trần Văn A', projectsCompleted: 15, rating: 4.8, tasksCompleted: 89 },
    { id: 'eng-2', name: 'KS. Lê Thị B', projectsCompleted: 12, rating: 4.9, tasksCompleted: 76 },
    { id: 'eng-3', name: 'KS. Nguyễn C', projectsCompleted: 10, rating: 4.7, tasksCompleted: 68 },
  ],
  
  topClients: [
    { id: 'cli-1', name: 'Nguyễn Văn X', totalSpent: 2500000000, projectsCount: 3, activeProjects: 1 },
    { id: 'cli-2', name: 'Trần Thị Y', totalSpent: 1800000000, projectsCount: 2, activeProjects: 1 },
    { id: 'cli-3', name: 'Lê Văn Z', totalSpent: 1200000000, projectsCount: 1, activeProjects: 0 },
  ],
};

// ============================================================================
// MOCK ENGINEER DASHBOARD
// ============================================================================

export const mockEngineerDashboard: EngineerDashboard = {
  assignedProjects: 5,
  completedProjects: 12,
  pendingTasks: 8,
  completedTasks: 45,
  pendingInspections: 3,
  activeProjects: 5,
  totalProjects: 17,
  
  myProjects: [
    {
      id: 'proj-1',
      name: 'Villa Vũng Tàu',
      status: 'active',
      progress: 65,
      dueDate: '2025-12-31',
      client: 'Nguyễn Văn A',
    },
    {
      id: 'proj-2',
      name: 'Nhà phố Thủ Đức',
      status: 'active',
      progress: 45,
      dueDate: '2026-02-28',
      client: 'Trần Thị B',
    },
    {
      id: 'proj-3',
      name: 'Biệt thự Đà Lạt',
      status: 'active',
      progress: 80,
      dueDate: '2025-11-30',
      client: 'Lê Văn C',
    },
  ],
  
  upcomingDeadlines: [
    {
      id: 'dl-1',
      projectId: 'proj-3',
      projectName: 'Biệt thự Đà Lạt',
      taskName: 'Hoàn thiện nội thất',
      dueDate: '2025-11-30',
      daysRemaining: 6,
      priority: 'urgent',
    },
    {
      id: 'dl-2',
      projectId: 'proj-1',
      projectName: 'Villa Vũng Tàu',
      taskName: 'Lắp đặt hệ thống điện',
      dueDate: '2025-12-05',
      daysRemaining: 11,
      priority: 'high',
    },
    {
      id: 'dl-3',
      projectId: 'proj-2',
      projectName: 'Nhà phố Thủ Đức',
      taskName: 'QC kết cấu',
      dueDate: '2025-12-15',
      daysRemaining: 21,
      priority: 'medium',
    },
  ],
  
  performanceStats: {
    tasksCompletedThisMonth: 18,
    averageTaskCompletionTime: 4.2,
    onTimeDeliveryRate: 92,
    qualityScore: 8.5,
  },
  
  recentActivities: [
    {
      id: 'act-1',
      type: 'task',
      title: 'Task hoàn thành',
      description: 'Lắp đặt điện nước - Villa Vũng Tâu',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
};

// ============================================================================
// MOCK CLIENT DASHBOARD
// ============================================================================

export const mockClientDashboard: ClientDashboard = {
  myProjects: 2,
  activeProjects: 1,
  completedProjects: 1,
  totalInvestment: 3500000000, // 3.5 tỷ
  totalPaid: 2100000000, // 2.1 tỷ
  totalPending: 1400000000, // 1.4 tỷ
  
  projectProgress: [
    {
      projectId: 'proj-1',
      projectName: 'Villa Vũng Tàu',
      progress: 65,
      currentPhase: 'Hoàn thiện',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
    },
    {
      projectId: 'proj-2',
      projectName: 'Nhà phố Quận 2',
      progress: 100,
      currentPhase: 'Bàn giao',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 tuần trước
    },
  ],
  
  upcomingPayments: [
    {
      id: 'pay-1',
      projectId: 'proj-1',
      projectName: 'Villa Vũng Tàu',
      amount: 500000000,
      dueDate: '2025-12-01',
      status: 'pending',
    },
    {
      id: 'pay-2',
      projectId: 'proj-1',
      projectName: 'Villa Vũng Tàu',
      amount: 400000000,
      dueDate: '2026-01-15',
      status: 'pending',
    },
  ],
  
  recentUpdates: [
    {
      id: 'upd-1',
      projectId: 'proj-1',
      projectName: 'Villa Vũng Tàu',
      updateType: 'progress',
      message: 'Hoàn thành lắp đặt hệ thống điện, tiến độ đạt 65%',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'upd-2',
      projectId: 'proj-1',
      projectName: 'Villa Vũng Tàu',
      updateType: 'milestone',
      message: 'Đã hoàn thành giai đoạn xây thô',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'upd-3',
      projectId: 'proj-2',
      projectName: 'Nhà phố Quận 2',
      updateType: 'completion',
      message: 'Dự án đã hoàn thành và sẵn sàng bàn giao',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
  ],
  
  recentActivities: [],
};

// ============================================================================
// MOCK USERS DATA
// ============================================================================

export const mockUsers = [
  {
    id: 1,
    email: 'admin@baotienweb.cloud',
    name: 'Quản Trị Viên',
    role: 'ADMIN' as const,
    phone: '0901234567',
    avatar: undefined,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'engineer1@baotienweb.cloud',
    name: 'KS. Trần Văn A',
    role: 'ENGINEER' as const,
    phone: '0907654321',
    avatar: undefined,
    isActive: true,
    createdAt: '2025-02-15T00:00:00Z',
  },
  {
    id: 3,
    email: 'client1@gmail.com',
    name: 'Nguyễn Văn X',
    role: 'CLIENT' as const,
    phone: '0909876543',
    avatar: undefined,
    isActive: true,
    createdAt: '2025-03-20T00:00:00Z',
  },
  {
    id: 4,
    email: 'engineer2@baotienweb.cloud',
    name: 'KS. Lê Thị B',
    role: 'ENGINEER' as const,
    phone: '0908765432',
    avatar: undefined,
    isActive: true,
    createdAt: '2025-04-10T00:00:00Z',
  },
  {
    id: 5,
    email: 'client2@gmail.com',
    name: 'Trần Thị Y',
    role: 'CLIENT' as const,
    phone: '0905432109',
    avatar: undefined,
    isActive: true,
    createdAt: '2025-05-05T00:00:00Z',
  },
];
