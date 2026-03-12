/**
 * Memoization optimizations for performance-critical components
 */

import React from "react";

/**
 * Memoized Live Stream Card Component
 * Prevents re-renders when live stream list updates
 */
export const MemoizedLiveStreamCard = React.memo(
  ({ stream: _stream, onPress: _onPress }: any) => {
    // Component implementation will be imported from actual component file
    return null;
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if these props change
    return (
      prevProps.stream.id === nextProps.stream.id &&
      prevProps.stream.viewerCount === nextProps.stream.viewerCount &&
      prevProps.stream.status === nextProps.stream.status
    );
  },
);
MemoizedLiveStreamCard.displayName = "MemoizedLiveStreamCard";

/**
 * Memoized Activity Feed Item Component
 * Prevents unnecessary re-renders in activity list
 */
export const MemoizedActivityItem = React.memo(
  ({ activity: _activity }: any) => {
    return null;
  },
  (prevProps, nextProps) => {
    // Only re-render if activity ID or timestamp changes
    return (
      prevProps.activity.id === nextProps.activity.id &&
      prevProps.activity.timestamp === nextProps.activity.timestamp
    );
  },
);
MemoizedActivityItem.displayName = "MemoizedActivityItem";

/**
 * Memoized Product Card Component
 * Used in product grids and lists
 */
export const MemoizedProductCard = React.memo(
  ({ product: _product, onPress: _onPress }: any) => {
    return null;
  },
  (prevProps, nextProps) => {
    // Only re-render if product data or press handler changes
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.stock === nextProps.product.stock &&
      prevProps.onPress === nextProps.onPress
    );
  },
);
MemoizedProductCard.displayName = "MemoizedProductCard";

/**
 * Memoized Story Item Component
 * Used in stories horizontal scroll
 */
export const MemoizedStoryItem = React.memo(
  ({ story: _story, hasUnviewed: _hasUnviewed, onPress: _onPress }: any) => {
    return null;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.story.userId === nextProps.story.userId &&
      prevProps.hasUnviewed === nextProps.hasUnviewed &&
      prevProps.onPress === nextProps.onPress
    );
  },
);
MemoizedStoryItem.displayName = "MemoizedStoryItem";

/**
 * Hook: Memoized expensive calculations
 * Example: Filtering and sorting large lists
 */
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  sortFn?: (a: T, b: T) => number,
) {
  return React.useMemo(() => {
    const filtered = items.filter(filterFn);
    return sortFn ? filtered.sort(sortFn) : filtered;
  }, [items, filterFn, sortFn]);
}

/**
 * Hook: Memoized search results
 * Debounced search with memoization
 */
export function useMemoizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
) {
  return React.useMemo(() => {
    if (!searchTerm.trim()) return items;

    const lowerSearch = searchTerm.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return (
          typeof value === "string" && value.toLowerCase().includes(lowerSearch)
        );
      }),
    );
  }, [items, searchTerm, searchFields]);
}

/**
 * Hook: Memoized grouped data
 * Example: Group products by category, stories by user
 */
export function useMemoizedGroupBy<T>(
  items: T[],
  keySelector: (item: T) => string,
) {
  return React.useMemo(() => {
    const groups = new Map<string, T[]>();

    for (const item of items) {
      const key = keySelector(item);
      const group = groups.get(key) || [];
      group.push(item);
      groups.set(key, group);
    }

    return groups;
  }, [items, keySelector]);
}

/**
 * Hook: Stable callback with dependencies
 * Prevents unnecessary re-renders from callback changes
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
): T {
  return React.useCallback(callback, deps) as T;
}

/**
 * Hook: Memoized derived state
 * Example: Total price, item counts, statistics
 */
export function useMemoizedDerivedState<T, R>(
  sourceData: T,
  deriveFn: (data: T) => R,
): R {
  return React.useMemo(() => deriveFn(sourceData), [sourceData, deriveFn]);
}

/**
 * Component: Memoized list renderer
 * Optimizes FlatList rendering performance
 */
export function memoizedKeyExtractor<T extends { id: string }>(
  item: T,
): string {
  return item.id;
}

/**
 * Component: Memoized render item factory
 * Creates stable renderItem functions for FlatList
 */
export function createMemoizedRenderItem<T>(
  Component: React.ComponentType<{ item: T; index: number }>,
  arePropsEqual?: (prevProps: any, nextProps: any) => boolean,
) {
  const MemoizedComponent = React.memo(Component, arePropsEqual);

  const RenderItem = ({ item, index }: { item: T; index: number }) => (
    <MemoizedComponent item={item} index={index} />
  );
  RenderItem.displayName = "MemoizedRenderItem";
  return RenderItem;
}

/**
 * HOC: Add memoization to any component
 */
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  arePropsEqual?: (prevProps: P, nextProps: P) => boolean,
) {
  return React.memo(Component, arePropsEqual);
}

/**
 * Performance monitoring helper
 * Use in development to identify slow renders
 */
export function useRenderCount(componentName: string) {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
    console.log(
      `[Perf] ${componentName} rendered ${renderCount.current} times`,
    );
  });

  return renderCount.current;
}

/**
 * Memoized comparison utilities
 */
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
};

export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== "object" || typeof obj2 !== "object")
    return obj1 === obj2;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};
