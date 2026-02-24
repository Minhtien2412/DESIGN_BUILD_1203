/**
 * Team Chat Screen
 * Real-time team communication with channels
 * UPDATED: Enhanced keyboard handling & media toolbar
 */

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import {
    AttachmentPreview,
    type AttachmentFile,
} from "@/components/chat/AttachmentPicker";
import { EmojiButton } from "@/components/chat/EmojiButton";
import { MentionInput, type MentionUser } from "@/components/chat/MentionInput";
import { useThemeColor } from "@/hooks/use-theme-color";
import communicationService from "@/services/api/communication.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Channel {
  id: string;
  name: string;
  description?: string;
  unreadCount: number;
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: string;
  };
  memberCount: number;
  members?: MentionUser[];
}

interface Message {
  id: string;
  channelId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  timestamp: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  mentions?: string[];
  isRead: boolean;
}

export default function TeamChatScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, "primary");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const border = useThemeColor({}, "border");
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channelMembers, setChannelMembers] = useState<MentionUser[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showMediaToolbar, setShowMediaToolbar] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const mediaToolbarAnim = useRef(new Animated.Value(0)).current;

  // Keyboard listeners
  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
        // Hide media toolbar when keyboard shows
        if (showMediaToolbar) {
          toggleMediaToolbar(false);
        }
      },
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [showMediaToolbar]);

  // Toggle media toolbar animation
  const toggleMediaToolbar = (show?: boolean) => {
    const shouldShow = show !== undefined ? show : !showMediaToolbar;
    setShowMediaToolbar(shouldShow);

    if (shouldShow) {
      Keyboard.dismiss();
    }

    Animated.spring(mediaToolbarAnim, {
      toValue: shouldShow ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // Dismiss keyboard when tap outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    if (showMediaToolbar) {
      toggleMediaToolbar(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
      loadChannelMembers(selectedChannel.id);
    }
  }, [selectedChannel]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const response = await communicationService.getChannels(
        projectId ? parseInt(projectId) : undefined,
      );

      const channelsData: Channel[] = (response.data || []).map((ch) => ({
        id: ch.id.toString(),
        name: ch.name,
        description: ch.description,
        unreadCount: ch.unreadCount || 0,
        lastMessage: ch.lastMessage
          ? {
              text: ch.lastMessage.content,
              sender: ch.lastMessage.userName || "Unknown",
              timestamp: ch.lastMessage.createdAt,
            }
          : undefined,
        memberCount: ch.memberCount,
      }));

      setChannels(channelsData);
      if (channelsData.length > 0) {
        setSelectedChannel(channelsData[0]);
      }
    } catch (error: any) {
      console.error("Load channels failed:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách kênh");
    } finally {
      setLoading(false);
    }
  };

  const loadChannelMembers = async (channelId: string) => {
    try {
      // TODO: Replace with real API call when available
      // const response = await communicationService.getChannelMembers(parseInt(channelId));

      // Mock members for now
      const mockMembers: MentionUser[] = [
        { id: "1", name: "Nguyễn Văn A", role: "Giám đốc dự án" },
        { id: "2", name: "Trần Thị B", role: "KTS thiết kế" },
        { id: "3", name: "Lê Văn C", role: "Kỹ sư kết cấu" },
        { id: "4", name: "Phạm Thị D", role: "Kỹ sư giám sát" },
        { id: "5", name: "Hoàng Văn E", role: "Trưởng công trường" },
        { id: "6", name: "Đặng Thị F", role: "Kế toán" },
        { id: "7", name: "Vũ Văn G", role: "An toàn lao động" },
        { id: "8", name: "Mai Thị H", role: "QA/QC" },
      ];

      setChannelMembers(mockMembers);
    } catch (error) {
      console.error("Load channel members failed:", error);
      setChannelMembers([]);
    }
  };

  // ========== MEDIA PICKER FUNCTIONS ==========

  // Pick image from camera
  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập", "Vui lòng cấp quyền truy cập camera");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newFile: AttachmentFile = {
          uri: asset.uri,
          name:
            asset.fileName ||
            `camera_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
          type: asset.type === "video" ? "video" : "image",
          size: asset.fileSize || 0,
        };
        setAttachments((prev) => [...prev, newFile]);
        toggleMediaToolbar(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Lỗi", "Không thể mở camera");
    }
  };

  // Pick image from gallery
  const pickFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập",
          "Vui lòng cấp quyền truy cập thư viện ảnh",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: 5 - attachments.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newFiles: AttachmentFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name:
            asset.fileName ||
            `gallery_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
          type: asset.type === "video" ? "video" : "image",
          size: asset.fileSize || 0,
        }));
        setAttachments((prev) => [...prev, ...newFiles].slice(0, 5));
        toggleMediaToolbar(false);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh");
    }
  };

  // Show media options (iOS ActionSheet or Android Alert)
  const showMediaOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Chụp ảnh", "Chọn từ thư viện", "Gửi file"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickFromCamera();
          else if (buttonIndex === 2) pickFromGallery();
          else if (buttonIndex === 3) {
            // File picker handled by AttachmentPicker component
            toggleMediaToolbar(false);
          }
        },
      );
    } else {
      toggleMediaToolbar();
    }
  };

  // ============================================

  const loadMessages = async (channelId: string) => {
    try {
      const response = await communicationService.getMessages({
        channelId: parseInt(channelId),
        limit: 50,
      });

      const messagesData: Message[] = (response.data || []).map((msg) => ({
        id: msg.id.toString(),
        channelId: msg.channelId.toString(),
        sender: {
          id: msg.userId.toString(),
          name: msg.userName || "Unknown",
          avatar: msg.userAvatar,
        },
        text: msg.content,
        timestamp: msg.createdAt,
        attachments: msg.fileUrl
          ? [
              {
                name: msg.fileName || "File",
                url: msg.fileUrl,
                type: msg.type,
              },
            ]
          : undefined,
        mentions: msg.mentions?.map((id) => id.toString()) || [],
        isRead: true,
      }));

      setMessages(messagesData);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } catch (error: any) {
      console.error("Load messages failed:", error);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && attachments.length === 0) || !selectedChannel)
      return;

    setSending(true);
    try {
      // TODO: Upload attachments when uploadService is ready
      // const fileUrls = [];
      // if (attachments.length > 0) {
      //   for (const attachment of attachments) {
      //     const result = await uploadService.uploadSingle(...);
      //     fileUrls.push(result.data.url);
      //   }
      // }

      const response = await communicationService.sendMessage({
        channelId: parseInt(selectedChannel.id),
        content: messageText.trim() || "(Đính kèm tệp tin)",
        type: attachments.length > 0 ? "FILE" : "TEXT",
        // fileUrl: fileUrls[0],
        // fileName: attachments[0]?.name,
      });

      if (!response.data) return;

      const newMessage: Message = {
        id: response.data.id.toString(),
        channelId: response.data.channelId.toString(),
        sender: {
          id: response.data.userId.toString(),
          name: response.data.userName || "Bạn",
          avatar: response.data.userAvatar,
        },
        text: response.data.content,
        timestamp: response.data.createdAt,
        isRead: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
      setAttachments([]);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } catch (error: any) {
      console.error("Send failed:", error);
      Alert.alert("Lỗi", "Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;

    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender.id === "0";

    return (
      <View
        style={[styles.messageContainer, isMe && styles.messageContainerMe]}
      >
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: primary + "20" }]}>
            <Text style={[styles.avatarText, { color: primary }]}>
              {item.sender.name.charAt(0)}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          {!isMe && (
            <Text style={[styles.senderName, { color: text }]}>
              {item.sender.name}
            </Text>
          )}
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isMe ? primary : surface,
                borderColor: border,
              },
              isMe && styles.messageBubbleMe,
            ]}
          >
            <Text style={[styles.messageText, { color: isMe ? "#fff" : text }]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.messageTime, { color: textMuted }]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: background },
        ]}
      >
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: surface, borderBottomColor: border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: text }]}>
            {selectedChannel?.name || "Chat"}
          </Text>
          {selectedChannel && (
            <Text style={[styles.headerSubtitle, { color: textMuted }]}>
              {selectedChannel.memberCount} thành viên
            </Text>
          )}
        </View>
        <Pressable style={styles.headerButton}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={primary}
          />
        </Pressable>
      </View>

      {/* Channel Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.channelTabs}
      >
        {channels.map((channel) => (
          <Pressable
            key={channel.id}
            style={[
              styles.channelTab,
              { borderColor: border },
              selectedChannel?.id === channel.id && {
                backgroundColor: primary,
                borderColor: primary,
              },
            ]}
            onPress={() => setSelectedChannel(channel)}
          >
            <Text
              style={[
                styles.channelTabText,
                { color: selectedChannel?.id === channel.id ? "#fff" : text },
              ]}
            >
              {channel.name}
            </Text>
            {channel.unreadCount > 0 && (
              <View
                style={[styles.unreadBadge, { backgroundColor: "#000000" }]}
              >
                <Text style={styles.unreadText}>{channel.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Messages - Tap to dismiss keyboard */}
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={dismissKeyboard}
        />
      </TouchableWithoutFeedback>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <AttachmentPreview
            attachments={attachments}
            onRemove={(index) => {
              setAttachments((prev) => prev.filter((_, i) => i !== index));
            }}
          />
        )}

        {/* Enhanced Media Toolbar */}
        <Animated.View
          style={[
            styles.mediaToolbar,
            {
              backgroundColor: surface,
              borderTopColor: border,
              transform: [
                {
                  translateY: mediaToolbarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0],
                  }),
                },
              ],
              opacity: mediaToolbarAnim,
              pointerEvents: showMediaToolbar ? "auto" : "none",
            },
          ]}
        >
          <View style={styles.mediaToolbarContent}>
            <Pressable style={styles.mediaOption} onPress={pickFromCamera}>
              <View
                style={[
                  styles.mediaIconWrapper,
                  { backgroundColor: "#10B981" },
                ]}
              >
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
              <Text style={[styles.mediaOptionText, { color: text }]}>
                Camera
              </Text>
            </Pressable>

            <Pressable style={styles.mediaOption} onPress={pickFromGallery}>
              <View
                style={[
                  styles.mediaIconWrapper,
                  { backgroundColor: "#0D9488" },
                ]}
              >
                <Ionicons name="images" size={24} color="#fff" />
              </View>
              <Text style={[styles.mediaOptionText, { color: text }]}>
                Thư viện
              </Text>
            </Pressable>

            <Pressable
              style={styles.mediaOption}
              onPress={() => {
                // Manual file picker trigger
                console.log("Document picker - to be implemented");
              }}
            >
              <View
                style={[
                  styles.mediaIconWrapper,
                  { backgroundColor: "#F59E0B" },
                ]}
              >
                <Ionicons name="document" size={24} color="#fff" />
              </View>
              <Text style={[styles.mediaOptionText, { color: text }]}>
                Tài liệu
              </Text>
            </Pressable>

            <Pressable
              style={styles.mediaOption}
              onPress={() => {
                toggleMediaToolbar(false);
                Alert.alert(
                  "Vị trí",
                  "Tính năng chia sẻ vị trí đang phát triển",
                );
              }}
            >
              <View
                style={[
                  styles.mediaIconWrapper,
                  { backgroundColor: "#EF4444" },
                ]}
              >
                <Ionicons name="location" size={24} color="#fff" />
              </View>
              <Text style={[styles.mediaOptionText, { color: text }]}>
                Vị trí
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: surface, borderTopColor: border },
          ]}
        >
          {/* Media toggle button */}
          <Pressable
            style={styles.mediaToggleBtn}
            onPress={() => toggleMediaToolbar()}
          >
            <Ionicons
              name={showMediaToolbar ? "close-circle" : "add-circle"}
              size={28}
              color={showMediaToolbar ? "#EF4444" : primary}
            />
          </Pressable>

          <MentionInput
            value={messageText}
            onChangeText={setMessageText}
            members={channelMembers}
            placeholder="Nhập tin nhắn... (@mention để tag)"
            maxLength={1000}
          />
          <EmojiButton
            onSelect={(emoji) => {
              setMessageText((prev) => prev + emoji);
            }}
          />
          <Pressable
            style={[styles.sendButton, { backgroundColor: primary }]}
            onPress={handleSendMessage}
            disabled={
              (!messageText.trim() && attachments.length === 0) || sending
            }
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerButton: {
    padding: 4,
  },
  channelTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  channelTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  channelTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  messageList: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    flexDirection: "row",
    gap: 10,
  },
  messageContainerMe: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
  },
  senderName: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: "80%",
  },
  messageBubbleMe: {
    borderWidth: 0,
    alignSelf: "flex-end",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  attachButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  // Media Toolbar Styles
  mediaToolbar: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  mediaToolbarContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  mediaOption: {
    alignItems: "center",
    gap: 8,
  },
  mediaIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mediaOptionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  mediaToggleBtn: {
    padding: 4,
  },
});
