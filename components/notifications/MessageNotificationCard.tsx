import { Colors } from '@/constants/theme';
import { resolveAvatar } from '@/utils/avatar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface MessageNotificationCardProps {
  id: string;
  title: string;
  message: string;
  messageType: 'chat' | 'email' | 'sms' | 'comment';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  senderName: string;
  senderAvatar?: string;
  preview?: string;
  conversationId?: string;
  onPress: () => void;
}

export function MessageNotificationCard({
  title,
  message,
  messageType,
  priority,
  read,
  createdAt,
  senderName,
  senderAvatar,
  preview,
  onPress,
}: MessageNotificationCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Resolve avatar URL with cache busting for real-time updates
  const resolvedAvatar = useMemo(() => {
    if (!senderAvatar) return undefined;
    const baseUrl = resolveAvatar(senderAvatar, {
      userId: senderName || 'unknown',
      nameFallback: senderName,
      size: 56,
    });
    // Add cache bust to ensure avatar updates propagate
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}v=${Date.now()}`;
  }, [senderAvatar, senderName]);

  const getIcon = () => {
    switch (messageType) {
      case 'chat':
        return 'chatbubble-ellipses' as const;
      case 'email':
        return 'mail' as const;
      case 'sms':
        return 'chatbox' as const;
      case 'comment':
        return 'chatbubble' as const;
      default:
        return 'chatbubbles' as const;
    }
  };

  const getColor = () => {
    switch (messageType) {
      case 'chat':
        return '#007AFF';
      case 'email':
        return '#5856D6';
      case 'sms':
        return '#34C759';
      case 'comment':
        return '#FF9500';
      default:
        return colors.accent;
    }
  };

  const getTypeLabel = () => {
    switch (messageType) {
      case 'chat':
        return 'Tin nhắn';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'comment':
        return 'Bình luận';
      default:
        return 'Thông điệp';
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
      {/* Avatar or Icon */}
      <View style={[styles.avatarContainer, { backgroundColor: getColor() + '20' }]}>
        {resolvedAvatar ? (
          <Image 
            source={{ uri: resolvedAvatar }} 
            style={styles.avatar}
          />
        ) : (
          <Ionicons name={getIcon()} size={28} color={getColor()} />
        )}
        {!read && (
          <View style={[styles.unreadBadge, { backgroundColor: getColor() }]}>
            <Text style={styles.unreadText}>1</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.senderName, { color: colors.text }]} numberOfLines={1}>
            {senderName}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: getColor() }]}>
            <Text style={styles.typeText}>{getTypeLabel()}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        
        {preview && (
          <View style={styles.previewContainer}>
            <MaterialCommunityIcons name="message-text-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.preview, { color: colors.textMuted }]} numberOfLines={2}>
              {preview}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatTime(createdAt)}
          </Text>
          
          {!read && (
            <View style={styles.replyButton}>
              <MaterialCommunityIcons name="reply" size={14} color={getColor()} />
              <Text style={[styles.replyText, { color: getColor() }]}>Trả lời</Text>
            </View>
          )}
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
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    flex: 1,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  replyText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
