/**
 * Gemini AI Service
 * Direct integration with Google Gemini API for app feature assistance
 * API Key: thiết kế xây dựng (1075439753165)
 */

// API Configuration
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCBWfOBoxVeMFLM_-fNi1nN4W6cn-hC56U';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

// Types
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface ChatSession {
  history: GeminiMessage[];
}

export interface FeatureAssistRequest {
  feature: string;
  description: string;
  currentCode?: string;
  errorMessage?: string;
}

export interface FeatureAssistResponse {
  suggestion: string;
  codeSnippet?: string;
  steps?: string[];
  warnings?: string[];
}

export interface AppAnalysisRequest {
  screenName: string;
  componentCode?: string;
  issue?: string;
}

export interface AppAnalysisResponse {
  analysis: string;
  recommendations: string[];
  codeImprovements?: string;
}

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  featureAssist: `Bạn là AI trợ lý phát triển ứng dụng mobile React Native/Expo. 
Ứng dụng này là một app quản lý dự án xây dựng theo phong cách Shopee.
Công nghệ: Expo SDK 54, React 19, TypeScript, expo-router.
Quy tắc:
- Luôn trả lời bằng tiếng Việt
- Code phải tuân thủ TypeScript strict mode
- Sử dụng expo-router cho navigation
- Tái sử dụng components từ components/ui/
- Styling dùng StyleSheet, không dùng inline styles
- Không dùng 'as any', định nghĩa types rõ ràng`,

  codeReview: `Bạn là chuyên gia review code React Native/TypeScript.
Nhiệm vụ: Phân tích code và đề xuất cải tiến về:
- Performance (re-renders, memoization)
- Type safety (TypeScript)
- Best practices (hooks, components)
- Accessibility
- Error handling
Trả lời bằng tiếng Việt, ngắn gọn và thiết thực.`,

  debugging: `Bạn là AI debug assistant cho React Native/Expo.
Nhiệm vụ: Giúp tìm và sửa lỗi trong code.
- Phân tích error message
- Xác định root cause
- Đề xuất giải pháp cụ thể với code snippet
Trả lời bằng tiếng Việt.`,

  uiDesign: `Bạn là UI/UX designer cho ứng dụng React Native.
Phong cách thiết kế: Shopee-style, hiện đại, user-friendly.
Màu sắc chính: #0D9488 (primary), #f5f5f5 (background)
Nhiệm vụ: Đề xuất cải tiến UI, layout, interactions.
Trả lời bằng tiếng Việt với chi tiết cụ thể.`,

  general: `Bạn là AI assistant cho ứng dụng quản lý dự án xây dựng.
Hỗ trợ người dùng với các vấn đề về:
- Quản lý dự án, tiến độ công trình
- Báo giá, thanh toán
- Chat, gọi điện, thông báo
- Và các chức năng khác của app
Trả lời bằng tiếng Việt, thân thiện và hữu ích.`,
};

/**
 * GeminiAI Service Class
 */
