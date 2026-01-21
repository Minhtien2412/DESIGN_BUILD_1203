/**
 * Home Screen - Simple Green Theme
 * Based on provided design with green accent colors
 * @updated 2026-01-15
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import {
    Dimensions,
    Image,
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
// COLORS & SPACING
// ============================================================================
const COLORS = {
  bg: '#F8F9FA',
  white: '#FFFFFF',
  primary: '#7CB342',  // Green
  text: '#212121',
  textLight: '#757575',
  border: '#E0E0E0',
  liveBadge: '#E53935',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

// ============================================================================
// DATA
// ============================================================================

// Dịch vụ chính (12 items)
const SERVICES = [
  { id: 1, label: 'Thiết kế nhà', icon: 'home-outline', route: '/services/house-design' },
  { id: 2, label: 'Thiết kế nội thất', icon: 'bed-outline', route: '/services/interior-design' },
  { id: 3, label: 'Tra cứu xây dựng', icon: 'document-text-outline', route: '/construction/lookup' },
  { id: 4, label: 'Xin phép', icon: 'checkmark-circle-outline', route: '/services/permit' },
  { id: 5, label: 'Hồ sơ mẫu', icon: 'folder-outline', route: '/documents/samples' },
  { id: 6, label: 'Lô ban', icon: 'grid-outline', route: '/materials' },
  { id: 7, label: 'Bảng màu', icon: 'color-palette-outline', route: '/tools/color-palette' },
  { id: 8, label: 'Tư vấn chất lượng', icon: 'shield-checkmark-outline', route: '/quality-assurance' },
  { id: 9, label: 'Công ty xây dựng', icon: 'business-outline', route: '/contractor/construction' },
  { id: 10, label: 'Công ty nội thất', icon: 'cube-outline', route: '/contractor/interior' },
  { id: 11, label: 'Giám sát chất lượng', icon: 'eye-outline', route: '/services/quality-supervision' },
  { id: 12, label: 'Xem thêm', icon: 'apps-outline', route: '/(tabs)/menu' },
];

// Design Live
const DESIGN_LIVE = [
  { id: 1, image: 'https://picsum.photos/150/150?random=1', badge: true },
  { id: 2, image: 'https://picsum.photos/150/150?random=2', badge: true },
  { id: 3, image: 'https://picsum.photos/150/150?random=3', badge: true },
  { id: 4, image: 'https://picsum.photos/150/150?random=4', badge: true },
];

// Tiện ích thiết kế
const DESIGN_SERVICES = [
  { id: 1, label: 'Kiến trúc sư', price: '300.000đ/m2', location: 'Sài Gòn', count: '100', icon: 'person-outline' },
  { id: 2, label: 'Kỹ sư', price: '200.000đ/m2', location: 'Sài Gòn', count: '100', icon: 'construct-outline' },
  { id: 3, label: 'Kết cấu', price: '150.000đ/m2', location: 'Sài Gòn', count: '100', icon: 'layers-outline' },
  { id: 4, label: 'Điện', price: '200.000đ/m2', location: 'Sài Gòn', count: '100', icon: 'flash-outline' },
  { id: 5, label: 'Nước', price: '250.000đ/m2', location: 'Sài Gòn', count: '100', icon: 'water-outline' },
  { id: 6, label: 'Dự toán', price: '150.000đ/m2', location: 'Sài Gòn', count: '100', icon: 'calculator-outline' },
  { id: 7, label: 'Nội thất', price: '70.000đ/m2', location: 'Sài Gòn', count: '100', icon: 'bed-outline' },
  { id: 8, label: 'Công Cụ AI', price: '70.000đ/m2', location: 'Sài Gòn', count: '100', icon: 'bulb-outline' },
];

// Tiện ích mua sắm trang thiết bị
const EQUIPMENT_ITEMS = [
  { id: 1, label: 'Thiết bị bếp', icon: 'restaurant-outline' },
  { id: 2, label: 'Thiết bị vệ sinh', icon: 'water-outline' },
  { id: 3, label: 'Điện', icon: 'flash-outline' },
  { id: 4, label: 'Nước', icon: 'water-outline' },
  { id: 5, label: 'PCCC', icon: 'flame-outline' },
  { id: 6, label: 'Bàn ăn', icon: 'grid-outline' },
  { id: 7, label: 'Bàn học', icon: 'book-outline' },
  { id: 8, label: 'Sofa', icon: 'bed-outline' },
];

// Thư viện
const LIBRARY_ITEMS = [
  { id: 1, label: 'Văn phòng', icon: 'business-outline' },
  { id: 2, label: 'Nhà phố', icon: 'home-outline' },
  { id: 3, label: 'Biệt thự', icon: 'star-outline' },
  { id: 4, label: 'Biệt thự cổ điển', icon: 'sparkles-outline' },
  { id: 5, label: 'Khách sạn', icon: 'bed-outline' },
  { id: 6, label: 'Nhà xưởng', icon: 'cube-outline' },
  { id: 7, label: 'Căn hộ dịch vụ', icon: 'key-outline' },
];

// Tiện ích xây dựng
const CONSTRUCTION_WORKERS = [
  { id: 1, label: 'Ép cọc', price: 'Hà Nội - 100', icon: 'hammer-outline' },
  { id: 2, label: 'Đào đất', price: 'Sài Gòn - 50', icon: 'construct-outline' },
  { id: 3, label: 'Vật liệu', price: 'Sài Gòn - 50', icon: 'cube-outline' },
  { id: 4, label: 'Nhân công xây dựng', price: 'Sài Gòn - 50', icon: 'people-outline' },
  { id: 5, label: 'Thợ xây', price: 'Hà Nội - 78', icon: 'hammer-outline' },
  { id: 6, label: 'Thợ sắt', price: 'Sài Gòn - 97', icon: 'build-outline' },
  { id: 7, label: 'Thợ coffa', price: 'Sài Gòn - 97', icon: 'construct-outline' },
  { id: 8, label: 'Thợ cơ khí', price: 'Sài Gòn - 97', icon: 'settings-outline' },
  { id: 9, label: 'Thợ tô tường', price: 'Hà Nội - 100', icon: 'color-palette-outline' },
  { id: 10, label: 'Thợ điện nước', price: 'Sài Gòn - 50', icon: 'flash-outline' },
  { id: 11, label: 'Bê tông', price: 'Sài Gòn - 50', icon: 'cube-outline' },
];

// Video Constructions
const VIDEO_ITEMS = [
  { id: 1, label: 'Thợ ép cọc', image: 'https://picsum.photos/100/100?random=5', live: true },
  { id: 2, label: 'Nhân công xây dựng', image: 'https://picsum.photos/100/100?random=6', live: true },
  { id: 3, label: 'Thợ đắp chỉ', image: 'https://picsum.photos/100/100?random=7', live: true },
  { id: 4, label: 'Thợ tô tường', image: 'https://picsum.photos/100/100?random=8', live: true },
];

// Tiện ích hoàn thiện
const FINISHING_WORKERS = [
  { id: 1, label: 'Thợ lát gạch', price: 'Hà Nội - 100', icon: 'square-outline' },
  { id: 2, label: 'Thợ thạch cao', price: 'Sài Gòn - 100', icon: 'layers-outline' },
  { id: 3, label: 'Thợ sơn', price: 'Sài Gòn - 70', icon: 'color-palette-outline' },
  { id: 4, label: 'Thợ đá', price: 'Sài Gòn - 70', icon: 'hammer-outline' },
  { id: 5, label: 'Thợ làm cửa', price: 'Hà Nội - 100', icon: 'exit-outline' },
  { id: 6, label: 'Thợ lan can', price: 'Sài Gòn - 70', icon: 'grid-outline' },
  { id: 7, label: 'Thợ cổng', price: 'Đà Nẵng - 35', icon: 'keypad-outline' },
  { id: 8, label: 'Thợ camera', price: 'Sài Gòn - 70', icon: 'camera-outline' },
];

// Categories (có ảnh)
const CATEGORY_ITEMS = [
  { id: 1, label: 'Lát gạch', image: 'https://picsum.photos/80/80?random=11' },
  { id: 2, label: 'Nội quy công trình', image: 'https://picsum.photos/80/80?random=12' },
  { id: 3, label: 'Bảo quản thiết bị', image: 'https://picsum.photos/80/80?random=13' },
  { id: 4, label: 'Ốp đá', image: 'https://picsum.photos/80/80?random=14' },
];

// ============================================================================
// COMPONENTS
// ============================================================================

// Header
const Header = memo(() => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => router.push('/(tabs)/menu' as Href)}>
      <Ionicons name="menu-outline" size={28} color={COLORS.text} />
    </TouchableOpacity>
    <Text style={styles.logoText}>DỊCH VỤ</Text>
    <View style={{ width: 28 }} />
  </View>
));

// Search Bar
const SearchBar = memo(() => (
  <TouchableOpacity 
    style={styles.searchBar}
    onPress={() => router.push('/search' as Href)}
    activeOpacity={0.7}
  >
    <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
    <Text style={styles.searchPlaceholder}>Tìm Kiếm</Text>
  </TouchableOpacity>
));

// Service Grid Item
const ServiceItem = memo<{ item: typeof SERVICES[0] }>(({ item }) => (
  <TouchableOpacity 
    style={styles.serviceItem}
    onPress={() => router.push(item.route as Href)}
    activeOpacity={0.7}
  >
    <View style={styles.serviceIconContainer}>
      <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
    </View>
    <Text style={styles.serviceLabel} numberOfLines={2}>{item.label}</Text>
  </TouchableOpacity>
));

// Design Live Item with badge
const DesignLiveItem = memo<{ item: typeof DESIGN_LIVE[0] }>(({ item }) => (
  <View style={styles.designLiveItem}>
    <Image source={{ uri: item.image }} style={styles.designLiveImage} />
    {item.badge && (
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveBadgeText}>Live</Text>
      </View>
    )}
  </View>
));

// Green Banner
const GreenBanner = memo(() => (
  <View style={styles.greenBanner}>
    <LinearGradient
      colors={['#66BB6A', '#43A047']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.greenBannerGradient}
    >
      <View style={styles.greenBannerContent}>
        <View>
          <Text style={styles.greenBannerTitle}>TIỆN ÍCH</Text>
          <Text style={styles.greenBannerSubtitle}>XÂY DỰNG</Text>
          <Text style={styles.greenBannerDescription}>
            Hỗ trợ cho công ty xây dựng hoặc nhà thầu
          </Text>
          <Text style={styles.greenBannerNote}>
            Tài khoản khách hàng (Tác vụ lập phiếu công việc / Thẻ thanh toán)
          </Text>
        </View>
        <TouchableOpacity style={styles.greenBannerButton}>
          <Text style={styles.greenBannerButtonText}>KHÁM PHÁ NGAY</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.greenBannerImageContainer}>
        <Ionicons name="construct" size={80} color="rgba(255,255,255,0.3)" />
      </View>
    </LinearGradient>
  </View>
));

// Design Service Card với giá
const DesignServiceCard = memo<{ item: typeof DESIGN_SERVICES[0] }>(({ item }) => (
  <View style={styles.designServiceCard}>
    <Image source={{ uri: `https://picsum.photos/40/40?random=${item.id}` }} style={styles.designServiceImage} />
    <View style={styles.designServiceInfo}>
      <Text style={styles.designServiceLabel}>{item.label}</Text>
      <View style={styles.priceBox}>
        <Text style={styles.priceLabel}>Đơn giá</Text>
        <Text style={styles.priceValue}>{item.price}</Text>
      </View>
      <View style={styles.priceBox}>
        <Text style={styles.locationLabel}>{item.location}</Text>
        <Text style={styles.countValue}>{item.count}</Text>
      </View>
    </View>
  </View>
));

// Equipment Grid Item
const EquipmentItem = memo<{ item: typeof EQUIPMENT_ITEMS[0] }>(({ item }) => (
  <TouchableOpacity style={styles.equipmentItem} activeOpacity={0.7}>
    <Image source={{ uri: `https://picsum.photos/35/35?random=${item.id + 50}` }} style={styles.equipmentIcon} />
    <Text style={styles.equipmentLabel} numberOfLines={2}>{item.label}</Text>
  </TouchableOpacity>
));

// Library Item
const LibraryItem = memo<{ item: typeof LIBRARY_ITEMS[0] }>(({ item }) => (
  <TouchableOpacity style={styles.libraryItem} activeOpacity={0.7}>
    <Image source={{ uri: `https://picsum.photos/35/35?random=${item.id + 100}` }} style={styles.libraryIcon} />
    <Text style={styles.libraryLabel} numberOfLines={2}>{item.label}</Text>
  </TouchableOpacity>
));

// Construction Worker Card
const ConstructionWorkerCard = memo<{ item: typeof CONSTRUCTION_WORKERS[0] }>(({ item }) => (
  <View style={styles.workerCard}>
    <Image source={{ uri: `https://picsum.photos/35/35?random=${item.id + 200}` }} style={styles.workerImage} />
    <View style={styles.workerInfo}>
      <Text style={styles.workerLabel}>{item.label}</Text>
      <View style={styles.workerPriceBox}>
        <Text style={styles.workerPrice}>{item.price}</Text>
      </View>
    </View>
  </View>
));

// Video Item
const VideoItem = memo<{ item: typeof VIDEO_ITEMS[0] }>(({ item }) => (
  <View style={styles.videoItem}>
    <Image source={{ uri: item.image }} style={styles.videoImage} />
    {item.live && (
      <View style={styles.videoLiveBadge}>
        <View style={styles.videoLiveDot} />
        <Text style={styles.videoLiveBadgeText}>Live</Text>
      </View>
    )}
    <View style={styles.videoPlayIcon}>
      <Ionicons name="play" size={20} color={COLORS.white} />
    </View>
    <Text style={styles.videoLabel} numberOfLines={2}>{item.label}</Text>
  </View>
));

// Finishing Worker Card
const FinishingWorkerCard = memo<{ item: typeof FINISHING_WORKERS[0] }>(({ item }) => (
  <View style={styles.finishingCard}>
    <Image source={{ uri: `https://picsum.photos/35/35?random=${item.id + 300}` }} style={styles.finishingImage} />
    <View style={styles.finishingInfo}>
      <Text style={styles.finishingLabel}>{item.label}</Text>
      <View style={styles.finishingPriceBox}>
        <Text style={styles.finishingPrice}>{item.price}</Text>
      </View>
    </View>
  </View>
));

// Category Card
const CategoryCard = memo<{ item: typeof CATEGORY_ITEMS[0] }>(({ item }) => (
  <TouchableOpacity style={styles.categoryCard} activeOpacity={0.7}>
    <Image source={{ uri: item.image }} style={styles.categoryImage} />
    <Text style={styles.categoryLabel}>{item.label}</Text>
  </TouchableOpacity>
));

// Section Header
const SectionHeader = memo<{ title: string; onSeeMore?: () => void }>(({ title, onSeeMore }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeMore && (
      <TouchableOpacity onPress={onSeeMore}>
        <Text style={styles.seeMoreText}>XEM THÊM</Text>
      </TouchableOpacity>
    )}
  </View>
));

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <Header />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Search Bar */}
        <View style={styles.section}>
          <SearchBar />
        </View>

        {/* DỊCH VỤ */}
        <View style={styles.section}>
          <SectionHeader title="DỊCH VỤ" />
          <View style={styles.servicesGrid}>
            {SERVICES.map((item) => (
              <ServiceItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* DESIGN LIVE */}
        <View style={styles.section}>
          <SectionHeader title="DESIGN LIVE" onSeeMore={() => router.push('/design-live' as Href)} />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.designLiveContainer}
          >
            {DESIGN_LIVE.map((item) => (
              <DesignLiveItem key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* Green Banner */}
        <View style={styles.section}>
          <GreenBanner />
        </View>

        {/* TIỆN ÍCH THIẾT KẾ */}
        <View style={styles.section}>
          <SectionHeader title="TIỆN ÍCH THIẾT KẾ" />
          <View style={styles.designServicesContainer}>
            {DESIGN_SERVICES.map((item) => (
              <DesignServiceCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ */}
        <View style={styles.section}>
          <SectionHeader title="TIỆN ÍCH MUA SẮM TRANG THIẾT BỊ" />
          <View style={styles.equipmentGrid}>
            {EQUIPMENT_ITEMS.map((item) => (
              <EquipmentItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* THƯ VIỆN */}
        <View style={styles.section}>
          <SectionHeader title="THƯ VIỆN" />
          <View style={styles.libraryGrid}>
            {LIBRARY_ITEMS.map((item) => (
              <LibraryItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* TIỆN ÍCH XÂY DỰNG */}
        <View style={styles.section}>
          <SectionHeader title="TIỆN ÍCH XÂY DỰNG" />
          <View style={styles.workersContainer}>
            {CONSTRUCTION_WORKERS.map((item) => (
              <ConstructionWorkerCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* VIDEO CONSTRUCTIONS */}
        <View style={styles.section}>
          <SectionHeader title="VIDEO CONTRUSTIONS" />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoContainer}
          >
            {VIDEO_ITEMS.map((item) => (
              <VideoItem key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* TIỆN ÍCH HOÀN THIỆN */}
        <View style={styles.section}>
          <SectionHeader title="TIỆN ÍCH HOÀN THIỆN" />
          <View style={styles.finishingContainer}>
            {FINISHING_WORKERS.map((item) => (
              <FinishingWorkerCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* VIDEO CONSTRUCTIONS (2nd section) */}
        <View style={styles.section}>
          <SectionHeader title="VIDEO CONTRUSTIONS" />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoContainer}
          >
            {VIDEO_ITEMS.map((item) => (
              <VideoItem key={`video2-${item.id}`} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.categoriesGrid}>
            {CATEGORY_ITEMS.map((item) => (
              <CategoryCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 80 }} />
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
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1,
  },
  
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.text,
  },
  
  // Section
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeMoreText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  
  // Services Grid
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  serviceItem: {
    width: width / 4 - SPACING.lg - SPACING.xs * 2,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 0.4,
    borderColor: COLORS.border,
  },
  serviceLabel: {
    fontSize: 10,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 12,
  },
  
  // Design Live
  designLiveContainer: {
    paddingRight: SPACING.lg,
  },
  designLiveItem: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  designLiveImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  liveBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.liveBadge,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  liveBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  // Green Banner
  greenBanner: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
  greenBannerGradient: {
    flex: 1,
    flexDirection: 'row',
    padding: SPACING.lg,
  },
  greenBannerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  greenBannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  greenBannerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 2,
  },
  greenBannerDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  greenBannerNote: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  greenBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: SPACING.xs,
  },
  greenBannerButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  greenBannerImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Design Services
  designServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  designServiceCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  designServiceImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  designServiceInfo: {
    gap: 4,
  },
  designServiceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 2,
  },
  priceLabel: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
    paddingHorizontal: 4,
  },
  priceValue: {
    fontSize: 9,
    color: COLORS.text,
    paddingHorizontal: 4,
    borderLeftWidth: 0.5,
    borderLeftColor: COLORS.border,
  },
  locationLabel: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
    paddingHorizontal: 4,
  },
  countValue: {
    fontSize: 9,
    color: COLORS.text,
    paddingHorizontal: 4,
    borderLeftWidth: 0.5,
    borderLeftColor: COLORS.border,
  },
  
  // Equipment Grid
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  equipmentItem: {
    width: width / 4 - SPACING.lg - SPACING.xs * 2,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  equipmentIcon: {
    width: 35,
    height: 35,
    borderRadius: 6,
    marginBottom: SPACING.xs,
    borderWidth: 0.4,
    borderColor: COLORS.border,
  },
  equipmentLabel: {
    fontSize: 10,
    color: COLORS.text,
    textAlign: 'center',
  },
  
  // Library Grid
  libraryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  libraryItem: {
    width: width / 4 - SPACING.lg - SPACING.xs * 2,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  libraryIcon: {
    width: 35,
    height: 35,
    borderRadius: 6,
    marginBottom: SPACING.xs,
    borderWidth: 0.4,
    borderColor: COLORS.border,
  },
  libraryLabel: {
    fontSize: 10,
    color: COLORS.text,
    textAlign: 'center',
  },
  
  // Construction Workers
  workersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  workerCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  workerImage: {
    width: 35,
    height: 35,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  workerInfo: {
    flex: 1,
  },
  workerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  workerPriceBox: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  workerPrice: {
    fontSize: 9,
    color: COLORS.text,
  },
  
  // Videos
  videoContainer: {
    paddingRight: SPACING.lg,
  },
  videoItem: {
    width: 100,
    marginRight: SPACING.md,
  },
  videoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  videoLiveBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.liveBadge,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 2,
    gap: 2,
  },
  videoLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.white,
  },
  videoLiveBadgeText: {
    fontSize: 7,
    fontWeight: '600',
    color: COLORS.white,
  },
  videoPlayIcon: {
    position: 'absolute',
    top: 35,
    left: 35,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  
  // Finishing Workers
  finishingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  finishingCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  finishingImage: {
    width: 35,
    height: 35,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  finishingInfo: {
    flex: 1,
  },
  finishingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  finishingPriceBox: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  finishingPrice: {
    fontSize: 9,
    color: COLORS.text,
  },
  
  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  categoryImage: {
    width: '100%',
    height: 90,
    backgroundColor: COLORS.border,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    padding: SPACING.sm,
  },
});
