/**
 * ConversationListItem Component
 * Individual conversation item in messages list (like Zalo)
 */

import Avatar from '@/components/ui/avatar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConversationListItemProps {
  id: number;
  userName: string;
  userAvatar: string | null;
  userId: number;
  isOnline: boolean;
  lastMessage: {
    content: string;
    type: 'text' | 'image' | 'video' | 'file' | 'audio';
    sentAt: string;
    isFromMe: boolean;
    isRead: boolean;
  };
  unreadCount: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function ConversationListItem({
  id,
  userName,
  userAvatar,
  userId,
  isOnline,
  lastMessage,
  unreadCount,
  onPress,
  onLongPress,
}: ConversationListItemProps) {
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const truncateMessage = (content: string, maxLength = 45) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getMessagePreview = () => {
    const prefix = lastMessage.isFromMe ? 'Bạn: ' : '';
    
    switch (lastMessage.type) {
      case 'image':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="image" size={14} color="#999" style={{ marginRight: 4 }} />
            <Text style={[styles.messageText, unreadCount > 0 && styles.unreadText]}>
              {prefix}Hình ảnh
            </Text>
          </View>
        );
      case 'video':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="videocam" size={14} color="#999" style={{ marginRight: 4 }} />
            <Text style={[styles.messageText, unreadCount > 0 && styles.unreadText]}>
              {prefix}Video
            </Text>
          </View>
        );
      case 'file':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="document-attach" size={14} color="#999" style={{ marginRight: 4 }} />
            <Text style={[styles.messageText, unreadCount > 0 && styles.unreadText]}>
              {prefix}File đính kèm
            </Text>
          </View>
        );
      case 'audio':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="mic" size={14} color="#999" style={{ marginRight: 4 }} />
            <Text style={[styles.messageText, unreadCount > 0 && styles.unreadText]}>
              {prefix}Tin nhắn thoại
            </Text>
          </View>
        );
      case 'text':
      default:
        return (
          <Text style={[styles.messageText, unreadCount > 0 && styles.unreadText]} numberOfLines={1}>
            {prefix}{truncateMessage(lastMessage.content)}
          </Text>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        unreadCount > 0 && styles.conversationItemUnread
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Avatar with online indicator */}
      <View style={styles.avatarContainer}>
        <Avatar
          avatar={userAvatar}
          userId={String(userId)}
          name={userName}
          pixelSize={56}
          showBadge={isOnline}
          onlineStatus={isOnline ? 'online' : undefined}
        />
      </View>

      {/* Message content */}
      <View style={styles.messageContent}>
        <View style={styles.headerRow}>
          <Text style={[
            styles.userName,
            unreadCount > 0 && styles.userNameUnread
          ]} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={[
            styles.timeText,
            unreadCount > 0 && styles.timeTextUnread
          ]}>
            {formatTime(lastMessage.sentAt)}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <View style={{ flex: 1 }}>
            {getMessagePreview()}
          </View>

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
          
          {!lastMessage.isRead && lastMessage.isFromMe && unreadCount === 0 && (
            <Ionicons 
              name="checkmark" 
              size={16} 
              color="#999" 
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  conversationItemUnread: {
    backgroundColor: '#f9fafb',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
    flex: 1,
    marginRight: 8,
  },
  userNameUnread: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  timeTextUnread: {
    color: '#0D9488',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
  },
  unreadText: {
    fontWeight: '600',
    color: '#111',
  },
  unreadBadge: {
    backgroundColor: '#000000',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
