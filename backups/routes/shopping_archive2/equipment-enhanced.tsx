/**
 * Enhanced Equipment Rental Screen
 * Modern rental marketplace with filters, search, booking
 */

import { Category, CategoryFilter } from '@/components/shopping/CategoryFilter';
import { Equipment, EquipmentCard } from '@/components/shopping/EquipmentCard';
import { SortFilter, SortOption } from '@/components/shopping/SortFilter';
import { Colors } from '@/constants/theme';
import { getEquipment } from '@/services/equipment';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data
const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: '1',
    name: 'Máy đào Komatsu PC200',
    category: 'Máy đào',
    pricePerDay: 5000000,
    pricePerWeek: 30000000,
    pricePerMonth: 100000000,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    rating: 4.8,
    available: true,
    condition: 'good',
    specs: ['20 tấn', 'Động cơ Diesel'],
  },
  {
    id: '2',
    name: 'Cần cẩu 50 tấn',
    category: 'Cần cẩu',
    pricePerDay: 8000000,
    pricePerWeek: 50000000,
    image: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=400',
    rating: 4.9,
    available: true,
    condition: 'new',
    specs: ['50 tấn', 'Tầm với 40m'],
  },
  {
    id: '3',
    name: 'Máy trộn bê tông',
    category: 'Máy trộn',
    pricePerDay: 800000,
    pricePerWeek: 5000000,
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400',
    rating: 4.6,
    available: false,
    condition: 'good',
    specs: ['500L', 'Điện 3 pha'],
  },
  {
    id: '4',
    name: 'Xe nâng hàng 3 tấn',
    category: 'Xe nâng',
    pricePerDay: 1500000,
    pricePerWeek: 9000000,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
    rating: 4.7,
    available: true,
    condition: 'good',
    specs: ['3 tấn', 'Nâng 5m'],
  },
  {
    id: '5',
    name: 'Máy khoan đất',
    category: 'Máy khoan',
    pricePerDay: 2000000,
    pricePerWeek: 12000000,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    rating: 4.5,
    available: true,
    condition: 'fair',
    specs: ['Khoan 50cm', 'Độ sâu 10m'],
  },
  {
    id: '6',
    name: 'Máy lu đường',
    category: 'Máy lu',
    pricePerDay: 3500000,
    pricePerWeek: 20000000,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    rating: 4.8,
    available: true,
    condition: 'new',
    specs: ['10 tấn', 'Bánh thép'],
  },
];

const CATEGORIES: Category[] = [
  { id: 'excavator', name: 'Máy đào', icon: 'construct', count: 1 },
  { id: 'crane', name: 'Cần cẩu', icon: 'git-merge', count: 1 },
  { id: 'mixer', name: 'Máy trộn', icon: 'sync', count: 1 },
  { id: 'forklift', name: 'Xe nâng', icon: 'cube', count: 1 },
  { id: 'drill', name: 'Máy khoan', icon: 'hammer', count: 1 },
  { id: 'roller', name: 'Máy lu', icon: 'ellipse', count: 1 },
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'popular', label: 'Phổ biến', icon: 'flame' },
  { id: 'price-asc', label: 'Giá thấp đến cao', icon: 'arrow-up' },
  { id: 'price-desc', label: 'Giá cao đến thấp', icon: 'arrow-down' },
  { id: 'rating', label: 'Đánh giá cao nhất', icon: 'star' },
  { id: 'available', label: 'Có sẵn', icon: 'checkmark-circle' },
];

export default function EquipmentRentalEnhancedScreen() {
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Load equipment from API
  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const data = await getEquipment({ projectId: '1' });
      if (data && Array.isArray(data) && data.length > 0) {
        // Transform API data to Equipment format
        const transformedEquipment: Equipment[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.title || 'Unknown',
          category: item.category || item.type || 'Thiết bị',
          pricePerDay: item.pricePerDay || item.dailyRate || 0,
          pricePerWeek: item.pricePerWeek || (item.pricePerDay || item.dailyRate || 0) * 6,
          pricePerMonth: item.pricePerMonth || (item.pricePerDay || item.dailyRate || 0) * 25,
          image: item.image || item.imageUrl || 'https://via.placeholder.com/400',
          rating: item.rating || 4.5,
          available: item.available !== false && item.status !== 'unavailable',
          condition: item.condition || 'good',
          specs: item.specs || item.specifications || [],
        }));
        setEquipment(transformedEquipment);
        setDataSource('api');
        console.log('[Equipment] Loaded from API:', transformedEquipment.length, 'items');
      }
    } catch (error) {
      console.log('[Equipment] API error, using mock data:', error);
      setEquipment(MOCK_EQUIPMENT);
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted equipment
  const filteredEquipment = useMemo(() => {
    let result = [...equipment];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          e.specs?.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory) {
      const categoryName = CATEGORIES.find((c) => c.id === selectedCategory)?.name;
      if (categoryName) {
        result = result.filter((e) => e.category === categoryName);
      }
    }

    // Availability filter
    if (showAvailableOnly) {
      result = result.filter((e) => e.available !== false);
    }

    // Sort
    switch (selectedSort) {
      case 'price-asc':
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price-desc':
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'available':
        result.sort((a, b) => {
          if (a.available && !b.available) return -1;
          if (!a.available && b.available) return 1;
          return 0;
        });
        break;
      case 'popular':
      default:
        // Would use rental count in real data
        break;
    }

    return result;
  }, [equipment, searchQuery, selectedCategory, selectedSort, showAvailableOnly]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEquipment();
    setRefreshing(false);
  };

  const handleRent = (item: Equipment) => {
    Alert.alert(
      'Thuê thiết bị',
      `Bạn muốn thuê ${item.name}?\n\nGiá: ${item.pricePerDay.toLocaleString('vi-VN')}đ/ngày`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lịch',
          onPress: () => {
            console.log('Booking:', item.id);
            // Navigate to booking form
          },
        },
      ]
    );
  };

  const handleEquipmentPress = (item: Equipment) => {
    console.log('Equipment detail:', item.id);
    // Navigate to equipment detail
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Thuê thiết bị',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowAvailableOnly(!showAvailableOnly)}
              style={styles.filterButton}
            >
              <Ionicons
                name={showAvailableOnly ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={24}
                color={showAvailableOnly ? Colors.light.primary : Colors.light.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm thiết bị..."
            placeholderTextColor={Colors.light.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.light.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showCount={false}
      />

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredEquipment.length} thiết bị
          {showAvailableOnly && ' có sẵn'}
        </Text>
        {(selectedCategory || showAvailableOnly) && (
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory(null);
              setShowAvailableOnly(false);
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Equipment Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredEquipment}
          renderItem={({ item }) => (
            <EquipmentCard
              equipment={item}
              onPress={() => handleEquipmentPress(item)}
              onRent={() => handleRent(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="construct" size={64} color={Colors.light.textMuted} />
              <Text style={styles.emptyText}>Không tìm thấy thiết bị</Text>
            </View>
          }
        />
      )}

      {/* Sort Modal */}
      <SortFilter
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        options={SORT_OPTIONS}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  gridContent: {
    padding: 16,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textMuted,
    marginTop: 16,
  },
});
