import { Colors } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface LiveNotificationCardProps {
  id: string;
  title: string;
  message: string;
  liveType: 'stream' | 'video_call' | 'webinar' | 'broadcast';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  isActive: boolean;
  viewerCount?: number;
  startedAt?: string;
  onPress: () => void;
}

export function LiveNotificationCard({
  title,
  message,
  liveType,
  priority,
  read,
  createdAt,
  isActive,
  viewerCount,
  startedAt,
  onPress,
}: LiveNotificationCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive, pulseAnim]);

  const getIcon = () => {
    switch (liveType) {
      case 'stream':
        return 'videocam' as const;
      case 'video_call':
        return 'call' as const;
      case 'webinar':
        return 'school' as const;
      case 'broadcast':
        return 'radio' as const;
      default:
        return 'play-circle' as const;
    }
  };

  const getColor = () => {
    if (!isActive) return '#8E8E93';
    return '#FF3B30'; // Live color - red
  };

  const getTypeLabel = () => {
    switch (liveType) {
      case 'stream':
        return 'Phát trực tiếp';
      case 'video_call':
        return 'Cuộc gọi';
      case 'webinar':
        return 'Hội thảo';
      case 'broadcast':
        return 'Phát sóng';
      default:
        return 'Trực tuyến';
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

  const getDuration = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: isActive 
            ? 'rgba(255, 59, 48, 0.1)' 
            : !read ? colors.chipBackground : 'transparent',
          borderLeftWidth: 4,
          borderLeftColor: getColor(),
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getColor() + '20' }]}>
        <Ionicons name={getIcon()} size={28} color={getColor()} />
        {isActive && (
          <Animated.View 
            style={[
              styles.livePulse, 
              { 
                backgroundColor: getColor(),
                transform: [{ scale: pulseAnim }],
              }
            ]} 
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          {isActive ? (
            <View style={[styles.liveBadge, { backgroundColor: '#FF3B30' }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : (
            <View style={[styles.typeBadge, { backgroundColor: getColor() }]}>
              <Text style={styles.typeText}>{getTypeLabel()}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.message, { color: colors.textMuted }]} numberOfLines={2}>
          {message}
        </Text>

        <View style={styles.statsRow}>
          {isActive && viewerCount !== undefined && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="eye" size={16} color={colors.text} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {viewerCount.toLocaleString()} đang xem
              </Text>
            </View>
          )}
          
          {isActive && startedAt && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                {getDuration(startedAt)}
              </Text>
            </View>
          )}
        </View>

        {isActive && (
          <View style={styles.joinButton}>
            <MaterialCommunityIcons name="video" size={16} color="#FFF" />
            <Text style={styles.joinText}>Tham gia ngay</Text>
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
  livePulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    opacity: 0.3,
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
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
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
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
