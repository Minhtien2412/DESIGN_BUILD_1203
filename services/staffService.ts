/**
 * Staff Service — API calls for HR/Staff management module
 * Follows existing apiFetch pattern from services/api.ts
 */

import { apiFetch } from "@/services/api";
import type {
    Department,
    StaffDetailResponse,
    StaffFormData,
    StaffListParams,
    StaffListResponse,
    StaffMemberFull,
    Team,
} from "@/types/staff";

const BASE = "/api/staff";
const ADMIN_BASE = "/api/admin/staff";

// ==================== STAFF CRUD ====================

export async function getStaffList(
  params: StaffListParams = {},
): Promise<StaffListResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.sort_by) qs.set("sort_by", params.sort_by);
  if (params.sort_dir) qs.set("sort_dir", params.sort_dir);

  const f = params.filters;
  if (f?.search) qs.set("search", f.search);
  if (f?.role) qs.set("role", f.role);
  if (f?.department_id) qs.set("department_id", String(f.department_id));
  if (f?.team_id) qs.set("team_id", String(f.team_id));
  if (f?.status) qs.set("status", f.status);
  if (f?.project_id) qs.set("project_id", String(f.project_id));
  if (f?.is_active !== undefined) qs.set("is_active", String(f.is_active));

  const query = qs.toString();
  const url = query ? `${BASE}?${query}` : BASE;
  return apiFetch(url);
}

export async function getStaffDetail(
  staffId: number,
): Promise<StaffDetailResponse> {
  return apiFetch(`${BASE}/${staffId}`);
}

export async function createStaff(
  data: StaffFormData,
): Promise<StaffMemberFull> {
  return apiFetch(ADMIN_BASE, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateStaff(
  staffId: number,
  data: Partial<StaffFormData>,
): Promise<StaffMemberFull> {
  return apiFetch(`${ADMIN_BASE}/${staffId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function deactivateStaff(
  staffId: number,
): Promise<{ success: boolean }> {
  return apiFetch(`${ADMIN_BASE}/${staffId}/deactivate`, {
    method: "PATCH",
  });
}

export async function updateStaffRole(
  staffId: number,
  role: string,
): Promise<StaffMemberFull> {
  return apiFetch(`${ADMIN_BASE}/${staffId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    headers: { "Content-Type": "application/json" },
  });
}

// ==================== DEPARTMENTS ====================

export async function getDepartments(): Promise<Department[]> {
  const res = await apiFetch("/api/departments");
  return res.departments ?? res;
}

export async function createDepartment(data: {
  name: string;
  description?: string;
  parent_id?: number;
  head_id?: number;
}): Promise<Department> {
  return apiFetch("/api/departments", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateDepartment(
  id: number,
  data: Partial<{
    name: string;
    description?: string;
    head_id?: number;
  }>,
): Promise<Department> {
  return apiFetch(`/api/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// ==================== TEAMS ====================

export async function getTeams(departmentId?: number): Promise<Team[]> {
  const url = departmentId
    ? `/api/teams?department_id=${departmentId}`
    : "/api/teams";
  const res = await apiFetch(url);
  return res.teams ?? res;
}

export async function createTeam(data: {
  name: string;
  description?: string;
  department_id: number;
  leader_id?: number;
}): Promise<Team> {
  return apiFetch("/api/teams", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateTeam(
  id: number,
  data: Partial<{
    name: string;
    description?: string;
    leader_id?: number;
  }>,
): Promise<Team> {
  return apiFetch(`/api/teams/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function addTeamMember(
  teamId: number,
  staffId: number,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/teams/${teamId}/members`, {
    method: "POST",
    body: JSON.stringify({ staff_id: staffId }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function removeTeamMember(
  teamId: number,
  staffId: number,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/teams/${teamId}/members/${staffId}`, {
    method: "DELETE",
  });
}

// ==================== DASHBOARD / STATS ====================

export async function getStaffDashboard(): Promise<{
  total_staff: number;
  active_count: number;
  on_leave_count: number;
  probation_count: number;
  by_department: { department: string; count: number }[];
  by_role: { role: string; count: number }[];
  recent_joins: StaffMemberFull[];
}> {
  return apiFetch(`${BASE}/dashboard`);
}

// ==================== ORG STRUCTURE ====================

export async function getOrgStructure(): Promise<{
  company: { name: string; departments: Department[]; teams: Team[] };
}> {
  return apiFetch(`${BASE}/org-structure`);
}
