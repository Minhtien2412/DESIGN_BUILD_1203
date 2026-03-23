import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { DSEmptyState } from '@/components/ds';
import { DSModuleScreen } from '@/components/ds/layouts';
import { useDS } from '@/hooks/useDS';

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

export default function ColorChartScreen() {
  const { colors, spacing, radius, text, screen } = useDS();

  const COLOR_SIZE = (screen.width - 48) / 4;

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

  const compareColorsData = PAINT_COLORS.filter((color) => comparingColors.includes(color.id));

  const renderColorItem = (color: typeof PAINT_COLORS[0]) => {
    const selected = selectedColor?.id === color.id;
    const comparing = comparingColors.includes(color.id);

    return (
      <TouchableOpacity
        key={color.id}
        style={{
          width: COLOR_SIZE,
          marginBottom: spacing.md,
          paddingHorizontal: spacing.xs,
          ...(selected ? { transform: [{ scale: 0.95 }] } : {}),
        }}
        onPress={() => setSelectedColor(color)}
        activeOpacity={0.8}
      >
        {/* Compare Checkbox */}
        <TouchableOpacity
          style={{ position: 'absolute', top: spacing.xs, right: spacing.sm, zIndex: 10 }}
          onPress={() => handleCompareToggle(color.id)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: comparing ? colors.primary : colors.card,
            borderWidth: 2,
            borderColor: comparing ? colors.primary : colors.border,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {comparing && <Ionicons name="checkmark" size={12} color={colors.textInverse} />}
          </View>
        </TouchableOpacity>

        {/* Color Swatch - uses paint hex from mock data */}
        <View style={{
          width: '100%',
          height: COLOR_SIZE * 0.8,
          borderRadius: radius.lg,
          marginBottom: spacing.xs,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: color.hex,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {selected && (
            <View style={{ backgroundColor: colors.overlay, borderRadius: 12, padding: spacing.xs }}>
              <Ionicons name="eye" size={16} color={colors.textInverse} />
            </View>
          )}
        </View>

        {/* Color Info */}
        <View style={{ alignItems: 'center' }}>
          <Text style={[text.caption, { color: colors.text, fontWeight: '600', textAlign: 'center', marginBottom: 2 }]} numberOfLines={1}>
            {color.name}
          </Text>
          <Text style={[text.caption, { color: colors.textTertiary, fontSize: 9, marginBottom: spacing.xs }]}>
            {color.code}
          </Text>
          <View style={{ backgroundColor: colors.bgMuted, paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.xs }}>
            <Text style={[text.caption, { color: colors.textSecondary, fontSize: 9, fontWeight: '600' }]}>
              {color.brand}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <DSModuleScreen title="Bảng màu sơn" gradientHeader>
        {/* Search Bar */}
        <View style={{
          backgroundColor: colors.card,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgInput,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            height: 40,
          }}>
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: spacing.sm,
                fontSize: 14,
                color: colors.text,
              }}
              placeholder="Tìm tên màu, mã màu..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Section */}
        <View style={{
          backgroundColor: colors.card,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}>
          {/* Brand Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
            {BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.xs,
                  borderRadius: radius.full,
                  backgroundColor: selectedBrand === brand ? colors.primary : colors.bgMuted,
                  marginHorizontal: spacing.xs,
                }}
                onPress={() => setSelectedBrand(brand)}
              >
                <Text style={[
                  text.caption,
                  {
                    fontWeight: '500',
                    color: selectedBrand === brand ? colors.textInverse : colors.textSecondary,
                  },
                ]}>
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 5,
                  borderRadius: radius.lg,
                  backgroundColor: selectedCategory === category ? colors.primaryBg : colors.bgMuted,
                  marginHorizontal: spacing.xs,
                  borderWidth: 1,
                  borderColor: selectedCategory === category ? colors.primary : 'transparent',
                }}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  text.caption,
                  {
                    fontSize: 12,
                    fontWeight: '500',
                    color: selectedCategory === category ? colors.primary : colors.textSecondary,
                  },
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Compare Bar */}
        {comparingColors.length > 0 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.primaryBg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="git-compare-outline" size={18} color={colors.primary} />
              <Text style={[text.caption, { fontWeight: '600', color: colors.primary, marginLeft: spacing.xs }]}>
                Đã chọn {comparingColors.length}/3 màu
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.xs,
                borderRadius: radius.sm,
              }}
              onPress={() => setShowCompare(true)}
              disabled={comparingColors.length < 2}
            >
              <Text style={[
                text.caption,
                {
                  fontWeight: '600',
                  color: colors.textInverse,
                  ...(comparingColors.length < 2 ? { opacity: 0.5 } : {}),
                },
              ]}>
                So sánh
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Color Grid */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md }}>
            {filteredColors.map((color) => renderColorItem(color))}
          </View>

          {/* Empty State */}
          {filteredColors.length === 0 && (
            <DSEmptyState
              icon="color-palette-outline"
              title="Không tìm thấy màu phù hợp"
              description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              actionLabel="Đặt lại bộ lọc"
              onAction={() => {
                setSelectedBrand('Tất cả');
                setSelectedCategory('Tất cả');
                setSearchQuery('');
              }}
            />
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </DSModuleScreen>

      {/* Color Detail Modal */}
      <Modal
        visible={selectedColor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedColor(null)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xl,
          }}
          activeOpacity={1}
          onPress={() => setSelectedColor(null)}
        >
          <View style={{
            backgroundColor: colors.card,
            borderRadius: radius.xl,
            width: '100%',
            maxWidth: 400,
            overflow: 'hidden',
          }}>
            {selectedColor && (
              <>
                {/* Large Color Swatch - uses paint hex from mock data */}
                <View style={{
                  width: '100%',
                  height: 200,
                  borderTopLeftRadius: radius.xl,
                  borderTopRightRadius: radius.xl,
                  backgroundColor: selectedColor.hex,
                }} />

                {/* Color Details */}
                <View style={{ padding: spacing.xl }}>
                  <Text style={[text.h2, { color: colors.text, marginBottom: spacing.lg }]}>
                    {selectedColor.name}
                  </Text>

                  <View style={{ flexDirection: 'row', marginBottom: spacing.md, gap: spacing.lg }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[text.caption, { fontWeight: '600', color: colors.textTertiary, marginBottom: spacing.xs }]}>
                        Mã màu
                      </Text>
                      <Text style={[text.bodySemibold, { color: colors.text }]}>
                        {selectedColor.code}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[text.caption, { fontWeight: '600', color: colors.textTertiary, marginBottom: spacing.xs }]}>
                        Hex
                      </Text>
                      <Text style={[text.bodySemibold, { color: colors.text }]}>
                        {selectedColor.hex}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', marginBottom: spacing.md, gap: spacing.lg }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[text.caption, { fontWeight: '600', color: colors.textTertiary, marginBottom: spacing.xs }]}>
                        Thương hiệu
                      </Text>
                      <Text style={[text.bodySemibold, { color: colors.text }]}>
                        {selectedColor.brand}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[text.caption, { fontWeight: '600', color: colors.textTertiary, marginBottom: spacing.xs }]}>
                        Loại
                      </Text>
                      <Text style={[text.bodySemibold, { color: colors.text }]}>
                        {selectedColor.category}
                      </Text>
                    </View>
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginVertical: spacing.lg,
                    paddingTop: spacing.lg,
                    borderTopWidth: 1,
                    borderTopColor: colors.borderLight,
                  }}>
                    <View>
                      <Text style={[text.caption, { color: colors.textTertiary, marginBottom: spacing.xs }]}>
                        Giá tham khảo
                      </Text>
                      <Text style={[text.h3, { color: colors.primary }]}>
                        {selectedColor.price}
                      </Text>
                      <Text style={[text.caption, { color: colors.textTertiary, marginTop: 2 }]}>
                        / 5 lít
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="storefront-outline" size={16} color={colors.textSecondary} />
                      <Text style={[text.caption, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                        {selectedColor.store}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.primaryBg,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        paddingVertical: spacing.md,
                        borderRadius: radius.md,
                      }}
                      onPress={() => handleCompareToggle(selectedColor.id)}
                    >
                      <Ionicons
                        name={
                          comparingColors.includes(selectedColor.id)
                            ? 'checkmark-circle'
                            : 'add-circle-outline'
                        }
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={[text.bodySemibold, { color: colors.primary, marginLeft: spacing.xs }]}>
                        {comparingColors.includes(selectedColor.id)
                          ? 'Đã thêm'
                          : 'So sánh'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary,
                      paddingVertical: spacing.md,
                      borderRadius: radius.md,
                    }}>
                      <Ionicons name="location" size={20} color={colors.textInverse} />
                      <Text style={[text.bodySemibold, { color: colors.textInverse, marginLeft: spacing.xs }]}>
                        Tìm cửa hàng
                      </Text>
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
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: radius.xxl,
            borderTopRightRadius: radius.xxl,
            maxHeight: '80%',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}>
              <Text style={[text.h3, { color: colors.text }]}>So sánh màu sắc</Text>
              <TouchableOpacity onPress={() => setShowCompare(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Color Swatches Row */}
              <View style={{ flexDirection: 'row', padding: spacing.lg, gap: spacing.md }}>
                {compareColorsData.map((color) => (
                  <View key={color.id} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{
                      width: '100%',
                      height: 80,
                      borderRadius: radius.lg,
                      marginBottom: spacing.sm,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: color.hex,
                    }} />
                    <Text style={[text.caption, { fontWeight: '600', color: colors.text, textAlign: 'center' }]} numberOfLines={1}>
                      {color.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Comparison Table */}
              <View style={{ padding: spacing.lg }}>
                {[
                  { label: 'Thương hiệu', key: 'brand' as const },
                  { label: 'Mã màu', key: 'code' as const },
                  { label: 'Loại', key: 'category' as const },
                  { label: 'Giá', key: 'price' as const },
                  { label: 'Cửa hàng', key: 'store' as const },
                ].map((row) => (
                  <View key={row.key} style={{
                    flexDirection: 'row',
                    paddingVertical: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                    gap: spacing.sm,
                  }}>
                    <Text style={[text.caption, { width: 80, fontWeight: '600', color: colors.textTertiary }]}>
                      {row.label}
                    </Text>
                    {compareColorsData.map((color) => (
                      <Text key={color.id} style={[text.caption, { flex: 1, color: colors.text, textAlign: 'center' }]}>
                        {color[row.key]}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
