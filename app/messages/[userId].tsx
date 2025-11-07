/**
 * Message Thread Screen
 * Chat interface between two users with bubble UI (like Zalo)
 */

import Avatar from '@/components/ui/avatar';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Message {
  id: number;
  content: string;
  type: string;
  mediaUrl: string | null;
  sentAt: string;
  isFromMe: boolean;
  isRead: boolean;
  readAt: string | null;
}

interface OtherUser {
  id: number;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string | null;
}

export default function MessageThreadScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const otherUserId = parseInt(userId || '0');

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const limit = 50;

  const flatListRef = useRef<FlatList>(null);
  const pollIntervalRef = useRef<any>(null); // Use 'any' for cross-platform compatibility
  const lastMessageIdRef = useRef<number>(0);
  const isAtBottomRef = useRef<boolean>(true);

  // Fetch new messages only (for polling)
  const fetchNewMessages = useCallback(async () => {
    try {
      // Fetch only recent messages (limit=20)
      const data = await apiFetch(`/api/messages/${otherUserId}?limit=20&offset=0`);
      
      const newMessages = data.messages || [];
      if (newMessages.length === 0) return;

      // Get the latest message ID from current state
      const currentLastId = lastMessageIdRef.current;
      
      // Filter only messages newer than current last message
      const trulyNewMessages = newMessages.filter((msg: Message) => msg.id > currentLastId);
      
      if (trulyNewMessages.length > 0) {
        // Append new messages to the end
        setMessages(prev => [...prev, ...trulyNewMessages]);
        
        // Update last message ID
        const newestId = Math.max(...trulyNewMessages.map((m: Message) => m.id));
        lastMessageIdRef.current = newestId;
        
        // If user is at bottom, auto-scroll. Otherwise show indicator
        if (isAtBottomRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          setNewMessagesCount(0);
        } else {
          setNewMessagesCount(prev => prev + trulyNewMessages.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch new messages:', error);
    }
  }, []); // REMOVE otherUserId dependency!

  const fetchMessages = useCallback(async (isLoadMore = false, currentOffset?: number) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const offsetToUse = isLoadMore ? (currentOffset ?? offset) : 0;
      const data = await apiFetch(`/api/messages/${otherUserId}?limit=${limit}&offset=${offsetToUse}`);

      if (data.otherUser) {
        setOtherUser(data.otherUser);
      }

      const newMessages = data.messages || [];
      
      if (isLoadMore) {
        // Prepend older messages
        setMessages(prev => [...newMessages, ...prev]);
        setOffset(offsetToUse + newMessages.length);
      } else {
        setMessages(newMessages);
        setOffset(newMessages.length);
        
        // Update last message ID for polling
        if (newMessages.length > 0) {
          const latestId = Math.max(...newMessages.map((m: Message) => m.id));
          lastMessageIdRef.current = latestId;
        }
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); // REMOVE all dependencies to prevent re-creation

  useEffect(() => {
    if (otherUserId) {
      fetchMessages(false, 0);
    }
  }, [otherUserId]); // Only depend on otherUserId, NOT fetchMessages

  // Auto-refresh: Poll for new messages every 5 seconds
  useEffect(() => {
    if (!otherUserId || loading) return;

    // Start polling after initial load
    pollIntervalRef.current = setInterval(() => {
      fetchNewMessages();
    }, 5000); // Poll every 5 seconds

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [otherUserId, loading]); // REMOVE fetchNewMessages dependency!

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const tempMessage: Message = {
      id: Date.now(), // Temporary ID
      content: messageText.trim(),
      type: 'text',
      mediaUrl: null,
      sentAt: new Date().toISOString(),
      isFromMe: true,
      isRead: false,
      readAt: null,
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setMessageText('');
    Keyboard.dismiss();

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      setSending(true);
      const data = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: otherUserId,
          content: tempMessage.content,
          type: 'text',
        }),
      });

      // Replace temp message with real message
      setMessages(prev => 
        prev.map((msg: Message) => msg.id === tempMessage.id ? data.message : msg)
      );
      
      // Update last message ID for polling
      if (data.message && data.message.id) {
        lastMessageIdRef.current = Math.max(lastMessageIdRef.current, data.message.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter((msg: Message) => msg.id !== tempMessage.id));
      // TODO: Show error alert
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMessages(true, offset);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isYesterday) {
      return 'Hôm qua ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Offline';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa online';
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.isFromMe !== item.isFromMe;
    const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.isFromMe !== item.isFromMe;

    return (
      <View style={[
        styles.messageRow,
        item.isFromMe ? styles.messageRowRight : styles.messageRowLeft
      ]}>
        {/* Avatar (left side for received messages) */}
        {!item.isFromMe && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Avatar
                avatar={otherUser?.avatar ?? null}
                userId={otherUser ? String(otherUser.id) : undefined}
                name={otherUser?.name}
                pixelSize={32}
              />
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        {/* Message bubble */}
        <View style={[
          styles.messageBubble,
          item.isFromMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
          !showAvatar && (item.isFromMe ? styles.bubbleGroupRight : styles.bubbleGroupLeft),
        ]}>
          {item.type === 'text' && (
            <Text style={[
              styles.messageText,
              item.isFromMe ? styles.messageTextRight : styles.messageTextLeft
            ]}>
              {item.content}
            </Text>
          )}
          
          {item.type === 'image' && item.mediaUrl && (
            <View>
              <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
              {item.content && (
                <Text style={[
                  styles.messageText,
                  item.isFromMe ? styles.messageTextRight : styles.messageTextLeft,
                  { marginTop: 4 }
                ]}>
                  {item.content}
                </Text>
              )}
            </View>
          )}

          {/* Time and read status */}
          {isLastInGroup && (
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                item.isFromMe ? styles.messageTimeRight : styles.messageTimeLeft
              ]}>
                {formatMessageTime(item.sentAt)}
              </Text>
              {item.isFromMe && (
                <Ionicons 
                  name={item.isRead ? "checkmark-done" : "checkmark"} 
                  size={12} 
                  color={item.isRead ? "#3b82f6" : "#999"}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#22c55e" />
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

  if (!otherUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy người dùng</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Avatar
            avatar={otherUser.avatar}
            userId={String(otherUser.id)}
            name={otherUser.name}
            pixelSize={36}
            showBadge={otherUser.isOnline}
            onlineStatus={otherUser.isOnline ? 'online' : undefined}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser.name}
            </Text>
            <Text style={styles.headerStatus}>
              {otherUser.isOnline ? (
                <Text style={{ color: '#22c55e' }}>● Đang online</Text>
              ) : (
                formatLastSeen(otherUser.lastSeen)
              )}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push(`/call/video-call?userId=${otherUserId}` as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="videocam" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Messages list */}
      <View style={{ flex: 1, position: 'relative' }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          inverted={false}
          onScroll={(e) => {
            // Track if user is at bottom
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            const isBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
            isAtBottomRef.current = isBottom;
            
            // Clear new messages count if scrolled to bottom
            if (isBottom && newMessagesCount > 0) {
              setNewMessagesCount(0);
            }
          }}
          scrollEventThrottle={100}
          onContentSizeChange={() => {
            // Auto-scroll to bottom on first load
            if (offset === limit) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />
        
        {/* New messages indicator */}
        {newMessagesCount > 0 && (
          <TouchableOpacity
            style={styles.newMessagesBadge}
            onPress={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
              setNewMessagesCount(0);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-down" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.newMessagesBadgeText}>
              {newMessagesCount} tin nhắn mới
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.inputButton}>
          <Ionicons name="happy-outline" size={24} color="#999" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity style={styles.inputButton}>
          <Ionicons name="image-outline" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!messageText.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  headerStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleLeft: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: '#22c55e',
    borderBottomRightRadius: 4,
  },
  bubbleGroupLeft: {
    borderBottomLeftRadius: 18,
  },
  bubbleGroupRight: {
    borderBottomRightRadius: 18,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: '#111',
  },
  messageTextRight: {
    color: '#fff',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeLeft: {
    color: '#999',
  },
  messageTimeRight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  inputButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#111',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  newMessagesBadge: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  newMessagesBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
