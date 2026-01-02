/**
 * Avatar Hook - Single source of truth for avatar across app
 * Handles: fetch, upload, cache busting, optimistic updates
 */

import { useAuth } from '@/context/AuthContext';
import { uploadAvatar } from '@/services/api/profileApi';
import { resolveAvatar } from '@/utils/avatar';
import { useMemo, useState } from 'react';

export interface UseAvatarReturn {
  avatarUrl: string;
  upload: (uri: string) => Promise<string>;
  uploading: boolean;
  error: string | null;
}

export function useAvatarUpload(): UseAvatarReturn {
  const { user, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  // Resolve avatar URL with cache busting
  const avatarUrl = useMemo(() => {
    return resolveAvatar(user?.avatar, {
      userId: user?.id,
      nameFallback: user?.name,
      size: 120,
      cacheBust: cacheBuster,
    });
  }, [user?.avatar, user?.id, user?.name, cacheBuster]);

  const upload = async (uri: string): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      // Convert local URI to Blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create File object for upload
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

      // Upload to backend
      const newAvatarUrl = await uploadAvatar(file);

      // Update global state (AuthContext)
      await updateAvatar(newAvatarUrl);

      // Force re-render with new cache buster
      setCacheBuster(Date.now());

      return newAvatarUrl;
    } catch (err: any) {
      const errorMessage = err?.message || 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    avatarUrl,
    upload,
    uploading,
    error,
  };
}

// Keep existing useAvatar hook for read-only usage
import { type AvatarSource } from '@/utils/avatar';

/**
 * Options for avatar resolution
 */
export interface UseAvatarOptions {
  /** User ID for fallback placeholder generation */
  userId?: string;
  /** Name fallback for placeholder generation */
  nameFallback?: string;
  /** Avatar size for optimized loading */
  size?: number;
  /** Force cache bust with timestamp */
  cacheBust?: boolean;
  /** Custom timestamp for cache busting (defaults to Date.now()) */
  cacheBustTimestamp?: number;
}

/**
 * Hook that returns a memoized, resolved avatar URL.
 * 
 * This hook automatically:
 * - Resolves avatar URLs (remote, relative, or placeholder)
 * - Adds cache-busting query params when needed
 * - Memoizes the result to prevent unnecessary re-renders
 * - Derives version from AuthContext.user.avatar when no explicit source provided
 * 
 * @param avatarSource - Explicit avatar URL/path (overrides auth user avatar)
 * @param options - Resolution options
 * @returns Fully resolved, memoized avatar URL
 * 
 * @example
 * // Use current user's avatar
 * const avatarUrl = useAvatar();
 * 
 * @example
 * // Use specific avatar with cache bust
 * const avatarUrl = useAvatar('uploads/avatars/user-123.jpg', { 
 *   cacheBust: true,
 *   size: 120 
 * });
 * 
 * @example
 * // Use another user's avatar with fallback
 * const avatarUrl = useAvatar(otherUser?.avatar, {
 *   userId: otherUser?.id,
 *   nameFallback: otherUser?.name,
 *   size: 80
 * });
 */
export function useAvatar(
  avatarSource?: AvatarSource,
  options: UseAvatarOptions = {}
): string {
  const { user } = useAuth();

  // Use explicit source, fallback to auth user's avatar, or undefined
  const sourceToResolve = avatarSource !== undefined ? avatarSource : user?.avatar;

  // Derive userId from options or auth context
  const userId = options.userId || user?.id || 'guest';

  // Derive name from options or auth context
  const nameFallback = options.nameFallback || user?.name || 'User';

  // Generate cache bust timestamp if requested
  const cacheBustValue = useMemo(() => {
    if (!options.cacheBust) return undefined;
    return options.cacheBustTimestamp || Date.now();
  }, [options.cacheBust, options.cacheBustTimestamp]);

  // Memoize the resolved avatar URL
  const resolvedUrl = useMemo(() => {
    const baseUrl = resolveAvatar(sourceToResolve, {
      userId,
      nameFallback,
      size: options.size,
    });

    // Append cache bust if requested
    if (cacheBustValue) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}v=${cacheBustValue}`;
    }

    return baseUrl;
  }, [sourceToResolve, userId, nameFallback, options.size, cacheBustValue]);

  return resolvedUrl;
}

/**
 * Hook variant specifically for the current authenticated user's avatar.
 * Automatically adds cache busting based on profile update timestamp.
 * 
 * @param options - Resolution options (userId and nameFallback ignored, derived from auth)
 * @returns Memoized avatar URL for current user
 * 
 * @example
 * const myAvatarUrl = useCurrentUserAvatar({ size: 120 });
 */
export function useCurrentUserAvatar(
  options: Omit<UseAvatarOptions, 'userId' | 'nameFallback'> = {}
): string {
  const { user } = useAuth();

  return useAvatar(user?.avatar, {
    ...options,
    userId: user?.id,
    nameFallback: user?.name,
    // Auto cache-bust if user object changed (profile update)
    cacheBust: true,
    cacheBustTimestamp: user ? Date.now() : undefined,
  });
}
