/**
 * Modern Messages Screen - European Premium Design
 * Features: Animated transitions, Stories, Search, AI suggestions, Real-time API
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
import { useMessages } from "@/hooks/useMessages";
import { chatApi, ChatRoom } from "@/services/api/chatApi";
import type { Conversation } from "@/services/api/messagesApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// ==================== API STATUS TYPES ====================
type ApiStatus = "checking" | "online" | "offline" | "error";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ==================== TYPES ====================
interface Story {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  hasUnseenStory: boolean;
  isOnline: boolean;
}

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  route: string;
}

// ==================== MOCK DATA ====================
const MOCK_STORIES: Story[] = [
  {
    id: "1",
    userId: "me",
    userName: "Bạn",
    hasUnseenStory: false,
    isOnline: true,
  },
  {
    id: "2",
    userId: "101",
    userName: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    hasUnseenStory: true,
    isOnline: true,
  },
  {
    id: "3",
    userId: "102",
    userName: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=2",
    hasUnseenStory: true,
    isOnline: false,
  },
  {
    id: "4",
    userId: "103",
    userName: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=3",
    hasUnseenStory: false,
    isOnline: true,
  },
  {
    id: "5",
    userId: "104",
    userName: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/150?img=4",
    hasUnseenStory: true,
    isOnline: false,
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "1",
    icon: "sparkles",
    label: "AI Trợ lý",
    color: "#8B5CF6",
    route: "/messages/ai-assistant",
  },
  {
    id: "2",
    icon: "headset",
    label: "Hỗ trợ",
    color: "#10B981",
    route: "/messages/customer-service",
  },
  {
    id: "3",
    icon: "people",
    label: "Nhóm",
    color: "#0D9488",
    route: "/messages/groups",
  },
  {
    id: "4",
    icon: "megaphone",
    label: "Kênh",
    color: "#F59E0B",
    route: "/messages/channels",
  },
];

// ==================== API STATUS COMPONENT ====================
const ApiStatusBanner = React.memo(
  ({ status, onRetry }: { status: ApiStatus; onRetry: () => void }) => {
    if (status === "online") return null;

    const statusConfig = {
      checking: {
        color: "#F59E0B",
        icon: "sync",
        text: "Đang kiểm tra kết nối...",
      },
      offline: {
        color: "#EF4444",
        icon: "cloud-offline",
        text: "Đang sử dụng dữ liệu ngoại tuyến",
      },
      error: {
        color: "#EF4444",
        icon: "alert-circle",
        text: "Không thể kết nối đến server",
      },
    };

    const config = statusConfig[status] || statusConfig.error;

    return (
      <View
        style={[
          apiStatusStyles.banner,
          { backgroundColor: `${config.color}15` },
        ]}
      >
        <Ionicons name={config.icon as any} size={16} color={config.color} />
        <Text style={[apiStatusStyles.text, { color: config.color }]}>
          {config.text}
        </Text>
        {status !== "checking" && (
          <TouchableOpacity
            onPress={onRetry}
            style={apiStatusStyles.retryButton}
          >
            <Text style={[apiStatusStyles.retryText, { color: config.color }]}>
              Thử lại
            </Text>
          </TouchableOpacity>
        )}
        {status === "checking" && (
          <ActivityIndicator
            size="small"
            color={config.color}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    );
  },
);

const apiStatusStyles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
  },
  text: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
    fontSize: 12,
    fontWeight: "500",
  },
  retryButton: {
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

// ==================== COMPONENTS ====================

// Story Item Component
const StoryItem = React.memo(
  ({ story, onPress }: { story: Story; onPress: () => void }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const isMyStory = story.userId === "me";

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[styles.storyItem, { transform: [{ scale: scaleAnim }] }]}
        >
          <View
            style={[
              styles.storyAvatarContainer,
              story.hasUnseenStory && styles.storyAvatarUnseen,
            ]}
          >
            {isMyStory ? (
              <View style={styles.addStoryContainer}>
                <LinearGradient
                  colors={["#667EEA", "#764BA2"]}
                  style={styles.addStoryGradient}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </LinearGradient>
              </View>
            ) : story.avatar ? (
              <Image
                source={{ uri: story.avatar }}
                style={styles.storyAvatar}
              />
            ) : (
              <View style={[styles.storyAvatar, styles.storyAvatarPlaceholder]}>
                <Text style={styles.storyAvatarText}>
                  {story.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {story.isOnline && !isMyStory && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
          <Text style={styles.storyName} numberOfLines={1}>
            {isMyStory ? "Tin của bạn" : story.userName.split(" ").pop()}
          </Text>
        </Animated.View>
      </Pressable>
    );
  },
);

// Quick Action Card
const QuickActionCard = React.memo(
  ({ action, onPress }: { action: QuickAction; onPress: () => void }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.quickActionIcon,
          { backgroundColor: `${action.color}15` },
        ]}
      >
        <Ionicons name={action.icon as any} size={22} color={action.color} />
      </View>
      <Text style={styles.quickActionLabel}>{action.label}</Text>
    </TouchableOpacity>
  ),
);

// Conversation Item with animations
const ConversationItem = React.memo(
  ({
    item,
    index,
    onPress,
  }: {
    item: Conversation;
    index: number;
    onPress: () => void;
  }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handlePressIn = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const otherParticipant = item.participants[0];
    const lastMsg = item.lastMessage;
    const hasUnread = item.unreadCount > 0;

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins}p`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    };

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.conversationItem,
            hasUnread && styles.conversationItemUnread,
            {
              transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Avatar
              avatar={null}
              userId={String(otherParticipant.id)}
              name={otherParticipant.name}
              pixelSize={56}
              showBadge={false}
            />
            {/* Online indicator */}
            <View style={styles.onlineDot} />
          </View>

          {/* Content */}
          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <Text
                style={[styles.userName, hasUnread && styles.userNameUnread]}
                numberOfLines={1}
              >
                {otherParticipant.name}
              </Text>
              {lastMsg && (
                <Text
                  style={[styles.timeText, hasUnread && styles.timeTextUnread]}
                >
                  {formatTime(lastMsg.createdAt)}
                </Text>
              )}
            </View>

            <View style={styles.conversationFooter}>
              <View style={styles.messagePreview}>
                {lastMsg?.type === "image" && (
                  <Ionicons
                    name="image"
                    size={14}
                    color={MODERN_COLORS.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                )}
                {lastMsg?.type === "voice" && (
                  <Ionicons
                    name="mic"
                    size={14}
                    color={MODERN_COLORS.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.messageText,
                    hasUnread && styles.messageTextUnread,
                  ]}
                  numberOfLines={1}
                >
                  {lastMsg?.content || "Bắt đầu cuộc trò chuyện"}
                </Text>
              </View>

              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {item.unreadCount > 99 ? "99+" : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action indicator */}
          <Ionicons
            name="chevron-forward"
            size={18}
            color={MODERN_COLORS.textTertiary}
          />
        </Animated.View>
      </Pressable>
    );
  },
);

