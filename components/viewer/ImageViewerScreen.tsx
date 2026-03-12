/**
 * ImageViewerScreen.tsx
 *
 * Full-featured image viewer with zoom, pan, rotate,
 * gallery mode, and gesture controls.
 *
 * Story: VIEW-002 - Image Viewer
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    PanResponder,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    formatDimensions,
    GalleryImage,
    IMAGE_ZOOM_CONSTRAINTS,
    useImageViewer,
} from "../../services/ImageViewerService";

// ============================================================================
// Types
// ============================================================================

interface ImageViewerScreenProps {
  images: GalleryImage[];
  initialIndex?: number;
  onClose?: () => void;
  onIndexChange?: (index: number) => void;
  showHeader?: boolean;
  showFooter?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  background: "#000000",
  overlay: "rgba(0, 0, 0, 0.7)",
  white: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  primary: "#007AFF",
  danger: "#FF3B30",
  success: "#34C759",
};

const DOUBLE_TAP_DELAY = 300;

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Header with close and actions
 */
interface HeaderProps {
  title?: string;
  currentIndex: number;
  totalImages: number;
  visible: boolean;
  onClose: () => void;
  onInfo: () => void;
  onMore: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  currentIndex,
  totalImages,
  visible,
  onClose,
  onInfo,
  onMore,
}) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      style={[
        styles.header,
        { opacity, pointerEvents: visible ? "auto" : "none" },
      ]}
    >
      <TouchableOpacity style={styles.headerButton} onPress={onClose}>
        <Ionicons name="close" size={28} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        <Text style={styles.headerSubtitle}>
          {currentIndex + 1} / {totalImages}
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} onPress={onInfo}>
          <Ionicons
            name="information-circle-outline"
            size={26}
            color={COLORS.white}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onMore}>
          <Ionicons name="ellipsis-horizontal" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

/**
 * Footer with actions
 */
interface FooterProps {
  visible: boolean;
  isFavorite: boolean;
  onShare: () => void;
  onSave: () => void;
  onFavorite: () => void;
  onRotate: () => void;
  onDelete: () => void;
}

const Footer: React.FC<FooterProps> = ({
  visible,
  isFavorite,
  onShare,
  onSave,
  onFavorite,
  onRotate,
  onDelete,
}) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      style={[
        styles.footer,
        { opacity, pointerEvents: visible ? "auto" : "none" },
      ]}
    >
      <TouchableOpacity style={styles.footerButton} onPress={onShare}>
        <Ionicons name="share-outline" size={26} color={COLORS.white} />
        <Text style={styles.footerButtonText}>Chia sẻ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerButton} onPress={onSave}>
        <Ionicons name="download-outline" size={26} color={COLORS.white} />
        <Text style={styles.footerButtonText}>Lưu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerButton} onPress={onFavorite}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={26}
          color={isFavorite ? COLORS.danger : COLORS.white}
        />
        <Text style={styles.footerButtonText}>Yêu thích</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerButton} onPress={onRotate}>
        <Ionicons name="refresh-outline" size={26} color={COLORS.white} />
        <Text style={styles.footerButtonText}>Xoay</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={26} color={COLORS.danger} />
        <Text style={[styles.footerButtonText, { color: COLORS.danger }]}>
          Xóa
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Zoom controls overlay
 */
interface ZoomControlsProps {
  visible: boolean;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  visible,
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.zoomControls}>
      <TouchableOpacity
        style={styles.zoomButton}
        onPress={onZoomOut}
        disabled={scale <= IMAGE_ZOOM_CONSTRAINTS.MIN}
      >
        <Ionicons
          name="remove"
          size={24}
          color={
            scale <= IMAGE_ZOOM_CONSTRAINTS.MIN
              ? COLORS.textSecondary
              : COLORS.white
          }
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.zoomIndicator} onPress={onReset}>
        <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.zoomButton}
        onPress={onZoomIn}
        disabled={scale >= IMAGE_ZOOM_CONSTRAINTS.MAX}
      >
        <Ionicons
          name="add"
          size={24}
          color={
            scale >= IMAGE_ZOOM_CONSTRAINTS.MAX
              ? COLORS.textSecondary
              : COLORS.white
          }
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Image info overlay
 */
interface ImageInfoProps {
  visible: boolean;
  image: GalleryImage | null;
  onClose: () => void;
}

