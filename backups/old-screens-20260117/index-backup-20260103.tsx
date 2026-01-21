/**
 * Home Screen v3 - European Minimal Design
 * Clean, Modern, Information-Dense Layout
 * @updated 2025-12-24
 */

import { ProgressSection } from '@/components/home/progress-section';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import {
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ============================================================================
// DESIGN TOKENS - European Minimal Style
// ============================================================================
const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  accent: '#0066CC',
  accentLight: '#E8F4FF',
  success: '#0066CC',
  successLight: '#D1FAE5',
  warning: '#0080FF',
  warningLight: '#FEF3C7',
  border: '#E2E8F0',
  divider: '#F1F5F9',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// ============================================================================
// MAIN SERVICES DATA - Compact & Essential
// ============================================================================
const MAIN_SERVICES = [
  { id: 1, label: 'Thiết kế', icon: 'home-outline', route: '/services/house-design', color: '#0066CC' },
  { id: 2, label: 'Thi công', icon: 'construct-outline', route: '/construction/progress', color: '#0080FF' },
  { id: 3, label: 'Dự án', icon: 'folder-outline', route: '/(tabs)/projects', color: '#0066CC' },
  { id: 4, label: 'Tiến độ', icon: 'analytics-outline', route: '/construction/tracking', color: '#0080FF' },
  { id: 5, label: 'Vật liệu', icon: 'cube-outline', route: '/materials/index', color: '#666666' },
  { id: 6, label: 'Báo giá', icon: 'calculator-outline', route: '/utilities/quote-request', color: '#0066CC' },
];

// ============================================================================
// QUICK TOOLS DATA - Most Used Features
// ============================================================================
const QUICK_TOOLS = [
  { id: 1, label: 'Timeline', icon: 'git-network-outline', route: '/timeline/index' },
  { id: 2, label: 'Ngân sách', icon: 'wallet-outline', route: '/budget/index' },
  { id: 3, label: 'QC/QA', icon: 'checkmark-circle-outline', route: '/quality-assurance/index' },
  { id: 4, label: 'An toàn', icon: 'shield-checkmark-outline', route: '/safety/index' },
  { id: 5, label: 'Tài liệu', icon: 'document-outline', route: '/documents/folders' },
  { id: 6, label: 'Báo cáo', icon: 'newspaper-outline', route: '/reports/index' },
  { id: 7, label: 'Nhân công', icon: 'people-outline', route: '/labor/index' },
  { id: 8, label: 'Sitemap', icon: 'map-outline', route: '/utilities/sitemap' },
];

// ============================================================================
// SERVICES GRID - Dịch vụ thi công
// ============================================================================
const CONSTRUCTION_SERVICES = [
  { id: 1, label: 'Ép cọc', icon: '⚡', route: '/utilities/ep-coc' },
  { id: 2, label: 'Đào đất', icon: '🚜', route: '/utilities/dao-dat' },
  { id: 3, label: 'Bê tông', icon: '🏗️', route: '/utilities/be-tong' },
  { id: 4, label: 'Vật liệu', icon: '📦', route: '/utilities/vat-lieu' },
  { id: 5, label: 'Thợ xây', icon: '👷', route: '/utilities/tho-xay' },
  { id: 6, label: 'Điện nước', icon: '💡', route: '/utilities/tho-dien-nuoc' },
  { id: 7, label: 'Cốp pha', icon: '🔧', route: '/utilities/tho-coffa' },
  { id: 8, label: 'Thiết kế', icon: '✏️', route: '/utilities/design-team' },
];

// ============================================================================
// UTILITY TOOLS - Tiện ích hoàn thiện
// ============================================================================
const UTILITY_TOOLS = [
  { id: 1, label: 'Lát gạch', icon: 'grid-outline', route: '/finishing/lat-gach' },
  { id: 2, label: 'Sơn', icon: 'color-fill-outline', route: '/finishing/son' },
  { id: 3, label: 'Thạch cao', icon: 'square-outline', route: '/finishing/thach-cao' },
  { id: 4, label: 'Cửa', icon: 'enter-outline', route: '/finishing/lam-cua' },
  { id: 5, label: 'Camera', icon: 'videocam-outline', route: '/finishing/camera' },
  { id: 6, label: 'Lan can', icon: 'reorder-four-outline', route: '/finishing/lan-can' },
  { id: 7, label: 'Đá ốp', icon: 'diamond-outline', route: '/finishing/da' },
  { id: 8, label: 'Thợ', icon: 'hammer-outline', route: '/finishing/tho-tong-hop' },
];

// ============================================================================
// VIDEO & SHOPPING CATEGORIES
// ============================================================================
const VIDEO_ITEMS = [
  { id: 1, title: 'Thi công móng nhà', views: '12K', duration: '8:45', route: '/videos/index' },
  { id: 2, title: 'Đổ bê tông sàn', views: '8.5K', duration: '12:30', route: '/videos/index' },
  { id: 3, title: 'Hoàn thiện nội thất', views: '15K', duration: '15:00', route: '/videos/index' },
];

const SHOPPING_CATS = [
  { id: 1, label: 'Vật liệu', icon: '🧱', route: '/shopping/index?cat=construction' },
  { id: 2, label: 'Thiết bị', icon: '⚡', route: '/shopping/index?cat=electrical' },
  { id: 3, label: 'Nội thất', icon: '🛋️', route: '/shopping/index?cat=furniture' },
  { id: 4, label: 'Sơn màu', icon: '🎨', route: '/shopping/index?cat=paint' },
];

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

// Service Card - Main grid
const ServiceCard = memo<{
  item: typeof MAIN_SERVICES[0];
  onPress: (route: string) => void;
}>(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.serviceCard}
    onPress={() => onPress(item.route)}
    activeOpacity={0.7}
  >
    <View style={[styles.serviceIconBox, { backgroundColor: item.color + '15' }]}>
      <Ionicons name={item.icon as any} size={22} color={item.color} />
    </View>
    <Text style={styles.serviceLabel}>{item.label}</Text>
  </TouchableOpacity>
));
ServiceCard.displayName = 'ServiceCard';

