/**
 * AI Consultant Screen
 * Chat với AI để nhận tư vấn thiết kế và giải pháp kỹ thuật
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { ChatMessage, chatWithAI } from '@/services/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AIConsultant() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'tint');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Xin chào! Tôi là AI Consultant. Tôi có thể giúp bạn về:\n\n• Kiến trúc hệ thống và database\n• Tư vấn công nghệ và framework\n• Giải pháp kỹ thuật cho dự án xây dựng\n• Tối ưu hóa hiệu suất\n• Best practices\n\nBạn cần tư vấn về vấn đề gì?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithAI(messages, userMessage.text);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể kết nối với AI',
        [{ text: 'OK' }]
      );
      
      // Remove user message if failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser 
              ? { backgroundColor: primaryColor }
              : { backgroundColor: cardBg },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? '#fff' : textColor },
            ]}
          >
            {message.text}
          </Text>
          
          <Text
            style={[
              styles.timestamp,
              { color: isUser ? 'rgba(255,255,255,0.7)' : textColor, opacity: 0.5 },
            ]}
          >
            {message.timestamp.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const suggestedQuestions = [
    'Tư vấn kiến trúc microservices cho app xây dựng',
    'Best practices cho quản lý dự án construction',
    'Tích hợp BIM vào hệ thống quản lý',
    'Giải pháp real-time tracking tiến độ',
  ];

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'AI Consultant',
          headerStyle: { backgroundColor: cardBg },
          headerTintColor: textColor,
        }}
      />

      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((msg, idx) => renderMessage(msg, idx))}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={[styles.messageBubble, { backgroundColor: cardBg }]}>
                <ActivityIndicator size="small" color={primaryColor} />
                <Text style={[styles.typingText, { color: textColor }]}>
                  AI đang suy nghĩ...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggested Questions */}
        {messages.length === 1 && !isTyping && (
          <ScrollView
            horizontal
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
            showsHorizontalScrollIndicator={false}
          >
            {suggestedQuestions.map((question, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.suggestionChip, { backgroundColor: cardBg }]}
                onPress={() => handleSuggestion(question)}
              >
                <Text style={[styles.suggestionText, { color: textColor }]}>
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Bar */}
        <View style={[styles.inputContainer, { backgroundColor: cardBg }]}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập câu hỏi..."
            placeholderTextColor={textColor + '80'}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: input.trim() && !isTyping ? primaryColor : '#ccc' },
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  typingText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  suggestionsContainer: {
    maxHeight: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  suggestionsContent: {
    padding: 12,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
