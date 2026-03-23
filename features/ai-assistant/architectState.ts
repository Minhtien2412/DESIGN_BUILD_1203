/**
 * Architect Consultation — State Engine
 *
 * Manages the 10-step consultation flow:
 * 1. greeting → 2. land_size → 3. floors → 4. functions →
 * 5. special_needs → 6. budget → 7. style → 8. priority →
 * 9. confirmation → 10. result
 *
 * Handles: state tracking, free-text parsing, smart skip,
 * missing-field detection, floor plan generation, cost estimation.
 */

import { aiLog } from "./aiLogger";
import type {
  ArchitectState,
  ArchitectStep,
  CostSummaryData,
  FloorLevelData,
  FloorPlanData,
  SummaryCardData,
} from "./types";

// ═══════════════════════════════════════════════════════════════
// STEP ORDER
// ═══════════════════════════════════════════════════════════════

const STEP_ORDER: ArchitectStep[] = [
  "greeting",
  "project_scope",
  "land_size",
  "floors",
  "functions",
  "budget",
  "style",
  "priority",
  "special_needs",
  "confirmation",
  "result",
];

// ═══════════════════════════════════════════════════════════════
// STATE SINGLETON
// ═══════════════════════════════════════════════════════════════

let state: ArchitectState = { currentStep: "greeting" };

export function getArchitectState(): Readonly<ArchitectState> {
  return state;
}

export function updateArchitectState(
  partial: Partial<ArchitectState>,
): ArchitectState {
  state = { ...state, ...partial };
  aiLog.info(`State updated → step: ${state.currentStep}`);
  return state;
}

export function resetArchitectState(): void {
  state = { currentStep: "greeting" };
  aiLog.info("Architect state reset");
}

export interface ConsultationReadiness {
  hasCoreInfo: boolean;
  readyForSummary: boolean;
  readyForProposal: boolean;
  missingCoreFields: MissingField[];
  missingRecommendedFields: MissingField[];
  nextQuestion?: MissingField;
}

// ═══════════════════════════════════════════════════════════════
// FREE-TEXT PARSER — extracts data points from Vietnamese text
// ═══════════════════════════════════════════════════════════════

