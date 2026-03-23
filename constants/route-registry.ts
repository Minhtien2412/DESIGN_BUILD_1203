/**
 * Central Route Registry — single source of truth for every route in the app.
 * ─────────────────────────────────────────────────────────────────────────────
 * Components reference routes via these constants — NEVER hardcode strings.
 *
 * Naming convention: SCREAMING_SNAKE grouped by module.
 * Dynamic params use functions: `PROJECT_DETAIL(id)`.
 */

// ────── Auth ──────
export const AUTH = {
  LOGIN: "/(auth)/login",
  LOGIN_UNIFIED: "/(auth)/login-unified",
  LOGIN_2FA: "/(auth)/login-2fa",
  REGISTER: "/(auth)/register",
  REGISTER_UNIFIED: "/(auth)/register-unified",
  FORGOT_PASSWORD: "/(auth)/forgot-password",
  RESET_PASSWORD: "/(auth)/reset-password",
  OTP_VERIFY: "/(auth)/otp-verify",
  FACE_VERIFICATION: "/(auth)/face-verification",
  ZALO_LOGIN: "/zalo-login",
} as const;

// ────── Onboarding / Entry ──────
export const ENTRY = {
  SPLASH: "/splash",
  ONBOARDING: "/onboarding",
  ROLE_SELECT: "/role-select",
} as const;

// ────── Main Tabs ──────
export const TABS = {
  HOME: "/(tabs)",
  ACTIVITY: "/(tabs)/activity",
  COMMUNICATION: "/(tabs)/communication",
  PROFILE: "/(tabs)/profile",
  SHOP: "/(tabs)/shop",
  SOCIAL: "/(tabs)/social",
  PROJECTS: "/(tabs)/projects",
  HOME_CONSTRUCTION: "/(tabs)/home-construction",
  LIVE: "/(tabs)/live",
  NEWS: "/(tabs)/news",
  MENU: "/(tabs)/menu",
  AI_ASSISTANT: "/(tabs)/ai-assistant",
  PROGRESS: "/(tabs)/progress",
  NOTIFICATIONS: "/(tabs)/notifications",
  MESSAGES: "/(tabs)/messages",
} as const;

// ────── Services ──────
export const SERVICES = {
  INDEX: "/services",
  HOUSE_DESIGN: "/services/house-design",
  HOUSE_DESIGN_AI: "/services/house-design-ai",
  INTERIOR_DESIGN: "/services/interior-design",
  INTERIOR_DESIGN_AI: "/services/interior-design-ai",
  INTERIOR_COMPANY: "/services/interior-company",
  CONSTRUCTION_LOOKUP: "/services/construction-lookup",
  CONSTRUCTION_COMPANY: "/services/construction-company",
  COMPANY_DETAIL: "/services/company-detail",
  PERMIT: "/services/permit",
  PERMIT_AI: "/services/permit-ai",
  SAMPLE_DOCS: "/services/sample-docs",
  FENG_SHUI: "/services/feng-shui",
  COLOR_CHART: "/services/color-chart",
  COLOR_TRENDS: "/services/color-trends",
  QUALITY_CONSULTING: "/services/quality-consulting",
  QUALITY_SUPERVISION: "/services/quality-supervision",
  STRUCTURAL_ENGINEER: "/services/structural-engineer",
  ENGINEER_LISTING: "/services/engineer-listing",
  ARCHITECT_LISTING: "/services/architect-listing",
  MATERIALS_CATALOG: "/services/materials-catalog",
  MARKETPLACE: "/services/marketplace",
  MEP_ELECTRICAL: "/services/mep-electrical",
  MEP_PLUMBING: "/services/mep-plumbing",
  DESIGN_CALCULATOR: "/services/design-calculator",
  COST_ESTIMATE_AI: "/services/cost-estimate-ai",
  HOME_MAINTENANCE: "/services/home-maintenance",
  HOME_MAINTENANCE_CATEGORY: (id: string) =>
    `/services/home-maintenance/category/${id}` as const,
  HOME_MAINTENANCE_WORKER: (id: string) =>
    `/services/home-maintenance/worker/${id}` as const,
  DETAIL: (id: string) => `/services/detail/${id}` as const,
  AI_ASSISTANT: "/services/ai-assistant",
} as const;

