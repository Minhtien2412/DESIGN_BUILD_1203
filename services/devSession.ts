import { getItem, setItem } from '@/utils/storage';
import { serverFetch } from './enhancedServerClient';

/**
 * Ensure a development session exists (only for local / non-production use).
 * Returns sessionId or null if fails.
 */
export async function ensureDevSession(userId: string = 'demo_user'): Promise<string | null> {
  try {
    const existing = await getItem('dev:sessionId');
    if (existing) return existing;
    const res: any = await serverFetch('/dev/session', { method: 'POST', body: JSON.stringify({ userId }) });
    const sid = res?.data?.sessionId;
    if (sid) {
      await setItem('dev:sessionId', sid);
      return sid;
    }
  } catch (e) {
    // silent
  }
  return null;
}
