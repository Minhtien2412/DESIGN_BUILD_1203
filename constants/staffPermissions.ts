/**
 * Staff Permission System — Source of Truth
 * Tất cả permission checks cho module nhân sự đều phải dựa trên file này.
 * KHÔNG hardcode role check rải rác trong UI.
 */

import { CompanyRole } from "@/types/staff";

// ==================== PERMISSION KEYS ====================

export enum StaffPermission {
  // Staff
  VIEW_STAFF_LIST = "view_staff_list",
  VIEW_STAFF_DETAIL = "view_staff_detail",
  VIEW_OWN_PROFILE = "view_own_profile",
  CREATE_STAFF = "create_staff",
  EDIT_STAFF = "edit_staff",
  DEACTIVATE_STAFF = "deactivate_staff",

  // Roles
  VIEW_ROLES = "view_roles",
  MANAGE_ROLES = "manage_roles",
  ASSIGN_ROLE = "assign_role",

  // Departments
  VIEW_DEPARTMENTS = "view_departments",
  MANAGE_DEPARTMENTS = "manage_departments",

  // Teams
  VIEW_TEAMS = "view_teams",
  MANAGE_TEAMS = "manage_teams",
  VIEW_OWN_TEAM = "view_own_team",

  // Reports
  VIEW_COMPANY_REPORTS = "view_company_reports",
  VIEW_DEPARTMENT_REPORTS = "view_department_reports",
  VIEW_OWN_REPORTS = "view_own_reports",

  // Dashboard
  VIEW_HR_DASHBOARD = "view_hr_dashboard",
  VIEW_COMPANY_DASHBOARD = "view_company_dashboard",

  // Projects link
  VIEW_STAFF_PROJECTS = "view_staff_projects",
  ASSIGN_STAFF_TO_PROJECT = "assign_staff_to_project",
}

// ==================== ROLE → PERMISSION MAP ====================

/**
 * Source of truth: mỗi role được cấp đúng các quyền bên dưới.
 * Khi cần check quyền, gọi hasStaffPermission(role, permission).
 */
export const ROLE_PERMISSIONS: Record<CompanyRole, StaffPermission[]> = {
  [CompanyRole.SUPER_ADMIN]: Object.values(StaffPermission), // toàn quyền

  [CompanyRole.ADMIN]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_STAFF_DETAIL,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.CREATE_STAFF,
    StaffPermission.EDIT_STAFF,
    StaffPermission.DEACTIVATE_STAFF,
    StaffPermission.VIEW_ROLES,
    StaffPermission.MANAGE_ROLES,
    StaffPermission.ASSIGN_ROLE,
    StaffPermission.VIEW_DEPARTMENTS,
    StaffPermission.MANAGE_DEPARTMENTS,
    StaffPermission.VIEW_TEAMS,
    StaffPermission.MANAGE_TEAMS,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_COMPANY_REPORTS,
    StaffPermission.VIEW_DEPARTMENT_REPORTS,
    StaffPermission.VIEW_OWN_REPORTS,
    StaffPermission.VIEW_HR_DASHBOARD,
    StaffPermission.VIEW_COMPANY_DASHBOARD,
    StaffPermission.VIEW_STAFF_PROJECTS,
    StaffPermission.ASSIGN_STAFF_TO_PROJECT,
  ],

  [CompanyRole.DIRECTOR]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_STAFF_DETAIL,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_ROLES,
    StaffPermission.VIEW_DEPARTMENTS,
    StaffPermission.VIEW_TEAMS,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_COMPANY_REPORTS,
    StaffPermission.VIEW_DEPARTMENT_REPORTS,
    StaffPermission.VIEW_OWN_REPORTS,
    StaffPermission.VIEW_COMPANY_DASHBOARD,
    StaffPermission.VIEW_STAFF_PROJECTS,
  ],

  [CompanyRole.MANAGER]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_STAFF_DETAIL,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.EDIT_STAFF, // chỉ team mình (scope bổ sung ở runtime)
    StaffPermission.VIEW_DEPARTMENTS,
    StaffPermission.VIEW_TEAMS,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_DEPARTMENT_REPORTS,
    StaffPermission.VIEW_OWN_REPORTS,
    StaffPermission.VIEW_STAFF_PROJECTS,
  ],

  [CompanyRole.TEAM_LEADER]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_STAFF_DETAIL,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_TEAMS,
    StaffPermission.VIEW_OWN_REPORTS,
    StaffPermission.VIEW_STAFF_PROJECTS,
  ],

  [CompanyRole.HR]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_STAFF_DETAIL,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.CREATE_STAFF,
    StaffPermission.EDIT_STAFF,
    StaffPermission.DEACTIVATE_STAFF,
    StaffPermission.VIEW_ROLES,
    StaffPermission.VIEW_DEPARTMENTS,
    StaffPermission.MANAGE_DEPARTMENTS,
    StaffPermission.VIEW_TEAMS,
    StaffPermission.MANAGE_TEAMS,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_COMPANY_REPORTS,
    StaffPermission.VIEW_DEPARTMENT_REPORTS,
    StaffPermission.VIEW_OWN_REPORTS,
    StaffPermission.VIEW_HR_DASHBOARD,
  ],

  [CompanyRole.ARCHITECT]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_STAFF_DETAIL,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_OWN_REPORTS,
    StaffPermission.VIEW_STAFF_PROJECTS,
  ],

  [CompanyRole.ENGINEER]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_STAFF_DETAIL,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_OWN_REPORTS,
    StaffPermission.VIEW_STAFF_PROJECTS,
  ],

  [CompanyRole.SUPERVISOR]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_STAFF_DETAIL,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_OWN_REPORTS,
    StaffPermission.VIEW_STAFF_PROJECTS,
  ],

  [CompanyRole.ACCOUNTANT]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_REPORTS,
  ],

  [CompanyRole.SALES]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_OWN_REPORTS,
  ],

  [CompanyRole.PROCUREMENT]: [
    StaffPermission.VIEW_STAFF_LIST,
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_REPORTS,
  ],

  [CompanyRole.STAFF]: [
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_TEAM,
    StaffPermission.VIEW_OWN_REPORTS,
  ],

  [CompanyRole.WORKER]: [
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_REPORTS,
  ],

  [CompanyRole.COLLABORATOR]: [
    StaffPermission.VIEW_OWN_PROFILE,
    StaffPermission.VIEW_OWN_TEAM,
  ],

  [CompanyRole.CUSTOMER]: [],
};

