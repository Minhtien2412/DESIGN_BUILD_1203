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

// Landscape inspection checklist template
const LANDSCAPE_ITEMS: Omit<ChecklistItem, 'id'>[] = [
  // Hardscape - 5 items
  {
    checklistId: 'landscape-checklist',
    category: 'Hardscape (Mặt cứng)',
    description: 'Kiểm tra nền móng lát đá/gạch',
    specification: 'Đầm chặt, độ dốc thoát nước 1-2%, lớp cát san lót ≥5cm',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 1,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Hardscape (Mặt cứng)',
    description: 'Kiểm tra lát đá/gạch lối đi',
    specification: 'Gạch dán thẳng hàng, chống trơn, khe hở ≤5mm, độ dốc thoát nước',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 2,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Hardscape (Mặt cứng)',
    description: 'Kiểm tra tường chắn/hố xử lý',
    specification: 'Tường thẳng đứng, móng sâu ≥40cm, thoát nước phía sau, chống thấm',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 3,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Hardscape (Mặt cứng)',
    description: 'Kiểm tra bờ tường/rào cản',
    specification: 'Tường vững chắc, cao theo thiết kế, sơn/ốp hoàn thiện đẹp',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 4,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Hardscape (Mặt cứng)',
    description: 'Kiểm tra hệ thống thoát nước mưa',
    specification: 'Rãnh thoát dốc 2-3%, miệng thu đủ, không bị tắc, nối đến cống chính',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 5,
  },

  // Softscape - 6 items
  {
    checklistId: 'landscape-checklist',
    category: 'Softscape (Mặt mềm)',
    description: 'Kiểm tra lớp đất trồng cây',
    specification: 'Độ dày ≥30cm, đất tơi xốp, giàu dinh dưỡng, không có đá/rác',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 6,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Softscape (Mặt mềm)',
    description: 'Kiểm tra cỏ tự nhiên/nhân tạo',
    specification: 'Cỏ phủ đều, xanh tốt, không chỗ trống, cắt tỉa gọn gàng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 7,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Softscape (Mặt mềm)',
    description: 'Kiểm tra cây xanh (cây cảnh, cây bóng mát)',
    specification: 'Cây khỏe, không sâu bệnh, tán đều, kích thước theo thiết kế',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 8,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Softscape (Mặt mềm)',
    description: 'Kiểm tra cây bụi/hàng rào xanh',
    specification: 'Trồng dày đặc, không chỗ trống, cắt tỉa tạo hình theo thiết kế',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 9,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Softscape (Mặt mềm)',
    description: 'Kiểm tra hoa cỏ thảm/dây leo',
    specification: 'Hoa nở đẹp, màu sắc tươi, phủ đầy, không héo úa',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 10,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Softscape (Mặt mềm)',
    description: 'Kiểm tra lớp phủ (mulch/vỏ cây/đá cuội)',
    specification: 'Phủ đều độ dày 5-7cm, giữ ẩm tốt, màu sắc hài hòa',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 11,
  },

  // Irrigation - 4 items
  {
    checklistId: 'landscape-checklist',
    category: 'Hệ thống tưới (Irrigation)',
    description: 'Kiểm tra đường ống cấp nước tưới',
    specification: 'Ống HDPE/PVC Φ21-34mm, không rò rỉ, van khóa hoạt động tốt',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 12,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Hệ thống tưới (Irrigation)',
    description: 'Kiểm tra đầu phun/béc tưới',
    specification: 'Đầu phun phủ đủ khu vực, áp lực ổn định, không bị tắc',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 13,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Hệ thống tưới (Irrigation)',
    description: 'Kiểm tra hệ thống tưới nhỏ giọt',
    specification: 'Ống nhỏ giọt đặt đều, giọt nước đều đặn, không bị rò',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 14,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Hệ thống tưới (Irrigation)',
    description: 'Kiểm tra bộ hẹn giờ/điều khiển tưới',
    specification: 'Bộ điều khiển hoạt động, hẹn giờ chính xác, pin/nguồn đủ',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 15,
  },

  // Lighting - 3 items
  {
    checklistId: 'landscape-checklist',
    category: 'Chiếu sáng sân vườn (Lighting)',
    description: 'Kiểm tra đèn lối đi/cột đèn',
    specification: 'Đèn LED, công suất phù hợp, chiếu đều, không chói mắt',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 16,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Chiếu sáng sân vườn (Lighting)',
    description: 'Kiểm tra đèn âm sàn/đèn trang trí',
    specification: 'Đèn lắp chắc chắn, chống nước IP65, hoạt động ổn định',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 17,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Chiếu sáng sân vườn (Lighting)',
    description: 'Kiểm tra đường dây điện sân vườn',
    specification: 'Dây chôn sâu ≥50cm, ống bảo vệ HDPE, không để lộ, an toàn',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 18,
  },

  // Outdoor Furniture & Features - 3 items
  {
    checklistId: 'landscape-checklist',
    category: 'Nội thất ngoại thất (Outdoor Features)',
    description: 'Kiểm tra ghế đá/bàn đá sân vườn',
    specification: 'Bề mặt nhẵn, lắp đặt vững chắc, màu sắc hài hòa',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 19,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Nội thất ngoại thất (Outdoor Features)',
    description: 'Kiểm tra hồ nước/thác nước (nếu có)',
    specification: 'Hệ thống tuần hoàn hoạt động, không rò rỉ, nước trong sạch',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 20,
  },
  {
    checklistId: 'landscape-checklist',
    category: 'Nội thất ngoại thất (Outdoor Features)',
    description: 'Vệ sinh và bàn giao sân vườn',
    specification: 'Sân vườn sạch sẽ, không rác thải, lối đi thông thoáng, cây xanh tươi',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 21,
  },
];