// ────── Construction Utilities ──────
export const UTILITIES = {
  INDEX: "/utilities",
  EP_COC: "/utilities/ep-coc",
  DAO_DAT: "/utilities/dao-dat",
  VAT_LIEU: "/utilities/vat-lieu",
  NHAN_CONG: "/utilities/nhan-cong",
  THO_XAY: "/utilities/tho-xay",
  THO_COFFA: "/utilities/tho-coffa",
  THO_DIEN_NUOC: "/utilities/tho-dien-nuoc",
  BE_TONG: "/utilities/be-tong",
  CONSTRUCTION: "/utilities/construction",
  DESIGN_TEAM: "/utilities/design-team",
  COST_ESTIMATOR: "/utilities/cost-estimator",
  SCHEDULE: "/utilities/schedule",
  HISTORY: "/utilities/history",
  QUOTE_REQUEST: "/utilities/quote-request",
  STORE_LOCATOR: "/utilities/store-locator",
  STORE_MAP: "/utilities/store-map",
  QR_SCANNER: "/utilities/qr-scanner",
  MY_QR_CODE: "/utilities/my-qr-code",
  SLUG: (slug: string) => `/utilities/${slug}` as const,
} as const;

// ────── Finishing ──────
export const FINISHING = {
  INDEX: "/finishing",
  LAT_GACH: "/finishing/lat-gach",
  THACH_CAO: "/finishing/thach-cao",
  SON: "/finishing/son",
  DA: "/finishing/da",
  LAM_CUA: "/finishing/lam-cua",
  LAN_CAN: "/finishing/lan-can",
  DIEN_NUOC: "/finishing/dien-nuoc",
  CAMERA: "/finishing/camera",
  PRODUCTS: (category: string) => `/finishing/products/${category}` as const,
  WORKER_PROFILE: (id: string) =>
    `/finishing/worker-profile-new/${id}` as const,
} as const;

// ────── Booking / Workers ──────
export const BOOKING = {
  INDEX: "/booking",
  CONFIRM: "/booking/confirm",
  ENTER_ADDRESS: "/booking/enter-address",
  SEARCH_SERVICE: "/booking/search-service",
  SCAN_WORKERS: "/booking/scan-workers",
  TRACKING: "/booking/tracking",
  WORKER_DETAIL: "/booking/worker-detail",
  WORKER_LIST: "/booking/worker-list",
  WORKER: (id: string) => `/booking/worker/${id}` as const,
} as const;

export const WORKERS = {
  INDEX: "/workers",
  DETAIL: (id: string) => `/workers/${id}` as const,
  FIND: "/find-workers",
  BOOKINGS: "/worker-bookings",
  SCHEDULE: "/worker-schedule",
} as const;

// ────── Projects ──────
export const PROJECTS = {
  INDEX: "/(tabs)/projects",
  CREATE: "/projects/create",
  LIBRARY: "/projects/library",
  FIND_CONTRACTORS: "/projects/find-contractors",
  QUOTATION_LIST: "/projects/quotation-list",
  DESIGN_PORTFOLIO: "/projects/design-portfolio",
  ARCHITECTURE_PORTFOLIO: "/projects/architecture-portfolio",
  CONSTRUCTION_PORTFOLIO: "/projects/construction-portfolio",
  DETAIL: (id: string) => `/projects/${id}` as const,
  TIMELINE: (id: string) => `/projects/${id}/timeline` as const,
  DOCUMENTS: (id: string) => `/projects/${id}/documents` as const,
  TASKS: (id: string) => `/projects/${id}/tasks` as const,
  TEAM: (id: string) => `/projects/${id}/team` as const,
  REPORTS: (id: string) => `/projects/${id}/reports` as const,
  PAYMENT_PROGRESS: (id: string) => `/projects/${id}/payment-progress` as const,
  DIARY: (id: string) => `/projects/${id}/diary/index` as const,
  MATERIALS: (id: string) => `/projects/${id}/materials/index` as const,
  EQUIPMENT: (id: string) => `/projects/${id}/equipment/index` as const,
  QC_INSPECTIONS: (id: string) =>
    `/projects/${id}/qc/inspections/index` as const,
  SAFETY_INCIDENTS: (id: string) =>
    `/projects/${id}/safety/incidents/index` as const,
} as const;

