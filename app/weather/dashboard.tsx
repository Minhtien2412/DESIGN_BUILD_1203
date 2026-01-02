/**
 * Weather Dashboard Screen
 * Current conditions and 7-day forecast for construction projects
 */

import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { useWeatherForecast } from '@/hooks/useWeather';
import { WeatherCondition } from '@/types/weather';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function WeatherDashboardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { forecast, loading, error, refreshing, refresh } = useWeatherForecast({
    projectId: projectId || '',
    days: 7,
    includeHourly: true,
    includeAlerts: true,
  });

  if (loading && !forecast) {
    return <Loader />;
  }

  if (error) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  if (!forecast) {
    return null;
  }

  const { current, daily, alerts } = forecast;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thời tiết',
          headerRight: () => (
            <TouchableOpacity onPress={refresh} disabled={refreshing}>
              <Ionicons
                name="refresh"
                size={24}
                color={refreshing ? '#ccc' : '#2196F3'}
                style={{ marginRight: 8 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* Active Alerts Banner */}
        {alerts && alerts.length > 0 && (
          <View style={styles.alertsBanner}>
            <Ionicons name="warning" size={20} color="#F44336" />
            <Text style={styles.alertsText}>
              {alerts.length} cảnh báo thời tiết
            </Text>
            <TouchableOpacity>
              <Text style={styles.alertsLink}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Weather Card */}
        <View style={styles.currentCard}>
          <View style={styles.currentHeader}>
            <View>
              <Text style={styles.locationName}>{current.locationName}</Text>
              <Text style={styles.lastUpdated}>
                Cập nhật: {new Date(current.lastUpdated).toLocaleTimeString('vi-VN')}
              </Text>
            </View>
            {getWeatherIcon(current.condition, 80)}
          </View>

          <View style={styles.currentTemp}>
            <Text style={styles.tempLarge}>{Math.round(current.temperature)}°</Text>
            <View style={styles.currentCondition}>
              <Text style={styles.conditionText}>
                {getConditionLabel(current.condition)}
              </Text>
              <Text style={styles.feelsLike}>
                Cảm giác như {Math.round(current.feelsLike)}°
              </Text>
            </View>
          </View>

          {/* Current Weather Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="water" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Độ ẩm</Text>
              <Text style={styles.detailValue}>{current.humidity}%</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="speedometer" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Áp suất</Text>
              <Text style={styles.detailValue}>{current.pressure} hPa</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="navigate" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Gió</Text>
              <Text style={styles.detailValue}>{current.windSpeed} km/h</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="eye" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Tầm nhìn</Text>
              <Text style={styles.detailValue}>{current.visibility} km</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="rainy" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Mưa</Text>
              <Text style={styles.detailValue}>{current.precipitation} mm</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="sunny" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>UV</Text>
              <Text style={styles.detailValue}>{current.uvIndex}</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Forecast */}
        <View style={styles.forecastSection}>
          <Text style={styles.sectionTitle}>Dự báo 7 ngày</Text>

          {daily.map((day, index) => {
            const date = new Date(day.date);
            const isToday = index === 0;

            return (
              <View key={index} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View>
                    <Text style={styles.dayName}>
                      {isToday
                        ? 'Hôm nay'
                        : date.toLocaleDateString('vi-VN', { weekday: 'long' })}
                    </Text>
                    <Text style={styles.dayDate}>
                      {date.toLocaleDateString('vi-VN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  {getWeatherIcon(day.condition, 40)}
                </View>

                <View style={styles.dayTemp}>
                  <View style={styles.tempRange}>
                    <Ionicons name="arrow-up" size={16} color="#F44336" />
                    <Text style={styles.tempMax}>{Math.round(day.temperatureMax)}°</Text>
                  </View>
                  <View style={styles.tempRange}>
                    <Ionicons name="arrow-down" size={16} color="#2196F3" />
                    <Text style={styles.tempMin}>{Math.round(day.temperatureMin)}°</Text>
                  </View>
                </View>

                <View style={styles.dayDetails}>
                  <View style={styles.dayDetailItem}>
                    <Ionicons name="rainy" size={14} color="#666" />
                    <Text style={styles.dayDetailText}>{day.rainChance}%</Text>
                  </View>
                  <View style={styles.dayDetailItem}>
                    <Ionicons name="water" size={14} color="#666" />
                    <Text style={styles.dayDetailText}>{day.humidity}%</Text>
                  </View>
                  <View style={styles.dayDetailItem}>
                    <Ionicons name="navigate" size={14} color="#666" />
                    <Text style={styles.dayDetailText}>{day.windSpeed} km/h</Text>
                  </View>
                  <View style={styles.dayDetailItem}>
                    <Ionicons name="sunny" size={14} color="#666" />
                    <Text style={styles.dayDetailText}>UV {day.uvIndex}</Text>
                  </View>
                </View>

                {day.precipitation > 0 && (
                  <View style={styles.rainInfo}>
                    <Ionicons name="rainy" size={16} color="#2196F3" />
                    <Text style={styles.rainText}>
                      Lượng mưa: {day.precipitation} mm
                    </Text>
                  </View>
                )}

                <View style={styles.sunInfo}>
                  <View style={styles.sunItem}>
                    <Ionicons name="sunny-outline" size={14} color="#FF9800" />
                    <Text style={styles.sunText}>
                      {new Date(day.sunrise).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={styles.sunItem}>
                    <Ionicons name="moon-outline" size={14} color="#666" />
                    <Text style={styles.sunText}>
                      {new Date(day.sunset).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

// Helper function to get weather icon
function getWeatherIcon(condition: WeatherCondition, size: number = 40) {
  const iconMap: Record<WeatherCondition, string> = {
    [WeatherCondition.CLEAR]: 'sunny',
    [WeatherCondition.PARTLY_CLOUDY]: 'partly-sunny',
    [WeatherCondition.CLOUDY]: 'cloudy',
    [WeatherCondition.OVERCAST]: 'cloud',
    [WeatherCondition.LIGHT_RAIN]: 'rainy-outline',
    [WeatherCondition.RAIN]: 'rainy',
    [WeatherCondition.HEAVY_RAIN]: 'rainy',
    [WeatherCondition.THUNDERSTORM]: 'thunderstorm',
    [WeatherCondition.DRIZZLE]: 'rainy-outline',
    [WeatherCondition.SNOW]: 'snow',
    [WeatherCondition.SLEET]: 'snow',
    [WeatherCondition.FOG]: 'cloudy',
    [WeatherCondition.MIST]: 'cloudy',
    [WeatherCondition.HAZE]: 'cloudy',
    [WeatherCondition.WINDY]: 'cloudy',
    [WeatherCondition.HOT]: 'sunny',
  };

  const iconName = iconMap[condition] || 'cloud';
  const color = getWeatherColor(condition);

  return <Ionicons name={iconName as any} size={size} color={color} />;
}

// Helper function to get weather color
function getWeatherColor(condition: WeatherCondition): string {
  switch (condition) {
    case WeatherCondition.CLEAR:
    case WeatherCondition.PARTLY_CLOUDY:
    case WeatherCondition.HOT:
      return '#FF9800';
    case WeatherCondition.CLOUDY:
    case WeatherCondition.OVERCAST:
    case WeatherCondition.FOG:
    case WeatherCondition.MIST:
    case WeatherCondition.HAZE:
      return '#9E9E9E';
    case WeatherCondition.LIGHT_RAIN:
    case WeatherCondition.DRIZZLE:
      return '#2196F3';
    case WeatherCondition.RAIN:
    case WeatherCondition.HEAVY_RAIN:
      return '#1976D2';
    case WeatherCondition.THUNDERSTORM:
      return '#673AB7';
    case WeatherCondition.SNOW:
    case WeatherCondition.SLEET:
      return '#0A6847';
    case WeatherCondition.WINDY:
      return '#4A4A4A';
    default:
      return '#9E9E9E';
  }
}

// Helper function to get condition label
function getConditionLabel(condition: WeatherCondition): string {
  const labels: Record<WeatherCondition, string> = {
    [WeatherCondition.CLEAR]: 'Trời quang',
    [WeatherCondition.PARTLY_CLOUDY]: 'Có mây',
    [WeatherCondition.CLOUDY]: 'Nhiều mây',
    [WeatherCondition.OVERCAST]: 'U ám',
    [WeatherCondition.LIGHT_RAIN]: 'Mưa nhẹ',
    [WeatherCondition.RAIN]: 'Mưa',
    [WeatherCondition.HEAVY_RAIN]: 'Mưa to',
    [WeatherCondition.THUNDERSTORM]: 'Dông bão',
    [WeatherCondition.DRIZZLE]: 'Mưa phùn',
    [WeatherCondition.SNOW]: 'Tuyết',
    [WeatherCondition.SLEET]: 'Mưa tuyết',
    [WeatherCondition.FOG]: 'Sương mù',
    [WeatherCondition.MIST]: 'Sương mù nhẹ',
    [WeatherCondition.HAZE]: 'Mù khô',
    [WeatherCondition.WINDY]: 'Gió mạnh',
    [WeatherCondition.HOT]: 'Nắng nóng',
  };

  return labels[condition] || 'Không xác định';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    gap: 8,
  },
  alertsText: {
    flex: 1,
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  alertsLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  currentCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  currentTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  tempLarge: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
  },
  currentCondition: {
    flex: 1,
  },
  conditionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  feelsLike: {
    fontSize: 14,
    color: '#666',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  forecastSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  dayDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  dayTemp: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  tempRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tempMax: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  tempMin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dayDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dayDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayDetailText: {
    fontSize: 12,
    color: '#666',
  },
  rainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  rainText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
  sunInfo: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sunItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sunText: {
    fontSize: 12,
    color: '#666',
  },
});
