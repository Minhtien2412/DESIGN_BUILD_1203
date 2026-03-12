/**
 * Lazy Loading Utility
 * Provides React.lazy() with proper error handling and loading states
 */

import React, { ComponentType, Suspense } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Default loading component shown while lazy component loads
 */
const DefaultLoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

/**
 * Error boundary for lazy-loaded components
 */
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[LazyLoad] Component failed to load:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Failed to Load</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <Text style={styles.errorHint}>
            Please restart the app or check your connection.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Creates a lazy-loaded component with loading state and error handling
 * 
 * @param importFunc - Dynamic import function: () => import('./Component')
 * @param LoadingComponent - Optional custom loading component
 * @returns Lazy-loaded component wrapped with Suspense and error boundary
 * 
 * @example
 * ```typescript
 * // Before (eager loading)
 * import VideoCallScreen from './screens/VideoCallScreen';
 * 
 * // After (lazy loading)
 * const VideoCallScreen = createLazyComponent(
 *   () => import('./screens/VideoCallScreen')
 * );
 * ```
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  LoadingComponent: ComponentType = DefaultLoadingFallback
): ComponentType {
  const LazyComponent = React.lazy(importFunc);

  const WrappedLazyComponent = (props: any) => (
    <LazyErrorBoundary>
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );
  WrappedLazyComponent.displayName = 'LazyComponent';
  return WrappedLazyComponent;
}

/**
 * Preloads a lazy component before it's needed
 * Useful for prefetching heavy screens when user is likely to navigate to them
 * 
 * @param importFunc - Same import function used in createLazyComponent
 * 
 * @example
 * ```typescript
 * // Preload video call screen when user opens messages
 * useEffect(() => {
 *   preloadComponent(() => import('./screens/VideoCallScreen'));
 * }, []);
 * ```
 */
export function preloadComponent<T>(
  importFunc: () => Promise<{ default: T }>
): void {
  importFunc()
    .then(() => console.log('[LazyLoad] Component preloaded'))
    .catch((err) => console.error('[LazyLoad] Preload failed:', err));
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
