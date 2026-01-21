/**
 * User Navigation Hook
 * =====================
 *
 * Centralized navigation to user profiles from anywhere in the app.
 * Provides consistent navigation logic with haptic feedback.
 *
 * Usage:
 * ```tsx
 * const { navigateToProfile, navigateToChat, navigateToCall } = useUserNavigation();
 *
 * // Navigate to profile
 * navigateToProfile(userId);
 * navigateToProfile(userId, { from: 'community_feed' });
 *
 * // Navigate to chat
 * navigateToChat(userId);
 *
 * // Navigate to call
 * navigateToCall(userId, 'video');
 * ```
 *
 * @author ThietKeResort Team
 * @created 2025-01-20
 */

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

export interface NavigationOptions {
  /** Source screen for analytics */
  from?: string;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Additional data to pass */
  params?: Record<string, string | number | boolean>;
}

export interface UserNavigationReturn {
  /** Navigate to user profile */
  navigateToProfile: (
    userId: string | number,
    options?: NavigationOptions
  ) => void;
  /** Navigate to social profile (alternative route) */
  navigateToSocialProfile: (
    userId: string | number,
    options?: NavigationOptions
  ) => void;
  /** Navigate to chat/message with user */
  navigateToChat: (
    userId: string | number,
    options?: NavigationOptions
  ) => void;
  /** Navigate to call user */
  navigateToCall: (
    userId: string | number,
    type?: "voice" | "video",
    options?: NavigationOptions
  ) => void;
  /** Navigate to user's portfolio */
  navigateToPortfolio: (
    userId: string | number,
    options?: NavigationOptions
  ) => void;
  /** Check if navigating to own profile */
  isOwnProfile: (userId: string | number) => boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useUserNavigation(): UserNavigationReturn {
  const router = useRouter();

  /**
   * Navigate to user profile
   */
  const navigateToProfile = useCallback(
    (userId: string | number, options: NavigationOptions = {}) => {
      const { haptic = true, params } = options;

      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Build route with optional params
      let route = `/profile/${userId}`;
      if (params) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join("&");
        route += `?${queryString}`;
      }

      router.push(route as any);
    },
    [router]
  );

  /**
   * Navigate to social profile (Facebook-style)
   */
  const navigateToSocialProfile = useCallback(
    (userId: string | number, options: NavigationOptions = {}) => {
      const { haptic = true } = options;

      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      router.push(`/social/profile/${userId}` as any);
    },
    [router]
  );

  /**
   * Navigate to chat/message
   */
  const navigateToChat = useCallback(
    (userId: string | number, options: NavigationOptions = {}) => {
      const { haptic = true } = options;

      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      router.push(`/messages/chat/${userId}` as any);
    },
    [router]
  );

  /**
   * Navigate to call
   */
  const navigateToCall = useCallback(
    (
      userId: string | number,
      type: "voice" | "video" = "voice",
      options: NavigationOptions = {}
    ) => {
      const { haptic = true } = options;

      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      router.push(`/call/${userId}?type=${type}` as any);
    },
    [router]
  );

  /**
   * Navigate to user's portfolio
   */
  const navigateToPortfolio = useCallback(
    (userId: string | number, options: NavigationOptions = {}) => {
      const { haptic = true } = options;

      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      router.push(`/portfolio/${userId}` as any);
    },
    [router]
  );

  /**
   * Check if userId is current user
   */
  const isOwnProfile = useCallback((userId: string | number): boolean => {
    // This would need to be connected to auth context
    // For now, return false - implement with useAuth()
    return false;
  }, []);

  return {
    navigateToProfile,
    navigateToSocialProfile,
    navigateToChat,
    navigateToCall,
    navigateToPortfolio,
    isOwnProfile,
  };
}

export default useUserNavigation;
