/**
 * Construction Services Hub Screen
 * Menu dịch vụ thi công - category style
 * @updated 2025-12-25
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  accent: '#0066CC',
  success: '#0066CC',
  warning: '#0066CC',
  border: '#E2E8F0',
};

// Dịch vụ thi công chính
const CONSTRUCTION_SERVICES = [
  {
    id: 'project-info',
    label: 'Thông tin công trình',
    desc: 'Chi tiết dự án, ngân sách',
    icon: 'information-circle-outline',
    route: '/construction/project-info',
    color: '#8B5CF6',
    badge: 'New',
  },
  {
    id: 'progress',
    label: 'Tiến độ thi công',
    desc: 'Theo dõi tiến độ công trình',
    icon: 'analytics-outline',
    route: '/construction/progress',
    color: '#3B82F6',
    badge: 'Hot',
  },
  {
    id: 'tracking',
    label: 'Theo dõi công trình',
    desc: 'Real-time tracking',
    icon: 'location-outline',
    route: '/construction/tracking',
    color: '#0066CC',
  },
  {
    id: 'villa',
    label: 'Tiến độ biệt thự',
    desc: 'Villa progress tracking',
    icon: 'home-outline',
    route: '/construction/villa-progress',
    color: '#666666',
  },
  {
    id: 'board',
    label: 'Board tiến độ',
    desc: 'Kanban style board',
    icon: 'grid-outline',
    route: '/construction/progress-board',
    color: '#0066CC',
  },
  {
    id: 'concrete',
    label: 'Lịch đổ bê tông',
    desc: 'Concrete schedule',
    icon: 'calendar-outline',
    route: '/construction/concrete-schedule-map',
    color: '#000000',
  },
  {
    id: 'map-view',
    label: 'Bản đồ công trình',
    desc: 'Map view',
    icon: 'map-outline',
    route: '/construction/map-view',
    color: '#06B6D4',
  },
  {
    id: 'payment',
    label: 'Thanh toán tiến độ',
    desc: 'Payment progress',
    icon: 'card-outline',
    route: '/construction/payment-progress',
    color: '#666666',
  },
  {
    id: 'booking',
    label: 'Đặt lịch thi công',
    desc: 'Book construction',
    icon: 'calendar-number-outline',
    route: '/construction/booking',
    color: '#666666',
  },
];

// Dịch vụ thuê mướn
const HIRING_SERVICES = [
  { id: 'ep-coc', label: 'Ép cọc', icon: '⚡', route: '/utilities/ep-coc', price: 'Từ 50K/m' },
  { id: 'dao-dat', label: 'Đào đất', icon: '🚜', route: '/utilities/dao-dat', price: 'Từ 80K/m³' },
  { id: 'be-tong', label: 'Bê tông', icon: '🏗️', route: '/utilities/be-tong', price: 'Từ 1.2M/m³' },
  { id: 'vat-lieu', label: 'Vật liệu', icon: '📦', route: '/utilities/vat-lieu', price: 'Liên hệ' },
  { id: 'tho-xay', label: 'Thợ xây', icon: '👷', route: '/utilities/tho-xay', price: 'Từ 400K/ngày' },
  { id: 'dien-nuoc', label: 'Điện nước', icon: '💡', route: '/utilities/tho-dien-nuoc', price: 'Từ 350K/ngày' },
  { id: 'coffa', label: 'Cốp pha', icon: '🔧', route: '/utilities/tho-coffa', price: 'Từ 500K/ngày' },
  { id: 'design', label: 'Thiết kế', icon: '✏️', route: '/utilities/design-team', price: 'Từ 50K/m²' },
];

// Liên kết nhanh
const QUICK_LINKS = [
  { id: 'materials', label: 'Vật liệu', icon: 'cube-outline', route: '/materials/index', color: '#666666' },
  { id: 'equipment', label: 'Thiết bị', icon: 'hardware-chip-outline', route: '/equipment/index', color: '#3B82F6' },
  { id: 'safety', label: 'An toàn', icon: 'shield-checkmark-outline', route: '/safety/index', color: '#000000' },
  { id: 'quality', label: 'QC/QA', icon: 'checkmark-circle-outline', route: '/quality-assurance/index', color: '#0066CC' },
];

export default function ConstructionMenuScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dịch vụ thi công</Text>
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => router.push('/construction-progress' as any)}
        >
          <Ionicons name="construct-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Banner */}
        <TouchableOpacity
          style={styles.heroBanner}
          onPress={() => router.push('/construction/progress' as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#0066CC', '#0066CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTitle}>Tư vấn miễn phí</Text>
                <Text style={styles.heroSubtitle}>Hỗ trợ thiết kế & báo giá 24/7</Text>
                <View style={styles.heroBtn}>
                  <Text style={styles.heroBtnText}>Liên hệ ngay</Text>
                </View>
              </View>
              <Ionicons name="construct" size={64} color="rgba(255,255,255,0.3)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Links */}
        <View style={styles.quickLinksSection}>
          <View style={styles.quickLinksGrid}>
            {QUICK_LINKS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickLinkItem}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.quickLinkLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Construction Services Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quản lý thi công</Text>
            <TouchableOpacity onPress={() => router.push('/construction/progress' as any)}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicesGrid}>
            {CONSTRUCTION_SERVICES.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => router.push(service.route as any)}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.serviceIconBox, { backgroundColor: service.color + '15' }]}
                >
                  <Ionicons name={service.icon as any} size={24} color={service.color} />
                </View>
                {service.badge && (
                  <View style={styles.serviceBadge}>
                    <Text style={styles.serviceBadgeText}>{service.badge}</Text>
                  </View>
                )}
                <Text style={styles.serviceLabel}>{service.label}</Text>
                <Text style={styles.serviceDesc}>{service.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hiring Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thuê dịch vụ</Text>
            <TouchableOpacity onPress={() => router.push('/utilities/index' as any)}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.hiringGrid}>
            {HIRING_SERVICES.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.hiringCard}
                onPress={() => router.push(service.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.hiringIconBox}>
                  <Text style={styles.hiringEmoji}>{service.icon}</Text>
                </View>
                <View style={styles.hiringInfo}>
                  <Text style={styles.hiringLabel}>{service.label}</Text>
                  <Text style={styles.hiringPrice}>{service.price}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Banner */}
        <TouchableOpacity
          style={styles.ctaBanner}
          onPress={() => router.push('/services/house-design' as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#0066CC', '#3399FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaContent}>
              <Ionicons name="home" size={32} color="#fff" />
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Thiết kế nhà</Text>
                <Text style={styles.ctaSubtitle}>Miễn phí tư vấn thiết kế</Text>
              </View>
            </View>
            <View style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>Bắt đầu</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroGradient: {
    padding: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  heroBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  quickLinksSection: {
    marginBottom: 24,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickLinkItem: {
    alignItems: 'center',
    width: (width - 48) / 4,
  },
  quickLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLinkLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  serviceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  serviceDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  hiringGrid: {
    gap: 8,
  },
  hiringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hiringIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hiringEmoji: {
    fontSize: 22,
  },
  hiringInfo: {
    flex: 1,
  },
  hiringLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  hiringPrice: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  ctaBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaText: {},
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  ctaBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
