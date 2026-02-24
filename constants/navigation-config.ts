/**
 * Navigation Configuration - Cấu hình điều hướng theo vai trò
 * Định nghĩa Tab Bar và Drawer cho từng loại user
 * @created 2025-12-23
 */

import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'guest' | 'user' | 'employee' | 'admin';

export interface TabConfig {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  badge?: number;
  route: string;
}

export interface DrawerSection {
  title: string;
  items: DrawerItem[];
}

export interface DrawerItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: string | number;
  isNew?: boolean;
}

// ============================================================================
// THEME COLORS BY ROLE
// ============================================================================

export const ROLE_THEMES = {
  guest: {
    primary: '#666666',
    tabBarActiveTint: '#000000',
    tabBarInactiveTint: '#B2BEC3',
    headerBackground: '#FFFFFF',
    headerTint: '#000000',
    accent: '#0D9488',
  },
  user: {
    primary: '#0D9488',
    tabBarActiveTint: '#0D9488',
    tabBarInactiveTint: '#B2BEC3',
    headerBackground: '#0D9488',
    headerTint: '#FFFFFF',
    accent: '#0D9488',
  },
  employee: {
    primary: '#14B8A6',
    tabBarActiveTint: '#14B8A6',
    tabBarInactiveTint: '#B2BEC3',
    headerBackground: '#14B8A6',
    headerTint: '#FFFFFF',
    accent: '#0D9488',
  },
  admin: {
    primary: '#6C5CE7',
    tabBarActiveTint: '#6C5CE7',
    tabBarInactiveTint: '#B2BEC3',
    headerBackground: '#6C5CE7',
    headerTint: '#FFFFFF',
    accent: '#0D9488',
  },
};

// ============================================================================
// TAB CONFIGURATIONS BY ROLE
// ============================================================================

/**
 * Guest Tabs (Not logged in)
 * - Minimal navigation
 * - Focus on discovery and auth
 */
export const GUEST_TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Khám phá',
    icon: 'compass-outline',
    iconFocused: 'compass',
    route: '/(tabs)',
  },
  {
    name: 'shopping',
    title: 'Mua sắm',
    icon: 'storefront-outline',
    iconFocused: 'storefront',
    route: '/shopping',
  },
  {
    name: 'live',
    title: 'Live',
    icon: 'radio-outline',
    iconFocused: 'radio',
    route: '/(tabs)/live',
  },
  {
    name: 'login',
    title: 'Đăng nhập',
    icon: 'person-outline',
    iconFocused: 'person',
    route: '/(auth)/login',
  },
];

/**
 * User Tabs (Regular user)
 * - Focus on shopping, services, projects
 * - Personal management
 */
export const USER_TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Trang chủ',
    icon: 'home-outline',
    iconFocused: 'home',
    route: '/(tabs)',
  },
  {
    name: 'shopping',
    title: 'Mua sắm',
    icon: 'cart-outline',
    iconFocused: 'cart',
    route: '/shopping',
  },
  {
    name: 'projects',
    title: 'Dự án',
    icon: 'folder-outline',
    iconFocused: 'folder',
    route: '/(tabs)/projects',
  },
  {
    name: 'notifications',
    title: 'Thông báo',
    icon: 'notifications-outline',
    iconFocused: 'notifications',
    route: '/(tabs)/notifications',
  },
  {
    name: 'profile',
    title: 'Cá nhân',
    icon: 'person-outline',
    iconFocused: 'person',
    route: '/(tabs)/profile',
  },
];

/**
 * Employee Tabs (Staff)
 * - Focus on work management
 * - Task tracking, reports
 */
