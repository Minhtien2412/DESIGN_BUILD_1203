/**
 * useNetworkStatus Hook
 * Monitor network connectivity and provide offline status
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

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
    type: Platform.OS === 'web' ? 'wifi' : null,
    isOffline: false,
  });

  useEffect(() => {
    // Web platform: always assume online (NetInfo unreliable on web)
    if (Platform.OS === 'web') {
      return;
    }

    // Get initial network state
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isOffline: !state.isConnected || state.isInternetReachable === false,
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isOffline: !state.isConnected || state.isInternetReachable === false,
      };
      
      setStatus(newStatus);
      
      console.log('[NetworkStatus] Network state changed:', {
        isConnected: newStatus.isConnected,
        isInternetReachable: newStatus.isInternetReachable,
        type: newStatus.type,
        isOffline: newStatus.isOffline,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}
