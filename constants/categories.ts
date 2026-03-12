/**
 * Category System for Smart Navigation
 * 
 * Organizes 52 modules into 9 logical categories
 * Each category serves as a hub for related features
 */

export interface CategoryModule {
  id: string;
  label: string;
  description: string;
  icon: string;
  route: string;
  badge?: number; // Optional: show count/alert
}

export interface Category {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient?: [string, string];
  modules: CategoryModule[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'new-features',
    label: '🚀 Tính năng mới',
    description: 'Các công cụ mới và tiện ích',
    icon: 'rocket-outline',
    color: '#0D9488',
    gradient: ['#FFFFFF', '#0D9488'],
    modules: [
      {
        id: 'file-upload',
        label: 'Quản lý File',
        description: 'Upload avatar, documents, ảnh công trường',
        icon: 'cloud-upload-outline',
        route: '/file-upload',
      },
      {
        id: 'progress-tracking',
        label: 'Theo dõi tiến độ',
        description: 'Real-time progress tracking với Bull Queue',
        icon: 'stats-chart-outline',
        route: '/progress-tracking',
      },
      {
        id: 'scheduled-tasks',
        label: 'Công việc định kỳ',
        description: 'Nhắc nhở tự động & báo cáo',
        icon: 'time-outline',
        route: '/scheduled-tasks',
      },
      {
        id: 'health-check',
        label: 'Giám sát hệ thống',
        description: 'Monitor database, memory, disk',
        icon: 'pulse-outline',
        route: '/health-check',
      },
      {
        id: 'analytics',
        label: 'Phân tích',
        description: 'Track events, performance, errors',
        icon: 'analytics-outline',
        route: '/analytics',
      },
    ],
  },
  {
    id: 'construction',
    label: 'Quản lý thi công',
    description: 'Dự án, tiến độ, timeline, ngân sách',
    icon: 'hammer-outline',
    color: '#000000',
    gradient: ['#FFFFFF', '#333333'],
    modules: [
      {
        id: 'projects',
        label: 'Dự án',
        description: 'Quản lý dự án xây dựng',
        icon: 'folder-outline',
        route: '/projects',
      },
      {
        id: 'construction',
        label: 'Tiến độ thi công',
        description: 'Theo dõi tiến độ công trình',
        icon: 'construct-outline',
        route: '/construction',
      },
      {
        id: 'timeline',
        label: 'Timeline',
        description: 'Dòng thời gian & milestone',
        icon: 'time-outline',
        route: '/timeline',
      },
      {
        id: 'budget',
        label: 'Ngân sách',
        description: 'Quản lý chi phí & invoice',
        icon: 'cash-outline',
        route: '/budget',
      },
      {
        id: 'daily-report',
        label: 'Báo cáo hằng ngày',
        description: 'Nhật ký thi công',
        icon: 'calendar-outline',
        route: '/daily-report',
      },
      {
        id: 'as-built',
        label: 'Bản vẽ hoàn công',
        description: 'As-built drawings',
        icon: 'document-outline',
        route: '/as-built',
      },
      {
        id: 'inspection',
        label: 'Kiểm tra',
        description: 'Site inspection & audit',
        icon: 'checkmark-circle-outline',
        route: '/inspection',
      },
      {
        id: 'quality-assurance',
        label: 'Đảm bảo chất lượng',
        description: 'QA/QC management',
        icon: 'shield-checkmark-outline',
        route: '/quality-assurance',
      },
      {
        id: 'commissioning',
        label: 'Nghiệm thu',
        description: 'Commissioning & handover',
        icon: 'checkmark-done-outline',
        route: '/commissioning',
      },
    ],
  },
  {
    id: 'communication',
    label: 'Giao tiếp & Hợp tác',
    description: 'Nhắn tin, cuộc gọi, livestream',
    icon: 'chatbubbles-outline',
    color: '#14B8A6',
    gradient: ['#14B8A6', '#2DD4BF'],
    modules: [
      {
        id: 'messages',
        label: 'Tin nhắn',
        description: 'Chat realtime 1-1 & nhóm',
        icon: 'chatbubble-outline',
        route: '/messages',
      },
      {
        id: 'call',
        label: 'Cuộc gọi',
        description: 'Video/Audio calls',
        icon: 'videocam-outline',
        route: '/call',
      },
      {
        id: 'live',
        label: 'Livestream',
        description: 'Live site tours',
        icon: 'radio-outline',
        route: '/live',
      },
      {
        id: 'communications',
        label: 'Trung tâm giao tiếp',
        description: 'Meetings & reviews',
        icon: 'people-outline',
        route: '/communications',
      },
      {
        id: 'meeting-minutes',
        label: 'Biên bản họp',
        description: 'Meeting minutes & notes',
        icon: 'document-text-outline',
        route: '/meeting-minutes',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Quản lý tài liệu',
    description: 'Documents, folders, version control',
    icon: 'folder-open-outline',
    color: '#666666',
    gradient: ['#999999', '#AAAAAA'],
    modules: [
      {
        id: 'documents',
        label: 'Tài liệu',
        description: 'Document management',
        icon: 'document-outline',
        route: '/documents',
      },
      {
        id: 'document-control',
        label: 'Kiểm soát tài liệu',
        description: 'Version control & approval',
        icon: 'git-branch-outline',
        route: '/document-control',
      },
      {
        id: 'om-manuals',
        label: 'Sổ tay O&M',
        description: 'Operation & Maintenance manuals',
        icon: 'book-outline',
        route: '/om-manuals',
      },
      {
        id: 'submittal',
        label: 'Trình duyệt',
        description: 'Submittal & approval workflow',
        icon: 'send-outline',
        route: '/submittal',
      },
    ],
  },
  {
    id: 'procurement',
    label: 'Mua sắm & Nguồn lực',
    description: 'Shopping, vật liệu, thiết bị, nhân lực',
    icon: 'cart-outline',
    color: '#000000',
    gradient: ['#FFFFFF', '#333333'],
    modules: [
      {
        id: 'shopping',
        label: 'Mua sắm',
        description: 'E-commerce for materials',
        icon: 'storefront-outline',
        route: '/shopping',
      },
      {
        id: 'procurement',
        label: 'Procurement',
        description: 'Professional procurement',
        icon: 'cart-outline',
        route: '/procurement',
      },
      {
        id: 'contractors',
        label: 'Nhà thầu',
        description: 'Contractor management',
        icon: 'people-outline',
        route: '/contractors',
      },
      {
        id: 'materials',
        label: 'Vật liệu',
        description: 'Material tracking',
        icon: 'cube-outline',
        route: '/materials',
      },
      {
        id: 'equipment',
        label: 'Thiết bị',
        description: 'Equipment management',
        icon: 'hardware-chip-outline',
        route: '/equipment',
      },
      {
        id: 'inventory',
        label: 'Kho hàng',
        description: 'Inventory management',
        icon: 'albums-outline',
        route: '/inventory',
      },
      {
        id: 'fleet',
        label: 'Quản lý xe',
        description: 'Fleet management',
        icon: 'car-outline',
        route: '/fleet',
      },
      {
        id: 'labor',
        label: 'Lao động',
        description: 'Labor management',
        icon: 'person-outline',
        route: '/labor',
      },
      {
        id: 'resource-planning',
        label: 'Lập kế hoạch',
        description: 'Resource planning',
        icon: 'grid-outline',
        route: '/resource-planning',
      },
    ],
  },
  {
    id: 'contracts',
    label: 'Hợp đồng & Thay đổi',
    description: 'Contracts, change orders, payments',
    icon: 'document-text-outline',
    color: '#333333',
    gradient: ['#666666', '#999999'],
    modules: [
      {
        id: 'contracts',
        label: 'Hợp đồng',
        description: 'Contract management',
        icon: 'document-attach-outline',
        route: '/contracts',
      },
      {
        id: 'change-order',
        label: 'Lệnh thay đổi',
        description: 'Change order requests',
        icon: 'swap-horizontal-outline',
        route: '/change-order',
      },
      {
        id: 'change-management',
        label: 'Quản lý thay đổi',
        description: 'Change management workflow',
        icon: 'git-compare-outline',
        route: '/change-management',
      },
      {
        id: 'payments',
        label: 'Thanh toán',
        description: 'Payment processing',
        icon: 'card-outline',
        route: '/payments',
      },
    ],
  },
  {
    id: 'safety',
    label: 'An toàn & Tuân thủ',
    description: 'Safety, environment, risk, legal',
    icon: 'shield-outline',
    color: '#000000',
    gradient: ['#333333', '#666666'],
    modules: [
      {
        id: 'safety',
        label: 'An toàn',
        description: 'Safety management',
        icon: 'shield-checkmark-outline',
        route: '/safety',
      },
      {
        id: 'environmental',
        label: 'Môi trường',
        description: 'Environmental compliance',
        icon: 'leaf-outline',
        route: '/environmental',
      },
      {
        id: 'risk',
        label: 'Rủi ro',
        description: 'Risk assessment & mitigation',
        icon: 'warning-outline',
        route: '/risk',
      },
      {
        id: 'legal',
        label: 'Pháp lý',
        description: 'Legal compliance',
        icon: 'newspaper-outline',
        route: '/legal',
      },
      {
        id: 'warranty',
        label: 'Bảo hành',
        description: 'Warranty management',
        icon: 'ribbon-outline',
        route: '/warranty',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Báo cáo & Phân tích',
    description: 'Reports, analytics, dashboard',
    icon: 'bar-chart-outline',
    color: '#0D9488',
    gradient: ['#0D9488', '#3399FF'],
    modules: [
      {
        id: 'reports',
        label: 'Báo cáo',
        description: 'Report generation',
        icon: 'document-text-outline',
        route: '/reports',
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'Executive dashboard',
        icon: 'grid-outline',
        route: '/dashboard',
      },
      {
        id: 'admin',
        label: 'Quản trị',
        description: 'Admin panel',
        icon: 'settings-outline',
        route: '/admin',
      },
    ],
  },
  {
    id: 'media',
    label: 'Media & Nội dung',
    description: 'Videos, photos, stories',
    icon: 'play-circle-outline',
    color: '#14B8A6',
    gradient: ['#0D9488', '#14B8A6'],
    modules: [
      {
        id: 'videos',
        label: 'Videos',
        description: 'Video library',
        icon: 'videocam-outline',
        route: '/videos',
      },
      {
        id: 'stories',
        label: 'Stories',
        description: 'Instagram-style stories',
        icon: 'image-outline',
        route: '/stories',
      },
      {
        id: 'demo',
        label: 'Demo',
        description: 'Demo & showcase',
        icon: 'eye-outline',
        route: '/demo',
      },
    ],
  },
  {
    id: 'utilities',
    label: 'Tiện ích & Dịch vụ',
    description: 'Tools, services, resources',
    icon: 'apps-outline',
    color: '#999999',
    gradient: ['#CCCCCC', '#DDDDDD'],
    modules: [
      {
        id: 'utilities',
        label: 'Tiện ích',
        description: 'Utility tools',
        icon: 'build-outline',
        route: '/utilities',
      },
      {
        id: 'services',
        label: 'Dịch vụ',
        description: 'Service marketplace',
        icon: 'briefcase-outline',
        route: '/services',
      },
      {
        id: 'resources',
        label: 'Tài nguyên',
        description: 'Resource library',
        icon: 'library-outline',
        route: '/resources',
      },
      {
        id: 'search',
        label: 'Tìm kiếm',
        description: 'Global search',
        icon: 'search-outline',
        route: '/search',
      },
      {
        id: 'finishing',
        label: 'Hoàn thiện',
        description: 'Finishing works',
        icon: 'color-palette-outline',
        route: '/finishing',
      },
    ],
  },
];

/**
 * Helper functions
 */
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};

export const getModuleById = (moduleId: string): CategoryModule | undefined => {
  for (const category of CATEGORIES) {
    const module = category.modules.find(m => m.id === moduleId);
    if (module) return module;
  }
  return undefined;
};

export const findCategoryByModule = (moduleId: string): Category | undefined => {
  return CATEGORIES.find(cat => 
    cat.modules.some(m => m.id === moduleId)
  );
};

export const getAllModules = (): CategoryModule[] => {
  return CATEGORIES.flatMap(cat => cat.modules);
};

export const getTotalModuleCount = (): number => {
  return CATEGORIES.reduce((sum, cat) => sum + cat.modules.length, 0);
};

/**
 * Quick Actions - Frequently used features
 */
export const QUICK_ACTIONS = [
  {
    id: 'products-catalog',
    label: 'Sản phẩm',
    icon: 'storefront-outline',
    route: '/shopping/products-from-backend',
    color: '#0D9488',
  },
  {
    id: 'file-upload',
    label: 'Upload File',
    icon: 'cloud-upload-outline',
    route: '/file-upload',
    color: '#14B8A6',
  },
  {
    id: 'progress-tracking',
    label: 'Theo dõi tiến độ',
    icon: 'stats-chart-outline',
    route: '/progress-tracking',
    color: '#0D9488',
  },
  {
    id: 'create-project',
    label: 'Tạo dự án',
    icon: 'add-circle-outline',
    route: '/projects/create',
    color: '#000000',
  },
  {
    id: 'new-message',
    label: 'Tin nhắn',
    icon: 'mail-outline',
    route: '/messages',
    color: '#14B8A6',
  },
  {
    id: 'analytics',
    label: 'Phân tích',
    icon: 'analytics-outline',
    route: '/analytics',
    color: '#0D9488',
  },
  {
    id: 'daily-report',
    label: 'Báo cáo',
    icon: 'document-outline',
    route: '/daily-report/create',
    color: '#666666',
  },
];
