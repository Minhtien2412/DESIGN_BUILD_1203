import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, View } from 'react-native';

export type ProgressBarProps = {
  value?: number; // 0..1
  label?: string;
  height?: number;
};

export function ProgressBar({ value = 0, label, height = 8 }: ProgressBarProps) {
  const accent = useThemeColor({}, 'accent');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const clamped = Math.max(0, Math.min(1, isFinite(value) ? value : 0));

  return (
    <View style={[styles.container, { height, borderColor: border }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: accent }]} />
      {label ? (
        <Text style={[styles.label, { color: text }]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(127,127,127,0.12)'
  },
  fill: {
    height: '100%',
  },
  label: {
    position: 'absolute',
    top: -22,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProgressBar;
