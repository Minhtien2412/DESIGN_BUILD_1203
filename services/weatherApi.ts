/**
 * Weather API Service
 * ===================
 * 
 * Service để lấy dữ liệu thời tiết từ nhiều nguồn API.
 * Ưu tiên: OpenWeatherMap → WeatherAPI → Visual Crossing
 * 
 * @author ThietKeResort Team
 * @created 2025-01-12
 */

import { WEATHER_CONFIG, isServiceConfigured } from '../config/externalApis';

// ============================================
// Types
// ============================================
export interface WeatherLocation {
  lat: number;
  lon: number;
  city?: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  visibility: number;
  uvIndex?: number;
  clouds: number;
  timestamp: number;
}

export interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  humidity: number;
  description: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
}

export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  source: 'openweathermap' | 'weatherapi' | 'visualcrossing';
}

export interface WeatherAlert {
  event: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  headline: string;
  description: string;
  start: number;
  end: number;
}

// ============================================
// OpenWeatherMap Implementation
// ============================================
async function fetchOpenWeatherMap(location: WeatherLocation): Promise<WeatherData | null> {
  const config = WEATHER_CONFIG.openweathermap;
  
  if (!config.apiKey) return null;
  
  try {
    // Fetch current weather + forecast
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${config.baseUrl}/weather?lat=${location.lat}&lon=${location.lon}&appid=${config.apiKey}&units=${config.units}&lang=${config.lang}`),
      fetch(`${config.baseUrl}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${config.apiKey}&units=${config.units}&lang=${config.lang}`),
    ]);
    
    if (!currentRes.ok) throw new Error('OpenWeatherMap API error');
    
    const currentData = await currentRes.json();
    const forecastData = forecastRes.ok ? await forecastRes.json() : null;
    
    // Map icon codes
    const getIconUrl = (code: string) => `https://openweathermap.org/img/wn/${code}@2x.png`;
    
    const result: WeatherData = {
      location: {
        name: currentData.name,
        country: currentData.sys?.country || '',
        lat: currentData.coord.lat,
        lon: currentData.coord.lon,
      },
      current: {
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        windSpeed: currentData.wind.speed,
        windDirection: currentData.wind.deg || 0,
        description: currentData.weather[0].description,
        icon: getIconUrl(currentData.weather[0].icon),
        visibility: currentData.visibility / 1000, // Convert to km
        clouds: currentData.clouds.all,
        timestamp: currentData.dt * 1000,
      },
      source: 'openweathermap',
    };
    
    // Process hourly forecast (3-hour intervals)
    if (forecastData?.list) {
      result.hourly = forecastData.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toISOString(),
        temp: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: getIconUrl(item.weather[0].icon),
        precipitation: (item.pop || 0) * 100,
        windSpeed: item.wind.speed,
      }));
      
      // Group by day for daily forecast
      const dailyMap = new Map<string, any[]>();
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!dailyMap.has(date)) dailyMap.set(date, []);
        dailyMap.get(date)!.push(item);
      });
      
      result.daily = Array.from(dailyMap.entries()).slice(0, 5).map(([date, items]) => {
        const temps = items.map(i => i.main.temp);
        const midItem = items[Math.floor(items.length / 2)];
        return {
          date,
          tempMin: Math.round(Math.min(...temps)),
          tempMax: Math.round(Math.max(...temps)),
          humidity: Math.round(items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length),
          description: midItem.weather[0].description,
          icon: getIconUrl(midItem.weather[0].icon),
          precipitation: Math.round(Math.max(...items.map(i => (i.pop || 0) * 100))),
          windSpeed: Math.round(items.reduce((sum, i) => sum + i.wind.speed, 0) / items.length),
        };
      });
    }
    
    return result;
  } catch (error) {
    console.error('[WeatherService] OpenWeatherMap error:', error);
    return null;
  }
}