// ────── Construction ──────
export const CONSTRUCTION = {
  DESIGNER: "/construction/designer",
  PROGRESS: "/construction/progress",
  TRACKING: "/construction/tracking",
  BOOKING: "/construction/booking",
  PAYMENT_PROGRESS: "/construction/payment-progress",
} as const;

// ────── Budget / Finance ──────
export const BUDGET = {
  INDEX: "/budget",
  EXPENSES: "/budget/expenses",
  INVOICES: "/budget/invoices",
  REPORTS: "/budget/reports",
  ESTIMATES: "/budget/estimates",
  CREATE_EXPENSE: "/budget/create-expense",
  CREATE_INVOICE: "/budget/create-invoice",
  CREATE_BUDGET: "/budget/create-budget",
  INVOICE_DETAIL: (id: string) => `/budget/invoice/${id}` as const,
} as const;

// ────── CRM ──────
export const CRM = {
  INDEX: "/crm",
  CUSTOMERS: "/crm/customers",
  LEADS: "/crm/leads",
  CONTRACTS: "/crm/contracts",
  INVOICES: "/crm/invoices",
  PROJECTS: "/crm/projects",
  PROJECT_DETAIL: "/crm/project-detail",
  TASKS: "/crm/tasks",
  REPORTS: "/crm/reports",
  GANTT: "/crm/gantt-chart",
  MILESTONES: "/crm/milestones",
  SALES: "/crm/sales",
  SETTINGS: "/crm/settings",
  DISCUSSIONS: "/crm/discussions",
  EXPENSES: "/crm/expenses",
  FILES: "/crm/files",
  NOTES: "/crm/notes",
  STAFF: "/crm/staff",
  TIME_TRACKING: "/crm/time-tracking",
} as const;

// ────── Dashboard ──────
export const DASHBOARD = {
  INDEX: "/dashboard",
  STATS: "/dashboard/stats",
  CLIENT: "/dashboard/client",
  ADMIN: "/dashboard/admin-dashboard",
  ENGINEER: "/dashboard/engineer-dashboard",
} as const;

// ────── Admin ──────
export const ADMIN = {
  INDEX: "/admin",
  DASHBOARD: "/admin/dashboard",
  MODERATION: "/admin/moderation",
  SETTINGS: "/admin/settings",
  PERMISSIONS: "/admin/permissions",
  STAFF: "/admin/staff",
  STAFF_DETAIL: (id: string) => `/admin/staff/${id}` as const,
  STAFF_CREATE: "/admin/staff/create",
  ROLES: "/admin/roles",
  PRODUCTS: "/admin/products",
  DEPARTMENTS: "/admin/departments",
  SERVICES: "/admin/services",
  UTILITIES: "/admin/utilities",
} as const;

// ────── AI ──────
export const AI = {
  INDEX: "/ai",
  ASSISTANT: "/ai/assistant",
  CHATBOT: "/ai/chatbot",
  COST_ESTIMATOR: "/ai/cost-estimator",
  GENERATE_REPORT: "/ai/generate-report",
  MATERIAL_CHECK: "/ai/material-check",
  PHOTO_ANALYSIS: "/ai/photo-analysis",
  PROGRESS_PREDICTION: "/ai/progress-prediction",
  HUB: "/ai-hub",
  CUSTOMER_SUPPORT: "/ai-customer-support",
  ASSISTANT_CHAT: "/ai-assistant-chat",
} as const;

export const AI_DESIGN = {
  INDEX: "/ai-design",
  ARCHITECTURE: "/ai-design/architecture",
  CONSULTANT: "/ai-design/consultant",
  IMPLEMENTATION: "/ai-design/implementation",
  VISUALIZER: "/ai-design/visualizer",
  ANALYZER: "/ai-design/analyzer",
} as const;

