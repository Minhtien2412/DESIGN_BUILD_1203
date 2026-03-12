/**
 * Centralized App Routes Configuration
 * Complete sitemap of all available routes in the application
 */

export interface RouteItem {
  path: string;
  title: string;
  description?: string;
  icon?: string;
  category: RouteCategory;
  requiresAuth?: boolean;
  requiresProject?: boolean;
  hidden?: boolean;
}

export type RouteCategory = 
  | 'auth'
  | 'main'
  | 'construction'
  | 'project'
  | 'management'
  | 'admin'
  | 'services'
  | 'utilities'
  | 'shopping'
  | 'communication'
  | 'profile'
  | 'legal';

/**
 * Authentication Routes
 */
export const AUTH_ROUTES: RouteItem[] = [
  { path: '/(auth)/login', title: 'Đăng nhập', icon: 'log-in', category: 'auth' },
  { path: '/(auth)/register', title: 'Đăng ký', icon: 'person-add', category: 'auth' },
  { path: '/(auth)/forgot-password', title: 'Quên mật khẩu', icon: 'key', category: 'auth' },
  { path: '/(auth)/reset-password', title: 'Đặt lại mật khẩu', icon: 'refresh', category: 'auth' },
];

/**
 * Main Tab Routes
 */
export const MAIN_TAB_ROUTES: RouteItem[] = [
  { path: '/', title: 'Trang chủ', icon: 'home', category: 'main', requiresAuth: false },
  { path: '/(tabs)/projects', title: 'Dự án', icon: 'folder-open', category: 'main', requiresAuth: true },
  { path: '/(tabs)/live', title: 'Live Stream', icon: 'videocam', category: 'main', requiresAuth: false },
  { path: '/(tabs)/notifications', title: 'Thông báo', icon: 'notifications', category: 'main', requiresAuth: true },
  { path: '/(tabs)/notifications-timeline', title: 'Timeline thông báo', icon: 'time', category: 'main', requiresAuth: true },
  { path: '/(tabs)/profile', title: 'Hồ sơ', icon: 'person', category: 'main', requiresAuth: true },
  { path: '/(tabs)/profile-new', title: 'Hồ sơ mới', icon: 'person-circle', category: 'main', requiresAuth: true },
  { path: '/(tabs)/menu', title: 'Menu tiện ích', icon: 'grid', category: 'main', requiresAuth: false },
  { path: '/(tabs)/cart', title: 'Giỏ hàng', icon: 'cart', category: 'main', requiresAuth: false },
  { path: '/(tabs)/activity', title: 'Hoạt động', icon: 'pulse', category: 'main', requiresAuth: true },
];

/**
 * Construction Project Routes
 */
export const CONSTRUCTION_ROUTES: RouteItem[] = [
  { path: '/construction/designer', title: 'Thiết kế công trình', icon: 'color-palette', category: 'construction' },
  { path: '/construction/progress', title: 'Tiến độ xây dựng', icon: 'stats-chart', category: 'construction' },
  { path: '/construction/tracking', title: 'Theo dõi thi công', icon: 'eye', category: 'construction' },
  { path: '/construction/booking', title: 'Đặt lịch thi công', icon: 'calendar', category: 'construction' },
  { path: '/construction/utilities', title: 'Tiện ích xây dựng', icon: 'build', category: 'construction' },
  { path: '/construction/payment-progress', title: 'Tiến độ thanh toán', icon: 'card', category: 'construction' },
  { path: '/construction/villa-progress', title: 'Tiến độ biệt thự', icon: 'home', category: 'construction' },
  { path: '/construction/progress-tracking', title: 'Tracking tiến độ', icon: 'analytics', category: 'construction' },
];

/**
 * Project Management Routes (Dynamic [id])
 */
