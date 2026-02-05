/**
 * File Manager Component
 * Unified file browser with upload/download capabilities
 *
 * Features:
 * - Grid/List view toggle
 * - Upload with drag & drop (web) / button (mobile)
 * - File preview
 * - Folder navigation
 * - Search & filter
 * - Multi-select for batch operations
 */

import { useAuth } from "@/context/AuthContext";
import { useStorage } from "@/hooks/useStorage";
import type { FileInfo, FolderInfo } from "@/services/storage/types";
import {
    pickDocument,
    pickImage,
    pickMultipleFiles,
    takePhoto
} from "@/utils/filePicker";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Colors
const COLORS = {
  primary: "#2563eb",
  secondary: "#64748b",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
};

// File type icons
const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  image: { icon: "image", color: "#22c55e" },
  video: { icon: "videocam", color: "#8b5cf6" },
  audio: { icon: "musical-notes", color: "#f59e0b" },
  "application/pdf": { icon: "document-text", color: "#ef4444" },
  "application/msword": { icon: "document", color: "#2563eb" },
  "application/vnd.openxmlformats-officedocument": {
    icon: "document",
    color: "#2563eb",
  },
  "application/vnd.ms-excel": { icon: "grid", color: "#22c55e" },
  "application/zip": { icon: "archive", color: "#f59e0b" },
  text: { icon: "document-text", color: "#64748b" },
  default: { icon: "document", color: "#64748b" },
};

// Get icon for file type
const getFileIcon = (mimeType: string): { icon: string; color: string } => {
  for (const [key, value] of Object.entries(FILE_ICONS)) {
    if (mimeType.startsWith(key)) return value;
  }
  return FILE_ICONS.default;
};

// Props
interface FileManagerProps {
  /** Initial folder path */
  initialFolder?: string;
  /** Show upload button */
  showUpload?: boolean;
  /** Show search bar */
  showSearch?: boolean;
  /** View mode: grid or list */
  defaultViewMode?: "grid" | "list";
  /** On file select callback */
  onFileSelect?: (file: FileInfo) => void;
  /** On upload complete callback */
  onUploadComplete?: (result: any) => void;
  /** Max file size for uploads (bytes) */
  maxFileSize?: number;
  /** Allowed file types */
  allowedTypes?: string[];
}

