/**
 * File & Video Upload/Download Demo Screen
 * Test upload file, video lên server và get download link
 */

import { ToastNotification } from "@/components/ui/toast-notification";
import { useToast } from "@/hooks/use-toast";
import {
    PresignedUploadService,
    UploadProgress,
} from "@/services/PresignedUploadService";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
  uploadedAt: string;
}

export default function FileUploadDemo() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { toast, hideToast, success, error: showError } = useToast();

  /**
   * Pick image from gallery
   */
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        showError("Cần quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile({
          uri: result.assets[0].uri,
          type: "image",
          name: result.assets[0].uri.split("/").pop() || "image.jpg",
          mimeType: "image/jpeg",
        });
        success("Đã chọn ảnh");
      }
    } catch (err: any) {
      showError(err.message || "Lỗi chọn ảnh");
    }
  };

  /**
   * Pick video from gallery
   */
  const pickVideo = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        showError("Cần quyền truy cập thư viện video");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile({
          uri: result.assets[0].uri,
          type: "video",
          name: result.assets[0].uri.split("/").pop() || "video.mp4",
          mimeType: "video/mp4",
        });
        success("Đã chọn video");
      }
    } catch (err: any) {
      showError(err.message || "Lỗi chọn video");
    }
  };

  /**
   * Pick document file
   */
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        setSelectedFile({
          uri: result.uri,
          type: "document",
          name: result.name,
          mimeType: result.mimeType || "application/octet-stream",
          size: result.size,
        });
        success("Đã chọn file: " + result.name);
      }
    } catch (err: any) {
      showError(err.message || "Lỗi chọn file");
    }
  };

  /**
   * Upload file to server
   */
  const uploadFile = async () => {
    if (!selectedFile) {
      showError("Vui lòng chọn file trước");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload via presigned flow with progress
      const result = await PresignedUploadService.upload(selectedFile.uri, {
        filename: selectedFile.name,
        contentType: selectedFile.mimeType,
        onProgress: (prog: UploadProgress) => {
          setUploadProgress(prog.progress);
        },
      });

      const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);

      const uploadedFile: UploadedFile = {
        id: result.fileId || Date.now().toString(),
        filename: result.filename || selectedFile.name,
        originalName: selectedFile.name,
        mimeType: selectedFile.mimeType,
        size: (fileInfo as { size?: number }).size || result.fileSize || 0,
        url: result.fileUrl || "",
        downloadUrl: result.fileUrl || "",
        uploadedAt: result.createdAt || new Date().toISOString(),
      };

      setUploadedFiles((prev) => [uploadedFile, ...prev]);
      setSelectedFile(null);
      setUploadProgress(0);
      success("Upload thành công!");
    } catch (err: any) {
      console.error("Upload error:", err);
      showError(err.message || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Download file from server
   */
  const downloadFile = async (file: UploadedFile) => {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        file.downloadUrl,
        FileSystem.documentDirectory + file.filename,
        {},
        (progress) => {
          const percent =
            (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
            100;
          console.log(`Download progress: ${Math.round(percent)}%`);
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (result) {
        success("Tải xuống thành công!");
        Alert.alert(
          "Tải xuống thành công",
          `File đã được lưu tại:\n${result.uri}`,
          [
            { text: "OK" },
            {
              text: "Mở file",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL(result.uri);
                } else {
                  // Android: Share or open with file manager
                  FileSystem.getContentUriAsync(result.uri).then(
                    (contentUri) => {
                      Linking.openURL(contentUri);
                    },
                  );
                }
              },
            },
          ],
        );
      }
    } catch (err: any) {
      showError(err.message || "Tải xuống thất bại");
    }
  };

  /**
   * Copy download link to clipboard
   */
  const copyLink = async (url: string) => {
    try {
      // Use expo-clipboard if available
      // await Clipboard.setStringAsync(url);

      // Fallback: show URL in alert
      Alert.alert("Download Link", url, [
        { text: "Đóng" },
        {
          text: "Mở link",
          onPress: () => Linking.openURL(url),
        },
      ]);

      success("Đã copy link");
    } catch (err: any) {
      showError("Lỗi copy link");
    }
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upload & Download Test</Text>
          <Text style={styles.subtitle}>
            Test upload file/video lên server và get link
          </Text>
        </View>

        {/* File Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Chọn File</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.pickButton, styles.imageButton]}
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons name="image-outline" size={24} color="#fff" />
              <Text style={styles.pickButtonText}>Chọn Ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickButton, styles.videoButton]}
              onPress={pickVideo}
              disabled={uploading}
            >
              <Ionicons name="videocam-outline" size={24} color="#fff" />
              <Text style={styles.pickButtonText}>Chọn Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickButton, styles.documentButton]}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Ionicons name="document-outline" size={24} color="#fff" />
              <Text style={styles.pickButtonText}>Chọn File</Text>
            </TouchableOpacity>
          </View>

          {/* Selected File Preview */}
          {selectedFile && (
            <View style={styles.selectedFileCard}>
              <View style={styles.selectedFileIcon}>
                <Ionicons
                  name={
                    selectedFile.type === "image"
                      ? "image"
                      : selectedFile.type === "video"
                        ? "videocam"
                        : "document"
                  }
                  size={32}
                  color="#0D9488"
                />
              </View>
              <View style={styles.selectedFileInfo}>
                <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                <Text style={styles.selectedFileType}>
                  {selectedFile.mimeType}
                </Text>
                {selectedFile.size && (
                  <Text style={styles.selectedFileSize}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                )}
              </View>
              {selectedFile.type === "image" && (
                <Image
                  source={{ uri: selectedFile.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        </View>

        {/* Upload Section */}
        {selectedFile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Upload File</Text>

            <TouchableOpacity
              style={[
                styles.uploadButton,
                uploading && styles.uploadButtonDisabled,
              ]}
              onPress={uploadFile}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.uploadButtonText}>
                    Đang upload... {uploadProgress}%
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.uploadButtonText}>Upload lên Server</Text>
                </>
              )}
            </TouchableOpacity>

            {uploading && (
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${uploadProgress}%` }]}
                />
              </View>
            )}
          </View>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              3. Files Đã Upload ({uploadedFiles.length})
            </Text>

            {uploadedFiles.map((file, index) => (
              <View key={file.id} style={styles.fileCard}>
                <View style={styles.fileCardHeader}>
                  <View style={styles.fileCardIcon}>
                    <Ionicons
                      name={
                        file.mimeType.startsWith("image/")
                          ? "image"
                          : file.mimeType.startsWith("video/")
                            ? "videocam"
                            : "document"
                      }
                      size={24}
                      color="#0D9488"
                    />
                  </View>
                  <View style={styles.fileCardInfo}>
                    <Text style={styles.fileCardName}>{file.originalName}</Text>
                    <Text style={styles.fileCardMeta}>
                      {formatFileSize(file.size)} •{" "}
                      {new Date(file.uploadedAt).toLocaleString("vi-VN")}
                    </Text>
                  </View>
                </View>

                {/* Download URL */}
                <View style={styles.linkContainer}>
                  <Text style={styles.linkLabel}>Download Link:</Text>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => copyLink(file.downloadUrl)}
                  >
                    <Text style={styles.linkText} numberOfLines={1}>
                      {file.downloadUrl}
                    </Text>
                    <Ionicons name="copy-outline" size={18} color="#0D9488" />
                  </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.fileActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.downloadActionButton]}
                    onPress={() => downloadFile(file)}
                  >
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Tải xuống</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.openActionButton]}
                    onPress={() => Linking.openURL(file.url)}
                  >
                    <Ionicons name="open-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Mở</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.shareActionButton]}
                    onPress={() => copyLink(file.downloadUrl)}
                  >
                    <Ionicons name="share-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Chia sẻ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Hướng dẫn</Text>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              1. Chọn ảnh/video/file từ thiết bị
            </Text>
            <Text style={styles.instructionText}>
              2. Nhấn &quot;Upload lên Server&quot; để upload
            </Text>
            <Text style={styles.instructionText}>
              3. Sau khi upload thành công, link download sẽ hiển thị
            </Text>
            <Text style={styles.instructionText}>
              4. Bạn có thể copy link, tải xuống hoặc chia sẻ
            </Text>
            <Text
              style={[
                styles.instructionText,
                { marginTop: 12, color: "#000000" },
              ]}
            >
              ✅ Upload sử dụng Presigned URL flow (chuẩn)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D9488",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  pickButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  imageButton: {
    backgroundColor: "#0D9488",
  },
  videoButton: {
    backgroundColor: "#666666",
  },
  documentButton: {
    backgroundColor: "#0D9488",
  },
  pickButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  selectedFileCard: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedFileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedFileInfo: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  selectedFileType: {
    fontSize: 13,
    color: "#666",
  },
  selectedFileSize: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  uploadButton: {
    backgroundColor: "#0D9488",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "#999",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0D9488",
  },
  fileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fileCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  fileCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  fileCardInfo: {
    flex: 1,
  },
  fileCardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  fileCardMeta: {
    fontSize: 12,
    color: "#999",
  },
  linkContainer: {
    marginBottom: 12,
  },
  linkLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  linkButton: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: "#0D9488",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  fileActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  downloadActionButton: {
    backgroundColor: "#0D9488",
  },
  openActionButton: {
    backgroundColor: "#0D9488",
  },
  shareActionButton: {
    backgroundColor: "#666666",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  instructionCard: {
    backgroundColor: "#FFF9DB",
    borderLeftWidth: 4,
    borderLeftColor: "#0D9488",
    padding: 16,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#1A1A1A",
    marginBottom: 6,
    lineHeight: 20,
  },
});
