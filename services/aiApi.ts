/**
 * AI Service API
 * Machine learning features for construction management
 */

import { apiFetch } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  context?: {
    projectId?: string;
    userId?: string;
  };
}

export interface CostEstimation {
  projectType: string;
  area: number;
  location: string;
  estimatedCost: number;
  breakdown: {
    materials: number;
    labor: number;
    equipment: number;
    overhead: number;
  };
  confidence: number;
  alternatives?: Array<{
    description: string;
    cost: number;
    savings: number;
  }>;
}

export interface MaterialSuggestion {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  supplier?: string;
  alternatives?: Array<{
    name: string;
    cost: number;
    quality: 'standard' | 'premium' | 'budget';
  }>;
  confidence: number;
}

export interface ProjectRiskAnalysis {
  projectId: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  risks: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    impact: string;
    mitigation: string;
  }>;
  recommendations: string[];
}

export interface TimelineOptimization {
  projectId: string;
  currentDuration: number;
  optimizedDuration: number;
  savings: number;
  suggestions: Array<{
    task: string;
    currentDuration: number;
    optimizedDuration: number;
    method: string;
  }>;
}

class AIService {
  /**
   * Send message to AI chatbot
   */
  async sendChatMessage(
    sessionId: string,
    message: string,
    context?: Record<string, any>
  ): Promise<ChatMessage> {
    try {
      const response = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          message,
          context,
        }),
      });

      return {
        id: response.messageId,
        role: 'assistant',
        content: response.reply,
        timestamp: response.timestamp,
        metadata: response.metadata,
      };
    } catch (error: any) {
      throw new Error(`Chat error: ${error.message}`);
    }
  }

  /**
   * Create new chat session
   */
  async createChatSession(title?: string): Promise<ChatSession> {
    try {
      const response = await apiFetch('/ai/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });

      return response;
    } catch (error: any) {
      throw new Error(`Failed to create chat session: ${error.message}`);
    }
  }

  /**
   * Get chat sessions
   */
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await apiFetch('/ai/chat/sessions');
      return response.sessions || [];
    } catch (error: any) {
      throw new Error(`Failed to load chat sessions: ${error.message}`);
    }
  }

  /**
   * Get chat session by ID
   */
  async getChatSession(sessionId: string): Promise<ChatSession> {
    try {
      const response = await apiFetch(`/ai/chat/sessions/${sessionId}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load chat session: ${error.message}`);
    }
  }

  /**
   * Delete chat session
   */
  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      await apiFetch(`/ai/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      throw new Error(`Failed to delete chat session: ${error.message}`);
    }
  }

  /**
   * Estimate project cost using AI
   */
  async estimateCost(params: {
    projectType: string;
    area: number;
    location: string;
    specifications?: Record<string, any>;
  }): Promise<CostEstimation> {
    try {
      const response = await apiFetch('/ai/estimate-cost', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response;
    } catch (error: any) {
      throw new Error(`Cost estimation error: ${error.message}`);
    }
  }

  /**
   * Get material suggestions based on project
   */
  async suggestMaterials(params: {
    projectId?: string;
    projectType: string;
    area: number;
    specifications?: Record<string, any>;
  }): Promise<MaterialSuggestion[]> {
    try {
      const response = await apiFetch('/ai/suggest-materials', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response.suggestions || [];
    } catch (error: any) {
      throw new Error(`Material suggestion error: ${error.message}`);
    }
  }

  /**
   * Analyze project risks using AI
   */
  async analyzeRisks(projectId: string): Promise<ProjectRiskAnalysis> {
    try {
      const response = await apiFetch(`/ai/analyze-risks/${projectId}`);
      return response;
    } catch (error: any) {
      throw new Error(`Risk analysis error: ${error.message}`);
    }
  }

  /**
   * Optimize project timeline
   */
  async optimizeTimeline(projectId: string): Promise<TimelineOptimization> {
    try {
      const response = await apiFetch(`/ai/optimize-timeline/${projectId}`);
      return response;
    } catch (error: any) {
      throw new Error(`Timeline optimization error: ${error.message}`);
    }
  }

  /**
   * Get AI recommendations for a project
   */
  async getProjectRecommendations(projectId: string): Promise<{
    costSaving: string[];
    timeSaving: string[];
    qualityImprovement: string[];
    safetyTips: string[];
  }> {
    try {
      const response = await apiFetch(`/ai/recommendations/${projectId}`);
      return response;
    } catch (error: any) {
      throw new Error(`Recommendations error: ${error.message}`);
    }
  }

  /**
   * Predict project completion date
   */
  async predictCompletion(projectId: string): Promise<{
    predictedDate: string;
    confidence: number;
    factors: Array<{
      name: string;
      impact: string;
      weight: number;
    }>;
  }> {
    try {
      const response = await apiFetch(`/ai/predict-completion/${projectId}`);
      return response;
    } catch (error: any) {
      throw new Error(`Completion prediction error: ${error.message}`);
    }
  }

  /**
   * Detect anomalies in project data
   */
  async detectAnomalies(projectId: string): Promise<Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: string;
    recommendation: string;
  }>> {
    try {
      const response = await apiFetch(`/ai/detect-anomalies/${projectId}`);
      return response.anomalies || [];
    } catch (error: any) {
      throw new Error(`Anomaly detection error: ${error.message}`);
    }
  }
}

export const aiService = new AIService();
