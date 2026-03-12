/**
 * useRealtimeLocation Hook - Real-time GPS Tracking (Zalo-style)
 * 
 * Features:
 * - Continuous location updates
 * - WebSocket broadcasting
 * - Auto-update status bar with current location
 * - Battery-efficient background tracking
 */

import { getSocket } from '@/services/socket';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export interface RealtimeLocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  address: string;
  city?: string;
  timestamp: number;
  isMoving: boolean;
}

export interface UseRealtimeLocationOptions {
  enabled?: boolean;
  updateInterval?: number; // milliseconds
  distanceInterval?: number; // meters
  broadcastToServer?: boolean;
  accuracy?: Location.Accuracy;
}

export interface UseRealtimeLocationResult {
  location: RealtimeLocationData | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  updateNow: () => Promise<void>;
}

export function useRealtimeLocation(
  options: UseRealtimeLocationOptions = {}
): UseRealtimeLocationResult {
  const {
    enabled = false,
    updateInterval = 30000, // 30 seconds
    distanceInterval = 50, // 50 meters
    broadcastToServer = true,
    accuracy = Location.Accuracy.Balanced,
  } = options;

  const [location, setLocation] = useState<RealtimeLocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastLocation = useRef<RealtimeLocationData | null>(null);

  // Start tracking
  const startTracking = async (): Promise<boolean> => {
    try {
      // Request permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setError('Quyền truy cập vị trí bị từ chối');
        return false;
      }

      // Request background permission for continuous tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission denied');
      }

      // Start watching location
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval: updateInterval,
          distanceInterval,
        },
        async (position) => {
          await handleLocationUpdate(position);
        }
      );

      setIsTracking(true);
      setError(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể bắt đầu theo dõi vị trí';
      setError(message);
      console.error('Start tracking error:', err);
      return false;
    }
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsTracking(false);
  };

  // Handle location update
  const handleLocationUpdate = async (position: Location.LocationObject) => {
    try {
      // Reverse geocode to get address
      let address = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
      let city: string | undefined;

      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (geocode) {
          address = [
            geocode.street,
            geocode.district,
            geocode.city,
          ]
            .filter(Boolean)
            .join(', ') || address;
          
          city = geocode.city || undefined;
        }
      } catch (geocodeErr) {
        console.warn('Geocoding failed, using coordinates:', geocodeErr);
      }

      // Detect if moving
      const isMoving = position.coords.speed ? position.coords.speed > 0.5 : false; // > 0.5 m/s

      const newLocation: RealtimeLocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        address,
        city,
        timestamp: position.timestamp,
        isMoving,
      };

      setLocation(newLocation);
      lastLocation.current = newLocation;

      // Broadcast to server via WebSocket
      if (broadcastToServer) {
        broadcastLocation(newLocation);
      }
    } catch (err) {
      console.error('Handle location update error:', err);
    }
  };

  // Broadcast location to server
  const broadcastLocation = (loc: RealtimeLocationData) => {
    try {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('location:update', {
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: loc.address,
          city: loc.city,
          isMoving: loc.isMoving,
          timestamp: loc.timestamp,
        });
      }
    } catch (err) {
      console.error('Broadcast location error:', err);
    }
  };

  // Update location now (manual refresh)
  const updateNow = async () => {
    if (!isTracking) return;

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy,
      });
      await handleLocationUpdate(position);
    } catch (err) {
      console.error('Update now error:', err);
    }
  };

  // Handle app state changes (pause tracking when app is background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground - refresh location
        if (isTracking) {
          updateNow();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isTracking]);

  // Auto-start tracking if enabled
  useEffect(() => {
    if (enabled && !isTracking) {
      startTracking();
    }

    return () => {
      if (enabled) {
        stopTracking();
      }
    };
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateNow,
  };
}

/**
 * Format location for status display (Zalo-style)
 */
export function formatLocationStatus(location: RealtimeLocationData | null): string {
  if (!location) return 'Chưa xác định';

  const parts: string[] = [];

  // Add movement indicator
  if (location.isMoving) {
    parts.push('🚶');
  }

  // Add location
  if (location.city) {
    parts.push(location.city);
  } else if (location.address) {
    // Get first part of address
    const firstPart = location.address.split(',')[0];
    parts.push(firstPart);
  }

  return parts.join(' ') || 'Vị trí hiện tại';
}