export const PROJECT_ROUTES: RouteItem[] = [
  // Main project screens
  { path: '/projects/[id]', title: 'Chi tiết dự án', icon: 'document-text', category: 'project', requiresProject: true },
  { path: '/projects/[id]/timeline', title: 'Timeline dự án', icon: 'git-branch', category: 'project', requiresProject: true },
  { path: '/projects/[id]/construction-timeline', title: 'Timeline thi công', icon: 'time', category: 'project', requiresProject: true },
  { path: '/projects/[id]/workflow-map', title: 'Workflow Map', icon: 'map', category: 'project', requiresProject: true },
  { path: '/projects/[id]/documents', title: 'Tài liệu dự án', icon: 'folder', category: 'project', requiresProject: true },
  { path: '/projects/[id]/tasks', title: 'Công việc', icon: 'checkmark-done', category: 'project', requiresProject: true },
  { path: '/projects/[id]/team', title: 'Đội ngũ', icon: 'people', category: 'project', requiresProject: true },
  { path: '/projects/[id]/reports', title: 'Báo cáo', icon: 'document', category: 'project', requiresProject: true },
  { path: '/projects/[id]/payment-progress', title: 'Tiến độ thanh toán', icon: 'cash', category: 'project', requiresProject: true },
  
  // Diary routes
  { path: '/projects/[id]/diary/index', title: 'Nhật ký thi công', icon: 'book', category: 'project', requiresProject: true },
  { path: '/projects/[id]/diary/create', title: 'Tạo nhật ký', icon: 'add-circle', category: 'project', requiresProject: true },
  { path: '/projects/[id]/diary/[entryId]/edit', title: 'Sửa nhật ký', icon: 'create', category: 'project', requiresProject: true },
  
  // Materials routes
  { path: '/projects/[id]/materials/index', title: 'Vật liệu', icon: 'cube', category: 'project', requiresProject: true },
  { path: '/projects/[id]/materials/requests/index', title: 'Yêu cầu vật liệu', icon: 'list', category: 'project', requiresProject: true },
  { path: '/projects/[id]/materials/requests/create', title: 'Tạo yêu cầu VL', icon: 'add', category: 'project', requiresProject: true },
  
  // Equipment routes
  { path: '/projects/[id]/equipment/index', title: 'Thiết bị', icon: 'hardware-chip', category: 'project', requiresProject: true },
  { path: '/projects/[id]/equipment/bookings/index', title: 'Đặt thiết bị', icon: 'calendar', category: 'project', requiresProject: true },
  { path: '/projects/[id]/equipment/bookings/create', title: 'Tạo đặt chỗ TB', icon: 'add-circle', category: 'project', requiresProject: true },
  
  // QC/QA routes
  { path: '/projects/[id]/qc/inspections/index', title: 'Kiểm tra chất lượng', icon: 'checkmark-circle', category: 'project', requiresProject: true },
  { path: '/projects/[id]/qc/inspections/[inspectionId]/perform', title: 'Thực hiện kiểm tra', icon: 'clipboard', category: 'project', requiresProject: true },
  { path: '/projects/[id]/qc/defects/index', title: 'Khuyết tật', icon: 'warning', category: 'project', requiresProject: true },
  
  // Safety routes
  { path: '/projects/[id]/safety/incidents/index', title: 'Sự cố an toàn', icon: 'alert-circle', category: 'project', requiresProject: true },
  { path: '/projects/[id]/safety/checklists/index', title: 'Checklist an toàn', icon: 'list-circle', category: 'project', requiresProject: true },
  { path: '/projects/[id]/safety/hazards/index', title: 'Nguy cơ an toàn', icon: 'shield', category: 'project', requiresProject: true },
  
  // Process detail
  { path: '/projects/[id]/process-detail/[processId]', title: 'Chi tiết quy trình', icon: 'information-circle', category: 'project', requiresProject: true },
];

/**
 * Project Listing Routes
 */
export const PROJECT_LISTING_ROUTES: RouteItem[] = [
  { path: '/projects/create', title: 'Tạo dự án mới', icon: 'add-circle', category: 'project', requiresAuth: true },
  { path: '/projects/library', title: 'Thư viện dự án', icon: 'library', category: 'project' },
  { path: '/projects/find-contractors', title: 'Tìm nhà thầu', icon: 'search', category: 'project' },
  { path: '/projects/quotation-list', title: 'Danh sách báo giá', icon: 'receipt', category: 'project' },
  { path: '/projects/design-portfolio', title: 'Portfolio thiết kế', icon: 'images', category: 'project' },
  { path: '/projects/architecture-portfolio', title: 'Portfolio kiến trúc', icon: 'business', category: 'project' },
  { path: '/projects/construction-portfolio', title: 'Portfolio xây dựng', icon: 'construct', category: 'project' },
  { path: '/projects/work-detail', title: 'Chi tiết công việc', icon: 'document-text', category: 'project' },
  { path: '/projects/[id]-new', title: 'Dự án mới', icon: 'sparkles', category: 'project' },
  { path: '/projects/[id]-detail', title: 'Chi tiết DA', icon: 'information', category: 'project' },
  { path: '/projects/architecture/[id]', title: 'Kiến trúc DA', icon: 'business', category: 'project' },
];

/**
 * Management & Admin Routes
 */
