/**
 * ChatRoomContainer Component
 * ============================
 *
 * Container component kết nối ChatRoom với:
 * - useConversation hook (API calls)
 * - WebSocket realtime events
 * - MessageList component
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { MessageList } from "@/components/chat/MessageList";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useConversation } from "@/hooks/useConversation";
import {
    canDeleteMessage,
    canEditMessage,
    getConversationAvatar,
    getConversationDisplayName,
    Message,
} from "@/services/api/conversations.service";
import {
    conversationsSocket,
    NewMessageEvent,
    TypingEvent,
} from "@/services/conversations-socket.service";

// ============================================================================
// Types
// ============================================================================

export interface ChatRoomContainerProps {
  conversationId: string;
  onBack?: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function ChatRoomContainer({
  conversationId,
  onBack,
}: ChatRoomContainerProps) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const secondaryBg = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "surfaceMuted");

  // Use conversation hook
  const {
    conversation,
    messages,
    isLoading,
    isLoadingMore,
    isSending,
    error,
    hasMoreBefore,
    typingUsers,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    markAsRead,
    refresh,
    handlers,
  } = useConversation(conversationId, {
    limit: 50,
    autoMarkRead: true,
    onError: (err) => {
      Alert.alert("Lỗi", err);
    },
  });

  // ============================================
  // WebSocket connection
  // ============================================

  useEffect(() => {
    // Connect to conversations socket
    conversationsSocket
      .connect()
      .then(() => {
        conversationsSocket.joinConversation(conversationId);
      })
      .catch(console.error);

    // Subscribe to message events
    const unsubNewMessage = conversationsSocket.on(
      "message.new",
      (data: NewMessageEvent) => {
        if (data.conversationId === conversationId) {
          handlers.onNewMessage(data.message as unknown as Message);
        }
      },
    );

    const unsubUpdated = conversationsSocket.on(
      "message.updated",
      (data: any) => {
        if (data.conversationId === conversationId) {
          handlers.onMessageUpdated(data.message as Message);
        }
      },
    );

    const unsubTyping = conversationsSocket.on(
      "typing",
      (data: TypingEvent) => {
        if (data.conversationId === conversationId) {
          if (data.isTyping) {
            handlers.onTypingStart(data.userId);
          } else {
            handlers.onTypingStop(data.userId);
          }
        }
      },
    );

    return () => {
      // Cleanup
      unsubNewMessage();
      unsubUpdated();
      unsubTyping();
      conversationsSocket.leaveConversation(conversationId);
    };
  }, [conversationId, handlers]);

  // ============================================
  // Message actions
  // ============================================

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() && !replyingTo) return;

    const content = inputText.trim();
    setInputText("");
    setReplyingTo(null);

    await sendMessage(content, "TEXT", {
      replyToMessageId: replyingTo?.id,
    });
  }, [inputText, replyingTo, sendMessage]);

  const handleSendImage = useCallback(
    async (uri: string) => {
      // TODO: Upload image first, then send message with attachment
      // For now, just send as text with image URL
      await sendMessage(uri, "IMAGE");
    },
    [sendMessage],
  );

  const handlePickImage = useCallback(async () => {
    setShowAttachMenu(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Cần cấp quyền", "Vui lòng cấp quyền truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      await handleSendImage(result.assets[0].uri);
    }
  }, [handleSendImage]);

  const handleMessagePress = useCallback((message: Message) => {
    // Could show message details or reactions
    console.log("Message pressed:", message.id);
  }, []);

  const handleMessageLongPress = useCallback(
    (message: Message) => {
      const options = [
        { text: "Trả lời", onPress: () => setReplyingTo(message) },
        { text: "Thả tim ❤️", onPress: () => addReaction(message.id, "❤️") },
      ];

      // Can edit/delete own messages
      const canEdit = canEditMessage(message, user?.id ? Number(user.id) : 0);
      const isDeleteAllowed = canDeleteMessage(
        message,
        user?.id ? Number(user.id) : 0,
        false,
      );

      if (canEdit) {
        options.push({
          text: "Chỉnh sửa",
          onPress: () => {
            Alert.prompt(
              "Sửa tin nhắn",
              "",
              [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Lưu",
                  onPress: (newContent?: string) => {
                    if (newContent?.trim()) {
                      editMessage(message.id, newContent.trim());
                    }
                  },
                },
              ],
              "plain-text",
              message.content,
            );
          },
        });
      }

      if (isDeleteAllowed) {
        options.push({
          text: "Xóa",
          onPress: () => {
            Alert.alert("Xóa tin nhắn", "Bạn có chắc muốn xóa tin nhắn này?", [
              { text: "Hủy", style: "cancel" },
              {
                text: "Xóa",
                style: "destructive",
                onPress: () => deleteMessage(message.id),
              },
            ]);
          },
        });
      }

      options.push({ text: "Đóng", onPress: () => {} });

      Alert.alert(
        "Tùy chọn tin nhắn",
        "",
        options.map((o) => ({ text: o.text, onPress: o.onPress })),
      );
    },
    [user?.id, addReaction, editMessage, deleteMessage],
  );

  // ============================================
  // Get display info
  // ============================================

  const displayName = conversation
    ? getConversationDisplayName(conversation, user?.id ? Number(user.id) : 0)
    : "Đang tải...";

  const avatarUrl = conversation
    ? getConversationAvatar(conversation, user?.id ? Number(user.id) : 0)
    : undefined;

  // Check if group
  const isGroupChat = conversation?.type === "GROUP";

  // Get typing user names (placeholder - would need participant info)
  const typingUsersList = typingUsers.map((userId) => ({
    id: userId,
    name: `User ${userId}`,
  }));

  // ============================================
  // Render
  // ============================================

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor, borderBottomColor: borderColor },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        <Image
          source={{
            uri:
              avatarUrl ||
              "https://ui-avatars.com/api/?name=Chat&size=40&background=FF6B35&color=fff",
          }}
          style={styles.avatar}
        />

        <View style={styles.headerInfo}>
          <Text
            style={[styles.headerTitle, { color: textColor }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {isGroupChat && (
            <Text style={[styles.headerSubtitle, { color: "#6B7280" }]}>
              {conversation?.participants.length} thành viên
            </Text>
          )}
          {typingUsers.length > 0 && (
            <Text style={[styles.headerSubtitle, { color: primaryColor }]}>
              Đang nhập...
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={22} color={primaryColor} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="videocam-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Error banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: "#FEE2E2" }]}>
          <Text style={{ color: "#DC2626" }}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ color: primaryColor, fontWeight: "600" }}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message List */}
      <MessageList
        messages={messages}
        currentUserId={user?.id ? Number(user.id) : 0}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMoreBefore={hasMoreBefore}
        typingUsers={typingUsersList}
        onLoadMore={() => loadMore("before")}
        onRefresh={refresh}
        onMessagePress={handleMessagePress}
        onMessageLongPress={handleMessageLongPress}
      />

      {/* Reply preview */}
      {replyingTo && (
        <View style={[styles.replyPreview, { backgroundColor: secondaryBg }]}>
          <View style={[styles.replyBar, { backgroundColor: primaryColor }]} />
          <View style={styles.replyContent}>
            <Text style={[styles.replyLabel, { color: primaryColor }]}>
              Trả lời{" "}
              {replyingTo.senderId === Number(user?.id)
                ? "bạn"
                : `User ${replyingTo.senderId}`}
            </Text>
            <Text
              style={[styles.replyText, { color: textColor }]}
              numberOfLines={1}
            >
              {replyingTo.content || "[File]"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor, borderTopColor: borderColor },
        ]}
      >
        <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={24} color={primaryColor} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: secondaryBg, color: textColor },
          ]}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={2000}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() ? primaryColor : "#E5E7EB" },
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? "#fff" : "#9CA3AF"}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerAction: {
    padding: 8,
    marginLeft: 4,
  },

  // Error
  errorBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Reply preview
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyBar: {
    width: 3,
    height: "100%",
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  replyText: {
    fontSize: 13,
    marginTop: 2,
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginHorizontal: 8,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatRoomContainer;
