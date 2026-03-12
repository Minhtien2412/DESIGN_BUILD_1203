// Auth & Roles Type Definitions for Construction Design App

/**
 * Marketplace User Roles - Vai trò người dùng trong marketplace xây dựng/nội thất
 */
export type UserType = 
  | 'buyer'       // Người mua - khách hàng cá nhân
  | 'seller'      // Người bán cá nhân (thợ, freelancer)
  | 'company'     // Công ty thiết kế/thi công
  | 'contractor'  // Nhà thầu xây dựng
  | 'architect'   // Kiến trúc sư
  | 'designer'    // Nhà thiết kế nội thất
  | 'supplier'    // Nhà cung cấp vật liệu
  | 'admin';      // Quản trị viên platform

/**
 * Marketplace Role với đầy đủ thông tin và permissions
 */
export interface MarketplaceRole {
  type: UserType;
  name: string;
  nameVi: string;
  description: string;
  capabilities: string[];
  icon: string;
  color: string;
  verificationRequired: boolean;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  password_hash: string;
  full_name: string;
  role: string; // Legacy role field
  userType?: UserType; // Marketplace role: buyer, seller, company, contractor, architect, designer, supplier, admin
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  
  // Marketplace Profile Info
  companyName?: string;
  companyLogo?: string;
  companyVerified?: boolean;
  sellerId?: string; // Link to Seller profile
  
  // Role-specific fields
  licenseNumber?: string; // For architect, contractor
  certifications?: string[]; // Professional certifications
  portfolio?: {
    images: string[];
    projects: number;
    completedProjects: number;
  };
  businessAddress?: string;
  taxCode?: string; // For companies/suppliers
  rating?: number;
  reviewCount?: number;
  yearsExperience?: number;
  specializations?: string[]; // E.g., "Modern", "Classical", "Minimalist"
}