export const MANAGEMENT_ROUTES: RouteItem[] = [
  // Dashboards
  { path: '/dashboard/admin', title: 'Dashboard Admin', icon: 'speedometer', category: 'admin', requiresAuth: true },
  { path: '/dashboard/admin-enhanced', title: 'Admin nâng cao', icon: 'rocket', category: 'admin', requiresAuth: true },
  { path: '/dashboard/client', title: 'Dashboard Khách hàng', icon: 'person', category: 'admin', requiresAuth: true },
  { path: '/dashboard/client-enhanced', title: 'KH nâng cao', icon: 'star', category: 'admin', requiresAuth: true },
  { path: '/dashboard/engineer', title: 'Dashboard Kỹ sư', icon: 'construct', category: 'admin', requiresAuth: true },
  { path: '/dashboard/engineer-enhanced', title: 'KS nâng cao', icon: 'hammer', category: 'admin', requiresAuth: true },
  
  // Budget & Finance
  { path: '/budget/index', title: 'Ngân sách', icon: 'cash', category: 'management' },
  { path: '/budget/expenses', title: 'Chi phí', icon: 'receipt', category: 'management' },
  { path: '/budget/create-expense', title: 'Tạo chi phí', icon: 'add', category: 'management' },
  { path: '/budget/invoices', title: 'Hóa đơn', icon: 'document', category: 'management' },
  { path: '/budget/create-invoice', title: 'Tạo hóa đơn', icon: 'create', category: 'management' },
  
  // Timeline & Planning
  { path: '/timeline/index', title: 'Timeline', icon: 'git-network', category: 'management' },
  { path: '/timeline/create-phase', title: 'Tạo giai đoạn', icon: 'add-circle', category: 'management' },
  { path: '/timeline/create-task', title: 'Tạo công việc', icon: 'checkbox', category: 'management' },
  { path: '/timeline/phases', title: 'Các giai đoạn', icon: 'layers', category: 'management' },
  { path: '/timeline/critical-path', title: 'Đường găng', icon: 'git-branch', category: 'management' },
  { path: '/timeline/dependencies', title: 'Phụ thuộc', icon: 'git-network', category: 'management' },
  
  // Inventory
  { path: '/inventory/index', title: 'Kho hàng', icon: 'cube', category: 'management' },
  { path: '/inventory/materials', title: 'Vật liệu kho', icon: 'layers', category: 'management' },
  { path: '/inventory/create-material', title: 'Thêm vật liệu', icon: 'add', category: 'management' },
  { path: '/inventory/orders', title: 'Đơn hàng', icon: 'cart', category: 'management' },
  { path: '/inventory/create-order', title: 'Tạo đơn hàng', icon: 'create', category: 'management' },
  
  // Labor Management
  { path: '/labor/index', title: 'Nhân công', icon: 'people', category: 'management' },
  { path: '/labor/workers', title: 'Công nhân', icon: 'person', category: 'management' },
  { path: '/labor/create-worker', title: 'Thêm công nhân', icon: 'person-add', category: 'management' },
  { path: '/labor/create-attendance', title: 'Điểm danh', icon: 'checkmark-circle', category: 'management' },
  { path: '/labor/create-leave-request', title: 'Đơn nghỉ phép', icon: 'calendar', category: 'management' },
  { path: '/labor/payroll', title: 'Lương', icon: 'cash', category: 'management' },
  { path: '/labor/create-payroll', title: 'Tạo bảng lương', icon: 'add-circle', category: 'management' },
  
  // Documents
  { path: '/documents/upload', title: 'Upload tài liệu', icon: 'cloud-upload', category: 'management' },
  { path: '/documents/folders', title: 'Thư mục', icon: 'folder', category: 'management' },
  { path: '/documents/document-detail', title: 'Chi tiết TL', icon: 'document-text', category: 'management' },
  { path: '/documents/versions', title: 'Phiên bản', icon: 'git-branch', category: 'management' },
  { path: '/documents/share', title: 'Chia sẻ', icon: 'share-social', category: 'management' },
  { path: '/documents/comments', title: 'Bình luận', icon: 'chatbubbles', category: 'management' },
  
  // Contracts
  { path: '/contracts/create', title: 'Tạo hợp đồng', icon: 'create', category: 'management' },
  { path: '/contracts/[id]/sign', title: 'Ký hợp đồng', icon: 'pencil', category: 'management' },
  { path: '/contracts/[id]/milestones', title: 'Mốc thanh toán', icon: 'flag', category: 'management' },
  
  // Reports
  { path: '/reports/index', title: 'Báo cáo', icon: 'document', category: 'management' },
  { path: '/reports/kpi', title: 'KPI', icon: 'stats-chart', category: 'management' },
];

/**
 * Quality & Safety Routes
 */
