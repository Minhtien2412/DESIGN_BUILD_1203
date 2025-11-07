import { getItem, setItem } from '@/utils/storage';
import { logActivity } from './activityLog';

export type Audience = 'public' | 'followers' | 'private';

export type PostStats = {
  reactions: number;
  comments: number;
  shares: number;
  views?: number;
};

export type PostComment = {
  id: string;
  content: string;
  author?: string;
  createdAt: number;
  parentId?: string; // for threaded replies
};

export type PostAuthor = {
  id: string;
  name?: string;
  avatar?: string; // remote uri
};

export type CategoryPost = {
  id: string;
  category: string;
  type: 'image' | 'video' | 'text';
  uri?: string; // optional for text posts
  caption?: string;
  title?: string;
  createdAt: number;
  audience: Audience;
  allowComments: boolean;
  hashtags: string[];
  stats: PostStats;
  liked?: boolean; // client-side like state
  author?: PostAuthor;
  // Optional location/place
  place?: { name: string; lat?: number; lng?: number };
  // Optional styling for text-only posts
  bgColor?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontScale?: number; // 1 = base, 1.2 = larger
  // Multi-media support
  media?: Array<{ type: 'image' | 'video'; uri: string }>;
  layout?: 'auto' | 'two-col' | 'mosaic-3' | 'grid-4' | 'grid-5';
  // Comments
  comments?: PostComment[];
  // Moderation
  status?: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: number;
};

const key = (slug: string) => `cat-posts:${slug}`;

export async function listCategoryPosts(slug: string): Promise<CategoryPost[]> {
  try {
    const raw = await getItem(key(slug));
    if (!raw) return [];
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) return [];
    // normalize older records with defaults
    const normalized: CategoryPost[] = arr.map((it) => ({
      id: String(it.id),
      category: String(it.category),
      type: it.type === 'image' ? 'image' : it.type === 'text' ? 'text' : 'video',
      uri: typeof it.uri === 'string' ? it.uri : undefined,
      caption: it.caption ?? undefined,
  title: typeof it.title === 'string' ? it.title : undefined,
      createdAt: typeof it.createdAt === 'number' ? it.createdAt : Date.parse(it.createdAt ?? Date.now()),
      audience: (it.audience as Audience) ?? 'public',
      allowComments: typeof it.allowComments === 'boolean' ? it.allowComments : true,
      hashtags: Array.isArray(it.hashtags) ? it.hashtags : [],
      stats: {
        reactions: Number(it?.stats?.reactions ?? 0),
        comments: Number(it?.stats?.comments ?? 0),
        shares: Number(it?.stats?.shares ?? 0),
        views: typeof it?.stats?.views === 'number' ? it.stats.views : undefined,
      },
      liked: typeof it.liked === 'boolean' ? it.liked : false,
      author: it.author && typeof it.author === 'object' ? {
        id: String(it.author.id ?? ''),
        name: typeof it.author.name === 'string' ? it.author.name : undefined,
        avatar: typeof it.author.avatar === 'string' ? it.author.avatar : undefined,
      } : undefined,
      place: it.place && typeof it.place === 'object' && typeof it.place.name === 'string'
        ? { name: it.place.name, lat: typeof it.place.lat === 'number' ? it.place.lat : undefined, lng: typeof it.place.lng === 'number' ? it.place.lng : undefined }
        : (typeof it.placeName === 'string' ? { name: it.placeName } : (typeof it.location === 'string' ? { name: it.location } : undefined)),
      bgColor: typeof it.bgColor === 'string' ? it.bgColor : undefined,
      textColor: typeof it.textColor === 'string' ? it.textColor : undefined,
      textAlign: it.textAlign === 'center' || it.textAlign === 'right' ? it.textAlign : 'left',
      fontScale: typeof it.fontScale === 'number' ? it.fontScale : undefined,
      media: Array.isArray(it.media)
        ? it.media
            .filter((m: any) => m && (m.type === 'image' || m.type === 'video') && typeof m.uri === 'string')
            .map((m: any) => ({ type: m.type as 'image' | 'video', uri: String(m.uri) }))
        : (typeof it.uri === 'string' && (it.type === 'image' || it.type === 'video')
            ? [{ type: it.type, uri: String(it.uri) }]
            : undefined),
      layout: (it.layout === 'two-col' || it.layout === 'mosaic-3' || it.layout === 'grid-4' || it.layout === 'grid-5') ? it.layout : 'auto',
      comments: Array.isArray(it.comments)
        ? it.comments.map((c: any) => ({
            id: String(c.id),
            content: String(c.content ?? ''),
            author: typeof c.author === 'string' ? c.author : undefined,
            createdAt: typeof c.createdAt === 'number' ? c.createdAt : Date.now(),
            parentId: typeof c.parentId === 'string' ? c.parentId : undefined,
          }))
        : [],
    }));
    return normalized.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function addCategoryPost(
  slug: string,
  post: Omit<CategoryPost, 'id' | 'createdAt' | 'category' | 'stats' | 'audience' | 'allowComments' | 'hashtags'> & {
    audience?: Audience;
    allowComments?: boolean;
    hashtags?: string[];
    stats?: Partial<PostStats>;
  }
): Promise<CategoryPost> {
  const existing = await listCategoryPosts(slug);
  // Derive single media fallback for compatibility
  let primaryType: 'image' | 'video' | 'text' = post.type;
  let primaryUri: string | undefined = post.uri;
  if (!primaryUri && Array.isArray(post.media) && post.media.length > 0) {
    primaryType = post.media[0].type;
    primaryUri = post.media[0].uri;
  }
  const item: CategoryPost = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: slug,
    type: primaryType,
    uri: primaryUri,
    caption: post.caption,
  title: post.title,
    createdAt: Date.now(),
    audience: post.audience ?? 'public',
    allowComments: post.allowComments ?? true,
    hashtags: post.hashtags ?? [],
    stats: {
      reactions: post.stats?.reactions ?? 0,
      comments: post.stats?.comments ?? 0,
      shares: post.stats?.shares ?? 0,
      views: post.stats?.views,
    },
    liked: false,
    author: post.author,
  place: post.place,
    bgColor: post.bgColor,
    textColor: post.textColor,
    textAlign: post.textAlign,
    fontScale: post.fontScale,
    media: Array.isArray(post.media) && post.media.length > 0 ? post.media.map(m => ({ type: m.type, uri: m.uri })) : undefined,
    layout: post.layout ?? 'auto',
    comments: [],
    status: 'pending',
  };
  const next = [item, ...existing];
  await setItem(key(slug), JSON.stringify(next));
  try {
    await logActivity({ type: 'post:create', actorId: item.author?.id, actorName: item.author?.name, target: { kind: 'category', slug }, meta: { postId: item.id, type: item.type } });
  } catch {}
  return item;
}

