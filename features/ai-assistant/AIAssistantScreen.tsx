/**
 * AI Assistant Feature
 * Chat with Gemini AI for app feature assistance
 */

import { geminiAI, SYSTEM_PROMPTS } from '@/services/geminiAI';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
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
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  prompt: string;
}

// Quick action suggestions
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'feature',
    icon: '🛠️',
    label: 'Hỗ trợ chức năng',
    prompt: 'Tôi muốn thêm chức năng mới vào app. Hãy giúp tôi.',
  },
  {
    id: 'debug',
    icon: '🐛',
    label: 'Sửa lỗi',
    prompt: 'Tôi đang gặp lỗi trong app. Hãy giúp tôi debug.',
  },
  {
    id: 'ui',
    icon: '🎨',
    label: 'Cải thiện UI',
    prompt: 'Tôi muốn cải thiện giao diện của một màn hình.',
  },
  {
    id: 'code',
    icon: '💻',
    label: 'Tạo code',
    prompt: 'Hãy tạo code snippet cho một chức năng cụ thể.',
  },
  {
    id: 'review',
    icon: '📝',
    label: 'Review code',
    prompt: 'Hãy review và đề xuất cải tiến cho đoạn code sau:',
  },
  {
    id: 'progress',
    icon: '📊',
    label: 'Tiến độ dự án',
    prompt: 'Phân tích và đánh giá tiến độ công trình của tôi.',
  },
];

// Message bubble component
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        { opacity: fadeAnim },
      ]}
    >
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.messageContent,
          isUser ? styles.userContent : styles.assistantContent,
        ]}
      >
        {message.isTyping ? (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text style={styles.typingText}>Đang suy nghĩ...</Text>
          </View>
        ) : (
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {message.content}
          </Text>
        )}
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </Animated.View>
  );
};

// Quick action button component
const QuickActionButton: React.FC<{
  action: QuickAction;
  onPress: () => void;
}> = ({ action, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <Text style={styles.quickActionIcon}>{action.icon}</Text>
    <Text style={styles.quickActionLabel}>{action.label}</Text>
  </TouchableOpacity>
);

// Main component
export default function AIAssistantScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Initialize chat session
  useEffect(() => {
    geminiAI.startChat(SYSTEM_PROMPTS.featureAssist);
    
    // Welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! 👋 Tôi là AI Assistant của ứng dụng thiết kế xây dựng.

Tôi có thể giúp bạn:
• Thêm/sửa chức năng app
• Debug và sửa lỗi
• Cải thiện giao diện UI
• Tạo code snippets
• Review và tối ưu code
• Phân tích tiến độ dự án

Hãy hỏi tôi bất cứ điều gì! 💬`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Send message handler
  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    setInputText('');
    setShowQuickActions(false);
    Keyboard.dismiss();

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setIsLoading(true);

    try {
      const response = await geminiAI.sendMessage(messageText);
      
      // Replace typing with actual response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => 
        prev.filter(m => m.id !== 'typing').concat(assistantMessage)
      );
    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date(),
      };

      setMessages(prev => 
        prev.filter(m => m.id !== 'typing').concat(errorMessage)
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading]);

  // Quick action handler
  const handleQuickAction = useCallback((action: QuickAction) => {
    handleSend(action.prompt);
  }, [handleSend]);

  // Clear chat handler
  const handleClear = useCallback(() => {
    geminiAI.clearChat();
    geminiAI.startChat(SYSTEM_PROMPTS.featureAssist);
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: 'Đã xóa lịch sử chat. Tôi sẵn sàng hỗ trợ bạn! 🚀',
      timestamp: new Date(),
    }]);
    setShowQuickActions(true);
  }, []);

  // Scroll to bottom when new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Render message item
  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  ), []);

  // Render quick actions
  const renderQuickActions = () => {
    if (!showQuickActions || messages.length > 2) return null;

    return (
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Gợi ý nhanh</Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <QuickActionButton
              key={action.id}
              action={action}
              onPress={() => handleQuickAction(action)}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🤖 AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Gemini 2.0 Flash</Text>
        </View>
        
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderQuickActions}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.disclaimer}>
            Powered by Google Gemini AI • Thiết kế xây dựng
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    fontSize: 18,
  },
  messageContent: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userContent: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  assistantContent: {
    backgroundColor: '#2a2a4e',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#e0e0e0',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    color: '#8B5CF6',
    fontSize: 14,
  },
  quickActionsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a4e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  quickActionIcon: {
    fontSize: 16,
  },
  quickActionLabel: {
    fontSize: 13,
    color: '#e0e0e0',
  },
  inputContainer: {
    padding: 12,
    backgroundColor: '#16213e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#2a2a4e',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4a4a6e',
  },
  disclaimer: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