export const QUALITY_SAFETY_ROUTES: RouteItem[] = [
  // QC/QA
  { path: '/qc-qa/index', title: 'QC/QA', icon: 'checkmark-circle', category: 'management' },
  { path: '/quality-assurance/index', title: 'Đảm bảo chất lượng', icon: 'shield-checkmark', category: 'management' },
  { path: '/quality-assurance/[id]', title: 'Chi tiết QA', icon: 'shield', category: 'management' },
  { path: '/inspection/index', title: 'Kiểm tra', icon: 'search', category: 'management' },
  { path: '/inspection/tests', title: 'Thử nghiệm', icon: 'flask', category: 'management' },
  
  // Safety
  { path: '/safety/index', title: 'An toàn', icon: 'shield', category: 'management' },
  { path: '/safety/[id]', title: 'Chi tiết AT', icon: 'shield-checkmark', category: 'management' },
  { path: '/safety/incidents/index', title: 'Sự cố', icon: 'alert-circle', category: 'management' },
  { path: '/safety/incidents/[id]', title: 'Chi tiết sự cố', icon: 'warning', category: 'management' },
  { path: '/safety/ppe/index', title: 'PPE', icon: 'fitness', category: 'management' },
  { path: '/safety/ppe/distributions', title: 'Phân phối PPE', icon: 'gift', category: 'management' },
  { path: '/safety/training/index', title: 'Đào tạo AT', icon: 'school', category: 'management' },
  { path: '/safety/training/sessions', title: 'Buổi đào tạo', icon: 'calendar', category: 'management' },
  
  // Punch List & As-Built
  { path: '/punch-list/index', title: 'Punch List', icon: 'list', category: 'management' },
  { path: '/punch-list/[id]', title: 'Chi tiết Punch', icon: 'create', category: 'management' },
  { path: '/as-built/index', title: 'As-Built', icon: 'layers-outline', category: 'management' },
  { path: '/as-built/[id]', title: 'Chi tiết As-Built', icon: 'document', category: 'management' },
];

/**
 * Advanced Features
 */
export const ADVANCED_ROUTES: RouteItem[] = [
  // Document Control
  { path: '/document-control/index', title: 'Kiểm soát TL', icon: 'folder-open', category: 'management' },
  { path: '/document-control/[id]', title: 'Chi tiết kiểm soát', icon: 'document-text', category: 'management' },
  
  // Change Management
  { path: '/change-management/index', title: 'Quản lý thay đổi', icon: 'swap-horizontal', category: 'management' },
  { path: '/change-management/orders', title: 'Lệnh thay đổi', icon: 'create', category: 'management' },
  { path: '/change-order/index', title: 'Change Order', icon: 'refresh', category: 'management' },
  { path: '/change-order/[id]', title: 'Chi tiết CO', icon: 'information-circle', category: 'management' },
  
  // RFI & Submittal
  { path: '/rfi/index', title: 'RFI', icon: 'help-circle', category: 'management' },
  { path: '/rfi/[id]', title: 'Chi tiết RFI', icon: 'chatbubble-ellipses', category: 'management' },
  { path: '/submittal/index', title: 'Submittal', icon: 'document-attach', category: 'management' },
  { path: '/submittal/[id]', title: 'Chi tiết Submittal', icon: 'attach', category: 'management' },
  
  // Daily Report & Meeting Minutes
  { path: '/daily-report/index', title: 'Báo cáo ngày', icon: 'today', category: 'management' },
  { path: '/daily-report/[id]', title: 'Chi tiết BC ngày', icon: 'document-text', category: 'management' },
  { path: '/meeting-minutes/index', title: 'Biên bản họp', icon: 'people-circle', category: 'management' },
  { path: '/meeting-minutes/[id]', title: 'Chi tiết biên bản', icon: 'clipboard', category: 'management' },
  
  // Commissioning & Warranty
  { path: '/commissioning/index', title: 'Nghiệm thu', icon: 'checkmark-done-circle', category: 'management' },
  { path: '/commissioning/[id]', title: 'Chi tiết nghiệm thu', icon: 'checkbox-outline', category: 'management' },
  { path: '/warranty/index', title: 'Bảo hành', icon: 'shield-checkmark', category: 'management' },
  { path: '/warranty/[id]', title: 'Chi tiết bảo hành', icon: 'shield', category: 'management' },
  
  // O&M Manuals
  { path: '/om-manuals/index', title: 'Tài liệu O&M', icon: 'book', category: 'management' },
  { path: '/om-manuals/[id]', title: 'Chi tiết O&M', icon: 'reader', category: 'management' },
];

/**
 * Resource Planning & Procurement
 */