export function parseArchitectInput(text: string): Partial<ArchitectState> {
  const t = text.toLowerCase().replace(/\s+/g, " ").trim();
  const extracted: Partial<ArchitectState> = {};

  // ── Build type / project scope ──
  if (/(?:xây mới|xay moi|làm mới|lam moi|xây nhà mới|thi công mới)/.test(t)) {
    extracted.buildType = "new_build";
  } else if (
    /(?:sửa nhà|sua nha|cải tạo|cai tao|nâng tầng|nang tang|remodel|renovation)/.test(
      t,
    )
  ) {
    extracted.buildType = "renovation";
  }

  // ── Consultation goal ──
  if (/(?:báo giá trước|bao gia truoc|tính giá trước|chi phí trước)/.test(t)) {
    extracted.consultationGoal = "quote_first";
  } else if (
    /(?:mặt bằng trước|mat bang truoc|layout trước|bố trí trước)/.test(t)
  ) {
    extracted.consultationGoal = "layout_first";
  } else if (
    /(?:ý tưởng trước|y tuong truoc|thiết kế trước|thiet ke truoc|phương án trước|phuong an truoc)/.test(
      t,
    )
  ) {
    extracted.consultationGoal = "design_first";
  }

  // ── Usage purpose ──
  if (
    /(?:ở kết hợp kinh doanh|o ket hop kinh doanh|vừa ở vừa kinh doanh|vua o vua kinh doanh)/.test(
      t,
    )
  ) {
    extracted.usagePurpose = "mixed";
  } else if (
    /(?:cho thuê|cho thue|căn hộ dịch vụ|homestay|phòng trọ)/.test(t)
  ) {
    extracted.usagePurpose = "rental";
  } else if (
    /(?:kinh doanh|mở shop|mo shop|văn phòng|van phong|showroom|cafe)/.test(t)
  ) {
    extracted.usagePurpose = "business";
  } else if (/(?:để ở|de o|ở gia đình|o gia dinh|nhà ở|nha o)/.test(t)) {
    extracted.usagePurpose = "living";
  }

  // ── Land dimensions: "5x20", "5 x 20", "5m x 20m", "5 nhân 20" ──
  const dimMatch = t.match(
    /(\d+(?:[.,]\d+)?)\s*(?:m|mét)?\s*[x×*nhân]\s*(\d+(?:[.,]\d+)?)\s*(?:m|mét)?/,
  );
  if (dimMatch) {
    const w = parseFloat(dimMatch[1].replace(",", "."));
    const d = parseFloat(dimMatch[2].replace(",", "."));
    if (w > 0 && w < 100 && d > 0 && d < 200) {
      extracted.landWidth = Math.min(w, d);
      extracted.landDepth = Math.max(w, d);
      extracted.landArea = w * d;
    }
  }

  // ── Land area: "100m2", "100 m²", "100 mét vuông" ──
  if (!extracted.landArea) {
    const areaMatch = t.match(
      /(\d+(?:[.,]\d+)?)\s*(?:m2|m²|mét\s*vuông|met\s*vuong)/,
    );
    if (areaMatch) {
      extracted.landArea = parseFloat(areaMatch[1].replace(",", "."));
    }
  }

  // ── Floors: "3 tầng", "2 lầu", "trệt + 2 lầu", "1 trệt 2 lầu" ──
  const floorMatch = t.match(
    /(\d+)\s*(?:tầng|tang|tâng)|(?:trệt|tret)\s*(?:\+|và|cộng)?\s*(\d+)\s*(?:lầu|lau)/,
  );
  if (floorMatch) {
    if (floorMatch[1]) {
      extracted.floors = parseInt(floorMatch[1], 10);
    } else if (floorMatch[2]) {
      // "trệt + N lầu" = N+1 floors total
      extracted.floors = parseInt(floorMatch[2], 10) + 1;
    }
  }
  // Also match simple "N lầu"
  if (!extracted.floors) {
    const lauMatch = t.match(/(\d+)\s*(?:lầu|lau)/);
    if (lauMatch) {
      extracted.floors = parseInt(lauMatch[1], 10) + 1;
    }
  }

  // ── Bedrooms: "4 phòng ngủ", "3 PN", "4 pn" ──
  const bedMatch = t.match(/(\d+)\s*(?:phòng ngủ|phong ngu|pn|bedroom)/i);
  if (bedMatch) {
    extracted.bedrooms = parseInt(bedMatch[1], 10);
  }

  // ── Bathrooms: "2 WC", "3 phòng tắm", "2 toilet" ──
  const bathMatch = t.match(
    /(\d+)\s*(?:wc|phòng tắm|phong tam|toilet|nhà vệ sinh)/i,
  );
  if (bathMatch) {
    extracted.bathrooms = parseInt(bathMatch[1], 10);
  }

  // ── Garage / parking ──
  if (/(?:ga-?ra|gara|để xe|đỗ xe|parking|ô tô|oto)/.test(t)) {
    extracted.hasGarage = true;
  }

  // ── Worship room ──
  if (/(?:phòng thờ|phong tho|bàn thờ|ban tho|thờ cúng)/.test(t)) {
    extracted.hasWorshipRoom = true;
  }

  // ── Rooftop ──
  if (/(?:sân thượng|san thuong|rooftop|tầng thượng|tang thuong)/.test(t)) {
    extracted.hasRooftop = true;
  }

  // ── Skylight / elevator / elderly / green space ──
  if (/(?:giếng trời|gieng troi|lấy sáng giữa nhà|lay sang giua nha)/.test(t)) {
    extracted.hasSkylight = true;
  }
  if (/(?:thang máy|thang may|elevator|lift)/.test(t)) {
    extracted.hasElevator = true;
  }
  if (/(?:người già|nguoi gia|ông bà|ong ba|tuổi lớn|tuoi lon)/.test(t)) {
    extracted.needsElderFriendly = true;
  }
  if (
    /(?:không gian xanh|khong gian xanh|nhiều cây xanh|nhieu cay xanh|vườn nhỏ|vuon nho|sân vườn|san vuon)/.test(
      t,
    )
  ) {
    extracted.wantsGreenSpace = true;
  }

  // ── Budget amount: "1 tỷ", "500 triệu", "1.5 tỉ", "2 ty" ──
  const budgetMatch = t.match(/(\d+(?:[.,]\d+)?)\s*(?:tỷ|tỉ|ty|ti|billion)/i);
  if (budgetMatch) {
    extracted.budgetAmount =
      parseFloat(budgetMatch[1].replace(",", ".")) * 1_000_000_000;
  }
  if (!extracted.budgetAmount) {
    const trMatch = t.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|trieu|million|tr)/i);
    if (trMatch) {
      extracted.budgetAmount =
        parseFloat(trMatch[1].replace(",", ".")) * 1_000_000;
    }
  }

  // ── Budget tier from amount ──
  if (extracted.budgetAmount) {
    if (extracted.budgetAmount < 1_500_000_000)
      extracted.budgetTier = "economy";
    else if (extracted.budgetAmount < 3_000_000_000)
      extracted.budgetTier = "standard";
    else if (extracted.budgetAmount < 6_000_000_000)
      extracted.budgetTier = "premium";
    else extracted.budgetTier = "luxury";
  }
  // ── Budget tier from keywords ──
  if (!extracted.budgetTier) {
    if (/(?:tiết kiệm|rẻ|bình dân|economy|giá rẻ)/.test(t))
      extracted.budgetTier = "economy";
    else if (/(?:trung bình|tầm trung|standard|vừa phải)/.test(t))
      extracted.budgetTier = "standard";
    else if (/(?:cao cấp|premium|sang trọng|đẳng cấp)/.test(t))
      extracted.budgetTier = "premium";
    else if (/(?:siêu sang|luxury|xa xỉ|ultra)/.test(t))
      extracted.budgetTier = "luxury";
  }

  // ── Style ──
  const styleMap: Record<string, string> = {
    "hiện đại": "Hiện đại",
    "hien dai": "Hiện đại",
    modern: "Hiện đại",
    minimalist: "Tối giản",
    "tối giản": "Tối giản",
    "cổ điển": "Cổ điển",
    "co dien": "Cổ điển",
    classic: "Cổ điển",
    "tân cổ điển": "Tân cổ điển",
    "tan co dien": "Tân cổ điển",
    neoclassical: "Tân cổ điển",
    tropical: "Nhiệt đới",
    "nhiệt đới": "Nhiệt đới",
    "nhiet doi": "Nhiệt đới",
    industrial: "Công nghiệp",
    "công nghiệp": "Công nghiệp",
    scandinavian: "Bắc Âu",
    "bắc âu": "Bắc Âu",
    japanese: "Nhật Bản",
    "nhật bản": "Nhật Bản",
    "phong thủy": "Phong thủy",
    "phong thuy": "Phong thủy",
    "đông dương": "Đông Dương",
    indochine: "Đông Dương",
  };
  for (const [keyword, style] of Object.entries(styleMap)) {
    if (t.includes(keyword)) {
      extracted.style = style;
      break;
    }
  }

  // ── Priority ──
  if (/(?:tiết kiệm chi phí|giảm chi phí|rẻ nhất|tối ưu chi phí)/.test(t))
    extracted.priority = "cost";
  else if (/(?:tối đa diện tích|rộng rãi|nhiều phòng|tận dụng)/.test(t))
    extracted.priority = "space";
  else if (
    /(?:công năng|cong nang|tiện nghi|tối ưu sử dụng|toi uu su dung)/.test(t)
  )
    extracted.priority = "functionality";
  else if (/(?:đẹp|thẩm mỹ|sang trọng|nổi bật|ấn tượng)/.test(t))
    extracted.priority = "aesthetics";
  else if (/(?:thoáng|thông gió|ánh sáng|mát|thiên nhiên)/.test(t))
    extracted.priority = "ventilation";
  else if (/(?:riêng tư|rieng tu|kín đáo|kin dao|tách biệt|tach biet)/.test(t))
    extracted.priority = "privacy";
  else if (/(?:phong thủy|phong thuy|hướng|hợp tuổi)/.test(t))
    extracted.priority = "feng_shui";

  // ── Facing direction ──
  const dirMap: Record<string, string> = {
    "hướng đông": "Đông",
    "hướng tây": "Tây",
    "hướng nam": "Nam",
    "hướng bắc": "Bắc",
    "đông nam": "Đông Nam",
    "đông bắc": "Đông Bắc",
    "tây nam": "Tây Nam",
    "tây bắc": "Tây Bắc",
  };
  for (const [keyword, dir] of Object.entries(dirMap)) {
    if (t.includes(keyword)) {
      extracted.facingDirection = dir;
      break;
    }
  }

  // ── Special needs (accumulate) ──
  const specialItems: string[] = [];
  if (extracted.hasGarage) specialItems.push("Gara ô tô");
  if (extracted.hasWorshipRoom) specialItems.push("Phòng thờ");
  if (extracted.hasRooftop) specialItems.push("Sân thượng");
  if (extracted.hasSkylight) specialItems.push("Giếng trời");
  if (extracted.hasElevator) specialItems.push("Thang máy");
  if (extracted.needsElderFriendly) specialItems.push("Phù hợp người lớn tuổi");
  if (extracted.wantsGreenSpace) specialItems.push("Không gian xanh");
  if (/(?:ban công|balcony)/.test(t)) specialItems.push("Ban công");
  if (/(?:hồ bơi|bể bơi|pool)/.test(t)) specialItems.push("Hồ bơi");
  if (/(?:sân vườn|vườn|garden)/.test(t)) specialItems.push("Sân vườn");
  if (/(?:phòng giặt|giặt đồ)/.test(t)) specialItems.push("Phòng giặt");
  if (/(?:phòng khách rộng|phòng khách lớn)/.test(t))
    specialItems.push("Phòng khách rộng");
  if (/(?:phòng bếp mở|bếp mở|open kitchen)/.test(t))
    specialItems.push("Bếp mở");

  if (specialItems.length > 0) {
    extracted.specialNeeds = [
      ...(state.specialNeeds ?? []),
      ...specialItems.filter((s) => !(state.specialNeeds ?? []).includes(s)),
    ];
    extracted.specialNeedsConfirmed = true;
  } else if (
    /(?:không có yêu cầu đặc biệt|khong co yeu cau dac biet|không cần thêm|khong can them|không có gì thêm|khong co gi them)/.test(
      t,
    )
  ) {
    extracted.specialNeeds = state.specialNeeds ?? [];
    extracted.specialNeedsConfirmed = true;
  }

  // ── Main functions (rooms mentioned) ──
  const fnItems: string[] = [];
  if (/(?:phòng ngủ|bedroom)/.test(t)) fnItems.push("Phòng ngủ");
  if (/(?:phòng khách|living)/.test(t)) fnItems.push("Phòng khách");
  if (/(?:phòng bếp|bếp|kitchen)/.test(t)) fnItems.push("Bếp");
  if (/(?:phòng ăn|dining)/.test(t)) fnItems.push("Phòng ăn");
  if (/(?:phòng làm việc|văn phòng|office|study)/.test(t))
    fnItems.push("Phòng làm việc");
  if (fnItems.length > 0) {
    extracted.mainFunctions = [
      ...(state.mainFunctions ?? []),
      ...fnItems.filter((f) => !(state.mainFunctions ?? []).includes(f)),
    ];
  }

  // ── Confirmation ──
  if (/(?:ok|đồng ý|xác nhận|chính xác|đúng rồi|confirm|yes|ổn)/.test(t)) {
    if (state.currentStep === "confirmation") {
      extracted.isConfirmed = true;
    }
  }

  return extracted;
}

