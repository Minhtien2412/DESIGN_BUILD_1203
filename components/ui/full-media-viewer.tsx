/**
 * Full Media Viewer - Complete Image/Video Viewer with Edit & Delete
 * Features: Full-screen view, zoom, edit, delete, share, download
 * @author AI Assistant
 * @date 13/01/2026
 * @updated 22/01/2026 - Added video playback support
 */

import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { File as ExpoFile, Paths } from "expo-file-system";
import { Image, ImageContentFit } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    Image as RNImage,
    SafeAreaView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ==================== TYPES ====================

export interface MediaFile {
  id: string;
  uri: string;
  type: "image" | "video";
  width?: number;
  height?: number;
  thumbnail?: string;
  title?: string;
  description?: string;
  createdAt?: string;
}

export interface FullMediaViewerOptions {
  /** Cho phép xóa */
  allowDelete?: boolean;
  /** Cho phép sửa (crop, rotate, filter) */
  allowEdit?: boolean;
  /** Cho phép chia sẻ */
  allowShare?: boolean;
  /** Cho phép tải về */
  allowDownload?: boolean;
  /** Callback khi xóa */
  onDelete?: (id: string) => void;
  /** Callback khi sửa xong */
  onEdit?: (id: string, newUri: string) => void;
  /** Hiển thị info bar */
  showInfo?: boolean;
  /** Header title */
  headerTitle?: string;
}

interface ViewerContextType {
  open: (
    files: MediaFile[],
    initialIndex?: number,
    options?: FullMediaViewerOptions,
  ) => void;
  close: () => void;
  isOpen: boolean;
}

// ==================== CONTEXT ====================

const FullMediaViewerContext = createContext<ViewerContextType | null>(null);

export function useFullMediaViewer() {
  const ctx = useContext(FullMediaViewerContext);
  if (!ctx)
    throw new Error(
      "useFullMediaViewer must be used within FullMediaViewerProvider",
    );
  return ctx;
}

// ==================== PROVIDER ====================

export function FullMediaViewerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<FullMediaViewerOptions>({});

  const open = useCallback(
    (
      newFiles: MediaFile[],
      initialIndex = 0,
      opts: FullMediaViewerOptions = {},
    ) => {
      setFiles(newFiles);
      setCurrentIndex(initialIndex);
      setOptions({
        allowDelete: true,
        allowEdit: true,
        allowShare: true,
        allowDownload: true,
        showInfo: true,
        ...opts,
      });
      setIsVisible(true);
    },
    [],
  );

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setFiles([]);
      setCurrentIndex(0);
    }, 300);
  }, []);

  const value = useMemo(
    () => ({ open, close, isOpen: isVisible }),
    [open, close, isVisible],
  );

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const newFiles = files.filter((f) => f.id !== id);
      options.onDelete?.(id);

      if (newFiles.length === 0) {
        close();
      } else {
        setFiles(newFiles);
        if (currentIndex >= newFiles.length) {
          setCurrentIndex(newFiles.length - 1);
        }
      }
    },
    [files, currentIndex, options, close],
  );

  const handleEdit = useCallback(
    (id: string, newUri: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, uri: newUri } : f)),
      );
      options.onEdit?.(id, newUri);
    },
    [options],
  );

  return (
    <FullMediaViewerContext.Provider value={value}>
      {children}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        {files.length > 0 && (
          <FullMediaViewerContent
            files={files}
            currentIndex={currentIndex}
            options={options}
            onIndexChange={handleIndexChange}
            onClose={close}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </Modal>
    </FullMediaViewerContext.Provider>
  );
}

// ==================== VIEWER CONTENT ====================

interface ViewerContentProps {
  files: MediaFile[];
  currentIndex: number;
  options: FullMediaViewerOptions;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newUri: string) => void;
}

