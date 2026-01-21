/**
 * Chat Attachment Picker Component
 * Handles image/file selection and upload for chat messages
 *
 * Features:
 * - Image picker from gallery
 * - Camera capture
 * - Document picker
 * - Upload progress indicator
 * - Preview before sending
 */

import { uploadService } from "@/services/api/upload.service";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================

export interface AttachmentFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface UploadedAttachment {
  url: string;
  type: "image" | "file" | "video";
  name: string;
  size?: number;
  thumbnailUrl?: string;
}

interface ChatAttachmentPickerProps {
  /** Callback when attachment is uploaded and ready to send */
  onAttachmentReady: (attachment: UploadedAttachment) => void;
  /** Callback when upload fails */
  onError?: (error: string) => void;
  /** Custom render for trigger button */
  renderTrigger?: (props: {
    onPress: () => void;
    loading: boolean;
  }) => React.ReactNode;
  /** Disable the picker */
  disabled?: boolean;
  /** Max file size in MB (default: 10) */
  maxFileSizeMB?: number;
  /** Allowed file types */
  allowedTypes?: ("image" | "video" | "document")[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_FILE_SIZE_DEFAULT = 10 * 1024 * 1024; // 10MB

const ATTACHMENT_OPTIONS = [
  {
    id: "camera",
    icon: "camera" as const,
    label: "Chụp ảnh",
    color: "#10B981",
  },
  {
    id: "gallery",
    icon: "images" as const,
    label: "Thư viện",
    color: "#3B82F6",
  },
  {
    id: "document",
    icon: "document-text" as const,
    label: "Tài liệu",
    color: "#F59E0B",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function ChatAttachmentPicker({
  onAttachmentReady,
  onError,
  renderTrigger,
  disabled = false,
  maxFileSizeMB = 10,
  allowedTypes = ["image", "video", "document"],
}: ChatAttachmentPickerProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<AttachmentFile | null>(null);

  const maxFileSize = maxFileSizeMB * 1024 * 1024;

  // ============================================================================
  // PERMISSION HELPERS
  // ============================================================================

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cấp quyền truy cập camera để chụp ảnh.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cấp quyền truy cập thư viện ảnh.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  // ============================================================================
  // FILE PICKERS
  // ============================================================================

  const pickFromCamera = async () => {
    setShowOptions(false);

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: AttachmentFile = {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize,
        };

        // Check file size
        if (file.size && file.size > maxFileSize) {
          Alert.alert(
            "File quá lớn",
            `Vui lòng chọn file nhỏ hơn ${maxFileSizeMB}MB`
          );
          return;
        }

        setPreviewFile(file);
      }
    } catch (error) {
      console.error("[ChatAttachment] Camera error:", error);
      onError?.("Không thể chụp ảnh");
    }
  };

  const pickFromGallery = async () => {
    setShowOptions(false);

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: allowedTypes.includes("video")
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: AttachmentFile = {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize,
        };

        // Check file size
        if (file.size && file.size > maxFileSize) {
          Alert.alert(
            "File quá lớn",
            `Vui lòng chọn file nhỏ hơn ${maxFileSizeMB}MB`
          );
          return;
        }

        setPreviewFile(file);
      }
    } catch (error) {
      console.error("[ChatAttachment] Gallery error:", error);
      onError?.("Không thể chọn ảnh");
    }
  };

