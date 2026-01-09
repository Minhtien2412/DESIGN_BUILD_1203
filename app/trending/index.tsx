import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const trendingItems = [
  {
    id: '1',
    type: 'product',
    title: 'Gạch Granite nhập khẩu Ý',
    image: 'https://via.placeholder.com/300x200',
    price: 450000,
    rating: 4.9,
    sales: 2340,
    trend: 'hot',
  },
  {
    id: '2',
    type: 'design',
    title: 'Phong cách Minimalist 2026',
    image: 'https://via.placeholder.com/300x200',
    designer: 'Studio Design',
    likes: 5600,
    trend: 'rising',
  },
  {
    id: '3',
    type: 'worker',
    title: 'Thợ điện Nguyễn Văn An',
    image: 'https://ui-avatars.com/api/?name=An&size=200',
    rating: 4.9,
    reviews: 156,
    bookings: 89,
    trend: 'top',
  },
  {
    id: '4',
    type: 'product',
    title: 'Sơn sinh học không mùi',
    image: 'https://via.placeholder.com/300x200',
    price: 1200000,
    rating: 4.8,
    sales: 1567,
    trend: 'new',
  },
  {
    id: '5',
    type: 'design',
    title: 'Industrial Loft Design',
    image: 'https://via.placeholder.com/300x200',
    designer: 'Arch Studio',
    likes: 3400,
    trend: 'hot',
  },
];

const categories = [
  { id: '1', icon: 'cube-outline', name: 'Vật liệu', count: 1234 },
  { id: '2', icon: 'color-palette-outline', name: 'Thiết kế', count: 567 },
  { id: '3', icon: 'people-outline', name: 'Thợ', count: 890 },
  { id: '4', icon: 'home-outline', name: 'Dự án', count: 234 },
];

const getTrendBadge = (trend: string) => {
  switch (trend) {
    case 'hot':
      return { label: 'HOT', color: '#F44336', bg: '#FFEBEE' };
    case 'rising':
      return { label: 'Đang lên', color: '#FF9800', bg: '#FFF3E0' };
    case 'top':
      return { label: 'Top #1', color: '#4CAF50', bg: '#E8F5E9' };
    case 'new':
      return { label: 'Mới', color: '#2196F3', bg: '#E3F2FD' };
    default:
      return { label: '', color: '#666', bg: '#f0f0f0' };
  }
};

export default function TrendingScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const renderTrendingItem = ({ item }: { item: typeof trendingItems[0] }) => {
    const trendBadge = getTrendBadge(item.trend);
    
    return (
      <TouchableOpacity style={[styles.trendingCard, { backgroundColor: cardBg }]}>
        <Image source={{ uri: item.image }} style={styles.trendingImage} />
        
        <View style={[styles.trendBadge, { backgroundColor: trendBadge.bg }]}>
          <Text style={[styles.trendBadgeText, { color: trendBadge.color }]}>{trendBadge.label}</Text>
        </View>
        
        <View style={styles.trendingContent}>
          <Text style={[styles.trendingTitle, { color: textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          
          {item.type === 'product' && (
            <>
              <View style={styles.statsRow}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.statText}>{item.rating}</Text>
                <Text style={styles.statSeparator}>•</Text>
                <Text style={styles.statText}>Đã bán {formatNumber(item.sales ?? 0)}</Text>
              </View>
              <Text style={styles.priceText}>{formatPrice(item.price ?? 0)}</Text>
            </>
          )}
          
          {item.type === 'design' && (
            <>
              <Text style={styles.subText}>{item.designer}</Text>
              <View style={styles.statsRow}>
                <Ionicons name="heart" size={14} color="#F44336" />
                <Text style={styles.statText}>{formatNumber(item.likes ?? 0)} thích</Text>
              </View>
            </>
          )}
          
          {item.type === 'worker' && (
            <>
              <View style={styles.statsRow}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.statText}>{item.rating}</Text>
                <Text style={styles.statSeparator}>•</Text>
                <Text style={styles.statText}>{item.reviews} đánh giá</Text>
              </View>
              <Text style={styles.bookingsText}>{item.bookings} lượt đặt tuần này</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Xu hướng', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Danh mục hot</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <View style={[styles.categoryIcon, { backgroundColor: '#FF6B3520' }]}>
                  <Ionicons name={cat.icon as any} size={24} color="#FF6B35" />
                </View>
                <Text style={[styles.categoryName, { color: textColor }]}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{cat.count} mục</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>🔥 Đang hot</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={trendingItems}
            renderItem={renderTrendingItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: '#FF6B35' }]}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1.2M+</Text>
            <Text style={styles.statLabel}>Lượt xem</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Sản phẩm</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Thợ</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  viewAll: { color: '#FF6B35', fontSize: 14 },
  categoriesGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryItem: { alignItems: 'center', width: '23%' },
  categoryIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  categoryCount: { fontSize: 11, color: '#999' },
  horizontalList: { paddingRight: 16 },
  trendingCard: { width: 200, borderRadius: 12, marginRight: 12, overflow: 'hidden' },
  trendingImage: { width: '100%', height: 130, backgroundColor: '#f0f0f0' },
  trendBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  trendBadgeText: { fontSize: 10, fontWeight: 'bold' },
  trendingContent: { padding: 12 },
  trendingTitle: { fontSize: 14, fontWeight: '500', marginBottom: 6, height: 40 },
  subText: { color: '#666', fontSize: 12, marginBottom: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statText: { marginLeft: 4, color: '#666', fontSize: 12 },
  statSeparator: { marginHorizontal: 6, color: '#ccc' },
  priceText: { color: '#FF6B35', fontSize: 16, fontWeight: 'bold' },
  bookingsText: { color: '#4CAF50', fontSize: 12, fontWeight: '500' },
  statsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: { alignItems: 'center' },
  statNumber: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#fff', opacity: 0.9, fontSize: 13, marginTop: 4 },
});
