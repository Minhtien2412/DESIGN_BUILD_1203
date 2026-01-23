/**
 * OfflineFilesScreen - Offline file browser and manager
 * OFFLINE-004: Offline File Downloads UI
 *
 * Features:
 * - List all offline files
 * - Download progress indicators
 * - Quota usage display
 * - Pin/unpin files
 * - Delete offline files
 * - Settings management
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import {
    formatFileSize,
    getFileIcon,
    getFileType,
} from "@/services/FileManagerService";
import {
    OfflineFile,
    OfflineFileFilter,
    OfflineFileService,
    OfflineFileStatus,
    useDownloadProgress,
    useOfflineFiles,
    useOfflineQuota,
    useOfflineSettings,
    useOfflineSyncStatus,
} from "@/services/OfflineFileService";

// ============================================================================
// COMPONENTS
// ============================================================================

interface OfflineFileItemProps {
  file: OfflineFile;
  onPress: (file: OfflineFile) => void;
  onDelete: (file: OfflineFile) => void;
  onTogglePin: (file: OfflineFile) => void;
  onRetry?: (file: OfflineFile) => void;
  onPause?: (file: OfflineFile) => void;
  onResume?: (file: OfflineFile) => void;
}

const OfflineFileItem: React.FC<OfflineFileItemProps> = ({
  file,
  onPress,
  onDelete,
  onTogglePin,
  onRetry,
  onPause,
  onResume,
}) => {
  const { progress, status, error } = useDownloadProgress(file.fileId);

  const fileType = useMemo(
    () => getFileType(file.contentType),
    [file.contentType],
  );
  const iconName = useMemo(
    () => getFileIcon(file.contentType),
    [file.contentType],
  );

  const handlePress = () => {
    if (status === "completed") {
      onPress(file);
    }
  };

  const handleAction = () => {
    switch (status) {
      case "failed":
        onRetry?.(file);
        break;
      case "downloading":
        onPause?.(file);
        break;
      case "paused":
        onResume?.(file);
        break;
    }
  };

  return (
    <Pressable
      style={[
        styles.fileItem,
        status !== "completed" && styles.fileItemDisabled,
      ]}
      onPress={handlePress}
      disabled={status !== "completed"}
    >
      {/* Icon */}
      <View style={[styles.fileIcon, getTypeColor(fileType)]}>
        <Ionicons name={iconName as any} size={24} color="#fff" />
      </View>

      {/* Info */}
      <View style={styles.fileInfo}>
        <View style={styles.fileNameRow}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.originalName}
          </Text>
          {file.isPinned && (
            <Ionicons name="pin" size={14} color={Colors.light.primary} />
          )}
        </View>

        <Text style={styles.fileMeta}>
          {formatFileSize(file.fileSize)} • {fileType.toUpperCase()}
        </Text>

        {/* Progress bar for downloading */}
        {(status === "downloading" ||
          status === "pending" ||
          status === "paused") && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}

        {/* Error message */}
        {status === "failed" && error && (
          <Text style={styles.errorText} numberOfLines={1}>
            {error}
          </Text>
        )}

        {/* Status badge */}
        <StatusBadge status={status} />
      </View>

      {/* Actions */}
      <View style={styles.fileActions}>
        {status === "completed" && (
          <>
            <Pressable
              style={styles.actionButton}
              onPress={() => onTogglePin(file)}
              hitSlop={8}
            >
              <Ionicons
                name={file.isPinned ? "pin" : "pin-outline"}
                size={20}
                color={
                  file.isPinned
                    ? Colors.light.primary
                    : Colors.light.textSecondary
                }
              />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => onDelete(file)}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </Pressable>
          </>
        )}

        {(status === "downloading" ||
          status === "paused" ||
          status === "failed") && (
          <Pressable
            style={styles.actionButton}
            onPress={handleAction}
            hitSlop={8}
          >
            <Ionicons
              name={
                status === "downloading"
                  ? "pause"
                  : status === "paused"
                    ? "play"
                    : "refresh"
              }
              size={20}
              color={Colors.light.primary}
            />
          </Pressable>
        )}

        {status === "pending" && (
          <ActivityIndicator size="small" color={Colors.light.primary} />
        )}
      </View>
    </Pressable>
  );
};

const StatusBadge: React.FC<{ status: OfflineFileStatus }> = ({ status }) => {
  const config = {
    pending: { label: "Đang chờ", color: "#f39c12" },
    downloading: { label: "Đang tải", color: Colors.light.primary },
    paused: { label: "Tạm dừng", color: "#95a5a6" },
    completed: { label: "Hoàn thành", color: "#27ae60" },
    failed: { label: "Lỗi", color: "#e74c3c" },
    expired: { label: "Hết hạn", color: "#95a5a6" },
  };

  const { label, color } = config[status];

  if (status === "completed") return null;

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
};

