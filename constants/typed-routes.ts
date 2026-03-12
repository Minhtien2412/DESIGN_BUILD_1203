/**
 * Type-Safe App Routing System - Complete 9-Layer Architecture
 * Centralized route definitions for all 60+ routes
 * @see HOME_STRUCTURE_COMPLETE.md for full documentation
 * @created 2025-12-22
 */

// ============================================================================
// LAYER 1: Main Services (8 routes)
// ============================================================================
export const MAIN_SERVICES_ROUTES = {
  HOUSE_DESIGN: '/services/house-design',
  CONSTRUCTION_PROGRESS: '/construction/progress',
  MY_PROJECTS: '/(tabs)/projects',
  TRACKING: '/construction/tracking',
  MATERIALS: '/materials/index',
  LABOR: '/labor/index',
  QUOTE_REQUEST: '/utilities/quote-request',
  SITEMAP: '/utilities/sitemap',
} as const;

// ============================================================================
// LAYER 2: Construction Services (8 routes)
// ============================================================================
export const CONSTRUCTION_ROUTES = {
  EP_COC: '/utilities/ep-coc',
  DAO_DAT: '/utilities/dao-dat',
  BE_TONG: '/utilities/be-tong',
  VAT_LIEU: '/utilities/vat-lieu',
  THO_XAY: '/utilities/tho-xay',
  THO_DIEN_NUOC: '/utilities/tho-dien-nuoc',
  THO_COFFA: '/utilities/tho-coffa',
  DESIGN_TEAM: '/utilities/design-team',
} as const;

// ============================================================================
// LAYER 3: Management Tools (8 routes)
// ============================================================================
export const MANAGEMENT_ROUTES = {
  TIMELINE: '/timeline/index',
  BUDGET: '/budget/index',
  QUALITY_ASSURANCE: '/quality-assurance/index',
  SAFETY: '/safety/index',
  DOCUMENTS: '/documents/folders',
  REPORTS: '/reports/index',
  RFI: '/rfi/index',
  SUBMITTAL: '/submittal/index',
} as const;

// ============================================================================
// LAYER 4: Finishing Works (8 routes)
// ============================================================================
export const FINISHING_ROUTES = {
  LAT_GACH: '/finishing/lat-gach',
  SON: '/finishing/son',
  DA: '/finishing/da',
  THACH_CAO: '/finishing/thach-cao',
  LAM_CUA: '/finishing/lam-cua',
  LAN_CAN: '/finishing/lan-can',
  CAMERA: '/finishing/camera',
  THO_TONG_HOP: '/finishing/tho-tong-hop',
} as const;

// ============================================================================
// LAYER 5: Professional Services (4 routes)
// ============================================================================
export const PROFESSIONAL_ROUTES = {
  INTERIOR_DESIGN: '/services/interior-design',
  CONSTRUCTION_COMPANY: '/services/construction-company',
  QUALITY_SUPERVISION: '/services/quality-supervision',
  FENG_SHUI: '/services/feng-shui',
} as const;

// ============================================================================
// LAYER 6: Quick Tools (8 routes)
// ============================================================================
export const QUICK_TOOLS_ROUTES = {
  COST_ESTIMATOR: '/utilities/cost-estimator',
  MY_QR_CODE: '/utilities/my-qr-code',
  MAP_VIEW: '/construction/map-view',
  STORE_LOCATOR: '/utilities/store-locator',
  AI_HUB: '/ai',
  LIVE_STREAM: '/(tabs)/live',
  VIDEOS: '/videos/index',
  MESSAGES: '/messages/index',
} as const;

// ============================================================================
// LAYER 7: Shopping Categories (4 routes + extras)
// ============================================================================
export const SHOPPING_ROUTES = {
  CONSTRUCTION_MATERIALS: '/shopping/index?cat=construction',
  ELECTRICAL_EQUIPMENT: '/shopping/index?cat=electrical',
  FURNITURE: '/shopping/index?cat=furniture',
  PAINT_COLORS: '/shopping/index?cat=paint',
  SHOPPING_INDEX: '/shopping/index',
  CART: '/cart',
} as const;

