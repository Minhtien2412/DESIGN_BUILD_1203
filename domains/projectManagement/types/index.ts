/**
 * Project Management Domain - Types
 * Domain-specific type extensions và utilities
 */

export * from '../../../types/projectProgress';

// Domain-specific extensions
export interface ProjectHealthMetrics {
  overallScore: number; // 0-10
  scheduleScore: number;
  budgetScore: number;
  qualityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface TaskRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
}

export interface PaymentAnalytics {
  paymentProgress: number;
  overdueAmount: number;
  pendingAmount: number;
  cashFlow: {
    next30Days: number;
    next90Days: number;
    total: number;
  };
  paymentVelocity: {
    averageDays: number;
    efficiency: 'excellent' | 'good' | 'average' | 'poor';
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskScore: number;
    risks: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
  };
}

export interface ProjectAlert {
  type: 'delay' | 'budget' | 'quality' | 'payment';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  recommendation?: string;
  taskId?: string;
  paymentId?: string;
  createdAt: string;
}

export interface ProjectRecommendation {
  category: 'critical' | 'improvement' | 'optimization';
  title: string;
  description: string;
  actions: string[];
  priority?: 'low' | 'medium' | 'high';
}

// UI State types
export interface DashboardViewState {
  selectedTimeRange: 'week' | 'month' | 'quarter' | 'year';
  selectedMetrics: string[];
  showDetails: boolean;
  filterOptions: {
    status?: string[];
    category?: string[];
    priority?: string[];
  };
}

export interface TaskViewState {
  currentView: 'list' | 'grid' | 'timeline';
  groupBy: 'status' | 'category' | 'assignee' | 'priority';
  sortBy: 'dueDate' | 'priority' | 'status' | 'name';
  sortOrder: 'asc' | 'desc';
  filters: {
    status?: string[];
    category?: string[];
    assignee?: string;
    overdue?: boolean;
  };
}

export interface PaymentViewState {
  currentView: 'summary' | 'schedule' | 'analytics';
  timeRange: 'month' | 'quarter' | 'year';
  filters: {
    status?: string[];
    category?: string[];
    amount?: { min?: number; max?: number };
  };
}