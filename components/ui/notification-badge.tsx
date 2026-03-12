import { usePushNotifications } from '@/context/PushNotificationContext';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface NotificationBadgeProps {
  size?: number;
  style?: ViewStyle;
  maxCount?: number;
}

export function NotificationBadge({ size = 18, style, maxCount = 99 }: NotificationBadgeProps) {
  const { unreadCount } = usePushNotifications();

  if (unreadCount === 0) return null;

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.badgeText, { fontSize: size * 0.6 }]} numberOfLines={1}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
