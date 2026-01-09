import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const discoverSections = [
  {
    id: '1',
    title: 'Xu hướng thiết kế 2026',
    subtitle: 'Khám phá phong cách mới',
    image: 'https://via.placeholder.com/400x200/FF6B35/fff?text=Design+Trends',
    route: '/trending',
  },
  {
    id: '2',
    title: 'Flash Sale mỗi ngày',
    subtitle: 'Giảm đến 50%',
    image: 'https://via.placeholder.com/400x200/F44336/fff?text=Flash+Sale',
    route: '/flash-sale',
  },
  {
    id: '3',
    title: 'Thợ được yêu thích',
    subtitle: 'Top đánh giá cao nhất',
    image: 'https://via.placeholder.com/400x200/4CAF50/fff?text=Top+Workers',
    route: '/workers',
  },
];

const quickLinks = [
  { icon: 'home-outline', label: 'Thiết kế nhà', route: '/ai-design' },
  { icon: 'construct-outline', label: 'Dự án', route: '/projects' },
  { icon: 'cart-outline', label: 'Mua sắm', route: '/categories' },
  { icon: 'people-outline', label: 'Tìm thợ', route: '/workers' },
  { icon: 'pricetags-outline', label: 'Khuyến mãi', route: '/promotions' },
  { icon: 'cube-outline', label: 'So sánh', route: '/compare' },
  { icon: 'location-outline', label: 'Gần tôi', route: '/nearby' },
  { icon: 'newspaper-outline', label: 'Tin tức', route: '/news' },
];

const inspirations = [
  { id: '1', title: 'Phòng khách hiện đại', image: 'https://via.placeholder.com/200x200', likes: 1234 },
  { id: '2', title: 'Phòng ngủ minimalist', image: 'https://via.placeholder.com/200x200', likes: 987 },
  { id: '3', title: 'Nhà bếp sang trọng', image: 'https://via.placeholder.com/200x200', likes: 756 },
  { id: '4', title: 'Phòng tắm spa', image: 'https://via.placeholder.com/200x200', likes: 654 },
];

export default function DiscoverScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Khám phá', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Carousel */}
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.bannerContainer}
        >
          {discoverSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={styles.bannerCard}
              onPress={() => router.push(section.route as any)}
            >
              <Image source={{ uri: section.image }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{section.title}</Text>
                <Text style={styles.bannerSubtitle}>{section.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Links */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.quickLinksGrid}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickLinkItem}
                onPress={() => router.push(link.route as any)}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: '#FF6B3515' }]}>
                  <Ionicons name={link.icon as any} size={24} color="#FF6B35" />
                </View>
                <Text style={[styles.quickLinkLabel, { color: textColor }]}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Inspirations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Cảm hứng thiết kế</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inspirationsGrid}>
            {inspirations.map((item) => (
              <TouchableOpacity key={item.id} style={styles.inspirationCard}>
                <Image source={{ uri: item.image }} style={styles.inspirationImage} />
                <View style={styles.inspirationOverlay}>
                  <Text style={styles.inspirationTitle}>{item.title}</Text>
                  <View style={styles.likesRow}>
                    <Ionicons name="heart" size={14} color="#fff" />
                    <Text style={styles.likesText}>{formatNumber(item.likes)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.ctaCard, { backgroundColor: '#FF6B35' }]}>
          <Ionicons name="sparkles" size={32} color="#FFD700" />
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Thiết kế với AI</Text>
            <Text style={styles.ctaDesc}>Tạo thiết kế trong vài giây</Text>
          </View>
          <TouchableOpacity 
            style={styles.ctaBtn}
            onPress={() => router.push('/ai-design' as any)}
          >
            <Text style={styles.ctaBtnText}>Thử ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerContainer: { height: 180 },
  bannerCard: { width: width - 32, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  bannerImage: { width: '100%', height: 180, backgroundColor: '#f0f0f0' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  bannerSubtitle: { color: '#fff', opacity: 0.9, marginTop: 4 },
  section: { margin: 16, marginBottom: 0, padding: 16, borderRadius: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  viewAll: { color: '#FF6B35', fontSize: 14 },
  quickLinksGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickLinkItem: { width: '23%', alignItems: 'center', marginBottom: 16 },
  quickLinkIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickLinkLabel: { fontSize: 12, textAlign: 'center' },
  inspirationsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  inspirationCard: { width: '48%', height: 150, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  inspirationImage: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },
  inspirationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  inspirationTitle: { color: '#fff', fontSize: 13, fontWeight: '500' },
  likesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  likesText: { color: '#fff', fontSize: 12, marginLeft: 4 },
  ctaCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaContent: { flex: 1, marginLeft: 16 },
  ctaTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  ctaDesc: { color: '#fff', opacity: 0.9, marginTop: 2 },
  ctaBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  ctaBtnText: { color: '#FF6B35', fontWeight: '600' },
});
