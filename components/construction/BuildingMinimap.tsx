import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

// Types
export type FloorArea = {
  id: string;
  code: string; // "F1", "F1C1", "W1", etc.
  name: string;
  type: 'floor' | 'column' | 'wall' | 'beam' | 'room';
  x: number; // Position X trong SVG
  y: number; // Position Y trong SVG
  width: number;
  height: number;
  progress: number; // 0-100
  status: 'completed' | 'in-progress' | 'not-started' | 'delayed';
  tasks: {
    id: string;
    name: string;
    status: 'completed' | 'in-progress' | 'not-started';
  }[];
};

export type BuildingFloor = {
  id: string;
  level: number; // -1 (basement), 0 (ground), 1, 2, 3...
  name: string;
  height: number; // Height in meters
  areas: FloorArea[];
  overallProgress: number;
};

type Props = {
  floors: BuildingFloor[];
  projectName: string;
  onAreaPress?: (area: FloorArea) => void;
};

const COLORS = {
  completed: '#14B159',
  inProgress: '#FFA84D',
  notStarted: '#E5E7EB',
  delayed: '#E82A34',
  border: '#9CA3AF',
  selected: '#3B82F6',
  background: '#F9FAFB',
};

export default function BuildingMinimap({ floors, projectName, onAreaPress }: Props) {
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');

  const [selectedFloor, setSelectedFloor] = useState<BuildingFloor | null>(floors[0] || null);
  const [selectedArea, setSelectedArea] = useState<FloorArea | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getStatusColor = (status: FloorArea['status']) => {
    switch (status) {
      case 'completed':
        return COLORS.completed;
      case 'in-progress':
        return COLORS.inProgress;
      case 'not-started':
        return COLORS.notStarted;
      case 'delayed':
        return COLORS.delayed;
      default:
        return COLORS.notStarted;
    }
  };

  const handleAreaPress = (area: FloorArea) => {
    setSelectedArea(area);
    setShowDetailModal(true);
    onAreaPress?.(area);
  };

  // Tính toán thống kê
  const totalAreas = floors.reduce((sum, floor) => sum + floor.areas.length, 0);
  const completedAreas = floors.reduce(
    (sum, floor) => sum + floor.areas.filter(a => a.status === 'completed').length,
    0
  );
  const overallProgress = totalAreas > 0 ? Math.round((completedAreas / totalAreas) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.projectName, { color: textColor }]}>{projectName}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.completed }]}>
              {completedAreas}/{totalAreas}
            </Text>
            <Text style={[styles.statLabel, { color: mutedColor }]}>Khu vực</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.inProgress }]}>
              {overallProgress}%
            </Text>
            <Text style={[styles.statLabel, { color: mutedColor }]}>Hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Floor Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.floorSelector}
      >
        {floors.map((floor) => (
          <Pressable
            key={floor.id}
            style={[
              styles.floorButton,
              {
                backgroundColor:
                  selectedFloor?.id === floor.id ? COLORS.selected : backgroundColor,
                borderColor: selectedFloor?.id === floor.id ? COLORS.selected : borderColor,
              },
            ]}
            onPress={() => setSelectedFloor(floor)}
          >
            <Text
              style={[
                styles.floorButtonText,
                {
                  color:
                    selectedFloor?.id === floor.id ? '#FFFFFF' : textColor,
                },
              ]}
            >
              {floor.name}
            </Text>
            <Text
              style={[
                styles.floorProgress,
                {
                  color:
                    selectedFloor?.id === floor.id ? '#FFFFFF' : mutedColor,
                },
              ]}
            >
              {floor.overallProgress}%
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.completed }]} />
          <Text style={[styles.legendText, { color: mutedColor }]}>Hoàn thành</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.inProgress }]} />
          <Text style={[styles.legendText, { color: mutedColor }]}>Đang làm</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.notStarted }]} />
          <Text style={[styles.legendText, { color: mutedColor }]}>Chưa bắt đầu</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.delayed }]} />
          <Text style={[styles.legendText, { color: mutedColor }]}>Trễ tiến độ</Text>
        </View>
      </View>

      {/* Minimap SVG */}
      {selectedFloor && (
        <ScrollView
          style={styles.mapContainer}
          contentContainerStyle={styles.mapContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Svg width={600} height={400} viewBox="0 0 600 400">
            {/* Background Grid */}
            <Rect
              x={0}
              y={0}
              width={600}
              height={400}
              fill={COLORS.background}
              opacity={0.5}
            />
            
            {/* Grid Lines */}
            {[...Array(20)].map((_, i) => (
              <Line
                key={`v-${i}`}
                x1={i * 30}
                y1={0}
                x2={i * 30}
                y2={400}
                stroke={COLORS.border}
                strokeWidth={0.5}
                opacity={0.3}
              />
            ))}
            {[...Array(14)].map((_, i) => (
              <Line
                key={`h-${i}`}
                x1={0}
                y1={i * 30}
                x2={600}
                y2={i * 30}
                stroke={COLORS.border}
                strokeWidth={0.5}
                opacity={0.3}
              />
            ))}

            {/* Floor Outline */}
            <Rect
              x={50}
              y={50}
              width={500}
              height={300}
              fill="none"
              stroke={COLORS.border}
              strokeWidth={2}
            />

            {/* Areas */}
            {selectedFloor.areas.map((area) => (
              <React.Fragment key={area.id}>
                {/* Area Rectangle */}
                <Rect
                  x={area.x}
                  y={area.y}
                  width={area.width}
                  height={area.height}
                  fill={getStatusColor(area.status)}
                  opacity={0.6}
                  stroke={COLORS.border}
                  strokeWidth={2}
                  onPress={() => handleAreaPress(area)}
                />

                {/* Progress Indicator */}
                {area.progress > 0 && (
                  <Rect
                    x={area.x}
                    y={area.y + area.height - 8}
                    width={(area.width * area.progress) / 100}
                    height={8}
                    fill={COLORS.completed}
                    opacity={0.8}
                  />
                )}

                {/* Area Label */}
                <SvgText
                  x={area.x + area.width / 2}
                  y={area.y + area.height / 2 - 5}
                  fontSize={12}
                  fontWeight="bold"
                  fill="#000000"
                  textAnchor="middle"
                >
                  {area.code}
                </SvgText>

                {/* Progress Text */}
                <SvgText
                  x={area.x + area.width / 2}
                  y={area.y + area.height / 2 + 10}
                  fontSize={10}
                  fill="#000000"
                  textAnchor="middle"
                >
                  {area.progress}%
                </SvgText>

                {/* Status Icon */}
                {area.status === 'completed' && (
                  <Circle
                    cx={area.x + area.width - 10}
                    cy={area.y + 10}
                    r={6}
                    fill={COLORS.completed}
                  />
                )}
                {area.status === 'delayed' && (
                  <Circle
                    cx={area.x + area.width - 10}
                    cy={area.y + 10}
                    r={6}
                    fill={COLORS.delayed}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Compass Rose */}
            <SvgText x={560} y={30} fontSize={14} fill={textColor} fontWeight="bold">
              N
            </SvgText>
            <Path
              d="M 570 40 L 575 50 L 570 45 L 565 50 Z"
              fill={COLORS.selected}
            />
          </Svg>
        </ScrollView>
      )}

      {/* Area Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDetailModal(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor }]} onPress={(e) => e.stopPropagation()}>
            {selectedArea && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={[styles.modalTitle, { color: textColor }]}>
                      {selectedArea.code} - {selectedArea.name}
                    </Text>
                    <Text style={[styles.modalSubtitle, { color: mutedColor }]}>
                      {selectedFloor?.name}
                    </Text>
                  </View>
                  <Pressable onPress={() => setShowDetailModal(false)}>
                    <Ionicons name="close-circle" size={32} color={mutedColor} />
                  </Pressable>
                </View>

                {/* Progress */}
                <View style={styles.modalProgress}>
                  <Text style={[styles.modalProgressLabel, { color: textColor }]}>
                    Tiến độ hoàn thành
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: COLORS.notStarted }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${selectedArea.progress}%`,
                          backgroundColor: getStatusColor(selectedArea.status),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.modalProgressValue, { color: textColor }]}>
                    {selectedArea.progress}%
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedArea.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {selectedArea.status === 'completed'
                      ? 'Hoàn thành'
                      : selectedArea.status === 'in-progress'
                      ? 'Đang thi công'
                      : selectedArea.status === 'delayed'
                      ? 'Trễ tiến độ'
                      : 'Chưa bắt đầu'}
                  </Text>
                </View>

                {/* Tasks */}
                <Text style={[styles.tasksTitle, { color: textColor }]}>
                  Công việc ({selectedArea.tasks.length})
                </Text>
                <ScrollView style={styles.tasksList}>
                  {selectedArea.tasks.map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <Ionicons
                        name={
                          task.status === 'completed'
                            ? 'checkmark-circle'
                            : task.status === 'in-progress'
                            ? 'time'
                            : 'ellipse-outline'
                        }
                        size={20}
                        color={
                          task.status === 'completed'
                            ? COLORS.completed
                            : task.status === 'in-progress'
                            ? COLORS.inProgress
                            : COLORS.notStarted
                        }
                      />
                      <Text
                        style={[
                          styles.taskText,
                          { color: textColor },
                          task.status === 'completed' && styles.taskCompleted,
                        ]}
                      >
                        {task.name}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Floor Selector
  floorSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  floorButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
  },
  floorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  floorProgress: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Legend
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Map
  mapContainer: {
    flex: 1,
  },
  mapContent: {
    padding: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalProgress: {
    marginBottom: 16,
  },
  modalProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  modalProgressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  tasksList: {
    maxHeight: 200,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
});
