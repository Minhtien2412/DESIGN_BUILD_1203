/**
 * Shopping Index - Main shopping categories
 */
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SHOPPING_CATEGORIES = [
  { id: 'products-catalog', title: 'Danh Mục Sản Phẩm', icon: 'grid-outline', route: '/shopping/products-catalog', featured: true },
  { id: 'construction', title: 'Vật Liệu Xây Dựng', icon: 'cube-outline', route: '/shopping/construction' },
  { id: 'electrical', title: 'Điện', icon: 'flash-outline', route: '/shopping/electrical' },
  { id: 'plumbing', title: 'Nước', icon: 'water-outline', route: '/shopping/plumbing' },
  { id: 'interior', title: 'Nội Thất', icon: 'bed-outline', route: '/shopping/interior' },
  { id: 'sofas', title: 'Sofa', icon: 'color-palette-outline', route: '/shopping/sofas' },
  { id: 'kitchen-equipment', title: 'Thiết Bị Bếp', icon: 'grid-outline', route: '/shopping/kitchen-equipment' },
  { id: 'sanitary-equipment', title: 'Thiết Bị Vệ Sinh', icon: 'snow-outline', route: '/shopping/sanitary-equipment' },
  { id: 'fire-safety', title: 'PCCC', icon: 'easel-outline', route: '/shopping/fire-safety' },
];

export default function ShoppingIndex() {
  return (
    <>
      <Stack.Screen options={{ title: 'Mua Sắm', headerBackTitle: 'Quay lại' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Danh Mục Sản Phẩm</Text>
        
        <View style={styles.grid}>
          {SHOPPING_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                (category as any).featured && styles.featuredCard,
              ]}
              onPress={() => router.push(category.route as any)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                (category as any).featured && styles.featuredIconContainer,
              ]}>
                <Ionicons name={category.icon as any} size={32} color={(category as any).featured ? "#fff" : "#00B14F"} />
              </View>
              <Text style={[
                styles.categoryTitle,
                (category as any).featured && styles.featuredTitle,
              ]}>{category.title}</Text>
              {(category as any).featured && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>12+ Sản phẩm</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.flashSaleButton}
          onPress={() => router.push('/shopping/flash-sale')}
        >
          <Ionicons name="flash" size={20} color="#fff" />
          <Text style={styles.flashSaleText}>Flash Sale</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newCustomerButton}
          onPress={() => router.push('/shopping/new-customer-offer')}
        >
          <Ionicons name="gift" size={20} color="#fff" />
          <Text style={styles.newCustomerText}>Ưu Đãi Khách Hàng Mới</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  featuredCard: {
    width: '100%',
    backgroundColor: '#00B14F',
    borderWidth: 2,
    borderColor: '#00D35A',
  },
  featuredIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 16,
  },
  badge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  flashSaleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 8,
  },
  flashSaleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  newCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  newCustomerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
