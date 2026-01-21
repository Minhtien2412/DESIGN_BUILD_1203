/**
 * DocumentScannerScreen.tsx
 *
 * Document scanning screen with edge detection overlay, multi-page capture,
 * perspective correction, and export options.
 *
 * Story: CAM-002 - Document Scan
 */

import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
} from "react-native-reanimated";

import { useThemeColor } from "../../hooks/useThemeColor";
import {
    DocumentScanService,
    ExportResult,
    ScannedPage,
    formatFileSize,
    formatSessionDate,
    useDocumentScanner,
    useScanSessions
} from "../../services/DocumentScanService";

// ============================================================================
// Types
// ============================================================================

interface DocumentScannerScreenProps {
  /** Callback when scan session is completed */
  onComplete?: (result: ExportResult) => void;
  /** Callback when scanner is closed */
  onClose?: () => void;
  /** Initial session ID to continue */
  initialSessionId?: string;
  /** Maximum pages allowed */
  maxPages?: number;
  /** Auto-process scanned images */
  autoProcess?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const THUMBNAIL_SIZE = 80;
const GUIDE_ASPECT_RATIO = 210 / 297; // A4

// ============================================================================
// Component
// ============================================================================

export function DocumentScannerScreen({
  onComplete,
  onClose,
  initialSessionId,
  maxPages = 50,
  autoProcess = true,
}: DocumentScannerScreenProps) {
  // Theme
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");

  // Permissions
  const [permission, requestPermission] = useCameraPermissions();

  // State
  const [sessionId, setSessionId] = useState<string | null>(
    initialSessionId || null
  );
  const [facing, setFacing] = useState<CameraType>("back");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Hooks
  const {
    sessions,
    create: createSession,
    loading: sessionsLoading,
  } = useScanSessions();
  const {
    session,
    pages,
    processing,
    error,
    addPage,
    removePage,
    reorder,
    exportPDF,
    exportImages,
    refresh,
  } = useDocumentScanner(sessionId);

  // Refs
  const cameraRef = useRef<CameraView>(null);

  // Animations
  const captureScale = useSharedValue(1);
  const guideOpacity = useSharedValue(0.6);

  // Initialize session
  useEffect(() => {
    const init = async () => {
      await DocumentScanService.initialize();

      if (!sessionId && !initialSessionId) {
        const newSession = await createSession();
        setSessionId(newSession.id);
      }
    };
    init();
  }, [sessionId, initialSessionId, createSession]);

  // Animate guide overlay
  useEffect(() => {
    guideOpacity.value = withRepeat(
      withSequence(
        withSpring(0.8, { duration: 1000 }),
        withSpring(0.6, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [guideOpacity]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || capturing || !sessionId) return;

    if (pages.length >= maxPages) {
      Alert.alert("Giới hạn", `Đã đạt tối đa ${maxPages} trang`);
      return;
    }

    setCapturing(true);
    captureScale.value = withSequence(
      withSpring(0.9, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setPreviewUri(photo.uri);
        setShowPreview(true);
      }
    } catch (err) {
      console.error("[Scanner] Capture failed:", err);
      Alert.alert("Lỗi", "Không thể chụp ảnh");
    } finally {
      setCapturing(false);
    }
  }, [capturing, sessionId, pages.length, maxPages, captureScale]);

  const handleConfirmCapture = useCallback(async () => {
    if (!previewUri || !sessionId) return;

    await addPage(previewUri, autoProcess);
    setShowPreview(false);
    setPreviewUri(null);
  }, [previewUri, sessionId, addPage, autoProcess]);

  const handleRetake = useCallback(() => {
    setShowPreview(false);
    setPreviewUri(null);
  }, []);

  const handlePickFromGallery = useCallback(async () => {
    if (!sessionId) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsMultipleSelection: true,
      selectionLimit: maxPages - pages.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      for (const asset of result.assets) {
        await addPage(asset.uri, autoProcess);
      }
    }
  }, [sessionId, maxPages, pages.length, addPage, autoProcess]);

  const handleToggleFlash = useCallback(() => {
    setFlashEnabled((prev) => !prev);
  }, []);

  const handleFlipCamera = useCallback(() => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }, []);

  const handleRemovePage = useCallback(
    (pageId: string) => {
      Alert.alert("Xóa trang", "Bạn có chắc muốn xóa trang này?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removePage(pageId),
        },
      ]);
    },
    [removePage]
  );

  const handleExport = useCallback(
    async (format: "pdf" | "images") => {
      if (!sessionId || pages.length === 0) return;

      setExporting(true);

      try {
        let result: ExportResult;

        if (format === "pdf") {
          result = await exportPDF({ quality: "high" });
        } else {
          result = await exportImages("high");
        }

        if (result.success) {
          setShowExportModal(false);

          Alert.alert(
            "Xuất thành công",
            `Đã xuất ${result.pageCount} trang (${formatFileSize(result.fileSize)})`,
            [
              { text: "Đóng" },
              {
                text: "Chia sẻ",
                onPress: () => DocumentScanService.share(result.uri),
              },
            ]
          );

          onComplete?.(result);
        } else {
          Alert.alert("Lỗi", result.error || "Xuất thất bại");
        }
      } catch (err) {
        Alert.alert("Lỗi", "Không thể xuất tài liệu");
      } finally {
        setExporting(false);
      }
    },
    [sessionId, pages.length, exportPDF, exportImages, onComplete]
  );

  const handleClose = useCallback(() => {
    if (pages.length > 0) {
      Alert.alert("Thoát", "Bạn có muốn lưu phiên quét?", [
        {
          text: "Không lưu",
          style: "destructive",
          onPress: onClose,
        },
        { text: "Tiếp tục quét", style: "cancel" },
        {
          text: "Lưu & Thoát",
          onPress: () => {
            // Session auto-saved
            onClose?.();
          },
        },
      ]);
    } else {
      onClose?.();
    }
  }, [pages.length, onClose]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  // ============================================================================
  // Animated Styles
  // ============================================================================

  const captureButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  const guideOverlayStyle = useAnimatedStyle(() => ({
    opacity: guideOpacity.value,
  }));

  // ============================================================================
  // Permission Screen
  // ============================================================================

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.permissionContent}>
          <Ionicons name="scan-outline" size={80} color={primaryColor} />
          <Text style={[styles.permissionTitle, { color: textColor }]}>
            Cần quyền Camera
          </Text>
          <Text style={[styles.permissionText, { color: textColor }]}>
            Cho phép truy cập camera để quét tài liệu
          </Text>

          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: primaryColor }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Cho phép</Text>
          </TouchableOpacity>

          {permission.canAskAgain === false && (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleOpenSettings}
            >
              <Text
                style={[styles.settingsButtonText, { color: primaryColor }]}
              >
                Mở Cài đặt
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: textColor }]}>
              Đóng
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // Preview Modal
  // ============================================================================

  const renderPreviewModal = () => (
    <Modal
      visible={showPreview}
      animationType="fade"
      onRequestClose={handleRetake}
    >
      <SafeAreaView style={styles.previewContainer}>
        <StatusBar barStyle="light-content" />

        {previewUri && (
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
        )}

        {processing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Đang xử lý...</Text>
          </View>
        )}

        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={handleRetake}
            disabled={processing}
          >
            <Ionicons name="refresh" size={28} color="#fff" />
            <Text style={styles.previewButtonText}>Chụp lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.previewButton, styles.confirmButton]}
            onPress={handleConfirmCapture}
            disabled={processing}
          >
            <Ionicons name="checkmark" size={28} color="#fff" />
            <Text style={styles.previewButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // ============================================================================
  // Export Modal
  // ============================================================================

  const renderExportModal = () => (
    <Modal
      visible={showExportModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowExportModal(false)}
    >
      <View style={styles.exportModalOverlay}>
        <Animated.View
          entering={SlideInRight}
          style={[styles.exportModalContent, { backgroundColor }]}
        >
          <View style={styles.exportModalHeader}>
            <Text style={[styles.exportModalTitle, { color: textColor }]}>
              Xuất tài liệu
            </Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {session && (
            <View style={styles.exportStats}>
              <Text style={[styles.exportStatsText, { color: textColor }]}>
                {pages.length} trang • {formatSessionDate(session.createdAt)}
              </Text>
            </View>
          )}

          {exporting ? (
            <View style={styles.exportLoading}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={[styles.exportLoadingText, { color: textColor }]}>
                Đang xuất...
              </Text>
            </View>
          ) : (
            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={[styles.exportOption, { borderColor: primaryColor }]}
                onPress={() => handleExport("pdf")}
              >
                <Ionicons name="document-text" size={40} color={primaryColor} />
                <Text style={[styles.exportOptionTitle, { color: textColor }]}>
                  Xuất PDF
                </Text>
                <Text style={styles.exportOptionDesc}>
                  Tất cả trang trong 1 file PDF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportOption, { borderColor: primaryColor }]}
                onPress={() => handleExport("images")}
              >
                <Ionicons name="images" size={40} color={primaryColor} />
                <Text style={[styles.exportOptionTitle, { color: textColor }]}>
                  Xuất ảnh
                </Text>
                <Text style={styles.exportOptionDesc}>
                  Mỗi trang là 1 file ảnh riêng
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );

  // ============================================================================
  // Page Thumbnail
  // ============================================================================

  const renderPageThumbnail = ({
    item,
    index,
  }: {
    item: ScannedPage;
    index: number;
  }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50)}
      style={styles.thumbnailContainer}
    >
      <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
      <View style={styles.thumbnailBadge}>
        <Text style={styles.thumbnailBadgeText}>{item.pageNumber}</Text>
      </View>
      <TouchableOpacity
        style={styles.thumbnailRemove}
        onPress={() => handleRemovePage(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#ff4444" />
      </TouchableOpacity>
    </Animated.View>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flashEnabled ? "on" : "off"}
      >
        {/* Document Guide Overlay */}
        <Animated.View style={[styles.guideOverlay, guideOverlayStyle]}>
          <View style={styles.guideFrame}>
            {/* Corner markers */}
            <View style={[styles.cornerMarker, styles.topLeft]} />
            <View style={[styles.cornerMarker, styles.topRight]} />
            <View style={[styles.cornerMarker, styles.bottomLeft]} />
            <View style={[styles.cornerMarker, styles.bottomRight]} />
          </View>
          <Text style={styles.guideText}>Đặt tài liệu vào khung</Text>
        </Animated.View>

        {/* Top Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.pageCounter}>
            <Ionicons name="documents" size={18} color="#fff" />
            <Text style={styles.pageCounterText}>{pages.length}</Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.topButton}
              onPress={handleToggleFlash}
            >
              <Ionicons
                name={flashEnabled ? "flash" : "flash-off"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          {/* Page Thumbnails */}
          {pages.length > 0 && (
            <FlatList
              data={pages}
              renderItem={renderPageThumbnail}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailList}
              contentContainerStyle={styles.thumbnailListContent}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePickFromGallery}
            >
              <Ionicons name="images-outline" size={28} color="#fff" />
            </TouchableOpacity>

            <Animated.View style={captureButtonStyle}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                disabled={capturing}
                activeOpacity={0.8}
              >
                <View style={styles.captureButtonInner}>
                  {capturing ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Ionicons name="scan" size={32} color="#000" />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={[
                styles.actionButton,
                pages.length === 0 && styles.actionButtonDisabled,
              ]}
              onPress={() => pages.length > 0 && setShowExportModal(true)}
              disabled={pages.length === 0}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color={pages.length > 0 ? "#fff" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Modals */}
      {renderPreviewModal()}
      {renderExportModal()}

      {/* Error Toast */}
      {error && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.errorToast}
        >
          <Ionicons name="alert-circle" size={20} color="#fff" />
          <Text style={styles.errorToastText}>{error}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },

  // Permission Screen
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  settingsButton: {
    paddingVertical: 12,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },

  // Guide Overlay
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  guideFrame: {
    width: SCREEN_WIDTH * 0.85,
    height: (SCREEN_WIDTH * 0.85) / GUIDE_ASPECT_RATIO,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    position: "relative",
  },
  cornerMarker: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#00ff00",
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  guideText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 16,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Top Bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  topActions: {
    flexDirection: "row",
    gap: 12,
  },
  pageCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  pageCounterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 32,
  },
  thumbnailList: {
    maxHeight: THUMBNAIL_SIZE + 20,
    marginBottom: 16,
  },
  thumbnailListContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  thumbnailBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbnailBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  thumbnailRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
  },

  // Action Bar
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  // Preview Modal
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewImage: {
    flex: 1,
    resizeMode: "contain",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  previewButton: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  confirmButton: {
    backgroundColor: "#00c853",
  },
  previewButtonText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
  },

  // Export Modal
  exportModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  exportModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  exportModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  exportModalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  exportStats: {
    marginBottom: 24,
  },
  exportStatsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  exportLoading: {
    alignItems: "center",
    paddingVertical: 32,
  },
  exportLoadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  exportOptions: {
    flexDirection: "row",
    gap: 16,
  },
  exportOption: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  exportOptionDesc: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },

  // Error Toast
  errorToast: {
    position: "absolute",
    bottom: 140,
    left: 32,
    right: 32,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorToastText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
});

export default DocumentScannerScreen;