export interface RoleData {
  roleid: string;
  name: string;
  permissions: PermissionString[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
}

export type PermissionString = string;

export type PermissionCategory = 
  | 'system'      // Quản lý hệ thống
  | 'user'        // Quản lý người dùng
  | 'project'     // Quản lý dự án
  | 'design'      // Thiết kế
  | 'construction'// Thi công
  | 'quality'     // Kiểm tra chất lượng
  | 'finance'     // Tài chính
  | 'customer'    // Khách hàng
  | 'report';     // Báo cáo

// Định nghĩa các quyền cụ thể trong hệ thống
export const PERMISSIONS = {
  // System Management (Admin cao nhất)
  SYSTEM_ADMIN: 'system.admin',
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_BACKUP: 'system.backup',
  
  // User Management
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  USER_ASSIGN_ROLE: 'user.assign_role',
  
  // Role & Permission Management
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_EDIT: 'role.edit',
  ROLE_DELETE: 'role.delete',
  PERMISSION_ASSIGN: 'permission.assign',
  
  // Project Management
  PROJECT_VIEW: 'project.view',
  PROJECT_CREATE: 'project.create',
  PROJECT_EDIT: 'project.edit',
  PROJECT_DELETE: 'project.delete',
  PROJECT_ASSIGN: 'project.assign',
  
  // Design Management
  DESIGN_VIEW: 'design.view',
  DESIGN_CREATE: 'design.create',
  DESIGN_EDIT: 'design.edit',
  DESIGN_DELETE: 'design.delete',
  DESIGN_APPROVE: 'design.approve',
  DESIGN_EXPORT: 'design.export',
  
  // Construction Management
  CONSTRUCTION_VIEW: 'construction.view',
  CONSTRUCTION_CREATE: 'construction.create',
  CONSTRUCTION_EDIT: 'construction.edit',
  CONSTRUCTION_SCHEDULE: 'construction.schedule',
  CONSTRUCTION_ASSIGN_WORKER: 'construction.assign_worker',
  
  // Quality Control
  QUALITY_VIEW: 'quality.view',
  QUALITY_INSPECT: 'quality.inspect',
  QUALITY_APPROVE: 'quality.approve',
  QUALITY_REPORT: 'quality.report',
  
  // Finance Management
  FINANCE_VIEW: 'finance.view',
  FINANCE_CREATE_QUOTE: 'finance.create_quote',
  FINANCE_APPROVE_PAYMENT: 'finance.approve_payment',
  FINANCE_VIEW_REPORT: 'finance.view_report',
  
  // Customer Management
  CUSTOMER_VIEW: 'customer.view',
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_EDIT: 'customer.edit',
  CUSTOMER_COMMUNICATE: 'customer.communicate',
  
  // Report Access
  REPORT_VIEW_ALL: 'report.view_all',
  REPORT_EXPORT: 'report.export',
  REPORT_ANALYTICS: 'report.analytics',
} as const;

export type Role =
  | 'SYSTEM_ADMIN'      // Quản trị hệ thống
  | 'COMPANY_ADMIN'     // Admin công ty
  | 'PROJECT_MANAGER'   // Quản lý dự án
  | 'TENDER_MANAGER'    // Quản lý gói thầu
  | 'CUSTOMER_BIDDER'   // Khách hàng đấu thầu
  | 'WORKER'            // Công nhân
  | 'COMPANY_MEMBER'    // Thành viên công ty
  // Specific worker roles
  | 'THO_SON'           // Thợ sơn
  | 'THO_CONG'          // Thợ công
  | 'THO_DA'            // Thợ đá
  | 'THO_LAT_GACH'      // Thợ lát gạch
  | 'THO_THACH_CAO'     // Thợ thạch cao
  | 'THO_DIEN'          // Thợ điện
  | 'THO_NUOC'          // Thợ nước
  | 'THO_LAM_CUA'       // Thợ làm cửa
  | 'THO_BAN_AN'        // Thợ bàn ăn
  | 'THO_BAN_CO_DIEN'   // Thợ bàn cơ điện
  | 'THO_BAN_HOC'       // Thợ bàn học
  | 'THO_BANG_MAU'      // Thợ bảng màu
  | 'THO_PCCC'          // Thợ PCCC
  | 'THO_TB_BEP'        // Thợ thiết bị bếp
  | 'THO_TB_VS'         // Thợ thiết bị vệ sinh
  | 'THO_SOFA'          // Thợ sofa
  | 'THO_CHDV'          // Thợ chăm sóc nhà cửa
  | 'THO_DICH_VU'       // Thợ dịch vụ
  | 'THO_DICH_VU_THEM'  // Thợ dịch vụ thêm
  // Legacy roles
  | 'khach-hang'        // Khách hàng (legacy)
  | 'nha-thau'          // Nhà thầu (legacy)
  | 'thau-phu'          // Thầu phụ (legacy)
  | 'cong-ty'           // Công ty (legacy)
  | 'sale-admin'        // Sale admin (legacy)
  | 'manager'           // Manager (legacy)
  | 'admin';            // Admin (legacy)

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  roles: Role[];
  permissions: PermissionString[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  avatar?: string;
  role?: Role;
  reward_points?: number; // Điểm thưởng (default 100 = 100,000 VND)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser extends UserProfile {
  companies: Company[];
  current_company_id: string | null;
  is_admin: boolean;
  scopes: PermissionString[];
  global_roles: Role[];
}

export interface MeResponse {
  user: UserProfile;
  companies: Company[];
  current_company_id: string | null;
  is_admin: boolean;
  scopes: PermissionString[];
}

// Permission mappings for roles
export const ROLE_PERMISSIONS: Record<Role, PermissionString[]> = {
  SYSTEM_ADMIN: [
    'SYSTEM_ADMIN', 'USER_MANAGE', 'COMPANY_MANAGE', 'ROLE_MANAGE',
    'PROJECT_CREATE', 'PROJECT_EDIT', 'PROJECT_DELETE', 'PROJECT_VIEW_ALL',
    'TENDER_CREATE', 'TENDER_EDIT', 'TENDER_DELETE', 'TENDER_PUBLISH', 'TENDER_BID_REVIEW',
    'BID_CREATE', 'BID_EDIT', 'BID_SUBMIT', 'BID_WITHDRAW',
    'WORK_ORDER_CREATE', 'WORK_ORDER_ASSIGN', 'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'DOCUMENT_DELETE', 'MEDIA_UPLOAD', 'MEDIA_DELETE',
    'REPORT_VIEW', 'ANALYTICS_VIEW', 'EXPORT_DATA'
  ],

  COMPANY_ADMIN: [
    'COMPANY_ADMIN', 'COMPANY_MEMBER_MANAGE', 'COMPANY_PROJECT_MANAGE', 'COMPANY_TENDER_MANAGE',
    'PROJECT_CREATE', 'PROJECT_EDIT', 'PROJECT_DELETE', 'PROJECT_VIEW_ALL',
    'TENDER_CREATE', 'TENDER_EDIT', 'TENDER_DELETE', 'TENDER_PUBLISH', 'TENDER_BID_REVIEW',
    'BID_CREATE', 'BID_EDIT', 'BID_SUBMIT', 'BID_WITHDRAW',
    'WORK_ORDER_CREATE', 'WORK_ORDER_ASSIGN', 'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'DOCUMENT_DELETE', 'MEDIA_UPLOAD', 'MEDIA_DELETE',
    'REPORT_VIEW', 'ANALYTICS_VIEW', 'EXPORT_DATA'
  ],

  PROJECT_MANAGER: [
    'PROJECT_CREATE', 'PROJECT_EDIT', 'PROJECT_DELETE', 'PROJECT_VIEW_ALL',
    'TENDER_CREATE', 'TENDER_EDIT', 'TENDER_DELETE', 'TENDER_PUBLISH', 'TENDER_BID_REVIEW',
    'WORK_ORDER_CREATE', 'WORK_ORDER_ASSIGN', 'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'DOCUMENT_DELETE', 'MEDIA_UPLOAD', 'MEDIA_DELETE',
    'REPORT_VIEW', 'ANALYTICS_VIEW'
  ],

  TENDER_MANAGER: [
    'TENDER_CREATE', 'TENDER_EDIT', 'TENDER_DELETE', 'TENDER_PUBLISH', 'TENDER_BID_REVIEW',
    'BID_CREATE', 'BID_EDIT', 'BID_SUBMIT', 'BID_WITHDRAW',
    'DOCUMENT_UPLOAD', 'DOCUMENT_DELETE', 'MEDIA_UPLOAD', 'MEDIA_DELETE'
  ],

  CUSTOMER_BIDDER: [
    'BID_CREATE', 'BID_EDIT', 'BID_SUBMIT', 'BID_WITHDRAW',
    'DOCUMENT_UPLOAD'
  ],

  WORKER: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  // Specific worker roles - same permissions as WORKER
  THO_SON: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_CONG: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_DA: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_LAT_GACH: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_THACH_CAO: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_DIEN: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_NUOC: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_LAM_CUA: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_BAN_AN: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_BAN_CO_DIEN: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_BAN_HOC: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_BANG_MAU: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_PCCC: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_TB_BEP: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_TB_VS: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_SOFA: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_CHDV: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_DICH_VU: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  THO_DICH_VU_THEM: [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  COMPANY_MEMBER: [
    'PROJECT_VIEW_ALL',
    'DOCUMENT_UPLOAD'
  ],

  // Legacy roles - map to basic permissions
  'khach-hang': [
    'BID_CREATE', 'BID_EDIT', 'BID_SUBMIT',
    'DOCUMENT_UPLOAD'
  ],

  'nha-thau': [
    'PROJECT_CREATE', 'PROJECT_EDIT',
    'TENDER_CREATE', 'TENDER_EDIT', 'TENDER_PUBLISH',
    'BID_CREATE', 'BID_EDIT', 'BID_SUBMIT', 'BID_WITHDRAW',
    'DOCUMENT_UPLOAD', 'DOCUMENT_DELETE'
  ],

  'thau-phu': [
    'WORK_ORDER_UPDATE', 'WORK_ORDER_COMPLETE',
    'DOCUMENT_UPLOAD', 'MEDIA_UPLOAD'
  ],

  'cong-ty': [
    'COMPANY_ADMIN', 'COMPANY_MEMBER_MANAGE',
    'PROJECT_CREATE', 'PROJECT_EDIT', 'PROJECT_VIEW_ALL',
    'TENDER_CREATE', 'TENDER_EDIT', 'TENDER_PUBLISH',
    'DOCUMENT_UPLOAD', 'DOCUMENT_DELETE'
  ],

  'sale-admin': [
    'USER_MANAGE', 'COMPANY_MANAGE',
    'REPORT_VIEW', 'ANALYTICS_VIEW'
  ],

  'manager': [
    'PROJECT_EDIT', 'PROJECT_DELETE', 'PROJECT_VIEW_ALL',
    'TENDER_EDIT', 'TENDER_DELETE', 'TENDER_PUBLISH',
    'REPORT_VIEW', 'ANALYTICS_VIEW'
  ],

  'admin': [
    'SYSTEM_ADMIN', 'USER_MANAGE', 'COMPANY_MANAGE', 'ROLE_MANAGE',
    'PROJECT_CREATE', 'PROJECT_EDIT', 'PROJECT_DELETE', 'PROJECT_VIEW_ALL',
    'REPORT_VIEW', 'ANALYTICS_VIEW', 'EXPORT_DATA'
  ]
};

// Helper functions
export function hasPermission(user: AuthUser | null, permission: PermissionString): boolean {
  if (!user) return false;
  if (user.is_admin) return true;
  return user.scopes.includes(permission);
}

export function hasRole(user: AuthUser | null, role: Role): boolean {
  if (!user) return false;
  if (user.is_admin) return true;
  return user.global_roles.includes(role);
}

export function getCurrentCompany(user: AuthUser | null): Company | null {
  if (!user || !user.current_company_id) return null;
  return user.companies.find(c => c.id === user.current_company_id) || null;
}

export function canSwitchToCompany(user: AuthUser | null, companyId: string): boolean {
  if (!user) return false;
  return user.companies.some(c => c.id === companyId);
}
