import { Colors } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface SystemNotificationCardProps {
  id: string;
  title: string;
  message: string;
  systemType: 'maintenance' | 'update' | 'announcement' | 'policy';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  affectedServices?: string[];
  onPress: () => void;
}

export function SystemNotificationCard({
  title,
  message,
  systemType,
  priority,
  read,
  createdAt,
  affectedServices,
  onPress,
}: SystemNotificationCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIcon = () => {
    switch (systemType) {
      case 'maintenance':
        return 'construct' as const;
      case 'update':
        return 'refresh-circle' as const;
      case 'announcement':
        return 'megaphone' as const;
      case 'policy':
        return 'shield-checkmark' as const;
      default:
        return 'information-circle' as const;
    }
  };

  const getColor = () => {
    if (priority === 'urgent') return '#FF3B30';
    if (priority === 'high') return '#FF9500';
    switch (systemType) {
      case 'maintenance':
        return '#FF9500';
      case 'update':
        return '#007AFF';
      case 'announcement':
        return '#AF52DE';
      case 'policy':
        return '#34C759';
      default:
        return colors.accent;
    }
  };

  const getTypeLabel = () => {
    switch (systemType) {
      case 'maintenance':
        return 'Bảo trì';
      case 'update':
        return 'Cập nhật';
      case 'announcement':
        return 'Thông báo';
      case 'policy':
        return 'Chính sách';
      default:
        return 'Hệ thống';
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: !read ? colors.chipBackground : 'transparent',
          borderLeftWidth: 4,
          borderLeftColor: getColor(),
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getColor() + '20' }]}>
        <Ionicons name={getIcon()} size={28} color={getColor()} />
        {!read && (
          <View style={[styles.pulseDot, { backgroundColor: getColor() }]} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: getColor() }]}>
            <Text style={styles.typeText}>{getTypeLabel()}</Text>
          </View>
          {priority === 'urgent' && (
            <View style={styles.urgentBadge}>
              <MaterialCommunityIcons name="alert" size={12} color="#FFF" />
              <Text style={styles.urgentText}>Khẩn cấp</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.message, { color: colors.textMuted }]} numberOfLines={3}>
          {message}
        </Text>

        {affectedServices && affectedServices.length > 0 && (
          <View style={styles.servicesContainer}>
            <MaterialCommunityIcons name="server" size={14} color={colors.textMuted} />
            <Text style={[styles.servicesText, { color: colors.textMuted }]}>
              Ảnh hưởng: {affectedServices.join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatTime(createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  pulseDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  servicesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  servicesText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  time: {
    fontSize: 11,
  },
});
