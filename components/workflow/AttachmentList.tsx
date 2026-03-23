/**
 * AttachmentList — Displays a list of file attachments with icons and actions
 */
import type { FileMetadata } from "@/types/workflow";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  attachments: FileMetadata[];
  onPreview?: (attachment: FileMetadata) => void;
  onDownload?: (attachment: FileMetadata) => void;
  onRemove?: (attachment: FileMetadata) => void;
}

const EXT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  pdf: "document-text-outline",
  doc: "document-outline",
  docx: "document-outline",
  xls: "grid-outline",
  xlsx: "grid-outline",
  png: "image-outline",
  jpg: "image-outline",
  jpeg: "image-outline",
  mp4: "videocam-outline",
  zip: "archive-outline",
};

function getIcon(filename: string): keyof typeof Ionicons.glyphMap {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return EXT_ICONS[ext] || "document-attach-outline";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function isImageFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
}

export const AttachmentList = memo<Props>(
  ({ attachments, onPreview, onDownload, onRemove }) => {
    const renderItem = useCallback(
      ({ item }: { item: FileMetadata }) => (
        <View style={styles.row}>
          {isImageFile(item.filename) && item.url ? (
            <Image source={{ uri: item.url }} style={styles.thumb} />
          ) : (
            <View style={styles.iconBox}>
              <Ionicons
                name={getIcon(item.filename)}
                size={20}
                color="#6B7280"
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.info}
            onPress={() => onPreview?.(item)}
            disabled={!onPreview}
          >
            <Text style={styles.name} numberOfLines={1}>
              {item.filename}
            </Text>
            <Text style={styles.meta}>
              {formatSize(item.size)} · {item.contentType}
            </Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            {onDownload && (
              <TouchableOpacity onPress={() => onDownload(item)} hitSlop={8}>
                <Ionicons name="download-outline" size={18} color="#0D9488" />
              </TouchableOpacity>
            )}
            {onRemove && (
              <TouchableOpacity onPress={() => onRemove(item)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ),
      [onPreview, onDownload, onRemove],
    );

    if (attachments.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="attach-outline" size={24} color="#D1D5DB" />
          <Text style={styles.emptyText}>Chưa có tập tin đính kèm</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={attachments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  meta: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});
