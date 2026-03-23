/**
 * PhotoConfirmationButton — Launches camera or gallery for confirmation photo
 */
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  imageUri?: string | null;
  isCapturing?: boolean;
  onCapture: () => void;
  onPick: () => void;
  onClear?: () => void;
}

export const PhotoConfirmationButton = memo<Props>(
  ({ imageUri, isCapturing, onCapture, onPick, onClear }) => {
    if (imageUri) {
      return (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <View style={styles.previewActions}>
            <Text style={styles.previewLabel}>Ảnh xác nhận đã chụp</Text>
            {onClear && (
              <TouchableOpacity onPress={onClear} hitSlop={8}>
                <Text style={styles.clearText}>Xóa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={onCapture}
          disabled={isCapturing}
          activeOpacity={0.7}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color="#0D9488" />
          ) : (
            <Ionicons name="camera-outline" size={24} color="#0D9488" />
          )}
          <Text style={styles.btnText}>Chụp ảnh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={onPick}
          disabled={isCapturing}
          activeOpacity={0.7}
        >
          <Ionicons name="images-outline" size={24} color="#0D9488" />
          <Text style={styles.btnText}>Chọn ảnh</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#0D9488",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
    gap: 6,
  },
  btnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D9488",
  },
  previewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  preview: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  previewActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  clearText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
});
