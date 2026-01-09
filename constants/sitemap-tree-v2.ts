/**
 * Sitemap Tree Structure V2 - Complete App Navigation
 * Organized by functional categories with all existing routes
 * @created 2026-01-02
 * @updated 2026-01-02
 */

import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'user' | 'employee' | 'admin';

export interface SitemapNode {
  id: string;
  title: string;
  titleVi: string;
  route?: string;
  icon: keyof typeof Ionicons.glyphMap;
  description?: string;
  roles: UserRole[];
  children?: SitemapNode[];
  badge?: 'NEW' | 'HOT' | 'PRO';
  isPersonalTimeline?: boolean;
  isDashboardItem?: boolean;
}

// ============================================================================
// AUTHENTICATION ROUTES (4 pages)
// ============================================================================

const AUTH_ROUTES: SitemapNode = {
  id: 'auth',
  title: 'Authentication',
  titleVi: 'Xác thực',
  icon: 'key-outline',
  roles: ['user', 'employee', 'admin'],
  children: [
    { id: 'login', title: 'Login', titleVi: 'Đăng nhập', route: '/(auth)/login', icon: 'log-in-outline', roles: ['user'] },
    { id: 'register', title: 'Register', titleVi: 'Đăng ký', route: '/(auth)/register-shopee', icon: 'person-add-outline', roles: ['user'] },
    { id: 'forgot-password', title: 'Forgot Password', titleVi: 'Quên mật khẩu', route: '/(auth)/forgot-password', icon: 'lock-open-outline', roles: ['user'] },
    { id: 'reset-password', title: 'Reset Password', titleVi: 'Đặt lại mật khẩu', route: '/(auth)/reset-password', icon: 'refresh-outline', roles: ['user'] },
  ],
};

// ============================================================================
// MAIN TABS & HOME (14 pages)
// ============================================================================

const MAIN_ROUTES: SitemapNode = {
  id: 'main',
  title: 'Main',
  titleVi: 'Chính',
  icon: 'home-outline',
  roles: ['user', 'employee', 'admin'],
  children: [
    { id: 'home', title: 'Home', titleVi: 'Trang chủ', route: '/(tabs)', icon: 'home-outline', roles: ['user'], badge: 'HOT' },
    { id: 'home-construction', title: 'Construction Home', titleVi: 'Trang chủ xây dựng', route: '/(tabs)/home-construction', icon: 'construct-outline', roles: ['user'] },
    { id: 'projects-tab', title: 'Projects', titleVi: 'Dự án', route: '/(tabs)/projects', icon: 'folder-outline', roles: ['user'], isPersonalTimeline: true },
    { id: 'notifications-tab', title: 'Notifications', titleVi: 'Thông báo', route: '/(tabs)/notifications', icon: 'notifications-outline', roles: ['user'], isPersonalTimeline: true },
    { id: 'profile-tab', title: 'Profile', titleVi: 'Hồ sơ', route: '/(tabs)/profile', icon: 'person-outline', roles: ['user'] },
    { id: 'contacts-tab', title: 'Contacts', titleVi: 'Danh bạ', route: '/(tabs)/contacts', icon: 'people-outline', roles: ['user'] },
    { id: 'live-tab', title: 'Live Stream', titleVi: 'Phát trực tiếp', route: '/(tabs)/live', icon: 'radio-outline', roles: ['user'], badge: 'HOT' },
    { id: 'menu-tab', title: 'Menu', titleVi: 'Menu', route: '/(tabs)/menu', icon: 'menu-outline', roles: ['user'] },
    { id: 'search', title: 'Search', titleVi: 'Tìm kiếm', route: '/search', icon: 'search-outline', roles: ['user'] },
    { id: 'cart-root', title: 'Cart', titleVi: 'Giỏ hàng', route: '/cart', icon: 'cart-outline', roles: ['user'] },
    { id: 'checkout-root', title: 'Checkout', titleVi: 'Thanh toán', route: '/checkout', icon: 'card-outline', roles: ['user'] },
    { id: 'quote-request', title: 'Quote Request', titleVi: 'Yêu cầu báo giá', route: '/quote-request', icon: 'document-text-outline', roles: ['user'] },
    { id: 'health-check', title: 'Health Check', titleVi: 'Kiểm tra sức khỏe', route: '/health-check', icon: 'medkit-outline', roles: ['admin'] },
    { id: 'file-upload', title: 'File Upload', titleVi: 'Tải lên tệp', route: '/file-upload', icon: 'cloud-upload-outline', roles: ['user'] },
  ],
};

// ============================================================================
// CONSTRUCTION & BUILDING (8 pages)
// ============================================================================

const CONSTRUCTION_ROUTES: SitemapNode = {
  id: 'construction',
  title: 'Construction',
  titleVi: 'Xây dựng',
  icon: 'construct-outline',
  roles: ['user', 'employee'],
  children: [
    { id: 'construction-index', title: 'Overview', titleVi: 'Tổng quan', route: '/construction', icon: 'construct-outline', roles: ['user'] },
    { id: 'construction-tracking', title: 'Tracking', titleVi: 'Theo dõi thi công', route: '/construction/tracking', icon: 'analytics-outline', roles: ['employee'], isDashboardItem: true },
    { id: 'construction-map', title: 'Map View', titleVi: 'Bản đồ công trình', route: '/construction/map-view', icon: 'map-outline', roles: ['employee'], isDashboardItem: true },
    { id: 'construction-booking', title: 'Booking', titleVi: 'Lịch hẹn', route: '/construction/booking', icon: 'calendar-outline', roles: ['employee'], isDashboardItem: true },
    { id: 'construction-progress', title: 'Progress', titleVi: 'Tiến độ', route: '/construction/progress', icon: 'trending-up-outline', roles: ['user'] },
    { id: 'construction-progress-board', title: 'Progress Board', titleVi: 'Bảng tiến độ', route: '/construction/progress-board', icon: 'clipboard-outline', roles: ['employee'] },
    { id: 'villa-progress', title: 'Villa Progress', titleVi: 'Tiến độ biệt thự', route: '/construction/villa-progress', icon: 'home-outline', roles: ['user'] },
    { id: 'payment-progress', title: 'Payment Progress', titleVi: 'Tiến độ thanh toán', route: '/construction/payment-progress', icon: 'cash-outline', roles: ['user'] },
  ],
};

