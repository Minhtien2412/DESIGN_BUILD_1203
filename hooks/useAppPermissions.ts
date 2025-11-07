import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
// Lazy load notifications to avoid Expo Go warnings
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('[Permissions] expo-notifications not available');
}

/**
 * Comprehensive App Permissions Hook
 * Handles all permission requests with user-friendly Vietnamese messages
 */

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

// ===== CAMERA PERMISSION =====

/**
 * Request camera permission for video calls, photo capture
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();

    if (status === 'denied') {
      Alert.alert(
        'Cần quyền truy cập Camera',
        'Ứng dụng cần quyền camera để thực hiện các chức năng:\n\n' +
        '• Gọi video với đối tác/khách hàng\n' +
        '• Chụp ảnh tiến độ công trình\n' +
        '• Quét mã QR\n\n' +
        'Vui lòng cấp quyền trong Cài đặt.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
    }

    return {
      status: status as PermissionStatus,
      canAskAgain,
    };
  } catch (error) {
    console.error('[useAppPermissions] Camera permission error:', error);
    return { status: 'denied', canAskAgain: false };
  }
}

// ===== MICROPHONE PERMISSION =====

/**
 * Request microphone permission for audio/video calls
 */
export async function requestMicrophonePermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Camera.requestMicrophonePermissionsAsync();

    if (status === 'denied') {
      Alert.alert(
        'Cần quyền truy cập Microphone',
        'Ứng dụng cần quyền microphone để:\n\n' +
        '• Thực hiện cuộc gọi âm thanh/video\n' +
        '• Ghi âm ghi chú công trình\n' +
        '• Họp trực tuyến với đội ngũ\n\n' +
        'Vui lòng cấp quyền trong Cài đặt.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
    }

    return {
      status: status as PermissionStatus,
      canAskAgain,
    };
  } catch (error) {
    console.error('[useAppPermissions] Microphone permission error:', error);
    return { status: 'denied', canAskAgain: false };
  }
}

// ===== LOCATION PERMISSION =====

/**
 * Request location permission for project check-ins, geofencing
 */
export async function requestLocationPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    if (status === 'denied') {
      Alert.alert(
        'Cần quyền truy cập Vị trí',
        'Ứng dụng cần quyền vị trí để:\n\n' +
        '• Check-in tại công trình\n' +
        '• Xác minh vị trí làm việc\n' +
        '• Tìm công trình gần bạn\n' +
        '• Gắn địa điểm vào báo cáo tiến độ\n\n' +
        'Vui lòng cấp quyền trong Cài đặt.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
    }

    return {
      status: status as PermissionStatus,
      canAskAgain,
    };
  } catch (error) {
    console.error('[useAppPermissions] Location permission error:', error);
    return { status: 'denied', canAskAgain: false };
  }
}

// ===== NOTIFICATION PERMISSION =====

/**
 * Request notification permission for progress updates, alerts
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  try {
    if (!Notifications) {
      console.warn('[Permissions] Notifications module not available');
      return { status: 'denied', canAskAgain: false };
    }
    
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();

    if (status === 'denied') {
      Alert.alert(
        'Cần quyền Thông báo',
        'Ứng dụng cần quyền thông báo để:\n\n' +
        '• Cập nhật tiến độ dự án\n' +
        '• Nhắc nhở công việc quan trọng\n' +
        '• Thông báo cuộc gọi đến\n' +
        '• Tin nhắn từ đội ngũ\n\n' +
        'Vui lòng cấp quyền trong Cài đặt.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
    }

    return {
      status: status as PermissionStatus,
      canAskAgain,
    };
  } catch (error) {
    console.error('[useAppPermissions] Notification permission error:', error);
    return { status: 'denied', canAskAgain: false };
  }
}

// ===== MEDIA LIBRARY PERMISSION =====

/**
 * Request media library permission for saving photos/videos
 */
export async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();

    if (status === 'denied') {
      Alert.alert(
        'Cần quyền truy cập Thư viện',
        'Ứng dụng cần quyền thư viện ảnh để:\n\n' +
        '• Lưu ảnh tiến độ công trình\n' +
        '• Tải lên ảnh từ thư viện\n' +
        '• Xuất báo cáo có hình ảnh\n\n' +
        'Vui lòng cấp quyền trong Cài đặt.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
    }

    return {
      status: status as PermissionStatus,
      canAskAgain,
    };
  } catch (error) {
    console.error('[useAppPermissions] Media library permission error:', error);
    return { status: 'denied', canAskAgain: false };
  }
}

