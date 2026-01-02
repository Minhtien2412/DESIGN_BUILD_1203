/**
 * App Module Registry - Định nghĩa tất cả modules trong app
 * Phân chia rõ ràng theo vai trò và chức năng
 * @created 2025-12-23
 */

import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'guest' | 'user' | 'employee' | 'admin';
export type ModuleStatus = 'active' | 'beta' | 'coming-soon' | 'deprecated';

export interface AppModule {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  roles: UserRole[];
  status: ModuleStatus;
  priority: number; // 1 = highest
  category: ModuleCategory;
  features?: string[];
  dependencies?: string[];
}

export type ModuleCategory =
  | 'core'           // Chức năng chính
  | 'shopping'       // Mua sắm
  | 'services'       // Dịch vụ
  | 'projects'       // Quản lý dự án
  | 'communication'  // Liên lạc
  | 'management'     // Quản lý (employee/admin)
  | 'analytics'      // Phân tích
  | 'tools'          // Công cụ tiện ích
  | 'settings';      // Cài đặt

// ============================================================================
// MODULE REGISTRY
// ============================================================================

export const APP_MODULES: AppModule[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // CORE MODULES
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'home',
    name: 'Home',
    nameVi: 'Trang chủ',
    description: 'Central hub for all app features',
    icon: 'home-outline',
    color: '#000000',
    route: '/(tabs)/index',
    roles: ['guest', 'user', 'employee', 'admin'],
    status: 'active',
    priority: 1,
    category: 'core',
  },
  {
    id: 'auth',
    name: 'Authentication',
    nameVi: 'Xác thực',
    description: 'Login, register, password management',
    icon: 'lock-closed-outline',
    color: '#4ECDC4',
    route: '/(auth)/login',
    roles: ['guest'],
    status: 'active',
    priority: 1,
    category: 'core',
    features: ['Login', 'Register', 'Forgot Password', 'Social Auth'],
  },
  {
    id: 'profile',
    name: 'Profile',
    nameVi: 'Cá nhân',
    description: 'User profile and settings',
    icon: 'person-outline',
    color: '#6C5CE7',
    route: '/(tabs)/profile',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 1,
    category: 'core',
    features: ['Edit Profile', 'Settings', 'Privacy', 'Security'],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    nameVi: 'Thông báo',
    description: 'Push notifications and alerts',
    icon: 'notifications-outline',
    color: '#FF6B6B',
    route: '/(tabs)/notifications',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'core',
  },
  {
    id: 'search',
    name: 'Search',
    nameVi: 'Tìm kiếm',
    description: 'Global search across app',
    icon: 'search-outline',
    color: '#45B7D1',
    route: '/search',
    roles: ['guest', 'user', 'employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'core',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SHOPPING MODULES (User)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'shopping',
    name: 'Shopping',
    nameVi: 'Mua sắm',
    description: 'Browse and purchase products',
    icon: 'cart-outline',
    color: '#EE4D2D',
    route: '/shopping/index',
    roles: ['guest', 'user'],
    status: 'active',
    priority: 1,
    category: 'shopping',
    features: ['Browse Products', 'Categories', 'Filters', 'Wishlist'],
  },
  {
    id: 'cart',
    name: 'Cart',
    nameVi: 'Giỏ hàng',
    description: 'Shopping cart management',
    icon: 'basket-outline',
    color: '#EE4D2D',
    route: '/cart',
    roles: ['user'],
    status: 'active',
    priority: 1,
    category: 'shopping',
  },
  {
    id: 'checkout',
    name: 'Checkout',
    nameVi: 'Thanh toán',
    description: 'Complete purchase',
    icon: 'card-outline',
    color: '#00B894',
    route: '/checkout',
    roles: ['user'],
    status: 'active',
    priority: 1,
    category: 'shopping',
    features: ['Payment Methods', 'Address Selection', 'Order Confirmation'],
  },
  {
    id: 'orders',
    name: 'My Orders',
    nameVi: 'Đơn hàng của tôi',
    description: 'View and track orders',
    icon: 'receipt-outline',
    color: '#FDCB6E',
    route: '/profile/orders',
    roles: ['user'],
    status: 'active',
    priority: 2,
    category: 'shopping',
    features: ['Order History', 'Tracking', 'Reorder', 'Reviews'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SERVICES MODULES (User)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'house-design',
    name: 'House Design',
    nameVi: 'Thiết kế nhà',
    description: 'Professional house design services',
    icon: 'home-outline',
    color: '#FF6B6B',
    route: '/services/house-design',
    roles: ['user'],
    status: 'active',
    priority: 1,
    category: 'services',
  },
  {
    id: 'interior-design',
    name: 'Interior Design',
    nameVi: 'Thiết kế nội thất',
    description: 'Interior decoration services',
    icon: 'bed-outline',
    color: '#A29BFE',
    route: '/services/interior-design',
    roles: ['user'],
    status: 'active',
    priority: 2,
    category: 'services',
  },
  {
    id: 'construction-services',
    name: 'Construction Services',
    nameVi: 'Dịch vụ xây dựng',
    description: 'Hire construction workers',
    icon: 'construct-outline',
    color: '#4ECDC4',
    route: '/services/construction-company',
    roles: ['user'],
    status: 'active',
    priority: 1,
    category: 'services',
    features: ['Mason', 'Electrician', 'Plumber', 'Formwork'],
  },
  {
    id: 'booking',
    name: 'Booking',
    nameVi: 'Đặt lịch',
    description: 'Schedule appointments',
    icon: 'calendar-outline',
    color: '#E91E63',
    route: '/construction/booking',
    roles: ['user'],
    status: 'active',
    priority: 2,
    category: 'services',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROJECT MODULES
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'my-projects',
    name: 'My Projects',
    nameVi: 'Dự án của tôi',
    description: 'Manage personal projects',
    icon: 'folder-outline',
    color: '#45B7D1',
    route: '/(tabs)/projects',
    roles: ['user'],
    status: 'active',
    priority: 1,
    category: 'projects',
    features: ['Create Project', 'Track Progress', 'Budget', 'Timeline'],
  },
  {
    id: 'project-management',
    name: 'Project Management',
    nameVi: 'Quản lý dự án',
    description: 'Manage assigned projects',
    icon: 'briefcase-outline',
    color: '#6C5CE7',
    route: '/projects',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 1,
    category: 'projects',
    features: ['All Projects', 'Assign Tasks', 'Reports', 'Documents'],
  },
  {
    id: 'construction-progress',
    name: 'Construction Progress',
    nameVi: 'Tiến độ thi công',
    description: 'Track construction progress',
    icon: 'trending-up-outline',
    color: '#00B894',
    route: '/construction-progress',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 1,
    category: 'projects',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    nameVi: 'Lịch trình',
    description: 'Project timeline management',
    icon: 'git-network-outline',
    color: '#6C5CE7',
    route: '/timeline/index',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'projects',
  },
  {
    id: 'budget',
    name: 'Budget',
    nameVi: 'Ngân sách',
    description: 'Budget tracking and management',
    icon: 'cash-outline',
    color: '#00B894',
    route: '/budget/index',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'projects',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COMMUNICATION MODULES
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'messages',
    name: 'Messages',
    nameVi: 'Tin nhắn',
    description: 'Chat and messaging',
    icon: 'chatbubbles-outline',
    color: '#0984E3',
    route: '/messages/index',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 1,
    category: 'communication',
  },
  {
    id: 'video-call',
    name: 'Video Call',
    nameVi: 'Gọi video',
    description: 'Video conferencing',
    icon: 'videocam-outline',
    color: '#9C27B0',
    route: '/call/active',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'communication',
  },
  {
    id: 'live',
    name: 'Live Stream',
    nameVi: 'Phát trực tiếp',
    description: 'Watch and create live streams',
    icon: 'radio-outline',
    color: '#FF3B30',
    route: '/(tabs)/live',
    roles: ['guest', 'user', 'employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'communication',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MANAGEMENT MODULES (Employee/Admin)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'employee-dashboard',
    name: 'Employee Dashboard',
    nameVi: 'Bảng điều khiển NV',
    description: 'Employee work dashboard',
    icon: 'grid-outline',
    color: '#4ECDC4',
    route: '/dashboard/index',
    roles: ['employee'],
    status: 'active',
    priority: 1,
    category: 'management',
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    nameVi: 'Bảng điều khiển Admin',
    description: 'Admin control center',
    icon: 'stats-chart-outline',
    color: '#EE4D2D',
    route: '/admin/dashboard',
    roles: ['admin'],
    status: 'active',
    priority: 1,
    category: 'management',
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    nameVi: 'QA/QC',
    description: 'Quality control management',
    icon: 'checkmark-circle-outline',
    color: '#FDCB6E',
    route: '/quality-assurance/index',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'management',
  },
  {
    id: 'safety',
    name: 'Safety',
    nameVi: 'An toàn lao động',
    description: 'Safety management',
    icon: 'shield-outline',
    color: '#E17055',
    route: '/safety/index',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'management',
  },
  {
    id: 'inspection',
    name: 'Inspection',
    nameVi: 'Kiểm tra',
    description: 'Site inspection',
    icon: 'search-outline',
    color: '#0984E3',
    route: '/inspection/index',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'management',
  },
  {
    id: 'daily-report',
    name: 'Daily Report',
    nameVi: 'Nhật ký công trình',
    description: 'Daily work reports',
    icon: 'today-outline',
    color: '#6C5CE7',
    route: '/daily-report/index',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 1,
    category: 'management',
  },
  {
    id: 'documents',
    name: 'Documents',
    nameVi: 'Tài liệu',
    description: 'Document management',
    icon: 'folder-outline',
    color: '#0984E3',
    route: '/documents/folders',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'management',
  },
  {
    id: 'materials',
    name: 'Materials',
    nameVi: 'Vật liệu',
    description: 'Material management',
    icon: 'cube-outline',
    color: '#FFEAA7',
    route: '/materials/index',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'management',
  },
  {
    id: 'labor',
    name: 'Labor',
    nameVi: 'Nhân công',
    description: 'Labor management',
    icon: 'people-outline',
    color: '#DFE6E9',
    route: '/labor/index',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'management',
  },
  {
    id: 'inventory',
    name: 'Inventory',
    nameVi: 'Kho hàng',
    description: 'Inventory tracking',
    icon: 'archive-outline',
    color: '#74B9FF',
    route: '/inventory/index',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 3,
    category: 'management',
  },
  {
    id: 'product-management',
    name: 'Product Management',
    nameVi: 'Quản lý sản phẩm',
    description: 'Manage products catalog',
    icon: 'pricetag-outline',
    color: '#EE4D2D',
    route: '/admin/products',
    roles: ['admin'],
    status: 'active',
    priority: 1,
    category: 'management',
  },
  {
    id: 'user-management',
    name: 'User Management',
    nameVi: 'Quản lý người dùng',
    description: 'Manage users and staff',
    icon: 'people-circle-outline',
    color: '#6C5CE7',
    route: '/admin/staff',
    roles: ['admin'],
    status: 'active',
    priority: 1,
    category: 'management',
  },
  {
    id: 'roles-permissions',
    name: 'Roles & Permissions',
    nameVi: 'Phân quyền',
    description: 'Role-based access control',
    icon: 'key-outline',
    color: '#E17055',
    route: '/admin/roles',
    roles: ['admin'],
    status: 'active',
    priority: 2,
    category: 'management',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYTICS MODULES
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'analytics',
    name: 'Analytics',
    nameVi: 'Phân tích',
    description: 'Business analytics',
    icon: 'bar-chart-outline',
    color: '#2196F3',
    route: '/analytics',
    roles: ['admin'],
    status: 'active',
    priority: 1,
    category: 'analytics',
  },
  {
    id: 'reports',
    name: 'Reports',
    nameVi: 'Báo cáo',
    description: 'Generate reports',
    icon: 'document-text-outline',
    color: '#A29BFE',
    route: '/reports/index',
    roles: ['employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'analytics',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TOOLS MODULES
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    nameVi: 'Trợ lý AI',
    description: 'AI-powered assistant',
    icon: 'sparkles-outline',
    color: '#8B5CF6',
    route: '/ai',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 1,
    category: 'tools',
  },
  {
    id: 'cost-estimator',
    name: 'Cost Estimator',
    nameVi: 'Dự toán chi phí',
    description: 'Estimate construction costs',
    icon: 'calculator-outline',
    color: '#00B894',
    route: '/utilities/cost-estimator',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 1,
    category: 'tools',
  },
  {
    id: 'weather',
    name: 'Weather',
    nameVi: 'Thời tiết',
    description: 'Weather forecast',
    icon: 'partly-sunny-outline',
    color: '#87CEEB',
    route: '/weather/index',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 3,
    category: 'tools',
  },
  {
    id: 'qr-code',
    name: 'QR Code',
    nameVi: 'Mã QR',
    description: 'QR code scanner and generator',
    icon: 'qr-code-outline',
    color: '#000000',
    route: '/utilities/my-qr-code',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 3,
    category: 'tools',
  },
  {
    id: 'sitemap',
    name: 'Sitemap',
    nameVi: 'Sơ đồ ứng dụng',
    description: 'App navigation map',
    icon: 'map-outline',
    color: '#A29BFE',
    route: '/sitemap',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 3,
    category: 'tools',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SETTINGS MODULES
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'settings',
    name: 'Settings',
    nameVi: 'Cài đặt',
    description: 'App settings',
    icon: 'settings-outline',
    color: '#636E72',
    route: '/profile/settings',
    roles: ['user', 'employee', 'admin'],
    status: 'active',
    priority: 2,
    category: 'settings',
  },
  {
    id: 'admin-settings',
    name: 'System Settings',
    nameVi: 'Cài đặt hệ thống',
    description: 'System configuration',
    icon: 'cog-outline',
    color: '#E17055',
    route: '/admin/settings',
    roles: ['admin'],
    status: 'active',
    priority: 1,
    category: 'settings',
  },
  {
    id: 'legal',
    name: 'Legal',
    nameVi: 'Pháp lý',
    description: 'Terms and privacy',
    icon: 'document-text-outline',
    color: '#636E72',
    route: '/legal/index',
    roles: ['guest', 'user', 'employee', 'admin'],
    status: 'active',
    priority: 3,
    category: 'settings',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get modules by role
 */
export const getModulesByRole = (role: UserRole): AppModule[] => {
  return APP_MODULES.filter(m => m.roles.includes(role) && m.status === 'active');
};

/**
 * Get modules by category
 */
export const getModulesByCategory = (category: ModuleCategory): AppModule[] => {
  return APP_MODULES.filter(m => m.category === category && m.status === 'active');
};

/**
 * Get modules for a role, grouped by category
 */
export const getModulesGroupedByCategory = (role: UserRole): Record<ModuleCategory, AppModule[]> => {
  const modules = getModulesByRole(role);
  const grouped: Record<string, AppModule[]> = {};

  modules.forEach(m => {
    if (!grouped[m.category]) {
      grouped[m.category] = [];
    }
    grouped[m.category].push(m);
  });

  // Sort each category by priority
  Object.keys(grouped).forEach(cat => {
    grouped[cat].sort((a, b) => a.priority - b.priority);
  });

  return grouped as Record<ModuleCategory, AppModule[]>;
};

/**
 * Get top priority modules for a role
 */
export const getTopModules = (role: UserRole, limit: number = 8): AppModule[] => {
  return getModulesByRole(role)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
};

/**
 * Check if a module is accessible by a role
 */
export const canAccessModule = (moduleId: string, role: UserRole): boolean => {
  const module = APP_MODULES.find(m => m.id === moduleId);
  return module ? module.roles.includes(role) : false;
};

/**
 * Get module by ID
 */
export const getModuleById = (id: string): AppModule | undefined => {
  return APP_MODULES.find(m => m.id === id);
};

/**
 * Get module by route
 */
export const getModuleByRoute = (route: string): AppModule | undefined => {
  return APP_MODULES.find(m => m.route === route);
};

// ============================================================================
// CATEGORY METADATA
// ============================================================================

export const CATEGORY_META: Record<ModuleCategory, { name: string; nameVi: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  core: { name: 'Core', nameVi: 'Chức năng chính', icon: 'star-outline', color: '#000000' },
  shopping: { name: 'Shopping', nameVi: 'Mua sắm', icon: 'cart-outline', color: '#EE4D2D' },
  services: { name: 'Services', nameVi: 'Dịch vụ', icon: 'briefcase-outline', color: '#4ECDC4' },
  projects: { name: 'Projects', nameVi: 'Dự án', icon: 'folder-outline', color: '#45B7D1' },
  communication: { name: 'Communication', nameVi: 'Liên lạc', icon: 'chatbubbles-outline', color: '#0984E3' },
  management: { name: 'Management', nameVi: 'Quản lý', icon: 'business-outline', color: '#6C5CE7' },
  analytics: { name: 'Analytics', nameVi: 'Phân tích', icon: 'bar-chart-outline', color: '#2196F3' },
  tools: { name: 'Tools', nameVi: 'Công cụ', icon: 'hammer-outline', color: '#FF9800' },
  settings: { name: 'Settings', nameVi: 'Cài đặt', icon: 'settings-outline', color: '#636E72' },
};

// ============================================================================
// STATISTICS
// ============================================================================

export const MODULE_STATS = {
  total: APP_MODULES.length,
  active: APP_MODULES.filter(m => m.status === 'active').length,
  beta: APP_MODULES.filter(m => m.status === 'beta').length,
  byRole: {
    guest: APP_MODULES.filter(m => m.roles.includes('guest')).length,
    user: APP_MODULES.filter(m => m.roles.includes('user')).length,
    employee: APP_MODULES.filter(m => m.roles.includes('employee')).length,
    admin: APP_MODULES.filter(m => m.roles.includes('admin')).length,
  },
  byCategory: Object.keys(CATEGORY_META).reduce((acc, cat) => {
    acc[cat as ModuleCategory] = APP_MODULES.filter(m => m.category === cat).length;
    return acc;
  }, {} as Record<ModuleCategory, number>),
};
