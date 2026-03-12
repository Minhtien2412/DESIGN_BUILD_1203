/**
 * Permission Utilities
 * Quản lý quyền truy cập ứng dụng
 */

import { Camera } from "expo-camera";
import Constants from "expo-constants";
import * as Contacts from "expo-contacts";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { Alert, Linking } from "react-native";

// Lazy import expo-notifications to avoid crash in Expo Go SDK 53+
let Notifications: typeof import("expo-notifications") | null = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("[Permissions] expo-notifications not available");
  }
}

// ============================================
// TYPES
// ============================================

export type PermissionType =
  | "camera"
  | "microphone"
  | "photos"
  | "contacts"
  | "location"
  | "locationBackground"
  | "notifications"
  | "mediaLibrary";

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: "granted" | "denied" | "undetermined";
}

export interface PermissionResult {
  permission: PermissionType;
  status: PermissionStatus;
}

// ============================================
// PERMISSION CHECK FUNCTIONS
// ============================================

/**
 * Check camera permission
 */
export async function checkCameraPermission(): Promise<PermissionStatus> {
  try {
    const permission = await Camera.getCameraPermissionsAsync();
    return {
      granted: permission.granted,
      canAskAgain: permission.canAskAgain ?? true,
      status: permission.granted
        ? "granted"
        : permission.canAskAgain
          ? "undetermined"
          : "denied",
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check microphone permission
 */
export async function checkMicrophonePermission(): Promise<PermissionStatus> {
  try {
    const permission = await Camera.getMicrophonePermissionsAsync();
    return {
      granted: permission.granted,
      canAskAgain: permission.canAskAgain ?? true,
      status: permission.granted
        ? "granted"
        : permission.canAskAgain
          ? "undetermined"
          : "denied",
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check photo library permission
 */
export async function checkPhotosPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await ImagePicker.getMediaLibraryPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check contacts permission
 */
export async function checkContactsPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Contacts.getPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check location permission
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await Location.getForegroundPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check background location permission
 */
export async function checkBackgroundLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await Location.getBackgroundPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check notification permission
 */
export async function checkNotificationPermission(): Promise<PermissionStatus> {
  try {
    if (!Notifications) {
      return { granted: false, canAskAgain: false, status: "denied" };
    }
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check media library permission
 */
export async function checkMediaLibraryPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

// ============================================
// REQUEST PERMISSION FUNCTIONS
// ============================================

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<PermissionStatus> {
  try {
    const permission = await Camera.requestCameraPermissionsAsync();
    return {
      granted: permission.granted,
      canAskAgain: permission.canAskAgain ?? true,
      status: permission.granted
        ? "granted"
        : permission.canAskAgain
          ? "undetermined"
          : "denied",
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<PermissionStatus> {
  try {
    const permission = await Camera.requestMicrophonePermissionsAsync();
    return {
      granted: permission.granted,
      canAskAgain: permission.canAskAgain ?? true,
      status: permission.granted
        ? "granted"
        : permission.canAskAgain
          ? "undetermined"
          : "denied",
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request photo library permission
 */
export async function requestPhotosPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request contacts permission
 */
export async function requestContactsPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request background location permission
 */
export async function requestBackgroundLocationPermission(): Promise<PermissionStatus> {
  try {
    // First need foreground permission
    const foreground = await requestLocationPermission();
    if (!foreground.granted) {
      return foreground;
    }

    const { status, canAskAgain } =
      await Location.requestBackgroundPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  try {
    if (!Notifications) {
      return { granted: false, canAskAgain: false, status: "denied" };
    }
    const { status, canAskAgain } =
      await Notifications.requestPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request media library permission
 */
export async function requestMediaLibraryPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await MediaLibrary.requestPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as PermissionStatus["status"],
    };
  } catch {
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check permission by type
 */
export async function checkPermission(
  type: PermissionType,
): Promise<PermissionStatus> {
  switch (type) {
    case "camera":
      return checkCameraPermission();
    case "microphone":
      return checkMicrophonePermission();
    case "photos":
      return checkPhotosPermission();
    case "contacts":
      return checkContactsPermission();
    case "location":
      return checkLocationPermission();
    case "locationBackground":
      return checkBackgroundLocationPermission();
    case "notifications":
      return checkNotificationPermission();
    case "mediaLibrary":
      return checkMediaLibraryPermission();
    default:
      return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request permission by type
 */
export async function requestPermission(
  type: PermissionType,
): Promise<PermissionStatus> {
  switch (type) {
    case "camera":
      return requestCameraPermission();
    case "microphone":
      return requestMicrophonePermission();
    case "photos":
      return requestPhotosPermission();
    case "contacts":
      return requestContactsPermission();
    case "location":
      return requestLocationPermission();
    case "locationBackground":
      return requestBackgroundLocationPermission();
    case "notifications":
      return requestNotificationPermission();
    case "mediaLibrary":
      return requestMediaLibraryPermission();
    default:
      return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check multiple permissions
 */
export async function checkPermissions(
  types: PermissionType[],
): Promise<PermissionResult[]> {
  const results = await Promise.all(
    types.map(async (type) => ({
      permission: type,
      status: await checkPermission(type),
    })),
  );
  return results;
}

/**
 * Request multiple permissions
 */
export async function requestPermissions(
  types: PermissionType[],
): Promise<PermissionResult[]> {
  const results: PermissionResult[] = [];
  // Request sequentially to avoid issues
  for (const type of types) {
    const status = await requestPermission(type);
    results.push({ permission: type, status });
  }
  return results;
}

/**
 * Open app settings
 */
export function openSettings(): void {
  Linking.openSettings();
}

/**
 * Show permission denied alert with option to go to settings
 */
export function showPermissionDeniedAlert(
  title: string,
  message: string,
  onCancel?: () => void,
): void {
  Alert.alert(title, message, [
    {
      text: "Hủy",
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: "Mở cài đặt",
      onPress: openSettings,
    },
  ]);
}

/**
 * Permission labels in Vietnamese
 */
export const permissionLabels: Record<PermissionType, string> = {
  camera: "Camera",
  microphone: "Micro",
  photos: "Thư viện ảnh",
  contacts: "Danh bạ",
  location: "Vị trí",
  locationBackground: "Vị trí nền",
  notifications: "Thông báo",
  mediaLibrary: "Thư viện media",
};

/**
 * Get permission label
 */
export function getPermissionLabel(type: PermissionType): string {
  return permissionLabels[type] || type;
}

// ============================================
// EXPORTS
// ============================================

export const permissionUtils = {
  checkCameraPermission,
  checkMicrophonePermission,
  checkPhotosPermission,
  checkContactsPermission,
  checkLocationPermission,
  checkBackgroundLocationPermission,
  checkNotificationPermission,
  checkMediaLibraryPermission,
  requestCameraPermission,
  requestMicrophonePermission,
  requestPhotosPermission,
  requestContactsPermission,
  requestLocationPermission,
  requestBackgroundLocationPermission,
  requestNotificationPermission,
  requestMediaLibraryPermission,
  checkPermission,
  requestPermission,
  checkPermissions,
  requestPermissions,
  openSettings,
  showPermissionDeniedAlert,
  permissionLabels,
  getPermissionLabel,
};

export default permissionUtils;
