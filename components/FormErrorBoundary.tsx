import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class FormErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const errorColor = '#ef4444';
  const buttonBg = '#3b82f6';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: errorColor }]}>
          Đã xảy ra lỗi
        </Text>
        
        <Text style={[styles.message, { color: text }]}>
          Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại.
        </Text>

        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={[styles.errorTitle, { color: text }]}>
              Chi tiết lỗi (Chỉ hiển thị trong chế độ dev):
            </Text>
            <Text style={[styles.errorText, { color: errorColor }]}>
              {error.toString()}
            </Text>
            {error.stack && (
              <Text style={[styles.stackTrace, { color: text }]}>
                {error.stack}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBg }]}
          onPress={onReset}
        >
          <Text style={styles.buttonText}>Thử lại</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorDetails: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