// ============================================================================
// PROJECTS (36 pages)
// ============================================================================

const PROJECTS_ROUTES: SitemapNode = {
  id: 'projects',
  title: 'Projects',
  titleVi: 'Dự án',
  icon: 'folder-outline',
  roles: ['user', 'employee'],
  children: [
    { id: 'projects-index', title: 'All Projects', titleVi: 'Tất cả dự án', route: '/projects', icon: 'albums-outline', roles: ['user'], isPersonalTimeline: true },
    { id: 'project-create', title: 'Create Project', titleVi: 'Tạo dự án', route: '/projects/create', icon: 'add-circle-outline', roles: ['user'] },
    { id: 'project-management', title: 'Management', titleVi: 'Quản lý', route: '/projects/project-management', icon: 'settings-outline', roles: ['employee'], isDashboardItem: true },
    { id: 'customer-projects', title: 'Customer Projects', titleVi: 'Dự án khách hàng', route: '/projects/customer-projects', icon: 'people-outline', roles: ['employee'] },
    { id: 'find-contractors', title: 'Find Contractors', titleVi: 'Tìm nhà thầu', route: '/projects/find-contractors', icon: 'search-outline', roles: ['user'] },
    { id: 'quotation-list', title: 'Quotations', titleVi: 'Danh sách báo giá', route: '/projects/quotation-list', icon: 'document-text-outline', roles: ['user'] },
    // Architecture
    { id: 'architecture-portfolio', title: 'Architecture Portfolio', titleVi: 'Portfolio kiến trúc', route: '/projects/architecture-portfolio', icon: 'business-outline', roles: ['user'] },
    { id: 'design-portfolio', title: 'Design Portfolio', titleVi: 'Portfolio thiết kế', route: '/projects/design-portfolio', icon: 'color-palette-outline', roles: ['user'] },
    { id: 'construction-portfolio', title: 'Construction Portfolio', titleVi: 'Portfolio xây dựng', route: '/projects/construction-portfolio', icon: 'construct-outline', roles: ['user'] },
    { id: 'library', title: 'Project Library', titleVi: 'Thư viện dự án', route: '/projects/library', icon: 'library-outline', roles: ['user'] },
    // Timeline
    { id: 'timeline-index', title: 'Timeline', titleVi: 'Lịch trình', route: '/timeline', icon: 'time-outline', roles: ['user'], isPersonalTimeline: true },
    { id: 'timeline-phases', title: 'Phases', titleVi: 'Các giai đoạn', route: '/timeline/phases', icon: 'layers-outline', roles: ['user'] },
    { id: 'timeline-critical', title: 'Critical Path', titleVi: 'Đường găng', route: '/timeline/critical-path', icon: 'warning-outline', roles: ['employee'], badge: 'PRO' },
    { id: 'create-phase', title: 'Create Phase', titleVi: 'Tạo giai đoạn', route: '/timeline/create-phase', icon: 'add-outline', roles: ['user'] },
    { id: 'create-task', title: 'Create Task', titleVi: 'Tạo công việc', route: '/timeline/create-task', icon: 'checkbox-outline', roles: ['user'] },
    // Budget
    { id: 'budget-index', title: 'Budget', titleVi: 'Ngân sách', route: '/budget', icon: 'wallet-outline', roles: ['user'], isPersonalTimeline: true },
    { id: 'budget-expenses', title: 'Expenses', titleVi: 'Chi phí', route: '/budget/expenses', icon: 'trending-down-outline', roles: ['user'] },
    { id: 'budget-invoices', title: 'Invoices', titleVi: 'Hóa đơn', route: '/budget/invoices', icon: 'receipt-outline', roles: ['user'] },
    { id: 'budget-estimates', title: 'Estimates', titleVi: 'Dự toán', route: '/budget/estimates', icon: 'calculator-outline', roles: ['user'] },
    { id: 'budget-reports', title: 'Budget Reports', titleVi: 'Báo cáo ngân sách', route: '/budget/reports', icon: 'bar-chart-outline', roles: ['user'] },
    // Change Management
    { id: 'change-order', title: 'Change Orders', titleVi: 'Thay đổi đơn hàng', route: '/change-order', icon: 'swap-horizontal-outline', roles: ['employee'] },
    { id: 'change-management', title: 'Change Management', titleVi: 'Quản lý thay đổi', route: '/change-management', icon: 'git-compare-outline', roles: ['employee'] },
  ],
};

// ============================================================================
// ADMIN ROUTES (6 pages)
// ============================================================================

