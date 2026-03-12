// Structured feature groups for the redesigned Home screen.
// Each group id maps to a title and an array of feature items.
// Keep icon names aligned with @expo/vector-icons/MaterialIcons.

import type { Href } from 'expo-router';

export interface HomeFeatureItem {
  key: string;
  icon: React.ComponentProps<typeof import('@expo/vector-icons/MaterialIcons').default>['name'];
  label: string;
  route?: Href;          // optional navigation target
  disabled?: boolean;    // greyed out if true
  badge?: string;        // small numeric or text badge (e.g. "10", "LIVE")
  badgeType?: 'count' | 'live';
}

export interface HomeFeatureGroup {
  id: string;
  title: string;
  items: HomeFeatureItem[];
  subtitle?: string;   // optional small description line under the title
  columns?: number; // allow override per group (default 4)
  numbered?: boolean; // whether to show numeric ordering prefix
}

export const HOME_FEATURE_GROUPS: HomeFeatureGroup[] = [
  {
    id: 'services-primary',
    title: 'DỊCH VỤ',
    numbered: true,
    items: [
      { key: 'svc-design-house', icon: 'maps-home-work', label: 'Thiết kế nhà', route: '/services/house-design' },
      { key: 'svc-architecture', icon: 'architecture', label: 'Thiết kế kiến trúc', route: '/services/house-design' },
      { key: 'svc-build-basic', icon: 'handyman', label: 'Xây dựng cơ bản', route: '/services/construction-company' },
      { key: 'svc-structure-mep', icon: 'engineering', label: 'Kết cấu & MEP', route: '/services/construction-lookup' },
      { key: 'svc-project-mgmt', icon: 'manage-accounts', label: 'Quản lý dự án', route: '/(tabs)/projects' },
      { key: 'svc-pricing', icon: 'price-change', label: 'Báo giá', route: '/projects/quotation-list' },
      { key: 'svc-contract', icon: 'assignment', label: 'Hợp đồng', disabled: true },
      { key: 'svc-consult', icon: 'support-agent', label: 'Tư vấn', route: '/services/quality-consulting' },
      { key: 'svc-plumbing', icon: 'plumbing', label: 'Điện nước', route: '/utilities/tho-dien-nuoc' },
      { key: 'svc-paint', icon: 'format-paint', label: 'Sơn hoàn thiện', route: '/finishing/son' },
      { key: 'svc-interior', icon: 'carpenter', label: 'Nội thất', route: '/services/interior-design' },
      { key: 'svc-landscape', icon: 'landscape', label: 'Cảnh quan', disabled: true },
      { key: 'svc-security', icon: 'security', label: 'Giám sát', route: '/services/quality-supervision' },
      { key: 'svc-progress', icon: 'calendar-today', label: 'Tiến độ', route: '/(tabs)/projects' },
      { key: 'svc-payment', icon: 'payments', label: 'Thanh toán', route: '/profile/payment' },
      { key: 'svc-standard', icon: 'rule', label: 'Tiêu chuẩn', route: '/services/construction-lookup' },
    ],
  },
  {
    id: 'building-utilities',
    title: 'TIỆN ÍCH XÂY DỰNG',
    numbered: true,
    subtitle: 'App hỗ trợ tiện lợi cho khách hàng',
    items: [
      { key: 'util-company-build', icon: 'business', label: 'Công ty xây dựng', route: '/services/construction-company' },
      { key: 'util-company-interior', icon: 'domain', label: 'Công ty nội thất', route: '/services/company-detail' },
      { key: 'util-quality-supervise', icon: 'security', label: 'Giám sát chất lượng', route: '/services/quality-supervision' },
      { key: 'util-docs', icon: 'description', label: 'Hồ sơ mẫu', route: '/services/sample-docs' },
      { key: 'util-more', icon: 'chevron-right', label: 'Xem thêm', route: '/utilities/ep-coc' },
    ],
  },
  {
    id: 'shopping-equipment',
    title: 'TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ',
    numbered: true,
    items: [
      { key: 'shop-bath', icon: 'bathtub', label: 'Thiết bị vệ sinh', route: '/shopping/nuoc' },
      { key: 'shop-electric', icon: 'lightbulb', label: 'Thiết bị điện', route: '/shopping/dien' },
      { key: 'shop-water', icon: 'waterfall-chart', label: 'Thiết bị nước', route: '/shopping/nuoc' },
      { key: 'shop-kitchen', icon: 'kitchen', label: 'Thiết bị bếp', route: '/shopping/noi-that' },
      { key: 'shop-more', icon: 'chevron-right', label: 'Xem thêm', route: '/shopping/vat-lieu-xay' },
    ],
  },
  {
    id: 'library',
    title: 'THƯ VIỆN',
    numbered: true,
    items: [
      { key: 'lib-houses', icon: 'home', label: 'Mẫu Nhà', route: '/projects/architecture-portfolio' },
      { key: 'lib-garden', icon: 'park', label: 'Mẫu Sân Vườn', route: '/projects/architecture-portfolio' },
      { key: 'lib-devices', icon: 'devices-other', label: 'Thiết Bị', disabled: true },
      { key: 'lib-store', icon: 'store', label: 'Store', disabled: true },
      { key: 'lib-fengshui', icon: 'star-rate', label: 'Phong Thủy', disabled: true },
      { key: 'lib-bath', icon: 'bathtub', label: 'Phòng Tắm', disabled: true },
      { key: 'lib-kitchen', icon: 'kitchen', label: 'Phòng Bếp', disabled: true },
      { key: 'lib-living', icon: 'weekend', label: 'Phòng Khách', disabled: true },
      { key: 'lib-bed', icon: 'bed', label: 'Phòng Ngủ', disabled: true },
      { key: 'lib-roof', icon: 'roofing', label: 'Mái & Trần', disabled: true },
      { key: 'lib-stairs', icon: 'stairs', label: 'Cầu Thang', disabled: true },
      { key: 'lib-garage', icon: 'garage', label: 'Gara', disabled: true },
      { key: 'lib-office', icon: 'apartment', label: 'Văn phòng', disabled: true },
      { key: 'lib-hotel', icon: 'hotel', label: 'Khách sạn', disabled: true },
      { key: 'lib-factory', icon: 'warehouse', label: 'Nhà xưởng', disabled: true },
      { key: 'lib-more', icon: 'chevron-right', label: 'Xem thêm', disabled: true },
    ],
  },
];

export type { HomeFeatureItem as FeatureItem };
