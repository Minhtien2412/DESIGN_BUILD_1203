// Cross-platform storage wrapper
import showToast from '@/utils/toast';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
// We'll lazy-require native-only packages to avoid bundling/import errors on web/SSR.
let AsyncStorage: any | null = null;
let SecureStore: any | null = null;

function tryRequireAsyncStorage() {
  if (!AsyncStorage) {
    try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch { AsyncStorage = null; }
  }
  return AsyncStorage;
}

function tryRequireSecureStore() {
  if (!SecureStore) {
    try { SecureStore = require('expo-secure-store'); } catch { SecureStore = null; }
  }
  return SecureStore;
}

const isWeb = Platform.OS === 'web';
const hasWindow = typeof window !== 'undefined';

export const storage = {
  async get(key: string): Promise<string | null> {
    if (isWeb) {
      if (!hasWindow) return null; // SSR
      try { return (window as any)?.localStorage?.getItem?.(key) ?? null; } catch { return null; }
    }
    try {
      const SS = tryRequireSecureStore();
      if (SS && typeof SS.getItemAsync === 'function') return await SS.getItemAsync(key);
    } catch {}
    try {
      const AS = tryRequireAsyncStorage();
      if (AS && typeof AS.getItem === 'function') return await AS.getItem(key);
    } catch { }
    return null;
  },

  async set(key: string, value: string) {
    if (isWeb) {
      if (!hasWindow) return; // SSR
      try { (window as any)?.localStorage?.setItem?.(key, value); } catch {}
      return;
    }
    try {
      const SS = tryRequireSecureStore();
      if (SS && typeof SS.setItemAsync === 'function') { await SS.setItemAsync(key, value); return; }
    } catch {}
    try {
      const AS = tryRequireAsyncStorage();
      if (AS && typeof AS.setItem === 'function') { await AS.setItem(key, value); }
    } catch {}
  },

  async remove(key: string) {
    if (isWeb) {
      if (!hasWindow) return;
      try { (window as any)?.localStorage?.removeItem?.(key); } catch {}
      return;
    }
    try {
      const SS = tryRequireSecureStore();
      if (SS && typeof SS.deleteItemAsync === 'function') { await SS.deleteItemAsync(key); return; }
    } catch {}
    try {
      const AS = tryRequireAsyncStorage();
      if (AS && typeof AS.removeItem === 'function') { await AS.removeItem(key); }
    } catch {}
  }
,
  // Return all keys (web localStorage keys or AsyncStorage keys)
  async keys(): Promise<string[]> {
    if (isWeb) {
      if (!hasWindow) return [];
      try { const ls = (window as any)?.localStorage; return ls ? Object.keys(ls) : []; } catch { return []; }
    }
    try { const AS = tryRequireAsyncStorage(); if (AS && typeof AS.getAllKeys === 'function') { const k = await AS.getAllKeys(); return k as string[]; } } catch {}
    return [];
  },

  async multiRemove(keys: string[]) {
    if (!Array.isArray(keys) || !keys.length) return;
    if (isWeb) {
      if (!hasWindow) return;
      try {
        const ls = (window as any)?.localStorage;
        if (ls) keys.forEach(k => { try { ls.removeItem(k); } catch {} });
      } catch {}
      return;
    }
    try { const AS = tryRequireAsyncStorage(); if (AS && typeof AS.multiRemove === 'function') await AS.multiRemove(keys); } catch { }
  }
};

// Lazy import to avoid crashing if dependency not installed in some envs
let MediaLibrary: any;
async function getMediaLibrary() {
  if (!MediaLibrary) {
    try { 
      // Use require instead of dynamic import to avoid Metro async-require issues
      MediaLibrary = require('expo-media-library'); 
    } catch { 
      MediaLibrary = null; 
    }
  }
  return MediaLibrary;
}

export type StoragePermissionStatus = 'granted' | 'denied' | 'limited' | 'undetermined';

