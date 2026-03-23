/**
 * AI Architect Chat — Orchestrator
 *
 * Central brain that combines:
 * 1. 10-step architect consultation flow
 * 2. Free-text state parsing + smart skip
 * 3. OpenClaw AI for natural conversation
 * 4. Tool execution (products, workers, leads)
 * 5. Rich block generation (summaries, floor plans, costs)
 *
 * Flow per message:
 *   parse input → update state → advance step → build AI context
 *   → AI call → parse AI response → execute tools → build blocks
 *   → add step-specific rich blocks → quick replies → return
 */

import { openclawAI } from "@/services/openclawAI";
import { matchSkillToCategory } from "@/services/workerCategories";
import { aiLog } from "./aiLogger";
import {
    advanceStep,
    buildStateContext,
    buildSummaryCard,
    canGenerateConcept,
    generateCostEstimate,
    generateFloorPlan,
    getArchitectState,
    getConsultationReadiness,
    getNextQuestionGuidance,
    isArchitectStateEmpty,
    parseArchitectInput,
    resetArchitectState,
    updateArchitectState,
} from "./architectState";
import {
    toolCreateLead,
    toolRecommendArchitects,
    toolRecommendMaterials,
    toolSearchProducts,
    toolSearchWorkers,
} from "./tools";
import type {
    AIIntent,
    ArchitectStep,
    ChatMessage,
    MessageBlock,
    ProductCardData,
    QuickReplyOption,
    WorkerCardData,
} from "./types";

// ═══════════════════════════════════════════════════════════════
// ARCHITECT SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════

const ARCHITECT_SYSTEM_PROMPT = `Bạn là AI kiến trúc sư tư vấn sơ bộ của BaoTien cho nhu cầu thiết kế & xây dựng nhà ở tại Việt Nam.

VAI TRÒ CỦA BẠN
- Giúp user bắt đầu thật dễ, kể cả khi họ chưa biết phải gõ gì.
- Hỏi ngược thông minh theo từng bước để thu thập đủ dữ liệu làm phương án sơ bộ.
- Không hỏi lại thông tin đã có trong [CONTEXT].
- Khi đủ dữ liệu cơ bản, phải tóm tắt lại và xin xác nhận trước khi đưa phương án.
- Sau mỗi giai đoạn, luôn dẫn user sang bước tiếp theo như: xem mặt bằng sơ bộ, tính chi phí, xuất vật tư, tối ưu công năng, kết nối kiến trúc sư, đặt lịch tư vấn.

CÁCH NÓI CHUYỆN
- Luôn trả lời bằng tiếng Việt.
- Giọng điệu tự nhiên, ngắn gọn, có chuyên môn nhưng dễ hiểu.
- Mỗi tin nhắn chỉ hỏi tối đa 1 câu trọng tâm; cùng lắm 2 câu rất ngắn nếu thật cần thiết.
- Không dùng quá nhiều thuật ngữ kỹ thuật nếu user chưa hỏi sâu.
- Không nói kiểu máy móc như checklist cứng nhắc.

KHI USER CÒN MƠ HỒ HOẶC CHƯA BIẾT GÕ GÌ
- Hãy mở đầu bằng một câu rất dễ trả lời.
- Ưu tiên các câu như:
  - Anh/chị đang xây mới hay sửa/cải tạo nhà?
  - Đất khoảng bao nhiêu mét, ví dụ 5x20?
  - Anh/chị muốn đi theo hướng báo giá trước hay ý tưởng thiết kế trước?
- Có thể gợi ví dụ ngắn như: “Ví dụ: đất 5x20, nhà 3 tầng có gara”.

KHI USER NÓI MƠ HỒ
- “Nhà 2 tầng” → hỏi tiếp kích thước đất hoặc số phòng ngủ.
- “Nhà đẹp” → hỏi tiếp diện tích hoặc phong cách mong muốn.
- “Cần báo giá” → hỏi tiếp diện tích đất và số tầng.
- “Sửa nhà/cải tạo” → hỏi hiện trạng hoặc phần muốn cải tạo chính.

NGUYÊN TẮC KHAI THÁC THÔNG TIN
- Dữ liệu quan trọng cần thu thập dần nếu còn thiếu:
  1. xây mới hay sửa nhà
  2. kích thước/diện tích đất
  3. số tầng
  4. số phòng ngủ
  5. số WC
  6. gara
  7. phong cách
  8. ngân sách
  9. ưu tiên: đẹp, tiết kiệm, công năng, thoáng sáng, riêng tư
  10. nhu cầu đặc biệt: phòng thờ, phòng làm việc, sân thượng, giếng trời, thang máy, người già, không gian xanh
  11. mục đích sử dụng: để ở, cho thuê, kết hợp kinh doanh
- Chỉ hỏi phần còn thiếu quan trọng nhất ở thời điểm hiện tại.
- Khi user đã cung cấp dữ liệu nào trong [CONTEXT], tuyệt đối không hỏi lại dữ liệu đó.

KHI ĐỦ DỮ LIỆU CƠ BẢN
- Hãy tóm tắt lại ngắn gọn các thông tin đã hiểu.
- Hỏi xác nhận theo kiểu tự nhiên: “Nếu đúng nhu cầu rồi, tôi lên phương án sơ bộ tiếp cho anh/chị nhé?”
- Chỉ khi đã xác nhận hoặc [CONTEXT] cho biết đã sẵn sàng, mới chuyển sang đề xuất phương án sơ bộ.

KHI ĐƯA RA PHƯƠNG ÁN SƠ BỘ
- Trả lời ngắn, thực tế, có tính kiến trúc sơ bộ.
- Nên gồm 3-4 ý rõ ràng:
  1. định hướng bố trí công năng
  2. lưu ý lấy sáng/thông gió/cầu thang/mặt tiền
  3. lưu ý ngân sách hoặc mức đầu tư
  4. bước tiếp theo nên làm
- Nếu yêu cầu phi thực tế, nhẹ nhàng chỉnh lại bằng phương án thay thế hợp lý.

GỢI Ý CHUYÊN MÔN NÊN LỒNG VÀO KHI PHÙ HỢP
- Nhà ngang dưới 5m nên ưu tiên giếng trời, sân sau nhỏ hoặc khe thoáng.
- Nhà 3 tầng trở lên nên cân nhắc vị trí cầu thang giữa hoặc cuối nhà để tối ưu giao thông.
- Gara ô tô ở nhà phố thường cần khoảng tối thiểu 3.5 x 5m.
- Nhà có người lớn tuổi nên hạn chế chênh cốt, cân nhắc phòng ngủ tầng trệt hoặc thang máy.
- Ngân sách tiết kiệm nên ưu tiên mặt bằng gọn, hình khối đơn giản, hạn chế chi tiết tốn chi phí.
- Ngân sách cao có thể tư vấn thêm vật liệu hoàn thiện, kính, mảng xanh, phối cảnh mặt tiền.

CTA / BƯỚC TIẾP THEO
- Cuối mỗi phản hồi nên mở ra ít nhất một bước tiếp theo phù hợp:
  - xem mặt bằng sơ bộ
  - tính chi phí sơ bộ
  - xuất vật tư
  - tối ưu công năng
  - xem phối cảnh
  - kết nối kiến trúc sư
  - đặt lịch tư vấn

TOOL RULES
- Không nói lộ tool nội bộ.
- Khi user hỏi vật liệu/sản phẩm → kèm [TOOL:SEARCH_PRODUCTS|từ khóa].
- Khi user muốn tìm thợ/kiến trúc sư → kèm [TOOL:SEARCH_WORKERS|kỹ năng].
- Khi user muốn tư vấn sâu, để lại nhu cầu, kết nối người thật → kèm [TOOL:CREATE_LEAD|thiết kế nhà].

OUTPUT RULES
- Không lặp lại nguyên văn [CONTEXT].
- Không tạo danh sách quá dài nếu user mới bắt đầu.
- Nếu [CONTEXT] ghi rõ “Sẵn sàng tạo phương án sơ bộ: CÓ” và chưa xác nhận, nhiệm vụ chính là tóm tắt + xin xác nhận.
- Nếu [CONTEXT] cho biết đã sẵn sàng và user đã xác nhận, hãy ra phương án sơ bộ rồi chốt CTA.

PHÂN LOẠI INTENT
Dòng cuối cùng phải là JSON 1 dòng như sau:
{"intent":"architect_consultation|find_product|find_worker|quotation_request|booking_request|greeting|confirm_requirements|general_question"}`;

