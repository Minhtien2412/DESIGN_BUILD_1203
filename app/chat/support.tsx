/**
 * Support Chat Screen
 * ===================
 *
 * Màn hình chat với nhân viên hỗ trợ
 * - Danh sách support users luôn online
 * - Quick questions cho conversation starters
 * - Real-time messaging
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import {
    getSupportUserById,
    getSupportUsers,
    QUICK_QUESTIONS,
    SupportUser,
} from "@/data/supportUsers";
import { useThemeColor } from "@/hooks/useThemeColor";

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  content: string;
  senderId: number;
  senderName: string;
  timestamp: Date;
  isFromSupport: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SupportChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ supportUserId?: string }>();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  // State
  const [selectedSupport, setSelectedSupport] = useState<SupportUser | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSupportList, setShowSupportList] = useState(true);

  const supportUsers = getSupportUsers();

  // Initialize from params
  useEffect(() => {
    if (params.supportUserId) {
      const support = getSupportUserById(params.supportUserId);
      if (support) {
        handleSelectSupport(support);
      }
    }
  }, [params.supportUserId]);

  // Select support user
  const handleSelectSupport = useCallback((support: SupportUser) => {
    setSelectedSupport(support);
    setShowSupportList(false);

    // Add welcome message
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      content: support.welcomeMessage,
      senderId: support.numericId,
      senderName: support.name,
      timestamp: new Date(),
      isFromSupport: true,
    };
    setMessages([welcomeMessage]);
  }, []);

  // Send message
  const handleSend = useCallback(() => {
    if (!inputText.trim() || !selectedSupport) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputText.trim(),
      senderId: typeof user?.id === "number" ? user.id : 0,
      senderName: user?.name || "Bạn",
      timestamp: new Date(),
      isFromSupport: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Simulate support response
    setIsLoading(true);
    setTimeout(() => {
      const responses = [
        `Cảm ơn bạn đã liên hệ! Tôi sẽ hỗ trợ bạn ngay.`,
        `Vâng, tôi đã nhận được yêu cầu của bạn. Bạn có thể cho tôi biết thêm chi tiết không?`,
        `Để giải quyết vấn đề này, bạn vui lòng cung cấp thêm thông tin ạ.`,
        `Tôi hiểu rồi. Đội ngũ kỹ thuật sẽ hỗ trợ bạn trong thời gian sớm nhất.`,
      ];

      const responseMessage: Message = {
        id: `response-${Date.now()}`,
        content: responses[Math.floor(Math.random() * responses.length)],
        senderId: selectedSupport.numericId,
        senderName: selectedSupport.name,
        timestamp: new Date(),
        isFromSupport: true,
      };

      setMessages((prev) => [...prev, responseMessage]);
      setIsLoading(false);
    }, 1500);
  }, [inputText, selectedSupport, user]);

  // Handle quick question
  const handleQuickQuestion = useCallback(
    (question: (typeof QUICK_QUESTIONS)[0]) => {
      setInputText(question.text);
    },
    [],
  );

  // Back to support list
  const handleBackToList = useCallback(() => {
    setShowSupportList(true);
    setSelectedSupport(null);
    setMessages([]);
  }, []);

  // ============================================
  // RENDER SUPPORT LIST
  // ============================================

  const renderSupportList = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="headset" size={48} color={Colors.light.primary} />
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Hỗ Trợ Khách Hàng
        </Text>
        <Text style={styles.headerSubtitle}>
          Đội ngũ hỗ trợ luôn sẵn sàng phục vụ bạn 24/7
        </Text>
      </View>

      {/* Support Users */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Chọn nhân viên hỗ trợ
        </Text>

        {supportUsers.map((support) => (
          <TouchableOpacity
            key={support.id}
            style={[styles.supportCard, { backgroundColor }]}
            onPress={() => handleSelectSupport(support)}
            activeOpacity={0.7}
          >
            <View style={styles.supportAvatar}>
              <Image
                source={support.avatar ? { uri: support.avatar } : undefined}
                style={styles.avatarImage}
              />
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.supportInfo}>
              <Text style={[styles.supportName, { color: textColor }]}>
                {support.name}
              </Text>
              <Text style={styles.supportRole}>
                {support.department} • {support.responseTime}
              </Text>
              <Text style={styles.supportStatus} numberOfLines={1}>
                {support.welcomeMessage}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Questions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Câu hỏi thường gặp
        </Text>

        <View style={styles.quickQuestions}>
          {QUICK_QUESTIONS.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={styles.quickQuestionChip}
              onPress={() => {
                if (supportUsers[0]) {
                  handleSelectSupport(supportUsers[0]);
                  setTimeout(() => setInputText(q.text), 100);
                }
              }}
            >
              <Text style={styles.quickQuestionIcon}>💬</Text>
              <Text style={styles.quickQuestionText}>{q.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contact Info */}
      <View style={[styles.contactCard, { backgroundColor }]}>
        <Text style={[styles.contactTitle, { color: textColor }]}>
          Liên hệ khác
        </Text>

        <View style={styles.contactItem}>
          <Ionicons name="call" size={20} color={Colors.light.primary} />
          <Text style={styles.contactText}>Hotline: 1900 xxxx</Text>
        </View>

        <View style={styles.contactItem}>
          <Ionicons name="mail" size={20} color={Colors.light.primary} />
          <Text style={styles.contactText}>Email: support@designbuild.vn</Text>
        </View>

        <View style={styles.contactItem}>
          <Ionicons name="time" size={20} color={Colors.light.primary} />
          <Text style={styles.contactText}>Hỗ trợ 24/7</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ============================================
  // RENDER CHAT
  // ============================================

  const renderChat = () => (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Chat Header */}
      <View style={[styles.chatHeader, { backgroundColor }]}>
        <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        <Image
          source={
            selectedSupport?.avatar
              ? { uri: selectedSupport.avatar }
              : undefined
          }
          style={styles.chatAvatar}
        />

        <View style={styles.chatHeaderInfo}>
          <Text style={[styles.chatHeaderName, { color: textColor }]}>
            {selectedSupport?.name}
          </Text>
          <View style={styles.chatHeaderStatus}>
            <View style={styles.onlineDotSmall} />
            <Text style={styles.chatHeaderStatusText}>Đang hoạt động</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={22} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.isFromSupport
                ? styles.messageBubbleLeft
                : styles.messageBubbleRight,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.isFromSupport
                  ? styles.messageTextLeft
                  : styles.messageTextRight,
              ]}
            >
              {msg.content}
            </Text>
            <Text
              style={[
                styles.messageTime,
                msg.isFromSupport
                  ? styles.messageTimeLeft
                  : styles.messageTimeRight,
              ]}
            >
              {msg.timestamp.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.messageBubbleLeft]}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
            <Text style={styles.typingText}>Đang trả lời...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions (in chat) */}
      {messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickQuestionsInChat}
          contentContainerStyle={styles.quickQuestionsContent}
        >
          {QUICK_QUESTIONS.slice(0, 4).map((q) => (
            <TouchableOpacity
              key={q.id}
              style={styles.quickQuestionChipSmall}
              onPress={() => handleQuickQuestion(q)}
            >
              <Text style={styles.quickQuestionTextSmall}>{q.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor }]}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle" size={28} color={Colors.light.primary} />
        </TouchableOpacity>

        <TextInput
          nativeID="chat-support-input"
          accessibilityLabel="Nhập tin nhắn"
          style={[styles.textInput, { color: textColor }]}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={Colors.light.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={22}
            color={
              inputText.trim()
                ? Colors.light.primary
                : Colors.light.textSecondary
            }
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: showSupportList,
          title: "Hỗ trợ",
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }}
      />

      {showSupportList ? renderSupportList() : renderChat()}
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    alignItems: "center",
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },

  // Section
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  // Support Card
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  supportAvatar: {
    position: "relative",
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.surfaceMuted,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.success,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  supportInfo: {
    flex: 1,
  },
  supportName: {
    fontSize: 15,
    fontWeight: "600",
  },
  supportRole: {
    fontSize: 12,
    color: Colors.light.primary,
    marginTop: 2,
  },
  supportStatus: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },

  // Quick Questions
  quickQuestions: {
    gap: 8,
  },
  quickQuestionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceMuted,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  quickQuestionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  quickQuestionText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },

  // Contact Card
  contactCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  contactText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 10,
  },

  // Chat Container
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceMuted,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: "600",
  },
  chatHeaderStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.success,
    marginRight: 6,
  },
  chatHeaderStatusText: {
    fontSize: 12,
    color: Colors.light.success,
  },
  callButton: {
    padding: 8,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  messageBubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.surfaceMuted,
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: Colors.light.text,
  },
  messageTextRight: {
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageTimeLeft: {
    color: Colors.light.textSecondary,
  },
  messageTimeRight: {
    color: "rgba(255,255,255,0.7)",
  },
  typingText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },

  // Quick Questions in Chat
  quickQuestionsInChat: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  quickQuestionsContent: {
    padding: 8,
    gap: 8,
  },
  quickQuestionChipSmall: {
    backgroundColor: Colors.light.surfaceMuted,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginRight: 8,
  },
  quickQuestionTextSmall: {
    fontSize: 13,
    color: Colors.light.text,
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  attachButton: {
    padding: 4,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.surfaceMuted,
    borderRadius: 20,
    fontSize: 15,
  },
  sendButton: {
    padding: 8,
    marginLeft: 6,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
