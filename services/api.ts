// API base default (production). Can be overridden by EXPO_PUBLIC_API_BASE_URL for local/dev runs.
// Backend: Fastify on 127.0.0.1:4000, public via Nginx at https://api.thietkeresort.com.vn
import ENV from '@/config/env';
import { Platform } from 'react-native';

function normalizeBaseUrl(base: string) {
  try {
    const url = new URL(base);
    // Android emulator cannot reach localhost on host machine
    if (
      Platform.OS === 'android' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    ) {
      url.hostname = '10.0.2.2';
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    // Fallback for non-URL strings
    if (
      Platform.OS === 'android' &&
      (base.includes('localhost') || base.includes('127.0.0.1'))
    ) {
      return base.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2').replace(/\/$/, '');
    }
    return base.replace(/\/$/, '');
  }
}

const API = normalizeBaseUrl(ENV.API_BASE_URL);
const API_PREFIX = ENV.API_PREFIX.replace(/\/$/, '');
export const API_BASE = API;

// API Key management - Initialize from ENV immediately
let apiKey: string | null = ENV.API_KEY;

if (apiKey) {
  console.log('[API] ✅ API key initialized:', apiKey.substring(0, 15) + '...');
} else {
  console.error('[API] ❌ CRITICAL: No API key! Requests will fail!');
}

export const setApiKey = (key: string | null) => { 
  apiKey = key; 
  if (key) {
    console.log('[API] ✅ API key updated:', key.substring(0, 15) + '...');
  }
};
export const getApiKey = () => apiKey;

// Small exported options type used across the codebase. Keep lightweight.
export type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  token?: string;
  data?: any;
};

export class ApiError {
  name: string = 'ApiError';
  message: string;
  status?: number;
  code?: string;
  requestId?: string;
  data?: any;
  stack?: string;
  
  constructor(message: string, opts: any = {}) {
    this.message = message;
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId;
    this.data = opts.data ?? opts.body ?? null;
    
    // Capture stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    } else {
      this.stack = new Error().stack;
    }
  }
}

let authToken: string | null = null;
export const setToken = (t: string | null) => { 
  authToken = t;
  console.log('[API] Token set:', t ? `${t.substring(0, 20)}...` : 'null');
};
export const clearToken = () => { 
  authToken = null;
  console.log('[API] Token cleared');
};
// Friendly alias for clarity at callsites
export const setAuthToken = setToken;

// --- Token refresh machinery (no circular deps) ---
let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

// Optional persistence hook set by other modules (e.g., secure storage)
let persistTokenCallback: ((token: string | null) => void | Promise<void>) | null = null;
export function setTokenPersistor(fn: ((token: string | null) => void | Promise<void>) | null) {
  persistTokenCallback = fn;
}

