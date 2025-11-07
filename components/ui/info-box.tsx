import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { StyleSheet, View } from 'react-native';

export function InfoBox({ title, items, secondary }: { title: string; items: string[]; secondary?: boolean }) {
  return (
    <View style={[styles.box, secondary ? styles.secondary : styles.primary]}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      {items.map((t, i) => (
        <ThemedText key={i}>{t}</ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radii.md,
  },
  primary: {
    backgroundColor: '#f3f3f3',
    borderWidth: 0.5,
    borderColor: '#555',
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#555',
  },
});
