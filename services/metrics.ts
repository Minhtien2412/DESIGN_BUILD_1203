import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiFetch } from './api';

// Metrics and App Events API client for ThietKe Resort API
// Base URL: https://api.thietkeresort.com.vn

export interface AppEvent {
  event_type: 'app_crash' | 'payment_error' | 'user_action' | 'performance' | 'navigation' | 'api_error';
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: {
    user_id?: string;
    payment_id?: string;
    screen?: string;
    action?: string;
    duration_ms?: number;
    error_code?: string;
    error_details?: any;
    [key: string]: any;
  };
  timestamp?: string;
  app_version?: string;
  platform?: 'android' | 'ios' | 'web';
  device_info?: {
    model?: string;
    os_version?: string;
    app_build?: string;
    [key: string]: any;
  };
}

export interface AppEventResponse {
  success: boolean;
  event_id: string;
}

export interface AppEventListQuery {
  limit?: number;
  event_type?: string;
  level?: 'info' | 'warn' | 'error';
  start_date?: string;
  end_date?: string;
  page?: number;
}

export interface AppEventListResponse {
  events: (AppEvent & { id: string; user_id?: string })[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Metrics API Client for ThietKe Resort API
 * Handles app events logging and retrieval for monitoring
 */
export class MetricsClient {
  /**
   * Log an application event
   * POST /metrics/app-events
   */
  async logAppEvent(event: AppEvent, accessToken?: string): Promise<AppEventResponse> {
    const payload: AppEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      app_version: event.app_version || Constants.expoConfig?.version || '1.0.0',
      platform: event.platform || Platform.OS as 'android' | 'ios',
      device_info: {
        model: Constants.deviceName || 'unknown',
        os_version: Platform.Version?.toString() || 'unknown',
        app_build: (typeof Constants.expoConfig?.runtimeVersion === 'string' 
          ? Constants.expoConfig.runtimeVersion 
          : Constants.expoConfig?.version) || '1',
        ...event.device_info,
      },
    };

    try {
      return await apiFetch<AppEventResponse>('/metrics/app-events', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: accessToken
      });
    } catch (error) {
      // Silent fail for metrics to avoid affecting app functionality
      console.warn('Failed to log app event:', error);
      return { success: false, event_id: '' };
    }
  }

  /**
   * Get application events (admin only)
   * GET /metrics/app-events?limit=100
   */
  async getAppEvents(query: AppEventListQuery = {}, accessToken?: string): Promise<AppEventListResponse> {
    const searchParams = new URLSearchParams();
    
    if (query.limit) searchParams.set('limit', query.limit.toString());
    if (query.event_type) searchParams.set('event_type', query.event_type);
    if (query.level) searchParams.set('level', query.level);
    if (query.start_date) searchParams.set('start_date', query.start_date);
    if (query.end_date) searchParams.set('end_date', query.end_date);
    if (query.page) searchParams.set('page', query.page.toString());
    
    const queryString = searchParams.toString();
    const path = queryString ? `/metrics/app-events?${queryString}` : '/metrics/app-events';
    
    return await apiFetch<AppEventListResponse>(path, {
      method: 'GET',
      token: accessToken
    });
  }
}

// Export singleton instance
export const metricsClient = new MetricsClient();

// Convenience functions matching your specification
export async function logAppEvent(event: AppEvent): Promise<boolean> {
  const result = await metricsClient.logAppEvent(event);
  return result.success;
}

export async function getAppEvents(filters: AppEventListQuery = {}): Promise<AppEventListResponse> {
  return await metricsClient.getAppEvents({ limit: 100, ...filters });
}

// Helper functions for common event types
export async function logUserAction(action: string, screen: string, data: any = {}) {
  return await logAppEvent({
    event_type: 'user_action',
    level: 'info',
    message: `User performed action: ${action}`,
    data: {
      action,
      screen,
      ...data,
    },
  });
}

export async function logPaymentError(paymentId: string, error: any, data: any = {}) {
  return await logAppEvent({
    event_type: 'payment_error',
    level: 'error',
    message: `Payment error: ${error.message || 'Unknown error'}`,
    data: {
      payment_id: paymentId,
      error_code: error.code || 'UNKNOWN_ERROR',
      error_details: error,
      ...data,
    },
  });
}

export async function logAppCrash(error: any, screen?: string, data: any = {}) {
  return await logAppEvent({
    event_type: 'app_crash',
    level: 'error',
    message: `App crash: ${error.message || 'Unknown crash'}`,
    data: {
      screen,
      error_code: error.code || 'CRASH',
      error_details: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...data,
    },
  });
}

export async function logPerformance(metric: string, value: number, unit: string = 'ms', data: any = {}) {
  return await logAppEvent({
    event_type: 'performance',
    level: 'info',
    message: `Performance metric: ${metric} = ${value}${unit}`,
    data: {
      metric,
      value,
      unit,
      ...data,
    },
  });
}

export async function logApiError(endpoint: string, error: any, data: any = {}) {
  return await logAppEvent({
    event_type: 'api_error',
    level: 'error',
    message: `API error on ${endpoint}: ${error.message || 'Unknown error'}`,
    data: {
      endpoint,
      error_code: error.code || 'API_ERROR',
      status_code: error.status,
      error_details: error,
      ...data,
    },
  });
}