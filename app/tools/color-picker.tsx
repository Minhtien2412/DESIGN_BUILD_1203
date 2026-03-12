/**
 * Color Picker Tool - Bảng màu sơn
 */
import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const COLOR_PALETTES = [
  {
    id: 'living',
    name: 'Phòng khách',
    emoji: '🛋️',
    colors: [
      { name: 'Trắng Ngọc', hex: '#FAFAFA', warm: true },
      { name: 'Xám Bạc', hex: '#E0E0E0', warm: false },
      { name: 'Be Nhạt', hex: '#F5F5DC', warm: true },
      { name: 'Xanh Nhẹ', hex: '#E3F2FD', warm: false },
      { name: 'Kem Sữa', hex: '#FFF8E1', warm: true },
      { name: 'Xám Xanh', hex: '#CFD8DC', warm: false },
    ],
  },
  {
    id: 'bedroom',
    name: 'Phòng ngủ',
    emoji: '🛏️',
    colors: [
      { name: 'Xanh Pastel', hex: '#B2DFDB', warm: false },
      { name: 'Hồng Phấn', hex: '#F8BBD9', warm: true },
      { name: 'Tím Lavender', hex: '#E1BEE7', warm: false },
      { name: 'Xanh Mint', hex: '#C8E6C9', warm: false },
      { name: 'Đào Nhạt', hex: '#FFCCBC', warm: true },
      { name: 'Xám Ấm', hex: '#D7CCC8', warm: true },
    ],
  },
  {
    id: 'kitchen',
    name: 'Phòng bếp',
    emoji: '🍳',
    colors: [
      { name: 'Trắng Sáng', hex: '#FFFFFF', warm: true },
      { name: 'Xanh Dương', hex: '#BBDEFB', warm: false },
      { name: 'Vàng Nhẹ', hex: '#FFF9C4', warm: true },
      { name: 'Xanh Olive', hex: '#DCEDC8', warm: true },
      { name: 'Đỏ Cherry', hex: '#FFCDD2', warm: true },
      { name: 'Cam Đào', hex: '#FFE0B2', warm: true },
    ],
  },
  {
    id: 'bathroom',
    name: 'Phòng tắm',
    emoji: '🚿',
    colors: [
      { name: 'Trắng Tinh', hex: '#FAFAFA', warm: false },
      { name: 'Xanh Biển', hex: '#B3E5FC', warm: false },
      { name: 'Xanh Ngọc', hex: '#B2EBF2', warm: false },
      { name: 'Xám Nhạt', hex: '#ECEFF1', warm: false },
      { name: 'Xanh Aqua', hex: '#80DEEA', warm: false },
      { name: 'Trắng Xám', hex: '#F5F5F5', warm: false },
    ],
  },
  {
    id: 'kids',
    name: 'Phòng trẻ em',
    emoji: '🧸',
    colors: [
      { name: 'Vàng Nắng', hex: '#FFEB3B', warm: true },
      { name: 'Xanh Trời', hex: '#81D4FA', warm: false },
      { name: 'Hồng Dâu', hex: '#F48FB1', warm: true },
      { name: 'Xanh Lá', hex: '#AED581', warm: false },
      { name: 'Cam Tươi', hex: '#FFAB91', warm: true },
      { name: 'Tím Violet', hex: '#CE93D8', warm: false },
    ],
  },
  {
    id: 'exterior',
    name: 'Ngoại thất',
    emoji: '🏠',
    colors: [
      { name: 'Trắng Ngà', hex: '#FFFDE7', warm: true },
      { name: 'Xám Đá', hex: '#9E9E9E', warm: false },
      { name: 'Be Nâu', hex: '#D7CCC8', warm: true },
      { name: 'Xanh Rêu', hex: '#A5D6A7', warm: false },
      { name: 'Nâu Đất', hex: '#BCAAA4', warm: true },
      { name: 'Xám Than', hex: '#757575', warm: false },
    ],
  },
];

const BRANDS = [
  { id: 'dulux', name: 'Dulux', logo: '🔵' },
  { id: 'jotun', name: 'Jotun', logo: '🟢' },
  { id: 'nippon', name: 'Nippon', logo: '🔴' },
  { id: 'mykolor', name: 'MyKolor', logo: '🟡' },
];

