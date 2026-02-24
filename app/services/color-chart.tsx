import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const COLOR_SIZE = (width - 48) / 4;

// Mock data - Paint colors
const PAINT_COLORS = [
  // Dulux
  { id: 1, name: 'Whisper White', code: '10YY 83/012', hex: '#F8F6F4', brand: 'Dulux', price: '450.000₫', category: 'Trắng', store: '15 cửa hàng' },
  { id: 2, name: 'Natural White', code: '90YY 83/006', hex: '#FAF8F6', brand: 'Dulux', price: '450.000₫', category: 'Trắng', store: '15 cửa hàng' },
  { id: 3, name: 'Lemon Pie', code: '30YY 73/130', hex: '#F9E6B8', brand: 'Dulux', price: '480.000₫', category: 'Vàng', store: '12 cửa hàng' },
  { id: 4, name: 'Golden Sand', code: '30YY 74/267', hex: '#F4D896', brand: 'Dulux', price: '480.000₫', category: 'Vàng', store: '12 cửa hàng' },
  
  // Nippon
  { id: 5, name: 'Pure White', code: 'NP N-1', hex: '#FFFFFF', brand: 'Nippon', price: '520.000₫', category: 'Trắng', store: '18 cửa hàng' },
  { id: 6, name: 'Sky Blue', code: 'NP B-15', hex: '#A8D8EA', brand: 'Nippon', price: '550.000₫', category: 'Xanh dương', store: '14 cửa hàng' },
  { id: 7, name: 'Ocean Breeze', code: 'NP B-22', hex: '#7FB3D5', brand: 'Nippon', price: '550.000₫', category: 'Xanh dương', store: '14 cửa hàng' },
  { id: 8, name: 'Mint Fresh', code: 'NP G-12', hex: '#B8E6D5', brand: 'Nippon', price: '550.000₫', category: 'Xanh lá', store: '13 cửa hàng' },
  
  // Jotun
  { id: 9, name: 'Lady Pure White', code: 'L0395', hex: '#F8F8F8', brand: 'Jotun', price: '580.000₫', category: 'Trắng', store: '16 cửa hàng' },
  { id: 10, name: 'Blush Pink', code: 'L0442', hex: '#F5D5D8', brand: 'Jotun', price: '600.000₫', category: 'Hồng', store: '11 cửa hàng' },
  { id: 11, name: 'Warm Grey', code: 'L0588', hex: '#D5D2CE', brand: 'Jotun', price: '580.000₫', category: 'Xám', store: '15 cửa hàng' },
  { id: 12, name: 'Soft Beige', code: 'L0766', hex: '#E8DFD6', brand: 'Jotun', price: '600.000₫', category: 'Be', store: '14 cửa hàng' },
  
  // More colors
  { id: 13, name: 'Coral Dream', code: 'D0892', hex: '#FFB6A8', brand: 'Dulux', price: '500.000₫', category: 'Cam', store: '10 cửa hàng' },
  { id: 14, name: 'Lavender Mist', code: 'N0933', hex: '#D5C8E0', brand: 'Nippon', price: '570.000₫', category: 'Tím', store: '9 cửa hàng' },
  { id: 15, name: 'Forest Green', code: 'J1055', hex: '#8FB69C', brand: 'Jotun', price: '620.000₫', category: 'Xanh lá', store: '11 cửa hàng' },
  { id: 16, name: 'Charcoal', code: 'D1122', hex: '#6E6E6E', brand: 'Dulux', price: '480.000₫', category: 'Xám', store: '13 cửa hàng' },
];

const BRANDS = ['Tất cả', 'Dulux', 'Nippon', 'Jotun'];
const CATEGORIES = ['Tất cả', 'Trắng', 'Xám', 'Be', 'Vàng', 'Xanh dương', 'Xanh lá', 'Hồng', 'Cam', 'Tím'];

interface ColorItemProps {
  color: any;
  selected: boolean;
  comparing: boolean;
  onPress: () => void;
  onCompare: () => void;
}

