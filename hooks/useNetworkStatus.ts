/**
 * useNetworkStatus Hook
 * Monitor network connectivity and provide offline status
 */

import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: Platform.OS === "web" ? "wifi" : null,
    isOffline: false,
  });

  useEffect(() => {
    // Web platform: Use browser navigator.onLine API
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && typeof navigator !== "undefined") {
        const handleOnline = () => {
          setStatus({
            isConnected: true,
            isInternetReachable: true,
            type: "wifi",
            isOffline: false,
          });
        };

        const handleOffline = () => {
          setStatus({
            isConnected: false,
            isInternetReachable: false,
            type: "none",
            isOffline: true,
          });
        };

        // Set initial state based on navigator.onLine
        setStatus({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
          type: navigator.onLine ? "wifi" : "none",
          isOffline: !navigator.onLine,
        });

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
        };
      }
      return;
    }

    // Native platforms: Use NetInfo
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isOffline: !state.isConnected || state.isInternetReachable === false,
      });
    });

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isOffline: !state.isConnected || state.isInternetReachable === false,
      };

      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}
