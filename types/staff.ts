/**
 * Staff / HR Module Type Definitions
 * Quản lý nhân sự nội bộ công ty
 */

// ==================== COMPANY ROLES ====================

export enum CompanyRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  DIRECTOR = "director",
  MANAGER = "manager",
  TEAM_LEADER = "team_leader",
  ARCHITECT = "architect",
  ENGINEER = "engineer",
  SUPERVISOR = "supervisor",
  ACCOUNTANT = "accountant",
  HR = "hr",
  SALES = "sales",
  PROCUREMENT = "procurement",
  STAFF = "staff",
  WORKER = "worker",
  COLLABORATOR = "collaborator",
  CUSTOMER = "customer",
}

export const COMPANY_ROLE_LABELS: Record<CompanyRole, string> = {
  [CompanyRole.SUPER_ADMIN]: "Super Admin",
  [CompanyRole.ADMIN]: "Quản trị viên",
  [CompanyRole.DIRECTOR]: "Giám đốc",
  [CompanyRole.MANAGER]: "Quản lý",
  [CompanyRole.TEAM_LEADER]: "Trưởng nhóm",
  [CompanyRole.ARCHITECT]: "Kiến trúc sư",
  [CompanyRole.ENGINEER]: "Kỹ sư",
  [CompanyRole.SUPERVISOR]: "Giám sát",
  [CompanyRole.ACCOUNTANT]: "Kế toán",
  [CompanyRole.HR]: "Nhân sự",
  [CompanyRole.SALES]: "Kinh doanh",
  [CompanyRole.PROCUREMENT]: "Mua sắm / Thu mua",
  [CompanyRole.STAFF]: "Nhân viên",
  [CompanyRole.WORKER]: "Công nhân",
  [CompanyRole.COLLABORATOR]: "Cộng tác viên",
  [CompanyRole.CUSTOMER]: "Khách hàng",
};

export const COMPANY_ROLE_COLORS: Record<CompanyRole, string> = {
  [CompanyRole.SUPER_ADMIN]: "#DC2626",
  [CompanyRole.ADMIN]: "#EA580C",
  [CompanyRole.DIRECTOR]: "#7C3AED",
  [CompanyRole.MANAGER]: "#2563EB",
  [CompanyRole.TEAM_LEADER]: "#0891B2",
  [CompanyRole.ARCHITECT]: "#059669",
  [CompanyRole.ENGINEER]: "#0D9488",
  [CompanyRole.SUPERVISOR]: "#CA8A04",
  [CompanyRole.ACCOUNTANT]: "#9333EA",
  [CompanyRole.HR]: "#DB2777",
  [CompanyRole.SALES]: "#E11D48",
  [CompanyRole.PROCUREMENT]: "#65A30D",
  [CompanyRole.STAFF]: "#6B7280",
  [CompanyRole.WORKER]: "#78716C",
  [CompanyRole.COLLABORATOR]: "#0EA5E9",
  [CompanyRole.CUSTOMER]: "#A3A3A3",
};

// Roles that are considered internal staff (not customers)
export const INTERNAL_ROLES: CompanyRole[] = [
  CompanyRole.SUPER_ADMIN,
  CompanyRole.ADMIN,
  CompanyRole.DIRECTOR,
  CompanyRole.MANAGER,
  CompanyRole.TEAM_LEADER,
  CompanyRole.ARCHITECT,
  CompanyRole.ENGINEER,
  CompanyRole.SUPERVISOR,
  CompanyRole.ACCOUNTANT,
  CompanyRole.HR,
  CompanyRole.SALES,
  CompanyRole.PROCUREMENT,
  CompanyRole.STAFF,
  CompanyRole.WORKER,
  CompanyRole.COLLABORATOR,
];

// ==================== STAFF STATUS ====================

