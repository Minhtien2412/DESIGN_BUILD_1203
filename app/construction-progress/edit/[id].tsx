/**
 * Construction Progress - Edit Project
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_PROJECT = {
  id: '1',
  projectName: 'Xây nhà 3 tầng',
  clientName: 'Nguyễn Văn A',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  startDate: '2024-01-15',
  estimatedEndDate: '2024-06-15',
  description: 'Xây dựng nhà ở 3 tầng với diện tích 100m2',
  budget: '1500000000',
  status: 'in_progress',
};

export default function EditProjectScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    address: '',
    startDate: '',
    estimatedEndDate: '',
    description: '',
    budget: '',
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFormData({
        projectName: MOCK_PROJECT.projectName,
        clientName: MOCK_PROJECT.clientName,
        address: MOCK_PROJECT.address,
        startDate: MOCK_PROJECT.startDate,
        estimatedEndDate: MOCK_PROJECT.estimatedEndDate,
        description: MOCK_PROJECT.description,
        budget: MOCK_PROJECT.budget,
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSubmit = () => {
    if (!formData.projectName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên dự án');
      return;
    }
    Alert.alert('Thành công', 'Đã cập nhật dự án', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa dự án này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Đã xóa', 'Dự án đã được xóa', [
              { text: 'OK', onPress: () => router.replace('/construction-progress') }
            ]);
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EE4D2D" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa dự án</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên dự án *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên dự án"
            value={formData.projectName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, projectName: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên khách hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên khách hàng"
            value={formData.clientName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, clientName: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ công trình"
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={formData.startDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Ngày kết thúc (dự kiến)</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={formData.estimatedEndDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedEndDate: text }))}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngân sách</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập ngân sách dự kiến"
            value={formData.budget}
            onChangeText={(text) => setFormData(prev => ({ ...prev, budget: text }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết về dự án..."
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>Cập nhật dự án</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Vùng nguy hiểm</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Xóa dự án</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#666' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  saveBtn: {
    backgroundColor: '#EE4D2D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  content: { flex: 1, padding: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  submitBtn: {
    backgroundColor: '#EE4D2D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dangerZone: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#fee2e2',
  },
  dangerTitle: { fontSize: 14, fontWeight: '600', color: '#ef4444', marginBottom: 12 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 8,
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#ef4444' },
});
