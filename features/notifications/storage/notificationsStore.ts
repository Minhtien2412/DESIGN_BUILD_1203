import type { Notification } from '@/context/NotificationContext';
import { storage } from '@/services/storage';

// Lightweight persistent store using SecureStore (small size) + in-memory mirror.
// For larger volumes AsyncStorage would be better, but it's not in deps. We'll cap size.
const KEY = 'notifications:v1';
const MAX_ITEMS = 200; // keep low due to SecureStore size constraints.
const KEY_LAST_VERSION = 'notifications:lastVersion:v1';
const KEY_PREFS = 'notifications:prefs:v1';
let cache: Notification[] | null = null;

export async function loadNotifications(): Promise<Notification[]> {
  if (cache) return cache;
  try {
  const raw = await storage.get(KEY);
    if (!raw) { cache = []; return cache; }
    const parsed = JSON.parse(raw) as Notification[];
    cache = Array.isArray(parsed) ? parsed : [];
    return cache;
  } catch {
    cache = [];
    return cache;
  }
}

export async function persistNotifications(list: Notification[]): Promise<void> {
  cache = list.slice(0, MAX_ITEMS);
  try {
  await storage.set(KEY, JSON.stringify(cache));
  } catch {
    // ignore persistence errors
  }
}

export async function clearNotifications(): Promise<void> {
  cache = [];
  try { await storage.remove(KEY); } catch {}
}

// --- lastVersion persistence (incremental sync anchor) ---
export async function loadLastVersion(): Promise<number> {
  try {
  const raw = await storage.get(KEY_LAST_VERSION);
    if (!raw) return 0;
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  } catch { return 0; }
}

export async function persistLastVersion(v: number): Promise<void> {
  try { await storage.set(KEY_LAST_VERSION, String(v)); } catch {}
}

export async function clearLastVersion(): Promise<void> {
  try { await storage.remove(KEY_LAST_VERSION); } catch {}
}

// --- preferences (muted types etc.) ---
export interface NotificationPrefsPersisted {
  mutedTypes: string[]; // e.g. ['system','live']
}

const DEFAULT_PREFS: NotificationPrefsPersisted = { mutedTypes: [] };

export async function loadNotificationPrefs(): Promise<NotificationPrefsPersisted> {
  try {
  const raw = await storage.get(KEY_PREFS);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.mutedTypes)) {
      return { mutedTypes: parsed.mutedTypes.filter((t: any) => typeof t === 'string') };
    }
    return DEFAULT_PREFS;
  } catch { return DEFAULT_PREFS; }
}

export async function persistNotificationPrefs(p: NotificationPrefsPersisted): Promise<void> {
  try { await storage.set(KEY_PREFS, JSON.stringify(p)); } catch {}
}