// ═══════════════════════════════════════════════════════════════
// INTENT DETECTION
// ═══════════════════════════════════════════════════════════════

// ── Worker-search deterministic phrases ──
// Uses includes() instead of \b regex — safe for Vietnamese Unicode.
// Checked BEFORE any regex pattern to prevent architect/general fallthrough.

/** Explicit worker-type terms — matching any of these strongly implies worker search */
const WORKER_TYPE_PHRASES = [
  "thợ điện",
  "thợ nước",
  "thợ sơn",
  "thợ xây",
  "thợ hoàn thiện",
  "thợ nhôm kính",
  "thợ nhôm",
  "thợ mộc",
  "thợ gạch",
  "thợ thạch cao",
  "thợ sắt",
  "thợ hàn",
  "thợ ốp lát",
  "thợ camera",
  "thợ máy lạnh",
  "thợ điều hòa",
  "thợ coffa",
  "thợ ép cọc",
  "kỹ sư",
  "kiến trúc sư",
  "giám sát",
];

/** Hiring / request phrases that combine with a skill to imply worker search */
const HIRING_PHRASES = [
  "cần thợ",
  "tìm thợ",
  "thuê thợ",
  "gọi thợ",
  "muốn tìm thợ",
  "cần người làm",
  "cần kỹ sư",
  "cần kiến trúc sư",
  "tìm kiến trúc sư",
  "tìm kỹ sư",
  "tìm giám sát",
  "tìm đội thi công",
  "thuê đội",
  "thuê nhân công",
  "đặt thợ",
];