export default function LandscapeChecklistScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { createChecklist } = useChecklists();
  const [items, setItems] = useState<Omit<ChecklistItem, 'id'>[]>(LANDSCAPE_ITEMS);
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
        {
          text: 'OK',
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
  const passedCount = items.filter((item) => item.status === InspectionStatus.PASS).length;
  const failedCount = items.filter((item) => item.status === InspectionStatus.FAIL).length;
  const naCount = items.filter((item) => item.status === InspectionStatus.NA).length;
  const completedCount = passedCount + failedCount + naCount;
  const progressPercentage = (completedCount / totalItems) * 100;

  const handleSaveDraft = async () => {
    try {
      const checklist = await createChecklist({
        projectId: projectId!,
        type: ChecklistType.LANDSCAPE,
        title: 'Checklist Kiểm Tra Cảnh Quan',
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
      await createChecklist({
        projectId: projectId!,
        type: ChecklistType.LANDSCAPE,
        title: 'Checklist Kiểm Tra Cảnh Quan',
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
        return '#0D9488';
      case 'FAIL':
        return '#000000';
      case 'NA':
        return '#999999';
      default:
        return '#0D9488';
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
          <Text style={styles.progressTitle}>Tiến độ kiểm tra cảnh quan</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalItems} hạng mục ({progressPercentage.toFixed(0)}%)
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#0D9488' }]} />
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
                  <Ionicons name="information-circle" size={16} color="#0D9488" />
                  <Text style={styles.specText}>{item.specification}</Text>
                </View>

                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === InspectionStatus.PASS && styles.statusButtonActive,
                      { borderColor: '#0D9488' },
                    ]}
                    onPress={() => handleStatusChange(item.index, InspectionStatus.PASS)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === InspectionStatus.PASS && { color: '#0D9488' },
                      ]}
                    >
                      Đạt
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === InspectionStatus.FAIL && styles.statusButtonActive,
                      { borderColor: '#000000' },
                    ]}
                    onPress={() => handleStatusChange(item.index, InspectionStatus.FAIL)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === InspectionStatus.FAIL && { color: '#000000' },
                      ]}
                    >
                      Không đạt
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === InspectionStatus.NA && styles.statusButtonActive,
                      { borderColor: '#999999' },
                    ]}
                    onPress={() => handleStatusChange(item.index, InspectionStatus.NA)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === InspectionStatus.NA && { color: '#999999' },
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
                    <Ionicons name="camera" size={20} color="#0D9488" />
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
    backgroundColor: '#0D9488',
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
    borderBottomColor: '#0D9488',
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
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  specText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
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
    borderColor: '#0D9488',
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 14,
    color: '#0D9488',
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
    borderColor: '#0D9488',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#0D9488',
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
