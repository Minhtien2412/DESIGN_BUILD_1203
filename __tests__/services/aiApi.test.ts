/**
 * AI API Service Tests
 */

import { aiService } from '@/services/aiApi';

// Mock the apiFetch function
jest.mock('@/services/api', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@/services/api';
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendChatMessage', () => {
    it('should send a chat message successfully', async () => {
      const mockResponse = {
        id: '1',
        role: 'assistant',
        content: 'Hello! How can I help you?',
        timestamp: '2025-12-25T10:00:00Z',
      };

      mockApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await aiService.sendChatMessage(
        'session-1',
        'Hi there'
      );

      expect(mockApiFetch).toHaveBeenCalledWith('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'session-1',
          message: 'Hi there',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when sending message', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        aiService.sendChatMessage('session-1', 'Hi')
      ).rejects.toThrow('Failed to send message');
    });
  });

  describe('estimateCost', () => {
    it('should estimate project cost successfully', async () => {
      const mockEstimation = {
        projectType: 'residential',
        area: 150,
        location: 'Hanoi',
        estimatedCost: 3000000000,
        breakdown: {
          materials: 1500000000,
          labor: 1000000000,
          equipment: 300000000,
          overhead: 200000000,
        },
        confidence: 0.85,
        alternatives: [],
      };

      mockApiFetch.mockResolvedValueOnce(mockEstimation);

      const result = await aiService.estimateCost({
        projectType: 'residential',
        area: 150,
        location: 'Hanoi',
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/ai/estimate-cost', {
        method: 'POST',
        body: JSON.stringify({
          projectType: 'residential',
          area: 150,
          location: 'Hanoi',
        }),
      });
      expect(result.estimatedCost).toBe(3000000000);
      expect(result.confidence).toBe(0.85);
    });

    it('should handle errors when estimating cost', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('API error'));

      await expect(
        aiService.estimateCost({
          projectType: 'residential',
          area: 150,
          location: 'Hanoi',
        })
      ).rejects.toThrow('Failed to estimate cost');
    });
  });

  describe('createChatSession', () => {
    it('should create a new chat session', async () => {
      const mockSession = {
        id: 'session-123',
        title: 'New Chat',
        messages: [],
        createdAt: '2025-12-25T10:00:00Z',
        updatedAt: '2025-12-25T10:00:00Z',
      };

      mockApiFetch.mockResolvedValueOnce(mockSession);

      const result = await aiService.createChatSession('New Chat');

      expect(mockApiFetch).toHaveBeenCalledWith('/ai/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Chat' }),
      });
      expect(result.id).toBe('session-123');
    });
  });

  describe('suggestMaterials', () => {
    it('should suggest materials for a project', async () => {
      const mockSuggestions = [
        {
          id: '1',
          name: 'Cement',
          category: 'Construction Materials',
          quantity: 100,
          unit: 'bags',
          estimatedCost: 50000000,
          supplier: 'Supplier A',
          alternatives: [],
          confidence: 0.9,
        },
      ];

      mockApiFetch.mockResolvedValueOnce(mockSuggestions);

      const result = await aiService.suggestMaterials({
        projectType: 'residential',
        area: 150,
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/ai/suggest-materials', {
        method: 'POST',
        body: JSON.stringify({
          projectType: 'residential',
          area: 150,
        }),
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cement');
    });
  });

  describe('analyzeRisks', () => {
    it('should analyze project risks', async () => {
      const mockAnalysis = {
        projectId: 'proj-1',
        overallRisk: 'medium' as const,
        riskScore: 65,
        risks: [
          {
            category: 'Weather',
            description: 'Rainy season approaching',
            severity: 'medium' as const,
            probability: 0.7,
            impact: 0.6,
            mitigation: 'Plan for weather delays',
          },
        ],
        recommendations: ['Monitor weather forecasts'],
      };

      mockApiFetch.mockResolvedValueOnce(mockAnalysis);

      const result = await aiService.analyzeRisks('proj-1');

      expect(result.overallRisk).toBe('medium');
      expect(result.risks).toHaveLength(1);
    });
  });
});
