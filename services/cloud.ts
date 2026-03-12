import { getItem, setItem } from '@/utils/storage';

export type CloudItemType = 'note' | 'image' | 'video' | 'link' | 'file';

export type CloudItem = {
  id: string;
  type: CloudItemType;
  createdAt: number;
  pinned?: boolean;
  // Common optional fields
  text?: string; // For notes or link titles
  url?: string; // For links
  uri?: string; // For local media/file
  mime?: string;
  width?: number;
  height?: number;
  duration?: number; // seconds
  size?: number; // bytes
};

const key = (userId: string) => `cloud:${userId}`;

export async function getCloudItems(userId: string): Promise<CloudItem[]> {
  try {
    const raw = await getItem(key(userId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as CloudItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function setCloudItems(userId: string, items: CloudItem[]): Promise<void> {
  await setItem(key(userId), JSON.stringify(items));
}

export async function addCloudItem(userId: string, item: Omit<CloudItem, 'id' | 'createdAt'> & Partial<Pick<CloudItem, 'createdAt'>>): Promise<CloudItem> {
  const items = await getCloudItems(userId);
  const next: CloudItem = {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: item.createdAt ?? Date.now(),
    type: item.type,
    pinned: item.pinned,
    text: item.text,
    url: item.url,
    uri: item.uri,
    mime: item.mime,
    width: item.width,
    height: item.height,
    duration: item.duration,
    size: item.size,
  };
  const all = [next, ...items].sort((a, b) => b.createdAt - a.createdAt);
  await setCloudItems(userId, all);
  return next;
}

export async function deleteCloudItem(userId: string, id: string): Promise<boolean> {
  const items = await getCloudItems(userId);
  const remaining = items.filter(x => x.id !== id);
  const changed = remaining.length !== items.length;
  if (changed) await setCloudItems(userId, remaining);
  return changed;
}

export async function clearCloud(userId: string): Promise<void> {
  await setCloudItems(userId, []);
}

export function filterItems(items: CloudItem[], type: CloudItemType | 'all'): CloudItem[] {
  if (type === 'all') return items;
  return items.filter(x => x.type === type);
}

export function searchItems(items: CloudItem[], query: string): CloudItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((x) => {
    if (x.text && x.text.toLowerCase().includes(q)) return true;
    if (x.url && x.url.toLowerCase().includes(q)) return true;
    if (x.uri && x.uri.toLowerCase().includes(q)) return true;
    return false;
  });
}

export async function setCloudItemPinned(userId: string, id: string, pinned: boolean): Promise<boolean> {
  const items = await getCloudItems(userId);
  let changed = false;
  const next = items.map(it => {
    if (it.id === id) {
      changed = true;
      return { ...it, pinned } as CloudItem;
    }
    return it;
  });
  if (changed) await setCloudItems(userId, next);
  return changed;
}

export async function toggleCloudItemPinned(userId: string, id: string): Promise<boolean> {
  const items = await getCloudItems(userId);
  const it = items.find(x => x.id === id);
  if (!it) return false;
  return setCloudItemPinned(userId, id, !it.pinned);
}