const ADMIN_ROUTES: SitemapNode = {
  id: 'admin',
  title: 'Administration',
  titleVi: 'Quản trị',
  icon: 'settings-outline',
  roles: ['admin'],
  children: [
    { id: 'admin-dashboard', title: 'Dashboard', titleVi: 'Bảng điều khiển', route: '/admin/dashboard', icon: 'speedometer-outline', roles: ['admin'], isDashboardItem: true },
    { id: 'admin-products', title: 'Products', titleVi: 'Sản phẩm', route: '/admin/products', icon: 'cube-outline', roles: ['admin'], isDashboardItem: true },
    { id: 'admin-staff', title: 'Staff', titleVi: 'Nhân viên', route: '/admin/staff', icon: 'people-outline', roles: ['admin'], isDashboardItem: true },
    { id: 'admin-roles', title: 'Roles', titleVi: 'Phân quyền', route: '/admin/roles', icon: 'key-outline', roles: ['admin'], isDashboardItem: true },
    { id: 'admin-settings', title: 'Settings', titleVi: 'Cài đặt', route: '/admin/settings', icon: 'cog-outline', roles: ['admin'], isDashboardItem: true },
    { id: 'admin-activity', title: 'Activity Log', titleVi: 'Nhật ký hoạt động', route: '/admin/activity-log', icon: 'list-outline', roles: ['admin'] },
  ],
};

// ============================================================================
// MANAGEMENT - QUALITY, SAFETY, DOCUMENTS (89 pages)
// ============================================================================

const MANAGEMENT_ROUTES: SitemapNode = {
  id: 'management',
  title: 'Management',
  titleVi: 'Quản lý',
  icon: 'clipboard-outline',
  roles: ['employee', 'admin'],
  children: [
    // Dashboard
    { id: 'dashboard-index', title: 'Dashboard', titleVi: 'Bảng điều khiển', route: '/dashboard', icon: 'speedometer-outline', roles: ['employee'], isDashboardItem: true },
    
    // Quality Assurance
    {
      id: 'quality',
      title: 'Quality Assurance',
      titleVi: 'Đảm bảo chất lượng',
      icon: 'checkmark-done-outline',
      roles: ['employee'],
      children: [
        { id: 'qa-index', title: 'QA Overview', titleVi: 'Tổng quan QA', route: '/quality-assurance', icon: 'checkmark-done-outline', roles: ['employee'], isDashboardItem: true },
        { id: 'inspection-index', title: 'Inspection', titleVi: 'Kiểm tra', route: '/inspection', icon: 'search-outline', roles: ['employee'], badge: 'PRO' },
        { id: 'punch-list', title: 'Punch List', titleVi: 'Danh sách sửa chữa', route: '/punch-list', icon: 'list-outline', roles: ['employee'] },
      ],
    },
    
    // Safety
    {
      id: 'safety',
      title: 'Safety',
      titleVi: 'An toàn',
      icon: 'shield-checkmark-outline',
      roles: ['employee'],
      children: [
        { id: 'safety-index', title: 'Safety Management', titleVi: 'Quản lý an toàn', route: '/safety', icon: 'shield-outline', roles: ['employee'], isDashboardItem: true },
        { id: 'environmental', title: 'Environmental', titleVi: 'Môi trường', route: '/environmental', icon: 'leaf-outline', roles: ['employee'] },
      ],
    },
    
    // Documents
    {
      id: 'documents',
      title: 'Documents',
      titleVi: 'Tài liệu',
      icon: 'documents-outline',
      roles: ['employee'],
      children: [
        { id: 'documents-index', title: 'Documents', titleVi: 'Tài liệu', route: '/documents', icon: 'folder-outline', roles: ['employee'], isDashboardItem: true },
        { id: 'document-control', title: 'Document Control', titleVi: 'Kiểm soát tài liệu', route: '/document-control', icon: 'shield-outline', roles: ['employee'] },
        { id: 'daily-report', title: 'Daily Report', titleVi: 'Nhật ký', route: '/daily-report', icon: 'today-outline', roles: ['employee'] },
        { id: 'reports-index', title: 'Reports', titleVi: 'Báo cáo', route: '/reports', icon: 'stats-chart-outline', roles: ['employee'] },
        { id: 'rfi-index', title: 'RFI', titleVi: 'Yêu cầu thông tin', route: '/rfi', icon: 'help-outline', roles: ['employee'] },
        { id: 'submittal-index', title: 'Submittals', titleVi: 'Hồ sơ nộp', route: '/submittal', icon: 'document-attach-outline', roles: ['employee'] },
        { id: 'meeting-minutes', title: 'Meeting Minutes', titleVi: 'Biên bản họp', route: '/meeting-minutes', icon: 'document-text-outline', roles: ['employee'] },
      ],
    },
    
    // Resources
    {
      id: 'resources',
      title: 'Resources',
      titleVi: 'Tài nguyên',
      icon: 'cube-outline',
      roles: ['employee'],
      children: [
        { id: 'materials-index', title: 'Materials', titleVi: 'Vật liệu', route: '/materials', icon: 'layers-outline', roles: ['employee'], isDashboardItem: true },
        { id: 'labor-index', title: 'Labor', titleVi: 'Nhân công', route: '/labor', icon: 'people-outline', roles: ['employee'] },
        { id: 'equipment-index', title: 'Equipment', titleVi: 'Thiết bị', route: '/equipment', icon: 'hardware-chip-outline', roles: ['employee'] },
        { id: 'inventory-index', title: 'Inventory', titleVi: 'Kho hàng', route: '/inventory', icon: 'archive-outline', roles: ['employee'] },
        { id: 'fleet-index', title: 'Fleet', titleVi: 'Phương tiện', route: '/fleet', icon: 'car-outline', roles: ['employee'] },
        { id: 'resource-planning', title: 'Resource Planning', titleVi: 'Lập kế hoạch', route: '/resource-planning', icon: 'calendar-outline', roles: ['employee'] },
      ],
    },
    
    // Contracts
    {
      id: 'contracts',
      title: 'Contracts',
      titleVi: 'Hợp đồng',
      icon: 'document-text-outline',
      roles: ['employee'],
      children: [
        { id: 'contracts-index', title: 'Contracts', titleVi: 'Hợp đồng', route: '/contracts', icon: 'document-text-outline', roles: ['employee'], isDashboardItem: true },
        { id: 'procurement-index', title: 'Procurement', titleVi: 'Mua sắm', route: '/procurement', icon: 'cart-outline', roles: ['employee'] },
      ],
    },
    
    // Advanced
    {
      id: 'advanced',
      title: 'Advanced',
      titleVi: 'Nâng cao',
      icon: 'trophy-outline',
      roles: ['employee'],
      children: [
        { id: 'risk-index', title: 'Risk Management', titleVi: 'Quản lý rủi ro', route: '/risk', icon: 'alert-circle-outline', roles: ['employee'], badge: 'PRO' },
        { id: 'warranty-index', title: 'Warranty', titleVi: 'Bảo hành', route: '/warranty', icon: 'shield-outline', roles: ['employee'], badge: 'PRO' },
        { id: 'commissioning', title: 'Commissioning', titleVi: 'Nghiệm thu', route: '/commissioning', icon: 'checkbox-outline', roles: ['employee'] },
        { id: 'om-manuals', title: 'O&M Manuals', titleVi: 'Tài liệu vận hành', route: '/om-manuals', icon: 'book-outline', roles: ['employee'] },
        { id: 'as-built', title: 'As-Built', titleVi: 'Hoàn công', route: '/as-built', icon: 'document-outline', roles: ['employee'] },
      ],
    },
    
    // CRM
    {
      id: 'crm',
      title: 'CRM',
      titleVi: 'Quản lý khách hàng',
      icon: 'people-circle-outline',
      roles: ['employee', 'admin'],
      badge: 'NEW',
      children: [
        { id: 'crm-index', title: 'CRM Dashboard', titleVi: 'Bảng điều khiển CRM', route: '/crm', icon: 'speedometer-outline', roles: ['employee'] },
        { id: 'crm-customers', title: 'Customers', titleVi: 'Khách hàng', route: '/crm/customers', icon: 'people-outline', roles: ['employee'] },
        { id: 'crm-projects', title: 'CRM Projects', titleVi: 'Dự án CRM', route: '/crm/projects', icon: 'folder-outline', roles: ['employee'] },
        { id: 'crm-settings', title: 'CRM Settings', titleVi: 'Cài đặt CRM', route: '/crm/settings', icon: 'settings-outline', roles: ['admin'] },
      ],
    },
    
    // Analytics
    { id: 'analytics-index', title: 'Analytics', titleVi: 'Phân tích', route: '/analytics', icon: 'bar-chart-outline', roles: ['admin'], isDashboardItem: true },
  ],
};

