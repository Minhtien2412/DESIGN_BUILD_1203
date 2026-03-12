/**
 * Device Permission Request Utilities
 * Centralized permission handling following Expo API best practices
 * Supports: Camera, Media Library, Location, Notifications
 */

import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

// Check if running in Expo Go (SDK 53+ doesn't support push notifications in Expo Go)
const isExpoGo = Constants.appOwnership === "expo";

// Import notifications conditionally - MUST avoid import in Expo Go SDK 53+
let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch {
    console.warn("[Permissions] expo-notifications not available");
  }
} else {
  console.log("[Permissions] Notifications disabled in Expo Go");
}

// Import camera conditionally
let Camera: any;
try {
  Camera = require("expo-camera").Camera;
} catch {
  console.warn("[Permissions] expo-camera not available");
}

export type DevicePermissionType =
  | "camera"
  | "media-library"
  | "location"
  | "location-background"
  | "notifications";

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: "granted" | "denied" | "undetermined";
}

/**
 * Request Camera Permission
 * Used for: Taking photos, QR scanning, video recording
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  try {
    if (!Camera) {
      Alert.alert(
        "Tính năng không khả dụng",
        "Camera không khả dụng trên thiết bị này.",
      );
      return { granted: false, canAskAgain: false, status: "denied" };
    }

    // Check current permission status first
    const { status: currentStatus } = await Camera.getCameraPermissionsAsync();

    if (currentStatus === "granted") {
      return { granted: true, canAskAgain: false, status: "granted" };
    }

    // Request permission with user-friendly prompt
    const { status, canAskAgain } =
      await Camera.requestCameraPermissionsAsync();

    if (status === "granted") {
      return { granted: true, canAskAgain, status: "granted" };
    }

    // Permission denied
    if (!canAskAgain) {
      // User has permanently denied - guide them to settings
      Alert.alert(
        "Quyền Camera bị từ chối",
        "Để sử dụng camera, vui lòng cấp quyền trong Cài đặt > Quyền riêng tư > Camera",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      Alert.alert(
        "Quyền Camera cần thiết",
        "Ứng dụng cần quyền truy cập camera để chụp ảnh và quét mã QR.",
      );
    }

    return { granted: false, canAskAgain, status };
  } catch (error) {
    console.error("[Permission] Camera error:", error);
    Alert.alert("Lỗi", "Không thể yêu cầu quyền camera");
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request Media Library Permission
 * Used for: Picking images/videos, accessing photo gallery
 */
