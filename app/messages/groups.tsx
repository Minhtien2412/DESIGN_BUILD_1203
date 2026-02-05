/**
 * Groups Route
 * Displays list of group chats
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GroupChat {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  lastMessage?: {
    senderName: string;
    content: string;
    timestamp: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
}

const MOCK_GROUPS: GroupChat[] = [
  {
    id: "group-1",
    name: "Dự án Resort Đà Nẵng",
    memberCount: 12,
    lastMessage: {
      senderName: "Nguyễn Văn A",
      content: "Đã cập nhật bản vẽ mới",
      timestamp: "2026-01-24T11:30:00Z",
    },
    unreadCount: 5,
    isPinned: true,
    isMuted: false,
  },
  {
    id: "group-2",
    name: "Team Design",
    memberCount: 8,
    lastMessage: {
      senderName: "Trần Thị B",
      content: "Meeting lúc 2pm nhé mọi người",
      timestamp: "2026-01-24T10:15:00Z",
    },
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
  },
  {
    id: "group-3",
    name: "Marketing Team",
    memberCount: 6,
    lastMessage: {
      senderName: "Lê Văn C",
      content: "Chiến dịch mới đã sẵn sàng",
      timestamp: "2026-01-24T09:00:00Z",
    },
    unreadCount: 12,
    isPinned: false,
    isMuted: true,
  },
  {
    id: "group-4",
    name: "Gia đình",
    memberCount: 5,
    lastMessage: {
      senderName: "Mẹ",
      content: "Con về ăn cơm nhé!",
      timestamp: "2026-01-23T18:30:00Z",
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
  },
];

export default function GroupsScreen() {
  const [groups, setGroups] = useState<GroupChat[]>(MOCK_GROUPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleGroupPress = (group: GroupChat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/chat/${group.id}` as any);
  };

  const handleCreateGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to create group screen
  };

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

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedGroups = filteredGroups.filter((g) => g.isPinned);
  const otherGroups = filteredGroups.filter((g) => !g.isPinned);

  const renderGroupItem = ({ item }: { item: GroupChat }) => (
    <TouchableOpacity
      style={[styles.groupItem, item.isPinned && styles.groupItemPinned]}
      onPress={() => handleGroupPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.groupAvatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.groupAvatar} />
        ) : (
          <LinearGradient
            colors={["#667EEA", "#764BA2"]}
            style={styles.groupAvatarPlaceholder}
          >
            <Ionicons name="people" size={24} color="#fff" />
          </LinearGradient>
        )}
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={10} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <View style={styles.groupNameRow}>
            <Text style={styles.groupName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isMuted && (
              <Ionicons
                name="volume-mute"
                size={14}
                color={MODERN_COLORS.textTertiary}
              />
            )}
          </View>
          {item.lastMessage && (
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <View style={styles.groupFooter}>
          <View style={styles.memberCountBadge}>
            <Ionicons
              name="people"
              size={12}
              color={MODERN_COLORS.textSecondary}
            />
            <Text style={styles.memberCount}>{item.memberCount}</Text>
          </View>
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.senderName}: {item.lastMessage.content}
            </Text>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhóm chat</Text>
        <TouchableOpacity
          onPress={handleCreateGroup}
          style={styles.createButton}
        >
          <Ionicons name="add-circle" size={28} color={MODERN_COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={MODERN_COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhóm..."
          placeholderTextColor={MODERN_COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
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

      {/* Groups List */}
      <FlatList
        data={[...pinnedGroups, ...otherGroups]}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[MODERN_COLORS.primary]}
          />
        }
        ListHeaderComponent={
          pinnedGroups.length > 0 ? (
            <Text style={styles.sectionTitle}>Đã ghim</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={64}
              color={MODERN_COLORS.textTertiary}
            />
            <Text style={styles.emptyTitle}>Chưa có nhóm nào</Text>
            <Text style={styles.emptySubtitle}>
              Tạo nhóm mới để bắt đầu trò chuyện với nhiều người
            </Text>
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={handleCreateGroup}
            >
              <Text style={styles.createGroupButtonText}>Tạo nhóm mới</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateGroup}>
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
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
  createButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  searchInput: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
    textTransform: "uppercase",
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.sm,
    marginVertical: 4,
    borderRadius: MODERN_RADIUS.lg,
  },
  groupItemPinned: {
    backgroundColor: `${MODERN_COLORS.primary}08`,
  },
  groupAvatarContainer: {
    position: "relative",
    marginRight: MODERN_SPACING.md,
  },
  groupAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  groupAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  pinnedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },
  groupContent: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  groupNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  groupName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: MODERN_COLORS.textTertiary,
  },
  groupFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.divider,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.sm,
    marginRight: MODERN_SPACING.sm,
    gap: 4,
  },
  memberCount: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    marginRight: MODERN_SPACING.sm,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.xxl,
  },
  emptyTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.sm,
  },
  emptySubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    marginBottom: MODERN_SPACING.lg,
  },
  createGroupButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.full,
  },
  createGroupButtonText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    ...MODERN_SHADOWS.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
