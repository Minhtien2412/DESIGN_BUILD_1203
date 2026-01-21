/**
 * Enhanced Chat Screen - Zalo Style with Real API Data
 * Uses useChat hook + chatAPIService for real backend data
 */

import { MessageBubbleEnhanced, TypingIndicator } from "@/components/chat";
import { TappableImage } from "@/components/ui/full-media-viewer";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/use-chat";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Attachment, ChatMessage } from "@/services/ChatService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ==================== TYPES ====================

// ==================== COMPONENT ====================

export default function EnhancedChatScreen() {
  const { chatId, chatName } = useLocalSearchParams<{
    chatId: string;
    chatName?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  // Theme colors
  const primary = useThemeColor({}, "primary");
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const border = useThemeColor({}, "border");

  // Chat hook with real API data
  const {
    isConnected,
    isLoading,
    messages,
    typingUsers,
    error,
    sendMessage,
    addReaction,
    removeReaction,
    markAsRead,
    setTyping,
    loadMoreMessages,
  } = useChat({ chatId, autoConnect: true });

  // Local state
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showActions, setShowActions] = useState(false);

  // Current user ID
  const currentUserId = user?.id?.toString() || "";

  // ==================== EFFECTS ====================

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      const unreadIds = messages
        .filter((m) => m.senderId !== currentUserId && m.status !== "read")
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [messages, currentUserId, markAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // ==================== HANDLERS ====================

  const handleSend = async () => {
    if ((!inputText.trim() && attachments.length === 0) || isSending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSending(true);
    setTyping(false);

    try {
      const success = await sendMessage(inputText.trim(), {
        attachments: attachments.length > 0 ? attachments : undefined,
        replyTo: replyingTo || undefined,
      });

      if (success) {
        setInputText("");
        setAttachments([]);
        setReplyingTo(null);
        Keyboard.dismiss();
      } else {
        Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("[Chat] Send error:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi tin nhắn.");
    } finally {
      setIsSending(false);
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    setTyping(text.length > 0);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = messages.find((m) => m.id === messageId);
    const hasReacted = message?.reactions?.some(
      (r) => r.userId === currentUserId && r.emoji === emoji
    );

    if (hasReacted) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  };

  const handleReply = (message: ChatMessage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReplyingTo(message);
  };

  const handleForward = (message: ChatMessage) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Implement forward functionality
    Alert.alert(
      "Chuyển tiếp",
      `Chuyển tiếp tin nhắn: "${message.content.substring(0, 50)}..."`
    );
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newAttachments: Attachment[] = result.assets.map((asset) => ({
          type: asset.type === "video" ? "video" : "image",
          url: asset.uri,
          name: asset.fileName || `file_${Date.now()}`,
          size: asset.fileSize,
        }));
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch (err) {
      console.error("[Chat] Image pick error:", err);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const handleLoadMore = () => {
    if (!isLoading) {
      loadMoreMessages();
    }
  };

  // ==================== RENDER HELPERS ====================

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const isOwn = item.senderId === currentUserId;
      const showAvatar =
        !isOwn &&
        (index === 0 || messages[index - 1]?.senderId !== item.senderId);

      // Convert ChatMessage to MessageBubbleEnhanced props
      return (
        <MessageBubbleEnhanced
          id={item.id}
          text={item.content}
          mine={isOwn}
          timestamp={item.timestamp}
          status={item.status}
          senderName={item.senderName}
          senderAvatar={item.senderAvatar}
          senderId={item.senderId}
          attachments={item.attachments?.map((att) => ({
            id: att.url || String(Math.random()),
            type: att.type as "image" | "video" | "file" | "audio" | "location",
            url: att.url || "",
            name: att.name,
            size: att.size,
          }))}
          replyTo={
            item.replyTo
              ? {
                  id: item.replyTo.id,
                  text: item.replyTo.content,
                  senderName: item.replyTo.senderName,
                }
              : undefined
          }
          reactions={item.reactions?.map((r) => ({
            emoji: r.emoji,
            count: 1,
            users: [r.userId],
            reacted: r.userId === currentUserId,
          }))}
          showSender={showAvatar}
          onReact={(msgId: string, emoji: string) =>
            handleReaction(msgId, emoji)
          }
          onReply={(msgId: string) => {
            const msg = messages.find((m) => m.id === msgId);
            if (msg) handleReply(msg);
          }}
          onForward={(msgId: string) => {
            const msg = messages.find((m) => m.id === msgId);
            if (msg) handleForward(msg);
          }}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }}
          onSenderPress={(senderId: string) => {
            router.push(`/profile/${senderId}`);
          }}
        />
      );
    },
    [currentUserId, messages, handleReaction]
  );

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        { backgroundColor: primary, paddingTop: insets.top },
      ]}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </Pressable>

      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {chatName || "Chat"}
        </Text>
        <View style={styles.headerStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? "#4CAF50" : "#ff9800" },
            ]}
          />
          <Text style={styles.headerSubtitle}>
            {isConnected ? "Đang kết nối" : "Đang kết nối lại..."}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.headerAction}
        onPress={() => setShowActions(true)}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
      </Pressable>
    </View>
  );

  const renderReplyPreview = () => {
    if (!replyingTo) return null;

    return (
      <View
        style={[
          styles.replyPreview,
          { backgroundColor: surface, borderColor: border },
        ]}
      >
        <View style={styles.replyContent}>
          <Text style={[styles.replyName, { color: primary }]}>
            {replyingTo.senderName}
          </Text>
          <Text
            style={[styles.replyText, { color: textMuted }]}
            numberOfLines={1}
          >
            {replyingTo.content}
          </Text>
        </View>
        <Pressable onPress={() => setReplyingTo(null)} hitSlop={8}>
          <Ionicons name="close" size={20} color={textMuted} />
        </Pressable>
      </View>
    );
  };

  const renderAttachmentPreview = () => {
    if (attachments.length === 0) return null;

    return (
      <View style={[styles.attachmentPreview, { backgroundColor: surface }]}>
        {attachments.map((att, index) => (
          <View key={index} style={styles.attachmentItem}>
            {att.type === "image" && att.url && (
              <TappableImage
                source={{ uri: att.url }}
                style={styles.attachmentThumb}
                title={`Ảnh đính kèm ${index + 1}`}
                allowDelete
                onDelete={() =>
                  setAttachments((prev) => prev.filter((_, i) => i !== index))
                }
              />
            )}
            {att.type === "video" && (
              <View style={[styles.attachmentThumb, styles.videoThumb]}>
                <Ionicons name="videocam" size={20} color="#fff" />
              </View>
            )}
            <Pressable
              style={styles.removeAttachment}
              onPress={() => {
                setAttachments((prev) => prev.filter((_, i) => i !== index));
              }}
            >
              <Ionicons name="close-circle" size={20} color="#ff4444" />
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    const typingArray = Array.from(typingUsers.values());
    if (typingArray.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <TypingIndicator
          users={typingArray.map((t) => t.userName || "Someone")}
        />
      </View>
    );
  };

  const renderInputBar = () => (
    <View
      style={[
        styles.inputContainer,
        { backgroundColor: background, borderColor: border },
      ]}
    >
      {renderReplyPreview()}
      {renderAttachmentPreview()}

      <View style={styles.inputRow}>
        <Pressable style={styles.inputAction} onPress={handleImagePick}>
          <Ionicons name="image-outline" size={24} color={primary} />
        </Pressable>

        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: surface, borderColor: border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={textMuted}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={2000}
          />
        </View>

        <Pressable
          style={[styles.sendButton, { backgroundColor: primary }]}
          onPress={handleSend}
          disabled={
            isSending || (!inputText.trim() && attachments.length === 0)
          }
        >
          {isSending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </Pressable>
      </View>
    </View>
  );

  // ==================== MAIN RENDER ====================

  if (!chatId) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: text }}>Không tìm thấy chat</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {renderHeader()}

      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Loader size="large" />
          <Text style={[styles.loadingText, { color: textMuted }]}>
            Đang tải tin nhắn...
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          inverted={false}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            isLoading ? (
              <ActivityIndicator style={styles.loadingMore} color={primary} />
            ) : null
          }
          ListFooterComponent={renderTypingIndicator}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={textMuted}
              />
              <Text style={[styles.emptyText, { color: textMuted }]}>
                Chưa có tin nhắn nào.{"\n"}Hãy bắt đầu cuộc trò chuyện!
              </Text>
            </View>
          }
        />
      )}

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: "#ffebee" }]}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => {
              // Retry loading messages
              loadMoreMessages();
            }}
          >
            <Text style={[styles.errorRetry, { color: primary }]}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      <View style={{ paddingBottom: insets.bottom }}>{renderInputBar()}</View>
    </KeyboardAvoidingView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  headerAction: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  loadingMore: {
    paddingVertical: 16,
  },
  messageList: {
    padding: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    gap: 8,
  },
  inputAction: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  replyContent: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
    paddingLeft: 8,
  },
  replyName: {
    fontSize: 12,
    fontWeight: "600",
  },
  replyText: {
    fontSize: 13,
    marginTop: 2,
  },
  attachmentPreview: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
  },
  attachmentItem: {
    position: "relative",
  },
  attachmentThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  videoThumb: {
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  removeAttachment: {
    position: "absolute",
    top: -6,
    right: -6,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#c62828",
  },
  errorRetry: {
    fontSize: 13,
    fontWeight: "600",
  },
});