// ============================================================================
// COMMUNICATION & MEDIA (12 pages)
// ============================================================================

const COMMUNICATION_ROUTES: SitemapNode = {
  id: 'communication',
  title: 'Communication',
  titleVi: 'Truyền thông',
  icon: 'chatbubbles-outline',
  roles: ['user', 'employee'],
  children: [
    { id: 'messages-index', title: 'Messages', titleVi: 'Tin nhắn', route: '/messages', icon: 'mail-outline', roles: ['user'], isPersonalTimeline: true },
    { id: 'realtime-chat', title: 'Realtime Chat', titleVi: 'Chat trực tuyến', route: '/messages/realtime-chat', icon: 'chatbubble-ellipses-outline', roles: ['user'] },
    { id: 'video-call', title: 'Video Call', titleVi: 'Gọi video', route: '/call/active', icon: 'videocam-outline', roles: ['user'] },
    { id: 'videos-index', title: 'Videos', titleVi: 'Video', route: '/videos', icon: 'play-circle-outline', roles: ['user'] },
    { id: 'stories', title: 'Stories', titleVi: 'Câu chuyện', route: '/stories', icon: 'images-outline', roles: ['user'] },
    { id: 'tiktok', title: 'Short Videos', titleVi: 'Video ngắn', route: '/tiktok', icon: 'logo-tiktok', roles: ['user'], badge: 'NEW' },
    // Social
    { id: 'social-index', title: 'Social Feed', titleVi: 'Bảng tin', route: '/social', icon: 'globe-outline', roles: ['user'] },
    // Communication Module
    { id: 'communication-index', title: 'Communication Hub', titleVi: 'Trung tâm liên lạc', route: '/communication', icon: 'chatbubbles-outline', roles: ['employee'] },
    { id: 'communications-index', title: 'Communications', titleVi: 'Thông tin liên lạc', route: '/communications', icon: 'megaphone-outline', roles: ['employee'] },
  ],
};

// ============================================================================
// SERVICES (22 pages)
// ============================================================================

