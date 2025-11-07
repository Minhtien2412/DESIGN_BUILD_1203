/**
 * Server-backed Messages API (cursor/ETag + graceful 404)
 * Use this instead of offset pagination to avoid server overload when data grows.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, apiFetch } from './api';

export type Conversation = {
  id: string;
  title?: string;
  participants: string[];
  unreadCount?: number;
  updatedAt: string; // ISO
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  createdAt: string; // ISO
};

export type CursorResult<T> = { items: T[]; nextCursor?: string; hasMore: boolean; etag?: string; notModified?: boolean };

const CACHE = {
  conv: '@msgapi:conversations',
  convETag: '@msgapi:conversations:etag',
  msgs: (id: string) => `@msgapi:messages:${id}`,
  msgsETag: (id: string) => `@msgapi:messages:${id}:etag`,
};

const ROUTES = {
  conversations: '/api/conversations',
  messages: (cid: string) => `/api/conversations/${cid}/messages`,
};

export async function getCachedConversations(): Promise<Conversation[]> {
  try { const raw = await AsyncStorage.getItem(CACHE.conv); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
export async function getCachedMessages(cid: string): Promise<Message[]> {
  try { const raw = await AsyncStorage.getItem(CACHE.msgs(cid)); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export async function listConversations(opts: { cursor?: string; limit?: number } = {}): Promise<CursorResult<Conversation>> {
  const etag = await AsyncStorage.getItem(CACHE.convETag);
  const qs = new URLSearchParams();
  if (opts.cursor) qs.set('cursor', opts.cursor);
  if (opts.limit) qs.set('limit', String(opts.limit));
  try {
    const data = await apiFetch<any>(`${ROUTES.conversations}?${qs}`, { headers: etag ? { 'If-None-Match': etag } : undefined });
    const items: Conversation[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    await AsyncStorage.setItem(CACHE.conv, JSON.stringify(items));
    if (data?.etag) await AsyncStorage.setItem(CACHE.convETag, data.etag);
    return { items, nextCursor: data?.nextCursor, hasMore: !!data?.hasMore, etag: data?.etag };
  } catch (e: any) {
    if (e instanceof ApiError && (e.status === 304)) {
      return { items: [], hasMore: false, notModified: true };
    }
    if (e instanceof ApiError && e.status === 404) {
      // Route not available yet
      return { items: [], hasMore: false };
    }
    const cached = await getCachedConversations();
    return { items: cached, hasMore: false };
  }
}

export async function listMessages(cid: string, opts: { before?: string; after?: string; limit?: number } = {}): Promise<CursorResult<Message>> {
  const etag = await AsyncStorage.getItem(CACHE.msgsETag(cid));
  const qs = new URLSearchParams();
  if (opts.before) qs.set('before', opts.before);
  if (opts.after) qs.set('after', opts.after);
  if (opts.limit) qs.set('limit', String(opts.limit));
  try {
    const data = await apiFetch<any>(`${ROUTES.messages(cid)}?${qs}`, { headers: etag ? { 'If-None-Match': etag } : undefined });
    const items: Message[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    const cached = await getCachedMessages(cid);
    const merged = [...cached, ...items].reduce((map, m) => map.set(m.id, m), new Map<string, Message>());
    const arr = Array.from(merged.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    await AsyncStorage.setItem(CACHE.msgs(cid), JSON.stringify(arr.slice(-200))); // cap local cache
    if (data?.etag) await AsyncStorage.setItem(CACHE.msgsETag(cid), data.etag);
    return { items, nextCursor: data?.nextCursor, hasMore: !!data?.hasMore, etag: data?.etag };
  } catch (e: any) {
    if (e instanceof ApiError && e.status === 304) {
      return { items: [], hasMore: false, notModified: true };
    }
    if (e instanceof ApiError && e.status === 404) {
      const cached = await getCachedMessages(cid);
      return { items: cached, hasMore: false };
    }
    const cached = await getCachedMessages(cid);
    return { items: cached, hasMore: false };
  }
}
