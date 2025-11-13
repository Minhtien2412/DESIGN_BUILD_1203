import { useCart } from '@/context/cart-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  discount?: number;
}

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  category: string;
  address: string;
  distance: string;
}

// Mock data
const MOCK_RESTAURANT: Restaurant = {
  id: '1',
  name: 'Phở Hà Nội',
  image: 'https://picsum.photos/400/200',
  rating: 4.8,
  deliveryTime: '20-30 phút',
  deliveryFee: 15000,
  category: 'Món Việt',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  distance: '2.5 km',
};

const MOCK_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Phở Bò Tái',
    description: 'Phở bò tái nạm gân sách, nước dùng thơm ngon',
    price: 65000,
    image: 'https://picsum.photos/200/200?random=1',
    category: 'Món Chính',
    popular: true,
  },
  {
    id: 'm2',
    name: 'Phở Gà',
    description: 'Phở gà thanh đạm, thịt gà mềm ngọt',
    price: 60000,
    image: 'https://picsum.photos/200/200?random=2',
    category: 'Món Chính',
    popular: true,
  },
  {
    id: 'm3',
    name: 'Bún Chả Hà Nội',
    description: 'Bún chả truyền thống với chả nướng thơm lừng',
    price: 55000,
    image: 'https://picsum.photos/200/200?random=3',
    category: 'Món Chính',
    discount: 10,
  },
  {
    id: 'm4',
    name: 'Nem Rán',
    description: 'Nem rán giòn tan, nhân thịt đầy đặn',
    price: 40000,
    image: 'https://picsum.photos/200/200?random=4',
    category: 'Khai Vị',
  },
  {
    id: 'm5',
    name: 'Gỏi Cuốn',
    description: 'Gỏi cuốn tươi với tôm, thịt và rau thơm',
    price: 35000,
    image: 'https://picsum.photos/200/200?random=5',
    category: 'Khai Vị',
  },
  {
    id: 'm6',
    name: 'Trà Đá',
    description: 'Trà đá mát lạnh',
    price: 10000,
    image: 'https://picsum.photos/200/200?random=6',
    category: 'Đồ Uống',
  },
  {
    id: 'm7',
    name: 'Nước Chanh',
    description: 'Nước chanh tươi mát',
    price: 15000,
    image: 'https://picsum.photos/200/200?random=7',
    category: 'Đồ Uống',
  },
];

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả');
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const scrollY = useRef(new Animated.Value(0)).current;
  const cartButtonScale = useRef(new Animated.Value(1)).current;

  const restaurant = MOCK_RESTAURANT;
  const categories = ['Tất Cả', ...Array.from(new Set(MOCK_MENU.map((item) => item.category)))];

  const filteredMenu =
    selectedCategory === 'Tất Cả'
      ? MOCK_MENU
      : MOCK_MENU.filter((item) => item.category === selectedCategory);

  const totalItems = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cartItems).reduce((sum, [itemId, qty]) => {
    const item = MOCK_MENU.find((m) => m.id === itemId);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const handleAddToCart = (item: MenuItem) => {
    const newQty = (cartItems[item.id] || 0) + 1;
    setCartItems({ ...cartItems, [item.id]: newQty });

    // Animate cart button
    Animated.sequence([
      Animated.timing(cartButtonScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cartButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRemoveFromCart = (itemId: string) => {
    const newQty = (cartItems[itemId] || 0) - 1;
    if (newQty <= 0) {
      const newCart = { ...cartItems };
      delete newCart[itemId];
      setCartItems(newCart);
    } else {
      setCartItems({ ...cartItems, [itemId]: newQty });
    }
  };

  const handleCheckout = () => {
    if (totalItems === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm món ăn vào giỏ hàng');
      return;
    }

    // Add items to global cart context
    Object.entries(cartItems).forEach(([itemId, qty]) => {
      const item = MOCK_MENU.find((m) => m.id === itemId);
      if (item) {
        // Convert MenuItem to Product format for cart
        const product = {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          category: item.category,
          rating: 4.5,
          reviews: 100,
          inStock: true,
        };
        addToCart(product, qty);
      }
    });

    Alert.alert(
      'Đặt hàng thành công!',
      `${totalItems} món - ${totalPrice.toLocaleString('vi-VN')}đ\nĐơn hàng đang được chuẩn bị`,
      [
        {
          text: 'Theo dõi đơn hàng',
          onPress: () => router.push('/food/order-tracking' as any),
        },
        { text: 'OK' },
      ]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const quantity = cartItems[item.id] || 0;
    const finalPrice = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;

    return (
      <View key={item.id} style={styles.menuItem}>
        <Image source={{ uri: item.image }} style={styles.menuImage} />
        <View style={styles.menuInfo}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuName}>{item.name}</Text>
            {item.popular && (
              <View style={styles.popularBadge}>
                <Ionicons name="flame" size={12} color="#fff" />
                <Text style={styles.popularText}>Phổ biến</Text>
              </View>
            )}
          </View>
          <Text style={styles.menuDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.menuFooter}>
            <View>
              {item.discount ? (
                <View>
                  <Text style={styles.oldPrice}>
                    {item.price.toLocaleString('vi-VN')}đ
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.menuPrice}>
                      {finalPrice.toLocaleString('vi-VN')}đ
                    </Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{item.discount}%</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.menuPrice}>
                  {item.price.toLocaleString('vi-VN')}đ
                </Text>
              )}
            </View>
            {quantity > 0 ? (
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleRemoveFromCart(item.id)}
                >
                  <Ionicons name="remove" size={18} color="#00B14F" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleAddToCart(item)}
                >
                  <Ionicons name="add" size={18} color="#00B14F" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToCart(item)}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[styles.header, { backgroundColor: `rgba(255,255,255,${headerOpacity})` }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]}>
          {restaurant.name}
        </Animated.Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Restaurant Hero */}
        <Animated.View
          style={[styles.hero, { transform: [{ translateY: imageTranslate }] }]}
        >
          <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
          <View style={styles.heroGradient} />
        </Animated.View>

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.statText}>{restaurant.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.statText}>{restaurant.distance}</Text>
            </View>
          </View>
          <View style={styles.deliveryInfo}>
            <Ionicons name="bicycle-outline" size={20} color="#00B14F" />
            <Text style={styles.deliveryText}>
              Phí giao hàng: {restaurant.deliveryFee.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Items */}
        <View style={styles.menuSection}>{filteredMenu.map(renderMenuItem)}</View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <Animated.View
          style={[styles.cartButton, { transform: [{ scale: cartButtonScale }] }]}
        >
          <TouchableOpacity style={styles.cartButtonInner} onPress={handleCheckout}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
            <Text style={styles.cartButtonText}>Xem giỏ hàng</Text>
            <Text style={styles.cartButtonPrice}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    height: 250,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#00B14F',
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#00B14F',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  menuSection: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  menuImage: {
    width: 120,
    height: 120,
  },
  menuInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  discountBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  discountText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00B14F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B14F',
    minWidth: 30,
    textAlign: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartButtonInner: {
    backgroundColor: '#00B14F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  cartButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  cartButtonPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