// ============================================================================
// LAYER 8: Additional Services (9 routes)
// ============================================================================
export const ADDITIONAL_SERVICES_ROUTES = {
  BOOKING: '/construction/booking',
  VIDEO_CALL: '/call/active',
  NOTIFICATIONS: '/(tabs)/notifications',
  ANALYTICS: '/analytics',
  CONTRACTS: '/contracts/index',
  WEATHER_DASHBOARD: '/weather/dashboard',
  WEATHER_INDEX: '/weather/index',
  FLEET: '/fleet/index',
  FOOD: '/food/index',
} as const;

// ============================================================================
// LAYER 9: Advanced Features (4 routes)
// ============================================================================
export const ADVANCED_ROUTES = {
  INSPECTION: '/inspection/index',
  WARRANTY: '/warranty/index',
  RISK_MANAGEMENT: '/risk/index',
  LEGAL: '/legal/index',
} as const;

// ============================================================================
// Combined APP_ROUTES - All 64 Routes
// ============================================================================
export const APP_ROUTES = {
  // Layer 1: Main Services
  ...MAIN_SERVICES_ROUTES,
  // Layer 2: Construction
  ...CONSTRUCTION_ROUTES,
  // Layer 3: Management
  ...MANAGEMENT_ROUTES,
  // Layer 4: Finishing
  ...FINISHING_ROUTES,
  // Layer 5: Professional
  ...PROFESSIONAL_ROUTES,
  // Layer 6: Quick Tools
  ...QUICK_TOOLS_ROUTES,
  // Layer 7: Shopping
  ...SHOPPING_ROUTES,
  // Layer 8: Additional Services
  ...ADDITIONAL_SERVICES_ROUTES,
  // Layer 9: Advanced
  ...ADVANCED_ROUTES,
  
  // Tab Navigation
  HOME: '/(tabs)/index',
  PROJECTS_TAB: '/(tabs)/projects',
  NOTIFICATIONS_TAB: '/(tabs)/notifications',
  PROFILE: '/(tabs)/profile',
  LIVE_TAB: '/(tabs)/live',
  
  // Common Routes
  SEARCH: '/search',
  CHECKOUT: '/checkout',
  PROFILE_MENU: '/profile/menu',
  
  // Auth Routes
  AUTH_LOGIN: '/(auth)/login',
  AUTH_REGISTER: '/(auth)/register',
  AUTH_FORGOT_PASSWORD: '/(auth)/forgot-password',
  AUTH_RESET_PASSWORD: '/(auth)/reset-password',
  
  // Projects Routes
  PROJECTS_CREATE: '/projects/create',
  PROJECTS_INDEX: '/projects',
  
  // Live Routes
  LIVE_CREATE: '/live/create',
  
  // Profile Extended Routes
  PROFILE_SETTINGS: '/profile/settings',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_REWARDS: '/profile/rewards',
  PROFILE_INFO: '/profile/info',
  PROFILE_PRIVACY: '/profile/privacy',
  PROFILE_SECURITY: '/profile/security',
  PROFILE_PORTFOLIO: '/profile/portfolio',
  PROFILE_CLOUD: '/profile/cloud',
  PROFILE_PAYMENT: '/profile/payment',
  PROFILE_ADDRESSES: '/profile/addresses',
  PROFILE_ORDERS: '/profile/orders',
  PROFILE_FAVORITES: '/profile/favorites',
  PROFILE_REVIEWS: '/profile/reviews',
  PROFILE_HELP: '/profile/help',
  
  // Dashboard Routes
  DASHBOARD_INDEX: '/dashboard/index',
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_ENGINEER: '/dashboard/engineer',
  DASHBOARD_CLIENT: '/dashboard/client',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_ROLES: '/admin/roles',
  
  // Legal Routes Extended
  LEGAL_TERMS: '/legal/terms',
  LEGAL_PRIVACY: '/legal/privacy-policy',
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

/** All valid app routes as union type */
export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];

