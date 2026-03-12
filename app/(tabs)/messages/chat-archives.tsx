/**
 * Chat Archive Screen
 * ====================
 *
 * Màn hình quản lý lịch sử chat đã lưu trữ:
 * - Xem danh sách archives
 * - Tìm kiếm tin nhắn trong archives
 * - Xem chi tiết archive
 * - Quản lý storage
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { useChatArchive } from "@/hooks/useChatArchive";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    ArchiveMetadata,
    formatFileSize,
} from "@/services/chatHistoryArchiveService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================
// ARCHIVE LIST ITEM
// ============================================

interface ArchiveItemProps {
  archive: ArchiveMetadata;
  onPress: () => void;
  onDelete: () => void;
}

const ArchiveItem: React.FC<ArchiveItemProps> = ({
  archive,
  onPress,
  onDelete,
}) => {
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const cardBg = useThemeColor({}, "background");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Xóa Archive",
      `Bạn có chắc muốn xóa lịch sử chat "${archive.conversationName || "Cuộc trò chuyện"}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: onDelete },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={[styles.archiveItem, { backgroundColor: cardBg }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.archiveIcon}>
        <Ionicons name="archive-outline" size={18} color="#007AFF" />
      </View>

      <View style={styles.archiveInfo}>
        <Text
          style={[styles.archiveName, { color: textColor }]}
          numberOfLines={1}
        >
          {archive.conversationName || "Cuộc trò chuyện"}
        </Text>
        <Text style={[styles.archiveDate, { color: mutedColor }]}>
          {formatDate(archive.startDate)} - {formatDate(archive.endDate)}
        </Text>
        <View style={styles.archiveStats}>
          <Text style={[styles.archiveStat, { color: mutedColor }]}>
            <Ionicons name="chatbubble-outline" size={12} />{" "}
            {archive.messageCount} tin nhắn
          </Text>
          {archive.mediaCount > 0 && (
            <Text style={[styles.archiveStat, { color: mutedColor }]}>
              <Ionicons name="image-outline" size={12} /> {archive.mediaCount}{" "}
              media
            </Text>
          )}
          <Text style={[styles.archiveStat, { color: mutedColor }]}>
            {formatFileSize(archive.totalSize)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ============================================
// MAIN SCREEN
// ============================================

export default function ChatArchiveScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const bgColor = useThemeColor({}, "background");
  const mutedColor = useThemeColor({}, "tabIconDefault");

  // Hook
  const {
    isLoading,
    isSyncing,
    archives,
    syncStatus,
    syncArchives,
    deleteArchive,
    cleanupOldArchives,
    refreshArchives,
    serverRetentionDays,
  } = useChatArchive();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter archives by search
  const filteredArchives = searchQuery
    ? archives.filter((a) =>
        a.conversationName?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : archives;

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshArchives();
    setIsRefreshing(false);
  }, [refreshArchives]);

  const handleSync = useCallback(async () => {
    const count = await syncArchives();
    if (count > 0) {
      Alert.alert("Đồng bộ thành công", `Đã lưu ${count} archive mới`);
    } else {
      Alert.alert("Thông báo", "Không có archive mới để đồng bộ");
    }
  }, [syncArchives]);

  const handleCleanup = useCallback(() => {
    Alert.alert("Dọn dẹp Archives", "Xóa tất cả archives cũ hơn 1 năm?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const count = await cleanupOldArchives(365);
          Alert.alert("Hoàn tất", `Đã xóa ${count} archives cũ`);
        },
      },
    ]);
  }, [cleanupOldArchives]);

  const handleViewArchive = useCallback(
    (archive: ArchiveMetadata) => {
      router.push({
        pathname: "/(tabs)/messages/archive-detail",
        params: { archiveId: archive.id },
      });
    },
    [router],
  );

  const handleDeleteArchive = useCallback(
    async (archiveId: string) => {
      await deleteArchive(archiveId);
    },
    [deleteArchive],
  );

  // Render header stats
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Stats card */}
      <View style={[styles.statsCard, { backgroundColor: bgColor }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {syncStatus?.localArchives || 0}
          </Text>
          <Text style={[styles.statLabel, { color: mutedColor }]}>
            Archives
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {syncStatus?.pendingArchives || 0}
          </Text>
          <Text style={[styles.statLabel, { color: mutedColor }]}>Chờ tải</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {formatFileSize(syncStatus?.totalSize || 0)}
          </Text>
          <Text style={[styles.statLabel, { color: mutedColor }]}>
            Dung lượng
          </Text>
        </View>
      </View>

      {/* Info text */}
      <Text style={[styles.infoText, { color: mutedColor }]}>
        Tin nhắn được lưu tạm trên server trong {serverRetentionDays} ngày, sau
        đó sẽ tự động tải về thiết bị của bạn.
      </Text>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#007AFF" }]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-download-outline" size={14} color="#fff" />
              <Text style={styles.actionBtnText}>Đồng bộ</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#FF9500" }]}
          onPress={handleCleanup}
        >
          <Ionicons name="trash-bin-outline" size={14} color="#fff" />
          <Text style={styles.actionBtnText}>Dọn dẹp</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: bgColor }]}>
        <Ionicons name="search" size={16} color={mutedColor} />
        <TextInput
          nativeID="chat-archives-search"
          accessibilityLabel="Tìm kiếm trong archives"
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm kiếm trong archives..."
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
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="archive-outline" size={44} color={mutedColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Chưa có Archive
      </Text>
      <Text style={[styles.emptyText, { color: mutedColor }]}>
        Lịch sử chat sẽ được lưu tự động sau {serverRetentionDays} ngày
      </Text>
      <TouchableOpacity
        style={[styles.emptyBtn, { backgroundColor: "#007AFF" }]}
        onPress={handleSync}
      >
        <Text style={styles.emptyBtnText}>Kiểm tra ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen
        options={{
          title: "Lịch sử Chat",
          headerRight: () => (
            <TouchableOpacity onPress={handleRefresh}>
              <Ionicons name="refresh" size={20} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading && archives.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: mutedColor }]}>
            Đang tải archives...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredArchives}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ArchiveItem
              archive={item}
              onPress={() => handleViewArchive(item)}
              onDelete={() => handleDeleteArchive(item.id)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  listContent: {
    flexGrow: 1,
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  // Header
  header: {
    marginBottom: 10,
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E5E5",
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },

  // Archive item
  archiveItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  archiveIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  archiveInfo: {
    flex: 1,
  },
  archiveName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 1,
  },
  archiveDate: {
    fontSize: 11,
    marginBottom: 3,
  },
  archiveStats: {
    flexDirection: "row",
    gap: 8,
  },
  archiveStat: {
    fontSize: 10,
  },
  deleteBtn: {
    padding: 6,
  },
  separator: {
    height: 6,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 14,
    paddingHorizontal: 32,
  },
  emptyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
