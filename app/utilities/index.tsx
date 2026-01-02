/**
 * Utilities Hub Screen - Công cụ quản lý
 * Hiển thị tất cả công cụ và tiện ích quản lý
 * @updated 2025-12-25
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Platform,
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

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  accent: '#EE4D2D', // Shopee Orange
  border: '#E2E8F0',
};

// Công cụ quản lý chính
const MANAGEMENT_TOOLS = [
  {
    id: 'timeline',
    label: 'Timeline',
    icon: 'git-network-outline',
    route: '/timeline/index',
    color: '#3B82F6',
    desc: 'Quản lý dòng thời gian',
  },
  {
    id: 'budget',
    label: 'Ngân sách',
    icon: 'wallet-outline',
    route: '/budget/index',
    color: '#10B981',
    desc: 'Quản lý chi phí',
  },
  {
    id: 'quality',
    label: 'QC/QA',
    icon: 'checkmark-circle-outline',
    route: '/quality-assurance/index',
    color: '#8B5CF6',
    desc: 'Kiểm soát chất lượng',
  },
  {
    id: 'safety',
    label: 'An toàn',
    icon: 'shield-checkmark-outline',
    route: '/safety/index',
    color: '#EF4444',
    desc: 'An toàn lao động',
  },
  {
    id: 'documents',
    label: 'Tài liệu',
    icon: 'document-outline',
    route: '/documents/folders',
    color: '#F59E0B',
    desc: 'Quản lý văn bản',
  },
  {
    id: 'reports',
    label: 'Báo cáo',
    icon: 'newspaper-outline',
    route: '/reports/index',
    color: '#06B6D4',
    desc: 'Xuất báo cáo',
  },
  {
    id: 'labor',
    label: 'Nhân công',
    icon: 'people-outline',
    route: '/labor/index',
    color: '#EC4899',
    desc: 'Quản lý nhân sự',
  },
  {
    id: 'sitemap',
    label: 'Sitemap',
    icon: 'map-outline',
    route: '/utilities/sitemap',
    color: '#6366F1',
    desc: 'Bản đồ tính năng',
  },
];

// Dịch vụ thi công
const CONSTRUCTION_SERVICES = [
  { id: 'ep-coc', label: 'Ép cọc', icon: '⚡', route: '/utilities/ep-coc', desc: 'Dịch vụ ép cọc' },
  { id: 'dao-dat', label: 'Đào đất', icon: '🚜', route: '/utilities/dao-dat', desc: 'San lấp, đào móng' },
  { id: 'be-tong', label: 'Bê tông', icon: '🏗️', route: '/utilities/be-tong', desc: 'Bê tông tươi' },
  { id: 'vat-lieu', label: 'Vật liệu', icon: '📦', route: '/utilities/vat-lieu', desc: 'Cung cấp vật liệu' },
  { id: 'tho-xay', label: 'Thợ xây', icon: '👷', route: '/utilities/tho-xay', desc: 'Thuê thợ xây' },
  { id: 'dien-nuoc', label: 'Điện nước', icon: '💡', route: '/utilities/tho-dien-nuoc', desc: 'Lắp điện nước' },
  { id: 'coffa', label: 'Cốp pha', icon: '🔧', route: '/utilities/tho-coffa', desc: 'Thi công cốp pha' },
  { id: 'design', label: 'Thiết kế', icon: '✏️', route: '/utilities/design-team', desc: 'Đội thiết kế' },
];

// Tiện ích khác
const OTHER_UTILITIES = [
  { id: 'qr-scanner', label: 'Quét QR', icon: 'qr-code-outline', route: '/utilities/qr-scanner', color: '#3B82F6' },
  { id: 'my-qr', label: 'QR của tôi', icon: 'qr-code', route: '/utilities/my-qr-code', color: '#8B5CF6' },
  { id: 'schedule', label: 'Lịch công việc', icon: 'calendar-outline', route: '/utilities/schedule', color: '#10B981' },
  { id: 'history', label: 'Lịch sử', icon: 'time-outline', route: '/utilities/history', color: '#F59E0B' },
  { id: 'quote', label: 'Báo giá', icon: 'calculator-outline', route: '/utilities/quote-request', color: '#EF4444' },
  { id: 'cost', label: 'Ước lượng', icon: 'trending-up-outline', route: '/utilities/cost-estimator', color: '#06B6D4' },
  { id: 'store', label: 'Cửa hàng', icon: 'storefront-outline', route: '/utilities/store-locator', color: '#EC4899' },
  { id: 'api', label: 'API Test', icon: 'code-slash-outline', route: '/utilities/api-diagnostics', color: '#6366F1' },
];

export default function UtilitiesHubScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = MANAGEMENT_TOOLS.filter(
    (tool) =>
      tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Text style={styles.headerTitle}>Công cụ quản lý</Text>
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => router.push('/utilities/sitemap' as any)}
        >
          <Ionicons name="apps-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm công cụ..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Management Tools Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Công cụ chính</Text>
          <View style={styles.toolsGrid}>
            {(searchQuery ? filteredTools : MANAGEMENT_TOOLS).map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => router.push(tool.route as any)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.toolIconBox, { backgroundColor: tool.color + '15' }]}
                >
                  <Ionicons name={tool.icon as any} size={24} color={tool.color} />
                </View>
                <Text style={styles.toolLabel}>{tool.label}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Construction Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dịch vụ thi công</Text>
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
                activeOpacity={0.7}
              >
                <View style={styles.serviceIconBox}>
                  <Text style={styles.serviceEmoji}>{service.icon}</Text>
                </View>
                <Text style={styles.serviceLabel}>{service.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Utilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện ích khác</Text>
          <View style={styles.utilityGrid}>
            {OTHER_UTILITIES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.utilityItem}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon as any} size={22} color={item.color} />
                <Text style={styles.utilityLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Full Sitemap Button */}
        <TouchableOpacity
          style={styles.sitemapBtn}
          onPress={() => router.push('/utilities/sitemap' as any)}
        >
          <LinearGradient
            colors={['#EE4D2D', '#FF6B4D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sitemapGradient}
          >
            <Ionicons name="apps" size={24} color="#fff" />
            <Text style={styles.sitemapText}>Xem tất cả 272 chức năng</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  toolCard: {
    width: (width - 48 - 12) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toolIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  toolDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceCard: {
    width: (width - 48 - 24) / 4,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceEmoji: {
    fontSize: 20,
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  utilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  utilityItem: {
    width: (width - 48 - 24) / 4,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  utilityLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  sitemapBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#EE4D2D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sitemapGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  sitemapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.2,
  },
});
