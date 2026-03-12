import { getItem, setItem } from '@/utils/storage';

export type Post = {
  id: string;
  userId: string;
  content: string;
  createdAt: number; // epoch ms
  media?: string[]; // array of local or remote URIs
};

const key = (userId: string) => `posts:${userId}`;

export async function listPosts(userId: string): Promise<Post[]> {
  try {
    const raw = await getItem(key(userId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as Post[];
    if (!Array.isArray(arr)) return [];
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function addPost(userId: string, content: string, media?: string[]): Promise<Post> {
  const existing = await listPosts(userId);
  const post: Post = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    content,
    createdAt: Date.now(),
    media: media && media.length ? media : undefined,
  };
  const next = [post, ...existing];
  await setItem(key(userId), JSON.stringify(next));
  return post;
}

export async function removePost(userId: string, postId: string): Promise<void> {
  const existing = await listPosts(userId);
  const next = existing.filter((p) => p.id !== postId);
  await setItem(key(userId), JSON.stringify(next));
}

export async function updatePost(userId: string, postId: string, content: string): Promise<void> {
  const existing = await listPosts(userId);
  const next = existing.map((p) => (p.id === postId ? { ...p, content } : p));
  await setItem(key(userId), JSON.stringify(next));
}
