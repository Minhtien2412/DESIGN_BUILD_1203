/**
 * Feature Availability Service
 * Quản lý trạng thái các features và xử lý graceful degradation
 * khi backend endpoint chưa sẵn sàng
 */

export type FeatureStatus = 'available' | 'unavailable' | 'degraded' | 'coming_soon';

export interface FeatureConfig {
  name: string;
  status: FeatureStatus;
  endpoints: string[];
  fallbackMessage: string;
  expectedAvailability?: string;
  alternativeEndpoint?: string;
  useMockData?: boolean;
}

/**
 * Cấu hình trạng thái các features dựa trên kết quả test
 * Cập nhật: 29/12/2025
 */
export const FEATURE_CONFIG: Record<string, FeatureConfig> = {
  // ✅ FEATURES ĐANG HOẠT ĐỘNG
  AUTH: {
    name: 'Authentication',
    status: 'available',
    endpoints: ['/auth/register', '/auth/login', '/auth/refresh'],
    fallbackMessage: '',
  },
  PROJECTS: {
    name: 'Quản lý Dự án',
    status: 'available',
    endpoints: ['/projects', '/projects/{id}'],
    fallbackMessage: '',
  },
  TASKS: {
    name: 'Quản lý Công việc',
    status: 'available',
    endpoints: ['/tasks'],
    fallbackMessage: '',
  },
  NOTIFICATIONS: {
    name: 'Thông báo',
    status: 'available',
    endpoints: ['/notifications'],
    fallbackMessage: '',
  },
  MESSAGES: {
    name: 'Tin nhắn/Chat',
    status: 'available',
    endpoints: ['/messages/conversations'],
    fallbackMessage: '',
  },
  PRODUCTS: {
    name: 'Sản phẩm/Dịch vụ',
    status: 'available',
    endpoints: ['/products'],
    fallbackMessage: '',
  },
  
  // ⚠️ FEATURES CẦN SỬA ENDPOINT
  PROFILE: {
    name: 'Hồ sơ Người dùng',
    status: 'degraded',
    endpoints: ['/auth/profile'], // Endpoint cũ - không hoạt động
    alternativeEndpoint: '/users/{userId}', // Endpoint đúng
    fallbackMessage: 'Đang cập nhật tính năng hồ sơ...',
  },
  CONSTRUCTION_PROGRESS: {
    name: 'Tiến độ Thi công',
    status: 'degraded',
    endpoints: ['/construction/progress'], // Endpoint cũ - không hoạt động
    alternativeEndpoint: '/projects/{projectId}/progress', // Endpoint đúng
    fallbackMessage: 'Vui lòng chọn dự án để xem tiến độ',
  },
  TIMELINE: {
    name: 'Lịch sử Hoạt động',
    status: 'degraded',
    endpoints: ['/timeline'], // Endpoint cũ - không hoạt động
    alternativeEndpoint: '/projects/{projectId}/timeline', // Endpoint đúng
    fallbackMessage: 'Vui lòng chọn dự án để xem timeline',
  },
  
  // ❌ FEATURES CHƯA CÓ BACKEND
  DOCUMENTS: {
    name: 'Quản lý Tài liệu',
    status: 'available',
    endpoints: ['/upload/single', '/upload/multiple'],
    fallbackMessage: '',
    useMockData: false,
  },
  BUDGET: {
    name: 'Quản lý Ngân sách',
    status: 'coming_soon',
    endpoints: ['/budget'],
    fallbackMessage: 'Tính năng Ngân sách đang được phát triển',
    expectedAvailability: 'Q1 2026',
    useMockData: true,
  },
  CONTRACTS: {
    name: 'Quản lý Hợp đồng',
    status: 'available',
    endpoints: ['/contract/materials', '/contract/quotations'],
    fallbackMessage: '',
    useMockData: false,
  },
  ANALYTICS: {
    name: 'Phân tích & Báo cáo',
    status: 'available',
    endpoints: ['/dashboard/admin', '/dashboard/client', '/dashboard/master'],
    fallbackMessage: '',
    useMockData: false,
  },
  SEARCH: {
    name: 'Tìm kiếm',
    status: 'coming_soon',
    endpoints: ['/search'],
    fallbackMessage: 'Tính năng tìm kiếm nâng cao sẽ sớm ra mắt',
    expectedAvailability: 'Q1 2026',
    useMockData: false,
  },
};

/**
 * Kiểm tra feature có sẵn sàng không
 */
export function isFeatureAvailable(featureKey: string): boolean {
  const feature = FEATURE_CONFIG[featureKey];
  return feature?.status === 'available';
}

/**
 * Kiểm tra feature có thể dùng với mock data không
 */
export function canUseMockData(featureKey: string): boolean {
  const feature = FEATURE_CONFIG[featureKey];
  return feature?.useMockData === true;
}

/**
 * Lấy thông báo fallback cho feature
 */
export function getFeatureFallbackMessage(featureKey: string): string {
  const feature = FEATURE_CONFIG[featureKey];
  if (!feature) return 'Tính năng không khả dụng';
  
  if (feature.expectedAvailability) {
    return `${feature.fallbackMessage} (Dự kiến: ${feature.expectedAvailability})`;
  }
  return feature.fallbackMessage;
}

/**
 * Lấy endpoint thay thế nếu có
 */
export function getAlternativeEndpoint(featureKey: string): string | undefined {
  return FEATURE_CONFIG[featureKey]?.alternativeEndpoint;
}

/**
 * Lấy trạng thái feature
 */
export function getFeatureStatus(featureKey: string): FeatureStatus {
  return FEATURE_CONFIG[featureKey]?.status || 'unavailable';
}

/**
 * Lấy tất cả features theo trạng thái
 */
export function getFeaturesByStatus(status: FeatureStatus): FeatureConfig[] {
  return Object.values(FEATURE_CONFIG).filter(f => f.status === status);
}

/**
 * Log feature status summary
 */
export function logFeatureStatus(): void {
  console.log('\n📊 FEATURE STATUS SUMMARY');
  console.log('========================');
  
  const available = getFeaturesByStatus('available');
  const degraded = getFeaturesByStatus('degraded');
  const comingSoon = getFeaturesByStatus('coming_soon');
  
  console.log(`✅ Available (${available.length}):`, available.map(f => f.name).join(', '));
  console.log(`⚠️ Degraded (${degraded.length}):`, degraded.map(f => f.name).join(', '));
  console.log(`🔜 Coming Soon (${comingSoon.length}):`, comingSoon.map(f => f.name).join(', '));
  console.log('========================\n');
}

export default FEATURE_CONFIG;
