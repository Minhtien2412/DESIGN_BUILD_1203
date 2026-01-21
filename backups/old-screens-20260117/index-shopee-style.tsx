/**
 * Home Screen v4 - Complete Feature Hub
 * Full-featured Home with All Module Access
 * Based on Router Structure Analysis
 * + Unified Badge Integration (Zalo-style)
 * @updated 2026-01-03
 */

import { ProgressSection } from '@/components/home/progress-section';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedBadge } from '@/context/UnifiedBadgeContext';
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
// DESIGN TOKENS - Modern Shopee-inspired Style
// ============================================================================
const COLORS = {
  // Backgrounds
  bg: '#F5F5F5',
  card: '#FFFFFF',
  
  // Primary Brand
  primary: '#0066CC', // Shopee Orange
  primaryDark: '#004499',
  primaryLight: '#E8F4FF',
  
  // Accent Colors
  accent: '#0066CC', // Blue
  accentLight: '#E8F4FF',
  
  // Text
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  textWhite: '#FFFFFF',
  
  // Status Colors
  success: '#0066CC',
  successLight: '#E8F4FF',
  warning: '#0066CC',
  warningLight: '#E8F4FF',
  error: '#000000',
  errorLight: '#F5F5F5',
  info: '#0066CC',
  infoLight: '#E8F4FF',
  
  // UI Elements
  border: '#E8E8E8',
  divider: '#F0F0F0',
  shadow: 'rgba(0, 0, 0, 0.08)',
  
  // Module Colors
  construction: '#0066CC',
  project: '#0080FF',
  shopping: '#999999',
  ai: '#0066CC',
  live: '#666666',
  crm: '#0080FF',
  documents: '#666666',
  safety: '#000000',
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
  { id: 1, title: 'Ưu đãi 50%', subtitle: 'Thiết kế nội thất', color: '#0066CC', route: '/services/interior-design' },
  { id: 2, title: 'Flash Sale', subtitle: 'Vật liệu xây dựng', color: '#666666', route: '/shopping/flash-sale' },
  { id: 3, title: 'AI Assistant', subtitle: 'Dự toán thông minh', color: '#0066CC', route: '/ai/assistant' },
];

// Quick Access - Most Used Features
const QUICK_ACCESS = [
  { id: 1, label: 'Dự án', icon: 'folder-outline', route: '/(tabs)/projects', color: '#0080FF', badge: '3' },
  { id: 2, label: 'Tiến độ', icon: 'analytics-outline', route: '/construction/progress', color: '#0066CC', badge: null },
  { id: 3, label: 'Timeline', icon: 'git-network-outline', route: '/timeline', color: '#999999', badge: null },
  { id: 4, label: 'Chat', icon: 'chatbubbles-outline', route: '/messages', color: '#0080FF', badge: '5' },
  { id: 5, label: 'Báo cáo', icon: 'document-text-outline', route: '/reports', color: '#0066CC', badge: null },
  { id: 6, label: 'Đơn hàng', icon: 'receipt-outline', route: '/profile/orders', color: '#666666', badge: '2' },
  { id: 7, label: 'CRM', icon: 'business-outline', route: '/crm', color: '#666666', badge: null },
  { id: 8, label: 'Xem thêm', icon: 'apps-outline', route: '/(tabs)/menu', color: '#666666', badge: null },
];

