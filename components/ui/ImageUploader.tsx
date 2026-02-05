/**
 * ImageUploader Component
 * Reusable component for picking and uploading images
 */
import { Colors } from "@/constants/theme";
import {
    MediaFolder,
    MediaUploadService,
    UploadResult,
} from "@/services/MediaUploadService";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================

export interface ImageUploaderProps {
  /** Current image URL (for edit mode) */
  value?: string;
  /** Callback when image is uploaded successfully */
  onUpload: (result: UploadResult) => void;
  /** Callback when image is removed */
  onRemove?: () => void;
  /** Upload folder on server */
  folder?: MediaFolder;
  /** Image aspect ratio for cropping */
  aspect?: [number, number];
  /** Show camera option */
  allowCamera?: boolean;
  /** Show remove button */
  allowRemove?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Component size */
  size?: "small" | "medium" | "large";
  /** Shape */
  shape?: "square" | "circle" | "rectangle";
  /** Custom style */
  style?: any;
  /** Disabled state */
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onUpload,
  onRemove,
  folder = "products",
  aspect = [1, 1],
  allowCamera = true,
  allowRemove = true,
  placeholder = "Thêm ảnh",
  size = "medium",
  shape = "square",
  style,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get dimensions based on size
  const getDimensions = useCallback(() => {
    switch (size) {
      case "small":
        return { width: 80, height: 80 };
      case "large":
        return { width: 200, height: shape === "rectangle" ? 150 : 200 };
      default:
        return { width: 120, height: shape === "rectangle" ? 90 : 120 };
    }
  }, [size, shape]);

  const dimensions = getDimensions();

  // Handle pick from library
  const handlePickFromLibrary = async () => {
    try {
      setUploading(true);
      setProgress(0);

      const result = await MediaUploadService.pickAndUploadImage(
        {
          folder,
          onProgress: setProgress,
        },
        {
          source: "library",
          aspect,
        },
      );

      if (result) {
        onUpload(result);
      }
    } catch (error: any) {
      console.error("[ImageUploader] Error:", error);
      Alert.alert("Lỗi", error.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Handle take photo
  const handleTakePhoto = async () => {
    try {
      setUploading(true);
      setProgress(0);

      const result = await MediaUploadService.takePhotoAndUpload({
        folder,
        onProgress: setProgress,
      });

      if (result) {
        onUpload(result);
      }
    } catch (error: any) {
      console.error("[ImageUploader] Error:", error);
      Alert.alert("Lỗi", error.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Show action sheet
  const handlePress = () => {
    if (disabled || uploading) return;

    if (!allowCamera) {
      handlePickFromLibrary();
      return;
    }

    Alert.alert("Chọn ảnh", "Bạn muốn lấy ảnh từ đâu?", [
      { text: "Thư viện", onPress: handlePickFromLibrary },
      { text: "Camera", onPress: handleTakePhoto },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  // Handle remove
  const handleRemove = () => {
    Alert.alert("Xóa ảnh", "Bạn có chắc muốn xóa ảnh này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          if (value) {
            MediaUploadService.deleteFile(value).catch(console.error);
          }
          onRemove?.();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.uploadArea,
          {
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: shape === "circle" ? dimensions.width / 2 : 8,
          },
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled || uploading}
        activeOpacity={0.7}
      >
        {uploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        ) : value ? (
          <>
            <Image
              source={{ uri: value }}
              style={[
                styles.image,
                {
                  width: dimensions.width,
                  height: dimensions.height,
                  borderRadius: shape === "circle" ? dimensions.width / 2 : 8,
                },
              ]}
              resizeMode="cover"
            />
            {allowRemove && !disabled && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemove}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            )}
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="add-circle-outline"
              size={size === "small" ? 24 : 32}
              color="#999"
            />
            <Text
              style={[
                styles.placeholderText,
                size === "small" && styles.smallText,
              ]}
            >
              {placeholder}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// MULTI IMAGE UPLOADER
// ============================================================================

export interface MultiImageUploaderProps {
  /** Current image URLs */
  values: string[];
  /** Callback when images change */
  onChange: (urls: string[]) => void;
  /** Max number of images */
  maxImages?: number;
  /** Upload folder */
  folder?: MediaFolder;
  /** Aspect ratio */
  aspect?: [number, number];
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  values = [],
  onChange,
  maxImages = 5,
  folder = "products/gallery",
  aspect = [4, 3],
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = (result: UploadResult) => {
    onChange([...values, result.url]);
  };

  const handleRemove = (index: number) => {
    const newValues = [...values];
    const removed = newValues.splice(index, 1)[0];
    onChange(newValues);

    // Delete from server
    if (removed) {
      MediaUploadService.deleteFile(removed).catch(console.error);
    }
  };

  const canAddMore = values.length < maxImages;

  return (
    <View style={styles.multiContainer}>
      {values.map((url, index) => (
        <View key={url} style={styles.multiItem}>
          <Image source={{ uri: url }} style={styles.multiImage} />
          <TouchableOpacity
            style={styles.multiRemoveBtn}
            onPress={() => handleRemove(index)}
          >
            <Ionicons name="close-circle" size={22} color="#FF3B30" />
          </TouchableOpacity>
          {index === 0 && (
            <View style={styles.mainBadge}>
              <Text style={styles.mainBadgeText}>Chính</Text>
            </View>
          )}
        </View>
      ))}

      {canAddMore && (
        <ImageUploader
          folder={folder}
          aspect={aspect}
          onUpload={handleUpload}
          size="medium"
          placeholder={`+${maxImages - values.length}`}
          allowRemove={false}
        />
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  uploadArea: {
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  image: {
    backgroundColor: "#e0e0e0",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 4,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  smallText: {
    fontSize: 10,
  },
  loadingContainer: {
    alignItems: "center",
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 4,
    alignItems: "center",
  },

  // Multi uploader
  multiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  multiItem: {
    position: "relative",
  },
  multiImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  multiRemoveBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 11,
  },
  mainBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default ImageUploader;
