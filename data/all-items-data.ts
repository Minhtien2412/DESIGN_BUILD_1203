/**
 * Shared data for "View All" pages
 * Tập hợp data cho các trang "Xem tất cả"
 */

import { ListItem } from '@/components/shared/all-items-list';

// ============================================================================
// CONSTRUCTION SERVICES - Tất cả dịch vụ thi công
// ============================================================================
export const ALL_CONSTRUCTION_SERVICES: ListItem[] = [
  // Progress & Tracking
  { id: 'progress', label: 'Tiến độ thi công', icon: 'analytics-outline', route: '/construction/progress', color: '#3B82F6', description: 'Theo dõi tiến độ' },
  { id: 'tracking', label: 'Theo dõi công trình', icon: 'location-outline', route: '/construction/tracking', color: '#10B981', description: 'Real-time tracking' },
  { id: 'villa', label: 'Tiến độ biệt thự', icon: 'home-outline', route: '/construction/villa-progress', color: '#8B5CF6' },
  { id: 'board', label: 'Board tiến độ', icon: 'grid-outline', route: '/construction/progress-board', color: '#F59E0B' },
  { id: 'map-view', label: 'Bản đồ công trình', icon: 'map-outline', route: '/construction/map-view', color: '#06B6D4' },
  
  // Services
  { id: 'ep-coc', label: 'Ép cọc', icon: '⚡', route: '/utilities/ep-coc', color: '#EF4444', description: 'Từ 50K/m' },
  { id: 'dao-dat', label: 'Đào đất', icon: '🚜', route: '/utilities/dao-dat', color: '#F59E0B', description: 'Từ 80K/m³' },
  { id: 'be-tong', label: 'Bê tông', icon: '🏗️', route: '/utilities/be-tong', color: '#3B82F6', description: 'Từ 1.2M/m³' },
  { id: 'vat-lieu', label: 'Vật liệu', icon: '📦', route: '/utilities/vat-lieu', color: '#8B5CF6' },
  { id: 'tho-xay', label: 'Thợ xây', icon: '👷', route: '/utilities/tho-xay', color: '#10B981', description: 'Từ 400K/ngày' },
  { id: 'dien-nuoc', label: 'Điện nước', icon: '💡', route: '/utilities/tho-dien-nuoc', color: '#F59E0B', description: 'Từ 350K/ngày' },
  { id: 'coffa', label: 'Cốp pha', icon: '🔧', route: '/utilities/tho-coffa', color: '#EF4444', description: 'Từ 500K/ngày' },
  { id: 'design', label: 'Thiết kế', icon: '✏️', route: '/utilities/design-team', color: '#EC4899', description: 'Từ 50K/m²' },
  
  // Scheduling & Payment
  { id: 'concrete-schedule', label: 'Lịch đổ bê tông', icon: 'calendar-outline', route: '/construction/concrete-schedule-map', color: '#EF4444' },
  { id: 'payment', label: 'Thanh toán tiến độ', icon: 'card-outline', route: '/construction/payment-progress', color: '#EC4899' },
  { id: 'booking', label: 'Đặt lịch thi công', icon: 'calendar-number-outline', route: '/construction/booking', color: '#6366F1' },
];

// ============================================================================
// FINISHING SERVICES - Tất cả dịch vụ hoàn thiện
// ============================================================================
export const ALL_FINISHING_SERVICES: ListItem[] = [
  { id: 'lat-gach', label: 'Lát gạch', icon: 'grid-outline', route: '/finishing/lat-gach', color: '#3B82F6', description: 'Thi công lát nền' },
  { id: 'son', label: 'Sơn', icon: 'color-fill-outline', route: '/finishing/son', color: '#F59E0B', description: 'Sơn nội thất' },
  { id: 'thach-cao', label: 'Thạch cao', icon: 'square-outline', route: '/finishing/thach-cao', color: '#8B5CF6', description: 'Trần thạch cao' },
  { id: 'cua', label: 'Cửa', icon: 'enter-outline', route: '/finishing/lam-cua', color: '#10B981', description: 'Cửa gỗ, nhôm kính' },
  { id: 'camera', label: 'Camera', icon: 'videocam-outline', route: '/finishing/camera', color: '#EF4444', description: 'Camera an ninh' },
  { id: 'lan-can', label: 'Lan can', icon: 'reorder-four-outline', route: '/finishing/lan-can', color: '#06B6D4', description: 'Lan can inox, sắt' },
  { id: 'da', label: 'Đá ốp', icon: 'diamond-outline', route: '/finishing/da', color: '#EC4899', description: 'Đá granite, marble' },
  { id: 'tho-tong-hop', label: 'Thợ tổng hợp', icon: 'hammer-outline', route: '/finishing/tho-tong-hop', color: '#6366F1', description: 'Thợ hoàn thiện' },
  
  // Additional
  { id: 'noi-that', label: 'Nội thất', icon: 'bed-outline', route: '/finishing/noi-that', color: '#8B5CF6', description: 'Thiết kế nội thất' },
  { id: 'dien-lanh', label: 'Điện lạnh', icon: 'thermometer-outline', route: '/finishing/dien-lanh', color: '#3B82F6', description: 'Điều hòa, máy lạnh' },
  { id: 'nuoc', label: 'Hệ thống nước', icon: 'water-outline', route: '/finishing/he-thong-nuoc', color: '#06B6D4', description: 'Ống nước, máy bơm' },
  { id: 'vet-sinh', label: 'Vệ sinh', icon: 'brush-outline', route: '/finishing/ve-sinh', color: '#10B981', description: 'Vệ sinh sau thi công' },
];

