import { getItem, setItem } from '@/utils/storage';

export type Role = 'khach-hang' | 'nha-thau' | 'thau-phu' | 'cong-ty' | 'sale-admin' | 'manager' | 'admin';

export type UserRecord = {
  id: string;
  phone: string; // E.164-ish digits only
  name?: string;
  createdAt: number;
  role?: Role;
};

type OtpSession = {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

const USERS_KEY = 'auth:users';
const OTP_KEY = 'auth:otp:sessions';
const DEMO_OTP = '111111';
const isDev: boolean = typeof __DEV__ !== 'undefined' ? __DEV__ : (process?.env?.NODE_ENV === 'development');
const ADMIN_USERNAME = 'administrator';
const ALT_ADMIN_USERNAME = 'admin1';
const SUPPORT_USERNAME = 'cskh1';
const ADMIN_DEFAULT_PASSWORD = 'Nhaxinh@123';
const USER_DEFAULT_PASSWORD = '123456'; // demo default for non-admin users

export function generateUserIdFromSeed(seed: string): string {
  try {
    const s = seed || `${Date.now()}-${Math.random()}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    const base = Math.abs(h).toString(36).slice(0, 8).padEnd(8, '0');
    return `u_${base}`;
  } catch {
    return `u_${Date.now().toString(36)}`;
  }
}

function normalizePhone(input: string): string {
  // keep digits, strip others; optionally handle leading +84/0 to VN format if needed later
  return input.replace(/\D/g, '');
}

async function readUsers(): Promise<UserRecord[]> {
  try {
    const raw = await getItem(USERS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as UserRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: UserRecord[]): Promise<void> {
  await setItem(USERS_KEY, JSON.stringify(users));
}

async function readOtpSessions(): Promise<OtpSession[]> {
  try {
    const raw = await getItem(OTP_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as OtpSession[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeOtpSessions(sessions: OtpSession[]): Promise<void> {
  await setItem(OTP_KEY, JSON.stringify(sessions));
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) || null;
}

// Ensure a user record exists locally (by id or phone). Merge basic fields.
export async function upsertUserRecord(rec: Partial<UserRecord> & { id: string }): Promise<UserRecord> {
  const users = await readUsers();
  const byId = users.find(u => u.id === rec.id);
  if (byId) {
    const merged: UserRecord = {
      ...byId,
      ...rec,
      phone: (rec.phone ?? byId.phone) as string,
      createdAt: byId.createdAt,
    };
    await writeUsers(users.map(u => u.id === byId.id ? merged : u));
    return merged;
  }
  if (rec.phone) {
    const byPhone = users.find(u => u.phone === rec.phone);
    if (byPhone) {
      const merged: UserRecord = {
        ...byPhone,
        ...rec,
        createdAt: byPhone.createdAt,
      };
      await writeUsers(users.map(u => u.id === byPhone.id ? merged : u));
      return merged;
    }
  }
  // Create new
  const now = Date.now();
  const fresh: UserRecord = {
    id: rec.id,
    phone: rec.phone || `acc_${now}`,
    name: rec.name,
    role: rec.role ?? 'khach-hang',
    createdAt: now,
  };
  await writeUsers([fresh, ...users]);
  return fresh;
}

export async function findUserByPhone(phone: string): Promise<UserRecord | null> {
  const p = normalizePhone(phone);
  const users = await readUsers();
  return users.find((u) => u.phone === p) || null;
}

export async function upsertUserByPhone(params: { phone: string; name?: string; role?: Role }): Promise<UserRecord> {
  const phone = normalizePhone(params.phone);
  const users = await readUsers();
  const existing = users.find((u) => u.phone === phone);
  if (existing) {
    // update name if newly provided
    const name = params.name?.trim();
    if (name && name !== existing.name) {
      existing.name = name;
      await writeUsers([...users]);
    }
    return existing;
  }
  const user: UserRecord = {
    id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    phone,
    name: params.name?.trim() || undefined,
    createdAt: Date.now(),
    role: params.role ?? 'khach-hang',
  };
  await writeUsers([user, ...users]);
  return user;
}

export async function requestOtp(phone: string): Promise<{ expiresIn: number; code: string }> {
  const p = normalizePhone(phone);
  if (!p || p.length < 8) throw new Error('Số điện thoại không hợp lệ');
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const ttl = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  const expiresAt = now + ttl;
  const sessions = await readOtpSessions();
  const idx = sessions.findIndex((s) => s.phone === p);
  const next: OtpSession = { phone: p, code, expiresAt, attempts: 0 };
  if (idx >= 0) sessions[idx] = next; else sessions.push(next);
  await writeOtpSessions(sessions);
  // Return code as well for demo (in real app, you'd send via SMS and not return it)
  return { expiresIn: ttl, code };
}

export async function verifyOtp(phone: string, code: string, name?: string, role?: Role): Promise<UserRecord> {
  const p = normalizePhone(phone);
  // Dev backdoor: accept a universal demo OTP to ease local testing
  if (isDev && code === DEMO_OTP) {
    return upsertUserByPhone({ phone: p, name, role });
  }
  const sessions = await readOtpSessions();
  const s = sessions.find((x) => x.phone === p);
  if (!s) throw new Error('OTP không tồn tại, hãy yêu cầu mã mới');
  if (Date.now() > s.expiresAt) throw new Error('OTP đã hết hạn');
  if (s.attempts >= 5) throw new Error('Bạn đã nhập sai quá nhiều lần');
  if (s.code !== code) {
    s.attempts += 1;
    await writeOtpSessions([...sessions]);
    throw new Error('Mã OTP không đúng');
  }
  // success: upsert user
  const user = await upsertUserByPhone({ phone: p, name, role });
  // clear session for this phone
  const remaining = sessions.filter((x) => x.phone !== p);
  await writeOtpSessions(remaining);
  return user;
}

// Admin username/password login (demo purposes only)
export async function adminPasswordLogin(username: string, password: string): Promise<UserRecord> {
  const uname = username.trim().toLowerCase();
  if ((uname !== ADMIN_USERNAME && uname !== ALT_ADMIN_USERNAME) || password !== ADMIN_DEFAULT_PASSWORD) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }
  const users = await readUsers();
  let admin = users.find(u => u.role === 'admin' && (u.phone === ADMIN_USERNAME || u.phone === ALT_ADMIN_USERNAME || (u.name?.toLowerCase() === 'administrator')));
  if (!admin) {
    const phone = uname === ALT_ADMIN_USERNAME ? ALT_ADMIN_USERNAME : ADMIN_USERNAME;
    const name = uname === ALT_ADMIN_USERNAME ? 'Admin 1' : 'Administrator';
    admin = {
      id: 'u_admin',
      phone,
      name,
      role: 'admin',
      createdAt: Date.now(),
    };
    await writeUsers([admin, ...users]);
  }
  return admin;
}

// Demo data & impersonation helpers
export async function seedDemoUsers(): Promise<void> {
  const existing = await readUsers();
  const byPhone = new Set(existing.map(u => u.phone));
  const roles: Role[] = ['khach-hang', 'nha-thau', 'thau-phu', 'cong-ty', 'sale-admin', 'manager'];
  const roleName: Record<Role, string> = {
    'khach-hang': 'Khách hàng',
    'nha-thau': 'Nhà thầu',
    'thau-phu': 'Thầu phụ',
    'cong-ty': 'Công ty',
    'manager': 'Quản lý',
    'sale-admin': 'Sale admin',
    'admin': 'Admin',
  };
  const blockPrefix: Record<Role, string> = {
    'khach-hang': '0901000',
    'nha-thau': '0902000',
    'thau-phu': '0903000',
    'cong-ty': '0904000',
    'manager': '0906000',
    'sale-admin': '0905000',
    'admin': '0000000',
  };
  const letters = 'ABCDEFGHIJ'.split('');
  const toInsert: UserRecord[] = [];
  for (const role of roles) {
    for (let i = 0; i < 10; i++) {
      const phone = `${blockPrefix[role]}${(i + 1).toString().padStart(3, '0')}`;
      if (byPhone.has(phone)) continue;
      toInsert.push({
        id: `u_seed_${role}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        phone,
        name: `${roleName[role]} ${letters[i]}`,
        role,
        createdAt: Date.now(),
      });
      byPhone.add(phone);
    }
  }
  // Ensure default admin record exists as well
  if (!byPhone.has(ADMIN_USERNAME)) {
    toInsert.push({ id: 'u_admin', phone: ADMIN_USERNAME, name: 'Administrator', role: 'admin', createdAt: Date.now() });
  }
  // Ensure alternate admin username exists
  if (!byPhone.has(ALT_ADMIN_USERNAME)) {
    toInsert.push({ id: 'u_admin1', phone: ALT_ADMIN_USERNAME, name: 'Admin 1', role: 'admin', createdAt: Date.now() });
  }
  // Ensure support staff account exists
  if (!byPhone.has(SUPPORT_USERNAME)) {
    toInsert.push({ id: 'u_cskh1', phone: SUPPORT_USERNAME, name: 'CSKH 1', role: 'sale-admin', createdAt: Date.now() });
  }
  // Ensure a dedicated dev test account exists
  const DEV_TEST_PHONE = '0909999999';
  if (!byPhone.has(DEV_TEST_PHONE)) {
    toInsert.push({ id: 'u_dev1', phone: DEV_TEST_PHONE, name: 'Tài khoản thử', role: 'khach-hang', createdAt: Date.now() });
  }
  if (toInsert.length > 0) await writeUsers([...toInsert, ...existing]);
}

