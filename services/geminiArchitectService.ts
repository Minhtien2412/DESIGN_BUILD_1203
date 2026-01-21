/**
 * Gemini AI Service for Architecture Design
 * Tích hợp Gemini 2.0 Flash cho các tính năng AI Architect
 * Sử dụng REST API để tương thích với React Native/Expo
 */

// API Key từ environment hoặc config
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// System instruction cho AI Architect
const ARCHITECT_SYSTEM_INSTRUCTION = `Bạn là một AI Kiến trúc sư cao cấp, chuyên gia về:
1. Thiết kế kiến trúc resort, biệt thự, nhà ở cao cấp
2. Tích hợp hệ thống CRM Perfex cho quản lý dự án kiến trúc
3. Phát triển module PHP cho Perfex CRM
4. Tích hợp AI Gemini vào các hệ thống quản lý

Bạn có thể:
- Tư vấn thiết kế kiến trúc chi tiết
- Tạo sơ đồ hệ thống (mermaid, SVG)
- Viết code PHP cho Perfex CRM hooks, controllers, models
- Phân tích và tối ưu quy trình làm việc

Luôn trả lời bằng tiếng Việt, chuyên nghiệp và chi tiết.`;

// Kiểu dữ liệu
export interface ArchitectMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  metadata?: {
    type?: 'code' | 'diagram' | 'image' | 'text';
    language?: string;
  };
}

export interface SystemStatus {
  gemini: boolean;
  perfexApi: boolean;
  lastCheck: Date;
}

export interface DiagramResult {
  svg: string;
  description: string;
}

export interface CodeGenerationResult {
  code: string;
  language: string;
  filename: string;
  description: string;
}

