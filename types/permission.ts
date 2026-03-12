/**
 * Permission & Role Management Types
 * Role-based access control for the application
 */

// ==================== USER ROLES ====================

export enum UserRole {
  // System Admin - Full access
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  
  // Management Roles
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SITE_MANAGER = 'SITE_MANAGER',
  
  // Technical Roles
  ENGINEER = 'ENGINEER',
  ARCHITECT = 'ARCHITECT',
  FOREMAN = 'FOREMAN',
  
  // Worker Roles
  CONTRACTOR = 'CONTRACTOR',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  WORKER = 'WORKER',
  
  // External Roles
  CLIENT = 'CLIENT',
  CLIENT_REP = 'CLIENT_REP',
  CONSULTANT = 'CONSULTANT',
  SUPPLIER = 'SUPPLIER',
  
  // Viewer
  VIEWER = 'VIEWER',
}

// ==================== PERMISSION MODULES ====================

export enum PermissionModule {
  // Dashboard & Analytics
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  REPORTS = 'REPORTS',
  
  // Project Management
  PROJECTS = 'PROJECTS',
  TASKS = 'TASKS',
  TIMELINE = 'TIMELINE',
  MILESTONES = 'MILESTONES',
  
  // Resource Management
  BUDGET = 'BUDGET',
  MATERIALS = 'MATERIALS',
  EQUIPMENT = 'EQUIPMENT',
  LABOR = 'LABOR',
  
  // Quality & Safety
  QC_QA = 'QC_QA',
  SAFETY = 'SAFETY',
  INSPECTIONS = 'INSPECTIONS',
  
  // Documentation
  DOCUMENTS = 'DOCUMENTS',
  DRAWINGS = 'DRAWINGS',
  CONTRACTS = 'CONTRACTS',
  
  // Communication
  MESSAGES = 'MESSAGES',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  
  // Media
  PHOTOS = 'PHOTOS',
  VIDEOS = 'VIDEOS',
  
  // System
  USERS = 'USERS',
  ROLES = 'ROLES',
  SETTINGS = 'SETTINGS',
  AUDIT_LOG = 'AUDIT_LOG',
}

// ==================== PERMISSION ACTIONS ====================

export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  EXPORT = 'EXPORT',
  MANAGE = 'MANAGE',
}

// ==================== PERMISSION TYPE ====================

export interface Permission {
  id: number;
  module: PermissionModule;
  action: PermissionAction;
  description: string;
  createdAt: string;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  permission: Permission;
  grantedAt: string;
  grantedBy: number;
}

export interface Role {
  id: number;
  code: UserRole;
  name: string;
  description: string;
  level: number; // Higher = more privileges
  permissions: RolePermission[];
  isSystem: boolean; // Cannot be deleted
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleAssignment {
  id: number;
  userId: number;
  roleId: number;
  role: Role;
  projectId?: number; // Project-specific role
  assignedAt: string;
  assignedBy: number;
  expiresAt?: string;
}

// ==================== PERMISSION PRESETS ====================

export interface RolePermissionPreset {
  role: UserRole;
  name: string;
  description: string;
  level: number;
  permissions: {
    module: PermissionModule;
    actions: PermissionAction[];
  }[];
}

// ==================== DASHBOARD VISIBILITY ====================

export interface DashboardWidget {
  id: string;
  name: string;
  module: PermissionModule;
  requiredPermissions: {
    module: PermissionModule;
    action: PermissionAction;
  }[];
  minRoleLevel?: number;
}

export interface DashboardSection {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  requiredRole?: UserRole[];
  minRoleLevel?: number;
}

// ==================== PERMISSION CHECK ====================

export interface PermissionCheck {
  module: PermissionModule;
  action: PermissionAction;
  projectId?: number;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
  requiredPermission?: string;
}

// ==================== ROLE HIERARCHY ====================

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 90,
  [UserRole.PROJECT_MANAGER]: 80,
  [UserRole.SITE_MANAGER]: 70,
  [UserRole.ENGINEER]: 60,
  [UserRole.ARCHITECT]: 60,
  [UserRole.FOREMAN]: 50,
  [UserRole.CONTRACTOR]: 40,
  [UserRole.SUBCONTRACTOR]: 30,
  [UserRole.WORKER]: 20,
  [UserRole.CLIENT]: 25,
  [UserRole.CLIENT_REP]: 25,
  [UserRole.CONSULTANT]: 35,
  [UserRole.SUPPLIER]: 15,
  [UserRole.VIEWER]: 10,
};

// ==================== ROLE LABELS ====================

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.PROJECT_MANAGER]: 'Project Manager',
  [UserRole.SITE_MANAGER]: 'Site Manager',
  [UserRole.ENGINEER]: 'Engineer',
  [UserRole.ARCHITECT]: 'Architect',
  [UserRole.FOREMAN]: 'Foreman',
  [UserRole.CONTRACTOR]: 'Contractor',
  [UserRole.SUBCONTRACTOR]: 'Subcontractor',
  [UserRole.WORKER]: 'Worker',
  [UserRole.CLIENT]: 'Client',
  [UserRole.CLIENT_REP]: 'Client Representative',
  [UserRole.CONSULTANT]: 'Consultant',
  [UserRole.SUPPLIER]: 'Supplier',
  [UserRole.VIEWER]: 'Viewer',
};

