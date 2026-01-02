/**
 * Weather Module Types
 * Comprehensive type definitions for weather forecasting, alerts, and work stoppage tracking
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Weather condition types
 */
export enum WeatherCondition {
  CLEAR = 'CLEAR',
  PARTLY_CLOUDY = 'PARTLY_CLOUDY',
  CLOUDY = 'CLOUDY',
  OVERCAST = 'OVERCAST',
  LIGHT_RAIN = 'LIGHT_RAIN',
  RAIN = 'RAIN',
  HEAVY_RAIN = 'HEAVY_RAIN',
  THUNDERSTORM = 'THUNDERSTORM',
  DRIZZLE = 'DRIZZLE',
  SNOW = 'SNOW',
  SLEET = 'SLEET',
  FOG = 'FOG',
  MIST = 'MIST',
  HAZE = 'HAZE',
  WINDY = 'WINDY',
  HOT = 'HOT',
}

/**
 * Weather alert severity levels
 */
export enum WeatherAlertSeverity {
  INFO = 'INFO',
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  EXTREME = 'EXTREME',
}

/**
 * Weather alert types
 */
export enum WeatherAlertType {
  HEAVY_RAIN = 'HEAVY_RAIN',
  THUNDERSTORM = 'THUNDERSTORM',
  HIGH_WIND = 'HIGH_WIND',
  EXTREME_HEAT = 'EXTREME_HEAT',
  EXTREME_COLD = 'EXTREME_COLD',
  FLOOD = 'FLOOD',
  TYPHOON = 'TYPHOON',
  STORM_SURGE = 'STORM_SURGE',
  LIGHTNING = 'LIGHTNING',
  HAIL = 'HAIL',
  TORNADO = 'TORNADO',
  DENSE_FOG = 'DENSE_FOG',
  AIR_QUALITY = 'AIR_QUALITY',
}

/**
 * Work stoppage reasons
 */
export enum StopageReason {
  HEAVY_RAIN = 'HEAVY_RAIN',
  STRONG_WIND = 'STRONG_WIND',
  EXTREME_HEAT = 'EXTREME_HEAT',
  THUNDERSTORM = 'THUNDERSTORM',
  FLOOD = 'FLOOD',
  POOR_VISIBILITY = 'POOR_VISIBILITY',
  UNSAFE_CONDITIONS = 'UNSAFE_CONDITIONS',
  EQUIPMENT_SAFETY = 'EQUIPMENT_SAFETY',
  WORKER_SAFETY = 'WORKER_SAFETY',
  OTHER = 'OTHER',
}

/**
 * Work stoppage status
 */
export enum StopageStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Work activity types affected by weather
 */
