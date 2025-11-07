import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Conditionally import expo-notifications to avoid issues in Expo Go
const isExpoGo = Platform.OS !== 'web' && Constants.appOwnership === 'expo';
const isDevClient = !isExpoGo;

let Notifications: typeof import("expo-notifications") | null = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (error) {
    console.log('[notifications] expo-notifications not available:', error);
  }
}

export type LocalNotification = {
  title: string;
  body?: string;
  data?: Record<string, any>;
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo || !Notifications) {
    console.log('[notifications] Skipping permission request in Expo Go or when notifications unavailable');
    return false;
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) return true;
  const res = await Notifications.requestPermissionsAsync();
  return !!res.granted || res.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || isExpoGo || !Notifications) return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
    enableLights: true,
    showBadge: true,
  });
}

export async function ensureNotificationsReady(): Promise<boolean> {
  if (isExpoGo || !Notifications) return false;

  // Ensure Android channel is set up
  if (Platform.OS === 'android') {
    await ensureAndroidChannel();
  }

  // Check and request permissions
  const perms = await Notifications.getPermissionsAsync();
  if (!perms.granted) {
    const req = await Notifications.requestPermissionsAsync();
    if (!req.granted) return false;
  }
  return true;
}

export function configureNotificationHandler() {
  if (isExpoGo || !Notifications) {
    console.log('[notifications] Skipping notification handler setup in Expo Go or when notifications unavailable');
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      // Legacy flags (kept true for cross-platform behavior)
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      // Newer iOS 16+ flags for foreground notifications
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function initSystemNotifications() {
  // Avoid noisy warnings/limitations in Expo Go; only fully init in dev client or production builds
  configureNotificationHandler();
  if (!isExpoGo) {
    await ensureNotificationsReady();
  }
}

export async function presentLocalNotification(n: LocalNotification, isActive: boolean = true) {
  if (isExpoGo || !Notifications) {
    console.log('[notifications] Skipping local notification in Expo Go or when notifications unavailable:', n.title);
    return;
  }

  // Don't schedule notifications when app is not active to prevent crashes
  if (!isActive) {
    console.log('[notifications] Skipping notification scheduling - app not active:', n.title);
    return;
  }

  // Ensure notifications are ready before scheduling
  const ready = await ensureNotificationsReady();
  if (!ready) {
    console.log('[notifications] Notifications not ready, skipping:', n.title);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: n.title,
        body: n.body,
        data: n.data,
        sound: 'default',
      },
      trigger: null,
    });
  } catch (error) {
    console.error('[notifications] Failed to schedule notification:', error);
  }
}