const SERVICES_ROUTES: SitemapNode = {
  id: 'services',
  title: 'Services',
  titleVi: 'Dịch vụ',
  icon: 'briefcase-outline',
  roles: ['user'],
  children: [
    { id: 'services-index', title: 'All Services', titleVi: 'Tất cả dịch vụ', route: '/services', icon: 'apps-outline', roles: ['user'] },
    { id: 'house-design', title: 'House Design', titleVi: 'Thiết kế nhà', route: '/services/house-design', icon: 'home-outline', roles: ['user'], badge: 'HOT' },
    { id: 'interior-design', title: 'Interior Design', titleVi: 'Thiết kế nội thất', route: '/services/interior-design', icon: 'color-palette-outline', roles: ['user'] },
    { id: 'construction-company', title: 'Construction Company', titleVi: 'Nhà thầu xây dựng', route: '/services/construction-company', icon: 'business-outline', roles: ['user'] },
    { id: 'quality-supervision', title: 'Quality Supervision', titleVi: 'Giám sát chất lượng', route: '/services/quality-supervision', icon: 'eye-outline', roles: ['user'], badge: 'PRO' },
    { id: 'quality-consulting', title: 'Quality Consulting', titleVi: 'Tư vấn chất lượng', route: '/services/quality-consulting', icon: 'help-buoy-outline', roles: ['user'] },
    { id: 'feng-shui', title: 'Feng Shui', titleVi: 'Phong thủy', route: '/services/feng-shui', icon: 'compass-outline', roles: ['user'] },
    { id: 'permit', title: 'Permit Services', titleVi: 'Dịch vụ giấy phép', route: '/services/permit', icon: 'document-outline', roles: ['user'] },
    { id: 'materials-catalog', title: 'Materials Catalog', titleVi: 'Danh mục vật liệu', route: '/services/materials-catalog', icon: 'cube-outline', roles: ['user'] },
    { id: 'marketplace', title: 'Marketplace', titleVi: 'Chợ dịch vụ', route: '/services/marketplace', icon: 'storefront-outline', roles: ['user'] },
    { id: 'design-calculator', title: 'Design Calculator', titleVi: 'Máy tính thiết kế', route: '/services/design-calculator', icon: 'calculator-outline', roles: ['user'] },
    { id: 'construction-lookup', title: 'Construction Lookup', titleVi: 'Tra cứu xây dựng', route: '/services/construction-lookup', icon: 'search-outline', roles: ['user'] },
    { id: 'color-chart', title: 'Color Chart', titleVi: 'Bảng màu', route: '/services/color-chart', icon: 'color-palette-outline', roles: ['user'] },
    { id: 'color-trends', title: 'Color Trends', titleVi: 'Xu hướng màu', route: '/services/color-trends', icon: 'trending-up-outline', roles: ['user'] },
    { id: 'sample-docs', title: 'Sample Documents', titleVi: 'Tài liệu mẫu', route: '/services/sample-docs', icon: 'documents-outline', roles: ['user'] },
    // AI Services
    {
      id: 'ai-services',
      title: 'AI Services',
      titleVi: 'Dịch vụ AI',
      icon: 'sparkles-outline',
      roles: ['user'],
      badge: 'NEW',
      children: [
        { id: 'ai-index', title: 'AI Assistant', titleVi: 'Trợ lý AI', route: '/ai', icon: 'sparkles-outline', roles: ['user'] },
        { id: 'ai-chatbot', title: 'AI Chatbot', titleVi: 'Chatbot AI', route: '/ai/chatbot', icon: 'chatbox-outline', roles: ['user'] },
        { id: 'ai-cost-estimator', title: 'AI Cost Estimator', titleVi: 'Ước tính chi phí AI', route: '/ai/cost-estimator', icon: 'calculator-outline', roles: ['user'] },
        { id: 'ai-photo-analysis', title: 'Photo Analysis', titleVi: 'Phân tích ảnh', route: '/ai/photo-analysis', icon: 'camera-outline', roles: ['user'] },
        { id: 'ai-material-check', title: 'Material Check', titleVi: 'Kiểm tra vật liệu', route: '/ai/material-check', icon: 'checkmark-circle-outline', roles: ['user'] },
        { id: 'ai-progress-prediction', title: 'Progress Prediction', titleVi: 'Dự báo tiến độ', route: '/ai/progress-prediction', icon: 'analytics-outline', roles: ['user'] },
      ],
    },
  ],
};

// ============================================================================
// UTILITIES & TOOLS (25 pages)
// ============================================================================

const UTILITIES_ROUTES: SitemapNode = {
  id: 'utilities',
  title: 'Utilities',
  titleVi: 'Tiện ích',
  icon: 'apps-outline',
  roles: ['user'],
  children: [
    { id: 'utilities-index', title: 'All Utilities', titleVi: 'Tất cả tiện ích', route: '/utilities', icon: 'apps-outline', roles: ['user'] },
    { id: 'cost-estimator', title: 'Cost Estimator', titleVi: 'Ước tính chi phí', route: '/utilities/cost-estimator', icon: 'calculator-outline', roles: ['user'], badge: 'HOT' },
    { id: 'my-qr', title: 'My QR Code', titleVi: 'Mã QR của tôi', route: '/utilities/my-qr-code', icon: 'qr-code-outline', roles: ['user'] },
    { id: 'qr-scanner', title: 'QR Scanner', titleVi: 'Quét QR', route: '/utilities/qr-scanner', icon: 'scan-outline', roles: ['user'] },
    { id: 'store-locator', title: 'Store Locator', titleVi: 'Tìm cửa hàng', route: '/utilities/store-locator', icon: 'location-outline', roles: ['user'] },
    { id: 'weather-util', title: 'Weather', titleVi: 'Thời tiết', route: '/weather', icon: 'partly-sunny-outline', roles: ['user'] },
    { id: 'schedule', title: 'Schedule', titleVi: 'Lịch trình', route: '/utilities/schedule', icon: 'calendar-outline', roles: ['user'] },
    { id: 'history', title: 'History', titleVi: 'Lịch sử', route: '/utilities/history', icon: 'time-outline', roles: ['user'] },
    { id: 'sitemap-util', title: 'Sitemap', titleVi: 'Sơ đồ trang', route: '/utilities/sitemap', icon: 'map-outline', roles: ['user'] },
    { id: 'api-diagnostics', title: 'API Diagnostics', titleVi: 'Chẩn đoán API', route: '/utilities/api-diagnostics', icon: 'bug-outline', roles: ['admin'] },
    { id: 'network-diagnostics', title: 'Network Diagnostics', titleVi: 'Chẩn đoán mạng', route: '/utilities/network-diagnostics', icon: 'wifi-outline', roles: ['admin'] },
    // Workforce
    {
      id: 'workforce',
      title: 'Workforce',
      titleVi: 'Nhân công',
      icon: 'people-outline',
      roles: ['user'],
      children: [
        { id: 'tho-xay', title: 'Masons', titleVi: 'Thợ xây', route: '/utilities/tho-xay', icon: 'hammer-outline', roles: ['user'] },
        { id: 'tho-dien-nuoc', title: 'Electrician & Plumber', titleVi: 'Thợ điện nước', route: '/utilities/tho-dien-nuoc', icon: 'flash-outline', roles: ['user'] },
        { id: 'tho-coffa', title: 'Formwork', titleVi: 'Thợ cốt pha', route: '/utilities/tho-coffa', icon: 'grid-outline', roles: ['user'] },
        { id: 'design-team', title: 'Design Team', titleVi: 'Đội thiết kế', route: '/utilities/design-team', icon: 'brush-outline', roles: ['user'] },
        { id: 'nhan-cong', title: 'All Workers', titleVi: 'Tất cả nhân công', route: '/utilities/nhan-cong', icon: 'people-circle-outline', roles: ['user'] },
      ],
    },
    // Construction Materials
    {
      id: 'construction-materials',
      title: 'Construction Materials',
      titleVi: 'VLXD',
      icon: 'cube-outline',
      roles: ['user'],
      children: [
        { id: 'ep-coc', title: 'Pile Driving', titleVi: 'Ép cọc', route: '/utilities/ep-coc', icon: 'arrow-down-outline', roles: ['user'] },
        { id: 'dao-dat', title: 'Excavation', titleVi: 'Đào đất', route: '/utilities/dao-dat', icon: 'construct-outline', roles: ['user'] },
        { id: 'be-tong', title: 'Concrete', titleVi: 'Bê tông', route: '/utilities/be-tong', icon: 'layers-outline', roles: ['user'] },
        { id: 'vat-lieu', title: 'Materials', titleVi: 'Vật liệu', route: '/utilities/vat-lieu', icon: 'cube-outline', roles: ['user'] },
        { id: 'construction-util', title: 'Construction', titleVi: 'Xây dựng', route: '/utilities/construction', icon: 'construct-outline', roles: ['user'] },
      ],
    },
  ],
};

