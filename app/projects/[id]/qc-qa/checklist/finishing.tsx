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

// Finishing inspection checklist template
const FINISHING_ITEMS: Omit<ChecklistItem, 'id'>[] = [
  // Tường (Walls) - 5 items
  {
    checklistId: 'finishing-checklist',
    category: 'Tường (Walls)',
    description: 'Kiểm tra bề mặt tường trước khi sơn',
    specification: 'Bề mặt phẳng, không có vết nứt >0.3mm, khô ráo, sạch bụi',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 1,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Tường (Walls)',
    description: 'Kiểm tra lớp sơn lót',
    specification: 'Phủ đều, không bị bọt khí, độ dày đạt chuẩn theo nhà sản xuất',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 2,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Tường (Walls)',
    description: 'Kiểm tra lớp sơn hoàn thiện',
    specification: '2-3 lớp, màu đều, không lem, không vệt cọ, độ bóng theo yêu cầu',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 3,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Tường (Walls)',
    description: 'Kiểm tra góc tường, góc trần',
    specification: 'Nét giao vuông góc 90°, chỉ thẳng, không bị méo mó',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 4,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Tường (Walls)',
    description: 'Kiểm tra tường ốp đá/gạch',
    specification: 'Gạch dán thẳng hàng, mạch đá cân đối, keo trét đầy đủ, không rỗng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 5,
  },

  // Sàn (Floors) - 5 items
  {
    checklistId: 'finishing-checklist',
    category: 'Sàn (Floors)',
    description: 'Kiểm tra độ phẳng sàn',
    specification: 'Sai số ≤3mm/2m, không có điểm lõm/lồi >2mm',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 6,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Sàn (Floors)',
    description: 'Kiểm tra gạch lát sàn',
    specification: 'Gạch dán thẳng hàng, mạch nối đều, khe hở ≤2mm, không bị võng/vỡ',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 7,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Sàn (Floors)',
    description: 'Kiểm tra chất lượng keo ron',
    specification: 'Keo ron đầy khe, màu đều, không bị nứt/sứt, vệ sinh sạch sẽ',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 8,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Sàn (Floors)',
    description: 'Kiểm tra sàn gỗ/vinyl',
    specification: 'Lắp khít, không khe hở, không cong vênh, bề mặt phẳng mịn',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 9,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Sàn (Floors)',
    description: 'Kiểm tra chân tường/nẹp hoàn thiện',
    specification: 'Nẹp thẳng, liền mạch, không khe hở, bắt vít/keo chắc chắn',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 10,
  },

  // Trần (Ceilings) - 4 items
  {
    checklistId: 'finishing-checklist',
    category: 'Trần (Ceilings)',
    description: 'Kiểm tra trần thạch cao',
    specification: 'Bề mặt phẳng, mối nối kín, không nứt, không bị lún/võng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 11,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Trần (Ceilings)',
    description: 'Kiểm tra sơn trần',
    specification: 'Màu trắng đều, không bị lem, không vệt cọ, độ bóng phù hợp',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 12,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Trần (Ceilings)',
    description: 'Kiểm tra đèn âm trần',
    specification: 'Đèn lắp phẳng với mặt trần, không khe hở, hoạt động tốt',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 13,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Trần (Ceilings)',
    description: 'Kiểm tra hệ thống điều hòa/thông gió trần',
    specification: 'Miệng gió/dàn lạnh lắp thẳng hàng, cân đối, kín khít',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 14,
  },

  // Cửa ra vào (Doors) - 4 items
  {
    checklistId: 'finishing-checklist',
    category: 'Cửa ra vào (Doors)',
    description: 'Kiểm tra khung cửa',
    specification: 'Khung vuông góc, thẳng đứng, bắt vít chắc chắn vào tường',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 15,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Cửa ra vào (Doors)',
    description: 'Kiểm tra cánh cửa',
    specification: 'Cánh phẳng, không cong vênh, bề mặt nhẵn, sơn/veneer đều màu',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 16,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Cửa ra vào (Doors)',
    description: 'Kiểm tra bản lề và khóa cửa',
    specification: 'Cửa đóng mở êm, không kêu, khóa lẫy chắc chắn, chìa khóa quay dễ dàng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 17,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Cửa ra vào (Doors)',
    description: 'Kiểm tra khe hở cửa',
    specification: 'Khe hở đều (3-5mm), cửa không bị chạm sàn, đóng kín không lọt gió',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 18,
  },

  // Cửa sổ (Windows) - 4 items
  {
    checklistId: 'finishing-checklist',
    category: 'Cửa sổ (Windows)',
    description: 'Kiểm tra khung nhôm kính',
    specification: 'Khung vuông góc, không cong vênh, bắt vít chắc chắn, silicon kín khít',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 19,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Cửa sổ (Windows)',
    description: 'Kiểm tra kính cửa sổ',
    specification: 'Kính phẳng, không xước, không bọt khí, dán film đúng quy cách',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 20,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Cửa sổ (Windows)',
    description: 'Kiểm tra khả năng đóng mở',
    specification: 'Mở/đóng êm, không kêu, tay quay/khóa hoạt động tốt',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 21,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Cửa sổ (Windows)',
    description: 'Kiểm tra chống thấm cửa sổ',
    specification: 'Silicon kín khe, không rò nước khi mưa to, thoát nước tốt',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 22,
  },

  // Hoàn thiện khác (Other Finishes) - 3 items
  {
    checklistId: 'finishing-checklist',
    category: 'Hoàn thiện khác (Other Finishes)',
    description: 'Kiểm tra tủ bếp/tủ âm tường',
    specification: 'Tủ lắp thẳng, cánh đóng mở êm, bản lề chắc, mặt tủ phẳng mịn',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 23,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Hoàn thiện khác (Other Finishes)',
    description: 'Kiểm tra lan can/tay vịn cầu thang',
    specification: 'Lan can thẳng đứng, tay vịn nhẵn bóng, bắt vững chắc, cao ≥1.1m',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 24,
  },
  {
    checklistId: 'finishing-checklist',
    category: 'Hoàn thiện khác (Other Finishes)',
    description: 'Vệ sinh công trình',
    specification: 'Công trình sạch sẽ, không bụi, keo, vữa, cửa sổ lau sạch, sàn quét sạch',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 25,
  },
];

