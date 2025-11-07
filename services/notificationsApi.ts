import { AppConfig } from '@/config';
import { ApiError, apiFetch, type ApiFetchOptions } from '@/services/api';

// Shape returned by backend routes (see server/src/routes/notifications.routes.ts)
export interface RemoteNotificationsResponse {
  success?: boolean;
  data?: {
    notifications?: any[];
    latestVersion?: number;
    unread?: number;
    updated?: boolean;
    acked?: string[];
  };
  error?: { code: string; message: string };
}

type Fetcher = <T>(path: string, opts: ApiFetchOptions) => Promise<T>;

// Build base path respecting production prefix (/api) but remaining compatible with local dev server
function baseNotificationsPath() {
  // If API_PREFIX provided (e.g. '/api') use it; else in production fallback to '/api'
  const configured = (AppConfig.API_PREFIX || '').trim();
  const effectivePrefix = configured || (AppConfig.FORCE_PROD || AppConfig.USE_REMOTE_NOTIFICATIONS ? '/api' : '');
  // Normalize duplicates
  const prefix = effectivePrefix.replace(/\/$/, '');
  return `${prefix}/notifications` || '/notifications';
}

function joinPath(seg: string) {
  const base = baseNotificationsPath();
  return seg ? `${base}${seg.startsWith('/') ? seg : '/' + seg}` : base;
}

function chooseFetcher(): Fetcher {
  // Always use apiFetch để đồng bộ với main API service baseURL
  // This ensures consistent baseURL across all API calls
  return apiFetch as Fetcher;
}

/**
 * Fetch notifications incrementally (or full) from server.
 * Automatically falls back & surfaces 404 for caller to optionally mark unsupported.
 */
export async function fetchRemoteNotifications(params: { token?: string; since?: number }): Promise<{ notifications: any[]; latestVersion: number; unread: number } | null> {
  const { token, since } = params;
  if (!token) return null; // require auth token (Bearer) for now
  const fetcher = chooseFetcher();
  const qs = since && since > 0 ? `?since=${since}` : '';
  const basePath = `${joinPath('')}${qs}`;
  try {
    const res = await fetcher<RemoteNotificationsResponse>(basePath, { method: 'GET', token, timeoutMs: 15000 });
    const data = res?.data;
    if (!data) return null;
    return { notifications: data.notifications || [], latestVersion: data.latestVersion || since || 0, unread: data.unread ?? 0 };
  } catch (e: any) {
    if (e instanceof ApiError && e.status === 404) {
      // propagate 404 so UI can count unsupported environment
      throw e;
    }
    if (__DEV__) console.warn('[notificationsApi] fetchRemoteNotifications failed', e);
    return null;
  }
}

/**
 * Mark provided notification IDs as read remotely. If all=true, server marks every unread.
 * Fire & forget; callers can ignore result (optimistic update already applied locally).
 */
export async function remoteMarkRead(params: { token?: string; ids?: string[]; all?: boolean }): Promise<{ latestVersion?: number; unread?: number } | null> {
  const { token, ids, all } = params;
  if (!token) return null;
  const fetcher = chooseFetcher();
  try {
    const body = JSON.stringify(all ? { all: true } : { ids });
    const res = await fetcher<RemoteNotificationsResponse>(joinPath('mark-read'), { method: 'POST', token, data: body, timeoutMs: 12000 });
    return { latestVersion: res?.data?.latestVersion, unread: res?.data?.unread };
  } catch (e) {
    if (__DEV__) console.warn('[notificationsApi] remoteMarkRead failed', e);
    return null;
  }
}

/**
 * Acknowledge (dismiss) notifications server-side (if backend uses separate ack). Not used yet in UI.
 */
export async function remoteAck(params: { token?: string; ids: string[] }): Promise<boolean> {
  const { token, ids } = params;
  if (!token || !ids.length) return false;
  const fetcher = chooseFetcher();
  try {
    await fetcher<RemoteNotificationsResponse>(joinPath('ack'), { method: 'POST', token, data: JSON.stringify({ ids }), timeoutMs: 10000 });
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[notificationsApi] remoteAck failed', e);
    return false;
  }
}

// Health check: GET /api/notifications/health (production) or /notifications/health (dev)
export async function notificationsHealth(): Promise<'ok' | 'error'> {
  const fetcher = chooseFetcher();
  try {
    await fetcher<any>(joinPath('health'), { method: 'GET', timeoutMs: 8000 });
    return 'ok';
  } catch (e) {
    return 'error';
  }
}

// Create demo notification (friend suggestion or other)
export async function createDemoNotification(params: { token?: string; type?: string; title?: string; message?: string }): Promise<boolean> {
  const { token, type = 'friend_request', title = 'Demo', message = 'Xin chào' } = params;
  if (!token) return false;
  const fetcher = chooseFetcher();
  try {
    await fetcher<RemoteNotificationsResponse>(joinPath('demo-friend'), { method: 'POST', token, data: JSON.stringify({ type, title, message }), timeoutMs: 10000 });
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[notificationsApi] createDemoNotification failed', e);
    return false;
  }
}
