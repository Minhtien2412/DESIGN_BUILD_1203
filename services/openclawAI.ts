/**
 * OpenClaw AI Service
 * Routes chat completions through the production backend's
 * POST /ai/general-chat endpoint (OpenAI-compatible proxy).
 *
 * The backend uses gpt-4o-mini via the OpenAI SDK; the OPENAI_API_KEY
 * lives server-side in .env — no secret is exposed to the client.
 */

import { post } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────
export interface OpenClawMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GeneralChatChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface GeneralChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GeneralChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ─── System Prompts ──────────────────────────────────────────
export const OPENCLAW_PROMPTS = {
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

  general: `Bạn là AI assistant cho ứng dụng quản lý dự án xây dựng BaoTien.
Hỗ trợ người dùng với các vấn đề về:
- Quản lý dự án, tiến độ công trình
- Tư vấn thiết kế kiến trúc, nội thất
- Dự toán chi phí, báo giá vật liệu
- Review và tối ưu code
- Debug và sửa lỗi ứng dụng
Trả lời bằng tiếng Việt, thân thiện và hữu ích.`,
};

// ─── Service Class ───────────────────────────────────────────
class OpenClawAI {
  private chatHistory: OpenClawMessage[] = [];

  /**
   * Start a new chat session with a system prompt
   */
  startChat(systemPrompt?: string): void {
    this.chatHistory = [];
    if (systemPrompt) {
      this.chatHistory.push({
        role: "system",
        content: systemPrompt,
      });
    }
  }

  /**
   * Send a message and get a response via the production backend
   */
  async sendMessage(message: string): Promise<string> {
    if (this.chatHistory.length === 0) {
      this.startChat(OPENCLAW_PROMPTS.general);
    }

    this.chatHistory.push({
      role: "user",
      content: message,
    });

    try {
      const data = await post<GeneralChatResponse>("/ai/general-chat", {
        messages: this.chatHistory,
        stream: false,
      });

      const reply = data.choices?.[0]?.message?.content || "";

      // Add assistant reply to history
      this.chatHistory.push({
        role: "assistant",
        content: reply,
      });

      return reply;
    } catch (error) {
      // Remove the failed user message from history
      this.chatHistory.pop();
      console.error("AI chat error:", error);
      throw error;
    }
  }

  /**
   * Generate a single response (no chat history)
   */
  async generateContent(
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    const messages: OpenClawMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const data = await post<GeneralChatResponse>("/ai/general-chat", {
      messages,
      stream: false,
    });

    return data.choices?.[0]?.message?.content || "";
  }

  /**
   * Clear chat history
   */
  clearChat(): void {
    this.chatHistory = [];
  }

  /**
   * Check if AI backend is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(
        "https://baotienweb.cloud/api/v1/ai/health",
        {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const openclawAI = new OpenClawAI();
