import { serverFetch } from '@/services/serverClient';

export type HealthResponse = { status: string; time: string; version?: string; uptime?: number };

export async function serverHealth() {
  return await serverFetch<HealthResponse>('/health', { method: 'GET', timeoutMs: 5000 });
}