// ==================== MAIN COMPONENT ====================
export default function ModernMessagesScreen() {
  const { conversations, loading, error, unreadCount, refreshConversations } =
    useMessages();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  // Check API connection on mount
  const checkApiConnection = useCallback(async () => {
    setApiStatus("checking");
    try {
      console.log("[ModernMessages] Checking Chat API connection...");
      const rooms = await chatApi.getRooms();
      console.log(
        "[ModernMessages] Chat API response:",
        rooms?.length || 0,
        "rooms",
      );
      setChatRooms(rooms || []);
      setApiStatus("online");
    } catch (err) {
      console.error("[ModernMessages] Chat API error:", err);
      setApiStatus("offline");
    }
  }, []);

  useEffect(() => {
    checkApiConnection();
  }, [checkApiConnection]);

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 60],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    return conversations.filter((conv) =>
      conv.participants.some((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [conversations, searchQuery]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([refreshConversations(), checkApiConnection()]);
    setRefreshing(false);
  }, [refreshConversations, checkApiConnection]);

  const handleConversationPress = useCallback((conversation: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const otherParticipant = conversation.participants[0];
    router.push(`/messages/${otherParticipant.id}`);
  }, []);

  const handleStoryPress = useCallback((story: Story) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (story.userId === "me") {
      // Open camera to add story
    } else {
      // View story
    }
  }, []);

  const handleQuickAction = useCallback((action: QuickAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(action.route as any);
  }, []);

  const handleNewMessage = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/messages/new-conversation");
  }, []);

  // Render header
  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* API Status Banner */}
      <ApiStatusBanner status={apiStatus} onRetry={checkApiConnection} />

      {/* Stories */}
      <View style={styles.storiesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContent}
        >
          {MOCK_STORIES.map((story) => (
            <StoryItem
              key={story.id}
              story={story}
              onPress={() => handleStoryPress(story)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContent}
        >
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard
              key={action.id}
              action={action}
              onPress={() => handleQuickAction(action)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Section title */}
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleLeft}>
          <Text style={styles.sectionTitle}>Tin nhắn</Text>
          {apiStatus === "online" && (
            <View style={styles.onlineIndicatorSmall}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={18} color={MODERN_COLORS.primary} />
          <Text style={styles.filterText}>Lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Rooms from API (if available) */}
      {chatRooms.length > 0 && (
        <View style={styles.chatRoomsInfo}>
          <Ionicons
            name="chatbubbles"
            size={14}
            color={MODERN_COLORS.primary}
          />
          <Text style={styles.chatRoomsText}>
            {chatRooms.length} phòng chat từ server
          </Text>
        </View>
      )}
    </View>
  );

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={["#667EEA20", "#764BA220"]}
          style={styles.emptyIconContainer}
        >
          <Ionicons name="chatbubbles-outline" size={48} color="#667EEA" />
        </LinearGradient>
        <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
        <Text style={styles.emptySubtitle}>
          {apiStatus === "online"
            ? "Bắt đầu cuộc trò chuyện với bạn bè, đồng nghiệp hoặc AI trợ lý"
            : "Đang sử dụng dữ liệu ngoại tuyến. Kết nối internet để đồng bộ tin nhắn."}
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleNewMessage}>
          <Text style={styles.emptyButtonText}>Bắt đầu trò chuyện</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={80} style={StyleSheet.absoluteFill} />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: MODERN_COLORS.surface },
            ]}
          />
        )}

        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
          </TouchableOpacity>

          <Animated.Text
            style={[styles.headerTitle, { opacity: headerOpacity }]}
          >
            Tin nhắn {unreadCount > 0 && `(${unreadCount})`}
          </Animated.Text>

          <TouchableOpacity
            onPress={handleNewMessage}
            style={styles.headerButton}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color={MODERN_COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchContainer,
            isSearchFocused && styles.searchContainerFocused,
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={MODERN_COLORS.textSecondary}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Tìm kiếm tin nhắn..."
            placeholderTextColor={MODERN_COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={MODERN_COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      <Animated.FlatList
        data={filteredConversations}
        renderItem={({ item, index }) => (
          <ConversationItem
            item={item}
            index={index}
            onPress={() => handleConversationPress(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[MODERN_COLORS.primary]}
            tintColor={MODERN_COLORS.primary}
            progressViewOffset={60}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewMessage}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          style={styles.fabGradient}
        >
          <MaterialCommunityIcons name="message-plus" size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: MODERN_SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  // Search
  searchWrapper: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: Platform.OS === "ios" ? 110 : 100,
    paddingBottom: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  searchContainerFocused: {
    borderColor: MODERN_COLORS.primary,
    ...MODERN_SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },

  // List
  listContent: {
    paddingBottom: 100,
  },
  listHeader: {
    paddingTop: MODERN_SPACING.sm,
  },

  // Stories
  storiesSection: {
    marginBottom: MODERN_SPACING.md,
  },
  storiesContent: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.md,
  },
  storyItem: {
    alignItems: "center",
    width: 72,
  },
  storyAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    backgroundColor: MODERN_COLORS.divider,
  },
  storyAvatarUnseen: {
    padding: 3,
    borderWidth: 2,
    borderColor: "#667EEA",
    backgroundColor: "transparent",
  },
  storyAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  storyAvatarPlaceholder: {
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  addStoryContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    overflow: "hidden",
  },
  addStoryGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },
  storyName: {
    marginTop: 6,
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: MODERN_SPACING.lg,
  },
  quickActionsContent: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  quickActionCard: {
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    minWidth: 80,
    ...MODERN_SHADOWS.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: MODERN_COLORS.text,
  },

  // Section title
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  sectionTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineIndicatorSmall: {
    marginLeft: 4,
  },
  chatRoomsInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    marginBottom: MODERN_SPACING.sm,
    gap: 6,
  },
  chatRoomsText: {
    fontSize: 12,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },

  // Conversation item
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.sm,
    marginVertical: 4,
    borderRadius: MODERN_RADIUS.lg,
  },
  conversationItemUnread: {
    backgroundColor: "#667EEA08",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: MODERN_SPACING.md,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "500",
    color: MODERN_COLORS.text,
    flex: 1,
    marginRight: MODERN_SPACING.sm,
  },
  userNameUnread: {
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    color: MODERN_COLORS.textTertiary,
  },
  timeTextUnread: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
  conversationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: MODERN_SPACING.sm,
  },
  messageText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    flex: 1,
  },
  messageTextUnread: {
    color: MODERN_COLORS.text,
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: MODERN_SPACING.lg,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },
  emptySubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: MODERN_SPACING.lg,
  },
  emptyButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.full,
  },
  emptyButtonText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: "#fff",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    ...MODERN_SHADOWS.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
