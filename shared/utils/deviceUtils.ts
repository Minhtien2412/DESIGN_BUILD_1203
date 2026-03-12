/**
 * Device Utilities - Tiện ích thiết bị
 * Sử dụng các Expo modules có sẵn để lấy thông tin thiết bị
 */

import * as Application from "expo-application";
import * as Battery from "expo-battery";
import * as Brightness from "expo-brightness";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { Platform } from "react-native";

// ============================================
// TYPES
// ============================================

export interface DeviceInfo {
  brand: string | null;
  modelName: string | null;
  modelId: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceType: Device.DeviceType;
  isDevice: boolean;
  totalMemory: number | null;
}

export interface AppInfo {
  appName: string | null;
  appVersion: string | null;
  buildNumber: string | null;
  nativeAppVersion: string | null;
  nativeBuildVersion: string | null;
  applicationId: string | null;
}

export interface BatteryInfo {
  level: number;
  state: Battery.BatteryState;
  lowPowerMode: boolean;
}

export interface NetworkInfo {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: Network.NetworkStateType;
  ipAddress: string | null;
}

// ============================================
// DEVICE UTILITIES
// ============================================

/**
 * Get device information
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  return {
    brand: Device.brand,
    modelName: Device.modelName,
    modelId: Device.modelId,
    osName: Device.osName,
    osVersion: Device.osVersion,
    deviceType: Device.deviceType || Device.DeviceType.UNKNOWN,
    isDevice: Device.isDevice,
    totalMemory: Device.totalMemory,
  };
}

/**
 * Get app information
 */
export function getAppInfo(): AppInfo {
  return {
    appName: Application.applicationName,
    appVersion: Application.nativeApplicationVersion,
    buildNumber: Application.nativeBuildVersion,
    nativeAppVersion: Application.nativeApplicationVersion,
    nativeBuildVersion: Application.nativeBuildVersion,
    applicationId: Application.applicationId,
  };
}

/**
 * Get battery information
 */
export async function getBatteryInfo(): Promise<BatteryInfo> {
  const [level, state, lowPowerMode] = await Promise.all([
    Battery.getBatteryLevelAsync(),
    Battery.getBatteryStateAsync(),
    Battery.isLowPowerModeEnabledAsync(),
  ]);

  return {
    level: Math.round(level * 100),
    state,
    lowPowerMode,
  };
}

/**
 * Subscribe to battery level changes
 */
export function subscribeToBatteryLevel(
  callback: (level: number) => void,
): Battery.Subscription {
  return Battery.addBatteryLevelListener(({ batteryLevel }) => {
    callback(Math.round(batteryLevel * 100));
  });
}

/**
 * Subscribe to battery state changes
 */
export function subscribeToBatteryState(
  callback: (state: Battery.BatteryState) => void,
): Battery.Subscription {
  return Battery.addBatteryStateListener(({ batteryState }) => {
    callback(batteryState);
  });
}

/**
 * Get network information
 */
export async function getNetworkInfo(): Promise<NetworkInfo> {
  const networkState = await Network.getNetworkStateAsync();
  let ipAddress: string | null = null;

  try {
    ipAddress = await Network.getIpAddressAsync();
  } catch {
    // IP address not available
  }

  return {
    isConnected: networkState.isConnected ?? false,
    isInternetReachable: networkState.isInternetReachable ?? null,
    type: networkState.type ?? Network.NetworkStateType.UNKNOWN,
    ipAddress,
  };
}

/**
 * Check if device is connected to internet
 */
export async function isOnline(): Promise<boolean> {
  const networkState = await Network.getNetworkStateAsync();
  return (
    networkState.isConnected === true &&
    networkState.isInternetReachable === true
  );
}

/**
 * Check if device is using WiFi
 */
export async function isWifi(): Promise<boolean> {
  const networkState = await Network.getNetworkStateAsync();
  return networkState.type === Network.NetworkStateType.WIFI;
}

/**
 * Check if device is using cellular data
 */
export async function isCellular(): Promise<boolean> {
  const networkState = await Network.getNetworkStateAsync();
  return networkState.type === Network.NetworkStateType.CELLULAR;
}

// ============================================
// BRIGHTNESS UTILITIES
// ============================================

/**
 * Get current screen brightness (0-1)
 */
export async function getBrightness(): Promise<number> {
  if (Platform.OS === "web") return 1;
  return await Brightness.getBrightnessAsync();
}

/**
 * Set screen brightness (0-1)
 */
export async function setBrightness(level: number): Promise<void> {
  if (Platform.OS === "web") return;
  await Brightness.setBrightnessAsync(Math.max(0, Math.min(1, level)));
}

/**
 * Get system brightness (0-1)
 */
export async function getSystemBrightness(): Promise<number> {
  if (Platform.OS !== "android") return await getBrightness();
  return await Brightness.getSystemBrightnessAsync();
}

/**
 * Use system brightness
 */
export async function useSystemBrightness(): Promise<void> {
  if (Platform.OS === "web") return;
  await Brightness.useSystemBrightnessAsync();
}

// ============================================
// DEVICE TYPE HELPERS
// ============================================

/**
 * Check if device is a phone
 */
export function isPhone(): boolean {
  return Device.deviceType === Device.DeviceType.PHONE;
}

/**
 * Check if device is a tablet
 */
export function isTablet(): boolean {
  return Device.deviceType === Device.DeviceType.TABLET;
}

/**
 * Check if running on a real device (not simulator/emulator)
 */
export function isRealDevice(): boolean {
  return Device.isDevice;
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return Platform.OS === "ios";
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Platform.OS === "android";
}

/**
 * Check if running on web
 */
export function isWeb(): boolean {
  return Platform.OS === "web";
}

/**
 * Get platform-specific value
 */
export function platformSelect<T>(options: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T {
  if (Platform.OS === "ios" && options.ios !== undefined) return options.ios;
  if (Platform.OS === "android" && options.android !== undefined)
    return options.android;
  if (Platform.OS === "web" && options.web !== undefined) return options.web;
  return options.default;
}

// ============================================
// MEMORY HELPERS
// ============================================

/**
 * Get total device memory in GB
 */
export function getTotalMemoryGB(): number | null {
  if (!Device.totalMemory) return null;
  return Math.round((Device.totalMemory / (1024 * 1024 * 1024)) * 100) / 100;
}

/**
 * Check if device is low-end (< 4GB RAM)
 */
export function isLowEndDevice(): boolean {
  const totalGB = getTotalMemoryGB();
  if (totalGB === null) return false;
  return totalGB < 4;
}

// ============================================
// EXPORTS
// ============================================

export const deviceUtils = {
  // Device info
  getDeviceInfo,
  getAppInfo,
  getBatteryInfo,
  getNetworkInfo,

  // Battery
  subscribeToBatteryLevel,
  subscribeToBatteryState,

  // Network
  isOnline,
  isWifi,
  isCellular,

  // Brightness
  getBrightness,
  setBrightness,
  getSystemBrightness,
  useSystemBrightness,

  // Device type
  isPhone,
  isTablet,
  isRealDevice,
  isIOS,
  isAndroid,
  isWeb,
  platformSelect,

  // Memory
  getTotalMemoryGB,
  isLowEndDevice,
};

export default deviceUtils;
