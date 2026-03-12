import { Colors } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface EventNotificationCardProps {
  id: string;
  title: string;
  message: string;
  eventType: 'project' | 'deadline' | 'meeting' | 'reminder' | 'milestone';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  eventDate?: string;
  location?: string;
  participants?: string[];
  onPress: () => void;
}

export function EventNotificationCard({
  title,
  message,
  eventType,
  priority,
  read,
  createdAt,
  eventDate,
  location,
  participants,
  onPress,
}: EventNotificationCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIcon = () => {
    switch (eventType) {
      case 'project':
        return 'briefcase' as const;
      case 'deadline':
        return 'alarm' as const;
      case 'meeting':
        return 'people' as const;
      case 'reminder':
        return 'notifications' as const;
      case 'milestone':
        return 'trophy' as const;
      default:
        return 'calendar' as const;
    }
  };

  const getColor = () => {
    if (priority === 'urgent') return '#FF3B30';
    switch (eventType) {
      case 'project':
        return '#007AFF';
      case 'deadline':
        return '#FF3B30';
      case 'meeting':
        return '#5856D6';
      case 'reminder':
        return '#FF9500';
      case 'milestone':
        return '#FFD700';
      default:
        return colors.accent;
    }
  };

  const getTypeLabel = () => {
    switch (eventType) {
      case 'project':
        return 'Dự án';
      case 'deadline':
        return 'Hạn chót';
      case 'meeting':
        return 'Cuộc họp';
      case 'reminder':
        return 'Nhắc nhở';
      case 'milestone':
        return 'Cột mốc';
      default:
        return 'Sự kiện';
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

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} lúc ${hours}:${minutes}`;
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
              <MaterialCommunityIcons name="fire" size={12} color="#FFF" />
              <Text style={styles.urgentText}>Khẩn</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.message, { color: colors.textMuted }]} numberOfLines={2}>
          {message}
        </Text>

        {eventDate && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color={getColor()} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatEventDate(eventDate)}
            </Text>
          </View>
        )}

        {location && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]} numberOfLines={1}>
              {location}
            </Text>
          </View>
        )}

        {participants && participants.length > 0 && (
          <View style={styles.participantsRow}>
            <MaterialCommunityIcons name="account-group" size={16} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              {participants.length} người tham gia
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
    gap: 6,
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
    gap: 3,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
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
