/**
 * Price Compare Tool - So sánh giá vật liệu
 */
import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORIES = [
  { id: 'cement', name: 'Xi măng', emoji: '🧱' },
  { id: 'steel', name: 'Thép', emoji: '🔩' },
  { id: 'paint', name: 'Sơn', emoji: '🎨' },
  { id: 'tiles', name: 'Gạch', emoji: '🪨' },
  { id: 'wood', name: 'Gỗ', emoji: '🪵' },
  { id: 'electrical', name: 'Điện', emoji: '💡' },
];

const MATERIALS: Record<string, {
  id: string;
  name: string;
  unit: string;
  brands: { name: string; price: number; quality: string }[];
}[]> = {
  cement: [
    {
      id: 'pcb40',
      name: 'Xi măng PCB40',
      unit: 'bao 50kg',
      brands: [
        { name: 'Holcim', price: 105000, quality: 'Cao' },
        { name: 'Hà Tiên', price: 98000, quality: 'Cao' },
        { name: 'Vicem', price: 92000, quality: 'TB' },
        { name: 'Nghi Sơn', price: 88000, quality: 'TB' },
      ],
    },
    {
      id: 'pcb50',
      name: 'Xi măng PCB50',
      unit: 'bao 50kg',
      brands: [
        { name: 'Holcim', price: 125000, quality: 'Cao' },
        { name: 'Hà Tiên', price: 118000, quality: 'Cao' },
        { name: 'Vicem', price: 112000, quality: 'TB' },
      ],
    },
  ],
  steel: [
    {
      id: 'steel10',
      name: 'Thép Φ10',
      unit: 'kg',
      brands: [
        { name: 'Hòa Phát', price: 17500, quality: 'Cao' },
        { name: 'Pomina', price: 17200, quality: 'Cao' },
        { name: 'Việt Ý', price: 16800, quality: 'TB' },
        { name: 'Việt Nhật', price: 16500, quality: 'TB' },
      ],
    },
    {
      id: 'steel12',
      name: 'Thép Φ12',
      unit: 'kg',
      brands: [
        { name: 'Hòa Phát', price: 17200, quality: 'Cao' },
        { name: 'Pomina', price: 16900, quality: 'Cao' },
        { name: 'Việt Ý', price: 16500, quality: 'TB' },
      ],
    },
  ],
  paint: [
    {
      id: 'interior',
      name: 'Sơn nội thất',
      unit: 'thùng 18L',
      brands: [
        { name: 'Dulux', price: 1850000, quality: 'Cao' },
        { name: 'Jotun', price: 1750000, quality: 'Cao' },
        { name: 'Nippon', price: 1450000, quality: 'TB' },
        { name: 'MyKolor', price: 980000, quality: 'TB' },
      ],
    },
    {
      id: 'exterior',
      name: 'Sơn ngoại thất',
      unit: 'thùng 18L',
      brands: [
        { name: 'Dulux', price: 2250000, quality: 'Cao' },
        { name: 'Jotun', price: 2150000, quality: 'Cao' },
        { name: 'Nippon', price: 1850000, quality: 'TB' },
      ],
    },
  ],
  tiles: [
    {
      id: 'floor60',
      name: 'Gạch lát 60x60',
      unit: 'm²',
      brands: [
        { name: 'Viglacera', price: 185000, quality: 'Cao' },
        { name: 'Đồng Tâm', price: 165000, quality: 'Cao' },
        { name: 'Taicera', price: 155000, quality: 'TB' },
        { name: 'Prime', price: 125000, quality: 'TB' },
      ],
    },
    {
      id: 'wall30',
      name: 'Gạch ốp 30x60',
      unit: 'm²',
      brands: [
        { name: 'Viglacera', price: 175000, quality: 'Cao' },
        { name: 'Đồng Tâm', price: 155000, quality: 'Cao' },
        { name: 'Prime', price: 115000, quality: 'TB' },
      ],
    },
  ],
  wood: [
    {
      id: 'plywood',
      name: 'Ván ép 18mm',
      unit: 'tấm 1.2x2.4m',
      brands: [
        { name: 'Sao Việt', price: 450000, quality: 'Cao' },
        { name: 'An Cường', price: 420000, quality: 'Cao' },
        { name: 'Tân Thành', price: 380000, quality: 'TB' },
      ],
    },
    {
      id: 'mdf',
      name: 'MDF 18mm',
      unit: 'tấm 1.2x2.4m',
      brands: [
        { name: 'An Cường', price: 520000, quality: 'Cao' },
        { name: 'Sao Việt', price: 480000, quality: 'Cao' },
        { name: 'Tân Thành', price: 420000, quality: 'TB' },
      ],
    },
  ],
  electrical: [
    {
      id: 'wire2.5',
      name: 'Dây điện 2.5mm²',
      unit: '100m',
      brands: [
        { name: 'Cadivi', price: 850000, quality: 'Cao' },
        { name: 'Daphaco', price: 780000, quality: 'Cao' },
        { name: 'Trần Phú', price: 720000, quality: 'TB' },
      ],
    },
    {
      id: 'outlet',
      name: 'Ổ cắm đôi',
      unit: 'cái',
      brands: [
        { name: 'Panasonic', price: 125000, quality: 'Cao' },
        { name: 'Schneider', price: 115000, quality: 'Cao' },
        { name: 'Sino', price: 55000, quality: 'TB' },
        { name: 'Điện Quang', price: 45000, quality: 'TB' },
      ],
    },
  ],
};

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + 'đ';
};

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'Cao':
      return '#27ae60';
    case 'TB':
      return '#f39c12';
    default:
      return '#95a5a6';
  }
};