export const RESOURCE_ROUTES: RouteItem[] = [
  { path: '/resource-planning/index', title: 'Lập kế hoạch TN', icon: 'calendar', category: 'management' },
  { path: '/resource-planning/resources', title: 'Tài nguyên', icon: 'cube-outline', category: 'management' },
  { path: '/procurement/index', title: 'Mua sắm', icon: 'cart-outline', category: 'management' },
  { path: '/procurement/vendors', title: 'Nhà cung cấp', icon: 'business', category: 'management' },
  { path: '/procurement/[id]', title: 'Chi tiết mua sắm', icon: 'receipt-outline', category: 'management' },
  
  // Equipment & Fleet
  { path: '/equipment/index', title: 'Thiết bị', icon: 'hardware-chip', category: 'management' },
  { path: '/equipment/maintenance', title: 'Bảo trì TB', icon: 'build', category: 'management' },
  { path: '/fleet/index', title: 'Xe cộ', icon: 'car', category: 'management' },
  { path: '/fleet/[id]', title: 'Chi tiết xe', icon: 'car-sport', category: 'management' },
  
  // Materials
  { path: '/materials/index', title: 'Vật liệu', icon: 'cube', category: 'management' },
  { path: '/materials/supplier/[id]', title: 'NCC vật liệu', icon: 'business-outline', category: 'management' },
];

/**
 * Risk & Environmental
 */
export const RISK_ENV_ROUTES: RouteItem[] = [
  { path: '/risk/index', title: 'Quản lý rủi ro', icon: 'warning-outline', category: 'management' },
  { path: '/risk/mitigation', title: 'Giảm thiểu RR', icon: 'shield-half', category: 'management' },
  { path: '/environmental/index', title: 'Môi trường', icon: 'leaf', category: 'management' },
  { path: '/environmental/[id]', title: 'Chi tiết MT', icon: 'earth', category: 'management' },
  { path: '/weather/alerts', title: 'Cảnh báo thời tiết', icon: 'thunderstorm', category: 'management' },
  { path: '/weather/dashboard', title: 'Dashboard thời tiết', icon: 'cloud', category: 'management' },
  { path: '/weather/stoppages', title: 'Ngừng do thời tiết', icon: 'pause-circle', category: 'management' },
];

/**
 * Communication Routes
 */
export const COMMUNICATION_ROUTES: RouteItem[] = [
  { path: '/messages/index', title: 'Tin nhắn', icon: 'chatbubbles', category: 'communication' },
  { path: '/messages/[userId]', title: 'Chat', icon: 'chatbubble-ellipses', category: 'communication' },
  { path: '/messages/chat/[id]', title: 'Cuộc trò chuyện', icon: 'chatbubble', category: 'communication' },
  { path: '/communications/index', title: 'Truyền thông', icon: 'megaphone', category: 'communication' },
  { path: '/communications/[id]', title: 'Chi tiết TT', icon: 'information-circle', category: 'communication' },
  { path: '/communications/create-meeting', title: 'Tạo cuộc họp', icon: 'videocam', category: 'communication' },
  { path: '/communications/reviews', title: 'Đánh giá', icon: 'star', category: 'communication' },
  
  // Call & Video
  { path: '/call/history', title: 'Lịch sử cuộc gọi', icon: 'time', category: 'communication' },
  { path: '/call/video-call', title: 'Gọi video', icon: 'videocam', category: 'communication' },
  
  // Live streaming
  { path: '/live/create', title: 'Tạo Live', icon: 'radio', category: 'communication' },
  { path: '/live/[id]', title: 'Live Stream', icon: 'play-circle', category: 'communication' },
  
  // Stories
  { path: '/stories/[userId]', title: 'Stories', icon: 'images', category: 'communication' },
];

/**
 * Services Routes
 */
export const SERVICES_ROUTES: RouteItem[] = [
  { path: '/services/index', title: 'Dịch vụ', icon: 'briefcase', category: 'services' },
  { path: '/services/house-design', title: 'Thiết kế nhà', icon: 'home', category: 'services' },
  { path: '/services/interior-design', title: 'Thiết kế nội thất', icon: 'bed', category: 'services' },
  { path: '/services/construction-lookup', title: 'Tra cứu XD', icon: 'search', category: 'services' },
  { path: '/services/permit', title: 'Xin phép', icon: 'document-text', category: 'services' },
  { path: '/services/sample-docs', title: 'Hồ sơ mẫu', icon: 'folder-open', category: 'services' },
  { path: '/services/feng-shui', title: 'Phong thủy', icon: 'compass', category: 'services' },
  { path: '/services/color-chart', title: 'Bảng màu', icon: 'color-palette', category: 'services' },
  { path: '/services/color-trends', title: 'Xu hướng màu', icon: 'trending-up', category: 'services' },
  { path: '/services/quality-consulting', title: 'Tư vấn chất lượng', icon: 'ribbon', category: 'services' },
  { path: '/services/quality-supervision', title: 'Giám sát CL', icon: 'eye', category: 'services' },
  { path: '/services/construction-company', title: 'Công ty XD', icon: 'business', category: 'services' },
  { path: '/services/company-detail', title: 'Chi tiết công ty', icon: 'information-circle', category: 'services' },
  { path: '/services/design-calculator', title: 'Máy tính thiết kế', icon: 'calculator', category: 'services' },
  { path: '/services/materials-catalog', title: 'Catalog vật liệu', icon: 'book', category: 'services' },
  
  // AI Assistant
  { path: '/services/ai-assistant/index', title: 'Trợ lý AI', icon: 'sparkles', category: 'services' },
  { path: '/services/ai-assistant/history', title: 'Lịch sử AI', icon: 'time', category: 'services' },
  { path: '/services/ai-assistant/photo-analysis', title: 'Phân tích ảnh', icon: 'image', category: 'services' },
  { path: '/services/ai-assistant/error-detection', title: 'Phát hiện lỗi', icon: 'bug', category: 'services' },
  { path: '/services/ai-assistant/progress-report', title: 'BC tiến độ AI', icon: 'stats-chart', category: 'services' },
  { path: '/services/ai-assistant/material-estimation', title: 'Dự toán VL AI', icon: 'calculator', category: 'services' },
];

