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

export default function CreateChangeRequestScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    type: 'scope',
    priority: 'medium',
    reason: '',
    impactCost: '',
    impactSchedule: '',
    affectedAreas: [] as string[],
    requestedBy: '',
    approvers: [] as string[],
  });

  const changeTypes = [
    { key: 'scope', label: 'Phạm vi công việc', icon: 'layers' },
    { key: 'schedule', label: 'Tiến độ', icon: 'calendar' },
    { key: 'cost', label: 'Chi phí', icon: 'cash' },
    { key: 'design', label: 'Thiết kế', icon: 'brush' },
    { key: 'material', label: 'Vật liệu', icon: 'cube' },
    { key: 'other', label: 'Khác', icon: 'ellipsis-horizontal' },
  ];

  const priorities = [
    { key: 'low', label: 'Thấp', color: '#94A3B8' },
    { key: 'medium', label: 'Trung bình', color: '#0080FF' },
    { key: 'high', label: 'Cao', color: '#000000' },
    { key: 'critical', label: 'Nghiêm trọng', color: '#000000' },
  ];

  const affectedAreaOptions = [
    'Thiết kế kiến trúc',
    'Thiết kế kết cấu',
    'Hệ thống điện',
    'Hệ thống nước',
    'PCCC',
    'Hoàn thiện nội thất',
    'Ngoại thất',
    'Móng',
    'Khung sườn',
  ];

  const toggleAffectedArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      affectedAreas: prev.affectedAreas.includes(area)
        ? prev.affectedAreas.filter(a => a !== area)
        : [...prev.affectedAreas, area],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề yêu cầu thay đổi');
      return;
    }

    if (!formData.reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do thay đổi');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Thành công', 'Yêu cầu thay đổi đã được tạo và gửi phê duyệt', [
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
          <Text style={styles.headerTitle}>Tạo yêu cầu thay đổi</Text>
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
                placeholder="Nhập tiêu đề yêu cầu thay đổi"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả chi tiết</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chi tiết nội dung thay đổi"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Change Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại thay đổi</Text>
            <View style={styles.typeGrid}>
              {changeTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeCard,
                    formData.type === type.key && styles.typeCardActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: type.key }))}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={formData.type === type.key ? Colors.light.primary : '#94A3B8'}
                  />
                  <Text style={[
                    styles.typeLabel,
                    formData.type === type.key && styles.typeLabelActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mức độ ưu tiên</Text>
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

          {/* Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lý do thay đổi *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Giải thích lý do cần thay đổi..."
              value={formData.reason}
              onChangeText={(text) => setFormData(prev => ({ ...prev, reason: text }))}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Impact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tác động dự kiến</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tác động chi phí</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Tăng 50.000.000 VNĐ"
                value={formData.impactCost}
                onChangeText={(text) => setFormData(prev => ({ ...prev, impactCost: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tác động tiến độ</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Kéo dài thêm 5 ngày"
                value={formData.impactSchedule}
                onChangeText={(text) => setFormData(prev => ({ ...prev, impactSchedule: text }))}
              />
            </View>
          </View>

          {/* Affected Areas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khu vực bị ảnh hưởng</Text>
            <View style={styles.chipContainer}>
              {affectedAreaOptions.map((area) => (
                <TouchableOpacity
                  key={area}
                  style={[
                    styles.chip,
                    formData.affectedAreas.includes(area) && styles.chipActive,
                  ]}
                  onPress={() => toggleAffectedArea(area)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.affectedAreas.includes(area) && styles.chipTextActive,
                  ]}>
                    {area}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                <Ionicons name="paper-plane" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Gửi yêu cầu phê duyệt</Text>
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '31%',
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  typeCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}08`,
  },
  typeLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  typeLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 6,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
