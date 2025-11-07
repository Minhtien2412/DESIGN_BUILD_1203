import React from 'react';
import { Text, View } from 'react-native';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // log nếu cần
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      const msg =
        (this.state.error as any)?.message ??
        String(this.state.error ?? 'Unknown error');
      return (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>
            Có lỗi xảy ra
          </Text>
          <Text selectable>{msg}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Safe Text Wrapper to prevent text rendering errors
export const SafeText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    if (typeof children === 'string' || typeof children === 'number') {
      return <Text>{children}</Text>;
    }
    return <>{children}</>;
  } catch (error) {
    console.error('[SafeText] Error:', error);
    return <Text>Error displaying text</Text>;
  }
};

// Safe Provider Wrapper
export const SafeProvider: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};
