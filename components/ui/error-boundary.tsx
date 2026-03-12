// @ts-nocheck
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorBoundaryState { error: Error | null; errorInfo?: any; }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('[ErrorBoundary] getDerivedStateFromError:', error?.message || 'Unknown error');
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Enhanced logging with error info
    console.error('[ErrorBoundary] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    });

    // Handle specific text rendering errors
    if (error?.message?.includes('Text strings must be rendered within a <Text> component')) {
      console.warn('[ErrorBoundary] Text rendering error detected - attempting graceful recovery');
      // For text rendering errors, try to recover by just resetting state after a delay
      setTimeout(() => {
        this.setState({ error: null, errorInfo: null });
      }, 100);
      return;
    }

    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  private handleReload = () => {
    // Force reload the app
    if (__DEV__) {
      // In development, just reset state
      this.handleReset();
    } else {
      // In production, you might want to reload the entire app
      // This is a simplified approach - you might want to use a more sophisticated reload mechanism
      this.handleReset();
    }
  };

  render() {
    if (this.state.error) {
      // For text rendering errors, try to render children safely
      if (this.state.error.message?.includes('Text strings must be rendered within a <Text> component')) {
        console.warn('[ErrorBoundary] Rendering fallback for text error');
        return this.props.children;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Đã xảy ra lỗi</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          {__DEV__ && this.state.errorInfo && (
            <Text style={styles.stackTrace}>
              {this.state.error.stack?.split('\n').slice(0, 5).join('\n')}
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.retryButton]} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Thử lại</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.reloadButton]} onPress={this.handleReload}>
              <Text style={styles.reloadButtonText}>Khởi động lại</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12, color: '#dc3545' },
  message: { fontSize: 16, opacity: 0.8, textAlign: 'center', marginBottom: 20, color: '#6c757d' },
  stackTrace: { fontSize: 12, fontFamily: 'monospace', color: '#495057', marginBottom: 20, padding: 10, backgroundColor: '#e9ecef', borderRadius: 4 },
  buttonContainer: { flexDirection: 'row', gap: 12 },
  button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  retryButton: { backgroundColor: '#007AFF' },
  reloadButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dc3545' },
  buttonText: { color: 'white', fontWeight: '600' },
  reloadButtonText: { color: '#dc3545', fontWeight: '600' },
});

export default ErrorBoundary;