export const EMPLOYEE_TABS: TabConfig[] = [
  {
    name: 'dashboard',
    title: 'Công việc',
    icon: 'grid-outline',
    iconFocused: 'grid',
    route: '/dashboard',
  },
  {
    name: 'tasks',
    title: 'Nhiệm vụ',
    icon: 'checkbox-outline',
    iconFocused: 'checkbox',
    route: '/projects',
  },
  {
    name: 'reports',
    title: 'Báo cáo',
    icon: 'document-text-outline',
    iconFocused: 'document-text',
    route: '/daily-report',
  },
  {
    name: 'messages',
    title: 'Tin nhắn',
    icon: 'chatbubbles-outline',
    iconFocused: 'chatbubbles',
    route: '/messages',
  },
  {
    name: 'profile',
    title: 'Cá nhân',
    icon: 'person-outline',
    iconFocused: 'person',
    route: '/(tabs)/profile',
  },
];

/**
 * Admin Tabs (Administrator)
 * - Full system control
 * - Analytics, management
 */
export const ADMIN_TABS: TabConfig[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    icon: 'stats-chart-outline',
    iconFocused: 'stats-chart',
    route: '/admin/dashboard',
  },
  {
    name: 'projects',
    title: 'Dự án',
    icon: 'briefcase-outline',
    iconFocused: 'briefcase',
    route: '/projects',
  },
  {
    name: 'management',
    title: 'Quản lý',
    icon: 'settings-outline',
    iconFocused: 'settings',
    route: '/admin/products',
  },
  {
    name: 'analytics',
    title: 'Phân tích',
    icon: 'bar-chart-outline',
    iconFocused: 'bar-chart',
    route: '/analytics',
  },
  {
    name: 'profile',
    title: 'Cá nhân',
    icon: 'person-outline',
    iconFocused: 'person',
    route: '/(tabs)/profile',
  },
];

/**
 * Get tabs by role
 */
export const getTabsByRole = (role: UserRole): TabConfig[] => {
  switch (role) {
    case 'guest': return GUEST_TABS;
    case 'user': return USER_TABS;
    case 'employee': return EMPLOYEE_TABS;
    case 'admin': return ADMIN_TABS;
    default: return USER_TABS;
  }
};

// ============================================================================
// DRAWER CONFIGURATIONS BY ROLE
// ============================================================================

/**
 * Guest Drawer Menu
 */
export const GUEST_DRAWER: DrawerSection[] = [
  {
    title: 'Khám phá',
    items: [
      { id: 'home', title: 'Trang chủ', icon: 'home-outline', route: '/' },
      { id: 'shopping', title: 'Mua sắm', icon: 'cart-outline', route: '/shopping' },
      { id: 'services', title: 'Dịch vụ', icon: 'briefcase-outline', route: '/services' },
      { id: 'live', title: 'Live', icon: 'radio-outline', route: '/(tabs)/live' },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { id: 'cost', title: 'Dự toán chi phí', icon: 'calculator-outline', route: '/utilities/cost-estimator' },
      { id: 'ai', title: 'Trợ lý AI', icon: 'sparkles-outline', route: '/ai' },
    ],
  },
  {
    title: 'Tài khoản',
    items: [
      { id: 'login', title: 'Đăng nhập', icon: 'log-in-outline', route: '/(auth)/login' },
      { id: 'register', title: 'Đăng ký', icon: 'person-add-outline', route: '/(auth)/register' },
    ],
  },
];

/**
 * User Drawer Menu
 */
