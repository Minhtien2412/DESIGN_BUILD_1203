import { backendRequest, BackendResult, RequestOptions } from '@/services/backendClient';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data fetching hook with in-memory TTL cache + optional manual reload.
 * - Keyed by path + serialized query + method
 * - Shares cache across hook instances (module scope store)
 * - Light retry via backendRequest retry option
 */

interface CacheEntry { data: any; error?: any; at: number; }
const store = new Map<string, CacheEntry>();

export interface UseQueryOptions<T> extends Omit<RequestOptions, 'method' | 'body'> {
  enabled?: boolean; // default true
  ttlMs?: number; // default 10s
  method?: RequestOptions['method'];
  body?: any; // for POST-like queries (rare)
  skipCache?: boolean; // bypass read/write cache
  select?: (data: any) => T; // projector
}

export interface UseQueryState<T> {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
  stale: boolean;
  reload: (force?: boolean) => Promise<void>;
}

function keyOf(path: string, opts: UseQueryOptions<any>): string {
  const q = opts.query ? JSON.stringify(opts.query) : '';
  return `${opts.method || 'GET'}:${path}:${q}`;
}

export function useQuery<T = any>(path: string, opts: UseQueryOptions<T> = {}): UseQueryState<T> {
  const { enabled = true, ttlMs = 10_000, skipCache, select, method, body, ...req } = opts;
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [stale, setStale] = useState<boolean>(false);
  const mounted = useRef(true);
  const cacheKey = keyOf(path, opts);

  const readCache = useCallback(() => {
    if (skipCache) return false;
    const entry = store.get(cacheKey);
    if (!entry) return false;
    const age = Date.now() - entry.at;
    if (age > ttlMs) { setStale(true); return false; }
    setData(select ? select(entry.data) : entry.data);
    setError(undefined);
    setLoading(false);
    return true;
  }, [cacheKey, ttlMs, select, skipCache]);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;
    if (!force && readCache()) return;
    setLoading(true);
    try {
      const res: BackendResult<any> = await backendRequest(path, { ...req, method: method || 'GET', body });
      if (!mounted.current) return;
      if (res.ok) {
        const value = select ? select(res.data) : res.data;
        setData(value);
        setError(undefined);
        setStale(false);
        if (!skipCache) store.set(cacheKey, { data: res.data, at: Date.now() });
      } else {
        setError(res.error?.message || 'Error');
      }
    } catch (e: any) {
      if (!mounted.current) return;
      setError(e?.message || 'Error');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [path, req, method, body, select, skipCache, cacheKey, enabled, readCache]);

  const reload = useCallback(async (force = true) => {
    if (force) store.delete(cacheKey);
    await fetchData(true);
  }, [fetchData, cacheKey]);

  useEffect(() => { mounted.current = true; if (enabled) fetchData(false); return () => { mounted.current = false; }; }, [fetchData, enabled]);

  return { data, error, loading, stale, reload };
}
