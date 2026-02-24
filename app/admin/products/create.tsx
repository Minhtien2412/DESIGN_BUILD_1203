/**
 * Create Product Screen
 * Form tạo sản phẩm mới cho category
 */

import { SafeScrollView } from '@/components/ui/safe-area';
import { productService } from '@/services/api/product.service';
import { CreateProductDto } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORIES = [
  { id: 'ELECTRONICS', name: 'Điện tử' },
  { id: 'FASHION', name: 'Thời trang' },
  { id: 'HOME', name: 'Nhà cửa & Đời sống' },
  { id: 'BEAUTY', name: 'Làm đẹp' },
  { id: 'SPORTS', name: 'Thể thao' },
  { id: 'BOOKS', name: 'Sách' },
  { id: 'TOYS', name: 'Đồ chơi' },
  { id: 'FOOD', name: 'Thực phẩm' },
  { id: 'OTHER', name: 'Khác' },
];

export default function CreateProductScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    price: 0,
    category: 'HOME',
    stock: 0,
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }
    if (formData.price <= 0) {
      Alert.alert('Lỗi', 'Giá phải lớn hơn 0');
      return;
    }
    if (formData.stock < 0) {
      Alert.alert('Lỗi', 'Số lượng không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      console.log('[CreateProduct] Submitting:', formData);
      
      await productService.createProduct(formData);
      
      Alert.alert(
        'Thành công',
        'Sản phẩm đã được tạo và đang chờ duyệt',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('[CreateProduct] Error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScrollView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm sản phẩm mới</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Category Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Danh mục <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    formData.category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat.id })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === cat.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Product Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Tên sản phẩm <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Bếp từ Electrolux EHI727BA"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết sản phẩm..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Giá (VNĐ) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.price > 0 ? formData.price.toString() : ''}
              onChangeText={(text) => {
                const price = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                setFormData({ ...formData, price });
              }}
              keyboardType="numeric"
            />
          </View>

          {/* Stock */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Số lượng <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.stock > 0 ? formData.stock.toString() : ''}
              onChangeText={(text) => {
                const stock = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                setFormData({ ...formData, stock });
              }}
              keyboardType="numeric"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#000000',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#0D9488',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
