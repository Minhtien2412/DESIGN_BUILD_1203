/**
 * Architect AI Flow — Behavior Lock Tests
 *
 * Covers the 5 main conversation scenarios after the architect-flow upgrade:
 * 1. User does not know what to type yet
 * 2. User input is vague and AI should ask the right next question
 * 3. User already gave core data and AI should not ask repeated fields
 * 4. User wants quote-first flow
 * 5. User completes confirmation and should unlock proposal/result CTAs
 */

jest.mock("../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

jest.mock("../services/openclawAI", () => {
  const mockSendMessage = jest
    .fn()
    .mockResolvedValue(
      'Tôi sẽ hỗ trợ anh/chị từng bước. {"intent":"architect_consultation"}',
    );

  return {
    openclawAI: {
      startChat: jest.fn(),
      sendMessage: mockSendMessage,
      clearChat: jest.fn(),
    },
  };
});

import {
    buildWelcomeMessage,
    processUserMessage,
    resetSalesChat,
} from "../features/ai-assistant/orchestrator";
import type {
    MessageBlock,
    QuickReplyOption
} from "../features/ai-assistant/types";
import { get } from "../services/api";
import { openclawAI } from "../services/openclawAI";

const mockGet = get as jest.MockedFunction<typeof get>;
const mockSendMessage = openclawAI.sendMessage as jest.Mock;

const MOCK_ARCHITECT = {
  id: "901",
  name: "KTS Nguyễn An",
  phone: "0901000001",
  workerType: "KY_SU",
  location: "Thủ Đức",
  experience: 12,
  skills: ["thiết kế kiến trúc", "mặt bằng công năng"],
  hasEquipment: false,
  dailyRate: 900000,
  rating: 4.9,
  reviewCount: 42,
  completedJobs: 86,
  status: "APPROVED",
  verified: true,
  featured: true,
  availability: "available",
};

function getQuickReplyLabels(
  result:
    | ReturnType<typeof buildWelcomeMessage>
    | Awaited<ReturnType<typeof processUserMessage>>,
) {
  const quickReplyBlock = result.blocks?.find(
    (b: MessageBlock) => b.type === "quick_replies",
  );
  return (
    quickReplyBlock?.quickReplies?.map((q: QuickReplyOption) => q.label) ?? []
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  resetSalesChat();
  mockGet.mockResolvedValue({
    data: [MOCK_ARCHITECT],
    meta: { total: 1, page: 1, limit: 5 },
  });
  mockSendMessage.mockResolvedValue(
    'Tôi sẽ hỗ trợ anh/chị từng bước. {"intent":"architect_consultation"}',
  );
});

describe("Architect AI flow behavior", () => {
  test("1) welcome message helps users start easily and pushes conversion CTAs", () => {
    const welcome = buildWelcomeMessage();
    const textBlock = welcome.blocks?.find(
      (b: MessageBlock) => b.type === "text",
    );
    const labels = getQuickReplyLabels(welcome);

    expect(textBlock?.text).toContain("Đất 5x20");
    expect(textBlock?.text).toContain("AI kiến trúc sư tư vấn sơ bộ");
    expect(labels).toEqual(
      expect.arrayContaining([
        "🧱 Xây mới nhà phố",
        "📐 Xem mặt bằng trước",
        "💰 Tính chi phí trước",
        "👷 Kết nối KTS",
      ]),
    );
  });

  test("2) vague architect input asks the right follow-up and shows land-size quick replies", async () => {
    mockSendMessage.mockResolvedValue(
      'Cho tôi xin kích thước đất trước nhé. {"intent":"architect_consultation"}',
    );

    const result = await processUserMessage("Tôi xây mới nhà 2 tầng");
    const aiMessage = mockSendMessage.mock.calls[0][0] as string;
    const labels = getQuickReplyLabels(result);

    expect(aiMessage).toContain("[CONTEXT]");
    expect(aiMessage).toContain("Câu nên hỏi tiếp theo: Kích thước đất");
    expect(labels).toEqual(expect.arrayContaining(["5×20m", "4×15m", "6×25m"]));
  });

  test("3) when user already gave core data, context keeps known fields and avoids repeated questions", async () => {
    mockSendMessage.mockResolvedValue(
      'Tôi đã nắm khung cơ bản, giờ tôi cần ngân sách. {"intent":"architect_consultation"}',
    );

    const result = await processUserMessage(
      "Tôi xây mới nhà 3 tầng 5x20, 4 phòng ngủ, có gara",
    );
    const aiMessage = mockSendMessage.mock.calls[0][0] as string;
    const labels = getQuickReplyLabels(result);

    expect(aiMessage).toContain("Đất: 5×20m");
    expect(aiMessage).toContain("3 tầng");
    expect(aiMessage).toContain("4 phòng ngủ");
    expect(aiMessage).not.toContain("Nhà mấy tầng?");
    expect(aiMessage).not.toContain(
      "Kích thước đất (rộng x dài hoặc diện tích)?",
    );
    expect(labels).toEqual(
      expect.arrayContaining(["💵 Dưới 1.5 tỷ", "💰 1.5-3 tỷ"]),
    );
  });

  test("4) quote-first request sets conversion focus toward cost before proposal", async () => {
    mockSendMessage.mockResolvedValue(
      'Được, tôi sẽ lấy đầu bài để tính chi phí trước. {"intent":"quotation_request"}',
    );

    const result = await processUserMessage("Tôi muốn báo giá trước");
    const aiMessage = mockSendMessage.mock.calls[0][0] as string;
    const labels = getQuickReplyLabels(result);

    expect(aiMessage).toContain(
      "Mục tiêu chuyển đổi hiện tại: Lấy đủ đầu bài tối thiểu để chốt ước chi phí sơ bộ",
    );
    expect(aiMessage).toContain(
      "CTA ưu tiên sau phản hồi: Tính chi phí sơ bộ | Xem mặt bằng sơ bộ | Kết nối kiến trúc sư",
    );
    expect(labels).toEqual(
      expect.arrayContaining([
        "🧱 Xây mới",
        "💰 Tính chi phí trước",
        "👷 Kết nối KTS",
      ]),
    );
  });

  test("5) full architect flow reaches confirmation then unlocks proposal/result CTAs", async () => {
    mockSendMessage
      .mockResolvedValueOnce(
        'Tôi đã hiểu nhu cầu và tóm tắt để anh/chị xác nhận. {"intent":"architect_consultation"}',
      )
      .mockResolvedValueOnce(
        'Tôi lên phương án sơ bộ và bước tiếp theo cho anh/chị. {"intent":"confirm_requirements"}',
      );

    const first = await processUserMessage(
      "Tôi xây mới nhà 5x20, 3 tầng, 4 phòng ngủ, 4 WC, có gara, phong cách hiện đại, ngân sách 2.8 tỷ, ưu tiên công năng, không có yêu cầu đặc biệt",
    );

    expect(
      first.blocks?.some((b: MessageBlock) => b.type === "summary_card"),
    ).toBe(true);
    expect(getQuickReplyLabels(first)).toEqual(
      expect.arrayContaining([
        "✅ Chốt & xem mặt bằng",
        "✅ Chốt & tính chi phí",
        "👷 Chốt & kết nối KTS",
      ]),
    );

    const second = await processUserMessage(
      "Đúng rồi, cho tôi xem mặt bằng sơ bộ",
    );
    const blockTypes = second.blocks?.map((b: MessageBlock) => b.type) ?? [];
    const actionCtas =
      second.blocks?.filter((b: MessageBlock) => b.type === "action_cta") ?? [];

    expect(blockTypes).toEqual(
      expect.arrayContaining([
        "floor_plan_summary",
        "cost_summary",
        "quick_replies",
      ]),
    );
    expect(actionCtas.length).toBeGreaterThanOrEqual(2);
    expect(getQuickReplyLabels(second)).toEqual(
      expect.arrayContaining([
        "📐 Xem mặt bằng",
        "💰 Tính chi phí",
        "👷 Kết nối KTS",
      ]),
    );
  });
});
