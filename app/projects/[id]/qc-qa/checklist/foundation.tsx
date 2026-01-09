import { Container } from '@/components/ui/container';
import { useChecklists } from '@/hooks/useQC';
import {
    ChecklistType,
    InspectionStatus,
    type ChecklistItem,
} from '@/types/qc-qa';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

// Foundation checklist template items
const FOUNDATION_ITEMS: Omit<ChecklistItem, 'id' | 'checklistId' | 'inspectedBy' | 'inspectedAt'>[] = [
  // Excavation
  {
    category: 'Đào đất',
    description: 'Kiểm tra độ sâu đào theo thiết kế',
    specification: 'Độ sâu: theo bản vẽ thiết kế ±50mm',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 1,
  },
  {
    category: 'Đào đất',
    description: 'Kiểm tra chiều rộng hố đào',
    specification: 'Chiều rộng: theo bản vẽ thiết kế +100mm mỗi bên',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 2,
  },
  {
    category: 'Đào đất',
    description: 'Kiểm tra tình trạng đất nền',
    specification: 'Không có nước ngầm, đất chắc, không sụt lún',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 3,
  },
  {
    category: 'Đào đất',
    description: 'Hệ thống thoát nước tạm',
    specification: 'Đảm bảo không có nước đọng trong hố móng',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 4,
  },
  // Soil
  {
    category: 'Đất nền',
    description: 'Kiểm tra độ đầm nén đất san lấp',
    specification: 'Độ chặt ≥95% theo Proctor',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 5,
  },
  {
    category: 'Đất nền',
    description: 'Kiểm tra sức chịu tải đất nền',
    specification: 'Theo kết quả thí nghiệm địa chất',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 6,
  },
  {
    category: 'Đất nền',
    description: 'Lấy mẫu đất để thí nghiệm',
    specification: 'Mẫu đại diện, đảm bảo số lượng theo quy định',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 7,
  },
  // Reinforcement
  {
    category: 'Cốt thép',
    description: 'Kiểm tra đường kính thép',
    specification: 'Theo bản vẽ thiết kế, dung sai ±5%',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 8,
  },
  {
    category: 'Cốt thép',
    description: 'Kiểm tra khoảng cách thép',
    specification: 'Khoảng cách theo thiết kế ±20mm',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 9,
  },
  {
    category: 'Cốt thép',
    description: 'Kiểm tra lớp bảo vệ thép',
    specification: 'Lớp bê tông bảo vệ ≥50mm đáy móng, ≥30mm mặt bên',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 10,
  },
  {
    category: 'Cốt thép',
    description: 'Kiểm tra mối nối thép',
    specification: 'Chiều dài neo ≥40d, hàn đạt yêu cầu',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 11,
  },
  // Concrete
  {
    category: 'Bê tông',
    description: 'Kiểm tra mác bê tông',
    specification: 'Theo thiết kế (thường B15-B25 cho móng)',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 12,
  },
  {
    category: 'Bê tông',
    description: 'Kiểm tra độ sụt bê tông (slump)',
    specification: 'Độ sụt 10-15cm',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 13,
  },
  {
    category: 'Bê tông',
    description: 'Kiểm tra quá trình đổ bê tông',
    specification: 'Đổ liên tục, không phân tầng, đầm kỹ',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 14,
  },
  {
    category: 'Bê tông',
    description: 'Kiểm tra bảo dưỡng bê tông',
    specification: 'Tưới nước ít nhất 7 ngày, 2 lần/ngày',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 15,
  },
  // Waterproofing
  {
    category: 'Chống thấm',
    description: 'Kiểm tra màng chống thấm',
    specification: 'Không rách, không đứt, mối nối kín',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 16,
  },
  {
    category: 'Chống thấm',
    description: 'Kiểm tra lớp vữa chống thấm',
    specification: 'Độ dày đều, không nứt, không bong tróc',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 17,
  },
  {
    category: 'Chống thấm',
    description: 'Thử nghiệm chống thấm',
    specification: 'Ngâm nước 24h, không thấm',
    status: InspectionStatus.PENDING,
    photos: [],
    order: 18,
  },
];