// ═══════════════════════════════════════════════════════════════
// MISSING FIELD DETECTION
// ═══════════════════════════════════════════════════════════════

export interface MissingField {
  field: string;
  step: ArchitectStep;
  question: string;
  importance: "required" | "recommended";
}

function getCoreMissingFields(): MissingField[] {
  const missing: MissingField[] = [];

  if (!state.buildType) {
    missing.push({
      field: "buildType",
      step: "project_scope",
      question: "Anh/chị đang xây mới hay sửa/cải tạo nhà?",
      importance: "required",
    });
  }

  if (!state.landWidth && !state.landArea) {
    missing.push({
      field: "landSize",
      step: "land_size",
      question: "Kích thước đất (rộng x dài hoặc diện tích)?",
      importance: "required",
    });
  }

  if (!state.floors) {
    missing.push({
      field: "floors",
      step: "floors",
      question: "Nhà mấy tầng?",
      importance: "required",
    });
  }

  if (!state.bedrooms && (state.mainFunctions ?? []).length === 0) {
    missing.push({
      field: "bedrooms",
      step: "functions",
      question: "Cần bao nhiêu phòng ngủ hoặc công năng chính nào?",
      importance: "required",
    });
  }

  if (!state.budgetTier && !state.budgetAmount) {
    missing.push({
      field: "budget",
      step: "budget",
      question:
        "Ngân sách dự kiến (hoặc mức: tiết kiệm / trung bình / cao cấp)?",
      importance: "required",
    });
  }

  if (!state.style && !state.priority) {
    missing.push({
      field: "styleOrPriority",
      step: "style",
      question: "Anh/chị muốn ưu tiên phong cách hay công năng nào trước?",
      importance: "required",
    });
  }

  return missing;
}

