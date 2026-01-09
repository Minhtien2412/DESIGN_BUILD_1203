/**
 * Construction Utilities Menu
 * Central hub for all construction-related features
 */

import { SafeScrollView } from '@/components/ui/safe-area';
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CONSTRUCTION_ITEMS = [
  {
    id: 'progress-board',
    title: 'Bảng tiến độ thi công',
    subtitle: 'Quản lý công việc theo giai đoạn',
    icon: 'grid-outline',
    color: '#0066CC',
    route: '/construction/progress-board',
  },
  {
    id: 'progress',
    title: 'Tiến độ thanh toán',
    subtitle: 'Theo dõi milestone và hình ảnh',
    icon: 'checkmark-done-outline',
    color: '#0066CC',
    route: '/construction/progress',
  },
  {
    id: 'tracking',
    title: 'Theo dõi công trình',
    subtitle: 'Giám sát tiến trình xây dựng',
    icon: 'eye-outline',
    color: '#0066CC',
    route: '/construction/tracking',
  },
  {
    id: 'map',
    title: 'Bản đồ thi công',
    subtitle: 'Xem sơ đồ và vị trí công trình',
    icon: 'map-outline',
    color: '#0066CC',
    route: '/construction/map',
  },
  {
    id: 'booking',
    title: 'Đặt lịch thi công',
    subtitle: 'Lên lịch và quản lý công việc',
    icon: 'calendar-outline',
    color: '#1A1A1A',
    route: '/construction/booking',
  },
  {
    id: 'designer',
    title: 'Nhà thiết kế',
    subtitle: 'Kết nối với kiến trúc sư',
    icon: 'person-outline',
    color: '#0066CC',
    route: '/construction/designer',
  },
];

export default function ConstructionScreen() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeScrollView style={styles.container} hasTabBar>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Xây dựng</Text>
            <Text style={styles.headerSubtitle}>Quản lý và theo dõi thi công</Text>
          </View>
        </View>

        {/* Menu List */}
        <View style={styles.list}>
          {CONSTRUCTION_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(item.route as Href)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#0066CC" />
          <Text style={styles.infoText}>
            Bảng tiến độ giúp bạn tổ chức công việc theo giai đoạn với giao diện Kanban board và Timeline
          </Text>
        </View>
      </SafeScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
});
