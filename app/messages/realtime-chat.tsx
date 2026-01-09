/**
 * Simple Chat Screen (Menu9)
 * Real-time messaging with WebSocket support
 * Ready for backend integration
 */

import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
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

// ==================== TYPES ====================

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount: number;
}

type SelectedRoom = ChatRoom | null;

// ==================== COMPONENT ====================

export default function ChatScreen() {
  const { user } = useAuth();
  const { socket, connected, connecting, error, connect } = useWebSocket();
  
  const [rooms, setRooms] = useState<ChatRoom[]>([
    { id: '1', name: 'General', lastMessage: 'Hello team!', unreadCount: 2 },
    { id: '2', name: 'Project Alpha', lastMessage: 'Meeting at 3pm', unreadCount: 0 },
    { id: '3', name: 'Support', lastMessage: 'How can we help?', unreadCount: 1 },
  ]);
  
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // ==================== WEBSOCKET INTEGRATION ====================

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    // Skip WebSocket on web platform
    if (Platform.OS === 'web') {
      console.log('[Chat] WebSocket disabled on web platform');
      return;
    }

    // WebSocket event listeners (ready for when backend is deployed)
    if (socket && connected) {
      console.log('[Chat] WebSocket connected, setting up listeners');

      // Listen for new messages
      socket.on('chat:message', (data: any) => {
        console.log('[Chat] New message received:', data);
        const newMessage: Message = {
          id: data.id || Date.now().toString(),
          senderId: data.userId,
          senderName: data.userName || 'User',
          content: data.content,
          timestamp: data.createdAt || new Date().toISOString(),
          isOwn: data.userId === user.id,
        };
        setMessages(prev => [...prev, newMessage]);
      });

      // Listen for typing indicators
      socket.on('chat:typing', (data: any) => {
        console.log('[Chat] User typing:', data);
        if (data.userId !== user.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
      });

      return () => {
        socket.off('chat:message');
        socket.off('chat:typing');
      };
    }
  }, [socket, connected, user]);

  // Join room when selected
  useEffect(() => {
    if (socket && connected && selectedRoom) {
      console.log('[Chat] Joining room:', selectedRoom.id);
      socket.emit('chat:join', { roomId: selectedRoom.id });
      
      // Load mock messages already loaded by selectRoom()

      return () => {
        socket.emit('chat:leave', { roomId: selectedRoom.id });
      };
    }
  }, [socket, connected, selectedRoom]);

  // ==================== MOCK DATA ====================

  const loadRoomMessages = (roomId: string) => {
    // Mock messages (replace with API call)
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'other',
        senderName: 'John Doe',
        content: 'Hey everyone! How are you?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isOwn: false,
      },
      {
        id: '2',
        senderId: user?.id || 'me',
        senderName: user?.name || 'Me',
        content: 'Hi John! Doing great, thanks!',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        isOwn: true,
      },
      {
        id: '3',
        senderId: 'other',
        senderName: 'Jane Smith',
        content: 'Welcome to the chat!',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isOwn: false,
      },
    ];
    
    setMessages(mockMessages);
  };

  // ==================== HANDLERS ====================

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;
    if (!selectedRoom) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'me',
      senderName: user?.name || 'Me',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    // Optimistic UI update
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    Keyboard.dismiss();

    // Send via WebSocket if connected
    if (socket && connected && selectedRoom) {
      socket.emit('chat:message', {
        roomId: selectedRoom.id,
        content: newMessage.content,
        userId: user?.id,
        userName: user?.name,
      });
    } else {
      console.log('[Chat] WebSocket not connected, message only local');
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, selectedRoom, socket, connected, user]);

  const handleTyping = useCallback(() => {
    if (socket && connected && selectedRoom && typeof selectedRoom !== 'string') {
      socket.emit('chat:typing', {
        roomId: selectedRoom.id,
        userId: user?.id,
        userName: user?.name,
      });
    }
  }, [socket, connected, selectedRoom, user]);

  const selectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setMessages([]);
    loadRoomMessages(room.id);
  };

  const goBack = () => {
    if (selectedRoom) {
      setSelectedRoom(null);
    } else {
      router.back();
    }
  };

  // ==================== RENDER ====================

  // Room List View
  if (!selectedRoom) {
    return (
      <Container>
        <Section>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={styles.headerRight}>
              {connecting && <Text style={styles.statusText}>Connecting...</Text>}
              {connected && (
                <View style={styles.connectedIndicator}>
                  <View style={styles.connectedDot} />
                  <Text style={styles.connectedText}>Online</Text>
                </View>
              )}
              {error && <Text style={styles.errorText}>Offline</Text>}
            </View>
          </View>

          {!connected && !connecting && (
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={20} color="#666" />
              <Text style={styles.noticeText}>
                WebSocket not connected. Backend not ready yet.
              </Text>
              <TouchableOpacity onPress={connect} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={rooms}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.roomItem}
                onPress={() => selectRoom(item)}
              >
                <View style={styles.roomIcon}>
                  <Ionicons name="chatbubbles" size={24} color="#0066CC" />
                </View>
                <View style={styles.roomInfo}>
                  <View style={styles.roomHeader}>
                    <Text style={styles.roomName}>{item.name}</Text>
                    {item.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                  {item.lastMessage && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Section>
      </Container>
    );
  }

  // Chat Room View
  const currentRoom = rooms.find(r => r.id === selectedRoom?.id);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Container>
        <View style={styles.chatContainer}>
          {/* Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.chatRoomName}>{currentRoom?.name}</Text>
            <View style={styles.headerRight}>
              {connected ? (
                <View style={styles.connectedDot} />
              ) : (
                <Ionicons name="cloud-offline-outline" size={20} color="#999" />
              )}
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => (
              <View style={[
                styles.messageContainer,
                item.isOwn ? styles.ownMessage : styles.otherMessage,
              ]}>
                {!item.isOwn && (
                  <Text style={styles.senderName}>{item.senderName}</Text>
                )}
                <View style={[
                  styles.messageBubble,
                  item.isOwn ? styles.ownBubble : styles.otherBubble,
                ]}>
                  <Text style={[
                    styles.messageText,
                    item.isOwn ? styles.ownText : styles.otherText,
                  ]}>
                    {item.content}
                  </Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Someone is typing...</Text>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={text => {
                setInputText(text);
                handleTyping();
              }}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#FFF' : '#CCC'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853',
  },
  connectedText: {
    fontSize: 12,
    color: '#00C853',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#000000',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    marginBottom: 16,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0066CC',
    borderRadius: 4,
  },
  retryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#000000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  chatRoomName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#0066CC',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFF',
  },
  otherText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 8,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFF',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
});
