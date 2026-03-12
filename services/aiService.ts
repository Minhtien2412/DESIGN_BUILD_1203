import { apiFetch } from './api';

export interface AIAnalysisRequest {
  projectId: number;
  description: string;
  imageUrls?: string[];
  phaseId?: number;
}

export interface AIAnalysisResponse {
  id: number;
  projectId: number;
  analysisType: string;
  description: string;
  findings: string;
  recommendations: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  imageUrls: string[];
  createdAt: string;
}

export interface AIReportRequest {
  projectId: number;
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate?: string;
  endDate?: string;
  includeImages?: boolean; // FE extended field
}

export interface AIReportResponse {
  id: number;
  projectId: number;
  reportType: string;
  content: string;
  summary: string;
  recommendations: string[];
  highlights?: string[];   // FE extended field
  issues?: string[];       // FE extended field
  nextSteps?: string[];    // FE extended field
  progress?: number;       // FE extended field (0-100)
  createdAt: string;
}

export interface ProgressAnalysisRequest {
  projectId: number;
  phaseId?: number;
  imageUrls: string[];
  description?: string;
}

export interface ProgressAnalysisResponse {
  id: number;
  projectId: number;
  phaseId?: number;
  completionPercentage: number;
  quality: string;
  issues: string[];
  recommendations: string[];
  estimatedDaysToComplete: number;
  imageUrls: string[];
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  projectId: number;
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  suggestions?: string[];
  relatedTopics?: string[];
}

export interface MaterialCheckRequest {
  projectId: number;
  imageUrl: string;
  materialType?: string;
  description?: string;
}

export interface MaterialCheckResponse {
  id: number;
  projectId: number;
  materialType: string;
  quality: string;
  issues: string[];
  recommendations: string[];
  isCompliant: boolean;
  imageUrl: string;
  createdAt: string;
}

class AIService {
  /**
   * Phân tích công trình bằng AI (với/không hình ảnh)
   */
  async analyzeConstructionSite(data: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    return apiFetch('/api/v1/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Tạo báo cáo tiến độ tự động
   */
  async generateProgressReport(data: AIReportRequest): Promise<AIReportResponse> {
    return apiFetch('/api/v1/ai/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Giám sát công trình real-time với hình ảnh
   */
  async monitorProject(projectId: number, imageUrl: string): Promise<any> {
    return apiFetch(`/api/v1/ai/monitor/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
    });
  }

  /**
   * Lấy lịch sử phân tích AI
   */
  async getAnalysisHistory(projectId?: number): Promise<AIAnalysisResponse[]> {
    const params = projectId ? `?projectId=${projectId}` : '';
    return apiFetch(`/api/v1/ai/analyses${params}`);
  }

  /**
   * Lấy danh sách báo cáo AI
   */
  async getReports(projectId?: number): Promise<AIReportResponse[]> {
    const params = projectId ? `?projectId=${projectId}` : '';
    return apiFetch(`/api/v1/ai/reports${params}`);
  }

  /**
   * Xóa phân tích AI
   */
  async deleteAnalysis(id: number): Promise<{ message: string }> {
    return apiFetch(`/api/v1/ai/analyses/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // AI CONSTRUCTION ASSISTANT
  // ========================================

  /**
   * Phân tích tiến độ từ hình ảnh công trường
   */
  async analyzeProgress(data: ProgressAnalysisRequest): Promise<ProgressAnalysisResponse> {
    return apiFetch('/api/v1/ai/progress/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Lấy danh sách phân tích tiến độ
   */
  async getProgressAnalyses(projectId: number, phaseId?: number): Promise<ProgressAnalysisResponse[]> {
    const params = phaseId ? `?phaseId=${phaseId}` : '';
    return apiFetch(`/api/v1/ai/progress/${projectId}${params}`);
  }

  /**
   * Tạo báo cáo ngày tự động
   */
  async generateDailyReport(projectId: number, date: string): Promise<any> {
    return apiFetch('/api/v1/ai/reports/daily', {
      method: 'POST',
      body: JSON.stringify({ projectId, date }),
    });
  }

  /**
   * Lấy danh sách báo cáo ngày
   */
  async getDailyReports(
    projectId: number,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return apiFetch(`/api/v1/ai/reports/daily/${projectId}${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Tạo báo cáo tuần tự động
   */
  async generateWeeklyReport(projectId: number, weekNumber: number, year: number): Promise<any> {
    return apiFetch('/api/v1/ai/reports/weekly', {
      method: 'POST',
      body: JSON.stringify({ projectId, weekNumber, year }),
    });
  }

  /**
   * Lấy danh sách báo cáo tuần
   */
  async getWeeklyReports(projectId: number, year?: number): Promise<any[]> {
    const params = year ? `?year=${year}` : '';
    return apiFetch(`/api/v1/ai/reports/weekly/${projectId}${params}`);
  }

  /**
   * Chat với AI Construction Assistant
   */
  async chatWithAI(data: ChatRequest): Promise<ChatResponse> {
    return apiFetch('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Lấy lịch sử chat với AI
   */
  async getChatHistory(projectId: number, limit: number = 50): Promise<ChatMessage[]> {
    return apiFetch(`/api/v1/ai/chat/${projectId}/history?limit=${limit}`);
  }

  /**
   * Kiểm tra vật liệu xây dựng bằng AI
   */
  async checkMaterials(data: MaterialCheckRequest): Promise<MaterialCheckResponse> {
    return apiFetch('/api/v1/ai/materials/check', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Lấy danh sách báo cáo kiểm tra vật liệu
   */
  async getMaterialReports(projectId: number): Promise<MaterialCheckResponse[]> {
    return apiFetch(`/api/v1/ai/materials/${projectId}`);
  }
}

export const aiService = new AIService();

// Alias for backward compatibility
export type ProgressReportResponse = AIReportResponse;
