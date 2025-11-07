import { Colors } from '@/constants/theme';
import { useNotifications } from '@/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface NotificationBellProps {
  size?: number;
  color?: string;
  showBadge?: boolean;
}

export default function NotificationBell({ 
  size = 24, 
  color, 
  showBadge = true 
}: NotificationBellProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { unreadCount } = useNotifications();

  const bellColor = color || colors.text;
  const hasBadge = showBadge && unreadCount > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(tabs)/notifications')}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-outline" size={size} color={bellColor} />
        
        {hasBadge && (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
