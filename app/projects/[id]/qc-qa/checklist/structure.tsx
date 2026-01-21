import { useChecklists } from '@/hooks/useQC';
import { ChecklistItem, ChecklistType, InspectionStatus } from '@/types/qc-qa';
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

// Structural inspection checklist template
const STRUCTURE_ITEMS: Omit<ChecklistItem, 'id'>[] = [
  // Cột (Columns) - 5 items
  {
    checklistId: 'structure-checklist',
    category: 'Cột (Columns)',
    description: 'Kiểm tra kích thước tiết diện cột',
    specification: 'Theo thiết kế, sai số ±10mm chiều dài, ±5mm chiều rộng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 1,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Cột (Columns)',
    description: 'Kiểm tra cốt thép cột (đường kính, số lượng)',
    specification: 'Theo bản vẽ kết cấu, sai số đường kính ±5%, đầy đủ số lượng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 2,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Cột (Columns)',
    description: 'Kiểm tra khoảng cách đai cột',
    specification: 'Đai mã: ≤200mm, đai thường: ≤300mm, sai số ±20mm',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 3,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Cột (Columns)',
    description: 'Kiểm tra độ vuông góc cột',
    specification: 'Sai lệch ≤10mm/3m chiều cao, tối đa 30mm toàn bộ chiều cao',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 4,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Cột (Columns)',
    description: 'Kiểm tra vị trí cột (tâm, độ lệch)',
    specification: 'Sai lệch tâm cột ≤20mm so với mốc định vị',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 5,
  },

  // Dầm (Beams) - 5 items
  {
    checklistId: 'structure-checklist',
    category: 'Dầm (Beams)',
    description: 'Kiểm tra kích thước tiết diện dầm',
    specification: 'Theo thiết kế, sai số ±10mm chiều cao, ±5mm chiều rộng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 6,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Dầm (Beams)',
    description: 'Kiểm tra cốt thép dầm (chủ, đai)',
    specification: 'Thép chủ: theo bản vẽ, lớp bảo vệ 25-30mm. Đai: khoảng cách ≤300mm',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 7,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Dầm (Beams)',
    description: 'Kiểm tra mối nối thép dầm',
    specification: 'Chiều dài mối nối ≥40d, vị trí mối nối cách mặt gối ≥L/4',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 8,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Dầm (Beams)',
    description: 'Kiểm tra ván khuôn dầm (độ phẳng, kín khít)',
    specification: 'Không có khe hở >2mm, ván phẳng, chống đỡ vững chắc',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 9,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Dầm (Beams)',
    description: 'Kiểm tra độ cao dầm so với mốc cao độ',
    specification: 'Sai số ±10mm so với cao độ thiết kế',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 10,
  },

  // Sàn (Slabs) - 5 items
  {
    checklistId: 'structure-checklist',
    category: 'Sàn (Slabs)',
    description: 'Kiểm tra chiều dày sàn',
    specification: 'Theo thiết kế (thường 100-150mm), sai số ±5mm',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 11,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Sàn (Slabs)',
    description: 'Kiểm tra cốt thép sàn (lưới thép)',
    specification: 'Khoảng cách thép: theo thiết kế (150-200mm), lớp bảo vệ 15-20mm',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 12,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Sàn (Slabs)',
    description: 'Kiểm tra độ phẳng sàn',
    specification: 'Độ phẳng ≤5mm/2m, độ dốc thoát nước (nếu có) 1-2%',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 13,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Sàn (Slabs)',
    description: 'Kiểm tra ván khuôn sàn',
    specification: 'Ván phẳng, kín khít, chống đỡ đủ khả năng chịu tải, bước chống ≤1.2m',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 14,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Sàn (Slabs)',
    description: 'Kiểm tra bê tông sàn (trước đổ)',
    specification: 'Bề mặt ván sạch, không có mảnh vụn. Thép đúng vị trí, không bị dịch chuyển',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 15,
  },

  // Mối nối kết cấu (Connections) - 4 items
  {
    checklistId: 'structure-checklist',
    category: 'Mối nối kết cấu (Connections)',
    description: 'Kiểm tra mối nối cột-móng',
    specification: 'Thép cột chôn vào móng ≥300mm, thẳng đứng, đúng vị trí',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 16,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Mối nối kết cấu (Connections)',
    description: 'Kiểm tra mối nối cột-dầm',
    specification: 'Thép dầm neo vào cột đủ chiều dài, đai mã đúng kích thước và số lượng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 17,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Mối nối kết cấu (Connections)',
    description: 'Kiểm tra mối nối dầm-sàn',
    specification: 'Thép sàn liên kết với dầm, chiều dài neo ≥25d',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 18,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Mối nối kết cấu (Connections)',
    description: 'Kiểm tra hàn thép (nếu có)',
    specification: 'Mối hàn liên tục, không có khuyết tật (nứt, lỗ rỗng), chiều dài hàn ≥5d',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 19,
  },

  // Bê tông kết cấu (Structural Concrete) - 3 items
  {
    checklistId: 'structure-checklist',
    category: 'Bê tông kết cấu (Structural Concrete)',
    description: 'Kiểm tra mác bê tông kết cấu',
    specification: 'B20-B30 theo thiết kế, có chứng nhận chất lượng nhà máy',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 20,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Bê tông kết cấu (Structural Concrete)',
    description: 'Kiểm tra quá trình đổ bê tông kết cấu',
    specification: 'Đổ liên tục, không gián đoạn >30 phút, đầm kỹ, không phân tầng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 21,
  },
  {
    checklistId: 'structure-checklist',
    category: 'Bê tông kết cấu (Structural Concrete)',
    description: 'Kiểm tra bảo dưỡng bê tông kết cấu',
    specification: 'Tưới nước ≥7 ngày, 2 lần/ngày, che phủ tránh nắng mưa',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 22,
  },
];

