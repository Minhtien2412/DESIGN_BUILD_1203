/**
 * AI Customer Support Service
 * ============================
 *
 * Dịch vụ CSKH AI sử dụng OpenAI API
 * - Chat với AI thay mặt app
 * - Lưu lịch sử chat vào database
 * - Hỗ trợ 24/7 tự động
 *
 * @author ThietKeResort Team
 * @created 2026-01-27
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";

// ============================================
// TYPES
// ============================================

export interface CSKHMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  status?: "sending" | "sent" | "failed";
}

export interface CSKHConversation {
  id: string;
  userId: string;
  messages: CSKHMessage[];
  createdAt: string;
  updatedAt: string;
  status: "active" | "closed";
}

export interface CSKHResponse {
  success: boolean;
  message?: string;
  data?: {
    reply: string;
    conversationId: string;
    messageId: string;
  };
  error?: string;
}

// ============================================
// CONFIG
// ============================================

const CSKH_CONFIG = {
  // System prompt cho AI CSKH
  systemPrompt: `Bạn là Trợ lý CSKH của ứng dụng "Thiết Kế Resort" - một nền tảng thương mại điện tử và quản lý dự án xây dựng/thiết kế nội thất tại Việt Nam.

THÔNG TIN ỨNG DỤNG:
- Tên: Thiết Kế Resort / Design Build
- Chức năng chính: Mua bán vật liệu xây dựng, thiết kế nội thất, quản lý dự án xây dựng
- Dịch vụ: Tư vấn thiết kế, báo giá, đặt hàng vật liệu, theo dõi tiến độ dự án
- Hotline: 1900-xxxx
- Email: support@thietkeresort.vn
- Website: thietkeresort.vn

NGUYÊN TẮC TRẢ LỜI:
1. Luôn thân thiện, lịch sự, chuyên nghiệp
2. Trả lời bằng tiếng Việt
3. Giải đáp thắc mắc về sản phẩm, dịch vụ, đơn hàng, tài khoản
4. Hướng dẫn sử dụng ứng dụng
5. Nếu không biết câu trả lời, hãy xin lỗi và đề nghị chuyển cho nhân viên hỗ trợ
6. Không đưa ra thông tin sai lệch
7. Luôn kết thúc bằng câu hỏi xem còn cần hỗ trợ gì không

CÁC CHỦ ĐỀ HỖ TRỢ:
- Đăng ký/Đăng nhập tài khoản
- Quên mật khẩu
- Tìm kiếm sản phẩm
- Đặt hàng và thanh toán
- Theo dõi đơn hàng
- Đổi trả, hoàn tiền
- Tạo dự án xây dựng
- Tìm thợ/nhà thầu
- Báo giá thi công
- Khiếu nại, góp ý`,

  // Tên và avatar của CSKH
  cskhName: "CSKH Thiết Kế Resort",
  cskhAvatar:
    "https://ui-avatars.com/api/?name=CSKH+Design+Build&background=10B981&color=fff&size=100&bold=true",

  // Local storage key
  conversationStorageKey: "@cskh_conversations",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

async function getLocalConversations(
  userId: string,
): Promise<CSKHConversation[]> {
  try {
    const key = `${CSKH_CONFIG.conversationStorageKey}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[CSKH] Error loading local conversations:", error);
    return [];
  }
}

async function saveLocalConversation(
  userId: string,
  conversation: CSKHConversation,
): Promise<void> {
  try {
    const key = `${CSKH_CONFIG.conversationStorageKey}_${userId}`;
    const conversations = await getLocalConversations(userId);

    const existingIndex = conversations.findIndex(
      (c) => c.id === conversation.id,
    );
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.unshift(conversation);
    }

    // Keep only last 50 conversations
    const trimmed = conversations.slice(0, 50);
    await AsyncStorage.setItem(key, JSON.stringify(trimmed));
  } catch (error) {
    console.error("[CSKH] Error saving local conversation:", error);
  }
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Gửi tin nhắn và nhận phản hồi từ AI CSKH
 * Endpoint: POST /cskh/chat
 */
