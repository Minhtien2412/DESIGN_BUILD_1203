/**
 * Weather Service
 * API integration for weather forecasts, alerts, and work stoppage tracking
 */

import type {
    AcknowledgeAlertParams,
    CreateStoppageParams,
    GetStoppagesParams,
    GetWeatherAlertsParams,
    GetWeatherForecastParams,
    GetWeatherHistoryParams,
    GetWeatherStatsParams,
    GetWorkRecommendationsParams,
    UpdateStoppageParams,
    WeatherAlert,
    WeatherForecast,
    WeatherHistory,
    WeatherStats,
    WorkRecommendation,
    WorkStoppage,
} from '@/types/weather';
import { apiFetch } from './api';

// ============================================================================
// WEATHER FORECAST
// ============================================================================

/**
 * Get current weather and forecast for a project location
 */
export async function getWeatherForecast(
  params: GetWeatherForecastParams
): Promise<WeatherForecast> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    ...(params.latitude && { latitude: params.latitude.toString() }),
    ...(params.longitude && { longitude: params.longitude.toString() }),
    ...(params.days && { days: params.days.toString() }),
    ...(params.includeHourly !== undefined && {
      includeHourly: params.includeHourly.toString(),
    }),
    ...(params.includeAlerts !== undefined && {
      includeAlerts: params.includeAlerts.toString(),
    }),
  });

  return apiFetch<WeatherForecast>(`/weather/forecast?${queryParams}`);
}

/**
 * Get current weather only
 */
export async function getCurrentWeather(projectId: string) {
  return apiFetch(`/weather/current?projectId=${projectId}`);
}

/**
 * Refresh weather data for a project
 */
export async function refreshWeather(projectId: string): Promise<WeatherForecast> {
  return apiFetch<WeatherForecast>(`/weather/refresh`, {
    method: 'POST',
    body: JSON.stringify({ projectId }),
  });
}

// ============================================================================
// WEATHER ALERTS
// ============================================================================

/**
 * Get weather alerts for a project
 */
export async function getWeatherAlerts(
  params: GetWeatherAlertsParams
): Promise<WeatherAlert[]> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    ...(params.activeOnly !== undefined && {
      activeOnly: params.activeOnly.toString(),
    }),
    ...(params.severity && { severity: params.severity.join(',') }),
    ...(params.unacknowledgedOnly !== undefined && {
      unacknowledgedOnly: params.unacknowledgedOnly.toString(),
    }),
  });

  return apiFetch<WeatherAlert[]>(`/weather/alerts?${queryParams}`);
}

/**
 * Get a specific weather alert
 */
export async function getWeatherAlert(alertId: string): Promise<WeatherAlert> {
  return apiFetch<WeatherAlert>(`/weather/alerts/${alertId}`);
}

/**
 * Acknowledge a weather alert
 */
export async function acknowledgeAlert(
  params: AcknowledgeAlertParams
): Promise<WeatherAlert> {
  return apiFetch<WeatherAlert>(`/weather/alerts/${params.alertId}/acknowledge`, {
    method: 'POST',
    body: JSON.stringify({
      acknowledgedBy: params.acknowledgedBy,
      notes: params.notes,
    }),
  });
}

/**
 * Dismiss a weather alert
 */
export async function dismissAlert(alertId: string): Promise<void> {
  return apiFetch(`/weather/alerts/${alertId}/dismiss`, {
    method: 'POST',
  });
}

// ============================================================================
// WORK STOPPAGES
// ============================================================================

/**
 * Get work stoppages for a project
 */
export async function getWorkStoppages(
  params: GetStoppagesParams
): Promise<WorkStoppage[]> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    ...(params.status && { status: params.status.join(',') }),
    ...(params.reason && { reason: params.reason.join(',') }),
    ...(params.startDate && { startDate: params.startDate.toISOString() }),
    ...(params.endDate && { endDate: params.endDate.toISOString() }),
  });

  return apiFetch<WorkStoppage[]>(`/weather/stoppages?${queryParams}`);
}

/**
 * Get a specific work stoppage
 */
export async function getWorkStoppage(stoppageId: string): Promise<WorkStoppage> {
  return apiFetch<WorkStoppage>(`/weather/stoppages/${stoppageId}`);
}

/**
 * Create a work stoppage
 */
export async function createWorkStoppage(
  params: CreateStoppageParams
): Promise<WorkStoppage> {
  return apiFetch<WorkStoppage>('/weather/stoppages', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Update a work stoppage
 */
export async function updateWorkStoppage(
  stoppageId: string,
  params: UpdateStoppageParams
): Promise<WorkStoppage> {
  return apiFetch<WorkStoppage>(`/weather/stoppages/${stoppageId}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
}

/**
 * Complete a work stoppage
 */
export async function completeWorkStoppage(
  stoppageId: string,
  endTime: Date
): Promise<WorkStoppage> {
  return apiFetch<WorkStoppage>(`/weather/stoppages/${stoppageId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ endTime }),
  });
}

/**
 * Cancel a work stoppage
 */
export async function cancelWorkStoppage(
  stoppageId: string,
  reason?: string
): Promise<WorkStoppage> {
  return apiFetch<WorkStoppage>(`/weather/stoppages/${stoppageId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

/**
 * Delete a work stoppage
 */
export async function deleteWorkStoppage(stoppageId: string): Promise<void> {
  return apiFetch(`/weather/stoppages/${stoppageId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// WEATHER HISTORY & STATISTICS
// ============================================================================

/**
 * Get weather history for a project
 */
export async function getWeatherHistory(
  params: GetWeatherHistoryParams
): Promise<WeatherHistory[]> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    startDate: params.startDate.toISOString(),
    endDate: params.endDate.toISOString(),
  });

  return apiFetch<WeatherHistory[]>(`/weather/history?${queryParams}`);
}

/**
 * Get weather statistics for a project
 */
export async function getWeatherStats(
  params: GetWeatherStatsParams
): Promise<WeatherStats> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    startDate: params.startDate.toISOString(),
    endDate: params.endDate.toISOString(),
  });

  return apiFetch<WeatherStats>(`/weather/stats?${queryParams}`);
}

// ============================================================================
// WORK RECOMMENDATIONS
// ============================================================================

/**
 * Get work recommendations based on weather forecast
 */
export async function getWorkRecommendations(
  params: GetWorkRecommendationsParams
): Promise<WorkRecommendation[]> {
  const queryParams = new URLSearchParams({
    projectId: params.projectId,
    activityType: params.activityType,
    ...(params.days && { days: params.days.toString() }),
  });

  return apiFetch<WorkRecommendation[]>(`/weather/recommendations?${queryParams}`);
}

/**
 * Check if work is safe for specific activities
 */
export async function checkWorkSafety(
  projectId: string,
  activityTypes: string[]
): Promise<{ activity: string; safe: boolean; reasoning: string }[]> {
  return apiFetch('/weather/safety-check', {
    method: 'POST',
    body: JSON.stringify({ projectId, activityTypes }),
  });
}