// ============================================================================
// SHOPPING (11 pages)
// ============================================================================

const SHOPPING_ROUTES: SitemapNode = {
  id: 'shopping',
  title: 'Shopping',
  titleVi: 'Mua sắm',
  icon: 'cart-outline',
  roles: ['user'],
  badge: 'HOT',
  children: [
    { id: 'shopping-index', title: 'Shop', titleVi: 'Cửa hàng', route: '/shopping', icon: 'storefront-outline', roles: ['user'] },
    { id: 'products-catalog', title: 'Products Catalog', titleVi: 'Danh mục sản phẩm', route: '/shopping/products-catalog', icon: 'grid-outline', roles: ['user'] },
    { id: 'flash-sale', title: 'Flash Sale', titleVi: 'Flash Sale', route: '/shopping/flash-sale', icon: 'flash-outline', roles: ['user'], badge: 'HOT' },
    { id: 'new-customer', title: 'New Customer Offer', titleVi: 'Ưu đãi khách mới', route: '/shopping/new-customer-offer', icon: 'gift-outline', roles: ['user'] },
    { id: 'compare', title: 'Compare Products', titleVi: 'So sánh sản phẩm', route: '/shopping/compare', icon: 'git-compare-outline', roles: ['user'] },
    { id: 'shopping-cart', title: 'Cart', titleVi: 'Giỏ hàng', route: '/shopping/cart', icon: 'basket-outline', roles: ['user'] },
    // Seller
    {
      id: 'seller',
      title: 'Seller Center',
      titleVi: 'Trung tâm người bán',
      icon: 'business-outline',
      roles: ['user'],
      children: [
        { id: 'seller-dashboard', title: 'Seller Dashboard', titleVi: 'Bảng điều khiển', route: '/seller/dashboard', icon: 'speedometer-outline', roles: ['user'] },
        { id: 'add-product', title: 'Add Product', titleVi: 'Thêm sản phẩm', route: '/seller/add-product', icon: 'add-circle-outline', roles: ['user'] },
        { id: 'edit-product', title: 'Edit Product', titleVi: 'Sửa sản phẩm', route: '/seller/edit-product', icon: 'create-outline', roles: ['user'] },
      ],
    },
  ],
};

// ============================================================================
// FINISHING WORKS (10+ pages)
// ============================================================================

const FINISHING_ROUTES: SitemapNode = {
  id: 'finishing',
  title: 'Finishing Works',
  titleVi: 'Hoàn thiện',
  icon: 'color-palette-outline',
  roles: ['user'],
  badge: 'HOT',
  children: [
    { id: 'finishing-index', title: 'Overview', titleVi: 'Tổng quan', route: '/finishing', icon: 'color-palette-outline', roles: ['user'] },
    { id: 'noi-that', title: 'Interior', titleVi: 'Nội thất', route: '/finishing/noi-that', icon: 'bed-outline', roles: ['user'], badge: 'HOT' },
    { id: 'lat-gach', title: 'Tiling', titleVi: 'Lát gạch', route: '/finishing/lat-gach-new', icon: 'grid-outline', roles: ['user'] },
    { id: 'son', title: 'Painting', titleVi: 'Sơn', route: '/finishing/son-new', icon: 'brush-outline', roles: ['user'] },
    { id: 'thach-cao', title: 'Drywall', titleVi: 'Thạch cao', route: '/finishing/thach-cao-new', icon: 'square-outline', roles: ['user'] },
    { id: 'lam-cua', title: 'Doors & Windows', titleVi: 'Làm cửa', route: '/finishing/lam-cua-new', icon: 'tablet-landscape-outline', roles: ['user'] },
    { id: 'lan-can', title: 'Railings', titleVi: 'Lan can', route: '/finishing/lan-can-new', icon: 'remove-outline', roles: ['user'] },
    { id: 'op-da', title: 'Stone Cladding', titleVi: 'Ốp đá', route: '/finishing/op-da', icon: 'diamond-outline', roles: ['user'] },
    { id: 'dien-nuoc', title: 'Electrical & Plumbing', titleVi: 'Điện nước', route: '/finishing/dien-nuoc', icon: 'flash-outline', roles: ['user'] },
    { id: 'camera', title: 'Security Camera', titleVi: 'Camera an ninh', route: '/finishing/camera-new', icon: 'videocam-outline', roles: ['user'] },
    { id: 'tho-tong-hop', title: 'General Workers', titleVi: 'Thợ tổng hợp', route: '/finishing/tho-tong-hop-new', icon: 'construct-outline', roles: ['user'] },
  ],
};