export default function PriceCompareScreen() {
  const [selectedCategory, setSelectedCategory] = useState('cement');
  const [quantity, setQuantity] = useState('1');
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const materials = MATERIALS[selectedCategory] || [];

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2196F3" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>📊 So sánh Giá</Text>
            <Text style={styles.headerSubtitle}>So sánh giá vật liệu xây dựng</Text>
          </View>
        </View>

        {/* Category Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catScrollContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catBtn,
                selectedCategory === cat.id && styles.catBtnActive,
              ]}
              onPress={() => {
                setSelectedCategory(cat.id);
                setSelectedMaterial(null);
              }}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.catText,
                  selectedCategory === cat.id && styles.catTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quantity Input */}
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Số lượng cần tính:</Text>
          <View style={styles.quantityInput}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                const q = parseInt(quantity) || 1;
                if (q > 1) setQuantity(String(q - 1));
              }}
            >
              <Ionicons name="remove" size={18} color="#6B7280" />
            </TouchableOpacity>
            <TextInput
              style={styles.qtyValue}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                const q = parseInt(quantity) || 1;
                setQuantity(String(q + 1));
              }}
            >
              <Ionicons name="add" size={18} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Materials List */}
        {materials.map((mat) => (
          <TouchableOpacity
            key={mat.id}
            style={[
              styles.materialCard,
              selectedMaterial === mat.id && styles.materialCardActive,
            ]}
            onPress={() =>
              setSelectedMaterial(selectedMaterial === mat.id ? null : mat.id)
            }
          >
            <View style={styles.materialHeader}>
              <View>
                <Text style={styles.materialName}>{mat.name}</Text>
                <Text style={styles.materialUnit}>Đơn vị: {mat.unit}</Text>
              </View>
              <Ionicons
                name={selectedMaterial === mat.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </View>

            {selectedMaterial === mat.id && (
              <View style={styles.brandsContainer}>
                {mat.brands.map((brand, idx) => {
                  const qty = parseInt(quantity) || 1;
                  const total = brand.price * qty;
                  const lowestPrice = Math.min(...mat.brands.map((b) => b.price));
                  const isLowest = brand.price === lowestPrice;

                  return (
                    <View
                      key={idx}
                      style={[styles.brandRow, isLowest && styles.brandRowLowest]}
                    >
                      <View style={styles.brandInfo}>
                        <Text style={styles.brandName}>{brand.name}</Text>
                        <View
                          style={[
                            styles.qualityBadge,
                            { backgroundColor: getQualityColor(brand.quality) + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.qualityText,
                              { color: getQualityColor(brand.quality) },
                            ]}
                          >
                            {brand.quality}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.priceInfo}>
                        <Text style={styles.unitPrice}>
                          {formatPrice(brand.price)}/{mat.unit}
                        </Text>
                        <Text style={styles.totalPrice}>
                          = {formatPrice(total)}
                        </Text>
                        {isLowest && (
                          <View style={styles.lowestBadge}>
                            <Text style={styles.lowestText}>Rẻ nhất</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Tips */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Lưu ý khi mua vật liệu</Text>
          <Text style={styles.tipText}>
            • Giá có thể thay đổi theo thời điểm và khu vực{'\n'}
            • Mua số lượng lớn thường được chiết khấu 3-5%{'\n'}
            • Kiểm tra tem nhãn, nguồn gốc xuất xứ{'\n'}
            • So sánh tổng chi phí bao gồm phí vận chuyển{'\n'}
            • Chọn nhà cung cấp có chính sách đổi trả rõ ràng
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle" size={16} color="#9CA3AF" />
          <Text style={styles.disclaimerText}>
            Giá tham khảo tại TP.HCM, T12/2024. Liên hệ nhà cung cấp để có giá chính xác.
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
  catScroll: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  catScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  catBtnActive: {
    backgroundColor: '#E3F2FD',
  },
  catEmoji: {
    fontSize: 16,
  },
  catText: {
    fontSize: 13,
    color: '#6B7280',
  },
  catTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    width: 50,
    height: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  materialCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
  },
  materialCardActive: {
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  materialUnit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  brandsContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  brandRowLowest: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  lowestBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  lowestText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  tipCard: {
    margin: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9CA3AF',
    flex: 1,
  },
});
