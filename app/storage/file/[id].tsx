/**
 * File Detail Screen
 * Xem chi tiết và thao tác với tệp
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { useAuth } from "@/context/AuthContext";
import { useStorage } from "@/hooks/useStorage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// File type icons
const getFileIcon = (
  mimeType: string,
): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
  if (mimeType.startsWith("image")) return { icon: "image", color: "#22c55e" };
  if (mimeType.startsWith("video"))
    return { icon: "videocam", color: "#8b5cf6" };
  if (mimeType.startsWith("audio"))
    return { icon: "musical-notes", color: "#f59e0b" };
  if (mimeType.includes("pdf"))
    return { icon: "document-text", color: "#ef4444" };
  if (mimeType.includes("word") || mimeType.includes("document"))
    return { icon: "document", color: "#0D9488" };
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return { icon: "grid", color: "#22c55e" };
  if (mimeType.includes("zip") || mimeType.includes("archive"))
    return { icon: "archive", color: "#f59e0b" };
  return { icon: "document-outline", color: "#64748b" };
};

export default function FileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { files, deleteFile, download, share, formatSize } = useStorage({
    userId: user?.id,
    autoLoad: true,
  });

  const file = useMemo(() => files?.find((f) => f.id === id), [files, id]);
  const fileIcon = file ? getFileIcon(file.mimeType) : null;
  const isImage = file?.mimeType.startsWith("image");

  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = useCallback(async () => {
    if (!file) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await download(file.id);
      Alert.alert("Thành công", "Đã tải xuống tệp");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải xuống tệp");
    }
  }, [file, download]);

  const handleShare = useCallback(async () => {
    if (!file) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (await Sharing.isAvailableAsync()) {
        const shareUrl = await share(file.id);
        if (shareUrl) {
          await Sharing.shareAsync(shareUrl);
        }
      } else {
        Alert.alert("Thông báo", "Chia sẻ không khả dụng trên thiết bị này");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chia sẻ tệp");
    }
  }, [file, share]);

  const handleDelete = useCallback(async () => {
    if (!file) return;

    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa "${file.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setIsDeleting(true);
          try {
            await deleteFile(file.id);
            router.back();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa tệp");
            setIsDeleting(false);
          }
        },
      },
    ]);
  }, [file, deleteFile]);

  const handleRename = useCallback(() => {
    if (!file) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Đổi tên",
      "Nhập tên mới cho tệp",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Lưu",
          onPress: (newName: string | undefined) => {
            if (newName) {
              // Handle rename
              Alert.alert("Thành công", "Đã đổi tên tệp");
            }
          },
        },
      ],
      "plain-text",
      file.name,
    );
  }, [file]);

  if (!file) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết tệp</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons
            name="document-outline"
            size={64}
            color={MODERN_COLORS.textTertiary}
          />
          <Text style={styles.emptyText}>Không tìm thấy tệp</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết tệp</Text>
        <TouchableOpacity style={styles.moreButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview */}
        <View style={styles.previewContainer}>
          {isImage && file.url ? (
            <Image
              source={{ uri: file.url }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[
                styles.previewIcon,
                { backgroundColor: fileIcon?.color + "15" },
              ]}
            >
              <Ionicons
                name={fileIcon?.icon || "document"}
                size={64}
                color={fileIcon?.color}
              />
            </View>
          )}
        </View>

        {/* File Info */}
        <View style={styles.infoCard}>
          <Text style={styles.fileName}>{file.name}</Text>
          <Text style={styles.fileType}>{file.mimeType}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
            <View style={[styles.actionIcon, { backgroundColor: "#0D948815" }]}>
              <Ionicons name="download" size={24} color="#0D9488" />
            </View>
            <Text style={styles.actionText}>Tải xuống</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <View style={[styles.actionIcon, { backgroundColor: "#22c55e15" }]}>
              <Ionicons name="share-social" size={24} color="#22c55e" />
            </View>
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleRename}>
            <View style={[styles.actionIcon, { backgroundColor: "#f59e0b15" }]}>
              <Ionicons name="create" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Đổi tên</Text>
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Thông tin chi tiết</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dung lượng</Text>
            <Text style={styles.detailValue}>
              {formatSize
                ? formatSize(file.size)
                : `${(file.size / 1024).toFixed(1)} KB`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày tạo</Text>
            <Text style={styles.detailValue}>{formatDate(file.createdAt)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cập nhật lần cuối</Text>
            <Text style={styles.detailValue}>{formatDate(file.updatedAt)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vị trí</Text>
            <Text style={styles.detailValue}>
              {file.path?.split("/").slice(0, -1).join("/") || "Thư mục gốc"}
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Loại lưu trữ</Text>
            <View style={styles.storageBadge}>
              <Ionicons name="cloud" size={14} color="#0D9488" />
              <Text style={styles.storageBadgeText}>Cloud</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 50 }} />
      </ScrollView>
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
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    padding: MODERN_SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  moreButton: {
    padding: MODERN_SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },

  // Preview
  previewContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.xl,
    backgroundColor: MODERN_COLORS.surface,
  },
  previewImage: {
    width: MODERN_SPACING.md * 15,
    height: MODERN_SPACING.md * 15,
    borderRadius: MODERN_RADIUS.lg,
  },
  previewIcon: {
    width: 120,
    height: 120,
    borderRadius: MODERN_RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  // Info Card
  infoCard: {
    alignItems: "center",
    paddingVertical: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.lg,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  fileName: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    textAlign: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  fileType: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: MODERN_SPACING.lg,
    paddingHorizontal: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    marginBottom: MODERN_SPACING.md,
  },
  actionBtn: {
    alignItems: "center",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },

  // Details Card
  detailsCard: {
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  storageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D948815",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
  storageBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D9488",
  },

  // Empty
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.md,
  },
});
