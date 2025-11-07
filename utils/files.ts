import { getItem, setItem } from '@/utils/storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// Compatibility layer for expo-file-system where TS types might not expose all fields
type StorageAccessFrameworkCompat = {
  requestDirectoryPermissionsAsync: () => Promise<{ granted: boolean; directoryUri?: string }>;
  createDirectoryAsync: (parentUri: string, dirName: string) => Promise<string>;
  createFileAsync: (dirUri: string, fileName: string, mimeType: string) => Promise<string>;
  readDirectoryAsync: (dirUri: string) => Promise<string[]>;
};

type ExpoFileSystemCompat = typeof FileSystem & {
  documentDirectory?: string | null;
  cacheDirectory?: string | null;
  StorageAccessFramework?: StorageAccessFrameworkCompat;
};

const FS = FileSystem as unknown as ExpoFileSystemCompat;

export const NX_DIR_NAME = 'nx';

export function getNxDirUri(): string {
  const base = FS.documentDirectory || FS.cacheDirectory || '';
  return `${base}${NX_DIR_NAME}/`;
}

export async function ensureNxDir(): Promise<string> {
  const dirUri = getNxDirUri();
  try {
    const info = await FileSystem.getInfoAsync(dirUri);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }
  } catch (e) {
    // Best effort; try to create
    try { await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true }); } catch {}
  }
  return dirUri;
}

export type NxEntry = {
  name: string;
  uri: string;
  size?: number;
  modified?: number; // ms epoch
};

export async function listNxFiles(): Promise<NxEntry[]> {
  const dirUri = await ensureNxDir();
  try {
    const names = await FS.readDirectoryAsync(dirUri);
    const entries: NxEntry[] = [];
    for (const name of names) {
      const uri = dirUri + name;
      try {
        const info = await FS.getInfoAsync(uri);
        entries.push({ name, uri, size: (info as any).size, modified: (info as any).modificationTime });
      } catch {
        entries.push({ name, uri });
      }
    }
    // newest first by modification, then name
    return entries.sort((a, b) => (b.modified || 0) - (a.modified || 0) || a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function saveToNx(srcUri: string, suggestedName?: string): Promise<NxEntry> {
  const dirUri = await ensureNxDir();
  const base = suggestedName || srcUri.split('/').pop() || `file_${Date.now()}`;
  const safe = sanitizeFilename(base);
  const dest = dirUri + safe;
  // If exists, add suffix
  let finalDest = dest;
  let idx = 1;
  while ((await FS.getInfoAsync(finalDest)).exists) {
    const dot = safe.lastIndexOf('.');
    const name = dot > 0 ? safe.slice(0, dot) : safe;
    const ext = dot > 0 ? safe.slice(dot) : '';
    finalDest = `${dirUri}${name}_${idx}${ext}`;
    idx += 1;
  }
  await FS.copyAsync({ from: srcUri, to: finalDest });
  const info = await FS.getInfoAsync(finalDest);
  return { name: finalDest.replace(dirUri, ''), uri: finalDest, size: (info as any).size, modified: (info as any).modificationTime };
}

export function inferTypeFromName(name: string): 'image' | 'video' | 'file' {
  const lower = name.toLowerCase();
  if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.heic)$/.test(lower)) return 'image';
  if (/(\.mp4|\.mov|\.m4v|\.avi|\.webm)$/.test(lower)) return 'video';
  return 'file';
}

// Android external directory support using StorageAccessFramework
const EXTERNAL_NX_DIR_KEY = 'nx:external_dir';

export async function requestExternalNxDir(): Promise<string | null> {
  if (Platform.OS !== 'android' || !FS.StorageAccessFramework) return null;
  try {
    const perm = await FS.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perm.granted || !perm.directoryUri) return null;
    // Try to create nx subdirectory
    let nxDir = perm.directoryUri;
    try {
      nxDir = await FS.StorageAccessFramework.createDirectoryAsync(perm.directoryUri, NX_DIR_NAME);
    } catch {
      // If exists, attempt to resolve by appending /NX_DIR_NAME
      nxDir = perm.directoryUri; // keep as chosen root if cannot create
    }
    await setItem(EXTERNAL_NX_DIR_KEY, nxDir);
    return nxDir;
  } catch {
    return null;
  }
}

export async function getExternalNxDirUri(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  const uri = await getItem(EXTERNAL_NX_DIR_KEY);
  return uri;
}

export async function saveToExternalNx(srcUri: string, suggestedName?: string, mime?: string): Promise<NxEntry> {
  if (Platform.OS !== 'android' || !FS.StorageAccessFramework) throw new Error('External NX unsupported');
  const dirUri = await getExternalNxDirUri();
  if (!dirUri) throw new Error('External NX not set');
  const base = suggestedName || srcUri.split('/').pop() || `file_${Date.now()}`;
  const safe = sanitizeFilename(base);
  let fileUri: string | null = null;
  let idx = 0;
  while (!fileUri && idx < 10) {
    const name = idx === 0 ? safe : (() => { const dot = safe.lastIndexOf('.'); const n = dot > 0 ? safe.slice(0, dot) : safe; const e = dot > 0 ? safe.slice(dot) : ''; return `${n}_${idx}${e}`; })();
    try {
      fileUri = await FS.StorageAccessFramework!.createFileAsync(dirUri, name, mime || 'application/octet-stream');
    } catch {
      idx += 1;
    }
  }
  if (!fileUri) throw new Error('Cannot create file');
  const base64 = await FS.readAsStringAsync(srcUri, { encoding: 'base64' as any });
  await FS.writeAsStringAsync(fileUri, base64, { encoding: 'base64' as any });
  const info = await FS.getInfoAsync(fileUri);
  const name = decodeURIComponent((fileUri.split('/').pop() || '').split('?')[0] || safe);
  return { name, uri: fileUri, size: (info as any).size, modified: (info as any).modificationTime };
}

export async function listExternalNxFiles(): Promise<NxEntry[]> {
  if (Platform.OS !== 'android' || !FS.StorageAccessFramework) return [];
  const dirUri = await getExternalNxDirUri();
  if (!dirUri) return [];
  try {
    const uris = await FS.StorageAccessFramework.readDirectoryAsync(dirUri);
    const entries: NxEntry[] = [];
    for (const uri of uris) {
      try {
        const info = await FS.getInfoAsync(uri);
        const name = decodeURIComponent((uri.split('/').pop() || '').split('?')[0] || 'file');
        entries.push({ name, uri, size: (info as any).size, modified: (info as any).modificationTime });
      } catch {
        const name = decodeURIComponent((uri.split('/').pop() || '').split('?')[0] || 'file');
        entries.push({ name, uri });
      }
    }
    return entries.sort((a, b) => (b.modified || 0) - (a.modified || 0) || a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