function getRecommendedMissingFields(): MissingField[] {
  const missing: MissingField[] = [];

  if (!state.bathrooms) {
    missing.push({
      field: "bathrooms",
      step: "functions",
      question: "Dự kiến cần khoảng bao nhiêu WC?",
      importance: "recommended",
    });
  }

  if (!state.usagePurpose) {
    missing.push({
      field: "usagePurpose",
      step: "functions",
      question: "Nhà dùng để ở, cho thuê hay kết hợp kinh doanh?",
      importance: "recommended",
    });
  }

  if (!state.consultationGoal) {
    missing.push({
      field: "consultationGoal",
      step: "project_scope",
      question:
        "Anh/chị muốn đi theo hướng báo giá trước hay ý tưởng/mặt bằng trước?",
      importance: "recommended",
    });
  }

  if (!state.specialNeedsConfirmed) {
    missing.push({
      field: "specialNeeds",
      step: "special_needs",
      question:
        "Có nhu cầu đặc biệt như gara, phòng thờ, sân thượng, giếng trời, thang máy hay không gian xanh không?",
      importance: "recommended",
    });
  }

  return missing;
}

export function getMissingFields(): MissingField[] {
  return [...getCoreMissingFields(), ...getRecommendedMissingFields()];
}

export function getNextQuestionGuidance(): MissingField | undefined {
  return getCoreMissingFields()[0] ?? getRecommendedMissingFields()[0];
}

export function getConsultationReadiness(): ConsultationReadiness {
  const missingCoreFields = getCoreMissingFields();
  const missingRecommendedFields = getRecommendedMissingFields();

  return {
    hasCoreInfo: missingCoreFields.length === 0,
    readyForSummary: missingCoreFields.length === 0,
    readyForProposal: missingCoreFields.length === 0 && !!state.isConfirmed,
    missingCoreFields,
    missingRecommendedFields,
    nextQuestion: missingCoreFields[0] ?? missingRecommendedFields[0],
  };
}

export function canGenerateConcept(): boolean {
  return getCoreMissingFields().length === 0;
}

function getPrimaryConversionGoal(readiness: ConsultationReadiness): string {
  if (!readiness.hasCoreInfo) {
    if (state.consultationGoal === "quote_first") {
      return "Lấy đủ đầu bài tối thiểu để chốt ước chi phí sơ bộ";
    }
    if (state.consultationGoal === "layout_first") {
      return "Lấy đủ đầu bài tối thiểu để đi sang mặt bằng sơ bộ";
    }
    return "Giúp user chốt nhanh đầu bài thiết kế để không bị bí khi bắt đầu";
  }

  if (readiness.readyForSummary && !state.isConfirmed) {
    return "Tóm tắt nhu cầu và xin xác nhận để mở sang mặt bằng / chi phí / kết nối KTS";
  }

  if (readiness.readyForProposal) {
    return "Ra phương án sơ bộ và kéo user sang CTA tiếp theo có giá trị cao";
  }

  return "Giữ hội thoại mượt và dẫn user sang bước tiếp theo phù hợp";
}

