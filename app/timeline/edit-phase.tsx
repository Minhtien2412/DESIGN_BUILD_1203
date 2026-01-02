/**
 * Timeline - Edit Phase
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

const MOCK_PHASE = {
  id: '1',
  name: 'Giai đoạn 1: Thiết kế',
  description: 'Hoàn thành toàn bộ hồ sơ thiết kế bao gồm kiến trúc, kết cấu và MEP',
  startDate: '2024-01-01',
  endDate: '2024-02-15',
  color: '#EE4D2D',
};

export default function EditPhaseScreen() {
  const router = useRouter();
  const { phaseId, projectId } = useLocalSearchParams<{ phaseId: string; projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFormData({
        name: MOCK_PHASE.name,
        description: MOCK_PHASE.description,
        startDate: MOCK_PHASE.startDate,
        endDate: MOCK_PHASE.endDate,
      });
      setLoading(false);
    }, 500);
  }, [phaseId]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên giai đoạn');
      return;
    }
    Alert.alert('Thành công', 'Đã cập nhật giai đoạn', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa giai đoạn này? Tất cả công việc trong giai đoạn cũng sẽ bị xóa.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Đã xóa', 'Giai đoạn đã được xóa', [
              { text: 'OK', onPress: () => router.back() }
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
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa giai đoạn</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên giai đoạn *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên giai đoạn"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả về giai đoạn này..."
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.startDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Ngày kết thúc</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.endDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, endDate: text }))}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>Cập nhật giai đoạn</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Vùng nguy hiểm</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Xóa giai đoạn</Text>
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
