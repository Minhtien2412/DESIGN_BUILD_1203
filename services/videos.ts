import type { VideoItem as LocalVideoItem } from '@/data/videos';
import { apiFetch } from './api';

type MaybeOk<T> = { ok?: boolean; data?: T } | T;

function normalize(list: any): LocalVideoItem[] {
  const arr: any[] = Array.isArray((list as any)?.data) ? (list as any).data : (Array.isArray(list) ? list : []);
  return arr
    .map((v: any, idx: number) => ({
      id: String(v.id ?? v._id ?? v.key ?? idx),
      title: v.title ?? v.name ?? v.caption ?? '',
      url: v.url ?? v.videoUrl ?? v.src ?? '',
      author: v.author ?? v.owner ?? undefined,
      likes: typeof v.likes === 'number' ? v.likes : undefined,
      comments: typeof v.comments === 'number' ? v.comments : undefined,
      category: v.category ?? undefined,
      hashtags: Array.isArray(v.hashtags) ? v.hashtags : undefined,
      type: (v.type === 'live' || v.type === 'vod') ? v.type : undefined,
    }))
    .filter((v) => v.id);
}

export async function fetchVideos(): Promise<LocalVideoItem[]> {
  const candidates = ['/access/videos', '/videos', '/v1/videos'];
  for (const path of candidates) {
    try {
      const res = await apiFetch<MaybeOk<any[]>>(path, { method: 'GET', timeoutMs: 15000 });
      const items = normalize(res);
      if (items.length) return items;
    } catch {
      // try next candidate
    }
  }
  return [];
}

// Compatibility alias used by some legacy callers
// Compatibility alias used by some legacy callers; accept arbitrary args and forward.
export const fetchAggregatedVideos = async (..._args: any[]) => fetchVideos();
