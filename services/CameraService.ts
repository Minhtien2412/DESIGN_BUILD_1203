/**
 * CameraService - Camera capture for photos and videos
 * CAM-001: Camera Capture
 *
 * Features:
 * - Permission handling (all states)
 * - Photo capture mode
 * - Video capture mode
 * - Focus/zoom controls
 * - Flash toggle
 * - Front/back camera switch
 * - Preview before upload
 * - Direct upload integration
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

// ============================================================================
// TYPES
// ============================================================================

export type CameraMode = "photo" | "video";
export type CameraFacing = "front" | "back";
export type FlashState = "off" | "on" | "auto" | "torch";

export interface CameraSettings {
  mode: CameraMode;
  facing: CameraFacing;
  flash: FlashState;
  zoom: number; // 0 to 1
  ratio: string; // '4:3', '16:9', '1:1'
  quality: number; // 0 to 1
  enableSound: boolean;
  maxDuration: number; // seconds for video
  saveToGallery: boolean;
}

export interface CapturedMedia {
  uri: string;
  type: "photo" | "video";
  width?: number;
  height?: number;
  duration?: number; // video duration in seconds
  fileSize?: number;
  exif?: Record<string, unknown>;
  timestamp: number;
}

export interface CameraPermissionState {
  camera: "granted" | "denied" | "undetermined" | "limited";
  microphone: "granted" | "denied" | "undetermined" | "limited";
  mediaLibrary: "granted" | "denied" | "undetermined" | "limited";
}

export interface QualityPreset {
  name: string;
  value: number;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "@camera_settings";

const DEFAULT_SETTINGS: CameraSettings = {
  mode: "photo",
  facing: "back",
  flash: "auto",
  zoom: 0,
  ratio: "4:3",
  quality: 0.8,
  enableSound: true,
  maxDuration: 60,
  saveToGallery: false,
};

export const QUALITY_PRESETS: QualityPreset[] = [
  { name: "Thấp", value: 0.3, description: "Nhẹ, nhanh upload" },
  { name: "Trung bình", value: 0.5, description: "Cân bằng" },
  { name: "Cao", value: 0.8, description: "Chất lượng tốt" },
  { name: "Tối đa", value: 1.0, description: "Chất lượng cao nhất" },
];

export const ASPECT_RATIOS = [
  { label: "4:3", value: "4:3" },
  { label: "16:9", value: "16:9" },
  { label: "1:1", value: "1:1" },
];

const MAX_VIDEO_DURATION = 300; // 5 minutes
const MIN_VIDEO_DURATION = 3; // 3 seconds

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

/**
 * Check all camera-related permissions
 */
export async function checkCameraPermissions(): Promise<CameraPermissionState> {
  const [camera, microphone, mediaLibrary] = await Promise.all([
    ImagePicker.getCameraPermissionsAsync(),
    getRecordingPermissionsAsync(),
    MediaLibrary.getPermissionsAsync(),
  ]);

  return {
    camera: camera.status,
    microphone: microphone.status,
    mediaLibrary: mediaLibrary.status,
  };
}

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
}

/**
 * Request microphone permission (for video)
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  const { status } = await requestRecordingPermissionsAsync();
  return status === "granted";
}

/**
 * Request media library permission (for saving)
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Request all required permissions
 */
export async function requestAllPermissions(
  includeMediaLibrary = false,
): Promise<CameraPermissionState> {
  const [camera, microphone, mediaLibrary] = await Promise.all([
    ImagePicker.requestCameraPermissionsAsync(),
    requestRecordingPermissionsAsync(),
    includeMediaLibrary
      ? MediaLibrary.requestPermissionsAsync()
      : Promise.resolve({ status: "undetermined" as const }),
  ]);

  return {
    camera: camera.status,
    microphone: microphone.status,
    mediaLibrary: mediaLibrary.status,
  };
}

/**
 * Open device settings for permission changes
 */
export async function openSettings(): Promise<void> {
  if (Platform.OS === "ios") {
    await Linking.openURL("app-settings:");
  } else {
    await Linking.openSettings();
  }
}

/**
 * Show permission denied alert with settings redirect option
 */
export function showPermissionDeniedAlert(
  permissionType: "camera" | "microphone" | "gallery",
): void {
  const messages = {
    camera: {
      title: "Cần quyền Camera",
      message:
        "Vui lòng cấp quyền camera trong Cài đặt để chụp ảnh và quay video.",
    },
    microphone: {
      title: "Cần quyền Microphone",
      message: "Vui lòng cấp quyền microphone trong Cài đặt để ghi âm video.",
    },
    gallery: {
      title: "Cần quyền Thư viện",
      message: "Vui lòng cấp quyền thư viện trong Cài đặt để lưu ảnh/video.",
    },
  };

  const { title, message } = messages[permissionType];

  Alert.alert(title, message, [
    { text: "Hủy", style: "cancel" },
    { text: "Mở Cài đặt", onPress: openSettings },
  ]);
}

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

/**
 * Load saved camera settings
 */
