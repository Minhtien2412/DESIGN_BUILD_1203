import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const favoriteItems = [
  {
    id: '1',
    type: 'product',
    name: 'Gạch lát nền Granite 60x60',
    image: 'https://via.placeholder.com/150',
    price: 185000,
    originalPrice: 220000,
    rating: 4.8,
    soldCount: 1250,
  },
  {
    id: '2',
    type: 'product',
    name: 'Sơn nội thất Dulux cao cấp',
    image: 'https://via.placeholder.com/150',
    price: 890000,
    originalPrice: 990000,
    rating: 4.9,
    soldCount: 856,
  },
  {
    id: '3',
    type: 'worker',
    name: 'Nguyễn Văn An',
    image: 'https://ui-avatars.com/api/?name=An&background=FF6B35&color=fff',
    specialty: 'Thợ điện',
    rating: 4.9,
    experience: '8 năm',
    price: 200000,
  },
  {
    id: '4',
    type: 'product',
    name: 'Bồn cầu TOTO 1 khối',
    image: 'https://via.placeholder.com/150',
    price: 4500000,
    originalPrice: 5200000,
    rating: 4.7,
    soldCount: 324,
  },
  {
    id: '5',
    type: 'design',
    name: 'Thiết kế phòng khách hiện đại',
    image: 'https://via.placeholder.com/150',
    designer: 'Studio ABC',
    style: 'Modern',
    views: 2450,
    likes: 189,
  },
];

const tabs = ['Tất cả', 'Sản phẩm', 'Thợ', 'Thiết kế'];

export default function FavoritesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Tất cả');

  const filteredItems = activeTab === 'Tất cả' 
    ? favoriteItems
    : favoriteItems.filter(item => {
        if (activeTab === 'Sản phẩm') return item.type === 'product';
        if (activeTab === 'Thợ') return item.type === 'worker';
        if (activeTab === 'Thiết kế') return item.type === 'design';
        return true;
      });

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const renderItem = ({ item }: { item: typeof favoriteItems[0] }) => (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor: cardBg }]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <TouchableOpacity style={styles.heartBtn}>
        <Ionicons name="heart" size={20} color="#FF6B35" />
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        {item.type === 'worker' && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>Thợ</Text>
          </View>
        )}
        {item.type === 'design' && (
          <View style={[styles.typeBadge, { backgroundColor: '#9C27B0' }]}>
            <Text style={styles.typeBadgeText}>Thiết kế</Text>
          </View>
        )}
        
        <Text style={[styles.itemName, { color: textColor }]} numberOfLines={2}>
          {item.name}
        </Text>

        {item.type === 'product' && (
          <>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.soldText}>Đã bán {item.soldCount}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(item.price ?? 0)}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
              )}
            </View>
          </>
        )}

        {item.type === 'worker' && (
          <>
            <Text style={styles.subText}>{item.specialty} • {item.experience}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(item.price ?? 0)}/giờ</Text>
          </>
        )}

        {item.type === 'design' && (
          <>
            <Text style={styles.subText}>{item.designer} • {item.style}</Text>
            <View style={styles.statsRow}>
              <Ionicons name="eye-outline" size={14} color="#666" />
              <Text style={styles.statText}>{item.views}</Text>
              <Ionicons name="heart-outline" size={14} color="#666" style={{ marginLeft: 12 }} />
              <Text style={styles.statText}>{item.likes}</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Yêu thích', headerShown: true }} />
      
      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: cardBg }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items Grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có mục yêu thích</Text>
            <TouchableOpacity 
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.exploreBtnText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FF6B35' },
  tabText: { color: '#666', fontSize: 14 },
  tabTextActive: { color: '#FF6B35', fontWeight: '600' },
  listContent: { padding: 8 },
  columnWrapper: { justifyContent: 'space-between' },
  itemCard: {
    width: '48%',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: 150, backgroundColor: '#f0f0f0' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: { padding: 12 },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  typeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '500' },
  itemName: { fontSize: 14, fontWeight: '500', marginBottom: 6, lineHeight: 20 },
  subText: { color: '#666', fontSize: 12, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: '500', color: '#666' },
  soldText: { marginLeft: 8, fontSize: 11, color: '#999' },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { color: '#FF6B35', fontSize: 15, fontWeight: 'bold' },
  originalPrice: { marginLeft: 6, color: '#999', fontSize: 12, textDecorationLine: 'line-through' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statText: { marginLeft: 4, color: '#666', fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#999', marginTop: 12, marginBottom: 16 },
  exploreBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  exploreBtnText: { color: '#fff', fontWeight: '600' },
});
