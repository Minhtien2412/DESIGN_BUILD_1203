/**
 * Device Permissions Manager
 * Quản lý quyền truy cập tài nguyên thiết bị
 * @updated 04/02/2026 - Thêm contacts, phone, calendar
 */

import Constants from "expo-constants";
import * as Contacts from "expo-contacts";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";

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

export type PermissionType =
  | "camera"
  | "location"
  | "notifications"
  | "storage"
  | "microphone"
  | "contacts"
  | "calendar";

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: "granted" | "denied" | "undetermined";
}

/**
 * Request Camera Permission
 */
export async function requestCameraPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await ImagePicker.requestCameraPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    console.error("Error requesting camera permission:", error);
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request Gallery/Storage Permission
 */
export async function requestStoragePermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    console.error("Error requesting storage permission:", error);
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request Location Permission
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request Notification Permission
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  try {
    if (!Notifications) {
      console.warn("[Permissions] Notifications not available in Expo Go");
      return { granted: false, canAskAgain: false, status: "denied" };
    }
    const { status, canAskAgain } =
      await Notifications.requestPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Request Contacts Permission
 */
export async function requestContactsPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Contacts.requestPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as any,
    };
  } catch (error) {
    console.error("Error requesting contacts permission:", error);
    return { granted: false, canAskAgain: false, status: "denied" };
  }
}

/**
 * Check Contacts Permission Status
 */
export async function checkContactsPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Contacts.getPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain: canAskAgain ?? true,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: "undetermined" };
  }
}

/**
 * Get Contacts from Device
 * Requires contacts permission to be granted first
 */
export async function getDeviceContacts(options?: {
  pageSize?: number;
  pageOffset?: number;
  fields?: Contacts.FieldType[];
}): Promise<Contacts.Contact[]> {
  try {
    const hasPermission = await checkContactsPermission();
    if (!hasPermission.granted) {
      console.warn("[Contacts] Permission not granted");
      return [];
    }

    const { data } = await Contacts.getContactsAsync({
      pageSize: options?.pageSize ?? 50,
      pageOffset: options?.pageOffset ?? 0,
      fields: options?.fields ?? [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Image,
        Contacts.Fields.Company,
      ],
    });

    return data;
  } catch (error) {
    console.error("[Contacts] Error getting contacts:", error);
    return [];
  }
}

/**
 * Search Contacts by name or phone
 */
export async function searchContacts(
  query: string,
): Promise<Contacts.Contact[]> {
  try {
    const hasPermission = await checkContactsPermission();
    if (!hasPermission.granted) {
      return [];
    }

    const { data } = await Contacts.getContactsAsync({
      name: query,
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Image,
      ],
    });

    return data;
  } catch (error) {
    console.error("[Contacts] Error searching contacts:", error);
    return [];
  }
}

/**
 * Make a phone call
 * Opens native phone dialer with the number
 */
export async function makePhoneCall(phoneNumber: string): Promise<boolean> {
  try {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
    const url = Platform.select({
      ios: `tel:${cleanNumber}`,
      android: `tel:${cleanNumber}`,
    });

    if (!url) return false;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert("Lỗi", "Thiết bị không hỗ trợ gọi điện");
      return false;
    }
  } catch (error) {
    console.error("[Phone] Error making call:", error);
    Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi");
    return false;
  }
}

/**
 * Send SMS
 * Opens native SMS app with pre-filled number and message
 */
export async function sendSMS(
  phoneNumber: string,
  message?: string,
): Promise<boolean> {
  try {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
    const encodedMessage = message ? encodeURIComponent(message) : "";

    const url = Platform.select({
      ios: message
        ? `sms:${cleanNumber}&body=${encodedMessage}`
        : `sms:${cleanNumber}`,
      android: message
        ? `sms:${cleanNumber}?body=${encodedMessage}`
        : `sms:${cleanNumber}`,
    });

    if (!url) return false;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert("Lỗi", "Thiết bị không hỗ trợ gửi SMS");
      return false;
    }
  } catch (error) {
    console.error("[SMS] Error sending SMS:", error);
    Alert.alert("Lỗi", "Không thể gửi tin nhắn");
    return false;
  }
}

/**
 * Send Email
 * Opens native email app
 */
export async function sendEmail(
  to: string,
  subject?: string,
  body?: string,
): Promise<boolean> {
  try {
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);

    const url = `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert("Lỗi", "Không tìm thấy ứng dụng email");
      return false;
    }
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    Alert.alert("Lỗi", "Không thể gửi email");
    return false;
  }
}

/**
 * Open Maps with location
 */
export async function openMaps(
  latitude: number,
  longitude: number,
  label?: string,
): Promise<boolean> {
  try {
    const encodedLabel = label ? encodeURIComponent(label) : "";

    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}(${encodedLabel})`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
    });

    if (!url) return false;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      // Fallback to Google Maps web
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      await Linking.openURL(webUrl);
      return true;
    }
  } catch (error) {
    console.error("[Maps] Error opening maps:", error);
    return false;
  }
}

