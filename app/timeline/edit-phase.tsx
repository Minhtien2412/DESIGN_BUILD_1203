/**
 * Timeline - Edit Phase
 */
import PhaseService, { MOCK_PHASE } from '@/services/phaseService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FALLBACK_PHASE = MOCK_PHASE;

export default function EditPhaseScreen() {
  const router = useRouter();
  const { phaseId, projectId } = useLocalSearchParams<{ phaseId: string; projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const fetchPhase = useCallback(async () => {
    if (!phaseId) {
      setFormData({
        name: FALLBACK_PHASE.name,
        description: FALLBACK_PHASE.description || '',
        startDate: FALLBACK_PHASE.startDate,
        endDate: FALLBACK_PHASE.endDate,
      });
      setDataSource('mock');
      setLoading(false);
      return;
    }

    try {
      const result = await PhaseService.getPhaseById(phaseId);
      if (result.data) {
        setFormData({
          name: result.data.name,
          description: result.data.description || '',
          startDate: result.data.startDate,
          endDate: result.data.endDate,
        });
        setDataSource('api');
      } else {
        setFormData({
          name: FALLBACK_PHASE.name,
          description: FALLBACK_PHASE.description || '',
          startDate: FALLBACK_PHASE.startDate,
          endDate: FALLBACK_PHASE.endDate,
        });
        setDataSource('mock');
      }
    } catch (error) {
      console.error('Error fetching phase:', error);
      setFormData({
        name: FALLBACK_PHASE.name,
        description: FALLBACK_PHASE.description || '',
        startDate: FALLBACK_PHASE.startDate,
        endDate: FALLBACK_PHASE.endDate,
      });
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  }, [phaseId]);

  useEffect(() => {
    fetchPhase();
  }, [fetchPhase]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên giai đoạn');
      return;
    }

    setSaving(true);
    try {
      if (phaseId && dataSource === 'api') {
        await PhaseService.updatePhase(phaseId, {
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
      }
      Alert.alert('Thành công', 'Đã cập nhật giai đoạn', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating phase:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật giai đoạn. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
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
          onPress: async () => {
            if (!phaseId) {
              Alert.alert('Đã xóa', 'Giai đoạn đã được xóa', [
                { text: 'OK', onPress: () => router.back() }
              ]);
              return;
            }

            setDeleting(true);
            try {
              if (dataSource === 'api') {
                await PhaseService.deletePhase(phaseId);
              }
              Alert.alert('Đã xóa', 'Giai đoạn đã được xóa', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting phase:', error);
              Alert.alert('Lỗi', 'Không thể xóa giai đoạn. Vui lòng thử lại.');
            } finally {
              setDeleting(false);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
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
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Data Source Indicator */}
        {dataSource === 'mock' && (
          <View style={styles.mockBanner}>
            <Ionicons name="information-circle" size={16} color="#92400E" />
            <Text style={styles.mockBannerText}>📋 Dữ liệu mẫu</Text>
          </View>
        )}

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

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Cập nhật giai đoạn</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Vùng nguy hiểm</Text>
          <TouchableOpacity 
            style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]} 
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#000000" />
                <Text style={styles.deleteBtnText}>Xóa giai đoạn</Text>
              </>
            )}
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
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  mockBannerText: { fontSize: 12, color: '#92400E' },
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
    minWidth: 50,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
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
  dangerZone: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#fee2e2',
  },
  dangerTitle: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: 12 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    gap: 8,
  },
  deleteBtnDisabled: { opacity: 0.6 },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#000000' },
});
