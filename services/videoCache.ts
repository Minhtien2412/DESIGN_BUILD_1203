// Use legacy API to avoid deprecation warnings on SDK 54 while we migrate
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// Simple HLS prefetcher: downloads first N seconds of segments and rewrites a local playlist
// to mix local segment files first, then original remote URLs.

// Ensure cache directory is nested under documentDirectory when available
const BASE_DIR = (FileSystem as { documentDirectory?: string }).documentDirectory ?? (Platform.OS === 'web' ? '' : 'file://');
const ROOT = `${BASE_DIR}hls-cache/`;
const INDEX_KEY = ROOT + 'index.json';

export type CacheEntry = {
  url: string;
  localPlaylist: string; // file:// path
  createdAt: number;
};

const MAX_ENTRIES = 12; // keep a bit more than 10 for rolling window

function safeName(url: string) {
  return url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
}

async function ensureDir(path: string) {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) await FileSystem.makeDirectoryAsync(path, { intermediates: true });
}

async function readIndex(): Promise<CacheEntry[]> {
  try {
    const info = await FileSystem.getInfoAsync(INDEX_KEY);
    if (!info.exists) return [];
    const text = await FileSystem.readAsStringAsync(INDEX_KEY);
    const arr = JSON.parse(text);
    return Array.isArray(arr) ? (arr as CacheEntry[]) : [];
  } catch { return []; }
}

async function writeIndex(list: CacheEntry[]) {
  try {
    await ensureDir(ROOT);
    await FileSystem.writeAsStringAsync(INDEX_KEY, JSON.stringify(list));
  } catch {}
}

function resolveUrl(base: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  // join relative to base directory
  try {
    const u = new URL(base);
    // base directory
    u.pathname = u.pathname.replace(/\/.+$/, '/') + path;
    return u.toString();
  } catch {
    // naive fallback
    const idx = base.lastIndexOf('/');
    return (idx >= 0 ? base.slice(0, idx + 1) : base) + path;
  }
}

export async function getPlayableUri(url: string): Promise<string> {
  const idx = await readIndex();
  const hitIndex = idx.findIndex((e) => e.url === url);
  if (hitIndex >= 0) {
    // Move to front to keep it hot
    const [hit] = idx.splice(hitIndex, 1);
    idx.unshift(hit);
    // Optionally trim if oversized
    if (idx.length > MAX_ENTRIES) {
      const removed = idx.splice(MAX_ENTRIES);
      for (const r of removed) {
        try { await FileSystem.deleteAsync(r.localPlaylist.replace(/index\.m3u8$/, ''), { idempotent: true }); } catch {}
      }
    }
    await writeIndex(idx);
    return hit.localPlaylist || url;
  }
  return url;
}

export async function prefetchHls(url: string, seconds = 8): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const playlist = await res.text();
    if (!playlist.includes('#EXTM3U')) return null;

    // Parse segments with durations
    const lines = playlist.split(/\r?\n/);
    type Seg = { dur: number; uri: string };
    const segs: Seg[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const m = line.match(/^#EXTINF:([0-9.]+)/);
        const dur = m ? parseFloat(m[1]) : 0;
        // next non-empty, non-comment line should be segment URI
        let j = i + 1;
        while (j < lines.length && (lines[j].trim() === '' || lines[j].trim().startsWith('#'))) j++;
        const uri = j < lines.length ? lines[j].trim() : '';
        if (uri) segs.push({ dur, uri });
      }
    }

    // Download until we reach ~seconds (min 3 segments)
    let acc = 0;
    const chosen: Seg[] = [];
    for (const s of segs) {
      chosen.push(s);
      acc += Math.max(0, s.dur || 0);
      if (acc >= seconds && chosen.length >= 3) break;
    }
    if (!chosen.length) return null;

    // Write local files
    const dir = ROOT + safeName(url) + '/';
    await ensureDir(dir);

    const localMap: Record<string, string> = {};
    // Download in parallel with mild fanout
    await Promise.all(
      chosen.map(async (s, idx) => {
        const abs = resolveUrl(url, s.uri);
        const local = `${dir}seg_${idx}.ts`;
        try {
          await FileSystem.downloadAsync(abs, local);
          localMap[s.uri] = local; // map original relative to local
        } catch {}
      })
    );

    // Rewrite playlist: replace first occurrences of chosen segment URIs to local file paths
    const rewritten = lines
      .map((ln) => {
        const t = ln.trim();
        if (!t || t.startsWith('#')) return ln; // keep comments
        if (localMap[t]) return localMap[t];
        return ln;
      })
      .join('\n');

    const playlistPath = dir + 'index.m3u8';
    await FileSystem.writeAsStringAsync(playlistPath, rewritten);

    // Update LRU index
    const index = await readIndex();
    const existing = index.findIndex((e) => e.url === url);
    const entry: CacheEntry = { url, localPlaylist: playlistPath, createdAt: Date.now() };
    if (existing >= 0) index.splice(existing, 1);
    index.unshift(entry);
    // Trim and delete old dirs
    if (index.length > MAX_ENTRIES) {
      const removed = index.splice(MAX_ENTRIES);
      for (const r of removed) {
        try { await FileSystem.deleteAsync(r.localPlaylist.replace(/index\.m3u8$/, ''), { idempotent: true }); } catch {}
      }
    }
    await writeIndex(index);

    return playlistPath;
  } catch {
    return null;
  }
}

export async function prefetchForFeed(urls: string[], count = 10, seconds = 8): Promise<void> {
  const list = urls.slice(0, count);
  await ensureDir(ROOT);
  // Prefetch HLS only; MP4 left to normal streaming
  await Promise.all(
    list.map((u) => (u.endsWith('.m3u8') ? prefetchHls(u, seconds) : Promise.resolve(null)))
  );
}