// ============================================================================
// UTILITY TOOLS - Tất cả công cụ quản lý
// ============================================================================
export const ALL_UTILITY_TOOLS: ListItem[] = [
  { id: 'timeline', label: 'Timeline', icon: 'git-network-outline', route: '/timeline/index', color: '#3B82F6', description: 'Dòng thời gian' },
  { id: 'budget', label: 'Ngân sách', icon: 'wallet-outline', route: '/budget/index', color: '#10B981', description: 'Quản lý chi phí' },
  { id: 'quality', label: 'QC/QA', icon: 'checkmark-circle-outline', route: '/quality-assurance/index', color: '#8B5CF6', description: 'Kiểm soát chất lượng' },
  { id: 'safety', label: 'An toàn', icon: 'shield-checkmark-outline', route: '/safety/index', color: '#EF4444', description: 'An toàn lao động' },
  { id: 'documents', label: 'Tài liệu', icon: 'document-outline', route: '/documents/folders', color: '#F59E0B', description: 'Quản lý văn bản' },
  { id: 'reports', label: 'Báo cáo', icon: 'newspaper-outline', route: '/reports/index', color: '#06B6D4', description: 'Xuất báo cáo' },
  { id: 'labor', label: 'Nhân công', icon: 'people-outline', route: '/labor/index', color: '#EC4899', description: 'Quản lý nhân sự' },
  { id: 'sitemap', label: 'Sitemap', icon: 'map-outline', route: '/utilities/sitemap', color: '#6366F1', description: 'Bản đồ tính năng' },
  
  // Additional tools
  { id: 'calendar', label: 'Lịch', icon: 'calendar-outline', route: '/utilities/calendar', color: '#3B82F6', description: 'Lịch công việc' },
  { id: 'tasks', label: 'Công việc', icon: 'checkbox-outline', route: '/utilities/tasks', color: '#10B981', description: 'Quản lý task' },
  { id: 'files', label: 'Files', icon: 'folder-outline', route: '/utilities/files', color: '#F59E0B', description: 'Quản lý file' },
  { id: 'analytics', label: 'Phân tích', icon: 'stats-chart-outline', route: '/utilities/analytics', color: '#8B5CF6', description: 'Phân tích dữ liệu' },
  { id: 'notifications', label: 'Thông báo', icon: 'notifications-outline', route: '/utilities/notifications', color: '#EF4444', description: 'Quản lý thông báo' },
  { id: 'settings', label: 'Cài đặt', icon: 'settings-outline', route: '/utilities/settings', color: '#64748B', description: 'Cài đặt hệ thống' },
];

// ============================================================================
// MAIN SERVICES - Dịch vụ chính
// ============================================================================
export const ALL_MAIN_SERVICES: ListItem[] = [
  { id: 'design', label: 'Thiết kế', icon: 'home-outline', route: '/services/house-design', color: '#6366F1', description: 'Thiết kế kiến trúc' },
  { id: 'construction', label: 'Thi công', icon: 'construct-outline', route: '/construction/progress', color: '#F59E0B', description: 'Thi công xây dựng' },
  { id: 'projects', label: 'Dự án', icon: 'folder-outline', route: '/(tabs)/projects', color: '#10B981', description: 'Quản lý dự án' },
  { id: 'progress', label: 'Tiến độ', icon: 'analytics-outline', route: '/construction/tracking', color: '#3B82F6', description: 'Theo dõi tiến độ' },
  { id: 'materials', label: 'Vật liệu', icon: 'cube-outline', route: '/materials/index', color: '#EC4899', description: 'Vật liệu xây dựng' },
  { id: 'quote', label: 'Báo giá', icon: 'calculator-outline', route: '/utilities/quote-request', color: '#8B5CF6', description: 'Yêu cầu báo giá' },
  
  // Additional services
  { id: 'interior', label: 'Nội thất', icon: 'bed-outline', route: '/services/interior-design', color: '#EC4899', description: 'Thiết kế nội thất' },
  { id: 'feng-shui', label: 'Phong thủy', icon: 'compass-outline', route: '/services/feng-shui', color: '#F59E0B', description: 'Tư vấn phong thủy' },
  { id: 'consultation', label: 'Tư vấn', icon: 'chatbubble-ellipses-outline', route: '/services/consultation', color: '#06B6D4', description: 'Tư vấn miễn phí' },
];
