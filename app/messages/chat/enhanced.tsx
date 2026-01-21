/**
 * Enhanced Chat Screen
 * Real-time messaging with WebSocket integration
 * Uses useRealtimeChat hook for full real-time support
 *
 * @created 19/01/2026
 */

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConnectionStatusBanner } from "@/components/chat/ConnectionStatusBanner";
import MessageBubble from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import Avatar from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import type { ChatMessage } from "@/services/communication/chatSocket.service";

export default function EnhancedChatScreen() {
  const { recipientId: recipientIdParam, conversationId: conversationIdParam } =
    useLocalSearchParams<{
      recipientId: string;
      conversationId?: string;
    }>();

  const recipientId = parseInt(recipientIdParam || "0");
  const initialConversationId = conversationIdParam
    ? parseInt(conversationIdParam)
    : null;

  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  // Message input state
  const [messageText, setMessageText] = useState("");
  const [recipientInfo, setRecipientInfo] = useState({
    name: `User ${recipientId}`,
    avatar: undefined as string | undefined,
    isOnline: false,
  });

  // Real-time chat hook
  const {
    messages,
    loading,
    sending,
    error,
    hasMore,
    connected,
    connecting,
    typingUsers,
    isTyping,
    sendMessage,
    loadMore,
    refresh,
    markAsRead,
    setTyping,
    connect,
    disconnect,
  } = useRealtimeChat({
    conversationId: initialConversationId,
    recipientId,
    autoConnect: true,
    onNewMessage: (message) => {
      // Auto-scroll to new message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
  });

  // Get typing users for current conversation
  const currentTypingUsers = Array.from(typingUsers.values())
    .map((t) => t.name)
    .filter((name) => name);

  // Mark messages as read when entering
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const unreadIds = messages
        .filter((m) => m.senderId === recipientId && m.status !== "read")
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [loading, messages.length]);

  // Handle typing indicator
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = (text: string) => {
    setMessageText(text);

    if (text.length > 0) {
      setTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
    }
  };

  // Send message handler
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    setMessageText("");
    Keyboard.dismiss();

    // Stop typing indicator
    setTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      await sendMessage(text);

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error("[EnhancedChat] Failed to send:", err);
      // Restore message on error
      setMessageText(text);
    }
  }, [messageText, sending, sendMessage]);

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render message item
  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const isOwn = item.senderId !== recipientId;

    return (
      <MessageBubble
        text={item.content}
        mine={isOwn}
        at={new Date(item.createdAt).getTime()}
        showTime={true}
        read={item.status === "read"}
      />
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (currentTypingUsers.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <TypingIndicator
          users={currentTypingUsers}
          visible={currentTypingUsers.length > 0}
        />
      </View>
    );
  };

  // Loading state
  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0068FF" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Connection status banner */}
      <ConnectionStatusBanner
        connected={connected}
        connecting={connecting}
        error={error}
        onReconnect={connect}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerCenter}
          onPress={() => router.push(`/profile/${recipientId}`)}
          activeOpacity={0.8}
        >
          <Avatar
            avatar={recipientInfo.avatar || null}
            userId={String(recipientId)}
            name={recipientInfo.name}
            pixelSize={36}
            showBadge={recipientInfo.isOnline}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {recipientInfo.name}
            </Text>
            <Text style={styles.headerStatus}>
              {connected ? (
                <Text style={{ color: "#7DD3FC" }}>● Online</Text>
              ) : connecting ? (
                "Đang kết nối..."
              ) : (
                "Offline"
              )}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Call buttons */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push(`/call/${recipientId}?type=audio`)}
        >
          <Ionicons name="call" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push(`/call/${recipientId}?type=video`)}
        >
          <Ionicons name="videocam" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMore}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text style={styles.loadMoreText}>Tải tin nhắn cũ hơn</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input area */}
      <View
        style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle" size={28} color="#0068FF" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={handleTextChange}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />

          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0068FF",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  headerStatus: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    padding: 12,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadMoreButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  loadMoreText: {
    fontSize: 13,
    color: "#0068FF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  attachButton: {
    padding: 6,
    marginRight: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 4,
    maxHeight: 80,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0068FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
});
