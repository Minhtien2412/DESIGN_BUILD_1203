/**
 * Support Chat List Component
 * ============================
 *
 * Hiển thị danh sách Support Users luôn online:
 * - CSKH Design Build
 * - Hỗ Trợ KH Design Build
 * - Tư Vấn Thiết Kế
 * - Hỗ Trợ Kỹ Thuật
 *
 * User có thể nhắn tin và admin sẽ check trả lời.
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import {
    getRecommendedSupportForQuestion,
    getSupportUsersForChatList,
    QUICK_QUESTIONS,
} from "@/data/supportUsers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================
// SUPPORT USER ITEM
// ============================================

interface SupportUserItemProps {
  user: ReturnType<typeof getSupportUsersForChatList>[0];
  onPress: () => void;
}

const SupportUserItem: React.FC<SupportUserItemProps> = ({ user, onPress }) => {
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const bgColor = useThemeColor({}, "background");

  return (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar with online indicator */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.onlineIndicator} />
      </View>

      {/* User info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.userName, { color: textColor }]}>
            {user.name}
          </Text>
          <View style={styles.supportBadge}>
            <Text style={styles.supportBadgeText}>Support</Text>
          </View>
        </View>
        <Text style={[styles.department, { color: mutedColor }]}>
          {user.department}
        </Text>
        <Text style={[styles.responseTime, { color: mutedColor }]}>
          {user.responseTime}
        </Text>
      </View>

      {/* Chat icon */}
      <View style={styles.chatIcon}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#007AFF" />
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// QUICK QUESTION BUTTON
// ============================================

interface QuickQuestionProps {
  question: (typeof QUICK_QUESTIONS)[0];
  onPress: () => void;
}

export const QuickQuestionButton: React.FC<QuickQuestionProps> = ({
  question,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.quickQuestion} onPress={onPress}>
      <Text style={styles.quickQuestionText}>{question.text}</Text>
      <Ionicons name="arrow-forward" size={16} color="#007AFF" />
    </TouchableOpacity>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

interface SupportChatListProps {
  showQuickQuestions?: boolean;
  maxItems?: number;
  onStartChat?: (userId: string, question?: string) => void;
}

export const SupportChatList: React.FC<SupportChatListProps> = ({
  showQuickQuestions = true,
  maxItems,
  onStartChat,
}) => {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const bgColor = useThemeColor({}, "background");

  // Get support users
  const supportUsers = useMemo(() => {
    const users = getSupportUsersForChatList();
    return maxItems ? users.slice(0, maxItems) : users;
  }, [maxItems]);

  // Handle start chat with support user
  const handleStartChat = useCallback(
    (user: ReturnType<typeof getSupportUsersForChatList>[0]) => {
      if (onStartChat) {
        onStartChat(user.id);
      } else {
        // Navigate to chat screen with support user
        router.push({
          pathname: "/chat/support" as const,
          params: {
            supportUserId: user.id,
            supportUserName: user.name,
          },
        } as any);
      }
    },
    [onStartChat, router],
  );

  // Handle quick question
  const handleQuickQuestion = useCallback(
    (question: (typeof QUICK_QUESTIONS)[0]) => {
      const recommendedUser = getRecommendedSupportForQuestion(question.id);
      if (recommendedUser) {
        if (onStartChat) {
          onStartChat(recommendedUser.id, question.text);
        } else {
          router.push({
            pathname: "/chat/support" as const,
            params: {
              supportUserId: recommendedUser.id,
              supportUserName: recommendedUser.displayName,
              initialMessage: question.text,
            },
          } as any);
        }
      }
    },
    [onStartChat, router],
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <Ionicons name="headset" size={24} color="#007AFF" />
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Hỗ trợ trực tuyến
        </Text>
      </View>
      <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
        Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn 24/7
      </Text>
    </View>
  );

  // Render quick questions section
  const renderQuickQuestions = () => {
    if (!showQuickQuestions) return null;

    return (
      <View style={styles.quickQuestionsSection}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Bạn cần hỗ trợ về?
        </Text>
        <View style={styles.quickQuestionsList}>
          {QUICK_QUESTIONS.map((q) => (
            <QuickQuestionButton
              key={q.id}
              question={q}
              onPress={() => handleQuickQuestion(q)}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={supportUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SupportUserItem user={item} onPress={() => handleStartChat(item)} />
        )}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderQuickQuestions()}
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Liên hệ trực tiếp
            </Text>
          </>
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// ============================================
// COMPACT SUPPORT WIDGET (for home screen)
// ============================================

interface SupportWidgetProps {
  onPress?: () => void;
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ onPress }) => {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const bgColor = useThemeColor({}, "background");

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/(tabs)/messages/chat-archives");
    }
  };

  // Get first 3 support users for display
  const previewUsers = getSupportUsersForChatList().slice(0, 3);

  return (
    <TouchableOpacity
      style={[styles.widget, { backgroundColor: bgColor }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.widgetHeader}>
        <View style={styles.widgetIconContainer}>
          <Ionicons name="chatbubbles" size={20} color="#fff" />
        </View>
        <View style={styles.widgetInfo}>
          <Text style={[styles.widgetTitle, { color: textColor }]}>
            Hỗ trợ trực tuyến
          </Text>
          <View style={styles.widgetOnlineRow}>
            <View style={styles.widgetOnlineDot} />
            <Text style={[styles.widgetOnlineText, { color: "#34C759" }]}>
              {previewUsers.length} nhân viên đang online
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={mutedColor} />
      </View>

      {/* Avatar row */}
      <View style={styles.widgetAvatarRow}>
        {previewUsers.map((user, index) => (
          <Image
            key={user.id}
            source={{ uri: user.avatar }}
            style={[
              styles.widgetAvatar,
              { marginLeft: index > 0 ? -10 : 0, zIndex: 3 - index },
            ]}
          />
        ))}
        <Text style={[styles.widgetAvatarMore, { color: mutedColor }]}>
          +{getSupportUsersForChatList().length - 3} more
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 32,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },

  // Quick questions
  quickQuestionsSection: {
    marginBottom: 20,
  },
  quickQuestionsList: {
    gap: 8,
  },
  quickQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  quickQuestionText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  // User item
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  supportBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  supportBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  department: {
    fontSize: 13,
    marginBottom: 2,
  },
  responseTime: {
    fontSize: 12,
  },
  chatIcon: {
    padding: 8,
  },
  separator: {
    height: 8,
  },

  // Widget
  widget: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  widgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  widgetIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  widgetInfo: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  widgetOnlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  widgetOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34C759",
  },
  widgetOnlineText: {
    fontSize: 12,
  },
  widgetAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  widgetAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
  },
  widgetAvatarMore: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default SupportChatList;