// ==================== PERMISSION HELPERS ====================

export function hasStaffPermission(
  role: CompanyRole,
  permission: StaffPermission,
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms?.includes(permission) ?? false;
}

export function canViewStaff(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.VIEW_STAFF_LIST);
}

export function canViewStaffDetail(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.VIEW_STAFF_DETAIL);
}

export function canEditStaff(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.EDIT_STAFF);
}

export function canCreateStaff(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.CREATE_STAFF);
}

export function canManageRoles(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.MANAGE_ROLES);
}

export function canViewDepartment(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.VIEW_DEPARTMENTS);
}

export function canManageDepartments(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.MANAGE_DEPARTMENTS);
}

export function canViewTeams(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.VIEW_TEAMS);
}

export function canManageTeams(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.MANAGE_TEAMS);
}

export function canViewCompanyReports(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.VIEW_COMPANY_REPORTS);
}

export function canViewHRDashboard(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.VIEW_HR_DASHBOARD);
}

export function canDeactivateStaff(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.DEACTIVATE_STAFF);
}

export function canAssignStaffToProject(role: CompanyRole): boolean {
  return hasStaffPermission(role, StaffPermission.ASSIGN_STAFF_TO_PROJECT);
}

/**
 * Check if the role is internal (not customer).
 * Customer role has NO access to the staff module.
 */
export function isInternalRole(role: CompanyRole): boolean {
  return role !== CompanyRole.CUSTOMER;
}

// ==================== ROLE HIERARCHY (for cascading checks) ====================

export const ROLE_HIERARCHY_LEVEL: Record<CompanyRole, number> = {
  [CompanyRole.SUPER_ADMIN]: 100,
  [CompanyRole.ADMIN]: 90,
  [CompanyRole.DIRECTOR]: 85,
  [CompanyRole.MANAGER]: 70,
  [CompanyRole.TEAM_LEADER]: 60,
  [CompanyRole.HR]: 75,
  [CompanyRole.ARCHITECT]: 55,
  [CompanyRole.ENGINEER]: 55,
  [CompanyRole.SUPERVISOR]: 50,
  [CompanyRole.ACCOUNTANT]: 45,
  [CompanyRole.SALES]: 40,
  [CompanyRole.PROCUREMENT]: 40,
  [CompanyRole.STAFF]: 30,
  [CompanyRole.WORKER]: 20,
  [CompanyRole.COLLABORATOR]: 15,
  [CompanyRole.CUSTOMER]: 0,
};

export function isRoleHigherOrEqual(
  userRole: CompanyRole,
  targetRole: CompanyRole,
): boolean {
  return (
    (ROLE_HIERARCHY_LEVEL[userRole] ?? 0) >=
    (ROLE_HIERARCHY_LEVEL[targetRole] ?? 0)
  );
}
