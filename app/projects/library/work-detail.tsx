import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
interface WorkItem {
  id: string;
  location: string;
  task: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'pending';
  keyplan: string;
  report: string;
  note: string;
}

interface FloorSection {
  id: string;
  name: string;
  number: string;
  works: WorkItem[];
}

export default function WorkDetailScreen() {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  // Mock data based on the design
  const phases = [
    { id: 'all', name: 'Tất cả', color: '#000000' },
    { id: 'foundation', name: 'Xây dựng cột', color: '#E82A34' },
    { id: 'wall', name: 'Xây Tường', color: '#D39878' },
    { id: 'me', name: 'ME - Hoà', color: '#4DA6FF' },
    { id: 'ac', name: 'Máy lạnh', color: '#BBE7F0' },
    { id: 'ceiling', name: 'Đóng trần thạch cao', color: '#FFD301' },
    { id: 'paint', name: 'Sơn', color: '#FFA84D' },
  ];

  const floorSections: FloorSection[] = [
    {
      id: '01',
      name: 'Khu vực 1',
      number: '01',
      works: [
        {
          id: 'F1C4',
          location: 'F1C4',
          task: 'Làm thép',
          startDate: '20/06',
          endDate: '22/06',
          duration: '2 Day',
          status: 'completed',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
        {
          id: 'F1C3',
          location: 'F1C3',
          task: 'Làm thép',
          startDate: '20/06',
          endDate: '22/06',
          duration: '2 Day',
          status: 'completed',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
        {
          id: 'F1C2',
          location: 'F1C2',
          task: 'Ván khuôn',
          startDate: '20/06',
          endDate: '20/06',
          duration: '1 Day',
          status: 'completed',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
        {
          id: 'F1C1',
          location: 'F1C1',
          task: 'Bắn Laser',
          startDate: '20/06',
          endDate: '20/06',
          duration: '1 Day',
          status: 'completed',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
        {
          id: 'F1_1',
          location: 'F1',
          task: 'Bắn Laser',
          startDate: '20/06',
          endDate: '20/12',
          duration: '3 Month',
          status: 'in-progress',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
        {
          id: 'F1_2',
          location: 'F1',
          task: 'Bảo dưỡng',
          startDate: '20/06',
          endDate: '20/12',
          duration: '3 Month',
          status: 'in-progress',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
        {
          id: 'F1_3',
          location: 'F1',
          task: 'Tô tường',
          startDate: '20/06',
          endDate: '20/12',
          duration: '3 Month',
          status: 'in-progress',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
        {
          id: 'F1_4',
          location: 'F1',
          task: 'Chống thấm',
          startDate: '20/06',
          endDate: '20/12',
          duration: '3 Month',
          status: 'in-progress',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
        {
          id: 'F1_5',
          location: 'F1',
          task: 'Lát gạch',
          startDate: '20/06',
          endDate: '20/12',
          duration: '3 Month',
          status: 'in-progress',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
      ],
    },
    {
      id: '02',
      name: 'Khu vực 2',
      number: '02',
      works: [
        {
          id: 'F1_W1',
          location: 'W1',
          task: 'Xây Tường',
          startDate: '20/06',
          endDate: '20/12',
          duration: '3 Month',
          status: 'in-progress',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
      ],
    },
    {
      id: '03',
      name: 'Khu vực 3',
      number: '03',
      works: [
        {
          id: 'F1_wall',
          location: 'F1',
          task: 'Xây Tường',
          startDate: '20/06',
          endDate: '20/12',
          duration: '3 Month',
          status: 'in-progress',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
      ],
    },
    {
      id: '04',
      name: 'Khu vực 4',
      number: '04',
      works: [
        {
          id: 'FC1',
          location: 'FC1',
          task: 'Xây dựng cột',
          startDate: '20/06',
          endDate: '23/06',
          duration: '3 Day',
          status: 'completed',
          keyplan: 'F1',
          report: 'Report',
          note: 'Note',
        },
      ],
    },
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#E82A34';
      case 'in-progress':
        return '#D39878';
      case 'pending':
        return '#CCCCCC';
      default:
        return '#CCCCCC';
    }
  };

  const renderWorkCard = (work: WorkItem, sectionColor: string) => (
    <View
      key={work.id}
      style={[styles.workCard, { borderColor: getStatusColor(work.status) }]}
    >
      <View style={styles.workHeader}>
        <View style={styles.workLocationRow}>
          <Text style={styles.workLocation}>{work.location}</Text>
          <Text style={styles.workTask}>{work.task}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.workDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vị trí</Text>
          <Text style={styles.detailValue}>{work.keyplan}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Key plan</Text>
          <Text style={styles.detailValue}>{work.keyplan}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Report</Text>
          <Text style={styles.detailValue}>{work.report}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Note</Text>
          <Text style={styles.detailValue}>{work.note}</Text>
        </View>
      </View>

      <View style={styles.timelineRow}>
        <Text style={styles.timelineLabel}>{work.startDate} to {work.endDate}</Text>
        <Text style={styles.durationLabel}>{work.duration}</Text>
      </View>

      <View style={styles.workFooter}>
        <TouchableOpacity style={styles.blueprintButton}>
          <Text style={styles.blueprintText}>Bản vẽ gốc</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportText}>Báo cáo tiến độ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFloorSection = (section: FloorSection) => (
    <View key={section.id} style={styles.floorSection}>
      <View style={styles.floorHeader}>
        <View style={styles.floorBadge}>
          <Text style={styles.floorBadgeText}>{section.number}</Text>
        </View>
        <TouchableOpacity style={styles.floorStartButton}>
          <Text style={styles.floorStartText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.floorContent}>
        <View style={styles.worksList}>
          {section.works.map((work) => renderWorkCard(work, '#0066CC'))}
        </View>
      </View>

      <TouchableOpacity style={styles.floorEndButton}>
        <Text style={styles.floorEndText}>Kết thúc</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chi tiết công việc',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: -8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>TIẾN ĐỘ THI CÔNG BIỆT THỰ</Text>
        </View>

        {/* Phase Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.phaseFilter}
          contentContainerStyle={styles.phaseFilterContent}
        >
          {phases.map((phase) => (
            <TouchableOpacity
              key={phase.id}
              style={[
                styles.phaseChip,
                selectedPhase === phase.id && styles.phaseChipActive,
                { borderColor: phase.color },
              ]}
              onPress={() => setSelectedPhase(phase.id)}
            >
              <Text
                style={[
                  styles.phaseChipText,
                  selectedPhase === phase.id && styles.phaseChipTextActive,
                ]}
              >
                {phase.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFA84D' }]} />
            <Text style={styles.legendText}>Bản vẽ gốc</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#14B159' }]} />
            <Text style={styles.legendText}>Báo cáo tiến độ</Text>
          </View>
        </View>

        {/* Floor Sections */}
        <View style={styles.floorsContainer}>
          {floorSections.map((section) => renderFloorSection(section))}
        </View>

        {/* Timeline Indicators */}
        <View style={styles.timelineIndicators}>
          <View style={styles.timelineMarker}>
            <View style={[styles.markerLine, { backgroundColor: '#BBE7F0' }]} />
            <Text style={styles.markerLabel}>6.1</Text>
          </View>
          <View style={styles.timelineMarker}>
            <View style={[styles.markerLine, { backgroundColor: '#FFD301' }]} />
            <Text style={styles.markerLabel}>6.2-6.8</Text>
          </View>
          <View style={styles.timelineMarker}>
            <View style={[styles.markerLine, { backgroundColor: '#FFA84D' }]} />
            <Text style={styles.markerLabel}>Other</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  phaseFilter: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  phaseFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  phaseChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  phaseChipActive: {
    backgroundColor: '#F3F4F6',
  },
  phaseChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  phaseChipTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 24,
    backgroundColor: '#FAFAFA',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  floorsContainer: {
    padding: 16,
    gap: 24,
  },
  floorSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  floorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  floorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floorBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  floorStartButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  floorStartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  floorContent: {
    padding: 12,
  },
  worksList: {
    gap: 12,
  },
  workCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workLocationRow: {
    flex: 1,
  },
  workLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  workTask: {
    fontSize: 13,
    color: '#666',
  },
  workDetails: {
    gap: 6,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
  },
  detailValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timelineLabel: {
    fontSize: 11,
    color: '#666',
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  workFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  blueprintButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FFA84D',
    borderRadius: 6,
    alignItems: 'center',
  },
  blueprintText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  reportButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#14B159',
    borderRadius: 6,
    alignItems: 'center',
  },
  reportText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  floorEndButton: {
    paddingVertical: 10,
    backgroundColor: '#0066CC',
    alignItems: 'center',
  },
  floorEndText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  timelineMarker: {
    alignItems: 'center',
    gap: 4,
  },
  markerLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  markerLabel: {
    fontSize: 10,
    color: '#666',
  },
});
