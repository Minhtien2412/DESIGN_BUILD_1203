/**
 * AI Assistant Service
 * API calls for GPT-4 Vision construction analysis
 */

import type {
    AIChatRequest,
    AIChatResponse,
    AIReport,
    AIReportsListResponse,
    AnalyzeDrawingRequest,
    AnalyzeProgressRequest,
    ChatHistoryResponse,
    CheckQualityRequest,
    DetectErrorsRequest,
    DrawingAnalysisResult,
    ErrorDetectionResult,
    EstimateMaterialsRequest,
    GenerateReportRequest,
    MaterialEstimation,
    ProgressAnalysisResult,
    QualityCheckResult,
} from '@/types/ai';
import { ApiError, apiFetch } from './api';

// ==================== Progress Analysis ====================

/**
 * Analyze construction progress from photos using GPT-4 Vision
 * POST /ai/analyze-progress
 */
export async function analyzeProgress(
  request: AnalyzeProgressRequest
): Promise<ProgressAnalysisResult> {
  try {
    const response = await apiFetch<ProgressAnalysisResult>('/ai/analyze-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'Không thể phân tích tiến độ công trình');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

// ==================== Report Generation ====================

/**
 * Generate AI report for project
 * POST /ai/generate-report
 */
export async function generateReport(
  request: GenerateReportRequest
): Promise<AIReport> {
  try {
    const response = await apiFetch<AIReport>('/ai/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'Không thể tạo báo cáo AI');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

// ==================== Chat Assistant ====================

/**
 * Chat with AI assistant
 * POST /ai/chat
 */
export async function chatWithAI(
  request: AIChatRequest
): Promise<AIChatResponse> {
  try {
    const response = await apiFetch<AIChatResponse>('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'AI không phản hồi. Vui lòng thử lại.');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

/**
 * Get chat history for a project
 * GET /ai/chat/:projectId/history
 */
export async function getChatHistory(
  projectId: string,
  conversationId?: string
): Promise<ChatHistoryResponse> {
  try {
    const url = conversationId
      ? `/ai/chat/${projectId}/history?conversationId=${conversationId}`
      : `/ai/chat/${projectId}/history`;
    
    const response = await apiFetch<ChatHistoryResponse>(url, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'Không thể tải lịch sử chat');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

// ==================== Error Detection ====================

/**
 * Detect construction errors using AI
 * POST /ai/detect-errors
 */
export async function detectErrors(
  request: DetectErrorsRequest
): Promise<ErrorDetectionResult> {
  try {
    const response = await apiFetch<ErrorDetectionResult>('/ai/detect-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'Không thể phát hiện lỗi thi công');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

// ==================== Material Estimation ====================

/**
 * Estimate material quantities using AI
 * POST /ai/estimate-materials
 */
export async function estimateMaterials(
  request: EstimateMaterialsRequest
): Promise<MaterialEstimation> {
  try {
    const response = await apiFetch<MaterialEstimation>('/ai/estimate-materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'Không thể ước tính vật liệu');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

// ==================== Quality Check ====================

/**
 * Check construction quality using AI
 * POST /ai/check-quality
 */
export async function checkQuality(
  request: CheckQualityRequest
): Promise<QualityCheckResult> {
  try {
    const response = await apiFetch<QualityCheckResult>('/ai/check-quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'Không thể kiểm tra chất lượng');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

// ==================== Drawing Analysis ====================

/**
 * Analyze construction drawing using AI
 * POST /ai/analyze-drawing
 */
export async function analyzeDrawing(
  request: AnalyzeDrawingRequest
): Promise<DrawingAnalysisResult> {
  try {
    const response = await apiFetch<DrawingAnalysisResult>('/ai/analyze-drawing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'Không thể phân tích bản vẽ');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

// ==================== Reports Management ====================

/**
 * Get AI reports for a project
 * GET /ai/reports/:projectId
 */
export async function getProjectReports(
  projectId: string,
  params?: {
    page?: number;
    limit?: number;
    reportType?: string;
  }
): Promise<AIReportsListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.reportType) queryParams.append('reportType', params.reportType);

    const url = `/ai/reports/${projectId}${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await apiFetch<AIReportsListResponse>(url, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || 'Không thể tải danh sách báo cáo');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

/**
 * Get a specific AI report by ID
 * GET /ai/reports/:id
 */
export async function getReportById(reportId: string): Promise<AIReport> {
  try {
    const response = await apiFetch<AIReport>(`/ai/reports/${reportId}`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Báo cáo không tồn tại');
      }
      throw new Error(error.message || 'Không thể tải báo cáo');
    }
    throw new Error('Lỗi kết nối. Vui lòng thử lại.');
  }
}

// ==================== Helper Functions ====================

/**
 * Upload images for AI analysis
 * (This would typically use a separate upload service)
 */
export async function uploadImagesForAnalysis(
  projectId: string,
  images: File[] | string[]
): Promise<string[]> {
  // TODO: Integrate with file upload service
  // For now, assume images are already uploaded and return URLs
  if (typeof images[0] === 'string') {
    return images as string[];
  }
  
  // In production, upload files and return URLs
  throw new Error('Image upload not implemented. Use file upload service.');
}

/**
 * Format AI response for display
 */
export function formatAIResponse(content: string): string {
  // Add formatting, markdown parsing, etc.
  return content.trim();
}

/**
 * Calculate confidence level color
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return '#22c55e'; // green
  if (confidence >= 60) return '#eab308'; // yellow
  if (confidence >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
    INFO: '#3b82f6',
  };
  return colors[severity] || '#6b7280';
}
