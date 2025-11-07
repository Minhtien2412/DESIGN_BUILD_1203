import Avatar from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  senderName?: string;
  time: string;
  avatar?: string;
};

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Xin chào, bạn đã xem bản vẽ chưa?',
    sender: 'other',
    senderName: 'Nguyễn Văn A',
    time: '09:00',
    avatar: 'https://via.placeholder.com/40',
  },
  {
    id: '2',
    text: 'Mình đã xem rồi, rất chi tiết. Có một vài chỗ cần chỉnh sửa nhỏ.',
    sender: 'me',
    time: '09:05',
  },
  {
    id: '3',
    text: 'Được, bạn có thể liệt kê ra không? Mình sẽ chỉnh sửa ngay.',
    sender: 'other',
    senderName: 'Nguyễn Văn A',
    time: '09:06',
    avatar: 'https://via.placeholder.com/40',
  },
  {
    id: '4',
    text: '1. Phòng khách: cần tăng diện tích lên 5m²\n2. Bếp: thêm cửa sổ thông gió\n3. Phòng ngủ master: điều chỉnh vị trí tủ quần áo',
    sender: 'me',
    time: '09:10',
  },
  {
    id: '5',
    text: 'OK, mình sẽ chỉnh sửa và gửi lại cho bạn chiều nay.',
    sender: 'other',
    senderName: 'Nguyễn Văn A',
    time: '09:12',
    avatar: 'https://via.placeholder.com/40',
  },
  {
    id: '6',
    text: 'Cảm ơn bạn!',
    sender: 'me',
    time: '09:13',
  },
];

const MessageBubble = ({ message }: { message: Message }) => {
  const isMe = message.sender === 'me';

  return (
    <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
      {!isMe && (
        <Avatar
          avatar={message.avatar ?? null}
          name={message.senderName}
          pixelSize={32}
        />
      )}
      
      <View style={styles.messageContent}>
        {!isMe && message.senderName && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        
        <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {message.text}
          </Text>
        </View>
        
        <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
};

export default function ChatDetailScreen() {
  const params = useLocalSearchParams();
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>(MOCK_MESSAGES);
  const flatListRef = React.useRef<FlatList>(null);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Auto scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nguyễn Văn A',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="call-outline" size={24} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="videocam-outline" size={24} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <MessageBubble message={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <Input
              value={message}
              onChangeText={setMessage}
              placeholder="Nhập tin nhắn..."
              multiline
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, message.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  headerButton: {
    marginLeft: 16,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#E5E7EB',
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
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
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 12,
  },
  myMessageTime: {
    textAlign: 'right',
    marginRight: 12,
    marginLeft: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  inputWrapper: {
    flex: 1,
    maxHeight: 100,
  },
  input: {
    marginBottom: 0,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 8,
  },
  sendButtonActive: {
    backgroundColor: '#3B82F6',
  },
});
