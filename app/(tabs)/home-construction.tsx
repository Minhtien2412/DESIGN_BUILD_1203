/**
 * Construction Marketplace Home Screen
 * Integrated with complete app sitemap (500+ routes)
 * Design: Worker marketplace, services, videos, shopping
 */

import { SafeScrollView } from '@/components/ui/safe-area';
import {
    ALL_ROUTES
} from '@/constants/app-routes';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Service icons from SERVICES_ROUTES
const SERVICES = [
  { id: 1, icon: 'color-palette', title: 'Thiết kế', route: '/services/house-design' },
  { id: 2, icon: 'document-text', title: 'Giấy phép', route: '/services/permit' },
  { id: 3, icon: 'color-fill', title: 'Bảng màu', route: '/services/color-chart' },
  { id: 4, icon: 'folder-open', title: 'Hồ sơ mẫu', route: '/services/sample-docs' },
  { id: 5, icon: 'compass', title: 'Phong thủy', route: '/services/feng-shui' },
  { id: 6, icon: 'ribbon', title: 'Tư vấn', route: '/services/quality-consulting' },
  { id: 7, icon: 'eye', title: 'Giám sát', route: '/services/quality-supervision' },
  { id: 8, icon: 'calculator', title: 'Dự toán', route: '/services/design-calculator' },
  { id: 9, icon: 'book', title: 'Catalog', route: '/services/materials-catalog' },
  { id: 10, icon: 'sparkles', title: 'AI Assistant', route: '/services/ai-assistant' },
  { id: 11, icon: 'business', title: 'Công ty XD', route: '/services/construction-company' },
  { id: 12, icon: 'bed', title: 'Nội thất', route: '/services/interior-design' },
];

// Construction utilities from CONSTRUCTION_ROUTES + UTILITIES_ROUTES
const CONSTRUCTION_UTILITIES = [
  { id: 1, icon: 'construct', title: 'Ép cọc', route: '/utilities/ep-coc', workers: 156 },
  { id: 2, icon: 'hammer', title: 'Đào đất', route: '/utilities/dao-dat', workers: 234 },
  { id: 3, icon: 'cube', title: 'Bê tông', route: '/utilities/be-tong', workers: 189 },
  { id: 4, icon: 'layers', title: 'Vật liệu', route: '/utilities/vat-lieu', workers: 421 },
  { id: 5, icon: 'people', title: 'Nhân công', route: '/utilities/nhan-cong', workers: 678 },
  { id: 6, icon: 'person', title: 'Thợ xây', route: '/utilities/tho-xay', workers: 345 },
];

// Finishing workers from FINISHING_ROUTES
const FINISHING_WORKERS = [
  { id: 1, icon: 'grid', title: 'Lát gạch', route: '/finishing/lat-gach', workers: 234 },
  { id: 2, icon: 'square', title: 'Thạch cao', route: '/finishing/thach-cao', workers: 178 },
  { id: 3, icon: 'color-fill', title: 'Sơn', route: '/finishing/son', workers: 456 },
  { id: 4, icon: 'diamond', title: 'Đá', route: '/finishing/da', workers: 123 },
  { id: 5, icon: 'enter', title: 'Làm cửa', route: '/finishing/lam-cua', workers: 89 },
  { id: 6, icon: 'reorder-four', title: 'Lan can', route: '/finishing/lan-can', workers: 67 },
  { id: 7, icon: 'camera', title: 'Camera', route: '/finishing/camera', workers: 145 },
  { id: 8, icon: 'people-outline', title: 'Thợ TH', route: '/finishing/tho-tong-hop', workers: 289 },
];

// Shopping categories from SHOPPING_ROUTES
const SHOPPING_CATEGORIES = [
  { id: 1, icon: 'water', title: 'Phòng tắm', route: '/shopping', count: 1234 },
  { id: 2, icon: 'restaurant', title: 'Bếp', route: '/shopping', count: 876 },
  { id: 3, icon: 'flash', title: 'Điện', route: '/shopping', count: 2341 },
  { id: 4, icon: 'water-outline', title: 'Nước', route: '/shopping', count: 1567 },
  { id: 5, icon: 'bed-outline', title: 'Nội thất', route: '/shopping', count: 3456 },
  { id: 6, icon: 'flame', title: 'PCCC', route: '/shopping', count: 456 },
];