/**
 * Utilities Routes
 */
export const UTILITIES_ROUTES: RouteItem[] = [
  { path: '/utilities/ep-coc', title: 'Ép cọc', icon: 'construct', category: 'utilities' },
  { path: '/utilities/dao-dat', title: 'Đào đất', icon: 'hammer', category: 'utilities' },
  { path: '/utilities/be-tong', title: 'Bê tông', icon: 'cube', category: 'utilities' },
  { path: '/utilities/vat-lieu', title: 'Vật liệu', icon: 'layers', category: 'utilities' },
  { path: '/utilities/nhan-cong', title: 'Nhân công', icon: 'people', category: 'utilities' },
  { path: '/utilities/tho-xay', title: 'Thợ xây', icon: 'person', category: 'utilities' },
  { path: '/utilities/tho-coffa', title: 'Thợ cốp pha', icon: 'person-add', category: 'utilities' },
  { path: '/utilities/tho-dien-nuoc', title: 'Thợ điện nước', icon: 'flash', category: 'utilities' },
  { path: '/utilities/design-team', title: 'Đội thiết kế', icon: 'people-circle', category: 'utilities' },
  { path: '/utilities/cost-estimator', title: 'Dự toán chi phí', icon: 'calculator', category: 'utilities' },
  { path: '/utilities/quote-request', title: 'Yêu cầu báo giá', icon: 'receipt', category: 'utilities' },
  { path: '/utilities/store-locator', title: 'Tìm cửa hàng', icon: 'location', category: 'utilities' },
  { path: '/utilities/my-qr-code', title: 'Mã QR của tôi', icon: 'qr-code', category: 'utilities' },
  { path: '/utilities/qr-scanner', title: 'Quét QR', icon: 'scan', category: 'utilities' },
  { path: '/utilities/history', title: 'Lịch sử', icon: 'time', category: 'utilities' },
  { path: '/utilities/schedule', title: 'Lịch trình', icon: 'calendar-outline', category: 'utilities' },
  { path: '/utilities/[slug]', title: 'Tiện ích', icon: 'apps', category: 'utilities' },
];

/**
 * Finishing Work Routes
 */
export const FINISHING_ROUTES: RouteItem[] = [
  { path: '/finishing/lat-gach', title: 'Lát gạch', icon: 'grid', category: 'utilities' },
  { path: '/finishing/son', title: 'Sơn', icon: 'color-fill', category: 'utilities' },
  { path: '/finishing/da', title: 'Đá', icon: 'diamond', category: 'utilities' },
  { path: '/finishing/thach-cao', title: 'Thạch cao', icon: 'square', category: 'utilities' },
  { path: '/finishing/lam-cua', title: 'Làm cửa', icon: 'enter', category: 'utilities' },
  { path: '/finishing/lan-can', title: 'Lan can', icon: 'reorder-four', category: 'utilities' },
  { path: '/finishing/camera', title: 'Camera', icon: 'camera', category: 'utilities' },
  { path: '/finishing/tho-tong-hop', title: 'Thợ tổng hợp', icon: 'people-outline', category: 'utilities' },
];

/**
 * Shopping Routes
 */
