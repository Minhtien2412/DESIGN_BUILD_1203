/**
 * FileBrowser Component
 * =====================
 *
 * Document/File browser để chọn và quản lý documents
 *
 * Features:
 * - List view với file info
 * - Filter by type (PDF, DOC, XLS, etc.)
 * - Sorting (name, date, size)
 * - Single/Multi selection
 * - File preview
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Local type matching expo-document-picker asset structure
interface PickedDocumentAsset {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

// ============================================================================
// Types
// ============================================================================

export interface FileAsset {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  size: number; // bytes
  extension: string;
  lastModified?: number;
}

export type FileType =
  | "all"
  | "pdf"
  | "doc"
  | "xls"
  | "image"
  | "video"
  | "audio"
  | "archive";

export type SortBy = "name" | "date" | "size" | "type";
export type SortOrder = "asc" | "desc";

export interface FileBrowserProps {
  /** Chế độ chọn */
  selectionMode?: "single" | "multiple";
  /** Giới hạn số file chọn (multiple mode) */
  maxSelection?: number;
  /** Lọc theo loại file */
  fileTypes?: FileType[];
  /** Allowed mime types */
  allowedMimeTypes?: string[];
  /** Default sort */
  defaultSortBy?: SortBy;
  /** Default sort order */
  defaultSortOrder?: SortOrder;
  /** Selected files (controlled) */
  selectedFiles?: FileAsset[];
  /** Callback khi chọn */
  onSelectionChange?: (files: FileAsset[]) => void;
  /** Callback khi confirm */
  onConfirm?: (files: FileAsset[]) => void;
  /** Callback khi cancel */
  onCancel?: () => void;
  /** Hiển thị header */
  showHeader?: boolean;
  /** Header title */
  headerTitle?: string;
  /** Cho phép chọn từ document picker */
  allowDocumentPicker?: boolean;
}

// ============================================================================
// File Type Mappings
// ============================================================================

const FILE_TYPE_ICONS: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  pdf: { icon: "document-text", color: "#E53935" },
  doc: { icon: "document", color: "#1976D2" },
  docx: { icon: "document", color: "#1976D2" },
  xls: { icon: "grid", color: "#43A047" },
  xlsx: { icon: "grid", color: "#43A047" },
  ppt: { icon: "easel", color: "#FB8C00" },
  pptx: { icon: "easel", color: "#FB8C00" },
  txt: { icon: "document-text-outline", color: "#757575" },
  zip: { icon: "archive", color: "#7B1FA2" },
  rar: { icon: "archive", color: "#7B1FA2" },
  "7z": { icon: "archive", color: "#7B1FA2" },
  jpg: { icon: "image", color: "#00ACC1" },
  jpeg: { icon: "image", color: "#00ACC1" },
  png: { icon: "image", color: "#00ACC1" },
  gif: { icon: "image", color: "#00ACC1" },
  mp4: { icon: "videocam", color: "#D81B60" },
  mov: { icon: "videocam", color: "#D81B60" },
  mp3: { icon: "musical-notes", color: "#8E24AA" },
  wav: { icon: "musical-notes", color: "#8E24AA" },
  default: { icon: "document-outline", color: "#9E9E9E" },
};

const MIME_TYPE_MAP: Record<FileType, string[]> = {
  all: ["*/*"],
  pdf: ["application/pdf"],
  doc: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  xls: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  image: ["image/*"],
  video: ["video/*"],
  audio: ["audio/*"],
  archive: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ],
};

// ============================================================================
// Main Component
// ============================================================================

