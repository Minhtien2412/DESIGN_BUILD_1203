/**
 * AI Customer Support Chat Screen
 * ================================
 *
 * Màn hình CSKH AI - Chat với AI thay mặt app
 * - Sử dụng OpenAI API để trả lời câu hỏi
 * - Lưu lịch sử chat vào database
 * - Hiển thị logo app cho CSKH
 *
 * @author ThietKeResort Team
 * @created 2026-01-27
 */

import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
    addMessageToConversation,
    CSKH_INFO,
    CSKHMessage,
    generateId,
    getOrCreateConversation,
    sendCSKHMessage,
} from "@/services/aiCustomerSupport";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// MESSAGE BUBBLE COMPONENT
// ============================================

interface MessageBubbleProps {
  message: CSKHMessage;
  isUser: boolean;
}

function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 20 : -20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <ActivityIndicator size={10} color="rgba(255,255,255,0.7)" />;
      case "sent":
        return (
          <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.7)" />
        );
      case "failed":
        return <Ionicons name="alert-circle" size={12} color="#FF6B6B" />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? styles.userMessageRow : styles.assistantMessageRow,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {!isUser && (
        <Image
          source={{ uri: CSKH_INFO.avatar }}
          style={styles.assistantAvatar}
        />
      )}
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && <Text style={styles.assistantName}>{CSKH_INFO.name}</Text>}
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </Text>
          {isUser && message.status && (
            <View style={styles.statusIcon}>{getStatusIcon()}</View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================
// TYPING INDICATOR
// ============================================

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dot1, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot1, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <View style={styles.typingRow}>
      <Image
        source={{ uri: CSKH_INFO.avatar }}
        style={styles.assistantAvatar}
      />
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>
    </View>
  );
}

// ============================================
// QUICK REPLIES
// ============================================

const QUICK_REPLIES = [
  "Tôi muốn hỏi về sản phẩm",
  "Kiểm tra đơn hàng",
  "Hướng dẫn đặt hàng",
  "Chính sách đổi trả",
  "Liên hệ hotline",
];

interface QuickRepliesProps {
  onSelect: (text: string) => void;
  visible: boolean;
}

