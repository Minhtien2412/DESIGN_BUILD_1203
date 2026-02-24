/**
 * Extended Menu Component
 * Full app sitemap with all features organized by category
 */

import { HapticFeedback } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: 'Quản lý Dự án',
    items: [
      { id: 'budget', title: 'Ngân sách', icon: 'calculator', route: '/budget' },
      { id: 'timeline', title: 'Timeline', icon: 'calendar', route: '/timeline' },
      { id: 'daily-report', title: 'Báo cáo ngày', icon: 'document-text', route: '/daily-report' },
      { id: 'meetings', title: 'Biên bản họp', icon: 'people', route: '/meeting-minutes' },
      { id: 'rfi', title: 'RFI', icon: 'help-circle', route: '/rfi' },
      { id: 'submittal', title: 'Submittal', icon: 'checkmark-circle', route: '/submittal' },
      { id: 'change-mgmt', title: 'Quản lý thay đổi', icon: 'git-compare', route: '/change-management' },
      { id: 'resource-plan', title: 'Kế hoạch nguồn lực', icon: 'analytics', route: '/resource-planning' },
    ],
  },
  {
    title: 'Thi công & Chất lượng',
    items: [
      { id: 'construction', title: 'Thi công', icon: 'hammer', route: '/construction/progress' as Href },
      { id: 'qa', title: 'QA/QC', icon: 'shield-checkmark', route: '/quality-assurance' },
      { id: 'inspection', title: 'Kiểm tra', icon: 'eye', route: '/inspection' },
      { id: 'punch-list', title: 'Punch List', icon: 'list', route: '/punch-list' },
      { id: 'safety', title: 'An toàn lao động', icon: 'warning', route: '/safety' },
      { id: 'environmental', title: 'Môi trường', icon: 'leaf', route: '/environmental' },
      { id: 'risk', title: 'Quản lý rủi ro', icon: 'alert-circle', route: '/risk' },
      { id: 'finishing', title: 'Hoàn thiện', icon: 'brush', route: '/finishing/da' as Href },
    ],
  },
  {
    title: 'Vật tư & Thiết bị',
    items: [
      { id: 'materials', title: 'Vật liệu XD', icon: 'cube', route: '/materials' },
      { id: 'equipment', title: 'Thiết bị máy móc', icon: 'hardware-chip', route: '/equipment' },
      { id: 'inventory', title: 'Quản lý kho', icon: 'archive', route: '/inventory' },
      { id: 'procurement', title: 'Mua sắm', icon: 'cart-outline', route: '/procurement' },
      { id: 'fleet', title: 'Xe & Máy', icon: 'car', route: '/fleet' },
      { id: 'labor', title: 'Nhân công', icon: 'person', route: '/labor' },
    ],
  },
  {
    title: 'Tài chính & Hợp đồng',
    items: [
      { id: 'contracts', title: 'Hợp đồng', icon: 'document', route: '/contracts' },
      { id: 'change-order', title: 'Change Order', icon: 'swap-horizontal', route: '/change-order' },
      { id: 'reports', title: 'Báo cáo tổng hợp', icon: 'stats-chart', route: '/reports' },
      { id: 'warranty', title: 'Bảo hành', icon: 'shield', route: '/warranty' },
    ],
  },
  {
    title: 'Hồ sơ & Tài liệu',
    items: [
      { id: 'documents', title: 'Tài liệu dự án', icon: 'folder', route: '/documents' },
      { id: 'doc-control', title: 'Quản lý tài liệu', icon: 'file-tray-full', route: '/document-control' as Href },
      { id: 'as-built', title: 'Bản vẽ As-Built', icon: 'layers', route: '/as-built' },
      { id: 'om-manuals', title: 'Sổ tay O&M', icon: 'book', route: '/om-manuals' },
      { id: 'commissioning', title: 'Nghiệm thu', icon: 'checkmark-done', route: '/commissioning' },
    ],
  },
  {
    title: 'Liên lạc & Hỗ trợ',
    items: [
      { id: 'messages', title: 'Tin nhắn', icon: 'chatbubbles', route: '/messages' },
      { id: 'communications', title: 'Gọi điện', icon: 'call', route: '/communications' },
      { id: 'consulting', title: 'Tư vấn AI', icon: 'bulb', route: '/services/ai-assistant' },
      { id: 'videos', title: 'Video hướng dẫn', icon: 'play-circle', route: '/videos' },
      { id: 'live', title: 'Live Stream', icon: 'videocam', route: '/live' },
    ],
  },
  {
    title: 'Dịch vụ & Tiện ích',
    items: [
      { id: 'services', title: 'Dịch vụ XD', icon: 'construct', route: '/services' },
      { id: 'utilities', title: 'Tiện ích', icon: 'apps', route: '/utilities/ep-coc' },
      { id: 'shopping', title: 'Mua sắm', icon: 'storefront', route: '/shopping' },
      { id: 'food', title: 'Đồ ăn', icon: 'restaurant', route: '/food' },
      { id: 'weather', title: 'Thời tiết', icon: 'partly-sunny', route: '/weather/dashboard' as Href },
    ],
  },
  {
    title: 'Quản trị Hệ thống',
    items: [
      { id: 'admin', title: 'Quản trị viên', icon: 'key', route: '/admin' },
      { id: 'staff', title: 'Quản lý nhân sự', icon: 'people-circle', route: '/admin/staff' },
      { id: 'departments', title: 'Phòng ban', icon: 'business', route: '/admin/departments' },
      { id: 'roles', title: 'Phân quyền', icon: 'lock-closed', route: '/admin/roles' },
      { id: 'products', title: 'Sản phẩm', icon: 'pricetag', route: '/admin/products' },
    ],
  },
];

interface ExtendedMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const ExtendedMenu: React.FC<ExtendedMenuProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      HapticFeedback.menuOpen();
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      HapticFeedback.menuClose();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleItemPress = (route: Href) => {
    HapticFeedback.light();
    onClose();
    setTimeout(() => {
      router.push(route);
    }, 300);
  };

  const handleBackdropPress = () => {
    HapticFeedback.light();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
        </Animated.View>

        {/* Menu Sheet */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Tất cả chức năng</Text>
              <Text style={styles.headerSubtitle}>Chọn tính năng bạn cần sử dụng</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {MENU_CATEGORIES.map((category, categoryIndex) => (
              <View key={categoryIndex} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIndicator} />
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
                
                <View style={styles.itemsGrid}>
                  {category.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => handleItemPress(item.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.itemIconContainer}>
                        <Ionicons name={item.icon} size={24} color="#4B5563" />
                      </View>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* Bottom Padding */}
            <View style={{ height: Platform.OS === 'ios' ? 34 : 16 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  menuContainer: {
    height: SCREEN_HEIGHT * 0.9,
    width: SCREEN_WIDTH,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#0D9488',
    borderRadius: 2,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    width: (SCREEN_WIDTH - 56) / 4,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
  },
});
