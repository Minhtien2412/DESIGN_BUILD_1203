/**
 * Video Wrapper Utility
 * =====================
 *
 * Provides lightweight helpers for video preloading and formatting.
 * Expo-video handles playback directly in components.
 */

import { Platform } from "react-native";

// ============================================================================
// Video Preloader
// ============================================================================

class VideoPreloaderManager {
  private static instance: VideoPreloaderManager;
  private preloadedUrls: Set<string> = new Set();
  private maxCached = 5;

  static getInstance(): VideoPreloaderManager {
    if (!VideoPreloaderManager.instance) {
      VideoPreloaderManager.instance = new VideoPreloaderManager();
    }
    return VideoPreloaderManager.instance;
  }

  /**
   * Preload video URL
   */
  async preload(url: string): Promise<void> {
    if (this.preloadedUrls.has(url)) return;

    try {
      if (Platform.OS === "web") {
        // Use link preload for web
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "video";
        link.href = url;
        document.head.appendChild(link);
      }
      // Native platforms handle caching automatically

      this.preloadedUrls.add(url);

      // Limit cache size
      if (this.preloadedUrls.size > this.maxCached) {
        const oldest = Array.from(this.preloadedUrls)[0];
        this.preloadedUrls.delete(oldest);
      }

      console.log("[VideoPreloader] Preloaded:", url.substring(0, 50));
    } catch (error) {
      console.warn("[VideoPreloader] Failed:", url);
    }
  }

  /**
   * Preload multiple videos around current index
   */
  async preloadAround(
    urls: string[],
    currentIndex: number,
    range = 2,
  ): Promise<void> {
    const toPreload: string[] = [];

    // Preload next videos
    for (
      let i = currentIndex + 1;
      i <= currentIndex + range && i < urls.length;
      i++
    ) {
      if (urls[i] && !this.isPreloaded(urls[i])) {
        toPreload.push(urls[i]);
      }
    }

    // Preload previous video
    if (
      currentIndex > 0 &&
      urls[currentIndex - 1] &&
      !this.isPreloaded(urls[currentIndex - 1])
    ) {
      toPreload.push(urls[currentIndex - 1]);
    }

    // Preload in sequence
    for (const url of toPreload) {
      await this.preload(url);
    }
  }

  /**
   * Check if URL is preloaded
   */
  isPreloaded(url: string): boolean {
    return this.preloadedUrls.has(url);
  }

  /**
   * Clear preload cache
   */
  clear(): void {
    this.preloadedUrls.clear();
  }
}

export const VideoPreloader = VideoPreloaderManager.getInstance();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format video duration to mm:ss
 */
export function formatVideoDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format video duration to hh:mm:ss (for longer videos)
 */
export function formatLongDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format view count
 */
export function formatViewCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

export default {
  VideoPreloader,
  formatVideoDuration,
  formatLongDuration,
  formatViewCount,
  calculateAspectRatio,
};
