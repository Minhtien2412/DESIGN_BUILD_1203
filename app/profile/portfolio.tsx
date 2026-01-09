import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Portfolio categories
const DESIGN_CATEGORIES = [
  {
    id: 'pricing',
    title: 'Bảng tiến độ thiết kế',
    icon: 'document-text-outline' as const,
    route: '/profile/portfolio/design-pricing',
    color: '#0066CC',
  },
  {
    id: 'boq',
    title: 'BOQ/Dự Toán Tóm Tắt',
    icon: 'calculator-outline' as const,
    route: '/profile/portfolio/boq',
    color: '#3B82F6',
  },
  {
    id: 'spec',
    title: 'Bảng Spec Hoàn Thiện',
    icon: 'list-outline' as const,
    route: '/profile/portfolio/spec',
    color: '#666666',
  },
  {
    id: 'quotation',
    title: 'Báo Giá, Hợp Đồng Thiết Kế',
    icon: 'cash-outline' as const,
    route: '/profile/portfolio/quotation',
    color: '#0066CC',
  },
  {
    id: '3d',
    title: '3D thiết kế nội thất',
    icon: 'cube-outline' as const,
    route: '/profile/portfolio/3d-design',
    color: '#666666',
  },
  {
    id: 'drawings',
    title: 'Danh mục bản vẽ',
    icon: 'images-outline' as const,
    route: '/profile/portfolio/drawings',
    color: '#06B6D4',
  },
];

const CONSTRUCTION_CATEGORIES = [
  {
    id: 'payment',
    title: 'Bảng tiến độ & thanh toán',
    icon: 'wallet-outline' as const,
    route: '/profile/portfolio/construction-payment',
    color: '#0066CC',
  },
  {
    id: 'standards',
    title: 'Bảng quy ước phân thỏ',
    icon: 'git-network-outline' as const,
    route: '/profile/portfolio/standards',
    color: '#3B82F6',
  },
  {
    id: 'testing',
    title: 'Bảng test MEP/PCCC',
    icon: 'flask-outline' as const,
    route: '/profile/portfolio/testing',
    color: '#0066CC',
  },
  {
    id: 'defects',
    title: 'Bảng defect hoàn thiện',
    icon: 'warning-outline' as const,
    route: '/profile/portfolio/defects',
    color: '#000000',
  },
  {
    id: 'construction-drawings',
    title: 'Danh mục bản vẽ',
    icon: 'document-attach-outline' as const,
    route: '/profile/portfolio/construction-drawings',
    color: '#06B6D4',
  },
];

export default function PortfolioScreen() {
  const CategoryCard = ({
    title,
    icon,
    color,
    onPress,
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Hồ sơ mẫu thiết kế',
          headerShown: true,
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Design Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={24} color="#111827" />
            <Text style={styles.sectionTitle}>Hồ sơ mẫu thiết kế</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Danh sách các tài liệu</Text>

          {DESIGN_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
              color={category.color}
              onPress={() => router.push(category.route as Href)}
            />
          ))}
        </View>

        {/* Construction Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct-outline" size={24} color="#111827" />
            <Text style={styles.sectionTitle}>Hồ sơ mẫu xây dựng</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Danh sách các tài liệu</Text>

          {CONSTRUCTION_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
              color={category.color}
              onPress={() => router.push(category.route as Href)}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    marginLeft: 36,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
});
