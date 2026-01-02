/**
 * Device Permissions Manager
 * Quản lý quyền truy cập tài nguyên thiết bị
 */

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

export type PermissionType = 'camera' | 'location' | 'notifications' | 'storage' | 'microphone';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

/**
 * Request Camera Permission
 */
export async function requestCameraPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return { granted: false, canAskAgain: false, status: 'denied' };
  }
}

/**
 * Request Gallery/Storage Permission
 */
export async function requestStoragePermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return { granted: false, canAskAgain: false, status: 'denied' };
  }
}

/**
 * Request Location Permission
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return { granted: false, canAskAgain: false, status: 'denied' };
  }
}

/**
 * Request Notification Permission
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { granted: false, canAskAgain: false, status: 'denied' };
  }
}

/**
 * Check Camera Permission Status
 */
export async function checkCameraPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: 'undetermined' };
  }
}

/**
 * Check Storage Permission Status
 */
export async function checkStoragePermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: 'undetermined' };
  }
}

/**
 * Check Location Permission Status
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: 'undetermined' };
  }
}

/**
 * Check Notification Permission Status
 */
export async function checkNotificationPermission(): Promise<PermissionStatus> {
  try {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as any,
    };
  } catch (error) {
    return { granted: false, canAskAgain: true, status: 'undetermined' };
  }
}

/**
 * Open App Settings
 */
export function openAppSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

/**
 * Show Permission Denied Alert
 */
export function showPermissionDeniedAlert(permissionType: string, canAskAgain: boolean) {
  const title = 'Quyền truy cập bị từ chối';
  const message = canAskAgain
    ? `Ứng dụng cần quyền truy cập ${permissionType} để hoạt động. Vui lòng cấp quyền trong cài đặt.`
    : `Bạn đã từ chối quyền ${permissionType}. Vui lòng bật quyền trong Cài đặt > Ứng dụng.`;
  
  Alert.alert(
    title,
    message,
    [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Mở Cài đặt', 
        onPress: openAppSettings 
      },
    ]
  );
}

/**
 * Request Permission with User-Friendly Flow
 */
export async function requestPermissionWithAlert(
  type: PermissionType
): Promise<boolean> {
  const permissionNames = {
    camera: 'Camera',
    location: 'Vị trí',
    notifications: 'Thông báo',
    storage: 'Bộ nhớ',
    microphone: 'Microphone',
  };

  const permissionName = permissionNames[type];

  // Check current status first
  let currentStatus: PermissionStatus;
  
  switch (type) {
    case 'camera':
      currentStatus = await checkCameraPermission();
      break;
    case 'location':
      currentStatus = await checkLocationPermission();
      break;
    case 'notifications':
      currentStatus = await checkNotificationPermission();
      break;
    case 'storage':
      currentStatus = await checkStoragePermission();
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
    case 'camera':
      result = await requestCameraPermission();
      break;
    case 'location':
      result = await requestLocationPermission();
      break;
    case 'notifications':
      result = await requestNotificationPermission();
      break;
    case 'storage':
      result = await requestStoragePermission();
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
  types: PermissionType[]
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
export async function getAllPermissionsStatus(): Promise<Record<PermissionType, PermissionStatus>> {
  const [camera, location, notifications, storage] = await Promise.all([
    checkCameraPermission(),
    checkLocationPermission(),
    checkNotificationPermission(),
    checkStoragePermission(),
  ]);

  return {
    camera,
    location,
    notifications,
    storage,
    microphone: { granted: false, canAskAgain: true, status: 'undetermined' },
  };
}