// Tool Item - Compact grid
const ToolItem = memo<{
  item: typeof QUICK_TOOLS[0];
  onPress: (route: string) => void;
}>(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.toolItem}
    onPress={() => onPress(item.route)}
    activeOpacity={0.7}
  >
    <Ionicons name={item.icon as any} size={20} color={COLORS.accent} />
    <Text style={styles.toolLabel}>{item.label}</Text>
  </TouchableOpacity>
));
ToolItem.displayName = 'ToolItem';

// Construction Service Card
const ConstructionCard = memo<{
  item: typeof CONSTRUCTION_SERVICES[0];
  onPress: (route: string) => void;
}>(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.constructionCard}
    onPress={() => onPress(item.route)}
    activeOpacity={0.7}
  >
    <View style={styles.constructionIcon}>
      <Text style={styles.constructionEmoji}>{item.icon}</Text>
    </View>
    <Text style={styles.constructionLabel}>{item.label}</Text>
  </TouchableOpacity>
));
ConstructionCard.displayName = 'ConstructionCard';

// Utility Tool Card
const UtilityCard = memo<{
  item: typeof UTILITY_TOOLS[0];
  onPress: (route: string) => void;
}>(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.utilityCard}
    onPress={() => onPress(item.route)}
    activeOpacity={0.7}
  >
    <Ionicons name={item.icon as any} size={22} color={COLORS.text} />
    <Text style={styles.utilityLabel}>{item.label}</Text>
  </TouchableOpacity>
));
UtilityCard.displayName = 'UtilityCard';

// Video Card
const VideoCard = memo<{
  item: typeof VIDEO_ITEMS[0];
  onPress: (route: string) => void;
}>(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.videoCard}
    onPress={() => onPress(item.route)}
    activeOpacity={0.8}
  >
    <View style={styles.videoThumbnail}>
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
        style={styles.videoGradient}
      />
      <View style={styles.playButton}>
        <Ionicons name="play" size={20} color="#fff" />
      </View>
      <Text style={styles.videoDuration}>{item.duration}</Text>
    </View>
    <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
    <Text style={styles.videoViews}>{item.views} lượt xem</Text>
  </TouchableOpacity>
));
VideoCard.displayName = 'VideoCard';

