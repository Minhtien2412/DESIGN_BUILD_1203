import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreateProcurementScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    estimatedBudget: '',
    items: [] as { name: string; quantity: string; unit: string; estimatedPrice: string }[],
  });

  const categories = [
    'Vật liệu xây dựng',
    'Thiết bị điện',
    'Thiết bị nước',
    'Nội thất',
    'PCCC',
    'Thiết bị cơ khí',
    'Dịch vụ',
    'Khác',
  ];

  const priorities = [
    { key: 'low', label: 'Thấp', color: '#94A3B8' },
    { key: 'medium', label: 'Trung bình', color: '#14B8A6' },
    { key: 'high', label: 'Cao', color: '#000000' },
    { key: 'urgent', label: 'Khẩn cấp', color: '#000000' },
  ];

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: '', unit: 'cái', estimatedPrice: '' }],
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề yêu cầu');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Thành công', 'Yêu cầu mua hàng đã được tạo', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo yêu cầu mua hàng</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiêu đề *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề yêu cầu"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chi tiết yêu cầu mua hàng"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Danh mục</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        formData.category === cat && styles.chipActive,
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.category === cat && styles.chipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Priority & Due Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Độ ưu tiên & Thời hạn</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Độ ưu tiên</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[
                      styles.priorityButton,
                      formData.priority === p.key && { borderColor: p.color, backgroundColor: `${p.color}10` },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, priority: p.key }))}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                    <Text style={[styles.priorityText, formData.priority === p.key && { color: p.color }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày cần</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={formData.dueDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, dueDate: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngân sách ước tính</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.estimatedBudget}
                onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedBudget: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách hàng hóa</Text>
              <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                <Ionicons name="add" size={20} color={Colors.light.primary} />
                <Text style={styles.addItemText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {formData.items.length === 0 ? (
              <View style={styles.emptyItems}>
                <Ionicons name="cube-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyText}>Chưa có mục nào</Text>
                <TouchableOpacity style={styles.addFirstItem} onPress={addItem}>
                  <Text style={styles.addFirstItemText}>+ Thêm mục đầu tiên</Text>
                </TouchableOpacity>
              </View>
            ) : (
              formData.items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemNumber}>Mục #{index + 1}</Text>
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Ionicons name="trash-outline" size={20} color="#000000" />
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    style={styles.itemInput}
                    placeholder="Tên hàng hóa"
                    value={item.name}
                    onChangeText={(text) => updateItem(index, 'name', text)}
                  />
                  
                  <View style={styles.itemRow}>
                    <TextInput
                      style={[styles.itemInput, { flex: 1 }]}
                      placeholder="Số lượng"
                      value={item.quantity}
                      onChangeText={(text) => updateItem(index, 'quantity', text)}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.itemInput, { flex: 1 }]}
                      placeholder="Đơn vị"
                      value={item.unit}
                      onChangeText={(text) => updateItem(index, 'unit', text)}
                    />
                    <TextInput
                      style={[styles.itemInput, { flex: 1.5 }]}
                      placeholder="Đơn giá ước tính"
                      value={item.estimatedPrice}
                      onChangeText={(text) => updateItem(index, 'estimatedPrice', text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 13,
    color: '#666',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  addFirstItem: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: `${Colors.light.primary}10`,
  },
  addFirstItemText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  itemInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
