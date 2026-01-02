/**
 * AI Chatbot Screen
 * Construction advisor powered by AI
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { aiService, ChatMessage, ChatSession } from '@/services/aiApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatbotScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = '#EE4D2D';

  useEffect(() => {
    loadOrCreateSession();
  }, []);

  const loadOrCreateSession = async () => {
    try {
      setLoading(true);

      let sessionData: ChatSession;

      if (params.sessionId) {
        sessionData = await aiService.getChatSession(params.sessionId as string);
      } else {
        sessionData = await aiService.createChatSession('New Chat');
      }

      setSession(sessionData);
      setMessages(sessionData.messages || []);
    } catch (error: any) {
      console.error('Failed to load chat session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !session || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSending(true);

    try {
      const response = await aiService.sendChatMessage(
        session.id,
        userMessage.content
      );

      setMessages((prev) => [...prev, response]);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';

    return (
      <Animated.View
        key={message.id}
        entering={FadeInUp.delay(index * 50).springify()}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? primaryColor : cardColor,
              borderColor: isUser ? primaryColor : '#E5E5E5',
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? '#fff' : textColor },
            ]}
          >
            {message.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isUser ? 'rgba(255,255,255,0.7)' : '#999' },
            ]}
          >
            {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {isUser && (
          <View style={[styles.avatar, { backgroundColor: '#007AFF' }]}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
        )}
      </Animated.View>
    );
  };

  const suggestedQuestions = [
    'How to estimate construction costs?',
    'What materials do I need?',
    'Safety tips for construction',
    'Timeline optimization tips',
  ];

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading chat...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            AI Assistant
          </Text>
          <Text style={[styles.headerSubtitle, { color: '#999' }]}>
            Construction Advisor
          </Text>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={24} color={textColor} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <Animated.View
              entering={FadeInDown.springify()}
              style={styles.emptyState}
            >
              <View style={[styles.emptyIcon, { backgroundColor: `${primaryColor}20` }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={primaryColor} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                Welcome to AI Assistant
              </Text>
              <Text style={[styles.emptySubtitle, { color: '#999' }]}>
                Ask me anything about construction, costs, materials, or safety
              </Text>

              <View style={styles.suggestionsContainer}>
                {suggestedQuestions.map((question, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.suggestionChip,
                      { backgroundColor: cardColor, borderColor: '#E5E5E5' },
                    ]}
                    onPress={() => setInputText(question)}
                  >
                    <Text style={[styles.suggestionText, { color: textColor }]}>
                      {question}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}

          {sending && (
            <View style={styles.typingIndicator}>
              <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
              </View>
              <View
                style={[
                  styles.typingBubble,
                  { backgroundColor: cardColor, borderColor: '#E5E5E5' },
                ]}
              >
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, { backgroundColor: primaryColor }]} />
                  <View style={[styles.typingDot, { backgroundColor: primaryColor }]} />
                  <View style={[styles.typingDot, { backgroundColor: primaryColor }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor, borderTopColor: '#E5E5E5' }]}>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: cardColor, borderColor: '#E5E5E5' },
            ]}
          >
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Type your question..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && !sending ? primaryColor : '#E5E5E5',
                },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={inputText.trim() ? '#fff' : '#999'}
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  suggestionsContainer: {
    gap: 12,
    width: '100%',
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
