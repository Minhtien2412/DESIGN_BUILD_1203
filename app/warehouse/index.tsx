import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const warehouseItems = [
  {
    id: '1',
    name: 'Gạch Granite 60x60cm',
    sku: 'GR-6060-001',
    image: 'https://via.placeholder.com/100',
    stock: 1250,
    unit: 'viên',
    location: 'A-01-02',
    status: 'in-stock',
    price: 185000,
  },
  {
    id: '2',
    name: 'Sơn Dulux 5 in 1 5L',
    sku: 'SON-DLX-5L',
    image: 'https://via.placeholder.com/100',
    stock: 45,
    unit: 'thùng',
    location: 'B-02-05',
    status: 'low-stock',
    price: 890000,
  },
  {
    id: '3',
    name: 'Xi măng Holcim 50kg',
    sku: 'XM-HLC-50',
    image: 'https://via.placeholder.com/100',
    stock: 500,
    unit: 'bao',
    location: 'C-01-01',
    status: 'in-stock',
    price: 95000,
  },
  {
    id: '4',
    name: 'Thép phi 12 Hòa Phát',
    sku: 'THEP-HP-12',
    image: 'https://via.placeholder.com/100',
    stock: 0,
    unit: 'cây',
    location: 'D-03-02',
    status: 'out-of-stock',
    price: 180000,
  },
];

const categories = [
  { id: 'all', label: 'Tất cả', count: 1234 },
  { id: 'in-stock', label: 'Còn hàng', count: 980 },
  { id: 'low-stock', label: 'Sắp hết', count: 150 },
  { id: 'out-of-stock', label: 'Hết hàng', count: 104 },
];

const warehouseStats = [
  { label: 'Tổng SKU', value: '1,234', icon: 'cube-outline', color: '#FF6B35' },
  { label: 'Giá trị tồn', value: '2.5 tỷ', icon: 'cash-outline', color: '#4CAF50' },
  { label: 'Nhập hôm nay', value: '+45', icon: 'arrow-down-outline', color: '#2196F3' },
  { label: 'Xuất hôm nay', value: '-23', icon: 'arrow-up-outline', color: '#FF9800' },
];

const statusConfig = {
  'in-stock': { label: 'Còn hàng', color: '#4CAF50', bg: '#E8F5E9' },
  'low-stock': { label: 'Sắp hết', color: '#FF9800', bg: '#FFF3E0' },
  'out-of-stock': { label: 'Hết hàng', color: '#F44336', bg: '#FFEBEE' },
};

export default function WarehouseScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const filteredItems = warehouseItems.filter((item) => {
    if (activeCategory !== 'all' && item.status !== activeCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const renderItem = ({ item }: { item: typeof warehouseItems[0] }) => {
    const status = statusConfig[item.status as keyof typeof statusConfig];
    
    return (
      <TouchableOpacity style={[styles.itemCard, { backgroundColor: cardBg }]}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, { color: textColor }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.skuText}>SKU: {item.sku}</Text>
          <View style={styles.itemDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="cube-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{item.stock} {item.unit}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          </View>
          <View style={styles.itemFooter}>
            <Text style={styles.priceText}>{formatPrice(item.price)}/{item.unit}</Text>
            <View style={styles.actionBtns}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="remove-circle-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Kho hàng', headerShown: true }} />
      
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm sản phẩm, SKU..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity>
          <Ionicons name="barcode-outline" size={22} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        {warehouseStats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: cardBg }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
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
              {cat.label} ({cat.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Actions FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fabBtn, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fabBtn, { backgroundColor: '#FF6B35' }]}>
          <Ionicons name="scan-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  statsContainer: { maxHeight: 100, marginBottom: 8 },
  statCard: {
    padding: 12,
    borderRadius: 12,
    marginLeft: 16,
    width: 100,
    alignItems: 'center',
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  statLabel: { color: '#666', fontSize: 11, marginTop: 2 },
  categoriesContainer: { maxHeight: 50 },
  categoriesContent: { paddingHorizontal: 12 },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  categoryBtnActive: { backgroundColor: '#FF6B35' },
  categoryText: { color: '#666', fontSize: 13 },
  categoryTextActive: { color: '#fff' },
  listContent: { padding: 16 },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#f0f0f0' },
  itemContent: { flex: 1, marginLeft: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '500' },
  skuText: { color: '#999', fontSize: 11, marginTop: 2 },
  itemDetails: { flexDirection: 'row', marginTop: 8, gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { color: '#666', fontSize: 12 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priceText: { color: '#FF6B35', fontWeight: '600' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 4 },
  fabContainer: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', gap: 12 },
  fabBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
