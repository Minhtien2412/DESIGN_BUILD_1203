/**
 * AI Router Service
 * Hệ thống định tuyến AI thông minh - điều hướng đến các tính năng AI phù hợp
 * Tích hợp ChatGPT, Gemini, và các AI components
 * Created: 19/01/2026
 */

import { chatGPTService } from "./api/chatGPTService";
import { geminiAI } from "./geminiAI";

// ==================== TYPES ====================

export interface AIFeature {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  route: string;
  icon: string;
  category: AICategory;
  keywords: string[];
  capabilities: string[];
  priority: number;
}

export type AICategory =
  | "assistant"
  | "design"
  | "construction"
  | "analysis"
  | "tools"
  | "search";

export interface AIRouterResult {
  feature: AIFeature | null;
  confidence: number;
  alternatives: AIFeature[];
  response: string;
  action: "navigate" | "respond" | "clarify";
}

export interface AIRouterContext {
  currentScreen?: string;
  userRole?: string;
  recentSearches?: string[];
  projectContext?: {
    projectId?: number;
    projectName?: string;
    projectType?: string;
  };
}

// ==================== AI FEATURES REGISTRY ====================

export const AI_FEATURES: AIFeature[] = [
  // === ASSISTANT ===
  {
    id: "ai_assistant",
    name: "AI Assistant",
    nameVi: "Trợ lý AI",
    description: "Trợ lý AI thông minh hỗ trợ mọi vấn đề xây dựng",
    route: "/ai",
    icon: "chatbubbles",
    category: "assistant",
    keywords: [
      "trợ lý",
      "assistant",
      "hỏi đáp",
      "chat",
      "giúp đỡ",
      "tư vấn",
      "hỗ trợ",
    ],
    capabilities: ["chat", "answer_questions", "provide_suggestions"],
    priority: 100,
  },
  {
    id: "ai_chatbot",
    name: "AI Chatbot",
    nameVi: "Chatbot AI",
    description: "Chatbot trả lời câu hỏi về xây dựng 24/7",
    route: "/ai/chatbot",
    icon: "chatbubble-ellipses",
    category: "assistant",
    keywords: ["chatbot", "bot", "trò chuyện", "hỏi", "nói chuyện"],
    capabilities: ["conversation", "faq", "support"],
    priority: 90,
  },

  // === DESIGN ===
  {
    id: "ai_architect",
    name: "AI Architect",
    nameVi: "AI Kiến Trúc Sư",
    description: "AI thiết kế kiến trúc và nội thất thông minh",
    route: "/ai-architect",
    icon: "cube",
    category: "design",
    keywords: [
      "kiến trúc",
      "architect",
      "thiết kế",
      "design",
      "bản vẽ",
      "mặt bằng",
      "layout",
      "3d",
      "render",
    ],
    capabilities: ["design_generation", "layout_planning", "style_suggestions"],
    priority: 95,
  },
  {
    id: "ai_design",
    name: "AI Design Studio",
    nameVi: "AI Studio Thiết Kế",
    description: "Studio thiết kế AI với Gemini",
    route: "/ai-design",
    icon: "color-palette",
    category: "design",
    keywords: [
      "studio",
      "thiết kế",
      "màu sắc",
      "phong cách",
      "nội thất",
      "trang trí",
    ],
    capabilities: ["color_palette", "style_matching", "interior_design"],
    priority: 85,
  },
  {
    id: "feng_shui_ai",
    name: "Feng Shui AI",
    nameVi: "AI Phong Thủy",
    description: "AI tư vấn phong thủy nhà ở và công trình",
    route: "/tools/feng-shui-ai",
    icon: "compass",
    category: "design",
    keywords: [
      "phong thủy",
      "feng shui",
      "phong thuỷ",
      "hướng nhà",
      "tuổi",
      "cung mệnh",
      "ngũ hành",
      "cát hung",
    ],
    capabilities: [
      "feng_shui_analysis",
      "direction_advice",
      "color_recommendation",
    ],
    priority: 88,
  },
  {
    id: "lo_ban_ruler",
    name: "Lo Ban Ruler",
    nameVi: "Thước Lỗ Ban",
    description: "Công cụ đo kích thước theo thước Lỗ Ban phong thủy",
    route: "/tools/lo-ban-ruler",
    icon: "resize",
    category: "tools",
    keywords: [
      "lỗ ban",
      "lo ban",
      "thước",
      "ruler",
      "kích thước",
      "đo",
      "cửa",
      "cung",
      "tài",
      "bệnh",
      "ly",
      "nghĩa",
      "quan",
      "kiếp",
      "hại",
      "bản",
      "phong thủy kích thước",
    ],
    capabilities: [
      "lo_ban_calculation",
      "dimension_check",
      "feng_shui_measure",
    ],
    priority: 86,
  },
  {
    id: "design_library",
    name: "Design Library",
    nameVi: "Thư viện Thiết Kế",
    description: "Thư viện hình ảnh nội thất ngoại thất đẹp",
    route: "/design-library",
    icon: "images",
    category: "design",
    keywords: [
      "thư viện",
      "library",
      "hình ảnh",
      "ảnh",
      "nội thất",
      "ngoại thất",
      "mẫu",
      "gallery",
    ],
    capabilities: ["image_library", "inspiration", "reference"],
    priority: 75,
  },

  // === CONSTRUCTION ===
  {
    id: "photo_analysis",
    name: "Photo Analysis",
    nameVi: "Phân Tích Ảnh Công Trình",
    description:
      "AI phân tích ảnh công trình để đánh giá tiến độ và chất lượng",
    route: "/ai/photo-analysis",
    icon: "camera",
    category: "construction",
    keywords: [
      "phân tích ảnh",
      "photo",
      "hình ảnh",
      "công trình",
      "tiến độ",
      "chất lượng",
      "kiểm tra",
    ],
    capabilities: ["image_analysis", "progress_detection", "quality_check"],
    priority: 92,
  },
  {
    id: "progress_prediction",
    name: "Progress Prediction",
    nameVi: "Dự Đoán Tiến Độ",
    description: "AI dự đoán tiến độ và thời gian hoàn thành công trình",
    route: "/ai/progress-prediction",
    icon: "stats-chart",
    category: "construction",
    keywords: [
      "tiến độ",
      "progress",
      "dự đoán",
      "predict",
      "thời gian",
      "hoàn thành",
      "deadline",
    ],
    capabilities: [
      "progress_analysis",
      "time_estimation",
      "deadline_prediction",
    ],
    priority: 88,
  },
  {
    id: "material_check",
    name: "Material Check",
    nameVi: "Kiểm Tra Vật Liệu",
    description: "AI kiểm tra và phân tích chất lượng vật liệu xây dựng",
    route: "/ai/material-check",
    icon: "cube-outline",
    category: "construction",
    keywords: [
      "vật liệu",
      "material",
      "kiểm tra",
      "check",
      "chất lượng",
      "quality",
      "gạch",
      "xi măng",
      "thép",
      "bê tông",
    ],
    capabilities: [
      "material_analysis",
      "quality_assessment",
      "specification_check",
    ],
    priority: 85,
  },
  {
    id: "generate_report",
    name: "Generate Report",
    nameVi: "Tạo Báo Cáo AI",
    description: "AI tự động tạo báo cáo tiến độ công trình",
    route: "/ai/generate-report",
    icon: "document-text",
    category: "construction",
    keywords: [
      "báo cáo",
      "report",
      "tạo",
      "generate",
      "tiến độ",
      "tổng hợp",
      "xuất",
    ],
    capabilities: ["report_generation", "summary", "documentation"],
    priority: 82,
  },

  // === ANALYSIS ===
  {
    id: "cost_estimator",
    name: "Cost Estimator",
    nameVi: "Ước Tính Chi Phí",
    description: "AI ước tính chi phí xây dựng dựa trên thông số dự án",
    route: "/ai/cost-estimator",
    icon: "calculator",
    category: "analysis",
    keywords: [
      "chi phí",
      "cost",
      "giá",
      "price",
      "ước tính",
      "estimate",
      "dự toán",
      "ngân sách",
      "budget",
    ],
    capabilities: ["cost_estimation", "budget_planning", "price_analysis"],
    priority: 90,
  },

  // === TOOLS ===
  {
    id: "calculators",
    name: "Construction Calculators",
    nameVi: "Bộ Tính Toán Xây Dựng",
    description: "Các công cụ tính toán vật liệu và chi phí xây dựng",
    route: "/calculators",
    icon: "calculator-outline",
    category: "tools",
    keywords: [
      "tính toán",
      "calculator",
      "công cụ",
      "tool",
      "gạch",
      "sơn",
      "bê tông",
      "thép",
      "diện tích",
    ],
    capabilities: ["material_calculator", "area_calculator", "unit_converter"],
    priority: 78,
  },

  // === SEARCH ===
  {
    id: "ai_search",
    name: "AI Search",
    nameVi: "Tìm Kiếm AI",
    description: "Tìm kiếm thông minh với AI hiểu ngữ cảnh",
    route: "/search",
    icon: "search",
    category: "search",
    keywords: ["tìm kiếm", "search", "tìm", "find", "tra cứu"],
    capabilities: ["semantic_search", "product_search", "content_search"],
    priority: 95,
  },
];

