/**
 * Sổ tay KSXD - Vietnamese Construction Engineer Handbook Data
 * Comprehensive construction knowledge base with calculation formulas,
 * material standards, certifications, and practical experience.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface HandbookCategory {
  id: string;
  title: string;
  icon: string; // Ionicons name
  color: string;
  bgColor: string;
  description: string;
  items: HandbookItem[];
}

export interface HandbookItem {
  id: string;
  title: string;
  type: "calculator" | "reference" | "checklist" | "guide";
  icon?: string;
  description?: string;
  /** For calculator type */
  formula?: CalculatorFormula;
  /** For reference/guide type */
  content?: string;
  /** For checklist type */
  checklist?: ChecklistItem[];
  tags?: string[];
}

export interface CalculatorFormula {
  name: string;
  description: string;
  inputs: FormulaInput[];
  formula: string; // display formula
  calculate: (inputs: Record<string, number>) => CalculationResult;
  notes?: string[];
  reference?: string;
}

export interface FormulaInput {
  key: string;
  label: string;
  unit: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface CalculationResult {
  mainResult: { label: string; value: number; unit: string };
  details?: { label: string; value: number | string; unit?: string }[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  category?: string;
}

// ============================================================================
// 1. CÔNG CỤ TÍNH TOÁN - Calculation Tools
// ============================================================================

const CALCULATION_TOOLS: HandbookItem[] = [
  {
    id: "formwork-column",
    title: "Kiểm tra ván khuôn ván ép cột, vách",
    type: "calculator",
    icon: "cube-outline",
    description: "Tính diện tích ván khuôn cột/vách bê tông",
    tags: ["ván khuôn", "cột", "vách"],
    formula: {
      name: "Diện tích ván khuôn cột/vách",
      description:
        "Tính diện tích ván khuôn cần dùng cho cột hoặc vách bê tông cốt thép",
      inputs: [
        {
          key: "a",
          label: "Chiều rộng cột/vách",
          unit: "m",
          placeholder: "0.3",
          defaultValue: 0.3,
          min: 0.1,
          step: 0.05,
        },
        {
          key: "b",
          label: "Chiều dài cột/vách",
          unit: "m",
          placeholder: "0.3",
          defaultValue: 0.3,
          min: 0.1,
          step: 0.05,
        },
        {
          key: "h",
          label: "Chiều cao cột/vách",
          unit: "m",
          placeholder: "3.5",
          defaultValue: 3.5,
          min: 0.5,
          step: 0.1,
        },
        {
          key: "n",
          label: "Số lượng cột/vách",
          unit: "cái",
          placeholder: "1",
          defaultValue: 1,
          min: 1,
          step: 1,
        },
      ],
      formula: "S = 2 × (a + b) × h × n",
      calculate: (inputs) => {
        const { a, b, h, n } = inputs;
        const perimeter = 2 * (a + b);
        const area = perimeter * h;
        const total = area * n;
        const sheets = Math.ceil(total / (1.22 * 2.44)); // standard plywood 1220x2440mm
        return {
          mainResult: {
            label: "Tổng diện tích ván khuôn",
            value: Math.round(total * 100) / 100,
            unit: "m²",
          },
          details: [
            {
              label: "Chu vi 1 cột/vách",
              value: Math.round(perimeter * 100) / 100,
              unit: "m",
            },
            {
              label: "DT 1 cột/vách",
              value: Math.round(area * 100) / 100,
              unit: "m²",
            },
            { label: "Số tấm ván ép (1.22×2.44)", value: sheets, unit: "tấm" },
            {
              label: "Hao hụt 5%",
              value: Math.round(total * 1.05 * 100) / 100,
              unit: "m²",
            },
          ],
        };
      },
      notes: [
        "Kích thước ván ép tiêu chuẩn: 1220 × 2440 mm",
        "Hao hụt thông thường: 5-10%",
        "Cần tính thêm gông, cây chống",
      ],
    },
  },
  {
    id: "formwork-slab",
    title: "Kiểm tra ván khuôn ván ép sàn",
    type: "calculator",
    icon: "layers-outline",
    description: "Tính diện tích ván khuôn sàn bê tông",
    tags: ["ván khuôn", "sàn"],
    formula: {
      name: "Diện tích ván khuôn sàn",
      description: "Tính diện tích ván khuôn sàn bê tông cốt thép",
      inputs: [
        {
          key: "l",
          label: "Chiều dài sàn",
          unit: "m",
          placeholder: "6",
          defaultValue: 6,
          min: 1,
          step: 0.5,
        },
        {
          key: "w",
          label: "Chiều rộng sàn",
          unit: "m",
          placeholder: "4",
          defaultValue: 4,
          min: 1,
          step: 0.5,
        },
        {
          key: "n",
          label: "Số ô sàn",
          unit: "ô",
          placeholder: "1",
          defaultValue: 1,
          min: 1,
          step: 1,
        },
      ],
      formula: "S = L × W × n",
      calculate: (inputs) => {
        const { l, w, n } = inputs;
        const area = l * w;
        const total = area * n;
        const sheets = Math.ceil(total / (1.22 * 2.44));
        return {
          mainResult: {
            label: "Tổng diện tích ván khuôn sàn",
            value: Math.round(total * 100) / 100,
            unit: "m²",
          },
          details: [
            {
              label: "DT 1 ô sàn",
              value: Math.round(area * 100) / 100,
              unit: "m²",
            },
            { label: "Số tấm ván ép", value: sheets, unit: "tấm" },
            {
              label: "Hao hụt 5%",
              value: Math.round(total * 1.05 * 100) / 100,
              unit: "m²",
            },
          ],
        };
      },
      notes: [
        "Bổ sung cây chống, giáo giữ ván khuôn",
        "Hao hụt 5-8% cho cắt ghép",
      ],
    },
  },
  {
    id: "formwork-beam-bottom",
    title: "Kiểm tra ván khuôn ván ép đáy dầm",
    type: "calculator",
    icon: "resize-outline",
    description: "Tính diện tích ván khuôn đáy dầm",
    tags: ["ván khuôn", "dầm", "đáy"],
    formula: {
      name: "Diện tích ván khuôn đáy dầm",
      description: "Tính diện tích ván khuôn cần cho đáy dầm bê tông",
      inputs: [
        {
          key: "b",
          label: "Bề rộng dầm",
          unit: "m",
          placeholder: "0.22",
          defaultValue: 0.22,
          min: 0.1,
          step: 0.02,
        },
        {
          key: "l",
          label: "Chiều dài dầm",
          unit: "m",
          placeholder: "6",
          defaultValue: 6,
          min: 0.5,
          step: 0.5,
        },
        {
          key: "n",
          label: "Số dầm",
          unit: "thanh",
          placeholder: "1",
          defaultValue: 1,
          min: 1,
          step: 1,
        },
      ],
      formula: "S = b × L × n",
      calculate: (inputs) => {
        const { b, l, n } = inputs;
        const area = b * l;
        const total = area * n;
        return {
          mainResult: {
            label: "Tổng DT ván khuôn đáy dầm",
            value: Math.round(total * 100) / 100,
            unit: "m²",
          },
          details: [
            {
              label: "DT 1 dầm",
              value: Math.round(area * 100) / 100,
              unit: "m²",
            },
            {
              label: "Hao hụt 5%",
              value: Math.round(total * 1.05 * 100) / 100,
              unit: "m²",
            },
          ],
        };
      },
    },
  },
  {
    id: "formwork-beam-side",
    title: "Kiểm tra ván khuôn ván ép thành dầm",
    type: "calculator",
    icon: "contract-outline",
    description: "Tính diện tích ván khuôn thành dầm",
    tags: ["ván khuôn", "dầm", "thành"],
    formula: {
      name: "Diện tích ván khuôn thành dầm",
      description: "Tính diện tích ván khuôn 2 mặt bên dầm bê tông",
      inputs: [
        {
          key: "hd",
          label: "Chiều cao dầm (trừ sàn)",
          unit: "m",
          placeholder: "0.5",
          defaultValue: 0.5,
          min: 0.1,
          step: 0.05,
        },
        {
          key: "l",
          label: "Chiều dài dầm",
          unit: "m",
          placeholder: "6",
          defaultValue: 6,
          min: 0.5,
          step: 0.5,
        },
        {
          key: "n",
          label: "Số dầm",
          unit: "thanh",
          placeholder: "1",
          defaultValue: 1,
          min: 1,
          step: 1,
        },
      ],
      formula: "S = 2 × hd × L × n",
      calculate: (inputs) => {
        const { hd, l, n } = inputs;
        const area = 2 * hd * l;
        const total = area * n;
        return {
          mainResult: {
            label: "Tổng DT ván khuôn thành dầm",
            value: Math.round(total * 100) / 100,
            unit: "m²",
          },
          details: [
            {
              label: "DT 2 mặt 1 dầm",
              value: Math.round(area * 100) / 100,
              unit: "m²",
            },
            {
              label: "Hao hụt 5%",
              value: Math.round(total * 1.05 * 100) / 100,
              unit: "m²",
            },
          ],
        };
      },
    },
  },
  {
    id: "excavator-count",
    title: "Số lượng máy đào, ô tô chở đất",
    type: "calculator",
    icon: "car-outline",
    description: "Tính số lượng máy đào và xe tải chở đất cần thiết",
    tags: ["máy đào", "xe tải", "đào đất"],
    formula: {
      name: "Số máy đào & xe tải",
      description: "Tính số lượng máy đào và ô tô chở đất cho công trình",
      inputs: [
        {
          key: "v",
          label: "Khối lượng đất đào",
          unit: "m³",
          placeholder: "500",
          defaultValue: 500,
          min: 10,
          step: 50,
        },
        {
          key: "days",
          label: "Số ngày thi công",
          unit: "ngày",
          placeholder: "5",
          defaultValue: 5,
          min: 1,
          step: 1,
        },
        {
          key: "qExcavator",
          label: "Năng suất máy đào",
          unit: "m³/ca",
          placeholder: "150",
          defaultValue: 150,
          min: 50,
          step: 10,
        },
        {
          key: "qTruck",
          label: "Tải trọng xe",
          unit: "m³/chuyến",
          placeholder: "10",
          defaultValue: 10,
          min: 3,
          step: 1,
        },
        {
          key: "trips",
          label: "Số chuyến/ca/xe",
          unit: "chuyến",
          placeholder: "6",
          defaultValue: 6,
          min: 2,
          step: 1,
        },
      ],
      formula: "N_đào = V / (ngày × Q_đào)\nN_xe = V / (ngày × Q_xe × chuyến)",
      calculate: (inputs) => {
        const { v, days, qExcavator, qTruck, trips } = inputs;
        const nExcavator = Math.ceil(v / (days * qExcavator));
        const truckCapPerDay = qTruck * trips;
        const nTruck = Math.ceil(v / (days * truckCapPerDay));
        return {
          mainResult: {
            label: "Số máy đào cần thiết",
            value: nExcavator,
            unit: "máy",
          },
          details: [
            { label: "Số xe tải cần thiết", value: nTruck, unit: "xe" },
            {
              label: "KL đào/ngày",
              value: Math.round(v / days),
              unit: "m³/ngày",
            },
            {
              label: "Năng suất xe/ngày",
              value: truckCapPerDay,
              unit: "m³/xe/ngày",
            },
          ],
        };
      },
      notes: [
        "Hệ số tơi xốp đất: 1.1-1.3 tùy loại đất",
        "Cần tính thêm thời gian di chuyển xe",
      ],
    },
  },
  {
    id: "concrete-pump",
    title: "Số lượng bơm bê tông",
    type: "calculator",
    icon: "water-outline",
    description: "Tính số lượng xe bơm bê tông cần thiết",
    tags: ["bơm bê tông", "bê tông"],
    formula: {
      name: "Số xe bơm bê tông",
      description: "Tính số xe bơm bê tông cho công tác đổ bê tông",
      inputs: [
        {
          key: "v",
          label: "Khối lượng bê tông",
          unit: "m³",
          placeholder: "100",
          defaultValue: 100,
          min: 5,
          step: 10,
        },
        {
          key: "hours",
          label: "Thời gian đổ cho phép",
          unit: "giờ",
          placeholder: "8",
          defaultValue: 8,
          min: 1,
          step: 1,
        },
        {
          key: "qPump",
          label: "Năng suất bơm",
          unit: "m³/giờ",
          placeholder: "30",
          defaultValue: 30,
          min: 10,
          step: 5,
        },
      ],
      formula: "N = V / (giờ × Q_bơm)",
      calculate: (inputs) => {
        const { v, hours, qPump } = inputs;
        const nPump = Math.ceil(v / (hours * qPump));
        const nMixer = Math.ceil(v / 7); // xe trộn 7m³
        return {
          mainResult: {
            label: "Số xe bơm cần thiết",
            value: nPump,
            unit: "xe",
          },
          details: [
            { label: "Só xe trộn (7m³/xe)", value: nMixer, unit: "chuyến" },
            {
              label: "Tốc độ đổ yêu cầu",
              value: Math.round((v / hours) * 10) / 10,
              unit: "m³/giờ",
            },
          ],
        };
      },
      notes: [
        "Bê tông phải đổ liên tục, không để mạch ngừng thi công",
        "Thời gian vận chuyển tối đa: 90 phút",
      ],
    },
  },
  {
    id: "grader-count",
    title: "Số lượng máy san gạt (Grader)",
    type: "calculator",
    icon: "speedometer-outline",
    description: "Tính số máy san gạt cho công trình nền đường",
    tags: ["máy san", "grader", "nền đường"],
    formula: {
      name: "Số máy san gạt",
      description: "Tính số lượng máy san gạt cần thiết cho san nền",
      inputs: [
        {
          key: "area",
          label: "Diện tích san nền",
          unit: "m²",
          placeholder: "5000",
          defaultValue: 5000,
          min: 100,
          step: 500,
        },
        {
          key: "days",
          label: "Số ngày thi công",
          unit: "ngày",
          placeholder: "3",
          defaultValue: 3,
          min: 1,
          step: 1,
        },
        {
          key: "qGrader",
          label: "Năng suất máy san",
          unit: "m²/ca",
          placeholder: "3000",
          defaultValue: 3000,
          min: 500,
          step: 500,
        },
      ],
      formula: "N = S / (ngày × Q_san)",
      calculate: (inputs) => {
        const { area, days, qGrader } = inputs;
        const n = Math.ceil(area / (days * qGrader));
        return {
          mainResult: { label: "Số máy san cần thiết", value: n, unit: "máy" },
          details: [
            {
              label: "DT san/ngày",
              value: Math.round(area / days),
              unit: "m²/ngày",
            },
          ],
        };
      },
    },
  },
  {
    id: "dewatering-pump",
    title: "Số lượng bơm thoát nước hố móng",
    type: "calculator",
    icon: "rainy-outline",
    description: "Tính số bơm thoát nước cho hố móng",
    tags: ["bơm", "thoát nước", "hố móng"],
    formula: {
      name: "Số bơm thoát nước hố móng",
      description: "Tính số máy bơm thoát nước cần thiết cho hố móng",
      inputs: [
        {
          key: "area",
          label: "Diện tích hố móng",
          unit: "m²",
          placeholder: "200",
          defaultValue: 200,
          min: 10,
          step: 50,
        },
        {
          key: "depth",
          label: "Chiều sâu hố móng",
          unit: "m",
          placeholder: "2",
          defaultValue: 2,
          min: 0.5,
          step: 0.5,
        },
        {
          key: "k",
          label: "Hệ số thấm (k)",
          unit: "m/ngày",
          placeholder: "0.5",
          defaultValue: 0.5,
          min: 0.01,
          step: 0.1,
        },
        {
          key: "qPump",
          label: "Năng suất bơm",
          unit: "m³/giờ",
          placeholder: "20",
          defaultValue: 20,
          min: 5,
          step: 5,
        },
      ],
      formula: "Q = k × S × H / 24\nN = Q / q_bơm",
      calculate: (inputs) => {
        const { area, depth, k, qPump } = inputs;
        const flowRate = (k * area * depth) / 24; // m³/giờ
        const nPump = Math.ceil(flowRate / qPump);
        return {
          mainResult: {
            label: "Số bơm cần thiết",
            value: Math.max(1, nPump),
            unit: "máy",
          },
          details: [
            {
              label: "Lưu lượng nước thấm",
              value: Math.round(flowRate * 100) / 100,
              unit: "m³/giờ",
            },
            {
              label: "Lưu lượng/ngày",
              value: Math.round(flowRate * 24 * 10) / 10,
              unit: "m³/ngày",
            },
          ],
        };
      },
      notes: [
        "Luôn bố trí thêm 1 bơm dự phòng",
        "Hệ số thấm phụ thuộc loại đất",
      ],
    },
  },
  {
    id: "ventilation-fan",
    title: "Số lượng quạt thông gió thi công",
    type: "calculator",
    icon: "cloudy-outline",
    description: "Tính số quạt thông gió cho công trình ngầm/hầm",
    tags: ["quạt", "thông gió", "hầm"],
    formula: {
      name: "Số quạt thông gió thi công",
      description: "Tính số quạt thông gió cho công tác thi công ngầm",
      inputs: [
        {
          key: "v",
          label: "Thể tích không gian",
          unit: "m³",
          placeholder: "500",
          defaultValue: 500,
          min: 50,
          step: 50,
        },
        {
          key: "ach",
          label: "Số lần trao đổi khí/giờ",
          unit: "lần/giờ",
          placeholder: "6",
          defaultValue: 6,
          min: 3,
          step: 1,
        },
        {
          key: "qFan",
          label: "Lưu lượng 1 quạt",
          unit: "m³/giờ",
          placeholder: "3000",
          defaultValue: 3000,
          min: 500,
          step: 500,
        },
      ],
      formula: "Q = V × ACH\nN = Q / q_quạt",
      calculate: (inputs) => {
        const { v, ach, qFan } = inputs;
        const totalFlow = v * ach;
        const nFan = Math.ceil(totalFlow / qFan);
        return {
          mainResult: { label: "Số quạt cần thiết", value: nFan, unit: "quạt" },
          details: [
            { label: "Lưu lượng gió cần", value: totalFlow, unit: "m³/giờ" },
          ],
        };
      },
      notes: [
        "ACH tối thiểu cho thi công ngầm: 6 lần/giờ",
        "Bổ sung quạt dự phòng cho công trình sâu",
      ],
    },
  },
  {
    id: "transformer-capacity",
    title: "Công suất trạm biến áp thi công",
    type: "calculator",
    icon: "flash-outline",
    description: "Tính công suất trạm biến áp phục vụ thi công",
    tags: ["điện", "biến áp", "trạm"],
    formula: {
      name: "Công suất trạm biến áp thi công",
      description: "Xác định công suất trạm biến áp tạm cho công trường",
      inputs: [
        {
          key: "pMachine",
          label: "Tổng CS máy thi công",
          unit: "kW",
          placeholder: "150",
          defaultValue: 150,
          min: 10,
          step: 10,
        },
        {
          key: "pLight",
          label: "Tổng CS chiếu sáng",
          unit: "kW",
          placeholder: "20",
          defaultValue: 20,
          min: 1,
          step: 5,
        },
        {
          key: "pWelding",
          label: "Tổng CS hàn",
          unit: "kVA",
          placeholder: "50",
          defaultValue: 50,
          min: 0,
          step: 10,
        },
        {
          key: "pOther",
          label: "CS sinh hoạt & khác",
          unit: "kW",
          placeholder: "10",
          defaultValue: 10,
          min: 0,
          step: 5,
        },
        {
          key: "k1",
          label: "Hệ số đồng thời",
          unit: "",
          placeholder: "0.7",
          defaultValue: 0.7,
          min: 0.3,
          max: 1,
          step: 0.05,
        },
      ],
      formula: "P = (P_máy + P_đèn + P_hàn + P_khác) × k₁ / cosφ",
      calculate: (inputs) => {
        const { pMachine, pLight, pWelding, pOther, k1 } = inputs;
        const cosPhi = 0.75;
        const totalP = (pMachine + pLight + pWelding + pOther) * k1;
        const sTransformer = totalP / cosPhi;
        // Round up to standard transformer sizes
        const standardSizes = [
          50, 75, 100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600,
          2000,
        ];
        const selectedSize =
          standardSizes.find((s) => s >= sTransformer) ||
          Math.ceil(sTransformer / 100) * 100;
        return {
          mainResult: {
            label: "Công suất MBA chọn",
            value: selectedSize,
            unit: "kVA",
          },
          details: [
            {
              label: "Tổng CS tính toán",
              value: Math.round(totalP * 10) / 10,
              unit: "kW",
            },
            {
              label: "CS biểu kiến",
              value: Math.round(sTransformer * 10) / 10,
              unit: "kVA",
            },
            { label: "Hệ số công suất cosφ", value: cosPhi, unit: "" },
          ],
        };
      },
      notes: [
        "Hệ số đồng thời k₁ thường lấy 0.6-0.8",
        "cosφ thường lấy 0.7-0.8 cho công trường",
        "Chọn MBA tiêu chuẩn gần nhất ≥ CS tính toán",
      ],
    },
  },
  {
    id: "concrete-volume",
    title: "Khối lượng bê tông kết cấu",
    type: "calculator",
    icon: "albums-outline",
    description: "Tính khối lượng bê tông cho các kết cấu thường gặp",
    tags: ["bê tông", "kết cấu", "khối lượng"],
    formula: {
      name: "Khối lượng bê tông kết cấu",
      description: "Tính thể tích bê tông cho móng, cột, dầm, sàn",
      inputs: [
        {
          key: "l",
          label: "Chiều dài",
          unit: "m",
          placeholder: "6",
          defaultValue: 6,
          min: 0.1,
          step: 0.5,
        },
        {
          key: "w",
          label: "Chiều rộng",
          unit: "m",
          placeholder: "0.3",
          defaultValue: 0.3,
          min: 0.05,
          step: 0.05,
        },
        {
          key: "h",
          label: "Chiều cao/dày",
          unit: "m",
          placeholder: "0.5",
          defaultValue: 0.5,
          min: 0.05,
          step: 0.05,
        },
        {
          key: "n",
          label: "Số lượng",
          unit: "cái",
          placeholder: "1",
          defaultValue: 1,
          min: 1,
          step: 1,
        },
      ],
      formula: "V = L × W × H × n",
      calculate: (inputs) => {
        const { l, w, h, n } = inputs;
        const vol1 = l * w * h;
        const total = vol1 * n;
        const weight = total * 2.4; // tấn (mật độ BT ~2400 kg/m³)
        return {
          mainResult: {
            label: "Tổng thể tích bê tông",
            value: Math.round(total * 100) / 100,
            unit: "m³",
          },
          details: [
            {
              label: "Thể tích 1 cấu kiện",
              value: Math.round(vol1 * 1000) / 1000,
              unit: "m³",
            },
            {
              label: "Khối lượng (ρ=2400)",
              value: Math.round(weight * 100) / 100,
              unit: "tấn",
            },
            {
              label: "Hao hụt 2%",
              value: Math.round(total * 1.02 * 100) / 100,
              unit: "m³",
            },
          ],
        };
      },
      notes: [
        "Mật độ bê tông cốt thép: ~2400-2500 kg/m³",
        "Hao hụt bê tông: 1-3%",
      ],
    },
  },
  {
    id: "rebar-weight",
    title: "Khối lượng thép cốt thép (Cốt thép)",
    type: "calculator",
    icon: "barbell-outline",
    description: "Tính khối lượng cốt thép theo đường kính và chiều dài",
    tags: ["thép", "cốt thép", "khối lượng"],
    formula: {
      name: "Khối lượng cốt thép",
      description: "Tính khối lượng cốt thép dựa trên đường kính và chiều dài",
      inputs: [
        {
          key: "d",
          label: "Đường kính thép",
          unit: "mm",
          placeholder: "12",
          defaultValue: 12,
          min: 6,
          step: 2,
        },
        {
          key: "l",
          label: "Chiều dài thanh",
          unit: "m",
          placeholder: "11.7",
          defaultValue: 11.7,
          min: 0.1,
          step: 0.5,
        },
        {
          key: "n",
          label: "Số thanh",
          unit: "thanh",
          placeholder: "10",
          defaultValue: 10,
          min: 1,
          step: 1,
        },
      ],
      formula: "W = (d² / 162.2) × L × n (kg)",
      calculate: (inputs) => {
        const { d, l, n } = inputs;
        const weightPerM = (d * d) / 162.2; // kg/m
        const weight1 = weightPerM * l;
        const totalWeight = weight1 * n;
        return {
          mainResult: {
            label: "Tổng khối lượng thép",
            value: Math.round(totalWeight * 100) / 100,
            unit: "kg",
          },
          details: [
            {
              label: `Trọng lượng ø${d}`,
              value: Math.round(weightPerM * 1000) / 1000,
              unit: "kg/m",
            },
            {
              label: "KL 1 thanh",
              value: Math.round(weight1 * 100) / 100,
              unit: "kg",
            },
            {
              label: "Quy đổi tấn",
              value: Math.round(totalWeight / 10) / 100,
              unit: "tấn",
            },
          ],
        };
      },
      notes: [
        "Công thức: W = d²/162.2 (kg/m) - áp dụng cho thép tròn trơn và gân",
        "Hao hụt nối buộc: 1-3%",
        "ø6: 0.222 kg/m | ø8: 0.395 | ø10: 0.617 | ø12: 0.888 | ø16: 1.578 | ø20: 2.466 | ø25: 3.853",
      ],
    },
  },
];

// ============================================================================
// 2. TRA CỨU ĐỊNH MỨC, VẬT LIỆU - Material Standards Reference
// ============================================================================

const MATERIAL_STANDARDS: HandbookItem[] = [
  {
    id: "concrete-mix-ratio",
    title: "Cấp phối bê tông thường dùng",
    type: "reference",
    icon: "document-text-outline",
    tags: ["bê tông", "cấp phối"],
    content: `# Cấp phối bê tông thường dùng

## Bê tông M200 (B15) - 1m³
| Vật liệu | Khối lượng |
|-----------|-----------|
| Xi măng PCB40 | 350 kg |
| Cát vàng | 560 kg (0.37 m³) |
| Đá 1×2 | 1165 kg (0.70 m³) |
| Nước | 185 lít |

## Bê tông M250 (B20) - 1m³
| Vật liệu | Khối lượng |
|-----------|-----------|
| Xi măng PCB40 | 382 kg |
| Cát vàng | 540 kg (0.36 m³) |
| Đá 1×2 | 1150 kg (0.69 m³) |
| Nước | 191 lít |

## Bê tông M300 (B22.5) - 1m³
| Vật liệu | Khối lượng |
|-----------|-----------|
| Xi măng PCB40 | 415 kg |
| Cát vàng | 520 kg (0.34 m³) |
| Đá 1×2 | 1135 kg (0.68 m³) |
| Nước | 199 lít |

## Ghi chú
- Độ sụt bê tông: 8-12 cm
- Cát: Module độ lớn 2.3-2.8
- Đá dăm: Dmax = 20mm
- Xi măng: PC40 hoặc PCB40`,
  },
  {
    id: "mortar-mix-ratio",
    title: "Cấp phối vữa xây/trát",
    type: "reference",
    icon: "document-text-outline",
    tags: ["vữa", "xây", "trát"],
    content: `# Cấp phối vữa xây/trát

## Vữa xây M50 - 1m³
| Vật liệu | Khối lượng |
|-----------|-----------|
| Xi măng PCB30 | 220 kg |
| Cát mịn | 1130 kg |
| Nước | 260 lít |

## Vữa xây M75 - 1m³
| Vật liệu | Khối lượng |
|-----------|-----------|
| Xi măng PCB30 | 282 kg |
| Cát mịn | 1100 kg |
| Nước | 270 lít |

## Vữa trát M75 - 1m³
| Vật liệu | Khối lượng |
|-----------|-----------|
| Xi măng PCB30 | 320 kg |
| Cát mịn | 1050 kg |
| Nước | 280 lít |

## Định mức hao vữa
- Xây gạch 10×20 (tường 110): 0.023 m³/m²
- Xây gạch 10×20 (tường 220): 0.048 m³/m²
- Trát tường dày 15mm: 0.017 m³/m²
- Trát trần dày 10mm: 0.012 m³/m²`,
  },
  {
    id: "brick-consumption",
    title: "Định mức gạch xây",
    type: "reference",
    icon: "grid-outline",
    tags: ["gạch", "định mức", "xây"],
    content: `# Định mức gạch xây (viên/m²)

## Gạch ống 8×8×19
| Loại tường | Số viên/m² | Vữa (m³/m²) |
|------------|-----------|-------------|
| Tường 100mm | 51 | 0.018 |
| Tường 200mm | 102 | 0.038 |

## Gạch thẻ 4×8×19
| Loại tường | Số viên/m² | Vữa (m³/m²) |
|------------|-----------|-------------|
| Tường 100mm | 75 | 0.012 |

## Gạch block 10×20×40
| Loại tường | Số viên/m² | Vữa (m³/m²) |
|------------|-----------|-------------|
| Tường 100mm | 12.5 | 0.006 |
| Tường 200mm | 25 | 0.014 |

## Ghi chú
- Hao hụt gạch: 2-3%
- Mạch xây: 10-12mm
- Gạch phải ngâm nước trước khi xây`,
  },
  {
    id: "rebar-table",
    title: "Bảng tra trọng lượng thép",
    type: "reference",
    icon: "stats-chart-outline",
    tags: ["thép", "trọng lượng", "bảng tra"],
    content: `# Bảng tra thép xây dựng

## Thép tròn trơn & gân (TCVN)
| ø (mm) | kg/m | m/tấn | kg/thanh 11.7m |
|--------|------|-------|----------------|
| 6 | 0.222 | 4505 | 2.60 |
| 8 | 0.395 | 2532 | 4.62 |
| 10 | 0.617 | 1621 | 7.22 |
| 12 | 0.888 | 1126 | 10.39 |
| 14 | 1.208 | 828 | 14.14 |
| 16 | 1.578 | 634 | 18.47 |
| 18 | 1.998 | 500 | 23.38 |
| 20 | 2.466 | 405 | 28.86 |
| 22 | 2.984 | 335 | 34.91 |
| 25 | 3.853 | 260 | 45.08 |
| 28 | 4.834 | 207 | 56.56 |
| 32 | 6.313 | 158 | 73.87 |

## Thép hình (thông dụng)
| Loại | Kích thước | kg/m |
|------|-----------|------|
| I-100 | 100mm | 11.2 |
| I-150 | 150mm | 15.9 |
| I-200 | 200mm | 21.0 |
| V (L) | 50×50×5 | 3.77 |
| V (L) | 63×63×6 | 5.72 |
| V (L) | 75×75×8 | 9.02 |

## Công thức tính nhanh
**W = d² / 162.2 (kg/m)**
Với d = đường kính tính bằng mm`,
  },
  {
    id: "soil-coefficients",
    title: "Bảng hệ số đất & nền",
    type: "reference",
    icon: "earth-outline",
    tags: ["đất", "hệ số", "nền"],
    content: `# Bảng hệ số đất & nền móng

## Hệ số tơi xốp (K_tx)
| Loại đất | K_tx |
|----------|------|
| Đất sét | 1.24 - 1.30 |
| Đất á sét | 1.20 - 1.26 |
| Đất á cát | 1.15 - 1.20 |
| Đất cát | 1.10 - 1.15 |
| Đá dăm, sỏi | 1.15 - 1.20 |
| Đất lẫn đá | 1.30 - 1.45 |

## Sức chịu tải quy ước (R₀) - kPa
| Loại đất | R₀ (kPa) |
|----------|----------|
| Sét cứng | 300-600 |
| Sét dẻo cứng | 150-300 |
| Sét dẻo mềm | 100-150 |
| Á sét dẻo cứng | 200-300 |
| Cát thô, chặt | 400-600 |
| Cát trung, chặt | 300-500 |
| Cát mịn, chặt | 200-300 |

## Góc ma sát trong (φ)
| Loại đất | φ (độ) |
|----------|--------|
| Sét | 10-20 |
| Á sét | 18-25 |
| Á cát | 22-30 |
| Cát mịn | 26-32 |
| Cát thô | 30-38 |
| Sỏi, cuội | 35-45 |

## Dung trọng tự nhiên (γ)
| Loại đất | γ (kN/m³) |
|----------|----------|
| Sét | 17-20 |
| Á sét | 18-20 |
| Cát | 16-19 |
| Đất lấp | 15-17 |`,
  },
];

// ============================================================================
// 3. CHỨNG CHỈ HÀNH NGHỀ - Professional Certifications
// ============================================================================

const CERTIFICATIONS: HandbookItem[] = [
  {
    id: "cert-supervision",
    title: "CC Giám sát thi công XD",
    type: "guide",
    icon: "ribbon-outline",
    tags: ["chứng chỉ", "giám sát"],
    content: `# Chứng chỉ Giám sát thi công Xây dựng

## Điều kiện cấp chứng chỉ
1. **Hạng I**: ≥ 7 năm kinh nghiệm, tham gia GSTC ≥ 3 công trình cấp I hoặc ≥ 5 công trình cấp II
2. **Hạng II**: ≥ 5 năm kinh nghiệm, tham gia GSTC ≥ 3 công trình cấp II hoặc ≥ 5 công trình cấp III
3. **Hạng III**: ≥ 3 năm kinh nghiệm

## Yêu cầu chung
- Có trình độ đại học chuyên ngành phù hợp
- Đã qua sát hạch kiến thức pháp luật và chuyên môn
- Không vi phạm đạo đức nghề nghiệp

## Hồ sơ cần chuẩn bị
- Đơn đề nghị cấp chứng chỉ
- Bản sao bằng cấp chuyên môn
- CV kèm minh chứng kinh nghiệm
- Ảnh 4×6 (2 ảnh)
- Phí sát hạch theo quy định

## Thời hạn
- Chứng chỉ có hiệu lực 5 năm
- Gia hạn trước 3 tháng khi hết hạn

## Căn cứ pháp lý
- Luật Xây dựng 2014, sửa đổi 2020
- Nghị định 15/2021/NĐ-CP`,
  },
  {
    id: "cert-design",
    title: "CC Thiết kế công trình",
    type: "guide",
    icon: "create-outline",
    tags: ["chứng chỉ", "thiết kế"],
    content: `# Chứng chỉ Thiết kế công trình XD

## Phân hạng
- **Hạng I**: Thiết kế công trình cấp I trở xuống
- **Hạng II**: Thiết kế công trình cấp II trở xuống  
- **Hạng III**: Thiết kế công trình cấp III trở xuống

## Yêu cầu kinh nghiệm
| Hạng | Kinh nghiệm | Số công trình |
|------|-------------|--------------|
| I | ≥ 7 năm | ≥ 3 CT cấp I hoặc 5 CT cấp II |
| II | ≥ 5 năm | ≥ 3 CT cấp II hoặc 5 CT cấp III |
| III | ≥ 3 năm | Theo quy định |

## Lĩnh vực
- Dân dụng, Công nghiệp
- Giao thông, Thủy lợi
- Hạ tầng kỹ thuật`,
  },
  {
    id: "cert-construction-mgmt",
    title: "CC Quản lý dự án đầu tư XD",
    type: "guide",
    icon: "briefcase-outline",
    tags: ["chứng chỉ", "quản lý dự án"],
    content: `# Chứng chỉ Quản lý dự án đầu tư XD

## Điều kiện
- Trình độ đại học chuyên ngành phù hợp
- Kinh nghiệm tham gia QLDA xây dựng
- Đã qua sát hạch

## Phân hạng
- **Hạng I**: QLDA nhóm A, nhóm B
- **Hạng II**: QLDA nhóm B, nhóm C

## Phạm vi hoạt động
- Lập, quản lý chi phí đầu tư XD
- Tổ chức quản lý thi công XD
- Quản lý an toàn lao động`,
  },
  {
    id: "cert-safety",
    title: "CC An toàn lao động",
    type: "guide",
    icon: "shield-checkmark-outline",
    tags: ["chứng chỉ", "an toàn"],
    content: `# Chứng chỉ An toàn lao động XD

## Các loại huấn luyện (Nghị định 44/2016)
1. **Nhóm 1**: Người quản lý  
2. **Nhóm 2**: Cán bộ chuyên trách ATLĐ
3. **Nhóm 3**: Người lao động làm việc trên cao, hàn, điện...
4. **Nhóm 4**: Người lao động thông thường
5. **Nhóm 5**: Người làm công tác y tế
6. **Nhóm 6**: An toàn, vệ sinh viên

## Thời gian huấn luyện
| Nhóm | Lần đầu | Định kỳ |
|------|---------|---------|
| 1 | ≥ 16 giờ | ≥ 8 giờ/năm |
| 2 | ≥ 48 giờ | ≥ 24 giờ/năm |
| 3 | ≥ 24 giờ | ≥ 8 giờ/năm |
| 4 | ≥ 16 giờ | ≥ 8 giờ/năm |

## Quy định bắt buộc
- Phải huấn luyện trước khi bố trí việc
- Kiểm tra sức khỏe định kỳ
- Trang bị BHLĐ đầy đủ`,
  },
];

// ============================================================================
// 4. KINH NGHIỆM THỰC TẾ THI CÔNG - Practical Construction Tips
// ============================================================================

const PRACTICAL_EXPERIENCE: HandbookItem[] = [
  {
    id: "concrete-pouring",
    title: "Quy trình đổ bê tông đúng kỹ thuật",
    type: "checklist",
    icon: "checkbox-outline",
    tags: ["bê tông", "đổ", "quy trình"],
    checklist: [
      {
        id: "c1",
        text: "Kiểm tra ván khuôn, cốt thép trước khi đổ",
        category: "Chuẩn bị",
      },
      {
        id: "c2",
        text: "Tưới nước làm ẩm ván khuôn và nền",
        category: "Chuẩn bị",
      },
      {
        id: "c3",
        text: "Kiểm tra slump (độ sụt) bê tông khi xe đến",
        category: "Kiểm tra",
      },
      {
        id: "c4",
        text: "Lấy mẫu thí nghiệm (ít nhất 3 tổ mẫu/đợt đổ)",
        category: "Kiểm tra",
      },
      {
        id: "c5",
        text: "Đổ BT từ xa đến gần, từ thấp đến cao",
        category: "Thi công",
      },
      { id: "c6", text: "Chiều cao rơi tự do ≤ 1.5m", category: "Thi công" },
      {
        id: "c7",
        text: "Đầm bê tông kỹ, không bỏ sót (đầm dùi hoặc đầm bàn)",
        category: "Thi công",
      },
      {
        id: "c8",
        text: "Bảo dưỡng BT sau đổ: tưới nước ≥ 7 ngày",
        category: "Bảo dưỡng",
      },
      {
        id: "c9",
        text: "Tháo ván khuôn đúng thời gian quy định",
        category: "Tháo dỡ",
      },
      { id: "c10", text: "Ghi nhật ký thi công đầy đủ", category: "Hồ sơ" },
    ],
  },
  {
    id: "foundation-tips",
    title: "Kinh nghiệm thi công móng nhà",
    type: "checklist",
    icon: "home-outline",
    tags: ["móng", "nền", "kinh nghiệm"],
    checklist: [
      {
        id: "f1",
        text: "Khảo sát địa chất trước khi thi công",
        category: "Khảo sát",
      },
      {
        id: "f2",
        text: "Đào đến đúng cao trình thiết kế",
        category: "Đào đất",
      },
      {
        id: "f3",
        text: "Kiểm tra nền đất (không bị xáo trộn, đạt R₀)",
        category: "Kiểm tra",
      },
      { id: "f4", text: "Đổ lớp bê tông lót dày 100mm ", category: "BT lót" },
      {
        id: "f5",
        text: "Lắp đặt cốt thép đúng bản vẽ (khoảng cách, lớp bảo vệ)",
        category: "Cốt thép",
      },
      {
        id: "f6",
        text: "Kiểm tra tim cốt, đường chéo trước khi đổ",
        category: "Kiểm tra",
      },
      {
        id: "f7",
        text: "Chống thấm móng bằng sika hoặc bitum",
        category: "Chống thấm",
      },
      {
        id: "f8",
        text: "Đắp đất quanh móng sau khi BT đạt cường độ",
        category: "Hoàn thiện",
      },
    ],
  },
  {
    id: "waterproof-tips",
    title: "Kinh nghiệm chống thấm công trình",
    type: "guide",
    icon: "water-outline",
    tags: ["chống thấm", "kinh nghiệm"],
    content: `# Kinh nghiệm chống thấm công trình

## Vị trí cần chống thấm
1. **Sàn mái** - Các lớp: Vữa tạo dốc → Quét lót → Màng chống thấm → Lớp bảo vệ
2. **Sàn vệ sinh** - Quét Sika/màng tự dính, thử nước 48h
3. **Móng, tầng hầm** - Sika + màng bitum dán nóng/nguội
4. **Ban công, seno** - Chống thấm + tạo dốc thoát nước

## Lỗi thường gặp
- ❌ Không xử lý khe nứt trước khi chống thấm
- ❌ Chống thấm khi bề mặt còn ẩm (trừ loại chống thấm ẩm)
- ❌ Quên chống thấm các vị trí đi ống xuyên sàn
- ❌ Không thử nước trước khi ốp lát

## Vật liệu phổ biến
| Loại | Ứng dụng | Giá (VNĐ/m²) |
|------|----------|--------------|
| Sika Latex | Sàn vệ sinh | 30-50k |
| Sika 107 | Tường, sàn | 40-60k |
| Mapei Planiseal | Tầng hầm | 60-100k |
| Màng khò bitum | Mái, hầm | 80-120k |
| Sơn Kova CT-14 | Mái, tường | 50-80k |`,
  },
  {
    id: "rebar-installation",
    title: "Quy trình lắp đặt cốt thép",
    type: "checklist",
    icon: "construct-outline",
    tags: ["cốt thép", "lắp đặt", "quy trình"],
    checklist: [
      {
        id: "r1",
        text: "Gia công cốt thép đúng hình dạng, kích thước bản vẽ",
        category: "Gia công",
      },
      {
        id: "r2",
        text: "Nắn thẳng, cắt uốn theo đúng bán kính uốn",
        category: "Gia công",
      },
      {
        id: "r3",
        text: "Chiều dài nối buộc ≥ 30d (vùng kéo), 25d (vùng nén)",
        category: "Nối thép",
      },
      {
        id: "r4",
        text: "Mối nối so le ≥ 25% tiết diện, khoảng cách ≥ 1.5× chiều dài nối",
        category: "Nối thép",
      },
      {
        id: "r5",
        text: "Lớp bê tông bảo vệ: Cột/dầm 25-30mm, sàn 15-20mm, móng 35-50mm",
        category: "Lớp bảo vệ",
      },
      {
        id: "r6",
        text: "Buộc cốt thép chắc chắn, đặt con kê (spacer)",
        category: "Lắp đặt",
      },
      {
        id: "r7",
        text: "Nghiệm thu trước khi đổ bê tông",
        category: "Nghiệm thu",
      },
    ],
  },
];

// ============================================================================
// 5. CAREER ROADMAP
// ============================================================================

const CAREER_ROADMAP: HandbookItem[] = [
  {
    id: "career-civil-engineer",
    title: "Lộ trình Kỹ sư Xây dựng",
    type: "guide",
    icon: "trending-up-outline",
    tags: ["career", "kỹ sư"],
    content: `# Lộ trình nghề nghiệp Kỹ sư Xây dựng

## Giai đoạn 1: Kỹ sư mới (0-3 năm)
- 📋 Học việc tại công trường, làm kỹ sư hiện trường
- 📚 Nắm vững tiêu chuẩn, quy chuẩn xây dựng
- 🔧 Thành thạo đọc bản vẽ, giám sát từng hạng mục
- 💰 Lương: 8-15 triệu/tháng

## Giai đoạn 2: Kỹ sư có kinh nghiệm (3-7 năm)
- 📋 Chỉ huy trưởng / Kỹ sư QA-QC
- 📜 Thi lấy chứng chỉ hành nghề (hạng III → II)
- 🎯 Quản lý nhóm, lập tiến độ, dự toán
- 💰 Lương: 15-30 triệu/tháng

## Giai đoạn 3: Chuyên gia (7-15 năm)
- 📋 Giám đốc dự án / Chủ nhiệm thiết kế
- 📜 Chứng chỉ hạng I, PMP (nếu cần)
- 🎯 Quản lý danh mục dự án, đào tạo nhân sự
- 💰 Lương: 30-60+ triệu/tháng

## Giai đoạn 4: Lãnh đạo (15+ năm)
- 📋 Giám đốc kỹ thuật / Phó TGĐ / TGĐ
- 📜 Uy tín chuyên môn, mạng lưới rộng
- 💰 Thu nhập: 60-150+ triệu/tháng

## Kỹ năng cần thiết
⭐ AutoCAD, Revit, SAP2000/ETABS
⭐ MS Project, Primavera
⭐ Tiếng Anh chuyên ngành
⭐ Kỹ năng quản lý, giao tiếp`,
  },
  {
    id: "career-site-engineer",
    title: "Lộ trình Kỹ sư Hiện trường",
    type: "guide",
    icon: "person-outline",
    tags: ["career", "hiện trường"],
    content: `# Lộ trình Kỹ sư Hiện trường

## Công việc hàng ngày
- Kiểm tra, giám sát thi công tại hiện trường
- Ghi nhật ký công trình
- Nghiệm thu khối lượng, chất lượng
- Phối hợp với nhà thầu phụ
- Xử lý sự cố kỹ thuật

## Kỹ năng cần có
1. Đọc bản vẽ thành thạo (kiến trúc, kết cấu, MEP)
2. Am hiểu biện pháp thi công
3. Sử dụng thiết bị đo đạc cơ bản
4. Kỹ năng giao tiếp, quản lý công nhân
5. Kiến thức an toàn lao động

## Tiêu chuẩn cần nhớ
- TCVN 5574:2018 - Kết cấu BTCT
- TCVN 4453:1995 - Kết cấu BT & BTCT
- TCVN 9394:2012 - Đóng ép cọc
- TCVN 9395:2012 - Cọc nhồi
- QCVN 18:2014 - An toàn lao động`,
  },
];

// ============================================================================
// CATEGORIES EXPORT
// ============================================================================

export const HANDBOOK_CATEGORIES: HandbookCategory[] = [
  {
    id: "calculation-tools",
    title: "1. CÔNG CỤ TÍNH TOÁN",
    icon: "calculator-outline",
    color: "#0EA5E9",
    bgColor: "#E0F2FE",
    description: "Các công cụ tính toán thường dùng cho kỹ sư xây dựng",
    items: CALCULATION_TOOLS,
  },
  {
    id: "material-standards",
    title: "2. TRA CỨU ĐỊNH MỨC, VẬT LIỆU",
    icon: "book-outline",
    color: "#10B981",
    bgColor: "#D1FAE5",
    description: "Bảng tra cấp phối, định mức vật liệu xây dựng",
    items: MATERIAL_STANDARDS,
  },
  {
    id: "certifications",
    title: "3. CHỨNG CHỈ HÀNH NGHỀ",
    icon: "ribbon-outline",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    description: "Hướng dẫn các chứng chỉ hành nghề xây dựng",
    items: CERTIFICATIONS,
  },
  {
    id: "practical-experience",
    title: "4. KINH NGHIỆM THỰC TẾ THI CÔNG",
    icon: "hammer-outline",
    color: "#EF4444",
    bgColor: "#FEE2E2",
    description: "Kinh nghiệm thực tế, checklist thi công",
    items: PRACTICAL_EXPERIENCE,
  },
  {
    id: "career-roadmap",
    title: "5. CAREER ROADMAP",
    icon: "trending-up-outline",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    description: "Lộ trình nghề nghiệp kỹ sư xây dựng",
    items: CAREER_ROADMAP,
  },
];

export const getAllHandbookItems = (): HandbookItem[] => {
  return HANDBOOK_CATEGORIES.flatMap((cat) => cat.items);
};

export const getHandbookCategory = (
  id: string,
): HandbookCategory | undefined => {
  return HANDBOOK_CATEGORIES.find((cat) => cat.id === id);
};

export const getHandbookItem = (itemId: string): HandbookItem | undefined => {
  for (const cat of HANDBOOK_CATEGORIES) {
    const item = cat.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return undefined;
};

export const searchHandbook = (query: string): HandbookItem[] => {
  const q = query.toLowerCase();
  return getAllHandbookItems().filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q)),
  );
};
