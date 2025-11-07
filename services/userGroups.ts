import type { Role, UserRecord } from '@/services/auth';
import { getItem, setItem } from '@/utils/storage';

export type Permission =
  | 'view_content'
  | 'comment'
  | 'create_post'
  | 'upload_media'
  | 'start_live'
  | 'moderate_comments'
  | 'manage_orders'
  | 'manage_products'
  | 'manage_users'
  | 'view_bidding'
  | 'create_bidding'
  | 'manage_bidding'
  | 'admin_all';

export type Group = {
  id: string; // slug/id, unique
  slug: string; // same as id
  name: string;
  description?: string;
  permissions: Permission[];
};

const GROUPS_KEY = 'rbac:groups:v1';
const MEMBERS_KEY = 'rbac:members:v1'; // map: userId -> string[] groupIds

async function readGroups(): Promise<Group[]> {
  try {
    const raw = await getItem(GROUPS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Group[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeGroups(groups: Group[]) {
  await setItem(GROUPS_KEY, JSON.stringify(groups));
}

async function readMembers(): Promise<Record<string, string[]>> {
  try {
    const raw = await getItem(MEMBERS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as Record<string, string[]>;
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

async function writeMembers(map: Record<string, string[]>) {
  await setItem(MEMBERS_KEY, JSON.stringify(map));
}

export async function listGroups(): Promise<Group[]> {
  return await readGroups();
}

export async function getGroupById(id: string): Promise<Group | null> {
  const groups = await readGroups();
  return groups.find(g => g.id === id) || null;
}

export async function createGroup(group: Group): Promise<Group> {
  const groups = await readGroups();
  if (groups.some(g => g.id === group.id)) throw new Error('Group id already exists');
  const next = [group, ...groups];
  await writeGroups(next);
  return group;
}

export async function updateGroup(id: string, patch: Partial<Group>): Promise<Group | null> {
  const groups = await readGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx < 0) return null;
  const updated: Group = { ...groups[idx], ...patch, id: groups[idx].id, slug: groups[idx].slug };
  const next = [...groups];
  next[idx] = updated;
  await writeGroups(next);
  return updated;
}

export async function deleteGroup(id: string): Promise<boolean> {
  const groups = await readGroups();
  const next = groups.filter(g => g.id !== id);
  if (next.length === groups.length) return false;
  await writeGroups(next);
  // remove from memberships
  const map = await readMembers();
  const cleaned: Record<string, string[]> = {};
  for (const [uid, gids] of Object.entries(map)) {
    const remain = (gids || []).filter(gid => gid !== id);
    if (remain.length > 0) cleaned[uid] = remain;
  }
  await writeMembers(cleaned);
  return true;
}

export async function addUserToGroup(userId: string, groupId: string): Promise<void> {
  const map = await readMembers();
  const list = map[userId] ?? [];
  if (!list.includes(groupId)) list.push(groupId);
  map[userId] = list;
  await writeMembers(map);
}

export async function removeUserFromGroup(userId: string, groupId: string): Promise<void> {
  const map = await readMembers();
  const list = map[userId] ?? [];
  map[userId] = list.filter(id => id !== groupId);
  await writeMembers(map);
}

export async function listUserGroups(userId: string): Promise<Group[]> {
  const [groups, map] = await Promise.all([readGroups(), readMembers()]);
  const ids = new Set(map[userId] ?? []);
  return groups.filter(g => ids.has(g.id));
}

export async function isUserInGroup(userId: string, groupId: string): Promise<boolean> {
  const map = await readMembers();
  return (map[userId] ?? []).includes(groupId);
}

export async function userPermissions(userId: string): Promise<Permission[]> {
  const [groups, userGroups] = await Promise.all([readGroups(), listUserGroups(userId)]);
  const perms = new Set<Permission>();
  for (const g of userGroups) {
    for (const p of g.permissions) perms.add(p);
  }
  return Array.from(perms);
}

export async function hasPermission(userId: string, perm: Permission): Promise<boolean> {
  const perms = await userPermissions(userId);
  return perms.includes('admin_all') || perms.includes(perm);
}

export async function hasAnyPermission(userId: string, perms: Permission[]): Promise<boolean> {
  const u = await userPermissions(userId);
  if (u.includes('admin_all')) return true;
  return perms.some(p => u.includes(p));
}

export async function hasAllPermissions(userId: string, perms: Permission[]): Promise<boolean> {
  const u = await userPermissions(userId);
  if (u.includes('admin_all')) return true;
  return perms.every(p => u.includes(p));
}

// Defaults derived from Role
function defaultPermissionsForRole(role: Role | undefined): Permission[] {
  switch (role) {
    case 'admin':
      return ['admin_all'];
    case 'manager':
      return ['manage_users', 'manage_orders', 'manage_products', 'manage_bidding', 'moderate_comments', 'view_content', 'comment'];
    case 'sale-admin':
      return ['manage_orders', 'manage_products', 'view_bidding', 'moderate_comments', 'view_content', 'comment'];
    case 'cong-ty':
      return ['view_content', 'comment', 'create_post', 'upload_media', 'start_live', 'create_bidding'];
    case 'nha-thau':
    case 'thau-phu':
      return ['view_content', 'comment', 'create_post', 'upload_media', 'create_bidding'];
    case 'khach-hang':
    default:
      return ['view_content', 'comment', 'view_bidding'];
  }
}

export async function ensureDefaultGroups(): Promise<void> {
  const defaults: Group[] = [
    { id: 'khach-hang', slug: 'khach-hang', name: 'Khách hàng', permissions: defaultPermissionsForRole('khach-hang') },
    { id: 'nha-thau', slug: 'nha-thau', name: 'Nhà thầu', permissions: defaultPermissionsForRole('nha-thau') },
    { id: 'thau-phu', slug: 'thau-phu', name: 'Thầu phụ', permissions: defaultPermissionsForRole('thau-phu') },
    { id: 'cong-ty', slug: 'cong-ty', name: 'Công ty', permissions: defaultPermissionsForRole('cong-ty') },
    { id: 'manager', slug: 'manager', name: 'Quản lý', permissions: defaultPermissionsForRole('manager') },
    { id: 'sale-admin', slug: 'sale-admin', name: 'Sale admin', permissions: defaultPermissionsForRole('sale-admin') },
    { id: 'admin', slug: 'admin', name: 'Admin', permissions: defaultPermissionsForRole('admin') },
  ];
  const existing = await readGroups();
  const have = new Set(existing.map(g => g.id));
  const toAdd = defaults.filter(d => !have.has(d.id));
  if (toAdd.length > 0) await writeGroups([...toAdd, ...existing]);
}

export async function syncUsersToDefaultGroups(users: UserRecord[]): Promise<void> {
  const groups = await readGroups();
  const groupIds = new Set(groups.map(g => g.id));
  const map = await readMembers();
  let changed = false;
  for (const u of users) {
    const gid = u.role || 'khach-hang';
    if (!groupIds.has(gid)) continue;
    const list = map[u.id] ?? [];
    if (!list.includes(gid)) {
      map[u.id] = [...list, gid];
      changed = true;
    }
  }
  if (changed) await writeMembers(map);
}
