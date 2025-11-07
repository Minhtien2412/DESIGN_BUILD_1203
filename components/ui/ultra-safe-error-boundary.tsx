import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean; error?: unknown; key: number };

/**
 * Ultra-safe ErrorBoundary that handles text rendering errors aggressively
 */
export class UltraSafeErrorBoundary extends React.Component<Props, State> {
  private retryTimeoutId?: any;
  private mountedRef = { current: true };
  
  state: State = { hasError: false, error: undefined, key: 0 };

  static getDerivedStateFromError(error: unknown) {
    console.warn('[UltraSafeErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: any) {
    console.warn('[UltraSafeErrorBoundary] componentDidCatch:', error, info);
    
    // For ANY text rendering error, immediately attempt recovery
    const errorMessage = (error as any)?.message || '';
    const isTextError = errorMessage.includes('Text strings must be rendered') || 
                       errorMessage.includes('createTextInstance') ||
                       errorMessage.includes('text node') ||
                       errorMessage.includes('string') ||
                       errorMessage.includes('Text');
    
    if (isTextError) {
      console.warn('[UltraSafeErrorBoundary] Text-related error detected - immediate recovery');
      
      // Clear any existing timeout
      if (this.retryTimeoutId) {
        clearTimeout(this.retryTimeoutId);
      }
      
      // Immediate recovery attempt with new key to force re-mount
      this.retryTimeoutId = setTimeout(() => {
        if (this.mountedRef.current) {
          console.warn('[UltraSafeErrorBoundary] Attempting recovery with re-mount...');
          this.setState(prevState => ({ 
            hasError: false, 
            error: undefined,
            key: prevState.key + 1 
          }));
        }
      }, 50); // Very short timeout
    } else {
      // For other errors, longer timeout
      this.retryTimeoutId = setTimeout(() => {
        if (this.mountedRef.current) {
          this.setState(prevState => ({ 
            hasError: false, 
            error: undefined,
            key: prevState.key + 1 
          }));
        }
      }, 1000);
    }
  }

  componentDidMount() {
    this.mountedRef.current = true;
  }

  componentWillUnmount() {
    this.mountedRef.current = false;
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Ultra-safe fallback - just an empty view with loading
      return (
        <View style={styles.safeContainer}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.safeText}>Đang tải...</Text>
        </View>
      );
    }

    // Wrap children in a safe container with key to force re-mount on recovery
    return (
      <View key={this.state.key} style={styles.wrapper}>
        {this.props.children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  safeText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default UltraSafeErrorBoundary;
