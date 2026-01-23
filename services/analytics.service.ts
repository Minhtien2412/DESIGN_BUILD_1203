/**
 * Analytics Service
 * Frontend service for analytics API endpoints
 * - Dashboard metrics
 * - Event tracking
 * - Period comparison
 * - User flow analytics
 * - Export and report templates
 */

import { get, post } from "./api";

// ============ TYPES ============

export enum EventType {
  PAGE_VIEW = "PAGE_VIEW",
  USER_ACTION = "USER_ACTION",
  ERROR = "ERROR",
  PERFORMANCE = "PERFORMANCE",
  CUSTOM = "CUSTOM",
}

export enum ReportFormat {
  PDF = "PDF",
  EXCEL = "EXCEL",
  CSV = "CSV",
  JSON = "JSON",
}

export interface AnalyticsEvent {
  id: string;
  eventType: EventType;
  eventName: string;
  userId?: string;
  sessionId?: string;
  page?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface DashboardMetrics {
  totalEvents: number;
  uniqueUsers: number;
  activeSessions: number;
  topPages: { page: string; views: number }[];
  eventsByType: { type: EventType; count: number }[];
  dailyTrend: { date: string; events: number }[];
  recentEvents: AnalyticsEvent[];
}

export interface PeriodComparison {
  period1: { start: string; end: string; metrics: Record<string, number> };
  period2: { start: string; end: string; metrics: Record<string, number> };
  changes: { metric: string; value: number; percentChange: number }[];
}

export interface UserFlowData {
  startPage: string;
  nodes: { page: string; visits: number }[];
  edges: { from: string; to: string; count: number }[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  metrics: string[];
  filters?: Record<string, any>;
  format: ReportFormat;
  createdAt: string;
}

// ============ DTOs ============

export interface TrackEventDto {
  eventType: EventType;
  eventName: string;
  page?: string;
  metadata?: Record<string, any>;
}

export interface QueryAnalyticsDto {
  startDate?: string;
  endDate?: string;
  eventType?: EventType;
  eventName?: string;
  userId?: string;
  page?: string;
  limit?: number;
  offset?: number;
}

export interface ComparePeriodsDto {
  period1Start: string;
  period1End: string;
  period2Start: string;
  period2End: string;
  metrics: string[];
}

export interface ExportAnalyticsDto {
  startDate: string;
  endDate: string;
  format: ReportFormat;
  metrics?: string[];
  filters?: Record<string, any>;
}

export interface CreateReportTemplateDto {
  name: string;
  description?: string;
  metrics: string[];
  filters?: Record<string, any>;
  format: ReportFormat;
}

// ============ API FUNCTIONS ============

const BASE_PATH = "/analytics";

/**
 * Get dashboard metrics
 */
export async function getDashboard(
  startDate?: string,
  endDate?: string
): Promise<DashboardMetrics> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/dashboard?${queryString}`
    : `${BASE_PATH}/dashboard`;

  return get<DashboardMetrics>(url);
}

/**
 * Track an analytics event
 */
export async function trackEvent(dto: TrackEventDto): Promise<AnalyticsEvent> {
  return post<AnalyticsEvent>(`${BASE_PATH}/events/track`, dto);
}

/**
 * Get analytics events with filtering
 */
export async function getEvents(query: QueryAnalyticsDto = {}): Promise<{
  events: AnalyticsEvent[];
  total: number;
  hasMore: boolean;
}> {
  const params = new URLSearchParams();
  if (query.startDate) params.append("startDate", query.startDate);
  if (query.endDate) params.append("endDate", query.endDate);
  if (query.eventType) params.append("eventType", query.eventType);
  if (query.eventName) params.append("eventName", query.eventName);
  if (query.userId) params.append("userId", query.userId);
  if (query.page) params.append("page", query.page);
  if (query.limit) params.append("limit", String(query.limit));
  if (query.offset) params.append("offset", String(query.offset));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/events?${queryString}`
    : `${BASE_PATH}/events`;

  return get(url);
}

/**
 * Compare metrics between two periods
 */
export async function comparePeriods(
  dto: ComparePeriodsDto
): Promise<PeriodComparison> {
  return post<PeriodComparison>(`${BASE_PATH}/compare`, dto);
}

/**
 * Get user flow analytics
 */
export async function getUserFlow(startPage?: string): Promise<UserFlowData> {
  const params = new URLSearchParams();
  if (startPage) params.append("startPage", startPage);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/user-flow?${queryString}`
    : `${BASE_PATH}/user-flow`;

  return get<UserFlowData>(url);
}

/**
 * Export analytics data
 */
export async function exportAnalytics(dto: ExportAnalyticsDto): Promise<{
  downloadUrl: string;
  format: ReportFormat;
  size: number;
  expiresAt: string;
}> {
  return post(`${BASE_PATH}/export`, dto);
}

/**
 * Get report templates
 */
export async function getTemplates(): Promise<ReportTemplate[]> {
  return get<ReportTemplate[]>(`${BASE_PATH}/templates`);
}

/**
 * Create a report template
 */
export async function createTemplate(
  dto: CreateReportTemplateDto
): Promise<ReportTemplate> {
  return post<ReportTemplate>(`${BASE_PATH}/templates`, dto);
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{
  status: string;
  service: string;
  timestamp: string;
}> {
  return get(`${BASE_PATH}/health`);
}

// ============ CONVENIENCE FUNCTIONS ============

/**
 * Track page view event
 */
export async function trackPageView(
  page: string,
  metadata?: Record<string, any>
) {
  return trackEvent({
    eventType: EventType.PAGE_VIEW,
    eventName: "page_view",
    page,
    metadata,
  });
}

/**
 * Track user action event
 */
export async function trackUserAction(
  actionName: string,
  page?: string,
  metadata?: Record<string, any>
) {
  return trackEvent({
    eventType: EventType.USER_ACTION,
    eventName: actionName,
    page,
    metadata,
  });
}

/**
 * Track error event
 */
export async function trackError(
  errorName: string,
  page?: string,
  metadata?: Record<string, any>
) {
  return trackEvent({
    eventType: EventType.ERROR,
    eventName: errorName,
    page,
    metadata,
  });
}

/**
 * Track performance event
 */
export async function trackPerformance(
  metricName: string,
  value: number,
  metadata?: Record<string, any>
) {
  return trackEvent({
    eventType: EventType.PERFORMANCE,
    eventName: metricName,
    metadata: { value, ...metadata },
  });
}

export default {
  getDashboard,
  trackEvent,
  getEvents,
  comparePeriods,
  getUserFlow,
  exportAnalytics,
  getTemplates,
  createTemplate,
  healthCheck,
  trackPageView,
  trackUserAction,
  trackError,
  trackPerformance,
};
