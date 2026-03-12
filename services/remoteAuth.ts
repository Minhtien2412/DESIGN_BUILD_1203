import { apiFetch } from '@/services/api';

export interface RemoteLoginResponse {
  success: boolean;
  data?: {
    token?: string;
    user?: any;
  };
  error?: { code: string; message: string };
}

type RemoteAuthParams = {
  name?: string;
  email?: string;
  phone?: string;
  password: string;
};

type RawAuthResponse = {
  success?: boolean;
  data?: any;
  access_token?: string;
  token?: string;
  user?: any;
  message?: string;
  error?: { code?: string; message?: string };
};

const AUTH_PREFIX = '/api/auth';

const normalizePayload = (body: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Record<string, string>;

const extractTokenFrom = (raw: RawAuthResponse): { token?: string; user?: any } => {
  if (!raw) return {};
  const payload = raw.data && typeof raw.data === 'object' ? raw.data : {};
  const nested = payload.data && typeof payload.data === 'object' ? payload.data : {};
  const token =
    payload.access_token ??
    payload.token ??
    payload.accessToken ??
    nested.access_token ??
    nested.token ??
    nested.accessToken ??
    raw.access_token ??
    raw.token ??
    payload.jwt ??
    nested.jwt ??
    raw.user?.access_token ??
    undefined;
  const user = payload.user ?? nested.user ?? raw.user ?? (typeof nested === 'object' && !Array.isArray(nested) ? nested.user : undefined);
  return { token, user };
};

const normalizeResponse = (raw: RawAuthResponse): RemoteLoginResponse => {
  if (!raw) {
    return { success: false, error: { code: 'EMPTY_RESPONSE', message: 'Máy chủ không trả dữ liệu' } };
  }

  if (raw.success === false) {
    const message = raw.error?.message || raw.message || 'Yêu cầu thất bại';
    return { success: false, error: { code: raw.error?.code || 'REMOTE_ERROR', message } };
  }

  const { token, user } = extractTokenFrom(raw);
  if (token) {
    return { success: true, data: { token, user } };
  }

  return {
    success: false,
    error: {
      code: raw.error?.code || 'MISSING_TOKEN',
      message: raw.error?.message || raw.message || 'Máy chủ không trả về token đăng nhập',
    },
  };
};

const sanitizeAccount = (account: string) => account.trim();

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const normalizePhone = (value?: string) => (value ? value.replace(/[^0-9+]/g, '') : undefined);

export async function remoteLogin(account: string, password: string): Promise<RemoteLoginResponse> {
  try {
    const normalizedAccount = sanitizeAccount(account);
    const phoneCandidate = normalizePhone(normalizedAccount);

    const body = normalizePayload({
      account: normalizedAccount,
      email: isEmail(normalizedAccount) ? normalizedAccount : undefined,
      phone: !isEmail(normalizedAccount) ? phoneCandidate : undefined,
      password,
    });

    const res: RawAuthResponse = await apiFetch(`${AUTH_PREFIX}/login`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    return normalizeResponse(res);
  } catch (e: any) {
    const message = e?.message || 'Network error';
    return { success: false, error: { code: e?.code || 'NETWORK', message } };
  }
}

export async function remoteRegister(params: RemoteAuthParams): Promise<RemoteLoginResponse> {
  try {
    const normalizedPhone = normalizePhone(params.phone);
    const primaryAccount = params.email || normalizedPhone;
    const body = normalizePayload({
      account: primaryAccount,
      email: params.email,
      phone: normalizedPhone,
      full_name: params.name,
      name: params.name,
      password: params.password,
      password_confirmation: params.password,
    });

    const res: RawAuthResponse = await apiFetch(`${AUTH_PREFIX}/register`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    return normalizeResponse(res);
  } catch (e: any) {
    const message = e?.message || 'Network error';
    return { success: false, error: { code: e?.code || 'NETWORK', message } };
  }
}

export type RemoteMeResponse = {
  success: boolean;
  data?: any;
  error?: { code?: string; message?: string };
};

export async function remoteMe(token?: string): Promise<RemoteMeResponse> {
  if (!token) return { success: false, error: { code: 'NO_TOKEN', message: 'Missing token' } };
  try {
    const res: RawAuthResponse = await apiFetch(`${AUTH_PREFIX}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      token,
    });
    if (res?.success === false) {
      return { success: false, error: { code: res?.error?.code || 'REMOTE_ERROR', message: res?.error?.message || res?.message || 'Yêu cầu thất bại' } };
    }
    return { success: true, data: res?.data ?? res?.user ?? res };
  } catch (e: any) {
    return { success: false, error: { code: e?.code || 'NETWORK', message: e?.message || 'Network error' } };
  }
}

// Helper toggles to decide using remote vs local demo
export const useRemoteAuth = () => process.env.EXPO_PUBLIC_REMOTE_AUTH === '1';

export type PhpAuthResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id?: string;
    username?: string;
    email?: string;
  };
};

export async function phpRegister(params: { username: string; email: string; password: string }): Promise<PhpAuthResponse> {
  return await apiFetch<PhpAuthResponse>('/register.php', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function phpLogin(params: { account: string; password: string }): Promise<PhpAuthResponse> {
  // Expected backend: accepts either username or email as `account`
  return await apiFetch<PhpAuthResponse>('/login.php', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
