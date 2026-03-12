import { serverFetch } from './serverClient';

export interface ProxyHealth {
  success: boolean;
  data?: { status?: string; time?: string; version?: string; uptime?: number };
  meta?: { durationMs?: number; upstream?: string };
  error?: { code: string; message: string };
}

export async function fetchUpstreamHealth(): Promise<ProxyHealth> {
  try {
    return await serverFetch<ProxyHealth>('/proxy/health', { method: 'GET', timeoutMs: 6000 });
  } catch (e: any) {
    return { success: false, error: { code: 'NETWORK', message: e?.message || 'Network error' } };
  }
}