/** Route groups by layer */
export type MainServiceRoute = typeof MAIN_SERVICES_ROUTES[keyof typeof MAIN_SERVICES_ROUTES];
export type ConstructionRoute = typeof CONSTRUCTION_ROUTES[keyof typeof CONSTRUCTION_ROUTES];
export type ManagementRoute = typeof MANAGEMENT_ROUTES[keyof typeof MANAGEMENT_ROUTES];
export type FinishingRoute = typeof FINISHING_ROUTES[keyof typeof FINISHING_ROUTES];
export type ProfessionalRoute = typeof PROFESSIONAL_ROUTES[keyof typeof PROFESSIONAL_ROUTES];
export type QuickToolRoute = typeof QUICK_TOOLS_ROUTES[keyof typeof QUICK_TOOLS_ROUTES];
export type ShoppingRoute = typeof SHOPPING_ROUTES[keyof typeof SHOPPING_ROUTES];
export type AdditionalServiceRoute = typeof ADDITIONAL_SERVICES_ROUTES[keyof typeof ADDITIONAL_SERVICES_ROUTES];
export type AdvancedRoute = typeof ADVANCED_ROUTES[keyof typeof ADVANCED_ROUTES];

// ============================================================================
// Dynamic Route Builders
// ============================================================================

/**
 * Build product detail route
 * @example productRoute('123') → '/product/123'
 */
export const productRoute = (productId: string): `/product/${string}` => {
  return `/product/${productId}`;
};

/**
 * Build user story route
 * @example storyRoute('user123') → '/stories/user123'
 */
export const storyRoute = (userId: string): `/stories/${string}` => {
  return `/stories/${userId}`;
};

/**
 * Build live stream route
 * @example liveRoute('stream456') → '/live/stream456'
 */
export const liveRoute = (streamId: string): `/live/${string}` => {
  return `/live/${streamId}`;
};

/**
 * Build video category route
 * @example videoRoute('construction') → '/videos/construction'
 */
export const videoRoute = (category: string): `/videos/${string}` => {
  return `/videos/${category}`;
};

/**
 * Build shopping route with query parameters
 * @example shoppingRoute('furniture', {sort: 'price'}) → '/shopping/index?cat=furniture&sort=price'
 */
export const shoppingRoute = (
  category?: 'construction' | 'electrical' | 'furniture' | 'paint',
  params?: Record<string, string>
): string => {
  const queryParams: string[] = [];
  
  if (category) {
    queryParams.push(`cat=${category}`);
  }
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams.push(`${key}=${encodeURIComponent(value)}`);
    });
  }
  
  return queryParams.length > 0 
    ? `/shopping/index?${queryParams.join('&')}` 
    : '/shopping/index';
};

// ============================================================================
// Route Validation & Helpers
// ============================================================================

/**
 * Type guard: Check if string is valid route
 * @example isValidRoute('/ai') → true
 */
export const isValidRoute = (route: string): route is AppRoute => {
  return Object.values(APP_ROUTES).includes(route as AppRoute);
};

/**
 * Get layer number for a route
 * @returns Layer number (1-9) or 0 for unknown
 */
export const getRouteLayer = (route: AppRoute): number => {
  if (Object.values(MAIN_SERVICES_ROUTES).includes(route as any)) return 1;
  if (Object.values(CONSTRUCTION_ROUTES).includes(route as any)) return 2;
  if (Object.values(MANAGEMENT_ROUTES).includes(route as any)) return 3;
  if (Object.values(FINISHING_ROUTES).includes(route as any)) return 4;
  if (Object.values(PROFESSIONAL_ROUTES).includes(route as any)) return 5;
  if (Object.values(QUICK_TOOLS_ROUTES).includes(route as any)) return 6;
  if (Object.values(SHOPPING_ROUTES).includes(route as any)) return 7;
  if (Object.values(ADDITIONAL_SERVICES_ROUTES).includes(route as any)) return 8;
  if (Object.values(ADVANCED_ROUTES).includes(route as any)) return 9;
  return 0;
};

/**
 * Get category name for a route
 */