export const AI_ARCHITECT = {
  INDEX: "/ai-architect",
  ARCHITECTURE: "/ai-architect/architecture",
  CONSULTANT: "/ai-architect/consultant",
  DESIGN: "/ai-architect/design",
  EXPORT: "/ai-architect/export",
  IMPLEMENTATION: "/ai-architect/implementation",
  TEMPLATES: "/ai-architect/templates",
  VISUALIZER: "/ai-architect/visualizer",
} as const;

// ────── Chat / Communication ──────
export const CHAT = {
  INDEX: "/chat",
  SUPPORT: "/chat/support",
  SEARCH: "/chat/search",
  DETAIL: (chatId: string) => `/chat/${chatId}` as const,
} as const;

export const CALL = {
  INDEX: "/call",
  ACTIVE: "/call/active",
  ENHANCED: "/call/enhanced",
  GROUP: "/call/group-call",
  HISTORY: "/call/history",
  UNIFIED_HISTORY: "/call/unified-history",
  VIDEO: "/call/video",
  USER: (userId: string) => `/call/${userId}` as const,
} as const;

export const COMMUNICATIONS = {
  INDEX: "/communications",
  DETAIL: (id: string) => `/communications/${id}` as const,
  CREATE_MEETING: "/communications/create-meeting",
  REVIEWS: "/communications/reviews",
} as const;

// ────── Shopping ──────
export const SHOPPING = {
  CART: "/cart",
  CHECKOUT: "/checkout",
  CHECKOUT_PAYMENT: "/checkout/payment",
  PRODUCT: (id: string) => `/product/${id}` as const,
  PRODUCT_REVIEWS: (id: string) => `/product/${id}/reviews` as const,
  CATEGORIES: "/categories",
  CATEGORY: (id: string) => `/categories/${id}` as const,
  DELIVERY_TRACKING: "/delivery-tracking",
  PAYMENT_CALLBACK: "/payment-callback",
  PAYMENT_PROGRESS: "/payment-progress",
} as const;

export const VLXD = {
  INDEX: "/vlxd",
  ORDER: "/vlxd/order",
  ORDER_SUMMARY: "/vlxd/order-summary",
  QUOTATION: "/vlxd/quotation",
  COFFA_ORDER: "/vlxd/coffa-order",
  FENCE_ORDER: "/vlxd/fence-order",
  SAMPLE_APPROVAL: "/vlxd/sample-approval",
  SUPPLIER_SELECTION: "/vlxd/supplier-selection",
} as const;

// ────── Calculators / Tools ──────
export const CALCULATORS = {
  INDEX: "/calculators",
  CONCRETE: "/calculators/concrete",
  STEEL: "/calculators/steel",
  TILES: "/calculators/tiles",
  PAINT: "/calculators/paint",
  ELECTRICAL: "/calculators/electrical",
  PLUMBING: "/calculators/plumbing",
  STRUCTURE: "/calculators/structure",
  FINISHING: "/calculators/finishing",
  MEP: "/calculators/mep",
  MATERIALS: "/calculators/materials",
  COMPARE: "/calculators/compare",
  PROJECT_ESTIMATE: "/calculators/project-estimate",
  QUICK_ESTIMATE: "/calculators/quick-estimate",
  INTERIOR_ESTIMATE: "/calculators/interior-estimate",
  TOTAL_ESTIMATE: "/calculators/total-estimate",
  PAYMENT_SCHEDULE: "/calculators/payment-schedule",
  MATERIAL_LIST: "/calculators/material-list",
  MATERIAL_MANAGEMENT: "/calculators/material-management",
  TEMPLATES: "/calculators/templates",
} as const;

export const TOOLS = {
  INDEX: "/tools",
  COLOR_PICKER: "/tools/color-picker",
  FENG_SHUI: "/tools/fengshui",
  FENG_SHUI_AI: "/tools/feng-shui-ai",
  INTERIOR_PLANNER: "/tools/interior-planner",
  LO_BAN_RULER: "/tools/lo-ban-ruler",
  PRICE_COMPARE: "/tools/price-compare",
  QR_SCANNER: "/tools/qr-scanner",
} as const;