const ImageInfo: React.FC<ImageInfoProps> = ({ visible, image, onClose }) => {
  if (!visible || !image) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.infoOverlay}>
        <View style={styles.infoContent}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Thông tin ảnh</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên file</Text>
            <Text style={styles.infoValue}>
              {image.title || "Không có tên"}
            </Text>
          </View>

          {image.width && image.height && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kích thước</Text>
              <Text style={styles.infoValue}>
                {formatDimensions(image.width, image.height)}
              </Text>
            </View>
          )}

          {image.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mô tả</Text>
              <Text style={styles.infoValue}>{image.description}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Đường dẫn</Text>
            <Text style={[styles.infoValue, styles.infoUri]} numberOfLines={2}>
              {image.uri}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Thumbnail strip
 */
interface ThumbnailStripProps {
  images: GalleryImage[];
  currentIndex: number;
  visible: boolean;
  onSelect: (index: number) => void;
}

const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  images,
  currentIndex,
  visible,
  onSelect,
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && visible) {
      flatListRef.current.scrollToIndex({
        index: currentIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [currentIndex, visible]);

  if (!visible) return null;

  return (
    <View style={styles.thumbnailStrip}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: 60,
          offset: 60 * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.thumbnailItem,
              index === currentIndex && styles.thumbnailItemActive,
            ]}
            onPress={() => onSelect(index)}
          >
            <Image
              source={{ uri: item.thumbnail || item.uri }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

/**
 * Zoomable image component
 */
interface ZoomableImageProps {
  uri: string;
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
  onDoubleTap: (x: number, y: number) => void;
  onPanStart: () => void;
  onPan: (dx: number, dy: number) => void;
  onSingleTap: () => void;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  uri,
  scale,
  translateX,
  translateY,
  rotation,
  onDoubleTap,
  onPanStart,
  onPan,
  onSingleTap,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const lastTapRef = useRef<number>(0);
  const lastTapPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (evt) => {
        const now = Date.now();
        const { locationX, locationY } = evt.nativeEvent;

        if (
          now - lastTapRef.current < DOUBLE_TAP_DELAY &&
          Math.abs(locationX - lastTapPositionRef.current.x) < 50 &&
          Math.abs(locationY - lastTapPositionRef.current.y) < 50
        ) {
          onDoubleTap(locationX, locationY);
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
          lastTapPositionRef.current = { x: locationX, y: locationY };
          onPanStart();
        }
      },
      onPanResponderMove: (_, gestureState) => {
        onPan(gestureState.dx, gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Check for single tap (minimal movement)
        if (
          Math.abs(gestureState.dx) < 5 &&
          Math.abs(gestureState.dy) < 5 &&
          gestureState.moveX === 0 &&
          gestureState.moveY === 0
        ) {
          setTimeout(() => {
            if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
              onSingleTap();
            }
          }, DOUBLE_TAP_DELAY);
        }
      },
    }),
  ).current;

  return (
    <View style={styles.imageContainer} {...panResponder.panHandlers}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="image-outline"
            size={64}
            color={COLORS.textSecondary}
          />
          <Text style={styles.errorText}>Không thể tải ảnh</Text>
        </View>
      )}

      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            transform: [
              { scale },
              { translateX: translateX / scale },
              { translateY: translateY / scale },
              { rotate: `${rotation}deg` },
            ],
          },
        ]}
        resizeMode="contain"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </View>
  );
};

/**
 * Navigation arrows
 */