export const getRouteCategory = (route: AppRoute): string => {
  const layer = getRouteLayer(route);
  const categories = [
    'Unknown',
    'Main Services',
    'Construction',
    'Management',
    'Finishing',
    'Professional',
    'Quick Tools',
    'Shopping',
    'Additional Services',
    'Advanced',
  ];
  return categories[layer] || 'Unknown';
};

/**
 * Get all routes as flat array
 */
export const getAllRoutes = (): AppRoute[] => {
  return Object.values(APP_ROUTES);
};

/**
 * Get routes organized by layer
 */
export const getRoutesByLayer = () => {
  return {
    1: { name: 'Main Services', routes: Object.values(MAIN_SERVICES_ROUTES) },
    2: { name: 'Construction', routes: Object.values(CONSTRUCTION_ROUTES) },
    3: { name: 'Management', routes: Object.values(MANAGEMENT_ROUTES) },
    4: { name: 'Finishing', routes: Object.values(FINISHING_ROUTES) },
    5: { name: 'Professional', routes: Object.values(PROFESSIONAL_ROUTES) },
    6: { name: 'Quick Tools', routes: Object.values(QUICK_TOOLS_ROUTES) },
    7: { name: 'Shopping', routes: Object.values(SHOPPING_ROUTES) },
    8: { name: 'Additional Services', routes: Object.values(ADDITIONAL_SERVICES_ROUTES) },
    9: { name: 'Advanced', routes: Object.values(ADVANCED_ROUTES) },
  };
};

// ============================================================================
// Route Metadata for Search & Analytics
// ============================================================================

export interface RouteMetadata {
  route: AppRoute;
  title: string;
  titleVi: string;
  description?: string;
  icon: string;
  category: string;
  layer: number;
  tags: string[];
  premium?: boolean;
  badge?: 'HOT' | 'NEW' | 'PRO';
  price?: string;
  rating?: number;
}

/**
 * Complete metadata for all routes
 * Used for search, sitemap, analytics
 */
export const ROUTE_METADATA_MAP: Partial<Record<AppRoute, RouteMetadata>> = {
  // Layer 1: Main Services
  [APP_ROUTES.HOUSE_DESIGN]: {
    route: APP_ROUTES.HOUSE_DESIGN,
    title: 'House Design',
    titleVi: 'Thiết kế nhà',
    icon: 'home-outline',
    category: 'Main Services',
    layer: 1,
    tags: ['design', 'architecture', 'thiết kế', 'kiến trúc'],
  },
  [APP_ROUTES.CONSTRUCTION_PROGRESS]: {
    route: APP_ROUTES.CONSTRUCTION_PROGRESS,
    title: 'Construction Progress',
    titleVi: 'Thi công XD',
    icon: 'construct-outline',
    category: 'Main Services',
    layer: 1,
    tags: ['construction', 'progress', 'thi công', 'tiến độ'],
  },
  [APP_ROUTES.MY_PROJECTS]: {
    route: APP_ROUTES.MY_PROJECTS,
    title: 'My Projects',
    titleVi: 'Dự án của tôi',
    icon: 'folder-outline',
    category: 'Main Services',
    layer: 1,
    tags: ['projects', 'portfolio', 'dự án'],
  },
  [APP_ROUTES.MATERIALS]: {
    route: APP_ROUTES.MATERIALS,
    title: 'Materials',
    titleVi: 'Vật liệu',
    icon: 'cube-outline',
    category: 'Main Services',
    layer: 1,
    tags: ['materials', 'inventory', 'vật liệu'],
  },
  [APP_ROUTES.LABOR]: {
    route: APP_ROUTES.LABOR,
    title: 'Labor',
    titleVi: 'Nhân công',
    icon: 'people-outline',
    category: 'Main Services',
    layer: 1,
    tags: ['labor', 'workers', 'nhân công', 'thợ'],
  },
  [APP_ROUTES.AI_HUB]: {
    route: APP_ROUTES.AI_HUB,
    title: 'AI Assistant',
    titleVi: 'Trợ lý AI',
    icon: 'sparkles-outline',
    category: 'Quick Tools',
    layer: 6,
    badge: 'NEW',
    tags: ['ai', 'assistant', 'trí tuệ nhân tạo'],
  },
  [APP_ROUTES.INSPECTION]: {
    route: APP_ROUTES.INSPECTION,
    title: 'Inspection',
    titleVi: 'Kiểm tra',
    icon: 'search-outline',
    category: 'Advanced',
    layer: 9,
    premium: true,
    badge: 'PRO',
    tags: ['inspection', 'quality', 'kiểm tra', 'chất lượng'],
  },
  [APP_ROUTES.WARRANTY]: {
    route: APP_ROUTES.WARRANTY,
    title: 'Warranty',
    titleVi: 'Bảo hành',
    icon: 'shield-checkmark-outline',
    category: 'Advanced',
    layer: 9,
    premium: true,
    badge: 'PRO',
    tags: ['warranty', 'guarantee', 'bảo hành'],
  },
  [APP_ROUTES.LEGAL]: {
    route: APP_ROUTES.LEGAL,
    title: 'Legal',
    titleVi: 'Pháp lý',
    icon: 'document-text-outline',
    category: 'Advanced',
    layer: 9,
    badge: 'NEW',
    tags: ['legal', 'law', 'pháp lý'],
  },
};