function FullMediaViewerContent({
  files,
  currentIndex,
  options,
  onIndexChange,
  onClose,
  onDelete,
  onEdit,
}: ViewerContentProps) {
  const [showControls, setShowControls] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const currentFile = files[currentIndex];

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    const newValue = !showControls;
    setShowControls(newValue);
    Animated.timing(controlsOpacity, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showControls, controlsOpacity]);

  // Handle scroll
  const handleScroll = useCallback(
    (event: any) => {
      const index = Math.round(
        event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
      );
      if (index !== currentIndex && index >= 0 && index < files.length) {
        onIndexChange(index);
      }
    },
    [currentIndex, files.length, onIndexChange],
  );

  // Delete confirmation
  const handleDelete = useCallback(() => {
    Alert.alert("Xóa ảnh/video", "Bạn có chắc muốn xóa?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => onDelete(currentFile.id),
      },
    ]);
  }, [currentFile, onDelete]);

  // Share
  const handleShare = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        await Share.share({ url: currentFile.uri });
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(currentFile.uri);
        } else {
          await Share.share({ url: currentFile.uri });
        }
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Lỗi", "Không thể chia sẻ");
    }
  }, [currentFile]);

  // Download / Save to gallery
  const handleDownload = useCallback(async () => {
    try {
      setIsLoading(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập", "Cần quyền truy cập thư viện để lưu");
        return;
      }

      // Download if remote URL
      let localUri = currentFile.uri;
      if (currentFile.uri.startsWith("http")) {
        const filename = `media_${Date.now()}.${currentFile.type === "video" ? "mp4" : "jpg"}`;
        // Use new expo-file-system API
        const destFile = new ExpoFile(Paths.cache, filename);
        const response = await fetch(currentFile.uri);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        await destFile.write(new Uint8Array(arrayBuffer));
        localUri = destFile.uri;
      }

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert("Thành công", "Đã lưu vào thư viện ảnh");
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Lỗi", "Không thể tải về");
    } finally {
      setIsLoading(false);
    }
  }, [currentFile]);

  // Edit image
  const handleEdit = useCallback(async () => {
    if (currentFile.type !== "image") {
      Alert.alert("Thông báo", "Chỉ hỗ trợ chỉnh sửa ảnh");
      return;
    }
    setIsEditing(true);
  }, [currentFile]);

  // Render each media item
  const renderItem = useCallback(
    ({ item }: { item: MediaFile }) => (
      <MediaItemView file={item} onTap={toggleControls} />
    ),
    [toggleControls],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Media Gallery */}
      <FlatList
        ref={flatListRef}
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={currentIndex}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
      />

      {/* Controls Overlay */}
      <Animated.View
        style={[styles.controlsOverlay, { opacity: controlsOpacity }]}
        pointerEvents={showControls ? "auto" : "none"}
      >
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {options.headerTitle || `${currentIndex + 1} / ${files.length}`}
          </Text>

          <View style={styles.headerRight}>
            {options.allowDownload && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleDownload}
              >
                <Ionicons name="download-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>

        {/* Footer Actions */}
        <SafeAreaView style={styles.footer}>
          {/* Info */}
          {options.showInfo && currentFile.title && (
            <View style={styles.infoBar}>
              <Text style={styles.infoTitle} numberOfLines={1}>
                {currentFile.title}
              </Text>
              {currentFile.description && (
                <Text style={styles.infoDesc} numberOfLines={2}>
                  {currentFile.description}
                </Text>
              )}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionBar}>
            {options.allowShare && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={26} color="#fff" />
                <Text style={styles.actionText}>Chia sẻ</Text>
              </TouchableOpacity>
            )}

            {options.allowEdit && currentFile.type === "image" && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={26} color="#fff" />
                <Text style={styles.actionText}>Sửa</Text>
              </TouchableOpacity>
            )}

            {options.allowDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={26} color="#ff4444" />
                <Text style={[styles.actionText, { color: "#ff4444" }]}>
                  Xóa
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Pagination dots */}
      {files.length > 1 && (
        <View style={styles.pagination}>
          {files.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <ImageEditorModal
          file={currentFile}
          onSave={(newUri) => {
            onEdit(currentFile.id, newUri);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </View>
  );
}

// ==================== MEDIA ITEM VIEW ====================

interface MediaItemViewProps {
  file: MediaFile;
  onTap: () => void;
}

function MediaItemView({ file, onTap }: MediaItemViewProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store current values
      },
      onPanResponderMove: (_, gestureState) => {
        // Pan when zoomed
        if (lastScale.current > 1) {
          translateX.setValue(lastTranslateX.current + gestureState.dx);
          translateY.setValue(lastTranslateY.current + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Check for tap (small movement)
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          onTap();
          return;
        }

        // Store final position
        lastTranslateX.current = lastTranslateX.current + gestureState.dx;
        lastTranslateY.current = lastTranslateY.current + gestureState.dy;

        // Reset if scale is 1
        if (lastScale.current <= 1) {
          Animated.parallel([
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
          lastTranslateX.current = 0;
          lastTranslateY.current = 0;
        }
      },
    }),
  ).current;

  // Double tap to zoom
  const lastTap = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap - toggle zoom
      const newScale = lastScale.current > 1 ? 1 : 2;
      Animated.parallel([
        Animated.spring(scale, { toValue: newScale, useNativeDriver: true }),
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
      lastScale.current = newScale;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
    } else {
      onTap();
    }
    lastTap.current = now;
  }, [scale, translateX, translateY, onTap]);

  return (
    <View style={styles.mediaItemContainer}>
      <Animated.View
        style={[
          styles.mediaItem,
          {
            transform: [{ scale }, { translateX }, { translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable onPress={handleTap} style={styles.mediaItemPressable}>
          {file.type === "image" ? (
            <Image
              source={{ uri: file.uri }}
              style={styles.mediaImage}
              contentFit="contain"
            />
          ) : (
            <VideoPlayer file={file} onTap={onTap} />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ==================== VIDEO PLAYER COMPONENT ====================

interface VideoPlayerProps {
  file: MediaFile;
  onTap: () => void;
}

function VideoPlayer({ file, onTap }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const togglePlayPause = useCallback(async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleLoad = useCallback((status: any) => {
    setIsLoading(false);
    if (status.durationMillis) {
      setDuration(status.durationMillis);
    }
  }, []);

  const handlePlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      if (status.positionMillis && status.durationMillis) {
        setProgress(status.positionMillis / status.durationMillis);
      }
    }
  }, []);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTap = useCallback(() => {
    setShowControls((prev) => !prev);
    onTap();
  }, [onTap]);

  const handleSeek = useCallback(
    async (value: number) => {
      if (videoRef.current && duration > 0) {
        await videoRef.current.setPositionAsync(value * duration);
      }
    },
    [duration],
  );

  return (
    <View style={videoStyles.container}>
      <Video
        ref={videoRef}
        source={{ uri: file.uri }}
        style={videoStyles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping={false}
        onLoad={handleLoad}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        useNativeControls={false}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={videoStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={videoStyles.loadingText}>Đang tải video...</Text>
        </View>
      )}

      {/* Custom Controls Overlay */}
      <Pressable style={videoStyles.controlsOverlay} onPress={handleTap}>
        {showControls && (
          <View style={videoStyles.controlsContainer}>
            {/* Play/Pause Button */}
            <TouchableOpacity
              style={videoStyles.playButton}
              onPress={togglePlayPause}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={50}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Progress Bar */}
            <View style={videoStyles.progressContainer}>
              <Text style={videoStyles.timeText}>
                {formatTime(progress * duration)}
              </Text>
              <View style={videoStyles.progressBar}>
                <TouchableOpacity
                  style={videoStyles.progressTrack}
                  onPress={(e) => {
                    const { locationX } = e.nativeEvent;
                    const width = SCREEN_WIDTH - 120;
                    handleSeek(locationX / width);
                  }}
                >
                  <View
                    style={[
                      videoStyles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <Text style={videoStyles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </Pressable>

      {/* Thumbnail for non-playing state */}
      {!isPlaying && file.thumbnail && (
        <Pressable
          style={videoStyles.thumbnailOverlay}
          onPress={togglePlayPause}
        >
          <Image
            source={{ uri: file.thumbnail }}
            style={videoStyles.thumbnail}
            contentFit="cover"
          />
          <View style={videoStyles.playIconOverlay}>
            <View style={videoStyles.playIconCircle}>
              <Ionicons name="play" size={40} color="#fff" />
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const videoStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 40,
    justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1877F2",
    borderRadius: 2,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    minWidth: 45,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 6, // Offset play icon to center visually
  },
});

// ==================== IMAGE EDITOR MODAL ====================

interface ImageEditorModalProps {
  file: MediaFile;
  onSave: (newUri: string) => void;
  onCancel: () => void;
}

function ImageEditorModal({ file, onSave, onCancel }: ImageEditorModalProps) {
  const [editedUri, setEditedUri] = useState(file.uri);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Rotate image
  const handleRotate = useCallback(async () => {
    try {
      setIsProcessing(true);
      const newRotation = (rotation + 90) % 360;
      const result = await ImageManipulator.manipulateAsync(
        file.uri,
        [{ rotate: newRotation }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );
      setEditedUri(result.uri);
      setRotation(newRotation);
    } catch (error) {
      console.error("Rotate error:", error);
      Alert.alert("Lỗi", "Không thể xoay ảnh");
    } finally {
      setIsProcessing(false);
    }
  }, [file.uri, rotation]);

  // Flip horizontal
  const handleFlip = useCallback(async () => {
    try {
      setIsProcessing(true);
      const result = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ flip: ImageManipulator.FlipType.Horizontal }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );
      setEditedUri(result.uri);
    } catch (error) {
      console.error("Flip error:", error);
      Alert.alert("Lỗi", "Không thể lật ảnh");
    } finally {
      setIsProcessing(false);
    }
  }, [editedUri]);

  // Crop (using ImagePicker's editor)
  const handleCrop = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setEditedUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Crop error:", error);
    }
  }, []);

  // Apply grayscale filter
  const handleGrayscale = useCallback(async () => {
    try {
      setIsProcessing(true);
      // Note: ImageManipulator doesn't support grayscale directly
      // This is a placeholder - would need custom shader or library
      Alert.alert("Thông báo", "Tính năng đang phát triển");
    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View style={styles.editorContainer}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <SafeAreaView style={styles.editorHeader}>
          <TouchableOpacity onPress={onCancel} style={styles.editorHeaderBtn}>
            <Text style={styles.editorCancelText}>Hủy</Text>
          </TouchableOpacity>

          <Text style={styles.editorTitle}>Chỉnh sửa ảnh</Text>

          <TouchableOpacity
            onPress={() => onSave(editedUri)}
            style={styles.editorHeaderBtn}
            disabled={isProcessing}
          >
            <Text
              style={[styles.editorSaveText, isProcessing && { opacity: 0.5 }]}
            >
              Lưu
            </Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Preview */}
        <View style={styles.editorPreview}>
          <Image
            source={{ uri: editedUri }}
            style={styles.editorImage}
            contentFit="contain"
          />
          {isProcessing && (
            <View style={styles.editorProcessing}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </View>

        {/* Tools */}
        <SafeAreaView style={styles.editorTools}>
          <TouchableOpacity style={styles.editorTool} onPress={handleRotate}>
            <Ionicons name="refresh" size={28} color="#fff" />
            <Text style={styles.editorToolText}>Xoay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editorTool} onPress={handleFlip}>
            <Ionicons name="swap-horizontal" size={28} color="#fff" />
            <Text style={styles.editorToolText}>Lật</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editorTool} onPress={handleCrop}>
            <Ionicons name="crop" size={28} color="#fff" />
            <Text style={styles.editorToolText}>Cắt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editorTool} onPress={handleGrayscale}>
            <Ionicons name="color-filter" size={28} color="#fff" />
            <Text style={styles.editorToolText}>Bộ lọc</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
  },
  footer: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingBottom: 20,
  },
  infoBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  infoTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 4,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  actionButton: {
    alignItems: "center",
    minWidth: 60,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  pagination: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  paginationDotActive: {
    backgroundColor: "#fff",
    width: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
  },
  mediaItemContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  mediaItemPressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  videoText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 16,
  },
  // Editor styles
  editorContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
  },
  editorHeaderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editorCancelText: {
    color: "#fff",
    fontSize: 16,
  },
  editorTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  editorSaveText: {
    color: "#0066CC",
    fontSize: 16,
    fontWeight: "600",
  },
  editorPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editorImage: {
    width: "100%",
    height: "100%",
  },
  editorProcessing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editorTools: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a1a",
  },
  editorTool: {
    alignItems: "center",
    minWidth: 60,
  },
  editorToolText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 6,
  },
});

// ==================== HELPER COMPONENT ====================

/**
 * Tappable Image component - Bọc Image để có thể click mở viewer
 */
export interface TappableImageProps {
  source: { uri: string } | number;
  style?: any;
  id?: string;
  title?: string;
  description?: string;
  allowEdit?: boolean;
  allowDelete?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newUri: string) => void;
  resizeMode?: ImageContentFit;
  [key: string]: any;
}

export function TappableImage({
  source,
  style,
  id,
  title,
  description,
  allowEdit = true,
  allowDelete = false,
  onDelete,
  onEdit,
  resizeMode = "cover",
  ...props
}: TappableImageProps) {
  const viewer = useFullMediaViewer();

  const handlePress = useCallback(() => {
    const uri =
      typeof source === "number"
        ? RNImage.resolveAssetSource(source).uri
        : source.uri;

    const mediaFile: MediaFile = {
      id: id || `img_${Date.now()}`,
      uri,
      type: "image",
      title,
      description,
    };

    viewer.open([mediaFile], 0, {
      allowEdit,
      allowDelete,
      onDelete,
      onEdit,
    });
  }, [
    source,
    id,
    title,
    description,
    allowEdit,
    allowDelete,
    onDelete,
    onEdit,
    viewer,
  ]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Image source={source} style={style} contentFit={resizeMode} {...props} />
    </TouchableOpacity>
  );
}

/**
 * Tappable Image Gallery - Hiển thị nhiều ảnh với swipe
 */
export interface TappableGalleryProps {
  images: {
    id?: string;
    uri: string;
    title?: string;
    description?: string;
  }[];
  initialIndex?: number;
  style?: any;
  imageStyle?: any;
  horizontal?: boolean;
  numColumns?: number;
  allowEdit?: boolean;
  allowDelete?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newUri: string) => void;
}

export function TappableGallery({
  images,
  initialIndex = 0,
  style,
  imageStyle,
  horizontal = false,
  numColumns = 2,
  allowEdit = true,
  allowDelete = false,
  onDelete,
  onEdit,
}: TappableGalleryProps) {
  const viewer = useFullMediaViewer();
  const { width: screenWidth } = Dimensions.get("window");

  const handleImagePress = useCallback(
    (index: number) => {
      const mediaFiles: MediaFile[] = images.map((img, i) => ({
        id: img.id || `gallery_${i}`,
        uri: img.uri,
        type: "image" as const,
        title: img.title,
        description: img.description,
      }));

      viewer.open(mediaFiles, index, {
        allowEdit,
        allowDelete,
        onDelete,
        onEdit,
      });
    },
    [images, allowEdit, allowDelete, onDelete, onEdit, viewer],
  );

  if (horizontal) {
    return (
      <FlatList
        key="horizontal-gallery"
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item.id || `img_${index}`}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleImagePress(index)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: item.uri }}
              style={[{ width: screenWidth, height: 300 }, imageStyle]}
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
        style={style}
      />
    );
  }

  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap" }, style]}>
      {images.map((img, index) => (
        <TouchableOpacity
          key={img.id || index}
          onPress={() => handleImagePress(index)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: img.uri }}
            style={imageStyle}
            contentFit="cover"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