export default function FinishingChecklistScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { createChecklist } = useChecklists();
  const [items, setItems] = useState<Omit<ChecklistItem, 'id'>[]>(FINISHING_ITEMS);
  const [currentChecklistId, setCurrentChecklistId] = useState<string | null>(null);

  const handleStatusChange = (index: number, status: InspectionStatus) => {
    const updatedItems = [...items];
    updatedItems[index].status = status;
    setItems(updatedItems);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const updatedItems = [...items];
    updatedItems[index].notes = notes;
    setItems(updatedItems);
  };

  const handlePhotoAdd = (index: number) => {
    Alert.alert(
      'Tính năng Upload Ảnh',
      'Tính năng upload ảnh sẽ được tích hợp trong Task #44 (File Upload - Upload Components)',
      [
        {          text: 'OK',
          onPress: () => {
            const updatedItems = [...items];
            updatedItems[index].photos.push(`https://picsum.photos/seed/${Date.now()}/400/300`);
            setItems(updatedItems);
          },
        },
      ]
    );
  };

  const totalItems = items.length;
  const passedCount = items.filter((item) => item.status === 'PASS').length;
  const failedCount = items.filter((item) => item.status === 'FAIL').length;
  const naCount = items.filter((item) => item.status === 'NA').length;
  const completedCount = passedCount + failedCount + naCount;
  const progressPercentage = (completedCount / totalItems) * 100;

  const handleSaveDraft = async () => {
    try {
      const checklist = await createChecklist({
        projectId: projectId!,
        type: ChecklistType.FINISHING,
        title: 'Checklist Kiểm Tra Hoàn Thiện',
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

  const handleSubmit = async () => {
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
        type: ChecklistType.FINISHING,
        title: 'Checklist Kiểm Tra Hoàn Thiện',
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
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Tiến độ kiểm tra hoàn thiện</Text>
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

        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryHeader}>{category}</Text>
            {categoryItems.map((item) => (
              <View key={item.index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Ionicons
                    name={getStatusIcon(item.status)}
                    size={24}
                    color={getStatusColor(item.status)}
                  />
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>

                <View style={styles.specBox}>
                  <Ionicons name="information-circle" size={16} color="#0066CC" />
                  <Text style={styles.specText}>{item.specification}</Text>
                </View>

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
