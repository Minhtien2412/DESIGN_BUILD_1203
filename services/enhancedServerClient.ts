import { AppConfig, buildApiUrl } from '@/config';
import { ApiError } from '@/services/api';
import { getItem } from '@/utils/storage';
import { Platform } from 'react-native';
import { apiKeyManager } from './apiKeyManager';

/**
 * Enhanced serverFetch with API Key support for production backend
 */
const warnedPaths = new Set<string>();
let lastWarnedNoKeyAt = 0;

// Metrics: track suppressed network errors & endpoints used for heuristic fallbacks
const silentNetworkStats = {
  suppressedCount: 0,
  lastEndpoint: '' as string,
  endpoints: [] as string[],
  lastAt: 0,
};

export function getSilentNetworkStats() {
  return { ...silentNetworkStats };
}
export async function serverFetch<T>(path: string, options: any = {}): Promise<T> {
  const { token, headers, timeoutMs = AppConfig.TIMEOUT_MS, debug = AppConfig.API_DEBUG, method = 'GET', ...rest } = options as any;
  // Attach dev session id if present (created via /dev/session)
  let devSessionId = await getItem('dev:sessionId');
  if (__DEV__ && !devSessionId) {
    devSessionId = 'dev-123'; // Default dev session for testing
  }
  
  // Determine base URL based on environment
  const isAbsolute = /^https?:/i.test(path);
  const isDevEnv = __DEV__ || AppConfig.NODE_API_BASE_URL?.includes('localhost');
  let url: string;
  let baseCandidates: string[] = [];
  let resolvedUrl: string | undefined;
    if (isAbsolute) {
      resolvedUrl = path;
    } else if (isDevEnv) {
      // Use unified API service baseURL instead of separate configuration
  const apiModule = await import('./api');
  const candidate = ((apiModule as any)?.API_BASE) || ((apiModule as any)?.BASE) || undefined;
      if (candidate) baseCandidates.push(candidate);
      // Deduplicate
      baseCandidates = [...new Set(baseCandidates)];
    } else {
    resolvedUrl = buildApiUrl(path);
  }

  const isGet = (method || 'GET').toUpperCase() === 'GET';
  const maxAttempts = isGet ? 3 : 1;
  let lastError: any;

  // Get API key for production requests
  const apiHeaders = apiKeyManager.getApiHeaders();
  // Determine if API key is strictly required.
  // In debug / development we allow calls even if production base URL is used (to simplify local testing when backend key system not ready).
  const strictProd = apiKeyManager.isApiKeyRequired();
  const isAuthOpen = path.includes('/auth/login') || path.includes('/auth/register');
  const allowByDebugFlag = debug || __DEV__;
  const requiresApiKey = strictProd && !isAuthOpen && !allowByDebugFlag;

  // We may iterate over baseCandidates (dev) and within each attempt basic retry logic
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const started = Date.now();
    let res: Response;
    // If we have multiple base candidates (dev) pick by attempt if previous attempts failed due to network
    if (!isAbsolute && baseCandidates.length > 0) {
      const idx = Math.min(attempt, baseCandidates.length - 1);
      const base = baseCandidates[idx];
      resolvedUrl = `${base}${path.startsWith('/') ? path : '/' + path}`;
    }
  // Use unified API_BASE instead of separate config
  const apiModule2 = await import('./api');
  const API_BASE = ((apiModule2 as any)?.API_BASE) || ((apiModule2 as any)?.BASE) || '';
  const url = resolvedUrl || `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;

    try {
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-App-Version': (AppConfig as any).APP_VERSION || '1.0.0',
        'X-Platform': Platform.OS,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(devSessionId ? { 'X-Session-Id': devSessionId } : {}),
        ...apiHeaders, // Add API key headers
        ...(headers || {}),
      };

      // Enforce API key only when strictly required. Otherwise log a soft warning once.
      if (requiresApiKey && !apiHeaders['X-API-Key']) {
        throw new ApiError('API key required for production requests', { status: 401 });
      } else if (strictProd && !apiHeaders['X-API-Key'] && !isAuthOpen && allowByDebugFlag) {
        if (!AppConfig.SUPPRESS_KEY_WARN) {
          const now = Date.now();
            if (!warnedPaths.has(path) || now - lastWarnedNoKeyAt > 10000) {
              console.warn('[serverFetch] Proceeding without API key (debug override) path=', path);
              warnedPaths.add(path);
              lastWarnedNoKeyAt = now;
            }
        }
      }

      // Dynamically import fetchWithRetry to avoid circular-init/runtime
      // issues where the named import may be undefined in some bundler states.
      const apiModule = await import('./api');
      const fetchWithRetryFn: (url: string, options?: RequestInit, retries?: number) => Promise<Response> =
        (apiModule && (apiModule.fetchWithRetry as any)) || (async (u: string, opts?: RequestInit) => fetch(u, opts));

      res = await fetchWithRetryFn(url, {
        method,
        headers: requestHeaders,
        signal: controller.signal,
        ...rest,
      });
    } catch (err: any) {
      clearTimeout(id);
      lastError = err;
      if (err?.name === 'AbortError') {
        if (attempt === maxAttempts - 1) throw new ApiError(`Request timeout after ${timeoutMs}ms`, 0);
      } else {
        // On final attempt throw, otherwise continue (allow fallback base to engage)
        if (attempt === maxAttempts - 1) {
          // Provide hint if localhost 8080 unreachable
          if (baseCandidates.length > 1 && /ECONNREFUSED|Network/i.test(String(err?.message))) {
            throw new ApiError('Network error (API server unreachable - check baseURL configuration)', 0);
          }
          if (AppConfig.SILENT_NETWORK_ERRORS) {
            if (debug) console.warn('[serverFetch] silent network error suppressed', err?.message || err);
            // Record metrics
            silentNetworkStats.suppressedCount += 1;
            silentNetworkStats.lastEndpoint = path;
            silentNetworkStats.lastAt = Date.now();
            if (!silentNetworkStats.endpoints.includes(path)) silentNetworkStats.endpoints.push(path);
            // Extended heuristic fallback shapes for common endpoints
            const empty: any =
              path.includes('/messages/with/') ? { messages: [] } :
              path.includes('/messages/threads') ? { threads: [] } :
              path.includes('/messages/unread') ? { count: 0 } :
              path.includes('/messages/read/all') ? { updated: false } :
              path.includes('/bids') && /GET/i.test(method) ? { bids: [] } :
              path.includes('/projects') && /GET/i.test(method) ? { projects: [] } :
              path.includes('/auth/me') ? { user: null } :
              path.includes('/notifications') ? { notifications: [] } :
              path.includes('/health') ? { status: 'offline' } :
              { ok: false };
            return empty as T;
          }
          throw new ApiError(err?.message || 'Network error', 0);
        }
      }
      // backoff
      await new Promise(r => setTimeout(r, 150 * (attempt + 1)));
      continue;
    }
    clearTimeout(id);

    const duration = Date.now() - started;
    const contentType = res.headers.get('content-type') || '';
    let body: any = null;
    
    try {
      if (contentType.includes('application/json')) {
        body = await res.json();
      } else if (contentType.startsWith('text/')) {
        body = await res.text();
      } else if (res.status !== 204) {
        body = await res.text();
      }
    } catch (parseErr) {
      body = { parseError: String(parseErr) };
    }

    if (debug) {
      console.log('[serverFetch]', {
        url,
        status: res.status, 
        duration, 
        ok: res.ok, 
        attempt: attempt + 1, 
        hasApiKey: !!apiHeaders['X-API-Key'],
        body: method === 'GET' ? body : '[body hidden for non-GET]'
      });
    }

  if (!res.ok) {
      // Handle API key related errors
      if (res.status === 401 && requiresApiKey) {
        // Try to refresh API key once
        if (attempt === 0) {
          try {
            await apiKeyManager.refreshApiKey();
            continue; // Retry with new API key
          } catch (refreshError) {
            console.warn('[serverFetch] API key refresh failed:', refreshError);
          }
        }
      }

      const message = (body && (body.message || body.error?.message)) || res.statusText || `HTTP ${res.status}`;
      if (debug) {
        console.warn('[serverFetch] error', { 
          url,
          status: res.status, 
          body, 
          attempt: attempt + 1,
          hasApiKey: !!apiHeaders['X-API-Key']
        });
      }

      // Retry only on network-ish / 5xx for GET
      if (isGet && res.status >= 500 && attempt < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
        continue;
      }

      // If server responded but not ok and silent network errors flag is set AND it's a 5xx, treat similarly
  if (AppConfig.SILENT_NETWORK_ERRORS && res.status >= 500) {
        silentNetworkStats.suppressedCount += 1;
        silentNetworkStats.lastEndpoint = path;
        silentNetworkStats.lastAt = Date.now();
        if (!silentNetworkStats.endpoints.includes(path)) silentNetworkStats.endpoints.push(path);
        const empty: any =
          path.includes('/messages/with/') ? { messages: [] } :
          path.includes('/messages/threads') ? { threads: [] } :
          path.includes('/messages/unread') ? { count: 0 } :
          path.includes('/bids') && /GET/i.test(method) ? { bids: [] } :
          path.includes('/projects') && /GET/i.test(method) ? { projects: [] } :
          path.includes('/notifications') ? { notifications: [] } :
          { ok: false };
        if (debug) console.warn('[serverFetch] converted server error to silent fallback', { status: res.status, path });
        return empty as T;
      }
      throw new ApiError(message, { status: res.status, body });
    }

    return body as T;
  }

  // Should not reach here normally
  throw lastError instanceof ApiError ? lastError : new ApiError('Unknown fetch error', 0);
}

/**
 * Health check specifically for the production API
 */
export async function checkApiHealth(): Promise<{
  status: 'ok' | 'error';
  apiKeyRequired: boolean;
  environment: 'development' | 'production';
  response?: any;
}> {
  try {
    const isDev = __DEV__ || AppConfig.NODE_API_BASE_URL?.includes('localhost');
    const environment = isDev ? 'development' : 'production';
    
    // In development, we can be more lenient with health checks
    if (environment === 'development') {
      // Try health endpoint (usually doesn't require API key)
      // Try multiple common health endpoints (some backends expose /health, others / or /status)
      const candidates = ['/health', '/status', '/'];
      let response: any = null;
      let lastErr: any = null;
      for (const p of candidates) {
        try {
          response = await serverFetch(p, { method: 'GET', timeoutMs: 3000 });
          if (response) break;
        } catch (e) {
          lastErr = e;
          // Only log if it's not a common development error
          const errorMsg = String((e as any)?.message || e);
          if (!errorMsg.includes('retry_exhausted') && !errorMsg.includes('ECONNREFUSED') && !errorMsg.includes('Network error')) {
            if (__DEV__) console.warn(`[Health Check] ${p} failed:`, e);
          }
        }
      }
      
      // In development, even if health endpoints fail, we can still return ok
      // as long as we're in a known development environment
      return {
        status: 'ok', // Always OK in development
        apiKeyRequired: apiKeyManager.isApiKeyRequired(),
        environment,
        response: response || { message: 'Development environment - health check skipped', note: 'Backend server may not be running, this is normal in development' }
      };
    }
    
    // Production - stricter health check
    const candidates = ['/health', '/status', '/'];
    let response: any = null;
    let lastErr: any = null;
    for (const p of candidates) {
      try {
        response = await serverFetch(p, { method: 'GET', timeoutMs: 5000 });
        if (response) break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!response && lastErr) throw lastErr;

    return {
      status: 'ok',
      apiKeyRequired: apiKeyManager.isApiKeyRequired(),
      environment,
      response
    };
  } catch (error) {
    const isDev = __DEV__ || AppConfig.NODE_API_BASE_URL?.includes('localhost');
    const environment = isDev ? 'development' : 'production';
    
    if (__DEV__) {
      console.warn('[Health Check] All endpoints failed, but continuing in development mode:', error);
    }
    
    return {
      status: environment === 'development' ? 'ok' : 'error',
      apiKeyRequired: apiKeyManager.isApiKeyRequired(),
      environment,
      response: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}