export function FileBrowser({
  selectionMode = "single",
  maxSelection = 10,
  fileTypes = ["all"],
  allowedMimeTypes,
  defaultSortBy = "date",
  defaultSortOrder = "desc",
  selectedFiles: controlledSelected,
  onSelectionChange,
  onConfirm,
  onCancel,
  showHeader = true,
  headerTitle = "Chọn tài liệu",
  allowDocumentPicker = true,
}: FileBrowserProps) {
  // State
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const [filterType, setFilterType] = useState<FileType>("all");

  // Theme
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  // ============================================
  // Document Picker
  // ============================================

  const handlePickDocument = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build mime types
      let mimeTypes: string[] = [];
      if (allowedMimeTypes) {
        mimeTypes = allowedMimeTypes;
      } else {
        fileTypes.forEach((type) => {
          const types = MIME_TYPE_MAP[type];
          if (types) {
            mimeTypes.push(...types);
          }
        });
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes.length > 0 ? mimeTypes : ["*/*"],
        multiple: selectionMode === "multiple",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles: FileAsset[] = result.assets.map(
          (asset: PickedDocumentAsset, index: number) => {
            const extension = getFileExtension(asset.name);
            return {
              id: `file_${Date.now()}_${index}`,
              uri: asset.uri,
              name: asset.name,
              mimeType: asset.mimeType || "application/octet-stream",
              size: asset.size || 0,
              extension,
              lastModified: Date.now(),
            };
          },
        );

        // Add to files list
        setFiles((prev) => {
          const existingUris = new Set(prev.map((f) => f.uri));
          const uniqueNew = newFiles.filter((f) => !existingUris.has(f.uri));
          return [...uniqueNew, ...prev];
        });

        // Auto-select if single mode
        if (selectionMode === "single" && newFiles.length > 0) {
          setSelectedIds(new Set([newFiles[0].id]));
          onSelectionChange?.([newFiles[0]]);
        } else if (selectionMode === "multiple") {
          // Add to selection
          setSelectedIds((prev) => {
            const newSet = new Set(prev);
            newFiles.forEach((f) => {
              if (newSet.size < maxSelection) {
                newSet.add(f.id);
              }
            });
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error("[FileBrowser] Pick document error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    fileTypes,
    allowedMimeTypes,
    selectionMode,
    maxSelection,
    onSelectionChange,
  ]);

  // ============================================
  // Selection handlers
  // ============================================

  const handleSelect = useCallback(
    (file: FileAsset) => {
      if (selectionMode === "single") {
        setSelectedIds(new Set([file.id]));
        onSelectionChange?.([file]);
      } else {
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(file.id)) {
            newSet.delete(file.id);
          } else {
            if (newSet.size >= maxSelection) {
              return prev;
            }
            newSet.add(file.id);
          }

          const selectedFiles = files.filter((f) => newSet.has(f.id));
          onSelectionChange?.(selectedFiles);

          return newSet;
        });
      }
    },
    [selectionMode, maxSelection, files, onSelectionChange],
  );

  const handleConfirm = useCallback(() => {
    const selectedFiles = files.filter((f) => selectedIds.has(f.id));
    onConfirm?.(selectedFiles);
  }, [files, selectedIds, onConfirm]);

  // ============================================
  // Sorting & Filtering
  // ============================================

  const sortedFiles = React.useMemo(() => {
    let filtered = [...files];

    // Filter by type
    if (filterType !== "all") {
      const mimeTypes = MIME_TYPE_MAP[filterType];
      if (mimeTypes) {
        filtered = filtered.filter((f) =>
          mimeTypes.some((m) => {
            if (m === "*/*") return true;
            if (m.endsWith("/*")) {
              const prefix = m.replace("/*", "");
              return f.mimeType.startsWith(prefix);
            }
            return f.mimeType === m;
          }),
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = (a.lastModified || 0) - (b.lastModified || 0);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "type":
          comparison = a.extension.localeCompare(b.extension);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [files, filterType, sortBy, sortOrder]);

  // ============================================
  // Render
  // ============================================

  const renderItem = useCallback(
    ({ item }: { item: FileAsset }) => {
      const isSelected = selectedIds.has(item.id);
      const fileIcon =
        FILE_TYPE_ICONS[item.extension.toLowerCase()] ||
        FILE_TYPE_ICONS.default;

      return (
        <TouchableOpacity
          style={[
            styles.fileItem,
            {
              backgroundColor: isSelected ? `${primaryColor}15` : "transparent",
            },
          ]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          {/* File Icon */}
          <View
            style={[
              styles.fileIconContainer,
              { backgroundColor: `${fileIcon.color}15` },
            ]}
          >
            <Ionicons name={fileIcon.icon} size={24} color={fileIcon.color} />
          </View>

          {/* File Info */}
          <View style={styles.fileInfo}>
            <Text
              style={[styles.fileName, { color: textColor }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={[styles.fileMeta, { color: secondaryTextColor }]}>
              {formatFileSize(item.size)} • {item.extension.toUpperCase()}
            </Text>
          </View>

          {/* Selection indicator */}
          <View
            style={[
              styles.checkbox,
              {
                borderColor: isSelected ? primaryColor : surfaceColor,
                backgroundColor: isSelected ? primaryColor : "transparent",
              },
            ]}
          >
            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        </TouchableOpacity>
      );
    },
    [
      selectedIds,
      primaryColor,
      textColor,
      secondaryTextColor,
      surfaceColor,
      handleSelect,
    ],
  );

  const renderFilterChip = useCallback(
    (type: FileType, label: string) => {
      const isActive = filterType === type;
      return (
        <TouchableOpacity
          key={type}
          style={[
            styles.filterChip,
            {
              backgroundColor: isActive ? primaryColor : surfaceColor,
            },
          ]}
          onPress={() => setFilterType(type)}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: isActive ? "#fff" : textColor },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    },
    [filterType, primaryColor, surfaceColor, textColor],
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: surfaceColor }]}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Text style={[styles.cancelText, { color: textColor }]}>Hủy</Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: textColor }]}>
            {headerTitle}
            {selectionMode === "multiple" && selectedIds.size > 0 && (
              <Text style={{ color: primaryColor }}> ({selectedIds.size})</Text>
            )}
          </Text>

          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.headerButton}
            disabled={selectedIds.size === 0}
          >
            <Text
              style={[
                styles.confirmText,
                {
                  color: selectedIds.size > 0 ? primaryColor : surfaceColor,
                },
              ]}
            >
              Xong
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterContainer}>
        {renderFilterChip("all", "Tất cả")}
        {renderFilterChip("pdf", "PDF")}
        {renderFilterChip("doc", "Word")}
        {renderFilterChip("xls", "Excel")}
        {renderFilterChip("image", "Ảnh")}
      </View>

      {/* Pick Document Button */}
      {allowDocumentPicker && (
        <TouchableOpacity
          style={[styles.pickButton, { backgroundColor: primaryColor }]}
          onPress={handlePickDocument}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.pickButtonText}>Chọn tài liệu</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Files List */}
      <FlatList
        data={sortedFiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: surfaceColor }]} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="folder-open-outline"
              size={48}
              color={surfaceColor}
            />
            <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
              Chưa có tài liệu nào
            </Text>
            <Text style={[styles.emptySubtext, { color: secondaryTextColor }]}>
              Nhấn "Chọn tài liệu" để thêm file
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 16,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },

  // Filters
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Pick Button
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  pickButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  // List
  listContent: {
    padding: 16,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "500",
  },
  fileMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
  },
});

export default FileBrowser;
