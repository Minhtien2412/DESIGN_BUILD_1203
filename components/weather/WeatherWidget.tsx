/**
 * Weather Widget Component
 * ========================
 *
 * Component hiển thị thông tin thời tiết với animation và auto-refresh.
 * Sử dụng weatherApi service với fallback tự động.
 *
 * @author ThietKeResort Team
 * @created 2025-01-12
 */

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import {
    getWeather,
    getWeatherByCity,
    getWeatherEmoji,
    type WeatherData,
    type WeatherLocation,
} from "../../services/weatherApi";

// ============================================
// Types
// ============================================
interface WeatherWidgetProps {
  /** City name to fetch weather for (optional, uses location if not provided) */
  city?: string;
  /** Custom location coordinates */
  location?: WeatherLocation;
  /** Show compact version */
  compact?: boolean;
  /** Show hourly forecast */
  showHourly?: boolean;
  /** Show daily forecast */
  showDaily?: boolean;
  /** Number of forecast days to show */
  forecastDays?: number;
  /** Auto refresh interval in minutes */
  refreshInterval?: number;
  /** Custom style */
  style?: any;
  /** On weather data loaded callback */
  onWeatherLoaded?: (data: WeatherData) => void;
  /** On error callback */
  onError?: (error: Error) => void;
}