// ============================================================================
// PROFILE & ACCOUNT (29 pages)
// ============================================================================

const PROFILE_ROUTES: SitemapNode = {
  id: 'profile',
  title: 'Profile',
  titleVi: 'Hồ sơ',
  icon: 'person-circle-outline',
  roles: ['user'],
  children: [
    { id: 'profile-index', title: 'Profile', titleVi: 'Hồ sơ', route: '/profile', icon: 'person-circle-outline', roles: ['user'], isDashboardItem: true },
    { id: 'profile-edit', title: 'Edit Profile', titleVi: 'Chỉnh sửa', route: '/profile/edit', icon: 'create-outline', roles: ['user'], isDashboardItem: true },
    { id: 'profile-enhanced', title: 'Enhanced Profile', titleVi: 'Hồ sơ nâng cao', route: '/profile/enhanced', icon: 'star-outline', roles: ['user'] },
    { id: 'profile-info', title: 'Info', titleVi: 'Thông tin', route: '/profile/info', icon: 'information-circle-outline', roles: ['user'] },
    { id: 'profile-settings', title: 'Settings', titleVi: 'Cài đặt', route: '/profile/settings', icon: 'settings-outline', roles: ['user'], isDashboardItem: true },
    { id: 'profile-security', title: 'Security', titleVi: 'Bảo mật', route: '/profile/security', icon: 'shield-checkmark-outline', roles: ['user'] },
    { id: 'profile-privacy', title: 'Privacy', titleVi: 'Quyền riêng tư', route: '/profile/privacy', icon: 'eye-off-outline', roles: ['user'] },
    { id: 'profile-permissions', title: 'Permissions', titleVi: 'Quyền hạn', route: '/profile/permissions', icon: 'key-outline', roles: ['user'] },
    { id: 'profile-notifications', title: 'Notifications', titleVi: 'Thông báo', route: '/profile/notifications', icon: 'notifications-outline', roles: ['user'] },
    { id: 'profile-orders', title: 'Orders', titleVi: 'Đơn hàng', route: '/profile/orders', icon: 'receipt-outline', roles: ['user'], isPersonalTimeline: true },
    { id: 'profile-favorites', title: 'Favorites', titleVi: 'Yêu thích', route: '/profile/favorites', icon: 'heart-outline', roles: ['user'] },
    { id: 'profile-reviews', title: 'Reviews', titleVi: 'Đánh giá', route: '/profile/reviews', icon: 'star-outline', roles: ['user'] },
    { id: 'profile-rewards', title: 'Rewards', titleVi: 'Điểm thưởng', route: '/profile/rewards', icon: 'gift-outline', roles: ['user'] },
    { id: 'profile-vouchers', title: 'Vouchers', titleVi: 'Voucher', route: '/profile/vouchers', icon: 'pricetag-outline', roles: ['user'] },
    { id: 'profile-addresses', title: 'Addresses', titleVi: 'Địa chỉ', route: '/profile/addresses', icon: 'location-outline', roles: ['user'] },
    { id: 'profile-payment', title: 'Payment Methods', titleVi: 'Thanh toán', route: '/profile/payment', icon: 'card-outline', roles: ['user'] },
    { id: 'profile-payment-history', title: 'Payment History', titleVi: 'Lịch sử thanh toán', route: '/profile/payment-history', icon: 'time-outline', roles: ['user'] },
    { id: 'profile-history', title: 'History', titleVi: 'Lịch sử', route: '/profile/history', icon: 'time-outline', roles: ['user'] },
    { id: 'profile-cloud', title: 'Cloud Storage', titleVi: 'Lưu trữ đám mây', route: '/profile/cloud', icon: 'cloud-outline', roles: ['user'] },
    { id: 'profile-portfolio', title: 'Portfolio', titleVi: 'Portfolio', route: '/profile/portfolio', icon: 'images-outline', roles: ['user'] },
    { id: 'profile-my-products', title: 'My Products', titleVi: 'Sản phẩm của tôi', route: '/profile/my-products', icon: 'cube-outline', roles: ['user'] },
    { id: 'profile-verification', title: 'Verification', titleVi: 'Xác minh', route: '/profile/personal-verification', icon: 'checkmark-done-circle-outline', roles: ['user'] },
    { id: 'profile-help', title: 'Help', titleVi: 'Trợ giúp', route: '/profile/help', icon: 'help-circle-outline', roles: ['user'] },
    { id: 'account-management', title: 'Account Management', titleVi: 'Quản lý tài khoản', route: '/profile/account-management', icon: 'person-outline', roles: ['user'] },
  ],
};

// ============================================================================
// LEGAL (6 pages)
// ============================================================================

