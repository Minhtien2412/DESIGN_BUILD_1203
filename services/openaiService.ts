/**
 * OpenAI Service
 * AI-powered features using OpenAI GPT API
 * 
 * Features:
 * - Chat completion (conversational AI)
 * - Text analysis & summarization
 * - Smart search
 * - Content generation
 * - Image analysis (Vision API)
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import ENV from '@/config/env';

const OPENAI_API_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini'; // Cost-effective model

// ============================================
// Types
// ============================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIAnalysisResult {
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  suggestions?: string[];
  insights?: string[];
}

// ============================================
// Helper Functions
// ============================================

function getApiKey(): string {
  const key = ENV.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return key;
}

async function makeRequest<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${OPENAI_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// Chat Completion API
// ============================================

/**
 * Send a chat completion request
 */
export async function chatCompletion(request: ChatCompletionRequest): Promise<string> {
  const response = await makeRequest<ChatCompletionResponse>('/chat/completions', {
    model: request.model || DEFAULT_MODEL,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 1024,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Quick chat - simple question/answer
 */
export async function quickChat(
  userMessage: string,
  systemPrompt?: string
): Promise<string> {
  const messages: ChatMessage[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: userMessage });
  
  return chatCompletion({ messages });
}

// ============================================
// AI Assistant for Construction App
// ============================================

const CONSTRUCTION_SYSTEM_PROMPT = `Bạn là trợ lý AI chuyên nghiệp trong lĩnh vực xây dựng, quản lý dự án và thiết kế resort.
Bạn có kiến thức sâu về:
- Quản lý tiến độ dự án xây dựng
- Kỹ thuật xây dựng và vật liệu
- An toàn lao động
- Quản lý ngân sách và chi phí
- Thiết kế kiến trúc và nội thất
- Quy định pháp lý về xây dựng tại Việt Nam

Hãy trả lời bằng tiếng Việt, ngắn gọn và chuyên nghiệp.`;

/**
 * Construction AI Assistant
 */
export async function askConstructionAI(question: string): Promise<string> {
  return quickChat(question, CONSTRUCTION_SYSTEM_PROMPT);
}

/**
 * Analyze project data and provide insights
 */
export async function analyzeProject(projectData: {
  name: string;
  progress: number;
  budget: number;
  spent: number;
  tasks: { name: string; status: string; deadline?: string }[];
  issues?: string[];
}): Promise<AIAnalysisResult> {
  const prompt = `Phân tích dữ liệu dự án sau và đưa ra nhận xét:

Tên dự án: ${projectData.name}
Tiến độ: ${projectData.progress}%
Ngân sách: ${projectData.budget.toLocaleString()} VND
Đã chi: ${projectData.spent.toLocaleString()} VND (${Math.round((projectData.spent / projectData.budget) * 100)}%)

Công việc:
${projectData.tasks.map(t => `- ${t.name}: ${t.status}${t.deadline ? ` (deadline: ${t.deadline})` : ''}`).join('\n')}

${projectData.issues?.length ? `Vấn đề hiện tại:\n${projectData.issues.map(i => `- ${i}`).join('\n')}` : ''}

Hãy trả về JSON với format:
{
  "summary": "Tóm tắt ngắn gọn tình trạng dự án",
  "sentiment": "positive/negative/neutral",
  "insights": ["Nhận xét 1", "Nhận xét 2"],
  "suggestions": ["Đề xuất 1", "Đề xuất 2"]
}`;

  try {
    const response = await quickChat(prompt);
    return JSON.parse(response);
  } catch {
    return {
      summary: 'Không thể phân tích dữ liệu dự án',
      sentiment: 'neutral',
    };
  }
}

// ============================================
// Text Analysis
// ============================================

/**
 * Summarize text
 */
export async function summarizeText(text: string, maxLength: number = 100): Promise<string> {
  return quickChat(
    `Tóm tắt văn bản sau trong khoảng ${maxLength} từ:\n\n${text}`,
    'Bạn là chuyên gia tóm tắt văn bản. Giữ lại các thông tin quan trọng nhất.'
  );
}

/**
 * Extract keywords from text
 */
export async function extractKeywords(text: string): Promise<string[]> {
  const prompt = `Trích xuất 5-10 từ khóa quan trọng từ văn bản sau. Trả về dạng JSON array:

${text}

Trả về format: ["keyword1", "keyword2", ...]`;

  try {
    const response = await quickChat(prompt);
    return JSON.parse(response);
  } catch {
    return [];
  }
}

/**
 * Analyze sentiment of text
 */
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  reason: string;
}> {
  const prompt = `Phân tích cảm xúc của văn bản sau. Trả về JSON:

${text}

Format: {"sentiment": "positive/negative/neutral", "confidence": 0.0-1.0, "reason": "Giải thích ngắn"}`;

  try {
    const response = await quickChat(prompt);
    return JSON.parse(response);
  } catch {
    return { sentiment: 'neutral', confidence: 0, reason: 'Không thể phân tích' };
  }
}

// ============================================
// Smart Search
// ============================================

/**
 * Enhance search query with AI
 */
export async function enhanceSearchQuery(query: string): Promise<{
  enhancedQuery: string;
  suggestions: string[];
}> {
  const prompt = `Người dùng tìm kiếm: "${query}"

Hãy:
1. Cải thiện câu query để tìm kiếm hiệu quả hơn
2. Đưa ra 3-5 gợi ý tìm kiếm liên quan

Trả về JSON: {"enhancedQuery": "...", "suggestions": ["...", "..."]}`;

  try {
    const response = await quickChat(prompt);
    return JSON.parse(response);
  } catch {
    return { enhancedQuery: query, suggestions: [] };
  }
}

// ============================================
// Content Generation
// ============================================

/**
 * Generate post content
 */
export async function generatePostContent(
  topic: string,
  style: 'professional' | 'casual' | 'informative' = 'professional'
): Promise<string> {
  const stylePrompts = {
    professional: 'Viết theo phong cách chuyên nghiệp, trang trọng',
    casual: 'Viết theo phong cách thân thiện, gần gũi',
    informative: 'Viết theo phong cách thông tin, đầy đủ dữ liệu',
  };

  return quickChat(
    `Viết một bài đăng về chủ đề: ${topic}\n\n${stylePrompts[style]}`,
    'Bạn là người viết nội dung chuyên nghiệp cho mạng xã hội.'
  );
}

/**
 * Generate report
 */
export async function generateReport(
  data: object,
  reportType: 'daily' | 'weekly' | 'monthly'
): Promise<string> {
  const prompt = `Tạo báo cáo ${reportType === 'daily' ? 'hàng ngày' : reportType === 'weekly' ? 'hàng tuần' : 'hàng tháng'} từ dữ liệu sau:

${JSON.stringify(data, null, 2)}

Báo cáo cần có:
1. Tóm tắt chung
2. Các điểm nổi bật
3. Vấn đề cần chú ý
4. Đề xuất hành động`;

  return quickChat(prompt, 'Bạn là chuyên gia viết báo cáo quản lý dự án.');
}

// ============================================
// Conversation Manager
// ============================================

export class AIConversation {
  private messages: ChatMessage[] = [];
  private systemPrompt: string;
  private model: string;

  constructor(systemPrompt?: string, model?: string) {
    this.systemPrompt = systemPrompt || CONSTRUCTION_SYSTEM_PROMPT;
    this.model = model || DEFAULT_MODEL;
    this.messages.push({ role: 'system', content: this.systemPrompt });
  }

  async sendMessage(userMessage: string): Promise<string> {
    this.messages.push({ role: 'user', content: userMessage });

    const response = await chatCompletion({
      messages: this.messages,
      model: this.model,
    });

    this.messages.push({ role: 'assistant', content: response });

    return response;
  }

  getHistory(): ChatMessage[] {
    return this.messages.filter(m => m.role !== 'system');
  }

  clearHistory(): void {
    this.messages = [{ role: 'system', content: this.systemPrompt }];
  }
}

// ============================================
// Export
// ============================================

export default {
  chatCompletion,
  quickChat,
  askConstructionAI,
  analyzeProject,
  summarizeText,
  extractKeywords,
  analyzeSentiment,
  enhanceSearchQuery,
  generatePostContent,
  generateReport,
  AIConversation,
};