const getTypeColor = (type: string) => {
  const colors: Record<string, { backgroundColor: string }> = {
    image: { backgroundColor: "#9b59b6" },
    video: { backgroundColor: "#e74c3c" },
    document: { backgroundColor: "#3498db" },
    pdf: { backgroundColor: "#e74c3c" },
    spreadsheet: { backgroundColor: "#27ae60" },
    archive: { backgroundColor: "#f39c12" },
    other: { backgroundColor: "#95a5a6" },
  };
  return colors[type] || colors.other;
};

// ============================================================================
// QUOTA BAR
// ============================================================================

const QuotaBar: React.FC = () => {
  const { quota } = useOfflineQuota();

  if (!quota) return null;

  const isWarning = quota.percentage >= 80;
  const isCritical = quota.percentage >= 95;

  return (
    <View style={styles.quotaContainer}>
      <View style={styles.quotaHeader}>
        <Text style={styles.quotaLabel}>Dung lượng sử dụng</Text>
        <Text style={styles.quotaValue}>
          {formatFileSize(quota.usedBytes)} / {formatFileSize(quota.maxBytes)}
        </Text>
      </View>
      <View style={styles.quotaBar}>
        <View
          style={[
            styles.quotaFill,
            { width: `${Math.min(quota.percentage, 100)}%` },
            isWarning && styles.quotaWarning,
            isCritical && styles.quotaCritical,
          ]}
        />
      </View>
      <Text style={styles.quotaFiles}>{quota.fileCount} tệp đã lưu</Text>
    </View>
  );
};

// ============================================================================
// SYNC STATUS
// ============================================================================