// Shopping Category Card
const ShoppingCard = memo<{
  item: typeof SHOPPING_CATS[0];
  onPress: (route: string) => void;
}>(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.shoppingCard}
    onPress={() => onPress(item.route)}
    activeOpacity={0.7}
  >
    <Text style={styles.shoppingEmoji}>{item.icon}</Text>
    <Text style={styles.shoppingLabel}>{item.label}</Text>
  </TouchableOpacity>
));
ShoppingCard.displayName = 'ShoppingCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const navigateTo = useCallback((route: string) => {
    router.push(route as Href);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Xin chào{user?.name ? `, ${user.name}` : ''}
            </Text>
            <Text style={styles.headerSubtitle}>Hôm nay bạn cần gì?</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigateTo('/(tabs)/notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
              <View style={styles.notiBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigateTo('/cart')}
            >
              <Ionicons name="cart-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigateTo('/search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Tìm dịch vụ, vật liệu, công nhân...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
      >
        {/* AI ASSISTANT CARD */}
        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => navigateTo('/ai')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#0066CC', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiGradient}
          >
            <View style={styles.aiContent}>
              <View style={styles.aiLeft}>
                <View style={styles.aiIconBox}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.aiTitle}>AI Assistant</Text>
                  <Text style={styles.aiSubtitle}>Trợ lý thông minh 24/7</Text>
                </View>
              </View>
              <View style={styles.aiStats}>
                <View style={styles.aiStatItem}>
                  <Text style={styles.aiStatValue}>+15%</Text>
                  <Text style={styles.aiStatLabel}>Tiến độ</Text>
                </View>
                <View style={styles.aiDivider} />
                <View style={styles.aiStatItem}>
                  <Text style={styles.aiStatValue}>7</Text>
                  <Text style={styles.aiStatLabel}>Công việc</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* PROJECT PROGRESS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Tiến độ dự án</Text>
              <Text style={styles.sectionSubtitle}>Theo dõi tiến độ xây dựng</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/construction/progress')}>
              <Text style={styles.seeAll}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
          <ProgressSection />
        </View>

        {/* MAIN SERVICES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dịch vụ chính</Text>
            <TouchableOpacity onPress={() => navigateTo('/services/index')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicesGrid}>
            {MAIN_SERVICES.map((item) => (
              <ServiceCard key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* QUICK TOOLS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Công cụ quản lý</Text>
            <TouchableOpacity onPress={() => navigateTo('/utilities/index')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.toolsGrid}>
            {QUICK_TOOLS.map((item) => (
              <ToolItem key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* CONSTRUCTION SERVICES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Dịch vụ thi công</Text>
              <Text style={styles.sectionSubtitle}>Miễn phí tư vấn</Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('/construction/index')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.constructionGrid}>
            {CONSTRUCTION_SERVICES.map((item) => (
              <ConstructionCard key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* UTILITY TOOLS - Hoàn thiện */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoàn thiện nội thất</Text>
            <TouchableOpacity onPress={() => navigateTo('/finishing/index')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.utilityGrid}>
            {UTILITY_TOOLS.map((item) => (
              <UtilityCard key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* VIDEO SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Video thi công</Text>
            <TouchableOpacity onPress={() => navigateTo('/videos/index')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoList}
          >
            {VIDEO_ITEMS.map((item) => (
              <VideoCard key={item.id} item={item} onPress={navigateTo} />
            ))}
          </ScrollView>
        </View>

        {/* SHOPPING CATEGORIES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mua sắm thiết bị</Text>
            <TouchableOpacity onPress={() => navigateTo('/shopping/index')}>
              <Ionicons name="cart-outline" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          </View>
          <View style={styles.shoppingGrid}>
            {SHOPPING_CATS.map((item) => (
              <ShoppingCard key={item.id} item={item} onPress={navigateTo} />
            ))}
          </View>
        </View>

        {/* MORE FEATURES */}
        <View style={styles.section}>
          <View style={styles.moreGrid}>
            <TouchableOpacity
              style={styles.moreCard}
              onPress={() => navigateTo('/services/interior-design')}
            >
              <Ionicons name="bed-outline" size={24} color={COLORS.accent} />
              <View style={styles.moreCardContent}>
                <Text style={styles.moreCardTitle}>Thiết kế nội thất</Text>
                <Text style={styles.moreCardDesc}>Thiết kế chuyên nghiệp</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreCard}
              onPress={() => navigateTo('/services/feng-shui')}
            >
              <Ionicons name="compass-outline" size={24} color={COLORS.warning} />
              <View style={styles.moreCardContent}>
                <Text style={styles.moreCardTitle}>Phong thủy</Text>
                <Text style={styles.moreCardDesc}>Tư vấn chuyên sâu</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ALL FEATURES BUTTON */}
        <View style={styles.allFeaturesSection}>
          <TouchableOpacity
            style={styles.allFeaturesBtn}
            onPress={() => navigateTo('/utilities/sitemap')}
          >
            <Ionicons name="apps-outline" size={20} color={COLORS.accent} />
            <Text style={styles.allFeaturesText}>Tất cả tiện ích (272 chức năng)</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES - European Minimal Design
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
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
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
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMuted,
  },

  scrollView: {
    flex: 1,
  },

  // AI Card
  aiCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  aiGradient: {
    padding: SPACING.lg,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  aiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  aiSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  aiStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  aiStatItem: {
    alignItems: 'center',
  },
  aiStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  aiStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  aiDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },

  // Services Grid (3 columns)
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
  serviceIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  serviceLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Tools Grid (4 columns)
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  toolItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  toolLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Construction Grid (4 columns)
  constructionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  constructionCard: {
    width: '25%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  constructionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  constructionEmoji: {
    fontSize: 22,
  },
  constructionLabel: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
  },

  // Utility Grid (4 columns)
  utilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  utilityCard: {
    width: '25%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  utilityLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Video List
  videoList: {
    paddingRight: SPACING.lg,
  },
  videoCard: {
    width: 160,
    marginRight: SPACING.md,
  },
  videoThumbnail: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  videoGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    fontSize: 10,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  videoViews: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Shopping Grid
  shoppingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shoppingCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
  },
  shoppingEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  shoppingLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // More Grid
  moreGrid: {
    gap: SPACING.sm,
  },
  moreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.md,
  },
  moreCardContent: {
    flex: 1,
  },
  moreCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  moreCardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  allFeaturesText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});