export const SHOPPING_ROUTES: RouteItem[] = [
  { path: '/shopping/index', title: 'Mua sắm', icon: 'cart', category: 'shopping' },
  { path: '/product/[id]', title: 'Chi tiết SP', icon: 'cube', category: 'shopping' },
  { path: '/product/[id]/reviews', title: 'Đánh giá SP', icon: 'star', category: 'shopping' },
  { path: '/checkout/index', title: 'Thanh toán', icon: 'card', category: 'shopping' },
  { path: '/checkout/shipping', title: 'Vận chuyển', icon: 'car', category: 'shopping' },
  { path: '/checkout/payment', title: 'Thanh toán', icon: 'cash', category: 'shopping' },
  { path: '/checkout/review', title: 'Xem lại đơn', icon: 'eye', category: 'shopping' },
  { path: '/checkout/success', title: 'Thành công', icon: 'checkmark-circle', category: 'shopping' },
  
  // Food ordering
  { path: '/food/index', title: 'Đồ ăn', icon: 'restaurant', category: 'shopping' },
  { path: '/food/restaurant/[id]', title: 'Nhà hàng', icon: 'storefront', category: 'shopping' },
  { path: '/food/order-tracking', title: 'Theo dõi đơn', icon: 'bicycle', category: 'shopping' },
];

/**
 * Profile Routes
 */
export const PROFILE_ROUTES: RouteItem[] = [
  { path: '/profile/edit', title: 'Sửa hồ sơ', icon: 'create', category: 'profile', requiresAuth: true },
  { path: '/profile/info', title: 'Thông tin', icon: 'information-circle', category: 'profile', requiresAuth: true },
  { path: '/profile/settings', title: 'Cài đặt', icon: 'settings', category: 'profile', requiresAuth: true },
  { path: '/profile/security', title: 'Bảo mật', icon: 'shield', category: 'profile', requiresAuth: true },
  { path: '/profile/privacy', title: 'Riêng tư', icon: 'lock-closed', category: 'profile', requiresAuth: true },
  { path: '/profile/notifications', title: 'Thông báo', icon: 'notifications', category: 'profile', requiresAuth: true },
  { path: '/profile/payment', title: 'Thanh toán', icon: 'card', category: 'profile', requiresAuth: true },
  { path: '/profile/payment-methods', title: 'PT thanh toán', icon: 'wallet', category: 'profile', requiresAuth: true },
  { path: '/profile/payment-history', title: 'Lịch sử TT', icon: 'time', category: 'profile', requiresAuth: true },
  { path: '/profile/addresses', title: 'Địa chỉ', icon: 'location', category: 'profile', requiresAuth: true },
  { path: '/profile/orders', title: 'Đơn hàng', icon: 'receipt', category: 'profile', requiresAuth: true },
  { path: '/profile/history', title: 'Lịch sử', icon: 'time-outline', category: 'profile', requiresAuth: true },
  { path: '/profile/favorites', title: 'Yêu thích', icon: 'heart', category: 'profile', requiresAuth: true },
  { path: '/profile/reviews', title: 'Đánh giá', icon: 'star', category: 'profile', requiresAuth: true },
  { path: '/profile/rewards', title: 'Phần thưởng', icon: 'gift', category: 'profile', requiresAuth: true },
  { path: '/profile/vouchers', title: 'Voucher', icon: 'pricetag', category: 'profile', requiresAuth: true },
  { path: '/profile/help', title: 'Trợ giúp', icon: 'help-circle', category: 'profile' },
  { path: '/profile/cloud', title: 'Cloud', icon: 'cloud', category: 'profile', requiresAuth: true },
  { path: '/profile/enhanced', title: 'Nâng cao', icon: 'rocket', category: 'profile', requiresAuth: true },
  { path: '/profile/my-products', title: 'SP của tôi', icon: 'cube-outline', category: 'profile', requiresAuth: true },
  { path: '/profile/permissions', title: 'Quyền hạn', icon: 'key', category: 'profile', requiresAuth: true },
  { path: '/profile/account-management', title: 'Quản lý TK', icon: 'person-circle', category: 'profile', requiresAuth: true },
  { path: '/profile/personal-verification', title: 'Xác thực cá nhân', icon: 'checkmark-done', category: 'profile', requiresAuth: true },
  { path: '/profile/contractor-verification', title: 'Xác thực NT', icon: 'shield-checkmark', category: 'profile', requiresAuth: true },
  { path: '/profile/menu', title: 'Menu hồ sơ', icon: 'menu', category: 'profile', requiresAuth: true },
  
  // Portfolio
  { path: '/profile/portfolio', title: 'Portfolio', icon: 'briefcase', category: 'profile', requiresAuth: true },
  { path: '/profile/portfolio/boq', title: 'BOQ', icon: 'list', category: 'profile', requiresAuth: true },
  { path: '/profile/portfolio/spec', title: 'Đặc tả kỹ thuật', icon: 'document-text', category: 'profile', requiresAuth: true },
  { path: '/profile/portfolio/3d-design', title: 'Thiết kế 3D', icon: 'cube', category: 'profile', requiresAuth: true },
];

/**
 * Media Routes
 */
