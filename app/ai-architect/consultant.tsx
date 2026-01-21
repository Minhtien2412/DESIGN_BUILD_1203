/**
 * AI Architect - AI Consultant Chat
 * Chat với AI Kiến trúc sư
 */

import { Container } from '@/components/ui/container';
import {
    ArchitectMessage,
    CONSULTING_TOPICS,
    geminiArchitectService,
} from '@/services/geminiArchitectService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ConsultantScreen() {
  const [messages, setMessages] = useState<ArchitectMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    geminiArchitectService.initChatSession();
    
    // Welcome message
    setMessages([
      {
        role: 'model',
        text: 'Xin chào! Tôi là AI Kiến trúc sư, chuyên gia về:\n\n• Thiết kế kiến trúc resort, biệt thự\n• Tích hợp Perfex CRM\n• Phát triển module PHP\n• Tích hợp AI Gemini\n\nBạn cần tư vấn gì?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: ArchitectMessage = {
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await geminiArchitectService.sendMessage(messageText);

      const aiMessage: ArchitectMessage = {
        role: 'model',
        text: result.text || result.error || 'Không thể trả lời.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTopicQuestion = (question: string) => {
    handleSend(question);
    setSelectedTopic(null);
  };

  const renderMessage = ({ item }: { item: ArchitectMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.role === 'model' && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.messageContent,
          item.role === 'user' ? styles.userContent : styles.aiContent,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {item.timestamp.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <Container>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🤖 AI Consultant</Text>
            <Text style={styles.headerSubtitle}>Gemini 2.0 Flash</Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setSelectedTopic(selectedTopic ? null : 'topics')}
          >
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Topics Sidebar */}
        {selectedTopic === 'topics' && (
          <View style={styles.topicsPanel}>
            <Text style={styles.topicsPanelTitle}>📚 Chuyên Mục Tư Vấn</Text>
            {CONSULTING_TOPICS.map((topic) => (
              <View key={topic.id} style={styles.topicSection}>
                <View style={styles.topicHeader}>
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                </View>
                {topic.questions.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.questionItem}
                    onPress={() => handleTopicQuestion(q)}
                  >
                    <Text style={styles.questionText}>💬 {q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#03a9f4" />
              <Text style={styles.typingText}>AI đang trả lời...</Text>
            </View>
          </View>
        )}

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <View style={styles.quickQuestions}>
            {['Tạo module CRM cho kiến trúc', 'Tích hợp AI vào dự án', 'Xu hướng thiết kế 2025'].map(
              (q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickQuestion}
                  onPress={() => handleSend(q)}
                >
                  <Text style={styles.quickQuestionText}>{q}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập câu hỏi..."
            placeholderTextColor="#64748b"
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={input.trim() ? '#fff' : '#64748b'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  menuButton: {
    padding: 8,
  },
  topicsPanel: {
    backgroundColor: '#1e293b',
    padding: 16,
    maxHeight: 300,
  },
  topicsPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  topicSection: {
    marginBottom: 12,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  topicIcon: {
    fontSize: 16,
  },
  topicTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  questionItem: {
    paddingVertical: 6,
    paddingLeft: 24,
  },
  questionText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    fontSize: 16,
  },
  messageContent: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userContent: {
    backgroundColor: '#03a9f4',
    borderBottomRightRadius: 4,
  },
  aiContent: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 12,
  },
  typingText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  quickQuestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  quickQuestion: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickQuestionText: {
    color: '#03a9f4',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#03a9f4',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1e293b',
  },
});
