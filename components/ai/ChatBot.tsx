/**
 * AI ChatBot Component
 * Reusable AI chat interface
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useAuth } from '@/context/AuthContext';
import {
    AIConversation,
    ChatMessage,
    quickChat,
} from '@/services/openaiService';
import { errorNotification, lightImpact, mediumImpact, successNotification } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Chat Message Bubble
interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  userAvatar?: string;
}

const MessageBubble = memo(function MessageBubbleComponent({
  message,
  isUser,
  userAvatar,
}: MessageBubbleProps) {
  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={styles.aiAvatarContainer}>
          <Ionicons name="sparkles" size={20} color="#1877F2" />
        </View>
      )}
      
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.content}
        </Text>
      </View>

      {isUser && userAvatar && (
        <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
      )}
    </View>
  );
});

// Quick Suggestions
interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const QuickSuggestions = memo(function QuickSuggestionsComponent({
  suggestions,
  onSelect,
}: QuickSuggestionsProps) {
  return (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Gợi ý câu hỏi:</Text>
      <View style={styles.suggestionsList}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => onSelect(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

// Main ChatBot Component
interface ChatBotProps {
  systemPrompt?: string;
  placeholder?: string;
  welcomeMessage?: string;
  suggestions?: string[];
}

function ChatBotComponent({
  systemPrompt = 'Bạn là trợ lý AI thông minh của ứng dụng quản lý xây dựng. Hãy trả lời ngắn gọn, chuyên nghiệp bằng tiếng Việt.',
  placeholder = 'Hỏi AI trợ lý...',
  welcomeMessage = 'Xin chào! Tôi là AI trợ lý. Tôi có thể giúp gì cho bạn?',
  suggestions = [
    'Tình trạng dự án hôm nay?',
    'Danh sách công việc cần làm',
    'Phân tích tiến độ thi công',
    'Báo cáo chi phí vật liệu',
  ],
}: ChatBotProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const conversationRef = useRef<AIConversation | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: welcomeMessage },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize conversation
  useEffect(() => {
    conversationRef.current = new AIConversation(systemPrompt);
  }, [systemPrompt]);

  // Scroll to bottom when new message
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Send message
  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text || inputText).trim();
    if (!messageText || isLoading) return;

    lightImpact();
    setInputText('');

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response: string;

      if (conversationRef.current) {
        // Use conversation for context
        response = await conversationRef.current.sendMessage(messageText);
      } else {
        // Fallback to quick chat
        response = await quickChat(messageText, systemPrompt);
      }

      // Add AI response
      const aiMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMessage]);
      successNotification();
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
      };
      setMessages(prev => [...prev, errorMessage]);
      errorNotification();
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, systemPrompt]);

  // Handle suggestion select
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    lightImpact();
    handleSend(suggestion);
  }, [handleSend]);

  // Clear conversation
  const handleClear = useCallback(() => {
    mediumImpact();
    setMessages([{ role: 'assistant', content: welcomeMessage }]);
    conversationRef.current = new AIConversation(systemPrompt);
  }, [welcomeMessage, systemPrompt]);

  // Render message
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        message={item}
        isUser={item.role === 'user'}
        userAvatar={user?.avatar}
      />
    ),
    [user?.avatar]
  );

  // Key extractor
  const keyExtractor = useCallback(
    (_: ChatMessage, index: number) => index.toString(),
    []
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Trợ Lý</Text>
            <Text style={styles.headerSubtitle}>Powered by GPT-4</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Ionicons name="refresh" size={20} color="#65676B" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="#1877F2" />
                <Text style={styles.typingText}>Đang trả lời...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick Suggestions (show only at start) */}
      {messages.length <= 1 && (
        <QuickSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
        />
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#65676B"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={2000}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !isLoading ? '#FFFFFF' : '#BCC0C4'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#050505',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#65676B',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  aiAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#1877F2',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#050505',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  typingText: {
    fontSize: 14,
    color: '#65676B',
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#65676B',
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#E4E6EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  suggestionText: {
    fontSize: 14,
    color: '#050505',
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F0F2F5',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#050505',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E4E6EB',
  },
});

export const ChatBot = memo(ChatBotComponent);
export default ChatBot;
