/**
 * Gemini AI Service
 * Service tích hợp Google Gemini AI cho chat support
 * 
 * @author AI Assistant
 * @date 05/01/2026
 */

import ENV from '@/config/env';
import { SERVICE_CATEGORIES, SERVICE_WORKERS } from './homeMaintenanceApi';

// ==================== TYPES ====================

export interface GeminiMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

export interface GeminiChatResponse {
  text: string;
  suggestions?: string[];
}

// ==================== CONFIG ====================

// Lấy API key từ env (nếu có)
const GEMINI_API_KEY = ENV.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

// System prompt cho Home Maintenance Support Bot
const HOME_MAINTENANCE_SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh của ứng dụng Dịch Vụ Bảo Trì Nhà.

**Vai trò:**
- Tư vấn khách hàng về các dịch vụ sửa chữa, bảo trì nhà cửa
- Giúp tìm thợ phù hợp với nhu cầu
- Giải đáp thắc mắc về giá cả, quy trình

**Dịch vụ có sẵn:**
${SERVICE_CATEGORIES.map(c => `- ${c.name.replace('\n', ' ')}: ${c.description || ''}`).join('\n')}

**Thợ tiêu biểu:**
${SERVICE_WORKERS.map(w => `- ${w.name}: ${w.specialty}, đánh giá ${w.rating}/5 (${w.reviews} đánh giá)`).join('\n')}

**Hướng dẫn:**
1. Trả lời ngắn gọn, thân thiện bằng tiếng Việt
2. Đề xuất dịch vụ/thợ phù hợp khi cần
3. Hỏi thêm thông tin nếu chưa rõ nhu cầu
4. Luôn chào hỏi lịch sự và cảm ơn khách hàng
5. Nếu không biết, hướng dẫn liên hệ hotline: 1900-xxxx`;

// ==================== MOCK RESPONSES ====================

const MOCK_RESPONSES: Record<string, string> = {
  'xin chào': 'Xin chào! 👋 Tôi là trợ lý AI của Dịch Vụ Bảo Trì Nhà. Tôi có thể giúp bạn:\n\n• Tìm thợ sửa chữa phù hợp\n• Tư vấn về dịch vụ bảo trì\n• Giải đáp thắc mắc về giá cả\n\nBạn cần hỗ trợ gì ạ?',
  'máy lạnh': 'Về dịch vụ **Điện lạnh & Máy lạnh** 🌡️:\n\n✅ Vệ sinh máy lạnh: 150.000đ - 300.000đ\n✅ Bơm gas: 200.000đ - 400.000đ\n✅ Sửa chữa: Tùy lỗi\n\n🔧 **Thợ đề xuất:** Nguyễn Văn An - 5 năm KN, đánh giá 4.9/5\n\nBạn muốn đặt lịch không ạ?',
  'camera': 'Về dịch vụ **Hệ thống Camera** 📹:\n\n✅ Lắp đặt camera: 200.000đ - 500.000đ/cái\n✅ Sửa chữa: 150.000đ - 300.000đ\n✅ Kiểm tra hệ thống: 100.000đ\n\n🔧 **Thợ đề xuất:** Trần Minh Đức - chuyên camera & mạng, đánh giá 5.0/5\n\nBạn cần tư vấn thêm không?',
  'giá': 'Bảng giá tham khảo các dịch vụ phổ biến:\n\n💰 **Điện lạnh:** 150.000đ - 500.000đ\n💰 **Camera:** 200.000đ - 800.000đ\n💰 **Điện nước:** 100.000đ - 400.000đ\n💰 **Vệ sinh:** 300.000đ - 1.000.000đ\n\n📝 *Giá thực tế tùy thuộc vào tình trạng cụ thể. Bạn cần báo giá chi tiết dịch vụ nào?*',
  'đặt lịch': 'Để đặt lịch dịch vụ, bạn vui lòng cho tôi biết:\n\n1️⃣ Loại dịch vụ cần sử dụng?\n2️⃣ Địa chỉ của bạn?\n3️⃣ Thời gian thuận tiện?\n\nHoặc bạn có thể bấm nút "Đặt lịch" ở trang chi tiết thợ để đặt trực tiếp!',
  'default': 'Cảm ơn bạn đã liên hệ! 😊\n\nTôi có thể giúp bạn:\n• Tìm thợ sửa chữa (máy lạnh, điện, nước, camera...)\n• Tư vấn dịch vụ bảo trì\n• Báo giá và đặt lịch\n\nBạn muốn biết thêm về dịch vụ nào?'
};

// ==================== HELPER FUNCTIONS ====================

function findMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  return MOCK_RESPONSES['default'];
}

function generateSuggestions(context: string): string[] {
  const suggestions = [
    'Tìm thợ sửa máy lạnh',
    'Báo giá dịch vụ',
    'Đặt lịch hẹn',
    'Xem thợ gần tôi'
  ];
  
  if (context.includes('máy lạnh') || context.includes('điện lạnh')) {
    return ['Vệ sinh máy lạnh', 'Bơm gas', 'Đặt lịch ngay'];
  }
  
  if (context.includes('camera')) {
    return ['Lắp camera mới', 'Sửa camera', 'Tư vấn hệ thống'];
  }
  
  return suggestions;
}

// ==================== MAIN SERVICE ====================

/**
 * Send message to Gemini AI
 */
export async function sendGeminiMessage(
  message: string,
  history: GeminiMessage[] = []
): Promise<GeminiChatResponse> {
  // Nếu không có API key, dùng mock responses
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PLACEHOLDER_API_KEY') {
    console.log('[GeminiService] No API key, using mock responses');
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    return {
      text: findMockResponse(message),
      suggestions: generateSuggestions(message)
    };
  }
  
  try {
    // Build messages array for Gemini
    const messages = [
      { role: 'user', parts: [{ text: HOME_MAINTENANCE_SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Đã hiểu. Tôi sẵn sàng hỗ trợ khách hàng.' }] },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn được không?';
    
    return {
      text: responseText,
      suggestions: generateSuggestions(responseText)
    };
    
  } catch (error) {
    console.error('[GeminiService] Error:', error);
    
    // Fallback to mock response
    return {
      text: findMockResponse(message),
      suggestions: generateSuggestions(message)
    };
  }
}

/**
 * Get initial greeting
 */
export function getGreeting(): GeminiChatResponse {
  return {
    text: 'Xin chào! 👋 Tôi là trợ lý AI của Dịch Vụ Bảo Trì Nhà.\n\nTôi có thể giúp bạn:\n• 🔧 Tìm thợ sửa chữa phù hợp\n• 💰 Tư vấn giá cả dịch vụ\n• 📅 Hỗ trợ đặt lịch hẹn\n\nBạn cần hỗ trợ gì hôm nay?',
    suggestions: ['Tìm thợ sửa máy lạnh', 'Xem bảng giá', 'Đặt lịch hẹn', 'Tư vấn dịch vụ']
  };
}

// ==================== EXPORTS ====================

export const geminiService = {
  sendMessage: sendGeminiMessage,
  getGreeting
};

export default geminiService;
