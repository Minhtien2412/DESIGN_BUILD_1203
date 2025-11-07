import type { Role } from '@/services/auth';
import { getItem, setItem } from '@/utils/storage';

export type PermissionLevel = 'none' | 'view' | 'manage';
export type FeatureKey = 'home' | 'products' | 'live' | 'notifications' | 'profile' | 'cart' | 'admin';

export type RolePermissions = Partial<Record<FeatureKey, PermissionLevel>>;
export type PermissionsMatrix = Record<Role, RolePermissions>;

const PERMISSIONS_KEY = 'permissions:matrix:v1';

const DEFAULT_MATRIX: PermissionsMatrix = {
  'admin': { home: 'manage', products: 'manage', live: 'manage', notifications: 'manage', profile: 'manage', cart: 'manage', admin: 'manage' },
  'sale-admin': { home: 'view', products: 'view', live: 'manage', notifications: 'manage', profile: 'view', cart: 'view', admin: 'none' },
  'manager': { home: 'manage', products: 'manage', live: 'manage', notifications: 'manage', profile: 'view', cart: 'view', admin: 'view' },
  'khach-hang': { home: 'view', products: 'view', live: 'view', notifications: 'view', profile: 'view', cart: 'view', admin: 'none' },
  'nha-thau': { home: 'view', products: 'view', live: 'view', notifications: 'view', profile: 'view', cart: 'view', admin: 'none' },
  'thau-phu': { home: 'view', products: 'view', live: 'view', notifications: 'view', profile: 'view', cart: 'view', admin: 'none' },
  'cong-ty': { home: 'view', products: 'view', live: 'view', notifications: 'view', profile: 'view', cart: 'view', admin: 'none' },
};

export async function getPermissionsMatrix(): Promise<PermissionsMatrix> {
  try {
    const raw = await getItem(PERMISSIONS_KEY);
    if (!raw) return { ...DEFAULT_MATRIX };
    const parsed = JSON.parse(raw) as PermissionsMatrix;
    return { ...DEFAULT_MATRIX, ...parsed };
  } catch {
    return { ...DEFAULT_MATRIX };
  }
}

export async function setPermission(role: Role, feature: FeatureKey, level: PermissionLevel): Promise<void> {
  const matrix = await getPermissionsMatrix();
  const next: PermissionsMatrix = { ...matrix, [role]: { ...matrix[role], [feature]: level } };
  await setItem(PERMISSIONS_KEY, JSON.stringify(next));
}

export async function resetPermissions(): Promise<void> {
  await setItem(PERMISSIONS_KEY, JSON.stringify(DEFAULT_MATRIX));
}

export async function getRolePermissions(role: Role): Promise<RolePermissions> {
  const matrix = await getPermissionsMatrix();
  return matrix[role] ?? {};
}

export function canView(role: Role | undefined, feature: FeatureKey, matrix?: PermissionsMatrix): boolean {
  const r = role ?? 'khach-hang';
  const level = (matrix ? matrix[r]?.[feature] : undefined) ?? DEFAULT_MATRIX[r]?.[feature] ?? 'none';
  return level === 'view' || level === 'manage';
}

export function canManage(role: Role | undefined, feature: FeatureKey, matrix?: PermissionsMatrix): boolean {
  const r = role ?? 'khach-hang';
  const level = (matrix ? matrix[r]?.[feature] : undefined) ?? DEFAULT_MATRIX[r]?.[feature] ?? 'none';
  return level === 'manage';
}
