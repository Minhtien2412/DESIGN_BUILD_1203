// @ts-nocheck
import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const BASE = (Constants.expoConfig as any)?.extra?.API_URL
  || process.env.EXPO_PUBLIC_API_URL
  || 'https://api.thietkeresort.com.vn';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log để debug
console.log('[API] baseURL =', BASE);

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  body?: any;
  constructor(message: string, status: number, body?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// Axios instance WITHOUT fixed baseURL; we'll resolve per request so env changes apply without rebuild.
export const api: AxiosInstance = axios.create({
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Add API key to requests if available
api.interceptors.request.use((config) => {
  const apiKey = process.env.EXPO_PUBLIC_API_KEY;
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  return config;
});

export interface ApiFetchOptions extends RequestInit {
  method?: HttpMethod;
  token?: string;
  timeoutMs?: number;
  debug?: boolean;
  companyId?: string;
  bypassCache?: boolean;
}

// Throttle map for repeated 404 warnings on muted endpoints
const muted404WarnedAt: Record<string, number> = {};
const WARN_WINDOW_MS = 60_000; // only warn once per endpoint per minute

function fetchWithTimeout(resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 8000, ...init } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resource, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export async function fetchWithRetry(url: string, init?: RequestInit & { timeout?: number }): Promise<Response> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetchWithTimeout(url, { timeout: 8000, ...init });
      if (r.ok) return r;
      // 5xx: wait then retry
      if (r.status >= 500) {
        await new Promise(res => setTimeout(res, (i + 1) * 1000));
      } else {
        throw new Error(`HTTP ${r.status}`);
      }
    } catch (e) {
      // Network error: retry quickly
      await new Promise(res => setTimeout(res, (i + 1) * 800));
    }
  }
  throw new Error("retry_exhausted");
}

