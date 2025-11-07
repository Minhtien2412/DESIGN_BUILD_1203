import { Colors } from '@/constants/theme';
import { useNotifications } from '@/features/notifications';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

export const NotificationsBadge: React.FC<{ size?: number }> = ({ size = 24 }) => {
  const { unreadCount } = useNotifications();
  const scheme = useColorScheme();
  const color = Colors[scheme ?? 'light'].tint;
  const warn = Colors[scheme ?? 'light'].tint;

  const content = (
    <View style={styles.container}>
      <IconSymbol name="bell.fill" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: warn }]}> 
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Link href="/(tabs)/notifications" asChild>
      <Pressable accessibilityRole="button" hitSlop={8} style={styles.pressable}>
        {content}
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  pressable: { marginRight: 12 },
  container: { justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});
