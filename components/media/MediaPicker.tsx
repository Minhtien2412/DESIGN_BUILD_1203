/**
 * MediaPicker Component
 * =====================
 *
 * Unified picker kết hợp MediaGallery + FileBrowser + Camera
 *
 * Features:
 * - Tab navigation: Photos, Videos, Files, Camera
 * - Unified selection across tabs
 * - Quick camera capture
 * - Smart defaults based on context
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FileAsset, FileBrowser } from "./FileBrowser";
import { MediaAsset, MediaGallery } from "./MediaGallery";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

export type MediaPickerTab = "photos" | "videos" | "files" | "camera";

export interface SelectedMedia {
  type: "media" | "file" | "camera";
  asset: MediaAsset | FileAsset | CameraResult;
}

export interface CameraResult {
  id: string;
  uri: string;
  type: "photo" | "video";
  width: number;
  height: number;
  base64?: string;
}

export interface MediaPickerProps {
  /** Tabs hiển thị */
  tabs?: MediaPickerTab[];
  /** Tab mặc định */
  defaultTab?: MediaPickerTab;
  /** Chế độ chọn */
  selectionMode?: "single" | "multiple";
  /** Giới hạn số file chọn */
  maxSelection?: number;
  /** Cho phép mix media types */
  allowMixedSelection?: boolean;
  /** Callback khi confirm */
  onConfirm?: (selections: SelectedMedia[]) => void;
  /** Callback khi cancel */
  onCancel?: () => void;
  /** Visible (modal mode) */
  visible?: boolean;
  /** Full screen mode */
  fullScreen?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function MediaPicker({
  tabs = ["photos", "files"],
  defaultTab = "photos",
  selectionMode = "single",
  maxSelection = 10,
  allowMixedSelection = true,
  onConfirm,
  onCancel,
  visible = true,
  fullScreen = true,
}: MediaPickerProps) {
  // State
  const [activeTab, setActiveTab] = useState<MediaPickerTab>(defaultTab);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileAsset[]>([]);
  const [cameraResults, setCameraResults] = useState<CameraResult[]>([]);

  // Theme
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  const insets = useSafeAreaInsets();

  // ============================================
  // Total selection count
  // ============================================

  const totalSelected =
    selectedMedia.length + selectedFiles.length + cameraResults.length;

  // ============================================
  // Handlers
  // ============================================

  const handleMediaSelectionChange = useCallback(
    (assets: MediaAsset[]) => {
      if (
        !allowMixedSelection &&
        (selectedFiles.length > 0 || cameraResults.length > 0)
      ) {
        // Clear other selections
        setSelectedFiles([]);
        setCameraResults([]);
      }
      setSelectedMedia(assets);
    },
    [allowMixedSelection, selectedFiles.length, cameraResults.length],
  );

  const handleFileSelectionChange = useCallback(
    (files: FileAsset[]) => {
      if (
        !allowMixedSelection &&
        (selectedMedia.length > 0 || cameraResults.length > 0)
      ) {
        setSelectedMedia([]);
        setCameraResults([]);
      }
      setSelectedFiles(files);
    },
    [allowMixedSelection, selectedMedia.length, cameraResults.length],
  );

  const handleCameraCapture = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const cameraResult: CameraResult = {
        id: `camera_${Date.now()}`,
        uri: asset.uri,
        type: "photo",
        width: asset.width,
        height: asset.height,
        base64: asset.base64 ?? undefined,
      };

      if (!allowMixedSelection) {
        setSelectedMedia([]);
        setSelectedFiles([]);
      }

      if (selectionMode === "single") {
        setCameraResults([cameraResult]);
        // Auto confirm for single camera capture
        onConfirm?.([{ type: "camera", asset: cameraResult }]);
      } else {
        setCameraResults((prev) => [...prev, cameraResult]);
      }
    }
  }, [allowMixedSelection, selectionMode, onConfirm]);

  const handleConfirm = useCallback(() => {
    const selections: SelectedMedia[] = [
      ...selectedMedia.map((asset) => ({ type: "media" as const, asset })),
      ...selectedFiles.map((file) => ({ type: "file" as const, asset: file })),
      ...cameraResults.map((result) => ({
        type: "camera" as const,
        asset: result,
      })),
    ];
    onConfirm?.(selections);
  }, [selectedMedia, selectedFiles, cameraResults, onConfirm]);

  const handleCancel = useCallback(() => {
    setSelectedMedia([]);
    setSelectedFiles([]);
    setCameraResults([]);
    onCancel?.();
  }, [onCancel]);

  // ============================================
  // Tab Rendering
  // ============================================

  const renderTabButton = useCallback(
    (
      tab: MediaPickerTab,
      icon: keyof typeof Ionicons.glyphMap,
      label: string,
    ) => {
      const isActive = activeTab === tab;
      return (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            isActive && {
              borderBottomColor: primaryColor,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <Ionicons
            name={icon}
            size={22}
            color={isActive ? primaryColor : secondaryTextColor}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: isActive ? primaryColor : secondaryTextColor },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    },
    [activeTab, primaryColor, secondaryTextColor],
  );

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case "photos":
        return (
          <MediaGallery
            selectionMode={selectionMode}
            maxSelection={
              maxSelection - selectedFiles.length - cameraResults.length
            }
            mediaTypes={["photo"]}
            selectedAssets={selectedMedia}
            onSelectionChange={handleMediaSelectionChange}
            showHeader={false}
          />
        );

      case "videos":
        return (
          <MediaGallery
            selectionMode={selectionMode}
            maxSelection={
              maxSelection - selectedFiles.length - cameraResults.length
            }
            mediaTypes={["video"]}
            selectedAssets={selectedMedia}
            onSelectionChange={handleMediaSelectionChange}
            showHeader={false}
          />
        );

      case "files":
        return (
          <FileBrowser
            selectionMode={selectionMode}
            maxSelection={
              maxSelection - selectedMedia.length - cameraResults.length
            }
            selectedFiles={selectedFiles}
            onSelectionChange={handleFileSelectionChange}
            showHeader={false}
          />
        );

      case "camera":
        return (
          <View style={styles.cameraContainer}>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: primaryColor }]}
              onPress={handleCameraCapture}
            >
              <Ionicons name="camera" size={48} color="#fff" />
              <Text style={styles.cameraButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>

            {cameraResults.length > 0 && (
              <View style={styles.cameraPreviewContainer}>
                <Text style={[styles.cameraPreviewTitle, { color: textColor }]}>
                  Đã chụp ({cameraResults.length})
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  }, [
    activeTab,
    selectionMode,
    maxSelection,
    selectedMedia,
    selectedFiles,
    cameraResults,
    handleMediaSelectionChange,
    handleFileSelectionChange,
    handleCameraCapture,
    primaryColor,
    textColor,
  ]);

  // ============================================
  // Main Render
  // ============================================

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor, paddingTop: fullScreen ? insets.top : 0 },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: surfaceColor }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textColor }]}>
          Chọn media
          {totalSelected > 0 && (
            <Text style={{ color: primaryColor }}> ({totalSelected})</Text>
          )}
        </Text>

        <TouchableOpacity
          onPress={handleConfirm}
          style={styles.headerButton}
          disabled={totalSelected === 0}
        >
          <Text
            style={[
              styles.confirmText,
              { color: totalSelected > 0 ? primaryColor : surfaceColor },
            ]}
          >
            Xong
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: surfaceColor }]}>
        {tabs.includes("photos") && renderTabButton("photos", "images", "Ảnh")}
        {tabs.includes("videos") &&
          renderTabButton("videos", "videocam", "Video")}
        {tabs.includes("files") &&
          renderTabButton("files", "document", "Tài liệu")}
        {tabs.includes("camera") &&
          renderTabButton("camera", "camera", "Camera")}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );

  if (!visible) return null;

  if (fullScreen) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCancel}
      >
        {content}
      </Modal>
    );
  }

  return content;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Content
  content: {
    flex: 1,
  },

  // Camera
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  cameraButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  cameraPreviewContainer: {
    marginTop: 24,
  },
  cameraPreviewTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
});

export default MediaPicker;
