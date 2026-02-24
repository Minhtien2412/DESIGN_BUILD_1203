/**
 * Complete Menu Screen - All 272+ Features Hub
 * Organized by module categories
 * @updated 2026-01-03
 */
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  bg: '#F5F5F5',
  card: '#FFFFFF',
  primary: '#0D9488',
  accent: '#0D9488',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E8E8E8',
  success: '#0D9488',
  warning: '#0D9488',
  error: '#000000',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

// ============================================================================
// MODULE CATEGORIES - Complete 272+ Features
// ============================================================================
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string;
  hot?: boolean;
  new?: boolean;
}

interface ModuleCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: MenuItem[];
}

const MODULE_CATEGORIES: ModuleCategory[] = [
  // ====== CORE MANAGEMENT ======
  {
    id: 'projects',
    title: '📁 Quản lý Dự án',
    icon: 'folder-open-outline',
    color: '#0D9488',
    items: [
      { id: 'p1', label: 'Danh sách dự án', icon: 'list-outline', route: '/projects' },
      { id: 'p2', label: 'Tạo dự án mới', icon: 'add-circle-outline', route: '/projects/create', new: true },
      { id: 'p3', label: 'Tasks & Milestones', icon: 'checkmark-done-outline', route: '/projects/tasks' },
      { id: 'p4', label: 'Timeline', icon: 'git-network-outline', route: '/timeline' },
      { id: 'p5', label: 'Ngân sách', icon: 'calculator-outline', route: '/budget' },
      { id: 'p6', label: 'Gantt Chart', icon: 'bar-chart-outline', route: '/projects/gantt' },
      { id: 'p7', label: 'Biểu đồ dự án', icon: 'stats-chart-outline', route: '/projects/charts' },
      { id: 'p8', label: 'Tài liệu dự án', icon: 'document-text-outline', route: '/projects/documents' },
    ],
  },
  
  // ====== CONSTRUCTION ======
  {
    id: 'construction',
    title: '🏗️ Thi công Xây dựng',
    icon: 'construct-outline',
    color: '#0D9488',
    items: [
      { id: 'c1', label: 'Tiến độ XD', icon: 'analytics-outline', route: '/construction/progress', hot: true },
      { id: 'c2', label: 'Bản đồ công trình', icon: 'map-outline', route: '/construction/map-view' },
      { id: 'c3', label: 'Danh sách công trình', icon: 'list-outline', route: '/construction/map/project-list' },
      { id: 'c4', label: 'Thanh toán đợt', icon: 'cash-outline', route: '/construction/payment-progress' },
      { id: 'c5', label: 'Nhân công', icon: 'people-outline', route: '/labor' },
      { id: 'c6', label: 'Hoàn công', icon: 'checkmark-circle-outline', route: '/as-built' },
      { id: 'c7', label: 'Phases', icon: 'layers-outline', route: '/construction/phases' },
      { id: 'c8', label: 'Daily Report', icon: 'newspaper-outline', route: '/construction/daily-report' },
    ],
  },
  
  // ====== CONTRACTS & QUOTES ======
  {
    id: 'contracts',
    title: '📝 Hợp đồng & Báo giá',
    icon: 'document-attach-outline',
    color: '#0D9488',
    items: [
      { id: 'ct1', label: 'Danh sách HĐ', icon: 'documents-outline', route: '/contracts' },
      { id: 'ct2', label: 'Tạo hợp đồng', icon: 'add-outline', route: '/contracts/create', new: true },
      { id: 'ct3', label: 'Yêu cầu báo giá', icon: 'pricetag-outline', route: '/quote-request' },
      { id: 'ct4', label: 'Báo giá nhận', icon: 'reader-outline', route: '/contracts/quotes' },
      { id: 'ct5', label: 'Templates HĐ', icon: 'copy-outline', route: '/contracts/templates' },
      { id: 'ct6', label: 'Thanh lý HĐ', icon: 'checkmark-done-circle-outline', route: '/contracts/settlement' },
    ],
  },

  // ====== QC/QA ======
  {
    id: 'quality',
    title: '✅ Kiểm tra Chất lượng',
    icon: 'checkmark-done-outline',
    color: '#14B8A6',
    items: [
      { id: 'qa1', label: 'QC/QA Overview', icon: 'shield-checkmark-outline', route: '/quality-assurance' },
      { id: 'qa2', label: 'Checklists', icon: 'checkbox-outline', route: '/quality-assurance/checklists' },
      { id: 'qa3', label: 'Inspections', icon: 'search-outline', route: '/quality-assurance/inspections' },
      { id: 'qa4', label: 'Defects', icon: 'warning-outline', route: '/quality-assurance/defects' },
      { id: 'qa5', label: 'NCRs', icon: 'alert-circle-outline', route: '/quality-assurance/ncr' },
      { id: 'qa6', label: 'Audit', icon: 'clipboard-outline', route: '/quality-assurance/audit' },
      { id: 'qa7', label: 'Standards', icon: 'ribbon-outline', route: '/quality-assurance/standards' },
    ],
  },

  // ====== SHOPPING ======
  {
    id: 'shopping',
    title: '🛒 Mua sắm Vật liệu',
    icon: 'cart-outline',
    color: '#999999',
    items: [
      { id: 's1', label: 'Trang mua sắm', icon: 'storefront-outline', route: '/shopping', hot: true },
      { id: 's2', label: 'Flash Sale', icon: 'flash-outline', route: '/shopping/flash-sale', hot: true },
      { id: 's3', label: 'Vật liệu XD', icon: 'cube-outline', route: '/shopping/vat-lieu-xay' },
      { id: 's4', label: 'Gạch men', icon: 'grid-outline', route: '/shopping/gach-men' },
      { id: 's5', label: 'Sơn', icon: 'color-palette-outline', route: '/shopping/son' },
      { id: 's6', label: 'Điện', icon: 'flash-outline', route: '/shopping/dien' },
      { id: 's7', label: 'Nước', icon: 'water-outline', route: '/shopping/nuoc' },
      { id: 's8', label: 'Nội thất', icon: 'bed-outline', route: '/shopping/noi-that' },
      { id: 's9', label: 'Thiết bị bếp', icon: 'restaurant-outline', route: '/shopping/thiet-bi-bep' },
      { id: 's10', label: 'PCCC', icon: 'flame-outline', route: '/shopping/pccc' },
      { id: 's11', label: 'Giỏ hàng', icon: 'cart-outline', route: '/cart' },
      { id: 's12', label: 'Thanh toán', icon: 'card-outline', route: '/checkout' },
    ],
  },

  // ====== SERVICES ======
  {
    id: 'services',
    title: '💼 Dịch vụ Xây dựng',
    icon: 'briefcase-outline',
    color: '#666666',
    items: [
      { id: 'sv1', label: 'Thiết kế nhà', icon: 'home-outline', route: '/services/house-design' },
      { id: 'sv2', label: 'Thiết kế nội thất', icon: 'bed-outline', route: '/services/interior-design' },
      { id: 'sv3', label: 'Nhà thầu XD', icon: 'business-outline', route: '/services/construction-company' },
      { id: 'sv4', label: 'Giám sát CL', icon: 'eye-outline', route: '/services/quality-supervision' },
      { id: 'sv5', label: 'Phong thủy AI', icon: 'compass-outline', route: '/tools/feng-shui-ai', hot: true },
      { id: 'sv6', label: 'Giấy phép XD', icon: 'document-outline', route: '/services/permit' },
      { id: 'sv7', label: 'Tất cả dịch vụ', icon: 'apps-outline', route: '/services' },
    ],
  },

  // ====== AI CONSULTATION ======
  {
    id: 'ai-consultation',
    title: '🤖 Tư vấn AI',
    icon: 'sparkles-outline',
    color: '#7C3AED',
    items: [
      { id: 'aic1', label: 'Thiết kế nhà AI', icon: 'home-outline', route: '/services/house-design-ai', hot: true },
      { id: 'aic2', label: 'Nội thất AI', icon: 'bed-outline', route: '/services/interior-design-ai', hot: true },
      { id: 'aic3', label: 'Giấy phép AI', icon: 'document-outline', route: '/services/permit-ai', hot: true },
      { id: 'aic4', label: 'Dự toán AI', icon: 'calculator-outline', route: '/services/cost-estimate-ai', hot: true },
      { id: 'aic5', label: 'Phong thủy AI', icon: 'compass-outline', route: '/tools/feng-shui-ai', hot: true },
      { id: 'aic6', label: 'AI Assistant', icon: 'chatbubble-ellipses-outline', route: '/ai/assistant' },
    ],
  },

  // ====== AI & TOOLS ======
  {
    id: 'ai',
    title: '🛠️ Công cụ AI',
    icon: 'construct-outline',
    color: '#0D9488',
    items: [
      { id: 'ai1', label: 'AI Assistant', icon: 'chatbubble-ellipses-outline', route: '/ai/assistant', hot: true },
      { id: 'ai2', label: 'Dự toán AI', icon: 'calculator-outline', route: '/ai/cost-estimator' },
      { id: 'ai3', label: 'Phân tích ảnh', icon: 'camera-outline', route: '/ai/photo-analysis' },
      { id: 'ai4', label: 'Báo cáo AI', icon: 'document-text-outline', route: '/ai/generate-report' },
      { id: 'ai5', label: 'Phong thủy AI', icon: 'compass-outline', route: '/tools/feng-shui-ai' },
      { id: 'ai6', label: 'All AI Tools', icon: 'apps-outline', route: '/ai' },
    ],
  },

  // ====== AI ARCHITECT ======
  {
    id: 'ai-architect',
    title: '🏛️ AI Kiến Trúc Sư',
    icon: 'business-outline',
    color: '#8e44ad',
    items: [
      { id: 'arch1', label: 'Tổng quan', icon: 'grid-outline', route: '/ai-architect', hot: true },
      { id: 'arch2', label: 'Sơ đồ Hệ thống', icon: 'git-network-outline', route: '/ai-architect/architecture', new: true },
      { id: 'arch3', label: 'Sinh Code PHP', icon: 'code-slash-outline', route: '/ai-architect/implementation' },
      { id: 'arch4', label: 'Phong cách KT', icon: 'color-palette-outline', route: '/ai-architect/visualizer' },
      { id: 'arch5', label: 'Tư vấn AI', icon: 'chatbubble-ellipses-outline', route: '/ai-architect/consultant', hot: true },
      { id: 'arch6', label: 'AI Design', icon: 'sparkles-outline', route: '/ai-architect/design', new: true },
      { id: 'arch7', label: 'Templates', icon: 'layers-outline', route: '/ai-architect/templates' },
      { id: 'arch8', label: 'Export', icon: 'download-outline', route: '/ai-architect/export' },
    ],
  },

  // ====== COMMUNICATION ======
  {
    id: 'communication',
    title: '💬 Giao tiếp & Kết nối',
    icon: 'chatbubbles-outline',
    color: '#666666',
    items: [
      { id: 'cm1', label: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages', badge: '5' },
      { id: 'cm2', label: 'Video Call', icon: 'videocam-outline', route: '/call/active' },
      { id: 'cm3', label: 'Lịch sử cuộc gọi', icon: 'call-outline', route: '/call/history' },
      { id: 'cm4', label: 'Live Stream', icon: 'radio-outline', route: '/(tabs)/live' },
      { id: 'cm5', label: 'Social Network', icon: 'people-outline', route: '/social' },
      { id: 'cm6', label: 'Posts', icon: 'newspaper-outline', route: '/social/posts' },
      { id: 'cm7', label: 'Groups', icon: 'people-circle-outline', route: '/social/groups' },
      { id: 'cm8', label: 'Thông báo', icon: 'notifications-outline', route: '/(tabs)/notifications' },
    ],
  },

  // ====== CRM ======
  {
    id: 'crm',
    title: '🏢 Perfex CRM',
    icon: 'business-outline',
    color: '#14B8A6',
    items: [
      { id: 'crm1', label: 'CRM Home', icon: 'home-outline', route: '/crm' },
      { id: 'crm2', label: 'Khách hàng', icon: 'people-outline', route: '/crm/customers' },
      { id: 'crm3', label: 'Dự án CRM', icon: 'folder-outline', route: '/crm/projects' },
      { id: 'crm4', label: 'Tasks', icon: 'checkbox-outline', route: '/crm/tasks' },
      { id: 'crm5', label: 'Invoices', icon: 'receipt-outline', route: '/crm/invoices' },
      { id: 'crm6', label: 'Leads', icon: 'trending-up-outline', route: '/crm/leads' },
      { id: 'crm7', label: 'Contracts', icon: 'document-attach-outline', route: '/crm/contracts' },
      { id: 'crm8', label: 'Sync Settings', icon: 'sync-outline', route: '/crm/settings' },
    ],
  },

  // ====== DOCUMENTS ======
  {
    id: 'documents',
    title: '📄 Tài liệu',
    icon: 'folder-outline',
    color: '#666666',
    items: [
      { id: 'd1', label: 'Tất cả tài liệu', icon: 'documents-outline', route: '/documents' },
      { id: 'd2', label: 'Bản vẽ', icon: 'image-outline', route: '/documents/drawings' },
      { id: 'd3', label: 'Hồ sơ pháp lý', icon: 'document-lock-outline', route: '/documents/legal' },
      { id: 'd4', label: 'Templates', icon: 'copy-outline', route: '/documents/templates' },
      { id: 'd5', label: 'Upload file', icon: 'cloud-upload-outline', route: '/file-upload' },
      { id: 'd6', label: 'Shared', icon: 'share-outline', route: '/documents/shared' },
    ],
  },

  // ====== SAFETY ======
  {
    id: 'safety',
    title: '🦺 An toàn Lao động',
    icon: 'shield-checkmark-outline',
    color: '#000000',
    items: [
      { id: 'sf1', label: 'Safety Overview', icon: 'shield-outline', route: '/safety' },
      { id: 'sf2', label: 'Incidents', icon: 'alert-circle-outline', route: '/safety/incidents' },
      { id: 'sf3', label: 'Reports', icon: 'document-text-outline', route: '/safety/reports' },
      { id: 'sf4', label: 'Training', icon: 'school-outline', route: '/safety/training' },
      { id: 'sf5', label: 'Equipment', icon: 'hardware-chip-outline', route: '/safety/equipment' },
      { id: 'sf6', label: 'Checklists', icon: 'checkbox-outline', route: '/safety/checklists' },
    ],
  },

  // ====== FLEET ======
  {
    id: 'fleet',
    title: '🚛 Phương tiện & Vận chuyển',
    icon: 'car-outline',
    color: '#666666',
    items: [
      { id: 'fl1', label: 'Fleet Overview', icon: 'car-sport-outline', route: '/fleet' },
      { id: 'fl2', label: 'Vehicles', icon: 'car-outline', route: '/fleet/vehicles' },
      { id: 'fl3', label: 'Trips', icon: 'navigate-outline', route: '/fleet/trips' },
      { id: 'fl4', label: 'Maintenance', icon: 'build-outline', route: '/fleet/maintenance' },
      { id: 'fl5', label: 'Fuel', icon: 'speedometer-outline', route: '/fleet/fuel' },
      { id: 'fl6', label: 'Drivers', icon: 'person-outline', route: '/fleet/drivers' },
    ],
  },

  // ====== REPORTS ======
  {
    id: 'reports',
    title: '📊 Báo cáo & Phân tích',
    icon: 'bar-chart-outline',
    color: '#0D9488',
    items: [
      { id: 'rp1', label: 'All Reports', icon: 'stats-chart-outline', route: '/reports' },
      { id: 'rp2', label: 'KPI Dashboard', icon: 'speedometer-outline', route: '/reports/kpi' },
      { id: 'rp3', label: 'Financial', icon: 'cash-outline', route: '/reports/financial' },
      { id: 'rp4', label: 'Progress', icon: 'trending-up-outline', route: '/reports/progress' },
      { id: 'rp5', label: 'Analytics', icon: 'analytics-outline', route: '/analytics' },
      { id: 'rp6', label: 'Export', icon: 'download-outline', route: '/reports/export' },
    ],
  },

  // ====== EQUIPMENT & INVENTORY ======
  {
    id: 'equipment',
    title: '🔧 Thiết bị & Kho bãi',
    icon: 'hardware-chip-outline',
    color: '#666666',
    items: [
      { id: 'eq1', label: 'Equipment', icon: 'hardware-chip-outline', route: '/equipment' },
      { id: 'eq2', label: 'Inventory', icon: 'cube-outline', route: '/inventory' },
      { id: 'eq3', label: 'Maintenance', icon: 'build-outline', route: '/equipment/maintenance' },
      { id: 'eq4', label: 'Tracking', icon: 'locate-outline', route: '/equipment/tracking' },
      { id: 'eq5', label: 'Rentals', icon: 'calendar-outline', route: '/equipment/rentals' },
    ],
  },

  // ====== ADMIN ======
  {
    id: 'admin',
    title: '🛡️ Quản trị Hệ thống',
    icon: 'settings-outline',
    color: '#000000',
    items: [
      { id: 'ad1', label: 'Dashboard', icon: 'speedometer-outline', route: '/dashboard' },
      { id: 'ad2', label: 'Admin Panel', icon: 'cog-outline', route: '/admin' },
      { id: 'ad3', label: 'Users', icon: 'people-outline', route: '/admin/users' },
      { id: 'ad4', label: 'Staff', icon: 'person-outline', route: '/admin/staff' },
      { id: 'ad5', label: 'Permissions', icon: 'key-outline', route: '/admin/permissions' },
      { id: 'ad6', label: 'Settings', icon: 'settings-outline', route: '/admin/settings' },
      { id: 'ad7', label: 'Activity Logs', icon: 'time-outline', route: '/admin/logs' },
      { id: 'ad8', label: 'Backup', icon: 'cloud-outline', route: '/admin/backup' },
    ],
  },

  // ====== PROFILE & ACCOUNT ======
  {
    id: 'profile',
    title: '👤 Tài khoản & Cài đặt',
    icon: 'person-outline',
    color: '#999999',
    items: [
      { id: 'pr1', label: 'Hồ sơ', icon: 'person-circle-outline', route: '/(tabs)/profile' },
      { id: 'pr2', label: 'Đơn hàng', icon: 'receipt-outline', route: '/profile/orders' },
      { id: 'pr3', label: 'Địa chỉ', icon: 'location-outline', route: '/profile/addresses' },
      { id: 'pr4', label: 'Yêu thích', icon: 'heart-outline', route: '/profile/favorites' },
      { id: 'pr5', label: 'Cài đặt', icon: 'settings-outline', route: '/profile/settings' },
      { id: 'pr6', label: 'Bảo mật', icon: 'lock-closed-outline', route: '/profile/security' },
      { id: 'pr7', label: 'Thông báo', icon: 'notifications-outline', route: '/profile/notifications-settings' },
      { id: 'pr8', label: 'Ngôn ngữ', icon: 'language-outline', route: '/profile/language' },
    ],
  },

  // ====== UTILITIES ======
  {
    id: 'utilities',
    title: '🛠️ Tiện ích',
    icon: 'apps-outline',
    color: '#8BC34A',
    items: [
      { id: 'ut1', label: 'Sitemap', icon: 'git-branch-outline', route: '/utilities/sitemap' },
      { id: 'ut2', label: 'Thiết kế', icon: 'color-wand-outline', route: '/utilities/design' },
      { id: 'ut3', label: 'Nội thất', icon: 'home-outline', route: '/utilities/interior' },
      { id: 'ut4', label: 'Thi công', icon: 'construct-outline', route: '/utilities/construction' },
      { id: 'ut5', label: 'Hoàn thiện', icon: 'color-palette-outline', route: '/utilities/finishing' },
      { id: 'ut6', label: 'Equipment', icon: 'hardware-chip-outline', route: '/utilities/equipment' },
      { id: 'ut7', label: 'Thư viện', icon: 'library-outline', route: '/utilities/library' },
      { id: 'ut8', label: 'Weather', icon: 'partly-sunny-outline', route: '/weather' },
      { id: 'ut9', label: 'Calculator', icon: 'calculator-outline', route: '/utilities/calculator' },
      { id: 'ut10', label: 'Scanner', icon: 'scan-outline', route: '/utilities/scanner' },
    ],
  },

  // ====== CHANGE MANAGEMENT ======
  {
    id: 'changes',
    title: '🔄 Quản lý Thay đổi',
    icon: 'swap-horizontal-outline',
    color: '#0D9488',
    items: [
      { id: 'ch1', label: 'Change Orders', icon: 'swap-horizontal-outline', route: '/change-order' },
      { id: 'ch2', label: 'Change Management', icon: 'git-compare-outline', route: '/change-management' },
      { id: 'ch3', label: 'RFIs', icon: 'help-circle-outline', route: '/change-management/rfi' },
      { id: 'ch4', label: 'Submittals', icon: 'paper-plane-outline', route: '/change-management/submittals' },
    ],
  },

  // ====== SCHEDULE ======
  {
    id: 'schedule',
    title: '📅 Lịch & Tasks',
    icon: 'calendar-outline',
    color: '#26A69A',
    items: [
      { id: 'sc1', label: 'Calendar', icon: 'calendar-outline', route: '/schedule' },
      { id: 'sc2', label: 'Scheduled Tasks', icon: 'alarm-outline', route: '/scheduled-tasks' },
      { id: 'sc3', label: 'Meetings', icon: 'people-outline', route: '/schedule/meetings' },
      { id: 'sc4', label: 'Reminders', icon: 'notifications-outline', route: '/schedule/reminders' },
    ],
  },

  // ====== MEDIA & CONTENT ======
  {
    id: 'media',
    title: '🎬 Media & Nội dung',
    icon: 'images-outline',
    color: '#f97316',
    items: [
      { id: 'md1', label: 'Pexels Gallery', icon: 'images-outline', route: '/pexels-gallery', hot: true },
      { id: 'md2', label: 'Video Demo', icon: 'videocam-outline', route: '/demo-videos', new: true },
      { id: 'md3', label: 'Tin tức', icon: 'newspaper-outline', route: '/(tabs)/news' },
      { id: 'md4', label: 'Xã hội', icon: 'people-outline', route: '/(tabs)/social' },
      { id: 'md5', label: 'Live Stream', icon: 'radio-outline', route: '/(tabs)/live' },
    ],
  },

  // ====== TESTING & DEV ======
  {
    id: 'testing',
    title: '🧪 Testing & Dev',
    icon: 'flask-outline',
    color: '#78909C',
    items: [
      { id: 'ts1', label: 'Health Check', icon: 'medkit-outline', route: '/health-check' },
      { id: 'ts2', label: 'Test Auth', icon: 'key-outline', route: '/test-perfex-auth' },
      { id: 'ts3', label: 'Test Simple', icon: 'code-outline', route: '/test-simple' },
      { id: 'ts4', label: 'Progress Backup', icon: 'cloud-upload-outline', route: '/construction-progress-backup' },
      { id: 'ts5', label: 'API Status', icon: 'pulse-outline', route: '/(tabs)/api-status' },
      { id: 'ts6', label: 'Quyền truy cập', icon: 'key-outline', route: '/permissions' },
    ],
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

// Category Header
const CategoryHeader = memo<{ category: ModuleCategory; expanded: boolean; onToggle: () => void }>(
  ({ category, expanded, onToggle }) => (
    <TouchableOpacity
      style={styles.categoryHeader}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.categoryLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '15' }]}>
          <Ionicons name={category.icon as any} size={20} color={category.color} />
        </View>
        <View>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryCount}>{category.items.length} chức năng</Text>
        </View>
      </View>
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={COLORS.textMuted}
      />
    </TouchableOpacity>
  )
);
CategoryHeader.displayName = 'CategoryHeader';

