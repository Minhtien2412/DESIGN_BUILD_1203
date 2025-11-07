import { serverFetch } from '@/services/serverClient';

// Shape returned by server for all endpoints: { success: boolean, data?: {...} }
type Envelope<T> = { success: boolean; data?: T; error?: any };

export type ServerMessage = {
  id: string;
  thread_id: string;
  from_user: string;
  to_user: string;
  text: string;
  at: number;
  read: number;
};

function isEnvelope<T>(v: any): v is Envelope<T> {
  return v && typeof v === 'object' && 'success' in v;
}

export async function sendServerMessage(token: string, to: string, text: string): Promise<ServerMessage | null> {
  const raw = await serverFetch<any>('/messages', {
    method: 'POST',
    token,
    body: JSON.stringify({ to, text }),
  });
  if (isEnvelope<{ message: ServerMessage }>(raw)) return raw.data?.message || null;
  return (raw as any)?.message ?? null;
}

export async function listServerMessages(token: string, withUserId: string): Promise<ServerMessage[]> {
  const raw = await serverFetch<any>(`/messages/with/${withUserId}`, {
    method: 'GET',
    token,
  });
  if (isEnvelope<{ messages: ServerMessage[] }>(raw)) return raw.data?.messages || [];
  return (raw as any)?.messages || [];
}

export async function listServerThreads(token: string): Promise<string[]> {
  const raw = await serverFetch<any>(`/messages/threads`, { method: 'GET', token });
  if (isEnvelope<{ threads: string[] }>(raw)) return raw.data?.threads || [];
  return (raw as any)?.threads || [];
}

export async function getServerUnread(token: string): Promise<number> {
  const raw = await serverFetch<any>(`/messages/unread`, { method: 'GET', token });
  if (isEnvelope<{ count: number }>(raw)) return raw.data?.count || 0;
  return (raw as any)?.count || 0;
}

export async function markServerThreadRead(token: string, withUserId: string): Promise<boolean> {
  const raw = await serverFetch<any>(`/messages/with/${withUserId}/read`, { method: 'POST', token });
  if (isEnvelope<{ updated: boolean }>(raw)) return !!raw.data?.updated;
  return !!(raw as any)?.updated;
}

export async function markAllServerRead(token: string): Promise<boolean> {
  const raw = await serverFetch<any>(`/messages/read/all`, { method: 'POST', token });
  if (isEnvelope<{ updated: boolean }>(raw)) return !!raw.data?.updated;
  return !!(raw as any)?.updated;
}

export async function deleteServerThreadByPeer(token: string, withUserId: string): Promise<boolean> {
  const raw = await serverFetch<any>(`/messages/with/${withUserId}`, { method: 'DELETE', token });
  if (isEnvelope<{ deleted: boolean }>(raw)) return !!raw.data?.deleted;
  return !!(raw as any)?.deleted;
}

export async function deleteServerThreadByTid(token: string, tid: string): Promise<boolean> {
  const raw = await serverFetch<any>(`/messages/thread/${tid}`, { method: 'DELETE', token });
  if (isEnvelope<{ deleted: boolean }>(raw)) return !!raw.data?.deleted;
  return !!(raw as any)?.deleted;
}
