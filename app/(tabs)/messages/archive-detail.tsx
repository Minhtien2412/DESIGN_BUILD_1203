/**
 * Archive Detail Screen
 * ======================
 *
 * Màn hình xem chi tiết một archive:
 * - Hiển thị danh sách tin nhắn
 * - Tìm kiếm trong archive
 * - Xem media đính kèm
 * - Export archive
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { useChatArchive } from "@/hooks/useChatArchive";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  ArchivedMessage,
  ChatArchive,
  formatFileSize,
} from "@/services/chatHistoryArchiveService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ============================================
// MESSAGE ITEM COMPONENT
// ============================================

interface MessageItemProps {
  message: ArchivedMessage;
  onMediaPress: (uri: string, type: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onMediaPress }) => {
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const bgColor = useThemeColor({}, "background");

  const isOwnMessage = message.senderId === "current_user"; // TODO: Get from auth context
  const bubbleColor = isOwnMessage ? "#007AFF" : "#E5E5EA";
  const textBubbleColor = isOwnMessage ? "#fff" : textColor;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render attachments
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return message.attachments.map((attachment) => {
      const isLocalFile =
        attachment.localPath && !attachment.localPath.startsWith("http");
      const mediaUri = isLocalFile
        ? attachment.localPath
        : attachment.originalUrl;

      if (attachment.mimeType?.startsWith("image/")) {
        return (
          <TouchableOpacity
            key={attachment.id}
            style={styles.mediaContainer}
            onPress={() => onMediaPress(mediaUri || "", "image")}
          >
            <Image
              source={{ uri: mediaUri }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );
      }

      if (attachment.mimeType?.startsWith("video/")) {
        return (
          <TouchableOpacity
            key={attachment.id}
            style={styles.mediaContainer}
            onPress={() => onMediaPress(mediaUri || "", "video")}
          >
            <View style={styles.videoPlaceholder}>
              <Ionicons name="play-circle" size={36} color="#fff" />
              <Text style={styles.videoText}>Video</Text>
            </View>
          </TouchableOpacity>
        );
      }

      // Document
      return (
        <TouchableOpacity
          key={attachment.id}
          style={[styles.documentContainer, { backgroundColor: bgColor }]}
          onPress={() => onMediaPress(mediaUri || "", "document")}
        >
          <Ionicons name="document" size={24} color="#007AFF" />
          <View style={styles.documentInfo}>
            <Text
              style={[styles.documentName, { color: textColor }]}
              numberOfLines={1}
            >
              {attachment.fileName || "Document"}
            </Text>
            {attachment.fileSize && (
              <Text style={[styles.documentSize, { color: mutedColor }]}>
                {formatFileSize(attachment.fileSize)}
              </Text>
            )}
          </View>
          <Ionicons name="download-outline" size={16} color={mutedColor} />
        </TouchableOpacity>
      );
    });
  };
  return (
    <View style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}>
      <View style={[styles.messageBubble, { backgroundColor: bubbleColor }]}>
        {/* Sender name (for group chats) */}
        {!isOwnMessage && message.senderName && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {/* Attachments */}
        {renderAttachments()}

        {/* Text content */}
        {message.content && (
          <Text style={[styles.messageText, { color: textBubbleColor }]}>
            {message.content}
          </Text>
        )}

        {/* Time */}
        <Text
          style={[
            styles.messageTime,
            { color: isOwnMessage ? "rgba(255,255,255,0.7)" : mutedColor },
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

// ============================================
// MAIN SCREEN
// ============================================

export default function ArchiveDetailScreen() {
  const router = useRouter();
  const { archiveId } = useLocalSearchParams<{ archiveId: string }>();
  const textColor = useThemeColor({}, "text");
  const bgColor = useThemeColor({}, "background");
  const mutedColor = useThemeColor({}, "tabIconDefault");

  // Hook
  const { loadArchive, searchArchives } = useChatArchive();

  // State
  const [archive, setArchive] = useState<ChatArchive | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Load archive
  useEffect(() => {
    const loadData = async () => {
      if (!archiveId) return;

      setIsLoading(true);
      try {
        const data = await loadArchive(archiveId);
        setArchive(data);
      } catch (error) {
        console.error("Error loading archive:", error);
        Alert.alert("Lỗi", "Không thể tải archive");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [archiveId, loadArchive]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    if (!archive) return [];
    if (!searchQuery) return archive.messages;

    return archive.messages.filter(
      (msg) =>
        msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [archive, searchQuery]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; data: ArchivedMessage[] }[] = [];
    let currentDate = "";

    filteredMessages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ date, data: [msg] });
      } else {
        groups[groups.length - 1].data.push(msg);
      }
    });

    return groups;
  }, [filteredMessages]);

  // Handlers
  const handleMediaPress = (uri: string, type: string) => {
    // TODO: Implement media viewer
    console.log("Open media:", uri, type);
    // router.push({ pathname: "/media-viewer", params: { uri, type } });
  };

  const handleExport = async () => {
    if (!archive) return;

    try {
      // Export as text
      const textContent = archive.messages
        .map((msg) => {
          const time = new Date(msg.timestamp).toLocaleString("vi-VN");
          const sender = msg.senderName || "Unknown";
          return `[${time}] ${sender}: ${msg.content || "[Media]"}`;
        })
        .join("\n");

      if (Platform.OS === "web") {
        // Web: Download as file
        const blob = new Blob([textContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat_${archive.metadata.conversationName || archiveId}.txt`;
        a.click();
      } else {
        // Native: Share
        await Share.share({
          message: textContent,
          title: `Lịch sử chat: ${archive.metadata.conversationName || "Archive"}`,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Lỗi", "Không thể xuất archive");
    }
  };

  // Format header date
  const formatHeaderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    }

    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render date header
  const renderDateHeader = (date: string) => (
    <View style={styles.dateHeader}>
      <View style={styles.dateLine} />
      <Text
        style={[
          styles.dateText,
          { color: mutedColor, backgroundColor: bgColor },
        ]}
      >
        {formatHeaderDate(date)}
      </Text>
      <View style={styles.dateLine} />
    </View>
  );

  // Render search bar
  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: bgColor }]}>
      <Ionicons name="search" size={16} color={mutedColor} />
      <TextInput
        nativeID="archive-detail-search"
        accessibilityLabel="Tìm trong cuộc trò chuyện"
        style={[styles.searchInput, { color: textColor }]}
        placeholder="Tìm trong cuộc trò chuyện..."
        placeholderTextColor={mutedColor}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons name="close-circle" size={16} color={mutedColor} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Render archive info header
  const renderInfo = () => (
    <View style={styles.infoContainer}>
      <View style={[styles.infoCard, { backgroundColor: bgColor }]}>
        <Text style={[styles.infoTitle, { color: textColor }]}>
          {archive?.metadata.conversationName || "Cuộc trò chuyện"}
        </Text>
        <Text style={[styles.infoSubtitle, { color: mutedColor }]}>
          {archive?.messages.length || 0} tin nhắn •{" "}
          {new Date(archive?.metadata.startDate || "").toLocaleDateString(
            "vi-VN",
          )}{" "}
          -{" "}
          {new Date(archive?.metadata.endDate || "").toLocaleDateString(
            "vi-VN",
          )}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: bgColor },
        ]}
      >
        <Stack.Screen options={{ title: "Đang tải..." }} />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: mutedColor }]}>
          Đang tải archive...
        </Text>
      </View>
    );
  }

  if (!archive) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: bgColor },
        ]}
      >
        <Stack.Screen options={{ title: "Archive" }} />
        <Ionicons name="alert-circle-outline" size={44} color={mutedColor} />
        <Text style={[styles.errorText, { color: textColor }]}>
          Không tìm thấy archive
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen
        options={{
          title: archive.metadata.conversationName || "Archive",
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
                <Ionicons
                  name={isSearching ? "close" : "search"}
                  size={20}
                  color="#007AFF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleExport}
                style={{ marginLeft: 12 }}
              >
                <Ionicons name="share-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {isSearching && renderSearchBar()}

      <FlatList
        data={groupedMessages}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View>
            {renderDateHeader(item.date)}
            {item.data.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onMediaPress={handleMediaPress}
              />
            ))}
          </View>
        )}
        ListHeaderComponent={renderInfo}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={36} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>
              {searchQuery ? "Không tìm thấy tin nhắn" : "Không có tin nhắn"}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        inverted={false}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  errorText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 18,
  },
  backBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    margin: 12,
    marginBottom: 0,
    borderRadius: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },

  // Info header
  infoContainer: {
    marginBottom: 10,
  },
  infoCard: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  infoSubtitle: {
    fontSize: 11,
  },

  // Date header
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dateText: {
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: "500",
  },

  // Message
  messageContainer: {
    marginVertical: 2,
    alignItems: "flex-start",
  },
  ownMessage: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 9,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 3,
    textAlign: "right",
  },

  // Media
  mediaContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  mediaImage: {
    width: 170,
    height: 128,
    borderRadius: 8,
  },
  videoPlaceholder: {
    width: 170,
    height: 128,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  videoText: {
    color: "#fff",
    fontSize: 10,
    marginTop: 3,
  },
  documentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    gap: 6,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 12,
    fontWeight: "500",
  },
  documentSize: {
    fontSize: 10,
  },

  // Empty
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 12,
  },
});
