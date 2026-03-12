/**
 * Sitemap Tree Structure - Organized by User Role
 * Separates Frontend routes for Users vs Employees/Admin
 * Excludes Backend (BE) routes and focuses on client app navigation
 * @created 2025-12-23
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
  isPersonalTimeline?: boolean; // Personal timeline routes shown separately
  isDashboardItem?: boolean;    // Items in dashboard for editing
}

// ============================================================================
// USER SITEMAP - Routes for End Users (Khách hàng)
// ============================================================================

export const USER_SITEMAP: SitemapNode = {
  id: 'user-root',
  title: 'User Portal',
  titleVi: 'Cổng người dùng',
  icon: 'person-outline',
  roles: ['user'],
  children: [
    // ─────────────────────────────────────────────────────────────────────────
    // HOME & NAVIGATION
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'home',
      title: 'Home',
      titleVi: 'Trang chủ',
      route: '/(tabs)/index',
      icon: 'home-outline',
      roles: ['user'],
      children: [
        {
          id: 'search',
          title: 'Search',
          titleVi: 'Tìm kiếm',
          route: '/search',
          icon: 'search-outline',
          roles: ['user'],
        },
        {
          id: 'notifications',
          title: 'Notifications',
          titleVi: 'Thông báo',
          route: '/(tabs)/notifications',
          icon: 'notifications-outline',
          roles: ['user'],
          isPersonalTimeline: true,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MY PROJECTS - Personal Timeline (Không trong Dashboard)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'my-projects',
      title: 'My Projects',
      titleVi: 'Dự án của tôi',
      route: '/(tabs)/projects',
      icon: 'folder-outline',
      roles: ['user'],
      isPersonalTimeline: true,
      children: [
        {
          id: 'project-create',
          title: 'Create Project',
          titleVi: 'Tạo dự án mới',
          route: '/projects/create',
          icon: 'add-circle-outline',
          roles: ['user'],
          isPersonalTimeline: true,
        },
        {
          id: 'construction-progress',
          title: 'Construction Progress',
          titleVi: 'Tiến độ thi công',
          route: '/construction-progress',
          icon: 'construct-outline',
          roles: ['user'],
          isPersonalTimeline: true,
        },
        {
          id: 'timeline',
          title: 'Timeline',
          titleVi: 'Lịch trình',
          route: '/timeline/index',
          icon: 'time-outline',
          roles: ['user'],
          isPersonalTimeline: true,
        },
        {
          id: 'budget',
          title: 'Budget',
          titleVi: 'Ngân sách',
          route: '/budget/index',
          icon: 'wallet-outline',
          roles: ['user'],
          isPersonalTimeline: true,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SERVICES - Main Services for Users
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'services',
      title: 'Services',
      titleVi: 'Dịch vụ',
      icon: 'briefcase-outline',
      roles: ['user'],
      children: [
        {
          id: 'house-design',
          title: 'House Design',
          titleVi: 'Thiết kế nhà',
          route: '/services/house-design',
          icon: 'home-outline',
          roles: ['user'],
          badge: 'HOT',
        },
        {
          id: 'interior-design',
          title: 'Interior Design',
          titleVi: 'Thiết kế nội thất',
          route: '/services/interior-design',
          icon: 'color-palette-outline',
          roles: ['user'],
        },
        {
          id: 'construction-company',
          title: 'Construction Company',
          titleVi: 'Nhà thầu xây dựng',
          route: '/services/construction-company',
          icon: 'business-outline',
          roles: ['user'],
        },
        {
          id: 'quality-supervision',
          title: 'Quality Supervision',
          titleVi: 'Giám sát chất lượng',
          route: '/services/quality-supervision',
          icon: 'eye-outline',
          roles: ['user'],
          badge: 'PRO',
        },
        {
          id: 'feng-shui',
          title: 'Feng Shui',
          titleVi: 'Phong thủy',
          route: '/services/feng-shui',
          icon: 'compass-outline',
          roles: ['user'],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTRUCTION WORKFORCE - Hiring Workers
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'workforce',
      title: 'Workforce',
      titleVi: 'Nhân công',
      icon: 'people-outline',
      roles: ['user'],
      children: [
        {
          id: 'tho-xay',
          title: 'Masons',
          titleVi: 'Thợ xây',
          route: '/utilities/tho-xay',
          icon: 'hammer-outline',
          roles: ['user'],
        },
        {
          id: 'tho-dien-nuoc',
          title: 'Electrician & Plumber',
          titleVi: 'Thợ điện nước',
          route: '/utilities/tho-dien-nuoc',
          icon: 'flash-outline',
          roles: ['user'],
        },
        {
          id: 'tho-coffa',
          title: 'Formwork',
          titleVi: 'Thợ cốt pha',
          route: '/utilities/tho-coffa',
          icon: 'grid-outline',
          roles: ['user'],
        },
        {
          id: 'design-team',
          title: 'Design Team',
          titleVi: 'Đội thiết kế',
          route: '/utilities/design-team',
          icon: 'brush-outline',
          roles: ['user'],
        },
        {
          id: 'labor-index',
          title: 'All Workers',
          titleVi: 'Tất cả nhân công',
          route: '/labor/index',
          icon: 'people-circle-outline',
          roles: ['user'],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MATERIALS & EQUIPMENT
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'materials',
      title: 'Materials',
      titleVi: 'Vật liệu',
      icon: 'cube-outline',
      roles: ['user'],
      children: [
        {
          id: 'ep-coc',
          title: 'Pile Driving',
          titleVi: 'Ép cọc',
          route: '/utilities/ep-coc',
          icon: 'arrow-down-outline',
          roles: ['user'],
        },
        {
          id: 'dao-dat',
          title: 'Excavation',
          titleVi: 'Đào đất',
          route: '/utilities/dao-dat',
          icon: 'construct-outline',
          roles: ['user'],
        },
        {
          id: 'be-tong',
          title: 'Concrete',
          titleVi: 'Bê tông',
          route: '/utilities/be-tong',
          icon: 'layers-outline',
          roles: ['user'],
        },
        {
          id: 'vat-lieu',
          title: 'Building Materials',
          titleVi: 'Vật liệu xây dựng',
          route: '/utilities/vat-lieu',
          icon: 'cube-outline',
          roles: ['user'],
        },
        {
          id: 'materials-index',
          title: 'Materials Catalog',
          titleVi: 'Danh mục vật liệu',
          route: '/materials/index',
          icon: 'list-outline',
          roles: ['user'],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FINISHING WORKS
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'finishing',
      title: 'Finishing Works',
      titleVi: 'Hoàn thiện',
      route: '/finishing',
      icon: 'color-palette-outline',
      roles: ['user'],
      badge: 'HOT',
      children: [
        {
          id: 'noi-that',
          title: 'Interior',
          titleVi: 'Nội thất',
          route: '/finishing/noi-that',
          icon: 'bed-outline',
          roles: ['user'],
          badge: 'HOT',
        },
        {
          id: 'lat-gach',
          title: 'Tiling',
          titleVi: 'Lát gạch',
          route: '/finishing/lat-gach-new',
          icon: 'grid-outline',
          roles: ['user'],
        },
        {
          id: 'son',
          title: 'Painting',
          titleVi: 'Sơn',
          route: '/finishing/son-new',
          icon: 'brush-outline',
          roles: ['user'],
        },
        {
          id: 'thach-cao',
          title: 'Drywall',
          titleVi: 'Thạch cao',
          route: '/finishing/thach-cao-new',
          icon: 'square-outline',
          roles: ['user'],
        },
        {
          id: 'lam-cua',
          title: 'Doors & Windows',
          titleVi: 'Làm cửa',
          route: '/finishing/lam-cua',
          icon: 'tablet-landscape-outline',
          roles: ['user'],
        },
        {
          id: 'lan-can',
          title: 'Railings',
          titleVi: 'Lan can',
          route: '/finishing/lan-can',
          icon: 'remove-outline',
          roles: ['user'],
        },
        {
          id: 'op-da',
          title: 'Stone',
          titleVi: 'Ốp đá',
          route: '/finishing/op-da',
          icon: 'diamond-outline',
          roles: ['user'],
        },
        {
          id: 'dien-nuoc',
          title: 'Electrical & Plumbing',
          titleVi: 'Điện nước',
          route: '/finishing/dien-nuoc',
          icon: 'flash-outline',
          roles: ['user'],
        },
        {
          id: 'camera',
          title: 'Security Camera',
          titleVi: 'Camera an ninh',
          route: '/finishing/camera',
          icon: 'videocam-outline',
          roles: ['user'],
        },
        {
          id: 'tho-tong-hop',
          title: 'General Workers',
          titleVi: 'Thợ tổng hợp',
          route: '/finishing/tho-tong-hop',
          icon: 'construct-outline',
          roles: ['user'],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SHOPPING
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'shopping',
      title: 'Shopping',
      titleVi: 'Mua sắm',
      route: '/shopping/index',
      icon: 'cart-outline',
      roles: ['user'],
      badge: 'HOT',
      children: [
        {
          id: 'shop-construction',
          title: 'Construction Materials',
          titleVi: 'VLXD',
          route: '/shopping/index?cat=construction',
          icon: 'cube-outline',
          roles: ['user'],
        },
        {
          id: 'shop-electrical',
          title: 'Electrical',
          titleVi: 'Thiết bị điện',
          route: '/shopping/index?cat=electrical',
          icon: 'flash-outline',
          roles: ['user'],
        },
        {
          id: 'shop-furniture',
          title: 'Furniture',
          titleVi: 'Nội thất',
          route: '/shopping/index?cat=furniture',
          icon: 'bed-outline',
          roles: ['user'],
        },
        {
          id: 'shop-paint',
          title: 'Paint & Colors',
          titleVi: 'Sơn màu',
          route: '/shopping/index?cat=paint',
          icon: 'color-fill-outline',
          roles: ['user'],
        },
        {
          id: 'cart',
          title: 'Cart',
          titleVi: 'Giỏ hàng',
          route: '/cart',
          icon: 'basket-outline',
          roles: ['user'],
        },
        {
          id: 'checkout',
          title: 'Checkout',
          titleVi: 'Thanh toán',
          route: '/checkout',
          icon: 'card-outline',
          roles: ['user'],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // QUICK TOOLS
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'tools',
      title: 'Quick Tools',
      titleVi: 'Công cụ',
      icon: 'flash-outline',
      roles: ['user'],
      children: [
        {
          id: 'cost-estimator',
          title: 'Cost Estimator',
          titleVi: 'Ước tính chi phí',
          route: '/utilities/cost-estimator',
          icon: 'calculator-outline',
          roles: ['user'],
          badge: 'HOT',
        },
        {
          id: 'quote-request',
          title: 'Quote Request',
          titleVi: 'Yêu cầu báo giá',
          route: '/quote-request',
          icon: 'document-text-outline',
          roles: ['user'],
        },
        {
          id: 'my-qr',
          title: 'My QR Code',
          titleVi: 'Mã QR của tôi',
          route: '/utilities/my-qr-code',
          icon: 'qr-code-outline',
          roles: ['user'],
        },
        {
          id: 'store-locator',
          title: 'Store Locator',
          titleVi: 'Tìm cửa hàng',
          route: '/utilities/store-locator',
          icon: 'location-outline',
          roles: ['user'],
        },
        {
          id: 'ai-assistant',
          title: 'AI Assistant',
          titleVi: 'Trợ lý AI',
          route: '/ai',
          icon: 'sparkles-outline',
          roles: ['user'],
          badge: 'NEW',
        },
        {
          id: 'weather',
          title: 'Weather',
          titleVi: 'Thời tiết',
          route: '/weather/index',
          icon: 'partly-sunny-outline',
          roles: ['user'],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // COMMUNICATION & MEDIA
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'communication',
      title: 'Communication',
      titleVi: 'Liên lạc',
      icon: 'chatbubbles-outline',
      roles: ['user'],
      children: [
        {
          id: 'messages',
          title: 'Messages',
          titleVi: 'Tin nhắn',
          route: '/messages/index',
          icon: 'mail-outline',
          roles: ['user'],
          isPersonalTimeline: true,
        },
        {
          id: 'video-call',
          title: 'Video Call',
          titleVi: 'Gọi video',
          route: '/call/active',
          icon: 'videocam-outline',
          roles: ['user'],
        },
        {
          id: 'live-stream',
          title: 'Live Stream',
          titleVi: 'Phát trực tiếp',
          route: '/(tabs)/live',
          icon: 'radio-outline',
          roles: ['user'],
          badge: 'HOT',
        },
        {
          id: 'videos',
          title: 'Videos',
          titleVi: 'Video',
          route: '/videos/index',
          icon: 'play-circle-outline',
          roles: ['user'],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PROFILE & SETTINGS - In Dashboard
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'profile',
      title: 'Profile',
      titleVi: 'Tài khoản',
      route: '/(tabs)/profile',
      icon: 'person-circle-outline',
      roles: ['user'],
      isDashboardItem: true,
      children: [
        {
          id: 'profile-edit',
          title: 'Edit Profile',
          titleVi: 'Chỉnh sửa hồ sơ',
          route: '/profile/edit',
          icon: 'create-outline',
          roles: ['user'],
          isDashboardItem: true,
        },
        {
          id: 'profile-settings',
          title: 'Settings',
          titleVi: 'Cài đặt',
          route: '/profile/settings',
          icon: 'settings-outline',
          roles: ['user'],
          isDashboardItem: true,
        },
        {
          id: 'profile-orders',
          title: 'Orders',
          titleVi: 'Đơn hàng',
          route: '/profile/orders',
          icon: 'receipt-outline',
          roles: ['user'],
          isDashboardItem: true,
          isPersonalTimeline: true,
        },
        {
          id: 'profile-favorites',
          title: 'Favorites',
          titleVi: 'Yêu thích',
          route: '/profile/favorites',
          icon: 'heart-outline',
          roles: ['user'],
          isDashboardItem: true,
        },
        {
          id: 'profile-addresses',
          title: 'Addresses',
          titleVi: 'Địa chỉ',
          route: '/profile/addresses',
          icon: 'location-outline',
          roles: ['user'],
          isDashboardItem: true,
        },
        {
          id: 'profile-payment',
          title: 'Payment Methods',
          titleVi: 'Thanh toán',
          route: '/profile/payment',
          icon: 'card-outline',
          roles: ['user'],
          isDashboardItem: true,
        },
        {
          id: 'profile-rewards',
          title: 'Rewards',
          titleVi: 'Điểm thưởng',
          route: '/profile/rewards',
          icon: 'gift-outline',
          roles: ['user'],
          isDashboardItem: true,
        },
        {
          id: 'profile-help',
          title: 'Help',
          titleVi: 'Trợ giúp',
          route: '/profile/help',
          icon: 'help-circle-outline',
          roles: ['user'],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // LEGAL
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'legal',
      title: 'Legal',
      titleVi: 'Pháp lý',
      icon: 'document-text-outline',
      roles: ['user'],
      children: [
        {
          id: 'terms',
          title: 'Terms of Service',
          titleVi: 'Điều khoản',
          route: '/legal/terms',
          icon: 'document-outline',
          roles: ['user'],
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          titleVi: 'Chính sách bảo mật',
          route: '/legal/privacy-policy',
          icon: 'shield-outline',
          roles: ['user'],
        },
      ],
    },
  ],
};

// ============================================================================
// EMPLOYEE SITEMAP - Routes for Employees (Nhân viên)
// ============================================================================

export const EMPLOYEE_SITEMAP: SitemapNode = {
  id: 'employee-root',
  title: 'Employee Portal',
  titleVi: 'Cổng nhân viên',
  icon: 'briefcase-outline',
  roles: ['employee'],
  children: [
    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'emp-dashboard',
      title: 'Dashboard',
      titleVi: 'Bảng điều khiển',
      route: '/dashboard/index',
      icon: 'speedometer-outline',
      roles: ['employee'],
      isDashboardItem: true,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PROJECT MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'emp-projects',
      title: 'Project Management',
      titleVi: 'Quản lý dự án',
      icon: 'folder-open-outline',
      roles: ['employee'],
      isDashboardItem: true,
      children: [
        {
          id: 'emp-all-projects',
          title: 'All Projects',
          titleVi: 'Tất cả dự án',
          route: '/projects',
          icon: 'albums-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-construction-tracking',
          title: 'Construction Tracking',
          titleVi: 'Theo dõi thi công',
          route: '/construction/tracking',
          icon: 'analytics-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-map-view',
          title: 'Map View',
          titleVi: 'Bản đồ công trình',
          route: '/construction/map-view',
          icon: 'map-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-booking',
          title: 'Scheduling',
          titleVi: 'Lịch hẹn',
          route: '/construction/booking',
          icon: 'calendar-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // QUALITY & SAFETY
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'emp-quality',
      title: 'Quality & Safety',
      titleVi: 'Chất lượng & An toàn',
      icon: 'shield-checkmark-outline',
      roles: ['employee'],
      isDashboardItem: true,
      children: [
        {
          id: 'emp-qa',
          title: 'Quality Assurance',
          titleVi: 'Đảm bảo chất lượng',
          route: '/quality-assurance/index',
          icon: 'checkmark-done-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-safety',
          title: 'Safety Management',
          titleVi: 'An toàn lao động',
          route: '/safety/index',
          icon: 'warning-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-inspection',
          title: 'Inspection',
          titleVi: 'Kiểm tra',
          route: '/inspection/index',
          icon: 'search-outline',
          roles: ['employee'],
          badge: 'PRO',
          isDashboardItem: true,
        },
        {
          id: 'emp-punch-list',
          title: 'Punch List',
          titleVi: 'Danh sách sửa chữa',
          route: '/punch-list/index',
          icon: 'list-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DOCUMENTS & REPORTS
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'emp-docs',
      title: 'Documents',
      titleVi: 'Tài liệu',
      icon: 'documents-outline',
      roles: ['employee'],
      isDashboardItem: true,
      children: [
        {
          id: 'emp-doc-folders',
          title: 'Document Folders',
          titleVi: 'Thư mục tài liệu',
          route: '/documents/folders',
          icon: 'folder-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-reports',
          title: 'Reports',
          titleVi: 'Báo cáo',
          route: '/reports/index',
          icon: 'stats-chart-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-daily-report',
          title: 'Daily Report',
          titleVi: 'Nhật ký công trình',
          route: '/daily-report/index',
          icon: 'today-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-rfi',
          title: 'RFI',
          titleVi: 'Yêu cầu thông tin',
          route: '/rfi/index',
          icon: 'help-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-submittal',
          title: 'Submittals',
          titleVi: 'Hồ sơ nộp',
          route: '/submittal/index',
          icon: 'document-attach-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // RESOURCES
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'emp-resources',
      title: 'Resources',
      titleVi: 'Tài nguyên',
      icon: 'cube-outline',
      roles: ['employee'],
      isDashboardItem: true,
      children: [
        {
          id: 'emp-materials',
          title: 'Materials',
          titleVi: 'Vật liệu',
          route: '/materials/index',
          icon: 'layers-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-labor',
          title: 'Labor',
          titleVi: 'Nhân công',
          route: '/labor/index',
          icon: 'people-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-equipment',
          title: 'Equipment',
          titleVi: 'Thiết bị',
          route: '/equipment/index',
          icon: 'hardware-chip-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-inventory',
          title: 'Inventory',
          titleVi: 'Kho hàng',
          route: '/inventory/index',
          icon: 'archive-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-fleet',
          title: 'Fleet',
          titleVi: 'Phương tiện',
          route: '/fleet/index',
          icon: 'car-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CONTRACTS & FINANCE
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'emp-finance',
      title: 'Contracts & Finance',
      titleVi: 'Hợp đồng & Tài chính',
      icon: 'wallet-outline',
      roles: ['employee'],
      isDashboardItem: true,
      children: [
        {
          id: 'emp-contracts',
          title: 'Contracts',
          titleVi: 'Hợp đồng',
          route: '/contracts/index',
          icon: 'document-text-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-budget',
          title: 'Budget',
          titleVi: 'Ngân sách',
          route: '/budget/index',
          icon: 'cash-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-procurement',
          title: 'Procurement',
          titleVi: 'Mua sắm',
          route: '/procurement/index',
          icon: 'cart-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-change-order',
          title: 'Change Orders',
          titleVi: 'Thay đổi đơn hàng',
          route: '/change-order/index',
          icon: 'swap-horizontal-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // RISK & WARRANTY
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'emp-advanced',
      title: 'Advanced',
      titleVi: 'Nâng cao',
      icon: 'trophy-outline',
      roles: ['employee'],
      isDashboardItem: true,
      children: [
        {
          id: 'emp-risk',
          title: 'Risk Management',
          titleVi: 'Quản lý rủi ro',
          route: '/risk/index',
          icon: 'alert-circle-outline',
          roles: ['employee'],
          badge: 'PRO',
          isDashboardItem: true,
        },
        {
          id: 'emp-warranty',
          title: 'Warranty',
          titleVi: 'Bảo hành',
          route: '/warranty/index',
          icon: 'shield-outline',
          roles: ['employee'],
          badge: 'PRO',
          isDashboardItem: true,
        },
        {
          id: 'emp-commissioning',
          title: 'Commissioning',
          titleVi: 'Nghiệm thu',
          route: '/commissioning/index',
          icon: 'checkbox-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-om-manuals',
          title: 'O&M Manuals',
          titleVi: 'Tài liệu vận hành',
          route: '/om-manuals/index',
          icon: 'book-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // COMMUNICATION
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'emp-communication',
      title: 'Communication',
      titleVi: 'Liên lạc',
      icon: 'chatbubbles-outline',
      roles: ['employee'],
      children: [
        {
          id: 'emp-messages',
          title: 'Messages',
          titleVi: 'Tin nhắn',
          route: '/messages/index',
          icon: 'mail-outline',
          roles: ['employee'],
          isPersonalTimeline: true,
        },
        {
          id: 'emp-meeting-minutes',
          title: 'Meeting Minutes',
          titleVi: 'Biên bản họp',
          route: '/meeting-minutes/index',
          icon: 'document-text-outline',
          roles: ['employee'],
          isDashboardItem: true,
        },
        {
          id: 'emp-notifications',
          title: 'Notifications',
          titleVi: 'Thông báo',
          route: '/(tabs)/notifications',
          icon: 'notifications-outline',
          roles: ['employee'],
          isPersonalTimeline: true,
        },
      ],
    },
  ],
};

// ============================================================================
// ADMIN SITEMAP - Routes for Administrators
// ============================================================================

export const ADMIN_SITEMAP: SitemapNode = {
  id: 'admin-root',
  title: 'Admin Portal',
  titleVi: 'Cổng quản trị',
  icon: 'settings-outline',
  roles: ['admin'],
  children: [
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      titleVi: 'Bảng điều khiển',
      route: '/admin/dashboard',
      icon: 'speedometer-outline',
      roles: ['admin'],
      isDashboardItem: true,
    },
    {
      id: 'admin-products',
      title: 'Product Management',
      titleVi: 'Quản lý sản phẩm',
      route: '/admin/products',
      icon: 'cube-outline',
      roles: ['admin'],
      isDashboardItem: true,
    },
    {
      id: 'admin-staff',
      title: 'Staff Management',
      titleVi: 'Quản lý nhân viên',
      route: '/admin/staff',
      icon: 'people-outline',
      roles: ['admin'],
      isDashboardItem: true,
    },
    {
      id: 'admin-roles',
      title: 'Roles & Permissions',
      titleVi: 'Phân quyền',
      route: '/admin/roles',
      icon: 'key-outline',
      roles: ['admin'],
      isDashboardItem: true,
    },
    {
      id: 'admin-settings',
      title: 'Settings',
      titleVi: 'Cài đặt',
      route: '/admin/settings',
      icon: 'settings-outline',
      roles: ['admin'],
      isDashboardItem: true,
    },
    {
      id: 'admin-analytics',
      title: 'Analytics',
      titleVi: 'Phân tích',
      route: '/analytics',
      icon: 'bar-chart-outline',
      roles: ['admin'],
      isDashboardItem: true,
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all routes for a specific user role
 */
