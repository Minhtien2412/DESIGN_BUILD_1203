/**
 * Message Thread Screen
 * Chat interface between two users with bubble UI (like Zalo)
 * Now using real backend API with WebSocket support
 */

import { type UploadedAttachment } from "@/components/chat/ChatAttachmentPicker";
import {
    AttachmentData,
    MessageComposerToolbar,
} from "@/components/chat/MessageComposerToolbar";
import {
    MessageReactions,
    ReactionPicker,
    type Reaction,
} from "@/components/chat/MessageReactions";
import { ChatHeader } from "@/components/navigation/ChatHeader";
import Avatar from "@/components/ui/avatar";
import { useWebSocket } from "@/context/WebSocketContext";
import { useConversation } from "@/hooks/useMessages";
import type { Message } from "@/services/api/messagesApi";
import messagesApi from "@/services/api/messagesApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Recipient info type
interface RecipientInfo {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

// Demo messages khi API lỗi
const createDemoMessages = (recipientId: number): Message[] => [
  {
    id: 1,
    content: "Chào bạn! Dự án tiến triển thế nào rồi?",
    senderId: recipientId,
    conversationId: 0,
    sender: {
      id: recipientId,
      name: `Người dùng ${recipientId}`,
      email: `user${recipientId}@demo.com`,
      role: "CLIENT" as const,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: true,
  },
  {
    id: 2,
    content: "Chào anh/chị, dự án đang tiến triển tốt ạ!",
    senderId: 0, // Current user
    conversationId: 0,
    sender: {
      id: 0,
      name: "Tôi",
      email: "me@demo.com",
      role: "ENGINEER" as const,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: true,
  },
  {
    id: 3,
    content: "Tuyệt vời! Khi nào có thể xem được bản thiết kế?",
    senderId: recipientId,
    conversationId: 0,
    sender: {
      id: recipientId,
      name: `Người dùng ${recipientId}`,
      email: `user${recipientId}@demo.com`,
      role: "CLIENT" as const,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    isRead: true,
  },
  {
    id: 4,
    content: "Em sẽ gửi bản thiết kế trong ngày hôm nay ạ",
    senderId: 0,
    conversationId: 0,
    sender: {
      id: 0,
      name: "Tôi",
      email: "me@demo.com",
      role: "ENGINEER" as const,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: true,
  },
  {
    id: 5,
    content: "Ok cảm ơn bạn nhé! 👍",
    senderId: recipientId,
    conversationId: 0,
    sender: {
      id: recipientId,
      name: `Người dùng ${recipientId}`,
      email: `user${recipientId}@demo.com`,
      role: "CLIENT" as const,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    isRead: false,
  },
];

export default function MessageThreadScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const recipientId = parseInt(userId || "0");

  // State for recipient info (fetched from conversation or API)
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(
    null,
  );
  // State for pending attachment
  const [pendingAttachment, setPendingAttachment] =
    useState<UploadedAttachment | null>(null);

  // Use conversation hook for data management
  // Hook will auto-fetch conversationId from recipientId if not provided
  const {
    messages: apiMessages,
    loading,
    sending,
    hasMore,
    conversationId,
    sendMessage,
    loadMore,
    markAllAsRead,
    refresh,
  } = useConversation(null, recipientId);

  // Use demo messages if API returns empty
  const messages = useMemo(() => {
    if (apiMessages && apiMessages.length > 0) {
      return apiMessages;
    }
    return createDemoMessages(recipientId);
  }, [apiMessages, recipientId]);

  // WebSocket for real-time updates
  const { socket, connected } = useWebSocket();

  const [messageText, setMessageText] = useState("");
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [messageReactions, setMessageReactions] = useState<
    Record<string, Reaction[]>
  >({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [reactionPickerPosition, setReactionPickerPosition] = useState<
    { x: number; y: number } | undefined
  >();
  const flatListRef = useRef<FlatList>(null);
  const isAtBottomRef = useRef<boolean>(true);

  // Fetch recipient info from conversation or messages
  useEffect(() => {
    const fetchRecipientInfo = async () => {
      // First try to get from messages
      if (messages.length > 0) {
        const otherUserMessage = messages.find(
          (m) => m.senderId === recipientId,
        );
        if (otherUserMessage?.sender) {
          setRecipientInfo({
            id: otherUserMessage.sender.id,
            name: otherUserMessage.sender.name,
            email: otherUserMessage.sender.email,
          });
          return;
        }
      }

      // Then try to get from conversation
      try {
        const conversation =
          await messagesApi.getConversationByRecipient(recipientId);
        if (conversation) {
          const recipient = conversation.participants.find(
            (p) => p.id === recipientId,
          );
          if (recipient) {
            setRecipientInfo({
              id: recipient.id,
              name: recipient.name,
              email: recipient.email,
            });
          }
        }
      } catch (err) {
        console.log("[MessageThread] Could not fetch recipient info:", err);
      }
    };

    if (recipientId) {
      fetchRecipientInfo();
    }
  }, [recipientId, messages]);

  // Derive display name
  const displayName = useMemo(() => {
    if (recipientInfo?.name) return recipientInfo.name;
    return `User ${recipientId}`;
  }, [recipientInfo, recipientId]);

  // Mark messages as read when entering conversation
  useEffect(() => {
    if (!loading && messages.length > 0 && conversationId) {
      markAllAsRead();
    }
  }, [loading, conversationId]);

  // WebSocket: Join chat room when conversation is loaded
  useEffect(() => {
    if (!socket || !connected || !conversationId) return;

    // Join the chat room to receive real-time messages
    socket.emit("joinRoom", { roomId: conversationId, userId: recipientId });
    console.log("[Chat] Joined room:", conversationId);

    return () => {
      // Leave room when component unmounts
      socket.emit("leaveRoom", { roomId: conversationId, userId: recipientId });
    };
  }, [socket, connected, conversationId, recipientId]);

  // WebSocket: Listen for new messages
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (newMessage: Message) => {
      // Refresh messages when receiving a new message for this conversation
      if (
        newMessage.senderId === recipientId ||
        (newMessage as any).roomId === conversationId
      ) {
        refresh(); // Re-fetch from API to get correct data
        // Auto-scroll if at bottom
        if (isAtBottomRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 200);
          setNewMessagesCount(0);
        } else {
          setNewMessagesCount((prev) => prev + 1);
        }
      }
    };

    // Listen for both event names (backend emits 'newMessage')
    socket.on("newMessage", handleNewMessage);
    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("message:new", handleNewMessage);
    };
  }, [recipientId, conversationId, socket, connected, refresh]);

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [loading]);

  // Reaction handlers
  const handleAddReaction = useCallback(
    (messageId: string, emoji: string) => {
      setMessageReactions((prev) => {
        const existing = prev[messageId] || [];
        const reactionIndex = existing.findIndex((r) => r.emoji === emoji);

        if (reactionIndex >= 0) {
          // Add to existing reaction
          const updated = [...existing];
          updated[reactionIndex] = {
            ...updated[reactionIndex],
            count: updated[reactionIndex].count + 1,
            hasReacted: true,
            userIds: [...updated[reactionIndex].userIds, "current-user"],
          };
          return { ...prev, [messageId]: updated };
        } else {
          // New reaction
          return {
            ...prev,
            [messageId]: [
              ...existing,
              { emoji, count: 1, hasReacted: true, userIds: ["current-user"] },
            ],
          };
        }
      });

      // Send to server via WebSocket
      socket?.emit("message:react", { messageId, emoji, action: "add" });
    },
    [socket],
  );

  const handleRemoveReaction = useCallback(
    (messageId: string, emoji: string) => {
      setMessageReactions((prev) => {
        const existing = prev[messageId] || [];
        const reactionIndex = existing.findIndex((r) => r.emoji === emoji);

        if (reactionIndex >= 0) {
          const updated = [...existing];
          if (updated[reactionIndex].count <= 1) {
            // Remove reaction entirely
            updated.splice(reactionIndex, 1);
          } else {
            // Decrement count
            updated[reactionIndex] = {
              ...updated[reactionIndex],
              count: updated[reactionIndex].count - 1,
              hasReacted: false,
              userIds: updated[reactionIndex].userIds.filter(
                (id) => id !== "current-user",
              ),
            };
          }
          return { ...prev, [messageId]: updated };
        }
        return prev;
      });

      // Send to server via WebSocket
      socket?.emit("message:react", { messageId, emoji, action: "remove" });
    },
    [socket],
  );

  const handleMessageLongPress = useCallback(
    (messageId: string, event: any) => {
      setSelectedMessageId(messageId);
      // Get position from event for picker placement
      if (event?.nativeEvent) {
        setReactionPickerPosition({
          x: event.nativeEvent.pageX,
          y: event.nativeEvent.pageY,
        });
      }
      setShowReactionPicker(true);
    },
    [],
  );

  const handleSelectReaction = useCallback(
    (emoji: string) => {
      if (selectedMessageId) {
        handleAddReaction(selectedMessageId, emoji);
      }
      setShowReactionPicker(false);
      setSelectedMessageId(null);
    },
    [selectedMessageId, handleAddReaction],
  );

  const handleSendMessage = async (directText?: string) => {
    const text = (directText ?? messageText).trim();
    if ((!text && !pendingAttachment) || sending) return;

    setMessageText("");
    Keyboard.dismiss();

    try {
      // Send message with attachment if present
      if (pendingAttachment) {
        const attachmentContent =
          pendingAttachment.type === "image"
            ? `[Image: ${pendingAttachment.url}]`
            : `[File: ${pendingAttachment.name}](${pendingAttachment.url})`;
        await sendMessage(
          text ? `${text}\n${attachmentContent}` : attachmentContent,
        );
        setPendingAttachment(null);
      } else {
        await sendMessage(text);
      }

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message text on error
      setMessageText(text);
    }
  };

  // Handle attachment ready from picker
  const handleAttachmentReady = (attachment: UploadedAttachment) => {
    setPendingAttachment(attachment);
    // Auto-send image immediately, or show preview for files
    if (attachment.type === "image") {
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60)
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isYesterday) {
      return (
        "Hôm qua " +
        date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      );
    }

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Offline";

    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa online";
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isFromMe = item.sender?.id !== recipientId;
    const showAvatar =
      !prevMessage || (prevMessage.sender?.id !== recipientId) !== isFromMe;
    const isLastInGroup =
      index === messages.length - 1 ||
      (messages[index + 1]?.sender?.id !== recipientId) !== isFromMe;
    const messageIdStr = String(item.id);
    const reactions = messageReactions[messageIdStr] || [];

    return (
      <View
        style={[
          styles.messageRow,
          isFromMe ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        {/* Avatar (left side for received messages) */}
        {!isFromMe && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Avatar
                avatar={null}
                userId={String(recipientId)}
                name={"User"}
                pixelSize={32}
              />
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        {/* Message bubble with long press for reactions */}
        <TouchableOpacity
          style={[
            styles.messageBubble,
            isFromMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
            !showAvatar &&
              (isFromMe ? styles.bubbleGroupRight : styles.bubbleGroupLeft),
          ]}
          onLongPress={(e) => handleMessageLongPress(messageIdStr, e)}
          activeOpacity={0.8}
          delayLongPress={300}
        >
          <Text
            style={[
              styles.messageText,
              isFromMe ? styles.messageTextRight : styles.messageTextLeft,
            ]}
          >
            {item.content}
          </Text>

          {/* Reactions display */}
          {reactions.length > 0 && (
            <MessageReactions
              messageId={messageIdStr}
              reactions={reactions}
              currentUserId="current-user"
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              isOwnMessage={isFromMe}
              style={styles.messageReactions}
            />
          )}

          {/* Time and read status */}
          {isLastInGroup && (
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  isFromMe ? styles.messageTimeRight : styles.messageTimeLeft,
                ]}
              >
                {formatMessageTime(item.createdAt)}
              </Text>
              {isFromMe && (
                <Ionicons
                  name={item.isRead ? "checkmark-done" : "checkmark"}
                  size={12}
                  color={item.isRead ? "#0D9488" : "#999"}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <TouchableOpacity onPress={loadMore} disabled={loading}>
          <Text style={styles.loadMoreText}>
            {loading ? "Đang tải..." : "Tải tin nhắn cũ hơn"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      {/* Chat Header - Zalo style */}
      <ChatHeader
        title={displayName}
        avatar={recipientInfo?.avatar}
        userId={String(recipientId)}
        isOnline={connected}
        onVoiceCall={() =>
          router.push(`/call/${recipientId}?type=voice` as any)
        }
        onVideoCall={() =>
          router.push(`/call/${recipientId}?type=video` as any)
        }
        onProfilePress={() => router.push(`/profile/${recipientId}` as any)}
      />

      {/* Messages list */}
      <View style={{ flex: 1, position: "relative" }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={renderFooter}
          inverted={false}
          onScroll={(e) => {
            // Track if user is at bottom
            const { contentOffset, contentSize, layoutMeasurement } =
              e.nativeEvent;
            const isBottom =
              contentOffset.y + layoutMeasurement.height >=
              contentSize.height - 50;
            isAtBottomRef.current = isBottom;

            // Clear new messages count if scrolled to bottom
            if (isBottom && newMessagesCount > 0) {
              setNewMessagesCount(0);
            }
          }}
          scrollEventThrottle={100}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        {/* New messages indicator */}
        {newMessagesCount > 0 && (
          <TouchableOpacity
            style={styles.newMessagesBadge}
            onPress={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
              setNewMessagesCount(0);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-down"
              size={16}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.newMessagesBadgeText}>
              {newMessagesCount} tin nhắn mới
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Message Composer Toolbar - với voice, image, video support */}
      <MessageComposerToolbar
        onSendText={(text) => {
          handleSendMessage(text);
        }}
        onSendAttachment={(attachment: AttachmentData) => {
          setPendingAttachment({
            url: attachment.uri,
            type: attachment.type === "voice" ? "file" : attachment.type,
            name: attachment.name,
            size: attachment.size,
          } as UploadedAttachment);
          handleSendMessage();
        }}
        onTypingStart={() => {
          socket?.emit("typing", {
            roomId: conversationId,
            userId: recipientId,
            isTyping: true,
          });
        }}
        onTypingStop={() => {
          socket?.emit("typing", {
            roomId: conversationId,
            userId: recipientId,
            isTyping: false,
          });
        }}
        placeholder="Nhập tin nhắn..."
        sending={sending}
        disabled={sending}
        primaryColor="#0D9488"
      />

      {/* Reaction Picker Modal */}
      <ReactionPicker
        visible={showReactionPicker}
        onClose={() => {
          setShowReactionPicker(false);
          setSelectedMessageId(null);
        }}
        onSelectReaction={handleSelectReaction}
        position={reactionPickerPosition}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8ECF1", // Zalo-like chat background
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-end",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleLeft: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: "#D5F1FF", // Zalo light blue for sent messages
    borderBottomRightRadius: 4,
  },
  bubbleGroupLeft: {
    borderBottomLeftRadius: 18,
  },
  bubbleGroupRight: {
    borderBottomRightRadius: 18,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: "#111",
  },
  messageTextRight: {
    color: "#111", // Dark text on light blue bubble
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeLeft: {
    color: "#999",
  },
  messageTimeRight: {
    color: "#666", // Darker for contrast on light blue
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  inputButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: "#111",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0D9488", // Zalo blue send button
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8ECF1",
  },
  loadingIndicator: {
    color: "#0D9488", // Use in component
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#999",
  },
  loadMoreText: {
    fontSize: 14,
    color: "#0D9488", // Zalo blue
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#999",
  },
  newMessagesBadge: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "#0D9488", // Zalo blue
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  newMessagesBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  messageReactions: {
    marginTop: 4,
  },
});
