/**
 * Device Hooks - React hooks cho device utilities
 * Dễ dàng sử dụng các tiện ích thiết bị trong components
 */

import * as Battery from "expo-battery";
import * as Network from "expo-network";
import { useCallback, useEffect, useState } from "react";
import {
    BatteryInfo,
    DeviceInfo,
    getAppInfo,
    getBatteryInfo,
    getDeviceInfo,
    getNetworkInfo,
    isLowEndDevice,
    isOnline,
    NetworkInfo,
} from "../utils/deviceUtils";

// ============================================
// DEVICE INFO HOOK
// ============================================

/**
 * Hook để lấy thông tin thiết bị
 */
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeviceInfo()
      .then(setDeviceInfo)
      .finally(() => setLoading(false));
  }, []);

  return { deviceInfo, loading };
}

/**
 * Hook để lấy thông tin ứng dụng
 */
export function useAppInfo() {
  const appInfo = getAppInfo();
  return appInfo;
}

// ============================================
// BATTERY HOOKS
// ============================================

/**
 * Hook để theo dõi pin
 */
export function useBattery() {
  const [battery, setBattery] = useState<BatteryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    getBatteryInfo()
      .then(setBattery)
      .finally(() => setLoading(false));
  }, []);

  // Subscribe to changes
  useEffect(() => {
    const levelSubscription = Battery.addBatteryLevelListener(
      ({ batteryLevel }) => {
        setBattery((prev) =>
          prev ? { ...prev, level: Math.round(batteryLevel * 100) } : null,
        );
      },
    );

    const stateSubscription = Battery.addBatteryStateListener(
      ({ batteryState }) => {
        setBattery((prev) => (prev ? { ...prev, state: batteryState } : null));
      },
    );

    const lowPowerSubscription = Battery.addLowPowerModeListener(
      ({ lowPowerMode }) => {
        setBattery((prev) => (prev ? { ...prev, lowPowerMode } : null));
      },
    );

    return () => {
      levelSubscription.remove();
      stateSubscription.remove();
      lowPowerSubscription.remove();
    };
  }, []);

  return { battery, loading };
}

/**
 * Hook để kiểm tra pin yếu (< 20%)
 */
export function useLowBattery(threshold: number = 20) {
  const { battery } = useBattery();
  return battery ? battery.level < threshold : false;
}

/**
 * Hook để kiểm tra đang sạc
 */
export function useIsCharging() {
  const { battery } = useBattery();
  return battery ? battery.state === Battery.BatteryState.CHARGING : false;
}

// ============================================
// NETWORK HOOKS
// ============================================

/**
 * Hook để theo dõi kết nối mạng
 */
export function useNetwork() {
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const info = await getNetworkInfo();
    setNetwork(info);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Poll every 30 seconds for network changes
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { network, loading, refresh };
}

/**
 * Hook để kiểm tra online/offline
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    const result = await isOnline();
    setOnline(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    check();

    // Poll every 10 seconds
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [check]);

  return { online, loading, check };
}

/**
 * Hook để kiểm tra loại kết nối
 */
export function useConnectionType() {
  const { network } = useNetwork();
  return network?.type ?? Network.NetworkStateType.UNKNOWN;
}

// ============================================
// PERFORMANCE HOOKS
// ============================================

/**
 * Hook để kiểm tra thiết bị yếu
 */
export function useLowEndDevice() {
  return isLowEndDevice();
}

/**
 * Hook để tự động giảm chất lượng trên thiết bị yếu
 */
export function useAdaptiveQuality<T>(highQuality: T, lowQuality: T): T {
  const isLowEnd = useLowEndDevice();
  return isLowEnd ? lowQuality : highQuality;
}

/**
 * Hook để kiểm tra nên tải media hay không
 */
export function useShouldLoadMedia(): {
  shouldLoad: boolean;
  quality: "high" | "medium" | "low";
} {
  const { online } = useOnlineStatus();
  const { network } = useNetwork();
  const isLowEnd = useLowEndDevice();

  if (!online) {
    return { shouldLoad: false, quality: "low" };
  }

  if (isLowEnd) {
    return { shouldLoad: true, quality: "low" };
  }

  if (network?.type === Network.NetworkStateType.CELLULAR) {
    return { shouldLoad: true, quality: "medium" };
  }

  return { shouldLoad: true, quality: "high" };
}

// ============================================
// COMBINED HOOKS
// ============================================

/**
 * Hook tổng hợp trạng thái thiết bị
 */
export function useDeviceStatus() {
  const { deviceInfo } = useDeviceInfo();
  const { battery } = useBattery();
  const { network } = useNetwork();

  return {
    device: deviceInfo,
    battery,
    network,
    isLowEnd: isLowEndDevice(),
    isOnline: network?.isConnected ?? false,
    isWifi: network?.type === Network.NetworkStateType.WIFI,
    isLowBattery: battery ? battery.level < 20 : false,
    isCharging: battery?.state === Battery.BatteryState.CHARGING,
  };
}

// ============================================
// EXPORTS
// ============================================

export const deviceHooks = {
  useDeviceInfo,
  useAppInfo,
  useBattery,
  useLowBattery,
  useIsCharging,
  useNetwork,
  useOnlineStatus,
  useConnectionType,
  useLowEndDevice,
  useAdaptiveQuality,
  useShouldLoadMedia,
  useDeviceStatus,
};

export default deviceHooks;
