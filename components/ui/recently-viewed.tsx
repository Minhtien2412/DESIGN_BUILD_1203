/**
 * Recently Viewed Section
 * Hiển thị sản phẩm/dịch vụ vừa xem (như Shopee)
 */

import { getRecentProducts, RecentProduct } from '@/services/recent-activity';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RecentlyViewedProps {
  maxItems?: number;
  showHeader?: boolean;
}

export function RecentlyViewed({ maxItems = 10, showHeader = true }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    loadRecentProducts();
  }, []);

  const loadRecentProducts = async () => {
    const products = await getRecentProducts(maxItems);
    setRecentProducts(products);
  };

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={styles.title}>Sản phẩm vừa xem</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile/history')}>
            <Text style={styles.viewAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            activeOpacity={0.8}
            onPress={() => {
              // Navigate to product detail
              // router.push(`/product/${product.id}`);
            }}
          >
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  viewAll: {
    fontSize: 13,
    color: '#EE4D2D',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  productCard: {
    width: 120,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    color: '#1a1a1a',
    marginBottom: 4,
    height: 32,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EE4D2D',
  },
});
