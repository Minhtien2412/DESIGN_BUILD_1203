/**
 * Feature-to-Route Mapping
 * ─────────────────────────────────────────────────────────────────
 * Maps every icon / shortcut / CTA on all 4 role home screens
 * to a concrete route + params.
 *
 * Rules:
 *  - Every interactive element MUST have a mapping here.
 *  - Reuse existing screens with different params instead of creating new screens.
 *  - `allowedRoles` controls visibility per role.
 *  - `fallback` route used when target screen is not yet implemented.
 */

import {
    AI,
    AI_DESIGN,
    BOOKING,
    BUDGET,
    CALCULATORS,
    CHAT,
    COMMUNICATIONS,
    CONSTRUCTION,
    CRM,
    DESIGN_LIBRARY,
    EQUIPMENT,
    FINISHING,
    HANDBOOK,
    INSPECTION,
    INVENTORY,
    LABOR,
    MEETING_MINUTES,
    MISC,
    PROJECTS,
    QUALITY,
    SAFETY,
    SELLER,
    SERVICE_BOOKING,
    SERVICES,
    SETTINGS,
    TABS,
    TIMELINE,
    UTILITIES,
    VLXD,
    WEATHER,
    WORKERS,
} from "./route-registry";

// ────── Types ──────

export type AppRole = "worker" | "engineer" | "contractor" | "customer";

/** Feature readiness level */
export type FeatureStatus =
  | "ready" // Fully functional, wired to backend
  | "ui-only" // UI done, using mock data (needs backend)
  | "partial" // Partially implemented
  | "placeholder" // Shell/stub screen only
  | "coming-soon" // Planned but not started
  | "disabled" // Temporarily disabled
  | "hidden" // Not visible to users
  | "internal"; // Admin/dev only

/** Where this feature is surfaced in the UI */
export type FeatureVisibility =
  | "home-cta"
  | "home-shortcut"
  | "tools"
  | "activity"
  | "detail-page"
  | "flow-step"
  | "hidden";

/** Data source classification */
export type DataSource = "api" | "mock" | "local" | "websocket" | "none";

export interface FeatureMapping {
  /** Unique identifier matching the data item `id` */
  id: string;
  /** Display label */
  label: string;
  /** Short description shown in tooltips/cards */
  description?: string;
  /** Target route path */
  targetRoute: string;
  /** Optional params passed via router.push */
  params?: Record<string, string>;
  /** Roles allowed to see / use this feature */
  allowedRoles: AppRole[];
  /** Reuses an existing template screen? Name it here */
  reusesTemplate?: string;
  /** Fallback route when target screen not yet available */
  fallback?: string;
  /** Readiness status (default: ready) */
  status?: FeatureStatus;
  /** Where this feature appears in the UI */
  visibility?: FeatureVisibility;
  /** Primary entry point route that leads to this feature */
  entryPoint?: string;
  /** Requires prior data (e.g. an active booking) before accessible */
  requiresData?: string;
  /** Whether this feature needs backend API to function */
  requiresBackend?: boolean;
  /** Current data source for this feature */
  dataSource?: DataSource;
  /** Badge text to show on the icon (e.g. "Mới", "Hot") */
  badge?: string;
  /** Whether the icon should appear greyed out / disabled */
  isDisabled?: boolean;
}

// ────────────────────────────────────────────────
// CUSTOMER — Service Grid (12 icons)
// ────────────────────────────────────────────────
export const CUSTOMER_SERVICE_MAP: FeatureMapping[] = [
  {
    id: "service-thiet-ke-nha",
    label: "Thiết kế nhà",
    targetRoute: SERVICES.HOUSE_DESIGN,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "service-thiet-ke-noi-that",
    label: "Thiết kế nội thất",
    targetRoute: SERVICES.INTERIOR_DESIGN,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "service-tra-cuu",
    label: "Tra cứu xây dựng",
    targetRoute: SERVICES.CONSTRUCTION_LOOKUP,
    allowedRoles: ["customer"],
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "service-xin-phep",
    label: "Xin phép",
    targetRoute: SERVICES.PERMIT,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "service-ho-so",
    label: "Hồ sơ mẫu",
    targetRoute: SERVICES.SAMPLE_DOCS,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "local",
    visibility: "home-cta",
  },
  {
    id: "service-sua-nha",
    label: "Sửa nhà",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    allowedRoles: ["customer"],
    reusesTemplate: "home-maintenance",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "service-mau-nha",
    label: "Mẫu nhà",
    targetRoute: DESIGN_LIBRARY.INDEX,
    allowedRoles: ["customer"],
    reusesTemplate: "design-library",
    status: "ui-only",
    dataSource: "local",
    visibility: "home-cta",
  },
  {
    id: "service-tu-van",
    label: "Tư vấn chất lượng",
    targetRoute: SERVICES.QUALITY_CONSULTING,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "service-cong-ty-xay-dung",
    label: "Công ty xây dựng",
    targetRoute: SERVICES.CONSTRUCTION_COMPANY,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "service-cong-ty-noi-that",
    label: "Công ty nội thất",
    targetRoute: SERVICES.INTERIOR_COMPANY,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "service-giam-sat",
    label: "Giám sát thi công",
    targetRoute: SERVICES.QUALITY_SUPERVISION,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "service-xem-them",
    label: "Xem thêm",
    targetRoute: SERVICES.INDEX,
    allowedRoles: ["customer"],
    status: "ready",
    dataSource: "none",
    visibility: "home-cta",
  },
];

