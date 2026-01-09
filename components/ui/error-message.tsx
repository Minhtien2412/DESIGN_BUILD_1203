/**
 * ErrorMessage Component
 * Reusable error display with retry functionality and network status indicators
 */

import { ApiError } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ErrorType = 'network' | 'timeout' | 'server' | 'auth' | 'notfound' | 'unknown';

interface ErrorMessageProps {
  error: Error | ApiError | string | null;
  onRetry?: () => void | Promise<void>;
  style?: any;
  compact?: boolean; // Smaller version for inline display
}

/**
 * Categorizes error and returns user-friendly message with icon
 */
function categorizeError(error: Error | ApiError | string | null): {
  type: ErrorType;
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
} {
  if (!error) {
    return {
      type: 'unknown',
      title: 'Unknown Error',
      message: 'Something went wrong',
      icon: 'alert-circle',
      color: '#1A1A1A',
    };
  }

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorLower = errorMessage.toLowerCase();

  // Network/Connection errors
  if (
    errorLower.includes('network') ||
    errorLower.includes('connection') ||
    errorLower.includes('fetch failed') ||
    errorLower.includes('network request failed')
  ) {
    return {
      type: 'network',
      title: 'No Internet Connection',
      message: 'Please check your network connection and try again',
      icon: 'cloud-offline',
      color: '#0066CC',
    };
  }

  // Timeout errors
  if (errorLower.includes('timeout') || errorLower.includes('aborted')) {
    return {
      type: 'timeout',
      title: 'Request Timed Out',
      message: 'The request took too long. Please try again',
      icon: 'time',
      color: '#0066CC',
    };
  }

  // API Error with status code
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return {
        type: 'auth',
        title: 'Authentication Required',
        message: 'Please sign in to continue',
        icon: 'lock-closed',
        color: '#1A1A1A',
      };
    }

    if (error.status === 404) {
      return {
        type: 'notfound',
        title: 'Not Found',
        message: 'The requested resource could not be found',
        icon: 'search',
        color: '#0066CC',
      };
    }

    if (error.status && error.status >= 500) {
      return {
        type: 'server',
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again later',
        icon: 'server',
        color: '#1A1A1A',
      };
    }

    if (error.status && error.status >= 400) {
      return {
        type: 'unknown',
        title: 'Request Failed',
        message: error.message || 'Unable to complete your request',
        icon: 'warning',
        color: '#0066CC',
      };
    }
  }

  // Generic server error
  if (
    errorLower.includes('server') ||
    errorLower.includes('500') ||
    errorLower.includes('503')
  ) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again later',
      icon: 'server',
      color: '#1A1A1A',
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    title: 'Something Went Wrong',
    message: typeof error === 'string' ? error : error.message || 'An unexpected error occurred',
    icon: 'alert-circle',
    color: '#1A1A1A',
  };
}

export function ErrorMessage({ error, onRetry, style, compact = false }: ErrorMessageProps) {
  const errorInfo = categorizeError(error);

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Ionicons name={errorInfo.icon} size={16} color={errorInfo.color} />
        <Text style={styles.compactText}>{errorInfo.message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactRetry}>
            <Text style={styles.compactRetryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: errorInfo.color + '20' }]}>
        <Ionicons name={errorInfo.icon} size={48} color={errorInfo.color} />
      </View>
      
      <Text style={styles.title}>{errorInfo.title}</Text>
      <Text style={styles.message}>{errorInfo.message}</Text>

      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: errorInfo.color }]} 
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color="#fff" style={styles.retryIcon} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 320,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Compact inline version
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  compactText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
  },
  compactRetry: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF9500',
    borderRadius: 4,
  },
  compactRetryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ErrorMessage;
