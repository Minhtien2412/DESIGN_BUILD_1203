/**
 * Gemini AI Service
 * Tích hợp Google Gemini AI cho tính năng thiết kế
 */

import ENV from "@/config/env";

// Note: @google/genai package may not be installed or have different exports
// Using REST API directly is more reliable
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.0-flash";

// Khởi tạo Gemini AI client (simplified version)
const getGeminiApiKey = () => {
  const apiKey = ENV.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY chưa được cấu hình trong .env");
  }
  return apiKey;
};

// Helper to call Gemini REST API
interface GeminiApiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    groundingMetadata?: {
      webSearchQueries?: string[];
      searchEntryPoint?: { renderedContent?: string };
      groundingSupports?: {
        segment?: { text?: string };
        groundingChunkIndices?: number[];
        confidenceScores?: number[];
        web?: { uri?: string; title?: string };
      }[];
    };
  }[];
  error?: { message?: string };
}

async function callGeminiApi(
  model: string,
  prompt: string,
  options?: { temperature?: number; maxOutputTokens?: number }
): Promise<{
  text: string;
  groundingLinks?: { title: string; uri: string }[];
}> {
  const apiKey = getGeminiApiKey();
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxOutputTokens ?? 2048,
      },
    }),
  });

  const data = (await response.json()) as GeminiApiResponse;

  if (data.error) {
    throw new Error(data.error.message || "Gemini API error");
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const groundingLinks =
    data.candidates?.[0]?.groundingMetadata?.groundingSupports
      ?.filter((s) => s.web?.uri)
      .map((s) => ({ title: s.web?.title || "", uri: s.web?.uri || "" })) || [];

  return { text, groundingLinks };
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: Date;
  groundingLinks?: { title: string; uri: string }[];
}

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
  quality?: "1K" | "2K" | "4K";
  negativePrompt?: string;
}

export interface ArchitectureDiagramOptions {
  description: string;
  style?: "modern" | "classic" | "minimal";
  components?: string[];
}

export interface CodeImplementationOptions {
  feature: string;
  language: "typescript" | "javascript" | "python" | "php";
  framework?: string;
  includeTests?: boolean;
}

/**
 * Chat với AI Consultant
 */
