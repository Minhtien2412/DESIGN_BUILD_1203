/**
 * SignaturePreview — Displays captured signature with status and actions
 *
 * Shows SVG signature data URI, file size estimate, and action buttons
 * for re-signing, clearing, or confirming.
 *
 * @created 2026-03-16 — Round 5 production implementation
 */
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface SignaturePreviewProps {
  /** SVG data URI from SignaturePad.toDataURL() */
  signatureUri: string | null;
  /** Upload status */
  status?: "idle" | "uploading" | "uploaded" | "failed";
  /** Error message */
  error?: string | null;
  /** Clear signature */
  onClear?: () => void;
  /** Re-sign */
  onResign?: () => void;
  /** Upload/confirm */
  onConfirm?: () => void;
  /** Hide actions */
  compact?: boolean;
}

export const SignaturePreview = memo<SignaturePreviewProps>(
  ({
    signatureUri,
    status = "idle",
    error,
    onClear,
    onResign,
    onConfirm,
    compact = false,
  }) => {
    if (!signatureUri) {
      return (
        <View style={styles.empty}>
          <Ionicons name="create-outline" size={28} color="#D1D5DB" />
          <Text style={styles.emptyText}>Chưa có chữ ký</Text>
        </View>
      );
    }

    const isUploaded = status === "uploaded";
    const isUploading = status === "uploading";
    const isFailed = status === "failed";

    return (
      <View style={styles.container}>
        {/* Signature image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: signatureUri }}
            style={styles.signatureImage}
            resizeMode="contain"
          />
        </View>

        {/* Status line */}
        <View style={styles.statusRow}>
          <Ionicons
            name={
              isUploaded
                ? "checkmark-circle"
                : isFailed
                  ? "alert-circle"
                  : isUploading
                    ? "cloud-upload-outline"
                    : "create-outline"
            }
            size={16}
            color={
              isUploaded
                ? "#10B981"
                : isFailed
                  ? "#EF4444"
                  : isUploading
                    ? "#F59E0B"
                    : "#6B7280"
            }
          />
          <Text
            style={[
              styles.statusText,
              isUploaded && styles.statusSuccess,
              isFailed && styles.statusError,
            ]}
          >
            {isUploaded
              ? "Chữ ký đã lưu"
              : isUploading
                ? "Đang tải lên..."
                : isFailed
                  ? error || "Lưu thất bại"
                  : "Chữ ký sẵn sàng"}
          </Text>
        </View>

        {/* Actions */}
        {!compact && (
          <View style={styles.actions}>
            {onResign && !isUploading && (
              <TouchableOpacity style={styles.actionBtn} onPress={onResign}>
                <Ionicons name="refresh-outline" size={16} color="#6B7280" />
                <Text style={styles.actionText}>Ký lại</Text>
              </TouchableOpacity>
            )}
            {onClear && !isUploading && (
              <TouchableOpacity style={styles.actionBtn} onPress={onClear}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={[styles.actionText, styles.clearText]}>Xóa</Text>
              </TouchableOpacity>
            )}
            {onConfirm && !isUploaded && !isUploading && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={onConfirm}
              >
                <Ionicons name="checkmark-outline" size={16} color="#fff" />
                <Text style={styles.confirmText}>Xác nhận</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  imageContainer: {
    backgroundColor: "#FAFAFA",
    padding: 8,
  },
  signatureImage: {
    width: "100%",
    height: 120,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  statusSuccess: {
    color: "#10B981",
  },
  statusError: {
    color: "#EF4444",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  clearText: {
    color: "#EF4444",
  },
  confirmBtn: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
    marginLeft: "auto",
  },
  confirmText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});