export async function listAllUsers(): Promise<UserRecord[]> {
  return await readUsers();
}

export async function demoLoginAs(userId: string): Promise<UserRecord | null> {
  const users = await readUsers();
  const u = users.find(x => x.id === userId) || null;
  return u;
}

// Delete multiple users by id (used for clearing demo users)
export async function deleteUsersById(ids: string[]): Promise<number> {
  if (!ids || ids.length === 0) return 0;
  const set = new Set(ids);
  const users = await readUsers();
  const remaining = users.filter(u => !set.has(u.id));
  const removed = users.length - remaining.length;
  if (removed > 0) await writeUsers(remaining);
  return removed;
}

// Username/password login for non-admin users (demo):
// - Accepts phone number (digits) or display name as account
// - For demo purposes, password is a fixed default for all non-admin users
export async function passwordLogin(account: string, password: string): Promise<UserRecord> {
  const acc = account.trim();
  const byDigits = normalizePhone(acc);
  // Admin/special usernames use ADMIN_DEFAULT_PASSWORD via admin login
  if (acc.toLowerCase() === ADMIN_USERNAME || acc.toLowerCase() === ALT_ADMIN_USERNAME) {
    if (password !== ADMIN_DEFAULT_PASSWORD) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    return adminPasswordLogin(acc, password);
  }
  // Support staff login (sale-admin)
  if (acc.toLowerCase() === SUPPORT_USERNAME) {
    if (password !== ADMIN_DEFAULT_PASSWORD) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    // Find or seed the support user
    const users = await readUsers();
    let u = users.find(x => x.phone === SUPPORT_USERNAME);
    if (!u) {
      u = { id: 'u_cskh1', phone: SUPPORT_USERNAME, name: 'CSKH 1', role: 'sale-admin', createdAt: Date.now() };
      await writeUsers([u, ...users]);
    }
    return u;
  }
  const users = await readUsers();
  let user: UserRecord | undefined;
  if (byDigits) {
    user = users.find(u => u.phone === byDigits && u.role !== 'admin');
  }
  if (!user) {
    const lower = acc.toLowerCase();
    user = users.find(u => (u.name?.toLowerCase() === lower || u.phone === acc) && u.role !== 'admin');
  }
  if (!user) throw new Error('Tài khoản không tồn tại');
  if (password !== USER_DEFAULT_PASSWORD) throw new Error('Mật khẩu không đúng');
  return user;
}