export function FileManager({
  initialFolder = "",
  showUpload = true,
  showSearch = true,
  defaultViewMode = "grid",
  onFileSelect,
  onUploadComplete,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedTypes,
}: FileManagerProps) {
  const { user } = useAuth();
  const userId = user?.id;

  const {
    files,
    folders,
    stats,
    loading,
    uploading,
    uploadProgress,
    error,
    upload,
    uploadMultiple,
    download,
    deleteFile,
    createFolder,
    deleteFolder,
    share,
    refresh,
    setCurrentFolder,
    getPublicUrl,
    getThumbnailUrl,
    formatSize,
  } = useStorage({
    userId,
    folder: initialFolder,
    autoLoad: true,
  });

  // Local state
  const [viewMode, setViewMode] = useState<"grid" | "list">(defaultViewMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [folderPath, setFolderPath] = useState<string[]>([]);

  // Filtered items
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    const query = searchQuery.toLowerCase();
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.mimeType.toLowerCase().includes(query),
    );
  }, [files, searchQuery]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;
    const query = searchQuery.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(query));
  }, [folders, searchQuery]);

  // Handle folder navigation
  const navigateToFolder = useCallback(
    (folder: FolderInfo) => {
      setFolderPath((prev) => [...prev, folder.name]);
      setCurrentFolder(folder.path);
    },
    [setCurrentFolder],
  );

  const navigateBack = useCallback(() => {
    setFolderPath((prev) => {
      const newPath = prev.slice(0, -1);
      setCurrentFolder(newPath.join("/"));
      return newPath;
    });
  }, [setCurrentFolder]);

  const navigateToRoot = useCallback(() => {
    setFolderPath([]);
    setCurrentFolder("");
  }, [setCurrentFolder]);

  // Handle file upload
  const handleUpload = useCallback(
    async (type: "image" | "document" | "camera") => {
      setShowUploadMenu(false);

      try {
        let pickedFile;

        switch (type) {
          case "image":
            pickedFile = await pickImage({ maxSize: maxFileSize });
            break;
          case "document":
            pickedFile = await pickDocument({ maxSize: maxFileSize });
            break;
          case "camera":
            pickedFile = await takePhoto({ maxSize: maxFileSize });
            break;
        }

        if (!pickedFile) return;

        const result = await upload(pickedFile.uri, {
          filename: pickedFile.name,
        });

        onUploadComplete?.(result);
        Alert.alert("Thành công", "File đã được tải lên!");
      } catch (err: any) {
        Alert.alert("Lỗi", err.message || "Không thể tải lên file");
      }
    },
    [upload, maxFileSize, onUploadComplete],
  );

  // Handle multiple file upload
  const handleMultipleUpload = useCallback(async () => {
    setShowUploadMenu(false);

    try {
      const pickedFiles = await pickMultipleFiles({ maxSize: maxFileSize });

      if (pickedFiles.length === 0) return;

      await uploadMultiple(
        pickedFiles.map((f) => ({
          file: f.uri,
          options: { filename: f.name },
        })),
      );

      Alert.alert("Thành công", `Đã tải lên ${pickedFiles.length} files!`);
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể tải lên files");
    }
  }, [uploadMultiple, maxFileSize]);

  // Handle file action
  const handleFileAction = useCallback(
    async (
      file: FileInfo,
      action: "preview" | "download" | "share" | "delete",
    ) => {
      switch (action) {
        case "preview":
          setPreviewFile(file);
          break;

        case "download":
          try {
            const url = getPublicUrl(file.path);
            // On mobile, would use Linking or FileSystem to download
            Alert.alert("Download", `URL: ${url}`);
          } catch (err: any) {
            Alert.alert("Lỗi", err.message);
          }
          break;

        case "share":
          try {
            const shareUrl = await share(file.path, { expiresIn: 86400 * 7 });
            if (Platform.OS === "web") {
              navigator.clipboard?.writeText(shareUrl);
              Alert.alert("Đã copy link!");
            } else {
              await Share.share({
                url: shareUrl,
                message: `File: ${file.name}`,
              });
            }
          } catch (err: any) {
            Alert.alert("Lỗi", err.message);
          }
          break;

        case "delete":
          Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa "${file.name}"?`, [
            { text: "Hủy", style: "cancel" },
            {
              text: "Xóa",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteFile(file.path);
                  Alert.alert("Đã xóa!");
                } catch (err: any) {
                  Alert.alert("Lỗi", err.message);
                }
              },
            },
          ]);
          break;
      }
    },
    [deleteFile, share, getPublicUrl],
  );

  // Handle create folder
  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName.trim());
      setNewFolderName("");
      setShowNewFolderModal(false);
      Alert.alert("Đã tạo thư mục!");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    }
  }, [newFolderName, createFolder]);

  // Render breadcrumb
  const renderBreadcrumb = () => (
    <View style={styles.breadcrumb}>
      <TouchableOpacity onPress={navigateToRoot} style={styles.breadcrumbItem}>
        <Ionicons name="home" size={16} color={COLORS.primary} />
        <Text style={styles.breadcrumbText}>Home</Text>
      </TouchableOpacity>
      {folderPath.map((name, index) => (
        <React.Fragment key={index}>
          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
          <TouchableOpacity
            onPress={() => {
              const newPath = folderPath.slice(0, index + 1);
              setFolderPath(newPath);
              setCurrentFolder(newPath.join("/"));
            }}
            style={styles.breadcrumbItem}
          >
            <Text style={styles.breadcrumbText}>{name}</Text>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );

  // Render folder item
  const renderFolderItem = ({ item }: { item: FolderInfo }) => (
    <TouchableOpacity
      style={[styles.itemContainer, viewMode === "grid" && styles.gridItem]}
      onPress={() => navigateToFolder(item)}
      onLongPress={() => {
        Alert.alert(item.name, "Chọn thao tác", [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: () => deleteFolder(item.path, true),
          },
        ]);
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: "#fef3c7" }]}>
        <Ionicons
          name="folder"
          size={viewMode === "grid" ? 32 : 24}
          color="#f59e0b"
        />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemMeta}>{item.fileCount} items</Text>
      </View>
    </TouchableOpacity>
  );

  // Render file item
  const renderFileItem = ({ item }: { item: FileInfo }) => {
    const { icon, color } = getFileIcon(item.mimeType);
    const isImage = item.mimeType.startsWith("image/");
    const isSelected = selectedFiles.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          viewMode === "grid" && styles.gridItem,
          isSelected && styles.selectedItem,
        ]}
        onPress={() => {
          if (selectedFiles.size > 0) {
            setSelectedFiles((prev) => {
              const next = new Set(prev);
              if (next.has(item.id)) {
                next.delete(item.id);
              } else {
                next.add(item.id);
              }
              return next;
            });
          } else {
            onFileSelect?.(item) || handleFileAction(item, "preview");
          }
        }}
        onLongPress={() => {
          setSelectedFiles((prev) => new Set(prev).add(item.id));
        }}
      >
        {isImage && item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl || getThumbnailUrl(item.path) }}
            style={[
              styles.thumbnail,
              viewMode === "grid" && styles.gridThumbnail,
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.iconContainer, { backgroundColor: color + "20" }]}
          >
            <Ionicons
              name={icon as any}
              size={viewMode === "grid" ? 32 : 24}
              color={color}
            />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemMeta}>
            {formatSize(item.size)} •{" "}
            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(item.name, "Chọn thao tác", [
              { text: "Hủy", style: "cancel" },
              { text: "Xem", onPress: () => handleFileAction(item, "preview") },
              {
                text: "Tải về",
                onPress: () => handleFileAction(item, "download"),
              },
              {
                text: "Chia sẻ",
                onPress: () => handleFileAction(item, "share"),
              },
              {
                text: "Xóa",
                style: "destructive",
                onPress: () => handleFileAction(item, "delete"),
              },
            ]);
          }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm files..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
        >
          <Ionicons
            name={viewMode === "grid" ? "list" : "grid"}
            size={20}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowNewFolderModal(true)}
        >
          <Ionicons name="folder-open" size={20} color={COLORS.text} />
        </TouchableOpacity>

        {showUpload && (
          <TouchableOpacity
            style={[styles.actionButton, styles.uploadButton]}
            onPress={() => setShowUploadMenu(true)}
          >
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Tải lên</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render storage stats
  const renderStats = () => {
    if (!stats) return null;

    const usagePercent =
      stats.maxQuota > 0
        ? Math.round((stats.usedQuota / stats.maxQuota) * 100)
        : 0;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Dung lượng đã dùng</Text>
          <Text style={styles.statsValue}>
            {formatSize(stats.usedQuota)} / {formatSize(stats.maxQuota)}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${usagePercent}%` }]} />
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsDetail}>
            {stats.totalFiles} files • {stats.recentUploads} tải lên gần đây
          </Text>
        </View>
      </View>
    );
  };

  // Combined data for FlatList
  const listData = useMemo(
    () => [
      ...filteredFolders.map((f) => ({ ...f, type: "folder" as const })),
      ...filteredFiles.map((f) => ({ ...f, type: "file" as const })),
    ],
    [filteredFolders, filteredFiles],
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderBreadcrumb()}
      {renderStats()}

      {/* Upload progress */}
      {uploading && (
        <View style={styles.uploadProgress}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.uploadProgressText}>
            Đang tải lên... {uploadProgress}%
          </Text>
          <View style={styles.uploadProgressBar}>
            <View
              style={[
                styles.uploadProgressFill,
                { width: `${uploadProgress}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* File list */}
      <FlatList
        data={listData}
        key={viewMode}
        numColumns={viewMode === "grid" ? 3 : 1}
        renderItem={({ item }) =>
          item.type === "folder"
            ? renderFolderItem({ item: item as FolderInfo })
            : renderFileItem({ item: item as FileInfo })
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="folder-open-outline"
              size={64}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>Chưa có file nào</Text>
            <Text style={styles.emptySubtext}>Tải lên file để bắt đầu</Text>
          </View>
        }
      />

      {/* Upload Menu Modal */}
      <Modal
        visible={showUploadMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowUploadMenu(false)}
        >
          <View style={styles.uploadMenu}>
            <Text style={styles.uploadMenuTitle}>Tải lên file</Text>

            <TouchableOpacity
              style={styles.uploadMenuItem}
              onPress={() => handleUpload("image")}
            >
              <View
                style={[styles.uploadMenuIcon, { backgroundColor: "#dcfce7" }]}
              >
                <Ionicons name="image" size={24} color="#22c55e" />
              </View>
              <View>
                <Text style={styles.uploadMenuItemTitle}>Ảnh</Text>
                <Text style={styles.uploadMenuItemSubtitle}>
                  Chọn từ thư viện
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadMenuItem}
              onPress={() => handleUpload("camera")}
            >
              <View
                style={[styles.uploadMenuIcon, { backgroundColor: "#dbeafe" }]}
              >
                <Ionicons name="camera" size={24} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.uploadMenuItemTitle}>Camera</Text>
                <Text style={styles.uploadMenuItemSubtitle}>Chụp ảnh mới</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadMenuItem}
              onPress={() => handleUpload("document")}
            >
              <View
                style={[styles.uploadMenuIcon, { backgroundColor: "#fef3c7" }]}
              >
                <Ionicons name="document" size={24} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.uploadMenuItemTitle}>Tài liệu</Text>
                <Text style={styles.uploadMenuItemSubtitle}>
                  PDF, Word, Excel...
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadMenuItem}
              onPress={handleMultipleUpload}
            >
              <View
                style={[styles.uploadMenuIcon, { backgroundColor: "#f3e8ff" }]}
              >
                <Ionicons name="documents" size={24} color="#8b5cf6" />
              </View>
              <View>
                <Text style={styles.uploadMenuItemTitle}>Nhiều file</Text>
                <Text style={styles.uploadMenuItemSubtitle}>
                  Chọn nhiều file cùng lúc
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* New Folder Modal */}
      <Modal
        visible={showNewFolderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewFolderModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNewFolderModal(false)}
        >
          <View style={styles.newFolderModal}>
            <Text style={styles.modalTitle}>Tạo thư mục mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên thư mục"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNewFolderModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateFolder}
              >
                <Text style={styles.confirmButtonText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* File Preview Modal */}
      {previewFile && (
        <Modal
          visible={!!previewFile}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewFile(null)}
        >
          <Pressable
            style={styles.previewOverlay}
            onPress={() => setPreviewFile(null)}
          >
            <View style={styles.previewContainer}>
              {previewFile.mimeType.startsWith("image/") ? (
                <Image
                  source={{ uri: previewFile.url }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <Ionicons
                    name={getFileIcon(previewFile.mimeType).icon as any}
                    size={64}
                    color={getFileIcon(previewFile.mimeType).color}
                  />
                  <Text style={styles.previewFileName}>{previewFile.name}</Text>
                  <Text style={styles.previewFileSize}>
                    {formatSize(previewFile.size)}
                  </Text>
                </View>
              )}
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => handleFileAction(previewFile, "download")}
                >
                  <Ionicons name="download" size={20} color="#fff" />
                  <Text style={styles.previewButtonText}>Tải về</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => handleFileAction(previewFile, "share")}
                >
                  <Ionicons name="share" size={20} color="#fff" />
                  <Text style={styles.previewButtonText}>Chia sẻ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    width: "auto",
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    gap: 6,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: "wrap",
    gap: 4,
  },
  breadcrumbItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statsValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  statsDetail: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginVertical: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  list: {
    padding: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    gap: 12,
  },
  gridItem: {
    flex: 1,
    flexDirection: "column",
    margin: 4,
    padding: 12,
    alignItems: "center",
    minHeight: 120,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  gridThumbnail: {
    width: 60,
    height: 60,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  uploadProgress: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  uploadProgressText: {
    fontSize: 13,
    color: COLORS.text,
  },
  uploadProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  uploadProgressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  uploadMenu: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  uploadMenuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },
  uploadMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 16,
  },
  uploadMenuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadMenuItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  uploadMenuItemSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  newFolderModal: {
    backgroundColor: COLORS.surface,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: "auto",
    marginBottom: "auto",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.background,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 400,
    borderRadius: 12,
  },
  previewPlaceholder: {
    backgroundColor: COLORS.surface,
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  previewFileName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    textAlign: "center",
  },
  previewFileSize: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  previewActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FileManager;
