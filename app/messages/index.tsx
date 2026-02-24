/**
 * Messages List Screen - Modernized with Nordic Green Theme
 * Shopee/Grab style conversation list
 * Updated: 03/02/2026
 */

import { MessagesListHeader } from "@/components/navigation/ChatHeader";
import Avatar from "@/components/ui/avatar";
import { ContactSection } from "@/components/ui/contact-section";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { useMessages } from "@/hooks/useMessages";
import type { Conversation } from "@/services/api/messagesApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MessagesScreen() {
  const {
    conversations: apiConversations,
    loading,
    error,
    unreadCount: apiUnreadCount,
    refreshConversations,
    markConversationAsRead,
  } = useMessages();

  const conversations = useMemo(() => apiConversations, [apiConversations]);

  const unreadCount = useMemo(() => {
    if (apiUnreadCount > 0) return apiUnreadCount;
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [apiUnreadCount, conversations]);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshConversations();
    setRefreshing(false);
  };

  const handleConversationPress = async (conversation: Conversation) => {
    // Mark conversation as read when opening
    if (conversation.unreadCount > 0) {
      markConversationAsRead(conversation.id);
    }

    // Navigate to chat with the other participant
    const otherParticipant = conversation.participants[0];
    router.push(`/messages/${otherParticipant.id}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const truncateMessage = (content: string, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants[0];
    const lastMsg = item.lastMessage;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            avatar={null}
            userId={String(otherParticipant.id)}
            name={otherParticipant.name}
            pixelSize={56}
            showBadge={false}
          />
        </View>

        {/* Message content */}
        <View style={styles.messageContent}>
          <View style={styles.headerRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {otherParticipant.name}
            </Text>
            {lastMsg && (
              <Text style={styles.timeText}>
                {formatTime(lastMsg.createdAt)}
              </Text>
            )}
          </View>

          <View style={styles.messageRow}>
            <View style={{ flex: 1 }}>
              {lastMsg ? (
                <Text
                  style={[
                    styles.messageText,
                    item.unreadCount > 0 && styles.unreadText,
                  ]}
                  numberOfLines={1}
                >
                  {truncateMessage(lastMsg.content)}
                </Text>
              ) : (
                <Text style={styles.messageText}>Chưa có tin nhắn</Text>
              )}
            </View>

            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#000000" />
          <Text style={styles.emptyTitle}>Lỗi tải dữ liệu</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.welcomeSection}>
          <Ionicons
            name="chatbubbles"
            size={56}
            color={MODERN_COLORS.primary}
          />
          <Text style={styles.welcomeTitle}>
            Chào mừng bạn đến với Tin nhắn!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Bắt đầu trò chuyện với AI trợ lý hoặc nhân viên hỗ trợ của chúng tôi
          </Text>
        </View>

        {/* Suggested conversations */}
        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedTitle}>Bắt đầu trò chuyện</Text>

          {/* AI Assistant suggestion */}
          <TouchableOpacity
            style={styles.suggestedItem}
            onPress={() => router.push("/messages/ai-assistant")}
            activeOpacity={0.7}
          >
            <View
              style={[styles.suggestedAvatar, { backgroundColor: "#666666" }]}
            >
              <Ionicons name="sparkles" size={28} color="#fff" />
            </View>
            <View style={styles.suggestedContent}>
              <Text style={styles.suggestedName}>AI Trợ lý Xây dựng</Text>
              <Text style={styles.suggestedMessage}>
                Xin chào! Tôi có thể giúp bạn về tư vấn xây dựng, báo giá, và
                theo dõi tiến độ 24/7
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={MODERN_COLORS.textTertiary}
            />
          </TouchableOpacity>

          {/* Customer Service suggestion */}
          <TouchableOpacity
            style={styles.suggestedItem}
            onPress={() => router.push("/messages/customer-service")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.suggestedAvatar,
                { backgroundColor: MODERN_COLORS.primary },
              ]}
            >
              <Ionicons name="headset" size={28} color="#fff" />
            </View>
            <View style={styles.suggestedContent}>
              <Text style={styles.suggestedName}>Nhân viên CSKH</Text>
              <Text style={styles.suggestedMessage}>
                Chúng tôi luôn sẵn sàng hỗ trợ bạn về dịch vụ, giải đáp thắc mắc
                và xử lý yêu cầu
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={MODERN_COLORS.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Contact Section - Nhà Xinh Style */}
        <ContactSection
          title="Cần hỗ trợ thêm?"
          subtitle="Liên hệ trực tiếp với chúng tôi qua các kênh sau"
          variant="premium"
          style={styles.contactSection}
          methods={[
            {
              type: "phone",
              label: "Hotline 24/7",
              value: "1900 6789",
              subtitle: "Miễn phí gọi trong nước",
            },
            {
              type: "email",
              label: "Email hỗ trợ",
              value: "support@baotienweb.cloud",
              subtitle: "Phản hồi trong 2 giờ",
            },
            {
              type: "location",
              label: "Showroom",
              value: "123 Nguyễn Huệ, Q.1, TP.HCM",
              subtitle: "Thứ 2 - CN: 8h00 - 20h00",
            },
          ]}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0D9488"
        translucent
      />
      <View style={styles.container}>
        {/* Messages List Header - Zalo style */}
        <MessagesListHeader
          title="Tin nhắn"
          unreadCount={unreadCount}
          onNewConversation={() => router.push("/messages/new-conversation")}
          onSearchPress={() => router.push("/messages/new-conversation")}
        />

        {/* Search bar - clickable to search */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => router.push("/messages/new-conversation")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="search"
            size={20}
            color={MODERN_COLORS.textSecondary}
          />
          <Text style={styles.searchPlaceholder}>
            Tìm kiếm người dùng, số điện thoại, email...
          </Text>
        </TouchableOpacity>

        {/* Conversations list */}
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[MODERN_COLORS.primary]}
              tintColor={MODERN_COLORS.primary}
            />
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyList : undefined
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.full,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    marginHorizontal: MODERN_SPACING.md,
    marginVertical: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  searchPlaceholder: {
    marginLeft: MODERN_SPACING.sm,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
  },
  conversationItem: {
    flexDirection: "row",
    padding: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  avatarContainer: {
    position: "relative",
    marginRight: MODERN_SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: MODERN_RADIUS.full,
  },
  avatarPlaceholder: {
    backgroundColor: MODERN_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.primary,
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },
  messageContent: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.xxs,
  },
  userName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    flex: 1,
    marginRight: MODERN_SPACING.sm,
  },
  timeText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  unreadText: {
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  unreadBadge: {
    backgroundColor: MODERN_COLORS.error,
    borderRadius: MODERN_RADIUS.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: MODERN_SPACING.xs,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: MODERN_SPACING.sm,
  },
  unreadBadgeText: {
    color: MODERN_COLORS.surface,
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
  },
  loadingFooter: {
    paddingVertical: MODERN_SPACING.lg,
    alignItems: "center",
  },
  loadingText: {
    marginTop: MODERN_SPACING.sm,
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.xl,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: MODERN_SPACING.xl,
  },
  welcomeTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.sm,
    textAlign: "center",
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.relaxed,
  },
  suggestedSection: {
    width: "100%",
    marginTop: MODERN_SPACING.md,
  },
  suggestedTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  suggestedAvatar: {
    width: 48,
    height: 48,
    borderRadius: MODERN_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: MODERN_SPACING.md,
  },
  suggestedContent: {
    flex: 1,
    marginRight: MODERN_SPACING.sm,
  },
  suggestedName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xxs,
  },
  suggestedMessage: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.normal,
  },
  contactSection: {
    width: "100%",
    marginTop: MODERN_SPACING.xl,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.md,
  },
  emptySubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.sm,
    textAlign: "center",
  },
  retryButton: {
    marginTop: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: MODERN_RADIUS.md,
  },
  retryText: {
    color: MODERN_COLORS.surface,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    textAlign: "center",
  },
});
