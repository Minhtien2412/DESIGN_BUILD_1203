import { getItem, setItem } from '@/utils/storage';

export type FollowEdge = { followerId: string; followeeId: string; since: number };

const KEY = 'social:follows:v1';

async function readAll(): Promise<FollowEdge[]> {
  try {
    const raw = await getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list as FollowEdge[];
  } catch {
    return [];
  }
}

async function writeAll(list: FollowEdge[]) {
  try {
    await setItem(KEY, JSON.stringify(list));
  } catch {}
}

export async function isFollowing(followerId: string, followeeId: string): Promise<boolean> {
  const list = await readAll();
  return list.some((e) => e.followerId === followerId && e.followeeId === followeeId);
}

export async function follow(followerId: string, followeeId: string): Promise<void> {
  if (followerId === followeeId) return;
  const list = await readAll();
  if (list.some((e) => e.followerId === followerId && e.followeeId === followeeId)) return;
  list.unshift({ followerId, followeeId, since: Date.now() });
  await writeAll(list);
}

export async function unfollow(followerId: string, followeeId: string): Promise<void> {
  const list = await readAll();
  const next = list.filter((e) => !(e.followerId === followerId && e.followeeId === followeeId));
  await writeAll(next);
}

export async function listFollowing(userId: string): Promise<string[]> {
  const list = await readAll();
  return list.filter((e) => e.followerId === userId).map((e) => e.followeeId);
}

export async function listFollowers(userId: string): Promise<string[]> {
  const list = await readAll();
  return list.filter((e) => e.followeeId === userId).map((e) => e.followerId);
}