export const getRoutesByRole = (role: UserRole): SitemapNode => {
  switch (role) {
    case 'admin':
      return ADMIN_SITEMAP;
    case 'employee':
      return EMPLOYEE_SITEMAP;
    default:
      return USER_SITEMAP;
  }
};

/**
 * Flatten sitemap to array of routes
 */
export const flattenSitemap = (node: SitemapNode): SitemapNode[] => {
  const result: SitemapNode[] = [node];
  if (node.children) {
    node.children.forEach(child => {
      result.push(...flattenSitemap(child));
    });
  }
  return result;
};

/**
 * Get personal timeline routes (not in dashboard)
 */
export const getPersonalTimelineRoutes = (sitemap: SitemapNode): SitemapNode[] => {
  return flattenSitemap(sitemap).filter(node => node.isPersonalTimeline && node.route);
};

/**
 * Get dashboard-editable routes
 */
export const getDashboardRoutes = (sitemap: SitemapNode): SitemapNode[] => {
  return flattenSitemap(sitemap).filter(node => node.isDashboardItem && node.route);
};

/**
 * Search routes by keyword
 */
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

/**
 * Count total routes in sitemap
 */
export const countSitemapRoutes = (node: SitemapNode): number => {
  return flattenSitemap(node).filter(n => n.route).length;
};

// ============================================================================
// SITEMAP STATISTICS
// ============================================================================

export const SITEMAP_STATS = {
  user: countSitemapRoutes(USER_SITEMAP),
  employee: countSitemapRoutes(EMPLOYEE_SITEMAP),
  admin: countSitemapRoutes(ADMIN_SITEMAP),
  get total() {
    return this.user + this.employee + this.admin;
  },
};