function QuickReplies({ onSelect, visible }: QuickRepliesProps) {
  if (!visible) return null;

  return (
    <View style={styles.quickRepliesContainer}>
      <Text style={styles.quickRepliesTitle}>Gợi ý câu hỏi:</Text>
      <View style={styles.quickRepliesWrap}>
        {QUICK_REPLIES.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickReplyChip}
            onPress={() => onSelect(reply)}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function AICustomerSupportScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  // State
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CSKHMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  // ============================================
  // INITIALIZE CONVERSATION
  // ============================================

  useEffect(() => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        "Chưa đăng nhập",
        "Vui lòng đăng nhập để sử dụng tính năng CSKH",
        [
          { text: "Hủy", onPress: () => router.back() },
          { text: "Đăng nhập", onPress: () => router.push("/(auth)/login") },
        ],
      );
      return;
    }

    const initConversation = async () => {
      setIsLoading(true);
      try {
        const conversation = await getOrCreateConversation(user.id);
        setConversationId(conversation.id);
        setMessages(conversation.messages);

        // Hide quick replies if already has messages from user
        const hasUserMessage = conversation.messages.some(
          (m) => m.role === "user",
        );
        setShowQuickReplies(!hasUserMessage);
      } catch (error) {
        console.error("[CSKH] Failed to init conversation:", error);
        Alert.alert(
          "Lỗi",
          "Không thể khởi tạo cuộc trò chuyện. Vui lòng thử lại.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [isAuthenticated, user]);

  // ============================================
  // SCROLL TO BOTTOM
  // ============================================

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // ============================================
  // SEND MESSAGE
  // ============================================

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = text || inputText.trim();
      if (!messageText || !conversationId || !user) return;

      setInputText("");
      setShowQuickReplies(false);

      // Create user message
      const userMessage: CSKHMessage = {
        id: generateId(),
        role: "user",
        content: messageText,
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      // Add to local state
      setMessages((prev) => [...prev, userMessage]);

      // Save to local storage
      await addMessageToConversation(user.id, conversationId, userMessage);

      // Show typing indicator
      setIsTyping(true);

      try {
        // Send to AI and get response
        const response = await sendCSKHMessage(
          user.id,
          conversationId,
          messageText,
          messages.filter((m) => m.role !== "system"),
        );

        // Update user message status
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMessage.id
              ? { ...m, status: response.success ? "sent" : "failed" }
              : m,
          ),
        );

        if (response.success && response.data?.reply) {
          // Create assistant message
          const assistantMessage: CSKHMessage = {
            id: response.data.messageId || generateId(),
            role: "assistant",
            content: response.data.reply,
            createdAt: new Date().toISOString(),
            status: "sent",
          };

          // Add assistant message
          setMessages((prev) => [...prev, assistantMessage]);
          await addMessageToConversation(
            user.id,
            conversationId,
            assistantMessage,
          );
        } else if (!response.success) {
          // Show error but with fallback response
          const fallbackMessage: CSKHMessage = {
            id: generateId(),
            role: "assistant",
            content:
              "Xin lỗi, hiện tại tôi không thể kết nối được. Vui lòng thử lại sau hoặc liên hệ hotline 1900-xxxx để được hỗ trợ trực tiếp.",
            createdAt: new Date().toISOString(),
            status: "sent",
          };
          setMessages((prev) => [...prev, fallbackMessage]);
        }
      } catch (error) {
        console.error("[CSKH] Send error:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMessage.id ? { ...m, status: "failed" } : m,
          ),
        );
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, conversationId, user, messages],
  );

  // ============================================
  // RETRY FAILED MESSAGE
  // ============================================

  const handleRetry = (message: CSKHMessage) => {
    if (message.status === "failed") {
      // Remove failed message and resend
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      handleSend(message.content);
    }
  };

  // ============================================
  // RENDER MESSAGE
  // ============================================

  const renderMessage = ({ item }: { item: CSKHMessage }) => (
    <TouchableOpacity
      onLongPress={() => {
        if (item.status === "failed") {
          Alert.alert(
            "Gửi lại tin nhắn?",
            "Tin nhắn chưa được gửi. Bạn có muốn thử lại?",
            [
              { text: "Hủy", style: "cancel" },
              { text: "Gửi lại", onPress: () => handleRetry(item) },
            ],
          );
        }
      }}
      activeOpacity={0.9}
    >
      <MessageBubble message={item} isUser={item.role === "user"} />
    </TouchableOpacity>
  );

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "CSKH - Hỗ trợ khách hàng",
            headerBackTitle: "Quay lại",
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang kết nối CSKH...</Text>
          <Text style={styles.loadingSubtext}>Vui lòng đợi trong giây lát</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "CSKH - Hỗ trợ khách hàng",
          headerBackTitle: "Quay lại",
          headerStyle: { backgroundColor: "#10B981" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* CSKH Info Banner */}
        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={styles.cskhBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={{ uri: CSKH_INFO.avatar }} style={styles.cskhAvatar} />
          <View style={styles.cskhInfo}>
            <Text style={styles.cskhName}>{CSKH_INFO.name}</Text>
            <View style={styles.cskhStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.cskhStatus}>Trực tuyến 24/7</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                Chào mừng bạn đến với CSKH!{"\n"}
                Hãy gửi tin nhắn để được hỗ trợ.
              </Text>
            </View>
          }
        />

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        {/* Quick Replies */}
        <QuickReplies
          visible={showQuickReplies && messages.length <= 1}
          onSelect={handleSend}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            multiline
            maxLength={2000}
            onFocus={() => setShowQuickReplies(false)}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
          >
            {isTyping ? (
              <ActivityIndicator size={18} color="#fff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? "#fff" : "#999"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    color: "#333",
  },
  loadingSubtext: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: "#666",
  },

  // CSKH Banner
  cskhBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  cskhAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  cskhInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cskhName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: "#fff",
  },
  cskhStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },
  cskhStatus: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.9)",
  },
  infoButton: {
    padding: SPACING.sm,
  },

  // Messages
  messagesList: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: SPACING.xs,
    alignItems: "flex-end",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  assistantMessageRow: {
    justifyContent: "flex-start",
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  userMessage: {
    backgroundColor: "#10B981",
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  assistantName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 4,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
    color: "#333",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  messageTime: {
    fontSize: FONT_SIZE.xs,
    color: "#999",
  },
  userMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  statusIcon: {
    marginLeft: 4,
  },

  // Typing
  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  typingBubble: {
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 4,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginHorizontal: 3,
  },

  // Quick Replies
  quickRepliesContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  quickRepliesTitle: {
    fontSize: FONT_SIZE.xs,
    color: "#666",
    marginBottom: SPACING.sm,
  },
  quickRepliesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  quickReplyChip: {
    backgroundColor: "#F0FDF4",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  quickReplyText: {
    fontSize: FONT_SIZE.sm,
    color: "#10B981",
    fontWeight: "500",
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: SPACING.md,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "#F5F7FA",
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: "#333",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
});
