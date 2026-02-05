/**
 * Group Chat Screen - Advanced Group Messaging
 * Features: Group management, Mentions, Reactions, Polls, Voice messages
 * Updated: 24/01/2026
 */

import Avatar from "@/components/ui/avatar";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { AudioRecorder } from "@/utils/audioWrapper";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ==================== TYPES ====================
interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: "admin" | "moderator" | "member";
  isOnline: boolean;
  lastSeen?: string;
}

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image" | "video" | "file" | "voice" | "poll" | "system";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  voiceDuration?: number;
  poll?: PollData;
  mentions?: string[];
  reactions?: MessageReaction[];
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  createdAt: string;
  status: "sending" | "sent" | "delivered" | "read";
  readBy?: string[];
}

interface PollData {
  question: string;
  options: PollOption[];
  totalVotes: number;
  isMultiChoice: boolean;
  endTime?: string;
  myVotes?: string[];
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  voters: string[];
}

interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

interface GroupInfo {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: GroupMember[];
  createdAt: string;
  createdBy: string;
  settings: GroupSettings;
}

interface GroupSettings {
  allowMemberInvite: boolean;
  muteNotifications: boolean;
  adminOnly: boolean;
  disappearingMessages?: number;
}

// ==================== MOCK DATA ====================
const MOCK_GROUP: GroupInfo = {
  id: "group-1",
  name: "Dự án Resort Đà Nẵng",
  avatar: undefined,
  description: "Nhóm thảo luận dự án thiết kế Resort 5 sao tại Đà Nẵng",
  members: [
    { id: "1", name: "Nguyễn Văn Admin", role: "admin", isOnline: true },
    { id: "2", name: "Trần Thị Mod", role: "moderator", isOnline: true },
    {
      id: "3",
      name: "Lê Văn Dev",
      role: "member",
      isOnline: false,
      lastSeen: "2026-01-24T10:30:00Z",
    },
    { id: "4", name: "Phạm Minh Design", role: "member", isOnline: true },
    {
      id: "5",
      name: "Hoàng Thị PM",
      role: "member",
      isOnline: false,
      lastSeen: "2026-01-24T09:15:00Z",
    },
  ],
  createdAt: "2025-12-01T08:00:00Z",
  createdBy: "1",
  settings: {
    allowMemberInvite: true,
    muteNotifications: false,
    adminOnly: false,
  },
};

const MOCK_MESSAGES: GroupMessage[] = [
  {
    id: "1",
    senderId: "1",
    senderName: "Nguyễn Văn Admin",
    content: "Chào mọi người! Hôm nay chúng ta sẽ họp về tiến độ dự án.",
    type: "text",
    createdAt: "2026-01-24T08:00:00Z",
    status: "read",
    readBy: ["2", "3", "4", "5"],
  },
  {
    id: "2",
    senderId: "2",
    senderName: "Trần Thị Mod",
    content: "Đã nhận! @Phạm Minh Design có thể chuẩn bị bản vẽ mới không?",
    type: "text",
    mentions: ["4"],
    createdAt: "2026-01-24T08:05:00Z",
    status: "read",
    readBy: ["1", "3", "4", "5"],
  },
  {
    id: "3",
    senderId: "4",
    senderName: "Phạm Minh Design",
    content: "",
    type: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    createdAt: "2026-01-24T08:10:00Z",
    status: "read",
    readBy: ["1", "2", "3", "5"],
  },
  {
    id: "4",
    senderId: "4",
    senderName: "Phạm Minh Design",
    content: "Đây là bản render mới nhất của khu vực lobby",
    type: "text",
    createdAt: "2026-01-24T08:11:00Z",
    status: "read",
    reactions: [
      { emoji: "👍", userId: "1", userName: "Admin" },
      { emoji: "❤️", userId: "2", userName: "Mod" },
      { emoji: "🔥", userId: "3", userName: "Dev" },
    ],
    readBy: ["1", "2", "3", "5"],
  },
  {
    id: "5",
    senderId: "1",
    senderName: "Nguyễn Văn Admin",
    content: "",
    type: "poll",
    poll: {
      question: "Chọn phương án thiết kế lobby?",
      options: [
        {
          id: "a",
          text: "Phương án A - Minimalist",
          votes: 3,
          percentage: 60,
          voters: ["1", "2", "4"],
        },
        {
          id: "b",
          text: "Phương án B - Tropical",
          votes: 2,
          percentage: 40,
          voters: ["3", "5"],
        },
      ],
      totalVotes: 5,
      isMultiChoice: false,
      myVotes: ["a"],
    },
    createdAt: "2026-01-24T08:20:00Z",
    status: "read",
    readBy: ["2", "3", "4", "5"],
  },
  {
    id: "6",
    senderId: "3",
    senderName: "Lê Văn Dev",
    content: "",
    type: "voice",
    voiceDuration: 15,
    createdAt: "2026-01-24T08:25:00Z",
    status: "read",
    readBy: ["1", "2", "4", "5"],
  },
];

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