export async function sendCSKHMessage(
  userId: string,
  conversationId: string,
  message: string,
  messageHistory: CSKHMessage[] = [],
): Promise<CSKHResponse> {
  console.log("[CSKH] Sending message to AI:", {
    conversationId,
    message: message.substring(0, 50),
  });

  try {
    // Prepare messages for OpenAI format
    const messages = [
      { role: "system", content: CSKH_CONFIG.systemPrompt },
      ...messageHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Call backend API which handles OpenAI
    const response = await apiFetch<CSKHResponse>("/cskh/chat", {
      method: "POST",
      data: {
        userId,
        conversationId,
        message,
        messages,
      },
    });

    console.log("[CSKH] AI response received");
    return response;
  } catch (error: any) {
    console.error("[CSKH] Error sending message:", error);

    // Fallback response khi API lỗi
    return {
      success: false,
      error:
        error.message ||
        "Không thể kết nối đến hệ thống CSKH. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Lấy lịch sử chat CSKH từ backend
 * Endpoint: GET /cskh/history/:conversationId
 */
export async function getCSKHHistory(
  userId: string,
  conversationId: string,
): Promise<CSKHMessage[]> {
  try {
    const response = await apiFetch<{ messages: CSKHMessage[] }>(
      `/cskh/history/${conversationId}`,
      { method: "GET" },
    );
    return response.messages || [];
  } catch (error) {
    console.error("[CSKH] Error fetching history:", error);
    // Fallback to local storage
    const conversations = await getLocalConversations(userId);
    const conv = conversations.find((c) => c.id === conversationId);
    return conv?.messages || [];
  }
}

/**
 * Tạo conversation mới
 */
export async function createCSKHConversation(
  userId: string,
): Promise<CSKHConversation> {
  const now = new Date().toISOString();
  const conversation: CSKHConversation = {
    id: generateConversationId(),
    userId,
    messages: [
      {
        id: generateId(),
        role: "assistant",
        content: `Xin chào! 👋 Tôi là trợ lý CSKH của Thiết Kế Resort.

Tôi có thể giúp bạn:
• Giải đáp thắc mắc về sản phẩm, dịch vụ
• Hướng dẫn sử dụng ứng dụng
• Hỗ trợ đặt hàng, theo dõi đơn hàng
• Tư vấn về dự án xây dựng, thiết kế

Bạn cần hỗ trợ gì ạ?`,
        createdAt: now,
        status: "sent",
      },
    ],
    createdAt: now,
    updatedAt: now,
    status: "active",
  };

  // Save to local storage
  await saveLocalConversation(userId, conversation);

  // Try to sync with backend
  try {
    await apiFetch("/cskh/conversation", {
      method: "POST",
      data: { userId, conversationId: conversation.id },
    });
  } catch (error) {
    console.warn("[CSKH] Could not sync conversation to backend:", error);
  }

  return conversation;
}

/**
 * Thêm tin nhắn vào conversation local
 */
export async function addMessageToConversation(
  userId: string,
  conversationId: string,
  message: CSKHMessage,
): Promise<void> {
  const conversations = await getLocalConversations(userId);
  const conv = conversations.find((c) => c.id === conversationId);

  if (conv) {
    conv.messages.push(message);
    conv.updatedAt = new Date().toISOString();
    await saveLocalConversation(userId, conv);
  }
}

/**
 * Lấy hoặc tạo conversation cho user
 */
export async function getOrCreateConversation(
  userId: string,
): Promise<CSKHConversation> {
  const conversations = await getLocalConversations(userId);

  // Tìm conversation active gần nhất
  const activeConv = conversations.find((c) => c.status === "active");

  if (activeConv) {
    // Check if conversation is still recent (within 24 hours)
    const lastUpdate = new Date(activeConv.updatedAt).getTime();
    const now = Date.now();
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return activeConv;
    }
  }

  // Create new conversation
  return createCSKHConversation(userId);
}

// ============================================
// EXPORT CONFIG
// ============================================

export const CSKH_INFO = {
  name: CSKH_CONFIG.cskhName,
  avatar: CSKH_CONFIG.cskhAvatar,
  // AI Bot User ID - sử dụng để phân biệt chat với AI vs chat với user thường
  AI_USER_ID: "ai-cskh-bot",
  AI_USER_IDS: ["ai-cskh-bot", "ai-assistant", "cskh-bot", "support-bot", "0"], // Multiple IDs for backward compatibility
};

/**
 * Kiểm tra xem userId có phải là AI bot không
 * @param userId - User ID cần kiểm tra
 * @returns true nếu là AI bot
 */
export function isAIBotUser(
  userId: string | number | null | undefined,
): boolean {
  if (!userId) return false;
  const id = String(userId).toLowerCase();
  return CSKH_INFO.AI_USER_IDS.some((aiId) => id === aiId.toLowerCase());
}

/**
 * Lấy thông tin AI Bot user (để hiển thị trong danh sách chat)
 */
export function getAIBotUserInfo() {
  return {
    id: CSKH_INFO.AI_USER_ID,
    name: CSKH_INFO.name,
    avatar: CSKH_INFO.avatar,
    isOnline: true, // AI luôn online
    isBot: true,
  };
}

export { generateId };
