import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface ProcessStep {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
  x: number;
  y: number;
  connections?: string[]; // IDs of connected steps
}

const PROCESS_STEPS: ProcessStep[] = [
  { id: '1', name: 'Chuẩn bị mặt bằng', status: 'completed', x: 60, y: 50, connections: ['2'] },
  { id: '2', name: 'Bản mục định vị tường', status: 'completed', x: 200, y: 50, connections: ['3'] },
  { id: '3', name: 'Xây định vị gạch chắn tường', status: 'completed', x: 340, y: 50, connections: ['4'] },
  { id: '4', name: 'Thả lỗi (đéo)', status: 'active', x: 340, y: 150, connections: ['5'] },
  { id: '5', name: 'Xây tường đợt 1', status: 'pending', x: 200, y: 150, connections: ['6'] },
  { id: '6', name: 'Đo dà giằng, lành tô, cốt cây', status: 'pending', x: 60, y: 150, connections: ['7'] },
  { id: '7', name: 'Xây tường đợt 2', status: 'pending', x: 60, y: 250, connections: ['8'] },
  { id: '8', name: 'Bảo dưỡng', status: 'pending', x: 200, y: 250, connections: ['9'] },
  { id: '9', name: 'Khoàn tháp rãu', status: 'pending', x: 340, y: 250, connections: ['10'] },
  { id: '10', name: 'Defect hạng mục xây tường', status: 'pending', x: 340, y: 350, connections: ['11'] },
  { id: '11', name: 'Chuyển công tác tiếp theo', status: 'pending', x: 200, y: 350, connections: ['12'] },
  { id: '12', name: 'Nghiệm thu', status: 'pending', x: 60, y: 350 },
];

export default function ProcessDetailScreen() {
  const params = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const processCode = 'QTTC02';
  const processName = 'Quy Trình Tô Trát Tường';
  const progress = 20;
  const currentPhase = '04 Thả lỗi (đéo)';

  const checklistItems = ['Đồ dà giằng, lành tô, cốt cây'];

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#0D9488';
      case 'active':
        return primaryColor;
      case 'pending':
        return '#E0E0E0';
      default:
        return '#E0E0E0';
    }
  };

  const renderFlowDiagram = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.diagramScroll}
      >
        <View style={styles.diagramContainer}>
          <Svg width={400} height={450} viewBox="0 0 400 450">
            {/* Draw connections */}
            {PROCESS_STEPS.map(step => {
              if (!step.connections) return null;
              return step.connections.map(targetId => {
                const target = PROCESS_STEPS.find(s => s.id === targetId);
                if (!target) return null;
                
                const color = step.status === 'completed' ? '#0D9488' : '#E0E0E0';
                
                return (
                  <Line
                    key={`${step.id}-${targetId}`}
                    x1={step.x}
                    y1={step.y + 20}
                    x2={target.x}
                    y2={target.y - 20}
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              });
            })}

            {/* Draw steps */}
            {PROCESS_STEPS.map(step => {
              const color = getStepColor(step.status);
              return (
                <Circle
                  key={step.id}
                  cx={step.x}
                  cy={step.y}
                  r={25}
                  fill={color}
                  stroke={step.status === 'active' ? primaryColor : color}
                  strokeWidth={step.status === 'active' ? 3 : 1}
                />
              );
            })}
          </Svg>

          {/* Step labels overlay */}
          {PROCESS_STEPS.map(step => (
            <View
              key={`label-${step.id}`}
              style={[
                styles.stepLabel,
                {
                  left: step.x - 60,
                  top: step.y + 30,
                },
              ]}
            >
              <Text
                style={[
                  styles.stepLabelText,
                  {
                    color: textColor,
                    fontWeight: step.status === 'active' ? '600' : '400',
                  },
                ]}
                numberOfLines={2}
              >
                {step.name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
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
            Chi tiết quy trình
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Process Info Card */}
        <View style={[styles.infoCard, { borderColor: primaryColor }]}>
          <View style={styles.infoHeader}>
            <Text style={[styles.infoLabel, { color: '#666' }]}>
              TIẾN ĐỘ CÔNG TRÌNH
            </Text>
          </View>
          
          <Text style={[styles.processCode, { color: textColor }]}>
            {processCode}
          </Text>
          <Text style={[styles.processName, { color: textColor }]}>
            {processName}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: textColor }]}>
                Tiến độ thi công
              </Text>
              <Text style={[styles.progressPercent, { color: primaryColor }]}>
                {progress}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: '#E0E0E0' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: primaryColor },
                ]}
              />
            </View>
            <Text style={[styles.currentPhase, { color: '#666' }]}>
              Hiện tại: {currentPhase}
            </Text>
          </View>
        </View>

        {/* Flow Diagram */}
        <View style={styles.diagramSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Sơ đồ quy trình
          </Text>
          {renderFlowDiagram()}
        </View>

        {/* Legend */}
        <View style={styles.legendSection}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0D9488' }]} />
            <Text style={[styles.legendText, { color: textColor }]}>
              Đã hoàn thành
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: primaryColor }]} />
            <Text style={[styles.legendText, { color: textColor }]}>
              Đang thực hiện
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
            <Text style={[styles.legendText, { color: textColor }]}>
              Chưa bắt đầu
            </Text>
          </View>
        </View>

        {/* Checklist Section */}
        <View style={styles.checklistSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Lịch kiểm tra kế tiếp
          </Text>
          
          {checklistItems.map((item, index) => (
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

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: primaryColor }]}
            onPress={() => {
              alert('Đã xác nhận checklist');
            }}
          >
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
  },
  infoHeader: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  processCode: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  processName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  diagramSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  diagramScroll: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  diagramContainer: {
    position: 'relative',
    minHeight: 450,
  },
  stepLabel: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
  },
  stepLabelText: {
    fontSize: 11,
    textAlign: 'center',
  },
  legendSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
  },
  checklistSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  checklistItemText: {
    fontSize: 15,
    flex: 1,
  },
  confirmButton: {
    marginTop: 16,
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
