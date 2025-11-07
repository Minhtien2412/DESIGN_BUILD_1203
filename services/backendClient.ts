import { ApiError, apiFetch } from '@/services/api';
import { serverFetch } from '@/services/serverClient';
import { getToken } from '@/utils/storage';

/**
 * Unified backend client helpers to reduce repetition:
 * - Automatically attaches auth bearer token (if present)
 * - Normalizes success/error shape
 * - Supports choosing channel: 'server' (enhanced) or 'api' (basic)
 * - Provides query param builder
 */

export type BackendChannel = 'server' | 'api';

export interface BackendResult<T> {
  ok: boolean;
  status?: number;
  data?: T;
  error?: { message: string; code?: string; raw?: any };
}

export interface RequestOptions {
  channel?: BackendChannel; // default: server
  token?: string; // explicit override
  timeoutMs?: number;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  // For POST/PATCH/PUT
  body?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  throwOnError?: boolean; // default false -> return { ok:false }
  /** Optional light retry count (network / 5xx). Backoff: 150ms * attempt */
  retry?: number;
  /** Base delay for retry backoff (default 150ms) */
  retryBaseMs?: number;
  /** Exponential factor (default 2). If 1 -> linear */
  retryFactor?: number;
  /** Add +/- random jitter percentage (0.0 - 1.0). default 0.2 (20%) */
  retryJitter?: number;
}

function buildQuery(q?: Record<string, any>): string {
  if (!q) return '';
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

async function resolveToken(explicit?: string): Promise<string | undefined> {
  if (explicit) return explicit;
  try {
    const t = await getToken();
    return t || undefined;
  } catch {
    return undefined;
  }
}

export async function backendRequest<T = any>(path: string, opts: RequestOptions = {}): Promise<BackendResult<T>> {
  const {
    channel = 'server',
    method = 'GET',
    body,
    query,
    timeoutMs,
    throwOnError = false,
    headers = {},
    retry = 0,
    retryBaseMs = 150,
    retryFactor = 2,
    retryJitter = 0.2,
  } = opts;
  const token = await resolveToken(opts.token);
  const fullPath = `${path}${buildQuery(query)}`;
  const fetchFn = channel === 'server' ? serverFetch : apiFetch;
  let attempt = 0;
  while (true) {
    try {
      const raw = await fetchFn<any>(fullPath, {
        method,
        token,
        timeoutMs,
        headers: { 'Content-Type': 'application/json', ...headers },
        ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
      });
      return { ok: true, status: 200, data: raw };
    } catch (e: any) {
      const isApiErr = e instanceof ApiError;
      const status = isApiErr ? e.status : undefined;
      const retriable = (!isApiErr && attempt < (retry || 0)) || (isApiErr && status && status >= 500 && status < 600 && attempt < (retry || 0));
      if (retriable) {
        attempt++;
        const exp = retryFactor <= 1 ? attempt : Math.pow(retryFactor, attempt - 1);
        let delay = retryBaseMs * exp;
        if (retryJitter > 0) {
          const jitterAmt = delay * retryJitter;
            // random between -jitterAmt and +jitterAmt
          delay += (Math.random() * 2 - 1) * jitterAmt;
        }
        // Clamp to a sane max (5s) to avoid runaway
        delay = Math.min(delay, 5000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (isApiErr) {
        if (throwOnError) throw e;
  return { ok: false, status, error: { message: e.message, raw: (e as ApiError).data } };
      }
      if (throwOnError) throw e;
      return { ok: false, error: { message: e?.message || 'Network error', raw: e } };
    }
  }
}

// Convenience wrappers
export const getJson = <T=any>(path: string, opts?: Omit<RequestOptions,'method'>) => backendRequest<T>(path, { ...opts, method: 'GET' });
export const postJson = <T=any>(path: string, body?: any, opts?: Omit<RequestOptions,'method'|'body'>) => backendRequest<T>(path, { ...opts, method: 'POST', body });
export const patchJson = <T=any>(path: string, body?: any, opts?: Omit<RequestOptions,'method'|'body'>) => backendRequest<T>(path, { ...opts, method: 'PATCH', body });
export const putJson = <T=any>(path: string, body?: any, opts?: Omit<RequestOptions,'method'|'body'>) => backendRequest<T>(path, { ...opts, method: 'PUT', body });
export const deleteReq = <T=any>(path: string, opts?: Omit<RequestOptions,'method'>) => backendRequest<T>(path, { ...opts, method: 'DELETE' });

/** Example domain usage (reports):
 * const res = await getJson('/reports', { query: { page:1, limit:20 } });
 * if (res.ok) setReports(res.data.reports);
 */

// Optional: typed result extractor
export function unwrap<T>(res: BackendResult<T>): T | undefined {
  return res.ok ? res.data : undefined;
}

// Utility to build safe path with prefix awareness (if future API_PREFIX used)
export function apiPath(p: string) { return p.startsWith('/api') ? p : `/api${p}`; }
