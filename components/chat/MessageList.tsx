/**
 * MessageList Component
 * ======================
 *
 * Virtualized message list với:
 * - Infinite scroll (load more khi scroll lên)
 * - Auto scroll to bottom khi có tin nhắn mới
 * - Pull to refresh
 * - Typing indicator
 * - Date separators
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/useThemeColor";
import { Message } from "@/services/api/conversations.service";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// Types
// ============================================================================

interface MessageListProps {
  messages: (Message & { _isPending?: boolean; _status?: string })[];
  currentUserId: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMoreBefore?: boolean;
  typingUsers?: { id: number; name: string; avatar?: string }[];
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onMessagePress?: (message: Message) => void;
  onMessageLongPress?: (message: Message) => void;
  onAvatarPress?: (userId: number) => void;
  renderMessage?: (props: {
    message: Message & { _isPending?: boolean; _status?: string };
    isOwn: boolean;
    showAvatar: boolean;
    showTime: boolean;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
  }) => React.ReactNode;
  ListEmptyComponent?: React.ReactElement | (() => React.ReactElement);
}

interface MessageGroup {
  date: string;
  messages: (Message & { _isPending?: boolean; _status?: string })[];
}

// ============================================================================
// Helpers
// ============================================================================

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return "Hôm nay";
  } else if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[date.getDay()];
  } else {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function shouldShowTime(
  currentMsg: Message,
  prevMsg: Message | undefined,
  currentUserId: number,
): boolean {
  if (!prevMsg) return true;

  // Different sender
  if (currentMsg.senderId !== prevMsg.senderId) return true;

  // More than 5 minutes apart
  const diff =
    new Date(currentMsg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime();
  return diff > 5 * 60 * 1000;
}

function shouldShowAvatar(
  currentMsg: Message,
  nextMsg: Message | undefined,
  currentUserId: number,
): boolean {
  // Don't show for own messages
  if (currentMsg.senderId === currentUserId) return false;

  // Show for last message in group or different sender
  if (!nextMsg || nextMsg.senderId !== currentMsg.senderId) return true;

  // More than 5 minutes apart
  const diff =
    new Date(nextMsg.sentAt).getTime() - new Date(currentMsg.sentAt).getTime();
  return diff > 5 * 60 * 1000;
}

// ============================================================================
// Sub-components
// ============================================================================

const DateSeparator = React.memo(({ date }: { date: string }) => {
  const textColor = useThemeColor({}, "textMuted");
  const bgColor = useThemeColor({}, "surface");

  return (
    <View style={styles.dateSeparator}>
      <View style={[styles.dateBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.dateText, { color: textColor }]}>{date}</Text>
      </View>
    </View>
  );
});

const TypingIndicator = React.memo(
  ({ users }: { users: { name: string }[] }) => {
    const textColor = useThemeColor({}, "textSecondary");
    const dotColor = useThemeColor({}, "primary");

    if (users.length === 0) return null;

    const text =
      users.length === 1
        ? `${users[0].name} đang nhập...`
        : users.length === 2
          ? `${users[0].name} và ${users[1].name} đang nhập...`
          : `${users.length} người đang nhập...`;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <View
            style={[
              styles.dot,
              styles.dotMiddle,
              { backgroundColor: dotColor },
            ]}
          />
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
        </View>
        <Text style={[styles.typingText, { color: textColor }]}>{text}</Text>
      </View>
    );
  },
);

// Default Message Bubble
const DefaultMessageBubble = React.memo(
  ({
    message,
    isOwn,
    showTime,
    isFirstInGroup,
    isLastInGroup,
  }: {
    message: Message & { _isPending?: boolean; _status?: string };
    isOwn: boolean;
    showTime: boolean;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
  }) => {
    const primaryColor = useThemeColor({}, "primary");
    const textColor = useThemeColor({}, "text");
    const secondaryBg = useThemeColor({}, "surface");
    const secondaryText = useThemeColor({}, "textMuted");

    const bubbleStyle = [
      styles.bubble,
      isOwn
        ? [styles.bubbleOwn, { backgroundColor: primaryColor }]
        : [styles.bubbleOther, { backgroundColor: secondaryBg }],
      isFirstInGroup &&
        (isOwn ? styles.bubbleFirstOwn : styles.bubbleFirstOther),
      isLastInGroup && (isOwn ? styles.bubbleLastOwn : styles.bubbleLastOther),
      message._isPending && styles.bubblePending,
    ];

    const textStyle = [
      styles.messageText,
      { color: isOwn ? "#fff" : textColor },
      message.isDeleted && styles.messageDeleted,
    ];

    return (
      <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
        <View style={bubbleStyle}>
          {message.isDeleted ? (
            <Text style={[textStyle, { fontStyle: "italic" }]}>
              Tin nhắn đã bị xóa
            </Text>
          ) : (
            <Text style={textStyle}>{message.content}</Text>
          )}

          {showTime && (
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.timeText,
                  { color: isOwn ? "rgba(255,255,255,0.7)" : secondaryText },
                ]}
              >
                {formatMessageTime(message.sentAt)}
              </Text>
              {message._isPending && (
                <ActivityIndicator
                  size="small"
                  color={isOwn ? "#fff" : primaryColor}
                  style={{ marginLeft: 4 }}
                />
              )}
              {message._status === "failed" && (
                <Text style={[styles.statusFailed, { color: "#FF3B30" }]}>
                  !
                </Text>
              )}
              {message.isEdited && (
                <Text
                  style={[
                    styles.editedText,
                    { color: isOwn ? "rgba(255,255,255,0.7)" : secondaryText },
                  ]}
                >
                  (đã sửa)
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  },
);

// ============================================================================
// Main Component
// ============================================================================

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  isLoadingMore = false,
  hasMoreBefore = false,
  typingUsers = [],
  onLoadMore,
  onRefresh,
  onMessagePress,
  onMessageLongPress,
  onAvatarPress,
  renderMessage,
  ListEmptyComponent,
}: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const prevMessagesLength = useRef(messages.length);
  const bgColor = useThemeColor({}, "background");
  const textSecondary = useThemeColor({}, "textSecondary");

  // Group messages by date
  const groupedData = React.useMemo(() => {
    const groups: (
      | string
      | (Message & { _isPending?: boolean; _status?: string })
    )[] = [];
    let lastDate = "";

    messages.forEach((msg) => {
      const dateKey = getDateKey(msg.sentAt);
      if (dateKey !== lastDate) {
        groups.push(dateKey); // Date separator
        lastDate = dateKey;
      }
      groups.push(msg);
    });

    return groups;
  }, [messages]);

  // Auto scroll to bottom for new messages (only if near bottom)
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && isNearBottom) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, isNearBottom]);

  // Handle scroll position
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      setIsNearBottom(distanceFromBottom < 100);
    },
    [],
  );

  // Load more when scrolling to top
  const handleEndReached = useCallback(() => {
    if (hasMoreBefore && !isLoadingMore) {
      onLoadMore?.();
    }
  }, [hasMoreBefore, isLoadingMore, onLoadMore]);

  // Render item
  const renderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: string | (Message & { _isPending?: boolean; _status?: string });
      index: number;
    }) => {
      // Date separator
      if (typeof item === "string") {
        return <DateSeparator date={formatMessageDate(item)} />;
      }

      // Message
      const message = item as Message & {
        _isPending?: boolean;
        _status?: string;
      };
      const isOwn = message.senderId === currentUserId;

      // Find prev/next messages (skip date separators)
      let prevMsg: Message | undefined;
      let nextMsg: Message | undefined;

      for (let i = index - 1; i >= 0; i--) {
        if (typeof groupedData[i] !== "string") {
          prevMsg = groupedData[i] as Message;
          break;
        }
      }
      for (let i = index + 1; i < groupedData.length; i++) {
        if (typeof groupedData[i] !== "string") {
          nextMsg = groupedData[i] as Message;
          break;
        }
      }

      const showTime = shouldShowTime(message, prevMsg, currentUserId);
      const showAvatar = shouldShowAvatar(message, nextMsg, currentUserId);
      const isFirstInGroup =
        !prevMsg || prevMsg.senderId !== message.senderId || showTime;
      const isLastInGroup = !nextMsg || nextMsg.senderId !== message.senderId;

      if (renderMessage) {
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onMessagePress?.(message)}
            onLongPress={() => onMessageLongPress?.(message)}
          >
            {renderMessage({
              message,
              isOwn,
              showAvatar,
              showTime,
              isFirstInGroup,
              isLastInGroup,
            })}
          </TouchableOpacity>
        );
      }

      return (
        <DefaultMessageBubble
          message={message}
          isOwn={isOwn}
          showTime={showTime}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
        />
      );
    },
    [
      currentUserId,
      groupedData,
      renderMessage,
      onMessagePress,
      onMessageLongPress,
    ],
  );

  // Key extractor
  const keyExtractor = useCallback(
    (item: string | Message, index: number) =>
      typeof item === "string" ? `date-${item}-${index}` : item.id,
    [],
  );

  // Empty state
  const EmptyComponent = useCallback(() => {
    if (ListEmptyComponent) {
      return typeof ListEmptyComponent === "function" ? (
        <ListEmptyComponent />
      ) : (
        ListEmptyComponent
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: textSecondary }]}>
          Chưa có tin nhắn nào
        </Text>
        <Text style={[styles.emptySubtext, { color: textSecondary }]}>
          Hãy bắt đầu cuộc trò chuyện!
        </Text>
      </View>
    );
  }, [ListEmptyComponent, textSecondary]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>
          Đang tải tin nhắn...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        ref={flatListRef}
        data={groupedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted={false}
        contentContainerStyle={[
          styles.contentContainer,
          groupedData.length === 0 && styles.contentContainerEmpty,
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        onStartReached={handleEndReached}
        onStartReachedThreshold={0.5}
        ListEmptyComponent={EmptyComponent}
        ListHeaderComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        ListFooterComponent={
          typingUsers.length > 0 ? (
            <TypingIndicator users={typingUsers} />
          ) : null
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
      />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  contentContainerEmpty: {
    flex: 1,
    justifyContent: "center",
  },

  // Loading
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
    alignItems: "center",
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },

  // Date separator
  dateSeparator: {
    alignItems: "center",
    paddingVertical: 12,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Message row
  messageRow: {
    flexDirection: "row",
    marginVertical: 1,
    paddingHorizontal: 4,
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },

  // Bubble
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bubbleFirstOwn: {
    borderTopRightRadius: 18,
  },
  bubbleFirstOther: {
    borderTopLeftRadius: 18,
  },
  bubbleLastOwn: {
    borderBottomRightRadius: 18,
  },
  bubbleLastOther: {
    borderBottomLeftRadius: 18,
  },
  bubblePending: {
    opacity: 0.7,
  },

  // Message text
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageDeleted: {
    fontStyle: "italic",
    opacity: 0.7,
  },

  // Footer
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  timeText: {
    fontSize: 11,
  },
  editedText: {
    fontSize: 11,
    marginLeft: 4,
  },
  statusFailed: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },

  // Typing
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
    opacity: 0.6,
  },
  dotMiddle: {
    opacity: 0.8,
  },
  typingText: {
    fontSize: 13,
  },
});

export default MessageList;