export enum StaffStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PROBATION = "probation",
  SUSPENDED = "suspended",
  RESIGNED = "resigned",
  ON_LEAVE = "on_leave",
  BUSY = "busy",
  AVAILABLE = "available",
}

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  [StaffStatus.ACTIVE]: "Đang làm việc",
  [StaffStatus.INACTIVE]: "Không hoạt động",
  [StaffStatus.PROBATION]: "Thử việc",
  [StaffStatus.SUSPENDED]: "Tạm ngưng",
  [StaffStatus.RESIGNED]: "Đã nghỉ",
  [StaffStatus.ON_LEAVE]: "Đang nghỉ phép",
  [StaffStatus.BUSY]: "Đang bận",
  [StaffStatus.AVAILABLE]: "Sẵn sàng",
};

export const STAFF_STATUS_COLORS: Record<StaffStatus, string> = {
  [StaffStatus.ACTIVE]: "#10B981",
  [StaffStatus.INACTIVE]: "#6B7280",
  [StaffStatus.PROBATION]: "#F59E0B",
  [StaffStatus.SUSPENDED]: "#EF4444",
  [StaffStatus.RESIGNED]: "#9CA3AF",
  [StaffStatus.ON_LEAVE]: "#8B5CF6",
  [StaffStatus.BUSY]: "#F97316",
  [StaffStatus.AVAILABLE]: "#0D9488",
};

// ==================== DEPARTMENT ====================

export interface Department {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  head_id?: number | null; // Staff ID of department head
  head?: StaffSummary | null;
  total_staff: number;
  created_at: string;
  updated_at?: string;
}

// ==================== TEAM ====================

export interface Team {
  id: number;
  name: string;
  description?: string;
  department_id: number;
  department?: Department;
  leader_id?: number | null;
  leader?: StaffSummary | null;
  members: StaffSummary[];
  total_members: number;
  created_at: string;
  updated_at?: string;
}

// ==================== STAFF ====================

export interface StaffSummary {
  id: number;
  staff_code: string;
  full_name: string;
  avatar?: string | null;
  role: CompanyRole;
  status: StaffStatus;
  department_name?: string;
  team_name?: string;
}

export interface StaffMemberFull {
  id: number;
  user_id?: number;
  staff_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string | null;

  // Role & position
  role: CompanyRole;
  job_title?: string;
  department_id?: number | null;
  department?: Department | null;
  team_id?: number | null;
  team?: Team | null;

  // Manager relationship
  manager_id?: number | null;
  manager?: StaffSummary | null;

  // Status
  status: StaffStatus;
  is_active: boolean;

  // Skills
  skills?: string[];
  specializations?: string[];

  // Projects
  current_projects?: StaffProjectRef[];

  // Activity
  last_login?: string;
  last_activity?: string;

  // Timestamps
  join_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface StaffProjectRef {
  id: number;
  name: string;
  role_in_project?: string;
  status?: string;
}

// ==================== FILTERS ====================

export interface StaffFilters {
  search?: string;
  role?: CompanyRole;
  department_id?: number;
  team_id?: number;
  status?: StaffStatus;
  project_id?: number;
  is_active?: boolean;
}

export type StaffSortField =
  | "full_name"
  | "created_at"
  | "role"
  | "last_activity";
export type SortDirection = "asc" | "desc";

export interface StaffListParams {
  page?: number;
  limit?: number;
  filters?: StaffFilters;
  sort_by?: StaffSortField;
  sort_dir?: SortDirection;
}

// ==================== FORM ====================

export interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: CompanyRole;
  job_title?: string;
  department_id?: number | null;
  team_id?: number | null;
  manager_id?: number | null;
  status: StaffStatus;
  skills?: string[];
  avatar?: string | null;
}

// ==================== API RESPONSES ====================

export interface StaffListResponse {
  staff: StaffMemberFull[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface StaffDetailResponse {
  staff: StaffMemberFull;
  activity_log?: StaffActivityEntry[];
  reports?: StaffReportRef[];
}

export interface StaffActivityEntry {
  id: number;
  type: string;
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface StaffReportRef {
  id: number;
  title: string;
  type: string;
  submitted_at: string;
  status?: string;
}

// ==================== ORG STRUCTURE ====================

export interface OrgNode {
  id: number;
  name: string;
  type: "company" | "department" | "team" | "member";
  head?: StaffSummary;
  children?: OrgNode[];
  total_members?: number;
}
