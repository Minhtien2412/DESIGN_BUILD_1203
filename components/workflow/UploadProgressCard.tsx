/**
 * UploadProgressCard — Shows file upload status with progress bar
 */
import type { UploadState } from "@/types/workflow";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  state: UploadState;
  filename?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

const STATUS_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  idle: "cloud-upload-outline",
  picking: "folder-open-outline",
  uploading: "cloud-upload-outline",
  uploaded: "checkmark-circle",
  failed: "alert-circle-outline",
  canceled: "close-circle-outline",
};

const STATUS_COLORS: Record<string, string> = {
  idle: "#9CA3AF",
  picking: "#3B82F6",
  uploading: "#F59E0B",
  uploaded: "#10B981",
  failed: "#EF4444",
  canceled: "#9CA3AF",
};

export const UploadProgressCard = memo<Props>(
  ({ state, filename, onCancel, onRetry }) => {
    const color = STATUS_COLORS[state.status] || "#9CA3AF";
    const icon = STATUS_ICONS[state.status] || "cloud-upload-outline";

    return (
      <View style={styles.card}>
        <Ionicons name={icon} size={22} color={color} />
        <View style={styles.content}>
          <Text style={styles.filename} numberOfLines={1}>
            {filename || state.file?.filename || "Tập tin"}
          </Text>

          {state.status === "uploading" && (
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${state.progress}%` }]}
              />
            </View>
          )}

          {state.status === "uploading" && (
            <Text style={styles.pct}>{state.progress}%</Text>
          )}

          {state.status === "failed" && state.error && (
            <Text style={styles.errorText} numberOfLines={1}>
              {state.error}
            </Text>
          )}

          {state.status === "uploaded" && (
            <Text style={styles.successText}>Tải lên thành công</Text>
          )}
        </View>

        {state.status === "uploading" && onCancel && (
          <TouchableOpacity onPress={onCancel} hitSlop={8}>
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {state.status === "failed" && onRetry && (
          <TouchableOpacity onPress={onRetry} hitSlop={8}>
            <Ionicons name="refresh" size={18} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  filename: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#0D9488",
    borderRadius: 2,
  },
  pct: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  errorText: {
    fontSize: 11,
    color: "#EF4444",
  },
  successText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "500",
  },
});