function getSuggestedConversionActions(
  readiness: ConsultationReadiness,
): string[] {
  const actions: string[] = [];

  if (!readiness.hasCoreInfo) {
    if (state.consultationGoal === "layout_first") {
      actions.push("Xem mặt bằng sơ bộ");
      actions.push("Tính chi phí sơ bộ");
    } else if (state.consultationGoal === "quote_first") {
      actions.push("Tính chi phí sơ bộ");
      actions.push("Xem mặt bằng sơ bộ");
    } else {
      actions.push("Xem mặt bằng sơ bộ");
      actions.push("Tính chi phí sơ bộ");
    }
    actions.push("Kết nối kiến trúc sư");
  } else if (readiness.readyForSummary && !state.isConfirmed) {
    if (state.consultationGoal === "quote_first") {
      actions.push("Chốt nhu cầu để tính chi phí sơ bộ");
      actions.push("Xem mặt bằng sơ bộ");
    } else if (state.consultationGoal === "layout_first") {
      actions.push("Chốt nhu cầu để xem mặt bằng sơ bộ");
      actions.push("Tính chi phí sơ bộ");
    } else {
      actions.push("Xem mặt bằng sơ bộ");
      actions.push("Tính chi phí sơ bộ");
    }
    actions.push("Kết nối kiến trúc sư");
  } else if (readiness.readyForProposal) {
    if (state.consultationGoal === "quote_first") {
      actions.push("Tính chi phí sơ bộ");
      actions.push("Xem mặt bằng sơ bộ");
    } else {
      actions.push("Xem mặt bằng sơ bộ");
      actions.push("Tính chi phí sơ bộ");
    }
    actions.push("Kết nối kiến trúc sư");
    actions.push("Đặt lịch tư vấn");
  }

  return [...new Set(actions)].slice(0, 4);
}

export function isArchitectStateEmpty(): boolean {
  return !(
    state.buildType ||
    state.landWidth ||
    state.landArea ||
    state.floors ||
    state.bedrooms ||
    state.budgetAmount ||
    state.budgetTier ||
    state.style ||
    state.priority ||
    state.consultationGoal
  );
}

export function getKnownFieldLabels(): string[] {
  const known: string[] = [];
  if (state.buildType)
    known.push(`Loại việc: ${buildTypeLabel(state.buildType)}`);
  if (state.landWidth && state.landDepth)
    known.push(`Đất: ${state.landWidth}×${state.landDepth}m`);
  else if (state.landArea) known.push(`Đất: ${state.landArea}m²`);
  if (state.floors) known.push(`${state.floors} tầng`);
  if (state.bedrooms) known.push(`${state.bedrooms} phòng ngủ`);
  if (state.bathrooms) known.push(`${state.bathrooms} WC`);
  if (state.usagePurpose)
    known.push(`Mục đích: ${usagePurposeLabel(state.usagePurpose)}`);
  if (state.consultationGoal)
    known.push(`Ưu tiên tư vấn: ${goalLabel(state.consultationGoal)}`);
  if (state.style) known.push(`Phong cách: ${state.style}`);
  if (state.priority) known.push(`Ưu tiên: ${priorityLabel(state.priority)}`);
  if (state.budgetAmount)
    known.push(`Ngân sách: ${formatBudget(state.budgetAmount)}`);
  else if (state.budgetTier)
    known.push(`Mức đầu tư: ${tierLabel(state.budgetTier)}`);
  if ((state.specialNeeds ?? []).length > 0)
    known.push(`Nhu cầu đặc biệt: ${state.specialNeeds!.join(", ")}`);
  return known;
}

// ═══════════════════════════════════════════════════════════════
// STEP PROGRESSION — smart skip logic
// ═══════════════════════════════════════════════════════════════

/** Get the next step based on what data we have */
export function advanceStep(): ArchitectStep {
  // If already confirmed → result
  if (state.isConfirmed) {
    state.currentStep = "result";
    return "result";
  }

  // If current step is result, stay there
  if (state.currentStep === "result") return "result";

  const currentIdx = STEP_ORDER.indexOf(state.currentStep);

  // Walk forward from current step, skip steps that are already satisfied
  for (let i = currentIdx + 1; i < STEP_ORDER.length; i++) {
    const step = STEP_ORDER[i];
    if (!isStepSatisfied(step)) {
      state.currentStep = step;
      return step;
    }
  }

  // All data steps satisfied → go to confirmation
  if (
    canGenerateConcept() &&
    state.currentStep !== "confirmation" &&
    !state.isConfirmed
  ) {
    state.currentStep = "confirmation";
    return "confirmation";
  }

  return state.currentStep;
}

