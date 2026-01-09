/**
 * ChatListEnhanced - Zalo-style chat list
 * Features: Swipe actions, unread badges, online status, pinned chats
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import type { ChatMessage, ChatRoom } from '@/services/ChatService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface ChatListEnhancedProps {
  chats: ChatRoom[];
  onChatPress: (chat: ChatRoom) => void;
  onChatLongPress?: (chat: ChatRoom) => void;
  onPinChat?: (chatId: string) => void;
  onMuteChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onArchiveChat?: (chatId: string) => void;
  currentUserId?: string;
}

export function ChatListEnhanced({
  chats,
  onChatPress,
  onChatLongPress,
  onPinChat,
  onMuteChat,
  onDeleteChat,
  onArchiveChat,
  currentUserId,
}: ChatListEnhancedProps) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const primary = useThemeColor({}, 'primary');

  // Sort chats: pinned first, then by updatedAt
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getLastMessagePreview = (message?: ChatMessage): string => {
    if (!message) return '';
    
    const isMine = message.senderId === currentUserId;
    const prefix = isMine ? 'Bạn: ' : '';
    
    switch (message.type) {
      case 'image':
        return `${prefix}📷 Hình ảnh`;
      case 'video':
        return `${prefix}🎬 Video`;
      case 'file':
        return `${prefix}📎 Tệp tin`;
      case 'audio':
        return `${prefix}🎤 Tin nhắn thoại`;
      case 'location':
        return `${prefix}📍 Vị trí`;
      case 'sticker':
        return `${prefix}Sticker`;
      default:
        return `${prefix}${message.content}`;
    }
  };

  const renderItem = ({ item }: { item: ChatRoom }) => (
    <ChatItem
      chat={item}
      onPress={() => onChatPress(item)}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onChatLongPress?.(item);
      }}
      onPin={() => onPinChat?.(item.id)}
      onMute={() => onMuteChat?.(item.id)}
      onDelete={() => onDeleteChat?.(item.id)}
      onArchive={() => onArchiveChat?.(item.id)}
      lastMessagePreview={getLastMessagePreview(item.lastMessage)}
      lastMessageTime={formatTime(item.lastMessage?.timestamp)}
      text={text}
      textMuted={textMuted}
      background={background}
      surface={surface}
      primary={primary}
    />
  );

  const renderSeparator = () => (
    <View style={[styles.separator, { backgroundColor: surface }]} />
  );

  return (
    <FlatList
      data={sortedChats}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={renderSeparator}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
}

// ==================== CHAT ITEM COMPONENT ====================

interface ChatItemProps {
  chat: ChatRoom;
  onPress: () => void;
  onLongPress?: () => void;
  onPin?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  lastMessagePreview: string;
  lastMessageTime: string;
  text: string;
  textMuted: string;
  background: string;
  surface: string;
  primary: string;
}

function ChatItem({
  chat,
  onPress,
  onLongPress,
  onPin,
  onMute,
  onDelete,
  onArchive,
  lastMessagePreview,
  lastMessageTime,
  text,
  textMuted,
  background,
  surface,
  primary,
}: ChatItemProps) {
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const [showActions, setShowActions] = useState(false);

  // Get online status from participants
  const isOnline = chat.participants.some(p => p.isOnline && p.id !== chat.id);
  
  // Get typing status text
  const getTypingText = () => {
    // This would come from real typing status
    return null;
  };

  return (
    <View style={styles.itemWrapper}>
      {/* Swipe actions (revealed) */}
      <View style={styles.swipeActionsContainer}>
        <Pressable 
          style={[styles.swipeAction, { backgroundColor: '#3B82F6' }]}
          onPress={onPin}
        >
          <Ionicons name={chat.isPinned ? 'close' : 'pin'} size={20} color="#fff" />
          <Text style={styles.swipeActionText}>{chat.isPinned ? 'Bỏ ghim' : 'Ghim'}</Text>
        </Pressable>
        <Pressable 
          style={[styles.swipeAction, { backgroundColor: '#F59E0B' }]}
          onPress={onMute}
        >
          <Ionicons name={chat.isMuted ? 'notifications' : 'notifications-off'} size={20} color="#fff" />
          <Text style={styles.swipeActionText}>{chat.isMuted ? 'Bật TB' : 'Tắt TB'}</Text>
        </Pressable>
        <Pressable 
          style={[styles.swipeAction, { backgroundColor: '#EF4444' }]}
          onPress={onDelete}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.swipeActionText}>Xóa</Text>
        </Pressable>
      </View>

      {/* Main chat item */}
      <Animated.View
        style={[
          styles.chatItem,
          { backgroundColor: background, transform: [{ translateX: swipeAnim }] },
        ]}
      >
        <Pressable 
          style={styles.chatItemContent}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {chat.avatar ? (
              <Image source={{ uri: chat.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: primary + '20' }]}>
                {chat.type === 'group' ? (
                  <Ionicons name="people" size={24} color={primary} />
                ) : (
                  <Text style={[styles.avatarText, { color: primary }]}>
                    {chat.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
            )}
            
            {/* Online indicator */}
            {isOnline && <View style={styles.onlineIndicator} />}
            
            {/* Group badge */}
            {chat.type === 'group' && chat.participants.length > 2 && (
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{chat.participants.length}</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <View style={styles.chatTitleRow}>
                {chat.isPinned && (
                  <Ionicons name="pin" size={14} color={primary} style={styles.pinnedIcon} />
                )}
                <Text 
                  style={[
                    styles.chatName, 
                    { color: text },
                    chat.unreadCount > 0 && styles.chatNameUnread,
                  ]} 
                  numberOfLines={1}
                >
                  {chat.name}
                </Text>
                {chat.isMuted && (
                  <Ionicons name="notifications-off" size={14} color={textMuted} style={styles.mutedIcon} />
                )}
              </View>
              <Text style={[styles.chatTime, { color: chat.unreadCount > 0 ? primary : textMuted }]}>
                {lastMessageTime}
              </Text>
            </View>
            
            <View style={styles.chatFooter}>
              <Text 
                style={[
                  styles.chatPreview, 
                  { color: textMuted },
                  chat.unreadCount > 0 && styles.chatPreviewUnread,
                ]} 
                numberOfLines={1}
              >
                {getTypingText() || lastMessagePreview}
              </Text>
              
              {chat.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: chat.isMuted ? textMuted : primary }]}>
                  <Text style={styles.unreadBadgeText}>
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ==================== EMPTY STATE ====================

export function ChatListEmpty() {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={textMuted} />
      <Text style={[styles.emptyTitle, { color: text }]}>Chưa có cuộc trò chuyện</Text>
      <Text style={[styles.emptyMessage, { color: textMuted }]}>
        Bắt đầu trò chuyện bằng cách nhấn vào biểu tượng tin nhắn
      </Text>
    </View>
  );
}

// ==================== SEARCH HEADER ====================

interface ChatSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
}

