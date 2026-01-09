/**
 * Message Thread Screen
 * Chat interface between two users with bubble UI (like Zalo)
 * Now using real backend API with WebSocket support
 */

import Avatar from '@/components/ui/avatar';
import { useWebSocket } from '@/context/WebSocketContext';
import { useConversation } from '@/hooks/useMessages';
import type { Message } from '@/services/api/messagesApi';
import messagesApi from '@/services/api/messagesApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Recipient info type
interface RecipientInfo {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

export default function MessageThreadScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const recipientId = parseInt(userId || '0');
  
  // State for recipient info (fetched from conversation or API)
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);

  // Use conversation hook for data management
  // Hook will auto-fetch conversationId from recipientId if not provided
  const {
    messages,
    loading,
    sending,
    hasMore,
    conversationId,
    sendMessage,
    loadMore,
    markAllAsRead,
    refresh
  } = useConversation(null, recipientId);

  // WebSocket for real-time updates
  const { socket, connected } = useWebSocket();

  const [messageText, setMessageText] = useState('');
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isAtBottomRef = useRef<boolean>(true);

  // Fetch recipient info from conversation or messages
  useEffect(() => {
    const fetchRecipientInfo = async () => {
      // First try to get from messages
      if (messages.length > 0) {
        const otherUserMessage = messages.find(m => m.senderId === recipientId);
        if (otherUserMessage?.sender) {
          setRecipientInfo({
            id: otherUserMessage.sender.id,
            name: otherUserMessage.sender.name,
            email: otherUserMessage.sender.email,
          });
          return;
        }
      }
      
      // Then try to get from conversation
      try {
        const conversation = await messagesApi.getConversationByRecipient(recipientId);
        if (conversation) {
          const recipient = conversation.participants.find(p => p.id === recipientId);
          if (recipient) {
            setRecipientInfo({
              id: recipient.id,
              name: recipient.name,
              email: recipient.email,
            });
          }
        }
      } catch (err) {
        console.log('[MessageThread] Could not fetch recipient info:', err);
      }
    };

    if (recipientId) {
      fetchRecipientInfo();
    }
  }, [recipientId, messages]);

  // Derive display name
  const displayName = useMemo(() => {
    if (recipientInfo?.name) return recipientInfo.name;
    return `User ${recipientId}`;
  }, [recipientInfo, recipientId]);

  // Mark messages as read when entering conversation
  useEffect(() => {
    if (!loading && messages.length > 0 && conversationId) {
      markAllAsRead();
    }
  }, [loading, conversationId]);

  // WebSocket: Listen for new messages
  useEffect(() => {
    if (!socket || !connected) return;
    
    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.senderId === recipientId) {
        // Auto-scroll if at bottom
        if (isAtBottomRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          setNewMessagesCount(0);
        } else {
          setNewMessagesCount(prev => prev + 1);
        }
      }
    };

    socket.on('message:new', handleNewMessage);
    
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [recipientId, socket, connected]);

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [loading]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    setMessageText('');
    Keyboard.dismiss();

    try {
      await sendMessage(text);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message text on error
      setMessageText(text);
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
    const isFromMe = item.sender?.id !== recipientId;
    const showAvatar = !prevMessage || (prevMessage.sender?.id !== recipientId) !== isFromMe;
    const isLastInGroup = index === messages.length - 1 || 
      (messages[index + 1]?.sender?.id !== recipientId) !== isFromMe;

    return (
      <View style={[
        styles.messageRow,
        isFromMe ? styles.messageRowRight : styles.messageRowLeft
      ]}>
        {/* Avatar (left side for received messages) */}
        {!isFromMe && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Avatar
                avatar={null}
                userId={String(recipientId)}
                name={'User'}
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
          isFromMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
          !showAvatar && (isFromMe ? styles.bubbleGroupRight : styles.bubbleGroupLeft),
        ]}>
          <Text style={[
            styles.messageText,
            isFromMe ? styles.messageTextRight : styles.messageTextLeft
          ]}>
            {item.content}
          </Text>

          {/* Time and read status */}
          {isLastInGroup && (
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isFromMe ? styles.messageTimeRight : styles.messageTimeLeft
              ]}>
                {formatMessageTime(item.createdAt)}
              </Text>
              {isFromMe && (
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
    if (!hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <TouchableOpacity onPress={loadMore} disabled={loading}>
          <Text style={styles.loadMoreText}>
            {loading ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0068FF" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerCenter}
          onPress={() => router.push(`/profile/${recipientId}`)}
          activeOpacity={0.8}
        >
          <Avatar
            avatar={recipientInfo?.avatar || null}
            userId={String(recipientId)}
            name={displayName}
            pixelSize={36}
            showBadge={connected}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.headerStatus}>
              {connected ? (
                <Text style={{ color: '#7DD3FC' }}>● Đang online</Text>
              ) : (
                'Offline'
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push(`/call/${recipientId}?type=voice`)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="call" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push(`/call/${recipientId}?type=video`)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="videocam" size={24} color="#fff" />
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
          ListHeaderComponent={renderFooter}
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
    backgroundColor: '#E8ECF1', // Zalo-like chat background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#0068FF', // Zalo blue header
    borderBottomWidth: 0,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: '#fff', // White text on blue header
  },
  headerStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)', // Semi-transparent white
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
    backgroundColor: '#D5F1FF', // Zalo light blue for sent messages
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
    color: '#111', // Dark text on light blue bubble
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
    color: '#666', // Darker for contrast on light blue
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
    backgroundColor: '#0068FF', // Zalo blue send button
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
    backgroundColor: '#E8ECF1',
  },
  loadingIndicator: {
    color: '#0068FF', // Use in component
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
  loadMoreText: {
    fontSize: 14,
    color: '#0068FF', // Zalo blue
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  newMessagesBadge: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#0068FF', // Zalo blue
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
