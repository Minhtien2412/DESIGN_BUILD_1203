import { API_BASE, apiFetch } from '@/services/api';

export type NormalizedUserProfile = {
  id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  raw?: any;
};

type RawResponse = any;

function firstString(...vals: Array<unknown>): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v;
  }
  return undefined;
}

function pickAvatar(u: any): string | undefined {
  const url = firstString(
    u?.avatar,
    u?.avatar_url,
    u?.avatarUrl,
    u?.profile_image,
    u?.profileImage,
    u?.photo,
    u?.picture,
    u?.image,
  );
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  // Ensure leading slash
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${path}`;
}

function normalizeUser(raw: any): NormalizedUserProfile {
  const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? {};
  const id = firstString(u?.id, u?.user_id, u?.sub);
  const name = firstString(u?.name, u?.full_name, u?.username);
  const email = firstString(u?.email);
  const phone = firstString(u?.phone, u?.mobile);
  const role = firstString(u?.role, Array.isArray(u?.roles) ? u.roles[0] : undefined);
  const avatar = pickAvatar(u);
  return { id, name, full_name: u?.full_name, email, phone, role, avatar, raw };
}

async function tryEndpoints(token?: string): Promise<RawResponse | null> {
  if (!token) return null;
  const endpoints = ['/api/auth/me', '/auth/me', '/me'];
  for (const p of endpoints) {
    try {
      const res = await apiFetch(p, { method: 'GET', token });
      if (res) return res;
    } catch (e) {
      // Continue to next endpoint
    }
  }
  return null;
}

export async function fetchCurrentProfile(token?: string): Promise<NormalizedUserProfile | null> {
  try {
    const raw = await tryEndpoints(token);
    if (!raw) return null;
    return normalizeUser(raw);
  } catch {
    return null;
  }
}
