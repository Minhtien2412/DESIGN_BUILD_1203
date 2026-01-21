/**
 * OpenAI Service - Tích hợp GPT-4 cho App Design Build
 * Hỗ trợ chat, code generation, và text processing
 */

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Gọi OpenAI Chat Completion API
 */
export async function chatCompletion(
  messages: OpenAIChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<OpenAIResponse> {
  if (!OPENAI_API_KEY) {
    return { success: false, error: 'OpenAI API key chưa được cấu hình' };
  }

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens || 2048,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }

    return {
      success: true,
      data: {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
        model: data.model,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Hỏi GPT một câu hỏi đơn giản
 */
export async function askGPT(
  question: string,
  context?: string
): Promise<OpenAIResponse> {
  const messages: OpenAIChatMessage[] = [];

  if (context) {
    messages.push({
      role: 'system',
      content: context,
    });
  }

  messages.push({
    role: 'user',
    content: question,
  });

  return chatCompletion(messages);
}

/**
 * Generate code từ mô tả
 */
export async function generateCode(
  description: string,
  language: string = 'typescript'
): Promise<OpenAIResponse> {
  const systemPrompt = `Bạn là expert developer. Hãy viết code ${language} theo yêu cầu.
Chỉ trả về code, không giải thích.
Code phải clean, có comments khi cần thiết.`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: description },
  ], { temperature: 0.3 });
}

/**
 * Review và cải thiện code
 */
export async function reviewCode(
  code: string,
  language: string = 'typescript'
): Promise<OpenAIResponse> {
  const systemPrompt = `Bạn là senior code reviewer. Hãy review code ${language} và đề xuất cải thiện.
Format response:
## Issues Found
- ...
## Suggestions
- ...
## Improved Code (nếu có)`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Review code này:\n\`\`\`${language}\n${code}\n\`\`\`` },
  ]);
}

/**
 * Dịch text
 */
export async function translateText(
  text: string,
  targetLanguage: string = 'vi'
): Promise<OpenAIResponse> {
  return chatCompletion([
    { role: 'system', content: `Dịch text sang ${targetLanguage}. Chỉ trả về bản dịch.` },
    { role: 'user', content: text },
  ], { temperature: 0.3 });
}

/**
 * Tóm tắt văn bản
 */
export async function summarizeText(
  text: string,
  maxLength: number = 200
): Promise<OpenAIResponse> {
  return chatCompletion([
    { role: 'system', content: `Tóm tắt văn bản trong khoảng ${maxLength} từ. Ngắn gọn, súc tích.` },
    { role: 'user', content: text },
  ]);
}

/**
 * Phân tích sentiment
 */
export async function analyzeSentiment(text: string): Promise<OpenAIResponse> {
  return chatCompletion([
    {
      role: 'system',
      content: `Phân tích sentiment của văn bản. Trả về JSON format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": 0-100,
  "summary": "brief explanation"
}`,
    },
    { role: 'user', content: text },
  ], { temperature: 0.1 });
}

/**
 * Hỗ trợ thiết kế xây dựng
 */
export async function assistDesignBuild(query: string): Promise<OpenAIResponse> {
  const systemPrompt = `Bạn là chuyên gia thiết kế và xây dựng resort, biệt thự tại Việt Nam.
Có kiến thức sâu về:
- Quy hoạch, thiết kế kiến trúc
- Vật liệu xây dựng, báo giá
- Phong thủy, feng shui
- Quy định xây dựng Việt Nam
- Quản lý dự án xây dựng

Trả lời bằng tiếng Việt, chuyên nghiệp nhưng dễ hiểu.`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query },
  ]);
}

/**
 * Tạo mô tả sản phẩm/dự án
 */
export async function generateDescription(
  productInfo: {
    name: string;
    type: string;
    features?: string[];
    specs?: Record<string, string>;
  }
): Promise<OpenAIResponse> {
  const prompt = `Tạo mô tả hấp dẫn cho sản phẩm/dự án:
Tên: ${productInfo.name}
Loại: ${productInfo.type}
${productInfo.features ? `Tính năng: ${productInfo.features.join(', ')}` : ''}
${productInfo.specs ? `Thông số: ${JSON.stringify(productInfo.specs)}` : ''}

Mô tả khoảng 100-150 từ, chuyên nghiệp, hấp dẫn.`;

  return chatCompletion([
    { role: 'system', content: 'Bạn là copywriter chuyên về bất động sản và xây dựng.' },
    { role: 'user', content: prompt },
  ]);
}

/**
 * Kiểm tra API key
 */
export async function checkAPIStatus(): Promise<{
  available: boolean;
  error?: string;
  models?: string[];
}> {
  if (!OPENAI_API_KEY) {
    return { available: false, error: 'API key chưa cấu hình' };
  }

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/models`, {
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    });

    if (!response.ok) {
      return { available: false, error: 'API key không hợp lệ' };
    }

    const data = await response.json();
    const models = data.data
      ?.filter((m: any) => m.id.includes('gpt'))
      .map((m: any) => m.id)
      .slice(0, 5);

    return { available: true, models };
  } catch (error) {
    return { available: false, error: (error as Error).message };
  }
}

export const OpenAIService = {
  chatCompletion,
  askGPT,
  generateCode,
  reviewCode,
  translateText,
  summarizeText,
  analyzeSentiment,
  assistDesignBuild,
  generateDescription,
  checkAPIStatus,
};

export default OpenAIService;
