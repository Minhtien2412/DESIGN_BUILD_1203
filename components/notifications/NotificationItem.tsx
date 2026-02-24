/**
 * Notification Item with Swipe & Long Press
 * Swipe to mark read/delete, Long press for menu
 */

import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { LongPressMenu, MenuItem, SwipeableCard } from '../gestures';

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  time: string;
  icon?: keyof typeof Ionicons.glyphMap;
  read?: boolean;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTap?: (id: string) => void;
}

export function NotificationItem({
  id,
  title,
  message,
  time,
  icon = 'notifications-outline',
  read = false,
  onMarkRead,
  onDelete,
  onTap,
}: NotificationItemProps) {
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const menuItems: MenuItem[] = [
    {
      label: read ? 'Mark as Unread' : 'Mark as Read',
      icon: read ? '📭' : '📬',
      onPress: () => onMarkRead?.(id),
    },
    {
      label: 'Delete',
      icon: '🗑️',
      destructive: true,
      onPress: () => {
        Alert.alert(
          'Delete Notification',
          'Are you sure you want to delete this notification?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(id) },
          ]
        );
      },
    },
  ];

  return (
    <SwipeableCard
      leftAction={{
        label: read ? '📭 Unread' : '📬 Read',
        color: '#0D9488',
        onPress: () => onMarkRead?.(id),
      }}
      rightAction={{
        label: '🗑️ Delete',
        color: '#000000',
        onPress: () => onDelete?.(id),
      }}
      style={{ marginBottom: 8 }}
    >
      <LongPressMenu menuItems={menuItems}>
        <View style={[styles.container, { opacity: read ? 0.6 : 1 }]}>
          <View style={[styles.iconContainer, { backgroundColor: read ? textMuted : primary }]}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: text }]} numberOfLines={1}>
                {title}
              </Text>
              {!read && <View style={[styles.unreadDot, { backgroundColor: primary }]} />}
            </View>
            
            <Text style={[styles.message, { color: textMuted }]} numberOfLines={2}>
              {message}
            </Text>
            
            <Text style={[styles.time, { color: textMuted }]}>
              {time}
            </Text>
          </View>
        </View>
      </LongPressMenu>
    </SwipeableCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
});
