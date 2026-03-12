/**
 * Permission & Role System Types
 * Comprehensive role-based access control for the application
 */

// ============================================================================
// USER ROLES
// ============================================================================

export enum UserRole {
  /** Khách hàng - chỉ xem và tạo yêu cầu */
  CUSTOMER = 'customer',
  
  /** Nhân viên - xử lý yêu cầu, tạo nội dung (cần duyệt) */
  STAFF = 'staff',
  
  /** Quản lý - duyệt nội dung, quản lý dự án */
  MANAGER = 'manager',
  
  /** Quản trị viên - toàn quyền */
  ADMIN = 'admin',
  
  /** AI System - auto-approve based on rules */
  AI_SYSTEM = 'ai_system',
}

// ============================================================================
// PERMISSIONS
// ============================================================================

export enum Permission {
  // Viewing
  VIEW_PRODUCTS = 'view:products',
  VIEW_PROJECTS = 'view:projects',
  VIEW_REPORTS = 'view:reports',
  VIEW_ANALYTICS = 'view:analytics',
  VIEW_USERS = 'view:users',
  
  // Creating (requires approval for non-admin)
  CREATE_POST = 'create:post',
  CREATE_PRODUCT = 'create:product',
  CREATE_NEWS = 'create:news',
  CREATE_TEMPLATE = 'create:template',
  CREATE_QUOTE = 'create:quote',
  CREATE_PROJECT = 'create:project',
  
  // Editing (own content only for staff/manager)
  EDIT_POST = 'edit:post',
  EDIT_PRODUCT = 'edit:product',
  EDIT_NEWS = 'edit:news',
  EDIT_TEMPLATE = 'edit:template',
  
  // Deleting (own content only)
  DELETE_POST = 'delete:post',
  DELETE_PRODUCT = 'delete:product',
  
  // Approval workflow
  APPROVE_CONTENT = 'approve:content',
  REJECT_CONTENT = 'reject:content',
  
  // Admin only
  MANAGE_USERS = 'manage:users',
  MANAGE_ROLES = 'manage:roles',
  MANAGE_SETTINGS = 'manage:settings',
}

// ============================================================================
// CONTENT TYPES
// ============================================================================

export enum ContentType {
  POST = 'post',
  PRODUCT = 'product',
  NEWS = 'news',
  TEMPLATE = 'template',
  QUOTE_REQUEST = 'quote_request',
  PROJECT = 'project',
}

// ============================================================================
// APPROVAL STATUS
// ============================================================================

export enum ApprovalStatus {
  /** Nháp - chưa gửi duyệt */
  DRAFT = 'draft',
  
  /** Chờ duyệt - pending approval */
  PENDING = 'pending',
  
  /** AI đang xử lý */
  AI_REVIEWING = 'ai_reviewing',
  
  /** AI đã duyệt tự động */
  AI_APPROVED = 'ai_approved',
  
  /** Cần quản trị viên xem xét (AI không chắc chắn) */
  NEEDS_ADMIN_REVIEW = 'needs_admin_review',
  
  /** Đã được admin phê duyệt */
  APPROVED = 'approved',
  
  /** Bị từ chối */
  REJECTED = 'rejected',
  
  /** Đã công khai */
  PUBLISHED = 'published',
}

// ============================================================================
// ROLE PERMISSIONS MAPPING
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CUSTOMER]: [
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_QUOTE,
  ],
  
  [UserRole.STAFF]: [
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_POST,
    Permission.CREATE_PRODUCT,
    Permission.CREATE_NEWS,
    Permission.CREATE_TEMPLATE,
    Permission.EDIT_POST,
    Permission.EDIT_PRODUCT,
    Permission.DELETE_POST,
  ],
  
  [UserRole.MANAGER]: [
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_PROJECTS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_POST,
    Permission.CREATE_PRODUCT,
    Permission.CREATE_NEWS,
    Permission.CREATE_TEMPLATE,
    Permission.CREATE_PROJECT,
    Permission.EDIT_POST,
    Permission.EDIT_PRODUCT,
    Permission.EDIT_NEWS,
    Permission.DELETE_POST,
    Permission.DELETE_PRODUCT,
    Permission.APPROVE_CONTENT,
    Permission.REJECT_CONTENT,
  ],
  
  [UserRole.ADMIN]: Object.values(Permission), // All permissions
  
  [UserRole.AI_SYSTEM]: [
    Permission.APPROVE_CONTENT,
    Permission.REJECT_CONTENT,
  ],
};

// ============================================================================
// CONTENT SUBMISSION
// ============================================================================

export interface ContentSubmission {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  images?: string[];
  createdBy: {
    id: number;
    name: string;
    role: UserRole;
  };
  status: ApprovalStatus;
  submittedAt: string;
  
  // AI Review
  aiScore?: number; // 0-100
  aiRecommendation?: 'approve' | 'reject' | 'review';
  aiReasons?: string[];
  
  // Admin Review
  reviewedBy?: {
    id: number;
    name: string;
    role: UserRole;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  
  // Published
  publishedAt?: string;
}

// ============================================================================
// AI MODERATION RULES
// ============================================================================

export interface AIModerationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Conditions
  contentType: ContentType[];
  minConfidenceScore: number; // 0-100
  
