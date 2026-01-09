import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  role: 'worker' | 'supplier' | 'support';
  isOnline: boolean;
  lastSeen?: Date;
}

const MOCK_USER: ChatUser = {
  id: 'worker1',
  name: 'Nguyễn Văn Thợ',
  avatar: 'https://i.pravatar.cc/150?img=12',
  role: 'worker',
  isOnline: true,
};

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Xin chào! Tôi đang trên đường đến công trường',
    senderId: 'worker1',
    timestamp: new Date(Date.now() - 300000),
    status: 'seen',
    type: 'text'
  },
  {
    id: '2',
    text: 'Tôi đang ở cổng chính, anh có thể vào không?',
    senderId: 'user1',
    timestamp: new Date(Date.now() - 240000),
    status: 'seen',
    type: 'text'
  },
  {
    id: '3',
    text: 'Vâng, tôi sẽ vào ngay. Còn khoảng 5 phút',
    senderId: 'worker1',
    timestamp: new Date(Date.now() - 180000),
    status: 'seen',
    type: 'text'
  },
  {
    id: '4',
    text: 'Cảm ơn anh!',
    senderId: 'user1',
    timestamp: new Date(Date.now() - 120000),
    status: 'delivered',
    type: 'text'
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnimValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate typing indicator
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
      
      // Animate typing dots
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      setTimeout(() => {
        setIsTyping(false);
        // Add simulated message
        const newMessage: Message = {
          id: Date.now().toString(),
          text: 'Tôi đã đến công trường rồi ạ',
          senderId: 'worker1',
          timestamp: new Date(),
          status: 'sent',
          type: 'text'
        };
        setMessages(prev => [...prev, newMessage]);
      }, 3000);
    }, 2000);

    return () => clearTimeout(typingTimer);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      senderId: 'user1',
      timestamp: new Date(),
      status: 'sending',
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate message sent
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 500);

    // Simulate message delivered
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={14} color="#9CA3AF" />;
      case 'sent':
        return <Ionicons name="checkmark" size={14} color="#9CA3AF" />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={14} color="#9CA3AF" />;
      case 'seen':
        return <Ionicons name="checkmark-done" size={14} color="#0891B2" />;
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === 'user1';
    const showAvatar = !isOwnMessage && (
      index === messages.length - 1 ||
      messages[index + 1]?.senderId !== item.senderId
    );

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Image source={{ uri: MOCK_USER.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
            {isOwnMessage && (
              <View style={styles.statusIcon}>{getStatusIcon(item.status)}</View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <Image source={{ uri: MOCK_USER.avatar }} style={styles.typingAvatar} />
        <View style={styles.typingBubble}>
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1]
                })
              }
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3]
                })
              }
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3]
                })
              }
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.headerAvatarContainer}>
            <Image source={{ uri: MOCK_USER.avatar }} style={styles.headerAvatar} />
            {MOCK_USER.isOnline && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{MOCK_USER.name}</Text>
            <Text style={styles.headerStatus}>
              {MOCK_USER.isOnline ? 'Đang hoạt động' : 'Offline'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
          <Ionicons name="call" size={22} color="#0891B2" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={28} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? '#fff' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Replies */}
      <View style={styles.quickReplies}>
        {['👍', '👌', '🙏', 'Cảm ơn', 'OK'].map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickReplyButton}
            onPress={() => setInputText(reply)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066CC',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 13,
    color: '#6B7280',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: '#0891B2',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  statusIcon: {
    marginLeft: 2,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  attachButton: {
    marginBottom: 8,
  },
  inputWrapper: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  quickReplies: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickReplyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  quickReplyText: {
    fontSize: 14,
    color: '#1F2937',
  },
});
