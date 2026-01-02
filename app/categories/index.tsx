/**
 * Categories Hub Screen
 * Hiển thị tất cả danh mục chính của ứng dụng
 * @updated 2025-12-25
 */

import { CATEGORIES } from '@/constants/categories';
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
    View,
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
  accent: '#EE4D2D', // Shopee Orange
  border: '#E2E8F0',
};

export default function CategoriesHubScreen() {
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/categories/${categoryId}` as any);
  };

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
        <Text style={styles.headerTitle}>Danh mục</Text>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => router.push('/search' as any)}
        >
          <Ionicons name="search-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Banner */}
        <TouchableOpacity
          style={styles.featuredBanner}
          onPress={() => router.push('/utilities/sitemap' as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#EE4D2D', '#FF6B4D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredGradient}
          >
            <View style={styles.featuredLeft}>
              <View style={styles.featuredIconBox}>
                <Ionicons name="apps" size={28} color="#fff" />
              </View>
              <View>
                <Text style={styles.featuredTitle}>Tất cả tiện ích</Text>
                <Text style={styles.featuredSubtitle}>272+ chức năng</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Danh mục chính</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.categoryIconBox,
                    { backgroundColor: category.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={28}
                    color={category.color}
                  />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={2}>
                  {category.label}
                </Text>
                <Text style={styles.categoryModules}>
                  {category.modules.length} chức năng
                </Text>
                <View style={styles.categoryArrow}>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.textMuted}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          <View style={styles.quickAccessGrid}>
            {QUICK_ACCESS_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickAccessItem}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.quickAccessIcon,
                    { backgroundColor: item.color + '15' },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.quickAccessLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const QUICK_ACCESS_ITEMS = [
  {
    id: 1,
    label: 'Thiết kế',
    icon: 'home-outline',
    route: '/services/house-design',
    color: '#6366F1',
  },
  {
    id: 2,
    label: 'Thi công',
    icon: 'construct-outline',
    route: '/construction/progress',
    color: '#F59E0B',
  },
  {
    id: 3,
    label: 'Vật liệu',
    icon: 'cube-outline',
    route: '/materials/index',
    color: '#EC4899',
  },
  {
    id: 4,
    label: 'Hoàn thiện',
    icon: 'color-fill-outline',
    route: '/finishing/index',
    color: '#10B981',
  },
  {
    id: 5,
    label: 'Báo cáo',
    icon: 'newspaper-outline',
    route: '/reports/index',
    color: '#3B82F6',
  },
  {
    id: 6,
    label: 'AI Assistant',
    icon: 'sparkles',
    route: '/ai',
    color: '#8B5CF6',
  },
];

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
  searchBtn: {
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
  featuredBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
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
  featuredGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  featuredLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featuredIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  categoryIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  categoryModules: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  categoryArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessItem: {
    width: (width - 48 - 12) / 3,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
});
