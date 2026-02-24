/**
 * Chat List Screen - Danh sách chat với dữ liệu thật từ API
 * Sử dụng chatAPIService + ChatListEnhanced component
 */

import { ChatListEnhanced } from '@/components/chat';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { chatAPIService } from '@/services/chatAPIService';
import type { ChatRoom } from '@/services/ChatService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Theme colors
  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  // State
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Current user ID
  const currentUserId = user?.id?.toString() || '';

  // Load chat rooms from API
  const loadChatRooms = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      
      setError(null);

      const rooms = await chatAPIService.getChatRooms();
      setChatRooms(rooms);
      
      console.log('[ChatList] Loaded', rooms.length, 'chat rooms');
    } catch (err) {
      console.error('[ChatList] Load error:', err);
      setError('Không thể tải danh sách chat. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadChatRooms();
    }, [loadChatRooms])
  );

  // Filter chats by search query
  const filteredRooms = chatRooms.filter(room => 
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleChatPress = (room: ChatRoom) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/chat/[chatId]',
      params: { 
        chatId: room.id,
        chatName: room.name || 'Chat',
      },
    });
  };

  const handleChatLongPress = (room: ChatRoom) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      room.name || 'Chat',
      'Chọn hành động',
      [
        { text: 'Ghim', onPress: () => handlePinChat(room) },
        { text: 'Tắt thông báo', onPress: () => handleMuteChat(room) },
        { text: 'Xóa', onPress: () => handleDeleteChat(room), style: 'destructive' },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handlePinChat = (room: ChatRoom) => {
    setChatRooms(prev => 
      prev.map(r => r.id === room.id ? { ...r, isPinned: !r.isPinned } : r)
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleMuteChat = (room: ChatRoom) => {
    setChatRooms(prev => 
      prev.map(r => r.id === room.id ? { ...r, isMuted: !r.isMuted } : r)
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteChat = (room: ChatRoom) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      `Bạn có chắc muốn xóa cuộc trò chuyện với "${room.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            setChatRooms(prev => prev.filter(r => r.id !== room.id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        },
      ]
    );
  };

  // Callbacks with chatId string
  const handlePinChatById = (chatId: string) => {
    const room = chatRooms.find(r => r.id === chatId);
    if (room) handlePinChat(room);
  };

  const handleMuteChatById = (chatId: string) => {
    const room = chatRooms.find(r => r.id === chatId);
    if (room) handleMuteChat(room);
  };

  const handleDeleteChatById = (chatId: string) => {
    const room = chatRooms.find(r => r.id === chatId);
    if (room) handleDeleteChat(room);
  };

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to new chat / contact selection screen
    Alert.alert('Tạo chat mới', 'Tính năng đang được phát triển');
  };

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: primary, paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Tin nhắn</Text>
      <Pressable style={styles.headerAction} onPress={handleNewChat}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </Pressable>
    </View>
  );

  // Render search bar
  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: background }]}>
      <View style={[styles.searchBar, { backgroundColor: surface, borderColor: border }]}>
        <Ionicons name="search" size={20} color={textMuted} />
        <TextInput
          style={[styles.searchInput, { color: text }]}
          placeholder="Tìm kiếm..."
          placeholderTextColor={textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color={textMuted} />
      <Text style={[styles.emptyTitle, { color: text }]}>
        Chưa có cuộc trò chuyện nào
      </Text>
      <Text style={[styles.emptyText, { color: textMuted }]}>
        Bắt đầu cuộc trò chuyện mới bằng cách{'\n'}nhấn nút + ở góc trên phải
      </Text>
      <Pressable 
        style={[styles.emptyButton, { backgroundColor: primary }]}
        onPress={handleNewChat}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Tạo chat mới</Text>
      </Pressable>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="warning-outline" size={48} color="#F59E0B" />
      <Text style={[styles.errorText, { color: text }]}>{error}</Text>
      <Pressable 
        style={[styles.retryButton, { borderColor: primary }]}
        onPress={() => loadChatRooms()}
      >
        <Text style={[styles.retryText, { color: primary }]}>Thử lại</Text>
      </Pressable>
    </View>
  );

  // Main render
  if (isLoading && chatRooms.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Loader size="large" />
          <Text style={[styles.loadingText, { color: textMuted }]}>
            Đang tải danh sách chat...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {renderHeader()}
      {renderSearchBar()}

      {error ? (
        renderError()
      ) : filteredRooms.length === 0 ? (
        renderEmpty()
      ) : (
        <ChatListEnhanced
          chats={filteredRooms}
          currentUserId={currentUserId}
          onChatPress={handleChatPress}
          onChatLongPress={handleChatLongPress}
          onPinChat={handlePinChatById}
          onMuteChat={handleMuteChatById}
          onDeleteChat={handleDeleteChatById}
        />
      )}
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerAction: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