export const ROLE_LABELS_VI: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.PROJECT_MANAGER]: 'Quản lý dự án',
  [UserRole.SITE_MANAGER]: 'Quản lý công trường',
  [UserRole.ENGINEER]: 'Kỹ sư',
  [UserRole.ARCHITECT]: 'Kiến trúc sư',
  [UserRole.FOREMAN]: 'Giám sát thi công',
  [UserRole.CONTRACTOR]: 'Nhà thầu chính',
  [UserRole.SUBCONTRACTOR]: 'Nhà thầu phụ',
  [UserRole.WORKER]: 'Công nhân',
  [UserRole.CLIENT]: 'Khách hàng',
  [UserRole.CLIENT_REP]: 'Đại diện khách hàng',
  [UserRole.CONSULTANT]: 'Tư vấn',
  [UserRole.SUPPLIER]: 'Nhà cung cấp',
  [UserRole.VIEWER]: 'Người xem',
};

// ==================== MODULE LABELS ====================

export const MODULE_LABELS: Record<PermissionModule, string> = {
  [PermissionModule.DASHBOARD]: 'Dashboard',
  [PermissionModule.ANALYTICS]: 'Analytics',
  [PermissionModule.REPORTS]: 'Reports',
  [PermissionModule.PROJECTS]: 'Projects',
  [PermissionModule.TASKS]: 'Tasks',
  [PermissionModule.TIMELINE]: 'Timeline',
  [PermissionModule.MILESTONES]: 'Milestones',
  [PermissionModule.BUDGET]: 'Budget',
  [PermissionModule.MATERIALS]: 'Materials',
  [PermissionModule.EQUIPMENT]: 'Equipment',
  [PermissionModule.LABOR]: 'Labor',
  [PermissionModule.QC_QA]: 'QC/QA',
  [PermissionModule.SAFETY]: 'Safety',
  [PermissionModule.INSPECTIONS]: 'Inspections',
  [PermissionModule.DOCUMENTS]: 'Documents',
  [PermissionModule.DRAWINGS]: 'Drawings',
  [PermissionModule.CONTRACTS]: 'Contracts',
  [PermissionModule.MESSAGES]: 'Messages',
  [PermissionModule.ANNOUNCEMENTS]: 'Announcements',
  [PermissionModule.NOTIFICATIONS]: 'Notifications',
  [PermissionModule.PHOTOS]: 'Photos',
  [PermissionModule.VIDEOS]: 'Videos',
  [PermissionModule.USERS]: 'Users',
  [PermissionModule.ROLES]: 'Roles',
  [PermissionModule.SETTINGS]: 'Settings',
  [PermissionModule.AUDIT_LOG]: 'Audit Log',
};

export const MODULE_LABELS_VI: Record<PermissionModule, string> = {
  [PermissionModule.DASHBOARD]: 'Bảng điều khiển',
  [PermissionModule.ANALYTICS]: 'Phân tích',
  [PermissionModule.REPORTS]: 'Báo cáo',
  [PermissionModule.PROJECTS]: 'Dự án',
  [PermissionModule.TASKS]: 'Công việc',
  [PermissionModule.TIMELINE]: 'Timeline',
  [PermissionModule.MILESTONES]: 'Mốc quan trọng',
  [PermissionModule.BUDGET]: 'Ngân sách',
  [PermissionModule.MATERIALS]: 'Vật liệu',
  [PermissionModule.EQUIPMENT]: 'Thiết bị',
  [PermissionModule.LABOR]: 'Nhân công',
  [PermissionModule.QC_QA]: 'QC/QA',
  [PermissionModule.SAFETY]: 'An toàn',
  [PermissionModule.INSPECTIONS]: 'Kiểm tra',
  [PermissionModule.DOCUMENTS]: 'Tài liệu',
  [PermissionModule.DRAWINGS]: 'Bản vẽ',
  [PermissionModule.CONTRACTS]: 'Hợp đồng',
  [PermissionModule.MESSAGES]: 'Tin nhắn',
  [PermissionModule.ANNOUNCEMENTS]: 'Thông báo',
  [PermissionModule.NOTIFICATIONS]: 'Thông báo hệ thống',
  [PermissionModule.PHOTOS]: 'Ảnh',
  [PermissionModule.VIDEOS]: 'Video',
  [PermissionModule.USERS]: 'Người dùng',
  [PermissionModule.ROLES]: 'Vai trò',
  [PermissionModule.SETTINGS]: 'Cài đặt',
  [PermissionModule.AUDIT_LOG]: 'Nhật ký hệ thống',
};

// ==================== ACTION LABELS ====================

export const ACTION_LABELS: Record<PermissionAction, string> = {
  [PermissionAction.VIEW]: 'View',
  [PermissionAction.CREATE]: 'Create',
  [PermissionAction.EDIT]: 'Edit',
  [PermissionAction.DELETE]: 'Delete',
  [PermissionAction.APPROVE]: 'Approve',
  [PermissionAction.EXPORT]: 'Export',
  [PermissionAction.MANAGE]: 'Manage',
};

export const ACTION_LABELS_VI: Record<PermissionAction, string> = {
  [PermissionAction.VIEW]: 'Xem',
  [PermissionAction.CREATE]: 'Tạo mới',
  [PermissionAction.EDIT]: 'Chỉnh sửa',
  [PermissionAction.DELETE]: 'Xóa',
  [PermissionAction.APPROVE]: 'Phê duyệt',
  [PermissionAction.EXPORT]: 'Xuất',
  [PermissionAction.MANAGE]: 'Quản lý',
};
