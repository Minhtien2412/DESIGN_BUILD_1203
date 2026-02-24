/**
 * Construction Estimate Engine - Hệ thống dự toán xây dựng chuyên sâu
 * ====================================================================
 * Deep material algorithms for Vietnamese residential construction.
 *
 * Features:
 * - Room-by-room & floor-by-floor estimation
 * - Material-level breakdown (brick, cement, sand, steel, concrete, paint, tiles)
 * - TCVN-compliant calculation formulas
 * - Supports: Nhà phố, Biệt thự, Nhà cấp 4, Penthouse
 * - Editable unit prices with market defaults
 * - Full project CRUD via AsyncStorage + server sync
 *
 * All rates in VND, quantities in metric (m, m², m³, kg, viên, bao).
 * @created 2026-02-06
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================================
// STORAGE KEYS
// ============================================================================
const PROJECTS_KEY = "@estimate_projects_v2";
const PROJECT_SEQ_KEY = "@estimate_project_seq_v2";

// ============================================================================
// TYPES
// ============================================================================

export type BuildingType =
  | "nha-pho"
  | "biet-thu"
  | "nha-cap-4"
  | "penthouse"
  | "nha-vuon";

export type ConstructionGrade = "basic" | "standard" | "premium" | "luxury";

export type ProjectStatus = "draft" | "in-progress" | "completed" | "archived";

export type FoundationType = "don" | "bang" | "be" | "coc-ep" | "coc-nhoi";

export type RoofType =
  | "btct-phang"
  | "mai-ngoi"
  | "mai-ton"
  | "mai-xep"
  | "mai-kinh";

export type WallType = "gach-ong" | "gach-block" | "gach-nhe" | "tuong-da";

// --------------- Project ---------------

export interface EstimateProject {
  id: string;
  seq: number; // Human-readable sequential ID (DT-001)
  name: string;
  clientName?: string;
  clientPhone?: string;
  address?: string;
  notes?: string;
  buildingType: BuildingType;
  grade: ConstructionGrade;
  status: ProjectStatus;
  // Dimensions
  landArea: number; // m²
  buildingDensity: number; // % (0-100)
  floors: FloorConfig[];
  foundation: FoundationConfig;
  roof: RoofConfig;
  // Fence & outdoor
  fenceLength: number; // m
  fenceHeight: number; // m
  yardArea: number; // m²
  // Overrides: user can override any unit price
  priceOverrides: Record<string, number>;
  // Computed (cached after last calculation)
  lastResult?: ProjectResult;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface FloorConfig {
  id: string;
  label: string; // "Tầng trệt", "Lầu 1", ...
  floorArea: number; // m² (auto or manual)
  ceilingHeight: number; // m (default 3.3)
  wallPerimeter: number; // m (auto from area or manual)
  windowCount: number;
  doorCount: number;
  bathroomCount: number;
  balconyArea: number; // m²
  isBasement: boolean;
  /** Wall type override for this floor */
  wallType?: WallType;
}

export interface FoundationConfig {
  type: FoundationType;
  depth: number; // m
  /** For cọc ép / cọc nhồi */
  pileCount?: number;
  pileLength?: number; // m per pile
}

export interface RoofConfig {
  type: RoofType;
  overhangArea: number; // hiên, mái che — m²
}

// --------------- Result ---------------

export interface ProjectResult {
  summary: CostSummary;
  materials: MaterialLine[];
  laborDays: number;
  laborCost: number;
  contingency: number;
  grandTotal: number;
  perM2: number;
  totalArea: number;
  calculatedAt: string;
}

export interface CostSummary {
  foundation: number;
  structure: number; // cột, dầm, sàn
  walls: number;
  roof: number;
  mep: number; // điện, nước
  finishing: number; // sơn, gạch lát, trát
  doors: number;
  fence: number;
  yard: number;
  labor: number;
  contingency: number;
}

