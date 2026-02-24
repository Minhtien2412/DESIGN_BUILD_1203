import MaterialsCatalogService, {
    Material,
    MATERIAL_CATEGORIES,
    MOCK_MATERIALS
} from '@/services/materialsCatalogService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

export default function MaterialsCatalogScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [showARPreview, setShowARPreview] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Load materials from API
  const loadMaterials = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(false);
      
      const data = await MaterialsCatalogService.getMaterials(
        selectedCategory as any,
        searchQuery || undefined
      );
      setMaterials(data);
    } catch (err) {
      console.error('Materials load error:', err);
      setError(true);
      setMaterials(MOCK_MATERIALS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMaterials(true);
  };

  const handleSearch = () => {
    loadMaterials();
  };

  const filteredMaterials = materials.filter((material) => {
    const matchCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price.replace(/\./g, '')) - parseFloat(b.price.replace(/\./g, ''));
      case 'price-high':
        return parseFloat(b.price.replace(/\./g, '')) - parseFloat(a.price.replace(/\./g, ''));
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Catalog Vật Liệu',
          headerStyle: { backgroundColor: '#0D9488' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#0D9488', '#14B8A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#fff" />
              <Text style={styles.errorText}>Server không khả dụng - Dùng dữ liệu demo</Text>
            </View>
          )}
          
          <Text style={styles.heroTitle}>Khám phá vật liệu xây dựng</Text>
          <Text style={styles.heroSubtitle}>Hơn 10,000+ sản phẩm chất lượng</Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm vật liệu, thương hiệu..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {loading && !materials.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Đang tải vật liệu...</Text>
          </View>
        ) : (
        <>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {MATERIAL_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={18}
                  color={selectedCategory === category.id ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort Options */}
        <View style={styles.sortSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            {[
              { id: 'popular', label: 'Phổ biến', icon: 'star' },
              { id: 'price-low', label: 'Giá thấp', icon: 'trending-down' },
              { id: 'price-high', label: 'Giá cao', icon: 'trending-up' },
              { id: 'rating', label: 'Đánh giá', icon: 'star-half' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortChip,
                  sortBy === option.id && styles.sortChipActive,
                ]}
                onPress={() => setSortBy(option.id)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={14}
                  color={sortBy === option.id ? '#fff' : '#0D9488'}
                />
                <Text
                  style={[
                    styles.sortText,
                    sortBy === option.id && styles.sortTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.resultCount}>{sortedMaterials.length} sản phẩm</Text>
        </View>

        {/* Materials Grid */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.grid}>
            {sortedMaterials.map((material) => (
              <TouchableOpacity
                key={material.id}
                style={styles.card}
                onPress={() => setSelectedMaterial(material)}
                activeOpacity={0.7}
              >
                <Image source={material.image} style={styles.cardImage} />
                
                {/* Badges */}
                <View style={styles.badges}>
                  {material.arAvailable && (
                    <View style={styles.arBadge}>
                      <Ionicons name="cube" size={10} color="#fff" />
                      <Text style={styles.arBadgeText}>AR</Text>
                    </View>
                  )}
                  {material.inStock && (
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockBadgeText}>Còn hàng</Text>
                    </View>
                  )}
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                  <Text style={styles.brandText}>{material.brand}</Text>
                  <Text style={styles.materialName} numberOfLines={2}>
                    {material.name}
                  </Text>

                  {/* Rating */}
                  <View style={styles.rating}>
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                    <Text style={styles.ratingText}>{material.rating}</Text>
                    <Text style={styles.reviewsText}>({material.reviews})</Text>
                  </View>

                  {/* Price */}
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.price}>{material.price}</Text>
                      <Text style={styles.unit}>/{material.unit}</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton}>
                      <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        </>
        )}
      </View>

      {/* Material Detail Modal */}
      <Modal
        visible={selectedMaterial !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMaterial(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedMaterial(null)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            {selectedMaterial && (
              <ScrollView>
                <Image source={selectedMaterial.image} style={styles.modalImage} />
                
                <View style={styles.modalBody}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalBrand}>
                      <Text style={styles.modalBrandText}>{selectedMaterial.brand}</Text>
                    </View>
                    <View style={styles.modalRating}>
                      <Ionicons name="star" size={16} color="#FFFFFF" />
                      <Text style={styles.modalRatingText}>{selectedMaterial.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.modalTitle}>{selectedMaterial.name}</Text>

                  {/* Specs */}
                  <View style={styles.specs}>
                    <Text style={styles.specsTitle}>Thông số kỹ thuật</Text>
                    {Object.entries(selectedMaterial.specs).map(([key, value]) => (
                      <View key={key} style={styles.specRow}>
                        <Text style={styles.specLabel}>
                          {key === 'size' && 'Kích thước'}
                          {key === 'thickness' && 'Độ dày'}
                          {key === 'finish' && 'Hoàn thiện'}
                          {key === 'origin' && 'Xuất xứ'}
                          {key === 'waterResist' && 'Chống nước'}
                          {key === 'warranty' && 'Bảo hành'}
                          {key === 'hardness' && 'Độ cứng'}
                          {key === 'type' && 'Loại'}
                          {key === 'safety' && 'An toàn'}
                          {key === 'grade' && 'Cấp'}
                        </Text>
                        <Text style={styles.specValue}>{String(value)}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    {selectedMaterial.arAvailable && (
                      <TouchableOpacity
                        style={styles.arButton}
                        onPress={() => {
                          setSelectedMaterial(null);
                          setShowARPreview(true);
                        }}
                      >
                        <Ionicons name="cube" size={20} color="#0D9488" />
                        <Text style={styles.arButtonText}>Xem AR</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.contactButton}>
                      <Ionicons name="call" size={20} color="#fff" />
                      <Text style={styles.contactButtonText}>Liên hệ</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Price & Add */}
                  <View style={styles.modalFooter}>
                    <View>
                      <Text style={styles.modalPrice}>{selectedMaterial.price}</Text>
                      <Text style={styles.modalUnit}>/{selectedMaterial.unit}</Text>
                    </View>
                    <TouchableOpacity style={styles.addToCartButton}>
                      <Ionicons name="cart" size={20} color="#fff" />
                      <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* AR Preview Modal */}
      <Modal
        visible={showARPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowARPreview(false)}
      >
        <View style={styles.arModalOverlay}>
          <TouchableOpacity
            style={styles.arCloseButton}
            onPress={() => setShowARPreview(false)}
          >
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          <View style={styles.arPlaceholder}>
            <Ionicons name="cube-outline" size={100} color="#fff" />
            <Text style={styles.arPlaceholderText}>AR Preview</Text>
            <Text style={styles.arPlaceholderSubtext}>
              Tính năng AR đang phát triển
            </Text>
            <Text style={styles.arPlaceholderDesc}>
              Sẽ cho phép xem vật liệu trên không gian thực tế
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  errorText: {
    color: '#fff',
    fontSize: 12,
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 70,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginTop: -50,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#0D9488',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  sortSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortScroll: {
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0D9488',
    gap: 4,
  },
  sortChipActive: {
    backgroundColor: '#0D9488',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
  },
  sortTextActive: {
    color: '#fff',
  },
  resultCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  badges: {
    position: 'absolute',
    top: 8,
    right: 8,
    gap: 4,
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(238, 77, 45, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  arBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  stockBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stockBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
  },
  cardContent: {
    padding: 10,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
    marginBottom: 4,
  },
  materialName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 36,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  reviewsText: {
    fontSize: 11,
    color: '#999',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D9488',
  },
  unit: {
    fontSize: 11,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#0D9488',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  modalBody: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBrand: {
    backgroundColor: '#fff5f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalBrandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalRatingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  specs: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  specsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specLabel: {
    fontSize: 13,
    color: '#666',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  arButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  arButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#52c41a',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D9488',
  },
  modalUnit: {
    fontSize: 13,
    color: '#999',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  arModalOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  arPlaceholder: {
    alignItems: 'center',
    padding: 40,
  },
  arPlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
  },
  arPlaceholderSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
  arPlaceholderDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    textAlign: 'center',
  },
});