// ==================== COMPONENTS ====================

// Message Bubble Component
const MessageBubble = React.memo(
  ({
    message,
    isMe,
    showSender,
    onReaction,
    onReply,
    onLongPress,
  }: {
    message: GroupMessage;
    isMe: boolean;
    showSender: boolean;
    onReaction: (emoji: string) => void;
    onReply: () => void;
    onLongPress: () => void;
  }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, []);

    const handleLongPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowReactionPicker(true);
      onLongPress();
    };

    const handleReaction = (emoji: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowReactionPicker(false);
      onReaction(emoji);
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // System message
    if (message.type === "system") {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{message.content}</Text>
        </View>
      );
    }

    // Poll message
    if (message.type === "poll" && message.poll) {
      return (
        <Animated.View
          style={[styles.pollContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          {showSender && !isMe && (
            <Text style={styles.senderName}>{message.senderName}</Text>
          )}
          <View style={styles.pollCard}>
            <View style={styles.pollHeader}>
              <Ionicons
                name="bar-chart"
                size={20}
                color={MODERN_COLORS.primary}
              />
              <Text style={styles.pollQuestion}>{message.poll.question}</Text>
            </View>
            {message.poll.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.pollOption,
                  message.poll?.myVotes?.includes(option.id) &&
                    styles.pollOptionSelected,
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.pollProgress,
                    { width: `${option.percentage}%` },
                  ]}
                />
                <View style={styles.pollOptionContent}>
                  <Text style={styles.pollOptionText}>{option.text}</Text>
                  <Text style={styles.pollOptionVotes}>
                    {option.votes} phiếu
                  </Text>
                </View>
                {message.poll?.myVotes?.includes(option.id) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={MODERN_COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
            <Text style={styles.pollTotalVotes}>
              Tổng: {message.poll.totalVotes} phiếu bầu
            </Text>
          </View>
          <Text style={styles.messageTime}>
            {formatTime(message.createdAt)}
          </Text>
        </Animated.View>
      );
    }

    // Voice message
    if (message.type === "voice") {
      return (
        <Animated.View
          style={[
            styles.messageRow,
            isMe && styles.messageRowMe,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {!isMe && (
            <Avatar
              avatar={message.senderAvatar || null}
              userId={message.senderId}
              name={message.senderName}
              pixelSize={32}
              showBadge={false}
            />
          )}
          <Pressable onLongPress={handleLongPress}>
            <View style={[styles.voiceBubble, isMe && styles.voiceBubbleMe]}>
              {showSender && !isMe && (
                <Text style={styles.senderName}>{message.senderName}</Text>
              )}
              <View style={styles.voiceContent}>
                <TouchableOpacity style={styles.voicePlayButton}>
                  <Ionicons name="play" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.voiceWaveform}>
                  {[...Array(15)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.voiceBar,
                        { height: Math.random() * 20 + 8 },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.voiceDuration}>
                  {Math.floor((message.voiceDuration || 0) / 60)}:
                  {String((message.voiceDuration || 0) % 60).padStart(2, "0")}
                </Text>
              </View>
              <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
                {formatTime(message.createdAt)}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      );
    }

    // Image message
    if (message.type === "image") {
      return (
        <Animated.View
          style={[
            styles.messageRow,
            isMe && styles.messageRowMe,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {!isMe && (
            <Avatar
              avatar={message.senderAvatar || null}
              userId={message.senderId}
              name={message.senderName}
              pixelSize={32}
              showBadge={false}
            />
          )}
          <Pressable onLongPress={handleLongPress}>
            <View style={[styles.imageBubble, isMe && styles.imageBubbleMe]}>
              {showSender && !isMe && (
                <Text style={styles.senderName}>{message.senderName}</Text>
              )}
              <Image
                source={{ uri: message.mediaUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              <Text style={[styles.messageTime, styles.imageTime]}>
                {formatTime(message.createdAt)}
              </Text>
            </View>
          </Pressable>
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <View style={styles.reactionsContainer}>
              {message.reactions.slice(0, 3).map((reaction, index) => (
                <Text key={index} style={styles.reactionEmoji}>
                  {reaction.emoji}
                </Text>
              ))}
              {message.reactions.length > 3 && (
                <Text style={styles.reactionCount}>
                  +{message.reactions.length - 3}
                </Text>
              )}
            </View>
          )}
        </Animated.View>
      );
    }

    // Text message
    return (
      <Animated.View
        style={[
          styles.messageRow,
          isMe && styles.messageRowMe,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {!isMe && (
          <Avatar
            avatar={message.senderAvatar || null}
            userId={message.senderId}
            name={message.senderName}
            pixelSize={32}
            showBadge={false}
          />
        )}
        <Pressable onLongPress={handleLongPress}>
          <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
            {showSender && !isMe && (
              <Text style={styles.senderName}>{message.senderName}</Text>
            )}
            {message.replyTo && (
              <View style={styles.replyPreview}>
                <Text style={styles.replyName}>
                  {message.replyTo.senderName}
                </Text>
                <Text style={styles.replyContent} numberOfLines={1}>
                  {message.replyTo.content}
                </Text>
              </View>
            )}
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {message.content}
            </Text>
            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
                {formatTime(message.createdAt)}
              </Text>
              {isMe && (
                <Ionicons
                  name={
                    message.status === "read" ? "checkmark-done" : "checkmark"
                  }
                  size={14}
                  color={
                    message.status === "read"
                      ? "#10B981"
                      : MODERN_COLORS.textTertiary
                  }
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </Pressable>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <View
            style={[
              styles.reactionsContainer,
              isMe && styles.reactionsContainerMe,
            ]}
          >
            {message.reactions.slice(0, 3).map((reaction, index) => (
              <Text key={index} style={styles.reactionEmoji}>
                {reaction.emoji}
              </Text>
            ))}
            {message.reactions.length > 3 && (
              <Text style={styles.reactionCount}>
                +{message.reactions.length - 3}
              </Text>
            )}
          </View>
        )}

        {/* Reaction Picker */}
        {showReactionPicker && (
          <View
            style={[styles.reactionPicker, isMe && styles.reactionPickerMe]}
          >
            {EMOJI_REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleReaction(emoji)}
                style={styles.reactionPickerItem}
              >
                <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
    );
  },
);

// Member Badge Component
const MemberBadge = React.memo(({ member }: { member: GroupMember }) => (
  <View style={styles.memberBadge}>
    <Avatar
      avatar={member.avatar || null}
      userId={member.id}
      name={member.name}
      pixelSize={28}
      showBadge={false}
    />
    {member.isOnline && <View style={styles.memberOnlineDot} />}
  </View>
));

// ==================== MAIN COMPONENT ====================
export default function GroupChatScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const [group] = useState<GroupInfo>(MOCK_GROUP);
  const [messages, setMessages] = useState<GroupMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<GroupMessage | null>(
    null,
  );

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const recordingRef = useRef<AudioRecorder | null>(null);

  const myUserId = "1"; // Current user ID

  // Handle text input changes for mentions
  const handleTextChange = (text: string) => {
    setInputText(text);

    // Check for @ mentions
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex !== -1 && lastAtIndex === text.length - 1) {
      setShowMentions(true);
      setMentionQuery("");
    } else if (lastAtIndex !== -1) {
      const queryStart = lastAtIndex + 1;
      const query = text.slice(queryStart);
      if (!query.includes(" ")) {
        setShowMentions(true);
        setMentionQuery(query);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Filter members for mention suggestions
  const filteredMembers = useMemo(() => {
    if (!mentionQuery) return group.members;
    return group.members.filter((m) =>
      m.name.toLowerCase().includes(mentionQuery.toLowerCase()),
    );
  }, [group.members, mentionQuery]);

  // Handle mention selection
  const handleSelectMention = (member: GroupMember) => {
    const lastAtIndex = inputText.lastIndexOf("@");
    const newText = inputText.slice(0, lastAtIndex) + `@${member.name} `;
    setInputText(newText);
    setShowMentions(false);
  };

  // Send message
  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: GroupMessage = {
      id: Date.now().toString(),
      senderId: myUserId,
      senderName: "Me",
      content: inputText.trim(),
      type: "text",
      mentions: [],
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            content: replyingTo.content,
          }
        : undefined,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setReplyingTo(null);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, replyingTo, myUserId]);

  // Handle voice recording
  const startRecording = async () => {
    try {
      if (!recordingRef.current) {
        recordingRef.current = new AudioRecorder();
      }

      const started = await recordingRef.current.start();
      if (!started) return;

      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stop();
      const durationMillis = recordingRef.current.getDuration();

      // Create voice message
      const voiceMessage: GroupMessage = {
        id: Date.now().toString(),
        senderId: myUserId,
        senderName: "Me",
        content: "",
        type: "voice",
        voiceDuration: Math.round((durationMillis || 0) / 1000),
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, voiceMessage]);
      setIsRecording(false);
      recordingRef.current = null;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  // Handle image picker
  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageMessage: GroupMessage = {
        id: Date.now().toString(),
        senderId: myUserId,
        senderName: "Me",
        content: "",
        type: "image",
        mediaUrl: result.assets[0].uri,
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, imageMessage]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle reaction
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(
            (r) => r.userId === myUserId,
          );
          if (existingReaction) {
            // Remove existing reaction if same emoji, or update
            if (existingReaction.emoji === emoji) {
              return {
                ...msg,
                reactions: msg.reactions?.filter((r) => r.userId !== myUserId),
              };
            } else {
              return {
                ...msg,
                reactions: msg.reactions?.map((r) =>
                  r.userId === myUserId ? { ...r, emoji } : r,
                ),
              };
            }
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                { emoji, userId: myUserId, userName: "Me" },
              ],
            };
          }
        }
        return msg;
      }),
    );
  };

  // Render message item
  const renderMessage = ({
    item,
    index,
  }: {
    item: GroupMessage;
    index: number;
  }) => {
    const isMe = item.senderId === myUserId;
    const prevMessage = messages[index - 1];
    const showSender = !prevMessage || prevMessage.senderId !== item.senderId;

    return (
      <MessageBubble
        message={item}
        isMe={isMe}
        showSender={showSender}
        onReaction={(emoji) => handleReaction(item.id, emoji)}
        onReply={() => setReplyingTo(item)}
        onLongPress={() => setSelectedMessage(item)}
      />
    );
  };

  // Render header
  const renderHeader = () => (
    <TouchableOpacity
      style={styles.header}
      onPress={() => setShowGroupInfo(true)}
      activeOpacity={0.8}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <View style={styles.groupAvatarContainer}>
          {group.avatar ? (
            <Image source={{ uri: group.avatar }} style={styles.groupAvatar} />
          ) : (
            <LinearGradient
              colors={["#667EEA", "#764BA2"]}
              style={styles.groupAvatarPlaceholder}
            >
              <Ionicons name="people" size={24} color="#fff" />
            </LinearGradient>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.membersRow}>
            {group.members.slice(0, 4).map((member) => (
              <MemberBadge key={member.id} member={member} />
            ))}
            {group.members.length > 4 && (
              <View style={styles.moreMembersBadge}>
                <Text style={styles.moreMembersText}>
                  +{group.members.length - 4}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="videocam" size={22} color={MODERN_COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call" size={20} color={MODERN_COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={MODERN_COLORS.text}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      {renderHeader()}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Reply Preview */}
      {replyingTo && (
        <View style={styles.replyBar}>
          <View style={styles.replyBarContent}>
            <Ionicons
              name="arrow-undo"
              size={16}
              color={MODERN_COLORS.primary}
            />
            <View style={styles.replyBarText}>
              <Text style={styles.replyBarName}>{replyingTo.senderName}</Text>
              <Text style={styles.replyBarMessage} numberOfLines={1}>
                {replyingTo.content || "Media"}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons
              name="close"
              size={20}
              color={MODERN_COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Mention Suggestions */}
      {showMentions && (
        <View style={styles.mentionsContainer}>
          <ScrollView
            style={styles.mentionsList}
            keyboardShouldPersistTaps="always"
          >
            {filteredMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.mentionItem}
                onPress={() => handleSelectMention(member)}
              >
                <Avatar
                  avatar={member.avatar || null}
                  userId={member.id}
                  name={member.name}
                  pixelSize={32}
                  showBadge={false}
                />
                <Text style={styles.mentionName}>{member.name}</Text>
                {member.isOnline && <View style={styles.mentionOnline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.inputAction}
              onPress={handleImagePicker}
            >
              <Ionicons
                name="image"
                size={24}
                color={MODERN_COLORS.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor={MODERN_COLORS.textTertiary}
                value={inputText}
                onChangeText={handleTextChange}
                multiline
                maxLength={2000}
              />
              <TouchableOpacity onPress={() => setShowCreatePoll(true)}>
                <Ionicons
                  name="bar-chart"
                  size={20}
                  color={MODERN_COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {inputText.trim() ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <LinearGradient
                  colors={["#667EEA", "#764BA2"]}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isRecording && styles.micButtonRecording,
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              >
                <Ionicons
                  name={isRecording ? "radio-button-on" : "mic"}
                  size={24}
                  color={isRecording ? "#EF4444" : MODERN_COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Group Info Modal */}
      <Modal
        visible={showGroupInfo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGroupInfo(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGroupInfo(false)}>
              <Ionicons name="close" size={24} color={MODERN_COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Thông tin nhóm</Text>
            <TouchableOpacity>
              <Ionicons
                name="settings-outline"
                size={24}
                color={MODERN_COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Group Avatar & Name */}
            <View style={styles.groupInfoHeader}>
              <View style={styles.largeGroupAvatar}>
                <LinearGradient
                  colors={["#667EEA", "#764BA2"]}
                  style={styles.largeGroupAvatarGradient}
                >
                  <Ionicons name="people" size={40} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.largeGroupName}>{group.name}</Text>
              <Text style={styles.groupDescription}>{group.description}</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.groupActions}>
              <TouchableOpacity style={styles.groupActionItem}>
                <View
                  style={[
                    styles.groupActionIcon,
                    { backgroundColor: "#3B82F615" },
                  ]}
                >
                  <Ionicons name="notifications" size={22} color="#3B82F6" />
                </View>
                <Text style={styles.groupActionLabel}>Thông báo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupActionItem}>
                <View
                  style={[
                    styles.groupActionIcon,
                    { backgroundColor: "#10B98115" },
                  ]}
                >
                  <Ionicons name="search" size={22} color="#10B981" />
                </View>
                <Text style={styles.groupActionLabel}>Tìm kiếm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupActionItem}>
                <View
                  style={[
                    styles.groupActionIcon,
                    { backgroundColor: "#F59E0B15" },
                  ]}
                >
                  <Ionicons name="images" size={22} color="#F59E0B" />
                </View>
                <Text style={styles.groupActionLabel}>Media</Text>
              </TouchableOpacity>
            </View>

            {/* Members Section */}
            <View style={styles.membersSection}>
              <View style={styles.membersSectionHeader}>
                <Text style={styles.membersSectionTitle}>
                  Thành viên ({group.members.length})
                </Text>
                <TouchableOpacity>
                  <Text style={styles.addMemberText}>+ Thêm</Text>
                </TouchableOpacity>
              </View>

              {group.members.map((member) => (
                <TouchableOpacity key={member.id} style={styles.memberRow}>
                  <Avatar
                    avatar={member.avatar || null}
                    userId={member.id}
                    name={member.name}
                    pixelSize={44}
                    showBadge={false}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>
                      {member.role === "admin"
                        ? "Quản trị viên"
                        : member.role === "moderator"
                          ? "Điều hành viên"
                          : "Thành viên"}
                    </Text>
                  </View>
                  {member.isOnline ? (
                    <View style={styles.memberOnlineIndicator}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.onlineText}>Online</Text>
                    </View>
                  ) : (
                    <Text style={styles.lastSeenText}>
                      {member.lastSeen ? "Vừa hoạt động" : "Offline"}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  groupAvatarContainer: {
    marginRight: MODERN_SPACING.sm,
  },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  groupAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  groupName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginBottom: 2,
  },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberBadge: {
    position: "relative",
    marginRight: -8,
  },
  memberOnlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },
  moreMembersBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MODERN_COLORS.divider,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  moreMembersText: {
    fontSize: 10,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.xs,
  },
  headerAction: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  // Messages
  messagesList: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
  },
  messageRowMe: {
    flexDirection: "row-reverse",
  },
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.75,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    borderBottomLeftRadius: 4,
    padding: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  messageBubbleMe: {
    backgroundColor: MODERN_COLORS.primary,
    borderBottomLeftRadius: MODERN_RADIUS.lg,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
    marginBottom: 4,
  },
  replyPreview: {
    backgroundColor: `${MODERN_COLORS.primary}15`,
    borderLeftWidth: 3,
    borderLeftColor: MODERN_COLORS.primary,
    borderRadius: 4,
    padding: MODERN_SPACING.xs,
    marginBottom: MODERN_SPACING.xs,
  },
  replyName: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  replyContent: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  messageText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
    lineHeight: 20,
  },
  messageTextMe: {
    color: "#fff",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: MODERN_COLORS.textTertiary,
  },
  messageTimeMe: {
    color: "rgba(255,255,255,0.7)",
  },

  // Image Message
  imageBubble: {
    maxWidth: SCREEN_WIDTH * 0.65,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  imageBubbleMe: {
    alignSelf: "flex-end",
  },
  messageImage: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: MODERN_RADIUS.md,
  },
  imageTime: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: "#fff",
  },

  // Voice Message
  voiceBubble: {
    maxWidth: SCREEN_WIDTH * 0.65,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  voiceBubbleMe: {
    backgroundColor: MODERN_COLORS.primary,
  },
  voiceContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  voicePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 30,
  },
  voiceBar: {
    width: 3,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 1.5,
  },
  voiceDuration: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },

  // Poll
  pollContainer: {
    marginBottom: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.sm,
  },
  pollCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.md,
  },
  pollHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  pollQuestion: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  pollOption: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${MODERN_COLORS.primary}10`,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.xs,
    overflow: "hidden",
  },
  pollOptionSelected: {
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
  },
  pollProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: `${MODERN_COLORS.primary}20`,
    borderRadius: MODERN_RADIUS.md,
  },
  pollOptionContent: {
    flex: 1,
    zIndex: 1,
  },
  pollOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.text,
  },
  pollOptionVotes: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  pollTotalVotes: {
    fontSize: 12,
    color: MODERN_COLORS.textTertiary,
    marginTop: MODERN_SPACING.sm,
    textAlign: "center",
  },

  // Reactions
  reactionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: -8,
    marginLeft: 40,
    ...MODERN_SHADOWS.sm,
  },
  reactionsContainerMe: {
    marginLeft: 0,
    marginRight: 40,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginLeft: 2,
  },
  reactionPicker: {
    position: "absolute",
    bottom: "100%",
    left: 40,
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    padding: MODERN_SPACING.xs,
    ...MODERN_SHADOWS.lg,
  },
  reactionPickerMe: {
    left: "auto",
    right: 40,
  },
  reactionPickerItem: {
    padding: 6,
  },
  reactionPickerEmoji: {
    fontSize: 20,
  },

  // System Message
  systemMessage: {
    alignItems: "center",
    marginVertical: MODERN_SPACING.sm,
  },
  systemMessageText: {
    fontSize: 12,
    color: MODERN_COLORS.textTertiary,
    backgroundColor: `${MODERN_COLORS.divider}50`,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
  },

  // Reply Bar
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.divider,
  },
  replyBarContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: MODERN_SPACING.sm,
  },
  replyBarText: {
    flex: 1,
  },
  replyBarName: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  replyBarMessage: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },

  // Mentions
  mentionsContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.divider,
    maxHeight: 200,
  },
  mentionsList: {
    paddingHorizontal: MODERN_SPACING.md,
  },
  mentionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  mentionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.text,
  },
  mentionOnline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },

  // Input
  inputContainer: {
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.divider,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: MODERN_SPACING.sm,
  },
  inputAction: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    minHeight: 44,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  micButtonRecording: {
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  modalTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  modalContent: {
    flex: 1,
  },

  // Group Info
  groupInfoHeader: {
    alignItems: "center",
    paddingVertical: MODERN_SPACING.xl,
  },
  largeGroupAvatar: {
    width: 80,
    height: 80,
    marginBottom: MODERN_SPACING.md,
  },
  largeGroupAvatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  largeGroupName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
  },
  groupDescription: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: MODERN_SPACING.xl,
  },

  // Group Actions
  groupActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  groupActionItem: {
    alignItems: "center",
  },
  groupActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  groupActionLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },

  // Members Section
  membersSection: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.lg,
  },
  membersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.md,
  },
  membersSectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  addMemberText: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.primary,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  memberInfo: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.text,
  },
  memberRole: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  memberOnlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  onlineText: {
    fontSize: 12,
    color: "#10B981",
  },
  lastSeenText: {
    fontSize: 12,
    color: MODERN_COLORS.textTertiary,
  },
});