export function ChatSearchHeader({ searchQuery, onSearchChange, onNewChat }: ChatSearchHeaderProps) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surface = useThemeColor({}, 'surface');
  const primary = useThemeColor({}, 'primary');

  return (
    <View style={[styles.searchHeader, { backgroundColor: surface }]}>
      <View style={[styles.searchBar, { backgroundColor: surface }]}>
        <Ionicons name="search" size={20} color={textMuted} />
        <Text style={[styles.searchPlaceholder, { color: textMuted }]}>
          Tìm kiếm tin nhắn, bạn bè...
        </Text>
      </View>
      
      <Pressable style={styles.newChatButton} onPress={onNewChat}>
        <Ionicons name="create-outline" size={24} color={primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 100,
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
  
  // Chat item
  itemWrapper: {
    position: 'relative',
  },
  swipeActionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  swipeAction: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  swipeActionText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  chatItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Content
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pinnedIcon: {
    marginRight: 4,
  },
  chatName: {
    fontSize: 16,
    flex: 1,
  },
  chatNameUnread: {
    fontWeight: '600',
  },
  mutedIcon: {
    marginLeft: 4,
  },
  chatTime: {
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  chatPreviewUnread: {
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  
  // Search header
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 15,
  },
  newChatButton: {
    padding: 4,
  },
});

export default ChatListEnhanced;