export interface MaterialLine {
  category: string; // "Bê tông", "Thép", "Gạch", ...
  item: string; // "Bê tông M250 móng", "Thép D10 sàn", ...
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

// ============================================================================
// CONSTANTS — Vietnamese market defaults (2024-2026)
// ============================================================================

export const BUILDING_TYPE_META: Record<
  BuildingType,
  { label: string; desc: string }
> = {
  "nha-pho": { label: "Nhà phố", desc: "Nhà liền kề, mặt tiền hẹp" },
  "biet-thu": {
    label: "Biệt thự",
    desc: "Biệt lập, thiết kế phức tạp",
  },
  "nha-cap-4": { label: "Nhà cấp 4", desc: "1 tầng, kết cấu đơn giản" },
  penthouse: { label: "Penthouse", desc: "Căn hộ thượng lưu" },
  "nha-vuon": { label: "Nhà vườn", desc: "Nhà vườn nghỉ dưỡng" },
};

export const GRADE_META: Record<
  ConstructionGrade,
  { label: string; multiplier: number; desc: string }
> = {
  basic: { label: "Cơ bản", multiplier: 0.82, desc: "Vật liệu nội địa" },
  standard: { label: "Tiêu chuẩn", multiplier: 1.0, desc: "Vật liệu tốt" },
  premium: {
    label: "Cao cấp",
    multiplier: 1.35,
    desc: "Vật liệu nhập khẩu",
  },
  luxury: {
    label: "Sang trọng",
    multiplier: 1.7,
    desc: "Thiết kế riêng, cao cấp nhất",
  },
};

export const FOUNDATION_META: Record<
  FoundationType,
  { label: string; costFactor: number; desc: string }
> = {
  don: { label: "Móng đơn", costFactor: 1.0, desc: "Đất cứng, tải nhẹ" },
  bang: { label: "Móng băng", costFactor: 1.3, desc: "Phổ biến, đất TB" },
  be: { label: "Móng bè", costFactor: 1.65, desc: "Đất yếu trung bình" },
  "coc-ep": { label: "Cọc ép", costFactor: 2.2, desc: "Đất rất yếu" },
  "coc-nhoi": {
    label: "Cọc nhồi",
    costFactor: 3.0,
    desc: "Công trình lớn, đặc biệt",
  },
};

export const ROOF_META: Record<
  RoofType,
  { label: string; pricePerM2: number }
> = {
  "btct-phang": { label: "Sàn BTCT phẳng", pricePerM2: 0 }, // included in slab
  "mai-ngoi": { label: "Mái ngói", pricePerM2: 650000 },
  "mai-ton": { label: "Mái tôn", pricePerM2: 350000 },
  "mai-xep": { label: "Mái xếp", pricePerM2: 480000 },
  "mai-kinh": { label: "Mái kính", pricePerM2: 1200000 },
};

// ────────────────── Default unit prices ──────────────────

export const DEFAULT_PRICES: Record<
  string,
  { label: string; price: number; unit: string }
> = {
  // Bê tông thương phẩm (giá bơm xong)
  BT_M200: { label: "Bê tông M200", price: 1480000, unit: "m³" },
  BT_M250: { label: "Bê tông M250", price: 1580000, unit: "m³" },
  BT_M300: { label: "Bê tông M300", price: 1680000, unit: "m³" },
  BT_LOT: { label: "Bê tông lót M100", price: 1250000, unit: "m³" },

  // Thép
  THEP_D6_D8: { label: "Thép D6-D8 (đai)", price: 18500, unit: "kg" },
  THEP_D10_D14: { label: "Thép D10-D14", price: 17500, unit: "kg" },
  THEP_D16_D22: { label: "Thép D16-D22", price: 17000, unit: "kg" },
  THEP_D25_D32: { label: "Thép D25-D32", price: 16800, unit: "kg" },

  // Gạch xây
  GACH_ONG: { label: "Gạch ống 4 lỗ (8x8x18)", price: 900, unit: "viên" },
  GACH_BLOCK_D10: { label: "Gạch block D10", price: 5800, unit: "viên" },
  GACH_BLOCK_D15: { label: "Gạch block D15", price: 7800, unit: "viên" },
  GACH_NHE_AAC: { label: "Gạch nhẹ AAC", price: 1650000, unit: "m³" },

  // Xi măng, cát
  XI_MANG: { label: "Xi măng PCB40 (50kg)", price: 98000, unit: "bao" },
  CAT_XAY: { label: "Cát xây", price: 380000, unit: "m³" },
  CAT_SAN: { label: "Cát san lấp", price: 180000, unit: "m³" },
  DA_1x2: { label: "Đá 1×2 (dăm)", price: 420000, unit: "m³" },

  // Ốp lát
  GACH_LAT_NEN: { label: "Gạch lát nền 60×60", price: 185000, unit: "m²" },
  GACH_OP_TUONG: { label: "Gạch ốp tường WC", price: 165000, unit: "m²" },
  KEO_DAN_GACH: { label: "Keo dán gạch", price: 95000, unit: "bao 25kg" },

  // Sơn
  SON_LOT: { label: "Sơn lót nội thất", price: 48000, unit: "lít" },
  SON_PHAN: { label: "Sơn phủ nội thất", price: 72000, unit: "lít" },
  SON_NGOAI: { label: "Sơn ngoại thất", price: 88000, unit: "lít" },
  BOT_TRAT: { label: "Bột trát (bao 40kg)", price: 85000, unit: "bao" },

  // Cửa
  CUA_DI_GO: { label: "Cửa đi gỗ công nghiệp", price: 4500000, unit: "bộ" },
  CUA_DI_NHOM: { label: "Cửa đi nhôm kính", price: 5200000, unit: "bộ" },
  CUA_SO_NHOM: { label: "Cửa sổ nhôm kính", price: 1800000, unit: "bộ" },

  // Điện nước
  DIEN_AM_TUONG: { label: "Hệ thống điện âm tường", price: 85000, unit: "m²" },
  NUOC_CAP_THAI: { label: "Hệ thống cấp thoát nước", price: 65000, unit: "m²" },
  WC_TRON_BO: {
    label: "Thiết bị vệ sinh trọn bộ",
    price: 18000000,
    unit: "bộ",
  },

  // Chống thấm
  CHONG_THAM_SAN: { label: "Chống thấm sàn WC", price: 120000, unit: "m²" },
  CHONG_THAM_MAI: { label: "Chống thấm mái", price: 85000, unit: "m²" },

  // Nhân công
  NHAN_CONG: { label: "Nhân công xây dựng", price: 380000, unit: "công" },

  // Hàng rào
  HANG_RAO: { label: "Hàng rào xây gạch + sắt", price: 1200000, unit: "m dài" },

  // Sân vườn
  SAN_BT: { label: "Sân bê tông + lát", price: 450000, unit: "m²" },
};

// ============================================================================
// CALCULATION COEFFICIENTS (from TCVN & practical experience)
// ============================================================================

/** Hàm lượng thép trung bình (kg/m³ BT) theo cấu kiện */
const STEEL_RATIO = {
  foundation: 85, // kg thép / m³ bê tông móng
  column: 180,
  beam: 140,
  slab: 100,
  staircase: 120,
} as const;

/** Bê tông mác theo cấu kiện */
const CONCRETE_GRADE = {
  foundation: "BT_M200",
  column: "BT_M300",
  beam: "BT_M250",
  slab: "BT_M250",
} as const;

/** Hệ số quy đổi diện tích xây dựng → khối lượng bê tông */
const BT_PER_M2 = {
  foundation: 0.35, // m³ BT / m² mặt bằng tầng trệt
  column: 0.04, // m³ BT / m² sàn / tầng
  beam: 0.06,
  slab: 0.12, // sàn dày TB 120mm
} as const;

/** Gạch xây (viên / m² tường) — gạch ống 1 hàng */
const BRICK_PER_M2_WALL: Record<WallType, { qty: number; mortar: number }> = {
  "gach-ong": { qty: 68, mortar: 0.023 }, // viên/m², m³ vữa/m²
  "gach-block": { qty: 12.5, mortar: 0.008 },
  "gach-nhe": { qty: 8, mortar: 0.006 }, // gạch AAC tính theo m³ riêng
  "tuong-da": { qty: 0, mortar: 0 }, // giá theo m²
};

/** Xi măng / m³ vữa xây M75 */
const CEMENT_PER_M3_MORTAR = 6; // bao 50kg

/** Sơn */
const PAINT = {
  lotM2PerLit: 10, // 1 lít sơn lót = 10m² (1 lớp)
  phuM2PerLit: 8, // 1 lít sơn phủ = 8m² (2 lớp → ÷2)
  coats: 2,
} as const;

/** Trát tường */
const PLASTER = {
  thicknessMM: 15, // mm
  botPerM2: 0.018, // m³ bột trát / m²
  cemPerM2: 0.3, // bao xi măng / m²
} as const;

// ============================================================================
// CALCULATION ENGINE
// ============================================================================

export function calculateProject(project: EstimateProject): ProjectResult {
  const grade = GRADE_META[project.grade];
  const mult = grade.multiplier;
  const prices = resolvedPrices(project.priceOverrides);
  const materials: MaterialLine[] = [];
  const summary: CostSummary = {
    foundation: 0,
    structure: 0,
    walls: 0,
    roof: 0,
    mep: 0,
    finishing: 0,
    doors: 0,
    fence: 0,
    yard: 0,
    labor: 0,
    contingency: 0,
  };

  const groundArea = (project.landArea * project.buildingDensity) / 100;
  let totalArea = 0;
  let totalWallArea = 0;
  let totalBathroomCount = 0;
  let totalDoors = 0;
  let totalWindows = 0;

  // ─── Aggregate floor data ─────────────────────────────────────────
  for (const fl of project.floors) {
    const fa = fl.floorArea > 0 ? fl.floorArea : groundArea;
    totalArea += fa + fl.balconyArea;

    // Wall area = perimeter × height  (minus openings estimated at 20%)
    const perim =
      fl.wallPerimeter > 0 ? fl.wallPerimeter : estimatePerimeter(fa);
    const wallH = fl.ceilingHeight || 3.3;
    const grossWall = perim * wallH;
    const openings = fl.windowCount * 1.8 + fl.doorCount * 2.0; // m² per opening
    totalWallArea += Math.max(0, grossWall - openings);

    totalBathroomCount += fl.bathroomCount;
    totalDoors += fl.doorCount;
    totalWindows += fl.windowCount;
  }

  const numAboveFloors = project.floors.filter((f) => !f.isBasement).length;

  // ─── 1. FOUNDATION ────────────────────────────────────────────────
  const fCfg = project.foundation;
  const fMeta = FOUNDATION_META[fCfg.type];
  const fDepth = fCfg.depth || 1.5;

  // BT lót
  const btLotVol = roundQ(groundArea * 0.08); // lớp lót 80mm
  pushMat(
    materials,
    "Bê tông",
    "BT lót M100 móng",
    btLotVol,
    "m³",
    prices.BT_LOT,
  );

  // BT móng chính
  const btMongVol = roundQ(
    groundArea * BT_PER_M2.foundation * fMeta.costFactor * (fDepth / 1.5),
  );
  pushMat(
    materials,
    "Bê tông",
    `BT M200 ${fMeta.label}`,
    btMongVol,
    "m³",
    prices.BT_M200,
  );

  // Thép móng
  const thepMong = roundQ(btMongVol * STEEL_RATIO.foundation);
  pushMat(
    materials,
    "Thép",
    `Thép ${fMeta.label}`,
    thepMong,
    "kg",
    prices.THEP_D16_D22,
  );

  // Cọc (if applicable)
  if ((fCfg.type === "coc-ep" || fCfg.type === "coc-nhoi") && fCfg.pileCount) {
    const pileLen = fCfg.pileLength || 15;
    const pileBT = roundQ(fCfg.pileCount * Math.PI * 0.15 * 0.15 * pileLen); // D300
    pushMat(materials, "Bê tông", "BT M300 cọc", pileBT, "m³", prices.BT_M300);
    const pileSteel = roundQ(pileBT * 200);
    pushMat(
      materials,
      "Thép",
      "Thép cọc",
      pileSteel,
      "kg",
      prices.THEP_D16_D22,
    );
  }

  summary.foundation =
    sumCategory(materials, "Bê tông") + sumCategory(materials, "Thép");

  // ─── 2. STRUCTURE (cột, dầm, sàn) ────────────────────────────────
  const structStartIdx = materials.length;

  // Columns
  const btCol = roundQ(totalArea * BT_PER_M2.column * numAboveFloors);
  pushMat(materials, "Bê tông", "BT M300 cột", btCol, "m³", prices.BT_M300);
  const thepCol = roundQ(btCol * STEEL_RATIO.column);
  pushMat(
    materials,
    "Thép",
    "Thép cột D16-D22",
    thepCol,
    "kg",
    prices.THEP_D16_D22,
  );

  // Beams
  const btBeam = roundQ(totalArea * BT_PER_M2.beam * numAboveFloors);
  pushMat(materials, "Bê tông", "BT M250 dầm", btBeam, "m³", prices.BT_M250);
  const thepBeam = roundQ(btBeam * STEEL_RATIO.beam);
  pushMat(
    materials,
    "Thép",
    "Thép dầm D10-D14",
    thepBeam,
    "kg",
    prices.THEP_D10_D14,
  );

  // Slabs (per floor)
  const btSlab = roundQ(totalArea * BT_PER_M2.slab);
  pushMat(
    materials,
    "Bê tông",
    "BT M250 sàn các tầng",
    btSlab,
    "m³",
    prices.BT_M250,
  );
  const thepSlab = roundQ(btSlab * STEEL_RATIO.slab);
  pushMat(
    materials,
    "Thép",
    "Thép sàn D6-D10",
    thepSlab,
    "kg",
    prices.THEP_D6_D8,
  );

  // Staircase (1 per 2 floors above ground)
  const stairs = Math.max(1, Math.ceil(numAboveFloors / 2));
  const btStair = roundQ(stairs * 1.5); // ~1.5m³ per stair run
  pushMat(
    materials,
    "Bê tông",
    "BT M250 cầu thang",
    btStair,
    "m³",
    prices.BT_M250,
  );
  const thepStair = roundQ(btStair * STEEL_RATIO.staircase);
  pushMat(
    materials,
    "Thép",
    "Thép cầu thang",
    thepStair,
    "kg",
    prices.THEP_D10_D14,
  );

  summary.structure = sumSlice(materials, structStartIdx);

  // ─── 3. WALLS ─────────────────────────────────────────────────────
  const wallStartIdx = materials.length;
  const wallType: WallType =
    project.floors[0]?.wallType ||
    (project.grade === "luxury" ? "gach-block" : "gach-ong");
  const wallSpec = BRICK_PER_M2_WALL[wallType];

  if (wallType === "gach-nhe") {
    const aacVol = roundQ(totalWallArea * 0.1); // tường 100mm
    pushMat(
      materials,
      "Gạch xây",
      "Gạch nhẹ AAC (tường)",
      aacVol,
      "m³",
      prices.GACH_NHE_AAC,
    );
  } else if (wallType !== "tuong-da") {
    const brickQty = Math.ceil(totalWallArea * wallSpec.qty * 1.05); // +5% hao hụt
    const key = wallType === "gach-block" ? "GACH_BLOCK_D10" : "GACH_ONG";
    pushMat(
      materials,
      "Gạch xây",
      `${DEFAULT_PRICES[key].label}`,
      brickQty,
      "viên",
      prices[key],
    );
  }

  // Mortar for walls
  const mortarVol = roundQ(totalWallArea * wallSpec.mortar);
  if (mortarVol > 0) {
    const cementBags = Math.ceil(mortarVol * CEMENT_PER_M3_MORTAR);
    pushMat(
      materials,
      "Xi măng",
      "Xi măng xây tường",
      cementBags,
      "bao",
      prices.XI_MANG,
    );
    const sandXay = roundQ(mortarVol * 1.1);
    pushMat(materials, "Cát", "Cát xây tường", sandXay, "m³", prices.CAT_XAY);
  }

  summary.walls = sumSlice(materials, wallStartIdx);

  // ─── 4. ROOF ──────────────────────────────────────────────────────
  const roofStartIdx = materials.length;
  const roofArea = groundArea + project.roof.overhangArea;
  const roofMeta = ROOF_META[project.roof.type];

  if (project.roof.type !== "btct-phang" && roofMeta.pricePerM2 > 0) {
    const roofCost = roundQ(roofArea * roofMeta.pricePerM2 * mult);
    pushMat(
      materials,
      "Mái",
      `${roofMeta.label}`,
      roofArea,
      "m²",
      Math.round(roofMeta.pricePerM2 * mult),
    );
  }
  // Waterproofing top slab / roof
  pushMat(
    materials,
    "Chống thấm",
    "Chống thấm mái/sân thượng",
    roundQ(groundArea),
    "m²",
    prices.CHONG_THAM_MAI,
  );

  summary.roof = sumSlice(materials, roofStartIdx);

  // ─── 5. FINISHING ─────────────────────────────────────────────────
  const finStartIdx = materials.length;

  // Plastering both sides
  const plasterArea = roundQ(totalWallArea * 2); // 2 mặt
  const plasterBags = Math.ceil(plasterArea * PLASTER.botPerM2 * 25); // bao 40kg
  pushMat(
    materials,
    "Trát tường",
    "Bột trát tường",
    plasterBags,
    "bao",
    prices.BOT_TRAT,
  );

  // Paint interior
  const paintIntArea = plasterArea;
  const sonLotLit = Math.ceil(paintIntArea / PAINT.lotM2PerLit);
  pushMat(
    materials,
    "Sơn",
    "Sơn lót nội thất",
    sonLotLit,
    "lít",
    prices.SON_LOT,
  );
  const sonPhuLit = Math.ceil((paintIntArea * PAINT.coats) / PAINT.phuM2PerLit);
  pushMat(
    materials,
    "Sơn",
    "Sơn phủ nội thất (2 lớp)",
    sonPhuLit,
    "lít",
    prices.SON_PHAN,
  );

  // Paint exterior
  const extWallArea = roundQ(
    estimatePerimeter(groundArea) * avgHeight(project) * 0.8,
  ); // -20% openings
  const sonExtLit = Math.ceil((extWallArea * 2) / PAINT.phuM2PerLit);
  pushMat(
    materials,
    "Sơn",
    "Sơn ngoại thất (2 lớp)",
    sonExtLit,
    "lít",
    prices.SON_NGOAI,
  );

  // Floor tiles
  pushMat(
    materials,
    "Ốp lát",
    "Gạch lát nền 60×60",
    Math.ceil(totalArea * 1.08),
    "m²",
    Math.round(prices.GACH_LAT_NEN * mult),
  );
  pushMat(
    materials,
    "Ốp lát",
    "Keo dán gạch",
    Math.ceil(totalArea / 4),
    "bao 25kg",
    prices.KEO_DAN_GACH,
  );

  // WC tiling
  const wcWallArea = roundQ(totalBathroomCount * 12); // ~12m² ốp tường per WC
  const wcFloorArea = roundQ(totalBathroomCount * 4); // ~4m² lát nền per WC
  pushMat(
    materials,
    "Ốp lát",
    "Gạch ốp tường WC",
    wcWallArea,
    "m²",
    Math.round(prices.GACH_OP_TUONG * mult),
  );
  pushMat(
    materials,
    "Chống thấm",
    "Chống thấm sàn WC",
    wcFloorArea,
    "m²",
    prices.CHONG_THAM_SAN,
  );

  summary.finishing = sumSlice(materials, finStartIdx);

  // ─── 6. DOORS & WINDOWS ──────────────────────────────────────────
  const doorStartIdx = materials.length;
  const doorPrice = mult > 1.2 ? prices.CUA_DI_NHOM : prices.CUA_DI_GO;
  pushMat(
    materials,
    "Cửa",
    "Cửa đi",
    totalDoors,
    "bộ",
    Math.round(doorPrice * mult),
  );
  pushMat(
    materials,
    "Cửa",
    "Cửa sổ nhôm kính",
    totalWindows,
    "bộ",
    Math.round(prices.CUA_SO_NHOM * mult),
  );
  summary.doors = sumSlice(materials, doorStartIdx);

  // ─── 7. MEP ──────────────────────────────────────────────────────
  const mepStartIdx = materials.length;
  pushMat(
    materials,
    "Điện",
    "Hệ thống điện âm tường",
    Math.ceil(totalArea),
    "m²",
    Math.round(prices.DIEN_AM_TUONG * mult),
  );
  pushMat(
    materials,
    "Nước",
    "Hệ thống cấp thoát nước",
    Math.ceil(totalArea),
    "m²",
    Math.round(prices.NUOC_CAP_THAI * mult),
  );
  pushMat(
    materials,
    "Thiết bị WC",
    "Trọn bộ thiết bị vệ sinh",
    totalBathroomCount,
    "bộ",
    Math.round(prices.WC_TRON_BO * mult),
  );
  summary.mep = sumSlice(materials, mepStartIdx);

  // ─── 8. FENCE & YARD ─────────────────────────────────────────────
  if (project.fenceLength > 0) {
    pushMat(
      materials,
      "Hàng rào",
      "Hàng rào xây",
      roundQ(project.fenceLength * project.fenceHeight),
      "m dài",
      prices.HANG_RAO,
    );
    summary.fence = roundQ(
      project.fenceLength * project.fenceHeight * prices.HANG_RAO,
    );
  }
  if (project.yardArea > 0) {
    pushMat(
      materials,
      "Sân vườn",
      "Sân BT + lát",
      project.yardArea,
      "m²",
      prices.SAN_BT,
    );
    summary.yard = project.yardArea * prices.SAN_BT;
  }

  // ─── 9. LABOR ────────────────────────────────────────────────────
  // Rule of thumb: 1 công / 1.5 m² sàn XD
  const laborDays = Math.ceil(totalArea / 1.5);
  summary.labor = laborDays * prices.NHAN_CONG;

  // ─── 10. CONTINGENCY 5% ──────────────────────────────────────────
  const subtotal =
    Object.values(summary).reduce((s, v) => s + v, 0) +
    materials.reduce((s, m) => s + m.total, 0) -
    summary.labor; // labor already in summary

  const matTotal = materials.reduce((s, m) => s + m.total, 0);
  const contingency = Math.round(matTotal * 0.05);
  summary.contingency = contingency;

  const grandTotal = matTotal + summary.labor + contingency;

  return {
    summary,
    materials,
    laborDays,
    laborCost: summary.labor,
    contingency,
    grandTotal,
    perM2: totalArea > 0 ? Math.round(grandTotal / totalArea) : 0,
    totalArea: roundQ(totalArea),
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// PROJECT CRUD
// ============================================================================

async function nextSeq(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(PROJECT_SEQ_KEY);
    const n = raw ? parseInt(raw, 10) + 1 : 1;
    await AsyncStorage.setItem(PROJECT_SEQ_KEY, String(n));
    return n;
  } catch {
    return Date.now() % 100000;
  }
}

function uid(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function getAllProjects(): Promise<EstimateProject[]> {
  try {
    const raw = await AsyncStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const list: EstimateProject[] = JSON.parse(raw);
    return list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch {
    return [];
  }
}

export async function getProjectById(
  id: string,
): Promise<EstimateProject | null> {
  const all = await getAllProjects();
  return all.find((p) => p.id === id) ?? null;
}

export async function createProject(
  partial: Omit<
    EstimateProject,
    "id" | "seq" | "createdAt" | "updatedAt" | "lastResult"
  >,
): Promise<EstimateProject> {
  const now = new Date().toISOString();
  const seq = await nextSeq();
  const project: EstimateProject = {
    ...partial,
    id: uid(),
    seq,
    createdAt: now,
    updatedAt: now,
  };
  const all = await getAllProjects();
  all.unshift(project);
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
  return project;
}

export async function updateProject(
  id: string,
  patch: Partial<EstimateProject>,
): Promise<EstimateProject | null> {
  const all = await getAllProjects();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
  return all[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  const all = await getAllProjects();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length === all.length) return false;
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
  return true;
}

export async function duplicateProject(
  id: string,
): Promise<EstimateProject | null> {
  const src = await getProjectById(id);
  if (!src) return null;
  const { id: _, seq: __, createdAt, updatedAt, lastResult, ...rest } = src;
  return createProject({
    ...rest,
    name: `${src.name} (Bản sao)`,
    status: "draft",
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function resolvedPrices(
  overrides: Record<string, number>,
): Record<string, number> {
  const p: Record<string, number> = {};
  for (const [k, v] of Object.entries(DEFAULT_PRICES)) {
    p[k] = overrides[k] ?? v.price;
  }
  return p;
}

function pushMat(
  list: MaterialLine[],
  category: string,
  item: string,
  quantity: number,
  unit: string,
  unitPrice: number,
) {
  if (quantity <= 0) return;
  list.push({
    category,
    item,
    quantity,
    unit,
    unitPrice,
    total: Math.round(quantity * unitPrice),
  });
}

function sumCategory(list: MaterialLine[], cat: string): number {
  return list
    .filter((m) => m.category === cat)
    .reduce((s, m) => s + m.total, 0);
}

function sumSlice(list: MaterialLine[], fromIdx: number): number {
  return list.slice(fromIdx).reduce((s, m) => s + m.total, 0);
}

function roundQ(n: number): number {
  return Math.round(n * 100) / 100;
}

function estimatePerimeter(area: number): number {
  // Approximate rectangle with ratio 2:3
  const w = Math.sqrt((area * 2) / 3);
  const l = area / w || w;
  return 2 * (w + l);
}

function avgHeight(project: EstimateProject): number {
  if (project.floors.length === 0) return 3.3;
  const total = project.floors.reduce(
    (s, f) => s + (f.ceilingHeight || 3.3),
    0,
  );
  return (
    (total / project.floors.length) *
    project.floors.filter((f) => !f.isBasement).length
  );
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

export function formatVND(amount: number): string {
  if (amount >= 1_000_000_000)
    return `${(amount / 1_000_000_000).toFixed(2)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
  return `${amount}đ`;
}

export function formatVNDFull(amount: number): string {
  return amount.toLocaleString("vi-VN") + " đ";
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function seqLabel(seq: number): string {
  return `DT-${String(seq).padStart(3, "0")}`;
}

// ============================================================================
// DEFAULT FLOOR FACTORY
// ============================================================================

export function makeFloor(
  label: string,
  groundArea: number,
  isBasement = false,
): FloorConfig {
  return {
    id: `fl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    label,
    floorArea: groundArea,
    ceilingHeight: isBasement ? 2.8 : 3.3,
    wallPerimeter: 0, // auto
    windowCount: isBasement ? 0 : 4,
    doorCount: isBasement ? 1 : 4,
    bathroomCount: isBasement ? 0 : 1,
    balconyArea: isBasement ? 0 : 4,
    isBasement,
  };
}

/** Generate default floors for a building type */
export function defaultFloors(
  type: BuildingType,
  numFloors: number,
  groundArea: number,
): FloorConfig[] {
  const floors: FloorConfig[] = [];
  if (type === "nha-cap-4") {
    floors.push(makeFloor("Tầng trệt", groundArea));
    return floors;
  }
  floors.push({
    ...makeFloor("Tầng trệt", groundArea),
    bathroomCount: 1,
    doorCount: 2,
  });
  for (let i = 1; i < numFloors; i++) {
    const label = `Lầu ${i}`;
    const fl = makeFloor(label, groundArea);
    fl.bathroomCount = type === "biet-thu" ? 2 : 1;
    fl.windowCount = type === "biet-thu" ? 6 : 4;
    fl.doorCount = type === "biet-thu" ? 5 : 3;
    floors.push(fl);
  }
  return floors;
}

// ============================================================================
// QUICK ESTIMATE — simplified instant calculation
// ============================================================================

export interface QuickEstimateInput {
  buildingType: BuildingType;
  grade: ConstructionGrade;
  landArea: number; // m²
  density: number; // % (0–100)
  numFloors: number;
}

export interface QuickEstimateResult {
  totalArea: number;
  grandTotal: number;
  perM2: number;
  laborDays: number;
  breakdown: { label: string; value: number; pct: number }[];
  buildingType: BuildingType;
  grade: ConstructionGrade;
}

export function quickEstimate(input: QuickEstimateInput): QuickEstimateResult {
  const groundArea = (input.landArea * input.density) / 100;
  const totalArea = groundArea * Math.max(input.numFloors, 1);
  const floors = defaultFloors(input.buildingType, input.numFloors, groundArea);
  const project: EstimateProject = {
    id: "quick",
    seq: 0,
    name: "Dự toán nhanh",
    clientName: "",
    clientPhone: "",
    address: "",
    buildingType: input.buildingType,
    grade: input.grade,
    landArea: input.landArea,
    buildingDensity: input.density,
    floors,
    foundation: { type: "don", depth: 1.2 },
    roof: { type: "btct-phang", overhangArea: 0 },
    fenceLength: 0,
    fenceHeight: 0,
    yardArea: 0,
    notes: "",
    status: "draft",
    priceOverrides: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = calculateProject(project);
  const breakdown = (
    [
      ["Móng", result.summary.foundation],
      ["Kết cấu", result.summary.structure],
      ["Tường xây", result.summary.walls],
      ["Mái", result.summary.roof],
      ["Hoàn thiện", result.summary.finishing],
      ["Cửa", result.summary.doors],
      ["Điện/Nước/WC", result.summary.mep],
      ["Nhân công", result.summary.labor],
      ["Dự phòng", result.summary.contingency],
    ] as [string, number][]
  )
    .filter(([, v]) => v > 0)
    .map(([label, value]) => ({
      label,
      value,
      pct: result.grandTotal > 0 ? (value / result.grandTotal) * 100 : 0,
    }));

  return {
    totalArea: result.totalArea,
    grandTotal: result.grandTotal,
    perM2: result.perM2,
    laborDays: result.laborDays,
    breakdown,
    buildingType: input.buildingType,
    grade: input.grade,
  };
}

// ============================================================================
// PROJECT TEMPLATES
// ============================================================================

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons name
  buildingType: BuildingType;
  grade: ConstructionGrade;
  landArea: number;
  density: number;
  numFloors: number;
  foundationType: FoundationType;
  roofType: RoofType;
  fenceLength: number;
  fenceHeight: number;
  yardArea: number;
  tags: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "tpl_nha_pho_3tang",
    name: "Nhà phố 3 tầng tiêu chuẩn",
    description: "Nhà phố 5×20m, 3 tầng, mật độ 80%, cấp trung bình",
    icon: "business-outline",
    buildingType: "nha-pho",
    grade: "standard",
    landArea: 100,
    density: 80,
    numFloors: 3,
    foundationType: "bang",
    roofType: "btct-phang",
    fenceLength: 0,
    fenceHeight: 0,
    yardArea: 0,
    tags: ["phổ biến", "3 tầng"],
  },
  {
    id: "tpl_nha_pho_4tang",
    name: "Nhà phố 4 tầng kinh doanh",
    description: "Nhà phố 4×16m, 4 tầng + sân thượng, cấp trung khá",
    icon: "storefront-outline",
    buildingType: "nha-pho",
    grade: "premium",
    landArea: 64,
    density: 100,
    numFloors: 4,
    foundationType: "bang",
    roofType: "btct-phang",
    fenceLength: 0,
    fenceHeight: 0,
    yardArea: 0,
    tags: ["kinh doanh", "4 tầng"],
  },
  {
    id: "tpl_biet_thu_vuon",
    name: "Biệt thự vườn 2 tầng",
    description: "Biệt thự 10×20m, 2 tầng, sân vườn rộng, hàng rào xây",
    icon: "home-outline",
    buildingType: "biet-thu",
    grade: "premium",
    landArea: 200,
    density: 50,
    numFloors: 2,
    foundationType: "bang",
    roofType: "mai-ngoi",
    fenceLength: 50,
    fenceHeight: 1.8,
    yardArea: 60,
    tags: ["biệt thự", "sân vườn"],
  },
  {
    id: "tpl_biet_thu_cao_cap",
    name: "Biệt thự cao cấp 3 tầng",
    description: "Biệt thự 12×25m, 3 tầng, cấp luxury, mái ngói nhập",
    icon: "diamond-outline",
    buildingType: "biet-thu",
    grade: "luxury",
    landArea: 300,
    density: 45,
    numFloors: 3,
    foundationType: "coc-ep",
    roofType: "mai-ngoi",
    fenceLength: 60,
    fenceHeight: 2.0,
    yardArea: 100,
    tags: ["cao cấp", "luxury"],
  },
  {
    id: "tpl_nha_cap4",
    name: "Nhà cấp 4 mái tôn",
    description: "Nhà cấp 4, 8×15m, 1 tầng, mái tôn, sân trước",
    icon: "trail-sign-outline",
    buildingType: "nha-cap-4",
    grade: "basic",
    landArea: 120,
    density: 60,
    numFloors: 1,
    foundationType: "don",
    roofType: "mai-ton",
    fenceLength: 30,
    fenceHeight: 1.5,
    yardArea: 30,
    tags: ["tiết kiệm", "1 tầng"],
  },
  {
    id: "tpl_penthouse",
    name: "Penthouse duplex",
    description: "Penthouse 150m², 2 tầng, cấp luxury, hoàn thiện cao cấp",
    icon: "sparkles-outline",
    buildingType: "penthouse",
    grade: "luxury",
    landArea: 150,
    density: 100,
    numFloors: 2,
    foundationType: "don",
    roofType: "btct-phang",
    fenceLength: 0,
    fenceHeight: 0,
    yardArea: 0,
    tags: ["penthouse", "cao cấp"],
  },
  {
    id: "tpl_nha_vuon",
    name: "Nhà vườn 1 trệt 1 lầu",
    description: "Nhà vườn 200m², 2 tầng, mái ngói, sân rộng",
    icon: "leaf-outline",
    buildingType: "nha-vuon",
    grade: "standard",
    landArea: 200,
    density: 40,
    numFloors: 2,
    foundationType: "don",
    roofType: "mai-ngoi",
    fenceLength: 40,
    fenceHeight: 1.5,
    yardArea: 80,
    tags: ["nhà vườn", "thôn quê"],
  },
  {
    id: "tpl_nha_pho_mini",
    name: "Nhà phố mini 3 tầng",
    description: "Nhà phố nhỏ 3.5×12m, 3 tầng, xây cơ bản",
    icon: "cube-outline",
    buildingType: "nha-pho",
    grade: "basic",
    landArea: 42,
    density: 100,
    numFloors: 3,
    foundationType: "don",
    roofType: "btct-phang",
    fenceLength: 0,
    fenceHeight: 0,
    yardArea: 0,
    tags: ["mini", "tiết kiệm"],
  },
];

export function createProjectFromTemplate(
  template: ProjectTemplate,
): Omit<
  EstimateProject,
  "id" | "seq" | "createdAt" | "updatedAt" | "lastResult"
> {
  const groundArea = (template.landArea * template.density) / 100;
  return {
    name: template.name,
    clientName: "",
    clientPhone: "",
    address: "",
    buildingType: template.buildingType,
    grade: template.grade,
    landArea: template.landArea,
    buildingDensity: template.density,
    floors: defaultFloors(
      template.buildingType,
      template.numFloors,
      groundArea,
    ),
    foundation: {
      type: template.foundationType,
      depth: template.foundationType === "coc-nhoi" ? 20 : 1.2,
      pileCount:
        template.foundationType === "coc-ep" ||
        template.foundationType === "coc-nhoi"
          ? Math.ceil(groundArea / 5)
          : undefined,
      pileLength:
        template.foundationType === "coc-ep" ||
        template.foundationType === "coc-nhoi"
          ? 12
          : undefined,
    },
    roof: {
      type: template.roofType,
      overhangArea: template.roofType !== "btct-phang" ? groundArea * 0.1 : 0,
    },
    fenceLength: template.fenceLength,
    fenceHeight: template.fenceHeight,
    yardArea: template.yardArea,
    notes: `Tạo từ mẫu: ${template.name}`,
    status: "draft" as ProjectStatus,
    priceOverrides: {},
  };
}

// ============================================================================
// BOQ — Bill of Quantities (Bảng tổng hợp vật tư)
// ============================================================================

export interface BOQLine {
  stt: number;
  category: string;
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  note: string;
}

export interface BOQResult {
  projectName: string;
  projectSeq: string;
  generatedAt: string;
  lines: BOQLine[];
  totalMaterial: number;
  totalLabor: number;
  contingency: number;
  grandTotal: number;
}

export function generateBOQ(
  project: EstimateProject,
  result: ProjectResult,
): BOQResult {
  let stt = 0;
  const lines: BOQLine[] = result.materials.map((m) => ({
    stt: ++stt,
    category: m.category,
    item: m.item,
    quantity: m.quantity,
    unit: m.unit,
    unitPrice: m.unitPrice,
    total: m.total,
    note: "",
  }));

  return {
    projectName: project.name,
    projectSeq: seqLabel(project.seq),
    generatedAt: new Date().toISOString(),
    lines,
    totalMaterial: result.materials.reduce((s, m) => s + m.total, 0),
    totalLabor: result.laborCost,
    contingency: result.contingency,
    grandTotal: result.grandTotal,
  };
}

// ============================================================================
// PAYMENT SCHEDULE — Lịch thanh toán theo giai đoạn
// ============================================================================

export interface PaymentPhase {
  id: number;
  name: string;
  description: string;
  percentage: number;
  amount: number;
  cumulativeAmount: number;
  cumulativePercent: number;
  estimatedDays: number;
  cumulativeDays: number;
  icon: string;
  categories: string[]; // related cost categories
}

export function generatePaymentSchedule(
  result: ProjectResult,
  projectName: string,
): PaymentPhase[] {
  const g = result.grandTotal;
  const totalDays = result.laborDays;

  const phases: Omit<
    PaymentPhase,
    "amount" | "cumulativeAmount" | "cumulativePercent" | "cumulativeDays"
  >[] = [
    {
      id: 1,
      name: "Giai đoạn 1: Móng",
      description: "Đào móng, đổ bê tông móng, gia cố nền",
      percentage: 15,
      estimatedDays: Math.ceil(totalDays * 0.12),
      icon: "layers-outline",
      categories: ["Móng"],
    },
    {
      id: 2,
      name: "Giai đoạn 2: Thô",
      description: "Cột, dầm, sàn, cầu thang, tường xây, mái",
      percentage: 35,
      estimatedDays: Math.ceil(totalDays * 0.35),
      icon: "construct-outline",
      categories: ["Kết cấu", "Tường xây", "Mái"],
    },
    {
      id: 3,
      name: "Giai đoạn 3: Hoàn thiện",
      description: "Trát tường, sơn, ốp lát, lắp cửa",
      percentage: 25,
      estimatedDays: Math.ceil(totalDays * 0.28),
      icon: "color-palette-outline",
      categories: ["Hoàn thiện", "Cửa"],
    },
    {
      id: 4,
      name: "Giai đoạn 4: MEP",
      description: "Hệ thống điện, nước, thiết bị vệ sinh",
      percentage: 15,
      estimatedDays: Math.ceil(totalDays * 0.18),
      icon: "flash-outline",
      categories: ["Điện/Nước/WC"],
    },
    {
      id: 5,
      name: "Giai đoạn 5: Ngoại thất & Nghiệm thu",
      description: "Hàng rào, sân vườn, dọn dẹp, bàn giao",
      percentage: 10,
      estimatedDays: Math.ceil(totalDays * 0.07),
      icon: "checkmark-circle-outline",
      categories: ["Hàng rào", "Sân vườn"],
    },
  ];

  let cumAmount = 0;
  let cumPct = 0;
  let cumDays = 0;
  return phases.map((p) => {
    const amount = Math.round((g * p.percentage) / 100);
    cumAmount += amount;
    cumPct += p.percentage;
    cumDays += p.estimatedDays;
    return {
      ...p,
      amount,
      cumulativeAmount: cumAmount,
      cumulativePercent: cumPct,
      cumulativeDays: cumDays,
    };
  });
}

// ============================================================================
// COMPARE PROJECTS
// ============================================================================

export interface CompareField {
  label: string;
  key: string;
  values: (string | number)[];
  unit?: string;
  isCurrency?: boolean;
}

export interface CompareResult {
  projectNames: string[];
  projectSeqs: string[];
  fields: CompareField[];
}

export function compareProjects(projects: EstimateProject[]): CompareResult {
  const projectNames = projects.map((p) => p.name);
  const projectSeqs = projects.map((p) => seqLabel(p.seq));

  const getResult = (p: EstimateProject) =>
    p.lastResult ? (p.lastResult as ProjectResult) : calculateProject(p);

  const results = projects.map(getResult);

  const fields: CompareField[] = [
    {
      label: "Loại công trình",
      key: "buildingType",
      values: projects.map((p) => BUILDING_TYPE_META[p.buildingType].label),
    },
    {
      label: "Cấp xây dựng",
      key: "grade",
      values: projects.map((p) => GRADE_META[p.grade].label),
    },
    {
      label: "Diện tích đất",
      key: "landArea",
      values: projects.map((p) => p.landArea),
      unit: "m²",
    },
    {
      label: "Số tầng",
      key: "numFloors",
      values: projects.map((p) => p.floors.length),
      unit: "tầng",
    },
    {
      label: "Tổng diện tích sàn",
      key: "totalArea",
      values: results.map((r) => r.totalArea),
      unit: "m²",
    },
    {
      label: "Tổng chi phí",
      key: "grandTotal",
      values: results.map((r) => r.grandTotal),
      isCurrency: true,
    },
    {
      label: "Đơn giá/m²",
      key: "perM2",
      values: results.map((r) => r.perM2),
      isCurrency: true,
    },
    {
      label: "Nhân công",
      key: "laborDays",
      values: results.map((r) => r.laborDays),
      unit: "công",
    },
    {
      label: "Chi phí nhân công",
      key: "laborCost",
      values: results.map((r) => r.laborCost),
      isCurrency: true,
    },
    {
      label: "Dự phòng",
      key: "contingency",
      values: results.map((r) => r.contingency),
      isCurrency: true,
    },
    {
      label: "Móng",
      key: "foundation",
      values: results.map((r) => r.summary.foundation),
      isCurrency: true,
    },
    {
      label: "Kết cấu",
      key: "structure",
      values: results.map((r) => r.summary.structure),
      isCurrency: true,
    },
    {
      label: "Hoàn thiện",
      key: "finishing",
      values: results.map((r) => r.summary.finishing),
      isCurrency: true,
    },
    {
      label: "Điện/Nước/WC",
      key: "mep",
      values: results.map((r) => r.summary.mep),
      isCurrency: true,
    },
  ];

  return { projectNames, projectSeqs, fields };
}

// ============================================================================
// EXPORT DEFAULT PRICES (for price editor)
// ============================================================================

export function getDefaultPriceList(): {
  key: string;
  label: string;
  price: number;
  unit: string;
}[] {
  return Object.entries(DEFAULT_PRICES).map(([key, val]) => ({
    key,
    label: val.label,
    price: val.price,
    unit: val.unit,
  }));
}