const LEGAL_ROUTES: SitemapNode = {
  id: 'legal',
  title: 'Legal',
  titleVi: 'Pháp lý',
  icon: 'document-text-outline',
  roles: ['user'],
  children: [
    { id: 'legal-index', title: 'Legal', titleVi: 'Pháp lý', route: '/legal', icon: 'document-text-outline', roles: ['user'] },
    { id: 'terms', title: 'Terms of Service', titleVi: 'Điều khoản dịch vụ', route: '/legal/terms', icon: 'document-outline', roles: ['user'] },
    { id: 'terms-full', title: 'Full Terms', titleVi: 'Điều khoản đầy đủ', route: '/legal/terms-of-service', icon: 'document-outline', roles: ['user'] },
    { id: 'privacy', title: 'Privacy Policy', titleVi: 'Chính sách bảo mật', route: '/legal/privacy-policy', icon: 'shield-outline', roles: ['user'] },
    { id: 'about-us', title: 'About Us', titleVi: 'Về chúng tôi', route: '/legal/about-us', icon: 'information-circle-outline', roles: ['user'] },
    { id: 'faq', title: 'FAQ', titleVi: 'Câu hỏi thường gặp', route: '/legal/faq', icon: 'help-circle-outline', roles: ['user'] },
  ],
};

// ============================================================================
// COMPLETE SITEMAPS BY ROLE
// ============================================================================

export const USER_SITEMAP: SitemapNode = {
  id: 'user-root',
  title: 'User Portal',
  titleVi: 'Cổng người dùng',
  icon: 'person-outline',
  roles: ['user'],
  children: [
    AUTH_ROUTES,
    MAIN_ROUTES,
    CONSTRUCTION_ROUTES,
    PROJECTS_ROUTES,
    SERVICES_ROUTES,
    FINISHING_ROUTES,
    SHOPPING_ROUTES,
    UTILITIES_ROUTES,
    COMMUNICATION_ROUTES,
    PROFILE_ROUTES,
    LEGAL_ROUTES,
  ],
};

export const EMPLOYEE_SITEMAP: SitemapNode = {
  id: 'employee-root',
  title: 'Employee Portal',
  titleVi: 'Cổng nhân viên',
  icon: 'briefcase-outline',
  roles: ['employee'],
  children: [
    AUTH_ROUTES,
    MAIN_ROUTES,
    CONSTRUCTION_ROUTES,
    PROJECTS_ROUTES,
    MANAGEMENT_ROUTES,
    COMMUNICATION_ROUTES,
    PROFILE_ROUTES,
    LEGAL_ROUTES,
  ],
};

export const ADMIN_SITEMAP: SitemapNode = {
  id: 'admin-root',
  title: 'Admin Portal',
  titleVi: 'Cổng quản trị',
  icon: 'settings-outline',
  roles: ['admin'],
  children: [
    AUTH_ROUTES,
    MAIN_ROUTES,
    ADMIN_ROUTES,
    MANAGEMENT_ROUTES,
    CONSTRUCTION_ROUTES,
    PROJECTS_ROUTES,
    SERVICES_ROUTES,
    SHOPPING_ROUTES,
    COMMUNICATION_ROUTES,
    PROFILE_ROUTES,
    LEGAL_ROUTES,
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getRoutesByRole = (role: UserRole): SitemapNode => {
  switch (role) {
    case 'admin': return ADMIN_SITEMAP;
    case 'employee': return EMPLOYEE_SITEMAP;
    default: return USER_SITEMAP;
  }
};

export const flattenSitemap = (node: SitemapNode): SitemapNode[] => {
  const result: SitemapNode[] = [node];
  if (node.children) {
    node.children.forEach(child => {
      result.push(...flattenSitemap(child));
    });
  }
  return result;
};

export const getPersonalTimelineRoutes = (sitemap: SitemapNode): SitemapNode[] => {
  return flattenSitemap(sitemap).filter(node => node.isPersonalTimeline && node.route);
};

export const getDashboardRoutes = (sitemap: SitemapNode): SitemapNode[] => {
  return flattenSitemap(sitemap).filter(node => node.isDashboardItem && node.route);
};

export const searchSitemapRoutes = (keyword: string, sitemap: SitemapNode): SitemapNode[] => {
  const lowerKeyword = keyword.toLowerCase().trim();
  if (!lowerKeyword) return [];
  
  return flattenSitemap(sitemap).filter(node => {
    return (
      node.title.toLowerCase().includes(lowerKeyword) ||
      node.titleVi.toLowerCase().includes(lowerKeyword) ||
      (node.route && node.route.toLowerCase().includes(lowerKeyword))
    );
  });
};

export const countSitemapRoutes = (node: SitemapNode): number => {
  return flattenSitemap(node).filter(n => n.route).length;
};

// ============================================================================
// STATISTICS
// ============================================================================

export const SITEMAP_STATS = {
  user: countSitemapRoutes(USER_SITEMAP),
  employee: countSitemapRoutes(EMPLOYEE_SITEMAP),
  admin: countSitemapRoutes(ADMIN_SITEMAP),
  get total() {
    // Unique routes only
    const allRoutes = new Set<string>();
    [USER_SITEMAP, EMPLOYEE_SITEMAP, ADMIN_SITEMAP].forEach(sitemap => {
      flattenSitemap(sitemap).forEach(node => {
        if (node.route) allRoutes.add(node.route);
      });
    });
    return allRoutes.size;
  },
  categories: {
    auth: 4,
    main: 14,
    construction: 8,
    projects: 36,
    admin: 6,
    management: 89,
    communication: 12,
    services: 22,
    utilities: 25,
    shopping: 11,
    profile: 29,
    legal: 6,
  },
};
