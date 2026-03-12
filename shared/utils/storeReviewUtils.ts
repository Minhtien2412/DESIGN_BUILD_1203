/**
 * Store Review Utilities - Yêu cầu đánh giá ứng dụng
 * Sử dụng expo-store-review để hiện popup đánh giá trên App Store/Play Store
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

// ============================================
// TYPES
// ============================================

export interface ReviewState {
  hasReviewed: boolean;
  lastPromptDate: string | null;
  promptCount: number;
  appOpenCount: number;
  significantEventCount: number;
}

export interface ReviewConfig {
  minAppOpens: number;
  minSignificantEvents: number;
  daysBetweenPrompts: number;
  maxPromptsPerVersion: number;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = "@store_review_state";

const DEFAULT_CONFIG: ReviewConfig = {
  minAppOpens: 5,
  minSignificantEvents: 3,
  daysBetweenPrompts: 7,
  maxPromptsPerVersion: 3,
};

const STORE_URLS = {
  ios: "https://apps.apple.com/app/id{APP_ID}?action=write-review",
  android:
    "https://play.google.com/store/apps/details?id={PACKAGE_NAME}&showAllReviews=true",
};

// ============================================
// STATE MANAGEMENT
// ============================================

/**
 * Get review state from storage
 */
async function getReviewState(): Promise<ReviewState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[StoreReview] Error loading state:", error);
  }

  return {
    hasReviewed: false,
    lastPromptDate: null,
    promptCount: 0,
    appOpenCount: 0,
    significantEventCount: 0,
  };
}

/**
 * Save review state to storage
 */
async function saveReviewState(state: ReviewState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("[StoreReview] Error saving state:", error);
  }
}

// ============================================
// REVIEW UTILITIES
// ============================================

/**
 * Check if store review is available
 */
export async function isReviewAvailable(): Promise<boolean> {
  try {
    return await StoreReview.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Check if review has already been given
 */
export async function hasReviewed(): Promise<boolean> {
  const state = await getReviewState();
  return state.hasReviewed;
}

/**
 * Track app open (call on app start)
 */
export async function trackAppOpen(): Promise<void> {
  const state = await getReviewState();
  state.appOpenCount++;
  await saveReviewState(state);
}

/**
 * Track significant event (purchase, project complete, etc.)
 */
export async function trackSignificantEvent(): Promise<void> {
  const state = await getReviewState();
  state.significantEventCount++;
  await saveReviewState(state);
}

/**
 * Check if conditions are met to request review
 */
export async function shouldRequestReview(
  config: Partial<ReviewConfig> = {},
): Promise<boolean> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const state = await getReviewState();

  // Already reviewed
  if (state.hasReviewed) {
    return false;
  }

  // Check max prompts
  if (state.promptCount >= cfg.maxPromptsPerVersion) {
    return false;
  }

  // Check minimum app opens
  if (state.appOpenCount < cfg.minAppOpens) {
    return false;
  }

  // Check minimum significant events
  if (state.significantEventCount < cfg.minSignificantEvents) {
    return false;
  }

  // Check days between prompts
  if (state.lastPromptDate) {
    const lastDate = new Date(state.lastPromptDate);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff < cfg.daysBetweenPrompts) {
      return false;
    }
  }

  // Check if store review is available
  const available = await isReviewAvailable();
  return available;
}

/**
 * Request in-app review (native popup)
 */
export async function requestReview(): Promise<boolean> {
  try {
    const available = await isReviewAvailable();
    if (!available) {
      console.log("[StoreReview] In-app review not available");
      return false;
    }

    // Update state before requesting
    const state = await getReviewState();
    state.promptCount++;
    state.lastPromptDate = new Date().toISOString();
    await saveReviewState(state);

    // Request review
    await StoreReview.requestReview();
    console.log("[StoreReview] Review requested");

    return true;
  } catch (error) {
    console.error("[StoreReview] Error requesting review:", error);
    return false;
  }
}

/**
 * Request review if conditions are met
 */
export async function maybeRequestReview(
  config: Partial<ReviewConfig> = {},
): Promise<boolean> {
  const should = await shouldRequestReview(config);
  if (should) {
    return await requestReview();
  }
  return false;
}

/**
 * Mark as reviewed (user confirmed they reviewed)
 */
export async function markAsReviewed(): Promise<void> {
  const state = await getReviewState();
  state.hasReviewed = true;
  await saveReviewState(state);
}

/**
 * Open store page for review (fallback for when in-app review is not available)
 */
export async function openStorePage(
  appId?: string,
  packageName?: string,
): Promise<boolean> {
  try {
    let url: string;

    if (Platform.OS === "ios") {
      const id = appId || process.env.EXPO_PUBLIC_APP_STORE_ID;
      if (!id) {
        console.error("[StoreReview] App Store ID not provided");
        return false;
      }
      url = STORE_URLS.ios.replace("{APP_ID}", id);
    } else if (Platform.OS === "android") {
      const pkg = packageName || process.env.EXPO_PUBLIC_ANDROID_PACKAGE;
      if (!pkg) {
        console.error("[StoreReview] Package name not provided");
        return false;
      }
      url = STORE_URLS.android.replace("{PACKAGE_NAME}", pkg);
    } else {
      console.log("[StoreReview] Store review not available on web");
      return false;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[StoreReview] Error opening store page:", error);
    return false;
  }
}

/**
 * Reset review state (for testing)
 */
export async function resetReviewState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * Get current review statistics
 */
export async function getReviewStats(): Promise<ReviewState> {
  return await getReviewState();
}

// ============================================
// EXPORTS
// ============================================

export const storeReviewUtils = {
  isReviewAvailable,
  hasReviewed,
  trackAppOpen,
  trackSignificantEvent,
  shouldRequestReview,
  requestReview,
  maybeRequestReview,
  markAsReviewed,
  openStorePage,
  resetReviewState,
  getReviewStats,
};

export default storeReviewUtils;
