/**
 * FileBrowser - File listing with search, filter, and sort
 * UPLOAD-005: File Browser UI
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
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

import { useThemeColor } from "@/hooks/useThemeColor";
import {
    FileItem,
    FileManagerService,
    FileSortField,
    FileTypeFilter,
    useFileDownload,
    useFileList,
} from "@/services/FileManagerService";
import { FileListItem } from "./FileListItem";

// ============================================================================
// TYPES
// ============================================================================

export interface FileBrowserProps {
  projectId?: string;
  conversationId?: string;
  ownerId?: string;
  selectionMode?: boolean;
  maxSelection?: number;
  selectedFiles?: string[];
  onFileSelect?: (file: FileItem) => void;
  onFilesSelected?: (files: FileItem[]) => void;
  onFileOpen?: (file: FileItem) => void;
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

const TYPE_OPTIONS: { value: FileTypeFilter; label: string; icon: string }[] = [
  { value: "all", label: "Tất cả", icon: "apps-outline" },
  { value: "image", label: "Ảnh", icon: "image-outline" },
  { value: "video", label: "Video", icon: "videocam-outline" },
  { value: "document", label: "Văn bản", icon: "document-text-outline" },
  { value: "pdf", label: "PDF", icon: "document-outline" },
  { value: "spreadsheet", label: "Bảng tính", icon: "grid-outline" },
  { value: "archive", label: "Nén", icon: "archive-outline" },
];

const SORT_OPTIONS: { value: FileSortField; label: string }[] = [
  { value: "updatedAt", label: "Mới cập nhật" },
  { value: "createdAt", label: "Ngày tạo" },
  { value: "name", label: "Tên A-Z" },
  { value: "size", label: "Kích thước" },
  { value: "type", label: "Loại file" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function FileBrowser({
  projectId,
  conversationId,
  ownerId,
  selectionMode = false,
  maxSelection,
  selectedFiles: externalSelected,
  onFileSelect,
  onFilesSelected,
  onFileOpen,
}: FileBrowserProps) {
  const colors = useThemeColor();

  // State
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>("all");
  const [sortBy, setSortBy] = useState<FileSortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    new Set()
  );

  // File list hook
  const {
    files,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    updateFilters,
  } = useFileList({
    projectId,
    conversationId,
    ownerId,
    type: typeFilter,
    sortBy,
    sortOrder,
    search: searchQuery || undefined,
    limit: 20,
  });

  // Download hook
  const { download, getProgress, activeDownloads } = useFileDownload();

  // Selected files
  const selectedSet = useMemo(() => {
    return externalSelected ? new Set(externalSelected) : internalSelected;
  }, [externalSelected, internalSelected]);

  // Handlers
  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      updateFilters({ search: text || undefined, page: 1 });
    },
    [updateFilters]
  );

  const handleTypeFilter = useCallback(
    (type: FileTypeFilter) => {
      setTypeFilter(type);
      updateFilters({ type, page: 1 });
      setShowFilters(false);
    },
    [updateFilters]
  );

  const handleSort = useCallback(
    (field: FileSortField) => {
      const newOrder =
        sortBy === field && sortOrder === "desc" ? "asc" : "desc";
      setSortBy(field);
      setSortOrder(newOrder);
      updateFilters({ sortBy: field, sortOrder: newOrder, page: 1 });
      setShowSortOptions(false);
    },
    [sortBy, sortOrder, updateFilters]
  );

  const handleFilePress = useCallback(
    (file: FileItem) => {
      if (selectionMode) {
        // Toggle selection
        const newSelected = new Set(selectedSet);
        if (newSelected.has(file.id)) {
          newSelected.delete(file.id);
        } else {
          if (maxSelection && newSelected.size >= maxSelection) {
            Alert.alert(
              "Thông báo",
              `Chỉ có thể chọn tối đa ${maxSelection} file`
            );
            return;
          }
          newSelected.add(file.id);
        }

        if (!externalSelected) {
          setInternalSelected(newSelected);
        }

        onFileSelect?.(file);

        // Notify with full file objects
        const selectedFiles = files.filter((f) => newSelected.has(f.id));
        onFilesSelected?.(selectedFiles);
      } else {
        onFileOpen?.(file);
      }
    },
    [
      selectionMode,
      selectedSet,
      maxSelection,
      files,
      externalSelected,
      onFileSelect,
      onFilesSelected,
      onFileOpen,
    ]
  );

  const handleDownload = useCallback(
    async (file: FileItem) => {
      try {
        await download(file);
        Alert.alert("Thành công", `Đã tải ${file.originalName}`);
      } catch (e) {
        Alert.alert("Lỗi", "Không thể tải file");
      }
    },
    [download]
  );

  const handleShare = useCallback(async (file: FileItem) => {
    try {
      await FileManagerService.shareFile(file);
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể chia sẻ");
    }
  }, []);

  const handleDelete = useCallback(
    (file: FileItem) => {
      Alert.alert(
        "Xác nhận xóa",
        `Bạn có chắc muốn xóa "${file.originalName}"?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
              try {
                await FileManagerService.deleteFile(file.id);
                refresh();
              } catch {
                Alert.alert("Lỗi", "Không thể xóa file");
              }
            },
          },
        ]
      );
    },
    [refresh]
  );

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "list" ? "grid" : "list"));
  }, []);

  // Render item
  const renderItem = useCallback(
    ({ item }: { item: FileItem }) => {
      const downloadProgress = getProgress(item.id);
      return (
        <FileListItem
          file={item}
          viewMode={viewMode}
          isSelected={selectedSet.has(item.id)}
          isDownloading={downloadProgress?.status === "downloading"}
          downloadProgress={downloadProgress?.progress}
          onPress={handleFilePress}
          onLongPress={selectionMode ? undefined : handleFilePress}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={handleDelete}
          showActions={!selectionMode}
        />
      );
    },
    [
      viewMode,
      selectedSet,
      selectionMode,
      getProgress,
      handleFilePress,
      handleDownload,
      handleShare,
      handleDelete,
    ]
  );

  const keyExtractor = useCallback((item: FileItem) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors.primary]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Ionicons
          name="folder-open-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {searchQuery ? "Không tìm thấy file phù hợp" : "Chưa có file nào"}
        </Text>
      </View>
    );
  }, [isLoading, searchQuery, colors.textSecondary]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tìm kiếm file..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Type filter */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={
              (TYPE_OPTIONS.find((t) => t.value === typeFilter)
                ?.icon as keyof typeof Ionicons.glyphMap) || "apps-outline"
            }
            size={18}
            color={typeFilter !== "all" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.filterText,
              { color: typeFilter !== "all" ? colors.primary : colors.text },
            ]}
          >
            {TYPE_OPTIONS.find((t) => t.value === typeFilter)?.label}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Sort */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Ionicons
            name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.filterText, { color: colors.text }]}>
            {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
          </Text>
        </TouchableOpacity>

        {/* View mode toggle */}
        <TouchableOpacity
          style={[
            styles.viewToggle,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={toggleViewMode}
        >
          <Ionicons
            name={viewMode === "list" ? "grid-outline" : "list-outline"}
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>

        {/* File count */}
        <Text style={[styles.fileCount, { color: colors.textSecondary }]}>
          {total} file
        </Text>
      </View>

      {/* Filter dropdown */}
      {showFilters && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {TYPE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                typeFilter === option.value && {
                  backgroundColor: colors.primary + "15",
                },
              ]}
              onPress={() => handleTypeFilter(option.value)}
            >
              <Ionicons
                name={option.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={
                  typeFilter === option.value
                    ? colors.primary
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color:
                      typeFilter === option.value
                        ? colors.primary
                        : colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
              {typeFilter === option.value && (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sort dropdown */}
      {showSortOptions && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                sortBy === option.value && {
                  backgroundColor: colors.primary + "15",
                },
              ]}
              onPress={() => handleSort(option.value)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color:
                      sortBy === option.value ? colors.primary : colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Ionicons
                  name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                  size={16}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Error */}
      {error && (
        <View
          style={[styles.errorBanner, { backgroundColor: colors.error + "15" }]}
        >
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {isLoading && files.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode} // Force re-render on view mode change
          contentContainerStyle={[
            styles.listContent,
            viewMode === "grid" && styles.gridContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && files.length > 0}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}

      {/* Selection footer */}
      {selectionMode && selectedSet.size > 0 && (
        <View
          style={[
            styles.selectionFooter,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <Text style={[styles.selectionText, { color: colors.text }]}>
            Đã chọn {selectedSet.size} file
            {maxSelection && ` / ${maxSelection}`}
          </Text>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.border }]}
            onPress={() => {
              setInternalSelected(new Set());
              onFilesSelected?.([]);
            }}
          >
            <Text style={[styles.clearText, { color: colors.textSecondary }]}>
              Bỏ chọn
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    paddingVertical: 0,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  viewToggle: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  fileCount: {
    marginLeft: "auto",
    fontSize: 13,
  },
  dropdown: {
    position: "absolute",
    top: 110,
    left: 12,
    right: 12,
    zIndex: 100,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 0,
  },
  gridContent: {
    paddingHorizontal: 8,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  selectionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  clearText: {
    fontSize: 13,
  },
});