// ============================================
// WeatherAPI Implementation
// ============================================
async function fetchWeatherAPI(location: WeatherLocation): Promise<WeatherData | null> {
  const config = WEATHER_CONFIG.weatherapi;
  
  if (!config.apiKey) return null;
  
  try {
    const res = await fetch(
      `${config.baseUrl}/forecast.json?key=${config.apiKey}&q=${location.lat},${location.lon}&days=5&aqi=no&alerts=yes&lang=vi`
    );
    
    if (!res.ok) throw new Error('WeatherAPI error');
    
    const data = await res.json();
    
    const result: WeatherData = {
      location: {
        name: data.location.name,
        country: data.location.country,
        lat: data.location.lat,
        lon: data.location.lon,
      },
      current: {
        temp: Math.round(data.current.temp_c),
        feelsLike: Math.round(data.current.feelslike_c),
        humidity: data.current.humidity,
        pressure: data.current.pressure_mb,
        windSpeed: data.current.wind_kph / 3.6, // Convert to m/s
        windDirection: data.current.wind_degree,
        description: data.current.condition.text,
        icon: `https:${data.current.condition.icon}`,
        visibility: data.current.vis_km,
        uvIndex: data.current.uv,
        clouds: data.current.cloud,
        timestamp: data.current.last_updated_epoch * 1000,
      },
      source: 'weatherapi',
    };
    
    // Process hourly forecast
    if (data.forecast?.forecastday?.[0]?.hour) {
      const now = new Date();
      const currentHour = now.getHours();
      
      result.hourly = data.forecast.forecastday[0].hour
        .filter((h: any) => new Date(h.time).getHours() >= currentHour)
        .slice(0, 8)
        .map((h: any) => ({
          time: new Date(h.time).toISOString(),
          temp: Math.round(h.temp_c),
          feelsLike: Math.round(h.feelslike_c),
          humidity: h.humidity,
          description: h.condition.text,
          icon: `https:${h.condition.icon}`,
          precipitation: h.chance_of_rain,
          windSpeed: h.wind_kph / 3.6,
        }));
    }
    
    // Process daily forecast
    if (data.forecast?.forecastday) {
      result.daily = data.forecast.forecastday.map((d: any) => ({
        date: d.date,
        tempMin: Math.round(d.day.mintemp_c),
        tempMax: Math.round(d.day.maxtemp_c),
        humidity: d.day.avghumidity,
        description: d.day.condition.text,
        icon: `https:${d.day.condition.icon}`,
        precipitation: d.day.daily_chance_of_rain,
        windSpeed: d.day.maxwind_kph / 3.6,
      }));
    }
    
    return result;
  } catch (error) {
    console.error('[WeatherService] WeatherAPI error:', error);
    return null;
  }
}

// ============================================
// Visual Crossing Implementation
// ============================================
async function fetchVisualCrossing(location: WeatherLocation): Promise<WeatherData | null> {
  const config = WEATHER_CONFIG.visualcrossing;
  
  if (!config.apiKey) return null;
  
  try {
    const res = await fetch(
      `${config.baseUrl}/timeline/${location.lat},${location.lon}?unitGroup=metric&include=current,hours,days&key=${config.apiKey}&contentType=json`
    );
    
    if (!res.ok) throw new Error('Visual Crossing API error');
    
    const data = await res.json();
    
    const getIconUrl = (icon: string) => `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/2nd%20Set%20-%20Color/${icon}.png`;
    
    const result: WeatherData = {
      location: {
        name: data.resolvedAddress?.split(',')[0] || location.city || 'Unknown',
        country: data.resolvedAddress?.split(',').pop()?.trim() || '',
        lat: data.latitude,
        lon: data.longitude,
      },
      current: {
        temp: Math.round(data.currentConditions.temp),
        feelsLike: Math.round(data.currentConditions.feelslike),
        humidity: data.currentConditions.humidity,
        pressure: data.currentConditions.pressure,
        windSpeed: data.currentConditions.windspeed / 3.6,
        windDirection: data.currentConditions.winddir,
        description: data.currentConditions.conditions,
        icon: getIconUrl(data.currentConditions.icon),
        visibility: data.currentConditions.visibility,
        uvIndex: data.currentConditions.uvindex,
        clouds: data.currentConditions.cloudcover,
        timestamp: data.currentConditions.datetimeEpoch * 1000,
      },
      source: 'visualcrossing',
    };
    
    // Process daily
    if (data.days) {
      result.daily = data.days.slice(0, 5).map((d: any) => ({
        date: d.datetime,
        tempMin: Math.round(d.tempmin),
        tempMax: Math.round(d.tempmax),
        humidity: d.humidity,
        description: d.conditions,
        icon: getIconUrl(d.icon),
        precipitation: d.precipprob,
        windSpeed: d.windspeed / 3.6,
      }));
    }
    
    return result;
  } catch (error) {
    console.error('[WeatherService] Visual Crossing error:', error);
    return null;
  }
}

