import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: unknown };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: unknown) {
    console.warn('[ErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: any) {
    console.warn('[ErrorBoundary]', error, info);
    
    // For text rendering errors, try to reset after a delay
    if ((error as any)?.message?.includes('Text strings must be rendered within a <Text> component')) {
      console.warn('[ErrorBoundary] Text rendering error - attempting recovery');
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 100);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const msg =
      (this.state.error as any)?.message ??
      (typeof this.state.error === 'string' ? this.state.error : JSON.stringify(this.state.error));

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Đã có lỗi xảy ra</Text>
        <ScrollView contentContainerStyle={styles.box}>
          <Text selectable style={styles.text}>
            {String(msg ?? '')}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 8, backgroundColor: '#000' },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
  box: { padding: 12, backgroundColor: '#111', borderRadius: 8 },
  text: { color: '#ddd', fontFamily: 'monospace' },
});

export default ErrorBoundary;