export async function requestStoragePermission(): Promise<StoragePermissionStatus> {
  if (Platform.OS === 'web') return 'granted';
  try {
    const ML = await getMediaLibrary();
    if (!ML) return 'undetermined';
    const { status, canAskAgain } = await ML.requestPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'limited') return 'limited';
    return canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'undetermined';
  }
}

export async function ensureCategoryAlbum(category: string) {
  // Creates or gets an album under Photos for saving exported media per category
  try {
    const ML = await getMediaLibrary();
    if (!ML) return null;
    const albumName = `ADB-${category}`;
    let album = await ML.getAlbumAsync(albumName);
    if (!album) {
      album = await ML.createAlbumAsync(albumName, undefined, false);
    }
    return album;
  } catch {
    return null;
  }
}

export async function ensureCategoryDir(category: string) {
  try {
    const base = (FileSystem as { documentDirectory?: string }).documentDirectory || 'file://';
    const dir = `${base}media/${category}/`;
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    return dir;
  } catch {
    return null;
  }
}

export async function saveVideoItemToLibrary(item: { id: string; title?: string; url: string | number; category?: string }): Promise<boolean> {
  try {
    const ML = await getMediaLibrary();
    if (!ML) {
      showToast('Thiếu gói expo-media-library để lưu vào thư viện');
      return false;
    }
    const status = await requestStoragePermission();
    if (!(status === 'granted' || status === 'limited')) {
      showToast('Cần quyền lưu trữ để lưu video');
      return false;
    }

    let localUri: string | null = null;
    // Handle inline require() assets via expo-asset
    if (typeof item.url === 'number') {
      const asset = Asset.fromModule(item.url);
      await asset.downloadAsync();
      localUri = asset.localUri || asset.uri || null;
    } else if (typeof item.url === 'string') {
      // Only support MP4 for saving
      if (!/\.mp4($|\?)/i.test(item.url)) {
        showToast('Hiện chỉ hỗ trợ lưu định dạng MP4');
        return false;
      }
      const base = (FileSystem as { cacheDirectory?: string }).cacheDirectory || (FileSystem as any).documentDirectory || 'file://';
      const target = `${base}save-${item.id.replace(/[^a-z0-9_-]/gi, '')}.mp4`;
      try {
        const res = await FileSystem.downloadAsync(item.url, target);
        localUri = res.uri;
      } catch {
        showToast('Tải video thất bại');
        return false;
      }
    }

    if (!localUri) {
      showToast('Không lấy được file video cục bộ');
      return false;
    }

    const asset = await ML.createAssetAsync(localUri);
    const category = item.category || 'reels';
    const album = await ensureCategoryAlbum(category);
    if (album) {
      try { await ML.addAssetsToAlbumAsync([asset], album, false); } catch {}
    }
    showToast('Đã lưu video vào thư viện');
    return true;
  } catch (e) {
    showToast('Lưu video thất bại');
    return false;
  }
}

// Save a local file URI (e.g., an MP4 you recorded/exported) directly to Photos/Media Library
export async function saveLocalVideoToLibrary(localUri: string, opts?: { category?: string }): Promise<boolean> {
  try {
    const ML = await getMediaLibrary();
    if (!ML) {
      showToast('Thiếu gói expo-media-library để lưu vào thư viện');
      return false;
      
    }
    const status = await requestStoragePermission();
    if (!(status === 'granted' || status === 'limited')) {
      showToast('Cần quyền lưu trữ để lưu video');
      return false;
    }
    // Basic guard: only MP4 supported for now
    if (!/\.mp4($|\?)/i.test(localUri)) {
      // Still attempt save; some platforms handle other containers
    }
    const asset = await ML.createAssetAsync(localUri);
    const category = opts?.category || 'reels';
    const album = await ensureCategoryAlbum(category);
    if (album) {
      try { await ML.addAssetsToAlbumAsync([asset], album, false); } catch {}
    }
    showToast('Đã lưu video vào thư viện');
    return true;
  } catch {
    showToast('Lưu video thất bại');
    return false;
  }
}
