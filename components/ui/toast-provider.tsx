import { setToastHandler } from '@/utils/toast';
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Toast = { id: string; message: string; title?: string };

const ToastContext = React.createContext<{
  show: (message: string, title?: string) => void;
} | null>(null);

export function useInternalToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useInternalToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  function show(message: string, title?: string) {
    const t: Toast = { id: Date.now().toString(), message, title };
    setToasts((s) => [...s, t]);
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== t.id));
    }, 2500);
  }

    React.useEffect(() => {
      setToastHandler(show);
      return () => setToastHandler(null);
    }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View pointerEvents="box-none" style={styles.container}>
        {toasts.map((t) => (
          <Animated.View key={t.id} style={styles.toast}>
            {t.title ? <Text style={styles.title}>{t.title}</Text> : null}
            <Text style={styles.message}>{t.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center' },
  toast: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginTop: 8, maxWidth: '90%' },
  title: { color: '#fff', fontWeight: '600', marginBottom: 4 },
  message: { color: '#fff' },
});

export default ToastProvider;