export const USER_DRAWER: DrawerSection[] = [
  {
    title: 'Chính',
    items: [
      { id: 'home', title: 'Trang chủ', icon: 'home-outline', route: '/' },
      { id: 'shopping', title: 'Mua sắm', icon: 'cart-outline', route: '/shopping' },
      { id: 'cart', title: 'Giỏ hàng', icon: 'basket-outline', route: '/cart', badge: 0 },
    ],
  },
  {
    title: 'Dịch vụ',
    items: [
      { id: 'house-design', title: 'Thiết kế nhà', icon: 'home-outline', route: '/services/house-design' },
      { id: 'interior', title: 'Nội thất', icon: 'bed-outline', route: '/services/interior-design' },
      { id: 'construction', title: 'Dịch vụ xây dựng', icon: 'construct-outline', route: '/services/construction-company' },
      { id: 'booking', title: 'Đặt lịch', icon: 'calendar-outline', route: '/construction/booking' },
    ],
  },
  {
    title: 'Dự án của tôi',
    items: [
      { id: 'projects', title: 'Dự án', icon: 'folder-outline', route: '/(tabs)/projects' },
      { id: 'progress', title: 'Tiến độ', icon: 'trending-up-outline', route: '/construction-progress' },
      { id: 'timeline', title: 'Lịch trình', icon: 'git-network-outline', route: '/timeline' },
      { id: 'budget', title: 'Ngân sách', icon: 'cash-outline', route: '/budget' },
    ],
  },
  {
    title: 'Liên lạc',
    items: [
      { id: 'messages', title: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages' },
      { id: 'video-call', title: 'Gọi video', icon: 'videocam-outline', route: '/call/active' },
      { id: 'live', title: 'Live', icon: 'radio-outline', route: '/(tabs)/live' },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { id: 'ai', title: 'Trợ lý AI', icon: 'sparkles-outline', route: '/ai', isNew: true },
      { id: 'cost', title: 'Dự toán chi phí', icon: 'calculator-outline', route: '/utilities/cost-estimator' },
      { id: 'qr', title: 'Mã QR', icon: 'qr-code-outline', route: '/utilities/my-qr-code' },
      { id: 'weather', title: 'Thời tiết', icon: 'partly-sunny-outline', route: '/weather' },
    ],
  },
  {
    title: 'Cá nhân',
    items: [
      { id: 'profile', title: 'Hồ sơ', icon: 'person-outline', route: '/(tabs)/profile' },
      { id: 'orders', title: 'Đơn hàng', icon: 'receipt-outline', route: '/profile/orders' },
      { id: 'notifications', title: 'Thông báo', icon: 'notifications-outline', route: '/(tabs)/notifications' },
      { id: 'settings', title: 'Cài đặt', icon: 'settings-outline', route: '/profile/settings' },
    ],
  },
];

/**
 * Employee Drawer Menu
 */
export const EMPLOYEE_DRAWER: DrawerSection[] = [
  {
    title: 'Công việc',
    items: [
      { id: 'dashboard', title: 'Bảng điều khiển', icon: 'grid-outline', route: '/dashboard' },
      { id: 'tasks', title: 'Nhiệm vụ', icon: 'checkbox-outline', route: '/projects' },
      { id: 'schedule', title: 'Lịch làm việc', icon: 'calendar-outline', route: '/scheduled-tasks' },
    ],
  },
  {
    title: 'Dự án',
    items: [
      { id: 'projects', title: 'Dự án đang làm', icon: 'folder-outline', route: '/projects' },
      { id: 'progress', title: 'Tiến độ', icon: 'trending-up-outline', route: '/construction-progress' },
      { id: 'daily-report', title: 'Nhật ký công trình', icon: 'today-outline', route: '/daily-report' },
      { id: 'timeline', title: 'Lịch trình', icon: 'git-network-outline', route: '/timeline' },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      { id: 'qa', title: 'QA/QC', icon: 'checkmark-circle-outline', route: '/quality-assurance' },
      { id: 'safety', title: 'An toàn', icon: 'shield-outline', route: '/safety' },
      { id: 'inspection', title: 'Kiểm tra', icon: 'search-outline', route: '/inspection' },
      { id: 'materials', title: 'Vật liệu', icon: 'cube-outline', route: '/materials' },
      { id: 'labor', title: 'Nhân công', icon: 'people-outline', route: '/labor' },
    ],
  },
  {
    title: 'Tài liệu',
    items: [
      { id: 'documents', title: 'Tài liệu', icon: 'folder-outline', route: '/documents' },
      { id: 'reports', title: 'Báo cáo', icon: 'document-text-outline', route: '/reports' },
      { id: 'rfi', title: 'RFI', icon: 'help-circle-outline', route: '/rfi' },
      { id: 'submittal', title: 'Submittal', icon: 'paper-plane-outline', route: '/submittal' },
    ],
  },
  {
    title: 'Liên lạc',
    items: [
      { id: 'messages', title: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages' },
      { id: 'video-call', title: 'Gọi video', icon: 'videocam-outline', route: '/call/active' },
      { id: 'meetings', title: 'Biên bản họp', icon: 'people-outline', route: '/meeting-minutes' },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { id: 'ai', title: 'Trợ lý AI', icon: 'sparkles-outline', route: '/ai', isNew: true },
      { id: 'weather', title: 'Thời tiết', icon: 'partly-sunny-outline', route: '/weather' },
      { id: 'qr', title: 'Mã QR', icon: 'qr-code-outline', route: '/utilities/my-qr-code' },
    ],
  },
  {
    title: 'Cá nhân',
    items: [
      { id: 'profile', title: 'Hồ sơ', icon: 'person-outline', route: '/(tabs)/profile' },
      { id: 'notifications', title: 'Thông báo', icon: 'notifications-outline', route: '/(tabs)/notifications' },
      { id: 'settings', title: 'Cài đặt', icon: 'settings-outline', route: '/profile/settings' },
    ],
  },
];

/**
 * Admin Drawer Menu
 */
export const ADMIN_DRAWER: DrawerSection[] = [
  {
    title: 'Tổng quan',
    items: [
      { id: 'dashboard', title: 'Dashboard', icon: 'stats-chart-outline', route: '/admin/dashboard' },
      { id: 'analytics', title: 'Phân tích', icon: 'bar-chart-outline', route: '/analytics' },
      { id: 'reports', title: 'Báo cáo', icon: 'document-text-outline', route: '/reports' },
    ],
  },
  {
    title: 'Quản lý hệ thống',
    items: [
      { id: 'products', title: 'Sản phẩm', icon: 'pricetag-outline', route: '/admin/products' },
      { id: 'users', title: 'Người dùng', icon: 'people-outline', route: '/admin/staff' },
      { id: 'roles', title: 'Phân quyền', icon: 'key-outline', route: '/admin/roles' },
      { id: 'categories', title: 'Danh mục', icon: 'grid-outline', route: '/categories' },
    ],
  },
  {
    title: 'Dự án',
    items: [
      { id: 'projects', title: 'Tất cả dự án', icon: 'folder-outline', route: '/projects' },
      { id: 'progress', title: 'Tiến độ', icon: 'trending-up-outline', route: '/construction-progress' },
      { id: 'contracts', title: 'Hợp đồng', icon: 'document-outline', route: '/contracts' },
      { id: 'budget', title: 'Ngân sách', icon: 'cash-outline', route: '/budget' },
    ],
  },
  {
    title: 'Quản lý công việc',
    items: [
      { id: 'daily-report', title: 'Nhật ký công trình', icon: 'today-outline', route: '/daily-report' },
      { id: 'qa', title: 'QA/QC', icon: 'checkmark-circle-outline', route: '/quality-assurance' },
      { id: 'safety', title: 'An toàn', icon: 'shield-outline', route: '/safety' },
      { id: 'inspection', title: 'Kiểm tra', icon: 'search-outline', route: '/inspection' },
    ],
  },
  {
    title: 'Tài nguyên',
    items: [
      { id: 'materials', title: 'Vật liệu', icon: 'cube-outline', route: '/materials' },
      { id: 'labor', title: 'Nhân công', icon: 'people-outline', route: '/labor' },
      { id: 'inventory', title: 'Kho hàng', icon: 'archive-outline', route: '/inventory' },
      { id: 'equipment', title: 'Thiết bị', icon: 'hammer-outline', route: '/equipment' },
    ],
  },
  {
    title: 'Tài liệu',
    items: [
      { id: 'documents', title: 'Tất cả tài liệu', icon: 'folder-outline', route: '/documents' },
      { id: 'rfi', title: 'RFI', icon: 'help-circle-outline', route: '/rfi' },
      { id: 'submittal', title: 'Submittal', icon: 'paper-plane-outline', route: '/submittal' },
      { id: 'change-order', title: 'Change Orders', icon: 'swap-horizontal-outline', route: '/change-order' },
    ],
  },
  {
    title: 'Liên lạc',
    items: [
      { id: 'messages', title: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages' },
      { id: 'video-call', title: 'Gọi video', icon: 'videocam-outline', route: '/call/active' },
      { id: 'meetings', title: 'Biên bản họp', icon: 'people-outline', route: '/meeting-minutes' },
      { id: 'live', title: 'Live', icon: 'radio-outline', route: '/(tabs)/live' },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { id: 'ai', title: 'Trợ lý AI', icon: 'sparkles-outline', route: '/ai', isNew: true },
      { id: 'sitemap', title: 'Sơ đồ ứng dụng', icon: 'map-outline', route: '/sitemap' },
    ],
  },
  {
    title: 'Cài đặt',
    items: [
      { id: 'profile', title: 'Hồ sơ', icon: 'person-outline', route: '/(tabs)/profile' },
      { id: 'settings', title: 'Cài đặt hệ thống', icon: 'cog-outline', route: '/admin/settings' },
      { id: 'notifications', title: 'Thông báo', icon: 'notifications-outline', route: '/(tabs)/notifications' },
    ],
  },
];

/**
 * Get drawer menu by role
 */
export const getDrawerByRole = (role: UserRole): DrawerSection[] => {
  switch (role) {
    case 'guest': return GUEST_DRAWER;
    case 'user': return USER_DRAWER;
    case 'employee': return EMPLOYEE_DRAWER;
    case 'admin': return ADMIN_DRAWER;
    default: return USER_DRAWER;
  }
};

// ============================================================================
// QUICK ACTIONS (Home Screen)
// ============================================================================

export const USER_QUICK_ACTIONS = [
  { id: 'shopping', title: 'Mua sắm', icon: 'cart-outline', route: '/shopping', color: '#0D9488' },
  { id: 'booking', title: 'Đặt lịch', icon: 'calendar-outline', route: '/construction/booking', color: '#666666' },
  { id: 'progress', title: 'Tiến độ', icon: 'trending-up-outline', route: '/construction-progress', color: '#0D9488' },
  { id: 'ai', title: 'Trợ lý AI', icon: 'sparkles-outline', route: '/ai', color: '#0D9488' },
];

export const EMPLOYEE_QUICK_ACTIONS = [
  { id: 'tasks', title: 'Nhiệm vụ', icon: 'checkbox-outline', route: '/projects', color: '#6C5CE7' },
  { id: 'daily', title: 'Nhật ký', icon: 'today-outline', route: '/daily-report', color: '#14B8A6' },
  { id: 'qa', title: 'QA/QC', icon: 'checkmark-circle-outline', route: '/quality-assurance', color: '#666666' },
  { id: 'messages', title: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages', color: '#0984E3' },
];

export const ADMIN_QUICK_ACTIONS = [
  { id: 'analytics', title: 'Phân tích', icon: 'bar-chart-outline', route: '/analytics', color: '#0D9488' },
  { id: 'products', title: 'Sản phẩm', icon: 'pricetag-outline', route: '/admin/products', color: '#0D9488' },
  { id: 'users', title: 'Users', icon: 'people-outline', route: '/admin/staff', color: '#6C5CE7' },
  { id: 'reports', title: 'Báo cáo', icon: 'document-text-outline', route: '/reports', color: '#A29BFE' },
];

export const getQuickActionsByRole = (role: UserRole) => {
  switch (role) {
    case 'user': return USER_QUICK_ACTIONS;
    case 'employee': return EMPLOYEE_QUICK_ACTIONS;
    case 'admin': return ADMIN_QUICK_ACTIONS;
    default: return USER_QUICK_ACTIONS;
  }
};
