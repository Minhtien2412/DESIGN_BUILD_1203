/**
 * Weather Dashboard Widget
 * Real-time weather for construction site
 */

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDeg: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    description: string;
    icon: string;
  };
  hourly: {
    time: string;
    temp: number;
    icon: string;
  }[];
  daily: {
    date: string;
    tempMax: number;
    tempMin: number;
    icon: string;
    condition: string;
    rainChance: number;
  }[];
  alerts?: {
    event: string;
    severity: 'extreme' | 'severe' | 'moderate' | 'minor';
    description: string;
    start: string;
    end: string;
  }[];
}

const WEATHER_ICONS: Record<string, string> = {
  'clear-day': 'sunny',
  'clear-night': 'moon',
  'partly-cloudy-day': 'partly-sunny',
  'partly-cloudy-night': 'cloudy-night',
  cloudy: 'cloudy',
  rain: 'rainy',
  snow: 'snow',
  thunderstorm: 'thunderstorm',
  fog: 'cloudy',
  wind: 'sunny',
};

const WORK_IMPACT_THRESHOLDS = {
  highTemp: 35,
  lowTemp: 5,
  highWind: 40,
  heavyRain: 80,
  lowVisibility: 1000,
  highUV: 8,
};

export default function WeatherDashboardScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setLoading(true);
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập vị trí để hiển thị thời tiết');
        return;
      }

      // Get current location
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });

      // Fetch weather data (mock for now)
      await fetchWeatherData(loc.coords.latitude, loc.coords.longitude);
    } catch (error: any) {
      console.error('Weather load failed:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thời tiết');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    // Mock data - replace with actual API call
    const mockData: WeatherData = {
      current: {
        temp: 32,
        feelsLike: 35,
        humidity: 70,
        windSpeed: 15,
        windDeg: 180,
        pressure: 1013,
        visibility: 10000,
        uvIndex: 9,
        condition: 'Nắng',
        description: 'Trời nắng, có mây thưa',
        icon: 'clear-day',
      },
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        temp: 28 + Math.random() * 8,
        icon: i < 6 || i > 18 ? 'clear-night' : 'clear-day',
      })),
      daily: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000).toLocaleDateString('vi-VN', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
        }),
        tempMax: 30 + Math.random() * 5,
        tempMin: 24 + Math.random() * 4,
        icon: 'partly-cloudy-day',
        condition: 'Có mây',
        rainChance: Math.floor(Math.random() * 60),
      })),
      alerts: [
        {
          event: 'Cảnh báo nhiệt độ cao',
          severity: 'moderate',
          description: 'Nhiệt độ có thể lên đến 36°C. Khuyến cáo hạn chế làm việc ngoài trời.',
          start: new Date().toISOString(),
          end: new Date(Date.now() + 3600000 * 8).toISOString(),
        },
      ],
    };

    setWeather(mockData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeather();
    setRefreshing(false);
  };

  const getWorkImpact = () => {
    if (!weather) return null;

    const impacts: string[] = [];

    if (weather.current.temp >= WORK_IMPACT_THRESHOLDS.highTemp) {
      impacts.push('🌡️ Nhiệt độ cao - hạn chế làm việc ngoài trời');
    }
    if (weather.current.temp <= WORK_IMPACT_THRESHOLDS.lowTemp) {
      impacts.push('❄️ Nhiệt độ thấp - cẩn thận với bê tông');
    }
    if (weather.current.windSpeed >= WORK_IMPACT_THRESHOLDS.highWind) {
      impacts.push('💨 Gió mạnh - tạm dừng công việc trên cao');
    }
    if (weather.current.visibility < WORK_IMPACT_THRESHOLDS.lowVisibility) {
      impacts.push('🌫️ Tầm nhìn kém - cẩn thận với máy móc');
    }
    if (weather.current.uvIndex >= WORK_IMPACT_THRESHOLDS.highUV) {
      impacts.push('☀️ Chỉ số UV cao - sử dụng kem chống nắng');
    }

    return impacts;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return '#000000';
      case 'severe':
        return '#EA580C';
      case 'moderate':
        return '#0066CC';
      case 'minor':
        return '#0066CC';
      default:
        return primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loadingText, { color: textMuted }]}>Đang tải dữ liệu thời tiết...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <Ionicons name="cloud-offline-outline" size={64} color={textMuted} />
        <Text style={[styles.emptyText, { color: textMuted }]}>Không có dữ liệu thời tiết</Text>
      </View>
    );
  }

  const workImpacts = getWorkImpact();

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>Thời tiết công trường</Text>
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color={primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        {/* Current Weather */}
        <View style={[styles.currentCard, { backgroundColor: primary }]}>
          <View style={styles.currentTop}>
            <View>
              <Text style={styles.currentTemp}>{Math.round(weather.current.temp)}°C</Text>
              <Text style={styles.currentCondition}>{weather.current.condition}</Text>
              <Text style={styles.currentDescription}>{weather.current.description}</Text>
              <Text style={styles.feelsLike}>
                Cảm giác như {Math.round(weather.current.feelsLike)}°C
              </Text>
            </View>
            <Ionicons name={WEATHER_ICONS[weather.current.icon] as any} size={100} color="#fff" />
          </View>
        </View>

        {/* Alerts */}
        {weather.alerts && weather.alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: text }]}>Cảnh báo</Text>
            {weather.alerts.map((alert, index) => (
              <View
                key={index}
                style={[
                  styles.alertCard,
                  { backgroundColor: getSeverityColor(alert.severity) + '15', borderColor: getSeverityColor(alert.severity) },
                ]}
              >
                <View style={styles.alertHeader}>
                  <Ionicons
                    name="warning"
                    size={20}
                    color={getSeverityColor(alert.severity)}
                  />
                  <Text style={[styles.alertEvent, { color: getSeverityColor(alert.severity) }]}>
                    {alert.event}
                  </Text>
                </View>
                <Text style={[styles.alertDescription, { color: text }]}>
                  {alert.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Work Impact */}
        {workImpacts && workImpacts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: text }]}>Tác động đến thi công</Text>
            <View style={[styles.impactCard, { backgroundColor: surface, borderColor: border }]}>
              {workImpacts.map((impact, index) => (
                <Text key={index} style={[styles.impactText, { color: text }]}>
                  {impact}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Weather Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Chi tiết</Text>
          <View style={styles.detailsGrid}>
            <View style={[styles.detailCard, { backgroundColor: surface, borderColor: border }]}>
              <Ionicons name="water-outline" size={24} color={primary} />
              <Text style={[styles.detailValue, { color: text }]}>{weather.current.humidity}%</Text>
              <Text style={[styles.detailLabel, { color: textMuted }]}>Độ ẩm</Text>
            </View>
            <View style={[styles.detailCard, { backgroundColor: surface, borderColor: border }]}>
              <Ionicons name="speedometer-outline" size={24} color={primary} />
              <Text style={[styles.detailValue, { color: text }]}>{Math.round(weather.current.windSpeed)} km/h</Text>
              <Text style={[styles.detailLabel, { color: textMuted }]}>Gió</Text>
            </View>
            <View style={[styles.detailCard, { backgroundColor: surface, borderColor: border }]}>
              <Ionicons name="eye-outline" size={24} color={primary} />
              <Text style={[styles.detailValue, { color: text }]}>{(weather.current.visibility / 1000).toFixed(1)} km</Text>
              <Text style={[styles.detailLabel, { color: textMuted }]}>Tầm nhìn</Text>
            </View>
            <View style={[styles.detailCard, { backgroundColor: surface, borderColor: border }]}>
              <Ionicons name="sunny-outline" size={24} color={primary} />
              <Text style={[styles.detailValue, { color: text }]}>{weather.current.uvIndex}</Text>
              <Text style={[styles.detailLabel, { color: textMuted }]}>UV Index</Text>
            </View>
          </View>
        </View>

        {/* Hourly Forecast */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Dự báo theo giờ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.hourlyList}>
              {weather.hourly.slice(0, 12).map((hour, index) => (
                <View key={index} style={[styles.hourlyCard, { backgroundColor: surface, borderColor: border }]}>
                  <Text style={[styles.hourlyTime, { color: textMuted }]}>{hour.time}</Text>
                  <Ionicons name={WEATHER_ICONS[hour.icon] as any} size={28} color={primary} />
                  <Text style={[styles.hourlyTemp, { color: text }]}>{Math.round(hour.temp)}°</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Daily Forecast */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Dự báo 7 ngày</Text>
          {weather.daily.map((day, index) => (
            <View key={index} style={[styles.dailyCard, { backgroundColor: surface, borderColor: border }]}>
              <Text style={[styles.dailyDate, { color: text }]}>{day.date}</Text>
              <View style={styles.dailyCenter}>
                <Ionicons name={WEATHER_ICONS[day.icon] as any} size={24} color={primary} />
                <Text style={[styles.dailyCondition, { color: textMuted }]}>{day.condition}</Text>
              </View>
              <View style={styles.dailyTemp}>
                <Text style={[styles.tempMax, { color: text }]}>{Math.round(day.tempMax)}°</Text>
                <Text style={[styles.tempMin, { color: textMuted }]}>{Math.round(day.tempMin)}°</Text>
              </View>
              {day.rainChance > 0 && (
                <View style={styles.rainChance}>
                  <Ionicons name="rainy-outline" size={14} color={primary} />
                  <Text style={[styles.rainText, { color: primary }]}>{day.rainChance}%</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  refreshButton: {
    padding: 4,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  currentCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
  },
  currentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentTemp: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
  },
  currentCondition: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  currentDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  feelsLike: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  alertCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  alertEvent: {
    fontSize: 15,
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  impactCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  impactText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  detailLabel: {
    fontSize: 12,
  },
  hourlyList: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  hourlyCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
  },
  hourlyTime: {
    fontSize: 12,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: '600',
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  dailyDate: {
    fontSize: 14,
    fontWeight: '500',
    width: 70,
  },
  dailyCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dailyCondition: {
    fontSize: 13,
  },
  dailyTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tempMax: {
    fontSize: 16,
    fontWeight: '600',
  },
  tempMin: {
    fontSize: 14,
  },
  rainChance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rainText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