// ==================== AI ROUTER SERVICE ====================

class AIRouterService {
  private features: AIFeature[] = AI_FEATURES;
  private useChatGPT: boolean = true;

  /**
   * Chuẩn hóa tiếng Việt để so khớp
   */
  private normalizeVietnamese(str: string): string {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .trim();
  }

  /**
   * Tính điểm khớp giữa query và feature
   */
  private calculateMatchScore(query: string, feature: AIFeature): number {
    const normalizedQuery = this.normalizeVietnamese(query);
    const queryWords = normalizedQuery.split(/\s+/);
    let score = 0;

    // Check name match
    if (this.normalizeVietnamese(feature.name).includes(normalizedQuery)) {
      score += 50;
    }
    if (this.normalizeVietnamese(feature.nameVi).includes(normalizedQuery)) {
      score += 60;
    }

    // Check keywords match
    for (const keyword of feature.keywords) {
      const normalizedKeyword = this.normalizeVietnamese(keyword);
      if (normalizedQuery.includes(normalizedKeyword)) {
        score += 30;
      }
      if (normalizedKeyword.includes(normalizedQuery)) {
        score += 20;
      }
      // Partial word match
      for (const word of queryWords) {
        if (word.length >= 2 && normalizedKeyword.includes(word)) {
          score += 10;
        }
      }
    }

    // Check description match
    if (
      this.normalizeVietnamese(feature.description).includes(normalizedQuery)
    ) {
      score += 15;
    }

    // Boost by priority
    score += feature.priority / 10;

    return score;
  }

