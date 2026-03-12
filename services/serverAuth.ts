import { serverFetch } from '@/services/serverClient';
import { getCaptchaToken, getDeviceFingerprint } from '@/utils/deviceFingerprint';

export type ServerAuthUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type ServerAuthResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: ServerAuthUser;
  security?: {
    riskLevel: string;
    suspiciousActivities: number;
    deviceRecognized: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

// Helper: try the given path, and on 404/405 automatically retry with '/api' prefix once.
async function fetchWithApiPrefixFallback<T>(path: string, opts: any): Promise<T> {
  try {
    return await serverFetch<T>(path, opts);
  } catch (e: any) {
    const status = e?.status ?? e?.code;
    const is404or405 = status === 404 || status === 405;
    const hasApiPrefix = path.startsWith('/api/');
    if (is404or405 && !hasApiPrefix) {
      const alt = path.startsWith('/') ? `/api${path}` : `/api/${path}`;
      return await serverFetch<T>(alt, opts);
    }
    throw e;
  }
}

export async function serverRegister(params: { name?: string; email?: string; phone?: string; password: string }): Promise<ServerAuthResponse> {
  const deviceInfo = getDeviceFingerprint();
  const captchaToken = await getCaptchaToken();

  return await fetchWithApiPrefixFallback<ServerAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...params,
      captchaToken,
      deviceId: deviceInfo.deviceId
    }),
    headers: {
      'X-Device-Id': deviceInfo.deviceId,
      'Screen-Resolution': deviceInfo.screenResolution,
      'Timezone': deviceInfo.timezone
    }
  });
}

export async function serverLogin(params: { account: string; password: string; captchaToken?: string; ttlDays?: number }): Promise<ServerAuthResponse> {
  const deviceInfo = getDeviceFingerprint();
  const captchaToken = params.captchaToken || await getCaptchaToken();

  return await fetchWithApiPrefixFallback<ServerAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      ...params,
      captchaToken
    }),
    headers: {
      'X-Device-Id': deviceInfo.deviceId,
      'Screen-Resolution': deviceInfo.screenResolution,
      'Timezone': deviceInfo.timezone
    }
  });
}

export async function serverMe(token: string): Promise<ServerAuthUser> {
  return await fetchWithApiPrefixFallback<ServerAuthUser>('/auth/me', { method: 'GET', token });
}

export async function serverLogout(token: string): Promise<{ success: boolean }>{
  return await fetchWithApiPrefixFallback<{ success: boolean }>('/auth/logout', { method: 'POST', token });
}

export async function serverCheckAccount(account: string): Promise<{ exists: boolean }>{
  const q = encodeURIComponent(account);
  const res = await fetchWithApiPrefixFallback<{ success: boolean; data?: { exists: boolean } }>(`/auth/exists?account=${q}`, { method: 'GET' });
  return { exists: !!res?.data?.exists };
}