// Demo: ensure a few support staff exist with stable ids/phones
export async function ensureDemoStaff(): Promise<UserRecord[]> {
  const users = await readUsers();
  const want: { id: string; phone: string; name: string; role: Role }[] = [
    { id: 'u_staff_phuong', phone: '091510001', name: 'Phương - Thợ sơn', role: 'sale-admin' },
    { id: 'u_staff_hieu',   phone: '091510002', name: 'Kỹ sư Hiếu',        role: 'sale-admin' },
    { id: 'u_staff_hung',   phone: '091510003', name: 'Võ Văn Hùng',       role: 'sale-admin' },
    { id: 'u_staff_maylanh',phone: '091510004', name: 'Máy lạnh thợ Tiên', role: 'sale-admin' },
    { id: 'u_staff_nguyet', phone: '091510005', name: 'Nguyễn Thị Nguyệt Nữ', role: 'sale-admin' },
  ];
  const byId = new Map(users.map(u => [u.id, u]));
  const byPhone = new Set(users.map(u => u.phone));
  const toAdd: UserRecord[] = [];
  for (const w of want) {
    if (byId.has(w.id) || byPhone.has(w.phone)) continue;
    toAdd.push({ id: w.id, phone: w.phone, name: w.name, role: w.role, createdAt: Date.now() });
  }
  if (toAdd.length > 0) {
    await writeUsers([...toAdd, ...users]);
  }
  return (await readUsers()).filter(u => want.some(w => w.id === u.id));
}

// ============================================================================
// Password Recovery Functions (Stubs)
// These will be implemented when backend support is available
// ============================================================================

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  console.log('[Auth] forgotPassword called for:', email);
  // Stub implementation - will be connected to backend API
  return {
    success: true,
    message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu.',
  };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  console.log('[Auth] resetPassword called with token:', token);
  // Stub implementation - will be connected to backend API
  return {
    success: true,
    message: 'Mật khẩu đã được đặt lại thành công.',
  };
}

export async function validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
  console.log('[Auth] validateResetToken called with token:', token);
  // Stub implementation - will be connected to backend API
  return {
    valid: true,
    email: 'user@example.com',
  };
}
