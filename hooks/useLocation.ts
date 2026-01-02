/**
 * useLocation Hook - GPS Location Tracking
 * 
 * Features:
 * - Request location permissions
 * - Get current GPS coordinates
 * - Background location tracking
 * - Geocoding (coordinates → address)
 */

import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface LocationData {
  coords: LocationCoords;
  timestamp: number;
  address?: string;
  city?: string;
  country?: string;
  region?: string;
}

export interface UseLocationResult {
  location: LocationData | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData | null>;
  hasPermission: boolean;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  async function checkPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error('Error checking location permission:', err);
      return false;
    }
  }

  async function requestPermission(): Promise<boolean> {
    try {
      setLoading(true);
      setError(null);

      // Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Quyền truy cập vị trí bị từ chối. Vui lòng bật GPS trong cài đặt.');
        setHasPermission(false);
        return false;
      }

      setHasPermission(true);
      
      // Auto-get location after permission granted
      await getCurrentLocation();
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể yêu cầu quyền truy cập vị trí';
      setError(message);
      console.error('Location permission error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function getCurrentLocation(): Promise<LocationData | null> {
    try {
      setLoading(true);
      setError(null);

      // Check permission first
      const permitted = await checkPermission();
      if (!permitted) {
        setError('Chưa cấp quyền truy cập vị trí');
        return null;
      }

      // Get current position with high accuracy
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationData: LocationData = {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        },
        timestamp: position.timestamp,
      };

      // Get address from coordinates (reverse geocoding)
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (geocode) {
          const fullAddress = [
            geocode.streetNumber,
            geocode.street,
            geocode.district,
            geocode.city,
            geocode.region,
            geocode.country,
          ]
            .filter(Boolean)
            .join(', ');

          locationData.address = fullAddress;
          locationData.city = geocode.city || undefined;
          locationData.country = geocode.country || undefined;
          locationData.region = geocode.region || undefined;

          setAddress(fullAddress);
        }
      } catch (geocodeErr) {
        console.warn('Geocoding failed:', geocodeErr);
        // Continue without address
      }

      setLocation(locationData);
      return locationData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lấy vị trí hiện tại';
      setError(message);
      console.error('Get location error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    location,
    address,
    loading,
    error,
    requestPermission,
    getCurrentLocation,
    hasPermission,
  };
}

/**
 * Utility: Format location for display
 */
export function formatLocationString(location: LocationData | null): string {
  if (!location) return 'Chưa có vị trí';
  
  const { coords } = location;
  
  if (location.address) {
    return location.address;
  }
  
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}

/**
 * Utility: Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // km
}