export const chatWithAI = async (
  messages: ChatMessage[],
  newMessage: string
): Promise<ChatMessage> => {
  try {
    // Build conversation context
    const conversationContext = messages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}`
      )
      .join("\n\n");

    const prompt = conversationContext
      ? `${conversationContext}\n\nUser: ${newMessage}\n\nAssistant:`
      : newMessage;

    const result = await callGeminiApi("gemini-2.0-flash", prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    return {
      role: "model",
      text: result.text,
      timestamp: new Date(),
      groundingLinks: result.groundingLinks,
    };
  } catch (error) {
    console.error("Lỗi chat với AI:", error);
    throw new Error(
      `Không thể chat với AI: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Tạo sơ đồ kiến trúc SVG
 */
export const generateArchitectureDiagram = async (
  options: ArchitectureDiagramOptions
): Promise<string> => {
  try {
    const prompt = `
Tạo một sơ đồ kiến trúc hệ thống dưới dạng SVG cho:
${options.description}

${options.components ? `Bao gồm các components: ${options.components.join(", ")}` : ""}
Style: ${options.style || "modern"}

Yêu cầu:
- Trả về mã SVG hoàn chỉnh
- Sử dụng màu sắc chuyên nghiệp
- Các components được kết nối rõ ràng
- Có chú thích và labels
- Kích thước responsive (viewBox)
- Chỉ trả về SVG code, không giải thích
`;

    const result = await callGeminiApi("gemini-2.0-flash", prompt, {
      temperature: 0.5,
    });
    let svgCode = result.text;

    // Extract SVG from markdown code blocks if present
    svgCode = svgCode
      .replace(/```svg\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Ensure it's valid SVG
    if (!svgCode.includes("<svg")) {
      throw new Error("AI không trả về SVG hợp lệ");
    }

    return svgCode;
  } catch (error) {
    console.error("Lỗi tạo sơ đồ kiến trúc:", error);
    throw new Error(
      `Không thể tạo sơ đồ: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Tạo code implementation
 */
export const generateCodeImplementation = async (
  options: CodeImplementationOptions
): Promise<string> => {
  try {
    const prompt = `
Tạo code implementation cho: ${options.feature}

Language: ${options.language}
${options.framework ? `Framework: ${options.framework}` : ""}
${options.includeTests ? "Bao gồm unit tests" : ""}

Yêu cầu:
- Code sạch, có comments tiếng Việt
- Follow best practices
- Type-safe (nếu áp dụng)
- Error handling
- Production-ready
${options.includeTests ? "- Test coverage > 80%" : ""}

Trả về code hoàn chỉnh, có thể chạy ngay.
`;

    const result = await callGeminiApi("gemini-2.0-flash", prompt, {
      temperature: 0.3,
    });
    let code = result.text;

    // Extract code from markdown code blocks
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = code.match(codeBlockRegex);
    if (matches && matches.length > 0) {
      // Return first code block
      code = matches[0]
        .replace(/```[\w]*\n?/g, "")
        .replace(/```\n?$/g, "")
        .trim();
    }

    return code;
  } catch (error) {
    console.error("Lỗi tạo code:", error);
    throw new Error(
      `Không thể tạo code: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Tạo hình ảnh thiết kế (sử dụng Imagen hoặc tích hợp service khác)
 * Note: Gemini API hiện tại không hỗ trợ image generation trực tiếp
 * Cần tích hợp với Imagen API riêng hoặc sử dụng alternative
 */
export const generateDesignImage = async (
  options: ImageGenerationOptions
): Promise<string> => {
  // TODO: Tích hợp với Imagen API hoặc alternative service
  // Hiện tại return placeholder
  throw new Error("Image generation chưa được tích hợp. Cần Imagen API key.");
};

/**
 * Phân tích hình ảnh và đưa ra gợi ý thiết kế
 */
export const analyzeDesignImage = async (
  imageBase64: string,
  promptText?: string
): Promise<string> => {
  try {
    const apiKey = getGeminiApiKey();
    const url = `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const imagePart = {
      inlineData: {
        data: imageBase64.split(",")[1] || imageBase64,
        mimeType: "image/jpeg",
      },
    };

    const textPrompt =
      promptText ||
      `
Phân tích hình ảnh thiết kế này và đưa ra:
1. Mô tả chi tiết về thiết kế
2. Phong cách kiến trúc/design
3. Màu sắc chủ đạo
4. Điểm mạnh và điểm cần cải thiện
5. Gợi ý tối ưu hóa

Trả lời bằng tiếng Việt, chuyên nghiệp.
`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: textPrompt }, imagePart],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Không thể phân tích hình ảnh"
    );
  } catch (error) {
    console.error("Lỗi phân tích hình ảnh:", error);
    throw new Error(
      `Không thể phân tích hình ảnh: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Tạo prompt tối ưu cho image generation
 */
export const optimizeImagePrompt = async (
  userPrompt: string,
  style?: string
): Promise<string> => {
  try {
    const prompt = `
Tối ưu hóa prompt sau để tạo hình ảnh thiết kế chất lượng cao:
"${userPrompt}"

${style ? `Style: ${style}` : ""}

Trả về:
1. Enhanced prompt (tiếng Anh, chi tiết, kỹ thuật)
2. Negative prompt (những gì cần tránh)
3. Gợi ý về lighting, composition, camera angle

Format JSON:
{
  "enhancedPrompt": "...",
  "negativePrompt": "...",
  "suggestions": ["..."]
}
`;

    const result = await callGeminiApi("gemini-2.0-flash", prompt, {
      temperature: 0.7,
    });
    const text = result.text;

    // Try to parse JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.enhancedPrompt || text;
      }
    } catch (e) {
      // If JSON parsing fails, return raw text
    }

    return text;
  } catch (error) {
    console.error("Lỗi tối ưu prompt:", error);
    return userPrompt; // Fallback to original prompt
  }
};

/**
 * Helper: Extract grounding links from response
 */
function extractGroundingLinks(
  response: any
): { title: string; uri: string }[] | undefined {
  // TODO: Implement if Gemini provides grounding metadata
  return undefined;
}

/**
 * Tạo video animation từ hình ảnh (placeholder)
 */
export const generateVideoAnimation = async (
  imageBase64: string,
  animationStyle: "pan" | "zoom" | "rotate" | "parallax",
  duration: number = 5
): Promise<string> => {
  // TODO: Implement video generation logic
  throw new Error("Video animation chưa được tích hợp.");
};

/**
 * Export thiết kế với metadata
 */
export const exportDesignWithMetadata = async (
  imageUri: string,
  metadata: {
    prompt: string;
    style?: string;
    timestamp: Date;
    settings?: Record<string, any>;
  }
): Promise<{ uri: string; metadata: string }> => {
  // TODO: Implement export logic with EXIF metadata
  return {
    uri: imageUri,
    metadata: JSON.stringify(metadata, null, 2),
  };
};

export default {
  chatWithAI,
  generateArchitectureDiagram,
  generateCodeImplementation,
  generateDesignImage,
  analyzeDesignImage,
  optimizeImagePrompt,
  generateVideoAnimation,
  exportDesignWithMetadata,
};
