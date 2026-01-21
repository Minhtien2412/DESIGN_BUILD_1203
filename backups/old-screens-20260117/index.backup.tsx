/**
 * Home Screen v4 - Complete Feature Hub
 * Full-featured Home with All Module Access
 * Based on Router Structure Analysis
 * Now with REAL DATA from Perfex CRM & API
 * @updated 2026-01-09 - Added Meeting Tracking
 */

import { ProgressSection } from '@/components/home/progress-section';
import { MeetingTrackingCard } from '@/components/meeting/MeetingTrackingCard';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ============================================================================
// DESIGN TOKENS - Elegant & Minimalist Design (Updated 2026-01-09)
// ============================================================================
const COLORS = {
  // Backgrounds - Clean & Professional
  bg: '#FAFAFA',
  card: '#FFFFFF',
  
  // Primary Brand - Elegant Blue
  primary: '#1E40AF', // Deep Blue
  primaryDark: '#1E3A8A',
  primaryLight: '#DBEAFE',
  
  // Accent Colors - Subtle & Refined
  accent: '#3B82F6', // Modern Blue
  accentLight: '#EFF6FF',
  
  // Text - Clear Hierarchy
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textWhite: '#FFFFFF',
  
  // Status Colors - Sophisticated Palette
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  
  // UI Elements - Minimal & Clean
  border: '#E5E7EB',
  divider: '#F3F4F6',
  shadow: 'rgba(0, 0, 0, 0.06)',
  
  // Module Colors - Harmonious
  construction: '#1E40AF',
  project: '#3B82F6',
  shopping: '#6B7280',
  ai: '#8B5CF6',
  live: '#EC4899',
  crm: '#6366F1',
  documents: '#10B981',
  safety: '#DC2626',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ============================================================================
// DATA - Based on Complete Router Structure
// ============================================================================

// Hero Banner Data
const BANNERS = [
  { id: 1, title: 'Theo dõi Tiến độ', subtitle: 'Cuộc họp & công trình', color: '#3B82F6', route: '/progress-meetings' },
  { id: 2, title: 'Flash Sale', subtitle: 'Vật liệu xây dựng', color: '#6B7280', route: '/shopping/flash-sale' },
  { id: 3, title: 'AI Assistant', subtitle: 'Dự toán thông minh', color: '#8B5CF6', route: '/ai/assistant' },
];

// Quick Access - Most Used Features (Badges will be dynamic)
const QUICK_ACCESS_CONFIG = [
  { id: 1, label: 'Dự án', icon: 'folder-outline', route: '/(tabs)/projects', color: '#0066CC', badgeKey: 'projects' },
  { id: 2, label: 'Theo dõi', icon: 'navigate-circle-outline', route: '/progress-meetings', color: '#3B82F6', badgeKey: null },
  { id: 3, label: 'Tài liệu', icon: 'documents-outline', route: '/documents', color: '#10B981', badgeKey: 'documents' },
  { id: 4, label: 'Hoá đơn', icon: 'receipt-outline', route: '/crm/invoices', color: '#F59E0B', badgeKey: 'invoices' },
  { id: 5, label: 'Hợp đồng', icon: 'document-attach-outline', route: '/contracts', color: '#8B5CF6', badgeKey: 'contracts' },
  { id: 6, label: 'Chat', icon: 'chatbubbles-outline', route: '/messages', color: '#EC4899', badgeKey: 'chat' },
  { id: 7, label: 'CRM', icon: 'business-outline', route: '/crm', color: '#6366F1', badgeKey: 'crm' },
  { id: 8, label: 'Xem thêm', icon: 'apps-outline', route: '/(tabs)/menu', color: '#64748B', badgeKey: null },
];

// Core Modules - Primary Business Functions (Stats will be dynamic)
const CORE_MODULES_CONFIG = [
  { 
    id: 1, 
    title: 'Quản lý Dự án', 
    subtitle: 'Timeline, Tasks, Phases',
    icon: 'folder-open-outline',
    color: '#3B82F6',
    route: '/(tabs)/projects',
    statsKey: 'projects'
  },
  { 
    id: 2, 
    title: 'Thi công XD', 
    subtitle: 'Progress, Tracking, Map',
    icon: 'construct-outline',
    color: '#1E40AF',
    route: '/construction/progress',
    statsKey: 'construction'
  },
  { 
    id: 3, 
    title: 'Tài liệu & Văn bản', 
    subtitle: 'Documents, Files, Archive',
    icon: 'documents-outline',
    color: '#10B981',
    route: '/documents',
    statsKey: 'documents'
  },
  { 
    id: 4, 
    title: 'Hoá đơn & Thanh toán', 
    subtitle: 'Invoices, Payments',
    icon: 'receipt-outline',
    color: '#F59E0B',
    route: '/crm/invoices',
    statsKey: 'invoices'
  },
  { 
    id: 5, 
    title: 'Hợp đồng', 
    subtitle: 'Contracts, Quotations',
    icon: 'document-attach-outline',
    color: '#8B5CF6',
    route: '/contracts',
    statsKey: 'contracts'
  },
  { 
    id: 6, 
    title: 'QC/QA', 
    subtitle: 'Quality, Inspections',
    icon: 'checkmark-done-outline',
    color: '#059669',
    route: '/quality-assurance',
    statsKey: 'qc'
  },
];

// Commerce Module - Shopping Features
const COMMERCE_ITEMS = [
  { id: 1, label: 'Vật liệu XD', emoji: '🧱', route: '/shopping/vat-lieu-xay', hot: true },
  { id: 2, label: 'Gạch men', emoji: '🏠', route: '/shopping/gach-men', hot: false },
  { id: 3, label: 'Sơn', emoji: '🎨', route: '/shopping/son', hot: true },
  { id: 4, label: 'Điện', emoji: '💡', route: '/shopping/dien', hot: false },
  { id: 5, label: 'Nước', emoji: '🚿', route: '/shopping/nuoc', hot: false },
  { id: 6, label: 'Nội thất', emoji: '🛋️', route: '/shopping/noi-that', hot: true },
  { id: 7, label: 'Thiết bị bếp', emoji: '🍳', route: '/shopping/thiet-bi-bep', hot: false },
  { id: 8, label: 'PCCC', emoji: '🧯', route: '/shopping/pccc', hot: false },
];

// Services - Dịch vụ xây dựng
const SERVICES = [
  { id: 1, label: 'Thiết kế nhà', icon: 'home-outline', route: '/services/house-design', color: '#3B82F6' },
  { id: 2, label: 'Thiết kế nội thất', icon: 'bed-outline', route: '/services/interior-design', color: '#8B5CF6' },
  { id: 3, label: 'Nhà thầu XD', icon: 'business-outline', route: '/services/construction-company', color: '#6366F1' },
  { id: 4, label: 'Giám sát CL', icon: 'eye-outline', route: '/services/quality-supervision', color: '#059669' },
  { id: 5, label: 'Phong thủy', icon: 'compass-outline', route: '/services/feng-shui', color: '#EC4899' },
  { id: 6, label: 'Giấy phép XD', icon: 'document-outline', route: '/services/permit', color: '#1E40AF' },
  { id: 7, label: 'Bảo trì nhà', icon: 'build-outline', route: '/services/home-maintenance', color: '#D97706', hot: true },
  { id: 8, label: 'Sửa điện nước', icon: 'flash-outline', route: '/services/home-maintenance', color: '#10B981' },
];

// AI Features
const AI_FEATURES = [
  { id: 1, label: 'AI Assistant', icon: 'sparkles', route: '/ai/assistant', desc: 'Trợ lý thông minh' },
  { id: 2, label: 'Dự toán CP', icon: 'calculator', route: '/ai/cost-estimator', desc: 'Tính chi phí' },
  { id: 3, label: 'Phân tích ảnh', icon: 'camera', route: '/ai/photo-analysis', desc: 'AI nhận diện' },
  { id: 4, label: 'Báo cáo AI', icon: 'document-text', route: '/ai/generate-report', desc: 'Tự động tạo' },
];

// 🎨 TIỆN ÍCH THIẾT KẾ - AI Kiến trúc sư
const DESIGN_UTILITIES = [
  { id: 1, label: 'AI Kiến trúc', icon: 'business-outline', route: '/ai-architect', color: '#8e44ad', hot: true, desc: 'Tổng quan' },
  { id: 2, label: 'Sơ đồ Hệ thống', icon: 'git-network-outline', route: '/ai-architect/architecture', color: '#03a9f4', hot: false, desc: 'Mermaid diagrams' },
  { id: 3, label: 'Sinh Code PHP', icon: 'code-slash-outline', route: '/ai-architect/implementation', color: '#27ae60', hot: false, desc: 'Auto generate' },
  { id: 4, label: 'Phong cách KT', icon: 'color-palette-outline', route: '/ai-architect/visualizer', color: '#e74c3c', hot: true, desc: '8 styles' },
  { id: 5, label: 'Tư vấn AI', icon: 'chatbubbles-outline', route: '/ai-architect/consultant', color: '#f39c12', hot: true, desc: 'Chat AI' },
  { id: 6, label: 'AI Design', icon: 'sparkles-outline', route: '/ai-architect/design', color: '#9b59b6', hot: true, desc: 'Tạo thiết kế' },
  { id: 7, label: 'Templates', icon: 'layers-outline', route: '/ai-architect/templates', color: '#1abc9c', hot: false, desc: '6 mẫu' },
  { id: 8, label: 'Export', icon: 'download-outline', route: '/ai-architect/export', color: '#e67e22', hot: false, desc: 'PDF, Code' },
];

// 🏠 TIỆN ÍCH HOÀN THIỆN - Dành cho gia chủ
const FINISHING_UTILITIES = [
  { id: 1, label: 'Tính sơn', emoji: '🎨', route: '/calculators/paint', desc: 'Tính lượng sơn' },
  { id: 2, label: 'Tính gạch', emoji: '🧱', route: '/calculators/tiles', desc: 'Tính số lượng gạch' },
  { id: 3, label: 'Tính điện', emoji: '⚡', route: '/calculators/electrical', desc: 'Công suất điện' },
  { id: 4, label: 'Tính nước', emoji: '💧', route: '/calculators/plumbing', desc: 'Đường ống nước' },
  { id: 5, label: 'Phong thủy', emoji: '🧭', route: '/tools/fengshui', desc: 'Hướng nhà tốt' },
  { id: 6, label: 'Màu sơn', emoji: '🎯', route: '/tools/color-picker', desc: 'Chọn màu sơn' },
  { id: 7, label: 'Nội thất', emoji: '🛋️', route: '/tools/interior-planner', desc: 'Bố trí nội thất' },
  { id: 8, label: 'So sánh giá', emoji: '💰', route: '/tools/price-compare', desc: 'So sánh vật liệu' },
];

// Communication Features
const COMMUNICATION = [
  { id: 1, label: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages', badge: 5, color: '#3B82F6' },
  { id: 2, label: 'Video Call', icon: 'videocam-outline', route: '/call/active', badge: 0, color: '#8B5CF6' },
  { id: 3, label: 'Live Stream', icon: 'radio-outline', route: '/(tabs)/live', badge: 2, color: '#EC4899' },
  { id: 4, label: 'Social', icon: 'people-outline', route: '/social', badge: 0, color: '#6366F1' },
];

// Admin/Dashboard Quick Access
const ADMIN_SHORTCUTS = [
  { id: 1, label: 'Dashboard', icon: 'speedometer-outline', route: '/dashboard', role: 'all' },
  { id: 2, label: 'Quản trị', icon: 'settings-outline', route: '/admin', role: 'admin' },
  { id: 3, label: 'Nhân viên', icon: 'people-outline', route: '/admin/staff', role: 'admin' },
  { id: 4, label: 'Phân quyền', icon: 'key-outline', route: '/admin/permissions', role: 'admin' },
];

// Utility Tools
const UTILITY_TOOLS = [
  { id: 1, label: 'Tài liệu', icon: 'folder-outline', route: '/documents' },
  { id: 2, label: 'Hoá đơn', icon: 'receipt-outline', route: '/crm/invoices' },
  { id: 3, label: 'An toàn LĐ', icon: 'shield-checkmark-outline', route: '/safety' },
  { id: 4, label: 'Phương tiện', icon: 'car-outline', route: '/fleet' },
  { id: 5, label: 'Kho bãi', icon: 'cube-outline', route: '/inventory' },
  { id: 6, label: 'Thiết bị', icon: 'hardware-chip-outline', route: '/equipment' },
  { id: 7, label: 'Nhân công', icon: 'body-outline', route: '/labor' },
  { id: 8, label: 'Thời tiết', icon: 'partly-sunny-outline', route: '/weather' },
  { id: 9, label: 'Bản đồ', icon: 'map-outline', route: '/construction/map-view' },
];

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

// Banner Slider Item
const BannerItem = memo<{ item: typeof BANNERS[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={[styles.bannerItem, { backgroundColor: item.color }]}
      onPress={() => onPress(item.route)}
      activeOpacity={0.9}
    >
      <View>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward-circle" size={32} color="rgba(255,255,255,0.8)" />
    </TouchableOpacity>
  )
);
BannerItem.displayName = 'BannerItem';

// Quick Access Item (Updated to accept badge prop)
interface QuickAccessItemProps {
  item: { id: number; label: string; icon: string; route: string; color: string; badgeKey: string | null };
  badge: string | null;
  onPress: (route: string) => void;
}
const QuickAccessItem = memo<QuickAccessItemProps>(
  ({ item, badge, onPress }) => (
    <TouchableOpacity 
      style={styles.quickAccessItem} 
      onPress={() => onPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.quickAccessIcon, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
        {badge && (
          <View style={styles.quickAccessBadge}>
            <Text style={styles.quickAccessBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.quickAccessLabel}>{item.label}</Text>
    </TouchableOpacity>
  )
);
QuickAccessItem.displayName = 'QuickAccessItem';

// Core Module Card (Updated to accept stats prop)
interface CoreModuleCardProps {
  item: { id: number; title: string; subtitle: string; icon: string; color: string; route: string; statsKey: string };
  stats: string;
  onPress: (route: string) => void;
}
const CoreModuleCard = memo<CoreModuleCardProps>(
  ({ item, stats, onPress }) => (
    <TouchableOpacity
      style={styles.coreModuleCard}
      onPress={() => onPress(item.route)}
      activeOpacity={0.8}
    >
      <View style={[styles.coreModuleIcon, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={28} color={item.color} />
      </View>
      <View style={styles.coreModuleContent}>
        <Text style={styles.coreModuleTitle}>{item.title}</Text>
        <Text style={styles.coreModuleSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.coreModuleStats}>
        <Text style={[styles.coreModuleStatsText, { color: item.color }]}>{stats}</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  )
);
CoreModuleCard.displayName = 'CoreModuleCard';

// Commerce Category Item
const CommerceItem = memo<{ item: typeof COMMERCE_ITEMS[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.commerceItem}
      onPress={() => onPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.commerceIconContainer}>
        <Text style={styles.commerceEmoji}>{item.emoji}</Text>
        {item.hot && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>HOT</Text>
          </View>
        )}
      </View>
      <Text style={styles.commerceLabel}>{item.label}</Text>
    </TouchableOpacity>
  )
);
CommerceItem.displayName = 'CommerceItem';

// Service Card
const ServiceCard = memo<{ item: typeof SERVICES[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => onPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.serviceIcon, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
        {(item as any).hot && (
          <View style={styles.serviceHotBadge}>
            <Text style={styles.serviceHotBadgeText}>HOT</Text>
          </View>
        )}
      </View>
      <Text style={styles.serviceLabel}>{item.label}</Text>
    </TouchableOpacity>
  )
);
ServiceCard.displayName = 'ServiceCard';

// AI Feature Card
const AIFeatureCard = memo<{ item: typeof AI_FEATURES[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.aiFeatureCard}
      onPress={() => onPress(item.route)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiFeatureGradient}
      >
        <Ionicons name={item.icon as any} size={24} color="#fff" />
      </LinearGradient>
      <Text style={styles.aiFeatureLabel}>{item.label}</Text>
      <Text style={styles.aiFeatureDesc}>{item.desc}</Text>
    </TouchableOpacity>
  )
);
AIFeatureCard.displayName = 'AIFeatureCard';

// Communication Item
const CommunicationItem = memo<{ item: typeof COMMUNICATION[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.commItem}
      onPress={() => onPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.commIcon, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
        {item.badge > 0 && (
          <View style={styles.commBadge}>
            <Text style={styles.commBadgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.commLabel}>{item.label}</Text>
    </TouchableOpacity>
  )
);
CommunicationItem.displayName = 'CommunicationItem';

// Design Utility Item - AI Kiến trúc
const DesignUtilityItem = memo<{ item: typeof DESIGN_UTILITIES[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.designUtilityItem}
      onPress={() => onPress(item.route)}
      activeOpacity={0.8}
    >
      <View style={[styles.designUtilityIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
        {item.hot && (
          <View style={styles.designHotBadge}>
            <Text style={styles.designHotText}>🔥</Text>
          </View>
        )}
      </View>
      <Text style={styles.designUtilityLabel}>{item.label}</Text>
      <Text style={styles.designUtilityDesc}>{item.desc}</Text>
    </TouchableOpacity>
  )
);
DesignUtilityItem.displayName = 'DesignUtilityItem';

// Finishing Utility Item - Tiện ích hoàn thiện
const FinishingUtilityItem = memo<{ item: typeof FINISHING_UTILITIES[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.finishingItem}
      onPress={() => onPress(item.route)}
      activeOpacity={0.8}
    >
      <Text style={styles.finishingEmoji}>{item.emoji}</Text>
      <Text style={styles.finishingLabel}>{item.label}</Text>
      <Text style={styles.finishingDesc}>{item.desc}</Text>
    </TouchableOpacity>
  )
);
FinishingUtilityItem.displayName = 'FinishingUtilityItem';

// Utility Tool Item
const UtilityItem = memo<{ item: typeof UTILITY_TOOLS[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.utilityItem}
      onPress={() => onPress(item.route)}
      activeOpacity={0.7}
    >
      <Ionicons name={item.icon as any} size={22} color={COLORS.textSecondary} />
      <Text style={styles.utilityLabel}>{item.label}</Text>
    </TouchableOpacity>
  )
);
UtilityItem.displayName = 'UtilityItem';

// Data Source Indicator
const DataSourceBadge = memo<{ source: 'api' | 'mock' | 'cache'; loading: boolean }>(
  ({ source, loading }) => {
    if (loading) return null;
    const config = {
      api: { label: '🟢 Live', color: COLORS.success },
      mock: { label: '🟡 Demo', color: COLORS.warning },
      cache: { label: '💾 Cache', color: COLORS.info },
    };
    const { label, color } = config[source];
    return (
      <View style={[styles.dataSourceBadge, { backgroundColor: color + '20', borderColor: color }]}>
        <Text style={[styles.dataSourceText, { color }]}>{label}</Text>
      </View>
    );
  }
);
DataSourceBadge.displayName = 'DataSourceBadge';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  
  // 🔥 USE REAL DATA FROM HOOK
  const {
    stats,
    quickBadges,
    coreStats,
    loading: dataLoading,
    dataSource,
    refresh: refreshData,
  } = useDashboardData();

  // Memoize Quick Access with dynamic badges
  const quickAccessItems = useMemo(() => {
    return QUICK_ACCESS_CONFIG.map(item => ({
      ...item,
      badge: item.badgeKey ? (quickBadges as any)[item.badgeKey] : null,
    }));
  }, [quickBadges]);

  // Memoize Core Modules with dynamic stats
  const coreModules = useMemo(() => {
    return CORE_MODULES_CONFIG.map(item => ({
      ...item,
      stats: (coreStats as any)[item.statsKey] || '0',
    }));
  }, [coreStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const navigateTo = useCallback((route: string) => {
    router.push(route as Href);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ====== HEADER ====== */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={() => navigateTo('/(tabs)/profile')}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.greeting}>
                Xin chào{user?.name ? `, ${user.name}` : ''}!
              </Text>
              <Text style={styles.headerSubtitle}>Quản lý xây dựng thông minh</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigateTo('/(tabs)/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notiBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigateTo('/cart')}
            >
              <Ionicons name="cart-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigateTo('/messages')}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigateTo('/search')}
          activeOpacity={0.9}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Tìm dịch vụ, vật liệu, nhà thầu...</Text>
          <View style={styles.searchCamera}>
            <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ====== BANNER SLIDER ====== */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerContainer}
          contentContainerStyle={styles.bannerContent}
        >
          {BANNERS.map((banner) => (
            <BannerItem key={banner.id} item={banner} onPress={navigateTo} />
          ))}
        </ScrollView>

        {/* ====== DATA SOURCE INDICATOR ====== */}
        <View style={styles.dataSourceContainer}>
          <DataSourceBadge source={dataSource} loading={dataLoading} />
          {!dataLoading && (
            <Text style={styles.statsOverview}>
              📊 {stats.projects.total} dự án • {stats.customers.total} KH • {stats.tasks.pending} tasks
            </Text>
          )}
        </View>

        {/* ====== QUICK ACCESS ====== */}
        <View style={styles.section}>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item) => (
              <QuickAccessItem key={item.id} item={item} badge={item.badge} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* ====== MEETING TRACKING ====== */}
        <MeetingTrackingCard />

        {/* ====== PROJECT PROGRESS ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>📊 Tiến độ dự án</Text>
              <Text style={styles.sectionSubtitle}>
                {dataSource === 'api' ? 'Dữ liệu realtime từ CRM' : 'Demo data'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/construction/progress')}>
              <Text style={styles.seeAll}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
          <ProgressSection />
        </View>

        {/* ====== CORE MODULES ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏗️ Quản lý Nghiệp vụ</Text>
            <TouchableOpacity onPress={() => navigateTo('/dashboard')}>
              <Text style={styles.seeAll}>Dashboard</Text>
            </TouchableOpacity>
          </View>
          {coreModules.map((module) => (
            <CoreModuleCard key={module.id} item={module} stats={module.stats} onPress={navigateTo} />
          ))}
        </View>

        {/* ====== AI ASSISTANT ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤖 AI Features</Text>
            <TouchableOpacity onPress={() => navigateTo('/ai')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aiList}
          >
            {AI_FEATURES.map((item) => (
              <AIFeatureCard key={item.id} item={item} onPress={navigateTo} />
            ))}
          </ScrollView>
        </View>

        {/* ====== TIỆN ÍCH THIẾT KẾ - AI KIẾN TRÚC SƯ ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🏛️ Tiện ích Thiết kế</Text>
              <Text style={styles.sectionSubtitle}>AI Kiến trúc sư - Gemini 2.0</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/ai-architect')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {/* AI Architect Banner */}
          <TouchableOpacity 
            style={styles.designBanner}
            onPress={() => navigateTo('/ai-architect')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8e44ad', '#9b59b6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.designBannerGradient}
            >
              <View style={styles.designBannerContent}>
                <Text style={styles.designBannerEmoji}>🏛️</Text>
                <View>
                  <Text style={styles.designBannerTitle}>AI Kiến Trúc Sư</Text>
                  <Text style={styles.designBannerDesc}>Thiết kế • Sơ đồ • Code PHP</Text>
                </View>
              </View>
              <View style={styles.designBannerBadge}>
                <Text style={styles.designBannerBadgeText}>Powered by Gemini</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Design Utilities Grid */}
          <View style={styles.designUtilitiesGrid}>
            {DESIGN_UTILITIES.map((item) => (
              <DesignUtilityItem key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* ====== TIỆN ÍCH HOÀN THIỆN - GIA CHỦ ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🏠 Tiện ích Hoàn thiện</Text>
              <Text style={styles.sectionSubtitle}>Công cụ hữu ích cho gia chủ</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/tools')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {/* Finishing Utilities Grid */}
          <View style={styles.finishingGrid}>
            {FINISHING_UTILITIES.map((item) => (
              <FinishingUtilityItem key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* ====== SHOPPING / COMMERCE ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🛒 Mua sắm Vật liệu</Text>
              <Text style={styles.sectionSubtitle}>Giá tốt nhất thị trường</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/shopping')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {/* Flash Sale Banner */}
          <TouchableOpacity 
            style={styles.flashSaleBanner}
            onPress={() => navigateTo('/shopping/flash-sale')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.flashSaleGradient}
            >
              <View style={styles.flashSaleContent}>
                <Ionicons name="flash" size={24} color="#FFFFFF" />
                <Text style={styles.flashSaleText}>FLASH SALE</Text>
                <Text style={styles.flashSaleTime}>Kết thúc trong 02:45:30</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Categories Grid */}
          <View style={styles.commerceGrid}>
            {COMMERCE_ITEMS.map((item) => (
              <CommerceItem key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* ====== SERVICES ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💼 Dịch vụ Xây dựng</Text>
            <TouchableOpacity onPress={() => navigateTo('/services')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicesGrid}>
            {SERVICES.map((item) => (
              <ServiceCard key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* ====== COMMUNICATION ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💬 Giao tiếp & Kết nối</Text>
          </View>
          <View style={styles.commGrid}>
            {COMMUNICATION.map((item) => (
              <CommunicationItem key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* ====== UTILITY TOOLS ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🛠️ Công cụ & Tiện ích</Text>
            <TouchableOpacity onPress={() => navigateTo('/(tabs)/menu')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.utilityGrid}>
            {UTILITY_TOOLS.map((item) => (
              <UtilityItem key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* ====== ADMIN SECTION (If Admin) ====== */}
        {isAdmin && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🛡️ Quản trị hệ thống</Text>
            </View>
            <View style={styles.adminGrid}>
              {ADMIN_SHORTCUTS.filter(s => s.role === 'all' || (isAdmin && s.role === 'admin')).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.adminItem}
                  onPress={() => navigateTo(item.route)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={item.icon as any} size={24} color={COLORS.accent} />
                  <Text style={styles.adminLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ====== CRM SECTION ====== */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.crmBanner}
            onPress={() => navigateTo('/crm')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.crmGradient}
            >
              <View style={styles.crmContent}>
                <Ionicons name="business-outline" size={32} color="#fff" />
                <View style={styles.crmText}>
                  <Text style={styles.crmTitle}>Perfex CRM</Text>
                  <Text style={styles.crmSubtitle}>Quản lý khách hàng, dự án, hợp đồng</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ====== ALL FEATURES BUTTON ====== */}
        <View style={styles.allFeaturesSection}>
          <TouchableOpacity
            style={styles.allFeaturesBtn}
            onPress={() => navigateTo('/(tabs)/menu')}
          >
            <Ionicons name="apps-outline" size={20} color={COLORS.primary} />
            <Text style={styles.allFeaturesText}>Xem tất cả 272+ chức năng</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ====== DEV TOOLS (Only in __DEV__) ====== */}
        {__DEV__ && (
          <View style={styles.devToolsSection}>
            <TouchableOpacity
              style={styles.devButton}
              onPress={() => navigateTo('/test-login-all-roles')}
              activeOpacity={0.7}
            >
              <Ionicons name="bug-outline" size={20} color={COLORS.primary} />
              <Text style={styles.devButtonText}>🧪 Test Login All Roles</Text>
              <View style={styles.devBadge}>
                <Text style={styles.devBadgeText}>DEV</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ====== FOOTER INFO ====== */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Construction Management Platform</Text>
          <Text style={styles.footerVersion}>Version 4.0 - Build 2026.01.03</Text>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notiBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 40,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  searchCamera: {
    padding: SPACING.xs,
  },

  scrollView: {
    flex: 1,
  },

  // Data Source Badge
  dataSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    marginTop: SPACING.sm,
  },
  dataSourceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    borderWidth: 1,
  },
  dataSourceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsOverview: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Banner
  bannerContainer: {
    marginTop: SPACING.sm,
  },
  bannerContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  bannerItem: {
    width: width - SPACING.lg * 2,
    height: 100,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },

  // Section
  section: {
    backgroundColor: COLORS.card,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Quick Access
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickAccessItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickAccessBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  quickAccessBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  quickAccessLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Core Modules
  coreModuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  coreModuleIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  coreModuleContent: {
    flex: 1,
  },
  coreModuleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  coreModuleSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  coreModuleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  coreModuleStatsText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Commerce
  flashSaleBanner: {
    marginBottom: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  flashSaleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  flashSaleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  flashSaleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  flashSaleTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  commerceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commerceItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  commerceIconContainer: {
    position: 'relative',
  },
  commerceEmoji: {
    fontSize: 32,
  },
  hotBadge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: COLORS.error,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  hotBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  commerceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Services
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  serviceCard: {
    width: '33.33%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  serviceHotBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.error,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  serviceHotBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#fff',
  },
  serviceLabel: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },

  // AI Features
  aiList: {
    gap: SPACING.sm,
  },
  aiFeatureCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: SPACING.md,
  },
  aiFeatureGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  aiFeatureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  aiFeatureDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },

  // Communication
  commGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  commItem: {
    alignItems: 'center',
  },
  commIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  commBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  commBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  commLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Utility Tools
  utilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  utilityItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  utilityLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Admin
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.accentLight,
    borderRadius: 12,
    padding: SPACING.sm,
  },
  adminItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  adminLabel: {
    fontSize: 11,
    color: COLORS.accent,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },

  // CRM Banner
  crmBanner: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  crmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  crmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  crmText: {},
  crmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  crmSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },

  // All Features
  allFeaturesSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  allFeaturesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  allFeaturesText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ====== DESIGN UTILITIES STYLES ======
  designBanner: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  designBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  designBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  designBannerEmoji: {
    fontSize: 36,
  },
  designBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  designBannerDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  designBannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  designBannerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  designUtilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  designUtilityItem: {
    width: '23%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  designUtilityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    position: 'relative',
  },
  designHotBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 10,
  },
  designHotText: {
    fontSize: 10,
  },
  designUtilityLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  designUtilityDesc: {
    fontSize: 8,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },

  // ====== FINISHING UTILITIES STYLES ======
  finishingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  finishingItem: {
    width: '23%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.xs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  finishingEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  finishingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  finishingDesc: {
    fontSize: 8,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
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

  // Dev Tools
  devToolsSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  devButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
  },
  devBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  devBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
});
