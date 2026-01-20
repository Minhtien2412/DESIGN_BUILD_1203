/**
 * useVideoVisibility - Hook để track video visibility trong FlatList/ScrollView
 *
 * Tự động play/pause video dựa trên viewport visibility
 * Tích hợp với VideoPlayerController singleton
 *
 * @see PRODUCT_BACKLOG.md VIDEO-001 T1
 */

import { VideoPlayerController } from "@/services/VideoPlayerController";
import { useCallback, useEffect, useRef, useState } from "react";
import { ViewToken } from "react-native";

interface UseVideoVisibilityOptions {
  /**
   * Minimum visibility percentage to consider video as "viewable"
   * Default: 50 (50%)
   */
  viewabilityThreshold?: number;

  /**
   * Auto-play when video becomes visible
   * Default: true
   */
  autoPlayOnVisible?: boolean;

  /**
   * Auto-pause when video becomes invisible
   * Default: true
   */
  autoPauseOnInvisible?: boolean;

  /**
   * Debounce time for visibility changes (ms)
   * Prevents rapid play/pause during fast scroll
   * Default: 150
   */
  debounceMs?: number;
}

interface ViewableItem {
  videoId: string;
  isViewable: boolean;
}

/**
 * Hook to get viewability config for FlatList
 */
export function useViewabilityConfig(threshold: number = 50) {
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: threshold,
    minimumViewTime: 150, // Minimum time item must be visible
  });

  return viewabilityConfig.current;
}

/**
 * Hook to handle viewable items changed callback
 */
export function useViewableItemsChanged(
  options: UseVideoVisibilityOptions = {}
) {
  const {
    autoPlayOnVisible = true,
    autoPauseOnInvisible = true,
    debounceMs = 150,
  } = options;

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastViewableId = useRef<string | null>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Clear existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        // Find the first viewable video item
        const viewableVideo = viewableItems.find(
          (item) => item.isViewable && item.item?.id
        );

        const currentViewableId = viewableVideo?.item?.id || null;

        // Skip if same video is still viewable
        if (currentViewableId === lastViewableId.current) {
          return;
        }

        // Pause previous video if it's no longer viewable
        if (lastViewableId.current && autoPauseOnInvisible) {
          VideoPlayerController.pause(lastViewableId.current);
        }

        // Play new viewable video
        if (currentViewableId && autoPlayOnVisible) {
          VideoPlayerController.play(currentViewableId);
        }

        lastViewableId.current = currentViewableId;
      }, debounceMs);
    },
    [autoPlayOnVisible, autoPauseOnInvisible, debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return onViewableItemsChanged;
}

/**
 * Hook to track single video visibility using Intersection Observer pattern
 */
export function useVideoInViewport(
  videoId: string,
  options: UseVideoVisibilityOptions = {}
) {
  const { autoPlayOnVisible = true, autoPauseOnInvisible = true } = options;

  const [isInViewport, setIsInViewport] = useState(false);
  const wasInViewport = useRef(false);

  // Handle visibility change
  useEffect(() => {
    if (isInViewport && !wasInViewport.current) {
      // Video entered viewport
      if (autoPlayOnVisible) {
        VideoPlayerController.play(videoId);
      }
    } else if (!isInViewport && wasInViewport.current) {
      // Video left viewport
      if (autoPauseOnInvisible) {
        VideoPlayerController.pause(videoId);
      }
    }

    wasInViewport.current = isInViewport;
  }, [isInViewport, videoId, autoPlayOnVisible, autoPauseOnInvisible]);

  // Callback to update visibility (called from onLayout or similar)
  const setVisible = useCallback((visible: boolean) => {
    setIsInViewport(visible);
  }, []);

  return {
    isInViewport,
    setVisible,
  };
}

/**
 * Hook for managing video feed with automatic visibility handling
 */
export function useVideoFeed<T extends { id: string }>(
  videos: T[],
  options: UseVideoVisibilityOptions = {}
) {
  const viewabilityConfig = useViewabilityConfig(options.viewabilityThreshold);
  const onViewableItemsChanged = useViewableItemsChanged(options);

  // Pause all videos when component unmounts
  useEffect(() => {
    return () => {
      VideoPlayerController.pauseAll();
    };
  }, []);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: T) => item.id, []);

  return {
    videos,
    viewabilityConfig,
    onViewableItemsChanged,
    keyExtractor,
  };
}

/**
 * Utility to create viewability config with custom threshold
 */
export function createViewabilityConfig(threshold: number = 50) {
  return {
    viewabilityConfig: {
      itemVisiblePercentThreshold: threshold,
      minimumViewTime: 150,
    },
  };
}
