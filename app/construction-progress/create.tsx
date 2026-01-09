/**
 * Construction Progress - Create New Project
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateConstructionProgressScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    address: '',
    startDate: '',
    estimatedEndDate: '',
    description: '',
    budget: '',
  });

  const handleSubmit = () => {
    if (!formData.projectName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên dự án');
      return;
    }
    // TODO: Call API to create project
    Alert.alert('Thành công', 'Đã tạo dự án mới', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo dự án mới</Text>
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
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>Tạo dự án</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
    backgroundColor: '#0066CC',
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
    backgroundColor: '#0066CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