// Phong cách kiến trúc
export const ARCHITECTURE_STYLES = [
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    nameVi: 'Hiện Đại Sang Trọng',
    description: 'Thiết kế tối giản, đường nét sắc sảo với vật liệu cao cấp',
    tags: ['minimalist', 'glass', 'concrete', 'luxury'],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  },
  {
    id: 'neoclassical',
    name: 'Neoclassical',
    nameVi: 'Tân Cổ Điển',
    description: 'Kết hợp yếu tố cổ điển Châu Âu với tiện nghi hiện đại',
    tags: ['classic', 'columns', 'ornate', 'elegant'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
  {
    id: 'tropical',
    name: 'Tropical Resort',
    nameVi: 'Resort Nhiệt Đới',
    description: 'Hòa quyện với thiên nhiên, không gian mở thoáng đãng',
    tags: ['nature', 'open-air', 'pool', 'garden'],
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    nameVi: 'Tối Giản',
    description: 'Đơn giản, tinh tế, tập trung vào công năng',
    tags: ['simple', 'clean', 'functional', 'white'],
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    nameVi: 'Công Nghiệp',
    description: 'Phong cách loft, trần cao, vật liệu thô',
    tags: ['loft', 'brick', 'metal', 'raw'],
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400',
  },
  {
    id: 'japanese',
    name: 'Japanese Zen',
    nameVi: 'Zen Nhật Bản',
    description: 'Yên bình, hài hòa với thiên nhiên, vật liệu tự nhiên',
    tags: ['zen', 'wood', 'garden', 'peaceful'],
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    nameVi: 'Địa Trung Hải',
    description: 'Màu trắng xanh, vòm cong, không gian ngoài trời',
    tags: ['white', 'blue', 'arches', 'terrace'],
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400',
  },
  {
    id: 'eco-friendly',
    name: 'Eco-Friendly',
    nameVi: 'Sinh Thái',
    description: 'Bền vững, năng lượng xanh, vật liệu tái chế',
    tags: ['green', 'solar', 'sustainable', 'garden'],
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400',
  },
];

// Chủ đề tư vấn
export const CONSULTING_TOPICS = [
  {
    id: 'perfex-modules',
    title: 'Perfex CRM Modules',
    icon: '🔧',
    questions: [
      'Cách tạo custom module trong Perfex CRM?',
      'Hook system hoạt động như thế nào?',
      'Tích hợp database table mới vào Perfex?',
    ],
  },
  {
    id: 'gemini-integration',
    title: 'Tích hợp Gemini AI',
    icon: '🤖',
    questions: [
      'Cách gọi Gemini API từ PHP?',
      'Xử lý streaming response từ Gemini?',
      'Prompt engineering cho thiết kế kiến trúc?',
    ],
  },
  {
    id: 'architecture-design',
    title: 'Thiết Kế Kiến Trúc',
    icon: '🏛️',
    questions: [
      'Nguyên tắc thiết kế biệt thự hiện đại?',
      'Tối ưu không gian cho resort?',
      'Xu hướng kiến trúc 2025?',
    ],
  },
  {
    id: 'project-management',
    title: 'Quản Lý Dự Án',
    icon: '📊',
    questions: [
      'Workflow quản lý dự án kiến trúc?',
      'Tích hợp timeline vào CRM?',
      'Tracking tiến độ thi công?',
    ],
  },
  {
    id: 'client-portal',
    title: 'Client Portal',
    icon: '👥',
    questions: [
      'Xây dựng portal cho khách hàng?',
      'Tính năng xem thiết kế 3D online?',
      'Hệ thống feedback và approval?',
    ],
  },
  {
    id: 'automation',
    title: 'Tự Động Hóa',
    icon: '⚡',
    questions: [
      'Auto-generate proposal từ yêu cầu?',
      'Tự động tạo báo giá chi tiết?',
      'Email automation cho dự án?',
    ],
  },
];

// Code templates cho Perfex CRM
export const CODE_TEMPLATES = [
  {
    id: 'gemini-hook',
    name: 'Gemini AI Hook',
    description: 'Hook tích hợp Gemini vào Perfex CRM',
    type: 'hook',
  },
  {
    id: 'ai-controller',
    name: 'AI Controller',
    description: 'Controller xử lý AI requests',
    type: 'controller',
  },
  {
    id: 'gemini-library',
    name: 'Gemini Library',
    description: 'Library wrapper cho Gemini API',
    type: 'library',
  },
];

// Quick Actions
export const QUICK_ACTIONS = [
  { id: 'new-diagram', icon: '📐', label: 'Tạo Sơ Đồ' },
  { id: 'generate-code', icon: '💻', label: 'Sinh Code' },
  { id: 'design-consult', icon: '🎨', label: 'Tư Vấn Thiết Kế' },
  { id: 'api-docs', icon: '📚', label: 'API Docs' },
  { id: 'templates', icon: '📋', label: 'Templates' },
  { id: 'settings', icon: '⚙️', label: 'Cài Đặt' },
];

// Service class - Using REST API for React Native compatibility
class GeminiArchitectService {
  private conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  constructor() {
    // No SDK initialization needed - using REST API
  }

  /**
   * Call Gemini API via REST
   */
  private async callGeminiAPI(prompt: string, systemInstruction?: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const requestBody: {
      contents: Array<{ role: string; parts: Array<{ text: string }> }>;
      systemInstruction?: { parts: Array<{ text: string }> };
    } = {
      contents: [
        ...this.conversationHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
    };

    if (systemInstruction) {
      requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Update conversation history
    this.conversationHistory.push({ role: 'user', parts: [{ text: prompt }] });
    this.conversationHistory.push({ role: 'model', parts: [{ text }] });

    return text;
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  async checkStatus(): Promise<SystemStatus> {
    const status: SystemStatus = {
      gemini: false,
      perfexApi: false,
      lastCheck: new Date(),
    };

    // Check Gemini
    if (GEMINI_API_KEY) {
      try {
        await this.callGeminiAPI('Hello', undefined);
        status.gemini = true;
      } catch {
        status.gemini = false;
      }
    }

    // Check Perfex API
    try {
      const response = await fetch('https://thietkeresort.com.vn/perfex_crm/api/customers', {
        method: 'GET',
        headers: {
          'authtoken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJQZXJmZXggQ1JNIiwidXNlcl9pZCI6IjEiLCJzdGFmZl9lbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsImlhdCI6MTc0OTcwNzEyMiwiZXhwIjoxOTI0NTA3MTIyfQ.2nMy1wNfLrAmCmFmUepbxjSfb1_bGPkPSQ6fDFJP89Y',
        },
      });
      status.perfexApi = response.ok;
    } catch {
      status.perfexApi = false;
    }

    return status;
  }

  /**
   * Khởi tạo chat session (reset conversation)
   */
  initChatSession(): void {
    this.conversationHistory = [];
  }

  /**
   * Gửi tin nhắn chat
   */
  async sendMessage(message: string): Promise<{ text: string; error?: string }> {
    try {
      const text = await this.callGeminiAPI(message, ARCHITECT_SYSTEM_INSTRUCTION);
      return { text };
    } catch (error) {
      console.error('Chat error:', error);
      return { text: '', error: 'Không thể kết nối AI. Vui lòng kiểm tra API key.' };
    }
  }

  /**
   * Tạo sơ đồ kiến trúc hệ thống
   */
  async generateArchitectureDiagram(description: string): Promise<DiagramResult> {
    const prompt = `Tạo sơ đồ kiến trúc hệ thống dạng Mermaid flowchart cho: ${description}

Yêu cầu:
- Sử dụng Mermaid flowchart syntax
- Bao gồm các components chính
- Hiển thị luồng dữ liệu
- Đặt tên tiếng Việt cho các node

Chỉ trả về code Mermaid, không giải thích.`;

    const result = await this.sendMessage(prompt);
    
    // Extract mermaid code
    let mermaidCode = result.text;
    const match = mermaidCode.match(/```mermaid\n([\s\S]*?)\n```/);
    if (match) {
      mermaidCode = match[1];
    }

    return {
      svg: mermaidCode,
      description: description,
    };
  }

  /**
   * Sinh code PHP cho Perfex CRM
   */
  async generatePHPCode(
    codeType: 'hook' | 'controller' | 'model' | 'helper' | 'api',
    requirements: string
  ): Promise<CodeGenerationResult> {
    const templates: Record<string, string> = {
      hook: `Tạo Perfex CRM hook PHP với các yêu cầu: ${requirements}

Cấu trúc:
- File: modules/[module_name]/hooks/[hook_name].php
- Sử dụng hooks system của Perfex
- Có comments tiếng Việt
- Xử lý error handling`,

      controller: `Tạo Perfex CRM controller PHP: ${requirements}

Cấu trúc:
- Extends AdminController
- CRUD operations
- Validation
- Response JSON
- Comments tiếng Việt`,

      model: `Tạo Perfex CRM model PHP: ${requirements}

Cấu trúc:
- Extends App_Model
- Database operations
- Relationships
- Soft delete support
- Comments tiếng Việt`,

      helper: `Tạo Perfex CRM helper function PHP: ${requirements}

Cấu trúc:
- Pure functions
- Reusable
- Type hints
- Documentation`,

      api: `Tạo Perfex CRM REST API endpoint: ${requirements}

Cấu trúc:
- RESTful design
- Authentication
- Rate limiting
- JSON response
- Error handling`,
    };

    const prompt = templates[codeType] || templates.hook;
    const result = await this.sendMessage(prompt);

    // Extract PHP code
    let code = result.text;
    const match = code.match(/```php\n([\s\S]*?)\n```/);
    if (match) {
      code = match[1];
    }

    const filenames: Record<string, string> = {
      hook: 'custom_hook.php',
      controller: 'Custom_controller.php',
      model: 'Custom_model.php',
      helper: 'custom_helper.php',
      api: 'api_endpoint.php',
    };

    return {
      code,
      language: 'php',
      filename: filenames[codeType],
      description: requirements,
    };
  }

  /**
   * Tư vấn thiết kế kiến trúc
   */
  async consultDesign(question: string, style?: string): Promise<string> {
    let prompt = question;
    
    if (style) {
      const styleInfo = ARCHITECTURE_STYLES.find(s => s.id === style);
      if (styleInfo) {
        prompt = `Với phong cách ${styleInfo.nameVi} (${styleInfo.name}): ${question}`;
      }
    }

    const result = await this.sendMessage(prompt);
    return result.text || 'Không thể tạo tư vấn. Vui lòng thử lại.';
  }

  /**
   * Phân tích yêu cầu dự án
   */
  async analyzeProjectRequirements(requirements: string): Promise<{
    summary: string;
    recommendations: string[];
    estimatedModules: string[];
    complexity: 'low' | 'medium' | 'high';
  }> {
    const prompt = `Phân tích yêu cầu dự án kiến trúc sau và trả về JSON:
${requirements}

Trả về format:
{
  "summary": "Tóm tắt dự án",
  "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2"],
  "estimatedModules": ["Module cần phát triển"],
  "complexity": "low|medium|high"
}`;

    const result = await this.sendMessage(prompt);
    
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse analysis result:', error);
    }

    return {
      summary: 'Không thể phân tích yêu cầu',
      recommendations: [],
      estimatedModules: [],
      complexity: 'medium',
    };
  }
}

// Export singleton instance
export const geminiArchitectService = new GeminiArchitectService();
