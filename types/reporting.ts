/**
 * Reporting & Analytics Types
 * Comprehensive project reporting and data analytics
 */

// Report types
export enum ReportType {
  PROJECT_SUMMARY = 'PROJECT_SUMMARY',
  FINANCIAL = 'FINANCIAL',
  PROGRESS = 'PROGRESS',
  RESOURCE = 'RESOURCE',
  QUALITY = 'QUALITY',
  SAFETY = 'SAFETY',
  RISK = 'RISK',
  SCHEDULE = 'SCHEDULE',
  CUSTOM = 'CUSTOM',
}

// Report frequency
export enum ReportFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  ON_DEMAND = 'ON_DEMAND',
}

// Report status
export enum ReportStatus {
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  ARCHIVED = 'ARCHIVED',
  FAILED = 'FAILED',
}

// Report format
export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  WORD = 'WORD',
  HTML = 'HTML',
  JSON = 'JSON',
  CSV = 'CSV',
}

// Chart types
export enum ChartType {
  LINE = 'LINE',
  BAR = 'BAR',
  PIE = 'PIE',
  DOUGHNUT = 'DOUGHNUT',
  AREA = 'AREA',
  SCATTER = 'SCATTER',
  GAUGE = 'GAUGE',
  HEATMAP = 'HEATMAP',
  WATERFALL = 'WATERFALL',
  GANTT = 'GANTT',
}

// Metric types
export enum MetricType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  PERCENTAGE = 'PERCENTAGE',
  RATIO = 'RATIO',
  TREND = 'TREND',
  VARIANCE = 'VARIANCE',
}

// Time period
export enum TimePeriod {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  THIS_WEEK = 'THIS_WEEK',
  LAST_WEEK = 'LAST_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_QUARTER = 'THIS_QUARTER',
  LAST_QUARTER = 'LAST_QUARTER',
  THIS_YEAR = 'THIS_YEAR',
  LAST_YEAR = 'LAST_YEAR',
  CUSTOM = 'CUSTOM',
}

// Report template
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  sections: ReportSection[];
  charts: ChartConfig[];
  tables: TableConfig[];
  metrics: MetricConfig[];
  filters: FilterConfig[];
  layout: LayoutConfig;
  branding?: BrandingConfig;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  isPublic: boolean;
  tags: string[];
}

// Report section
export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  type: 'SUMMARY' | 'CHART' | 'TABLE' | 'TEXT' | 'METRIC' | 'CUSTOM';
  content?: any;
  chartId?: string;
  tableId?: string;
  metricIds?: string[];
  visible: boolean;
}

// Chart configuration
export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  dataSource: string; // API endpoint or data key
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  series: SeriesConfig[];
  colors: string[];
  legend: LegendConfig;
  tooltip: TooltipConfig;
  height?: number;
  width?: number;
}

export interface AxisConfig {
  label: string;
  field: string;
  format?: string;
  min?: number;
  max?: number;
}

