import { deleteUsersById, listAllUsers, Role, upsertUserByPhone, UserRecord } from '@/services/auth';

export type DemoGroup = {
  role: Role;
  count: number; // 5–7 per group
};

const GROUPS: DemoGroup[] = [
  { role: 'khach-hang', count: 6 },
  { role: 'nha-thau', count: 6 },
  { role: 'thau-phu', count: 6 },
  { role: 'cong-ty', count: 6 },
  { role: 'sale-admin', count: 5 },
];

const PREFIX: Record<Role, string> = {
  'khach-hang': '0911000',
  'nha-thau': '0912000',
  'thau-phu': '0913000',
  'cong-ty': '0914000',
  'sale-admin': '0915000',
  'manager': '0916000',
  'admin': '0000000',
};

const VI_NAMES = [
  'An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hân', 'Hòa', 'Hùng',
  'Khanh', 'Lan', 'Linh', 'Long', 'Minh', 'My', 'Nam', 'Nga', 'Ngọc', 'Nhi',
  'Phong', 'Phúc', 'Phương', 'Quang', 'Quỳnh', 'Sơn', 'Thảo', 'Thành', 'Thắng', 'Trang',
];

function pickName(i: number) {
  return VI_NAMES[i % VI_NAMES.length];
}

export async function generateDemoUsers(): Promise<UserRecord[]> {
  const existing = await listAllUsers();
  const byPhone = new Set(existing.map(u => u.phone));
  const created: UserRecord[] = [];
  for (const g of GROUPS) {
    for (let i = 0; i < g.count; i++) {
      const phone = `${PREFIX[g.role]}${(i + 1).toString().padStart(3, '0')}`;
      if (byPhone.has(phone)) continue;
      const name = `${g.role.replace('-', ' ')} ${pickName(i)}`;
      const user = await upsertUserByPhone({ phone, name, role: g.role });
      created.push(user);
      byPhone.add(phone);
    }
  }
  return created;
}

export async function listDemoUsersByGroup(): Promise<Record<Role, UserRecord[]>> {
  const all = await listAllUsers();
  const groups: Record<Role, UserRecord[]> = {
    'khach-hang': [], 'nha-thau': [], 'thau-phu': [], 'cong-ty': [], 'sale-admin': [], 'manager': [], 'admin': [],
  };
  for (const u of all) {
    if (u.role && groups[u.role]) groups[u.role].push(u);
  }
  return groups;
}

export async function clearDemoUsers(): Promise<number> {
  const groups = await listDemoUsersByGroup();
  const demoIds: string[] = [];
  for (const role of Object.keys(groups) as Role[]) {
    if (role === 'admin') continue; // keep admin
    // Heuristic: our demo users have phone prefix in PREFIX
    const prefix = PREFIX[role];
    for (const u of groups[role]) {
      if (u.phone.startsWith(prefix)) demoIds.push(u.id);
    }
  }
  return deleteUsersById(demoIds);
}
