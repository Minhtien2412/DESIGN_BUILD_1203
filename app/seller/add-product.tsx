/**
 * Add Product Screen - Create new products/services
 * Màn hình thêm sản phẩm/dịch vụ mới
 */

import { ProtectedScreen } from '@/components/auth/ProtectedScreen';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORIES = [
  { id: 'vat-lieu', label: 'Vật liệu xây dựng', icon: 'hammer' },
  { id: 'thiet-bi', label: 'Thiết bị điện', icon: 'flash' },
  { id: 'noi-that', label: 'Nội thất', icon: 'bed' },
  { id: 'cay-canh', label: 'Cây cảnh', icon: 'leaf' },
  { id: 'dich-vu', label: 'Dịch vụ', icon: 'construct' },
  { id: 'khac', label: 'Khác', icon: 'apps' },
];

const UNITS = ['cái', 'bộ', 'kg', 'm', 'm²', 'm³', 'tấn', 'thùng', 'gói'];

export default function AddProductScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('vat-lieu');
  const [unit, setUnit] = useState('cái');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState(''); // Temporary for adding image URLs
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
      return false;
    }
    if (!stock || parseInt(stock) < 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 hình ảnh');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await apiFetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          unit,
          stock: parseInt(stock),
          images,
        }),
      });

      Alert.alert('Thành công', 'Đã thêm sản phẩm mới', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('[AddProduct] Submit error:', error);
      Alert.alert('Lỗi', error.detail || 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập URL hình ảnh');
      return;
    }
    setImages(prev => [...prev, imageUrl.trim()]);
    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ProtectedScreen requireAuth={true} requirePermissions={['product.create']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm sản phẩm mới</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Product Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Tên sản phẩm *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Xi măng Holcim PCB40"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết sản phẩm..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Price & Unit */}
          <View style={styles.row}>
            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.label}>Giá (VNĐ) *</Text>
              <TextInput
                style={styles.input}
                placeholder="100000"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.label}>Đơn vị</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {UNITS.map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, unit === u && styles.unitChipActive]}
                      onPress={() => setUnit(u)}
                    >
                      <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Stock */}
          <View style={styles.section}>
            <Text style={styles.label}>Số lượng trong kho *</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Danh mục</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    category === cat.id && styles.categoryCardActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={24}
                    color={category === cat.id ? '#0066CC' : '#999'}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat.id && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.label}>Hình ảnh * (tối thiểu 1)</Text>
            
            {/* Add Image URL */}
            <View style={styles.imageInputRow}>
              <TextInput
                style={[styles.input, styles.imageInput]}
                placeholder="Nhập URL hình ảnh (http://...)"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                <Ionicons name="add-circle" size={28} color="#0066CC" />
              </TouchableOpacity>
            </View>

            {/* Image Preview */}
            {images.length > 0 && (
              <View style={styles.imageGrid}>
                {images.map((img, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri: img }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#000000" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.hint}>
              💡 Tip: Sử dụng dịch vụ như Imgur, Cloudinary hoặc upload lên server
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.submitBtnText}>
              {submitting ? 'Đang xử lý...' : 'Thêm sản phẩm'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#0066CC',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  pickerContainer: {
    height: 44,
  },
  unitChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  unitChipActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  unitTextActive: {
    color: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryCardActive: {
    borderColor: '#0066CC',
    borderWidth: 2,
    backgroundColor: '#0066CC10',
  },
  categoryLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#0066CC',
    fontWeight: '700',
  },
  imageInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  imageInput: {
    flex: 1,
  },
  addImageBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#0066CC',
    borderRadius: 12,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
