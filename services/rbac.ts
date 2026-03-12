import type { PermissionString, Role } from '@/types/auth';
import { getItem, setItem } from '@/utils/storage';

// Default permission catalog (already defined broadly in types/auth.ts PERMISSIONS)
// Here we only wire a practical subset for the UI editor; the server can enforce the full matrix.

export type PermissionGroup = {
  id: string;
  label: string;
  items: { id: PermissionString; label: string }[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'system',
    label: 'Hệ thống',
    items: [
      { id: 'system.admin', label: 'Quản trị hệ thống' },
      { id: 'system.config', label: 'Cấu hình hệ thống' },
      { id: 'system.backup', label: 'Sao lưu và phục hồi' },
    ],
  },
  {
    id: 'user',
    label: 'Người dùng',
    items: [
      { id: 'user.view', label: 'Xem người dùng' },
      { id: 'user.create', label: 'Tạo người dùng' },
      { id: 'user.edit', label: 'Sửa người dùng' },
      { id: 'user.delete', label: 'Xóa người dùng' },
      { id: 'user.assign_role', label: 'Gán vai trò' },
    ],
  },
  {
    id: 'project',
    label: 'Dự án',
    items: [
      { id: 'project.view', label: 'Xem dự án' },
      { id: 'project.create', label: 'Tạo dự án' },
      { id: 'project.edit', label: 'Sửa dự án' },
      { id: 'project.delete', label: 'Xóa dự án' },
      { id: 'project.assign', label: 'Gán thành viên' },
    ],
  },
  {
    id: 'finance',
    label: 'Tài chính',
    items: [
      { id: 'finance.view', label: 'Xem tài chính' },
      { id: 'finance.create_quote', label: 'Tạo báo giá' },
      { id: 'finance.approve_payment', label: 'Duyệt thanh toán' },
      { id: 'finance.view_report', label: 'Xem báo cáo tài chính' },
    ],
  },
];

// Defaults per role (seed) — inspired by Perfex-like roles + our legacy roles
const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionString[]> = {
  SYSTEM_ADMIN: ['system.admin', 'system.config', 'system.backup', 'user.view', 'user.create', 'user.edit', 'user.delete', 'user.assign_role', 'project.view', 'project.create', 'project.edit', 'project.delete', 'project.assign', 'finance.view', 'finance.create_quote', 'finance.approve_payment', 'finance.view_report'],
  COMPANY_ADMIN: ['user.view', 'user.create', 'user.edit', 'project.view', 'project.create', 'project.edit', 'project.delete', 'project.assign', 'finance.view', 'finance.view_report'],
  PROJECT_MANAGER: ['project.view', 'project.create', 'project.edit', 'project.delete', 'project.assign', 'finance.view'],
  TENDER_MANAGER: ['project.view', 'finance.view'],
  CUSTOMER_BIDDER: ['project.view'],
  WORKER: ['project.view'],
  COMPANY_MEMBER: ['project.view'],
  'THO_SON': ['project.view'],
  'THO_CONG': ['project.view'],
  'THO_DA': ['project.view'],
  'THO_LAT_GACH': ['project.view'],
  'THO_THACH_CAO': ['project.view'],
  'THO_DIEN': ['project.view'],
  'THO_NUOC': ['project.view'],
  'THO_LAM_CUA': ['project.view'],
  'THO_BAN_AN': ['project.view'],
  'THO_BAN_CO_DIEN': ['project.view'],
  'THO_BAN_HOC': ['project.view'],
  'THO_BANG_MAU': ['project.view'],
  'THO_PCCC': ['project.view'],
  'THO_TB_BEP': ['project.view'],
  'THO_TB_VS': ['project.view'],
  'THO_SOFA': ['project.view'],
  'THO_CHDV': ['project.view'],
  'THO_DICH_VU': ['project.view'],
  'THO_DICH_VU_THEM': ['project.view'],
  'khach-hang': ['project.view'],
  'nha-thau': ['project.view', 'project.create'],
  'thau-phu': ['project.view'],
  'cong-ty': ['project.view', 'project.create', 'project.assign'],
  'sale-admin': ['user.view', 'project.view'],
  'manager': ['project.view', 'project.edit', 'finance.view'],
  'admin': ['system.admin', 'user.view', 'project.view', 'finance.view'],
};

const STORAGE_KEY = 'rbac:role_overrides';

export type RoleOverrides = Record<Role, PermissionString[]>;

export async function getRoleOverrides(): Promise<RoleOverrides> {
  const raw = await getItem(STORAGE_KEY);
  if (!raw) return {} as RoleOverrides;
  try { return JSON.parse(raw) as RoleOverrides; } catch { return {} as RoleOverrides; }
}

export async function setRoleOverrides(overrides: RoleOverrides): Promise<void> {
  await setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function computePermissionsForRole(role: Role, overrides?: RoleOverrides): PermissionString[] {
  const base = DEFAULT_ROLE_PERMISSIONS[role] || [];
  const custom = overrides?.[role];
  if (!custom) return base;
  // In Perfex style, overrides replace the set selected in UI
  return Array.from(new Set(custom));
}

export async function getEffectivePermissions(role: Role): Promise<PermissionString[]> {
  const overrides = await getRoleOverrides();
  return computePermissionsForRole(role, overrides);
}

export function listAllPermissionIds(): PermissionString[] {
  return Array.from(new Set(PERMISSION_GROUPS.flatMap(g => g.items.map(it => it.id))));
}
