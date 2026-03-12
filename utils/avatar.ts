import { API_BASE } from '@/services/api';
import { getAvatarUrlFor } from '@/services/profile';

export type AvatarSource = string | null | undefined;

type Options = {
  userId?: string | null;
  nameFallback?: string | null;
  size?: number; // for placeholder services if used
  cacheBust?: string | number; // append as query to avoid stale cache after upload
};

/**
 * Resolve a consistent avatar URL across the app.
 * - Absolute URLs are returned as-is.
 * - "/uploads/..." paths are prefixed with API_BASE.
 * - Falsy values fall back to deterministic placeholder via getAvatarUrlFor.
 * - Optional cacheBust adds ?t= to help refresh after updates.
 */
export function resolveAvatar(avatar: AvatarSource, opts: Options = {}): string {
  const { userId, nameFallback, size, cacheBust } = opts;

  const finalize = (url: string) => {
    if (!cacheBust) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}t=${encodeURIComponent(String(cacheBust))}`;
  };

  if (typeof avatar === 'string' && avatar.trim()) {
    const v = avatar.trim();
    if (/^https?:\/\//i.test(v)) return finalize(v);
    if (v.startsWith('/')) return finalize(`${API_BASE}${v}`);
    // Handle occasional relative like "uploads/avatars/.."
    if (v.startsWith('uploads/')) return finalize(`${API_BASE}/${v}`);
    return finalize(v);
  }

  // Fallback placeholder (deterministic)
  const seed = nameFallback || userId || 'user';
  const base = getAvatarUrlFor(userId || 'user', seed);
  if (size && /^https?:\/\//.test(base)) {
    // pravatar size override: https://i.pravatar.cc/<size>?u=seed
    try {
      const u = new URL(base);
      const origin = u.origin;
      const search = u.search; // includes ?u=...
      return finalize(`${origin}/${size}${search}`);
    } catch {
      return finalize(base);
    }
  }
  return finalize(base);
}
