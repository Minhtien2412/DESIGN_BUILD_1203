/**
 * Image Viewer Component
 * ======================
 *
 * Trình xem ảnh full screen với zoom/pan
 * Hỗ trợ gallery với multiple images
 *
 * @author ThietKeResort Team
 * @created 2025-01-20
 */

import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { memo, useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================
// Types
// ============================================

export interface ImageItem {
  uri: string;
  title?: string;
  description?: string;
}

interface ImageViewerProps {
  visible: boolean;
  images: ImageItem[];
  initialIndex?: number;
  onClose: () => void;
}

interface SingleImageViewerProps {
  image: ImageItem;
  onZoomChange?: (isZoomed: boolean) => void;
}

// ============================================
// Single Image Viewer with Zoom
// ============================================

const SingleImageViewer = memo(
  ({ image, onZoomChange }: SingleImageViewerProps) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const [loading, setLoading] = useState(true);

    const resetZoom = useCallback(() => {
      "worklet";
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      if (onZoomChange) {
        runOnJS(onZoomChange)(false);
      }
    }, []);

    const pinchGesture = Gesture.Pinch()
      .onUpdate((e) => {
        scale.value = savedScale.value * e.scale;
      })
      .onEnd(() => {
        if (scale.value < 1) {
          resetZoom();
        } else if (scale.value > 4) {
          scale.value = withSpring(4);
          savedScale.value = 4;
        } else {
          savedScale.value = scale.value;
        }
        if (onZoomChange) {
          runOnJS(onZoomChange)(scale.value > 1);
        }
      });

    const panGesture = Gesture.Pan()
      .enabled(true)
      .onUpdate((e) => {
        if (savedScale.value > 1) {
          translateX.value =
            savedTranslateX.value + e.translationX / savedScale.value;
          translateY.value =
            savedTranslateY.value + e.translationY / savedScale.value;
        }
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onStart(() => {
        if (scale.value > 1) {
          resetZoom();
        } else {
          scale.value = withSpring(2.5);
          savedScale.value = 2.5;
          if (onZoomChange) {
            runOnJS(onZoomChange)(true);
          }
        }
      });

    const composedGesture = Gesture.Simultaneous(
      pinchGesture,
      Gesture.Race(doubleTapGesture, panGesture)
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    return (
      <GestureDetector gesture={composedGesture}>
        <View style={styles.imageContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <Animated.View style={[styles.animatedImage, animatedStyle]}>
            <Image
              source={{ uri: image.uri }}
              style={styles.fullImage}
              contentFit="contain"
              onLoadEnd={() => setLoading(false)}
              transition={200}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    );
  }
);

// ============================================
// Main Image Viewer Component
// ============================================

export const ImageViewer = memo(
  ({ visible, images, initialIndex = 0, onClose }: ImageViewerProps) => {
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleIndexChange = useCallback((index: number) => {
      setCurrentIndex(index);
      setIsZoomed(false);
    }, []);

    const handleSaveImage = useCallback(async () => {
      const currentImage = images[currentIndex];
      if (!currentImage?.uri) return;

      try {
        setSaving(true);

        // Request permission
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Quyền truy cập",
            "Cần quyền truy cập thư viện ảnh để lưu"
          );
          return;
        }

        // Download image if remote - use documentDirectory as fallback
        let localUri = currentImage.uri;
        if (currentImage.uri.startsWith("http")) {
          const cacheDir =
            (FileSystem as any).cacheDirectory ||
            (FileSystem as any).documentDirectory ||
            "";
          if (cacheDir) {
            const fileUri = cacheDir + `image_${Date.now()}.jpg`;
            const downloadResult = await FileSystem.downloadAsync(
              currentImage.uri,
              fileUri
            );
            localUri = downloadResult.uri;
          }
        }

        // Save to gallery
        await MediaLibrary.saveToLibraryAsync(localUri);
        Alert.alert("Thành công", "Đã lưu ảnh vào thư viện");
      } catch (error) {
        console.error("Save image error:", error);
        Alert.alert("Lỗi", "Không thể lưu ảnh");
      } finally {
        setSaving(false);
      }
    }, [currentIndex, images]);

    const handleShareImage = useCallback(async () => {
      const currentImage = images[currentIndex];
      if (!currentImage?.uri) return;

      try {
        if (await Sharing.isAvailableAsync()) {
          let localUri = currentImage.uri;

          // Download if remote
          if (currentImage.uri.startsWith("http")) {
            const cacheDir =
              (FileSystem as any).cacheDirectory ||
              (FileSystem as any).documentDirectory ||
              "";
            if (cacheDir) {
              const fileUri = cacheDir + `share_${Date.now()}.jpg`;
              const downloadResult = await FileSystem.downloadAsync(
                currentImage.uri,
                fileUri
              );
              localUri = downloadResult.uri;
            }
          }

          await Sharing.shareAsync(localUri);
        } else {
          Alert.alert("Lỗi", "Chia sẻ không khả dụng trên thiết bị này");
        }
      } catch (error) {
        console.error("Share error:", error);
      }
    }, [currentIndex, images]);

    const renderItem = useCallback(
      ({ item }: { item: ImageItem }) => (
        <SingleImageViewer image={item} onZoomChange={setIsZoomed} />
      ),
      []
    );

    const keyExtractor = useCallback(
      (item: ImageItem, index: number) => `${item.uri}-${index}`,
      []
    );

    const onViewableItemsChanged = useCallback(
      ({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
          handleIndexChange(viewableItems[0].index);
        }
      },
      [handleIndexChange]
    );

    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50,
    }).current;

    if (images.length === 0) return null;

    const currentImage = images[currentIndex];

    return (
      <Modal
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <GestureHandlerRootView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />

          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {images.length > 1 && (
              <Text style={styles.counter}>
                {currentIndex + 1} / {images.length}
              </Text>
            )}

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleShareImage}
                style={styles.headerBtn}
              >
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveImage}
                style={styles.headerBtn}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="download-outline" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Gallery */}
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled={!isZoomed}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            scrollEnabled={!isZoomed}
          />

          {/* Footer with info */}
          {currentImage?.title && (
            <View
              style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
            >
              <Text style={styles.imageTitle}>{currentImage.title}</Text>
              {currentImage.description && (
                <Text style={styles.imageDescription}>
                  {currentImage.description}
                </Text>
              )}
            </View>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <View
              style={[
                styles.thumbnailContainer,
                { bottom: insets.bottom + 80 },
              ]}
            >
              <FlatList
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      flatListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                      });
                      handleIndexChange(index);
                    }}
                    style={[
                      styles.thumbnail,
                      currentIndex === index && styles.thumbnailActive,
                    ]}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.thumbnailImage}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => `thumb-${index}`}
              />
            </View>
          )}
        </GestureHandlerRootView>
      </Modal>
    );
  }
);

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  headerBtn: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  counter: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  animatedImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  imageDescription: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
  thumbnailContainer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  thumbnailList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: "#fff",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
});

export default ImageViewer;
