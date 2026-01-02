import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  cuisine: string;
  deliveryTime: string;
  deliveryFee: number;
  distance: string;
  promo?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Phở Hà Nội',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    rating: 4.8,
    reviews: 1250,
    cuisine: 'Việt Nam',
    deliveryTime: '20-30 phút',
    deliveryFee: 15000,
    distance: '1.2 km',
    promo: 'Giảm 30k'
  },
  {
    id: '2',
    name: 'Burger King',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    rating: 4.6,
    reviews: 890,
    cuisine: 'Fast Food',
    deliveryTime: '15-25 phút',
    deliveryFee: 12000,
    distance: '0.8 km'
  },
  {
    id: '3',
    name: 'Sushi World',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    rating: 4.9,
    reviews: 2100,
    cuisine: 'Nhật Bản',
    deliveryTime: '25-35 phút',
    deliveryFee: 20000,
    distance: '2.5 km',
    promo: 'Freeship'
  },
];

const CATEGORIES = [
  { id: '1', name: 'Tất cả', icon: 'apps' },
  { id: '2', name: 'Cơm', icon: 'restaurant' },
  { id: '3', name: 'Phở', icon: 'fast-food' },
  { id: '4', name: 'Pizza', icon: 'pizza' },
  { id: '5', name: 'Đồ uống', icon: 'cafe' },
  { id: '6', name: 'Tráng miệng', icon: 'ice-cream' },
];

export default function FoodDeliveryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [cartCount, setCartCount] = useState(0);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push(`/food/restaurant/${restaurant.id}`);
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => handleRestaurantPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      
      {item.promo && (
        <View style={styles.promoBadge}>
          <Text style={styles.promoText}>{item.promo}</Text>
        </View>
      )}

      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={styles.restaurantMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {item.rating} ({item.reviews}+)
            </Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.cuisine}</Text>
        </View>

        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.deliveryText}>{item.deliveryTime}</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.deliveryItem}>
            <Ionicons name="bicycle-outline" size={14} color="#6B7280" />
            <Text style={styles.deliveryText}>
              {item.deliveryFee === 0 ? 'Freeship' : `${item.deliveryFee / 1000}k`}
            </Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.deliveryText}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.locationButton}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={20} color="#0891B2" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Giao đến</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                123 Nguyễn Huệ, Q1
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>

          {cartCount > 0 && (
            <TouchableOpacity 
              style={styles.cartButton}
              activeOpacity={0.7}
            >
              <Ionicons name="bag-handle" size={24} color="#1F2937" />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm món ăn, nhà hàng..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon as any}
              size={20}
              color={selectedCategory === category.id ? '#fff' : '#6B7280'}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Promo Banner */}
      <Animated.View style={[styles.promoBanner, { opacity: fadeAnim }]}>
        <View style={styles.promoContent}>
          <Ionicons name="gift" size={32} color="#F59E0B" />
          <View style={styles.promoInfo}>
            <Text style={styles.promoTitle}>Ưu đãi hôm nay</Text>
            <Text style={styles.promoSubtitle}>Giảm đến 50% cho đơn đầu tiên</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </Animated.View>

      {/* Restaurants List */}
      <FlatList
        data={RESTAURANTS}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.restaurantList}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            Nhà hàng gần bạn ({RESTAURANTS.length})
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cartButton: {
    position: 'relative',
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryItemActive: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoInfo: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#B45309',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  restaurantList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  promoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  promoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#6B7280',
  },
  metaDot: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