// ────── Timeline / Schedule ──────
export const TIMELINE = {
  INDEX: "/timeline",
  PHASES: "/timeline/phases",
  CREATE_PHASE: "/timeline/create-phase",
  EDIT_PHASE: "/timeline/edit-phase",
  CRITICAL_PATH: "/timeline/critical-path",
  DEPENDENCIES: "/timeline/dependencies",
  CREATE_TASK: "/timeline/create-task",
  PHASE_DETAIL: (id: string) => `/timeline/phase/${id}` as const,
  TASK_DETAIL: (id: string) => `/timeline/task/${id}` as const,
} as const;

// ────── Quality / Safety ──────
export const QUALITY = {
  INDEX: "/quality-assurance",
  DETAIL: (id: string) => `/quality-assurance/${id}` as const,
  DEFECTS: "/quality-assurance/defects",
  INSPECTIONS: "/quality-assurance/inspections",
  INSPECTIONS_CREATE: "/quality-assurance/inspections/create",
  NCR: "/quality-assurance/ncr",
  STANDARDS: "/quality-assurance/standards",
} as const;

export const SAFETY = {
  INDEX: "/safety",
  DETAIL: (id: string) => `/safety/${id}` as const,
  INCIDENTS: "/safety/incidents",
  INCIDENT_CREATE: "/safety/incidents/create",
  INCIDENT_DETAIL: (id: string) => `/safety/incidents/${id}` as const,
  PPE: "/safety/ppe",
  PPE_DISTRIBUTIONS: "/safety/ppe/distributions",
  TRAINING: "/safety/training",
  TRAINING_SESSIONS: "/safety/training/sessions",
} as const;

// ────── Documents / Storage ──────
export const DOCUMENTS = {
  INDEX: "/documents",
  UPLOAD: "/documents/upload",
  FOLDERS: "/documents/folders",
  CREATE_FOLDER: "/documents/create-folder",
  DETAIL: "/documents/document-detail",
  SHARE: "/documents/share",
  COMMENTS: "/documents/comments",
  VERSIONS: "/documents/versions",
} as const;

export const STORAGE = {
  INDEX: "/storage",
  SETTINGS: "/storage/settings",
  FILE: (id: string) => `/storage/file/${id}` as const,
} as const;

// ────── Profile / Settings ──────
export const PROFILE = {
  INDEX: "/(tabs)/profile",
  FEEDBACK: "/feedback",
  HELP: "/help",
  FAQ: "/faq",
  WALLET: "/wallet",
  PERMISSIONS: "/permissions",
  TERMS: "/terms",
  NOTIFICATION_CENTER: "/notification-center",
  NOTIFICATION_SETTINGS: "/notification-settings",
} as const;

// ────── Social / Media ──────
export const SOCIAL = {
  INDEX: "/social",
  STORY_VIEWER: "/social/story-viewer",
  VIDEO_DISCOVERY: "/social/video-discovery",
  STORIES: "/stories",
  STORIES_CREATE: "/stories/create",
  REELS: "/reels",
  INSTAGRAM_FEED: "/instagram-feed",
  PEXELS_GALLERY: "/pexels-gallery",
  TIKTOK: "/tiktok",
  TRENDING: "/trending",
} as const;

export const VIDEOS = {
  INDEX: "/videos",
  CATEGORY: (cat: string) => `/videos/${cat}` as const,
  DEMO: "/demo-videos",
} as const;

// ────── Design Library ──────
export const DESIGN_LIBRARY = {
  INDEX: "/design-library",
  GALLERY: "/design-library/gallery",
  DETAIL: (id: string) => `/design-library/${id}` as const,
  TYPE: (type: string) => `/design-library/type/${type}` as const,
  IMAGE_LIBRARY: "/design-image-library",
} as const;

// ────── Procurement / Materials ──────
export const PROCUREMENT = {
  INDEX: "/procurement",
  CREATE: "/procurement/create",
  DETAIL: (id: string) => `/procurement/${id}` as const,
  VENDORS: "/procurement/vendors",
  VENDOR_CREATE: "/procurement/vendors/create",
  VENDOR_DETAIL: (id: string) => `/procurement/vendors/${id}` as const,
} as const;

export const MATERIALS = {
  INDEX: "/materials",
  STOCK: "/materials/stock",
  SUPPLIER: (id: string) => `/materials/supplier/${id}` as const,
  COMPARE: "/material-compare",
} as const;

