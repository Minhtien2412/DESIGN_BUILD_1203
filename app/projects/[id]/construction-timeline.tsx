import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TimelineNode {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'pending';
  hasChecklist?: boolean;
  checklistItems?: string[];
}

const TIMELINE_NODES: TimelineNode[] = [
  { id: '1', title: 'Khởi công dự án', status: 'completed' },
  { id: '2', title: 'Thi công ép cọc', status: 'completed' },
  { id: '3', title: 'Thi công móng băng', status: 'completed' },
  { id: '4', title: 'Thi công móng(không năm)', status: 'completed' },
  {
    id: '5',
    title: 'Công tác cốt bê tổng',
    status: 'active',
    hasChecklist: true,
    checklistItems: ['Đồ dà giằng, lành tô, cốt cây'],
  },
  { id: '6', title: 'Đổ dầm sàn tầng trệt', status: 'pending' },
  { id: '7', title: 'Công tác xây tường', status: 'pending' },
  { id: '8', title: 'Công tác trái tường', status: 'pending' },
  { id: '9', title: 'Thi công lắp gạch', status: 'pending' },
  { id: '10', title: 'Thi công ốp gạch', status: 'pending' },
  { id: '11', title: 'Thi công khung hào', status: 'pending' },
  { id: '12', title: 'Lắp khuôn bao,cánh cửa', status: 'pending' },
  { id: '13', title: 'Thi công điện nước', status: 'pending' },
  { id: '14', title: 'Bàn giao nhà', status: 'pending' },
  { id: '15', title: 'Vệ sinh công nghiệp', status: 'pending' },
  { id: '16', title: 'Lắp đặt nội thất', status: 'pending' },
  { id: '17', title: 'Thi công lần can', status: 'pending' },
];

export default function ConstructionTimelineScreen() {
  const params = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const borderStrong = useThemeColor({}, 'borderStrong');
  const mutedColor = useThemeColor({}, 'textMuted');
  const successColor = useThemeColor({}, 'success');
  const inverseText = useThemeColor({}, 'textInverse');

  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<string[]>([]);

  const projectName = 'Biệt Thự Tân Cổ Điển KingCrown';
  const startDate = '01/10/2025';
  const expectedCompletion = '25/9';
  const remainingDays = 92;
  const progress = 20;
  const currentPhase = '04 Công tắc cốt bê tổng';

  const completedNodes = TIMELINE_NODES.filter(n => n.status === 'completed').length;

  const handleChecklistPress = (items: string[]) => {
    setSelectedChecklist(items);
    setShowChecklistModal(true);
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return successColor;
      case 'active':
        return primaryColor;
      case 'pending':
        return surfaceAlt;
      default:
        return surfaceAlt;
    }
  };

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'radio-button-on';
      case 'pending':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Tiến độ công trình
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Project Info Card */}
  <View style={[styles.projectCard, { borderColor: borderColor, backgroundColor: surfaceColor }]}>
          <Text style={[styles.projectName, { color: textColor }]}>
            {projectName}
          </Text>

          <View style={styles.projectInfoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: mutedColor }]}>Bắt đầu</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {startDate}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: mutedColor }]}> 
                Dự kiến hoàn thành
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {expectedCompletion}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: mutedColor }]}>Thời gian</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {remainingDays} Ngày
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: textColor }]}>
                Tiến độ
              </Text>
              <Text style={[styles.progressPercent, { color: primaryColor }]}>
                {progress}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: surfaceMuted }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: primaryColor },
                ]}
              />
            </View>
            <Text style={[styles.currentPhase, { color: mutedColor }]}>
              Hiện tại: {currentPhase}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {TIMELINE_NODES.map((node, index) => {
            const nodeColor = getNodeColor(node.status);
            const nodeIcon = getNodeIcon(node.status);
            const isLast = index === TIMELINE_NODES.length - 1;

            return (
              <View key={node.id} style={styles.timelineItem}>
                {/* Timeline Line */}
                {!isLast && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor:
                          node.status === 'completed' ? successColor : surfaceAlt,
                      },
                    ]}
                  />
                )}

                {/* Timeline Node */}
                <View style={styles.timelineNode}>
                  <Ionicons
                    name={nodeIcon as any}
                    size={28}
                    color={nodeColor}
                  />
                </View>

                {/* Timeline Content */}
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      {
                        color:
                          node.status === 'pending' ? mutedColor : textColor,
                        fontWeight: node.status === 'active' ? '600' : '400',
                      },
                    ]}
                  >
                    {node.title}
                  </Text>

                  {node.hasChecklist && node.checklistItems && (
                    <TouchableOpacity
                      style={[
                        styles.checklistButton,
                        { backgroundColor: primaryColor + '20' },
                      ]}
                      onPress={() => handleChecklistPress(node.checklistItems!)}
                    >
                      <Ionicons
                        name="list-outline"
                        size={16}
                        color={primaryColor}
                      />
                      <Text style={[styles.checklistText, { color: primaryColor }]}>
                        Xem checklist
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Checklist Modal */}
      <Modal
        visible={showChecklistModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChecklistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Lịch kiểm tra kế tiếp
              </Text>
              <TouchableOpacity onPress={() => setShowChecklistModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.checklistContent}>
              {selectedChecklist.map((item, index) => (
                <View key={index} style={styles.checklistItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={primaryColor}
                  />
                  <Text style={[styles.checklistItemText, { color: textColor }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: primaryColor }]}
              onPress={() => setShowChecklistModal(false)}
            >
              <Text style={[styles.confirmButtonText, { color: inverseText }]}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  projectInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  currentPhase: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  timelineContainer: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 14,
    top: 28,
    width: 2,
    height: 40,
  },
  timelineNode: {
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  checklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  checklistText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checklistContent: {
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  checklistItemText: {
    fontSize: 15,
    flex: 1,
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