function isStepSatisfied(step: ArchitectStep): boolean {
  switch (step) {
    case "greeting":
      return true; // always skip greeting after first message
    case "project_scope":
      return !!state.buildType;
    case "land_size":
      return !!(state.landWidth || state.landArea);
    case "floors":
      return !!state.floors;
    case "functions":
      return !!(state.bedrooms || (state.mainFunctions ?? []).length > 0);
    case "budget":
      return !!(state.budgetTier || state.budgetAmount);
    case "style":
      return !!(state.style || state.priority);
    case "priority":
      return !!state.priority;
    case "special_needs":
      return !!state.specialNeedsConfirmed;
    case "confirmation":
      return !!state.isConfirmed;
    case "result":
      return false;
    default:
      return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// STATE CONTEXT BUILDER — for AI prompt injection
// ═══════════════════════════════════════════════════════════════

export function buildStateContext(): string {
  const lines: string[] = ["[CONTEXT]"];
  const readiness = getConsultationReadiness();
  const suggestedActions = getSuggestedConversionActions(readiness);

  lines.push(`Bước: ${stepLabel(state.currentStep)}`);
  lines.push(
    `Sẵn sàng tạo phương án sơ bộ: ${readiness.readyForSummary ? "CÓ" : "CHƯA"}`,
  );
  lines.push(
    `Mục tiêu chuyển đổi hiện tại: ${getPrimaryConversionGoal(readiness)}`,
  );

  // What we know
  const known = getKnownFieldLabels();
  if (state.hasGarage) known.push("Có gara");
  if (state.hasWorshipRoom) known.push("Có phòng thờ");
  if (state.hasRooftop) known.push("Có sân thượng");
  if (state.facingDirection) known.push(`Hướng: ${state.facingDirection}`);
  if ((state.mainFunctions ?? []).length > 0)
    known.push(`Chức năng: ${state.mainFunctions!.join(", ")}`);

  if (known.length > 0) lines.push(`Đã biết: ${known.join(" | ")}`);

  // What we still need
  if (readiness.missingCoreFields.length > 0) {
    lines.push(
      `Thiếu thông tin cốt lõi: ${readiness.missingCoreFields.map((m) => m.question).join("; ")}`,
    );
  }
  if (readiness.missingRecommendedFields.length > 0) {
    lines.push(
      `Thông tin nên khai thác thêm: ${readiness.missingRecommendedFields
        .map((m) => m.question)
        .join("; ")}`,
    );
  }
  if (readiness.nextQuestion) {
    lines.push(`Câu nên hỏi tiếp theo: ${readiness.nextQuestion.question}`);
  } else {
    lines.push(
      "Đã đủ thông tin cơ bản — hãy tóm tắt lại và xin xác nhận trước khi ra phương án.",
    );
  }

  if (suggestedActions.length > 0) {
    lines.push(`CTA ưu tiên sau phản hồi: ${suggestedActions.join(" | ")}`);
  }

  lines.push(
    "Nguyên tắc: KHÔNG hỏi lại dữ liệu đã biết. Mỗi lần chỉ hỏi 1 câu trọng tâm.",
  );
  lines.push("[/CONTEXT]");
  return lines.join("\n");
}

function stepLabel(step: ArchitectStep): string {
  const map: Record<ArchitectStep, string> = {
    greeting: "Chào hỏi",
    project_scope: "Loại nhu cầu",
    land_size: "Kích thước đất",
    floors: "Số tầng",
    functions: "Công năng",
    budget: "Ngân sách",
    style: "Phong cách",
    priority: "Ưu tiên tối ưu",
    special_needs: "Yêu cầu đặc biệt",
    confirmation: "Xác nhận",
    result: "Kết quả",
  };
  return map[step] ?? step;
}

function priorityLabel(p: string): string {
  const map: Record<string, string> = {
    cost: "Tiết kiệm chi phí",
    space: "Tối đa diện tích",
    functionality: "Công năng sử dụng",
    aesthetics: "Thẩm mỹ",
    ventilation: "Thông thoáng",
    privacy: "Riêng tư",
    feng_shui: "Phong thủy",
  };
  return map[p] ?? p;
}

function buildTypeLabel(
  type: NonNullable<ArchitectState["buildType"]>,
): string {
  return type === "renovation" ? "Sửa / cải tạo" : "Xây mới";
}

function usagePurposeLabel(
  purpose: NonNullable<ArchitectState["usagePurpose"]>,
): string {
  const map: Record<NonNullable<ArchitectState["usagePurpose"]>, string> = {
    living: "Để ở",
    rental: "Cho thuê",
    business: "Kết hợp kinh doanh",
    mixed: "Ở + kinh doanh/cho thuê",
  };
  return map[purpose] ?? purpose;
}

function goalLabel(
  goal: NonNullable<ArchitectState["consultationGoal"]>,
): string {
  const map: Record<NonNullable<ArchitectState["consultationGoal"]>, string> = {
    design_first: "Ý tưởng thiết kế trước",
    quote_first: "Báo giá trước",
    layout_first: "Mặt bằng/công năng trước",
  };
  return map[goal] ?? goal;
}

function formatBudget(amount: number): string {
  if (amount >= 1_000_000_000)
    return `${(amount / 1_000_000_000).toFixed(amount % 1_000_000_000 === 0 ? 0 : 1)} tỷ`;
  return `${Math.round(amount / 1_000_000)} triệu`;
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY CARD BUILDER
// ═══════════════════════════════════════════════════════════════

export function buildSummaryCard(): SummaryCardData {
  const items: SummaryCardData["items"] = [];

  if (state.buildType) {
    items.push({
      label: "Loại nhu cầu",
      value: buildTypeLabel(state.buildType),
      icon: "construct-outline",
    });
  }

  if (state.landWidth && state.landDepth) {
    items.push({
      label: "Kích thước đất",
      value: `${state.landWidth} × ${state.landDepth}m (${state.landWidth * state.landDepth}m²)`,
      icon: "resize-outline",
    });
  } else if (state.landArea) {
    items.push({
      label: "Diện tích đất",
      value: `${state.landArea}m²`,
      icon: "resize-outline",
    });
  }

  if (state.floors)
    items.push({
      label: "Số tầng",
      value: `${state.floors} tầng`,
      icon: "layers-outline",
    });
  if (state.bedrooms)
    items.push({
      label: "Phòng ngủ",
      value: `${state.bedrooms} phòng`,
      icon: "bed-outline",
    });
  if (state.bathrooms)
    items.push({
      label: "Phòng tắm",
      value: `${state.bathrooms} WC`,
      icon: "water-outline",
    });

  const specials: string[] = [];
  if (state.hasGarage) specials.push("Gara");
  if (state.hasWorshipRoom) specials.push("Phòng thờ");
  if (state.hasRooftop) specials.push("Sân thượng");
  if ((state.specialNeeds ?? []).length > 0)
    specials.push(...state.specialNeeds!);
  if (specials.length > 0)
    items.push({
      label: "Đặc biệt",
      value: [...new Set(specials)].join(", "),
      icon: "star-outline",
    });

  if (state.budgetAmount)
    items.push({
      label: "Ngân sách",
      value: formatBudget(state.budgetAmount),
      icon: "cash-outline",
    });
  else if (state.budgetTier)
    items.push({
      label: "Mức đầu tư",
      value: tierLabel(state.budgetTier),
      icon: "cash-outline",
    });

  if (state.style)
    items.push({
      label: "Phong cách",
      value: state.style,
      icon: "color-palette-outline",
    });
  if (state.priority)
    items.push({
      label: "Ưu tiên",
      value: priorityLabel(state.priority),
      icon: "flag-outline",
    });

  if (state.usagePurpose)
    items.push({
      label: "Mục đích sử dụng",
      value: usagePurposeLabel(state.usagePurpose),
      icon: "home-outline",
    });

  if (state.consultationGoal)
    items.push({
      label: "Hướng tư vấn trước",
      value: goalLabel(state.consultationGoal),
      icon: "navigate-outline",
    });

  return { title: "📋 Tóm tắt yêu cầu thiết kế", items };
}

function tierLabel(tier: string): string {
  const map: Record<string, string> = {
    economy: "Tiết kiệm",
    standard: "Trung bình",
    premium: "Cao cấp",
    luxury: "Siêu sang",
  };
  return map[tier] ?? tier;
}

// ═══════════════════════════════════════════════════════════════
// FLOOR PLAN GENERATOR
// ═══════════════════════════════════════════════════════════════

export function generateFloorPlan(): FloorPlanData {
  const w = state.landWidth ?? 5;
  const d = state.landDepth ?? 20;
  const numFloors = state.floors ?? 2;
  const bedrooms = state.bedrooms ?? 3;
  const bathrooms = state.bathrooms ?? Math.max(2, Math.ceil(bedrooms / 2));

  // Setback: 60-70% land coverage for townhouse
  const coverage = 0.65;
  const floorArea = Math.round(w * d * coverage);
  const totalArea = floorArea * numFloors;

  const floors: FloorLevelData[] = [];

  // ── Ground floor (tầng trệt) ──
  const gf: FloorLevelData = {
    level: 1,
    label: "Tầng trệt",
    rooms: [],
    totalArea: floorArea,
  };

  const stairArea = 8;
  let remaining = floorArea - stairArea;
  gf.rooms.push({ name: "Cầu thang", area: stairArea, icon: "🪜" });

  if (state.hasGarage) {
    const garageArea = Math.min(
      Math.round(w * 5),
      Math.round(remaining * 0.25),
    );
    gf.rooms.push({ name: "Gara ô tô", area: garageArea, icon: "🚗" });
    remaining -= garageArea;
  }

  const livingArea = Math.round(remaining * 0.4);
  gf.rooms.push({ name: "Phòng khách", area: livingArea, icon: "🛋️" });
  remaining -= livingArea;

  const kitchenArea = Math.round(remaining * 0.5);
  gf.rooms.push({ name: "Bếp & Phòng ăn", area: kitchenArea, icon: "🍳" });
  remaining -= kitchenArea;

  gf.rooms.push({ name: "WC khách", area: Math.min(4, remaining), icon: "🚿" });
  remaining -= Math.min(4, remaining);

  if (remaining > 3) {
    gf.rooms.push({ name: "Hành lang/Tiện ích", area: remaining, icon: "🚪" });
  }

  floors.push(gf);

  // ── Upper floors ──
  let bedroomsPlaced = 0;
  let wcPlaced = 1; // ground floor WC

  for (let i = 2; i <= numFloors; i++) {
    const fl: FloorLevelData = {
      level: i,
      label:
        i === numFloors && state.hasRooftop
          ? `Tầng ${i} + Sân thượng`
          : `Tầng ${i}`,
      rooms: [],
      totalArea: floorArea,
    };

    let rem = floorArea - stairArea;
    fl.rooms.push({ name: "Cầu thang", area: stairArea, icon: "🪜" });

    // Worship room on 2nd floor (common in Vietnamese houses)
    if (i === 2 && state.hasWorshipRoom) {
      const worshipArea = Math.min(10, Math.round(rem * 0.15));
      fl.rooms.push({ name: "Phòng thờ", area: worshipArea, icon: "🙏" });
      rem -= worshipArea;
    }

    // Bedrooms for this floor
    const bedsThisFloor =
      i === numFloors
        ? bedrooms - bedroomsPlaced
        : Math.min(
            Math.ceil(bedrooms / (numFloors - 1)),
            bedrooms - bedroomsPlaced,
          );

    for (let b = 0; b < bedsThisFloor && b < 4; b++) {
      const isMaster = bedroomsPlaced === 0 && b === 0;
      const bedArea = isMaster
        ? Math.round(rem * 0.35)
        : Math.round(rem * 0.25);
      fl.rooms.push({
        name: isMaster
          ? "Phòng ngủ Master"
          : `Phòng ngủ ${bedroomsPlaced + b + 1}`,
        area: Math.max(12, bedArea),
        icon: "🛏️",
      });
      rem -= Math.max(12, bedArea);
      bedroomsPlaced++;
    }

    // Bathrooms
    const wcsThisFloor = Math.min(
      Math.max(1, bedsThisFloor > 1 ? 2 : 1),
      bathrooms - wcPlaced,
    );
    for (let wc = 0; wc < wcsThisFloor; wc++) {
      const wcArea = Math.min(5, Math.max(3, Math.round(rem * 0.08)));
      fl.rooms.push({
        name: `WC ${wcPlaced + wc + 1}`,
        area: wcArea,
        icon: "🚿",
      });
      rem -= wcArea;
      wcPlaced++;
    }

    // Balcony
    if (rem > 5) {
      const balconyArea = Math.min(6, Math.round(rem * 0.3));
      fl.rooms.push({ name: "Ban công", area: balconyArea, icon: "🌿" });
      rem -= balconyArea;
    }

    if (rem > 2) {
      fl.rooms.push({ name: "Hành lang", area: rem, icon: "🚪" });
    }

    floors.push(fl);
  }

  return {
    floors,
    totalArea,
    landCoverage: Math.round(coverage * 100),
  };
}

// ═══════════════════════════════════════════════════════════════
// COST ESTIMATOR
// ═══════════════════════════════════════════════════════════════

const PRICE_PER_M2: Record<string, number> = {
  economy: 4_500_000,
  standard: 7_000_000,
  premium: 12_000_000,
  luxury: 22_000_000,
};

export function generateCostEstimate(): CostSummaryData {
  const tier = state.budgetTier ?? "standard";
  const pricePerM2 = PRICE_PER_M2[tier] ?? PRICE_PER_M2.standard;
  const plan = generateFloorPlan();
  const totalArea = plan.totalArea;

  const structureCost = Math.round(totalArea * pricePerM2 * 0.4);
  const finishingCost = Math.round(totalArea * pricePerM2 * 0.35);
  const mepCost = Math.round(totalArea * pricePerM2 * 0.15);
  const otherCost = Math.round(totalArea * pricePerM2 * 0.1);
  const total = structureCost + finishingCost + mepCost + otherCost;

  // Check budget fit
  let budgetFit: "under" | "fit" | "over" = "fit";
  if (state.budgetAmount) {
    if (total > state.budgetAmount * 1.1) budgetFit = "over";
    else if (total < state.budgetAmount * 0.8) budgetFit = "under";
  }

  return {
    items: [
      { label: "Kết cấu & Xây thô", amount: structureCost, note: "~40%" },
      { label: "Hoàn thiện nội thất", amount: finishingCost, note: "~35%" },
      { label: "Điện - Nước - PCCC", amount: mepCost, note: "~15%" },
      {
        label: "Thiết kế, Giấy phép, Dự phòng",
        amount: otherCost,
        note: "~10%",
      },
    ],
    total,
    pricePerM2,
    budgetFit,
  };
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT RECOMMENDATION KEYWORDS
// ═══════════════════════════════════════════════════════════════

/** Returns product search queries based on current state */
export function getRecommendationQueries(): string[] {
  const queries: string[] = [];

  if (state.style) {
    queries.push(`nội thất ${state.style}`);
  }

  if (state.budgetTier === "economy" || state.budgetTier === "standard") {
    queries.push("vật liệu xây dựng");
  } else {
    queries.push("nội thất cao cấp");
  }

  if (state.hasWorshipRoom) queries.push("bàn thờ");
  if (state.bedrooms && state.bedrooms >= 3) queries.push("đèn phòng ngủ");

  // Always add lighting and sanitary
  queries.push("thiết bị vệ sinh");
  queries.push("thiết bị chiếu sáng");

  return queries.slice(0, 3);
}

/** Returns worker service type based on project scope */
export function getWorkerRecommendationType(): string {
  if (state.floors && state.floors >= 3) return "kiến trúc sư";
  if (state.budgetTier === "premium" || state.budgetTier === "luxury")
    return "kiến trúc sư";
  return "thợ xây";
}