export const MEDIA_ROUTES: RouteItem[] = [
  { path: '/videos/index', title: 'Videos', icon: 'play-circle', category: 'main' },
  { path: '/videos/[category]', title: 'Videos theo loại', icon: 'film', category: 'main' },
  { path: '/search/index', title: 'Tìm kiếm', icon: 'search', category: 'main' },
  { path: '/search/advanced', title: 'Tìm kiếm nâng cao', icon: 'filter', category: 'main' },
];

/**
 * Legal & Info Routes
 */
export const LEGAL_ROUTES: RouteItem[] = [
  { path: '/legal/terms', title: 'Điều khoản', icon: 'document-text', category: 'legal' },
  { path: '/legal/terms-of-service', title: 'Điều khoản DV', icon: 'reader', category: 'legal' },
  { path: '/legal/privacy-policy', title: 'Chính sách riêng tư', icon: 'shield', category: 'legal' },
  { path: '/legal/about-us', title: 'Về chúng tôi', icon: 'information-circle', category: 'legal' },
  { path: '/legal/faq', title: 'FAQ', icon: 'help-circle', category: 'legal' },
  { path: '/intro/index', title: 'Giới thiệu', icon: 'rocket', category: 'legal' },
];

/**
 * Demo & Testing Routes
 */
export const DEMO_ROUTES: RouteItem[] = [
  { path: '/demo/upload', title: 'Demo Upload', icon: 'cloud-upload', category: 'main', hidden: true },
  { path: '/demo/gestures', title: 'Demo Gestures', icon: 'hand-left', category: 'main', hidden: true },
  { path: '/demo/api-example', title: 'Demo API', icon: 'code', category: 'main', hidden: true },
  { path: '/demo/cost-tracker', title: 'Demo Cost Tracker', icon: 'cash', category: 'main', hidden: true },
  { path: '/demo/ui-components', title: 'Demo UI', icon: 'apps', category: 'main', hidden: true },
  { path: '/demo/gesture-gallery', title: 'Demo Gesture Gallery', icon: 'images', category: 'main', hidden: true },
  { path: '/demo/task-management', title: 'Demo Task Mgmt', icon: 'checkbox', category: 'main', hidden: true },
  { path: '/demo/notification-demo', title: 'Demo Notification', icon: 'notifications', category: 'main', hidden: true },
  { path: '/utilities/api-diagnostics', title: 'API Diagnostics', icon: 'pulse', category: 'main', hidden: true },
  { path: '/utilities/safe-area-demo', title: 'Safe Area Demo', icon: 'phone-portrait', category: 'main', hidden: true },
];

/**
 * AI Analysis Layout
 */
export const AI_ANALYSIS_ROUTES: RouteItem[] = [
  { path: '/ai-analysis/index', title: 'Phân tích AI', icon: 'analytics', category: 'services' },
];

/**
 * All Routes Combined
 */
export const ALL_ROUTES: RouteItem[] = [
  ...AUTH_ROUTES,
  ...MAIN_TAB_ROUTES,
  ...CONSTRUCTION_ROUTES,
  ...PROJECT_ROUTES,
  ...PROJECT_LISTING_ROUTES,
  ...MANAGEMENT_ROUTES,
  ...QUALITY_SAFETY_ROUTES,
  ...ADVANCED_ROUTES,
  ...RESOURCE_ROUTES,
  ...RISK_ENV_ROUTES,
  ...COMMUNICATION_ROUTES,
  ...SERVICES_ROUTES,
  ...UTILITIES_ROUTES,
  ...FINISHING_ROUTES,
  ...SHOPPING_ROUTES,
  ...PROFILE_ROUTES,
  ...MEDIA_ROUTES,
  ...LEGAL_ROUTES,
  ...AI_ANALYSIS_ROUTES,
  ...DEMO_ROUTES,
];

/**
 * Get routes by category
 */
export function getRoutesByCategory(category: RouteCategory, includeHidden = false): RouteItem[] {
  return ALL_ROUTES.filter(route => 
    route.category === category && (includeHidden || !route.hidden)
  );
}

/**
 * Get all categories
 */
export function getAllCategories(): RouteCategory[] {
  return Array.from(new Set(ALL_ROUTES.map(r => r.category)));
}

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<RouteCategory, string> = {
  auth: 'Xác thực',
  main: 'Chính',
  construction: 'Xây dựng',
  project: 'Dự án',
  management: 'Quản lý',
  admin: 'Quản trị',
  services: 'Dịch vụ',
  utilities: 'Tiện ích',
  shopping: 'Mua sắm',
  communication: 'Truyền thông',
  profile: 'Hồ sơ',
  legal: 'Pháp lý',
};

/**
 * Get total route count
 */
export const TOTAL_ROUTES = ALL_ROUTES.length;
export const VISIBLE_ROUTES = ALL_ROUTES.filter(r => !r.hidden).length;