export async function loadCameraSettings(): Promise<CameraSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn("[CameraService] Failed to load settings:", error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save camera settings
 */
export async function saveCameraSettings(
  settings: Partial<CameraSettings>,
): Promise<void> {
  try {
    const current = await loadCameraSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("[CameraService] Failed to save settings:", error);
  }
}

/**
 * Reset to default settings
 */
export async function resetCameraSettings(): Promise<CameraSettings> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[CameraService] Failed to reset settings:", error);
  }
  return DEFAULT_SETTINGS;
}

// ============================================================================
// CAPTURE HELPERS
// ============================================================================

/**
 * Capture photo using ImagePicker (simpler API)
 */
export async function capturePhotoWithPicker(
  options: Partial<{
    quality: number;
    allowsEditing: boolean;
    aspect: [number, number];
    exif: boolean;
  }> = {},
): Promise<CapturedMedia | null> {
  // Check permission
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  if (status !== "granted") {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.status !== "granted") {
      showPermissionDeniedAlert("camera");
      return null;
    }
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: "images",
    quality: options.quality ?? 0.8,
    allowsEditing: options.allowsEditing ?? false,
    aspect: options.aspect,
    exif: options.exif ?? true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: "photo",
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize,
    exif: asset.exif as Record<string, unknown> | undefined,
    timestamp: Date.now(),
  };
}

/**
 * Capture video using ImagePicker
 */
export async function captureVideoWithPicker(
  options: Partial<{
    quality: ImagePicker.UIImagePickerControllerQualityType;
    durationLimit: number;
  }> = {},
): Promise<CapturedMedia | null> {
  // Check camera permission
  const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
  if (cameraStatus.status !== "granted") {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.status !== "granted") {
      showPermissionDeniedAlert("camera");
      return null;
    }
  }

  // Check microphone permission
  const micStatus = await getRecordingPermissionsAsync();
  if (micStatus.status !== "granted") {
    const result = await requestRecordingPermissionsAsync();
    if (result.status !== "granted") {
      showPermissionDeniedAlert("microphone");
      return null;
    }
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: "videos",
    videoQuality:
      options.quality ?? ImagePicker.UIImagePickerControllerQualityType.High,
    videoMaxDuration: options.durationLimit ?? 60,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: "video",
    width: asset.width,
    height: asset.height,
    duration: asset.duration ?? undefined,
    fileSize: asset.fileSize,
    timestamp: Date.now(),
  };
}

/**
 * Save media to device gallery
 */
export async function saveToGallery(uri: string): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== "granted") {
      const result = await MediaLibrary.requestPermissionsAsync();
      if (result.status !== "granted") {
        showPermissionDeniedAlert("gallery");
        return false;
      }
    }

    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch (error) {
    console.error("[CameraService] Failed to save to gallery:", error);
    return false;
  }
}

// ============================================================================
// ZOOM HELPERS
// ============================================================================

/**
 * Calculate zoom value from pinch gesture
 */
export function calculateZoomFromPinch(
  scale: number,
  currentZoom: number,
  sensitivity = 0.005,
): number {
  const delta = (scale - 1) * sensitivity;
  return Math.max(0, Math.min(1, currentZoom + delta));
}

/**
 * Format zoom for display (e.g., "2.5x")
 */
export function formatZoomDisplay(
  zoom: number,
  minZoom = 1,
  maxZoom = 10,
): string {
  const actualZoom = minZoom + zoom * (maxZoom - minZoom);
  return `${actualZoom.toFixed(1)}x`;
}

// ============================================================================
// FLASH HELPERS
// ============================================================================

/**
 * Cycle through flash modes
 */
export function cycleFlashMode(current: FlashState): FlashState {
  const modes: FlashState[] = ["auto", "on", "off"];
  const currentIndex = modes.indexOf(current);
  const nextIndex = (currentIndex + 1) % modes.length;
  return modes[nextIndex];
}

/**
 * Get flash icon name
 */
export function getFlashIcon(flash: FlashState): string {
  const icons: Record<FlashState, string> = {
    off: "flash-off-outline",
    on: "flash-outline",
    auto: "flash-outline",
    torch: "flashlight-outline",
  };
  return icons[flash];
}

/**
 * Get flash label
 */
export function getFlashLabel(flash: FlashState): string {
  const labels: Record<FlashState, string> = {
    off: "Tắt",
    on: "Bật",
    auto: "Tự động",
    torch: "Đèn pin",
  };
  return labels[flash];
}

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook for camera permissions
 */
export function useCameraPermissionState() {
  const [permissions, setPermissions] = useState<CameraPermissionState>({
    camera: "undetermined",
    microphone: "undetermined",
    mediaLibrary: "undetermined",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkCameraPermissions()
      .then(setPermissions)
      .finally(() => setIsLoading(false));
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const result = await checkCameraPermissions();
    setPermissions(result);
    setIsLoading(false);
  }, []);

  const requestAll = useCallback(async (includeMediaLibrary = false) => {
    setIsLoading(true);
    const result = await requestAllPermissions(includeMediaLibrary);
    setPermissions(result);
    setIsLoading(false);
    return result;
  }, []);

  const canCapture = permissions.camera === "granted";
  const canRecordVideo =
    permissions.camera === "granted" && permissions.microphone === "granted";
  const canSaveToGallery = permissions.mediaLibrary === "granted";

  return {
    permissions,
    isLoading,
    canCapture,
    canRecordVideo,
    canSaveToGallery,
    refresh,
    requestAll,
    openSettings,
  };
}