const SyncStatusBar: React.FC = () => {
  const status = useOfflineSyncStatus();

  if (status.pendingDownloads === 0 && status.failedDownloads === 0) {
    return null;
  }

  return (
    <View style={styles.syncBar}>
      {!status.isOnline && (
        <View style={styles.syncItem}>
          <Ionicons name="cloud-offline" size={16} color="#e74c3c" />
          <Text style={styles.syncText}>Ngoại tuyến</Text>
        </View>
      )}
      {status.pendingDownloads > 0 && (
        <View style={styles.syncItem}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <Text style={styles.syncText}>
            {status.pendingDownloads} đang tải
          </Text>
        </View>
      )}
      {status.failedDownloads > 0 && (
        <View style={styles.syncItem}>
          <Ionicons name="alert-circle" size={16} color="#e74c3c" />
          <Text style={[styles.syncText, { color: "#e74c3c" }]}>
            {status.failedDownloads} lỗi
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// SETTINGS MODAL
// ============================================================================

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { settings, updateSettings } = useOfflineSettings();
  const insets = useSafeAreaInsets();

  const quotaOptions = [
    { label: "500 MB", value: 500 * 1024 * 1024 },
    { label: "1 GB", value: 1024 * 1024 * 1024 },
    { label: "2 GB", value: 2 * 1024 * 1024 * 1024 },
    { label: "5 GB", value: 5 * 1024 * 1024 * 1024 },
  ];

  const handleClearAll = () => {
    Alert.alert(
      "Xóa tất cả tệp offline?",
      "Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            OfflineFileService.clearAllOfflineFiles();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Cài đặt Offline</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </Pressable>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          {/* Max Storage */}
          <Text style={styles.settingLabel}>Dung lượng tối đa</Text>
          <View style={styles.quotaOptions}>
            {quotaOptions.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.quotaOption,
                  settings.maxStorageBytes === opt.value &&
                    styles.quotaOptionActive,
                ]}
                onPress={() => updateSettings({ maxStorageBytes: opt.value })}
              >
                <Text
                  style={[
                    styles.quotaOptionText,
                    settings.maxStorageBytes === opt.value &&
                      styles.quotaOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Auto Cleanup */}
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Tự động dọn dẹp</Text>
              <Text style={styles.settingDesc}>
                Xóa tệp cũ khi gần đầy dung lượng
              </Text>
            </View>
            <Switch
              value={settings.autoCleanupEnabled}
              onValueChange={(v) => updateSettings({ autoCleanupEnabled: v })}
              trackColor={{ true: Colors.light.primary }}
            />
          </View>

          {/* WiFi Only */}
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Chỉ tải qua WiFi</Text>
              <Text style={styles.settingDesc}>
                Không sử dụng dữ liệu di động
              </Text>
            </View>
            <Switch
              value={settings.downloadOnWifiOnly}
              onValueChange={(v) => updateSettings({ downloadOnWifiOnly: v })}
              trackColor={{ true: Colors.light.primary }}
            />
          </View>

          {/* Max Concurrent */}
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Tải đồng thời tối đa</Text>
              <Text style={styles.settingDesc}>
                {settings.maxConcurrentDownloads} tệp cùng lúc
              </Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() =>
                  updateSettings({
                    maxConcurrentDownloads: Math.max(
                      1,
                      settings.maxConcurrentDownloads - 1,
                    ),
                  })
                }
              >
                <Ionicons name="remove" size={20} color={Colors.light.text} />
              </Pressable>
              <Text style={styles.stepperValue}>
                {settings.maxConcurrentDownloads}
              </Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() =>
                  updateSettings({
                    maxConcurrentDownloads: Math.min(
                      5,
                      settings.maxConcurrentDownloads + 1,
                    ),
                  })
                }
              >
                <Ionicons name="add" size={20} color={Colors.light.text} />
              </Pressable>
            </View>
          </View>

          {/* Clear All */}
          <Pressable style={styles.clearButton} onPress={handleClearAll}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.clearButtonText}>Xóa tất cả tệp offline</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const OfflineFilesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<OfflineFileFilter>({
    sortBy: "downloadedAt",
    sortOrder: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { files, isLoading, refresh } = useOfflineFiles({
    ...filter,
    search: searchQuery || undefined,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleOpenFile = useCallback((file: OfflineFile) => {
    // Open file with appropriate viewer
    Alert.alert("Mở tệp", `Mở ${file.originalName}`);
    // TODO: Navigate to appropriate viewer
  }, []);

  const handleDelete = useCallback((file: OfflineFile) => {
    Alert.alert("Xóa tệp offline?", `Bạn có muốn xóa "${file.originalName}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => OfflineFileService.deleteOfflineFile(file.fileId),
      },
    ]);
  }, []);

  const handleTogglePin = useCallback(
    (file: OfflineFile) => {
      OfflineFileService.togglePin(file.fileId);
      refresh();
    },
    [refresh],
  );

  const handleRetry = useCallback((file: OfflineFile) => {
    OfflineFileService.retryDownload(file.fileId);
  }, []);

  const handlePause = useCallback((file: OfflineFile) => {
    OfflineFileService.pauseDownload(file.fileId);
  }, []);

  const handleResume = useCallback((file: OfflineFile) => {
    OfflineFileService.resumeDownload(file.fileId);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: OfflineFile }) => (
      <OfflineFileItem
        file={item}
        onPress={handleOpenFile}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        onRetry={handleRetry}
        onPause={handlePause}
        onResume={handleResume}
      />
    ),
    [
      handleOpenFile,
      handleDelete,
      handleTogglePin,
      handleRetry,
      handlePause,
      handleResume,
    ],
  );

  const ListHeader = useMemo(
    () => (
      <>
        <QuotaBar />
        <SyncStatusBar />
      </>
    ),
    [],
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="cloud-download-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Chưa có tệp offline</Text>
        <Text style={styles.emptyDesc}>
          Lưu tệp để sử dụng khi không có kết nối mạng
        </Text>
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tệp Offline</Text>
        <Pressable
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
          hitSlop={8}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={Colors.light.text}
          />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tệp..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.textSecondary}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={20}
              color={Colors.light.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterTabs}>
        {(["all", "completed", "downloading", "failed"] as const).map(
          (status) => (
            <Pressable
              key={status}
              style={[
                styles.filterTab,
                filter.status === status || (status === "all" && !filter.status)
                  ? styles.filterTabActive
                  : undefined,
              ]}
              onPress={() =>
                setFilter((f) => ({
                  ...f,
                  status: status === "all" ? undefined : status,
                }))
              }
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter.status === status ||
                  (status === "all" && !filter.status)
                    ? styles.filterTabTextActive
                    : undefined,
                ]}
              >
                {status === "all"
                  ? "Tất cả"
                  : status === "completed"
                    ? "Hoàn thành"
                    : status === "downloading"
                      ? "Đang tải"
                      : "Lỗi"}
              </Text>
            </Pressable>
          ),
        )}
      </View>

      {/* File List */}
      <FlatList
        data={files}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={files.length === 0 && styles.emptyList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
  },
  settingsButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
  },
  filterTabActive: {
    backgroundColor: Colors.light.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  filterTabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  fileItemDisabled: {
    opacity: 0.8,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    flex: 1,
  },
  fileMeta: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    width: 35,
  },
  errorText: {
    fontSize: 12,
    color: "#e74c3c",
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  fileActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 76,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  quotaContainer: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  quotaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quotaLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  quotaValue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  quotaBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  quotaFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
  },
  quotaWarning: {
    backgroundColor: "#f39c12",
  },
  quotaCritical: {
    backgroundColor: "#e74c3c",
  },
  quotaFiles: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 6,
  },
  syncBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff3cd",
    gap: 16,
  },
  syncItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  syncText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  settingsSection: {
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 8,
  },
  settingDesc: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  quotaOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  quotaOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quotaOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  quotaOptionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  quotaOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    minWidth: 24,
    textAlign: "center",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default OfflineFilesScreen;
