/**
 * DownloadActionButton — Triggers file download with progress indicator
 */
import type { DownloadState } from "@/types/workflow";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  state: DownloadState;
  label?: string;
  onDownload: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
}

export const DownloadActionButton = memo<Props>(
  ({ state, label, onDownload, onCancel, onPreview }) => {
    const isDownloading = state.status === "downloading";
    const isDone = state.status === "ready";
    const isFailed = state.status === "failed";

    return (
      <View style={styles.row}>
        {isDone && onPreview ? (
          <TouchableOpacity style={styles.previewBtn} onPress={onPreview}>
            <Ionicons name="eye-outline" size={16} color="#0D9488" />
            <Text style={styles.previewText}>Xem</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, isDone && styles.btnDone]}
            onPress={isFailed || !isDownloading ? onDownload : undefined}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.btnText}>{state.progress}%</Text>
              </>
            ) : isDone ? (
              <>
                <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                <Text style={styles.btnText}>Đã tải</Text>
              </>
            ) : isFailed ? (
              <>
                <Ionicons name="refresh" size={16} color="#FFF" />
                <Text style={styles.btnText}>Thử lại</Text>
              </>
            ) : (
              <>
                <Ionicons name="download-outline" size={16} color="#FFF" />
                <Text style={styles.btnText}>{label || "Tải xuống"}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isDownloading && onCancel && (
          <TouchableOpacity onPress={onCancel} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnDone: {
    backgroundColor: "#10B981",
  },
  btnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0D9488",
  },
  previewText: {
    color: "#0D9488",
    fontSize: 13,
    fontWeight: "600",
  },
});
