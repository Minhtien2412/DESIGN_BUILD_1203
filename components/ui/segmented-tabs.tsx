import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

export type Segment = { key: string; label: string };

type Props = {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
  pillStyle?: ViewStyle;
  textStyle?: TextStyle;
};

export function SegmentedTabs({ segments, value, onChange, style, pillStyle, textStyle }: Props) {
  return (
    <View style={[styles.container, style]}> 
      <View style={styles.pill}>
        {segments.map((s) => {
          const active = s.key === value;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => onChange(s.key)}
              style={[styles.item, active && styles.activeItem, pillStyle]}
            >
              <Text style={[styles.text, textStyle, active && styles.activeText]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  pill: {
    flexDirection: 'row',
    backgroundColor: '#00000055',
    borderRadius: 999,
    overflow: 'hidden',
  },
  item: { paddingHorizontal: 12, paddingVertical: 6 },
  activeItem: { backgroundColor: '#ffffff22' },
  text: { color: '#ddd', fontWeight: '700' },
  activeText: { color: '#fff' },
});

export default SegmentedTabs;