export async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  try {
    // Check current permission status first
    const { status: currentStatus } =
      await ImagePicker.getMediaLibraryPermissionsAsync();

    if (currentStatus === "granted") {
      return { granted: true, canAskAgain: false, status: "granted" };
    }

    // Request permission
    const { status, canAskAgain } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "granted") {
      return { granted: true, canAskAgain, status: "granted" };
    }

    // Permission denied
    if (!canAskAgain) {
      Alert.alert(
        "Quyền Thư viện Ảnh bị từ chối",
        "Để chọn ảnh, vui lòng cấp quyền trong Cài đặt > Quyền riêng tư > Ảnh",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      Alert.alert(
        "Quyền Thư viện Ảnh cần thiết",
        "Ứng dụng cần quyền truy cập thư viện ảnh để chọn và tải ảnh lên.",
      );
    }

    return { granted: false, canAskAgain, status };
  } catch (error) {
    console.error("[Permission] Media Library error:", error);
    Alert.alert("Lỗi", "Không thể yêu cầu quyền thư viện ảnh");
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request Location Permission (Foreground)
 * Used for: Location check-in, maps, nearby services
 */
export async function requestLocationPermission(): Promise<PermissionResult> {
  try {
    // Check current permission status first
    const { status: currentStatus } =
      await Location.getForegroundPermissionsAsync();

    if (currentStatus === "granted") {
      return { granted: true, canAskAgain: false, status: "granted" };
    }

    // Request permission
    const { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      return { granted: true, canAskAgain, status: "granted" };
    }

    // Permission denied
    if (!canAskAgain) {
      Alert.alert(
        "Quyền Vị trí bị từ chối",
        "Để sử dụng dịch vụ định vị, vui lòng cấp quyền trong Cài đặt > Quyền riêng tư > Vị trí",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      Alert.alert(
        "Quyền Vị trí cần thiết",
        "Ứng dụng cần quyền vị trí để check-in, hiển thị bản đồ và tìm dịch vụ gần bạn.",
      );
    }

    return { granted: false, canAskAgain, status };
  } catch (error) {
    console.error("[Permission] Location error:", error);
    Alert.alert("Lỗi", "Không thể yêu cầu quyền vị trí");
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request Background Location Permission
 * Used for: Geofencing, tracking (use sparingly)
 */
export async function requestBackgroundLocationPermission(): Promise<PermissionResult> {
  try {
    // Must have foreground permission first
    const foreground = await requestLocationPermission();
    if (!foreground.granted) {
      return foreground;
    }

    // Check current background permission status
    const { status: currentStatus } =
      await Location.getBackgroundPermissionsAsync();

    if (currentStatus === "granted") {
      return { granted: true, canAskAgain: false, status: "granted" };
    }

    // Request background permission
    const { status, canAskAgain } =
      await Location.requestBackgroundPermissionsAsync();

    if (status === "granted") {
      return { granted: true, canAskAgain, status: "granted" };
    }

    // Permission denied
    if (!canAskAgain) {
      Alert.alert(
        "Quyền Vị trí Nền bị từ chối",
        'Để sử dụng tính năng này, vui lòng cấp quyền "Luôn cho phép" trong Cài đặt > Quyền riêng tư > Vị trí',
        [
          { text: "Hủy", style: "cancel" },
          { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      Alert.alert(
        "Quyền Vị trí Nền cần thiết",
        "Tính năng này cần quyền truy cập vị trí ngay cả khi ứng dụng đang chạy nền.",
      );
    }

    return { granted: false, canAskAgain, status };
  } catch (error) {
    console.error("[Permission] Background Location error:", error);
    Alert.alert("Lỗi", "Không thể yêu cầu quyền vị trí nền");
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request Notification Permission
 * Used for: Push notifications, reminders, alerts
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  try {
    if (!Notifications) {
      console.warn("[Permission] Notifications not available");
      return { granted: false, canAskAgain: false, status: "denied" };
    }

    // Check current permission status first
    const { status: currentStatus } = await Notifications.getPermissionsAsync();

    if (currentStatus === "granted") {
      return { granted: true, canAskAgain: false, status: "granted" };
    }

    // Request permission
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync(
      {
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      },
    );

    if (status === "granted") {
      return { granted: true, canAskAgain, status: "granted" };
    }

    // Permission denied
    if (!canAskAgain) {
      Alert.alert(
        "Quyền Thông báo bị từ chối",
        "Để nhận thông báo, vui lòng cấp quyền trong Cài đặt > Thông báo",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Mở Cài đặt", onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      Alert.alert(
        "Quyền Thông báo cần thiết",
        "Ứng dụng cần quyền gửi thông báo để cập nhật tiến độ dự án, tin nhắn và nhắc nhở.",
      );
    }

    return { granted: false, canAskAgain, status };
  } catch (error) {
    console.error("[Permission] Notification error:", error);
    Alert.alert("Lỗi", "Không thể yêu cầu quyền thông báo");
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Generic permission request
 */
export async function requestDevicePermission(
  type: DevicePermissionType,
): Promise<PermissionResult> {
  switch (type) {
    case "camera":
      return requestCameraPermission();
    case "media-library":
      return requestMediaLibraryPermission();
    case "location":
      return requestLocationPermission();
    case "location-background":
      return requestBackgroundLocationPermission();
    case "notifications":
      return requestNotificationPermission();
    default:
      console.warn(`[Permission] Unknown permission type: ${type}`);
      return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check if permission is granted (without requesting)
 */
export async function checkDevicePermission(
  type: DevicePermissionType,
): Promise<boolean> {
  try {
    switch (type) {
      case "camera":
        if (!Camera) return false;
        const { status: cameraStatus } =
          await Camera.getCameraPermissionsAsync();
        return cameraStatus === "granted";

      case "media-library":
        const { status: mediaStatus } =
          await ImagePicker.getMediaLibraryPermissionsAsync();
        return mediaStatus === "granted";

      case "location":
        const { status: locationStatus } =
          await Location.getForegroundPermissionsAsync();
        return locationStatus === "granted";

      case "location-background":
        const { status: bgLocationStatus } =
          await Location.getBackgroundPermissionsAsync();
        return bgLocationStatus === "granted";

      case "notifications":
        if (!Notifications) return false;
        const { status: notifStatus } =
          await Notifications.getPermissionsAsync();
        return notifStatus === "granted";

      default:
        return false;
    }
  } catch (error) {
    console.error(`[Permission] Check error for ${type}:`, error);
    return false;
  }
}

/**
 * Request multiple permissions at once
 */
export async function requestMultipleDevicePermissions(
  types: DevicePermissionType[],
): Promise<Record<DevicePermissionType, PermissionResult>> {
  const results: Record<string, PermissionResult> = {};

  for (const type of types) {
    results[type] = await requestDevicePermission(type);
  }

  return results as Record<DevicePermissionType, PermissionResult>;
}

/**
 * Open app settings
 */
export function openAppSettings() {
  Linking.openSettings();
}
