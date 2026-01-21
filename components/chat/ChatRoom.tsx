import { TappableImage } from '@/components/ui/full-media-viewer';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content?: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
}

export interface ChatRoomProps {
  conversationId: string;
  recipientName: string;
  recipientAvatar?: string;
  onBack?: () => void;
}

// Mock WebSocket service - replace with actual WebSocket implementation
class MockChatService {
  private listeners: ((message: ChatMessage) => void)[] = [];
  private messages: ChatMessage[] = [];

  connect(conversationId: string) {
    console.log(`Connecting to conversation: ${conversationId}`);
    // Simulate connection
  }

  disconnect() {
    console.log('Disconnecting from chat');
  }

  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      status: 'sending',
    };

    this.messages.push(newMessage);
    this.notifyListeners(newMessage);

    // Simulate message delivery
    setTimeout(() => {
      newMessage.status = 'sent';
      this.notifyListeners({ ...newMessage });
    }, 1000);

    setTimeout(() => {
      newMessage.status = 'delivered';
      this.notifyListeners({ ...newMessage });
    }, 2000);

    return newMessage.id;
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(message: ChatMessage) {
    this.listeners.forEach(listener => listener(message));
  }

  getMessages(conversationId: string): ChatMessage[] {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  markAsRead(conversationId: string, messageIds: string[]) {
    this.messages = this.messages.map(message => {
      if (message.conversationId === conversationId && messageIds.includes(message.id)) {
        return { ...message, status: 'read' };
      }
      return message;
    });
  }
}

const chatService = new MockChatService();

export function ChatRoom({ conversationId, recipientName, recipientAvatar, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [typing, setTyping] = useState(false);
  
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  useEffect(() => {
    chatService.connect(conversationId);
    setMessages(chatService.getMessages(conversationId));

    const unsubscribe = chatService.onMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => {
          const existing = prev.find(m => m.id === message.id);
          if (existing) {
            return prev.map(m => m.id === message.id ? message : m);
          }
          return [...prev, message];
        });
      }
    });

    return () => {
      chatService.disconnect();
      unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text', fileData?: any) => {
    if (!content.trim() && type === 'text') return;

    const message = {
      conversationId,
      senderId: user?.id || 'current-user',
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar,
      content: type === 'text' ? content : undefined,
      type,
      fileUrl: fileData?.uri,
      fileName: fileData?.name,
      fileSize: fileData?.size,
      replyTo: replyingTo?.id,
    };

    chatService.sendMessage(message);
    setInputText('');
    setReplyingTo(null);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Cần cấp quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      sendMessage('', 'image', {
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        size: asset.fileSize,
      });
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        sendMessage('', 'file', {
          uri: file.uri,
          name: file.name,
          size: file.size,
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return 'time-outline';
      case 'sent':
        return 'checkmark-outline';
      case 'delivered':
        return 'checkmark-done-outline';
      case 'read':
        return 'checkmark-done';
      default:
        return 'time-outline';
    }
  };

  const getStatusColor = (status: ChatMessage['status']) => {
    switch (status) {
      case 'read':
        return primaryColor;
      case 'delivered':
      case 'sent':
        return '#0066CC';
      default:
        return '#6B7280';
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.senderId === user?.id;
    const replyMessage = item.replyTo ? messages.find(m => m.id === item.replyTo) : null;

    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        {!isOwn && (
          <Image 
            source={{ uri: item.senderAvatar || 'https://via.placeholder.com/32' }}
            style={styles.avatar}
          />
        )}
        
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          {replyMessage && (
            <View style={styles.replyContainer}>
              <View style={[styles.replyBar, { backgroundColor: primaryColor }]} />
              <View style={styles.replyContent}>
                <Text style={[styles.replyAuthor, { color: primaryColor }]}>
                  {replyMessage.senderName}
                </Text>
                <Text style={[styles.replyText, { color: textColor }]} numberOfLines={2}>
                  {replyMessage.content || `${replyMessage.type === 'image' ? '📷' : '📎'} ${replyMessage.fileName || 'File'}`}
                </Text>
              </View>
            </View>
          )}

          {item.type === 'text' && (
            <Text style={[styles.messageText, { color: isOwn ? 'white' : textColor }]}>
              {item.content}
            </Text>
          )}

          {item.type === 'image' && item.fileUrl && (
            <TappableImage 
              source={{ uri: item.fileUrl }} 
              style={styles.imageMessage}
              title={`Ảnh từ ${item.senderName}`}
              description={new Date(item.timestamp).toLocaleString('vi-VN')}
            />
          )}

          {item.type === 'file' && (
            <TouchableOpacity 
              style={styles.fileMessage}
              onPress={() => {
                if (item.fileUrl) {
                  Linking.openURL(item.fileUrl).catch(() => {
                    Alert.alert('Lỗi', 'Không thể mở file');
                  });
                }
              }}
            >
              <Ionicons name="document-outline" size={24} color={isOwn ? 'white' : primaryColor} />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, { color: isOwn ? 'white' : textColor }]}>
                  {item.fileName}
                </Text>
                <Text style={[styles.fileSize, { color: isOwn ? 'rgba(255,255,255,0.7)' : '#6B7280' }]}>
                  {item.fileSize ? formatFileSize(item.fileSize) : 'Unknown size'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, { color: isOwn ? 'rgba(255,255,255,0.7)' : '#6B7280' }]}>
              {new Date(item.timestamp).toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
            {isOwn && (
              <Ionicons 
                name={getStatusIcon(item.status)} 
                size={12} 
                color={getStatusColor(item.status)}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.messageActions}
          onPress={() => setReplyingTo(item)}
        >
          <Ionicons name="arrow-undo-outline" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderInputArea = () => (
    <View style={[styles.inputContainer, { backgroundColor }]}>
      {replyingTo && (
        <View style={styles.replyPreview}>
          <View style={[styles.replyBar, { backgroundColor: primaryColor }]} />
          <View style={styles.replyContent}>
            <Text style={[styles.replyLabel, { color: primaryColor }]}>
              Trả lời {replyingTo.senderName}
            </Text>
            <Text style={[styles.replyText, { color: textColor }]} numberOfLines={1}>
              {replyingTo.content || `${replyingTo.type === 'image' ? '📷' : '📎'} ${replyingTo.fileName || 'File'}`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
          <Ionicons name="attach-outline" size={24} color={primaryColor} />
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, { color: textColor }]}
          placeholder="Nhập tin nhắn..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: primaryColor }]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#E5E7EB' }]}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image 
            source={{ uri: recipientAvatar || 'https://via.placeholder.com/40' }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={[styles.headerName, { color: textColor }]}>{recipientName}</Text>
            <Text style={[styles.headerStatus, { color: '#0066CC' }]}>Đang hoạt động</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons name="videocam-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="call-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      {renderInputArea()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#F1F1F1',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  statusIcon: {
    marginLeft: 4,
  },
  messageActions: {
    padding: 4,
    opacity: 0.7,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    opacity: 0.8,
  },
  replyBar: {
    width: 3,
    borderRadius: 1.5,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 12,
    marginTop: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
