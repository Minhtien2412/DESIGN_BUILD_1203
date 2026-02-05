/**
 * Error Boundary Components
 * ==========================
 *
 * Bọc các phần của app để cô lập lỗi:
 * 1. Một component lỗi không crash toàn bộ app
 * 2. Hiển thị fallback UI thay vì crash
 * 3. Log errors cho debugging
 */

import { Ionicons } from "@expo/vector-icons";
import React, { ErrorInfo, ReactNode } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  silent?: boolean;
  componentName?: string;
};

type State = {
  hasError: boolean;
  error?: Error;
  isRetrying: boolean;
};

// ============================================================================
// MAIN ERROR BOUNDARY
// ============================================================================

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, isRetrying: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const { onError, componentName } = this.props;
    console.error(
      `[ErrorBoundary] ${componentName || "Component"} crashed:`,
      error,
      info.componentStack,
    );
    onError?.(error, info);
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.setState({ hasError: false, error: undefined, isRetrying: false });
  };

  render() {
    const { hasError, error, isRetrying } = this.state;
    const {
      children,
      fallback,
      showRetry = true,
      silent = false,
      componentName,
    } = this.props;

    if (hasError) {
      if (silent) return null;
      if (fallback) return fallback;

      const msg = error?.message ?? "Lỗi không xác định";

      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={40} color="#f59e0b" />
          <Text style={styles.title}>
            {componentName ? `${componentName} gặp sự cố` : "Có lỗi xảy ra"}
          </Text>
          <Text style={styles.message} selectable>
            {msg}
          </Text>
          {showRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.retryText}>Thử lại</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return children;
  }
}

// ============================================================================
// SPECIALIZED ERROR BOUNDARIES
// ============================================================================

/** Silent - không hiện UI khi lỗi */
export const SilentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName?: string;
}> = ({ children, componentName }) => (
  <ErrorBoundary componentName={componentName} silent={true}>
    {children}
  </ErrorBoundary>
);

/** Screen - full screen error */
export const ScreenErrorBoundary: React.FC<{
  children: ReactNode;
  screenName: string;
}> = ({ children, screenName }) => (
  <ErrorBoundary
    componentName={screenName}
    showRetry={true}
    fallback={
      <View style={styles.screenError}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.screenErrorTitle}>Lỗi tải màn hình</Text>
        <Text style={styles.screenErrorMessage}>
          Không thể tải {screenName}. Vui lòng thử lại sau.
        </Text>
      </View>
    }
  >
    {children}
  </ErrorBoundary>
);

/** Section - inline error */
export const SectionErrorBoundary: React.FC<{
  children: ReactNode;
  sectionName: string;
  showRetry?: boolean;
}> = ({ children, sectionName, showRetry = true }) => (
  <ErrorBoundary
    componentName={sectionName}
    showRetry={showRetry}
    fallback={
      <View style={styles.sectionError}>
        <Text style={styles.sectionErrorText}>Không thể tải {sectionName}</Text>
      </View>
    }
  >
    {children}
  </ErrorBoundary>
);

// ============================================================================
// SAFE WRAPPERS
// ============================================================================

export const SafeText: React.FC<{ children: ReactNode }> = ({ children }) => {
  try {
    if (typeof children === "string" || typeof children === "number") {
      return <Text>{children}</Text>;
    }
    return <>{children}</>;
  } catch (error) {
    console.error("[SafeText] Error:", error);
    return <Text>Error displaying text</Text>;
  }
};

export const SafeProvider: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  providerName?: string;
}> = ({ children, fallback, providerName }) => (
  <ErrorBoundary componentName={providerName} silent={true} fallback={fallback}>
    {children}
  </ErrorBoundary>
);

// ============================================================================
// HOOK VERSION
// ============================================================================

export function useErrorHandler(): {
  error: Error | null;
  handleError: (error: Error) => void;
  clearError: () => void;
} {
  const [error, setError] = React.useState<Error | null>(null);
  const handleError = React.useCallback((err: Error) => {
    console.error("[useErrorHandler] Caught error:", err);
    setError(err);
  }, []);
  const clearError = React.useCallback(() => setError(null), []);
  return { error, handleError, clearError };
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    margin: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  screenError: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  screenErrorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 8,
  },
  screenErrorMessage: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  sectionError: {
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    margin: 8,
    alignItems: "center",
  },
  sectionErrorText: {
    fontSize: 13,
    color: "#991b1b",
  },
});
