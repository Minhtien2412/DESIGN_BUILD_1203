/**
 * ChatGPT Service - Tích hợp OpenAI ChatGPT API
 * Dịch vụ gọi API ChatGPT cho các tính năng AI
 * @author AI Assistant
 * @date 14/01/2026
 */

import { ENV } from "@/config/env";
import { AI_CONFIG } from "@/config/externalApis";

// ==================== TYPES ====================

export interface ChatGPTMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatGPTRequest {
  model: string;
  messages: ChatGPTMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatGPTChoice {
  index: number;
  message: ChatGPTMessage;
  finish_reason: string;
}

export interface ChatGPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatGPTChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatGPTError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

// ==================== CONFIG ====================

const DEFAULT_CONFIG = {
  model: "gpt-4o-mini", // Model hiệu quả và tiết kiệm
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

// ==================== CHATGPT SERVICE ====================

class ChatGPTService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = ENV.OPENAI_API_KEY || AI_CONFIG.openai.apiKey || "";
    this.baseUrl = AI_CONFIG.openai.baseUrl || "https://api.openai.com/v1";
    this.model = AI_CONFIG.openai.model || DEFAULT_CONFIG.model;
  }

  /**
   * Kiểm tra API key có hợp lệ không
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith("sk-");
  }

  /**
   * Gọi ChatGPT API để hoàn thành cuộc hội thoại
   */
  async chat(
    messages: ChatGPTMessage[],
    options?: Partial<typeof DEFAULT_CONFIG>
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("OpenAI API key is not configured");
    }

    const config = { ...DEFAULT_CONFIG, ...options };

    const requestBody: ChatGPTRequest = {
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      top_p: config.top_p,
      frequency_penalty: config.frequency_penalty,
      presence_penalty: config.presence_penalty,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ChatGPTError;
        throw new Error(
          errorData.error?.message || `HTTP error ${response.status}`
        );
      }

      const data = (await response.json()) as ChatGPTResponse;

      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error("No response from ChatGPT");
    } catch (error) {
      console.error("[ChatGPT] API Error:", error);
      throw error;
    }
  }

  /**
   * Gửi một tin nhắn đơn giản với system prompt
   */
  async sendMessage(
    message: string,
    systemPrompt?: string,
    conversationHistory?: ChatGPTMessage[]
  ): Promise<string> {
    const messages: ChatGPTMessage[] = [];

    // Thêm system prompt nếu có
    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    // Thêm lịch sử cuộc hội thoại nếu có
    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    // Thêm tin nhắn hiện tại
    messages.push({
      role: "user",
      content: message,
    });

    return this.chat(messages);
  }

  /**
   * Streaming response (cho những response dài)
   */
  async streamChat(
    messages: ChatGPTMessage[],
    onChunk: (chunk: string) => void,
    options?: Partial<typeof DEFAULT_CONFIG>
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("OpenAI API key is not configured");
    }

    const config = { ...DEFAULT_CONFIG, ...options };

    const requestBody = {
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      stream: true,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const json = JSON.parse(jsonStr);
              const content = json.choices?.[0]?.delta?.content || "";
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullContent;
    } catch (error) {
      console.error("[ChatGPT] Stream Error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatGPTService = new ChatGPTService();
export default chatGPTService;