class GeminiAI {
  private apiKey: string;
  private model: string;
  private chatSession: ChatSession | null = null;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.model = DEFAULT_MODEL;
  }

  /**
   * Generate content with Gemini
   */
  async generateContent(
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    try {
      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\n---\n\nYêu cầu: ${prompt}`
        : prompt;

      const response = await fetch(
        `${GEMINI_API_URL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: fullPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Gemini API error');
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini generateContent error:', error);
      throw error;
    }
  }

  /**
   * Start a new chat session
   */
  startChat(systemPrompt?: string): void {
    this.chatSession = {
      history: systemPrompt ? [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Đã hiểu. Tôi sẵn sàng hỗ trợ bạn.' }],
        },
      ] : [],
    };
  }

  /**
   * Send message in chat session
   */
  async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) {
      this.startChat(SYSTEM_PROMPTS.general);
    }

    try {
      // Add user message to history
      this.chatSession!.history.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await fetch(
        `${GEMINI_API_URL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: this.chatSession!.history,
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Chat error');
      }

      const data: GeminiResponse = await response.json();
      const reply = data.candidates[0]?.content?.parts[0]?.text || '';

      // Add model response to history
      this.chatSession!.history.push({
        role: 'model',
        parts: [{ text: reply }],
      });

      return reply;
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw error;
    }
  }

  /**
   * Clear chat history
   */
  clearChat(): void {
    this.chatSession = null;
  }

  // ========================================
  // APP FEATURE ASSISTANCE
  // ========================================

  /**
   * Get help for implementing/modifying a feature
   */
  async assistFeature(request: FeatureAssistRequest): Promise<FeatureAssistResponse> {
    const prompt = `
Chức năng: ${request.feature}
Mô tả: ${request.description}
${request.currentCode ? `\nCode hiện tại:\n\`\`\`typescript\n${request.currentCode}\n\`\`\`` : ''}
${request.errorMessage ? `\nLỗi gặp phải: ${request.errorMessage}` : ''}

Hãy đề xuất giải pháp với:
1. Phân tích ngắn gọn
2. Code snippet cải tiến (nếu có)
3. Các bước thực hiện
4. Cảnh báo cần lưu ý (nếu có)
`;

    const response = await this.generateContent(prompt, SYSTEM_PROMPTS.featureAssist);
    
    // Parse response into structured format
    return {
      suggestion: response,
      steps: this.extractSteps(response),
      warnings: this.extractWarnings(response),
    };
  }

  /**
   * Review and improve code
   */
  async reviewCode(code: string, context?: string): Promise<string> {
    const prompt = `
${context ? `Context: ${context}\n\n` : ''}
Code cần review:
\`\`\`typescript
${code}
\`\`\`

Hãy review và đề xuất cải tiến.
`;

    return this.generateContent(prompt, SYSTEM_PROMPTS.codeReview);
  }

  /**
   * Debug an error
   */
  async debugError(
    errorMessage: string,
    code?: string,
    stackTrace?: string
  ): Promise<string> {
    const prompt = `
Error: ${errorMessage}
${stackTrace ? `\nStack trace:\n${stackTrace}` : ''}
${code ? `\nCode liên quan:\n\`\`\`typescript\n${code}\n\`\`\`` : ''}

Hãy phân tích và đề xuất cách sửa lỗi.
`;

    return this.generateContent(prompt, SYSTEM_PROMPTS.debugging);
  }

  /**
   * Suggest UI improvements
   */
  async suggestUI(
    screenName: string,
    currentDesign?: string
  ): Promise<string> {
    const prompt = `
Màn hình: ${screenName}
${currentDesign ? `\nThiết kế hiện tại:\n${currentDesign}` : ''}

Hãy đề xuất cải tiến UI/UX cho màn hình này.
`;

    return this.generateContent(prompt, SYSTEM_PROMPTS.uiDesign);
  }

  /**
   * Analyze app screen/component
   */
  async analyzeApp(request: AppAnalysisRequest): Promise<AppAnalysisResponse> {
    const prompt = `
Màn hình: ${request.screenName}
${request.issue ? `\nVấn đề: ${request.issue}` : ''}
${request.componentCode ? `\nCode component:\n\`\`\`typescript\n${request.componentCode}\n\`\`\`` : ''}

Hãy phân tích và đề xuất cải tiến.
`;

    const response = await this.generateContent(prompt, SYSTEM_PROMPTS.codeReview);
    
    return {
      analysis: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  /**
   * Generate code snippet for a feature
   */
  async generateCodeSnippet(
    featureDescription: string,
    targetFile?: string
  ): Promise<string> {
    const prompt = `
Tạo code snippet cho: ${featureDescription}
${targetFile ? `\nFile đích: ${targetFile}` : ''}

Yêu cầu:
- TypeScript + React Native
- Tuân thủ project conventions
- Có comments giải thích
- Sẵn sàng copy-paste sử dụng
`;

    return this.generateContent(prompt, SYSTEM_PROMPTS.featureAssist);
  }

  /**
   * Translate UI text
   */
  async translateUI(
    texts: string[],
    targetLanguage: 'en' | 'vi' = 'vi'
  ): Promise<Record<string, string>> {
    const prompt = `
Dịch các text UI sau sang ${targetLanguage === 'vi' ? 'tiếng Việt' : 'English'}:
${texts.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

Trả về dạng JSON:
{
  "original": "translated",
  ...
}
`;

    const response = await this.generateContent(prompt);
    
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse translation response');
    }
    
    return {};
  }

  // ========================================
  // CONSTRUCTION SPECIFIC
  // ========================================

  /**
   * Analyze construction progress from description
   */
  async analyzeConstructionProgress(
    description: string,
    currentPhase?: string
  ): Promise<string> {
    const prompt = `
Phân tích tiến độ công trình:
${currentPhase ? `Giai đoạn hiện tại: ${currentPhase}\n` : ''}
Mô tả: ${description}

Hãy đánh giá:
1. Tiến độ hoàn thành ước tính (%)
2. Chất lượng công việc
3. Vấn đề cần lưu ý
4. Đề xuất tiếp theo
`;

    return this.generateContent(prompt, SYSTEM_PROMPTS.general);
  }

  /**
   * Generate construction report
   */
  async generateConstructionReport(
    projectName: string,
    data: {
      phases: { name: string; progress: number }[];
      issues?: string[];
      nextSteps?: string[];
    }
  ): Promise<string> {
    const prompt = `
Tạo báo cáo tiến độ cho dự án: ${projectName}

Các giai đoạn:
${data.phases.map(p => `- ${p.name}: ${p.progress}%`).join('\n')}

${data.issues?.length ? `Vấn đề:\n${data.issues.map(i => `- ${i}`).join('\n')}` : ''}
${data.nextSteps?.length ? `Bước tiếp theo:\n${data.nextSteps.map(s => `- ${s}`).join('\n')}` : ''}

Hãy tạo báo cáo chuyên nghiệp, ngắn gọn.
`;

    return this.generateContent(prompt, SYSTEM_PROMPTS.general);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Check API status
   */
  async checkStatus(): Promise<{
    connected: boolean;
    model: string;
    message: string;
  }> {
    try {
      const response = await this.generateContent('Xin chào! Trả lời ngắn gọn.');
      return {
        connected: true,
        model: this.model,
        message: response.slice(0, 100),
      };
    } catch (error) {
      return {
        connected: false,
        model: this.model,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Extract numbered steps from text
   */
  private extractSteps(text: string): string[] {
    const stepPatterns = [
      /\d+\.\s+(.+?)(?=\n\d+\.|\n\n|$)/g,
      /[-•]\s+(.+?)(?=\n[-•]|\n\n|$)/g,
    ];
    
    const steps: string[] = [];
    for (const pattern of stepPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          steps.push(match[1].trim());
        }
      }
      if (steps.length > 0) break;
    }
    
    return steps.slice(0, 10);
  }

  /**
   * Extract warnings from text
   */
  private extractWarnings(text: string): string[] {
    const warningKeywords = ['cảnh báo', 'lưu ý', 'warning', 'chú ý', 'quan trọng'];
    const lines = text.split('\n');
    
    return lines
      .filter(line => 
        warningKeywords.some(kw => line.toLowerCase().includes(kw))
      )
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .slice(0, 5);
  }

  /**
   * Extract recommendations from text
   */
  private extractRecommendations(text: string): string[] {
    const recommendKeywords = ['đề xuất', 'nên', 'khuyến nghị', 'recommend'];
    const lines = text.split('\n');
    
    return lines
      .filter(line => 
        recommendKeywords.some(kw => line.toLowerCase().includes(kw)) ||
        /^\d+\.|^[-•]/.test(line.trim())
      )
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 15)
      .slice(0, 10);
  }

  /**
   * Set custom model
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.model;
  }
}

// Export singleton instance
export const geminiAI = new GeminiAI();

// Export class for custom instances
export { GeminiAI };

// Export system prompts for customization
    export { SYSTEM_PROMPTS };