// ============================================================================
// Search & Filter Helpers
// ============================================================================

/**
 * Search routes by keyword (Vietnamese-friendly)
 * @param keyword - Search term
 * @returns Matching route metadata
 */
export const searchRoutes = (keyword: string): RouteMetadata[] => {
  const lowerKeyword = keyword.toLowerCase().trim();
  if (!lowerKeyword) return [];
  
  return Object.values(ROUTE_METADATA_MAP).filter(meta => {
    if (!meta) return false;
    return (
      meta.title.toLowerCase().includes(lowerKeyword) ||
      meta.titleVi.toLowerCase().includes(lowerKeyword) ||
      meta.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)) ||
      meta.category.toLowerCase().includes(lowerKeyword)
    );
  }) as RouteMetadata[];
};

/**
 * Get routes by layer number
 */
export const getRoutesByLayerNumber = (layer: number): RouteMetadata[] => {
  return Object.values(ROUTE_METADATA_MAP).filter(
    meta => meta && meta.layer === layer
  ) as RouteMetadata[];
};

/**
 * Get premium/featured routes
 */
export const getPremiumRoutes = (): RouteMetadata[] => {
  return Object.values(ROUTE_METADATA_MAP).filter(
    meta => meta && meta.premium
  ) as RouteMetadata[];
};

/**
 * Get popular routes (can be enhanced with real analytics)
 */
export const getPopularRoutes = (): AppRoute[] => {
  return [
    APP_ROUTES.CONSTRUCTION_PROGRESS,
    APP_ROUTES.MY_PROJECTS,
    APP_ROUTES.AI_HUB,
    APP_ROUTES.MATERIALS,
    APP_ROUTES.QUOTE_REQUEST,
    APP_ROUTES.TIMELINE,
  ];
};

// ============================================================================
// Navigation Stats (for analytics/dashboard)
// ============================================================================

export const ROUTE_STATS = {
  totalRoutes: getAllRoutes().length,
  totalLayers: 9,
  routesPerLayer: {
    1: Object.keys(MAIN_SERVICES_ROUTES).length,
    2: Object.keys(CONSTRUCTION_ROUTES).length,
    3: Object.keys(MANAGEMENT_ROUTES).length,
    4: Object.keys(FINISHING_ROUTES).length,
    5: Object.keys(PROFESSIONAL_ROUTES).length,
    6: Object.keys(QUICK_TOOLS_ROUTES).length,
    7: Object.keys(SHOPPING_ROUTES).length,
    8: Object.keys(ADDITIONAL_SERVICES_ROUTES).length,
    9: Object.keys(ADVANCED_ROUTES).length,
  },
  premiumRoutes: getPremiumRoutes().length,
};
