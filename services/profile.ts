import { getItem, setItem } from '@/utils/storage';

export type UserProfileDetails = {
  userId: string;
  name?: string;
  bio?: string;
  avatar?: string;
  cover?: string;
  email?: string;
};

const key = (userId: string) => `profile:${userId}`;

export async function getProfile(userId: string): Promise<UserProfileDetails | null> {
  try {
    const raw = await getItem(key(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfileDetails;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveProfile(details: UserProfileDetails): Promise<void> {
  const data = JSON.stringify(details);
  await setItem(key(details.userId), data);
}

// Generate a deterministic avatar URL for a user (remote placeholder)
// We use pravatar which supports unique images by query param.
export function getAvatarUrlFor(userId: string, seed?: string): string {
  const s = encodeURIComponent(seed || userId || 'user');
  return `https://i.pravatar.cc/80?u=${s}`;
}
