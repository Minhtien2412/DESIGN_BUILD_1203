/**
 * Core Types - Centralized Type Definitions
 * 
 * Single source of truth for User, Project, and core entities
 * ✅ Prevents type conflicts across services
 * ✅ Ensures consistency with backend API
 * 
 * Created: Dec 4, 2025
 */

import { Permission } from '@/utils/permissions';

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * Core User interface - Unified across entire app
 * 
 * Backend API returns:
 * - id: number (from Perfex CRM staffid)
 * - staffid: number
 * - email: string
 * - name: string
 * - role: string (admin, staff, customer)
 * 
 * Frontend normalizes to this interface
 */
export interface User {
  id: number; // Primary key (from staffid)
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string; // admin, staff, manager, customer
  admin?: number; // 1 if admin, 0 otherwise (Perfex CRM field)
  permissions?: Permission[];
  staffid?: number; // Perfex CRM staff ID
  global_roles?: string[]; // Multi-role support
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showPhone?: boolean;
  };
}

export interface UserListResponse {
  users: User[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  username?: string;
  role?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: number;
  name: string;
  projectName?: string; // Alias for compatibility
  description?: string;
  status?: 'draft' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  progress?: number; // 0-100
  startDate?: string;
  endDate?: string;
  deadline?: string; // Alias for endDate
  budget?: number;
  spent?: number;
  clientId?: number;
  clientName?: string;
  managerId?: number;
  managerName?: string;
  teamMembers?: number[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectProgress extends Project {
  progress: number; // Required for progress tracking
  tasks?: ProjectTask[];
  milestones?: ProjectMilestone[];
}

export interface ProjectTask {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  completedAt?: string;
  priority?: 'low' | 'medium' | 'high';
  progress?: number;
}

export interface ProjectMilestone {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  progress?: number;
}

export interface ProjectUpdate {
  id: number;
  projectId: number;
  title: string;
  content?: string;
  type?: 'general' | 'progress' | 'issue' | 'milestone' | 'announcement';
  createdBy?: number;
  createdByName?: string;
  timestamp?: string;
  createdAt?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// COMMON ENTITY TYPES
// ============================================================================

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimestampedEntity extends BaseEntity {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeleteEntity extends TimestampedEntity {
  deletedAt?: string;
  isDeleted?: boolean;
}

export interface AuditedEntity extends TimestampedEntity {
  createdBy?: number;
  updatedBy?: number;
  createdByName?: string;
  updatedByName?: string;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProjectFilters {
  status?: string;
  clientId?: number;
  managerId?: number;
  search?: string;
  sortBy?: 'name' | 'startDate' | 'progress' | 'budget';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  errors?: Record<string, string[]>;
  url?: string;
  detail?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.email === 'string'
  );
}

export function isProject(obj: any): obj is Project {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string'
  );
}

export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.success === 'boolean'
  );
}