// Core Modules - Primary Business Functions
const CORE_MODULES = [
  { 
    id: 1, 
    title: 'Quản lý Dự án', 
    subtitle: 'Timeline, Tasks, Phases',
    icon: 'folder-open-outline',
    color: '#0080FF',
    route: '/projects',
    stats: '12 dự án'
  },
  { 
    id: 2, 
    title: 'Thi công XD', 
    subtitle: 'Progress, Tracking, Map',
    icon: 'construct-outline',
    color: '#0066CC',
    route: '/construction',
    stats: '5 công trình'
  },
  { 
    id: 3, 
    title: 'Hợp đồng', 
    subtitle: 'Contracts, Quotations',
    icon: 'document-attach-outline',
    color: '#0066CC',
    route: '/contracts',
    stats: '8 hợp đồng'
  },
  { 
    id: 4, 
    title: 'QC/QA', 
    subtitle: 'Quality, Inspections',
    icon: 'checkmark-done-outline',
    color: '#0080FF',
    route: '/quality-assurance',
    stats: '24 kiểm tra'
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
  { id: 1, label: 'Thiết kế nhà', icon: 'home-outline', route: '/services/house-design', color: '#0066CC' },
  { id: 2, label: 'Thiết kế nội thất', icon: 'bed-outline', route: '/services/interior-design', color: '#666666' },
  { id: 3, label: 'Nhà thầu XD', icon: 'business-outline', route: '/services/construction-company', color: '#0080FF' },
  { id: 4, label: 'Giám sát CL', icon: 'eye-outline', route: '/services/quality-supervision', color: '#0066CC' },
  { id: 5, label: 'Phong thủy', icon: 'compass-outline', route: '/services/feng-shui', color: '#0066CC' },
  { id: 6, label: 'Giấy phép XD', icon: 'document-outline', route: '/services/permit', color: '#000000' },
];

// AI Features
const AI_FEATURES = [
  { id: 1, label: 'AI Assistant', icon: 'sparkles', route: '/ai/assistant', desc: 'Trợ lý thông minh' },
  { id: 2, label: 'Dự toán CP', icon: 'calculator', route: '/ai/cost-estimator', desc: 'Tính chi phí' },
  { id: 3, label: 'Phân tích ảnh', icon: 'camera', route: '/ai/photo-analysis', desc: 'AI nhận diện' },
  { id: 4, label: 'Báo cáo AI', icon: 'document-text', route: '/ai/generate-report', desc: 'Tự động tạo' },
];

// Communication Features
const COMMUNICATION = [
  { id: 1, label: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages', badge: 5, color: '#0066CC' },
  { id: 2, label: 'Video Call', icon: 'videocam-outline', route: '/call/active', badge: 0, color: '#0080FF' },
  { id: 3, label: 'Live Stream', icon: 'radio-outline', route: '/(tabs)/live', badge: 2, color: '#666666' },
  { id: 4, label: 'Social', icon: 'people-outline', route: '/social', badge: 0, color: '#0066CC' },
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
  { id: 2, label: 'An toàn LĐ', icon: 'shield-checkmark-outline', route: '/safety' },
  { id: 3, label: 'Phương tiện', icon: 'car-outline', route: '/fleet' },
  { id: 4, label: 'Kho bãi', icon: 'cube-outline', route: '/inventory' },
  { id: 5, label: 'Thiết bị', icon: 'hardware-chip-outline', route: '/equipment' },
  { id: 6, label: 'Nhân công', icon: 'body-outline', route: '/labor' },
  { id: 7, label: 'Thời tiết', icon: 'partly-sunny-outline', route: '/weather' },
  { id: 8, label: 'Bản đồ', icon: 'map-outline', route: '/construction/map-view' },
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

// Quick Access Item
const QuickAccessItem = memo<{ item: typeof QUICK_ACCESS[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
    <TouchableOpacity 
      style={styles.quickAccessItem} 
      onPress={() => onPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.quickAccessIcon, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
        {item.badge && (
          <View style={styles.quickAccessBadge}>
            <Text style={styles.quickAccessBadgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.quickAccessLabel}>{item.label}</Text>
    </TouchableOpacity>
  )
);
QuickAccessItem.displayName = 'QuickAccessItem';

// Core Module Card
const CoreModuleCard = memo<{ item: typeof CORE_MODULES[0]; onPress: (route: string) => void }>(
  ({ item, onPress }) => (
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
        <Text style={[styles.coreModuleStatsText, { color: item.color }]}>{item.stats}</Text>
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
        colors={['#0066CC', '#004499']}
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Unified Badge Context - Zalo-style badges
  const { badges } = useUnifiedBadge();

  // Dynamic Quick Access với badges từ context
  const dynamicQuickAccess = useMemo(() => QUICK_ACCESS.map(item => {
    if (item.id === 4) { // Chat
      return { ...item, badge: badges.messages > 0 ? String(badges.messages) : null };
    }
    if (item.id === 1) { // Dự án
      return { ...item, badge: badges.projects > 0 ? String(badges.projects) : null };
    }
    if (item.id === 6) { // Đơn hàng
      return { ...item, badge: badges.orders > 0 ? String(badges.orders) : null };
    }
    return item;
  }), [badges.messages, badges.projects, badges.orders]);

  // Dynamic Communication với badges từ context
  const dynamicCommunication = useMemo(() => [
    { id: 1, label: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages', badge: badges.messages, color: '#0066CC' },
    { id: 2, label: 'Cuộc gọi', icon: 'call-outline', route: '/call/history', badge: badges.missedCalls, color: '#0080FF' },
    { id: 3, label: 'Live Stream', icon: 'radio-outline', route: '/(tabs)/live', badge: badges.live, color: '#666666' },
    { id: 4, label: 'Social', icon: 'people-outline', route: '/social', badge: badges.social, color: '#0066CC' },
  ], [badges.messages, badges.missedCalls, badges.live, badges.social]);

  // Total notification badge
  const totalNotificationBadge = badges.notifications + badges.messages + badges.missedCalls;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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
              {totalNotificationBadge > 0 && (
                <View style={styles.notiBadge}>
                  <Text style={styles.notiBadgeText}>
                    {totalNotificationBadge > 99 ? '99+' : totalNotificationBadge}
                  </Text>
                </View>
              )}
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
              {badges.messages > 0 && (
                <View style={styles.notiBadge}>
                  <Text style={styles.notiBadgeText}>
                    {badges.messages > 99 ? '99+' : badges.messages}
                  </Text>
                </View>
              )}
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

        {/* ====== QUICK ACCESS ====== */}
        <View style={styles.section}>
          <View style={styles.quickAccessGrid}>
            {dynamicQuickAccess.map((item) => (
              <QuickAccessItem key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* ====== PROJECT PROGRESS ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>📊 Tiến độ dự án</Text>
              <Text style={styles.sectionSubtitle}>Theo dõi realtime</Text>
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
          {CORE_MODULES.map((module) => (
            <CoreModuleCard key={module.id} item={module} onPress={navigateTo} />
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
              colors={['#0066CC', '#004499']}
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
            {dynamicCommunication.map((item) => (
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
              colors={['#0080FF', '#0066CC']}
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
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  notiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