  // Checks
  checks: {
    profanityFilter: boolean;
    duplicateDetection: boolean;
    qualityScore: boolean;
    completenessCheck: boolean;
    imageValidation: boolean;
  };
  
  // Actions
  autoApproveThreshold: number; // e.g., 90 = auto-approve if score >= 90
  autoRejectThreshold: number;  // e.g., 30 = auto-reject if score <= 30
}

// ============================================================================
// APPROVAL WORKFLOW
// ============================================================================

export interface ApprovalWorkflow {
  contentType: ContentType;
  steps: ApprovalStep[];
}

export interface ApprovalStep {
  order: number;
  name: string;
  type: 'ai' | 'admin' | 'manager';
  required: boolean;
  timeoutHours?: number; // Auto-escalate if not reviewed
}

export const DEFAULT_WORKFLOWS: Record<ContentType, ApprovalWorkflow> = {
  [ContentType.POST]: {
    contentType: ContentType.POST,
    steps: [
      { order: 1, name: 'AI Review', type: 'ai', required: true },
      { order: 2, name: 'Admin Approval', type: 'admin', required: true, timeoutHours: 24 },
    ],
  },
  [ContentType.PRODUCT]: {
    contentType: ContentType.PRODUCT,
    steps: [
      { order: 1, name: 'AI Review', type: 'ai', required: true },
      { order: 2, name: 'Manager Review', type: 'manager', required: true, timeoutHours: 48 },
      { order: 3, name: 'Admin Final Approval', type: 'admin', required: true, timeoutHours: 24 },
    ],
  },
  [ContentType.NEWS]: {
    contentType: ContentType.NEWS,
    steps: [
      { order: 1, name: 'AI Review', type: 'ai', required: true },
      { order: 2, name: 'Admin Approval', type: 'admin', required: true, timeoutHours: 12 },
    ],
  },
  [ContentType.TEMPLATE]: {
    contentType: ContentType.TEMPLATE,
    steps: [
      { order: 1, name: 'AI Review', type: 'ai', required: true },
      { order: 2, name: 'Manager Approval', type: 'manager', required: true, timeoutHours: 48 },
    ],
  },
  [ContentType.QUOTE_REQUEST]: {
    contentType: ContentType.QUOTE_REQUEST,
    steps: [
      { order: 1, name: 'Auto-Accept', type: 'ai', required: true },
    ],
  },
  [ContentType.PROJECT]: {
    contentType: ContentType.PROJECT,
    steps: [
      { order: 1, name: 'Manager Review', type: 'manager', required: true, timeoutHours: 24 },
      { order: 2, name: 'Admin Approval', type: 'admin', required: true, timeoutHours: 48 },
    ],
  },
};

// ============================================================================
// USER PERMISSIONS CHECK
// ============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  permissions?: Permission[]; // Custom permissions override
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User, permission: Permission): boolean {
  // Check custom permissions first
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if user can perform action on content
 */
export function canPerformAction(
  user: User,
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve',
  contentType: ContentType,
  contentOwnerId?: number
): boolean {
  // Admin can do anything
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  
  // Map action to permission
  const permissionMap: Record<string, Permission> = {
    'create:post': Permission.CREATE_POST,
    'create:product': Permission.CREATE_PRODUCT,
    'create:news': Permission.CREATE_NEWS,
    'create:template': Permission.CREATE_TEMPLATE,
    'edit:post': Permission.EDIT_POST,
    'edit:product': Permission.EDIT_PRODUCT,
    'delete:post': Permission.DELETE_POST,
    'delete:product': Permission.DELETE_PRODUCT,
    'approve': Permission.APPROVE_CONTENT,
  };
  
  const permissionKey = `${action}:${contentType}`;
  const requiredPermission = permissionMap[permissionKey];
  
  if (!requiredPermission) {
    return false;
  }
  
  // Check if user has permission
  if (!hasPermission(user, requiredPermission)) {
    return false;
  }
  
  // For edit/delete, check ownership (except admin/manager)
  if ((action === 'edit' || action === 'delete') && contentOwnerId) {
    const role = user.role as UserRole;
    const isManagerOrAdmin = role === UserRole.ADMIN || role === UserRole.MANAGER;
    if (!isManagerOrAdmin) return user.id === contentOwnerId;
  }
  
  return true;
}

/**
 * Get allowed content types for user
 */
export function getAllowedContentTypes(user: User): ContentType[] {
  const allowed: ContentType[] = [];
  
  if (hasPermission(user, Permission.CREATE_POST)) allowed.push(ContentType.POST);
  if (hasPermission(user, Permission.CREATE_PRODUCT)) allowed.push(ContentType.PRODUCT);
  if (hasPermission(user, Permission.CREATE_NEWS)) allowed.push(ContentType.NEWS);
  if (hasPermission(user, Permission.CREATE_TEMPLATE)) allowed.push(ContentType.TEMPLATE);
  if (hasPermission(user, Permission.CREATE_QUOTE)) allowed.push(ContentType.QUOTE_REQUEST);
  if (hasPermission(user, Permission.CREATE_PROJECT)) allowed.push(ContentType.PROJECT);
  
  return allowed;
}