export default function ColorPickerScreen() {
  const [selectedRoom, setSelectedRoom] = useState('living');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [filterWarm, setFilterWarm] = useState<boolean | null>(null);

  const currentPalette = COLOR_PALETTES.find((p) => p.id === selectedRoom);
  const filteredColors = currentPalette?.colors.filter((c) => {
    if (filterWarm === null) return true;
    return c.warm === filterWarm;
  });

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#E91E63" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>🎨 Bảng màu Sơn</Text>
            <Text style={styles.headerSubtitle}>Chọn màu phù hợp từng không gian</Text>
          </View>
        </View>

        {/* Room Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roomScroll}
          contentContainerStyle={styles.roomScrollContent}
        >
          {COLOR_PALETTES.map((palette) => (
            <TouchableOpacity
              key={palette.id}
              style={[
                styles.roomBtn,
                selectedRoom === palette.id && styles.roomBtnActive,
              ]}
              onPress={() => setSelectedRoom(palette.id)}
            >
              <Text style={styles.roomEmoji}>{palette.emoji}</Text>
              <Text
                style={[
                  styles.roomText,
                  selectedRoom === palette.id && styles.roomTextActive,
                ]}
              >
                {palette.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filterWarm === null && styles.filterBtnActive]}
            onPress={() => setFilterWarm(null)}
          >
            <Text style={styles.filterText}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterWarm === true && styles.filterBtnActive]}
            onPress={() => setFilterWarm(true)}
          >
            <Text style={styles.filterText}>🌡️ Tông ấm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterWarm === false && styles.filterBtnActive]}
            onPress={() => setFilterWarm(false)}
          >
            <Text style={styles.filterText}>❄️ Tông lạnh</Text>
          </TouchableOpacity>
        </View>

        {/* Color Grid */}
        <View style={styles.colorGrid}>
          {filteredColors?.map((color, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.colorCard,
                selectedColor === color.hex && styles.colorCardActive,
              ]}
              onPress={() => setSelectedColor(color.hex)}
            >
              <View style={[styles.colorSwatch, { backgroundColor: color.hex }]}>
                {selectedColor === color.hex && (
                  <Ionicons name="checkmark-circle" size={24} color="#E91E63" />
                )}
              </View>
              <Text style={styles.colorName}>{color.name}</Text>
              <Text style={styles.colorHex}>{color.hex}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Color Preview */}
        {selectedColor && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Màu đã chọn</Text>
            <View style={styles.previewRow}>
              <View
                style={[styles.previewSwatch, { backgroundColor: selectedColor }]}
              />
              <View style={styles.previewInfo}>
                <Text style={styles.previewHex}>{selectedColor}</Text>
                <Text style={styles.previewName}>
                  {filteredColors?.find((c) => c.hex === selectedColor)?.name}
                </Text>
              </View>
              <TouchableOpacity style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={20} color="#E91E63" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏪 Thương hiệu đề xuất</Text>
          <View style={styles.brandsRow}>
            {BRANDS.map((brand) => (
              <View key={brand.id} style={styles.brandCard}>
                <Text style={styles.brandLogo}>{brand.logo}</Text>
                <Text style={styles.brandName}>{brand.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Mẹo chọn màu sơn</Text>
          <Text style={styles.tipText}>
            • Thử màu trên tường nhỏ trước khi sơn toàn bộ{'\n'}
            • Màu sẽ đậm hơn khi khô và trong ánh sáng tự nhiên{'\n'}
            • Phòng nhỏ nên dùng màu sáng để tạo cảm giác rộng{'\n'}
            • Màu trần nên nhạt hơn màu tường 1-2 độ
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  roomScroll: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  roomScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  roomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  roomBtnActive: {
    backgroundColor: '#FCE4EC',
  },
  roomEmoji: {
    fontSize: 16,
  },
  roomText: {
    fontSize: 13,
    color: '#6B7280',
  },
  roomTextActive: {
    color: '#E91E63',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  filterBtnActive: {
    backgroundColor: '#E91E63',
  },
  filterText: {
    fontSize: 12,
    color: '#4B5563',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  colorCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  colorCardActive: {
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  colorSwatch: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  colorHex: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  previewCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewSwatch: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewInfo: {
    flex: 1,
  },
  previewHex: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  previewName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  copyBtn: {
    padding: 10,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  brandsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  brandCard: {
    alignItems: 'center',
  },
  brandLogo: {
    fontSize: 28,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 12,
    color: '#6B7280',
  },
  tipCard: {
    margin: 16,
    backgroundColor: '#FCE4EC',
    borderRadius: 12,
    padding: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C2185B',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#D81B60',
    lineHeight: 20,
  },
});
