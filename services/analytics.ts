/**
 * Analytics Service - Theo dõi hành vi người dùng
 * Sử dụng event-emitter từ NestJS để track events
 */

import { apiFetch } from './api';

export type EventCategory = 
  | 'user_action' 
  | 'navigation' 
  | 'feature_usage' 
  | 'error' 
  | 'performance'
  | 'business';

export interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsData {
  totalEvents: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  topFeatures: Array<{ feature: string; usageCount: number }>;
  userRetention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  errorRate: number;
}

/**
 * Track một event
 */
export async function trackEvent(event: AnalyticsEvent): Promise<boolean> {
  try {
    await apiFetch('/analytics/events', {
      method: 'POST',
      body: JSON.stringify({
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      }),
    });
    
    // Log locally
    console.log('📊 Analytics:', event.category, '→', event.action);
    return true;
  } catch (error) {
    console.error('[Analytics] Track event failed:', error);
    return false;
  }
}

/**
 * Track screen view
 */
export async function trackScreenView(
  screenName: string,
  previousScreen?: string
): Promise<void> {
  await trackEvent({
    category: 'navigation',
    action: 'screen_view',
    label: screenName,
    metadata: {
      path: screenName,
      previous_path: previousScreen,
      screen_name: screenName,
    },
  });
}

/**
 * Track button click
 */
export async function trackButtonClick(
  buttonName: string,
  screen: string
): Promise<void> {
  await trackEvent({
    category: 'user_action',
    action: 'button_click',
    label: buttonName,
    metadata: { screen },
  });
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  featureName: string,
  additionalData?: Record<string, any>
): Promise<void> {
  await trackEvent({
    category: 'feature_usage',
    action: 'feature_used',
    label: featureName,
    metadata: additionalData,
  });
}

/**
 * Track error
 */
export async function trackError(
  errorMessage: string,
  errorStack?: string,
  severity: 'low' | 'medium' | 'high' = 'medium'
): Promise<void> {
  await trackEvent({
    category: 'error',
    action: 'error_occurred',
    label: errorMessage,
    metadata: {
      stack: errorStack,
      severity,
    },
  });
}

/**
 * Track performance metric
 */
export async function trackPerformance(
  metricName: string,
  value: number,
  unit: string = 'ms'
): Promise<void> {
  await trackEvent({
    category: 'performance',
    action: 'metric_recorded',
    label: metricName,
    value,
    metadata: { unit },
  });
}

/**
 * Track business event (conversion, purchase, etc)
 */
export async function trackBusinessEvent(
  eventName: string,
  revenue?: number,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    category: 'business',
    action: eventName,
    value: revenue,
    metadata,
  });
}

/**
 * Lấy analytics summary
 */
export async function getAnalyticsSummary(
  dateRange?: { from: string; to: string }
): Promise<AnalyticsData | null> {
  try {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    const response = await apiFetch(`/analytics/summary?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('[Analytics] Get summary failed:', error);
    return null;
  }
}

/**
 * Lấy user behavior flow
 */
export async function getUserFlow(
  userId?: string
): Promise<Array<{ step: string; count: number }>> {
  try {
    const url = userId 
      ? `/analytics/user-flow?userId=${userId}`
      : '/analytics/user-flow';
    
    const response = await apiFetch(url);
    return response.data;
  } catch (error) {
    console.error('[Analytics] Get user flow failed:', error);
    return [];
  }
}

/**
 * Lấy top features được sử dụng
 */
export async function getTopFeatures(
  limit: number = 10
): Promise<Array<{ feature: string; count: number }>> {
  try {
    const response = await apiFetch(`/analytics/top-features?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('[Analytics] Get top features failed:', error);
    return [];
  }
}

/**
 * Lấy error statistics
 */
export async function getErrorStats(
  dateRange?: { from: string; to: string }
): Promise<{
  totalErrors: number;
  errorsByType: Array<{ type: string; count: number }>;
  errorRate: number;
}> {
  try {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    const response = await apiFetch(`/analytics/errors?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('[Analytics] Get error stats failed:', error);
    return {
      totalErrors: 0,
      errorsByType: [],
      errorRate: 0,
    };
  }
}

/**
 * Export analytics report
 */
export async function exportAnalyticsReport(
  format: 'pdf' | 'excel' | 'csv',
  dateRange?: { from: string; to: string }
): Promise<{ url: string } | null> {
  try {
    const response = await apiFetch('/analytics/export', {
      method: 'POST',
      body: JSON.stringify({
        format,
        dateRange,
      }),
    });
    
    return { url: response.data.downloadUrl };
  } catch (error) {
    console.error('[Analytics] Export report failed:', error);
    return null;
  }
}

/**
 * Timer utility để track thời gian thực hiện
 */
export class AnalyticsTimer {
  private startTime: number;
  private eventName: string;

  constructor(eventName: string) {
    this.eventName = eventName;
    this.startTime = Date.now();
  }

  end(metadata?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;
    trackPerformance(this.eventName, duration, 'ms');
    
    if (metadata) {
      trackEvent({
        category: 'performance',
        action: 'timing_complete',
        label: this.eventName,
        value: duration,
        metadata,
      });
    }
  }
}

/**
 * Helper: Track với timer
 */
export function startTimer(eventName: string): AnalyticsTimer {
  return new AnalyticsTimer(eventName);
}

export default {
  trackEvent,
  trackScreenView,
  trackButtonClick,
  trackFeatureUsage,
  trackError,
  trackPerformance,
  trackBusinessEvent,
  getAnalyticsSummary,
  getUserFlow,
  getTopFeatures,
  getErrorStats,
  exportAnalyticsReport,
  startTimer,
};
