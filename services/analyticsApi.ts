/**
 * Analytics & Reporting API Service
 * Generate reports and export data
 */

import { apiFetch } from './api';

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  overview: {
    progress: number;
    budgetUtilization: number;
    timelineStatus: 'on-track' | 'ahead' | 'delayed';
    tasksCompleted: number;
    tasksTotal: number;
    teamSize: number;
  };
  budget: {
    totalBudget: number;
    spent: number;
    remaining: number;
    byCategory: {
      category: string;
      allocated: number;
      spent: number;
      percentage: number;
    }[];
  };
  timeline: {
    plannedDuration: number;
    actualDuration: number;
    daysRemaining: number;
    milestones: {
      name: string;
      plannedDate: string;
      actualDate?: string;
      status: 'completed' | 'in-progress' | 'pending' | 'delayed';
    }[];
  };
  resources: {
    equipment: number;
    materials: number;
    workforce: number;
    utilization: number;
  };
  quality: {
    inspectionsCompleted: number;
    inspectionsPassed: number;
    passRate: number;
    defectsFound: number;
    defectsResolved: number;
  };
  safety: {
    incidentsReported: number;
    incidentsResolved: number;
    safetyScore: number;
    daysWithoutIncident: number;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'financial' | 'resource' | 'quality' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  sections: string[];
  isDefault: boolean;
}

export interface ExportRequest {
  reportType: string;
  format: 'pdf' | 'excel' | 'csv';
  filters: Record<string, any>;
  options?: {
    includeCharts?: boolean;
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'a4' | 'letter';
  };
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageProgress: number;
  onTimeProjects: number;
  delayedProjects: number;
  recentActivity: {
    type: string;
    message: string;
    timestamp: string;
    projectId: string;
    projectName: string;
  }[];
  upcomingTasks: {
    id: string;
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    projectId: string;
    projectName: string;
  }[];
}

export interface PerformanceMetrics {
  period: {
    startDate: string;
    endDate: string;
  };
  productivity: {
    tasksCompletedPerDay: number;
    averageTaskDuration: number;
    teamEfficiency: number;
  };
  costs: {
    averageCostPerProject: number;
    costOverruns: number;
    costSavings: number;
  };
  quality: {
    defectRate: number;
    reworkRate: number;
    customerSatisfaction: number;
  };
  timeline: {
    onTimeCompletionRate: number;
    averageDelay: number;
    scheduleVariance: number;
  };
}

class AnalyticsService {
  /**
   * Get project analytics
   */
  async getProjectAnalytics(
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ProjectAnalytics> {
    try {
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const response = await apiFetch(
        `/analytics/projects/${projectId}?${params}`
      );
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load analytics: ${error.message}`);
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiFetch('/analytics/dashboard');
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load dashboard metrics: ${error.message}`);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    startDate: string,
    endDate: string
  ): Promise<PerformanceMetrics> {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await apiFetch(`/analytics/performance?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load performance metrics: ${error.message}`);
    }
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      const response = await apiFetch('/analytics/templates');
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load templates: ${error.message}`);
    }
  }

  /**
   * Export report
   */
  async exportReport(request: ExportRequest): Promise<{ url: string; filename: string }> {
    try {
      const response = await apiFetch('/analytics/export', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to export report: ${error.message}`);
    }
  }

  /**
   * Export project report
   */
  async exportProjectReport(
    projectId: string,
    format: 'pdf' | 'excel' | 'csv',
    options?: {
      startDate?: string;
      endDate?: string;
      includeCharts?: boolean;
    }
  ): Promise<{ url: string; filename: string }> {
    try {
      const response = await apiFetch(`/analytics/projects/${projectId}/export`, {
        method: 'POST',
        body: JSON.stringify({ format, ...options }),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to export project report: ${error.message}`);
    }
  }

  /**
   * Get cost breakdown
   */
  async getCostBreakdown(
    projectId: string,
    period?: { startDate: string; endDate: string }
  ): Promise<{
    total: number;
    categories: {
      name: string;
      amount: number;
      percentage: number;
      trend: number;
    }[];
    overtime: {
      date: string;
      amount: number;
      cumulative: number;
    }[];
  }> {
    try {
      const params = new URLSearchParams(period as any);
      const response = await apiFetch(
        `/analytics/projects/${projectId}/costs?${params}`
      );
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load cost breakdown: ${error.message}`);
    }
  }

  /**
   * Get resource utilization
   */
  async getResourceUtilization(
    projectId?: string,
    period?: { startDate: string; endDate: string }
  ): Promise<{
    equipment: {
      id: string;
      name: string;
      utilizationRate: number;
      hoursUsed: number;
      hoursAvailable: number;
    }[];
    workforce: {
      id: string;
      name: string;
      role: string;
      hoursWorked: number;
      efficiency: number;
    }[];
    materials: {
      id: string;
      name: string;
      quantityUsed: number;
      quantityPlanned: number;
      wastePercentage: number;
    }[];
  }> {
    try {
      const params = new URLSearchParams({
        ...(projectId && { projectId }),
        ...(period as any),
      });
      const response = await apiFetch(`/analytics/resources?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load resource utilization: ${error.message}`);
    }
  }

  /**
   * Get comparative analysis (compare multiple projects)
   */
  async getComparativeAnalysis(
    projectIds: string[],
    metrics: string[]
  ): Promise<{
    projects: {
      projectId: string;
      projectName: string;
      metrics: Record<string, number>;
    }[];
  }> {
    try {
      const response = await apiFetch('/analytics/compare', {
        method: 'POST',
        body: JSON.stringify({ projectIds, metrics }),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load comparative analysis: ${error.message}`);
    }
  }
}

export const analyticsService = new AnalyticsService();