// ============================================
// Main Component
// ============================================
export function WeatherWidget({
  city,
  location,
  compact = false,
  showHourly = true,
  showDaily = true,
  forecastDays = 5,
  refreshInterval = 30,
  style,
  onWeatherLoaded,
  onError,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fadeAnim = useState(new Animated.Value(0))[0];

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const primaryColor = useThemeColor({}, "tint");
  const secondaryText = useThemeColor({}, "tabIconDefault");

  // Fetch weather data
  const fetchWeather = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);
        setError(null);

        let data: WeatherData;

        if (city) {
          // Fetch by city name
          data = await getWeatherByCity(city);
        } else if (location) {
          // Fetch by provided coordinates
          data = await getWeather(location);
        } else {
          // Get current location
          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status === "granted") {
            const currentLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });

            data = await getWeather({
              lat: currentLocation.coords.latitude,
              lon: currentLocation.coords.longitude,
            });
          } else {
            // Default to Ho Chi Minh City
            data = await getWeatherByCity("Hồ Chí Minh");
          }
        }

        setWeather(data);
        setLastUpdated(new Date());
        onWeatherLoaded?.(data);

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (err: any) {
        console.error("[WeatherWidget] Error:", err);
        setError(err.message || "Không thể tải dữ liệu thời tiết");
        onError?.(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [city, location, onWeatherLoaded, onError, fadeAnim],
  );

  // Initial fetch
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Auto refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(
        () => {
          fetchWeather(true);
        },
        refreshInterval * 60 * 1000,
      );

      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchWeather]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeather(true);
  }, [fetchWeather]);

  // Format time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
    });
  };

  // Loading state
  if (loading && !weather) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: cardColor },
          style,
        ]}
      >
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loadingText, { color: secondaryText }]}>
          Đang tải thời tiết...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !weather) {
    return (
      <View
        style={[
          styles.container,
          styles.errorContainer,
          { backgroundColor: cardColor },
          style,
        ]}
      >
        <Ionicons
          name="cloud-offline-outline"
          size={48}
          color={secondaryText}
        />
        <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: primaryColor }]}
          onPress={() => fetchWeather()}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!weather) return null;

  // Compact version
  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          { backgroundColor: cardColor, opacity: fadeAnim },
          style,
        ]}
      >
        <View style={styles.compactContent}>
          {weather.current.icon ? (
            <Image
              source={{ uri: weather.current.icon }}
              style={styles.compactIcon}
            />
          ) : null}
          <View style={styles.compactInfo}>
            <Text style={[styles.compactTemp, { color: textColor }]}>
              {weather.current.temp}°C
            </Text>
            <Text style={[styles.compactLocation, { color: secondaryText }]}>
              {weather.location.name}
            </Text>
          </View>
          <Text style={styles.compactEmoji}>
            {getWeatherEmoji(weather.current.description)}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Full version
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cardColor }, style]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[primaryColor]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={primaryColor} />
            <Text style={[styles.locationText, { color: textColor }]}>
              {weather.location.name}, {weather.location.country}
            </Text>
          </View>
          {lastUpdated && (
            <Text style={[styles.lastUpdated, { color: secondaryText }]}>
              Cập nhật:{" "}
              {lastUpdated.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>

        {/* Current Weather */}
        <View style={styles.currentWeather}>
          <View style={styles.currentMain}>
            {weather.current.icon ? (
              <Image
                source={{ uri: weather.current.icon }}
                style={styles.weatherIcon}
              />
            ) : null}
            <View style={styles.tempContainer}>
              <Text style={[styles.temperature, { color: textColor }]}>
                {weather.current.temp}°
              </Text>
              <Text style={[styles.feelsLike, { color: secondaryText }]}>
                Cảm giác như {weather.current.feelsLike}°
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: textColor }]}>
            {getWeatherEmoji(weather.current.description)}{" "}
            {weather.current.description}
          </Text>

          {/* Weather Details Grid */}
          <View style={styles.detailsGrid}>
            <View
              style={[styles.detailItem, { backgroundColor: backgroundColor }]}
            >
              <Ionicons name="water-outline" size={20} color={primaryColor} />
              <Text style={[styles.detailValue, { color: textColor }]}>
                {weather.current.humidity}%
              </Text>
              <Text style={[styles.detailLabel, { color: secondaryText }]}>
                Độ ẩm
              </Text>
            </View>

            <View
              style={[styles.detailItem, { backgroundColor: backgroundColor }]}
            >
              <Ionicons
                name="speedometer-outline"
                size={20}
                color={primaryColor}
              />
              <Text style={[styles.detailValue, { color: textColor }]}>
                {weather.current.windSpeed.toFixed(1)} m/s
              </Text>
              <Text style={[styles.detailLabel, { color: secondaryText }]}>
                Gió
              </Text>
            </View>

            <View
              style={[styles.detailItem, { backgroundColor: backgroundColor }]}
            >
              <Ionicons name="eye-outline" size={20} color={primaryColor} />
              <Text style={[styles.detailValue, { color: textColor }]}>
                {weather.current.visibility} km
              </Text>
              <Text style={[styles.detailLabel, { color: secondaryText }]}>
                Tầm nhìn
              </Text>
            </View>

            <View
              style={[styles.detailItem, { backgroundColor: backgroundColor }]}
            >
              <Ionicons name="cloud-outline" size={20} color={primaryColor} />
              <Text style={[styles.detailValue, { color: textColor }]}>
                {weather.current.clouds}%
              </Text>
              <Text style={[styles.detailLabel, { color: secondaryText }]}>
                Mây
              </Text>
            </View>
          </View>
        </View>

        {/* Hourly Forecast */}
        {showHourly && weather.hourly && weather.hourly.length > 0 && (
          <View style={styles.forecastSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              <Ionicons name="time-outline" size={16} /> Dự báo theo giờ
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyContainer}
            >
              {weather.hourly.map((hour, index) => (
                <View
                  key={index}
                  style={[
                    styles.hourlyItem,
                    { backgroundColor: backgroundColor },
                  ]}
                >
                  <Text style={[styles.hourlyTime, { color: secondaryText }]}>
                    {formatTime(hour.time)}
                  </Text>
                  {hour.icon ? (
                    <Image
                      source={{ uri: hour.icon }}
                      style={styles.hourlyIcon}
                    />
                  ) : null}
                  <Text style={[styles.hourlyTemp, { color: textColor }]}>
                    {Math.round(hour.temp)}°
                  </Text>
                  {hour.precipitation > 0 && (
                    <View style={styles.precipRow}>
                      <Ionicons name="water" size={10} color="#0D9488" />
                      <Text style={styles.precipText}>
                        {Math.round(hour.precipitation)}%
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Daily Forecast */}
        {showDaily && weather.daily && weather.daily.length > 0 && (
          <View style={styles.forecastSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              <Ionicons name="calendar-outline" size={16} /> Dự báo{" "}
              {forecastDays} ngày
            </Text>
            {weather.daily.slice(0, forecastDays).map((day, index) => (
              <View
                key={index}
                style={[styles.dailyItem, { backgroundColor: backgroundColor }]}
              >
                <Text style={[styles.dailyDate, { color: textColor }]}>
                  {index === 0 ? "Hôm nay" : formatDate(day.date)}
                </Text>
                <View style={styles.dailyCenter}>
                  {day.icon ? (
                    <Image
                      source={{ uri: day.icon }}
                      style={styles.dailyIcon}
                    />
                  ) : null}
                  {day.precipitation > 0 && (
                    <View style={styles.dailyPrecip}>
                      <Ionicons name="water" size={12} color="#0D9488" />
                      <Text style={styles.dailyPrecipText}>
                        {Math.round(day.precipitation)}%
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.dailyTemps}>
                  <Text style={[styles.dailyTempMax, { color: textColor }]}>
                    {Math.round(day.tempMax)}°
                  </Text>
                  <Text style={[styles.dailyTempMin, { color: secondaryText }]}>
                    {Math.round(day.tempMin)}°
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Source attribution */}
        <Text style={[styles.sourceText, { color: secondaryText }]}>
          Nguồn:{" "}
          {weather.source === "openweathermap"
            ? "OpenWeatherMap"
            : weather.source === "weatherapi"
              ? "WeatherAPI"
              : "Visual Crossing"}
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Compact styles
  compactContainer: {
    borderRadius: 12,
    padding: 12,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactIcon: {
    width: 40,
    height: 40,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 8,
  },
  compactTemp: {
    fontSize: 20,
    fontWeight: "700",
  },
  compactLocation: {
    fontSize: 12,
  },
  compactEmoji: {
    fontSize: 24,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
  },
  lastUpdated: {
    fontSize: 11,
  },

  // Current weather
  currentWeather: {
    alignItems: "center",
    marginBottom: 20,
  },
  currentMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  tempContainer: {
    alignItems: "flex-start",
  },
  temperature: {
    fontSize: 56,
    fontWeight: "200",
  },
  feelsLike: {
    fontSize: 13,
    marginTop: -8,
  },
  description: {
    fontSize: 16,
    textTransform: "capitalize",
    marginBottom: 16,
  },

  // Details grid
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  detailLabel: {
    fontSize: 11,
  },

  // Forecast sections
  forecastSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },

  // Hourly
  hourlyContainer: {
    gap: 8,
  },
  hourlyItem: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    minWidth: 60,
  },
  hourlyTime: {
    fontSize: 11,
    marginBottom: 4,
  },
  hourlyIcon: {
    width: 32,
    height: 32,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: "600",
  },
  precipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  precipText: {
    fontSize: 10,
    color: "#0D9488",
  },

  // Daily
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  dailyDate: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  dailyCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dailyIcon: {
    width: 36,
    height: 36,
  },
  dailyPrecip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dailyPrecipText: {
    fontSize: 11,
    color: "#0D9488",
  },
  dailyTemps: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  dailyTempMax: {
    fontSize: 15,
    fontWeight: "600",
  },
  dailyTempMin: {
    fontSize: 15,
  },

  // Source
  sourceText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 16,
  },
});

export default WeatherWidget;