// ────── Contracts ──────
export const CONTRACTS = {
  DETAIL: (id: string) => `/contracts/${id}` as const,
  MILESTONES: (id: string) => `/contracts/${id}/milestones` as const,
  SIGN: (id: string) => `/contracts/${id}/sign` as const,
} as const;

// ────── Reports / Analytics ──────
export const ANALYTICS = {
  INDEX: "/analytics",
  PROJECT: (projectId: string) => `/analytics/${projectId}` as const,
} as const;

export const DAILY_REPORT = {
  INDEX: "/daily-report",
  DETAIL: (id: string) => `/daily-report/${id}` as const,
} as const;

// ────── Misc single-route modules ──────
export const MISC = {
  SEARCH: "/search",
  SEARCH_ADVANCED: "/search/advanced",
  SEARCH_MESSAGES: "/search-messages",
  COMING_SOON: "/coming-soon",
  COMING_SOON_FEATURE: (feature: string) => `/coming-soon/${feature}` as const,
  HEALTH_CHECK: "/health-check",
  COMMUNITY_HEALTH: "/community-health-check",
  HABIT_TRACKER: "/habit-tracker",
  SCHEDULED_TASKS: "/scheduled-tasks",
  FILE_MANAGER: "/file-manager",
  FILE_UPLOAD: "/file-upload",
  CUSTOMER_SUPPORT: "/customer-support",
  QUOTE_REQUEST: "/quote-request",
  VR_PREVIEW: "/vr-preview",
  WAREHOUSE: "/warehouse",
  EVENTS: "/events",
  NEWS: "/news",
  DISCOVER: "/discover",
  TRACKING: "/tracking",
} as const;

// ────── Seller (Contractor shop management) ──────
export const SELLER = {
  DASHBOARD: "/seller/dashboard",
  PRODUCTS: "/seller/products",
  ADD_PRODUCT: "/seller/add-product",
  EDIT_PRODUCT: "/seller/edit-product",
  ORDERS: "/seller/orders",
  ORDER_DETAIL: "/seller/order-detail",
  ANALYTICS: "/seller/analytics",
  PROMOTIONS: "/seller/promotions",
  REVIEWS: "/seller/reviews",
  REVENUE: "/seller/revenue",
  SHOP_SETTINGS: "/seller/shop-settings",
} as const;

// ────── Settings ──────
export const SETTINGS = {
  INDEX: "/settings",
  LANGUAGE: "/settings/language",
  CLOUD_BACKUP: "/settings/cloud-backup",
  TWO_FACTOR: "/settings/two-factor",
  HELP: "/settings/help",
  ACCOUNT_SECURITY: "/settings/account/security",
  ACCOUNT_PRIVACY: "/settings/account/privacy",
  ACCOUNT_CHANGE_PASSWORD: "/settings/account/change-password",
  ACCOUNT_BIOMETRIC: "/settings/account/biometric",
  PREFERENCES_NOTIFICATIONS: "/settings/preferences/notifications",
  PREFERENCES_LANGUAGE: "/settings/preferences/language",
  PREFERENCES_APPEARANCE: "/settings/preferences/appearance",
  DATA_PERMISSIONS: "/settings/data/permissions",
  DATA_CONTACT_SYNC: "/settings/data/contact-sync",
  DATA_CLOUD: "/settings/data/cloud",
} as const;

// ────── Orders / Payments ──────
export const ORDERS = {
  INDEX: "/orders",
  DETAIL: (id: string) => `/orders/${id}` as const,
  REFUND: (id: string) => `/orders/${id}/refund` as const,
} as const;

export const PAYMENT = {
  BANK_TRANSFER: "/payment/bank-transfer",
  PENDING: "/payment/pending",
  SUCCESS: "/payment/success",
} as const;

// ────── Labor Management ──────
export const LABOR = {
  INDEX: "/labor",
  WORKERS: "/labor/workers",
  WORKER_DETAIL: "/labor/worker-detail",
  CREATE_WORKER: "/labor/create-worker",
  ATTENDANCE: "/labor/attendance",
  CREATE_ATTENDANCE: "/labor/create-attendance",
  PAYROLL: "/labor/payroll",
  CREATE_PAYROLL: "/labor/create-payroll",
  SHIFTS: "/labor/shifts",
  LEAVE_REQUESTS: "/labor/leave-requests",
  CREATE_LEAVE_REQUEST: "/labor/create-leave-request",
} as const;

