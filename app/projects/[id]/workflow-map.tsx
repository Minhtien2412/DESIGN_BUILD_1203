import FloatingActionButton from '@/components/ui/floating-action-button';
import { Loader } from '@/components/ui/loader';
import { useSettings } from '@/context/settings-context';
import { WorkflowNode, WorkflowPhase, WorkflowService } from '@/services/api/workflow.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NODE_SIZE = 60;
const MILESTONE_SIZE = 80;

const STATUS_COLORS = {
  'not-started': '#9ca3af',
  'in-progress': '#3b82f6',
  'completed': '#0066CC',
  'delayed': '#000000',
  'blocked': '#0066CC'
};

export default function WorkflowMapScreen() {
  const { id: projectId } = useLocalSearchParams();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [phases, setPhases] = useState<WorkflowPhase[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [workflow, statsData] = await Promise.all([
        WorkflowService.getWorkflow(projectId as string),
        WorkflowService.getStats(projectId as string)
      ]);

      setNodes(workflow.nodes);
      setPhases(workflow.phases);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải workflow map');
    } finally {
      setLoading(false);
    }
  };

  const handleNodePress = (node: WorkflowNode) => {
    setSelectedNode(node);
    setShowNodeModal(true);
  };

  const handleCompleteNode = async () => {
    if (!selectedNode) return;

    try {
      await WorkflowService.completeNode(selectedNode.id);
      setShowNodeModal(false);
      loadData();
      Alert.alert('Thành công', 'Đã đánh dấu hoàn thành');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật');
    }
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${selectedNode.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await WorkflowService.deleteNode(selectedNode.id);
              setShowNodeModal(false);
              loadData();
              Alert.alert('Thành công', 'Đã xóa node');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa');
            }
          }
        }
      ]
    );
  };

  const renderConnection = (fromNode: WorkflowNode, toNode: WorkflowNode) => {
    const x1 = fromNode.position.x + (fromNode.type === 'milestone' ? MILESTONE_SIZE / 2 : NODE_SIZE / 2);
    const y1 = fromNode.position.y + (fromNode.type === 'milestone' ? MILESTONE_SIZE / 2 : NODE_SIZE / 2);
    const x2 = toNode.position.x + (toNode.type === 'milestone' ? MILESTONE_SIZE / 2 : NODE_SIZE / 2);
    const y2 = toNode.position.y + (toNode.type === 'milestone' ? MILESTONE_SIZE / 2 : NODE_SIZE / 2);

    // Curved path for metro-like look
    const midX = (x1 + x2) / 2;
    const pathData = `M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2}, ${x2} ${y2}`;

    return (
      <Path
        key={`${fromNode.id}-${toNode.id}`}
        d={pathData}
        stroke={fromNode.color || '#9ca3af'}
        strokeWidth="3"
        fill="none"
        opacity={0.6}
      />
    );
  };

  const renderNode = (node: WorkflowNode) => {
    const isMilestone = node.type === 'milestone';
    const size = isMilestone ? MILESTONE_SIZE : NODE_SIZE;
    const color = STATUS_COLORS[node.status];

    return (
      <TouchableOpacity
        key={node.id}
        style={[
          styles.nodeContainer,
          {
            left: node.position.x,
            top: node.position.y,
            width: size,
            height: size
          }
        ]}
        onPress={() => handleNodePress(node)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.node,
            isMilestone && styles.milestone,
            {
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: size / 2
            }
          ]}
        >
          {node.icon && (
            <Ionicons name={node.icon as any} size={isMilestone ? 32 : 24} color="#fff" />
          )}
          {!node.icon && node.status === 'completed' && (
            <Ionicons name="checkmark" size={isMilestone ? 32 : 24} color="#fff" />
          )}
          {!node.icon && node.status === 'in-progress' && (
            <Text style={[styles.progressText, { fontSize: isMilestone ? 16 : 12 }]}>
              {node.progress}%
            </Text>
          )}
        </View>
        <View style={styles.nodeLabel}>
          <Text style={styles.nodeLabelText} numberOfLines={2}>
            {node.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loader />;
  }

  // Calculate SVG dimensions
  const maxX = Math.max(...nodes.map(n => n.position.x)) + 200;
  const maxY = Math.max(...nodes.map(n => n.position.y)) + 200;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workflow Map</Text>
        <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      {stats && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.overallProgress}%</Text>
            <Text style={styles.statLabel}>Tiến độ</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#0066CC' }]}>{stats.completedNodes}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#3b82f6' }]}>{stats.inProgressNodes}</Text>
            <Text style={styles.statLabel}>Đang làm</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#9ca3af' }]}>
              {stats.totalNodes - stats.completedNodes - stats.inProgressNodes}
            </Text>
            <Text style={styles.statLabel}>Chưa bắt đầu</Text>
          </View>
        </View>
      )}

      {/* Phase Legend */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.legendContainer}
        contentContainerStyle={styles.legendContent}
      >
        {phases.map(phase => (
          <View key={phase.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: phase.color }]} />
            <Text style={styles.legendText}>{phase.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Workflow Map */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mapScrollHorizontal}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.mapScrollVertical}
        >
          <View style={[styles.mapContainer, { width: maxX, height: maxY }]}>
            {/* SVG for connections */}
            <Svg
              width={maxX}
              height={maxY}
              style={StyleSheet.absoluteFill}
            >
              {nodes.map(node => {
                return node.dependencies.map(depId => {
                  const fromNode = nodes.find(n => n.id === depId);
                  if (fromNode) {
                    return renderConnection(fromNode, node);
                  }
                  return null;
                });
              })}
            </Svg>

            {/* Nodes */}
            {nodes.map(renderNode)}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setScale(Math.min(scale + 0.2, 2))}
        >
          <Ionicons name="add" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setScale(Math.max(scale - 0.2, 0.5))}
        >
          <Ionicons name="remove" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setScale(1)}
        >
          <Ionicons name="contract" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Node Detail Modal */}
      <Modal
        visible={showNodeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNodeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNodeModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedNode && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalStatusBadge,
                      { backgroundColor: STATUS_COLORS[selectedNode.status] }
                    ]}
                  >
                    <Text style={styles.modalStatusText}>
                      {selectedNode.status.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowNodeModal(false)}>
                    <Ionicons name="close" size={28} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedNode.title}</Text>
                {selectedNode.description && (
                  <Text style={styles.modalDescription}>{selectedNode.description}</Text>
                )}

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="analytics" size={16} color="#6b7280" />
                    <Text style={styles.modalInfoText}>Tiến độ: {selectedNode.progress}%</Text>
                  </View>

                  {selectedNode.startDate && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text style={styles.modalInfoText}>
                        Bắt đầu: {new Date(selectedNode.startDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  )}

                  {selectedNode.endDate && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar" size={16} color="#6b7280" />
                      <Text style={styles.modalInfoText}>
                        Kết thúc: {new Date(selectedNode.endDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  )}

                  {selectedNode.assignedTo && selectedNode.assignedTo.length > 0 && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="people" size={16} color="#6b7280" />
                      <Text style={styles.modalInfoText}>
                        {selectedNode.assignedTo.join(', ')}
                      </Text>
                    </View>
                  )}

                  {selectedNode.dependencies.length > 0 && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="git-network" size={16} color="#6b7280" />
                      <Text style={styles.modalInfoText}>
                        {selectedNode.dependencies.length} phụ thuộc
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  {selectedNode.status !== 'completed' && (
                    <TouchableOpacity
                      style={styles.modalActionButton}
                      onPress={handleCompleteNode}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
                      <Text style={styles.modalActionText}>Hoàn thành</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={handleDeleteNode}
                  >
                    <Ionicons name="trash" size={20} color="#000000" />
                    <Text style={[styles.modalActionText, { color: '#000000' }]}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Floating Action Button */}
      <FloatingActionButton
        projectId={projectId as string}
        position={settings.fabPosition}
        size={settings.fabSize}
        enabled={settings.fabEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937'
  },
  refreshButton: {
    padding: 8
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937'
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4
  },
  legendContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  legendContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600'
  },
  mapScrollHorizontal: {
    flex: 1
  },
  mapScrollVertical: {
    flex: 1
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: '#fafafa'
  },
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center'
  },
  node: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  milestone: {
    borderWidth: 4,
    borderColor: '#fff'
  },
  progressText: {
    color: '#fff',
    fontWeight: '800'
  },
  nodeLabel: {
    marginTop: 8,
    maxWidth: 100,
    alignItems: 'center'
  },
  nodeLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center'
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    gap: 8
  },
  zoomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalStatusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  modalStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff'
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8
  },
  modalDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 20
  },
  modalInfo: {
    gap: 12,
    marginBottom: 24
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  modalInfoText: {
    fontSize: 14,
    color: '#374151'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 8
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0066CC'
  }
});