  /**
   * Tìm tính năng phù hợp nhất với query
   */
  findBestMatch(query: string): {
    feature: AIFeature | null;
    score: number;
    alternatives: AIFeature[];
  } {
    if (!query.trim()) {
      return { feature: null, score: 0, alternatives: [] };
    }

    const scores = this.features.map((feature) => ({
      feature,
      score: this.calculateMatchScore(query, feature),
    }));

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    const bestMatch = scores[0]?.score > 20 ? scores[0] : null;
    const alternatives = scores
      .slice(1, 4)
      .filter((s) => s.score > 15)
      .map((s) => s.feature);

    return {
      feature: bestMatch?.feature || null,
      score: bestMatch?.score || 0,
      alternatives,
    };
  }

  /**
   * Router AI - Phân tích và định tuyến thông minh
   */
  async routeQuery(
    query: string,
    context?: AIRouterContext
  ): Promise<AIRouterResult> {
    // First, try local matching
    const localMatch = this.findBestMatch(query);

    // If high confidence local match, return immediately
    if (localMatch.score > 80) {
      return {
        feature: localMatch.feature,
        confidence: Math.min(localMatch.score / 100, 1),
        alternatives: localMatch.alternatives,
        response: `Tôi có thể giúp bạn với "${localMatch.feature?.nameVi}". Bạn muốn tiếp tục không?`,
        action: "navigate",
      };
    }

    // Try AI-powered routing for complex queries
    try {
      const aiResponse = await this.analyzeWithAI(query, context);

      if (aiResponse) {
        // Combine AI insight with local matching
        const combinedFeature = aiResponse.suggestedFeatureId
          ? this.features.find((f) => f.id === aiResponse.suggestedFeatureId) ||
            localMatch.feature
          : localMatch.feature;

        return {
          feature: combinedFeature,
          confidence: aiResponse.confidence || localMatch.score / 100,
          alternatives: localMatch.alternatives,
          response: aiResponse.response,
          action: aiResponse.needsClarification
            ? "clarify"
            : combinedFeature
              ? "navigate"
              : "respond",
        };
      }
    } catch (error) {
      console.warn("AI routing failed, using local match:", error);
    }

    // Fallback to local match
    if (localMatch.feature) {
      return {
        feature: localMatch.feature,
        confidence: localMatch.score / 100,
        alternatives: localMatch.alternatives,
        response: `Tìm thấy: ${localMatch.feature.nameVi}. ${localMatch.feature.description}`,
        action: "navigate",
      };
    }

    // No match found
    return {
      feature: null,
      confidence: 0,
      alternatives: this.getPopularFeatures(),
      response: `Tôi chưa hiểu rõ yêu cầu "${query}". Bạn có thể mô tả chi tiết hơn hoặc chọn một trong các tính năng gợi ý.`,
      action: "clarify",
    };
  }