// ────── Inventory ──────
export const INVENTORY = {
  INDEX: "/inventory",
  MATERIALS: "/inventory/materials",
  CREATE_MATERIAL: "/inventory/create-material",
  ORDERS: "/inventory/orders",
  CREATE_ORDER: "/inventory/create-order",
  SUPPLIERS: "/inventory/suppliers",
  CREATE_SUPPLIER: "/inventory/create-supplier",
} as const;

// ────── Equipment ──────
export const EQUIPMENT = {
  INDEX: "/equipment",
  DETAIL: (id: string) => `/equipment/${id}` as const,
  MAINTENANCE: "/equipment/maintenance",
} as const;

// ────── Weather ──────
export const WEATHER = {
  INDEX: "/weather",
  DASHBOARD: "/weather/dashboard",
  ALERTS: "/weather/alerts",
  STOPPAGES: "/weather/stoppages",
} as const;

// ────── Construction Management (extended) ──────
export const CHANGE_MANAGEMENT = {
  INDEX: "/change-management",
  CREATE: "/change-management/create",
  ORDERS: "/change-management/orders",
} as const;

export const CHANGE_ORDER = {
  INDEX: "/change-order",
  DETAIL: (id: string) => `/change-order/${id}` as const,
} as const;

export const CONSTRUCTION_PROGRESS = {
  INDEX: "/construction-progress",
  CREATE: "/construction-progress/create",
  MINDMAP: "/construction-progress/mindmap",
  DETAIL: (id: string) => `/construction-progress/${id}` as const,
  EDIT: (id: string) => `/construction-progress/${id}/edit` as const,
  REVIEW: (id: string) => `/construction-progress/${id}/review` as const,
} as const;

// ────── Warranty ──────
export const WARRANTY = {
  INDEX: "/warranty",
  DETAIL: (id: string) => `/warranty/${id}` as const,
} as const;

// ────── Risk ──────
export const RISK = {
  INDEX: "/risk",
  MITIGATION: "/risk/mitigation",
} as const;

// ────── Inspection ──────
export const INSPECTION = {
  INDEX: "/inspection",
  TESTS: "/inspection/tests",
} as const;

// ────── Meeting Minutes ──────
export const MEETING_MINUTES = {
  INDEX: "/meeting-minutes",
  DETAIL: (id: string) => `/meeting-minutes/${id}` as const,
} as const;

// ────── Document Control ──────
export const DOCUMENT_CONTROL = {
  INDEX: "/document-control",
  DETAIL: (id: string) => `/document-control/${id}` as const,
} as const;

// ────── As-Built ──────
export const AS_BUILT = {
  INDEX: "/as-built",
  DETAIL: (id: string) => `/as-built/${id}` as const,
} as const;

// ────── Commissioning ──────
export const COMMISSIONING = {
  INDEX: "/commissioning",
  DETAIL: (id: string) => `/commissioning/${id}` as const,
} as const;

// ────── OM Manuals ──────
export const OM_MANUALS = {
  INDEX: "/om-manuals",
  DETAIL: (id: string) => `/om-manuals/${id}` as const,
} as const;

// ────── Handbook ──────
export const HANDBOOK = {
  INDEX: "/handbook",
  CALCULATOR: "/handbook/calculator",
  REFERENCE: "/handbook/reference",
  CATEGORY: (id: string) => `/handbook/${id}` as const,
} as const;

// ────── Fleet ──────
export const FLEET = {
  INDEX: "/fleet",
  DETAIL: (id: string) => `/fleet/${id}` as const,
} as const;

// ────── Submittal ──────
export const SUBMITTAL = {
  INDEX: "/submittal",
  DETAIL: (id: string) => `/submittal/${id}` as const,
} as const;

// ────── Loyalty ──────
export const LOYALTY = {
  INDEX: "/loyalty",
} as const;

