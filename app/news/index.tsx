import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const newsArticles = [
  {
    id: '1',
    title: 'Xu hướng thiết kế nội thất 2026: Màu sắc và vật liệu bền vững',
    excerpt: 'Năm 2026 đánh dấu sự trở lại của các tông màu đất và vật liệu thân thiện với môi trường...',
    image: 'https://via.placeholder.com/400x200',
    category: 'Thiết kế',
    date: '08/01/2026',
    views: 2345,
    readTime: '5 phút',
  },
  {
    id: '2',
    title: 'Giá vật liệu xây dựng tháng 1/2026: Biến động và dự báo',
    excerpt: 'Thị trường vật liệu xây dựng đầu năm ghi nhận những biến động đáng chú ý...',
    image: 'https://via.placeholder.com/400x200',
    category: 'Thị trường',
    date: '07/01/2026',
    views: 4567,
    readTime: '8 phút',
  },
  {
    id: '3',
    title: 'Hướng dẫn chọn gạch lát sân vườn chống trơn trượt',
    excerpt: 'Lựa chọn gạch lát sân vườn không chỉ cần đẹp mà còn phải đảm bảo an toàn...',
    image: 'https://via.placeholder.com/400x200',
    category: 'Hướng dẫn',
    date: '06/01/2026',
    views: 1234,
    readTime: '4 phút',
  },
  {
    id: '4',
    title: 'Top 10 thương hiệu thiết bị vệ sinh được yêu thích nhất',
    excerpt: 'Khảo sát từ 5000 hộ gia đình cho thấy sự ưa chuộng đặc biệt với các thương hiệu...',
    image: 'https://via.placeholder.com/400x200',
    category: 'Đánh giá',
    date: '05/01/2026',
    views: 6789,
    readTime: '10 phút',
  },
];

const featuredNews = {
  id: 'featured',
  title: 'Công nghệ AI trong thiết kế nội thất: Tương lai đã đến',
  image: 'https://via.placeholder.com/600x300',
  category: 'Công nghệ',
  date: '08/01/2026',
};

const categories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'design', label: 'Thiết kế' },
  { id: 'market', label: 'Thị trường' },
  { id: 'guide', label: 'Hướng dẫn' },
  { id: 'review', label: 'Đánh giá' },
  { id: 'tech', label: 'Công nghệ' },
];

export default function NewsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const formatViews = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const renderArticle = ({ item }: { item: typeof newsArticles[0] }) => (
    <TouchableOpacity style={[styles.articleCard, { backgroundColor: cardBg }]}>
      <Image source={{ uri: item.image }} style={styles.articleImage} />
      <View style={styles.articleContent}>
        <View style={styles.articleMeta}>
          <View style={[styles.categoryTag, { backgroundColor: '#FF6B3520' }]}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
          <Text style={styles.articleDate}>{item.date}</Text>
        </View>
        <Text style={[styles.articleTitle, { color: textColor }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.articleExcerpt} numberOfLines={2}>
          {item.excerpt}
        </Text>
        <View style={styles.articleFooter}>
          <View style={styles.articleStat}>
            <Ionicons name="eye-outline" size={14} color="#666" />
            <Text style={styles.statText}>{formatViews(item.views)}</Text>
          </View>
          <View style={styles.articleStat}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.readTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Tin tức', headerShown: true }} />
      
      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.categoriesContainer, { backgroundColor: cardBg }]}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryBtn,
              activeCategory === cat.id && styles.categoryBtnActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === cat.id && styles.categoryTextActive,
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={newsArticles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Featured Article */}
            <TouchableOpacity style={styles.featuredCard}>
              <Image source={{ uri: featuredNews.image }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <View style={[styles.featuredTag, { backgroundColor: '#FF6B35' }]}>
                  <Text style={styles.featuredTagText}>Nổi bật</Text>
                </View>
                <View style={styles.featuredContent}>
                  <View style={[styles.categoryTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={[styles.categoryTagText, { color: '#fff' }]}>{featuredNews.category}</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
                  <Text style={styles.featuredDate}>{featuredNews.date}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: textColor }]}>Tin mới nhất</Text>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoriesContainer: { maxHeight: 54 },
  categoriesContent: { paddingHorizontal: 12, paddingVertical: 8 },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryBtnActive: { backgroundColor: '#FF6B35' },
  categoryText: { color: '#666', fontSize: 13 },
  categoryTextActive: { color: '#fff' },
  listContent: { padding: 16 },
  featuredCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, height: 200 },
  featuredImage: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },
  featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredTagText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  featuredContent: {},
  featuredTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 8, lineHeight: 24 },
  featuredDate: { color: '#fff', opacity: 0.8, marginTop: 8, fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  articleCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  articleImage: { width: 120, height: 120, backgroundColor: '#f0f0f0' },
  articleContent: { flex: 1, padding: 12 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryTagText: { color: '#FF6B35', fontSize: 10, fontWeight: '500' },
  articleDate: { color: '#999', fontSize: 11, marginLeft: 8 },
  articleTitle: { fontSize: 14, fontWeight: '600', lineHeight: 18, marginBottom: 4 },
  articleExcerpt: { color: '#666', fontSize: 12, lineHeight: 16 },
  articleFooter: { flexDirection: 'row', marginTop: 8, gap: 12 },
  articleStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: '#666', fontSize: 11 },
});
