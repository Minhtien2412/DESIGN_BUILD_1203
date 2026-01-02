/**
 * Custom Hooks for AI Assistant
 * State management for AI analysis features
 */

import * as aiService from '@/services/ai';
import type {
    AIChatMessage,
    AIChatRequest,
    AIChatResponse,
    AIReport,
    AnalyzeDrawingRequest,
    AnalyzeProgressRequest,
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
import { useCallback, useState } from 'react';

// ==================== Progress Analysis Hook ====================

export interface UseProgressAnalysisState {
  result: ProgressAnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export interface UseProgressAnalysisActions {
  analyze: (projectId: string, imageUrls: string[], context?: string) => Promise<boolean>;
  reset: () => void;
}

export function useProgressAnalysis(): UseProgressAnalysisState & UseProgressAnalysisActions {
  const [result, setResult] = useState<ProgressAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (
    projectId: string,
    imageUrls: string[],
    context?: string
  ): Promise<boolean> => {
    if (!projectId || imageUrls.length === 0) {
      setError('Vui lòng cung cấp ảnh để phân tích');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const request: AnalyzeProgressRequest = {
        projectId,
        imageUrls,
        context,
      };

      const analysisResult = await aiService.analyzeProgress(request);
      setResult(analysisResult);
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi phân tích tiến độ');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    result,
    loading,
    error,
    analyze,
    reset,
  };
}

// ==================== AI Chat Hook ====================

export interface UseAIChatState {
  messages: AIChatMessage[];
  loading: boolean;
  error: string | null;
  conversationId: string | null;
}

export interface UseAIChatActions {
  sendMessage: (message: string, imageUrls?: string[]) => Promise<boolean>;
  loadHistory: (projectId: string, conversationId?: string) => Promise<void>;
  clearChat: () => void;
}

export function useAIChat(projectId?: string): UseAIChatState & UseAIChatActions {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    imageUrls?: string[]
  ): Promise<boolean> => {
    if (!message.trim()) {
      setError('Vui lòng nhập tin nhắn');
      return false;
    }

    setLoading(true);
    setError(null);

    // Add user message optimistically
    const userMessage: AIChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      role: 'user',
      content: message,
      imageUrls,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const request: AIChatRequest = {
        projectId,
        message,
        conversationId: conversationId || undefined,
        imageUrls,
      };

      const response: AIChatResponse = await aiService.chatWithAI(request);

      // Update conversation ID if new
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Replace temp message and add AI response
      setMessages(prev => [
        ...prev.filter(m => m.id !== userMessage.id),
        response.message.role === 'user' ? response.message : userMessage,
        response.message.role === 'assistant' ? response.message : response.message,
      ]);

      return true;
    } catch (err: any) {
      setError(err.message || 'AI không phản hồi');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      return false;
    } finally {
      setLoading(false);
    }
  }, [projectId, conversationId]);

  const loadHistory = useCallback(async (
    projectId: string,
    conversationId?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const history = await aiService.getChatHistory(projectId, conversationId);
      setMessages(history.messages);
      setConversationId(history.conversationId);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch sử chat');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    loadHistory,
    clearChat,
  };
}

// ==================== Error Detection Hook ====================

export function useErrorDetection() {
  const [result, setResult] = useState<ErrorDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectErrors = useCallback(async (
    request: DetectErrorsRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const detectionResult = await aiService.detectErrors(request);
      setResult(detectionResult);
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi phát hiện sai sót');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    detectErrors,
    reset,
  };
}

// ==================== Material Estimation Hook ====================

export function useMaterialEstimation() {
  const [result, setResult] = useState<MaterialEstimation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = useCallback(async (
    request: EstimateMaterialsRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const estimation = await aiService.estimateMaterials(request);
      setResult(estimation);
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi ước tính vật liệu');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    estimate,
    reset,
  };
}

// ==================== Quality Check Hook ====================

export function useQualityCheck() {
  const [result, setResult] = useState<QualityCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkQuality = useCallback(async (
    request: CheckQualityRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const qualityResult = await aiService.checkQuality(request);
      setResult(qualityResult);
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi kiểm tra chất lượng');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    checkQuality,
    reset,
  };
}

// ==================== Drawing Analysis Hook ====================

export function useDrawingAnalysis() {
  const [result, setResult] = useState<DrawingAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (
    request: AnalyzeDrawingRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const analysisResult = await aiService.analyzeDrawing(request);
      setResult(analysisResult);
      return true;
    } catch (err: any) {
      setError(err.message || 'Lỗi phân tích bản vẽ');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    analyze,
    reset,
  };
}

// ==================== Reports Management Hook ====================

export function useAIReports(projectId?: string) {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const loadReports = useCallback(async (
    pid?: string,
    params?: { page?: number; limit?: number; reportType?: string }
  ): Promise<void> => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId) {
      setError('Project ID required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getProjectReports(targetProjectId, params);
      // Safely handle response - guard against undefined
      setReports(response?.reports ?? []);
      setPagination({
        page: response?.page ?? params?.page ?? 1,
        limit: response?.limit ?? params?.limit ?? 10,
        total: response?.total ?? 0,
      });
    } catch (err: any) {
      setError(err.message || 'Không thể tải báo cáo');
      setReports([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadReportById = useCallback(async (reportId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const report = await aiService.getReportById(reportId);
      setSelectedReport(report);
    } catch (err: any) {
      setError(err.message || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (
    request: GenerateReportRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const report = await aiService.generateReport(request);
      setReports(prev => [report, ...prev]);
      setSelectedReport(report);
      return true;
    } catch (err: any) {
      setError(err.message || 'Không thể tạo báo cáo');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reports,
    selectedReport,
    loading,
    error,
    pagination,
    loadReports,
    loadReportById,
    generateReport,
    setSelectedReport,
  };
}

// ==================== Combined AI Assistant Hook ====================

/**
 * Comprehensive hook combining all AI features
 * Use this for screens that need multiple AI capabilities
 */
export function useAIAssistant(projectId?: string) {
  const progressAnalysis = useProgressAnalysis();
  const chat = useAIChat(projectId);
  const errorDetection = useErrorDetection();
  const materialEstimation = useMaterialEstimation();
  const qualityCheck = useQualityCheck();
  const drawingAnalysis = useDrawingAnalysis();
  const reports = useAIReports(projectId);

  return {
    progressAnalysis,
    chat,
    errorDetection,
    materialEstimation,
    qualityCheck,
    drawingAnalysis,
    reports,
  };
}
