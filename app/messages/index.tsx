/**
 * Messages List Screen
 * Displays conversations with unread badges (like Zalo)
 */

import Avatar from '@/components/ui/avatar';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OtherUser {
  id: number;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string | null;
}

interface LastMessage {
  content: string;
  type: string;
  sentAt: string;
  isFromMe: boolean;
  isRead: boolean;
}

interface Conversation {
  id: number;
  otherUser: OtherUser;
  lastMessage: LastMessage;
  unreadCount: number;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchConversations = useCallback(async (isRefresh = false, currentOffset?: number) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (currentOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const offsetToUse = isRefresh ? 0 : (currentOffset ?? offset);
  const data = await apiFetch(`/api/messages?limit=${limit}&offset=${offsetToUse}`);

      const newConversations = data.conversations || [];
      
      if (isRefresh || offsetToUse === 0) {
        setConversations(newConversations);
        setOffset(limit);
      } else {
        setConversations(prev => [...prev, ...newConversations]);
        setOffset(offsetToUse + limit);
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (error: any) {
      // Gracefully handle missing endpoint during development
      const status = error?.status ?? error?.data?.statusCode;
      if (status === 404) {
        setConversations([]);
        setHasMore(false);
      } else {
        console.error('Failed to fetch conversations:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []); // REMOVE offset dependency!

  useEffect(() => {
    fetchConversations(false, 0);
  }, [fetchConversations]);

  const handleRefresh = () => {
    fetchConversations(true, 0);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchConversations(false, offset);
    }
  };

  const handleConversationPress = (otherUserId: number) => {
    router.push(`/messages/${otherUserId}` as any);
  };

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

  const truncateMessage = (content: string, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item.otherUser.id)}
      activeOpacity={0.7}
    >
      {/* Avatar with online indicator */}
      <View style={styles.avatarContainer}>
        <Avatar
          avatar={item.otherUser.avatar}
          userId={String(item.otherUser.id)}
          name={item.otherUser.name}
          pixelSize={56}
          showBadge={item.otherUser.isOnline}
          onlineStatus={item.otherUser.isOnline ? 'online' : undefined}
        />
      </View>

      {/* Message content */}
      <View style={styles.messageContent}>
        <View style={styles.headerRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.otherUser.name}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(item.lastMessage.sentAt)}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <View style={{ flex: 1 }}>
            {item.lastMessage.type === 'image' && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="image" size={14} color="#999" style={{ marginRight: 4 }} />
                <Text style={[styles.messageText, item.unreadCount > 0 && styles.unreadText]}>
                  Hình ảnh
                </Text>
              </View>
            )}
            {item.lastMessage.type === 'video' && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="videocam" size={14} color="#999" style={{ marginRight: 4 }} />
                <Text style={[styles.messageText, item.unreadCount > 0 && styles.unreadText]}>
                  Video
                </Text>
              </View>
            )}
            {item.lastMessage.type === 'text' && (
              <Text 
                style={[styles.messageText, item.unreadCount > 0 && styles.unreadText]} 
                numberOfLines={1}
              >
                {item.lastMessage.isFromMe && 'Bạn: '}
                {truncateMessage(item.lastMessage.content)}
              </Text>
            )}
          </View>

          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#22c55e" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
        <Text style={styles.emptySubtitle}>
          Tin nhắn của bạn sẽ hiển thị ở đây
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <TouchableOpacity
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="create-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" />
        <Text style={styles.searchPlaceholder}>Tìm kiếm</Text>
      </View>

      {/* Conversations list */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#22c55e']}
            tintColor="#22c55e"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 14,
    color: '#999',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
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
    fontWeight: '600',
    color: '#111',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#ef4444',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