export default function StructureChecklistScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { createChecklist } = useChecklists();
  const [items, setItems] = useState<Omit<ChecklistItem, 'id'>[]>(STRUCTURE_ITEMS);
  const [currentChecklistId, setCurrentChecklistId] = useState<string | null>(null);

  // Handle status change for an item
  const handleStatusChange = (index: number, status: InspectionStatus) => {
    const updatedItems = [...items];
    updatedItems[index].status = status;
    setItems(updatedItems);
  };

  // Handle notes change for an item
  const handleNotesChange = (index: number, notes: string) => {
    const updatedItems = [...items];
    updatedItems[index].notes = notes;
    setItems(updatedItems);
  };

  // Handle photo add (placeholder - will be implemented in Task #44)
  const handlePhotoAdd = (index: number) => {
    Alert.alert(
      'Tính năng Upload Ảnh',
      'Tính năng upload ảnh sẽ được tích hợp trong Task #44 (File Upload - Upload Components)',
      [
        {
          text: 'OK',
          onPress: () => {
            // Demo: Add a placeholder photo URL
            const updatedItems = [...items];
            updatedItems[index].photos.push(
              `https://picsum.photos/seed/${Date.now()}/400/300`
            );
            setItems(updatedItems);
          },
        },
      ]
    );
  };

  // Calculate progress
  const totalItems = items.length;
  const passedCount = items.filter((item) => item.status === 'PASS').length;
  const failedCount = items.filter((item) => item.status === 'FAIL').length;
  const naCount = items.filter((item) => item.status === 'NA').length;
  const completedCount = passedCount + failedCount + naCount;
  const progressPercentage = (completedCount / totalItems) * 100;

  // Save draft
  const handleSaveDraft = async () => {
    try {
      const checklist = await createChecklist({
        projectId: projectId!,
        type: ChecklistType.STRUCTURE,
        title: 'Checklist Kiểm Tra Kết Cấu',
        items: items.map((item, index) => ({
          ...item,
          id: `temp-${index}`,
        })),
      });
      if (checklist) {
        setCurrentChecklistId(checklist.id);
      }
      Alert.alert('Đã lưu nháp', 'Checklist đã được lưu thành công');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu checklist');
      console.error('Save draft error:', error);
    }
  };

  // Submit checklist
  const handleSubmit = async () => {
    // Check if all items are completed
    if (completedCount < totalItems) {
      Alert.alert(
        'Chưa hoàn thành',
        `Bạn đã kiểm tra ${completedCount}/${totalItems} hạng mục. Bạn có muốn tiếp tục gửi?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Gửi', onPress: submitChecklist },
        ]
      );
    } else {
      submitChecklist();
    }
  };

  const submitChecklist = async () => {
    try {
      const checklist = await createChecklist({
        projectId: projectId!,
        type: ChecklistType.STRUCTURE,
        title: 'Checklist Kiểm Tra Kết Cấu',
        items: items.map((item, index) => ({
          ...item,
          id: `temp-${index}`,
        })),
      });
      Alert.alert('Đã gửi', 'Checklist đã được gửi để phê duyệt', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi checklist');
      console.error('Submit error:', error);
    }
  };

  // Group items by category
  const groupedItems = items.reduce(
    (acc, item, index) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push({ ...item, index });
      return acc;
    },
    {} as Record<string, (typeof items[0] & { index: number })[]>
  );

  const getStatusColor = (status: InspectionStatus) => {
    switch (status) {
      case 'PASS':
        return '#0066CC';
      case 'FAIL':
        return '#000000';
      case 'NA':
        return '#999999';
      default:
        return '#0066CC';
    }
  };

  const getStatusIcon = (status: InspectionStatus) => {
    switch (status) {
      case 'PASS':
        return 'checkmark-circle';
      case 'FAIL':
        return 'close-circle';
      case 'NA':
        return 'remove-circle';
      default:
        return 'time';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Progress Dashboard */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Tiến độ kiểm tra</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalItems} hạng mục ({progressPercentage.toFixed(0)}%)
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#0066CC' }]} />
              <Text style={styles.statText}>Đạt: {passedCount}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#000000' }]} />
              <Text style={styles.statText}>Không đạt: {failedCount}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#999999' }]} />
              <Text style={styles.statText}>N/A: {naCount}</Text>
            </View>
          </View>
        </View>

        {/* Checklist Items by Category */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryHeader}>{category}</Text>
            {categoryItems.map((item) => (
              <View key={item.index} style={styles.itemCard}>
                {/* Item Description */}
                <View style={styles.itemHeader}>
                  <Ionicons
                    name={getStatusIcon(item.status)}
                    size={24}
                    color={getStatusColor(item.status)}
                  />
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>

                {/* Specification */}
                <View style={styles.specBox}>
                  <Ionicons name="information-circle" size={16} color="#0066CC" />
                  <Text style={styles.specText}>{item.specification}</Text>
                </View>

                {/* Status Selection */}
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === 'PASS' && styles.statusButtonActive,
                      { borderColor: '#0066CC' },
                    ]}
                    onPress={() => handleStatusChange(item.index, InspectionStatus.PASS)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === 'PASS' && { color: '#0066CC' },
                      ]}
                    >
                      Đạt
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === 'FAIL' && styles.statusButtonActive,
                      { borderColor: '#000000' },
                    ]}
                    onPress={() => handleStatusChange(item.index, InspectionStatus.FAIL)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === 'FAIL' && { color: '#000000' },
                      ]}
                    >
                      Không đạt
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === 'NA' && styles.statusButtonActive,
                      { borderColor: '#999999' },
                    ]}
                    onPress={() => handleStatusChange(item.index, InspectionStatus.NA)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === 'NA' && { color: '#999999' },
                      ]}
                    >
                      N/A
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Photos */}
                <View style={styles.photosSection}>
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={() => handlePhotoAdd(item.index)}
                  >
                    <Ionicons name="camera" size={20} color="#0066CC" />
                    <Text style={styles.addPhotoText}>
                      Thêm ảnh ({item.photos.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Notes */}
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ghi chú..."
                  value={item.notes}
                  onChangeText={(text) => handleNotesChange(item.index, text)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
          <Text style={styles.draftButtonText}>Lưu nháp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Gửi kiểm tra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  progressCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066CC',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
  statText: {
    fontSize: 14,
    color: '#666',
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemDescription: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  specBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  specText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#F5F5F5',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  photosSection: {
    marginBottom: 12,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 14,
    color: '#0066CC',
    marginLeft: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  draftButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#0066CC',
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