export enum WorkActivityType {
  EXCAVATION = 'EXCAVATION',
  FOUNDATION = 'FOUNDATION',
  CONCRETE_POURING = 'CONCRETE_POURING',
  STEEL_ERECTION = 'STEEL_ERECTION',
  MASONRY = 'MASONRY',
  ROOFING = 'ROOFING',
  EXTERIOR_FINISHING = 'EXTERIOR_FINISHING',
  PAINTING_EXTERIOR = 'PAINTING_EXTERIOR',
  CRANE_OPERATIONS = 'CRANE_OPERATIONS',
  SCAFFOLDING = 'SCAFFOLDING',
  ELECTRICAL_OUTDOOR = 'ELECTRICAL_OUTDOOR',
  PLUMBING_OUTDOOR = 'PLUMBING_OUTDOOR',
  LANDSCAPING = 'LANDSCAPING',
  PAVING = 'PAVING',
  OTHER = 'OTHER',
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Current weather conditions
 */
export interface CurrentWeather {
  projectId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  condition: WeatherCondition;
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  humidity: number; // Percentage
  pressure: number; // hPa
  windSpeed: number; // km/h
  windDirection: number; // Degrees
  windGust?: number; // km/h
  visibility: number; // km
  uvIndex: number;
  cloudCover: number; // Percentage
  precipitation: number; // mm
  rainChance?: number; // Percentage
  lastUpdated: Date;
}

/**
 * Hourly forecast data
 */
export interface HourlyForecast {
  time: Date;
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  condition: WeatherCondition;
  precipitation: number; // mm
  rainChance: number; // Percentage
  humidity: number; // Percentage
  windSpeed: number; // km/h
  windDirection: number; // Degrees
  windGust?: number; // km/h
  uvIndex: number;
  visibility: number; // km
  cloudCover: number; // Percentage
}

/**
 * Daily forecast data
 */
export interface DailyForecast {
  date: Date;
  condition: WeatherCondition;
  temperatureMax: number; // Celsius
  temperatureMin: number; // Celsius
  sunrise: Date;
  sunset: Date;
  precipitation: number; // mm
  rainChance: number; // Percentage
  humidity: number; // Percentage
  windSpeed: number; // km/h
  windDirection: number; // Degrees
  windGust?: number; // km/h
  uvIndex: number;
  hourlyForecasts?: HourlyForecast[];
}

/**
 * Complete weather forecast
 */
export interface WeatherForecast {
  id: string;
  projectId: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts?: WeatherAlert[];
  fetchedAt: Date;
}

/**
 * Weather alert/warning
 */
export interface WeatherAlert {
  id: string;
  projectId: string;
  type: WeatherAlertType;
  severity: WeatherAlertSeverity;
  headline: string;
  description: string;
  instruction?: string;
  startTime: Date;
  endTime: Date;
  affectedAreas?: string[];
  source: string;
  isActive: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Work stoppage record
 */
export interface WorkStoppage {
  id: string;
  projectId: string;
  reason: StopageReason;
  status: StopageStatus;
  affectedActivities: WorkActivityType[];
  startTime: Date;
  endTime?: Date;
  plannedEndTime?: Date;
  actualDuration?: number; // minutes
  plannedDuration?: number; // minutes
  affectedWorkers: number;
  affectedAreas?: string[];
  weatherConditions?: {
    temperature?: number;
    windSpeed?: number;
    precipitation?: number;
    visibility?: number;
    condition?: WeatherCondition;
  };
  decision: {
    decidedBy: string;
    decidedAt: Date;
    reasoning: string;
  };
  impact: {
    estimatedDelay?: number; // hours
    estimatedCost?: number;
    safetyRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  notes?: string;
  photos?: string[];
  relatedAlertId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Weather history record
 */
export interface WeatherHistory {
  id: string;
  projectId: string;
  date: Date;
  condition: WeatherCondition;
  temperatureMax: number;
  temperatureMin: number;
  temperatureAvg: number;
  precipitation: number;
  windSpeedMax: number;
  windSpeedAvg: number;
  humidity: number;
  workableHours: number;
  stoppages: number;
  recordedAt: Date;
}

/**
 * Weather statistics for a project
 */
export interface WeatherStats {
  projectId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalDays: number;
  workableDays: number;
  stoppageDays: number;
  totalStoppageHours: number;
  averageTemperature: number;
  totalPrecipitation: number;
  extremeWeatherEvents: number;
  mostCommonCondition: WeatherCondition;
  conditionDistribution: Record<WeatherCondition, number>;
  monthlyBreakdown: {
    month: string;
    workableDays: number;
    stoppageDays: number;
    precipitation: number;
  }[];
}

/**
 * Weather-based work recommendation
 */
export interface WorkRecommendation {
  date: Date;
  timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING';
  suitability: 'IDEAL' | 'GOOD' | 'FAIR' | 'POOR' | 'UNSAFE';
  activityType: WorkActivityType;
  reasoning: string;
  weatherConditions: {
    temperature: number;
    windSpeed: number;
    precipitation: number;
    condition: WeatherCondition;
  };
  risks: string[];
  precautions: string[];
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface GetWeatherForecastParams {
  projectId: string;
  latitude?: number;
  longitude?: number;
  days?: number; // Default 7
  includeHourly?: boolean;
  includeAlerts?: boolean;
}

export interface GetWeatherAlertsParams {
  projectId: string;
  activeOnly?: boolean;
  severity?: WeatherAlertSeverity[];
  unacknowledgedOnly?: boolean;
}

export interface AcknowledgeAlertParams {
  alertId: string;
  acknowledgedBy: string;
  notes?: string;
}

export interface CreateStoppageParams {
  projectId: string;
  reason: StopageReason;
  affectedActivities: WorkActivityType[];
  startTime: Date;
  plannedEndTime?: Date;
  affectedWorkers: number;
  affectedAreas?: string[];
  weatherConditions?: WorkStoppage['weatherConditions'];
  decisionReasoning: string;
  estimatedDelay?: number;
  estimatedCost?: number;
  safetyRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notes?: string;
  relatedAlertId?: string;
}

export interface UpdateStoppageParams {
  endTime?: Date;
  status?: StopageStatus;
  actualDuration?: number;
  notes?: string;
  photos?: string[];
}

export interface GetStoppagesParams {
  projectId: string;
  status?: StopageStatus[];
  startDate?: Date;
  endDate?: Date;
  reason?: StopageReason[];
}

export interface GetWeatherHistoryParams {
  projectId: string;
  startDate: Date;
  endDate: Date;
}

export interface GetWeatherStatsParams {
  projectId: string;
  startDate: Date;
  endDate: Date;
}

export interface GetWorkRecommendationsParams {
  projectId: string;
  activityType: WorkActivityType;
  days?: number; // Default 3
}