  const pickDocument = async () => {
    setShowOptions(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: AttachmentFile = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
          size: asset.size,
        };

        // Check file size
        if (file.size && file.size > maxFileSize) {
          Alert.alert(
            "File quá lớn",
            `Vui lòng chọn file nhỏ hơn ${maxFileSizeMB}MB`
          );
          return;
        }

        setPreviewFile(file);
      }
    } catch (error) {
      console.error("[ChatAttachment] Document picker error:", error);
      onError?.("Không thể chọn tài liệu");
    }
  };

  // ============================================================================
  // UPLOAD
  // ============================================================================

  const uploadFile = async () => {
    if (!previewFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress (real progress would come from XHR)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await uploadService.single({
        uri: previewFile.uri,
        name: previewFile.name,
        type: previewFile.type,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Determine attachment type
      const isImage = previewFile.type.startsWith("image/");
      const isVideo = previewFile.type.startsWith("video/");

      const attachment: UploadedAttachment = {
        url: response.url,
        type: isImage ? "image" : isVideo ? "video" : "file",
        name: previewFile.name,
        size: previewFile.size,
        thumbnailUrl: isImage ? response.url : response.thumbnailUrl,
      };

      onAttachmentReady(attachment);
      setPreviewFile(null);
    } catch (error: any) {
      console.error("[ChatAttachment] Upload error:", error);
      onError?.(error.message || "Không thể tải lên file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const cancelPreview = () => {
    setPreviewFile(null);
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOptionPress = (optionId: string) => {
    switch (optionId) {
      case "camera":
        pickFromCamera();
        break;
      case "gallery":
        pickFromGallery();
        break;
      case "document":
        pickDocument();
        break;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const isImage = previewFile?.type.startsWith("image/");

  return (
    <>
      {/* Trigger Button */}
      {renderTrigger ? (
        renderTrigger({
          onPress: () => setShowOptions(true),
          loading: uploading,
        })
      ) : (
        <TouchableOpacity
          style={styles.triggerButton}
          onPress={() => setShowOptions(true)}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#999" />
          ) : (
            <Ionicons name="add-circle" size={28} color="#0066CC" />
          )}
        </TouchableOpacity>
      )}

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Đính kèm</Text>
            <View style={styles.optionsGrid}>
              {ATTACHMENT_OPTIONS.map((option) => {
                // Filter based on allowed types
                if (
                  option.id === "document" &&
                  !allowedTypes.includes("document")
                )
                  return null;
                if (
                  (option.id === "camera" || option.id === "gallery") &&
                  !allowedTypes.includes("image")
                )
                  return null;

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.optionItem}
                    onPress={() => handleOptionPress(option.id)}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: option.color + "20" },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={option.color}
                      />
                    </View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={!!previewFile}
        transparent
        animationType="slide"
        onRequestClose={cancelPreview}
      >
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity
              onPress={cancelPreview}
              style={styles.previewCloseButton}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Xem trước</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.previewContent}>
            {isImage ? (
              <Image
                source={{ uri: previewFile?.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.previewDocument}>
                <Ionicons name="document-text" size={64} color="#666" />
                <Text style={styles.previewDocumentName} numberOfLines={2}>
                  {previewFile?.name}
                </Text>
                {previewFile?.size && (
                  <Text style={styles.previewDocumentSize}>
                    {(previewFile.size / 1024).toFixed(1)} KB
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.previewActions}>
            {uploading ? (
              <View style={styles.uploadProgressContainer}>
                <View
                  style={[
                    styles.uploadProgressBar,
                    { width: `${uploadProgress}%` },
                  ]}
                />
                <Text style={styles.uploadProgressText}>
                  Đang tải lên... {uploadProgress}%
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.previewCancelButton}
                  onPress={cancelPreview}
                >
                  <Text style={styles.previewCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.previewSendButton}
                  onPress={uploadFile}
                >
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.previewSendText}>Gửi</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  triggerButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // Options Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  optionItem: {
    alignItems: "center",
    width: 80,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 13,
    color: "#666",
  },

  // Preview Modal
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  previewCloseButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  previewContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewDocument: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
  },
  previewDocumentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 16,
  },
  previewDocumentSize: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  previewActions: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  previewCancelButton: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  previewCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  previewSendButton: {
    flex: 2,
    backgroundColor: "#0066CC",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewSendText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  // Upload Progress
  uploadProgressContainer: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 12,
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
  },
  uploadProgressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#0066CC",
  },
  uploadProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    zIndex: 1,
  },
});

export default ChatAttachmentPicker;