// ============================================
// Main Service Functions
// ============================================

/**
 * Get weather data with automatic fallback
 */
export async function getWeather(location: WeatherLocation): Promise<WeatherData> {
  // Try services in priority order
  let data: WeatherData | null = null;
  
  if (isServiceConfigured('openweathermap')) {
    data = await fetchOpenWeatherMap(location);
    if (data) return data;
  }
  
  if (isServiceConfigured('weatherapi')) {
    data = await fetchWeatherAPI(location);
    if (data) return data;
  }
  
  // Try Visual Crossing as last resort
  data = await fetchVisualCrossing(location);
  if (data) return data;
  
  // Return mock data if no service available
  return getMockWeatherData(location);
}

/**
 * Get current weather only (lightweight)
 */
export async function getCurrentWeather(location: WeatherLocation): Promise<CurrentWeather> {
  const data = await getWeather(location);
  return data.current;
}

/**
 * Get 5-day forecast
 */
export async function getForecast(location: WeatherLocation, days = 5): Promise<DailyForecast[]> {
  const data = await getWeather(location);
  return data.daily?.slice(0, days) || [];
}

/**
 * Get hourly forecast
 */
export async function getHourlyForecast(location: WeatherLocation, hours = 8): Promise<HourlyForecast[]> {
  const data = await getWeather(location);
  return data.hourly?.slice(0, hours) || [];
}

/**
 * Get weather by city name
 */