const ColorItem: React.FC<ColorItemProps> = ({ color, selected, comparing, onPress, onCompare }) => {
  return (
    <TouchableOpacity
      style={[styles.colorItem, selected && styles.colorItemSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Compare Checkbox */}
      <TouchableOpacity
        style={styles.compareCheckbox}
        onPress={onCompare}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <View style={[styles.checkbox, comparing && styles.checkboxActive]}>
          {comparing && <Ionicons name="checkmark" size={12} color="#fff" />}
        </View>
      </TouchableOpacity>

      {/* Color Swatch */}
      <View style={[styles.colorSwatch, { backgroundColor: color.hex }]}>
        {selected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="eye" size={16} color="#fff" />
          </View>
        )}
      </View>

      {/* Color Info */}
      <View style={styles.colorInfo}>
        <Text style={styles.colorName} numberOfLines={1}>
          {color.name}
        </Text>
        <Text style={styles.colorCode}>{color.code}</Text>
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>{color.brand}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ColorChartScreen() {
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [comparingColors, setComparingColors] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const filteredColors = PAINT_COLORS.filter((color) => {
    const matchBrand = selectedBrand === 'Tất cả' || color.brand === selectedBrand;
    const matchCategory = selectedCategory === 'Tất cả' || color.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBrand && matchCategory && matchSearch;
  });

  const handleCompareToggle = (colorId: number) => {
    if (comparingColors.includes(colorId)) {
      setComparingColors(comparingColors.filter((id) => id !== colorId));
    } else {
      if (comparingColors.length < 3) {
        setComparingColors([...comparingColors, colorId]);
      } else {
        alert('Chỉ có thể so sánh tối đa 3 màu');
      }
    }
  };

  const compareColors = PAINT_COLORS.filter((color) => comparingColors.includes(color.id));

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bảng màu sơn',
          headerStyle: { backgroundColor: '#0D9488' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tên màu, mã màu..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          {/* Brand Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand}
                style={[
                  styles.filterChip,
                  selectedBrand === brand && styles.filterChipActive,
                ]}
                onPress={() => setSelectedBrand(brand)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedBrand === brand && styles.filterChipTextActive,
                  ]}
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {CATEGORIES.map((category) => (
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
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Compare Bar */}
        {comparingColors.length > 0 && (
          <View style={styles.compareBar}>
            <View style={styles.compareInfo}>
              <Ionicons name="git-compare-outline" size={18} color="#0D9488" />
              <Text style={styles.compareText}>
                Đã chọn {comparingColors.length}/3 màu
              </Text>
            </View>
            <TouchableOpacity
              style={styles.compareButton}
              onPress={() => setShowCompare(true)}
              disabled={comparingColors.length < 2}
            >
              <Text
                style={[
                  styles.compareButtonText,
                  comparingColors.length < 2 && styles.compareButtonTextDisabled,
                ]}
              >
                So sánh
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Color Grid */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.colorGrid}>
            {filteredColors.map((color) => (
              <ColorItem
                key={color.id}
                color={color}
                selected={selectedColor?.id === color.id}
                comparing={comparingColors.includes(color.id)}
                onPress={() => setSelectedColor(color)}
                onCompare={() => handleCompareToggle(color.id)}
              />
            ))}
          </View>

          {/* Empty State */}
          {filteredColors.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="color-palette-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy màu phù hợp</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedBrand('Tất cả');
                  setSelectedCategory('Tất cả');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Color Detail Modal */}
      <Modal
        visible={selectedColor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedColor(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedColor(null)}
        >
          <View style={styles.modalContent}>
            {selectedColor && (
              <>
                {/* Large Color Swatch */}
                <View
                  style={[styles.modalColorSwatch, { backgroundColor: selectedColor.hex }]}
                />

                {/* Color Details */}
                <View style={styles.modalDetails}>
                  <Text style={styles.modalColorName}>{selectedColor.name}</Text>
                  
                  <View style={styles.modalInfoRow}>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Mã màu</Text>
                      <Text style={styles.modalInfoValue}>{selectedColor.code}</Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Hex</Text>
                      <Text style={styles.modalInfoValue}>{selectedColor.hex}</Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Thương hiệu</Text>
                      <Text style={styles.modalInfoValue}>{selectedColor.brand}</Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Loại</Text>
                      <Text style={styles.modalInfoValue}>{selectedColor.category}</Text>
                    </View>
                  </View>

                  <View style={styles.modalPriceRow}>
                    <View>
                      <Text style={styles.modalPriceLabel}>Giá tham khảo</Text>
                      <Text style={styles.modalPriceValue}>{selectedColor.price}</Text>
                      <Text style={styles.modalPriceUnit}>/ 5 lít</Text>
                    </View>
                    <View style={styles.modalStoreInfo}>
                      <Ionicons name="storefront-outline" size={16} color="#666" />
                      <Text style={styles.modalStoreText}>{selectedColor.store}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalActionButton}
                      onPress={() => handleCompareToggle(selectedColor.id)}
                    >
                      <Ionicons
                        name={
                          comparingColors.includes(selectedColor.id)
                            ? 'checkmark-circle'
                            : 'add-circle-outline'
                        }
                        size={20}
                        color="#0D9488"
                      />
                      <Text style={styles.modalActionText}>
                        {comparingColors.includes(selectedColor.id)
                          ? 'Đã thêm'
                          : 'So sánh'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalActionButtonPrimary}>
                      <Ionicons name="location" size={20} color="#fff" />
                      <Text style={styles.modalActionTextPrimary}>Tìm cửa hàng</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Compare Modal */}
      <Modal
        visible={showCompare}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompare(false)}
      >
        <View style={styles.compareModalOverlay}>
          <View style={styles.compareModalContent}>
            <View style={styles.compareModalHeader}>
              <Text style={styles.compareModalTitle}>So sánh màu sắc</Text>
              <TouchableOpacity onPress={() => setShowCompare(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Color Swatches Row */}
              <View style={styles.compareSwatchRow}>
                {compareColors.map((color) => (
                  <View key={color.id} style={styles.compareSwatchItem}>
                    <View
                      style={[styles.compareColorSwatch, { backgroundColor: color.hex }]}
                    />
                    <Text style={styles.compareColorName} numberOfLines={1}>
                      {color.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Comparison Table */}
              <View style={styles.compareTable}>
                {/* Brand Row */}
                <View style={styles.compareRow}>
                  <Text style={styles.compareRowLabel}>Thương hiệu</Text>
                  {compareColors.map((color) => (
                    <Text key={color.id} style={styles.compareRowValue}>
                      {color.brand}
                    </Text>
                  ))}
                </View>

                {/* Code Row */}
                <View style={styles.compareRow}>
                  <Text style={styles.compareRowLabel}>Mã màu</Text>
                  {compareColors.map((color) => (
                    <Text key={color.id} style={styles.compareRowValue}>
                      {color.code}
                    </Text>
                  ))}
                </View>

                {/* Category Row */}
                <View style={styles.compareRow}>
                  <Text style={styles.compareRowLabel}>Loại</Text>
                  {compareColors.map((color) => (
                    <Text key={color.id} style={styles.compareRowValue}>
                      {color.category}
                    </Text>
                  ))}
                </View>

                {/* Price Row */}
                <View style={styles.compareRow}>
                  <Text style={styles.compareRowLabel}>Giá</Text>
                  {compareColors.map((color) => (
                    <Text key={color.id} style={styles.compareRowValue}>
                      {color.price}
                    </Text>
                  ))}
                </View>

                {/* Store Row */}
                <View style={styles.compareRow}>
                  <Text style={styles.compareRowLabel}>Cửa hàng</Text>
                  {compareColors.map((color) => (
                    <Text key={color.id} style={styles.compareRowValue}>
                      {color.store}
                    </Text>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterScroll: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#0D9488',
  },
  compareBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  compareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
    marginLeft: 6,
  },
  compareButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compareButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  compareButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  colorItem: {
    width: COLOR_SIZE,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  colorItemSelected: {
    transform: [{ scale: 0.95 }],
  },
  compareCheckbox: {
    position: 'absolute',
    top: 4,
    right: 8,
    zIndex: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  colorSwatch: {
    width: '100%',
    height: COLOR_SIZE * 0.8,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  colorInfo: {
    alignItems: 'center',
  },
  colorName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  colorCode: {
    fontSize: 9,
    color: '#999',
    marginBottom: 4,
  },
  brandBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalColorSwatch: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalDetails: {
    padding: 20,
  },
  modalColorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  modalInfoItem: {
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalPriceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  modalPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D9488',
  },
  modalPriceUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  modalStoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStoreText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
    marginLeft: 6,
  },
  modalActionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalActionTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  compareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  compareModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  compareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  compareModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  compareSwatchRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  compareSwatchItem: {
    flex: 1,
    alignItems: 'center',
  },
  compareColorSwatch: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  compareColorName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  compareTable: {
    padding: 16,
  },
  compareRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 8,
  },
  compareRowLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  compareRowValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
});
