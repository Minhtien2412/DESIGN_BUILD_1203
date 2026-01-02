import { ProductModerationModal } from '@/components/products';
import { ProductDashboardCard } from '@/components/products/ProductDashboardCard';
import { ProductStats, ProductStatsCard } from '@/components/products/ProductStatsCard';
import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { Product, PRODUCTS } from '@/data/products';
import { useThemeColor } from '@/hooks/use-theme-color';
import { productService } from '@/services/api/product.service';
import { ProductStatus, type Product as ApiProduct } from '@/services/api/types';
import { usePermissions } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

/**
 * Product Management Dashboard
 * Enhanced product catalog with analytics and management features
 */

export default function ProductManagementScreen() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'bestseller' | 'new' | 'lowStock' | 'pending' | 'approved' | 'rejected'
  >('all');
  
  // API state
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Moderation modal state
  const [moderationModal, setModerationModal] = useState<{
    visible: boolean;
    product: Product | null;
  }>({ visible: false, product: null });

  // Fetch all products (admin view)
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[AdminProducts] 📦 Fetching all products...');
      
      const response = await productService.getProducts();
      setApiProducts(response.data);
      console.log(`[AdminProducts] ✅ Loaded ${response.data.length} products`);
    } catch (err) {
      console.error('[AdminProducts] ❌ Error loading products:', err);
      setError('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const textMuted = useThemeColor({}, 'textMuted');
  const text = useThemeColor({}, 'text');

  // Convert API products to display format
  const convertApiProductToDisplay = (apiProduct: ApiProduct): Product => ({
    id: String(apiProduct.id),
    name: apiProduct.name,
    price: apiProduct.price,
    image: apiProduct.images?.[0] || '',
    category: apiProduct.category.toLowerCase(),
    description: apiProduct.description || '',
    stock: apiProduct.stock,
    sold: apiProduct.soldCount || 0,
    status: apiProduct.status === ProductStatus.APPROVED ? 'APPROVED' : 
            apiProduct.status === ProductStatus.PENDING ? 'PENDING' : 
            apiProduct.status === ProductStatus.REJECTED ? 'REJECTED' : 'ACTIVE',
    createdBy: apiProduct.seller?.id ? String(apiProduct.seller.id) : undefined,
    isBestseller: apiProduct.isBestseller,
    isNew: apiProduct.isNew,
  });

  const displayProducts = apiProducts.map(convertApiProductToDisplay);

  // Calculate stats from API products
  const stats: ProductStats = {
    totalProducts: apiProducts.length,
    activeProducts: apiProducts.filter((p) => p.stock && p.stock > 0).length,
    outOfStock: apiProducts.filter((p) => !p.stock || p.stock === 0).length,
    lowStock: apiProducts.filter((p) => p.stock && p.stock < 10 && p.stock > 0).length,
    totalRevenue: 0, // TODO: Get from analytics API
    topSelling: undefined, // TODO: Get from analytics API
  };

  // Filter products
  const filteredProducts = displayProducts.filter((product) => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    let matchesFilter = true;
    if (selectedFilter === 'bestseller') {
      matchesFilter = product.isBestseller === true;
    } else if (selectedFilter === 'new') {
      matchesFilter = product.isNew === true;
    } else if (selectedFilter === 'lowStock') {
      matchesFilter = !!product.stock && product.stock < 10 && product.stock > 0;
    } else if (selectedFilter === 'pending') {
      matchesFilter = product.status === 'PENDING';
    } else if (selectedFilter === 'approved') {
      matchesFilter = product.status === 'APPROVED' || !product.status; // Default to approved
    } else if (selectedFilter === 'rejected') {
      matchesFilter = product.status === 'REJECTED';
    }

    return matchesSearch && matchesFilter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleEdit = (product: Product) => {
    const canEdit = isAdmin || (user?.id && product.createdBy === String(user.id));
    
    if (!canEdit) {
      Alert.alert(
        'Không có quyền',
        'Bạn không có quyền chỉnh sửa sản phẩm này. Chỉ người đăng sản phẩm hoặc Admin mới có quyền.',
        [{ text: 'Đóng' }]
      );
      return;
    }

    Alert.alert('Chỉnh sửa sản phẩm', `Chỉnh sửa: ${product.name}`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'OK' },
    ]);
  };

  const handleDelete = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const canDelete = isAdmin || (user?.id && product.createdBy === String(user.id));
    
    if (!canDelete) {
      Alert.alert(
        'Không có quyền',
        'Bạn không có quyền xóa sản phẩm này. Chỉ người đăng sản phẩm hoặc Admin mới có quyền.',
        [{ text: 'Đóng' }]
      );
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => console.log('Deleted:', productId) },
      ]
    );
  };

  const handleViewDetails = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleModerate = (product: Product) => {
    setModerationModal({ visible: true, product });
  };

  const handleApprove = (productId: string) => {
    // TODO: Update product status to 'approved' in backend
    // For now, just show success message
    Alert.alert(
      'Đã duyệt',
      'Sản phẩm đã được duyệt và sẽ hiển thị công khai.',
      [{ text: 'OK', onPress: () => setModerationModal({ visible: false, product: null }) }]
    );
    
    // In real implementation:
    // await updateProductStatus(productId, 'approved', user?.id);
    // await onRefresh();
  };

  const handleReject = (productId: string, reason: string) => {
    // TODO: Update product status to 'rejected' in backend
    // For now, just show success message
    Alert.alert(
      'Đã từ chối',
      'Sản phẩm đã bị từ chối. Người đăng sẽ nhận được thông báo.',
      [{ text: 'OK', onPress: () => setModerationModal({ visible: false, product: null }) }]
    );
    
    // In real implementation:
    // await updateProductStatus(productId, 'rejected', user?.id, reason);
    // await onRefresh();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quản lý sản phẩm',
          headerShown: true,
        }}
      />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Container>
          {/* Stats Overview */}
          <Section title="">
            <ProductStatsCard
              stats={stats}
              onViewAll={() => router.push('/shopping/products-catalog')}
              onManageStock={() => Alert.alert('Quản lý kho', 'Tính năng đang phát triển')}
            />
          </Section>

          {/* Search & Filters */}
          <Section title="Tìm kiếm & Bộ lọc">
            {/* Search Bar */}
            <View style={[styles.searchBar, { backgroundColor: surface, borderColor: border }]}>
              <Ionicons name="search" size={20} color={textMuted} />
              <TextInput
                style={[styles.searchInput, { color: text }]}
                placeholder="Tìm kiếm sản phẩm..."
                placeholderTextColor={textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={textMuted} />
                </Pressable>
              )}
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              <Pressable
                style={[
                  styles.filterChip,
                  selectedFilter === 'all' && { backgroundColor: accent },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'all' && { color: '#fff' },
                  ]}
                >
                  Tất cả ({PRODUCTS.length})
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  selectedFilter === 'bestseller' && { backgroundColor: accent },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedFilter('bestseller')}
              >
                <Ionicons
                  name="trophy"
                  size={16}
                  color={selectedFilter === 'bestseller' ? '#fff' : accent}
                />
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'bestseller' && { color: '#fff' },
                  ]}
                >
                  Bán chạy
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  selectedFilter === 'new' && { backgroundColor: accent },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedFilter('new')}
              >
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={selectedFilter === 'new' ? '#fff' : accent}
                />
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'new' && { color: '#fff' },
                  ]}
                >
                  Mới
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  selectedFilter === 'lowStock' && { backgroundColor: '#f97316' },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedFilter('lowStock')}
              >
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={selectedFilter === 'lowStock' ? '#fff' : '#f97316'}
                />
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'lowStock' && { color: '#fff' },
                  ]}
                >
                  Sắp hết ({stats.lowStock})
                </ThemedText>
              </Pressable>

              {/* Moderation Status Filters (Admin only) */}
              {isAdmin && (
                <>
                  <Pressable
                    style={[
                      styles.filterChip,
                      selectedFilter === 'pending' && { backgroundColor: '#f97316' },
                      { borderColor: border },
                    ]}
                    onPress={() => setSelectedFilter('pending')}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color={selectedFilter === 'pending' ? '#fff' : '#f97316'}
                    />
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        selectedFilter === 'pending' && { color: '#fff' },
                      ]}
                    >
                      Chờ duyệt ({PRODUCTS.filter(p => p.status === 'PENDING').length})
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.filterChip,
                      selectedFilter === 'approved' && { backgroundColor: '#22c55e' },
                      { borderColor: border },
                    ]}
                    onPress={() => setSelectedFilter('approved')}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={selectedFilter === 'approved' ? '#fff' : '#22c55e'}
                    />
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        selectedFilter === 'approved' && { color: '#fff' },
                      ]}
                    >
                      Đã duyệt ({PRODUCTS.filter(p => p.status === 'APPROVED' || !p.status).length})
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.filterChip,
                      selectedFilter === 'rejected' && { backgroundColor: '#ef4444' },
                      { borderColor: border },
                    ]}
                    onPress={() => setSelectedFilter('rejected')}
                  >
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={selectedFilter === 'rejected' ? '#fff' : '#ef4444'}
                    />
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        selectedFilter === 'rejected' && { color: '#fff' },
                      ]}
                    >
                      Từ chối ({PRODUCTS.filter(p => p.status === 'REJECTED').length})
                    </ThemedText>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </Section>

          {/* Product List */}
          <View style={{ marginTop: 16 }}>
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="title" style={{ fontSize: 16, marginBottom: 4 }}>
                  Danh sách sản phẩm
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: textMuted }}>
                  {filteredProducts.length} sản phẩm
                </ThemedText>
              </View>
              <Pressable
                style={[styles.addButton, { backgroundColor: accent }]}
                onPress={() => Alert.alert('Thêm sản phẩm', 'Tính năng đang phát triển')}
              >
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <ThemedText style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  Thêm mới
                </ThemedText>
              </Pressable>
            </View>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={64} color={textMuted} />
                <ThemedText style={{ color: textMuted, marginTop: 16 }}>
                  Không tìm thấy sản phẩm
                </ThemedText>
              </View>
            ) : (
              filteredProducts.map((product) => (
                <ProductDashboardCard
                  key={product.id}
                  product={product}
                  showMetrics={true}
                  currentUserId={user?.id ? String(user.id) : undefined}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                  onModerate={handleModerate}
                />
              ))
            )}
          </View>
        </Container>
      </ScrollView>

      {/* Moderation Modal */}
      <ProductModerationModal
        visible={moderationModal.visible}
        product={moderationModal.product}
        onClose={() => setModerationModal({ visible: false, product: null })}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
