import { getItem, setItem } from '@/utils/storage';

const KEY_MUTED = 'media:muted:v1';

export async function getMutedPref(): Promise<boolean> {
  try {
    const v = await getItem(KEY_MUTED);
    if (v == null) return true; // default to muted as per DEFAULT_MUTED
    return v === '1' || v === 'true';
  } catch {
    return true;
  }
}

export async function setMutedPref(muted: boolean): Promise<void> {
  try { await setItem(KEY_MUTED, muted ? '1' : '0'); } catch {}
}