async function refreshTokenDirect(): Promise<string | null> {
  // Prioritize the configured refresh path, keep safe fallbacks
  const candidates = [
    ENV.AUTH_REFRESH_PATH || '/api/auth/refresh',
    '/auth/refresh',
    `${ENV.AUTH_GOOGLE_PATH || '/auth/google'}/refresh`,
  ];

  for (const path of candidates) {
    try {
      const isAbsolute = /^https?:/i.test(path);
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      const prefixedPath = (!API_PREFIX || normalizedPath.startsWith(API_PREFIX + '/'))
        ? normalizedPath
        : `${API_PREFIX}${normalizedPath}`;
      const url = isAbsolute ? path : `${API}${prefixedPath}`;

      const headers: Record<string, string> = {};
      if (apiKey) headers['X-API-Key'] = apiKey as string;
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`; // some servers require current token for refresh

      console.log('[API] 🔄 Trying token refresh via', url);
      const r = await fetch(url, { method: 'POST', headers });
      if (!r.ok) continue;
      const data = await r.json().catch(() => ({}));
      const newToken = data?.token;
      if (typeof newToken === 'string' && newToken.length > 0) {
        setToken(newToken); // in-memory; persistence handled by callers if needed
        try { await persistTokenCallback?.(newToken); } catch {}
        console.log('[API] ✅ Token refresh succeeded');
        return newToken;
      }
    } catch (e) {
      console.warn('[API] ⚠️ Refresh attempt failed at this endpoint, trying next...', e);
    }
  }
  return null;
}

async function getRefreshedToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise<string | null>((resolve) => refreshWaiters.push(resolve));
  }
  isRefreshing = true;
  try {
    const token = await refreshTokenDirect();
    refreshWaiters.forEach((fn) => fn(token));
    refreshWaiters = [];
    return token;
  } finally {
    isRefreshing = false;
  }
}

async function _parseResponse(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const isAbsolute = /^https?:/i.test(path);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // Avoid double prefix if caller already included '/api'
  const prefixedPath = (!API_PREFIX || normalizedPath.startsWith(API_PREFIX + '/'))
    ? normalizedPath
    : `${API_PREFIX}${normalizedPath}`;
  const url = isAbsolute ? path : `${API}${prefixedPath}`;
  const isForm = (options as any).data instanceof FormData || (options as any).body instanceof FormData;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  // Set JSON content type by default unless we're sending FormData
  if (!isForm && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Add JWT token if available
  const token = (options as any).token || authToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('[API] Sending request with token to:', path);
  } else {
    console.warn('[API] No token available for request to:', path);
  }

  // Add API key if available
  // Backend requires API key for ALL endpoints including auth
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
    const logPath = isAbsolute ? path : prefixedPath;
    console.log('[API] Sending request with API key to:', logPath);
  } else {
    const logPath = isAbsolute ? path : prefixedPath;
    console.log('[API] WARNING: No API key available for request to:', logPath);
  }

  const controller = new AbortController();
  const timeout = options.timeoutMs ?? 10000; // 10 seconds timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const doRequest = async (): Promise<{ res: Response; data: any }> => {
    const body = options.data && !(options.data instanceof FormData)
      ? JSON.stringify(options.data)
      : (options.body ?? options.data);

    const res = await fetch(url, {
      ...options,
      body,
      headers,
      signal: controller.signal,
    } as RequestInit);

    const data = await _parseResponse(res);
    return { res, data };
  };

  try {
    let { res, data } = await doRequest();
    clearTimeout(timeoutId);
    if (!res.ok) {
      // On 401, attempt a single refresh-and-retry if not already retried
      if (res.status === 401 && !(options as any)._retry) {
        const newToken = await getRefreshedToken();
        if (newToken) {
          // update Authorization header for retry
          headers.Authorization = `Bearer ${newToken}`;
          (options as any)._retry = true;
          // restart timeout
          const timeout2 = options.timeoutMs ?? 10000;
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), timeout2);
          try {
            const body2 = options.data && !(options.data instanceof FormData)
              ? JSON.stringify(options.data)
              : (options.body ?? options.data);
            res = await fetch(url, { ...options, body: body2, headers, signal: controller2.signal } as RequestInit);
            clearTimeout(timeoutId2);
            data = await _parseResponse(res);
          } catch (e) {
            clearTimeout(timeoutId2);
            throw e;
          }
          if (res.ok) return data as T;
        }
      }
      // On 429/503/504, attempt one backoff retry if not already retried
      if ((res.status === 429 || res.status === 503 || res.status === 504) && !(options as any)._retryBackoff) {
        (options as any)._retryBackoff = true;
        const retryAfter = Number(res.headers.get('Retry-After'));
        
        // Configurable backoff params via ENV (defaults: base=500ms, jitter=500ms)
        const backoffBaseMs = ENV.BACKOFF_BASE_MS ?? 500;
        const backoffJitterMs = ENV.BACKOFF_JITTER_MS ?? 500;
        
        const delayMs = Number.isFinite(retryAfter) && retryAfter! > 0
          ? retryAfter! * 1000
          : backoffBaseMs + Math.floor(Math.random() * backoffJitterMs);
        
        await new Promise(r => setTimeout(r, delayMs));
        // restart timeout
        const timeout2 = options.timeoutMs ?? 10000;
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), timeout2);
        try {
          const body2 = options.data && !(options.data instanceof FormData)
            ? JSON.stringify(options.data)
            : (options.body ?? options.data);
          const res2 = await fetch(url, { ...options, body: body2, headers, signal: controller2.signal } as RequestInit);
          clearTimeout(timeoutId2);
          const data2 = await _parseResponse(res2);
          if (res2.ok) return data2 as T;
        } catch (e) {
          clearTimeout(timeoutId2);
          // fallthrough to throw below
        }
      }
      throw new ApiError(typeof data === 'string' ? data : (data?.message || `HTTP ${res.status}`), { status: res.status, data });
    }
    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err && err.name === 'AbortError') throw new ApiError('Kết nối quá chậm', { code: 'TIMEOUT' });
    throw new ApiError('Lỗi kết nối', { code: 'NETWORK_ERROR' });
  }
}

export const get = <T = any>(path: string, params?: Record<string, any>) => {
  const url = params ? `${path}?${new URLSearchParams(params)}` : path;
  return apiFetch<T>(url, { method: 'GET' });
};

export const post = <T = any>(path: string, data?: any) => apiFetch<T>(path, { method: 'POST', data });
export const put = <T = any>(path: string, data?: any) => apiFetch<T>(path, { method: 'PUT', data });
export const patch = <T = any>(path: string, data?: any) => apiFetch<T>(path, { method: 'PATCH', data });
export const del = <T = any>(path: string) => apiFetch<T>(path, { method: 'DELETE' });

export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500) throw new Error(`Client error: ${res.status}`);
      if (attempt === retries) throw new Error(`HTTP Error: ${res.status} after ${retries} attempts`);
    } catch (e) {
      if (attempt === retries) throw e;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

export const healthCheck = () => get('/health');

export const api = {
  get,
  post,
  put,
  patch,
  del,
  request: apiFetch,
  fetchWithRetry,
  healthCheck,
};

export interface ImageLabel {
  description?: string;
  score?: number;
}

export interface ImageAnalysisResponse {
  success: boolean;
  labels?: ImageLabel[];
  error?: string;
}

export async function analyzeImageLabels(imageData: string): Promise<ImageAnalysisResponse> {
  return post('/v1/images/analyze', { image: imageData });
}

// Keep the minimal functions the user requested as convenience wrappers
export async function getConfig() {
  const r = await fetch(`${API}/config`, { cache: 'no-store' });
  if (!r.ok) throw new Error('config failed');
  return r.json();
}

export async function getHealth() {
  const r = await fetch(`${API}/health`);
  return r.json();
}

export async function getVideos(limit = 100) {
  const r = await fetch(`${API}/videos?limit=${limit}`);
  if (!r.ok) throw new Error('videos failed');
  return r.json();
}

export async function createRoomToken(name: string) {
  const r = await fetch(`${API}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error('token failed');
  return r.json();
}

// Convenience helpers per user's request
export async function login(username: string, password: string) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { token, user }
}

export async function listCustomers(token: string, search = '', page = 1, pageSize = 20) {
  const qs = new URLSearchParams({ search, page: String(page), pageSize: String(pageSize) });
  const r = await fetch(`${API}/customers?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { page, pageSize, total, items }
}
