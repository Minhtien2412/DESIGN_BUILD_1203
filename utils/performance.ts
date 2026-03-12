/**
 * Performance Optimization Utilities
 * Memory management, lazy loading, and optimization helpers
 */

import React, { useCallback, useEffect, useRef } from "react";
import { InteractionManager, Platform } from "react-native";

/**
 * Hook to run expensive operations after interactions complete
 * Prevents blocking UI during navigation or gestures
 */
export function useAfterInteractions(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      callback();
    });

    return () => task.cancel();
  }, deps);
}

/**
 * Debounce hook for search and input optimization
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle function for scroll and gesture handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memory-efficient image URI cache
 */
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize = 100;

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache();

/**
 * Optimized FlatList configuration
 */
export const OPTIMIZED_LIST_CONFIG = {
  windowSize: 10,
  maxToRenderPerBatch: 5,
  updateCellsBatchingPeriod: 50,
  initialNumToRender: 10,
  removeClippedSubviews: Platform.OS === "android",
  getItemLayout: (data: any, index: number) => ({
    length: 100,
    offset: 100 * index,
    index,
  }),
};

/**
 * Hook for optimized list rendering with pagination
 */
export function usePaginatedData<T>(initialData: T[], pageSize: number = 20) {
  const [displayedData, setDisplayedData] = React.useState<T[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  useEffect(() => {
    const endIndex = page * pageSize;
    const newData = initialData.slice(0, endIndex);
    setDisplayedData(newData);
    setHasMore(endIndex < initialData.length);
  }, [initialData, page, pageSize]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return { displayedData, loadMore, hasMore, reset };
}

/**
 * Component unmount tracker for cleanup
 */
export function useIsMounted() {
  const isMountedRef = useRef(true);
  const isMounted = useCallback(() => isMountedRef.current, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMounted;
}

/**
 * Lazy state updater - only updates if component is mounted
 */
export function useSafeState<T>(
  initialState: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = React.useState<T>(initialState);
  const isMounted = useIsMounted();

  const safeSetState = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (isMounted()) {
        setState(value);
      }
    },
    [isMounted],
  );

  return [state, safeSetState];
}

/**
 * Memory monitoring (development only)
 */
export const memoryMonitor = {
  log: () => {
    if (__DEV__ && (global as any).performance?.memory) {
      const memory = (global as any).performance.memory;
      console.log("[Memory]", {
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      });
    }
  },

  startMonitoring: (intervalMs: number = 5000) => {
    if (__DEV__) {
      const interval = setInterval(() => memoryMonitor.log(), intervalMs);
      return () => clearInterval(interval);
    }
    return () => {};
  },
};

/**
 * Batch state updates to reduce re-renders
 */
export function useBatchedUpdates() {
  const pendingUpdates = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((update: () => void) => {
    pendingUpdates.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      pendingUpdates.current.forEach((fn) => fn());
      pendingUpdates.current = [];
    }, 16) as any; // One frame
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
}

/**
 * Optimize image loading with progressive quality
 */
export function getOptimizedImageUri(
  uri: string,
  width: number,
  quality: number = 80,
): string {
  if (!uri) return uri;

  // For local images, return as-is
  if (!uri.startsWith("http")) return uri;

  // For remote images, add query parameters for optimization
  const separator = uri.includes("?") ? "&" : "?";
  return `${uri}${separator}w=${width}&q=${quality}`;
}

/**
 * Performance metrics collection for screens
 */
interface ScreenMetric {
  screenName: string;
  renderTime: number;
  timestamp: number;
  interactionTime?: number;
}

class PerformanceMetrics {
  private metrics: ScreenMetric[] = [];
  private maxMetrics = 100;
  private renderStartTimes = new Map<string, number>();

  startRender(screenName: string): void {
    this.renderStartTimes.set(screenName, Date.now());
  }

  endRender(screenName: string): number {
    const startTime = this.renderStartTimes.get(screenName);
    if (!startTime) return 0;

    const renderTime = Date.now() - startTime;
    this.renderStartTimes.delete(screenName);

    const metric: ScreenMetric = {
      screenName,
      renderTime,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    if (__DEV__) {
      console.log(`[Perf] ${screenName} rendered in ${renderTime}ms`);
    }

    return renderTime;
  }

  getMetrics(): ScreenMetric[] {
    return [...this.metrics];
  }

  getAverageRenderTime(screenName?: string): number {
    const filtered = screenName
      ? this.metrics.filter((m) => m.screenName === screenName)
      : this.metrics;

    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, m) => sum + m.renderTime, 0) / filtered.length;
  }

  getSlowScreens(thresholdMs: number = 500): ScreenMetric[] {
    return this.metrics.filter((m) => m.renderTime > thresholdMs);
  }

  clear(): void {
    this.metrics = [];
    this.renderStartTimes.clear();
  }

  toJSON() {
    return {
      metrics: this.metrics.slice(-20),
      averageRenderTime: this.getAverageRenderTime(),
      slowScreens: this.getSlowScreens(),
    };
  }
}

export const performanceMetrics = new PerformanceMetrics();

/**
 * Hook to track screen render time
 */
export function useScreenPerformance(screenName: string) {
  const renderStartRef = useRef<number>(Date.now());

  useEffect(() => {
    renderStartRef.current = Date.now();
    performanceMetrics.startRender(screenName);

    return () => {
      performanceMetrics.endRender(screenName);
    };
  }, [screenName]);

  const markInteractionComplete = useCallback(() => {
    const interactionTime = Date.now() - renderStartRef.current;
    if (__DEV__) {
      console.log(
        `[Perf] ${screenName} interaction ready in ${interactionTime}ms`,
      );
    }
  }, [screenName]);

  return { markInteractionComplete };
}

/**
 * FPS Monitor for development
 */
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = Date.now();
  private fps = 60;
  private callback?: (fps: number) => void;
  private animationId?: number;

  start(callback?: (fps: number) => void): void {
    this.callback = callback;
    this.measure();
  }

  private measure = (): void => {
    this.frameCount++;
    const now = Date.now();
    const delta = now - this.lastTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = now;

      if (this.callback) {
        this.callback(this.fps);
      }

      if (__DEV__ && this.fps < 30) {
        console.warn(`[FPS Warning] Low FPS detected: ${this.fps}`);
      }
    }

    this.animationId = requestAnimationFrame(this.measure);
  };

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  getFPS(): number {
    return this.fps;
  }
}

export const fpsMonitor = new FPSMonitor();

/**
 * Hook for FPS monitoring in development
 */
export function useFPSMonitor(enabled: boolean = __DEV__) {
  const [fps, setFPS] = React.useState(60);

  useEffect(() => {
    if (!enabled) return;

    fpsMonitor.start(setFPS);
    return () => fpsMonitor.stop();
  }, [enabled]);

  return fps;
}