// Menu Item
const MenuItemCard = memo<{ item: MenuItem; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => onPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <Ionicons name={item.icon as any} size={20} color={COLORS.textSecondary} />
        <Text style={styles.menuItemLabel}>{item.label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.hot && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotText}>HOT</Text>
          </View>
        )}
        {item.new && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
        {item.badge && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{item.badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  )
);
MenuItemCard.displayName = 'MenuItemCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['projects', 'construction', 'shopping']) // Default expanded
  );

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return MODULE_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return MODULE_CATEGORIES.map(category => ({
      ...category,
      items: category.items.filter(
        item =>
          item.label.toLowerCase().includes(query) ||
          category.title.toLowerCase().includes(query)
      ),
    })).filter(category => category.items.length > 0);
  }, [searchQuery]);

  // Total features count
  const totalFeatures = useMemo(() => {
    return MODULE_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const navigateTo = useCallback((route: string) => {
    router.push(route as Href);
  }, []);

  const expandAll = useCallback(() => {
    setExpandedCategories(new Set(MODULE_CATEGORIES.map(c => c.id)));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Tất cả chức năng</Text>
            <Text style={styles.headerSubtitle}>{totalFeatures}+ tính năng</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={expandAll}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={collapseAll}>
              <Ionicons name="remove-circle-outline" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm chức năng..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredCategories.map(category => {
          const isExpanded = expandedCategories.has(category.id) || searchQuery.length > 0;
          return (
            <View key={category.id} style={styles.categoryContainer}>
              <CategoryHeader
                category={category}
                expanded={isExpanded}
                onToggle={() => toggleCategory(category.id)}
              />
              {isExpanded && (
                <View style={styles.categoryItems}>
                  {category.items.map(item => (
                    <MenuItemCard key={item.id} item={item} onPress={navigateTo} />
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Construction Management Platform
          </Text>
          <Text style={styles.footerVersion}>
            Version 4.0 - {totalFeatures}+ Features
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerBtn: {
    padding: SPACING.xs,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 40,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.sm,
  },

  // Category
  categoryContainer: {
    backgroundColor: COLORS.card,
    marginBottom: SPACING.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Menu Items
  categoryItems: {
    paddingHorizontal: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  // Badges
  hotBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  newBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footerVersion: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