/**
 * Hook for camera settings
 */
export function useCameraSettings() {
  const [settings, setSettings] = useState<CameraSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCameraSettings()
      .then(setSettings)
      .finally(() => setIsLoading(false));
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<CameraSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...updates };
        saveCameraSettings(next);
        return next;
      });
    },
    [],
  );

  const reset = useCallback(async () => {
    const defaults = await resetCameraSettings();
    setSettings(defaults);
  }, []);

  // Individual setters for convenience
  const setMode = useCallback(
    (mode: CameraMode) => updateSettings({ mode }),
    [updateSettings],
  );

  const setFacing = useCallback(
    (facing: CameraFacing) => updateSettings({ facing }),
    [updateSettings],
  );

  const toggleFacing = useCallback(() => {
    setSettings((prev) => {
      const newFacing: CameraFacing = prev.facing === "back" ? "front" : "back";
      const next: CameraSettings = {
        ...prev,
        facing: newFacing,
      };
      saveCameraSettings(next);
      return next;
    });
  }, []);

  const setFlash = useCallback(
    (flash: FlashState) => updateSettings({ flash }),
    [updateSettings],
  );

  const cycleFlash = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, flash: cycleFlashMode(prev.flash) };
      saveCameraSettings(next);
      return next;
    });
  }, []);

  const setZoom = useCallback(
    (zoom: number) => updateSettings({ zoom: Math.max(0, Math.min(1, zoom)) }),
    [updateSettings],
  );

  const setQuality = useCallback(
    (quality: number) =>
      updateSettings({ quality: Math.max(0, Math.min(1, quality)) }),
    [updateSettings],
  );

  const setRatio = useCallback(
    (ratio: string) => updateSettings({ ratio }),
    [updateSettings],
  );

  return {
    settings,
    isLoading,
    updateSettings,
    reset,
    setMode,
    setFacing,
    toggleFacing,
    setFlash,
    cycleFlash,
    setZoom,
    setQuality,
    setRatio,
  };
}

/**
 * Hook for camera capture with preview state
 */
export function useCameraCapture() {
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(
    null,
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const capturePhoto = useCallback(
    async (options?: Parameters<typeof capturePhotoWithPicker>[0]) => {
      setIsCapturing(true);
      try {
        const result = await capturePhotoWithPicker(options);
        if (result) {
          setCapturedMedia(result);
        }
        return result;
      } finally {
        setIsCapturing(false);
      }
    },
    [],
  );

  const startVideoRecording = useCallback(
    async (options?: Parameters<typeof captureVideoWithPicker>[0]) => {
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);

      try {
        const result = await captureVideoWithPicker(options);
        if (result) {
          setCapturedMedia(result);
        }
        return result;
      } finally {
        setIsRecording(false);
        setRecordingDuration(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      }
    },
    [],
  );

  const clearCapture = useCallback(() => {
    setCapturedMedia(null);
  }, []);

  const retake = useCallback(() => {
    setCapturedMedia(null);
  }, []);

  return {
    capturedMedia,
    isCapturing,
    isRecording,
    recordingDuration,
    capturePhoto,
    startVideoRecording,
    clearCapture,
    retake,
    setCapturedMedia,
  };
}

/**
 * Format recording duration for display
 */
export function formatRecordingDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Check if video duration is valid
 */
export function isValidVideoDuration(duration: number): boolean {
  return duration >= MIN_VIDEO_DURATION && duration <= MAX_VIDEO_DURATION;
}

// ============================================================================
// CAMERA SERVICE CLASS
// ============================================================================

class CameraServiceClass {
  private settings: CameraSettings = DEFAULT_SETTINGS;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.settings = await loadCameraSettings();
    this.initialized = true;
  }

  getSettings(): CameraSettings {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<CameraSettings>): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await saveCameraSettings(this.settings);
  }

  async checkPermissions(): Promise<CameraPermissionState> {
    return checkCameraPermissions();
  }

  async requestPermissions(
    includeMediaLibrary = false,
  ): Promise<CameraPermissionState> {
    return requestAllPermissions(includeMediaLibrary);
  }

  async capturePhoto(
    options?: Parameters<typeof capturePhotoWithPicker>[0],
  ): Promise<CapturedMedia | null> {
    return capturePhotoWithPicker({
      quality: this.settings.quality,
      ...options,
    });
  }

  async captureVideo(
    options?: Parameters<typeof captureVideoWithPicker>[0],
  ): Promise<CapturedMedia | null> {
    return captureVideoWithPicker({
      durationLimit: this.settings.maxDuration,
      ...options,
    });
  }

  async saveToGallery(uri: string): Promise<boolean> {
    return saveToGallery(uri);
  }
}

export const CameraService = new CameraServiceClass();
export default CameraService;