  /**
   * Phân tích query với AI (ChatGPT/Gemini)
   */
  private async analyzeWithAI(
    query: string,
    context?: AIRouterContext
  ): Promise<{
    suggestedFeatureId?: string;
    confidence: number;
    response: string;
    needsClarification: boolean;
  } | null> {
    const featureList = this.features
      .map(
        (f) => `- ${f.id}: ${f.nameVi} (${f.keywords.slice(0, 3).join(", ")})`
      )
      .join("\n");

    const prompt = `Bạn là AI Router cho ứng dụng xây dựng. Phân tích yêu cầu người dùng và chọn tính năng phù hợp nhất.

DANH SÁCH TÍNH NĂNG:
${featureList}

YÊU CẦU NGƯỜI DÙNG: "${query}"
${context?.projectContext ? `CONTEXT: Dự án "${context.projectContext.projectName}"` : ""}

Trả về JSON:
{
  "suggestedFeatureId": "id của tính năng phù hợp nhất hoặc null",
  "confidence": 0.0-1.0,
  "response": "Câu trả lời ngắn gọn cho người dùng",
  "needsClarification": true/false
}`;

    try {
      let response: string | null = null;

      // Try ChatGPT first
      if (this.useChatGPT && chatGPTService.isConfigured()) {
        response = await chatGPTService.sendMessage(prompt);
      }

      // Fallback to Gemini
      if (!response) {
        response = await geminiAI.generateContent(prompt);
      }

      if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error("AI analysis error:", error);
    }

    return null;
  }

  /**
   * Lấy tất cả tính năng
   */
  getAllFeatures(): AIFeature[] {
    return [...this.features];
  }

  /**
   * Lấy danh sách tính năng phổ biến
   */
  getPopularFeatures(limit: number = 6): AIFeature[] {
    return [...this.features]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  /**
   * Lấy tính năng theo category
   */
  getFeaturesByCategory(category: AICategory): AIFeature[] {
    return this.features.filter((f) => f.category === category);
  }

  /**
   * Lấy tính năng theo ID
   */
  getFeatureById(id: string): AIFeature | undefined {
    return this.features.find((f) => f.id === id);
  }

  /**
   * Tìm kiếm tính năng
   */
  searchFeatures(query: string): AIFeature[] {
    if (!query.trim()) return [];

    return this.features
      .map((feature) => ({
        feature,
        score: this.calculateMatchScore(query, feature),
      }))
      .filter((item) => item.score > 10)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.feature);
  }

  /**
   * Gợi ý tính năng dựa trên context
   */
  suggestFeatures(context: AIRouterContext): AIFeature[] {
    const suggestions: AIFeature[] = [];

    // Suggest based on current screen
    if (context.currentScreen?.includes("design")) {
      suggestions.push(...this.getFeaturesByCategory("design"));
    } else if (context.currentScreen?.includes("construction")) {
      suggestions.push(...this.getFeaturesByCategory("construction"));
    }

    // Suggest based on recent searches
    if (context.recentSearches?.length) {
      for (const search of context.recentSearches.slice(0, 3)) {
        const matches = this.searchFeatures(search);
        suggestions.push(...matches.slice(0, 2));
      }
    }

    // Remove duplicates and return top suggestions
    const uniqueIds = new Set<string>();
    return suggestions
      .filter((f) => {
        if (uniqueIds.has(f.id)) return false;
        uniqueIds.add(f.id);
        return true;
      })
      .slice(0, 6);
  }

  /**
   * Quick action helpers
   */
  getQuickActions(): {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    route: string;
    color: string;
  }[] {
    return [
      {
        id: "chat",
        title: "Chat với AI",
        subtitle: "Hỏi đáp mọi vấn đề",
        icon: "chatbubbles",
        route: "/ai",
        color: "#6366f1",
      },
      {
        id: "photo",
        title: "Phân tích ảnh",
        subtitle: "Đánh giá công trình",
        icon: "camera",
        route: "/ai/photo-analysis",
        color: "#ec4899",
      },
      {
        id: "cost",
        title: "Ước tính chi phí",
        subtitle: "Dự toán ngân sách",
        icon: "calculator",
        route: "/ai/cost-estimator",
        color: "#10b981",
      },
      {
        id: "design",
        title: "Thiết kế AI",
        subtitle: "Tạo bản vẽ thông minh",
        icon: "cube",
        route: "/ai-architect",
        color: "#f59e0b",
      },
      {
        id: "fengshui",
        title: "Phong thủy",
        subtitle: "Tư vấn hướng nhà",
        icon: "compass",
        route: "/tools/feng-shui-ai",
        color: "#8b5cf6",
      },
      {
        id: "report",
        title: "Báo cáo AI",
        subtitle: "Tạo báo cáo tự động",
        icon: "document-text",
        route: "/ai/generate-report",
        color: "#06b6d4",
      },
    ];
  }
}

// ==================== EXPORT ====================

export const aiRouterService = new AIRouterService();

export default aiRouterService;
