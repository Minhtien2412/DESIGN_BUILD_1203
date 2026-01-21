/**
 * CameraScreen - Camera capture screen
 * CAM-001: Camera Capture
 *
 * Features:
 * - Photo/Video mode toggle
 * - Flash control
 * - Front/back camera switch
 * - Zoom controls
 * - Preview before upload
 */

import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
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
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../../constants/theme";
import {
    calculateZoomFromPinch,
    CameraMode,
    CapturedMedia,
    capturePhotoWithPicker,
    captureVideoWithPicker,
    formatRecordingDuration,
    formatZoomDisplay,
    getFlashIcon,
    openSettings,
    useCameraCapture,
    useCameraSettings
} from "../../services/CameraService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CameraScreenProps {
  onCapture?: (media: CapturedMedia) => void;
  onClose?: () => void;
  initialMode?: CameraMode;
  allowModeSwitch?: boolean;
  maxVideoDuration?: number;
}

export function CameraScreen({
  onCapture,
  onClose,
  initialMode = "photo",
  allowModeSwitch = true,
  maxVideoDuration = 60,
}: CameraScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  // Permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Settings
  const { settings, setMode, toggleFacing, cycleFlash, setZoom } =
    useCameraSettings();

  // Capture state
  const {
    capturedMedia,
    isCapturing,
    isRecording,
    recordingDuration,
    setCapturedMedia,
    clearCapture,
  } = useCameraCapture();

  // Local state
  const [isReady, setIsReady] = useState(false);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);

  // Animation values
  const captureButtonScale = useSharedValue(1);
  const zoomIndicatorOpacity = useSharedValue(0);

  // Initialize mode
  useEffect(() => {
    if (initialMode !== settings.mode) {
      setMode(initialMode);
    }
  }, [initialMode, setMode, settings.mode]);

  // Handle capture button press
  const handleCapture = useCallback(async () => {
    if (isCapturing || isRecording) return;

    // Animate button
    captureButtonScale.value = withSpring(0.9, {}, () => {
      captureButtonScale.value = withSpring(1);
    });

    if (settings.mode === "photo") {
      // Use picker API for simpler implementation
      const result = await capturePhotoWithPicker({
        quality: settings.quality,
      });
      if (result) {
        setCapturedMedia(result);
      }
    } else {
      // Video recording
      const result = await captureVideoWithPicker({
        durationLimit: maxVideoDuration,
      });
      if (result) {
        setCapturedMedia(result);
      }
    }
  }, [
    isCapturing,
    isRecording,
    settings.mode,
    settings.quality,
    maxVideoDuration,
    captureButtonScale,
    setCapturedMedia,
  ]);

  // Handle confirm captured media
  const handleConfirm = useCallback(() => {
    if (capturedMedia && onCapture) {
      onCapture(capturedMedia);
    }
    clearCapture();
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [capturedMedia, onCapture, clearCapture, onClose, router]);

  // Handle close/cancel
  const handleClose = useCallback(() => {
    if (capturedMedia) {
      clearCapture();
    } else {
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }
  }, [capturedMedia, clearCapture, onClose, router]);

  // Handle mode toggle
  const handleModeToggle = useCallback(() => {
    if (!allowModeSwitch) return;
    setMode(settings.mode === "photo" ? "video" : "photo");
  }, [allowModeSwitch, settings.mode, setMode]);

  // Pinch to zoom gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newZoom = calculateZoomFromPinch(e.scale, settings.zoom);
      runOnJS(setZoom)(newZoom);
      zoomIndicatorOpacity.value = 1;
      runOnJS(setShowZoomIndicator)(true);
    })
    .onEnd(() => {
      zoomIndicatorOpacity.value = withTiming(0, { duration: 1000 }, () => {
        runOnJS(setShowZoomIndicator)(false);
      });
    });

  // Animated styles
  const captureButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureButtonScale.value }],
  }));

  const zoomIndicatorStyle = useAnimatedStyle(() => ({
    opacity: zoomIndicatorOpacity.value,
  }));

  // Permission not granted
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons
          name="camera-outline"
          size={64}
          color={COLORS.textSecondary}
        />
        <Text style={styles.permissionTitle}>Cần quyền Camera</Text>
        <Text style={styles.permissionText}>
          Cho phép ứng dụng truy cập camera để chụp ảnh và quay video.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Cấp quyền</Text>
        </Pressable>
        {permission.canAskAgain === false && (
          <Pressable
            style={[styles.permissionButton, styles.settingsButton]}
            onPress={openSettings}
          >
            <Text style={styles.settingsButtonText}>Mở Cài đặt</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  // Preview mode - show captured media
  if (capturedMedia) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Preview */}
        <View style={styles.previewContainer}>
          {capturedMedia.type === "photo" ? (
            <Image
              source={{ uri: capturedMedia.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.videoPreview}>
              <Ionicons name="videocam" size={64} color={COLORS.white} />
              <Text style={styles.videoPreviewText}>
                Video đã quay (
                {formatRecordingDuration(capturedMedia.duration || 0)})
              </Text>
            </View>
          )}
        </View>

        {/* Preview actions */}
        <View
          style={[styles.previewActions, { paddingBottom: insets.bottom + 20 }]}
        >
          <Pressable style={styles.previewActionButton} onPress={clearCapture}>
            <Ionicons name="close" size={28} color={COLORS.white} />
            <Text style={styles.previewActionText}>Chụp lại</Text>
          </Pressable>

          <Pressable
            style={[styles.previewActionButton, styles.confirmButton]}
            onPress={handleConfirm}
          >
            <Ionicons name="checkmark" size={28} color={COLORS.white} />
            <Text style={styles.previewActionText}>Sử dụng</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Camera view
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <GestureDetector gesture={pinchGesture}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={settings.facing}
            flash={settings.flash as "off" | "on" | "auto"}
            zoom={settings.zoom}
            onCameraReady={() => setIsReady(true)}
          />

          {/* Top controls */}
          <SafeAreaView style={styles.topControls}>
            <Pressable style={styles.controlButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </Pressable>

            <View style={styles.topCenterControls}>
              {/* Flash */}
              <Pressable style={styles.controlButton} onPress={cycleFlash}>
                <Ionicons
                  name={getFlashIcon(settings.flash) as any}
                  size={24}
                  color={
                    settings.flash === "off"
                      ? COLORS.textSecondary
                      : COLORS.warning
                  }
                />
              </Pressable>
            </View>

            <View style={styles.spacer} />
          </SafeAreaView>

          {/* Zoom indicator */}
          {showZoomIndicator && (
            <Animated.View style={[styles.zoomIndicator, zoomIndicatorStyle]}>
              <Text style={styles.zoomText}>
                {formatZoomDisplay(settings.zoom)}
              </Text>
            </Animated.View>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>
                {formatRecordingDuration(recordingDuration)}
              </Text>
            </View>
          )}

          {/* Bottom controls */}
          <View
            style={[
              styles.bottomControls,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            {/* Mode toggle */}
            {allowModeSwitch && (
              <Pressable style={styles.modeToggle} onPress={handleModeToggle}>
                <Text
                  style={[
                    styles.modeText,
                    settings.mode === "photo" && styles.modeTextActive,
                  ]}
                >
                  ẢNH
                </Text>
                <Text
                  style={[
                    styles.modeText,
                    settings.mode === "video" && styles.modeTextActive,
                  ]}
                >
                  VIDEO
                </Text>
              </Pressable>
            )}

            {/* Capture row */}
            <View style={styles.captureRow}>
              {/* Gallery button placeholder */}
              <View style={styles.sideButton} />

              {/* Capture button */}
              <Pressable
                onPress={handleCapture}
                disabled={!isReady || isCapturing}
              >
                <Animated.View
                  style={[
                    styles.captureButton,
                    settings.mode === "video" && styles.captureButtonVideo,
                    captureButtonStyle,
                  ]}
                >
                  {isCapturing ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <View
                      style={[
                        styles.captureButtonInner,
                        settings.mode === "video" &&
                          styles.captureButtonInnerVideo,
                        isRecording && styles.captureButtonRecording,
                      ]}
                    />
                  )}
                </Animated.View>
              </Pressable>

              {/* Flip camera */}
              <Pressable style={styles.sideButton} onPress={toggleFacing}>
                <Ionicons
                  name="camera-reverse-outline"
                  size={28}
                  color={COLORS.white}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.black,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },

  // Permissions
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  settingsButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsButtonText: {
    color: COLORS.text,
    fontSize: 16,
  },

  // Top controls
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  topCenterControls: {
    flexDirection: "row",
    gap: 12,
  },
  spacer: {
    width: 44,
  },

  // Zoom indicator
  zoomIndicator: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // Recording indicator
  recordingIndicator: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: 8,
  },
  recordingTime: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  // Bottom controls
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  modeToggle: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 24,
  },
  modeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  modeTextActive: {
    color: COLORS.white,
  },
  captureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  captureButtonVideo: {
    backgroundColor: COLORS.error,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
  },
  captureButtonInnerVideo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  captureButtonRecording: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },

  // Preview
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  videoPreview: {
    justifyContent: "center",
    alignItems: "center",
  },
  videoPreviewText: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 16,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 48,
    paddingTop: 24,
  },
  previewActionButton: {
    alignItems: "center",
    padding: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  previewActionText: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 8,
  },
});

export default CameraScreen;