export async function reviewCategoryPost(
  slug: string,
  id: string,
  action: 'approve' | 'reject',
  reviewer?: { id?: string; name?: string }
): Promise<CategoryPost | null> {
  const items = await listCategoryPosts(slug);
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: CategoryPost = {
    ...items[idx],
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewedBy: reviewer?.id,
    reviewedAt: Date.now(),
  };
  const next = [...items];
  next[idx] = updated;
  await saveAll(slug, next);
  try { await logActivity({ type: 'system:info', actorId: reviewer?.id, actorName: reviewer?.name, target: { kind: 'category', slug, id }, meta: { subtype: 'post:review', action } }); } catch {}
  return updated;
}

async function saveAll(slug: string, items: CategoryPost[]) {
  await setItem(key(slug), JSON.stringify(items));
}

export async function updateCategoryPost(
  slug: string,
  id: string,
  patch: Partial<Omit<CategoryPost, 'id' | 'category'>>
): Promise<CategoryPost | null> {
  const items = await listCategoryPosts(slug);
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: CategoryPost = { ...items[idx], ...patch };
  const next = [...items];
  next[idx] = updated;
  await saveAll(slug, next);
  try { await logActivity({ type: 'system:info', target: { kind: 'category', slug, id }, meta: { subtype: 'post:update', keys: Object.keys(patch) } }); } catch {}
  return updated;
}

export async function deleteCategoryPost(slug: string, id: string): Promise<boolean> {
  const items = await listCategoryPosts(slug);
  const next = items.filter((p) => p.id !== id);
  if (next.length === items.length) return false;
  await saveAll(slug, next);
  return true;
}

