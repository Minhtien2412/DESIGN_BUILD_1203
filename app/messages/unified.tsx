/**
 * Zalo-style Unified Messages Screen
 * Màn hình tin nhắn thống nhất kiểu Zalo
 * Hiển thị conversations + calls trong 1 danh sách
 * + Badge sync với UnifiedBadgeContext
 * 
 * @author AI Assistant
 * @date 03/01/2026
 */

import Avatar from '@/components/ui/avatar';
import { useUnifiedBadge } from '@/context/UnifiedBadgeContext';
import { UnifiedConversation, UnifiedMessage, useUnifiedMessaging } from '@/hooks/crm/useUnifiedMessaging';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ==================== THEME ====================

const COLORS = {
  primary: '#0068FF', // Zalo blue
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E5E5',
  online: '#0066CC',
  offline: '#9CA3AF',
  away: '#0066CC',
  busy: '#000000',
  unread: '#0068FF',
  missedCall: '#000000',
  pinned: '#FEF3C7',
  muted: '#9CA3AF',
};

// ==================== FILTER TABS ====================

type FilterTab = 'all' | 'unread' | 'groups';

const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'groups', label: 'Nhóm' },
];

// ==================== COMPONENTS ====================

interface ConversationItemProps {
  conversation: UnifiedConversation;
  onPress: () => void;
  onLongPress: () => void;
}

function ConversationItem({ conversation, onPress, onLongPress }: ConversationItemProps) {
  const { name, avatar, lastMessage, unreadCount, isOnline, isPinned, isMuted, typingUsers } = conversation;

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Get last message preview
  const getLastMessagePreview = (message?: UnifiedMessage) => {
    if (!message) return 'Bắt đầu cuộc trò chuyện';

    switch (message.type) {
      case 'image':
        return '📷 Hình ảnh';
      case 'voice':
        return `🎤 Tin nhắn thoại (${formatDuration(message.audioDuration || 0)})`;
      case 'file':
        return `📎 ${message.fileName || 'Tệp đính kèm'}`;
      case 'call':
      case 'video_call':
        if (message.callStatus === 'missed') {
          return message.callType === 'video' ? '📹 Cuộc gọi video nhỡ' : '📞 Cuộc gọi nhỡ';
        }
        if (message.callStatus === 'answered') {
          const icon = message.callType === 'video' ? '📹' : '📞';
          return `${icon} Cuộc gọi ${formatDuration(message.callDuration || 0)}`;
        }
        return message.callType === 'video' ? '📹 Cuộc gọi video' : '📞 Cuộc gọi';
      default:
        return message.content;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Online status color
  const getOnlineStatusColor = () => {
    if (isOnline) return COLORS.online;
    const participant = conversation.participants[0];
    if (!participant) return COLORS.offline;
    
    switch (participant.onlineStatus) {
      case 'online': return COLORS.online;
      case 'away': return COLORS.away;
      case 'busy': return COLORS.busy;
      default: return COLORS.offline;
    }
  };

  const isMissedCall = lastMessage?.type === 'call' && lastMessage?.callStatus === 'missed';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.conversationItem,
        isPinned && styles.pinnedItem,
        pressed && styles.pressedItem,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Avatar with online status */}
      <View style={styles.avatarWrapper}>
        <Avatar
          avatar={avatar || null}
          userId={conversation.id}
          name={name}
          pixelSize={52}
        />
        <View style={[styles.onlineIndicator, { backgroundColor: getOnlineStatusColor() }]} />
      </View>

      {/* Content */}
      <View style={styles.conversationContent}>
        {/* Row 1: Name + Time */}
        <View style={styles.conversationHeader}>
          <View style={styles.nameRow}>
            {isPinned && (
              <Ionicons name="pin" size={14} color={COLORS.primary} style={styles.pinIcon} />
            )}
            <Text style={styles.conversationName} numberOfLines={1}>
              {name}
            </Text>
            {isMuted && (
              <Ionicons name="volume-mute" size={14} color={COLORS.muted} style={styles.muteIcon} />
            )}
          </View>
          <Text style={[styles.timeText, unreadCount > 0 && styles.timeTextUnread]}>
            {lastMessage ? formatTime(lastMessage.createdAt) : ''}
          </Text>
        </View>

        {/* Row 2: Last message + Badge */}
        <View style={styles.conversationFooter}>
          {typingUsers.length > 0 ? (
            <Text style={styles.typingText}>
              {typingUsers[0].name} đang nhập...
            </Text>
          ) : (
            <Text 
              style={[
                styles.lastMessageText,
                isMissedCall && styles.missedCallText,
                unreadCount > 0 && styles.lastMessageUnread,
              ]} 
              numberOfLines={1}
            >
              {getLastMessagePreview(lastMessage)}
            </Text>
          )}
          
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, isMuted && styles.mutedBadge]}>
              <Text style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ==================== MAIN COMPONENT ====================

