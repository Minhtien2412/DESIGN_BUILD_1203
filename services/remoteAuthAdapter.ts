import { serverFetch } from '@/services/serverClient';

// Adapter for external production API if its response shape differs from local Node server.
// Normalizes into { success, data: { token, user } } shape.

interface ExternalLoginResponse {
  token?: string;
  access_token?: string;
  data?: any;
  user?: any;
  success?: boolean;
  [k: string]: any;
}

export interface NormalizedAuthResult {
  success: boolean;
  token?: string;
  user?: { id: string; name?: string; email?: string; phone?: string; role?: string };
  message?: string;
}

function normalizeAuth(raw: ExternalLoginResponse): NormalizedAuthResult {
  if (!raw) return { success: false, message: 'Empty response' };
  const token = raw.token || raw.access_token || raw.data?.token;
  const user = raw.user || raw.data?.user || raw.data;
  return {
    success: raw.success !== false && !!token,
    token,
    user: user ? {
      id: user.id || user.user_id || user.uid || 'unknown',
      name: user.name || user.full_name || user.username || user.email,
      email: user.email,
      phone: user.phone || user.mobile,
      role: user.role || user.type || user.level
    } : undefined,
    message: raw.message || raw.error || undefined
  };
}

export async function externalLogin(account: string, password: string): Promise<NormalizedAuthResult> {
  const res = await serverFetch<ExternalLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ account, password })
  });
  return normalizeAuth(res);
}

export async function externalRegister(params: { email?: string; phone?: string; password: string; name?: string }): Promise<NormalizedAuthResult> {
  const res = await serverFetch<ExternalLoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params)
  });
  return normalizeAuth(res);
}
