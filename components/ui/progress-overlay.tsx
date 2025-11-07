import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from './progress-bar';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  progress?: number; // 0..1
  onCancel?: () => void;
};

export function ProgressOverlay({ visible, title = 'Đang xử lý…', message, progress, onCancel }: Props) {
  const text = useThemeColor({}, 'text');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  if (!visible) return null;

  const pct = typeof progress === 'number' && isFinite(progress)
    ? Math.max(0, Math.min(1, progress))
    : undefined;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}> 
        <Text style={[styles.title, { color: text }]}>{title}</Text>
        {message ? <Text style={[styles.message, { color: text }]}>{message}</Text> : null}
        <ProgressBar value={pct ?? 0} label={pct != null ? `${Math.round(pct * 100)}%` : undefined} />
        {onCancel ? (
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: text }]}>Huỷ</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
  },
  cancelBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelText: {
    fontSize: 13,
    opacity: 0.8,
  }
});

export default ProgressOverlay;
