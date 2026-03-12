/**
 * Compact Weather Display for Home Header
 * Shows current temperature and conditions
 * @created 2026-01-14
 */

import weatherApi, { WeatherData } from '@/services/weatherApi';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { memo, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CompactWeatherProps {
  onPress?: () => void;
  style?: any;
}

// Weather icon mapping
const getWeatherIcon = (icon: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    '01d': 'sunny-outline',
    '01n': 'moon-outline',
    '02d': 'partly-sunny-outline',
    '02n': 'cloudy-night-outline',
    '03d': 'cloud-outline',
    '03n': 'cloud-outline',
    '04d': 'cloudy-outline',
    '04n': 'cloudy-outline',
    '09d': 'rainy-outline',
    '09n': 'rainy-outline',
    '10d': 'rainy-outline',
    '10n': 'rainy-outline',
    '11d': 'thunderstorm-outline',
    '11n': 'thunderstorm-outline',
    '13d': 'snow-outline',
    '13n': 'snow-outline',
    '50d': 'water-outline',
    '50n': 'water-outline',
    'clear': 'sunny-outline',
    'clouds': 'cloudy-outline',
    'rain': 'rainy-outline',
    'drizzle': 'rainy-outline',
    'thunderstorm': 'thunderstorm-outline',
    'snow': 'snow-outline',
    'mist': 'water-outline',
    'fog': 'water-outline',
  };
  
  return iconMap[icon?.toLowerCase()] || iconMap[icon] || 'partly-sunny-outline';
};

export const CompactWeather = memo(function CompactWeather({
  onPress,
  style,
}: CompactWeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user location
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        let lat = 10.8231; // Default: Ho Chi Minh City
        let lon = 106.6297;
        
        if (status === 'granted') {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            lat = location.coords.latitude;
            lon = location.coords.longitude;
          } catch (locError) {
            console.log('Using default location');
          }
        }

        const data = await weatherApi.getWeather({ lat, lon });
        
        if (isMounted && data) {
          setWeather(data);
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        if (isMounted) {
          setError('Không thể tải thời tiết');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  if (error || !weather) {
    return (
      <TouchableOpacity 
        style={[styles.container, styles.errorContainer, style]}
        onPress={onPress}
      >
        <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
        <Text style={styles.errorText}>--°C</Text>
      </TouchableOpacity>
    );
  }

  const iconName = getWeatherIcon(weather.current.icon);

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.weatherInfo}>
        <Ionicons name={iconName} size={18} color="#fff" />
        <Text style={styles.temp}>{Math.round(weather.current.temp)}°</Text>
      </View>
      <View style={styles.locationInfo}>
        <Ionicons name="location-outline" size={10} color="rgba(255,255,255,0.8)" />
        <Text style={styles.location} numberOfLines={1}>
          {weather.location.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 65,
  },
  errorContainer: {
    opacity: 0.7,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  temp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  location: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    maxWidth: 50,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
});

export default CompactWeather;
