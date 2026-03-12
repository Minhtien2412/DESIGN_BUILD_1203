/**
 * FileAttachmentPicker - Modal for selecting files to attach
 * UPLOAD-005: File Browser UI
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import {
    FileItem,
    formatFileSize,
    getFileIcon,
    isPreviewable,
} from "@/services/FileManagerService";
import { FileBrowser } from "./FileBrowser";

// ============================================================================
// TYPES
// ============================================================================

export interface FileAttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (files: FileItem[]) => void;
  maxFiles?: number;
  projectId?: string;
  conversationId?: string;
  title?: string;
  confirmText?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FileAttachmentPicker({
  visible,
  onClose,
  onConfirm,
  maxFiles = 10,
  projectId,
  conversationId,
  title = "Đính kèm file",
  confirmText = "Đính kèm",
}: FileAttachmentPickerProps) {
  const colors = useThemeColor();
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleFilesSelected = useCallback((files: FileItem[]) => {
    setSelectedFiles(files);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsConfirming(true);
    try {
      onConfirm(selectedFiles);
      setSelectedFiles([]);
      onClose();
    } finally {
      setIsConfirming(false);
    }
  }, [selectedFiles, onConfirm, onClose]);

  const handleClose = useCallback(() => {
    setSelectedFiles([]);
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {title}
          </Text>
          <TouchableOpacity
            onPress={() => setShowPreview(!showPreview)}
            style={styles.headerButton}
            disabled={selectedFiles.length === 0}
          >
            <Ionicons
              name={showPreview ? "list-outline" : "eye-outline"}
              size={24}
              color={
                selectedFiles.length > 0 ? colors.text : colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {showPreview && selectedFiles.length > 0 ? (
          <ScrollView style={styles.previewList}>
            <Text
              style={[styles.previewTitle, { color: colors.textSecondary }]}
            >
              Đã chọn ({selectedFiles.length})
            </Text>
            {selectedFiles.map((file) => (
              <View
                key={file.id}
                style={[
                  styles.previewItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* Thumbnail */}
                <View
                  style={[
                    styles.previewThumbnail,
                    { backgroundColor: colors.background },
                  ]}
                >
                  {file.thumbnailUrl && isPreviewable(file.contentType) ? (
                    <Image
                      source={{ uri: file.thumbnailUrl }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <Ionicons
                      name={
                        getFileIcon(
                          file.contentType
                        ) as keyof typeof Ionicons.glyphMap
                      }
                      size={28}
                      color={colors.textSecondary}
                    />
                  )}
                </View>

                {/* Info */}
                <View style={styles.previewInfo}>
                  <Text
                    style={[styles.previewFilename, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {file.originalName}
                  </Text>
                  <Text
                    style={[
                      styles.previewMeta,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {formatFileSize(file.fileSize)}
                  </Text>
                </View>

                {/* Remove button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFile(file.id)}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={colors.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <FileBrowser
            projectId={projectId}
            conversationId={conversationId}
            selectionMode
            maxSelection={maxFiles}
            selectedFiles={selectedFiles.map((f) => f.id)}
            onFilesSelected={handleFilesSelected}
          />
        )}

        {/* Footer */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <View style={styles.footerInfo}>
            <Text style={[styles.footerText, { color: colors.text }]}>
              {selectedFiles.length} / {maxFiles} file
            </Text>
            {selectedFiles.length > 0 && (
              <Text
                style={[styles.footerSize, { color: colors.textSecondary }]}
              >
                {formatFileSize(
                  selectedFiles.reduce((sum, f) => sum + f.fileSize, 0)
                )}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              {
                backgroundColor:
                  selectedFiles.length > 0 ? colors.primary : colors.border,
              },
            ]}
            onPress={handleConfirm}
            disabled={selectedFiles.length === 0 || isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="attach" size={18} color="#fff" />
                <Text style={styles.confirmText}>
                  {confirmText} ({selectedFiles.length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ============================================================================
// FILE PREVIEW CARD (for chat/message)
// ============================================================================

export interface FilePreviewCardProps {
  file: FileItem;
  onPress?: () => void;
  onRemove?: () => void;
  compact?: boolean;
}

export function FilePreviewCard({
  file,
  onPress,
  onRemove,
  compact = false,
}: FilePreviewCardProps) {
  const colors = useThemeColor();
  const canPreview = isPreviewable(file.contentType);

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={getFileIcon(file.contentType) as keyof typeof Ionicons.glyphMap}
          size={18}
          color={colors.primary}
        />
        <Text
          style={[styles.compactFilename, { color: colors.text }]}
          numberOfLines={1}
        >
          {file.originalName}
        </Text>
        {onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.previewCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      {file.thumbnailUrl && canPreview ? (
        <Image
          source={{ uri: file.thumbnailUrl }}
          style={styles.cardThumbnail}
        />
      ) : (
        <View
          style={[
            styles.cardIconContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Ionicons
            name={
              getFileIcon(file.contentType) as keyof typeof Ionicons.glyphMap
            }
            size={32}
            color={colors.textSecondary}
          />
        </View>
      )}

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text
          style={[styles.cardFilename, { color: colors.text }]}
          numberOfLines={2}
        >
          {file.originalName}
        </Text>
        <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
          {formatFileSize(file.fileSize)}
        </Text>
      </View>

      {/* Remove button */}
      {onRemove && (
        <TouchableOpacity
          style={[styles.cardRemove, { backgroundColor: colors.background }]}
          onPress={onRemove}
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  previewList: {
    flex: 1,
    padding: 12,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  previewThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  previewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  previewFilename: {
    fontSize: 14,
    fontWeight: "500",
  },
  previewMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
  },
  footerInfo: {
    flex: 1,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footerSize: {
    fontSize: 12,
    marginTop: 2,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // Compact card
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  compactFilename: {
    fontSize: 13,
    maxWidth: 150,
  },

  // Preview card
  previewCard: {
    width: 160,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 10,
  },
  cardThumbnail: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  cardIconContainer: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    padding: 8,
  },
  cardFilename: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  cardMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  cardRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
});