// ────────────────────────────────────────────────
// CUSTOMER — Design Utility (8 icons)
// ────────────────────────────────────────────────
export const CUSTOMER_DESIGN_UTILITY_MAP: FeatureMapping[] = [
  {
    id: "design-kien-truc-su",
    label: "Kiến trúc sư",
    targetRoute: SERVICES.ARCHITECT_LISTING,
    allowedRoles: ["customer"],
    reusesTemplate: "professional-listing",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "design-ky-su",
    label: "Kỹ sư",
    targetRoute: SERVICES.ENGINEER_LISTING,
    allowedRoles: ["customer"],
    reusesTemplate: "professional-listing",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "design-ket-cau",
    label: "Kết cấu",
    targetRoute: SERVICES.STRUCTURAL_ENGINEER,
    allowedRoles: ["customer"],
    reusesTemplate: "professional-listing",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "design-dien",
    label: "Điện",
    targetRoute: SERVICES.MEP_ELECTRICAL,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "design-nuoc",
    label: "Nước",
    targetRoute: SERVICES.MEP_PLUMBING,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "design-du-toan",
    label: "Dự toán",
    targetRoute: SERVICES.COST_ESTIMATE_AI,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "design-noi-that",
    label: "Nội thất",
    targetRoute: SERVICES.INTERIOR_DESIGN,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "design-ai",
    label: "Công Cụ AI",
    targetRoute: AI.HUB,
    allowedRoles: ["customer"],
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
];

// ────────────────────────────────────────────────
// CUSTOMER — Construction Utility (8 icons)
// ────────────────────────────────────────────────
export const CUSTOMER_CONSTRUCTION_UTILITY_MAP: FeatureMapping[] = [
  {
    id: "construction-ep-coc",
    label: "Ép cọc",
    targetRoute: UTILITIES.EP_COC,
    allowedRoles: ["customer", "contractor"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "construction-dao-dat",
    label: "Đào đất",
    targetRoute: UTILITIES.DAO_DAT,
    allowedRoles: ["customer", "contractor"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "construction-vat-lieu",
    label: "Vật liệu",
    targetRoute: UTILITIES.VAT_LIEU,
    allowedRoles: ["customer", "contractor"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "construction-nhan-cong",
    label: "Nhân công xây dựng",
    targetRoute: UTILITIES.NHAN_CONG,
    allowedRoles: ["customer", "contractor"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "construction-tho-xay",
    label: "Thợ xây",
    targetRoute: UTILITIES.THO_XAY,
    allowedRoles: ["customer", "contractor"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "construction-tho-sat",
    label: "Thợ sắt",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "ironworker" },
    allowedRoles: ["customer", "contractor"],
    reusesTemplate: "worker-listing",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "construction-tho-coffa",
    label: "Thợ cốt pha",
    targetRoute: UTILITIES.THO_COFFA,
    allowedRoles: ["customer", "contractor"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "construction-tho-co-khi",
    label: "Thợ cơ khí",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "mechanic" },
    allowedRoles: ["customer", "contractor"],
    reusesTemplate: "worker-listing",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "construction-tho-to-tuong",
    label: "Tô tường",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "plasterer" },
    allowedRoles: ["customer", "contractor"],
    reusesTemplate: "worker-listing",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "construction-tho-dien-nuoc",
    label: "Điện nước",
    targetRoute: UTILITIES.THO_DIEN_NUOC,
    allowedRoles: ["customer", "contractor"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "construction-be-tong",
    label: "Bê tông",
    targetRoute: UTILITIES.BE_TONG,
    allowedRoles: ["customer", "contractor"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "construction-xem-them",
    label: "Xem thêm",
    targetRoute: UTILITIES.INDEX,
    allowedRoles: ["customer", "contractor"],
    status: "ready",
    dataSource: "none",
    visibility: "home-cta",
  },
];

// ────────────────────────────────────────────────
// CUSTOMER — Finishing Utility (8 icons)
// ────────────────────────────────────────────────
export const CUSTOMER_FINISHING_UTILITY_MAP: FeatureMapping[] = [
  {
    id: "finishing-op-gach",
    label: "Thợ lát gạch",
    targetRoute: FINISHING.LAT_GACH,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "finishing-thach-cao",
    label: "Thợ thạch cao",
    targetRoute: FINISHING.THACH_CAO,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "finishing-tho-son",
    label: "Thợ sơn",
    targetRoute: FINISHING.SON,
    params: { trade: "painter" },
    allowedRoles: ["customer"],
    reusesTemplate: "finishing-worker",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "finishing-tho-da",
    label: "Thợ đá",
    targetRoute: FINISHING.DA,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "finishing-tho-lam-cua",
    label: "Thợ làm cửa",
    targetRoute: FINISHING.LAM_CUA,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "finishing-tho-lan-can",
    label: "Thợ lan can",
    targetRoute: FINISHING.LAN_CAN,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "finishing-tho-cong",
    label: "Thợ cổng",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "gate" },
    allowedRoles: ["customer"],
    reusesTemplate: "worker-listing",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "finishing-tho-camera",
    label: "Thợ camera",
    targetRoute: FINISHING.CAMERA,
    allowedRoles: ["customer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
];

// ────────────────────────────────────────────────
// CUSTOMER — Maintenance Utility (8 icons)
// ────────────────────────────────────────────────
export const CUSTOMER_MAINTENANCE_UTILITY_MAP: FeatureMapping[] = [
  {
    id: "maintenance-may-giat",
    label: "Thợ sửa máy giặt",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    params: { category: "washing-machine" },
    allowedRoles: ["customer"],
    reusesTemplate: "home-maintenance",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "maintenance-tu-lanh",
    label: "Thợ sửa tủ lạnh",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    params: { category: "refrigerator" },
    allowedRoles: ["customer"],
    reusesTemplate: "home-maintenance",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "maintenance-thong-tac",
    label: "Thợ thống tắc cống",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    params: { category: "drainage" },
    allowedRoles: ["customer"],
    reusesTemplate: "home-maintenance",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "maintenance-dien",
    label: "Thợ điện",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    params: { category: "electrical" },
    allowedRoles: ["customer"],
    reusesTemplate: "home-maintenance",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "maintenance-cap-nuoc",
    label: "Thợ cấp nước",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    params: { category: "water-supply" },
    allowedRoles: ["customer"],
    reusesTemplate: "home-maintenance",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "maintenance-wifi",
    label: "Thợ mạng - wifi",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    params: { category: "network" },
    allowedRoles: ["customer"],
    reusesTemplate: "home-maintenance",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "maintenance-may-lanh",
    label: "Thợ sửa máy lạnh",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    params: { category: "air-conditioning" },
    allowedRoles: ["customer"],
    reusesTemplate: "home-maintenance",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "maintenance-xem-them",
    label: "Xem thêm",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    allowedRoles: ["customer"],
    status: "ready",
    dataSource: "none",
    visibility: "home-cta",
  },
];

// ────────────────────────────────────────────────
// CUSTOMER — Marketplace (8 categories)
// ────────────────────────────────────────────────
export const CUSTOMER_MARKETPLACE_MAP: FeatureMapping[] = [
  {
    id: "market-bep",
    label: "Thiết bị bếp",
    targetRoute: TABS.SHOP,
    params: { category: "kitchen-equipment" },
    allowedRoles: ["customer"],
    reusesTemplate: "shop-category",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "market-ve-sinh",
    label: "Thiết bị vệ sinh",
    targetRoute: TABS.SHOP,
    params: { category: "sanitary-equipment" },
    allowedRoles: ["customer"],
    reusesTemplate: "shop-category",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "market-dien",
    label: "Điện",
    targetRoute: TABS.SHOP,
    params: { category: "electrical" },
    allowedRoles: ["customer"],
    reusesTemplate: "shop-category",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "market-nuoc",
    label: "Nước",
    targetRoute: TABS.SHOP,
    params: { category: "plumbing" },
    allowedRoles: ["customer"],
    reusesTemplate: "shop-category",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "market-pccc",
    label: "PCCC",
    targetRoute: TABS.SHOP,
    params: { category: "fire-safety" },
    allowedRoles: ["customer"],
    reusesTemplate: "shop-category",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "market-giuong",
    label: "Giường",
    targetRoute: TABS.SHOP,
    params: { category: "bedroom" },
    allowedRoles: ["customer"],
    reusesTemplate: "shop-category",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "market-ban-lam-viec",
    label: "Bàn làm việc",
    targetRoute: TABS.SHOP,
    params: { category: "study-desks" },
    allowedRoles: ["customer"],
    reusesTemplate: "shop-category",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
  {
    id: "market-sofa",
    label: "Sofa",
    targetRoute: TABS.SHOP,
    params: { category: "sofas" },
    allowedRoles: ["customer"],
    reusesTemplate: "shop-category",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
];

// ────────────────────────────────────────────────
// CUSTOMER — Furniture Products (tap to product)
// ────────────────────────────────────────────────
export const CUSTOMER_FURNITURE_MAP: FeatureMapping[] = [
  {
    id: "furniture-1",
    label: "Sofa hiện đại",
    targetRoute: "/product/fp1",
    allowedRoles: ["customer"],
    reusesTemplate: "product-detail",
  },
  {
    id: "furniture-2",
    label: "Bàn ăn gỗ sồi",
    targetRoute: "/product/fp2",
    allowedRoles: ["customer"],
    reusesTemplate: "product-detail",
  },
  {
    id: "furniture-3",
    label: "Đèn học",
    targetRoute: "/product/fp3",
    allowedRoles: ["customer"],
    reusesTemplate: "product-detail",
  },
];

// ════════════════════════════════════════════════
// WORKER — Shortcuts (8 icons)
// ════════════════════════════════════════════════
export const WORKER_SHORTCUT_MAP: FeatureMapping[] = [
  {
    id: "w1",
    label: "Nhận việc",
    targetRoute: WORKERS.BOOKINGS,
    allowedRoles: ["worker"],
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "w2",
    label: "Việc gần đây",
    targetRoute: WORKERS.FIND,
    params: { sort: "nearest" },
    allowedRoles: ["worker"],
    reusesTemplate: "find-workers",
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "w3",
    label: "Tổ đội",
    targetRoute: BOOKING.SCAN_WORKERS,
    allowedRoles: ["worker"],
    reusesTemplate: "scan-workers",
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "w4",
    label: "Vật tư",
    targetRoute: VLXD.INDEX,
    allowedRoles: ["worker"],
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "w5",
    label: "Chấm công",
    targetRoute: WORKERS.SCHEDULE,
    allowedRoles: ["worker"],
    reusesTemplate: "worker-schedule",
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "w6",
    label: "Lịch hẹn",
    targetRoute: WORKERS.SCHEDULE,
    allowedRoles: ["worker"],
    reusesTemplate: "worker-schedule",
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "w7",
    label: "Lương",
    targetRoute: BUDGET.INDEX,
    allowedRoles: ["worker"],
    reusesTemplate: "budget",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-shortcut",
  },
  {
    id: "w8",
    label: "Live công trình",
    targetRoute: TABS.LIVE,
    allowedRoles: ["worker"],
    status: "ready",
    dataSource: "websocket",
    visibility: "home-shortcut",
  },
];

// ────────────────────────────────────────────────
// WORKER — Trade Categories (8 trade types)
// ────────────────────────────────────────────────
export const WORKER_CATEGORY_MAP: FeatureMapping[] = [
  {
    id: "wc1",
    label: "Thợ sơn",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "painter" },
    allowedRoles: ["worker", "customer"],
    reusesTemplate: "worker-listing",
  },
  {
    id: "wc2",
    label: "Thợ điện",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "electrician" },
    allowedRoles: ["worker", "customer"],
    reusesTemplate: "worker-listing",
  },
  {
    id: "wc3",
    label: "Thợ nước",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "plumber" },
    allowedRoles: ["worker", "customer"],
    reusesTemplate: "worker-listing",
  },
  {
    id: "wc4",
    label: "Thợ hồ",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "mason" },
    allowedRoles: ["worker", "customer"],
    reusesTemplate: "worker-listing",
  },
  {
    id: "wc5",
    label: "Thợ mộc",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "carpenter" },
    allowedRoles: ["worker", "customer"],
    reusesTemplate: "worker-listing",
  },
  {
    id: "wc6",
    label: "Thợ hàn",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "welder" },
    allowedRoles: ["worker", "customer"],
    reusesTemplate: "worker-listing",
  },
  {
    id: "wc7",
    label: "Thợ ốp lát",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "tiler" },
    allowedRoles: ["worker", "customer"],
    reusesTemplate: "worker-listing",
  },
  {
    id: "wc8",
    label: "Thợ nhôm kính",
    targetRoute: WORKERS.INDEX,
    params: { specialty: "aluminum-glass" },
    allowedRoles: ["worker", "customer"],
    reusesTemplate: "worker-listing",
  },
];

// ────────────────────────────────────────────────
// WORKER — Hot Jobs (tap to job detail)
// ────────────────────────────────────────────────
export const WORKER_JOB_MAP: FeatureMapping[] = [
  {
    id: "j1",
    label: "Thợ sơn nước - Quận 7",
    targetRoute: WORKERS.BOOKINGS,
    params: { jobId: "j1" },
    allowedRoles: ["worker"],
    reusesTemplate: "worker-bookings",
  },
  {
    id: "j2",
    label: "Thợ điện - Thủ Đức",
    targetRoute: WORKERS.BOOKINGS,
    params: { jobId: "j2" },
    allowedRoles: ["worker"],
    reusesTemplate: "worker-bookings",
  },
  {
    id: "j3",
    label: "Phụ hồ - Bình Tân",
    targetRoute: WORKERS.BOOKINGS,
    params: { jobId: "j3" },
    allowedRoles: ["worker"],
    reusesTemplate: "worker-bookings",
  },
  {
    id: "j4",
    label: "Thợ ốp lát - Quận 2",
    targetRoute: WORKERS.BOOKINGS,
    params: { jobId: "j4" },
    allowedRoles: ["worker"],
    reusesTemplate: "worker-bookings",
  },
];

// ════════════════════════════════════════════════
// ENGINEER — Professional Tools (8 icons)
// ════════════════════════════════════════════════
export const ENGINEER_TOOL_MAP: FeatureMapping[] = [
  {
    id: "e1",
    label: "Hồ sơ năng lực",
    targetRoute: TABS.PROFILE,
    allowedRoles: ["engineer"],
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "e2",
    label: "Dự án",
    targetRoute: PROJECTS.INDEX,
    allowedRoles: ["engineer"],
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "e3",
    label: "Chứng chỉ",
    targetRoute: TABS.PROFILE,
    params: { section: "certifications" },
    allowedRoles: ["engineer"],
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "e4",
    label: "Báo giá",
    targetRoute: CALCULATORS.PROJECT_ESTIMATE,
    allowedRoles: ["engineer"],
    reusesTemplate: "calculators",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-shortcut",
  },
  {
    id: "e5",
    label: "Hợp đồng",
    targetRoute: CRM.CONTRACTS,
    allowedRoles: ["engineer"],
    reusesTemplate: "crm-contracts",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-shortcut",
  },
  {
    id: "e6",
    label: "Giám sát",
    targetRoute: QUALITY.INDEX,
    allowedRoles: ["engineer"],
    reusesTemplate: "quality-assurance",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-shortcut",
  },
  {
    id: "e7",
    label: "Live Preview",
    targetRoute: TABS.LIVE,
    allowedRoles: ["engineer"],
    status: "ready",
    dataSource: "websocket",
    visibility: "home-shortcut",
  },
  {
    id: "e8",
    label: "Lịch họp",
    targetRoute: COMMUNICATIONS.CREATE_MEETING,
    allowedRoles: ["engineer"],
    reusesTemplate: "communications",
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
];

// ────────────────────────────────────────────────
// ENGINEER — Advanced Actions (4 action cards)
// ────────────────────────────────────────────────
export const ENGINEER_ACTION_MAP: FeatureMapping[] = [
  {
    id: "ea1",
    label: "VR/AR Mặt bằng",
    targetRoute: MISC.VR_PREVIEW,
    allowedRoles: ["engineer"],
    status: "coming-soon",
    dataSource: "none",
    visibility: "home-cta",
  },
  {
    id: "ea2",
    label: "Camera công trình",
    targetRoute: CONSTRUCTION.PROGRESS,
    allowedRoles: ["engineer"],
    reusesTemplate: "construction-progress",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "ea3",
    label: "Bản vẽ 2D/3D",
    targetRoute: AI_DESIGN.VISUALIZER,
    allowedRoles: ["engineer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-cta",
  },
  {
    id: "ea4",
    label: "Tư vấn khách hàng",
    targetRoute: CHAT.INDEX,
    allowedRoles: ["engineer"],
    reusesTemplate: "chat",
    status: "ready",
    dataSource: "api",
    visibility: "home-cta",
  },
];

// ════════════════════════════════════════════════
// CONTRACTOR — Quick Actions (8 icons)
// ════════════════════════════════════════════════
export const CONTRACTOR_ACTION_MAP: FeatureMapping[] = [
  {
    id: "ca1",
    label: "Quản lý nhân sự",
    targetRoute: CRM.STAFF,
    allowedRoles: ["contractor"],
    reusesTemplate: "crm-staff",
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "ca2",
    label: "Đội thi công",
    targetRoute: WORKERS.INDEX,
    params: { view: "team" },
    allowedRoles: ["contractor"],
    reusesTemplate: "worker-listing",
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "ca3",
    label: "Dự án",
    targetRoute: PROJECTS.INDEX,
    allowedRoles: ["contractor"],
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "ca4",
    label: "Hợp đồng",
    targetRoute: CRM.CONTRACTS,
    allowedRoles: ["contractor"],
    reusesTemplate: "crm-contracts",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-shortcut",
  },
  {
    id: "ca5",
    label: "Kho vật tư",
    targetRoute: VLXD.INDEX,
    allowedRoles: ["contractor"],
    reusesTemplate: "vlxd",
    status: "ready",
    dataSource: "api",
    visibility: "home-shortcut",
  },
  {
    id: "ca6",
    label: "Điều phối",
    targetRoute: TIMELINE.INDEX,
    allowedRoles: ["contractor"],
    reusesTemplate: "timeline",
    status: "ready",
    dataSource: "websocket",
    visibility: "home-shortcut",
  },
  {
    id: "ca7",
    label: "Báo giá",
    targetRoute: CALCULATORS.PROJECT_ESTIMATE,
    allowedRoles: ["contractor"],
    reusesTemplate: "calculators",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-shortcut",
  },
  {
    id: "ca8",
    label: "Báo cáo",
    targetRoute: CRM.REPORTS,
    allowedRoles: ["contractor"],
    reusesTemplate: "crm-reports",
    status: "ui-only",
    dataSource: "mock",
    visibility: "home-shortcut",
  },
];

// ────────────────────────────────────────────────
// CONTRACTOR — Active Projects (tap to project detail)
// ────────────────────────────────────────────────
export const CONTRACTOR_PROJECT_MAP: FeatureMapping[] = [
  {
    id: "cp1",
    label: "Biệt thự Thảo Điền",
    targetRoute: PROJECTS.DETAIL("cp1"),
    allowedRoles: ["contractor"],
    reusesTemplate: "project-detail",
  },
  {
    id: "cp2",
    label: "Văn phòng Landmark",
    targetRoute: PROJECTS.DETAIL("cp2"),
    allowedRoles: ["contractor"],
    reusesTemplate: "project-detail",
  },
  {
    id: "cp3",
    label: "Nhà phố Quận 9",
    targetRoute: PROJECTS.DETAIL("cp3"),
    allowedRoles: ["contractor"],
    reusesTemplate: "project-detail",
  },
  {
    id: "cp4",
    label: "Chung cư Riverside",
    targetRoute: PROJECTS.DETAIL("cp4"),
    allowedRoles: ["contractor"],
    reusesTemplate: "project-detail",
  },
];

// ════════════════════════════════════════════════
// CONTRACTOR — Seller / Shop Management (6 icons)
// ════════════════════════════════════════════════
export const CONTRACTOR_SELLER_MAP: FeatureMapping[] = [
  {
    id: "cs1",
    label: "Quản lý sản phẩm",
    targetRoute: SELLER.PRODUCTS,
    allowedRoles: ["contractor"],
  },
  {
    id: "cs2",
    label: "Đơn hàng",
    targetRoute: SELLER.ORDERS,
    allowedRoles: ["contractor"],
  },
  {
    id: "cs3",
    label: "Doanh thu",
    targetRoute: SELLER.REVENUE,
    allowedRoles: ["contractor"],
  },
  {
    id: "cs4",
    label: "Khuyến mãi",
    targetRoute: SELLER.PROMOTIONS,
    allowedRoles: ["contractor"],
  },
  {
    id: "cs5",
    label: "Đánh giá",
    targetRoute: SELLER.REVIEWS,
    allowedRoles: ["contractor"],
  },
  {
    id: "cs6",
    label: "Kho hàng",
    targetRoute: INVENTORY.INDEX,
    allowedRoles: ["contractor"],
  },
];

// ════════════════════════════════════════════════
// CONTRACTOR — Labor & Equipment (6 icons)
// ════════════════════════════════════════════════
export const CONTRACTOR_LABOR_MAP: FeatureMapping[] = [
  {
    id: "cl1",
    label: "DS Công nhân",
    targetRoute: LABOR.WORKERS,
    allowedRoles: ["contractor"],
    status: "ready",
    dataSource: "api",
    visibility: "tools",
  },
  {
    id: "cl2",
    label: "Chấm công",
    targetRoute: LABOR.ATTENDANCE,
    allowedRoles: ["contractor"],
    status: "ready",
    dataSource: "api",
    visibility: "tools",
  },
  {
    id: "cl3",
    label: "Bảng lương",
    targetRoute: LABOR.PAYROLL,
    allowedRoles: ["contractor"],
    status: "ready",
    dataSource: "api",
    visibility: "tools",
  },
  {
    id: "cl4",
    label: "Ca làm việc",
    targetRoute: LABOR.SHIFTS,
    allowedRoles: ["contractor"],
    status: "ready",
    dataSource: "api",
    visibility: "tools",
  },
  {
    id: "cl5",
    label: "Thiết bị",
    targetRoute: EQUIPMENT.INDEX,
    allowedRoles: ["contractor", "engineer"],
    status: "ui-only",
    dataSource: "mock",
    visibility: "tools",
  },
  {
    id: "cl6",
    label: "Nghỉ phép",
    targetRoute: LABOR.LEAVE_REQUESTS,
    allowedRoles: ["contractor"],
    status: "ready",
    dataSource: "api",
    visibility: "tools",
  },
  {
    id: "cl7",
    label: "Báo cáo nhân sự",
    targetRoute: LABOR.REPORTS,
    allowedRoles: ["contractor", "admin"],
    status: "ready",
    dataSource: "api",
    visibility: "tools",
  },
];

// ════════════════════════════════════════════════
// ENGINEER — Site Management Tools (6 icons)
// ════════════════════════════════════════════════
export const ENGINEER_SITE_MAP: FeatureMapping[] = [
  {
    id: "es1",
    label: "Nghiệm thu",
    targetRoute: INSPECTION.INDEX,
    allowedRoles: ["engineer", "contractor"],
  },
  {
    id: "es2",
    label: "An toàn LĐ",
    targetRoute: SAFETY.INDEX,
    allowedRoles: ["engineer", "contractor"],
  },
  {
    id: "es3",
    label: "Biên bản họp",
    targetRoute: MEETING_MINUTES.INDEX,
    allowedRoles: ["engineer", "contractor"],
  },
  {
    id: "es4",
    label: "Thời tiết",
    targetRoute: WEATHER.DASHBOARD,
    allowedRoles: ["engineer", "contractor", "worker"],
  },
  {
    id: "es5",
    label: "Sổ tay XD",
    targetRoute: HANDBOOK.INDEX,
    allowedRoles: ["engineer", "contractor", "worker"],
  },
  {
    id: "es6",
    label: "Cài đặt",
    targetRoute: SETTINGS.INDEX,
    allowedRoles: ["engineer", "contractor", "worker", "customer"],
  },
];

// ════════════════════════════════════════════════
// SERVICE BOOKING — Discovery & Booking Flow
// ════════════════════════════════════════════════
export const SERVICE_BOOKING_DISCOVERY_MAP: FeatureMapping[] = [
  {
    id: "sb-worker-map",
    label: "Tìm thợ trên bản đồ",
    targetRoute: SERVICE_BOOKING.WORKER_MAP,
    allowedRoles: ["customer", "contractor"],
    status: "ready",
    visibility: "home-cta",
    entryPoint: "/find-workers",
  },
  {
    id: "sb-booking-steps",
    label: "Đặt thợ theo quy trình",
    targetRoute: SERVICE_BOOKING.BOOKING_STEPS,
    allowedRoles: ["customer", "contractor"],
    status: "ready",
    visibility: "flow-step",
    entryPoint: SERVICE_BOOKING.WORKER_MAP,
    requiresData: "selectedCategory",
  },
  {
    id: "sb-confirm-booking",
    label: "Xác nhận đặt thợ",
    targetRoute: SERVICE_BOOKING.CONFIRM_BOOKING,
    allowedRoles: ["customer", "contractor"],
    status: "ready",
    visibility: "flow-step",
    entryPoint: SERVICE_BOOKING.WORKER_MAP,
    requiresData: "selectedWorker",
  },
  {
    id: "sb-schedule",
    label: "Lịch đặt thợ",
    targetRoute: SERVICE_BOOKING.SCHEDULE,
    allowedRoles: ["customer", "contractor", "worker"],
    status: "ready",
    visibility: "activity",
  },
];

// ════════════════════════════════════════════════
// SERVICE BOOKING — Tracking (post-booking)
// ════════════════════════════════════════════════
export const SERVICE_BOOKING_TRACKING_MAP: FeatureMapping[] = [
  {
    id: "sb-live-tracking",
    label: "Theo dõi trực tiếp",
    targetRoute: SERVICE_BOOKING.LIVE_TRACKING,
    allowedRoles: ["customer", "contractor"],
    status: "ready",
    visibility: "detail-page",
    requiresData: "activeBooking",
  },
  {
    id: "sb-vehicle-tracking",
    label: "Theo dõi xe/thiết bị",
    targetRoute: SERVICE_BOOKING.VEHICLE_TRACKING,
    allowedRoles: ["contractor"],
    status: "ready",
    visibility: "detail-page",
    requiresData: "activeBooking",
  },
  {
    id: "sb-worker-route",
    label: "Lộ trình di chuyển",
    targetRoute: SERVICE_BOOKING.WORKER_ROUTE_TRACKING,
    allowedRoles: ["worker"],
    status: "ready",
    visibility: "detail-page",
    requiresData: "activeBooking",
  },
  {
    id: "sb-active-trackings",
    label: "Đang theo dõi",
    targetRoute: SERVICE_BOOKING.ACTIVE_TRACKINGS,
    allowedRoles: ["customer", "contractor"],
    status: "ready",
    visibility: "activity",
  },
  {
    id: "sb-tracking-history",
    label: "Lịch sử theo dõi",
    targetRoute: SERVICE_BOOKING.TRACKING_HISTORY,
    allowedRoles: ["customer", "contractor", "worker"],
    status: "ready",
    visibility: "activity",
  },
];

// ════════════════════════════════════════════════
// SERVICE BOOKING — Reviews (post-completion)
// ════════════════════════════════════════════════
export const SERVICE_BOOKING_REVIEW_MAP: FeatureMapping[] = [
  {
    id: "sb-worker-review",
    label: "Xem đánh giá thợ",
    targetRoute: SERVICE_BOOKING.WORKER_REVIEW,
    allowedRoles: ["customer", "contractor", "worker"],
    status: "ready",
    visibility: "detail-page",
    entryPoint: SERVICE_BOOKING.WORKER_MAP,
  },
  {
    id: "sb-write-review",
    label: "Viết đánh giá",
    targetRoute: SERVICE_BOOKING.WRITE_REVIEW,
    allowedRoles: ["customer", "contractor"],
    status: "ready",
    visibility: "detail-page",
    requiresData: "completedBooking",
  },
];

// ════════════════════════════════════════════════
// SERVICE BOOKING — Index / Detail (internal)
// ════════════════════════════════════════════════
export const SERVICE_BOOKING_INTERNAL_MAP: FeatureMapping[] = [
  {
    id: "sb-index",
    label: "Service Booking Hub",
    targetRoute: SERVICE_BOOKING.INDEX,
    allowedRoles: ["customer", "contractor", "worker"],
    status: "internal",
    visibility: "hidden",
  },
];

// ════════════════════════════════════════════════
// Utility Section Promo Banners — referenced by UtilitySection onPromoPress
// ════════════════════════════════════════════════
export const UTILITY_PROMO_MAP: FeatureMapping[] = [
  {
    id: "design",
    label: "Tiện ích thiết kế",
    targetRoute: SERVICES.HOUSE_DESIGN,
    allowedRoles: ["customer", "engineer", "contractor"],
    visibility: "home-cta",
    status: "ready",
  },
  {
    id: "construction",
    label: "Tiện ích xây dựng",
    targetRoute: CONSTRUCTION.BOOKING,
    allowedRoles: ["customer", "contractor"],
    visibility: "home-cta",
    status: "ready",
  },
  {
    id: "finishing",
    label: "Tiện ích hoàn thiện",
    targetRoute: FINISHING.INDEX,
    allowedRoles: ["customer", "contractor"],
    visibility: "home-cta",
    status: "ready",
  },
  {
    id: "maintenance",
    label: "Tiện ích bảo trì",
    targetRoute: SERVICES.HOME_MAINTENANCE,
    allowedRoles: ["customer", "contractor"],
    visibility: "home-cta",
    status: "ready",
  },
];

// ════════════════════════════════════════════════
// LIVE / VIDEO — Media Items (referencing by UI data id)
// ════════════════════════════════════════════════
export const LIVE_VIDEO_MAP: FeatureMapping[] = [
  {
    id: "live-1",
    label: "Live công trình 1",
    targetRoute: TABS.LIVE,
    allowedRoles: ["customer", "worker", "engineer", "contractor"],
  },
  {
    id: "live-2",
    label: "Live công trình 2",
    targetRoute: TABS.LIVE,
    allowedRoles: ["customer", "worker", "engineer", "contractor"],
  },
  {
    id: "video-1",
    label: "Video xây dựng 1",
    targetRoute: TABS.LIVE,
    params: { tab: "video" },
    allowedRoles: ["customer", "worker", "engineer", "contractor"],
  },
  {
    id: "video-2",
    label: "Video xây dựng 2",
    targetRoute: TABS.LIVE,
    params: { tab: "video" },
    allowedRoles: ["customer", "worker", "engineer", "contractor"],
  },
];

// ════════════════════════════════════════════════
// Utility section → mapping registry (for generic mapping lookup)
// ════════════════════════════════════════════════

/** Maps utility section id → its feature mapping array */
export const UTILITY_SECTION_MAP: Record<string, FeatureMapping[]> = {
  design: CUSTOMER_DESIGN_UTILITY_MAP,
  construction: CUSTOMER_CONSTRUCTION_UTILITY_MAP,
  finishing: CUSTOMER_FINISHING_UTILITY_MAP,
  maintenance: CUSTOMER_MAINTENANCE_UTILITY_MAP,
};

// ════════════════════════════════════════════════
// Master lookup — find a mapping by item id across all maps
// ════════════════════════════════════════════════

const ALL_MAPS: FeatureMapping[][] = [
  CUSTOMER_SERVICE_MAP,
  CUSTOMER_DESIGN_UTILITY_MAP,
  CUSTOMER_CONSTRUCTION_UTILITY_MAP,
  CUSTOMER_FINISHING_UTILITY_MAP,
  CUSTOMER_MAINTENANCE_UTILITY_MAP,
  CUSTOMER_MARKETPLACE_MAP,
  CUSTOMER_FURNITURE_MAP,
  LIVE_VIDEO_MAP,
  UTILITY_PROMO_MAP,
  WORKER_SHORTCUT_MAP,
  WORKER_CATEGORY_MAP,
  WORKER_JOB_MAP,
  ENGINEER_TOOL_MAP,
  ENGINEER_ACTION_MAP,
  ENGINEER_SITE_MAP,
  CONTRACTOR_ACTION_MAP,
  CONTRACTOR_PROJECT_MAP,
  CONTRACTOR_SELLER_MAP,
  CONTRACTOR_LABOR_MAP,
  SERVICE_BOOKING_DISCOVERY_MAP,
  SERVICE_BOOKING_TRACKING_MAP,
  SERVICE_BOOKING_REVIEW_MAP,
  SERVICE_BOOKING_INTERNAL_MAP,
];

const _index = new Map<string, FeatureMapping>();
for (const arr of ALL_MAPS) {
  for (const m of arr) {
    _index.set(m.id, m);
  }
}

/** O(1) lookup any feature mapping by its item `id` */
export function getFeatureMapping(id: string): FeatureMapping | undefined {
  return _index.get(id);
}

/** Resolve target route for an item id (returns fallback if not found) */
export function resolveRoute(
  id: string,
  fallback = MISC.COMING_SOON,
): { route: string; params?: Record<string, string> } {
  const m = _index.get(id);
  if (!m) return { route: fallback };
  return { route: m.targetRoute, params: m.params };
}