async function refreshTokenOnce() {
  const rt = await getItem('refresh_token');
  if (!rt) throw new Error('NO_REFRESH_TOKEN');
  // Use buildApiUrl so prefix (e.g. /api) is automatically respected
  const res = await fetch(buildApiUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || 'Refresh failed');
  const at = body?.access_token;
  if (!at) throw new Error('No access token in refresh response');
  await setItem('access_token', at);
  await setItem('refresh_token', rt);
  return at;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, timeoutMs = AppConfig.TIMEOUT_MS, debug = AppConfig.API_DEBUG, companyId, ...rest } = options;
  
  // Check cache for GET requests
  const cacheKey = `${rest.method || 'GET'}_${path}_${JSON.stringify(rest.body || {})}`;
  if (!rest.method || rest.method === 'GET') {
    const cached = apiCache.get(cacheKey);
    if (cached && !options.bypassCache) {
      if (debug) console.log(`[API][Cache Hit] ${path}`);
      return cached as T;
    }
  }

  // Build URL respecting optional prefix (e.g. /api)
  let url = path.startsWith('http') ? path : buildApiUrl(path);

  // Skip localhost switching when we want to use production API
  const FORCE_PRODUCTION = process.env.EXPO_PUBLIC_ENV === 'production' || 
                          process.env.EXPO_PUBLIC_DISABLE_MOCK_AUTH === 'true';
  
  // In development, only use localhost if explicitly requested
  if (__DEV__ && !path.startsWith('http') && !FORCE_PRODUCTION) {
    const currentBase = getEffectiveApiBase();
    const isProdConfigured = currentBase.includes('api.thietkeresort.com.vn');
    
    if (isProdConfigured && !(global as any).__DEV_LOCALHOST_SWITCH__) {
      console.log('[API][DevMode] 🔄 Switching to localhost to avoid production 503 errors');
      setRuntimeApiBase('http://localhost:3001');
      (global as any).__DEV_LOCALHOST_SWITCH__ = true;
      url = buildApiUrl(path); // Rebuild URL with new base
    }
  }

  if (debug) {
    console.log(`[API] Calling: ${url}`);
  }

  let accessToken = token || (await getItem('access_token'));
  const apiKey = process.env.EXPO_PUBLIC_API_KEY;
  let devSessionId: string | null = null;
  if (__DEV__) {
    devSessionId = await getItem('dev:sessionId');
    if (!devSessionId) {
      devSessionId = 'dev-123';
    }
  }

  // Ensure headers are only added if values are non-empty
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
    ...(__DEV__ ? {} : accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(devSessionId ? { 'x-session-id': devSessionId } : {}),
    ...(companyId ? { 'X-Company-Id': companyId } : {}),
    ...(headers as any),
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const started = Date.now();
  let res: Response;
  try {
    res = await fetchWithRetry(url, {
      ...rest,
      headers: finalHeaders,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(id);
    if (err?.name === 'AbortError') {
      throw new ApiError(`Request timeout after ${timeoutMs}ms`, 0);
    }
    if (err?.message === 'retry_exhausted') {
      // In development, provide more helpful error message
      if (__DEV__) {
        console.warn(`🚨 API Server unavailable: ${url}`);
        console.warn('💡 Consider running: node mock-api-server.js');
        // If we're still pointing at production, attempt local fallback once immediately
        const baseNow = getEffectiveApiBase();
        if (!baseNow.includes('localhost:3001')) {
          try {
            const ok = await fetch('http://localhost:3001/health').then(r => r.ok).catch(() => false);
            if (ok) {
              setRuntimeApiBase('http://localhost:3001');
              console.log('[API][AutoSwitch] Retrying request against local mock server');
              return await apiFetch<T>(path, options); // retry with new base
            }
          } catch {}
        }
        throw new ApiError('Development server not available - try running mock server', 503);
      }
      throw new ApiError('Máy chủ đang bận (503), vui lòng thử lại sau', 503);
    }
    // Handle common development errors more gracefully
    const errorMessage = err?.message || 'Network error';
    if (__DEV__ && (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed'))) {
      throw new ApiError('Development server not available', 0);
    }
    throw new ApiError(errorMessage, 0);
  }
  clearTimeout(id);

  const duration = Date.now() - started;
  const contentType = res?.headers?.get('content-type') || '';
  let body: any = null;
  
  try {
    if (contentType.includes('application/json')) {
      const text = await res.text();
      if (text) {
        body = JSON.parse(text);
      } else {
        body = null;
      }
    } else if (contentType.startsWith('text/')) {
      body = await res.text();
      
      // Check if we got HTML from Swagger UI instead of API data
      if (typeof body === 'string' && body.includes('Swagger UI')) {
        console.warn(`[apiFetch] ⚠️ Got Swagger UI HTML instead of API response for ${path}`);
        console.warn(`[apiFetch] This usually means the API endpoint is not implemented or misconfigured`);
        console.warn(`[apiFetch] URL: ${url}`);
        
        // Don't fallback to mock - throw error to force proper API implementation
        throw new ApiError(
          `Server returned HTML instead of JSON for endpoint: ${path}. Check API server configuration.`,
          500,
          { type: 'swagger_ui_detected', path, url }
        );
      }
    } else if (res.status !== 204) {
      // Try text fallback
      body = await res.text();
      
      // Also check for HTML in non-JSON responses
      if (typeof body === 'string' && body.includes('Swagger UI')) {
        console.warn(`[apiFetch] ⚠️ Got Swagger UI HTML in text response for ${path}`);
        throw new ApiError(
          `Server returned HTML instead of expected content for endpoint: ${path}`,
          500,
          { type: 'swagger_ui_detected', path, url }
        );
      }
    }
  } catch (parseErr) {
    console.warn('[apiFetch] Failed to parse response body:', {
      url,
      status: res.status,
      contentType,
      error: parseErr instanceof Error ? parseErr.message : String(parseErr)
    });
    body = { parseError: String(parseErr) };
  }

  if (debug) {
    console.log('[apiFetch]', { url, status: res.status, duration, ok: res.ok, body });
  }

  if (!res.ok) {
    const message = body?.message || body?.error?.message || body?.error || res.statusText || `HTTP ${res.status}`;
    const shouldSilence404 = res.status === 404 && AppConfig.API_MUTE_404_ENDPOINTS.some((ep: string) => path.startsWith(ep));
    if (shouldSilence404) {
      const last = muted404WarnedAt[path] || 0;
      const now = Date.now();
      const withinWindow = now - last < WARN_WINDOW_MS;
      if (!withinWindow && debug) {
        console.warn('[apiFetch] muted 404', { url, status: res.status });
        muted404WarnedAt[path] = now;
      }
      // Always return empty container for muted 404 endpoints (even if suppression flag off)
      const empty: any = path.includes('contacts') ? { contacts: [] } : path.includes('history') ? { sessions: [] } : {};
      return empty as T;
    } else if (debug) {
      console.warn('[apiFetch] error', { url, status: res.status, body });
    }
    throw new ApiError(String(message), res.status, body);
  }

  // Cache successful GET responses
  if ((!rest.method || rest.method === 'GET') && res.ok) {
    apiCache.set(cacheKey, body);
  }

  return body as T;
}
