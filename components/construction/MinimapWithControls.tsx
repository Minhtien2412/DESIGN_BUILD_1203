import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

// Types
export type FloorArea = {
  id: string;
  code: string;
  name: string;
  type: 'floor' | 'column' | 'wall' | 'beam' | 'room';
  x: number;
  y: number;
  width: number;
  height: number;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started' | 'delayed';
  tasks: {
    id: string;
    name: string;
    status: 'completed' | 'in-progress' | 'not-started';
    assignedWorker?: string;
  }[];
};

export type BuildingFloor = {
  id: string;
  level: number;
  name: string;
  height: number;
  areas: FloorArea[];
  overallProgress: number;
};

type Props = {
  floors: BuildingFloor[];
  projectName: string;
  onAreaPress?: (area: FloorArea) => void;
  isAdmin?: boolean;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;

const COLORS = {
  completed: '#14B159',
  inProgress: '#FFA84D',
  notStarted: '#E5E7EB',
  delayed: '#E82A34',
  border: '#9CA3AF',
  selected: '#0D9488',
  primary: '#0D9488',
};

export default function MinimapWithControls({ floors, projectName, onAreaPress, isAdmin = false }: Props) {
  const params = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const [selectedFloor, setSelectedFloor] = useState<BuildingFloor>(floors[0]);
  const [selectedArea, setSelectedArea] = useState<FloorArea | null>(null);
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [editProgress, setEditProgress] = useState('0');

  const getStatusColor = (status: FloorArea['status']) => {
    switch (status) {
      case 'completed': return COLORS.completed;
      case 'in-progress': return COLORS.inProgress;
      case 'delayed': return COLORS.delayed;
      default: return COLORS.notStarted;
    }
  };

  const handleAreaSelect = (area: FloorArea) => {
    setSelectedArea(area);
    setShowQuickActions(true);
    onAreaPress?.(area);
  };

  // Quick Actions for selected area
  const quickActions = [
    {
      id: 'edit',
      icon: 'pencil',
      label: 'Sửa',
      color: primaryColor,
      onPress: () => {
        setShowQuickActions(false);
        router.push(`/projects/${params.id}/minimap-editor`);
      },
    },
    {
      id: 'progress',
      icon: 'trending-up',
      label: 'Tiến độ',
      color: COLORS.inProgress,
      onPress: () => {
        setShowQuickActions(false);
        setEditProgress(selectedArea?.progress.toString() || '0');
        setShowProgressModal(true);
      },
    },
    {
      id: 'delete',
      icon: 'trash',
      label: 'Xóa',
      color: COLORS.delayed,
      onPress: () => {
        setShowQuickActions(false);
        // Handle delete
      },
    },
    {
      id: 'plan',
      icon: 'calendar',
      label: 'Kế hoạch',
      color: '#666666',
      onPress: () => {
        setShowQuickActions(false);
        setShowPlanningModal(true);
      },
    },
  ];

  // FAB Menu items
  const fabMenuItems = [
    {
      id: 'add-area',
      icon: 'add-circle',
      label: 'Thêm khu vực',
      color: primaryColor,
      onPress: () => {
        setShowFABMenu(false);
        router.push(`/projects/${params.id}/minimap-editor`);
      },
    },
    {
      id: 'add-floor',
      icon: 'layers',
      label: 'Thêm tầng',
      color: '#0D9488',
      onPress: () => {
        setShowFABMenu(false);
        // Handle add floor
      },
    },
    {
      id: 'planning',
      icon: 'calendar-outline',
      label: 'Lập kế hoạch',
      color: '#666666',
      onPress: () => {
        setShowFABMenu(false);
        setShowPlanningModal(true);
      },
    },
    {
      id: 'export',
      icon: 'download-outline',
      label: 'Xuất báo cáo',
      color: '#0D9488',
      onPress: () => {
        setShowFABMenu(false);
        // Handle export
      },
    },
  ];

  // Statistics
  const totalAreas = selectedFloor.areas.length;
  const completedAreas = selectedFloor.areas.filter(a => a.status === 'completed').length;

  // Render grid
  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i <= SVG_WIDTH; i += 30) {
      lines.push(
        <Line
          key={`v${i}`}
          x1={i}
          y1={0}
          x2={i}
          y2={SVG_HEIGHT}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      );
    }
    for (let i = 0; i <= SVG_HEIGHT; i += 30) {
      lines.push(
        <Line
          key={`h${i}`}
          x1={0}
          y1={i}
          x2={SVG_WIDTH}
          y2={i}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      );
    }
    return lines;
  };

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
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
              {selectedFloor.overallProgress}%
            </Text>
            <Text style={[styles.statLabel, { color: mutedColor }]}>Hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Floor Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.floorSelector}>
        {floors.map((floor) => (
          <Pressable
            key={floor.id}
            style={[
              styles.floorButton,
              { borderColor },
              selectedFloor.id === floor.id && { backgroundColor: primaryColor, borderColor: primaryColor },
            ]}
            onPress={() => setSelectedFloor(floor)}
          >
            <Text
              style={[
                styles.floorButtonText,
                { color: selectedFloor.id === floor.id ? '#FFF' : textColor },
              ]}
            >
              {floor.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Canvas */}
      <ScrollView style={styles.canvasScroll} contentContainerStyle={styles.canvasContainer}>
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          {/* Grid */}
          {renderGrid()}

          {/* Areas */}
          {selectedFloor.areas.map((area) => (
            <React.Fragment key={area.id}>
              <Rect
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                fill={getStatusColor(area.status)}
                fillOpacity={0.3}
                stroke={selectedArea?.id === area.id ? COLORS.selected : getStatusColor(area.status)}
                strokeWidth={selectedArea?.id === area.id ? 3 : 2}
                onPress={() => handleAreaSelect(area)}
              />
              <SvgText
                x={area.x + area.width / 2}
                y={area.y + area.height / 2}
                fontSize={14}
                fontWeight="bold"
                fill="#374151"
                textAnchor="middle"
              >
                {area.code}
              </SvgText>
              <SvgText
                x={area.x + area.width / 2}
                y={area.y + area.height / 2 + 18}
                fontSize={12}
                fill="#6B7280"
                textAnchor="middle"
              >
                {area.progress}%
              </SvgText>
            </React.Fragment>
          ))}

          {/* Compass */}
          <Circle cx={SVG_WIDTH - 40} cy={40} r={25} fill="#FFF" stroke={COLORS.border} strokeWidth={2} />
          <SvgText x={SVG_WIDTH - 40} y={30} fontSize={10} fill={COLORS.primary} textAnchor="middle" fontWeight="bold">
            N
          </SvgText>
        </Svg>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor, borderColor }]}>
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
            <Text style={[styles.legendText, { color: mutedColor }]}>Trễ hạn</Text>
          </View>
        </View>
      </ScrollView>

      {/* Quick Actions (appears when area selected) */}
      {showQuickActions && selectedArea && (
        <View style={[styles.quickActionsPanel, { backgroundColor, borderTopColor: borderColor }]}>
          <View style={styles.quickActionsHeader}>
            <Text style={[styles.quickActionsTitle, { color: textColor }]}>
              {selectedArea.code} - {selectedArea.name}
            </Text>
            <Pressable onPress={() => setShowQuickActions(false)}>
              <Ionicons name="close" size={24} color={mutedColor} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsList}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={[styles.quickActionButton, { borderColor }]}
                onPress={action.onPress}
              >
                <Ionicons name={action.icon as any} size={24} color={action.color} />
                <Text style={[styles.quickActionLabel, { color: textColor }]}>{action.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Floating Action Button (FAB) - Only for admin */}
      {isAdmin && (
        <>
          <Pressable
            style={[styles.fab, { backgroundColor: primaryColor }]}
            onPress={() => setShowFABMenu(!showFABMenu)}
          >
            <Ionicons name={showFABMenu ? 'close' : 'add'} size={28} color="#FFF" />
          </Pressable>

          {/* FAB Menu */}
          {showFABMenu && (
            <View style={styles.fabMenu}>
              {fabMenuItems.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={[styles.fabMenuItem, { backgroundColor: item.color }]}
                  onPress={item.onPress}
                >
                  <Ionicons name={item.icon as any} size={20} color="#FFF" />
                  <Text style={styles.fabMenuLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}

      {/* Progress Modal */}
      <Modal
        visible={showProgressModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Cập nhật tiến độ</Text>
            
            <Text style={[styles.modalLabel, { color: textColor }]}>
              {selectedArea?.code} - {selectedArea?.name}
            </Text>

            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              placeholder="Tiến độ (0-100)"
              placeholderTextColor={mutedColor}
              keyboardType="number-pad"
              value={editProgress}
              onChangeText={setEditProgress}
            />

            <View style={styles.progressPreview}>
              <Text style={[styles.progressLabel, { color: mutedColor }]}>Preview:</Text>
              <View style={[styles.progressBar, { backgroundColor: COLORS.notStarted }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(Math.max(parseInt(editProgress) || 0, 0), 100)}%`,
                      backgroundColor: COLORS.inProgress,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressPercent, { color: textColor }]}>
                {Math.min(Math.max(parseInt(editProgress) || 0, 0), 100)}%
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { borderColor }]}
                onPress={() => setShowProgressModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: primaryColor }]}
                onPress={() => {
                  // Handle update progress
                  setShowProgressModal(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Cập nhật</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Planning Modal */}
      <Modal
        visible={showPlanningModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlanningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.planningModal, { backgroundColor }]}>
            <View style={[styles.planningHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Lập kế hoạch</Text>
              <Pressable onPress={() => setShowPlanningModal(false)}>
                <Ionicons name="close" size={24} color={mutedColor} />
              </Pressable>
            </View>

            <ScrollView style={styles.planningContent}>
              <View style={styles.planningSection}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Thông tin khu vực</Text>
                <Text style={[styles.sectionText, { color: mutedColor }]}>
                  {selectedArea?.code} - {selectedArea?.name || 'Chưa chọn khu vực'}
                </Text>
              </View>

              <View style={styles.planningSection}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Thời gian dự kiến</Text>
                <Pressable style={[styles.dateButton, { borderColor }]}>
                  <Ionicons name="calendar-outline" size={20} color={primaryColor} />
                  <Text style={[styles.dateButtonText, { color: textColor }]}>Chọn ngày bắt đầu</Text>
                </Pressable>
                <Pressable style={[styles.dateButton, { borderColor }]}>
                  <Ionicons name="calendar-outline" size={20} color={primaryColor} />
                  <Text style={[styles.dateButtonText, { color: textColor }]}>Chọn ngày kết thúc</Text>
                </Pressable>
              </View>

              <View style={styles.planningSection}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Phân công</Text>
                <Pressable style={[styles.assignButton, { borderColor }]}>
                  <MaterialCommunityIcons name="account-hard-hat" size={20} color={primaryColor} />
                  <Text style={[styles.assignButtonText, { color: textColor }]}>Chọn thợ</Text>
                </Pressable>
              </View>

              <View style={styles.planningSection}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Ghi chú</Text>
                <TextInput
                  style={[styles.notesInput, { borderColor, color: textColor }]}
                  placeholder="Nhập ghi chú..."
                  placeholderTextColor={mutedColor}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={[styles.planningFooter, { borderTopColor: borderColor }]}>
              <Pressable
                style={[styles.planningButton, { backgroundColor: primaryColor }]}
                onPress={() => setShowPlanningModal(false)}
              >
                <Text style={styles.planningButtonText}>Lưu kế hoạch</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
  },
  floorSelector: {
    maxHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  floorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  floorButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  canvasScroll: {
    flex: 1,
  },
  canvasContainer: {
    padding: 16,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
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
  },
  quickActionsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickActionsList: {
    flexDirection: 'row',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    marginRight: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabMenu: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    gap: 12,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabMenuLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  progressPreview: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 12,
    marginBottom: 8,
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
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  planningModal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  planningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  planningContent: {
    flex: 1,
    padding: 20,
  },
  planningSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  dateButtonText: {
    fontSize: 14,
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  assignButtonText: {
    fontSize: 14,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  planningFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  planningButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  planningButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