export default function UnifiedMessagesScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Unified Badge Context - sync badge counts
  const { badges, syncWithMessaging } = useUnifiedBadge();

  const {
    conversations,
    loadingConversations,
    refreshConversations,
    totalUnreadCount,
    missedCallsCount,
    searchConversations,
    pinConversation,
    muteConversation,
    deleteConversation,
  } = useUnifiedMessaging();

  // Sync badge counts với badge context khi data thay đổi
  useEffect(() => {
    syncWithMessaging(totalUnreadCount, missedCallsCount);
  }, [totalUnreadCount, missedCallsCount, syncWithMessaging]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Search filter
    if (searchQuery.trim()) {
      result = searchConversations(searchQuery);
    }

    // Tab filter
    switch (activeFilter) {
      case 'unread':
        result = result.filter(c => c.unreadCount > 0);
        break;
      case 'groups':
        result = result.filter(c => c.type === 'group');
        break;
    }

    return result;
  }, [conversations, searchQuery, activeFilter, searchConversations]);

  // Navigation
  const handleConversationPress = useCallback((conversation: UnifiedConversation) => {
    // Navigate to chat screen with conversation ID
    router.push(`/messages/chat/${conversation.id}`);
  }, []);

  // Long press actions
  const handleConversationLongPress = useCallback((conversation: UnifiedConversation) => {
    const actions = [
      {
        text: conversation.isPinned ? 'Bỏ ghim' : 'Ghim hội thoại',
        onPress: () => pinConversation(conversation.id, !conversation.isPinned),
      },
      {
        text: conversation.isMuted ? 'Bật thông báo' : 'Tắt thông báo',
        onPress: () => muteConversation(conversation.id, !conversation.isMuted),
      },
      {
        text: 'Xóa cuộc trò chuyện',
        onPress: () => {
          Alert.alert(
            'Xóa cuộc trò chuyện',
            'Bạn có chắc muốn xóa cuộc trò chuyện này?',
            [
              { text: 'Hủy', style: 'cancel' },
              { 
                text: 'Xóa', 
                style: 'destructive',
                onPress: () => deleteConversation(conversation.id),
              },
            ]
          );
        },
        style: 'destructive' as const,
      },
      { text: 'Đóng', style: 'cancel' as const },
    ];

    Alert.alert(
      conversation.name,
      undefined,
      actions.map(action => ({
        text: action.text,
        onPress: action.onPress,
        style: action.style,
      }))
    );
  }, [pinConversation, muteConversation, deleteConversation]);

  // New message
  const handleNewMessage = useCallback(() => {
    router.push('/messages/new-conversation');
  }, []);

  // Call history
  const handleCallHistory = useCallback(() => {
    router.push('/call/history');
  }, []);

  // Render conversation item
  const renderConversation = useCallback(({ item }: { item: UnifiedConversation }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
      onLongPress={() => handleConversationLongPress(item)}
    />
  ), [handleConversationPress, handleConversationLongPress]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có tin nhắn'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Thử tìm kiếm với từ khóa khác'
          : 'Bắt đầu cuộc trò chuyện mới với đồng nghiệp'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleNewMessage}>
          <Text style={styles.emptyButtonText}>Tin nhắn mới</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          {totalUnreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerRight}>
          {/* Call History Button */}
          <TouchableOpacity style={styles.headerButton} onPress={handleCallHistory}>
            <Ionicons name="call-outline" size={24} color={COLORS.text} />
            {missedCallsCount > 0 && (
              <View style={styles.callBadge}>
                <Text style={styles.callBadgeText}>{missedCallsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* New Message Button */}
          <TouchableOpacity style={styles.headerButton} onPress={handleNewMessage}>
            <Ionicons name="create-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin nhắn..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text style={[
              styles.filterTabText,
              activeFilter === tab.key && styles.filterTabTextActive
            ]}>
              {tab.label}
              {tab.key === 'unread' && totalUnreadCount > 0 && ` (${totalUnreadCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conversation List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loadingConversations}
            onRefresh={refreshConversations}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={!loadingConversations ? renderEmptyState : null}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading Overlay */}
      {loadingConversations && conversations.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}

      {/* FAB - New Message */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 16 }]} 
        onPress={handleNewMessage}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerBadge: {
    backgroundColor: COLORS.unread,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
    position: 'relative',
  },
  callBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.missedCall,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Conversation List
  listContent: {
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 80,
  },

  // Conversation Item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  pinnedItem: {
    backgroundColor: COLORS.pinned,
  },
  pressedItem: {
    backgroundColor: COLORS.surface,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pinIcon: {
    marginRight: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  muteIcon: {
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  timeTextUnread: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: COLORS.text,
    fontWeight: '500',
  },
  missedCallText: {
    color: COLORS.missedCall,
  },
  typingText: {
    fontSize: 14,
    color: COLORS.primary,
    fontStyle: 'italic',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.unread,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  mutedBadge: {
    backgroundColor: COLORS.muted,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
