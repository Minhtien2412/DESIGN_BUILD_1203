/**
 * Lazy Loading Component Wrappers
 * Code splitting for better performance
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Loading fallback component
 */
export function LazyLoadingFallback() {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = '#0066CC';

  return (
    <View style={[styles.loadingContainer, { backgroundColor }]}>
      <ActivityIndicator size="large" color={primaryColor} />
    </View>
  );
}

/**
 * HOC for lazy loading screens with suspense
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback: React.ReactNode = <LazyLoadingFallback />
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy loaded AI components (heavy features)
 */
export const LazyChatbot = withLazyLoading(
  () => import('@/app/ai/chatbot')
);

export const LazyCostEstimator = withLazyLoading(
  () => import('@/app/ai/cost-estimator')
);

/**
 * Lazy loaded analytics components (heavy charts)
 */
export const LazyAnalyticsDashboard = withLazyLoading(
  () => import('@/app/analytics/index')
);

/**
 * Lazy loaded media components (video players, image galleries)
 */
export const LazyImageGallery = withLazyLoading(
  () => import('@/components/media/ImageGallery').then((m) => ({ default: m.ImageGallery }))
);

/**
 * Preload components for better UX
 */
export function preloadComponent(
  importFunc: () => Promise<any>
): void {
  // Start loading the component
  importFunc().catch(() => {
    // Silently fail - will retry when component is actually needed
  });
}

/**
 * Batch preload multiple components
 */
export function preloadComponents(
  importFuncs: Array<() => Promise<any>>
): void {
  importFuncs.forEach((importFunc) => {
    preloadComponent(importFunc);
  });
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