interface NavigationArrowsProps {
  hasPrev: boolean;
  hasNext: boolean;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  hasPrev,
  hasNext,
  visible,
  onPrev,
  onNext,
}) => {
  if (!visible) return null;

  return (
    <>
      {hasPrev && (
        <TouchableOpacity
          style={[styles.navArrow, styles.navArrowLeft]}
          onPress={onPrev}
        >
          <Ionicons name="chevron-back" size={40} color={COLORS.white} />
        </TouchableOpacity>
      )}
      {hasNext && (
        <TouchableOpacity
          style={[styles.navArrow, styles.navArrowRight]}
          onPress={onNext}
        >
          <Ionicons name="chevron-forward" size={40} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ImageViewerScreen: React.FC<ImageViewerScreenProps> = ({
  images,
  initialIndex = 0,
  onClose,
  onIndexChange,
  showHeader = true,
  showFooter = true,
}) => {
  const viewer = useImageViewer(images, initialIndex);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Notify parent of index change
  useEffect(() => {
    onIndexChange?.(viewer.currentIndex);
  }, [viewer.currentIndex, onIndexChange]);

  // Handle close
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Handle share
  const handleShare = useCallback(async () => {
    const success = await viewer.share();
    if (!success) {
      Alert.alert("Lỗi", "Không thể chia sẻ ảnh");
    }
  }, [viewer]);

  // Handle save
  const handleSave = useCallback(async () => {
    const success = await viewer.save();
    if (success) {
      Alert.alert("Thành công", "Đã lưu ảnh vào thư viện");
    } else {
      Alert.alert("Lỗi", "Không thể lưu ảnh");
    }
  }, [viewer]);

  // Handle favorite
  const handleFavorite = useCallback(async () => {
    await viewer.toggleFavorite();
  }, [viewer]);

  // Handle rotate
  const handleRotate = useCallback(() => {
    viewer.rotate(true);
  }, [viewer]);

  // Handle delete
  const handleDelete = useCallback(() => {
    Alert.alert(
      "Xóa ảnh",
      "Bạn có chắc chắn muốn xóa ảnh này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const success = await viewer.delete();
            if (!success) {
              Alert.alert("Lỗi", "Không thể xóa ảnh");
            } else if (images.length === 1) {
              handleClose();
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [viewer, images.length, handleClose]);

  // Handle more menu
  const handleMore = useCallback(() => {
    setShowMoreMenu(true);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Main image */}
      <ZoomableImage
        uri={viewer.currentImage?.uri || ""}
        scale={viewer.scale}
        translateX={viewer.translateX}
        translateY={viewer.translateY}
        rotation={viewer.rotation}
        onDoubleTap={viewer.handleDoubleTap}
        onPanStart={viewer.handlePanStart}
        onPan={viewer.handlePan}
        onSingleTap={viewer.toggleControls}
      />

      {/* Navigation arrows */}
      <NavigationArrows
        hasPrev={viewer.hasPrev}
        hasNext={viewer.hasNext}
        visible={viewer.showControls}
        onPrev={viewer.prev}
        onNext={viewer.next}
      />

      {/* Header */}
      {showHeader && (
        <Header
          title={viewer.currentImage?.title}
          currentIndex={viewer.currentIndex}
          totalImages={viewer.totalImages}
          visible={viewer.showControls}
          onClose={handleClose}
          onInfo={viewer.toggleInfo}
          onMore={handleMore}
        />
      )}

      {/* Footer */}
      {showFooter && (
        <Footer
          visible={viewer.showControls}
          isFavorite={viewer.isFavorite}
          onShare={handleShare}
          onSave={handleSave}
          onFavorite={handleFavorite}
          onRotate={handleRotate}
          onDelete={handleDelete}
        />
      )}

      {/* Zoom controls */}
      <ZoomControls
        visible={viewer.showControls && viewer.scale !== 1}
        scale={viewer.scale}
        onZoomIn={viewer.zoomIn}
        onZoomOut={viewer.zoomOut}
        onReset={viewer.reset}
      />

      {/* Thumbnail strip */}
      <ThumbnailStrip
        images={images}
        currentIndex={viewer.currentIndex}
        visible={viewer.showControls && images.length > 1}
        onSelect={viewer.goTo}
      />

      {/* Image info modal */}
      <ImageInfo
        visible={viewer.showInfo}
        image={viewer.currentImage}
        onClose={viewer.toggleInfo}
      />

      {/* More options modal */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.moreMenuOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={styles.moreMenuContent}>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowMoreMenu(false);
                viewer.toggleInfo();
              }}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={COLORS.white}
              />
              <Text style={styles.moreMenuItemText}>Thông tin ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowMoreMenu(false);
                handleShare();
              }}
            >
              <Ionicons name="share-outline" size={24} color={COLORS.white} />
              <Text style={styles.moreMenuItemText}>Chia sẻ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowMoreMenu(false);
                handleSave();
              }}
            >
              <Ionicons
                name="download-outline"
                size={24}
                color={COLORS.white}
              />
              <Text style={styles.moreMenuItemText}>Lưu vào thiết bị</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowMoreMenu(false);
                viewer.reset();
              }}
            >
              <Ionicons
                name="contract-outline"
                size={24}
                color={COLORS.white}
              />
              <Text style={styles.moreMenuItemText}>Đặt lại zoom</Text>
            </TouchableOpacity>

            <View style={styles.moreMenuDivider} />

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowMoreMenu(false);
                handleDelete();
              }}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
              <Text style={[styles.moreMenuItemText, { color: COLORS.danger }]}>
                Xóa ảnh
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 20,
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.overlay,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.overlay,
  },
  footerButton: {
    alignItems: "center",
    padding: 8,
  },
  footerButtonText: {
    color: COLORS.white,
    fontSize: 11,
    marginTop: 4,
  },

  // Image container
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },

  // Navigation arrows
  navArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    borderRadius: 30,
  },
  navArrowLeft: {
    left: 16,
  },
  navArrowRight: {
    right: 16,
  },

  // Zoom controls
  zoomControls: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    borderRadius: 20,
  },
  zoomIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.overlay,
    borderRadius: 16,
  },
  zoomText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  // Thumbnail strip
  thumbnailStrip: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: COLORS.overlay,
  },
  thumbnailItem: {
    width: 56,
    height: 56,
    marginHorizontal: 2,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailItemActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  // Info overlay
  infoOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  infoContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  infoTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    color: COLORS.white,
    fontSize: 15,
  },
  infoUri: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  // More menu
  moreMenuOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  moreMenuContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 8,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  moreMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  moreMenuItemText: {
    color: COLORS.white,
    fontSize: 16,
  },
  moreMenuDivider: {
    height: 1,
    backgroundColor: "#3A3A3C",
    marginHorizontal: 16,
  },
});

export default ImageViewerScreen;
