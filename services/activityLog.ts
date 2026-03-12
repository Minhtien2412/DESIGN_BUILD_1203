import { getItem, setItem } from '@/utils/storage';

export type ActivityType =
  | 'auth:login'
  | 'auth:logout'
  | 'post:create'
  | 'post:like'
  | 'post:unlike'
  | 'post:share'
  | 'comment:add'
  | 'comment:update'
  | 'comment:delete'
  | 'live:start'
  | 'live:end'
  | 'live:comment'
  | 'live:like'
  | 'live:unlike'
  | 'user:follow'
  | 'user:unfollow'
  | 'system:info';

export type Activity = {
  id: string;
  type: ActivityType;
  actorId?: string;
  actorName?: string;
  // e.g., post slug/id, live id, user targetId, etc.
  target?: { kind: 'post' | 'live' | 'user' | 'category'; slug?: string; id?: string };
  // arbitrary extra data for display/debug
  meta?: Record<string, any>;
  ts: number; // epoch millis
};

const LOG_KEY = 'activity:log:v1';
const MAX_LOG = 150; // Giảm từ 500 xuống 150 để tránh vượt 2KB
const MAX_BYTES = 1800; // Dưới ngưỡng 2048 bytes cho SecureStore

async function readAll(): Promise<Activity[]> {
  try {
    const raw = await getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Activity[];
  } catch {
    return [];
  }
}

async function writeAll(list: Activity[]) {
  try {
    // Giới hạn số lượng items
    let trimmed = list.slice(0, MAX_LOG);
    let json = JSON.stringify(trimmed);

    // Nếu vẫn quá lớn, cắt bớt thêm
    if (json.length > MAX_BYTES) {
      const approxPerItem = Math.max(50, Math.floor(json.length / trimmed.length));
      const targetItems = Math.max(10, Math.floor(MAX_BYTES / approxPerItem) - 5);
      trimmed = trimmed.slice(0, targetItems);
      json = JSON.stringify(trimmed);
    }

    await setItem(LOG_KEY, json);
  } catch (error: any) {
    console.warn('[ActivityLog] Failed to persist activity log:', error?.message);
    // Fallback: try to save with minimal items
    if (list.length > 10) {
      try {
        const minimal = list.slice(0, 10);
        await setItem(LOG_KEY, JSON.stringify(minimal));
      } catch (fallbackError) {
        console.error('[ActivityLog] Even minimal save failed');
      }
    }
  }
}

export async function logActivity(a: Omit<Activity, 'id' | 'ts'> & { ts?: number }): Promise<Activity> {
  const item: Activity = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: a.ts ?? Date.now(),
    type: a.type,
    actorId: a.actorId,
    actorName: a.actorName,
    target: a.target,
    meta: a.meta,
  };
  
  try {
    const list = await readAll();
    const next = [item, ...list].slice(0, MAX_LOG);
    await writeAll(next);
  } catch (error: any) {
    console.warn('[ActivityLog] Failed to persist activity, continuing anyway:', error?.message);
    // Don't throw - return the item even if we couldn't persist it
  }
  
  return item;
}

export async function listActivities(opts?: { type?: ActivityType; actorId?: string; since?: number; until?: number; limit?: number }): Promise<Activity[]> {
  const list = await readAll();
  let filtered = list;
  if (opts?.type) filtered = filtered.filter((a) => a.type === opts.type);
  if (opts?.actorId) filtered = filtered.filter((a) => a.actorId === opts.actorId);
  if (typeof opts?.since === 'number') filtered = filtered.filter((a) => a.ts >= (opts!.since as number));
  if (typeof opts?.until === 'number') filtered = filtered.filter((a) => a.ts <= (opts!.until as number));
  const lim = opts?.limit ?? 100;
  return filtered.slice(0, lim);
}

export async function listActivitiesForUser(userId: string, limit = 100): Promise<Activity[]> {
  return listActivities({ actorId: userId, limit });
}

// Clean up oversized activity log (call this once to fix existing data)
export async function cleanupActivityLog(): Promise<void> {
  try {
    console.log('[ActivityLog] Cleaning up oversized activity log...');
    const list = await readAll();
    if (list.length > MAX_LOG) {
      console.log(`[ActivityLog] Trimming from ${list.length} to ${MAX_LOG} items`);
      const trimmed = list.slice(0, MAX_LOG);
      await writeAll(trimmed);
    }
    
    // Check size after cleanup
    const json = JSON.stringify(list.slice(0, MAX_LOG));
    console.log(`[ActivityLog] Size after cleanup: ${json.length} bytes`);
  } catch (error: any) {
    console.warn('[ActivityLog] Cleanup failed but continuing:', error?.message);
    // Don't throw - let the app continue even if cleanup fails
  }
}

// Emergency function to clear all activity log data
export async function clearActivityLog(): Promise<void> {
  try {
    console.log('[ActivityLog] Clearing all activity log data...');
    await setItem(LOG_KEY, JSON.stringify([]));
    console.log('[ActivityLog] Activity log cleared successfully');
  } catch (error: any) {
    console.error('[ActivityLog] Failed to clear activity log:', error?.message);
    // Don't throw - just log the error
  }
}

// Safe initialization check - call this on app startup
export async function initializeActivityLog(): Promise<void> {
  try {
    const raw = await getItem(LOG_KEY);
    if (!raw) {
      // Initialize with empty array if no data exists
      await setItem(LOG_KEY, JSON.stringify([]));
      console.log('[ActivityLog] Initialized empty activity log');
      return;
    }
    
    // Check if existing data is oversized or corrupted
    if (raw.length > 10000) { // More than 10KB is definitely too much
      console.warn('[ActivityLog] Existing data is oversized, clearing...');
      await clearActivityLog();
      return;
    }
    
    // Try to parse existing data
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('[ActivityLog] Existing data is corrupted, clearing...');
        await clearActivityLog();
        return;
      }
      
      // If we have too many items, trim them
      if (parsed.length > MAX_LOG) {
        console.log(`[ActivityLog] Trimming ${parsed.length} items to ${MAX_LOG}`);
        const trimmed = parsed.slice(0, MAX_LOG);
        await setItem(LOG_KEY, JSON.stringify(trimmed));
      }
    } catch (parseError) {
      console.warn('[ActivityLog] Failed to parse existing data, clearing...', parseError);
      await clearActivityLog();
    }
  } catch (error: any) {
    console.warn('[ActivityLog] Initialization failed, continuing anyway:', error?.message);
    // Don't throw - let app continue even if initialization fails
  }
}
