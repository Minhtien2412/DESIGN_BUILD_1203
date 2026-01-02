/**
 * AI Agent Service
 * AI-powered construction analysis, reports, and monitoring
 */

import { apiClient } from './client';

// ==================== TYPES ====================

export interface CreateAIAnalysisDto {
  projectId: number;
  images?: string[];
  prompt?: string;
  analysisType: 'STRUCTURE' | 'PROGRESS' | 'SAFETY' | 'QUALITY' | 'GENERAL';
}

export interface AIAnalysisResponse {
  id: number;
  projectId: number;
  analysisType: string;
  prompt?: string;
  result: {
    summary: string;
    details: string;
    recommendations?: string[];
    risks?: {
      level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
    }[];
    score?: number;
  };
  images?: string[];
  createdBy: number;
  createdAt: string;
}

export interface CreateAIReportDto {
  projectId: number;
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PROGRESS';
  startDate?: string;
  endDate?: string;
  includeImages?: boolean;
}

export interface AIReportResponse {
  id: number;
  projectId: number;
  reportType: string;
  content: {
    title: string;
    summary: string;
    sections: {
      title: string;
      content: string;
      images?: string[];
    }[];
    statistics?: Record<string, any>;
  };
  createdBy: number;
  createdAt: string;
}

export interface AIMonitoringResultDto {
  projectId: number;
  images: string[];
  checkTypes: ('PROGRESS' | 'SAFETY' | 'QUALITY')[];
}

export interface MonitoringResult {
  projectId: number;
  timestamp: string;
  results: {
    type: string;
    status: 'PASS' | 'WARNING' | 'FAIL';
    findings: string[];
    images: string[];
    score: number;
  }[];
}

export interface AnalyzeProgressDto {
  projectId: number;
  images: string[];
  expectedProgress?: number;
}

export interface ProgressAnalysis {
  projectId: number;
  estimatedProgress: number;
  confidence: number;
  detectedActivities: string[];
  comparison?: {
    expected: number;
    actual: number;
    variance: number;
    status: 'ON_TRACK' | 'AHEAD' | 'DELAYED';
  };
  images: string[];
  analyzedAt: string;
}

export interface ChatWithAIDto {
  projectId?: number;
  message: string;
  context?: 'GENERAL' | 'PROJECT' | 'TECHNICAL';
  images?: string[];
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  relatedDocuments?: string[];
}

// ==================== SERVICE ====================

export const aiService = {
  /**
   * Analyze construction site with AI (with/without images)
   */
  async analyzeConstruction(data: CreateAIAnalysisDto): Promise<AIAnalysisResponse> {
    return apiClient.post<AIAnalysisResponse>('/ai/analyze', data);
  },

  /**
   * Generate automated progress report with AI
   */
  async generateReport(data: CreateAIReportDto): Promise<AIReportResponse> {
    return apiClient.post<AIReportResponse>('/ai/report', data);
  },

  /**
   * Monitor construction site real-time with images
   */
  async monitorSite(
    projectId: number,
    data: AIMonitoringResultDto
  ): Promise<MonitoringResult> {
    return apiClient.post<MonitoringResult>(`/ai/monitor/${projectId}`, data);
  },

  /**
   * Get AI analysis history
   */
  async getAnalyses(params?: {
    projectId?: number;
    analysisType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AIAnalysisResponse[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.projectId) queryParams.projectId = String(params.projectId);
    if (params?.analysisType) queryParams.analysisType = params.analysisType;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    return apiClient.get<{ data: AIAnalysisResponse[]; total: number }>('/ai/analyses', queryParams);
  },

  /**
   * Get AI reports list
   */
  async getReports(params?: {
    projectId?: number;
    reportType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AIReportResponse[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.projectId) queryParams.projectId = String(params.projectId);
    if (params?.reportType) queryParams.reportType = params.reportType;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    return apiClient.get<{ data: AIReportResponse[]; total: number }>('/ai/reports', queryParams);
  },

  /**
   * Delete AI analysis
   */
  async deleteAnalysis(id: number): Promise<void> {
    return apiClient.delete(`/ai/analyses/${id}`);
  },

  /**
   * AI: Analyze progress from site images
   */
  async analyzeProgress(data: AnalyzeProgressDto): Promise<ProgressAnalysis> {
    return apiClient.post<ProgressAnalysis>('/ai/progress/analyze', data);
  },

  /**
   * Get progress analysis list
   */
  async getProgressAnalyses(projectId: number): Promise<ProgressAnalysis[]> {
    return apiClient.get<ProgressAnalysis[]>(`/ai/progress/${projectId}`);
  },

  /**
   * Generate daily report automatically
   */
  async generateDailyReport(projectId: number, date?: string): Promise<AIReportResponse> {
    return apiClient.post<AIReportResponse>('/ai/report/daily', { projectId, date });
  },

  /**
   * Generate weekly report
   */
  async generateWeeklyReport(
    projectId: number,
    startDate: string,
    endDate: string
  ): Promise<AIReportResponse> {
    return apiClient.post<AIReportResponse>('/ai/report/weekly', { projectId, startDate, endDate });
  },

  /**
   * Chat with AI assistant
   */
  async chatWithAI(data: ChatWithAIDto): Promise<AIResponse> {
    return apiClient.post<AIResponse>('/ai/chat', data);
  },

  /**
   * Check materials compliance
   */
  async checkMaterials(data: {
    projectId: number;
    materials: { name: string; quantity: number; unit: string }[];
  }): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    return apiClient.post<{
      compliant: boolean;
      issues: string[];
      recommendations: string[];
    }>('/ai/materials/check', data);
  },
};

export default aiService;
