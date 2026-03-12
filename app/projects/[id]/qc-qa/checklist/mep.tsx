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

// MEP (Mechanical, Electrical, Plumbing) inspection checklist template
const MEP_ITEMS: Omit<ChecklistItem, 'id'>[] = [
  // Điện (Electrical) - 6 items
  {
    checklistId: 'mep-checklist',
    category: 'Điện (Electrical)',
    description: 'Kiểm tra hệ thống dây dẫn điện',
    specification: 'Dây đủ tiết diện theo thiết kế, màu sắc đúng pha (L-nâu, N-xanh, PE-vàng/xanh)',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 1,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điện (Electrical)',
    description: 'Kiểm tra ống luồn dây điện',
    specification: 'Ống HDPE/PVC, đường kính phù hợp (Φ16-Φ27mm), không bị vỡ nứt',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 2,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điện (Electrical)',
    description: 'Kiểm tra tủ điện và CB (Circuit Breaker)',
    specification: 'CB đúng công suất, có ELCB/RCCB chống giật, kết nối chắc chắn',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 3,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điện (Electrical)',
    description: 'Kiểm tra hệ thống nối đất (PE)',
    specification: 'Điện trở nối đất ≤4Ω, dây PE nối liên tục đến các thiết bị',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 4,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điện (Electrical)',
    description: 'Kiểm tra ổ cắm, công tắc',
    specification: 'Lắp đúng cao độ (công tắc 1.3m, ổ cắm 0.3m), đấu nối chắc chắn',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 5,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điện (Electrical)',
    description: 'Kiểm tra hệ thống chiếu sáng',
    specification: 'Đèn LED, công suất đúng thiết kế, phân bố đều, độ sáng đạt chuẩn',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 6,
  },

  // Nước (Plumbing) - 6 items
  {
    checklistId: 'mep-checklist',
    category: 'Nước (Plumbing)',
    description: 'Kiểm tra ống cấp nước',
    specification: 'Ống PPR/HDPE, đường kính theo thiết kế (Φ21-Φ34mm), hàn nhiệt kín',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 7,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Nước (Plumbing)',
    description: 'Kiểm tra ống thoát nước',
    specification: 'Ống PVC-U, độ dốc 2-3%, không bị tắc nghắn, có nắp thăm',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 8,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Nước (Plumbing)',
    description: 'Thử áp lực đường ống cấp nước',
    specification: 'Áp lực thử 1.5 lần áp lực làm việc, giữ 30 phút, không rò rỉ',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 9,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Nước (Plumbing)',
    description: 'Kiểm tra van khóa nước',
    specification: 'Van bi/van cầu, đóng mở êm, không rò rỉ, vị trí hợp lý',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 10,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Nước (Plumbing)',
    description: 'Kiểm tra thiết bị vệ sinh',
    specification: 'Bồn cầu, lavabo, vòi sen đúng mẫu mã, lắp đặt vững chắc, không rò rỉ',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 11,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Nước (Plumbing)',
    description: 'Kiểm tra hệ thống thoát sàn',
    specification: 'Ga thoát sàn φ90-φ114mm, có van chặn mùi, thoát nước nhanh',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 12,
  },

  // Điều hòa thông gió (HVAC) - 5 items
  {
    checklistId: 'mep-checklist',
    category: 'Điều hòa thông gió (HVAC)',
    description: 'Kiểm tra đường ống đồng dàn lạnh',
    specification: 'Ống đồng φ6.35-φ12.7mm, bọc cách nhiệt dày ≥13mm, không rò gas',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 13,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điều hòa thông gió (HVAC)',
    description: 'Kiểm tra dàn nóng điều hòa',
    specification: 'Lắp vị trí thoáng, khoảng cách tường ≥30cm, chống rung, thoát nước',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 14,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điều hòa thông gió (HVAC)',
    description: 'Kiểm tra dàn lạnh điều hòa',
    specification: 'Cao độ ≥2.5m, thoát nước ngưng tụ tốt, không bị chảy ngược',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 15,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điều hòa thông gió (HVAC)',
    description: 'Kiểm tra hệ thống thông gió',
    specification: 'Quạt thông gió công suất đủ, ống gió kín khít, lưới chắn côn trùng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 16,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Điều hòa thông gió (HVAC)',
    description: 'Thử nghiệm vận hành HVAC',
    specification: 'Hoạt động êm, nhiệt độ đạt 20-25°C, tiếng ồn ≤45dB',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 17,
  },

  // PCCC (Fire Safety) - 5 items
  {
    checklistId: 'mep-checklist',
    category: 'PCCC (Fire Safety)',
    description: 'Kiểm tra hệ thống báo cháy',
    specification: 'Đầu báo khói/nhiệt đủ số lượng, phân bố đúng, hoạt động tốt',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 18,
  },
  {
    checklistId: 'mep-checklist',
    category: 'PCCC (Fire Safety)',
    description: 'Kiểm tra hệ thống chữa cháy',
    specification: 'Bình cứu hỏa CO2/bột, vị trí dễ lấy, áp lực đầy đủ, hạn dùng còn hiệu lực',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 19,
  },
  {
    checklistId: 'mep-checklist',
    category: 'PCCC (Fire Safety)',
    description: 'Kiểm tra đường ống PCCC',
    specification: 'Ống thép φ34-φ60mm, sơn đỏ, áp lực ≥0.6MPa, van góc 45m/tầng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 20,
  },
  {
    checklistId: 'mep-checklist',
    category: 'PCCC (Fire Safety)',
    description: 'Kiểm tra đèn EXIT, sơ tán',
    specification: 'Đèn LED thoát hiểm, luôn sáng hoặc sạc dự phòng, biển chỉ dẫn rõ ràng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 21,
  },
  {
    checklistId: 'mep-checklist',
    category: 'PCCC (Fire Safety)',
    description: 'Kiểm tra lối thoát hiểm',
    specification: 'Cửa thoát hiểm rộng ≥0.9m, mở ra ngoài, không bị chắn, có ổ khóa panic',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 22,
  },

  // Hệ thống khác (Other Systems) - 3 items
  {
    checklistId: 'mep-checklist',
    category: 'Hệ thống khác (Other Systems)',
    description: 'Kiểm tra hệ thống camera an ninh',
    specification: 'Camera IP/Analog, độ phân giải ≥2MP, góc quay đủ, đấu nối ổn định',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 23,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Hệ thống khác (Other Systems)',
    description: 'Kiểm tra hệ thống chuông cửa',
    specification: 'Chuông điện/chuông hình, hoạt động tốt, âm thanh rõ ràng',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 24,
  },
  {
    checklistId: 'mep-checklist',
    category: 'Hệ thống khác (Other Systems)',
    description: 'Kiểm tra hệ thống mạng LAN',
    specification: 'Cáp UTP Cat6, ổ mạng RJ45 đấu đúng chuẩn T568B, test tốc độ ≥1Gbps',
    status: InspectionStatus.PENDING,
    photos: [],
    notes: '',
    order: 25,
  },
];

export default function MEPChecklistScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { createChecklist } = useChecklists();
  const [items, setItems] = useState<Omit<ChecklistItem, 'id'>[]>(MEP_ITEMS);
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
            // Demo: Add a placeholder photo
            const updatedItems = [...items];
            updatedItems[index].photos.push(`https://picsum.photos/seed/${Date.now()}/400/300`);
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
        type: ChecklistType.MEP,
        title: 'Checklist Kiểm Tra Hệ Thống M-E-P',
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
        type: ChecklistType.MEP,
        title: 'Checklist Kiểm Tra Hệ Thống M-E-P',
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
        {/* Progress Dashboard */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Tiến độ kiểm tra M&E</Text>
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
                  <Ionicons name="information-circle" size={16} color="#0D9488" />
                  <Text style={styles.specText}>{item.specification}</Text>
                </View>

                {/* Status Selection */}
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === 'PASS' && styles.statusButtonActive,
                      { borderColor: '#0D9488' },
                    ]}
                    onPress={() => handleStatusChange(item.index, InspectionStatus.PASS)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        item.status === 'PASS' && { color: '#0D9488' },
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
                    <Ionicons name="camera" size={20} color="#0D9488" />
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
    backgroundColor: '#F0FDFA',
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
