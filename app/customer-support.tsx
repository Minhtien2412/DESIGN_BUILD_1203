/**
 * Customer Support Chat Screen
 * =============================
 *
 * Màn hình CSKH - Chat trực tiếp với ADMIN DESIGN BUILD
 * User có thể nhắn tin trao đổi, hỏi đáp về dịch vụ
 *
 * @author ThietKeResort Team
 */

import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage, useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
// CONFIG
// ============================================

// ID của ADMIN DESIGN BUILD - phải khớp với backend
const ADMIN_DESIGN_BUILD_ID = 1;

// ============================================
// MESSAGE BUBBLE COMPONENT
// ============================================

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <Ionicons name="time-outline" size={12} color="#999" />;
      case "sent":
        return <Ionicons name="checkmark" size={12} color="#999" />;
      case "delivered":
        return <Ionicons name="checkmark-done" size={12} color="#999" />;
      case "read":
        return (
          <Ionicons name="checkmark-done" size={12} color={COLORS.primary} />
        );
      case "failed":
        return <Ionicons name="alert-circle" size={12} color="red" />;
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.messageBubble,
        isMe ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {!isMe && <Text style={styles.senderName}>{message.senderName}</Text>}
      <Text style={[styles.messageText, isMe && styles.myMessageText]}>
        {message.content}
      </Text>
      <View style={styles.messageFooter}>
        <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
            locale: vi,
          })}
        </Text>
        {isMe && <View style={styles.statusIcon}>{getStatusIcon()}</View>}
      </View>
    </View>
  );
}

// ============================================
// TYPING INDICATOR COMPONENT
// ============================================

function TypingIndicator() {
  return (
    <View style={styles.typingContainer}>
      <Text style={styles.typingText}>ADMIN đang nhập...</Text>
      <View style={styles.typingDots}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function CustomerSupportScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const { createDirectConversation } = useConversations({ autoLoad: false });

  // ============================================
  // CREATE OR GET CONVERSATION WITH ADMIN
  // ============================================

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Chưa đăng nhập",
        "Vui lòng đăng nhập để sử dụng tính năng CSKH",
        [
          { text: "Hủy", onPress: () => router.back() },
          { text: "Đăng nhập", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }

    const initConversation = async () => {
      setIsCreatingConversation(true);
      try {
        const conversation = await createDirectConversation(
          ADMIN_DESIGN_BUILD_ID
        );
        setConversationId(conversation.id);
      } catch (error) {
        console.error("Failed to create conversation with ADMIN:", error);
        Alert.alert("Lỗi", "Không thể kết nối CSKH. Vui lòng thử lại sau.");
      } finally {
        setIsCreatingConversation(false);
      }
    };

    initConversation();
  }, [isAuthenticated]);

  // ============================================
  // CHAT HOOK
  // ============================================

  const {
    messages,
    isConnected,
    isLoading,
    hasMore,
    typingUsers,
    sendMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,
    markAsRead,
    retryMessage,
  } = useChat(conversationId || "", {
    autoConnect: !!conversationId,
    loadInitialMessages: !!conversationId,
  });

  // ============================================
  // MARK AS READ WHEN VIEWING
  // ============================================

  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length]);

  // ============================================
  // SEND MESSAGE
  // ============================================

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !conversationId) return;

    const text = inputText.trim();
    setInputText("");
    stopTyping();

    const ack = await sendMessage(text);

    if (!ack.success) {
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, conversationId, sendMessage, stopTyping]);

  // ============================================
  // TYPING HANDLER
  // ============================================

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (text.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // ============================================
  // RETRY FAILED MESSAGE
  // ============================================

  const handleRetry = (message: ChatMessage) => {
    if (message.status === "failed") {
      retryMessage(message.clientMessageId);
    }
  };

  // ============================================
  // RENDER MESSAGE
  // ============================================

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <TouchableOpacity
      onLongPress={() => {
        if (item.status === "failed") {
          Alert.alert(
            "Gửi lại?",
            "Tin nhắn chưa được gửi. Bạn có muốn thử lại?",
            [
              { text: "Hủy", style: "cancel" },
              { text: "Gửi lại", onPress: () => handleRetry(item) },
            ]
          );
        }
      }}
      activeOpacity={0.8}
    >
      <MessageBubble message={item} isMe={String(item.senderId) === user?.id} />
    </TouchableOpacity>
  );

  // ============================================
  // LOADING STATE
  // ============================================

  if (isCreatingConversation || !conversationId) {
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
          headerRight: () => (
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.connectionDot,
                  { backgroundColor: isConnected ? "#4CAF50" : "#FF9800" },
                ]}
              />
              <Text style={styles.connectionText}>
                {isConnected ? "Online" : "Đang kết nối..."}
              </Text>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Admin Info Banner */}
        <View style={styles.adminBanner}>
          <Image
            source={{
              uri: "https://ui-avatars.com/api/?name=Admin+Design+Build&background=0066CC&color=fff&size=100",
            }}
            style={styles.adminAvatar}
          />
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>ADMIN DESIGN BUILD</Text>
            <Text style={styles.adminDesc}>Hỗ trợ khách hàng 24/7</Text>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id || item.clientMessageId}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            isLoading ? (
              <ActivityIndicator
                style={styles.loadingMore}
                color={COLORS.primary}
              />
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>
                  Chào mừng bạn đến với CSKH!{"\n"}
                  Hãy gửi tin nhắn để được hỗ trợ.
                </Text>
              </View>
            ) : null
          }
          inverted={false}
        />

        {/* Typing Indicator */}
        {typingUsers.length > 0 && <TypingIndicator />}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            multiline
            maxLength={2000}
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
              size={20}
              color={inputText.trim() ? "#fff" : "#999"}
            />
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
    backgroundColor: "#f5f5f5",
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
    fontSize: FONT_SIZE.md,
    color: "#666",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  connectionText: {
    fontSize: FONT_SIZE.xs,
    color: "#666",
  },

  // Admin Banner
  adminBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  adminAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.md,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    color: COLORS.primary,
  },
  adminDesc: {
    fontSize: FONT_SIZE.sm,
    color: "#666",
    marginTop: 2,
  },

  // Messages
  messagesList: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: SPACING.xs,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  senderName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
    color: "#333",
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: FONT_SIZE.xs,
    color: "#999",
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  statusIcon: {
    marginLeft: 4,
  },

  // Typing
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  typingText: {
    fontSize: FONT_SIZE.sm,
    color: "#666",
    fontStyle: "italic",
  },
  typingDots: {
    flexDirection: "row",
    marginLeft: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#999",
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
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
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: "#333",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },

  // Loading
  loadingMore: {
    paddingVertical: SPACING.md,
  },
});