// ────── Legal ──────
export const LEGAL = {
  INDEX: "/legal",
  ABOUT_US: "/legal/about-us",
  FAQ: "/legal/faq",
  PRIVACY_POLICY: "/legal/privacy-policy",
  TERMS_OF_SERVICE: "/legal/terms-of-service",
} as const;

// ────── Reviews ──────
export const REVIEWS = {
  INDEX: "/reviews",
  PRODUCT: (id: string) => `/reviews/${id}` as const,
  CREATE: "/reviews/create",
} as const;

// ────── Messages (root) ──────
export const MESSAGES = {
  INDEX: "/messages",
  USER: (userId: string) => `/messages/${userId}` as const,
  CONTACTS: "/messages/contacts",
  GROUPS: "/messages/groups",
  CREATE_GROUP: "/messages/create-group",
  UNIFIED: "/messages/unified",
  REALTIME: "/messages/realtime-chat",
  NEW_CONVERSATION: "/messages/new-conversation",
  ADD_CONTACT: "/messages/add-contact",
} as const;

// ────── Live (root) ──────
export const LIVE = {
  INDEX: "/live",
  STREAM: (id: string) => `/live/${id}` as const,
  BROADCASTER: "/live/broadcaster",
  CREATE: "/live/create",
  VIEWER: "/live/viewer",
} as const;

// ────── Consultation ──────
export const CONSULTATION = {
  INDEX: "/consultation",
  DESIGN_PROCESS: "/consultation/design-process",
  KTS_FORM: "/consultation/kts-form",
} as const;

// ────── Service Booking (worker map, tracking, reviews) ──────
export const SERVICE_BOOKING = {
  INDEX: "/service-booking",
  BOOKING_STEPS: "/service-booking/booking-steps",
  CONFIRM_BOOKING: "/service-booking/confirm-booking",
  WORKER_MAP: "/service-booking/worker-map",
  WORKER_REVIEW: "/service-booking/worker-review",
  WRITE_REVIEW: "/service-booking/write-review",
  SCHEDULE: "/service-booking/schedule",
  LIVE_TRACKING: "/service-booking/live-tracking",
  VEHICLE_TRACKING: "/service-booking/vehicle-tracking",
  WORKER_ROUTE_TRACKING: "/service-booking/worker-route-tracking",
  ACTIVE_TRACKINGS: "/service-booking/active-trackings",
  TRACKING_HISTORY: "/service-booking/tracking-history",
  DETAIL: (id: string) => `/service-booking/${id}` as const,
} as const;

// ────── Convenience: all route modules in one object ──────
export const R = {
  AUTH,
  ENTRY,
  TABS,
  SERVICES,
  UTILITIES,
  FINISHING,
  BOOKING,
  WORKERS,
  PROJECTS,
  CONSTRUCTION,
  BUDGET,
  CRM,
  DASHBOARD,
  ADMIN,
  AI,
  AI_DESIGN,
  AI_ARCHITECT,
  CHAT,
  CALL,
  COMMUNICATIONS,
  SHOPPING,
  VLXD,
  CALCULATORS,
  TOOLS,
  TIMELINE,
  QUALITY,
  SAFETY,
  DOCUMENTS,
  STORAGE,
  PROFILE,
  SOCIAL,
  VIDEOS,
  DESIGN_LIBRARY,
  PROCUREMENT,
  MATERIALS,
  CONTRACTS,
  ANALYTICS,
  DAILY_REPORT,
  MISC,
  SELLER,
  SETTINGS,
  ORDERS,
  PAYMENT,
  LABOR,
  INVENTORY,
  EQUIPMENT,
  WEATHER,
  CHANGE_MANAGEMENT,
  CHANGE_ORDER,
  CONSTRUCTION_PROGRESS,
  WARRANTY,
  RISK,
  INSPECTION,
  MEETING_MINUTES,
  DOCUMENT_CONTROL,
  AS_BUILT,
  COMMISSIONING,
  OM_MANUALS,
  HANDBOOK,
  FLEET,
  SUBMITTAL,
  LOYALTY,
  LEGAL,
  REVIEWS,
  MESSAGES,
  LIVE,
  CONSULTATION,
  SERVICE_BOOKING,
} as const;

export default R;
