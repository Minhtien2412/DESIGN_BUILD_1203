/**
 * useUserLocation Hook
 * Gets and watches the user's current GPS position
 * Uses expo-location with proper permission handling
 */

import type { LatLng } from "@/utils/geo";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, Platform } from "react-native";

interface UseUserLocationOptions {
  /** Auto-request on mount? Default true */
  autoStart?: boolean;
  /** Watch continuously? Default false */
  watch?: boolean;
  /** High accuracy? Default true */
  highAccuracy?: boolean;
}

interface UseUserLocationResult {
  location: LatLng | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  granted: boolean;
  requestLocation: () => Promise<LatLng | null>;
  refresh: () => Promise<void>;
}

// Default: HCM City center
const DEFAULT_LOCATION: LatLng = {
  latitude: 10.7769,
  longitude: 106.7009,
};

export function useUserLocation(
  options: UseUserLocationOptions = {},
): UseUserLocationResult {
  const { autoStart = true, watch = false, highAccuracy = true } = options;

  const [location, setLocation] = useState<LatLng | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const reverseGeocode = useCallback(async (coords: LatLng) => {
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.street, r.district, r.subregion, r.city].filter(
          Boolean,
        );
        setAddress(parts.join(", ") || r.formattedAddress || null);
      }
    } catch {
      // Geocoding may fail offline
    }
  }, []);

  const requestLocation = useCallback(async (): Promise<LatLng | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGranted(false);
        setError("Vui lòng cấp quyền vị trí để tìm thợ gần bạn");

        if (Platform.OS !== "web") {
          Alert.alert(
            "Cần quyền vị trí",
            "Mở cài đặt để cấp quyền truy cập vị trí cho ứng dụng",
            [
              { text: "Huỷ", style: "cancel" },
              { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
            ],
          );
        }
        // Return default location
        setLocation(DEFAULT_LOCATION);
        return DEFAULT_LOCATION;
      }

      setGranted(true);

      const pos = await Location.getCurrentPositionAsync({
        accuracy: highAccuracy
          ? Location.Accuracy.High
          : Location.Accuracy.Balanced,
      });

      const coords: LatLng = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      setLocation(coords);
      reverseGeocode(coords);
      return coords;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể lấy vị trí";
      setError(msg);
      // Return default
      setLocation(DEFAULT_LOCATION);
      return DEFAULT_LOCATION;
    } finally {
      setLoading(false);
    }
  }, [highAccuracy, reverseGeocode]);

  const refresh = useCallback(async () => {
    await requestLocation();
  }, [requestLocation]);

  // Auto-start
  useEffect(() => {
    if (autoStart) {
      requestLocation();
    }
  }, [autoStart, requestLocation]);

  // Watch mode
  useEffect(() => {
    if (!watch || !granted) return;

    let sub: Location.LocationSubscription | null = null;

    const startWatch = async () => {
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (pos) => {
          const coords: LatLng = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setLocation(coords);
        },
      );
      watchRef.current = sub;
    };

    startWatch();

    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, [watch, granted]);

  return {
    location,
    address,
    loading,
    error,
    granted,
    requestLocation,
    refresh,
  };
}