// ===== BATCH REQUEST ALL PERMISSIONS =====

/**
 * Request all critical permissions at once (onboarding flow)
 */
export async function requestAllPermissions(): Promise<{
  camera: PermissionResult;
  microphone: PermissionResult;
  location: PermissionResult;
  notification: PermissionResult;
  mediaLibrary: PermissionResult;
}> {
  const [camera, microphone, location, notification, mediaLibrary] = await Promise.all([
    requestCameraPermission(),
    requestMicrophonePermission(),
    requestLocationPermission(),
    requestNotificationPermission(),
    requestMediaLibraryPermission(),
  ]);

  return { camera, microphone, location, notification, mediaLibrary };
}

// ===== CHECK PERMISSION STATUS =====

/**
 * Check camera permission status without requesting
 */
export async function checkCameraPermission(): Promise<PermissionStatus> {
  const { status } = await Camera.getCameraPermissionsAsync();
  return status as PermissionStatus;
}

/**
 * Check microphone permission status without requesting
 */
export async function checkMicrophonePermission(): Promise<PermissionStatus> {
  const { status } = await Camera.getMicrophonePermissionsAsync();
  return status as PermissionStatus;
}

/**
 * Check location permission status without requesting
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status as PermissionStatus;
}

/**
 * Check notification permission status without requesting
 */
export async function checkNotificationPermission(): Promise<PermissionStatus> {
  if (!Notifications) {
    return 'denied';
  }
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionStatus;
}

/**
 * Check media library permission status without requesting
 */
export async function checkMediaLibraryPermission(): Promise<PermissionStatus> {
  const { status } = await MediaLibrary.getPermissionsAsync();
  return status as PermissionStatus;
}

// ===== REACT HOOK =====

/**
 * React hook for managing app permissions
 * Returns permission request functions and current status
 */
export function useAppPermissions() {
  const [permissions, setPermissions] = useState<{
    camera: PermissionStatus;
    microphone: PermissionStatus;
    location: PermissionStatus;
    notification: PermissionStatus;
    mediaLibrary: PermissionStatus;
  }>({
    camera: 'undetermined',
    microphone: 'undetermined',
    location: 'undetermined',
    notification: 'undetermined',
    mediaLibrary: 'undetermined',
  });

  const [loading, setLoading] = useState(false);

  // Check all permissions on mount
  const checkAllPermissions = useCallback(async () => {
    const [camera, microphone, location, notification, mediaLibrary] = await Promise.all([
      checkCameraPermission(),
      checkMicrophonePermission(),
      checkLocationPermission(),
      checkNotificationPermission(),
      checkMediaLibraryPermission(),
    ]);

    setPermissions({ camera, microphone, location, notification, mediaLibrary });
  }, []);

  // Request camera
  const requestCamera = useCallback(async () => {
    setLoading(true);
    const result = await requestCameraPermission();
    setPermissions(prev => ({ ...prev, camera: result.status }));
    setLoading(false);
    return result;
  }, []);

  // Request microphone
  const requestMicrophone = useCallback(async () => {
    setLoading(true);
    const result = await requestMicrophonePermission();
    setPermissions(prev => ({ ...prev, microphone: result.status }));
    setLoading(false);
    return result;
  }, []);

  // Request location
  const requestLocation = useCallback(async () => {
    setLoading(true);
    const result = await requestLocationPermission();
    setPermissions(prev => ({ ...prev, location: result.status }));
    setLoading(false);
    return result;
  }, []);

  // Request notification
  const requestNotification = useCallback(async () => {
    setLoading(true);
    const result = await requestNotificationPermission();
    setPermissions(prev => ({ ...prev, notification: result.status }));
    setLoading(false);
    return result;
  }, []);

  // Request media library
  const requestMediaLibrary = useCallback(async () => {
    setLoading(true);
    const result = await requestMediaLibraryPermission();
    setPermissions(prev => ({ ...prev, mediaLibrary: result.status }));
    setLoading(false);
    return result;
  }, []);

  // Request all at once
  const requestAll = useCallback(async () => {
    setLoading(true);
    const results = await requestAllPermissions();
    setPermissions({
      camera: results.camera.status,
      microphone: results.microphone.status,
      location: results.location.status,
      notification: results.notification.status,
      mediaLibrary: results.mediaLibrary.status,
    });
    setLoading(false);
    return results;
  }, []);

  return {
    permissions,
    loading,
    checkAllPermissions,
    requestCamera,
    requestMicrophone,
    requestLocation,
    requestNotification,
    requestMediaLibrary,
    requestAll,
  };
}
