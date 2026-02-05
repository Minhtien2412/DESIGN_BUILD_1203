/**
 * CSKH AI Router - Backend API for AI Customer Support
 * =====================================================
 *
 * API endpoints để xử lý chat CSKH với OpenAI
 * - POST /cskh/chat - Gửi tin nhắn và nhận phản hồi AI
 * - GET /cskh/history/:conversationId - Lấy lịch sử chat
 * - POST /cskh/conversation - Tạo conversation mới
 *
 * Requires: OPENAI_API_KEY in environment
 *
 * @author ThietKeResort Team
 * @created 2026-01-27
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import OpenAI from "openai";

// ============================================
// TYPES
// ============================================

interface CSKHMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  userId: string;
  conversationId: string;
  message: string;
  messages: CSKHMessage[];
}

interface ConversationRequestBody {
  userId: string;
  conversationId: string;
}

// ============================================
// CONFIG
// ============================================

const SYSTEM_PROMPT = `Bạn là Trợ lý CSKH của ứng dụng "Thiết Kế Resort" - một nền tảng thương mại điện tử và quản lý dự án xây dựng/thiết kế nội thất tại Việt Nam.

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
8. Trả lời ngắn gọn, súc tích, dễ hiểu

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
- Khiếu nại, góp ý`;

// ============================================
// ROUTES
// ============================================

export default async function cskhRoutes(fastify: FastifyInstance) {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * POST /cskh/chat
   * Gửi tin nhắn và nhận phản hồi từ AI
   */
  fastify.post(
    "/cskh/chat",
    async (
      request: FastifyRequest<{ Body: ChatRequestBody }>,
      reply: FastifyReply,
    ) => {
      const { userId, conversationId, message, messages } = request.body;

      if (!message || !conversationId) {
        return reply.status(400).send({
          success: false,
          error: "Missing required fields: message, conversationId",
        });
      }

      try {
        fastify.log.info(
          `[CSKH] Processing chat for user ${userId}, conversation ${conversationId}`,
        );

        // Prepare messages for OpenAI
        const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Cost-effective model for customer support
          messages: openaiMessages,
          max_tokens: 500,
          temperature: 0.7,
        });

        const aiReply =
          completion.choices[0]?.message?.content ||
          "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.";

        // Generate message ID
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Save to database (if using Prisma)
        try {
          // @ts-ignore - Prisma client may not be available
          if (fastify.prisma) {
            await fastify.prisma.cSKHMessage.create({
              data: {
                id: messageId,
                conversationId,
                userId,
                role: "assistant",
                content: aiReply,
                createdAt: new Date(),
              },
            });

            // Also save user message
            await fastify.prisma.cSKHMessage.create({
              data: {
                id: `msg_${Date.now()}_user`,
                conversationId,
                userId,
                role: "user",
                content: message,
                createdAt: new Date(),
              },
            });
          }
        } catch (dbError) {
          fastify.log.warn("[CSKH] Could not save to database:", dbError);
          // Continue without database - messages are stored locally on client
        }

        fastify.log.info(
          `[CSKH] AI response generated for conversation ${conversationId}`,
        );

        return reply.send({
          success: true,
          data: {
            reply: aiReply,
            conversationId,
            messageId,
          },
        });
      } catch (error: any) {
        fastify.log.error("[CSKH] OpenAI error:", error);

        // Check for specific OpenAI errors
        if (error.code === "insufficient_quota") {
          return reply.status(503).send({
            success: false,
            error:
              "Dịch vụ AI tạm thời không khả dụng. Vui lòng liên hệ hotline 1900-xxxx.",
          });
        }

        return reply.status(500).send({
          success: false,
          error: "Không thể xử lý yêu cầu. Vui lòng thử lại sau.",
        });
      }
    },
  );

  /**
   * GET /cskh/history/:conversationId
   * Lấy lịch sử chat của conversation
   */
  fastify.get(
    "/cskh/history/:conversationId",
    async (
      request: FastifyRequest<{ Params: { conversationId: string } }>,
      reply: FastifyReply,
    ) => {
      const { conversationId } = request.params;

      try {
        // @ts-ignore - Prisma client may not be available
        if (fastify.prisma) {
          const messages = await fastify.prisma.cSKHMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
          });

          return reply.send({ messages });
        }

        // Return empty if no database
        return reply.send({ messages: [] });
      } catch (error) {
        fastify.log.error("[CSKH] Error fetching history:", error);
        return reply.status(500).send({
          success: false,
          error: "Không thể tải lịch sử chat.",
        });
      }
    },
  );

  /**
   * POST /cskh/conversation
   * Tạo hoặc sync conversation với backend
   */
  fastify.post(
    "/cskh/conversation",
    async (
      request: FastifyRequest<{ Body: ConversationRequestBody }>,
      reply: FastifyReply,
    ) => {
      const { userId, conversationId } = request.body;

      try {
        // @ts-ignore - Prisma client may not be available
        if (fastify.prisma) {
          // Upsert conversation
          await fastify.prisma.cSKHConversation.upsert({
            where: { id: conversationId },
            create: {
              id: conversationId,
              userId,
              status: "active",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            update: {
              updatedAt: new Date(),
            },
          });
        }

        return reply.send({
          success: true,
          conversationId,
        });
      } catch (error) {
        fastify.log.error("[CSKH] Error creating conversation:", error);
        return reply.status(500).send({
          success: false,
          error: "Không thể tạo cuộc trò chuyện.",
        });
      }
    },
  );

  fastify.log.info("✅ CSKH AI routes registered");
}
