/**
 * AI Support Chat Component
 * Chat hỗ trợ thông minh với Gemini AI cho dịch vụ bảo trì nhà
 * 
 * @author AI Assistant
 * @date 05/01/2026
 */

import geminiService, { GeminiMessage } from '@/services/api/geminiService';
import { lightImpact, mediumImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ==================== TYPES ====================

interface SupportChatProps {
  onClose: () => void;
  isVisible?: boolean;
}

// ==================== MESSAGE BUBBLE ====================

interface MessageBubbleProps {
  message: GeminiMessage;
}

const MessageBubble = memo(function MessageBubbleComponent({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={styles.aiAvatarContainer}>
          <Ionicons name="sparkles" size={16} color="#1877F2" />
        </View>
      )}
      
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.text}
        </Text>
        {message.timestamp && (
          <Text style={styles.messageTime}>
            {new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        )}
      </View>
    </View>
  );
});

// ==================== QUICK SUGGESTIONS ====================

interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const QuickSuggestions = memo(function QuickSuggestionsComponent({
  suggestions,
  onSelect
}: QuickSuggestionsProps) {
  return (
    <View style={styles.suggestionsContainer}>
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={styles.suggestionChip}
          onPress={() => {
            lightImpact();
            onSelect(suggestion);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// ==================== MAIN COMPONENT ====================

const SupportChat = memo(function SupportChatComponent({ onClose }: SupportChatProps) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // State
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize chat with greeting
  const initializeChat = useCallback(async () => {
    if (isInitialized) return;
    
    const greeting = geminiService.getGreeting();
    setMessages([{
      role: 'model',
      text: greeting.text,
      timestamp: new Date().toISOString()
    }]);
    setSuggestions(greeting.suggestions || []);
    setIsInitialized(true);
    
    // Animate in
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
  }, [isInitialized, slideAnim]);
  
  // Initialize on mount
  useState(() => {
    initializeChat();
  });
  
  // Send message
  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;
    
    mediumImpact();
    setInputText('');
    Keyboard.dismiss();
    setSuggestions([]);
    
    // Add user message
    const userMessage: GeminiMessage = {
      role: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      // Get AI response
      const response = await geminiService.sendMessage(messageText, messages);
      
      // Add AI response
      const aiMessage: GeminiMessage = {
        role: 'model',
        text: response.text,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(response.suggestions || []);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('[SupportChat] Error:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages]);
  
  // Handle close
  const handleClose = useCallback(() => {
    mediumImpact();
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onClose();
    });
  }, [onClose, slideAnim]);
  
  // Render message
  const renderMessage = useCallback(({ item }: { item: GeminiMessage }) => (
    <MessageBubble message={item} />
  ), []);
  
  const keyExtractor = useCallback((item: GeminiMessage, index: number) => 
    `${item.role}-${index}-${item.timestamp}`, []);
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          paddingBottom: insets.bottom,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [600, 0]
            })
          }]
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={20} color="#1877F2" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Hỗ Trợ AI</Text>
            <Text style={styles.headerSubtitle}>Dịch vụ bảo trì nhà</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#1877F2" />
              <Text style={styles.loadingText}>Đang trả lời...</Text>
            </View>
          </View>
        )}
        
        {/* Suggestions */}
        {suggestions.length > 0 && !isLoading && (
          <QuickSuggestions 
            suggestions={suggestions} 
            onSelect={(s) => handleSend(s)}
          />
        )}
        
        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() && !isLoading ? '#fff' : '#9ca3af'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
});

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e7f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e7f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#1877F2',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1877F2',
  },
  suggestionText: {
    fontSize: 13,
    color: '#1877F2',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});

export default SupportChat;