export interface SeriesConfig {
  name: string;
  field: string;
  color?: string;
  type?: ChartType;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface TooltipConfig {
  show: boolean;
  format?: string;
}

// Table configuration
export interface TableConfig {
  id: string;
  title: string;
  dataSource: string;
  columns: ColumnConfig[];
  sorting: SortConfig;
  pagination: PaginationConfig;
  rowsPerPage: number;
  showFooter: boolean;
  footerAggregations?: Record<string, 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX'>;
}

export interface ColumnConfig {
  id: string;
  header: string;
  field: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: string;
  sortable: boolean;
  filterable: boolean;
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
}

// Metric configuration
export interface MetricConfig {
  id: string;
  label: string;
  field: string;
  type: MetricType;
  format?: string;
  unit?: string;
  icon?: string;
  color?: string;
  target?: number;
  threshold?: {
    good: number;
    warning: number;
    critical: number;
  };
  trend?: {
    enabled: boolean;
    period: TimePeriod;
  };
}

// Filter configuration
export interface FilterConfig {
  id: string;
  label: string;
  field: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'RANGE' | 'BOOLEAN';
  options?: { value: string; label: string }[];
  defaultValue?: any;
  required: boolean;
}

// Layout configuration
export interface LayoutConfig {
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  pageSize: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header?: HeaderFooterConfig;
  footer?: HeaderFooterConfig;
}

export interface HeaderFooterConfig {
  enabled: boolean;
  content: string;
  height: number;
  showPageNumbers: boolean;
}

// Branding configuration
export interface BrandingConfig {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  companyName?: string;
  companyAddress?: string;
}

// Report instance
export interface Report {
  id: string;
  reportNumber: string; // e.g., "RPT-2024-001"
  templateId: string;
  templateName: string;
  name: string;
  description?: string;
  type: ReportType;
  status: ReportStatus;
  projectId: string;
  projectName: string;
  period: {
    startDate: string;
    endDate: string;
    label: string; // e.g., "Q1 2024"
  };
  generatedBy: string;
  generatedByName: string;
  generatedAt: string;
  deliveredAt?: string;
  recipients: ReportRecipient[];
  formats: ReportFormat[];
  files: ReportFile[];
  data: any; // Generated report data
  filters: Record<string, any>;
  scheduleId?: string;
  error?: string;
  tags: string[];
  notes?: string;
}

// Report recipient
export interface ReportRecipient {
  id: string;
  email: string;
  name: string;
  role: string;
  deliveryMethod: 'EMAIL' | 'DASHBOARD' | 'DOWNLOAD';
  notifyOnComplete: boolean;
}

// Report file
export interface ReportFile {
  id: string;
  format: ReportFormat;
  filename: string;
  size: number; // bytes
  url: string;
  generatedAt: string;
  expiresAt?: string;
}

// Report schedule
export interface ReportSchedule {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  projectId: string;
  projectName: string;
  frequency: ReportFrequency;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm
  timezone: string;
  recipients: ReportRecipient[];
  formats: ReportFormat[];
  filters: Record<string, any>;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  projectId?: string; // null for global dashboards
  projectName?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: FilterConfig[];
  refreshInterval?: number; // seconds, 0 for manual
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  sharedWith: string[]; // user IDs
  tags: string[];
}

// Dashboard layout
export interface DashboardLayout {
  columns: number; // grid columns (e.g., 12)
  rows: number; // grid rows
  gap: number; // spacing between widgets
}

// Dashboard widget
export interface DashboardWidget {
  id: string;
  type: 'METRIC' | 'CHART' | 'TABLE' | 'TEXT' | 'IFRAME' | 'CUSTOM';
  title: string;
  position: {
    x: number; // column start
    y: number; // row start
    w: number; // width in columns
    h: number; // height in rows
  };
  config: MetricConfig | ChartConfig | TableConfig | any;
  refreshInterval?: number; // override dashboard refresh
  visible: boolean;
}

// Analytics query
export interface AnalyticsQuery {
  projectId?: string;
  metric: string;
  dimensions: string[];
  filters: QueryFilter[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  granularity: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  aggregation: MetricType;
  groupBy?: string[];
  orderBy?: {
    field: string;
    order: 'asc' | 'desc';
  }[];
  limit?: number;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'between';
  value: any;
}

// Analytics result
export interface AnalyticsResult {
  query: AnalyticsQuery;
  data: any[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    variance: number;
  };
  metadata: {
    executionTime: number; // ms
    rowCount: number;
    cached: boolean;
  };
}

// Key Performance Indicators (KPI)
export interface KPI {
  id: string;
  name: string;
  description: string;
  category: 'FINANCIAL' | 'SCHEDULE' | 'QUALITY' | 'SAFETY' | 'RESOURCE' | 'RISK' | 'CUSTOM';
  metric: MetricConfig;
  target: number;
  current: number;
  previousPeriod?: number;
  unit: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
  lastUpdated: string;
  projectId?: string;
  ownerId: string;
  ownerName: string;
}

// Export configuration
export interface ExportConfig {
  format: ReportFormat;
  includeCharts: boolean;
  includeTables: boolean;
  includeRawData: boolean;
  compression?: boolean;
  password?: string;
}

// API request/response types
export interface CreateReportParams {
  templateId: string;
  projectId: string;
  name: string;
  description?: string;
  period: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
  recipients?: ReportRecipient[];
  formats?: ReportFormat[];
  scheduleDelivery?: boolean;
  deliveryDate?: string;
}

export interface UpdateReportParams {
  id: string;
  name?: string;
  description?: string;
  status?: ReportStatus;
  recipients?: ReportRecipient[];
  formats?: ReportFormat[];
  notes?: string;
}

export interface CreateDashboardParams {
  name: string;
  description?: string;
  projectId?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters?: FilterConfig[];
  refreshInterval?: number;
  isPublic?: boolean;
  sharedWith?: string[];
}

export interface UpdateDashboardParams {
  id: string;
  name?: string;
  description?: string;
  layout?: DashboardLayout;
  widgets?: DashboardWidget[];
  filters?: FilterConfig[];
  refreshInterval?: number;
  isPublic?: boolean;
  sharedWith?: string[];
}

export interface CreateScheduleParams {
  name: string;
  templateId: string;
  projectId: string;
  frequency: ReportFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: ReportRecipient[];
  formats: ReportFormat[];
  filters?: Record<string, any>;
}

export interface UpdateScheduleParams {
  id: string;
  name?: string;
  frequency?: ReportFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  time?: string;
  recipients?: ReportRecipient[];
  formats?: ReportFormat[];
  filters?: Record<string, any>;
  isActive?: boolean;
}

export interface GetReportsParams {
  projectId?: string;
  type?: ReportType;
  status?: ReportStatus;
  templateId?: string;
  fromDate?: string;
  toDate?: string;
  generatedBy?: string;
}

export interface GetDashboardsParams {
  projectId?: string;
  isPublic?: boolean;
  createdBy?: string;
}

export interface RunAnalyticsParams {
  query: AnalyticsQuery;
  cache?: boolean;
  cacheTTL?: number; // seconds
}
