import { deleteItem, getItem, setItem } from '@/utils/storage';

export type Message = {
  id: string;
  from: string; // userId
  to: string;   // userId
  text: string;
  at: number;
  read?: boolean;
};

// Threads are identified by sorted pair `${minId}:${maxId}`
function threadKey(a: string, b: string) {
  return [a, b].sort().join(':');
}

const PREFIX = 'dm:'; // per-thread storage: dm:<pair>
const THREADS_KEY = 'dm:threads:v1';
const READ_KEY = (tid: string, userId: string) => `dm:read:${tid}:${userId}`;
const PINS_KEY = (userId: string) => `dm:pins:${userId}`;

async function readThreadIds(): Promise<string[]> {
  try {
    const raw = await getItem(THREADS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch { return []; }
}

async function writeThreadIds(ids: string[]) {
  try { await setItem(THREADS_KEY, JSON.stringify(ids)); } catch {}
}

async function readMessages(id: string): Promise<Message[]> {
  try {
    const raw = await getItem(PREFIX + id);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Message[]) : [];
  } catch { return []; }
}

async function writeMessages(id: string, list: Message[]) {
  try { await setItem(PREFIX + id, JSON.stringify(list)); } catch {}
}

export async function sendMessage(from: string, to: string, text: string): Promise<Message> {
  const tid = threadKey(from, to);
  const msg: Message = { id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, from, to, text: text.trim(), at: Date.now(), read: false };
  const list = await readMessages(tid);
  const next = [...list, msg];
  await writeMessages(tid, next);
  // ensure thread id appears first
  const ids = await readThreadIds();
  const filtered = ids.filter((x) => x !== tid);
  await writeThreadIds([tid, ...filtered]);
  return msg;
}

export async function listThreadsFor(userId: string): Promise<string[]> {
  const ids = await readThreadIds();
  // keep threads where userId is part of the pair
  return ids.filter((id) => id.split(':').includes(userId));
}

export async function listMessagesWith(a: string, b: string): Promise<Message[]> {
  const tid = threadKey(a, b);
  return readMessages(tid);
}

export async function markThreadRead(a: string, b: string, readerId: string): Promise<void> {
  const tid = threadKey(a, b);
  const list = await readMessages(tid);
  const next = list.map((m) => (m.to === readerId ? { ...m, read: true } : m));
  await writeMessages(tid, next);
}

// Admin helpers
export async function listAllThreadIds(): Promise<string[]> {
  return readThreadIds();
}

export function getParticipantsFromThreadId(tid: string): { a: string; b: string } {
  const parts = tid.split(':');
  if (parts.length >= 2) return { a: parts[0], b: parts[1] };
  return { a: tid, b: '' };
}

export async function listMessagesByThreadId(tid: string): Promise<Message[]> {
  return readMessages(tid);
}

// Compute total unread messages for a user across all threads
export async function getUnreadCount(userId: string): Promise<number> {
  const ids = await readThreadIds();
  let total = 0;
  for (const tid of ids) {
    if (!tid.split(':').includes(userId)) continue;
    const msgs = await readMessages(tid);
    total += msgs.reduce((n, m) => n + ((m.to === userId && !m.read) ? 1 : 0), 0);
  }
  return total;
}

// Mark all messages to the given user as read across all threads
export async function markAllRead(userId: string): Promise<void> {
  const ids = await readThreadIds();
  for (const tid of ids) {
    if (!tid.split(':').includes(userId)) continue;
    const list = await readMessages(tid);
    const next = list.map(m => (m.to === userId ? { ...m, read: true } : m));
    await writeMessages(tid, next);
  }
}

// Delete a thread by thread id (removes messages and the thread id from list)
export async function deleteThreadById(tid: string): Promise<void> {
  const ids = await readThreadIds();
  const remaining = ids.filter(id => id !== tid);
  await writeThreadIds(remaining);
  try { await deleteItem(PREFIX + tid); } catch {}
}

export async function deleteThreadWith(a: string, b: string): Promise<void> {
  const tid = threadKey(a, b);
  return deleteThreadById(tid);
}

// Demo helpers: seed staff and initial threads
export async function seedDmThread(a: string, b: string, initial?: { text?: string; at?: number }): Promise<void> {
  const tid = threadKey(a, b);
  const existing = await readMessages(tid);
  if (existing.length > 0) return;
  const now = Date.now();
  const msg: Message = {
    id: `${now}-seed`,
    from: b, // staff says hi first
    to: a,
    text: initial?.text || 'Xin chào! Em có thể hỗ trợ gì cho anh/chị?',
    at: initial?.at || now - 5 * 60 * 1000,
    read: false,
  };
  await writeMessages(tid, [msg]);
  const ids = await readThreadIds();
  const filtered = ids.filter((x) => x !== tid);
  await writeThreadIds([tid, ...filtered]);
}

// Per-thread lastRead (for read receipts)
export async function getThreadLastRead(tid: string, userId: string): Promise<number> {
  try { const v = await getItem(READ_KEY(tid, userId)); return v ? Number(v) || 0 : 0; } catch { return 0; }
}
export async function setThreadLastRead(tid: string, userId: string, ts: number): Promise<void> {
  try { await setItem(READ_KEY(tid, userId), String(ts)); } catch {}
}

// Pinned threads per user
export async function getPinnedThreads(userId: string): Promise<string[]> {
  try { const raw = await getItem(PINS_KEY(userId)); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
export async function setPinnedThreads(userId: string, ids: string[]): Promise<void> {
  try { await setItem(PINS_KEY(userId), JSON.stringify(ids)); } catch {}
}
export async function togglePinThread(userId: string, tid: string): Promise<boolean> {
  const pins = await getPinnedThreads(userId);
  const has = pins.includes(tid);
  const next = has ? pins.filter(id => id !== tid) : [tid, ...pins];
  await setPinnedThreads(userId, next);
  return !has;
}

// Helper to expose thread id
export function getThreadIdFor(a: string, b: string): string {
  return threadKey(a, b);
}
