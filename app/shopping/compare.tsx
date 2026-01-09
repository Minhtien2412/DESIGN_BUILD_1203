import { Container } from '@/components/ui/container';
import { useCompare } from '@/context/CompareContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CompareScreen() {
  const router = useRouter();
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  const handleClearAll = () => {
    Alert.alert(
      'Xóa tất cả',
      'Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách so sánh?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: clearCompare },
      ]
    );
  };

  const specs = [
    { key: 'price', label: 'Giá' },
    { key: 'brand', label: 'Thương hiệu' },
    { key: 'origin', label: 'Xuất xứ' },
    { key: 'warranty', label: 'Bảo hành' },
    { key: 'material', label: 'Chất liệu' },
    { key: 'size', label: 'Kích thước' },
    { key: 'weight', label: 'Khối lượng' },
    { key: 'color', label: 'Màu sắc' },
  ];

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="git-compare-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có sản phẩm để so sánh</Text>
      <Text style={styles.emptySubtext}>
        Thêm sản phẩm vào danh sách so sánh để xem chi tiết
      </Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Quay lại mua sắm</Text>
      </TouchableOpacity>
    </View>
  );

  if (compareItems.length === 0) {
    return (
      <Container style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>So sánh sản phẩm</Text>
          <View style={{ width: 40 }} />
        </View>
        {renderEmpty()}
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>So sánh ({compareItems.length})</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearBtn}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {/* Product Images Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Sản phẩm</Text>
            </View>
            {compareItems.map(item => (
              <View key={item.id} style={styles.productCell}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeFromCompare(item.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Specs Rows */}
          {specs.map(spec => (
            <View key={spec.key} style={styles.row}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText}>{spec.label}</Text>
              </View>
              {compareItems.map(item => (
                <View key={item.id} style={styles.valueCell}>
                  <Text style={styles.valueText}>
                    {spec.key === 'price'
                      ? `${item.price.toLocaleString('vi-VN')} ₫`
                      : item.specs?.[spec.key] || '-'}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {/* Action Buttons Row */}
          <View style={styles.row}>
            <View style={styles.labelCell} />
            {compareItems.map(item => (
              <View key={item.id} style={styles.actionCell}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => router.push(`/product/${item.id}` as any)}
                >
                  <Text style={styles.viewBtnText}>Xem chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addCartBtn}>
                  <Text style={styles.addCartBtnText}>Thêm giỏ hàng</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  clearBtn: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  tableContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  labelCell: {
    width: 120,
    padding: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productCell: {
    width: 180,
    padding: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    position: 'relative',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    minHeight: 40,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  valueCell: {
    width: 180,
    padding: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  valueText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  actionCell: {
    width: 180,
    padding: 16,
    gap: 8,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  viewBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  viewBtnText: {
    color: '#0066CC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  addCartBtn: {
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    borderRadius: 8,
  },
  addCartBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: '#0066CC',
    fontSize: 15,
    fontWeight: '600',
  },
});
