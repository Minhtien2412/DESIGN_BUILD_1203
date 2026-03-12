import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { Component, ReactNode } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
  children: ReactNode;
  fallbackUI?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Enhanced Error Boundary Component
 * 
 * Catches React errors and displays user-friendly UI with:
 * - Error message display
 * - Retry button to reset error state
 * - Navigate back button
 * - Error logging for debugging
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console
    console.error('🔴 [ErrorBoundary] Caught error:', error);
    console.error('🔴 [ErrorBoundary] Error info:', errorInfo);
    console.error('🔴 [ErrorBoundary] Component stack:', errorInfo.componentStack);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoBack = () => {
    // Navigate back and reset error
    this.setState(
      {
        hasError: false,
        error: null,
        errorInfo: null,
      },
      () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }
    );
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallbackUI } = this.props;

    if (hasError) {
      // Use custom fallback UI if provided
      if (fallbackUI) {
        return fallbackUI;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={80} color="#000000" />
            </View>

            {/* Error Title */}
            <Text style={styles.title}>Đã xảy ra lỗi</Text>

            {/* Error Message */}
            <Text style={styles.message}>
              Xin lỗi, đã có lỗi xảy ra trong ứng dụng. Vui lòng thử lại hoặc quay lại trang trước.
            </Text>

            {/* Error Details (Development Only) */}
            {__DEV__ && error && (
              <View style={styles.errorDetailsContainer}>
                <Text style={styles.errorDetailsTitle}>Chi tiết lỗi (Dev):</Text>
                <View style={styles.errorDetailsBox}>
                  <Text style={styles.errorName}>{error.name}</Text>
                  <Text style={styles.errorMessage}>{error.message}</Text>
                  {error.stack && (
                    <Text style={styles.errorStack} numberOfLines={10}>
                      {error.stack}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {/* Retry Button */}
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={this.handleRetry}
                activeOpacity={0.7}
              >
                <Ionicons name="reload" size={20} color="#fff" />
                <Text style={styles.buttonText}>Thử lại</Text>
              </TouchableOpacity>

              {/* Go Back Button */}
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={this.handleGoBack}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="#0D9488" />
                <Text style={[styles.buttonText, styles.backButtonText]}>
                  Quay lại
                </Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <Text style={styles.helpText}>
              Nếu lỗi vẫn tiếp tục xảy ra, vui lòng liên hệ bộ phận hỗ trợ.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  errorDetailsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  errorDetailsBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#000000',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: '#0D9488',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0D9488',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButtonText: {
    color: '#0D9488',
  },
  helpText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

/**
 * Functional wrapper for ErrorBoundary
 * Use this for easier integration with functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackUI?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallbackUI={fallbackUI}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