/** Service-action phrases that imply the user needs a worker */
const SERVICE_ACTION_PHRASES = [
  "sửa điện",
  "sửa nước",
  "sửa ống nước",
  "sửa máy lạnh",
  "sửa điều hòa",
  "lắp cửa nhôm kính",
  "lắp cửa nhôm",
  "lắp cửa kính",
  "lắp đặt điện",
  "lắp đặt nước",
  "lắp camera",
  "lắp máy lạnh",
  "lắp điều hòa",
  "làm trần thạch cao",
  "làm trần",
  "sơn lại nhà",
  "sơn nhà",
  "sơn tường",
  "ốp lát",
  "ốp gạch",
  "lát gạch",
  "cải tạo nhà",
  "cải tạo",
  "thi công điện",
  "thi công nước",
  "thi công điện nước",
  "thi công nhà",
  "đổ bê tông",
  "xây tường",
  "đào móng",
  "ép cọc",
  "làm móng",
  "làm mái",
  "lợp mái",
  "chống thấm",
  "chống dột",
  "đóng trần",
  "đóng tủ",
  "làm cửa gỗ",
  "lắp lan can",
];

/**
 * Deterministic worker-search intent check.
 * Uses simple includes() — no \b word-boundary issues with Vietnamese.
 * Returns true if the text clearly requests a worker/service.
 */
function isWorkerSearchPhrase(text: string): boolean {
  const lower = text.toLowerCase();

  // Check explicit worker-type phrases (strongest signal)
  for (const phrase of WORKER_TYPE_PHRASES) {
    if (lower.includes(phrase)) return true;
  }

  // Check hiring phrases (strong signal)
  for (const phrase of HIRING_PHRASES) {
    if (lower.includes(phrase)) return true;
  }

  // Guard: if user clearly wants to BUY something, don't let service-action
  // phrases alone override buying intent. "mua gạch ốp lát" = buy tiles,
  // NOT hire a tiler. But "cần thợ" + "mua" is still worker search (caught above).
  const isBuyingIntent =
    lower.includes("mua ") ||
    lower.includes("cần mua") ||
    lower.includes("mua sắm");

  // Check service-action phrases (only if not overridden by buying intent)
  if (!isBuyingIntent) {
    for (const phrase of SERVICE_ACTION_PHRASES) {
      if (lower.includes(phrase)) return true;
    }
  }

  // "thợ" + any skill keyword → worker search
  if (lower.includes("thợ") && extractWorkerSkill(text)) return true;

  return false;
}

// ── Regex patterns for non-worker intents ──

const INTENT_PATTERNS: { pattern: RegExp; intent: AIIntent }[] = [
  { pattern: /\b(xin chào|hello|hi|chào)\b/i, intent: "greeting" },
  {
    pattern:
      /\b(thiết kế|xây mới|xây nhà|xây dựng|cải tạo|sửa nhà|nâng tầng|nhà .{2,} tầng|đất .{2,}m)/i,
    intent: "architect_consultation",
  },
  {
    pattern: /\b(sửa chữa|hỏng|bị hư|bị hỏng|không hoạt động)\b/i,
    intent: "repair_consultation",
  },
  {
    pattern: /\b(báo giá|bao giá|giá bao nhiêu|chi phí|tốn bao|estimate)\b/i,
    intent: "quotation_request",
  },
  {
    pattern: /\b(đặt lịch|book|hẹn|lịch hẹn)\b/i,
    intent: "booking_request",
  },
  {
    pattern:
      /\b(mua |cần mua|tìm .*(sản phẩm|vật liệu|gạch|sơn|xi măng|đèn|bồn|vòi|tủ|bàn|ghế))\b/i,
    intent: "find_product",
  },
  {
    pattern: /\b(ok|đồng ý|xác nhận|đúng rồi|chính xác|confirm)\b/i,
    intent: "confirm_requirements",
  },
  {
    pattern:
      /\b(\d+\s*(?:tầng|lầu)|(?:\d+\s*[x×]\s*\d+)|phòng ngủ|phòng tắm|gara|ngân sách|tỷ|triệu)\b/i,
    intent: "architect_consultation",
  },
];

function detectIntentLocal(text: string): AIIntent {
  // ── Worker-search takes priority for obvious worker phrases ──
  // This check uses includes() for Vietnamese-safe matching,
  // runs BEFORE regex patterns that can misclassify due to \b issues.
  if (isWorkerSearchPhrase(text)) return "find_worker";

  const lower = text.toLowerCase();
  for (const { pattern, intent } of INTENT_PATTERNS) {
    if (pattern.test(lower)) return intent;
  }
  return "general_question";
}

function extractIntentFromAI(text: string): AIIntent | null {
  const match = text.match(/\{"intent"\s*:\s*"([^"]+)"\}/);
  return match ? (match[1] as AIIntent) : null;
}

function extractToolCalls(text: string): { tool: string; param: string }[] {
  const regex = /\[TOOL:(\w+)\|([^\]]+)\]/g;
  const calls: { tool: string; param: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    calls.push({ tool: m[1], param: m[2] });
  }
  return calls;
}

