import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function DesignCard({ title, image, subtitle }: { title: string; image: any; subtitle?: string }) {
  const bg = useThemeColor({ light: '#fff', dark: '#111827' }, 'background');
  const border = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'icon');
  const subColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'icon');
  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: border }] }>
      <Image source={image} style={styles.image} contentFit="cover" />
      <ThemedText numberOfLines={2} style={styles.title}>{title}</ThemedText>
      {subtitle ? <ThemedText style={[styles.subtitle, { color: subColor }]}>{subtitle}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  image: { width: '100%', aspectRatio: 1.2, borderRadius: Radii.sm, marginBottom: 6 },
  title: { fontSize: 12, minHeight: 32 },
  subtitle: { fontSize: 11, color: '#6b7280' },
});