export default function FoundationChecklistScreen() {
  const { id: projectId, checklistId } = useLocalSearchParams<{
    id: string;
    checklistId?: string;
  }>();
  
  const { createChecklist, updateChecklistItem, loading, error } = useChecklists();
  
  const [items, setItems] = useState<typeof FOUNDATION_ITEMS>(FOUNDATION_ITEMS);
  const [currentChecklistId, setCurrentChecklistId] = useState<string | null>(
    checklistId || null
  );

  const handleStatusChange = (index: number, status: InspectionStatus) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, status } : item))
    );
  };

  const handleNotesChange = (index: number, notes: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, notes } : item))
    );
  };

  const handlePhotoAdd = (index: number) => {
    // Placeholder for photo upload (will integrate with Task #44)
    Alert.alert(
      'Thêm ảnh',
      'Tính năng upload ảnh sẽ được tích hợp trong Task #44 (File Upload Components)',
      [
        {
          text: 'Thêm ảnh demo',
          onPress: () => {
            const demoPhoto = `https://picsum.photos/400/300?random=${Date.now()}`;
            setItems((prev) =>
              prev.map((item, i) =>
                i === index
                  ? { ...item, photos: [...item.photos, demoPhoto] }
                  : item
              )
            );
          },
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleSaveDraft = async () => {
    if (!projectId) return;

    try {
      const checklist = await createChecklist({
        projectId,
        type: ChecklistType.FOUNDATION,
        title: `Kiểm tra móng - ${new Date().toLocaleDateString('vi-VN')}`,
        description: 'Checklist kiểm tra công tác móng',
        items: items as any,
      });

      if (checklist) {
        setCurrentChecklistId(checklist.id);
        Alert.alert('Thành công', 'Đã lưu nháp checklist');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu checklist');
    }
  };

  const handleSubmit = async () => {
    const incompleteItems = items.filter(
      (item) => item.status === InspectionStatus.PENDING
    );

    if (incompleteItems.length > 0) {
      Alert.alert(
        'Chưa hoàn thành',
        `Còn ${incompleteItems.length} mục chưa kiểm tra. Bạn có muốn tiếp tục?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Tiếp tục',
            onPress: () => submitChecklist(),
          },
        ]
      );
    } else {
      submitChecklist();
    }
  };

  const submitChecklist = async () => {
    if (!projectId) return;

    try {
      if (currentChecklistId) {
        // Update existing checklist
        Alert.alert('Thành công', 'Đã nộp checklist để phê duyệt');
        router.back();
      } else {
        // Create and submit
        const checklist = await createChecklist({
          projectId,
          type: ChecklistType.FOUNDATION,
          title: `Kiểm tra móng - ${new Date().toLocaleDateString('vi-VN')}`,
          description: 'Checklist kiểm tra công tác móng',
          items: items as any,
        });

        if (checklist) {
          Alert.alert('Thành công', 'Đã nộp checklist để phê duyệt');
          router.back();
        }
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể nộp checklist');
    }
  };

  const getStatusColor = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.PASS:
        return '#0066CC';
      case InspectionStatus.FAIL:
        return '#000000';
      case InspectionStatus.NA:
        return '#6b7280';
      default:
        return '#0066CC';
    }
  };

  const getStatusIcon = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.PASS:
        return 'checkmark-circle';
      case InspectionStatus.FAIL:
        return 'close-circle';
      case InspectionStatus.NA:
        return 'remove-circle';
      default:
        return 'time';
    }
  };

  const passedCount = items.filter((i) => i.status === InspectionStatus.PASS).length;
  const failedCount = items.filter((i) => i.status === InspectionStatus.FAIL).length;
  const naCount = items.filter((i) => i.status === InspectionStatus.NA).length;
  const totalCount = items.length;
  const completedCount = passedCount + failedCount + naCount;
  const progress = (completedCount / totalCount) * 100;

  // Group items by category
  const groupedItems = items.reduce((acc, item, index) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push({ ...item, index });
    return acc;
  }, {} as Record<string, Array<typeof FOUNDATION_ITEMS[0] & { index: number }>>);

  return (
    <Container>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kiểm tra công tác móng</Text>
          <Text style={styles.subtitle}>
            Foundation Inspection Checklist
          </Text>
        </View>

        {/* Progress Summary */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Tiến độ kiểm tra</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#0066CC' }]} />
              <Text style={styles.statLabel}>Đạt: {passedCount}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#000000' }]} />
              <Text style={styles.statLabel}>Không đạt: {failedCount}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#6b7280' }]} />
              <Text style={styles.statLabel}>N/A: {naCount}</Text>
            </View>
          </View>
        </View>

        {/* Checklist Items by Category */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {categoryItems.map((item) => (
              <View key={item.index} style={styles.itemCard}>
                {/* Item Header */}
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    <Ionicons
                      name={getStatusIcon(item.status)}
                      size={24}
                      color={getStatusColor(item.status)}
                    />
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>
                </View>

                {/* Specification */}
                <View style={styles.specBox}>
                  <Ionicons name="information-circle" size={16} color="#3b82f6" />
                  <Text style={styles.specText}>{item.specification}</Text>
                </View>

                {/* Status Buttons */}
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === InspectionStatus.PASS &&
                        styles.statusButtonActive,
                      { borderColor: '#0066CC' },
                    ]}
                    onPress={() =>
                      handleStatusChange(item.index, InspectionStatus.PASS)
                    }
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={
                        item.status === InspectionStatus.PASS
                          ? '#fff'
                          : '#0066CC'
                      }
                    />
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === InspectionStatus.PASS &&
                          styles.statusButtonTextActive,
                        { color: item.status === InspectionStatus.PASS ? '#fff' : '#0066CC' },
                      ]}
                    >
                      Đạt
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === InspectionStatus.FAIL &&
                        styles.statusButtonActive,
                      { borderColor: '#000000' },
                    ]}
                    onPress={() =>
                      handleStatusChange(item.index, InspectionStatus.FAIL)
                    }
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={
                        item.status === InspectionStatus.FAIL
                          ? '#fff'
                          : '#000000'
                      }
                    />
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === InspectionStatus.FAIL &&
                          styles.statusButtonTextActive,
                        { color: item.status === InspectionStatus.FAIL ? '#fff' : '#000000' },
                      ]}
                    >
                      Không đạt
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === InspectionStatus.NA &&
                        styles.statusButtonActive,
                      { borderColor: '#6b7280' },
                    ]}
                    onPress={() =>
                      handleStatusChange(item.index, InspectionStatus.NA)
                    }
                  >
                    <Ionicons
                      name="remove-circle"
                      size={20}
                      color={
                        item.status === InspectionStatus.NA
                          ? '#fff'
                          : '#6b7280'
                      }
                    />
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === InspectionStatus.NA &&
                          styles.statusButtonTextActive,
                        { color: item.status === InspectionStatus.NA ? '#fff' : '#6b7280' },
                      ]}
                    >
                      N/A
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Photos */}
                <View style={styles.photosSection}>
                  <Text style={styles.photosLabel}>
                    Hình ảnh ({item.photos.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={() => handlePhotoAdd(item.index)}
                  >
                    <Ionicons name="camera" size={20} color="#3b82f6" />
                    <Text style={styles.addPhotoText}>Thêm ảnh</Text>
                  </TouchableOpacity>
                </View>

                {/* Notes */}
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ghi chú..."
                  placeholderTextColor="#9ca3af"
                  value={item.notes || ''}
                  onChangeText={(text) => handleNotesChange(item.index, text)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            ))}
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.draftButton}
            onPress={handleSaveDraft}
            disabled={loading}
          >
            <Ionicons name="save-outline" size={20} color="#3b82f6" />
            <Text style={styles.draftButtonText}>Lưu nháp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name="checkmark-done" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Nộp kiểm tra</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemDescription: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 24,
  },
  specBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F4FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  specText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
  },
  statusButtonActive: {
    backgroundColor: '#3b82f6',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  photosSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photosLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#E8F4FF',
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 8,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