export async function toggleLike(
  slug: string,
  id: string,
  actor?: { id?: string; name?: string }
): Promise<CategoryPost | null> {
  const items = await listCategoryPosts(slug);
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const current = items[idx];
  const liked = !current.liked;
  const reactions = Math.max(0, (current.stats?.reactions ?? 0) + (liked ? 1 : -1));
  const updated: CategoryPost = { ...current, liked, stats: { ...current.stats, reactions } };
  const next = [...items];
  next[idx] = updated;
  await saveAll(slug, next);
  try {
    await logActivity({ type: liked ? 'post:like' : 'post:unlike', actorId: actor?.id, actorName: actor?.name, target: { kind: 'category', slug, id }, meta: { reactions } });
  } catch {}
  return updated;
}

export async function addComment(
  slug: string,
  id: string,
  content: string,
  author?: string,
  parentId?: string
): Promise<CategoryPost | null> {
  const items = await listCategoryPosts(slug);
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const post = items[idx];
  if (post.allowComments === false) return post;
  const comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    content,
    author,
    createdAt: Date.now(),
    parentId,
  } satisfies PostComment;
  const comments = [...(post.comments ?? []), comment];
  const stats = { ...post.stats, comments: (post.stats?.comments ?? 0) + 1 };
  const updated: CategoryPost = { ...post, comments, stats };
  const next = [...items];
  next[idx] = updated;
  await saveAll(slug, next);
  try {
    await logActivity({ type: parentId ? 'comment:add' : 'comment:add', actorId: author, target: { kind: 'category', slug, id }, meta: { commentId: comment.id, parentId } });
  } catch {}
  return updated;
}

export async function addReply(
  slug: string,
  postId: string,
  parentCommentId: string,
  content: string,
  author?: string
): Promise<CategoryPost | null> {
  return addComment(slug, postId, content, author, parentCommentId);
}

export async function updateComment(
  slug: string,
  postId: string,
  commentId: string,
  content: string
): Promise<CategoryPost | null> {
  const items = await listCategoryPosts(slug);
  const idx = items.findIndex((p) => p.id === postId);
  if (idx === -1) return null;
  const post = items[idx];
  const comments = (post.comments ?? []).map((c) => (c.id === commentId ? { ...c, content } : c));
  const updated: CategoryPost = { ...post, comments };
  const next = [...items];
  next[idx] = updated;
  await saveAll(slug, next);
  try {
    await logActivity({ type: 'comment:update', target: { kind: 'category', slug, id: postId }, meta: { commentId } });
  } catch {}
  return updated;
}

export async function deleteComment(
  slug: string,
  postId: string,
  commentId: string
): Promise<CategoryPost | null> {
  const items = await listCategoryPosts(slug);
  const idx = items.findIndex((p) => p.id === postId);
  if (idx === -1) return null;
  const post = items[idx];
  const before = post.comments ?? [];
  // recursively remove comment and its replies
  const toDelete = new Set<string>([commentId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of before) {
      if (c.parentId && toDelete.has(c.parentId) && !toDelete.has(c.id)) {
        toDelete.add(c.id);
        changed = true;
      }
    }
  }
  const comments = before.filter((c) => !toDelete.has(c.id));
  const delta = before.length - comments.length;
  const stats = { ...post.stats, comments: Math.max(0, (post.stats?.comments ?? 0) - delta) };
  const updated: CategoryPost = { ...post, comments, stats };
  const next = [...items];
  next[idx] = updated;
  await saveAll(slug, next);
  try {
    await logActivity({ type: 'comment:delete', target: { kind: 'category', slug, id: postId }, meta: { commentId } });
  } catch {}
  return updated;
}

export async function incrementShare(
  slug: string,
  postId: string,
  actor?: { id?: string; name?: string }
): Promise<CategoryPost | null> {
  const items = await listCategoryPosts(slug);
  const idx = items.findIndex((p) => p.id === postId);
  if (idx === -1) return null;
  const post = items[idx];
  const stats = { ...post.stats, shares: (post.stats?.shares ?? 0) + 1 };
  const updated: CategoryPost = { ...post, stats };
  const next = [...items];
  next[idx] = updated;
  await saveAll(slug, next);
  try {
    await logActivity({ type: 'post:share', actorId: actor?.id, actorName: actor?.name, target: { kind: 'category', slug, id: postId } });
  } catch {}
  return updated;
}
