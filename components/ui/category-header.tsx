import { ThemedText } from '@/components/themed-text';
import { HOME_BIG_ICONS } from '@/constants/home-icons';
import { Radii, Spacing } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function CategoryHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const bg = useThemeColor({ light: '#fff', dark: '#111827' }, 'background');
  const border = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'icon');
  const sub = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'icon');
  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: border }]}>
      <View style={{ flex: 1 }}>
        <ThemedText type="title" style={styles.title}>{title}</ThemedText>
        {subtitle ? <ThemedText style={[styles.subtitle, { color: sub }]}>{subtitle}</ThemedText> : null}
      </View>
      {right ? <View style={{ marginLeft: 12 }}>{right}</View> : null}
    </View>
  );
}

export function CategoryHeaderIcon({ keyName, size = 36 }: { keyName: string; size?: number }) {
  const src = HOME_BIG_ICONS[keyName as keyof typeof HOME_BIG_ICONS];
  if (!src) return null;
  return <ExpoImage source={src} style={{ width: size, height: size }} contentFit="contain" />;
}

const styles = StyleSheet.create({
  wrap: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { marginTop: 4 },
});