/**
 * Check Camera Permission Status
 */
export async function checkCameraPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await ImagePicker.getCameraPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: "undetermined" };
  }
}

/**
 * Check Storage Permission Status
 */
export async function checkStoragePermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await ImagePicker.getMediaLibraryPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: "undetermined" };
  }
}

/**
 * Check Location Permission Status
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } =
      await Location.getForegroundPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: "undetermined" };
  }
}

/**
 * Check Notification Permission Status
 */
export async function checkNotificationPermission(): Promise<PermissionStatus> {
  try {
    if (!Notifications) {
      return { granted: false, canAskAgain: false, status: "denied" };
    }
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: "undetermined" };
  }
}

/**
 * Open App Settings
 */
export function openAppSettings() {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
}

/**
 * Show Permission Denied Alert
 */
export function showPermissionDeniedAlert(
  permissionType: string,
  canAskAgain: boolean,
) {
  const title = "Quyền truy cập bị từ chối";
  const message = canAskAgain
    ? `Ứng dụng cần quyền truy cập ${permissionType} để hoạt động. Vui lòng cấp quyền trong cài đặt.`
    : `Bạn đã từ chối quyền ${permissionType}. Vui lòng bật quyền trong Cài đặt > Ứng dụng.`;

  Alert.alert(title, message, [
    { text: "Hủy", style: "cancel" },
    {
      text: "Mở Cài đặt",
      onPress: openAppSettings,
    },
  ]);
}

/**
 * Request Permission with User-Friendly Flow
 */
export async function requestPermissionWithAlert(
  type: PermissionType,
): Promise<boolean> {
  const permissionNames: Record<PermissionType, string> = {
    camera: "Camera",
    location: "Vị trí",
    notifications: "Thông báo",
    storage: "Bộ nhớ",
    microphone: "Microphone",
    contacts: "Danh bạ",
    calendar: "Lịch",
  };

  const permissionName = permissionNames[type];

  // Check current status first
  let currentStatus: PermissionStatus;

  switch (type) {
    case "camera":
      currentStatus = await checkCameraPermission();
      break;
    case "location":
      currentStatus = await checkLocationPermission();
      break;
    case "notifications":
      currentStatus = await checkNotificationPermission();
      break;
    case "storage":
      currentStatus = await checkStoragePermission();
      break;
    case "contacts":
      currentStatus = await checkContactsPermission();
      break;
    case "calendar":
      // Calendar uses same pattern but not implemented yet
      currentStatus = {
        granted: false,
        canAskAgain: true,
        status: "undetermined",
      };
      break;
    default:
      return false;
  }

  // Already granted
  if (currentStatus.granted) {
    return true;
  }

  // Can't ask again - show settings alert
  if (!currentStatus.canAskAgain) {
    showPermissionDeniedAlert(permissionName, false);
    return false;
  }

  // Request permission
  let result: PermissionStatus;

  switch (type) {
    case "camera":
      result = await requestCameraPermission();
      break;
    case "location":
      result = await requestLocationPermission();
      break;
    case "notifications":
      result = await requestNotificationPermission();
      break;
    case "storage":
      result = await requestStoragePermission();
      break;
    case "contacts":
      result = await requestContactsPermission();
      break;
    case "calendar":
      // Calendar not implemented yet
      result = { granted: false, canAskAgain: true, status: "undetermined" };
      break;
    default:
      return false;
  }

  // Handle result
  if (!result.granted) {
    showPermissionDeniedAlert(permissionName, result.canAskAgain);
    return false;
  }

  return true;
}

/**
 * Request Multiple Permissions at Once
 */
export async function requestMultiplePermissions(
  types: PermissionType[],
): Promise<Record<PermissionType, boolean>> {
  const results: Record<string, boolean> = {};

  for (const type of types) {
    results[type] = await requestPermissionWithAlert(type);
  }

  return results as Record<PermissionType, boolean>;
}

/**
 * Get All Permissions Status
 */
export async function getAllPermissionsStatus(): Promise<
  Record<PermissionType, PermissionStatus>
> {
  const [camera, location, notifications, storage, contacts] =
    await Promise.all([
      checkCameraPermission(),
      checkLocationPermission(),
      checkNotificationPermission(),
      checkStoragePermission(),
      checkContactsPermission(),
    ]);

  return {
    camera,
    location,
    notifications,
    storage,
    contacts,
    microphone: { granted: false, canAskAgain: true, status: "undetermined" },
    calendar: { granted: false, canAskAgain: true, status: "undetermined" },
  };
}
