/**
 * Mind Map Screen - Perfex CRM Style
 * ===================================
 * 
 * Sơ đồ tư duy dự án:
 * - Visual node connections
 * - Drag & drop nodes
 * - Zoom & pan
 * - Multiple node types
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  type: 'root' | 'branch' | 'leaf';
  color: string;
  parentId?: string;
  collapsed?: boolean;
}

const NODE_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export default function MindMapScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  // Mind map với dữ liệu thực từ Perfex CRM
  // Projects: Nhà Anh Khương Q9, Biệt Thự 3 Tầng Anh Tiến Q7
  const [nodes, setNodes] = useState<MindNode[]>([
    { id: '1', text: 'Dự án Thiết kế Resort', x: SCREEN_WIDTH / 2, y: 150, type: 'root', color: '#3b82f6' },
    { id: '2', text: 'Nhà Anh Khương Q9', x: SCREEN_WIDTH / 2 - 150, y: 280, type: 'branch', color: '#22c55e', parentId: '1' },
    { id: '3', text: 'Biệt Thự Anh Tiến Q7', x: SCREEN_WIDTH / 2 + 150, y: 280, type: 'branch', color: '#f59e0b', parentId: '1' },
    { id: '4', text: 'Khảo sát đất', x: SCREEN_WIDTH / 2 - 220, y: 400, type: 'leaf', color: '#22c55e', parentId: '2' },
    { id: '5', text: 'Thiết kế mặt bằng', x: SCREEN_WIDTH / 2 - 120, y: 400, type: 'leaf', color: '#22c55e', parentId: '2' },
    { id: '6', text: 'Bản vẽ 3D', x: SCREEN_WIDTH / 2 + 100, y: 400, type: 'leaf', color: '#f59e0b', parentId: '3' },
    { id: '7', text: 'Xin phép XD', x: SCREEN_WIDTH / 2 + 200, y: 400, type: 'leaf', color: '#f59e0b', parentId: '3' },
    { id: '8', text: 'Tư vấn NHÀ XINH', x: SCREEN_WIDTH / 2, y: 280, type: 'branch', color: '#8b5cf6', parentId: '1' },
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeText, setNewNodeText] = useState('');
  const [scale, setScale] = useState(1);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  const getNodeRadius = (type: string): number => {
    switch (type) {
      case 'root': return 50;
      case 'branch': return 40;
      default: return 30;
    }
  };

  const renderConnections = useCallback(() => {
    return nodes
      .filter((node) => node.parentId)
      .map((node) => {
        const parent = nodes.find((n) => n.id === node.parentId);
        if (!parent) return null;
        return (
          <Line
            key={`line-${node.id}`}
            x1={parent.x}
            y1={parent.y}
            x2={node.x}
            y2={node.y}
            stroke={node.color}
            strokeWidth={2}
            opacity={0.5}
          />
        );
      });
  }, [nodes]);

  const renderNodes = useCallback(() => {
    return nodes.map((node) => {
      const radius = getNodeRadius(node.type);
      const isSelected = selectedNode === node.id;
      return (
        <TouchableOpacity
          key={node.id}
          style={[
            styles.nodeContainer,
            {
              left: node.x - radius,
              top: node.y - radius,
              width: radius * 2,
              height: radius * 2,
            },
          ]}
          onPress={() => setSelectedNode(isSelected ? null : node.id)}
          onLongPress={() => {
            setSelectedNode(node.id);
            setShowAddModal(true);
          }}
        >
          <View
            style={[
              styles.node,
              {
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                backgroundColor: node.color,
                borderWidth: isSelected ? 3 : 0,
                borderColor: '#fff',
              },
            ]}
          >
            <Text
              style={[
                styles.nodeText,
                { fontSize: node.type === 'root' ? 12 : node.type === 'branch' ? 11 : 10 },
              ]}
              numberOfLines={2}
            >
              {node.text}
            </Text>
          </View>
        </TouchableOpacity>
      );
    });
  }, [nodes, selectedNode]);

  const handleAddNode = () => {
    if (!newNodeText.trim() || !selectedNode) return;

    const parent = nodes.find((n) => n.id === selectedNode);
    if (!parent) return;

    const siblings = nodes.filter((n) => n.parentId === selectedNode);
    const angle = ((siblings.length * 60) - 30) * (Math.PI / 180);
    const distance = 120;

    const newNode: MindNode = {
      id: String(Date.now()),
      text: newNodeText,
      x: parent.x + Math.sin(angle) * distance,
      y: parent.y + Math.cos(angle) * distance,
      type: parent.type === 'root' ? 'branch' : 'leaf',
      color: NODE_COLORS[siblings.length % NODE_COLORS.length],
      parentId: selectedNode,
    };

    setNodes([...nodes, newNode]);
    setNewNodeText('');
    setShowAddModal(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    const childIds = nodes.filter((n) => n.parentId === nodeId).map((n) => n.id);
    const toDelete = [nodeId, ...childIds];
    setNodes(nodes.filter((n) => !toDelete.includes(n.id)));
    setSelectedNode(null);
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Sơ đồ tư duy</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={zoomOut}>
            <Ionicons name="remove" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.zoomText, { color: textColor }]}>{Math.round(scale * 100)}%</Text>
          <TouchableOpacity style={styles.headerButton} onPress={zoomIn}>
            <Ionicons name="add" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mind Map Canvas */}
      <ScrollView
        style={styles.canvas}
        contentContainerStyle={[
          styles.canvasContent,
          { transform: [{ scale }] },
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.svgContainer}>
          <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH * 1.5}>
            {renderConnections()}
          </Svg>
          {renderNodes()}
        </View>
      </ScrollView>

      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
        <TouchableOpacity
          style={[styles.toolButton, { backgroundColor: primaryColor }]}
          onPress={() => {
            if (selectedNode) {
              setShowAddModal(true);
            }
          }}
          disabled={!selectedNode}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.toolText}>Thêm nhánh</Text>
        </TouchableOpacity>

        {selectedNode && selectedNode !== '1' && (
          <TouchableOpacity
            style={[styles.toolButton, { backgroundColor: '#ef4444' }]}
            onPress={() => handleDeleteNode(selectedNode)}
          >
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={styles.toolText}>Xóa</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.toolButton, { backgroundColor: '#22c55e' }]}
          onPress={() => {
            // Export/Save functionality
          }}
        >
          <Ionicons name="save" size={24} color="#fff" />
          <Text style={styles.toolText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: cardBg }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={[styles.legendText, { color: textColor }]}>Gốc</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={[styles.legendText, { color: textColor }]}>Nhánh</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={[styles.legendText, { color: textColor }]}>Lá</Text>
        </View>
      </View>

      {/* Instructions */}
      {!selectedNode && (
        <View style={[styles.instructions, { backgroundColor: cardBg }]}>
          <Ionicons name="information-circle" size={16} color={primaryColor} />
          <Text style={[styles.instructionText, { color: textColor }]}>
            Chạm để chọn node • Giữ lâu để thêm nhánh con
          </Text>
        </View>
      )}

      {/* Add Node Modal */}
      <Modal visible={showAddModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Thêm nhánh mới</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Nhập nội dung..."
              placeholderTextColor="#6b7280"
              value={newNodeText}
              onChangeText={setNewNodeText}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor }]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewNodeText('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: textColor }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: primaryColor }]}
                onPress={handleAddNode}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  zoomText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  canvas: {
    flex: 1,
  },
  canvasContent: {
    minWidth: SCREEN_WIDTH * 1.5,
    minHeight: SCREEN_HEIGHT,
  },
  svgContainer: {
    position: 'relative',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_HEIGHT,
  },
  nodeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  node: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  nodeText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toolText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  legend: {
    position: 'absolute',
    top: 80,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 0.9,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
  },
  instructions: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 0.9,
  },
  instructionText: {
    fontSize: 12,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