export async function getWeatherByCity(city: string): Promise<WeatherData> {
  // Use Google Maps or OpenWeatherMap geocoding to get coordinates
  const config = WEATHER_CONFIG.openweathermap;
  
  if (config.apiKey) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${config.apiKey}`
      );
      
      if (res.ok) {
        const [location] = await res.json();
        if (location) {
          return getWeather({ lat: location.lat, lon: location.lon, city: location.name });
        }
      }
    } catch (error) {
      console.error('[WeatherService] Geocoding error:', error);
    }
  }
  
  // Fallback to Vietnam major cities
  const vietnamCities: Record<string, WeatherLocation> = {
    'hà nội': { lat: 21.0285, lon: 105.8542, city: 'Hà Nội' },
    'hanoi': { lat: 21.0285, lon: 105.8542, city: 'Hà Nội' },
    'hồ chí minh': { lat: 10.8231, lon: 106.6297, city: 'Hồ Chí Minh' },
    'saigon': { lat: 10.8231, lon: 106.6297, city: 'Hồ Chí Minh' },
    'đà nẵng': { lat: 16.0544, lon: 108.2022, city: 'Đà Nẵng' },
    'danang': { lat: 16.0544, lon: 108.2022, city: 'Đà Nẵng' },
    'cần thơ': { lat: 10.0452, lon: 105.7469, city: 'Cần Thơ' },
    'hải phòng': { lat: 20.8449, lon: 106.6881, city: 'Hải Phòng' },
    'nha trang': { lat: 12.2388, lon: 109.1967, city: 'Nha Trang' },
    'đà lạt': { lat: 11.9463, lon: 108.4419, city: 'Đà Lạt' },
    'huế': { lat: 16.4637, lon: 107.5909, city: 'Huế' },
    'phú quốc': { lat: 10.2897, lon: 103.9839, city: 'Phú Quốc' },
  };
  
  const normalizedCity = city.toLowerCase().trim();
  const knownLocation = vietnamCities[normalizedCity];
  
  if (knownLocation) {
    return getWeather(knownLocation);
  }
  
  // Default to Ho Chi Minh City
  return getWeather({ lat: 10.8231, lon: 106.6297, city: 'Hồ Chí Minh' });
}

/**
 * Mock weather data for testing/offline
 */
function getMockWeatherData(location: WeatherLocation): WeatherData {
  const now = Date.now();
  
  return {
    location: {
      name: location.city || 'Unknown Location',
      country: 'VN',
      lat: location.lat,
      lon: location.lon,
    },
    current: {
      temp: 28,
      feelsLike: 32,
      humidity: 75,
      pressure: 1012,
      windSpeed: 3.5,
      windDirection: 180,
      description: 'Trời có mây',
      icon: 'https://openweathermap.org/img/wn/03d@2x.png',
      visibility: 10,
      clouds: 40,
      timestamp: now,
    },
    hourly: Array.from({ length: 8 }, (_, i) => ({
      time: new Date(now + i * 3600000).toISOString(),
      temp: 26 + Math.random() * 6,
      feelsLike: 28 + Math.random() * 6,
      humidity: 70 + Math.random() * 15,
      description: i < 4 ? 'Trời nắng' : 'Trời có mây',
      icon: i < 4 ? 'https://openweathermap.org/img/wn/01d@2x.png' : 'https://openweathermap.org/img/wn/03d@2x.png',
      precipitation: Math.random() * 30,
      windSpeed: 2 + Math.random() * 3,
    })),
    daily: Array.from({ length: 5 }, (_, i) => {
      const date = new Date(now + i * 86400000);
      return {
        date: date.toISOString().split('T')[0],
        tempMin: 24 + Math.random() * 3,
        tempMax: 32 + Math.random() * 4,
        humidity: 70 + Math.random() * 15,
        description: i % 2 === 0 ? 'Trời nắng' : 'Mưa rào',
        icon: i % 2 === 0 ? 'https://openweathermap.org/img/wn/01d@2x.png' : 'https://openweathermap.org/img/wn/10d@2x.png',
        precipitation: i % 2 === 0 ? 10 : 60,
        windSpeed: 3 + Math.random() * 2,
      };
    }),
    source: 'openweathermap',
  };
}

// ============================================
// Weather Icons Helper
// ============================================
export const WEATHER_ICONS: Record<string, string> = {
  'clear-day': '☀️',
  'clear-night': '🌙',
  'partly-cloudy-day': '⛅',
  'partly-cloudy-night': '☁️',
  'cloudy': '☁️',
  'rain': '🌧️',
  'showers-day': '🌦️',
  'showers-night': '🌧️',
  'thunder-rain': '⛈️',
  'thunder-showers-day': '⛈️',
  'snow': '❄️',
  'fog': '🌫️',
  'wind': '💨',
};

export function getWeatherEmoji(description: string): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('thunder') || desc.includes('sấm')) return '⛈️';
  if (desc.includes('rain') || desc.includes('mưa')) return '🌧️';
  if (desc.includes('snow') || desc.includes('tuyết')) return '❄️';
  if (desc.includes('fog') || desc.includes('sương')) return '🌫️';
  if (desc.includes('cloud') || desc.includes('mây')) return '☁️';
  if (desc.includes('clear') || desc.includes('nắng') || desc.includes('quang')) return '☀️';
  if (desc.includes('wind') || desc.includes('gió')) return '💨';
  
  return '🌤️';
}

export default {
  getWeather,
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
  getWeatherByCity,
  getWeatherEmoji,
  WEATHER_ICONS,
};
