/**
 * MeetingChat - In-meeting chat component
 *
 * Features:
 * - Real-time message sending/receiving
 * - Participant mentions
 * - Message reactions
 * - File/link sharing
 * - Collapsible panel
 * - Unread count badge
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "file" | "system";
  timestamp: number;
  reactions?: MessageReaction[];
  mentionedUserIds?: string[];
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  };
  isLocal?: boolean; // Sent by current user
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

export interface MeetingChatProps {
  messages: ChatMessage[];
  participants: Participant[];
  currentUserId: string;
  currentUserName: string;
  onSendMessage: (content: string, mentionedUserIds?: string[]) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  style?: ViewStyle;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  background: "#1a1a1a",
  surface: "#2a2a2a",
  surfaceLight: "#3a3a3a",
  text: "#ffffff",
  textSecondary: "#888888",
  accent: "#6366f1",
  accentLight: "rgba(99, 102, 241, 0.2)",
  border: "#404040",
  system: "#eab308",
  mention: "#22d3ee",
};

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "🎉"];

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
  participants: Participant[];
  onReact?: (emoji: string) => void;
}

function MessageBubble({
  message,
  isOwn,
  showSender,
  participants,
  onReact,
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Highlight mentions
  const renderContent = () => {
    if (message.type === "system") {
      return <Text style={styles.systemMessage}>{message.content}</Text>;
    }

    if (message.type === "file" && message.fileInfo) {
      return (
        <View style={styles.fileMessage}>
          <Ionicons name="document-outline" size={20} color={COLORS.accent} />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {message.fileInfo.name}
            </Text>
            <Text style={styles.fileSize}>
              {(message.fileInfo.size / 1024).toFixed(1)} KB
            </Text>
          </View>
        </View>
      );
    }

    // Text with mentions
    if (message.mentionedUserIds?.length) {
      const parts: React.ReactNode[] = [];
      let content = message.content;

      message.mentionedUserIds.forEach((userId) => {
        const participant = participants.find((p) => p.id === userId);
        if (participant) {
          const mentionText = `@${participant.name}`;
          const index = content.indexOf(mentionText);
          if (index !== -1) {
            if (index > 0) {
              parts.push(
                <Text
                  key={`text-${parts.length}`}
                  style={isOwn ? styles.ownMessageText : styles.messageText}
                >
                  {content.substring(0, index)}
                </Text>
              );
            }
            parts.push(
              <Text key={`mention-${userId}`} style={styles.mentionText}>
                {mentionText}
              </Text>
            );
            content = content.substring(index + mentionText.length);
          }
        }
      });

      if (content) {
        parts.push(
          <Text
            key={`text-end`}
            style={isOwn ? styles.ownMessageText : styles.messageText}
          >
            {content}
          </Text>
        );
      }

      return <Text>{parts}</Text>;
    }

    return (
      <Text style={isOwn ? styles.ownMessageText : styles.messageText}>
        {message.content}
      </Text>
    );
  };

  if (message.type === "system") {
    return <View style={styles.systemContainer}>{renderContent()}</View>;
  }

  return (
    <View
      style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}
    >
      {/* Sender name (for others) */}
      {showSender && !isOwn && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}

      <TouchableOpacity
        style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}
        onLongPress={() => setShowReactions(!showReactions)}
        activeOpacity={0.8}
      >
        {renderContent()}
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
      </TouchableOpacity>

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <View style={[styles.reactionsBar, isOwn && styles.ownReactionsBar]}>
          {message.reactions.map((reaction, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reactionBadge}
              onPress={() => onReact?.(reaction.emoji)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={styles.reactionCount}>
                {reaction.userIds.length}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick reactions popup */}
      {showReactions && (
        <View
          style={[styles.quickReactions, isOwn && styles.ownQuickReactions]}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.quickReactionButton}
              onPress={() => {
                onReact?.(emoji);
                setShowReactions(false);
              }}
            >
              <Text style={styles.quickReactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// MENTION PICKER COMPONENT
// ============================================================================

interface MentionPickerProps {
  participants: Participant[];
  searchText: string;
  onSelect: (participant: Participant) => void;
}

function MentionPicker({
  participants,
  searchText,
  onSelect,
}: MentionPickerProps) {
  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (filteredParticipants.length === 0) return null;

  return (
    <View style={styles.mentionPicker}>
      {filteredParticipants.slice(0, 5).map((participant) => (
        <TouchableOpacity
          key={participant.id}
          style={styles.mentionItem}
          onPress={() => onSelect(participant)}
        >
          <View style={styles.mentionAvatar}>
            <Text style={styles.mentionAvatarText}>
              {participant.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.mentionName}>{participant.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MeetingChat({
  messages,
  participants,
  currentUserId,
  currentUserName,
  onSendMessage,
  onReactToMessage,
  isExpanded = true,
  onExpandChange,
  style,
}: MeetingChatProps) {
  const [inputText, setInputText] = useState("");
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionSearchText, setMentionSearchText] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const expandAnimation = useRef(
    new Animated.Value(isExpanded ? 1 : 0)
  ).current;

  // Handle expand/collapse animation
  useEffect(() => {
    Animated.timing(expandAnimation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnimation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isExpanded && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else if (!isExpanded) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages.length, isExpanded]);

  // Reset unread when expanded
  useEffect(() => {
    if (isExpanded) {
      setUnreadCount(0);
    }
  }, [isExpanded]);

  // Handle text input change
  const handleTextChange = useCallback((text: string) => {
    setInputText(text);

    // Check for @ mention trigger
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex !== -1 && lastAtIndex === text.length - 1) {
      setShowMentionPicker(true);
      setMentionSearchText("");
    } else if (lastAtIndex !== -1) {
      const afterAt = text.substring(lastAtIndex + 1);
      if (!afterAt.includes(" ")) {
        setShowMentionPicker(true);
        setMentionSearchText(afterAt);
      } else {
        setShowMentionPicker(false);
      }
    } else {
      setShowMentionPicker(false);
    }
  }, []);

  // Handle mention selection
  const handleMentionSelect = useCallback(
    (participant: Participant) => {
      const lastAtIndex = inputText.lastIndexOf("@");
      const newText =
        inputText.substring(0, lastAtIndex) + `@${participant.name} `;
      setInputText(newText);
      setMentionedUsers((prev) => [...prev, participant.id]);
      setShowMentionPicker(false);
      inputRef.current?.focus();
    },
    [inputText]
  );

  // Handle send message
  const handleSend = useCallback(() => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    onSendMessage(
      trimmedText,
      mentionedUsers.length > 0 ? mentionedUsers : undefined
    );
    setInputText("");
    setMentionedUsers([]);
  }, [inputText, mentionedUsers, onSendMessage]);

  // Handle reaction
  const handleReaction = useCallback(
    (messageId: string, emoji: string) => {
      onReactToMessage?.(messageId, emoji);
    },
    [onReactToMessage]
  );

  // Toggle expand
  const toggleExpand = useCallback(() => {
    onExpandChange?.(!isExpanded);
  }, [isExpanded, onExpandChange]);

  // Calculate container height
  const containerHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 350],
  });

  // Check if should show sender (first message or different sender)
  const shouldShowSender = (index: number) => {
    if (index === 0) return true;
    return messages[index].senderId !== messages[index - 1].senderId;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Animated.View
      style={[styles.container, { height: containerHeight }, style]}
    >
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggleExpand}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles-outline" size={20} color={COLORS.text} />
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          {!isExpanded && unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? "chevron-down" : "chevron-up"}
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      {/* Chat content */}
      {isExpanded && (
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={100}
        >
          {/* Messages list */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <MessageBubble
                message={item}
                isOwn={item.senderId === currentUserId}
                showSender={shouldShowSender(index)}
                participants={participants}
                onReact={(emoji) => handleReaction(item.id, emoji)}
              />
            )}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            inverted={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Chưa có tin nhắn</Text>
              </View>
            }
          />

          {/* Mention picker */}
          {showMentionPicker && (
            <MentionPicker
              participants={participants.filter((p) => p.id !== currentUserId)}
              searchText={mentionSearchText}
              onSelect={handleMentionSelect}
            />
          )}

          {/* Input area */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={COLORS.textSecondary}
              value={inputText}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              maxLength={500}
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
                size={18}
                color={inputText.trim() ? COLORS.accent : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  unreadText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "700",
  },

  // Content
  content: {
    flex: 1,
  },

  // Message list
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // Message container
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  ownMessageContainer: {
    alignSelf: "flex-end",
  },
  senderName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 2,
    marginLeft: 12,
  },

  // Message bubble
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  ownBubble: {
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  mentionText: {
    color: COLORS.mention,
    fontWeight: "600",
  },
  timestamp: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  // System message
  systemContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  systemMessage: {
    color: COLORS.system,
    fontSize: 12,
    fontStyle: "italic",
  },

  // File message
  fileMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
  },
  fileSize: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  // Reactions
  reactionsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 4,
  },
  ownReactionsBar: {
    justifyContent: "flex-end",
  },
  reactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },

  // Quick reactions
  quickReactions: {
    position: "absolute",
    top: -40,
    left: 0,
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 4,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ownQuickReactions: {
    left: "auto",
    right: 0,
  },
  quickReactionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickReactionEmoji: {
    fontSize: 18,
  },

  // Mention picker
  mentionPicker: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: 150,
  },
  mentionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  mentionAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  mentionAvatarText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  mentionName: {
    color: COLORS.text,
    fontSize: 14,
  },

  // Input area
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surface,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});

export default MeetingChat;
