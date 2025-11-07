import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
};

export function AppHeader({ title, subtitle, rightSlot, onMenuPress, onProfilePress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#0f172a' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(15,23,42,0.12)', dark: 'rgba(236, 237, 238, 0.16)' }, 'icon');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'icon');

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
      return;
    }
    router.push('/utilities' as any);
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
      return;
    }
    router.push('/profile');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.sm,
          backgroundColor,
          borderBottomColor: borderColor,
        },
      ]}
    >
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mở menu" onPress={handleMenuPress} style={styles.iconButton}>
          <Ionicons name="menu-outline" size={26} color={textColor} />
        </Pressable>
        <View style={styles.titleBlock}>
          <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText style={[styles.subtitle, { color: mutedColor }]}>{subtitle}</ThemedText>
          ) : null}
        </View>
        <View style={styles.rightArea}>
          {rightSlot ?? (
            <Pressable accessibilityRole="button" accessibilityLabel="Tài khoản" onPress={handleProfilePress} style={styles.iconButton}>
              <Ionicons name="person-circle-outline" size={28} color={textColor} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: 18,
  },
  titleBlock: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
  },
  rightArea: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