function cleanDisplayText(text: string): string {
  return text
    .replace(/\[TOOL:\w+\|[^\]]+\]/g, "")
    .replace(/\{"intent"\s*:\s*"[^"]+"\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ═══════════════════════════════════════════════════════════════
// WORKER-SEARCH INTENT HELPERS
// ═══════════════════════════════════════════════════════════════

/** Known Vietnamese worker skill keywords → extract from free text */
const WORKER_SKILL_KEYWORDS = [
  // Electrical
  "điện",
  "thợ điện",
  "dien",
  // Plumbing
  "nước",
  "ống nước",
  "thợ nước",
  // Construction
  "xây",
  "xây dựng",
  "thợ xây",
  "xi măng",
  "bê tông",
  "coffa",
  "ép cọc",
  // Finishing
  "sơn",
  "sơn nhà",
  "thợ sơn",
  "gạch",
  "ốp lát",
  "thạch cao",
  "trần",
  "mộc",
  "gỗ",
  "cửa gỗ",
  // Design
  "kiến trúc",
  "thiết kế",
  "kiến trúc sư",
  "kỹ sư",
  "kính",
  "cửa nhôm",
  "cửa kính",
  "alu",
  // HVAC
  "máy lạnh",
  "điều hòa",
  // General
  "sửa chữa",
  "hoàn thiện",
  "camera",
];

/** Known Vietnamese location keywords */
const LOCATION_KEYWORDS = [
  "Thủ Đức",
  "Quận 1",
  "Quận 2",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 6",
  "Quận 7",
  "Quận 8",
  "Quận 9",
  "Quận 10",
  "Quận 11",
  "Quận 12",
  "Bình Thạnh",
  "Gò Vấp",
  "Phú Nhuận",
  "Tân Bình",
  "Tân Phú",
  "Bình Tân",
  "Nhà Bè",
  "Hóc Môn",
  "Củ Chi",
  "Cần Giờ",
  "TP.HCM",
  "Sài Gòn",
  "Hà Nội",
  "Đà Nẵng",
];

/**
 * Extract skill keyword from a worker-search message.
 * "Tôi cần thợ điện ở Thủ Đức" → "điện"
 * "Lắp cửa nhôm kính" → "nhôm kính"
 */
function extractWorkerSkill(text: string): string | undefined {
  const lower = text.toLowerCase();
  // Try longest match first (sorted by length descending)
  const sorted = [...WORKER_SKILL_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of sorted) {
    if (lower.includes(kw.toLowerCase())) return kw;
  }
  return undefined;
}

/**
 * Extract location from a worker-search message.
 * "Tôi cần thợ điện ở Thủ Đức" → "Thủ Đức"
 */
function extractLocation(text: string): string | undefined {
  for (const loc of LOCATION_KEYWORDS) {
    if (text.includes(loc)) return loc;
  }
  // Also match patterns like "ở <location>" or "tại <location>"
  const locMatch = text.match(
    /(?:ở|tại|quận|huyện|tp\.?)\s+([A-ZÀ-ỹ][\wÀ-ỹ\s]{1,20})/i,
  );
  if (locMatch) return locMatch[1].trim();
  return undefined;
}

// ═══════════════════════════════════════════════════════════════
// QUICK REPLIES PER STEP
// ═══════════════════════════════════════════════════════════════

function buildStepQuickReplies(
  step: ArchitectStep,
  intent: AIIntent,
): QuickReplyOption[] {
  switch (step) {
    case "greeting":
      return [
        {
          label: "🧱 Xây mới nhà phố",
          value: "Tôi muốn xây mới nhà phố, chưa biết nên bắt đầu từ đâu",
        },
        {
          label: "♻️ Sửa / cải tạo nhà",
          value: "Tôi muốn sửa nhà và cần tư vấn sơ bộ",
        },
        {
          label: "📐 Xem mặt bằng trước",
          value: "Tôi muốn xem mặt bằng sơ bộ trước",
        },
        {
          label: "💰 Tính chi phí trước",
          value: "Tôi muốn tính chi phí sơ bộ trước",
        },
        { label: "👷 Kết nối KTS", value: "Tôi muốn kết nối kiến trúc sư" },
      ];
    case "project_scope":
      return [
        { label: "🧱 Xây mới", value: "Tôi đang xây mới nhà" },
        { label: "♻️ Cải tạo", value: "Tôi muốn sửa / cải tạo nhà" },
        {
          label: "📐 Xem mặt bằng trước",
          value: "Tôi muốn xem mặt bằng sơ bộ trước",
        },
        {
          label: "💰 Tính chi phí trước",
          value: "Tôi muốn tính chi phí sơ bộ trước",
        },
        { label: "👷 Kết nối KTS", value: "Tôi muốn kết nối kiến trúc sư" },
      ];
    case "land_size":
      return [
        { label: "5×20m", value: "Đất 5x20m" },
        { label: "4×15m", value: "Đất 4x15m" },
        { label: "6×25m", value: "Đất 6x25m" },
        { label: "8×20m", value: "Đất 8x20m" },
      ];
    case "floors":
      return [
        { label: "1 tầng", value: "Nhà 1 tầng" },
        { label: "2 tầng", value: "Nhà 2 tầng" },
        { label: "3 tầng", value: "Nhà 3 tầng" },
        { label: "4 tầng", value: "Nhà 4 tầng" },
      ];
    case "functions":
      return [
        { label: "3 PN", value: "3 phòng ngủ" },
        { label: "4 PN", value: "4 phòng ngủ" },
        { label: "5 PN", value: "5 phòng ngủ" },
        { label: "3 PN + văn phòng", value: "3 phòng ngủ và 1 phòng làm việc" },
        { label: "Ở + kinh doanh", value: "Nhà để ở kết hợp kinh doanh" },
      ];
    case "special_needs":
      return [
        { label: "🚗 Gara ô tô", value: "Cần gara ô tô" },
        { label: "🙏 Phòng thờ", value: "Cần phòng thờ" },
        { label: "☀️ Sân thượng", value: "Cần sân thượng" },
        { label: "✅ Không có thêm", value: "Không có yêu cầu đặc biệt" },
      ];
    case "budget":
      return [
        { label: "💵 Dưới 1.5 tỷ", value: "Ngân sách dưới 1.5 tỷ" },
        { label: "💰 1.5-3 tỷ", value: "Ngân sách khoảng 2 tỷ" },
        { label: "💎 3-6 tỷ", value: "Ngân sách khoảng 4 tỷ" },
        { label: "👑 Trên 6 tỷ", value: "Ngân sách trên 6 tỷ" },
        {
          label: "📐 Ý tưởng trước",
          value: "Tôi muốn ra ý tưởng trước rồi tính giá sau",
        },
      ];
    case "style":
      return [
        { label: "🏢 Hiện đại", value: "Phong cách hiện đại" },
        { label: "🏛️ Tân cổ điển", value: "Phong cách tân cổ điển" },
        { label: "🌴 Nhiệt đới", value: "Phong cách nhiệt đới" },
        { label: "🎎 Nhật Bản", value: "Phong cách Nhật Bản" },
      ];
    case "priority":
      return [
        { label: "💰 Tiết kiệm", value: "Ưu tiên tiết kiệm chi phí" },
        { label: "📐 Công năng", value: "Ưu tiên công năng sử dụng" },
        {
          label: "🌬️ Thông thoáng",
          value: "Ưu tiên thông gió và ánh sáng tự nhiên",
        },
        { label: "🎨 Thẩm mỹ", value: "Ưu tiên thẩm mỹ kiến trúc" },
        { label: "🔒 Riêng tư", value: "Ưu tiên sự riêng tư" },
      ];
    case "confirmation":
      return [
        {
          label: "✅ Chốt & xem mặt bằng",
          value: "Đúng rồi, cho tôi xem mặt bằng sơ bộ",
        },
        {
          label: "✅ Chốt & tính chi phí",
          value: "Đúng rồi, tính chi phí sơ bộ cho tôi",
        },
        {
          label: "👷 Chốt & kết nối KTS",
          value: "Đúng rồi, kết nối kiến trúc sư giúp tôi",
        },
        { label: "✏️ Sửa đổi", value: "Tôi muốn thay đổi một số thông tin" },
      ];
    case "result":
      return [
        { label: "📐 Xem mặt bằng", value: "Cho tôi xem mặt bằng sơ bộ" },
        { label: "💰 Tính chi phí", value: "Tính chi phí sơ bộ cho tôi" },
        { label: "👷 Kết nối KTS", value: "Tôi muốn kết nối kiến trúc sư" },
        { label: "📅 Đặt lịch tư vấn", value: "Tôi muốn đặt lịch tư vấn" },
        { label: "📦 Xuất vật tư", value: "Cho tôi danh sách vật tư sơ bộ" },
        { label: "🛠️ Tối ưu công năng", value: "Giúp tôi tối ưu công năng" },
      ];
    default:
      // Non-architect intents — use generic quick replies
      return buildGenericQuickReplies(intent);
  }
}

function buildGenericQuickReplies(intent: AIIntent): QuickReplyOption[] {
  switch (intent) {
    case "find_worker":
      return [
        { label: "📅 Đặt lịch ngay", value: "Tôi muốn đặt lịch với thợ" },
        { label: "💰 Xem báo giá", value: "Cho tôi xem báo giá dịch vụ" },
        { label: "👷 Xem thêm thợ", value: "Cho tôi xem thêm thợ khác" },
      ];
    case "find_product":
      return [
        { label: "🛒 Thêm vào giỏ", value: "Tôi muốn thêm sản phẩm vào giỏ" },
        {
          label: "📦 Xem thêm SP",
          value: "Cho tôi xem thêm sản phẩm tương tự",
        },
        { label: "🔧 Cần thợ lắp đặt", value: "Tôi cần thợ lắp đặt sản phẩm" },
      ];
    case "quotation_request":
      return [
        { label: "📧 Gửi yêu cầu", value: "Gửi yêu cầu báo giá cho tôi" },
        { label: "📞 Gọi tư vấn", value: "Tôi muốn gọi điện tư vấn" },
      ];
    default:
      return [
        { label: "🏠 Thiết kế nhà", value: "Tôi muốn tư vấn thiết kế nhà" },
        { label: "🔧 Tìm thợ", value: "Tôi cần tìm thợ" },
        { label: "🛒 Mua vật liệu", value: "Tôi cần mua vật liệu" },
      ];
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════

let initialized = false;

function isVagueArchitectInput(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return true;
  if (trimmed.length <= 12) return true;
  return /^(nhà đẹp|xây nhà|thiết kế nhà|báo giá|bao gia|tư vấn|tu van|chưa biết|không biết|khong biet)$/.test(
    trimmed,
  );
}

function buildArchitectRuntimeContext(
  userText: string,
  nextStep: ArchitectStep,
  isArchitectFlow: boolean,
): string {
  if (!isArchitectFlow) return "";

  const readiness = getConsultationReadiness();
  const nextQuestion = getNextQuestionGuidance();
  const lines: string[] = ["[ORCHESTRATOR]"];

  if (isArchitectStateEmpty() || isVagueArchitectInput(userText)) {
    lines.push(
      "User đang còn mơ hồ hoặc chưa biết bắt đầu. Hãy mở bằng 1 câu rất dễ trả lời, có thể kèm ví dụ như 5x20, nhà 3 tầng có gara.",
    );
  }

  if (readiness.readyForSummary && !getArchitectState().isConfirmed) {
    lines.push(
      "Đã đủ dữ liệu cốt lõi. Việc chính của bạn là tóm tắt lại nhu cầu, hỏi xác nhận ngắn gọn, chưa cần hỏi lan man thêm.",
    );
  } else if (nextQuestion) {
    lines.push(`Câu hỏi kế tiếp nên tập trung vào: ${nextQuestion.question}`);
  }

  if (getArchitectState().isConfirmed && canGenerateConcept()) {
    lines.push(
      "User đã xác nhận. Hãy đưa ra phương án sơ bộ ngắn gọn, thực tế, rồi chốt bước tiếp theo rõ ràng.",
    );
  }

  lines.push(`Step tiếp theo hệ thống đang hướng tới: ${nextStep}`);
  lines.push("[/ORCHESTRATOR]");
  return lines.join("\n");
}

export function initSalesChat() {
  if (initialized) return;
  openclawAI.startChat(ARCHITECT_SYSTEM_PROMPT);
  initialized = true;
  aiLog.info("Architect chat initialized");
}

export function resetSalesChat() {
  openclawAI.clearChat();
  resetArchitectState();
  initialized = false;
  initSalesChat();
  aiLog.info("Architect chat reset");
}

/**
 * Process a user message through the full architect pipeline:
 * parse → state update → step advance → AI call → tools → blocks
 */
export async function processUserMessage(
  userText: string,
  options?: { timeout?: number },
): Promise<ChatMessage> {
  if (!initialized) initSalesChat();

  // ── 1. Parse data points from free text ──
  const extracted = parseArchitectInput(userText);
  const hasNewData = Object.keys(extracted).length > 0;

  // ── 2. Update state ──
  if (hasNewData) {
    updateArchitectState(extracted);
    aiLog.info(`Extracted ${Object.keys(extracted).length} fields from input`);
  }

  const currentState = getArchitectState();

  // ── 3. Local intent detection ──
  const localIntent = detectIntentLocal(userText);
  aiLog.intent(localIntent, "local");

  // ── 3b. WORKER-SEARCH FAST PATH ──
  // When local intent is clearly worker-search, force the tool call
  // immediately. AI is still called for conversational text, but
  // the worker search result is guaranteed via local orchestration.
  const isWorkerSearch =
    localIntent === "find_worker" || localIntent === "repair_consultation";

  let forcedWorkerResults: WorkerCardData[] = [];
  let extractedSkill: string | undefined;
  let extractedLocation: string | undefined;

  if (isWorkerSearch) {
    extractedSkill = extractWorkerSkill(userText);
    extractedLocation = extractLocation(userText);
    aiLog.info(
      `Worker-search fast path: skill=${extractedSkill ?? "?"}, location=${extractedLocation ?? "?"}`,
    );

    // Force worker tool call NOW, in parallel with AI call
    const cat = extractedSkill
      ? matchSkillToCategory(extractedSkill)
      : undefined;
    try {
      forcedWorkerResults = await toolSearchWorkers({
        skill: extractedSkill ?? userText,
        category: cat,
        area: extractedLocation,
        limit: 5,
      });
      aiLog.info(
        `Worker-search fast path returned ${forcedWorkerResults.length} results`,
      );
    } catch (err) {
      aiLog.error("Worker-search fast path", err);
    }
  }

  // ── 4. Advance step (smart skip) ──
  const isArchitectFlow =
    !isWorkerSearch &&
    (localIntent === "architect_consultation" ||
      localIntent === "quotation_request" ||
      localIntent === "confirm_requirements" ||
      localIntent === "provide_land_size" ||
      localIntent === "provide_floors" ||
      localIntent === "provide_functions" ||
      localIntent === "provide_budget" ||
      localIntent === "provide_style" ||
      (currentState.currentStep !== "greeting" &&
        localIntent !== "find_product" &&
        localIntent !== "greeting" &&
        localIntent !== "general_question") ||
      hasNewData);

  let nextStep = currentState.currentStep;
  if (isArchitectFlow) {
    nextStep = advanceStep();
    aiLog.info(`Step advanced → ${nextStep}`);
  }

  // ── 5. Build context-aware message for AI ──
  const stateCtx = isArchitectFlow ? `\n\n${buildStateContext()}` : "";
  const runtimeCtx = buildArchitectRuntimeContext(
    userText,
    nextStep,
    isArchitectFlow,
  );
  const aiUserMessage = `${userText}${stateCtx}${runtimeCtx ? `\n\n${runtimeCtx}` : ""}`;

  // ── 6. Call AI ──
  let rawAIText: string;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeoutMs = options?.timeout ?? 30_000;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error("AI_TIMEOUT")),
        timeoutMs,
      );
    });

    rawAIText = await Promise.race([
      openclawAI.sendMessage(aiUserMessage),
      timeoutPromise,
    ]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    aiLog.error("AI call", err);
    if (msg === "AI_TIMEOUT") {
      return buildErrorMessage(
        "Xin lỗi, AI đang quá tải. Vui lòng thử lại sau giây lát.",
        nextStep,
        localIntent,
      );
    }
    return buildErrorMessage(
      "Không thể kết nối AI. Vui lòng kiểm tra mạng và thử lại.",
      nextStep,
      localIntent,
    );
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }

  // ── 7. Parse AI response ──
  const aiIntent = extractIntentFromAI(rawAIText);
  // CRITICAL: If local detection strongly confirmed worker search,
  // do NOT let AI override it with general_question or other intents.
  // The fast path already ran; finalIntent must stay find_worker.
  const finalIntent = isWorkerSearch ? localIntent : (aiIntent ?? localIntent);
  const toolCalls = extractToolCalls(rawAIText);
  const displayText = cleanDisplayText(rawAIText);

  aiLog.intent(finalIntent, "final");

  // ── 8. Build blocks ──
  const blocks: MessageBlock[] = [];
  let products: ProductCardData[] = [];
  let workers: WorkerCardData[] = [];

  // Text block
  if (displayText) {
    blocks.push({ type: "text", text: displayText });
  }

  // ── 9. Execute explicit tool directives from AI ──
  for (const tc of toolCalls) {
    try {
      switch (tc.tool) {
        case "SEARCH_PRODUCTS": {
          const results = await toolSearchProducts({ query: tc.param });
          products = results;
          if (results.length > 0) {
            blocks.push(
              results.length === 1
                ? { type: "product_card", product: results[0] }
                : { type: "product_carousel", products: results },
            );
          } else {
            blocks.push({
              type: "system_status",
              statusType: "info",
              statusMessage: `Không tìm thấy sản phẩm "${tc.param}". Thử từ khóa khác nhé!`,
            });
          }
          break;
        }
        case "SEARCH_WORKERS": {
          const results = await toolSearchWorkers({ skill: tc.param });
          workers = results;
          if (results.length > 0) {
            blocks.push(
              results.length === 1
                ? { type: "worker_card", worker: results[0] }
                : { type: "worker_list", workers: results },
            );
          } else {
            blocks.push({
              type: "system_status",
              statusType: "info",
              statusMessage: `Không tìm thấy thợ "${tc.param}" gần bạn.`,
            });
          }
          break;
        }
        case "CREATE_LEAD": {
          const result = await toolCreateLead({
            serviceType: tc.param,
            description: userText,
          });
          if (result.success) {
            blocks.push({
              type: "system_status",
              statusType: "success",
              statusMessage: `Đã ghi nhận yêu cầu #${result.leadId}. Chúng tôi sẽ liên hệ bạn sớm!`,
            });
          }
          break;
        }
        case "CREATE_BOOKING": {
          blocks.push({
            type: "action_cta",
            cta: {
              label: "📅 Đặt lịch ngay",
              action: "book",
              payload: { serviceId: tc.param },
            },
          });
          break;
        }
      }
    } catch (toolErr) {
      aiLog.error(`tool:${tc.tool}`, toolErr);
    }
  }

  // ── 10. Inject forced worker-search results (fast path) ──
  if (
    isWorkerSearch &&
    forcedWorkerResults.length > 0 &&
    workers.length === 0
  ) {
    workers = forcedWorkerResults;
    blocks.push({ type: "worker_list", workers: forcedWorkerResults });
    aiLog.info(`Injected ${forcedWorkerResults.length} forced worker results`);
  }

  // ── 10b. Auto-fallback for non-architect intents with no tools called ──
  if (toolCalls.length === 0 && products.length === 0 && workers.length === 0) {
    if (finalIntent === "find_product" || localIntent === "find_product") {
      const autoProducts = await toolSearchProducts({
        query: userText,
        limit: 4,
      });
      products = autoProducts;
      if (autoProducts.length > 0) {
        blocks.push({ type: "product_carousel", products: autoProducts });
      }
    } else if (
      localIntent === "find_worker" ||
      localIntent === "repair_consultation" ||
      finalIntent === "find_worker" ||
      finalIntent === "repair_consultation"
    ) {
      // Use extracted skill for targeted search, not raw user text
      const skill = extractedSkill ?? extractWorkerSkill(userText) ?? userText;
      const area = extractedLocation ?? extractLocation(userText);
      const autoWorkers = await toolSearchWorkers({
        skill,
        area,
        limit: 5,
      });
      workers = autoWorkers;
      if (autoWorkers.length > 0) {
        blocks.push({ type: "worker_list", workers: autoWorkers });
      }
    }
  }

  // ── 10c. Worker-search with no results → helpful fallback message ──
  if (isWorkerSearch && workers.length === 0) {
    const skillLabel = extractedSkill ?? "thợ";
    const locationLabel = extractedLocation ?? "";
    blocks.push({
      type: "system_status",
      statusType: "info",
      statusMessage: `Không tìm thấy ${skillLabel}${locationLabel ? ` tại ${locationLabel}` : ""}. Bạn có thể thử khu vực khác hoặc loại thợ gần nhất.`,
    });
  }

  // ── 11. ARCHITECT STEP-SPECIFIC BLOCKS ──

  // Confirmation step → summary card
  if (
    nextStep === "confirmation" &&
    getConsultationReadiness().readyForSummary
  ) {
    blocks.push({
      type: "summary_card",
      summary: buildSummaryCard(),
    });
    blocks.push({
      type: "text",
      text: "✅ Nếu phần tóm tắt đã đúng, tôi sẽ đi tiếp sang phương án sơ bộ, chi phí và gợi ý bước triển khai tiếp theo.",
    });
  }

  // Result step → floor plan + cost + recommendations + CTA
  if (
    nextStep === "result" &&
    currentState.isConfirmed &&
    canGenerateConcept()
  ) {
    // Floor plan
    blocks.push({
      type: "floor_plan_summary",
      floorPlan: generateFloorPlan(),
    });

    // Cost estimate
    blocks.push({
      type: "cost_summary",
      costSummary: generateCostEstimate(),
    });

    // Recommend materials
    if (products.length === 0) {
      const recProducts = await toolRecommendMaterials();
      if (recProducts.length > 0) {
        blocks.push({
          type: "text",
          text: "📦 **Vật liệu gợi ý** phù hợp phong cách & ngân sách của bạn:",
        });
        blocks.push({ type: "product_carousel", products: recProducts });
      }
    }

    // Recommend architects/workers
    if (workers.length === 0) {
      const recWorkers = await toolRecommendArchitects();
      if (recWorkers.length > 0) {
        blocks.push({
          type: "text",
          text: "👷 **Kiến trúc sư / Thợ** gợi ý cho dự án của bạn:",
        });
        blocks.push({ type: "worker_list", workers: recWorkers });
      }
    }

    // CTA
    blocks.push({
      type: "action_cta",
      cta: {
        label: "📞 Liên hệ kiến trúc sư tư vấn",
        action: "create_lead",
        payload: { serviceType: "thiet-ke-kien-truc" },
      },
    });

    blocks.push({
      type: "action_cta",
      cta: {
        label: "📅 Đặt lịch tư vấn sơ bộ",
        action: "book",
        payload: { serviceId: "architect-consultation" },
      },
    });
  }

  // ── 12. Quick replies ──
  const qr = buildStepQuickReplies(nextStep, finalIntent);
  blocks.push({ type: "quick_replies", quickReplies: qr });

  aiLog.render(finalIntent, blocks.length);

  return {
    id: `ai-${Date.now()}`,
    role: "assistant",
    content: displayText,
    blocks,
    timestamp: new Date(),
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function buildErrorMessage(
  text: string,
  step: ArchitectStep,
  intent: AIIntent,
): ChatMessage {
  return {
    id: `err-${Date.now()}`,
    role: "assistant",
    content: text,
    blocks: [
      { type: "text", text: `❌ ${text}` },
      {
        type: "quick_replies",
        quickReplies: buildStepQuickReplies(step, intent),
      },
    ],
    timestamp: new Date(),
    hasError: true,
  };
}

/** Build the initial welcome message */
export function buildWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: "",
    blocks: [
      {
        type: "text",
        text: `Xin chào! 👋 Tôi là AI kiến trúc sư tư vấn sơ bộ của BaoTien.\n\nTôi có thể giúp anh/chị bắt đầu rất nhanh với:\n• 🏠 Ý tưởng bố trí nhà sơ bộ\n• 💰 Ước lượng chi phí ban đầu\n• 📦 Gợi ý vật tư / hạng mục cần chuẩn bị\n• 👷 Kết nối kiến trúc sư hoặc đặt lịch tư vấn\n\nAnh/chị có thể bắt đầu rất đơn giản, ví dụ:\n• "Đất 5x20, muốn xây nhà 3 tầng có gara"\n• "Tôi muốn sửa nhà và báo giá trước"\n• "Chưa biết nên làm mặt bằng hay tính chi phí trước"`,
      },
      {
        type: "quick_replies",
        quickReplies: buildStepQuickReplies("greeting", "greeting"),
      },
    ],
    timestamp: new Date(),
  };
}