// Building library from PROJECT_LISTING_ROUTES
const BUILDING_LIBRARY = [
  { id: 1, icon: 'home', title: 'Nhà phố', route: '/projects/library', count: 234 },
  { id: 2, icon: 'business', title: 'Biệt thự', route: '/projects/library', count: 156 },
  { id: 3, icon: 'business-outline', title: 'Biệt thự cổ điển', route: '/projects/library', count: 89 },
  { id: 4, icon: 'briefcase', title: 'Văn phòng', route: '/projects/library', count: 123 },
  { id: 5, icon: 'bed', title: 'Khách sạn', route: '/projects/library', count: 67 },
  { id: 6, icon: 'cube-outline', title: 'Nhà kho', route: '/projects/library', count: 145 },
  { id: 7, icon: 'business-outline', title: 'Chung cư', route: '/projects/library', count: 289 },
];

// Live videos
const LIVE_VIDEOS = [
  { id: 1, title: 'Xây dựng biệt thự Quận 9', views: 1234, isLive: true },
  { id: 2, title: 'Hoàn thiện nội thất Phú Mỹ Hưng', views: 567, isLive: true },
  { id: 3, title: 'Thi công móng nhà phố', views: 890, isLive: false },
];

// Design services with pricing
const DESIGN_SERVICES = [
  { id: 1, title: 'Kiến trúc sư', icon: 'color-palette', price: '500k-2tr/m²', count: 45, route: '/projects/design-portfolio' },
  { id: 2, title: 'Kỹ sư', icon: 'construct', price: '300k-1tr/m²', count: 67, route: '/projects/architecture-portfolio' },
  { id: 3, title: 'Kết cấu', icon: 'layers', price: '200k-800k/m²', count: 34, route: '/projects/construction-portfolio' },
  { id: 4, title: 'Điện', icon: 'flash', price: '150k-500k/m²', count: 56, route: '/services/house-design' },
  { id: 5, title: 'Nước', icon: 'water', price: '150k-500k/m²', count: 48, route: '/services/house-design' },
  { id: 6, title: 'Nội thất', icon: 'bed', price: '400k-1.5tr/m²', count: 89, route: '/services/interior-design' },
];

export default function HomeConstructionScreen() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(); // Real-time notifications from server
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedPrice, setSelectedPrice] = useState('Giá');

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const navigateToRoute = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0A6847"
            colors={['#0A6847']}
          />
        }
      >
        {/* Header with Search */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#808080" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm dịch vụ, công nhân..."
                placeholderTextColor="#808080"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigateToRoute('/(tabs)/notifications')}
            >
              <Ionicons name="notifications" size={24} color="#1A1A1A" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map(service => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => navigateToRoute(service.route)}
              >
                <View style={styles.serviceIcon}>
                  <Ionicons name={service.icon as any} size={24} color="#0A6847" />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Construction Utilities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tiện ích xây thô</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.filterText}>{selectedLocation}</Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="cash" size={14} color="#666" />
                <Text style={styles.filterText}>{selectedPrice}</Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.utilitiesGrid}>
            {CONSTRUCTION_UTILITIES.map(util => (
              <TouchableOpacity
                key={util.id}
                style={styles.utilityCard}
                onPress={() => navigateToRoute(util.route)}
              >
                <Ionicons name={util.icon as any} size={24} color="#0A6847" />
                <Text style={styles.utilityTitle}>{util.title}</Text>
                <Text style={styles.utilityWorkers}>{util.workers} thợ</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live Construction Videos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Video thi công</Text>
            <TouchableOpacity onPress={() => navigateToRoute('/videos')}>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {LIVE_VIDEOS.map(video => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => navigateToRoute('/live')}
              >
                <View style={styles.videoThumbnail}>
                  <View style={styles.videoOverlay}>
                    {video.isLive && (
                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                    <View style={styles.videoPlay}>
                      <Ionicons name="play" size={28} color="#0A6847" />
                    </View>
                  </View>
                </View>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text style={styles.videoViews}>{video.views} lượt xem</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Finishing Workers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tiện ích hoàn thiện</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.filterText}>Khu vực</Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.utilitiesGrid}>
            {FINISHING_WORKERS.map(worker => (
              <TouchableOpacity
                key={worker.id}
                style={styles.utilityCard}
                onPress={() => navigateToRoute(worker.route)}
              >
                <Ionicons name={worker.icon as any} size={24} color="#0A6847" />
                <Text style={styles.utilityTitle}>{worker.title}</Text>
                <Text style={styles.utilityWorkers}>{worker.workers} thợ</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Shopping Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mua sắm thiết bị</Text>
            <TouchableOpacity onPress={() => navigateToRoute('/shopping')}>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.shoppingGrid}>
            {SHOPPING_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.shoppingCard}
                onPress={() => navigateToRoute(category.route)}
              >
                <View style={styles.shoppingIcon}>
                  <Ionicons name={category.icon as any} size={24} color="#0A6847" />
                </View>
                <Text style={styles.shoppingTitle}>{category.title}</Text>
                <Text style={styles.shoppingCount}>{category.count} SP</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Building Library */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thư viện công trình</Text>
            <TouchableOpacity onPress={() => navigateToRoute('/projects/library')}>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BUILDING_LIBRARY.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.libraryCard}
                onPress={() => navigateToRoute(item.route)}
              >
                <View style={styles.libraryIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#0A6847" />
                </View>
                <Text style={styles.libraryTitle}>{item.title}</Text>
                <Text style={styles.libraryCount}>{item.count} mẫu</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Design Services with Pricing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dịch vụ thiết kế</Text>
            <TouchableOpacity onPress={() => navigateToRoute('/services')}>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {DESIGN_SERVICES.map(service => (
            <TouchableOpacity
              key={service.id}
              style={styles.designCard}
              onPress={() => navigateToRoute(service.route)}
            >
              <View style={styles.designIcon}>
                <Ionicons name={service.icon as any} size={24} color="#0A6847" />
              </View>
              <View style={styles.designInfo}>
                <Text style={styles.designTitle}>{service.title}</Text>
                <Text style={styles.designCount}>{service.count} chuyên gia</Text>
              </View>
              <View style={styles.designPrice}>
                <Text style={styles.priceText}>{service.price}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Access to All Routes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tất cả tiện ích ({ALL_ROUTES.length} chức năng)</Text>
          <TouchableOpacity
            style={styles.allRoutesButton}
            onPress={() => navigateToRoute('/(tabs)/menu')}
          >
            <Ionicons name="grid" size={24} color="#0A6847" />
            <Text style={styles.allRoutesText}>Xem tất cả tiện ích</Text>
            <Ionicons name="arrow-forward" size={24} color="#0A6847" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </SafeScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0A6847',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  viewAll: {
    fontSize: 13,
    color: '#0A6847',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  filterText: {
    fontSize: 12,
    color: '#808080',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceItem: {
    width: (SCREEN_WIDTH - 32 - 30) / 4,
    alignItems: 'center',
    gap: 6,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 11,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  utilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  utilityCard: {
    width: (SCREEN_WIDTH - 32 - 20) / 3,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  utilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  utilityWorkers: {
    fontSize: 11,
    color: '#808080',
  },
  videoCard: {
    width: 200,
    marginRight: 10,
  },
  videoThumbnail: {
    width: 200,
    height: 112,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  videoOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A15',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A6847',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoPlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 6,
  },
  videoViews: {
    fontSize: 11,
    color: '#808080',
    marginTop: 4,
  },
  shoppingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shoppingCard: {
    width: (SCREEN_WIDTH - 32 - 20) / 3,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  shoppingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoppingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  shoppingCount: {
    fontSize: 11,
    color: '#808080',
  },
  libraryCard: {
    width: 100,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 10,
    alignItems: 'center',
    gap: 6,
    marginRight: 10,
  },
  libraryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  libraryCount: {
    fontSize: 11,
    color: '#808080',
  },
  designCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  designIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  designInfo: {
    flex: 1,
    gap: 4,
  },
  designTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  designCount: {
    fontSize: 12,
    color: '#808080',
  },
  designPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A6847',
  },
  allRoutesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0A6847',
    padding: 14,
    gap: 10,
  },
  allRoutesText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0A6847',
  },
});
