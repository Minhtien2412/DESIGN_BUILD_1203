/**
 * Construction Progress Vector Editor (Mindmap)
 * Features:
 * - Interactive flowchart with drag-and-drop nodes
 * - Editable vector connections with bezier curves
 * - Zoom in/out with pinch gesture
 * - Pan and scroll canvas
 * - Add/edit/delete nodes and connections
 * - Multi-project management (create, load, delete projects)
 * - Template system for quick project setup
 * - Undo/Redo history
 * - Export/Import JSON
 * - Settings panel with grid snap, auto-save
 * - Group/Ungroup nodes
 * - Quick actions menu
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { DeviceMotion } from 'expo-sensors';
import * as ExpoSharing from 'expo-sharing';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Defs, G, Marker, Path, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== TYPES ====================

type VectorNodeType = 'rect' | 'circle' | 'pill' | 'group';

interface VectorNode {
  id: string;
  x: number;
  y: number;
  label: string;
  description?: string;
  notes?: string;
  images?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number; // 0-100
  color?: string;
  startDate?: string;
  endDate?: string;
  assignee?: string;
  /**
   * Kiểu node để vẽ giống Figma: hình chữ nhật, tròn, pill, hoặc group lớn.
   * Mặc định là 'rect' để tương thích dữ liệu cũ.
   */
  type?: VectorNodeType;
  /** ID of parent group if this node belongs to a group */
  groupId?: string;
  /** Array of child node IDs if this is a group node */
  groupChildren?: string[];
  /** Parent node ID for hierarchical relationship */
  parentId?: string;
  /** Hierarchy level: 0 = root, 1 = child, 2 = grandchild, etc. */
  level?: number;
  /** Prototype link: URL, route path, or action */
  prototypeLink?: string;
  /** Link type: 'url', 'route', 'action' */
  linkType?: 'url' | 'route' | 'action';
}

interface VectorConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  type: 'direct' | 'bezier' | 'orthogonal';
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  controlPoints?: { x: number; y: number }[];
  /** Importance level: 1-5 (affects stroke width) */
  importance?: 1 | 2 | 3 | 4 | 5;
  /** Relationship type for semantic meaning */
  relationshipType?: 'parent-child' | 'dependency' | 'reference' | 'flow';
  /** Show arrow at start (bidirectional) */
  showStartArrow?: boolean;
  /** Prototype link: URL, route path, or action */
  prototypeLink?: string;
  /** Link type: 'url', 'route', 'action' */
  linkType?: 'url' | 'route' | 'action';
}

interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// ==================== PROJECT TYPES ====================

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
}

interface ProjectData {
  project: Project;
  nodes: VectorNode[];
  connections: VectorConnection[];
  canvas: CanvasState;
}

interface HistoryState {
  nodes: VectorNode[];
  connections: VectorConnection[];
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: VectorNode[];
  connections: VectorConnection[];
}

interface AppSettings {
  gridSnap: boolean;
  gridSize: number;
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  showGrid: boolean;
  defaultNodeType: VectorNodeType;
}

// ==================== CONSTANTS ====================

const NODE_WIDTH = 140;
const NODE_HEIGHT = 80;
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1500;
const MIN_SCALE = 0.3;
const MAX_SCALE = 3;
const STORAGE_KEY = 'construction_progress_vector_v2';
const PROJECTS_LIST_KEY = 'construction_progress_projects';
const SETTINGS_KEY = 'construction_progress_settings';
const MAX_HISTORY = 50;

const DEFAULT_SETTINGS: AppSettings = {
  gridSnap: false,
  gridSize: 20,
  autoSave: true,
  autoSaveInterval: 30,
  showGrid: false,
  defaultNodeType: 'rect',
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pending: { bg: '#F5F5F5', border: '#9E9E9E', text: '#616161' },
  in_progress: { bg: '#FFF8E1', border: '#FFB300', text: '#FF8F00' },
  completed: { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32' },
  delayed: { bg: '#FFEBEE', border: '#F44336', text: '#C62828' },
};

const CONNECTION_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];

// ==================== PROJECT TEMPLATES ====================

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Dự án trống',
    description: 'Bắt đầu từ đầu với canvas trống',
    icon: 'document-outline',
    nodes: [],
    connections: [],
  },
  {
    id: 'nha_pho',
    name: 'Nhà phố',
    description: 'Template cho xây dựng nhà phố 3-5 tầng',
    icon: 'home-outline',
    nodes: [
      { id: 'START', x: 100, y: 80, label: 'Khởi công', status: 'pending', progress: 0, type: 'circle', color: '#4CAF50' },
      { id: 'MONG', x: 280, y: 80, label: 'Móng & Cọc', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'KHUNG', x: 460, y: 80, label: 'Khung kết cấu', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'MAI', x: 640, y: 80, label: 'Mái & Chống thấm', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'TUONG', x: 280, y: 200, label: 'Xây tường bao', status: 'pending', progress: 0, type: 'pill', color: '#E3F2FD' },
      { id: 'ME', x: 460, y: 200, label: 'Hệ thống ME', status: 'pending', progress: 0, type: 'pill', color: '#E3F2FD' },
      { id: 'HOAN_THIEN', x: 640, y: 200, label: 'Hoàn thiện', status: 'pending', progress: 0, type: 'group', color: '#C8E6C9' },
      { id: 'SON', x: 650, y: 280, label: 'Sơn', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
      { id: 'GACH', x: 650, y: 310, label: 'Ốp lát gạch', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
      { id: 'CUA', x: 650, y: 340, label: 'Cửa & Kính', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
      { id: 'NGHIEM_THU', x: 460, y: 400, label: 'Nghiệm thu', status: 'pending', progress: 0, type: 'circle', color: '#2196F3' },
    ],
    connections: [
      { id: 'C1', fromNodeId: 'START', toNodeId: 'MONG', type: 'direct', color: '#2196F3' },
      { id: 'C2', fromNodeId: 'MONG', toNodeId: 'KHUNG', type: 'direct', color: '#2196F3' },
      { id: 'C3', fromNodeId: 'KHUNG', toNodeId: 'MAI', type: 'direct', color: '#2196F3' },
      { id: 'C4', fromNodeId: 'KHUNG', toNodeId: 'TUONG', type: 'bezier', color: '#FF9800' },
      { id: 'C5', fromNodeId: 'TUONG', toNodeId: 'ME', type: 'direct', color: '#FF9800' },
      { id: 'C6', fromNodeId: 'ME', toNodeId: 'HOAN_THIEN', type: 'direct', color: '#FF9800' },
      { id: 'C7', fromNodeId: 'HOAN_THIEN', toNodeId: 'SON', type: 'direct', color: '#4CAF50' },
      { id: 'C8', fromNodeId: 'HOAN_THIEN', toNodeId: 'GACH', type: 'direct', color: '#4CAF50' },
      { id: 'C9', fromNodeId: 'HOAN_THIEN', toNodeId: 'CUA', type: 'direct', color: '#4CAF50' },
      { id: 'C10', fromNodeId: 'MAI', toNodeId: 'NGHIEM_THU', type: 'bezier', color: '#2196F3', style: 'dashed' },
      { id: 'C11', fromNodeId: 'CUA', toNodeId: 'NGHIEM_THU', type: 'bezier', color: '#4CAF50', style: 'dashed' },
    ],
  },
  {
    id: 'chung_cu',
    name: 'Chung cư / Cao ốc',
    description: 'Template cho dự án chung cư nhiều tầng',
    icon: 'business-outline',
    nodes: [
      { id: 'CHUAN_BI', x: 100, y: 100, label: 'Chuẩn bị mặt bằng', status: 'pending', progress: 0, type: 'circle', color: '#4CAF50' },
      { id: 'EP_COC', x: 300, y: 100, label: 'Ép cọc', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'MONG', x: 500, y: 100, label: 'Đài móng', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'HAM', x: 700, y: 100, label: 'Tầng hầm', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'THAN', x: 400, y: 250, label: 'Phần thân', status: 'pending', progress: 0, type: 'group', color: '#E3F2FD' },
      { id: 'TANG_1_5', x: 410, y: 300, label: 'Tầng 1-5', status: 'pending', progress: 0, type: 'pill', color: '#BBDEFB' },
      { id: 'TANG_6_10', x: 410, y: 330, label: 'Tầng 6-10', status: 'pending', progress: 0, type: 'pill', color: '#BBDEFB' },
      { id: 'TANG_11_15', x: 410, y: 360, label: 'Tầng 11-15', status: 'pending', progress: 0, type: 'pill', color: '#BBDEFB' },
      { id: 'MAI_ROOF', x: 600, y: 250, label: 'Mái & Kỹ thuật', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'NOI_THAT', x: 400, y: 450, label: 'Nội thất căn hộ', status: 'pending', progress: 0, type: 'group', color: '#C8E6C9' },
      { id: 'BAN_GIAO', x: 600, y: 450, label: 'Bàn giao', status: 'pending', progress: 0, type: 'circle', color: '#2196F3' },
    ],
    connections: [
      { id: 'CC1', fromNodeId: 'CHUAN_BI', toNodeId: 'EP_COC', type: 'direct', color: '#2196F3' },
      { id: 'CC2', fromNodeId: 'EP_COC', toNodeId: 'MONG', type: 'direct', color: '#2196F3' },
      { id: 'CC3', fromNodeId: 'MONG', toNodeId: 'HAM', type: 'direct', color: '#2196F3' },
      { id: 'CC4', fromNodeId: 'HAM', toNodeId: 'THAN', type: 'bezier', color: '#FF9800' },
      { id: 'CC5', fromNodeId: 'THAN', toNodeId: 'TANG_1_5', type: 'direct', color: '#4CAF50' },
      { id: 'CC6', fromNodeId: 'THAN', toNodeId: 'TANG_6_10', type: 'direct', color: '#4CAF50' },
      { id: 'CC7', fromNodeId: 'THAN', toNodeId: 'TANG_11_15', type: 'direct', color: '#4CAF50' },
      { id: 'CC8', fromNodeId: 'THAN', toNodeId: 'MAI_ROOF', type: 'direct', color: '#2196F3' },
      { id: 'CC9', fromNodeId: 'TANG_11_15', toNodeId: 'NOI_THAT', type: 'bezier', color: '#FF9800', style: 'dashed' },
      { id: 'CC10', fromNodeId: 'NOI_THAT', toNodeId: 'BAN_GIAO', type: 'direct', color: '#4CAF50' },
      { id: 'CC11', fromNodeId: 'MAI_ROOF', toNodeId: 'BAN_GIAO', type: 'bezier', color: '#2196F3', style: 'dashed' },
    ],
  },
  {
    id: 'biet_thu',
    name: 'Biệt thự',
    description: 'Template cho xây dựng biệt thự với sân vườn',
    icon: 'leaf-outline',
    nodes: [
      { id: 'KHOI_CONG', x: 100, y: 150, label: 'Khởi công', status: 'pending', progress: 0, type: 'circle', color: '#4CAF50' },
      { id: 'SAN_VUON', x: 100, y: 300, label: 'Sân vườn', status: 'pending', progress: 0, type: 'group', color: '#C8E6C9' },
      { id: 'HO_BOI', x: 110, y: 350, label: 'Hồ bơi', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
      { id: 'CAY_XANH', x: 110, y: 380, label: 'Cây xanh', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
      { id: 'MONG_BT', x: 300, y: 100, label: 'Móng biệt thự', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'KHUNG_BT', x: 500, y: 100, label: 'Khung kết cấu', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'MAI_BT', x: 700, y: 100, label: 'Mái ngói/kính', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'NOI_THAT_BT', x: 500, y: 250, label: 'Nội thất cao cấp', status: 'pending', progress: 0, type: 'group', color: '#E3F2FD' },
      { id: 'PHONG_KHACH', x: 510, y: 300, label: 'Phòng khách', status: 'pending', progress: 0, type: 'pill', color: '#BBDEFB' },
      { id: 'PHONG_NGU', x: 510, y: 330, label: 'Phòng ngủ', status: 'pending', progress: 0, type: 'pill', color: '#BBDEFB' },
      { id: 'BEP', x: 510, y: 360, label: 'Bếp & Ăn', status: 'pending', progress: 0, type: 'pill', color: '#BBDEFB' },
      { id: 'HOAN_TAT', x: 500, y: 450, label: 'Hoàn tất', status: 'pending', progress: 0, type: 'circle', color: '#2196F3' },
    ],
    connections: [
      { id: 'BT1', fromNodeId: 'KHOI_CONG', toNodeId: 'MONG_BT', type: 'direct', color: '#2196F3' },
      { id: 'BT2', fromNodeId: 'KHOI_CONG', toNodeId: 'SAN_VUON', type: 'bezier', color: '#4CAF50' },
      { id: 'BT3', fromNodeId: 'SAN_VUON', toNodeId: 'HO_BOI', type: 'direct', color: '#4CAF50' },
      { id: 'BT4', fromNodeId: 'SAN_VUON', toNodeId: 'CAY_XANH', type: 'direct', color: '#4CAF50' },
      { id: 'BT5', fromNodeId: 'MONG_BT', toNodeId: 'KHUNG_BT', type: 'direct', color: '#2196F3' },
      { id: 'BT6', fromNodeId: 'KHUNG_BT', toNodeId: 'MAI_BT', type: 'direct', color: '#2196F3' },
      { id: 'BT7', fromNodeId: 'KHUNG_BT', toNodeId: 'NOI_THAT_BT', type: 'bezier', color: '#FF9800' },
      { id: 'BT8', fromNodeId: 'NOI_THAT_BT', toNodeId: 'PHONG_KHACH', type: 'direct', color: '#9C27B0' },
      { id: 'BT9', fromNodeId: 'NOI_THAT_BT', toNodeId: 'PHONG_NGU', type: 'direct', color: '#9C27B0' },
      { id: 'BT10', fromNodeId: 'NOI_THAT_BT', toNodeId: 'BEP', type: 'direct', color: '#9C27B0' },
      { id: 'BT11', fromNodeId: 'MAI_BT', toNodeId: 'HOAN_TAT', type: 'bezier', color: '#2196F3', style: 'dashed' },
      { id: 'BT12', fromNodeId: 'BEP', toNodeId: 'HOAN_TAT', type: 'bezier', color: '#9C27B0', style: 'dashed' },
      { id: 'BT13', fromNodeId: 'CAY_XANH', toNodeId: 'HOAN_TAT', type: 'bezier', color: '#4CAF50', style: 'dashed' },
    ],
  },
  {
    id: 'nha_xuong',
    name: 'Nhà xưởng / Công nghiệp',
    description: 'Template cho xây dựng nhà xưởng, kho bãi',
    icon: 'construct-outline',
    nodes: [
      { id: 'SAN_LAP', x: 100, y: 150, label: 'San lấp mặt bằng', status: 'pending', progress: 0, type: 'circle', color: '#4CAF50' },
      { id: 'MONG_NX', x: 300, y: 150, label: 'Móng công nghiệp', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'KHUNG_THEP', x: 500, y: 150, label: 'Khung thép', status: 'pending', progress: 0, type: 'rect', color: '#E3F2FD' },
      { id: 'MAI_PANEL', x: 700, y: 150, label: 'Mái panel', status: 'pending', progress: 0, type: 'rect', color: '#E3F2FD' },
      { id: 'HE_THONG', x: 400, y: 300, label: 'Hệ thống kỹ thuật', status: 'pending', progress: 0, type: 'group', color: '#FFF3E0' },
      { id: 'DIEN_CN', x: 410, y: 350, label: 'Điện công nghiệp', status: 'pending', progress: 0, type: 'pill', color: '#FFE0B2' },
      { id: 'PCCC', x: 410, y: 380, label: 'PCCC', status: 'pending', progress: 0, type: 'pill', color: '#FFE0B2' },
      { id: 'NUOC_THAI', x: 410, y: 410, label: 'Xử lý nước thải', status: 'pending', progress: 0, type: 'pill', color: '#FFE0B2' },
      { id: 'SAN_NEN', x: 600, y: 300, label: 'Sàn nền công nghiệp', status: 'pending', progress: 0, type: 'rect', color: '#FFECB3' },
      { id: 'VAN_HANH', x: 500, y: 450, label: 'Vận hành', status: 'pending', progress: 0, type: 'circle', color: '#2196F3' },
    ],
    connections: [
      { id: 'NX1', fromNodeId: 'SAN_LAP', toNodeId: 'MONG_NX', type: 'direct', color: '#2196F3' },
      { id: 'NX2', fromNodeId: 'MONG_NX', toNodeId: 'KHUNG_THEP', type: 'direct', color: '#2196F3' },
      { id: 'NX3', fromNodeId: 'KHUNG_THEP', toNodeId: 'MAI_PANEL', type: 'direct', color: '#2196F3' },
      { id: 'NX4', fromNodeId: 'KHUNG_THEP', toNodeId: 'HE_THONG', type: 'bezier', color: '#FF9800' },
      { id: 'NX5', fromNodeId: 'HE_THONG', toNodeId: 'DIEN_CN', type: 'direct', color: '#F44336' },
      { id: 'NX6', fromNodeId: 'HE_THONG', toNodeId: 'PCCC', type: 'direct', color: '#F44336' },
      { id: 'NX7', fromNodeId: 'HE_THONG', toNodeId: 'NUOC_THAI', type: 'direct', color: '#F44336' },
      { id: 'NX8', fromNodeId: 'MAI_PANEL', toNodeId: 'SAN_NEN', type: 'bezier', color: '#2196F3' },
      { id: 'NX9', fromNodeId: 'SAN_NEN', toNodeId: 'VAN_HANH', type: 'bezier', color: '#4CAF50', style: 'dashed' },
      { id: 'NX10', fromNodeId: 'NUOC_THAI', toNodeId: 'VAN_HANH', type: 'bezier', color: '#F44336', style: 'dashed' },
    ],
  },
];

// ==================== DEFAULT DATA ====================

const DEFAULT_NODES: VectorNode[] = [
  // Nhóm "Phần nội thất" dạng donut tròn ở góc trái (giống Figma)
  { id: 'INT_SUMMARY', x: 40, y: 280, label: 'Phần nội thất', status: 'in_progress', progress: 60, description: 'Tổng quan tiến độ phần nội thất', type: 'circle', color: '#FFB74D' },

  // Các nhóm chính ở giữa giống sơ đồ ngoài trời
  { id: 'N1', x: 120, y: 100, label: 'Khởi công', status: 'completed', progress: 100, description: 'Chuẩn bị mặt bằng, giấy phép xây dựng', type: 'circle', color: '#4CAF50' },
  { id: 'N2', x: 320, y: 100, label: 'Móng & Cọc', status: 'completed', progress: 100, description: 'Đào móng, ép cọc, đổ bê tông móng', type: 'circle', color: '#4CAF50' },
  { id: 'N3', x: 520, y: 100, label: 'Khung kết cấu', status: 'in_progress', progress: 65, description: 'Cột, dầm, sàn các tầng', type: 'circle', color: '#FFCA28' },
  { id: 'N4', x: 720, y: 100, label: 'Mái & Chống thấm', status: 'pending', progress: 0, description: 'Đổ sàn mái, chống thấm', type: 'circle', color: '#FFCA28' },

  // Nhánh hoàn thiện & nội thất (pill)
  { id: 'FINISH', x: 260, y: 520, label: 'Phần hoàn thiện', status: 'pending', progress: 0, description: 'Các đội thợ hoàn thiện', type: 'circle', color: '#FB8C00' },
  { id: 'CREW_WALL', x: 240, y: 390, label: 'Thợ xây tường - tô', status: 'pending', progress: 0, type: 'pill', color: '#FFECB3' },
  { id: 'CREW_ME', x: 240, y: 420, label: 'Thợ ME', status: 'pending', progress: 0, type: 'pill', color: '#FFECB3' },
  { id: 'CREW_AC', x: 240, y: 450, label: 'Thợ máy lạnh', status: 'pending', progress: 0, type: 'pill', color: '#FFECB3' },
  { id: 'CREW_TILE_WC', x: 240, y: 480, label: 'Thợ ốp - lát WC', status: 'pending', progress: 0, type: 'pill', color: '#FFECB3' },
  { id: 'CREW_GYPSUM', x: 240, y: 510, label: 'Thợ trần thạch cao', status: 'pending', progress: 0, type: 'pill', color: '#FFECB3' },
  { id: 'CREW_PAINT', x: 240, y: 540, label: 'Thợ sơn', status: 'pending', progress: 0, type: 'pill', color: '#FFECB3' },

  // Nhóm "Danh mục đặt hàng" bên phải (group + pill xanh)
  { id: 'ORDER_GROUP', x: 560, y: 360, label: 'Danh mục đặt hàng', status: 'in_progress', progress: 30, type: 'group', color: '#66BB6A', description: 'Thiết bị, phụ kiện nội thất' },
  { id: 'ORDER_SANITARY', x: 570, y: 410, label: 'Thiết bị vệ sinh', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
  { id: 'ORDER_ELECTRIC', x: 570, y: 430, label: 'Thiết bị điện', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
  { id: 'ORDER_LOCK', x: 570, y: 448, label: 'Thiết bị khóa', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
  { id: 'ORDER_KITCHEN', x: 570, y: 466, label: 'Phụ kiện bếp', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
  { id: 'ORDER_STEEL', x: 570, y: 484, label: 'Phụ kiện sắt', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
  { id: 'ORDER_WARDROBE', x: 570, y: 502, label: 'Phụ kiện tủ áo', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
  { id: 'ORDER_KITCHEN_CAB', x: 570, y: 520, label: 'Phụ kiện tủ bếp', status: 'pending', progress: 0, type: 'pill', color: '#A5D6A7' },
];

const DEFAULT_CONNECTIONS: VectorConnection[] = [
  // Main flow: Khởi công → Móng → Khung → Mái (High importance - chính)
  { id: 'C1', fromNodeId: 'N1', toNodeId: 'N2', type: 'direct', color: '#2196F3', importance: 5, relationshipType: 'flow', label: 'Bước 1' },
  { id: 'C2', fromNodeId: 'N2', toNodeId: 'N3', type: 'direct', color: '#2196F3', importance: 5, relationshipType: 'flow', label: 'Bước 2' },
  { id: 'C3', fromNodeId: 'N3', toNodeId: 'N4', type: 'direct', color: '#2196F3', importance: 5, relationshipType: 'flow', label: 'Bước 3' },

  // Phần nội thất → các crews (Medium importance - parent-child)
  { id: 'C_INT_1', fromNodeId: 'INT_SUMMARY', toNodeId: 'CREW_WALL', type: 'bezier', color: '#4CAF50', importance: 3, relationshipType: 'parent-child' },
  { id: 'C_INT_2', fromNodeId: 'INT_SUMMARY', toNodeId: 'CREW_ME', type: 'bezier', color: '#4CAF50', importance: 3, relationshipType: 'parent-child' },
  { id: 'C_INT_3', fromNodeId: 'INT_SUMMARY', toNodeId: 'CREW_AC', type: 'bezier', color: '#4CAF50', importance: 3, relationshipType: 'parent-child' },
  { id: 'C_INT_4', fromNodeId: 'INT_SUMMARY', toNodeId: 'CREW_TILE_WC', type: 'bezier', color: '#4CAF50', importance: 3, relationshipType: 'parent-child' },
  { id: 'C_INT_5', fromNodeId: 'INT_SUMMARY', toNodeId: 'CREW_GYPSUM', type: 'bezier', color: '#4CAF50', importance: 3, relationshipType: 'parent-child' },
  { id: 'C_INT_6', fromNodeId: 'INT_SUMMARY', toNodeId: 'CREW_PAINT', type: 'bezier', color: '#4CAF50', importance: 3, relationshipType: 'parent-child' },

  // Phần hoàn thiện → crews (dependency - dashed)
  { id: 'C_FIN_1', fromNodeId: 'FINISH', toNodeId: 'CREW_WALL', type: 'bezier', color: '#FF9800', style: 'dashed', importance: 2, relationshipType: 'dependency' },
  { id: 'C_FIN_2', fromNodeId: 'FINISH', toNodeId: 'CREW_PAINT', type: 'bezier', color: '#FF9800', style: 'dashed', importance: 2, relationshipType: 'dependency' },

  // Order group → các order items (parent-child hierarchy)
  { id: 'C_ORD_1', fromNodeId: 'ORDER_GROUP', toNodeId: 'ORDER_SANITARY', type: 'direct', color: '#4CAF50', importance: 2, relationshipType: 'parent-child' },
  { id: 'C_ORD_2', fromNodeId: 'ORDER_GROUP', toNodeId: 'ORDER_ELECTRIC', type: 'direct', color: '#4CAF50', importance: 2, relationshipType: 'parent-child' },
  { id: 'C_ORD_3', fromNodeId: 'ORDER_GROUP', toNodeId: 'ORDER_LOCK', type: 'direct', color: '#4CAF50', importance: 2, relationshipType: 'parent-child' },
  { id: 'C_ORD_4', fromNodeId: 'ORDER_GROUP', toNodeId: 'ORDER_KITCHEN', type: 'direct', color: '#4CAF50', importance: 2, relationshipType: 'parent-child' },
  { id: 'C_ORD_5', fromNodeId: 'ORDER_GROUP', toNodeId: 'ORDER_STEEL', type: 'direct', color: '#4CAF50', importance: 2, relationshipType: 'parent-child' },
  { id: 'C_ORD_6', fromNodeId: 'ORDER_GROUP', toNodeId: 'ORDER_WARDROBE', type: 'direct', color: '#4CAF50', importance: 2, relationshipType: 'parent-child' },
  { id: 'C_ORD_7', fromNodeId: 'ORDER_GROUP', toNodeId: 'ORDER_KITCHEN_CAB', type: 'direct', color: '#4CAF50', importance: 2, relationshipType: 'parent-child' },

  // Cross connections between main phases (reference - lower importance)
  { id: 'C_CROSS_1', fromNodeId: 'N3', toNodeId: 'ORDER_GROUP', type: 'bezier', color: '#9C27B0', style: 'dashed', importance: 1, relationshipType: 'reference' },
  { id: 'C_CROSS_2', fromNodeId: 'N4', toNodeId: 'FINISH', type: 'bezier', color: '#9C27B0', style: 'dashed', importance: 1, relationshipType: 'reference', showStartArrow: true },
];

// ==================== MAIN COMPONENT ====================

export default function ProgressVectorEditor() {
  const scheme = Platform.OS === 'web' ? 'light' : 'light';
  const colors = Colors[scheme ?? 'light'];

  // Core State
  const [nodes, setNodes] = useState<VectorNode[]>(DEFAULT_NODES);
  const [connections, setConnections] = useState<VectorConnection[]>(DEFAULT_CONNECTIONS);
  const [canvas, setCanvas] = useState<CanvasState>({ scale: 0.8, offsetX: 0, offsetY: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]); // Multi-select
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'view' | 'edit' | 'connect'>('view');
  
  // Modal States
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionsPos, setQuickActionsPos] = useState({ x: 0, y: 0 });
  
  // Input Dialog State (cross-platform prompt)
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [inputDialogConfig, setInputDialogConfig] = useState<{
    title: string;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
  } | null>(null);
  const [inputDialogValue, setInputDialogValue] = useState('');
  
  // Project Management State
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // History for Undo/Redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedo, setIsUndoRedo] = useState(false);
  
  // Other State
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [gyroRotate, setGyroRotate] = useState(false);
  const [canvasRotation, setCanvasRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Pinch to zoom gesture
  const lastScale = useRef(1);
  const pinchStartScale = useRef(1);
  
  // Pan gesture state (for Google Maps-like dragging)
  const [isPanning, setIsPanning] = useState(false);
  const panStartPos = useRef({ x: 0, y: 0 });
  const canvasStartOffset = useRef({ x: 0, y: 0 });
  
  // Animation values for smooth zoom
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [showConnectionEdit, setShowConnectionEdit] = useState(false);
  const [editingConnection, setEditingConnection] = useState<VectorConnection | null>(null);

  // ==================== ZOOM & GESTURE HANDLERS ====================

  const handleZoomIn = useCallback(() => {
    setCanvas((prev) => {
      const newScale = Math.min(prev.scale + 0.1, MAX_SCALE);
      return { ...prev, scale: newScale };
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setCanvas((prev) => {
      const newScale = Math.max(prev.scale - 0.1, MIN_SCALE);
      return { ...prev, scale: newScale };
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setCanvas({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  const handlePinchGesture = useCallback((event: any) => {
    if (event.nativeEvent.scale !== undefined) {
      const scale = event.nativeEvent.scale;
      
      setCanvas((prev) => {
        // Calculate new scale based on pinch gesture
        const newScale = pinchStartScale.current * scale;
        const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
        
        return {
          ...prev,
          scale: clampedScale,
        };
      });
      
      lastScale.current = scale;
    }
  }, []);

  const handlePinchStart = useCallback(() => {
    pinchStartScale.current = canvas.scale;
    lastScale.current = 1;
  }, [canvas.scale]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);
  
  // Pan handlers for Google Maps-like canvas dragging
  const handlePanStart = useCallback((event: any) => {
    if (editMode === 'view' || editMode === 'connect') {
      setIsPanning(true);
      panStartPos.current = {
        x: event.nativeEvent.pageX,
        y: event.nativeEvent.pageY,
      };
      canvasStartOffset.current = {
        x: canvas.offsetX,
        y: canvas.offsetY,
      };
    }
  }, [editMode, canvas.offsetX, canvas.offsetY]);
  
  const handlePanMove = useCallback((event: any) => {
    if (isPanning && (editMode === 'view' || editMode === 'connect')) {
      const deltaX = event.nativeEvent.pageX - panStartPos.current.x;
      const deltaY = event.nativeEvent.pageY - panStartPos.current.y;
      
      setCanvas(prev => ({
        ...prev,
        offsetX: canvasStartOffset.current.x + deltaX / prev.scale,
        offsetY: canvasStartOffset.current.y + deltaY / prev.scale,
      }));
    }
  }, [isPanning, editMode]);
  
  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);
  
  // Smooth zoom with animation
  const handleZoomInSmooth = useCallback(() => {
    const newScale = Math.min(canvas.scale + 0.1, MAX_SCALE);
    Animated.spring(scaleAnim, {
      toValue: newScale,
      useNativeDriver: false,
      speed: 20,
      bounciness: 0,
    }).start();
    setCanvas(prev => ({ ...prev, scale: newScale }));
  }, [canvas.scale, scaleAnim]);
  
  const handleZoomOutSmooth = useCallback(() => {
    const newScale = Math.max(canvas.scale - 0.1, MIN_SCALE);
    Animated.spring(scaleAnim, {
      toValue: newScale,
      useNativeDriver: false,
      speed: 20,
      bounciness: 0,
    }).start();
    setCanvas(prev => ({ ...prev, scale: newScale }));
  }, [canvas.scale, scaleAnim]);

  // ==================== HISTORY MANAGEMENT ====================

  const pushHistory = useCallback(() => {
    if (isUndoRedo) return;
    
    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [nodes, connections, historyIndex, isUndoRedo]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    setIsUndoRedo(true);
    const prevState = history[historyIndex - 1];
    if (prevState) {
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
      setHistoryIndex(prev => prev - 1);
    }
    setTimeout(() => setIsUndoRedo(false), 100);
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    setIsUndoRedo(true);
    const nextState = history[historyIndex + 1];
    if (nextState) {
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHistoryIndex(prev => prev + 1);
    }
    setTimeout(() => setIsUndoRedo(false), 100);
  }, [history, historyIndex]);

  // Push initial state to history
  useEffect(() => {
    if (history.length === 0 && nodes.length > 0) {
      pushHistory();
    }
  }, []);

  // ==================== LOAD/SAVE DATA ====================

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!settings.autoSave || !hasChanges || !currentProject) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentProject(true);
    }, settings.autoSaveInterval * 1000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasChanges, settings.autoSave, settings.autoSaveInterval, currentProject]);

  const loadInitialData = async () => {
    try {
      // Load settings
      const settingsRaw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsRaw) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsRaw) });
      }

      // Load projects list
      const projectsRaw = await AsyncStorage.getItem(PROJECTS_LIST_KEY);
      if (projectsRaw) {
        const projects: Project[] = JSON.parse(projectsRaw);
        setProjectsList(projects);

        // Load last opened project or create default
        if (projects.length > 0) {
          const lastProject = projects[0];
          await loadProject(lastProject.id);
        }
      }
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      const dataRaw = await AsyncStorage.getItem(`project_${projectId}`);
      if (dataRaw) {
        const data: ProjectData = JSON.parse(dataRaw);
        setCurrentProject(data.project);
        setNodes(data.nodes.length > 0 ? data.nodes : DEFAULT_NODES);
        setConnections(data.connections.length > 0 ? data.connections : DEFAULT_CONNECTIONS);
        setCanvas(data.canvas || { scale: 0.8, offsetX: 0, offsetY: 0 });
        setHasChanges(false);
        setHistory([]);
        setHistoryIndex(-1);
      }
    } catch (e) {
      console.error('Failed to load project:', e);
    }
  };

  const createNewProject = async (name: string, description: string, templateId: string) => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId,
    };

    // Get template data
    const template = PROJECT_TEMPLATES.find(t => t.id === templateId);
    const templateNodes = template?.nodes || [];
    const templateConnections = template?.connections || [];

    // Save project data
    const projectData: ProjectData = {
      project: newProject,
      nodes: templateNodes,
      connections: templateConnections,
      canvas: { scale: 0.8, offsetX: 0, offsetY: 0 },
    };

    await AsyncStorage.setItem(`project_${newProject.id}`, JSON.stringify(projectData));

    // Update projects list
    const updatedList = [newProject, ...projectsList];
    setProjectsList(updatedList);
    await AsyncStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(updatedList));

    // Set as current project
    setCurrentProject(newProject);
    setNodes(templateNodes);
    setConnections(templateConnections);
    setCanvas({ scale: 0.8, offsetX: 0, offsetY: 0 });
    setHasChanges(false);
    setHistory([]);
    setHistoryIndex(-1);
    
    setShowTemplatesModal(false);
    setShowProjectsModal(false);
    
    return newProject;
  };

  const saveCurrentProject = async (isAutoSave = false) => {
    if (!currentProject) {
      // Save as legacy format if no project
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, connections, canvas }));
        setHasChanges(false);
        if (!isAutoSave) {
          setShowSaveSuccess(true);
          setTimeout(() => setShowSaveSuccess(false), 2000);
          Alert.alert('Thành công', 'Đã lưu tiến độ thành công!');
        }
      } catch (e) {
        console.error('Failed to save:', e);
      }
      return;
    }

    try {
      const updatedProject: Project = {
        ...currentProject,
        updatedAt: new Date().toISOString(),
      };

      const projectData: ProjectData = {
        project: updatedProject,
        nodes,
        connections,
        canvas,
      };

      await AsyncStorage.setItem(`project_${currentProject.id}`, JSON.stringify(projectData));

      // Update projects list
      const updatedList = projectsList.map(p =>
        p.id === currentProject.id ? updatedProject : p
      );
      await AsyncStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(updatedList));
      setProjectsList(updatedList);
      setCurrentProject(updatedProject);

      setHasChanges(false);
      if (!isAutoSave) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
        Alert.alert('Thành công', 'Đã lưu dự án thành công!');
      }
    } catch (e) {
      console.error('Failed to save project:', e);
      if (!isAutoSave) {
        Alert.alert('Lỗi', 'Không thể lưu dự án');
      }
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await AsyncStorage.removeItem(`project_${projectId}`);
      const updatedList = projectsList.filter(p => p.id !== projectId);
      await AsyncStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(updatedList));
      setProjectsList(updatedList);

      if (currentProject?.id === projectId) {
        if (updatedList.length > 0) {
          await loadProject(updatedList[0].id);
        } else {
          setCurrentProject(null);
          setNodes(DEFAULT_NODES);
          setConnections(DEFAULT_CONNECTIONS);
        }
      }
    } catch (e) {
      console.error('Failed to delete project:', e);
    }
  };

  const renameProject = async (projectId: string, newName: string) => {
    try {
      const dataRaw = await AsyncStorage.getItem(`project_${projectId}`);
      if (dataRaw) {
        const data: ProjectData = JSON.parse(dataRaw);
        data.project.name = newName;
        data.project.updatedAt = new Date().toISOString();
        await AsyncStorage.setItem(`project_${projectId}`, JSON.stringify(data));

        const updatedList = projectsList.map(p =>
          p.id === projectId ? { ...p, name: newName, updatedAt: data.project.updatedAt } : p
        );
        await AsyncStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(updatedList));
        setProjectsList(updatedList);

        if (currentProject?.id === projectId) {
          setCurrentProject(data.project);
        }
      }
    } catch (e) {
      console.error('Failed to rename project:', e);
    }
  };

  // ==================== EXPORT/IMPORT ====================

  const exportProjectToJSON = async () => {
    try {
      const exportData = {
        project: currentProject,
        nodes,
        connections,
        canvas,
        exportedAt: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `progress_${currentProject?.name || 'export'}_${Date.now()}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Use new expo-file-system API
        const file = new File(Paths.document, fileName);
        await file.write(jsonString);
        
        if (await ExpoSharing.isAvailableAsync()) {
          await ExpoSharing.shareAsync(file.uri, {
            mimeType: 'application/json',
            dialogTitle: 'Xuất dự án',
          });
        } else {
          Alert.alert('Đã xuất', `File: ${file.uri}`);
        }
      }
    } catch (e) {
      console.error('Export error:', e);
      Alert.alert('Lỗi', 'Không thể xuất dự án');
    }
  };

  // ==================== SETTINGS ====================

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const saveData = async () => {
    await saveCurrentProject();
  };
  useEffect(() => {
    let active = true;
    const applyOrientation = async () => {
      if (Platform.OS === 'web') return;
      try {
        if (autoRotate) {
          await ScreenOrientation.unlockAsync();
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      } catch (e) {
        console.warn('ScreenOrientation error:', e);
      }
    };

    applyOrientation();

    return () => {
      active = false;
      void active;
      // Best-effort: return to portrait on exit to avoid surprising other screens
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => null);
      }
    };
  }, [autoRotate]);

  // Gyro/Tilt canvas rotation - like a compass/map
  useEffect(() => {
    if (!gyroRotate || Platform.OS === 'web') {
      setCanvasRotation(0);
      return;
    }

    let subscription: ReturnType<typeof DeviceMotion.addListener> | null = null;

    const startListening = async () => {
      try {
        const { status } = await DeviceMotion.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Quyền cảm biến', 'Cần quyền truy cập cảm biến để xoay canvas theo nghiêng.');
          setGyroRotate(false);
          return;
        }

        // Set update interval (16ms = ~60fps)
        DeviceMotion.setUpdateInterval(50);

        subscription = DeviceMotion.addListener(data => {
          if (data.rotation) {
            // gamma is the rotation around the y axis (tilt left/right)
            // Convert radians to degrees, clamp to ±30 degrees for subtle effect
            const gammaDeg = (data.rotation.gamma * 180) / Math.PI;
            const clampedRotation = Math.max(-30, Math.min(30, gammaDeg));
            setCanvasRotation(clampedRotation);
          }
        });
      } catch (e) {
        console.warn('DeviceMotion error:', e);
        setGyroRotate(false);
      }
    };

    startListening();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      setCanvasRotation(0);
    };
  }, [gyroRotate]);

  const loadData = async () => {
    await loadInitialData();
  };

  // Cross-platform prompt helper
  const showPrompt = useCallback((
    title: string,
    message: string,
    onConfirm: (value: string) => void,
    defaultValue?: string,
    placeholder?: string
  ) => {
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt(title, message, onConfirm, 'plain-text', defaultValue);
    } else {
      setInputDialogConfig({
        title,
        message,
        placeholder: placeholder || message,
        defaultValue,
        onConfirm,
      });
      setInputDialogValue(defaultValue || '');
      setShowInputDialog(true);
    }
  }, []);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (nodes.length === 0) return 0;
    return Math.round(nodes.reduce((sum, n) => sum + n.progress, 0) / nodes.length);
  }, [nodes]);

  // Filtered nodes for search
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.toLowerCase();
    return nodes.filter(n => 
      n.label.toLowerCase().includes(q) || 
      n.description?.toLowerCase().includes(q)
    );
  }, [nodes, searchQuery]);

  // Grid snap helper
  const snapToGrid = useCallback((value: number) => {
    if (!settings.gridSnap) return value;
    return Math.round(value / settings.gridSize) * settings.gridSize;
  }, [settings.gridSnap, settings.gridSize]);

  const handleZoomFit = () => {
    // Calculate bounds of all nodes
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + NODE_WIDTH));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + NODE_HEIGHT));
    
    const contentWidth = maxX - minX + 100;
    const contentHeight = maxY - minY + 100;
    
    const scaleX = SCREEN_WIDTH / contentWidth;
    const scaleY = (SCREEN_HEIGHT - 200) / contentHeight;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), MIN_SCALE), MAX_SCALE);
    
    setCanvas({ scale: newScale, offsetX: -minX + 50, offsetY: -minY + 50 });
  };

  // Node handlers
  const handleNodePress = (nodeId: string, isLongPress = false) => {
    const node = nodes.find(n => n.id === nodeId);
    
    if (editMode === 'connect') {
      if (!connectingFrom) {
        setConnectingFrom(nodeId);
      } else if (connectingFrom !== nodeId) {
        // Create new connection
        pushHistory();
        const newConn: VectorConnection = {
          id: 'C' + Date.now(),
          fromNodeId: connectingFrom,
          toNodeId: nodeId,
          type: 'bezier',
          color: CONNECTION_COLORS[connections.length % CONNECTION_COLORS.length],
        };
        setConnections(prev => [...prev, newConn]);
        setConnectingFrom(null);
        setHasChanges(true);
      }
    } else if (isLongPress || editMode === 'edit') {
      // Long press or edit mode: toggle multi-select
      setSelectedNodeIds(prev => {
        if (prev.includes(nodeId)) {
          return prev.filter(id => id !== nodeId);
        }
        return [...prev, nodeId];
      });
      setSelectedNodeId(nodeId);
    } else if (editMode === 'view' && node?.prototypeLink) {
      // View mode with prototype link: handle navigation
      handlePrototypeLink(node);
    } else {
      // Normal press: open edit modal
      setSelectedNodeId(nodeId);
      setSelectedNodeIds([nodeId]);
      setShowNodeModal(true);
    }
  };
  
  // Handle prototype link navigation
  const handlePrototypeLink = (node: VectorNode) => {
    if (!node.prototypeLink) return;
    
    const linkType = node.linkType || 'url';
    const link = node.prototypeLink;
    
    Alert.alert(
      'Prototype Link',
      `${node.label}\n\n${linkType === 'url' ? 'URL' : linkType === 'route' ? 'Route' : 'Action'}: ${link}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: linkType === 'url' ? 'Mở' : 'Điều hướng',
          onPress: () => {
            if (linkType === 'url') {
              // Open URL in browser (web) or in-app browser (mobile)
              if (Platform.OS === 'web') {
                window.open(link, '_blank');
              } else {
                Alert.alert('URL', `Mở: ${link}\n\n(Tích hợp WebView/Linking ở đây)`);
              }
            } else if (linkType === 'route') {
              // Navigate to route using expo-router
              try {
                router.push(link as any);
              } catch (e) {
                Alert.alert('Lỗi', `Không thể điều hướng đến: ${link}`);
              }
            } else if (linkType === 'action') {
              // Execute custom action
              Alert.alert('Action', `Thực thi: ${link}\n\n(Custom action handler)`);
            }
          },
        },
      ]
    );
  };

  // Multi-select drag: move all selected nodes together
  const handleNodeDrag = (nodeId: string, dx: number, dy: number) => {
    if (editMode !== 'edit') return;

    const nodesToMove = selectedNodeIds.length > 1 && selectedNodeIds.includes(nodeId)
      ? selectedNodeIds
      : [nodeId];
    
    setNodes(prev =>
      prev.map(n =>
        nodesToMove.includes(n.id)
          ? { 
              ...n, 
              x: snapToGrid(Math.max(0, n.x + dx / canvas.scale)), 
              y: snapToGrid(Math.max(0, n.y + dy / canvas.scale)) 
            }
          : n
      )
    );
    setHasChanges(true);
  };

  // Handle node drag end - push to history
  const handleNodeDragEnd = () => {
    pushHistory();
  };

  // Duplicate selected nodes
  const handleDuplicateNodes = () => {
    if (selectedNodeIds.length === 0) {
      Alert.alert('Thông báo', 'Chọn ít nhất 1 node để nhân đôi');
      return;
    }
    pushHistory();
    const newNodes = selectedNodeIds.map(id => {
      const original = nodes.find(n => n.id === id);
      if (!original) return null;
      return {
        ...original,
        id: 'N' + Date.now() + Math.random().toString(36).slice(2, 6),
        x: original.x + 30,
        y: original.y + 30,
      };
    }).filter(Boolean) as VectorNode[];
    setNodes(prev => [...prev, ...newNodes]);
    setSelectedNodeIds(newNodes.map(n => n.id));
    setHasChanges(true);
  };

  // Align selected nodes
  const handleAlignNodes = (direction: 'left' | 'right' | 'top' | 'bottom' | 'centerH' | 'centerV') => {
    if (selectedNodeIds.length < 2) {
      Alert.alert('Thông báo', 'Chọn ít nhất 2 node để căn lề');
      return;
    }
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    let targetValue: number;

    switch (direction) {
      case 'left':
        targetValue = Math.min(...selectedNodes.map(n => n.x));
        setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, x: targetValue } : n));
        break;
      case 'right':
        targetValue = Math.max(...selectedNodes.map(n => n.x));
        setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, x: targetValue } : n));
        break;
      case 'top':
        targetValue = Math.min(...selectedNodes.map(n => n.y));
        setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, y: targetValue } : n));
        break;
      case 'bottom':
        targetValue = Math.max(...selectedNodes.map(n => n.y));
        setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, y: targetValue } : n));
        break;
      case 'centerH':
        targetValue = selectedNodes.reduce((sum, n) => sum + n.x, 0) / selectedNodes.length;
        setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, x: targetValue } : n));
        break;
      case 'centerV':
        targetValue = selectedNodes.reduce((sum, n) => sum + n.y, 0) / selectedNodes.length;
        setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, y: targetValue } : n));
        break;
    }
    setHasChanges(true);
  };

  // Change color of selected nodes
  const handleChangeNodesColor = (color: string) => {
    if (selectedNodeIds.length === 0) return;
    setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, color } : n));
    setShowColorPicker(false);
    setHasChanges(true);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedNodeIds([]);
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    setShowConnectionEdit(false);
  };
  
  // Connection handlers
  const handleConnectionPress = (connId: string) => {
    const conn = connections.find(c => c.id === connId);
    if (!conn) return;
    
    setSelectedConnectionId(connId);
    setEditingConnection(conn);
    setShowConnectionEdit(true);
    setSelectedNodeIds([]); // Clear node selection
  };
  
  const handleUpdateConnection = (updates: Partial<VectorConnection>) => {
    if (!selectedConnectionId) return;
    
    pushHistory();
    setConnections(prev =>
      prev.map(c => c.id === selectedConnectionId ? { ...c, ...updates } : c)
    );
    setHasChanges(true);
  };
  
  const handleDeleteConnection = () => {
    if (!selectedConnectionId) return;
    
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa kết nối này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            pushHistory();
            setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
            setSelectedConnectionId(null);
            setShowConnectionEdit(false);
            setHasChanges(true);
          },
        },
      ]
    );
  };
  
  const handleToggleConnectionBidirectional = () => {
    if (!selectedConnectionId) return;
    const conn = connections.find(c => c.id === selectedConnectionId);
    if (!conn) return;
    
    handleUpdateConnection({ showStartArrow: !conn.showStartArrow });
  };

  // Canvas long-press handler for quick actions
  const handleCanvasLongPress = (event: { nativeEvent: { locationX: number; locationY: number } }) => {
    const { locationX, locationY } = event.nativeEvent;
    setQuickActionsPos({ x: locationX, y: locationY });
    setShowQuickActions(true);
  };

  // Add node at specific position
  const handleAddNodeAtPosition = (x: number, y: number, type: VectorNodeType = 'rect') => {
    pushHistory();
    const newNode: VectorNode = {
      id: 'N' + Date.now(),
      x: snapToGrid(x / canvas.scale),
      y: snapToGrid(y / canvas.scale),
      label: 'Hạng mục mới',
      description: '',
      status: 'pending',
      progress: 0,
      type,
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedNodeIds([newNode.id]);
    setShowQuickActions(false);
    setHasChanges(true);
    // Show edit modal immediately
    setTimeout(() => setShowNodeModal(true), 100);
  };

  // Group selected nodes
  const handleGroupNodes = () => {
    if (selectedNodeIds.length < 2) {
      Alert.alert('Thông báo', 'Chọn ít nhất 2 node để nhóm');
      return;
    }
    
    pushHistory();
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    
    // Calculate group bounds
    const minX = Math.min(...selectedNodes.map(n => n.x));
    const maxX = Math.max(...selectedNodes.map(n => n.x + NODE_WIDTH));
    const minY = Math.min(...selectedNodes.map(n => n.y));
    const maxY = Math.max(...selectedNodes.map(n => n.y + NODE_HEIGHT));
    
    // Create group node
    const groupId = 'G' + Date.now();
    const groupNode: VectorNode = {
      id: groupId,
      x: minX - 20,
      y: minY - 40,
      label: `Nhóm (${selectedNodeIds.length})`,
      description: 'Nhóm các hạng mục',
      status: 'in_progress',
      progress: Math.round(selectedNodes.reduce((sum, n) => sum + n.progress, 0) / selectedNodes.length),
      type: 'group',
      groupChildren: selectedNodeIds,
    };
    
    // Update children with groupId
    setNodes(prev => [
      ...prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, groupId } : n),
      groupNode
    ]);
    
    setSelectedNodeIds([groupId]);
    setSelectedNodeId(groupId);
    setHasChanges(true);
    Alert.alert('Đã nhóm', `Đã tạo nhóm với ${selectedNodeIds.length} hạng mục`);
  };

  // Ungroup selected group
  const handleUngroupNodes = () => {
    if (selectedNodeIds.length !== 1) return;
    const groupNode = nodes.find(n => n.id === selectedNodeIds[0] && n.type === 'group');
    if (!groupNode || !groupNode.groupChildren) {
      Alert.alert('Thông báo', 'Chọn một nhóm để tách');
      return;
    }
    
    pushHistory();
    const childIds = groupNode.groupChildren;
    
    // Remove group reference from children and delete group
    setNodes(prev => prev
      .filter(n => n.id !== groupNode.id)
      .map(n => childIds.includes(n.id) ? { ...n, groupId: undefined } : n)
    );
    
    setSelectedNodeIds(childIds);
    setHasChanges(true);
    Alert.alert('Đã tách nhóm', `Đã tách ${childIds.length} hạng mục`);
  };

  const handleAddNode = (node: Partial<VectorNode>) => {
    const newNode: VectorNode = {
      id: 'N' + Date.now(),
      x: 400,
      y: 300,
      label: node.label || 'Hạng mục mới',
      description: node.description || '',
      status: 'pending',
      progress: 0,
      type: node.type || 'rect',
      ...node,
    };
    setNodes(prev => [...prev, newNode]);
    setShowAddNodeModal(false);
    setHasChanges(true);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<VectorNode>) => {
    setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, ...updates } : n)));
    setHasChanges(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    Alert.alert('Xóa hạng mục', 'Bạn có chắc muốn xóa hạng mục này và các kết nối liên quan?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setNodes(prev => prev.filter(n => n.id !== nodeId));
          setConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
          setShowNodeModal(false);
          setSelectedNodeId(null);
          setHasChanges(true);
        },
      },
    ]);
  };

  // Connection handlers (OLD - moved to new section above handleClearSelection)
  const handleOldConnectionPress = (connId: string) => {
    setSelectedConnectionId(connId);
    const conn = connections.find(c => c.id === connId);
    if (conn) ensureConnectionControlPoints(conn);
    setShowConnectionModal(true);
  };

  const handleOldUpdateConnection = (connId: string, updates: Partial<VectorConnection>) => {
    setConnections(prev => prev.map(c => (c.id === connId ? { ...c, ...updates } : c)));
    setHasChanges(true);
  };

  const handleOldDeleteConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
    setShowConnectionModal(false);
    setSelectedConnectionId(null);
    setHasChanges(true);
  };

  const handleControlPointDrag = (connId: string, index: number, dx: number, dy: number) => {
    setConnections(prev =>
      prev.map(c => {
        if (c.id !== connId) return c;
        const cps = c.controlPoints || [];
        if (!cps[index]) return c;
        const next = cps.map((p, i) =>
          i === index
            ? {
                x: Math.max(0, p.x + dx / canvas.scale),
                y: Math.max(0, p.y + dy / canvas.scale),
              }
            : p
        );
        return { ...c, controlPoints: next };
      })
    );
    setHasChanges(true);
  };

  const getNodeCenter = (node: VectorNode) => ({
    x: node.x + NODE_WIDTH / 2,
    y: node.y + NODE_HEIGHT / 2,
  });

  const getAnchorPoint = (from: VectorNode, to: VectorNode) => {
    const fromC = getNodeCenter(from);
    const toC = getNodeCenter(to);
    const dx = toC.x - fromC.x;
    const dy = toC.y - fromC.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx >= 0) return { x: from.x + NODE_WIDTH, y: fromC.y };
      return { x: from.x, y: fromC.y };
    }

    if (dy >= 0) return { x: fromC.x, y: from.y + NODE_HEIGHT };
    return { x: fromC.x, y: from.y };
  };

  const getDefaultBezierControlPoints = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const curvature = 0.25;

    const cp1 = {
      x: start.x + dx * curvature + dy * 0.1,
      y: start.y + dy * curvature - dx * 0.1,
    };
    const cp2 = {
      x: start.x + dx * (1 - curvature) - dy * 0.1,
      y: start.y + dy * (1 - curvature) + dx * 0.1,
    };
    return [cp1, cp2];
  };

  const ensureConnectionControlPoints = (conn: VectorConnection) => {
    if (conn.type === 'direct') return;
    if (conn.type === 'bezier' && conn.controlPoints?.length === 2) return;
    if (conn.type === 'orthogonal' && conn.controlPoints?.length === 1) return;

    const fromNode = nodes.find(n => n.id === conn.fromNodeId);
    const toNode = nodes.find(n => n.id === conn.toNodeId);
    if (!fromNode || !toNode) return;

    const start = getAnchorPoint(fromNode, toNode);
    const end = getAnchorPoint(toNode, fromNode);

    if (conn.type === 'bezier') {
      const cps = getDefaultBezierControlPoints(start, end);
      setConnections(prev => prev.map(c => (c.id === conn.id ? { ...c, controlPoints: cps } : c)));
      return;
    }

    const elbowX = (start.x + end.x) / 2;
    const elbowY = (start.y + end.y) / 2;
    setConnections(prev => prev.map(c => (c.id === conn.id ? { ...c, controlPoints: [{ x: elbowX, y: elbowY }] } : c)));
  };

  // Get connection color based on relationship type
  const getConnectionColorByType = (relationshipType?: VectorConnection['relationshipType']): string => {
    switch (relationshipType) {
      case 'parent-child':
        return '#4CAF50'; // Green - hierarchical
      case 'dependency':
        return '#FF9800'; // Orange - dependencies
      case 'reference':
        return '#9C27B0'; // Purple - references
      case 'flow':
        return '#2196F3'; // Blue - flow/sequence
      default:
        return '#2196F3'; // Default blue
    }
  };

  // Get midpoint of a connection for label placement
  const getConnectionMidpoint = (conn: VectorConnection): { x: number; y: number } => {
    const fromNode = nodes.find(n => n.id === conn.fromNodeId);
    const toNode = nodes.find(n => n.id === conn.toNodeId);
    if (!fromNode || !toNode) return { x: 0, y: 0 };

    const start = getAnchorPoint(fromNode, toNode);
    const end = getAnchorPoint(toNode, fromNode);

    if (conn.type === 'bezier' && conn.controlPoints?.length === 2) {
      // For bezier, calculate point at t=0.5
      const t = 0.5;
      const x = Math.pow(1-t, 3) * start.x + 3 * Math.pow(1-t, 2) * t * conn.controlPoints[0].x + 
                3 * (1-t) * Math.pow(t, 2) * conn.controlPoints[1].x + Math.pow(t, 3) * end.x;
      const y = Math.pow(1-t, 3) * start.y + 3 * Math.pow(1-t, 2) * t * conn.controlPoints[0].y + 
                3 * (1-t) * Math.pow(t, 2) * conn.controlPoints[1].y + Math.pow(t, 3) * end.y;
      return { x, y };
    }
    
    // For direct or orthogonal, use simple midpoint
    return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  };

  // Get connection path
  const getConnectionPath = (conn: VectorConnection): string => {
    const fromNode = nodes.find(n => n.id === conn.fromNodeId);
    const toNode = nodes.find(n => n.id === conn.toNodeId);
    if (!fromNode || !toNode) return '';

    const start = getAnchorPoint(fromNode, toNode);
    const end = getAnchorPoint(toNode, fromNode);

    const x1 = start.x;
    const y1 = start.y;
    const x2 = end.x;
    const y2 = end.y;

    if (conn.type === 'direct') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    } else if (conn.type === 'bezier') {
      const cps = conn.controlPoints?.length === 2 ? conn.controlPoints : getDefaultBezierControlPoints(start, end);
      const cx1 = cps[0].x;
      const cy1 = cps[0].y;
      const cx2 = cps[1].x;
      const cy2 = cps[1].y;
      return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    } else {
      // Orthogonal
      const elbow = conn.controlPoints?.[0];
      const midX = elbow?.x ?? (x1 + x2) / 2;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedConnection = connections.find(c => c.id === selectedConnectionId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      {!isFullscreen && (
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        
        {/* Project Name (clickable to open projects) */}
        <TouchableOpacity style={styles.headerCenter} onPress={() => setShowProjectsModal(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {currentProject?.name || 'Sơ đồ tiến độ'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} style={{ marginLeft: 4 }} />
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {overallProgress}% • {nodes.length} hạng mục
          </Text>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          {/* Settings Button */}
          <TouchableOpacity onPress={() => setShowSettingsModal(true)} style={styles.headerIconBtn}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          
          {/* Undo/Redo */}
          <TouchableOpacity 
            onPress={handleUndo} 
            style={[styles.headerIconBtn, { opacity: historyIndex <= 0 ? 0.3 : 1 }]}
            disabled={historyIndex <= 0}
          >
            <Ionicons name="arrow-undo" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleRedo} 
            style={[styles.headerIconBtn, { opacity: historyIndex >= history.length - 1 ? 0.3 : 1 }]}
            disabled={historyIndex >= history.length - 1}
          >
            <Ionicons name="arrow-redo" size={20} color={colors.text} />
          </TouchableOpacity>
          
          {/* Save indicator & button */}
          {hasChanges && (
            <View style={styles.unsavedBadge}>
              <Text style={styles.unsavedText}>●</Text>
            </View>
          )}
          <TouchableOpacity onPress={saveData} style={[styles.saveBtn, { backgroundColor: colors.accent }]}>
            <Ionicons name="save" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      )}

      {/* Toolbar */}
      {!isFullscreen && (
      <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {/* Edit Mode */}
        <View style={styles.toolGroup}>
          <TouchableOpacity
            style={[styles.toolBtn, editMode === 'view' && styles.toolBtnActive]}
            onPress={() => { setEditMode('view'); setConnectingFrom(null); handleClearSelection(); }}
          >
            <Ionicons name="eye" size={18} color={editMode === 'view' ? '#fff' : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, editMode === 'edit' && styles.toolBtnActive]}
            onPress={() => { setEditMode('edit'); setConnectingFrom(null); }}
          >
            <Ionicons name="move" size={18} color={editMode === 'edit' ? '#fff' : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, editMode === 'connect' && styles.toolBtnActive]}
            onPress={() => setEditMode('connect')}
          >
            <Ionicons name="git-network" size={18} color={editMode === 'connect' ? '#fff' : colors.text} />
          </TouchableOpacity>
        </View>

        {/* Zoom Controls */}
        <View style={styles.toolGroup}>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.zoomText, { color: colors.text }]}>{Math.round(canvas.scale * 100)}%</Text>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomFit}>
            <Ionicons name="scan" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity style={styles.zoomBtn} onPress={() => setShowSearch(!showSearch)}>
          <Ionicons name="search" size={18} color={showSearch ? '#2196F3' : colors.text} />
        </TouchableOpacity>

        {/* Add Node */}
        <TouchableOpacity style={styles.addNodeBtn} onPress={() => setShowAddNodeModal(true)}>
          <Ionicons name="add-circle" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      )}

      {/* Search Bar */}
      {!isFullscreen && showSearch && (
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm hạng mục..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
          <Text style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>
            {filteredNodes.length}/{nodes.length}
          </Text>
        </View>
      )}

      {/* Secondary Toolbar - Figma-like tools */}
      {!isFullscreen && (
      <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingVertical: 4 }]}>
        {/* Selection count */}
        {selectedNodeIds.length > 0 && (
          <View style={styles.selectionInfo}>
            <Text style={{ fontSize: 12, color: '#2196F3', fontWeight: '600' }}>
              {selectedNodeIds.length} đã chọn
            </Text>
            <TouchableOpacity onPress={handleClearSelection} style={{ marginLeft: 8 }}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Duplicate */}
        <TouchableOpacity
          style={[styles.toolBtn, { backgroundColor: selectedNodeIds.length > 0 ? '#E3F2FD' : '#F5F5F5' }]}
          onPress={handleDuplicateNodes}
        >
          <Ionicons name="copy" size={16} color={selectedNodeIds.length > 0 ? '#1976D2' : '#999'} />
          <Text style={[styles.toolText, { color: selectedNodeIds.length > 0 ? '#1976D2' : '#999' }]}>Nhân đôi</Text>
        </TouchableOpacity>

        {/* Color Picker */}
        <TouchableOpacity
          style={[styles.toolBtn, { backgroundColor: selectedNodeIds.length > 0 ? '#FFF3E0' : '#F5F5F5' }]}
          onPress={() => selectedNodeIds.length > 0 && setShowColorPicker(true)}
        >
          <Ionicons name="color-palette" size={16} color={selectedNodeIds.length > 0 ? '#E65100' : '#999'} />
          <Text style={[styles.toolText, { color: selectedNodeIds.length > 0 ? '#E65100' : '#999' }]}>Màu</Text>
        </TouchableOpacity>

        {/* Group/Ungroup */}
        <TouchableOpacity
          style={[styles.toolBtn, { backgroundColor: selectedNodeIds.length >= 2 ? '#E8F5E9' : '#F5F5F5' }]}
          onPress={handleGroupNodes}
        >
          <Ionicons name="layers" size={16} color={selectedNodeIds.length >= 2 ? '#388E3C' : '#999'} />
          <Text style={[styles.toolText, { color: selectedNodeIds.length >= 2 ? '#388E3C' : '#999' }]}>Nhóm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolBtn, { backgroundColor: nodes.find(n => n.id === selectedNodeIds[0] && n.type === 'group') ? '#FCE4EC' : '#F5F5F5' }]}
          onPress={handleUngroupNodes}
        >
          <Ionicons name="git-branch" size={16} color={nodes.find(n => n.id === selectedNodeIds[0] && n.type === 'group') ? '#C2185B' : '#999'} />
          <Text style={[styles.toolText, { color: nodes.find(n => n.id === selectedNodeIds[0] && n.type === 'group') ? '#C2185B' : '#999' }]}>Tách</Text>
        </TouchableOpacity>

        {/* Alignment tools */}
        <View style={styles.toolGroup}>
          <TouchableOpacity
            style={[styles.zoomBtn, { opacity: selectedNodeIds.length > 1 ? 1 : 0.4 }]}
            onPress={() => handleAlignNodes('left')}
          >
            <Ionicons name="arrow-back" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.zoomBtn, { opacity: selectedNodeIds.length > 1 ? 1 : 0.4 }]}
            onPress={() => handleAlignNodes('centerH')}
          >
            <Ionicons name="swap-horizontal" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.zoomBtn, { opacity: selectedNodeIds.length > 1 ? 1 : 0.4 }]}
            onPress={() => handleAlignNodes('right')}
          >
            <Ionicons name="arrow-forward" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.zoomBtn, { opacity: selectedNodeIds.length > 1 ? 1 : 0.4 }]}
            onPress={() => handleAlignNodes('top')}
          >
            <Ionicons name="arrow-up" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.zoomBtn, { opacity: selectedNodeIds.length > 1 ? 1 : 0.4 }]}
            onPress={() => handleAlignNodes('centerV')}
          >
            <Ionicons name="swap-vertical" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.zoomBtn, { opacity: selectedNodeIds.length > 1 ? 1 : 0.4 }]}
            onPress={() => handleAlignNodes('bottom')}
          >
            <Ionicons name="arrow-down" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Rotation toggles */}
        <View style={styles.toolGroup}>
          <TouchableOpacity
            style={[styles.toolBtn, autoRotate && styles.toolBtnActive, { paddingHorizontal: 6 }]}
            onPress={() => setAutoRotate(v => !v)}
          >
            <Ionicons name="sync" size={16} color={autoRotate ? '#fff' : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, gyroRotate && styles.toolBtnActive, { paddingHorizontal: 6 }]}
            onPress={() => setGyroRotate(v => !v)}
          >
            <Ionicons name="compass" size={16} color={gyroRotate ? '#fff' : colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      )}

      {/* Zoom Controls Toolbar */}
      <View style={[styles.zoomToolbar, isFullscreen && styles.zoomToolbarFullscreen]}>
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOutSmooth}>
          <Ionicons name="remove" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.zoomText, { color: colors.text }]}>
          {Math.round(canvas.scale * 100)}%
        </Text>
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomInSmooth}>
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.zoomDivider} />
        <TouchableOpacity style={styles.zoomBtn} onPress={handleResetZoom}>
          <Ionicons name="refresh" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={toggleFullscreen}>
          <Ionicons name={isFullscreen ? "contract" : "expand"} size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Connection Edit Toolbar */}
      {showConnectionEdit && editingConnection && (
        <View style={[styles.connectionEditToolbar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.connectionEditTitle, { color: colors.text }]}>
            Chỉnh sửa kết nối
          </Text>
          
          {/* Connection Type */}
          <View style={styles.connectionToolGroup}>
            <TouchableOpacity
              style={[styles.connTypeBtn, editingConnection.type === 'direct' && styles.connTypeBtnActive]}
              onPress={() => handleUpdateConnection({ type: 'direct' })}
            >
              <Ionicons name="remove" size={16} color={editingConnection.type === 'direct' ? '#fff' : colors.text} />
              <Text style={[styles.connTypeText, editingConnection.type === 'direct' && { color: '#fff' }]}>Thẳng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connTypeBtn, editingConnection.type === 'bezier' && styles.connTypeBtnActive]}
              onPress={() => handleUpdateConnection({ type: 'bezier' })}
            >
              <Ionicons name="git-network" size={16} color={editingConnection.type === 'bezier' ? '#fff' : colors.text} />
              <Text style={[styles.connTypeText, editingConnection.type === 'bezier' && { color: '#fff' }]}>Cong</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connTypeBtn, editingConnection.type === 'orthogonal' && styles.connTypeBtnActive]}
              onPress={() => handleUpdateConnection({ type: 'orthogonal' })}
            >
              <Ionicons name="grid" size={16} color={editingConnection.type === 'orthogonal' ? '#fff' : colors.text} />
              <Text style={[styles.connTypeText, editingConnection.type === 'orthogonal' && { color: '#fff' }]}>Vuông góc</Text>
            </TouchableOpacity>
          </View>
          
          {/* Connection Style */}
          <View style={styles.connectionToolGroup}>
            <TouchableOpacity
              style={[styles.connStyleBtn, (editingConnection.style === undefined || editingConnection.style === 'solid') && styles.connTypeBtnActive]}
              onPress={() => handleUpdateConnection({ style: 'solid' })}
            >
              <Ionicons name="remove" size={20} color={editingConnection.style === 'solid' || !editingConnection.style ? '#fff' : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connStyleBtn, editingConnection.style === 'dashed' && styles.connTypeBtnActive]}
              onPress={() => handleUpdateConnection({ style: 'dashed' })}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={editingConnection.style === 'dashed' ? '#fff' : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connStyleBtn, editingConnection.style === 'dotted' && styles.connTypeBtnActive]}
              onPress={() => handleUpdateConnection({ style: 'dotted' })}
            >
              <Text style={[styles.connTypeText, editingConnection.style === 'dotted' && { color: '#fff' }]}>···</Text>
            </TouchableOpacity>
          </View>
          
          {/* Color Picker */}
          <View style={styles.connectionToolGroup}>
            {CONNECTION_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  editingConnection.color === color && styles.colorSwatchActive
                ]}
                onPress={() => handleUpdateConnection({ color })}
              />
            ))}
          </View>
          
          {/* Bidirectional & Delete */}
          <View style={styles.connectionToolGroup}>
            <TouchableOpacity
              style={[styles.connActionBtn, editingConnection.showStartArrow && styles.connTypeBtnActive]}
              onPress={handleToggleConnectionBidirectional}
            >
              <Ionicons name="swap-horizontal" size={18} color={editingConnection.showStartArrow ? '#fff' : colors.text} />
              <Text style={[styles.connTypeText, editingConnection.showStartArrow && { color: '#fff' }]}>2 chiều</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connActionBtn, { backgroundColor: '#FFEBEE' }]}
              onPress={handleDeleteConnection}
            >
              <Ionicons name="trash-outline" size={18} color="#F44336" />
              <Text style={[styles.connTypeText, { color: '#F44336' }]}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.connActionBtn}
              onPress={() => {
                setShowConnectionEdit(false);
                setSelectedConnectionId(null);
              }}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Connecting Indicator */}
      {!isFullscreen && connectingFrom && (
        <View style={styles.connectingBar}>
          <Text style={styles.connectingText}>
            Đang nối từ: {nodes.find(n => n.id === connectingFrom)?.label} → Chọn node đích
          </Text>
          <TouchableOpacity onPress={() => setConnectingFrom(null)}>
            <Text style={styles.cancelConnectText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Canvas */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        style={[styles.canvasScroll, isFullscreen && styles.canvasScrollFullscreen]}
        contentContainerStyle={[
          styles.canvasContent,
          { width: CANVAS_WIDTH * canvas.scale, height: CANVAS_HEIGHT * canvas.scale },
        ]}
        maximumZoomScale={MAX_SCALE}
        minimumZoomScale={MIN_SCALE}
        showsHorizontalScrollIndicator={!isFullscreen}
        showsVerticalScrollIndicator={!isFullscreen}
        bouncesZoom={true}
        pinchGestureEnabled={true}
        scrollEnabled={true}
        onResponderGrant={handlePinchStart}
        onResponderMove={handlePinchGesture}
      >
        <ScrollView
          contentContainerStyle={{ width: CANVAS_WIDTH * canvas.scale, minHeight: CANVAS_HEIGHT * canvas.scale }}
          showsVerticalScrollIndicator={true}
        >
          <View style={[
            styles.canvas,
            {
              transform: [
                { scale: canvas.scale },
                { rotate: `${canvasRotation}deg` }
              ]
            }
          ]}>
            {/* SVG for connections */}
            <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.svgLayer}>
              <Defs>
                {connections.map(conn => {
                  const importance = conn.importance || 3;
                  const markerSize = 6 + importance * 2; // 8-16 based on importance
                  const arrowColor = conn.color || getConnectionColorByType(conn.relationshipType);
                  
                  return (
                    <React.Fragment key={`markers-${conn.id}`}>
                      {/* End arrow marker */}
                      <Marker
                        id={`arrow-end-${conn.id}`}
                        markerWidth={markerSize}
                        markerHeight={markerSize * 0.7}
                        refX={markerSize - 1}
                        refY={markerSize * 0.35}
                        orient="auto"
                      >
                        <Path 
                          d={`M0,0 L0,${markerSize * 0.7} L${markerSize},${markerSize * 0.35} z`} 
                          fill={arrowColor} 
                        />
                      </Marker>
                      {/* Start arrow marker (for bidirectional) */}
                      {conn.showStartArrow && (
                        <Marker
                          id={`arrow-start-${conn.id}`}
                          markerWidth={markerSize}
                          markerHeight={markerSize * 0.7}
                          refX="1"
                          refY={markerSize * 0.35}
                          orient="auto-start-reverse"
                        >
                          <Path 
                            d={`M${markerSize},0 L${markerSize},${markerSize * 0.7} L0,${markerSize * 0.35} z`} 
                            fill={arrowColor} 
                          />
                        </Marker>
                      )}
                      {/* Circle marker for origin point */}
                      <Marker
                        id={`origin-${conn.id}`}
                        markerWidth="8"
                        markerHeight="8"
                        refX="4"
                        refY="4"
                      >
                        <Path 
                          d="M4,0 A4,4 0 1,1 4,8 A4,4 0 1,1 4,0" 
                          fill={arrowColor}
                          fillOpacity="0.3"
                          stroke={arrowColor}
                          strokeWidth="1.5"
                        />
                      </Marker>
                    </React.Fragment>
                  );
                })}
              </Defs>

              {/* Connections with importance-based styling */}
              {connections.map(conn => {
                const importance = conn.importance || 3;
                const baseStrokeWidth = importance * 0.8 + 0.5; // 1.3 - 4.5 based on importance
                const strokeWidth = selectedConnectionId === conn.id ? baseStrokeWidth + 1.5 : baseStrokeWidth;
                const strokeColor = conn.color || getConnectionColorByType(conn.relationshipType);
                const strokeOpacity = 0.5 + (importance * 0.1); // 0.6 - 1.0
                
                return (
                  <G key={conn.id}>
                    {/* Shadow/glow effect for important connections */}
                    {importance >= 4 && (
                      <Path
                        d={getConnectionPath(conn)}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth + 4}
                        strokeOpacity={0.15}
                        fill="none"
                      />
                    )}
                    {/* Main connection path */}
                    <Path
                      d={getConnectionPath(conn)}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      strokeDasharray={conn.style === 'dashed' ? '8,4' : conn.style === 'dotted' ? '2,4' : undefined}
                      fill="none"
                      markerStart={conn.showStartArrow ? `url(#arrow-start-${conn.id})` : `url(#origin-${conn.id})`}
                      markerEnd={`url(#arrow-end-${conn.id})`}
                      onPress={() => handleConnectionPress(conn.id)}
                    />
                    {/* Connection label */}
                    {conn.label && (
                      <SvgText
                        x={getConnectionMidpoint(conn).x}
                        y={getConnectionMidpoint(conn).y - 8}
                        fill="#666"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {conn.label}
                      </SvgText>
                    )}
                    {/* Clickable area for touch */}
                    <Path
                      d={getConnectionPath(conn)}
                      stroke="transparent"
                      strokeWidth={24}
                      fill="none"
                      onPress={() => handleConnectionPress(conn.id)}
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Nodes */}
            {nodes.map(node => (
              <DraggableNode
                key={node.id}
                node={node}
                selected={selectedNodeId === node.id || connectingFrom === node.id}
                isMultiSelected={selectedNodeIds.includes(node.id)}
                editMode={editMode}
                onPress={() => handleNodePress(node.id)}
                onLongPress={() => handleNodePress(node.id, true)}
                onDrag={(dx, dy) => handleNodeDrag(node.id, dx, dy)}
              />
            ))}

            {/* Connection control handles (deep edit) */}
            {editMode === 'edit' && selectedConnection && selectedConnection.type !== 'direct' &&
              (selectedConnection.controlPoints || []).map((p, idx) => (
                <DraggableHandle
                  key={`${selectedConnection.id}-cp-${idx}`}
                  x={p.x}
                  y={p.y}
                  color={selectedConnection.color || '#2196F3'}
                  onDrag={(dx, dy) => handleControlPointDrag(selectedConnection.id, idx, dx, dy)}
                />
              ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Legend */}
      {!isFullscreen && (
        <View style={[styles.legend, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.legendRow}>
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <View key={status} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
                <Text style={styles.legendText}>
                  {status === 'pending' ? 'Chờ' : status === 'in_progress' ? 'Đang làm' : status === 'completed' ? 'Xong' : 'Trễ'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Floating Action Button - Quick Add */}
      {!isFullscreen && (
        <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setQuickActionsPos({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
          setShowQuickActions(true);
        }}
        onLongPress={() => setShowAddNodeModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      )}

      {/* Save Success Toast */}
      {showSaveSuccess && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.toastText}>Đã lưu thành công!</Text>
        </View>
      )}

      {/* Color Picker Modal */}
      <Modal visible={showColorPicker} transparent animationType="fade" onRequestClose={() => setShowColorPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 300 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn màu</Text>
              <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {[
                '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
                '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
                '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E',
                '#607D8B', '#FFCDD2', '#F8BBD9', '#E1BEE7', '#C5CAE9', '#BBDEFB',
                '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFF9C4',
                '#FFECB3', '#FFE0B2', '#FFCCBC', '#D7CCC8', '#CFD8DC', '#FAFAFA',
              ].map(c => (
                <TouchableOpacity
                  key={c}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: c,
                    borderWidth: 2,
                    borderColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                  onPress={() => handleChangeNodesColor(c)}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Node Edit Modal */}
      <NodeEditModal
        visible={showNodeModal}
        node={selectedNode}
        onClose={() => {
          setShowNodeModal(false);
          setSelectedNodeId(null);
        }}
        onUpdate={(updates) => {
          if (selectedNodeId) handleUpdateNode(selectedNodeId, updates);
          setShowNodeModal(false);
        }}
        onDelete={() => {
          if (selectedNodeId) handleDeleteNode(selectedNodeId);
        }}
      />

      {/* Add Node Modal */}
      <AddNodeModal
        visible={showAddNodeModal}
        onClose={() => setShowAddNodeModal(false)}
        onAdd={handleAddNode}
      />

      {/* Connection Edit Modal */}
      <ConnectionEditModal
        visible={showConnectionModal}
        connection={selectedConnection}
        nodes={nodes}
        onClose={() => {
          setShowConnectionModal(false);
          setSelectedConnectionId(null);
        }}
        onUpdate={(updates) => {
          if (selectedConnectionId) handleOldUpdateConnection(selectedConnectionId, updates);
          setShowConnectionModal(false);
        }}
        onDelete={() => {
          if (selectedConnectionId) handleOldDeleteConnection(selectedConnectionId);
        }}
      />

      {/* Projects Modal */}
      <ProjectsModal
        visible={showProjectsModal}
        projects={projectsList}
        currentProjectId={currentProject?.id}
        onClose={() => setShowProjectsModal(false)}
        onSelectProject={async (projectId) => {
          await loadProject(projectId);
          setShowProjectsModal(false);
        }}
        onNewProject={() => {
          setShowProjectsModal(false);
          setShowTemplatesModal(true);
        }}
        onDeleteProject={async (projectId) => {
          Alert.alert('Xóa dự án', 'Bạn có chắc muốn xóa dự án này?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: () => deleteProject(projectId) },
          ]);
        }}
        onRenameProject={(projectId, newName) => renameProject(projectId, newName)}
      />

      {/* Templates Modal */}
      <TemplatesModal
        visible={showTemplatesModal}
        templates={PROJECT_TEMPLATES}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={async (templateId) => {
          const defaultName = PROJECT_TEMPLATES.find(t => t.id === templateId)?.name || 'Dự án mới';
          showPrompt(
            'Tên dự án mới',
            'Nhập tên cho dự án của bạn',
            async (name) => {
              if (name?.trim()) {
                await createNewProject(name.trim(), '', templateId);
              }
            },
            defaultName,
            'Nhập tên dự án...'
          );
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        settings={settings}
        onClose={() => setShowSettingsModal(false)}
        onSave={saveSettings}
        onExport={exportProjectToJSON}
      />

      {/* Quick Actions Menu (Context Menu) */}
      <Modal
        visible={showQuickActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickActions(false)}
      >
        <TouchableOpacity 
          style={styles.quickActionsOverlay}
          activeOpacity={1}
          onPress={() => setShowQuickActions(false)}
        >
          <View style={[
            styles.quickActionsMenu,
            { 
              left: Math.min(quickActionsPos.x, SCREEN_WIDTH - 200),
              top: Math.min(quickActionsPos.y, SCREEN_HEIGHT - 400) 
            }
          ]}>
            <Text style={styles.quickActionsTitle}>Thao tác nhanh</Text>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => handleAddNodeAtPosition(quickActionsPos.x, quickActionsPos.y, 'rect')}
            >
              <Ionicons name="square-outline" size={20} color="#2196F3" />
              <Text style={styles.quickActionText}>Thêm Node (Hình chữ nhật)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => handleAddNodeAtPosition(quickActionsPos.x, quickActionsPos.y, 'circle')}
            >
              <Ionicons name="ellipse-outline" size={20} color="#4CAF50" />
              <Text style={styles.quickActionText}>Thêm Node (Hình tròn)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => handleAddNodeAtPosition(quickActionsPos.x, quickActionsPos.y, 'pill')}
            >
              <Ionicons name="tablet-landscape-outline" size={20} color="#9C27B0" />
              <Text style={styles.quickActionText}>Thêm Node (Pill)</Text>
            </TouchableOpacity>

            <View style={styles.quickActionDivider} />

            <TouchableOpacity 
              style={[styles.quickActionItem, selectedNodeIds.length < 2 && styles.quickActionDisabled]}
              onPress={() => {
                if (selectedNodeIds.length >= 2) {
                  handleGroupNodes();
                  setShowQuickActions(false);
                }
              }}
            >
              <Ionicons name="layers-outline" size={20} color={selectedNodeIds.length >= 2 ? '#FF9800' : '#ccc'} />
              <Text style={[styles.quickActionText, selectedNodeIds.length < 2 && styles.quickActionTextDisabled]}>
                Nhóm các Node ({selectedNodeIds.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionItem, !nodes.find(n => n.id === selectedNodeIds[0] && n.type === 'group') && styles.quickActionDisabled]}
              onPress={() => {
                handleUngroupNodes();
                setShowQuickActions(false);
              }}
            >
              <Ionicons name="git-branch-outline" size={20} color={nodes.find(n => n.id === selectedNodeIds[0] && n.type === 'group') ? '#E91E63' : '#ccc'} />
              <Text style={[styles.quickActionText, !nodes.find(n => n.id === selectedNodeIds[0] && n.type === 'group') && styles.quickActionTextDisabled]}>
                Tách nhóm
              </Text>
            </TouchableOpacity>

            <View style={styles.quickActionDivider} />

            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => {
                handleZoomFit();
                setShowQuickActions(false);
              }}
            >
              <Ionicons name="expand-outline" size={20} color="#607D8B" />
              <Text style={styles.quickActionText}>Zoom vừa màn hình</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => {
                handleResetZoom();
                setShowQuickActions(false);
              }}
            >
              <Ionicons name="resize-outline" size={20} color="#607D8B" />
              <Text style={styles.quickActionText}>Reset Zoom</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionItem, selectedNodeIds.length === 0 && styles.quickActionDisabled]}
              onPress={() => {
                if (selectedNodeIds.length > 0) {
                  handleDuplicateNodes();
                  setShowQuickActions(false);
                }
              }}
            >
              <Ionicons name="copy-outline" size={20} color={selectedNodeIds.length > 0 ? '#00BCD4' : '#ccc'} />
              <Text style={[styles.quickActionText, selectedNodeIds.length === 0 && styles.quickActionTextDisabled]}>
                Nhân đôi ({selectedNodeIds.length})
              </Text>
            </TouchableOpacity>

            <View style={styles.quickActionDivider} />

            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => {
                saveCurrentProject(false);
                setShowQuickActions(false);
              }}
            >
              <Ionicons name="save-outline" size={20} color="#4CAF50" />
              <Text style={styles.quickActionText}>Lưu dự án</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionItem, styles.quickActionCancel]}
              onPress={() => setShowQuickActions(false)}
            >
              <Ionicons name="close" size={20} color="#f44336" />
              <Text style={[styles.quickActionText, { color: '#f44336' }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Input Dialog (Cross-platform prompt replacement) */}
      <Modal
        visible={showInputDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInputDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 320 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{inputDialogConfig?.title}</Text>
              <TouchableOpacity onPress={() => setShowInputDialog(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              {inputDialogConfig?.message && (
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
                  {inputDialogConfig.message}
                </Text>
              )}
              <TextInput
                style={styles.inputDialogInput}
                value={inputDialogValue}
                onChangeText={setInputDialogValue}
                placeholder={inputDialogConfig?.placeholder}
                autoFocus
                selectTextOnFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  style={[styles.inputDialogBtn, styles.inputDialogBtnCancel]}
                  onPress={() => setShowInputDialog(false)}
                >
                  <Text style={styles.inputDialogBtnCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inputDialogBtn, styles.inputDialogBtnConfirm]}
                  onPress={() => {
                    if (inputDialogConfig?.onConfirm && inputDialogValue.trim()) {
                      inputDialogConfig.onConfirm(inputDialogValue.trim());
                    }
                    setShowInputDialog(false);
                    setInputDialogConfig(null);
                    setInputDialogValue('');
                  }}
                >
                  <Text style={styles.inputDialogBtnConfirmText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==================== DRAGGABLE NODE ====================

interface DraggableNodeProps {
  node: VectorNode;
  selected: boolean;
  isMultiSelected?: boolean;
  editMode: string;
  onPress: () => void;
  onLongPress?: () => void;
  onDrag: (dx: number, dy: number) => void;
}

function DraggableNode({ node, selected, isMultiSelected, editMode, onPress, onLongPress, onDrag }: DraggableNodeProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const statusColors = STATUS_COLORS[node.status];
  const nodeType: VectorNodeType = node.type || 'rect';

  const baseWidth = NODE_WIDTH;
  const baseHeight = NODE_HEIGHT;

  // Kiểu hiển thị khác nhau cho circle / pill / group
  const { width, height, borderRadius, extraStyle } = useMemo(() => {
    if (nodeType === 'circle') {
      const size = 80;
      return {
        width: size,
        height: size,
        borderRadius: size / 2,
        extraStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        } as const,
      };
    }
    if (nodeType === 'pill') {
      const h = 32;
      return {
        width: baseWidth,
        height: h,
        borderRadius: h / 2,
        extraStyle: {
          justifyContent: 'center',
        } as const,
      };
    }
    if (nodeType === 'group') {
      return {
        width: baseWidth + 40,
        height: baseHeight + 40,
        borderRadius: 16,
        extraStyle: {
          padding: 10,
        } as const,
      };
    }
    // rect mặc định
    return {
      width: baseWidth,
      height: baseHeight,
      borderRadius: 12,
      extraStyle: {},
    } as const;
  }, [nodeType]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editMode === 'edit',
      onMoveShouldSetPanResponder: () => editMode === 'edit',
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        onDrag(gesture.dx, gesture.dy);
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  // Determine border color: multi-selected (purple), single selected (blue), or status color
  const borderColor = isMultiSelected
    ? '#9C27B0'
    : selected
    ? '#2196F3'
    : statusColors.border;

  return (
    <Animated.View
      style={[
        styles.node,
        {
          left: node.x,
          top: node.y,
          width,
          height,
          borderRadius,
          backgroundColor: node.color || statusColors.bg,
          borderColor,
          borderWidth: selected || isMultiSelected ? 3 : 2,
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
        extraStyle,
        isMultiSelected && { shadowColor: '#9C27B0', shadowOpacity: 0.4, elevation: 8 },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
        style={styles.nodeContent}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.nodeLabel,
            {
              color: statusColors.text,
              textAlign: 'center',
              fontSize: nodeType === 'pill' ? 11 : 13,
            },
          ]}
          numberOfLines={2}
        >
          {node.label}
        </Text>

        {nodeType === 'rect' || nodeType === 'group' ? (
          <>
            <View style={styles.nodeProgressBar}>
              <View
                style={[
                  styles.nodeProgressFill,
                  { width: `${node.progress}%`, backgroundColor: statusColors.border },
                ]}
              />
            </View>
            <View style={styles.nodeBottomRow}>
              <Text style={[styles.nodeProgress, { color: statusColors.text }]}>{node.progress}%</Text>
              {node.images && node.images.length > 0 && (
                <View style={styles.nodeImageIndicator}>
                  <Ionicons name="image" size={10} color={statusColors.text} />
                  <Text style={[styles.nodeImageCount, { color: statusColors.text }]}>{node.images.length}</Text>
                </View>
              )}
            </View>
          </>
        ) : null}
        {/* Image indicator for circle/pill */}
        {(nodeType === 'circle' || nodeType === 'pill') && node.images && node.images.length > 0 && (
          <View style={styles.nodeImageBadge}>
            <Ionicons name="image" size={8} color="#fff" />
          </View>
        )}
        
        {/* Prototype link indicator */}
        {node.prototypeLink && (
          <View style={styles.nodeLinkBadge}>
            <Ionicons name="link" size={12} color="#2196F3" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ==================== DRAGGABLE HANDLE (CONTROL POINT) ====================

interface DraggableHandleProps {
  x: number;
  y: number;
  color: string;
  onDrag: (dx: number, dy: number) => void;
}

function DraggableHandle({ x, y, color, onDrag }: DraggableHandleProps) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        onDrag(gesture.dx, gesture.dy);
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.controlHandle,
        {
          left: x - 10,
          top: y - 10,
          borderColor: color,
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    />
  );
}

// ==================== NODE EDIT MODAL ====================

interface NodeEditModalProps {
  visible: boolean;
  node?: VectorNode;
  onClose: () => void;
  onUpdate: (updates: Partial<VectorNode>) => void;
  onDelete: () => void;
}

function NodeEditModal({ visible, node, onClose, onUpdate, onDelete }: NodeEditModalProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<VectorNode['status']>('pending');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [prototypeLink, setPrototypeLink] = useState('');
  const [linkType, setLinkType] = useState<'url' | 'route' | 'action'>('url');

  useEffect(() => {
    if (node) {
      setLabel(node.label);
      setDescription(node.description || '');
      setNotes(node.notes || '');
      setImages(node.images || []);
      setProgress(node.progress);
      setStatus(node.status);
      setPrototypeLink(node.prototypeLink || '');
      setLinkType(node.linkType || 'url');
    }
  }, [node]);

  const handlePickFromLibrary = async () => {
    setShowImageOptions(false);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Thiếu quyền', 'Cần quyền truy cập thư viện ảnh để chọn hình.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });

      if (result.canceled) return;
      const newUris = result.assets?.map(a => a.uri).filter(Boolean) || [];
      if (newUris.length === 0) return;

      setImages(prev => {
        const uniqueNew = newUris.filter(uri => !prev.includes(uri));
        return [...prev, ...uniqueNew];
      });
    } catch (e) {
      console.warn('ImagePicker error:', e);
      Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
    }
  };

  const handleTakePhoto = async () => {
    setShowImageOptions(false);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Thiếu quyền', 'Cần quyền truy cập camera để chụp ảnh.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setImages(prev => (prev.includes(uri) ? prev : [...prev, uri]));
    } catch (e) {
      console.warn('Camera error:', e);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const handleRemoveImage = (uri: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa hình ảnh này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => setImages(prev => prev.filter(x => x !== uri)) },
      ]
    );
  };

  if (!node) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa hạng mục</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Tên hạng mục</Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="Nhập tên hạng mục"
            />

            <Text style={styles.inputLabel}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Nhập mô tả chi tiết"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ghi chú chi tiết (vật tư, vấn đề, nghiệm thu...)"
              multiline
              numberOfLines={4}
            />

            <View style={styles.imagesHeaderRow}>
              <Text style={styles.inputLabel}>Hình ảnh ({images.length})</Text>
              <TouchableOpacity style={styles.addImageBtn} onPress={() => setShowImageOptions(true)}>
                <Ionicons name="add-circle" size={18} color="#4CAF50" />
                <Text style={styles.addImageText}>Thêm hình</Text>
              </TouchableOpacity>
            </View>
            
            {/* Image Options Menu */}
            {showImageOptions && (
              <View style={styles.imageOptionsMenu}>
                <TouchableOpacity style={styles.imageOptionBtn} onPress={handleTakePhoto}>
                  <Ionicons name="camera" size={24} color="#2196F3" />
                  <Text style={styles.imageOptionText}>Chụp ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageOptionBtn} onPress={handlePickFromLibrary}>
                  <Ionicons name="images" size={24} color="#4CAF50" />
                  <Text style={styles.imageOptionText}>Chọn từ thư viện</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageOptionBtnCancel} onPress={() => setShowImageOptions(false)}>
                  <Text style={styles.imageOptionCancelText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
                {images.map((uri, index) => (
                  <TouchableOpacity 
                    key={uri} 
                    style={styles.imageItem}
                    onPress={() => setPreviewImage(uri)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                    <View style={styles.imageIndex}>
                      <Text style={styles.imageIndexText}>{index + 1}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => handleRemoveImage(uri)}
                    >
                      <Ionicons name="trash" size={12} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {images.length === 0 && (
              <View style={styles.noImagesPlaceholder}>
                <Ionicons name="image-outline" size={40} color="#ccc" />
                <Text style={styles.noImagesText}>Chưa có hình ảnh</Text>
              </View>
            )}
            
            {/* Image Preview Modal */}
            <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
              <View style={styles.imagePreviewOverlay}>
                <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setPreviewImage(null)}>
                  <Ionicons name="close-circle" size={36} color="#fff" />
                </TouchableOpacity>
                {previewImage && (
                  <Image source={{ uri: previewImage }} style={styles.imagePreviewFull} contentFit="contain" />
                )}
                <View style={styles.imagePreviewActions}>
                  <TouchableOpacity 
                    style={styles.imagePreviewBtn}
                    onPress={() => {
                      const currentIndex = images.indexOf(previewImage!);
                      if (currentIndex > 0) setPreviewImage(images[currentIndex - 1]);
                    }}
                  >
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.imagePreviewCounter}>
                    {images.indexOf(previewImage!) + 1} / {images.length}
                  </Text>
                  <TouchableOpacity 
                    style={styles.imagePreviewBtn}
                    onPress={() => {
                      const currentIndex = images.indexOf(previewImage!);
                      if (currentIndex < images.length - 1) setPreviewImage(images[currentIndex + 1]);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Text style={styles.inputLabel}>Tiến độ: {progress}%</Text>
            <View style={styles.progressSlider}>
              {[0, 25, 50, 75, 100].map(val => (
                <TouchableOpacity
                  key={val}
                  style={[styles.progressBtn, progress === val && styles.progressBtnActive]}
                  onPress={() => setProgress(val)}
                >
                  <Text style={[styles.progressBtnText, progress === val && styles.progressBtnTextActive]}>
                    {val}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Trạng thái</Text>
            <View style={styles.statusOptions}>
              {(['pending', 'in_progress', 'completed', 'delayed'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    { backgroundColor: STATUS_COLORS[s].bg, borderColor: STATUS_COLORS[s].border },
                    status === s && styles.statusOptionActive,
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.statusOptionText, { color: STATUS_COLORS[s].text }]}>
                    {s === 'pending' ? 'Chờ' : s === 'in_progress' ? 'Đang làm' : s === 'completed' ? 'Hoàn thành' : 'Trễ'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Prototype Link Section */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Prototype Link (tùy chọn)</Text>
            <View style={styles.linkTypeSelector}>
              {(['url', 'route', 'action'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.linkTypeBtn, linkType === type && styles.linkTypeBtnActive]}
                  onPress={() => setLinkType(type)}
                >
                  <Text style={[styles.linkTypeText, linkType === type && styles.linkTypeTextActive]}>
                    {type === 'url' ? 'URL' : type === 'route' ? 'Route' : 'Action'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={prototypeLink}
              onChangeText={setPrototypeLink}
              placeholder={linkType === 'url' ? 'https://example.com' : linkType === 'route' ? '/path/to/screen' : 'action:doSomething'}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.inputHint}>
              {linkType === 'url' && 'Liên kết web hoặc tài liệu'}
              {linkType === 'route' && 'Đường dẫn điều hướng trong app'}
              {linkType === 'action' && 'Hành động tùy chỉnh (action:name)'}
            </Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Ionicons name="trash" size={18} color="#F44336" />
              <Text style={styles.deleteBtnText}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateBtn}
              onPress={() => onUpdate({ label, description, notes, images, progress, status, prototypeLink, linkType })}
            >
              <Text style={styles.updateBtnText}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==================== ADD NODE MODAL ====================

interface AddNodeModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (node: Partial<VectorNode>) => void;
}

function AddNodeModal({ visible, onClose, onAdd }: AddNodeModalProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<VectorNodeType>('rect');

  const handleAdd = () => {
    if (!label.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hạng mục');
      return;
    }
    onAdd({ label: label.trim(), description: description.trim(), type });
    setLabel('');
    setDescription('');
    setType('rect');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm hạng mục mới</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Tên hạng mục *</Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="VD: Lắp đặt cửa"
            />

            <Text style={styles.inputLabel}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả chi tiết công việc"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Kiểu node</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['rect', 'circle', 'pill', 'group'] as VectorNodeType[]).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    {
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#ddd',
                      backgroundColor: '#F5F5F5',
                      marginRight: 8,
                    },
                    type === t && {
                      backgroundColor: '#2196F3',
                      borderColor: '#1976D2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      { fontSize: 12, color: '#333' },
                      type === t && { color: '#fff', fontWeight: '600' },
                    ]}
                  >
                    {t === 'rect'
                      ? 'Thẻ'
                      : t === 'circle'
                      ? 'Tròn'
                      : t === 'pill'
                      ? 'Pill'
                      : 'Group'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.updateBtn} onPress={handleAdd}>
              <Text style={styles.updateBtnText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==================== CONNECTION EDIT MODAL ====================

interface ConnectionEditModalProps {
  visible: boolean;
  connection?: VectorConnection;
  nodes: VectorNode[];
  onClose: () => void;
  onUpdate: (updates: Partial<VectorConnection>) => void;
  onDelete: () => void;
}

function ConnectionEditModal({ visible, connection, nodes, onClose, onUpdate, onDelete }: ConnectionEditModalProps) {
  const [type, setType] = useState<VectorConnection['type']>('direct');
  const [color, setColor] = useState('#2196F3');
  const [style, setStyle] = useState<VectorConnection['style']>('solid');
  const [importance, setImportance] = useState<VectorConnection['importance']>(3);
  const [relationshipType, setRelationshipType] = useState<VectorConnection['relationshipType']>('flow');
  const [showStartArrow, setShowStartArrow] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (connection) {
      setType(connection.type);
      setColor(connection.color || '#2196F3');
      setStyle(connection.style || 'solid');
      setImportance(connection.importance || 3);
      setRelationshipType(connection.relationshipType || 'flow');
      setShowStartArrow(connection.showStartArrow || false);
      setLabel(connection.label || '');
    }
  }, [connection]);

  if (!connection) return null;

  const fromNode = nodes.find(n => n.id === connection.fromNodeId);
  const toNode = nodes.find(n => n.id === connection.toNodeId);

  const RELATIONSHIP_TYPES: { value: VectorConnection['relationshipType']; label: string; color: string }[] = [
    { value: 'parent-child', label: 'Cha-Con', color: '#4CAF50' },
    { value: 'dependency', label: 'Phụ thuộc', color: '#FF9800' },
    { value: 'reference', label: 'Tham chiếu', color: '#9C27B0' },
    { value: 'flow', label: 'Luồng', color: '#2196F3' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView style={{ maxHeight: '90%' }}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa kết nối</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Connection Info */}
              <View style={styles.connectionInfoBox}>
                <View style={styles.connectionInfoRow}>
                  <View style={styles.connectionNodeBadge}>
                    <Ionicons name="ellipse" size={10} color="#4CAF50" />
                    <Text style={styles.connectionNodeText}>{fromNode?.label}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#666" />
                  <View style={styles.connectionNodeBadge}>
                    <Ionicons name="ellipse" size={10} color="#F44336" />
                    <Text style={styles.connectionNodeText}>{toNode?.label}</Text>
                  </View>
                </View>
              </View>

              {/* Label */}
              <Text style={styles.inputLabel}>Nhãn (Label)</Text>
              <TextInput
                style={styles.textInput}
                value={label}
                onChangeText={setLabel}
                placeholder="Nhập nhãn cho đường nối..."
              />

              {/* Relationship Type */}
              <Text style={styles.inputLabel}>Loại quan hệ</Text>
              <View style={styles.relationTypeOptions}>
                {RELATIONSHIP_TYPES.map(rt => (
                  <TouchableOpacity
                    key={rt.value}
                    style={[
                      styles.relationTypeOption, 
                      relationshipType === rt.value && styles.relationTypeOptionActive,
                      { borderColor: rt.color }
                    ]}
                    onPress={() => {
                      setRelationshipType(rt.value);
                      setColor(rt.color);
                    }}
                  >
                    <View style={[styles.relationTypeDot, { backgroundColor: rt.color }]} />
                    <Text style={[
                      styles.relationTypeText, 
                      relationshipType === rt.value && { color: rt.color, fontWeight: '600' }
                    ]}>
                      {rt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Importance */}
              <Text style={styles.inputLabel}>Độ quan trọng (Đậm/Nhạt)</Text>
              <View style={styles.importanceContainer}>
                {([1, 2, 3, 4, 5] as const).map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.importanceBtn,
                      importance === level && styles.importanceBtnActive,
                    ]}
                    onPress={() => setImportance(level)}
                  >
                    <View style={[
                      styles.importanceLine,
                      { 
                        height: level * 0.8 + 0.5, 
                        backgroundColor: importance === level ? '#2196F3' : '#999',
                        opacity: 0.5 + level * 0.1
                      }
                    ]} />
                    <Text style={[
                      styles.importanceText,
                      importance === level && styles.importanceTextActive
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.importanceHint}>
                1 = Nhạt (phụ) → 5 = Đậm (chính)
              </Text>

              {/* Line Type */}
              <Text style={styles.inputLabel}>Kiểu đường</Text>
              <View style={styles.typeOptions}>
                {(['direct', 'bezier', 'orthogonal'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeOption, type === t && styles.typeOptionActive]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextActive]}>
                      {t === 'direct' ? 'Thẳng' : t === 'bezier' ? 'Cong' : 'Vuông góc'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Line Style */}
              <Text style={styles.inputLabel}>Kiểu nét</Text>
              <View style={styles.typeOptions}>
                {(['solid', 'dashed', 'dotted'] as const).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.typeOption, style === s && styles.typeOptionActive]}
                    onPress={() => setStyle(s)}
                  >
                    <Text style={[styles.typeOptionText, style === s && styles.typeOptionTextActive]}>
                      {s === 'solid' ? 'Liền' : s === 'dashed' ? 'Gạch' : 'Chấm'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bidirectional Arrow */}
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => setShowStartArrow(!showStartArrow)}
              >
                <View style={[styles.checkbox, showStartArrow && styles.checkboxActive]}>
                  {showStartArrow && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Mũi tên 2 chiều</Text>
              </TouchableOpacity>

              {/* Color */}
              <Text style={styles.inputLabel}>Màu tùy chỉnh</Text>
              <View style={styles.colorOptions}>
                {CONNECTION_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorOptionActive]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                <Ionicons name="trash" size={18} color="#F44336" />
                <Text style={styles.deleteBtnText}>Xóa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateBtn}
                onPress={() => onUpdate({ type, color, style, importance, relationshipType, showStartArrow, label: label || undefined })}
              >
                <Text style={styles.updateBtnText}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ==================== PROJECTS MODAL ====================

interface ProjectsModalProps {
  visible: boolean;
  projects: Project[];
  currentProjectId?: string;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

function ProjectsModal({ 
  visible, projects, currentProjectId, onClose, 
  onSelectProject, onNewProject, onDeleteProject, onRenameProject 
}: ProjectsModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      onRenameProject(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dự án của tôi</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* New Project Button */}
            <TouchableOpacity style={styles.newProjectBtn} onPress={onNewProject}>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
              <Text style={styles.newProjectBtnText}>Tạo dự án mới</Text>
            </TouchableOpacity>

            {/* Project List */}
            {projects.map(project => (
              <TouchableOpacity 
                key={project.id}
                style={[
                  styles.projectItem,
                  currentProjectId === project.id && styles.projectItemActive
                ]}
                onPress={() => onSelectProject(project.id)}
              >
                <View style={styles.projectItemLeft}>
                  <Ionicons 
                    name={currentProjectId === project.id ? 'folder-open' : 'folder-outline'} 
                    size={24} 
                    color={currentProjectId === project.id ? '#2196F3' : '#666'} 
                  />
                </View>
                <View style={styles.projectItemCenter}>
                  {editingId === project.id ? (
                    <TextInput
                      style={styles.projectEditInput}
                      value={editName}
                      onChangeText={setEditName}
                      onBlur={confirmRename}
                      onSubmitEditing={confirmRename}
                      autoFocus
                    />
                  ) : (
                    <>
                      <Text style={styles.projectItemName} numberOfLines={1}>{project.name}</Text>
                      <Text style={styles.projectItemDate}>
                        {new Date(project.updatedAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </>
                  )}
                </View>
                <View style={styles.projectItemActions}>
                  <TouchableOpacity onPress={() => startRename(project)} style={styles.projectActionBtn}>
                    <Ionicons name="pencil" size={18} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDeleteProject(project.id)} style={styles.projectActionBtn}>
                    <Ionicons name="trash-outline" size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {projects.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>Chưa có dự án nào</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ==================== TEMPLATES MODAL ====================

interface TemplatesModalProps {
  visible: boolean;
  templates: ProjectTemplate[];
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

function TemplatesModal({ visible, templates, onClose, onSelectTemplate }: TemplatesModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn template</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {templates.map(template => (
              <TouchableOpacity 
                key={template.id}
                style={styles.templateItem}
                onPress={() => onSelectTemplate(template.id)}
              >
                <View style={styles.templateIcon}>
                  <Ionicons name={template.icon as any} size={32} color="#2196F3" />
                </View>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDesc}>{template.description}</Text>
                  <Text style={styles.templateStats}>
                    {template.nodes.length} hạng mục • {template.connections.length} kết nối
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ==================== SETTINGS MODAL ====================

interface SettingsModalProps {
  visible: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  onExport: () => void;
}

function SettingsModal({ visible, settings, onClose, onSave, onExport }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cài đặt</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Grid Snap */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Bám lưới (Grid Snap)</Text>
                <Text style={styles.settingDesc}>Node sẽ căn theo lưới khi di chuyển</Text>
              </View>
              <TouchableOpacity 
                style={[styles.settingToggle, localSettings.gridSnap && styles.settingToggleActive]}
                onPress={() => setLocalSettings(s => ({ ...s, gridSnap: !s.gridSnap }))}
              >
                <View style={[styles.settingToggleThumb, localSettings.gridSnap && styles.settingToggleThumbActive]} />
              </TouchableOpacity>
            </View>

            {/* Grid Size */}
            {localSettings.gridSnap && (
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Kích thước lưới: {localSettings.gridSize}px</Text>
                <View style={styles.gridSizeOptions}>
                  {[10, 20, 30, 50].map(size => (
                    <TouchableOpacity
                      key={size}
                      style={[styles.gridSizeBtn, localSettings.gridSize === size && styles.gridSizeBtnActive]}
                      onPress={() => setLocalSettings(s => ({ ...s, gridSize: size }))}
                    >
                      <Text style={[styles.gridSizeBtnText, localSettings.gridSize === size && styles.gridSizeBtnTextActive]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Show Grid */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Hiển thị lưới</Text>
                <Text style={styles.settingDesc}>Hiển thị lưới trên canvas</Text>
              </View>
              <TouchableOpacity 
                style={[styles.settingToggle, localSettings.showGrid && styles.settingToggleActive]}
                onPress={() => setLocalSettings(s => ({ ...s, showGrid: !s.showGrid }))}
              >
                <View style={[styles.settingToggleThumb, localSettings.showGrid && styles.settingToggleThumbActive]} />
              </TouchableOpacity>
            </View>

            {/* Auto Save */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Tự động lưu</Text>
                <Text style={styles.settingDesc}>Lưu tự động sau {localSettings.autoSaveInterval}s</Text>
              </View>
              <TouchableOpacity 
                style={[styles.settingToggle, localSettings.autoSave && styles.settingToggleActive]}
                onPress={() => setLocalSettings(s => ({ ...s, autoSave: !s.autoSave }))}
              >
                <View style={[styles.settingToggleThumb, localSettings.autoSave && styles.settingToggleThumbActive]} />
              </TouchableOpacity>
            </View>

            {/* Default Node Type */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Kiểu node mặc định</Text>
              <View style={styles.nodeTypeOptions}>
                {(['rect', 'circle', 'pill', 'group'] as VectorNodeType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.nodeTypeBtn, localSettings.defaultNodeType === t && styles.nodeTypeBtnActive]}
                    onPress={() => setLocalSettings(s => ({ ...s, defaultNodeType: t }))}
                  >
                    <Text style={[styles.nodeTypeBtnText, localSettings.defaultNodeType === t && styles.nodeTypeBtnTextActive]}>
                      {t === 'rect' ? 'Thẻ' : t === 'circle' ? 'Tròn' : t === 'pill' ? 'Pill' : 'Group'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Export/Import Section */}
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Dữ liệu</Text>
              <TouchableOpacity style={styles.settingActionBtn} onPress={onExport}>
                <Ionicons name="download-outline" size={20} color="#2196F3" />
                <Text style={styles.settingActionText}>Xuất dự án (JSON)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.updateBtn} onPress={handleSave}>
              <Text style={styles.updateBtnText}>Lưu cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unsavedBadge: {
    marginRight: 4,
  },
  unsavedText: {
    color: '#FF9800',
    fontSize: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  toolBtnActive: {
    backgroundColor: '#2196F3',
  },
  toolText: {
    fontSize: 12,
    color: '#666',
  },
  toolTextActive: {
    color: '#fff',
  },
  addNodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addNodeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  connectingText: {
    fontSize: 13,
    color: '#1976D2',
    flex: 1,
  },
  cancelConnectText: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '600',
  },
  canvasScroll: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  canvasScrollFullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAFAFA',
  },
  zoomToolbar: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  zoomToolbarFullscreen: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  zoomText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    minWidth: 50,
    textAlign: 'center',
  },
  zoomDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 2,
  },
  connectionEditToolbar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  connectionEditTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  connectionToolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  connTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  connTypeBtnActive: {
    backgroundColor: '#2196F3',
  },
  connTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  connStyleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineSample: {
    width: 30,
    borderBottomWidth: 2,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#333',
    borderWidth: 3,
  },
  connActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  canvasContent: {
    minWidth: SCREEN_WIDTH,
    minHeight: SCREEN_HEIGHT,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: '#fff',
    transformOrigin: 'top left',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  node: {
    position: 'absolute',
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    borderRadius: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  nodeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  nodeProgressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 4,
  },
  nodeProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  nodeProgress: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  nodeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  nodeImageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  nodeImageCount: {
    fontSize: 9,
    fontWeight: '600',
  },
  nodeImageBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(33,150,243,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLinkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  controlHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 6,
  },
  legend: {
    padding: 10,
    borderTopWidth: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    left: '50%',
    transform: [{ translateX: -80 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  progressSlider: {
    flexDirection: 'row',
    gap: 8,
  },
  imagesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  imagesRow: {
    marginTop: 10,
    marginBottom: 4,
  },
  imageItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(244,67,54,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndex: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndexText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  imageOptionsMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  imageOptionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  imageOptionBtnCancel: {
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  imageOptionCancelText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  noImagesPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  noImagesText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  imagePreviewFull: {
    width: '100%',
    height: '70%',
  },
  imagePreviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginTop: 20,
  },
  imagePreviewBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewCounter: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  progressBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  progressBtnActive: {
    backgroundColor: '#2196F3',
  },
  progressBtnText: {
    fontSize: 12,
    color: '#666',
  },
  progressBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  statusOptionActive: {
    borderWidth: 3,
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  linkTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  linkTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  linkTypeBtnActive: {
    backgroundColor: '#2196F3',
  },
  linkTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  linkTypeTextActive: {
    color: '#fff',
  },
  inputHint: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#2196F3',
  },
  typeOptionText: {
    fontSize: 13,
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#333',
  },
  connectionInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteBtnText: {
    color: '#F44336',
    fontWeight: '600',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  updateBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  updateBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  chipText: {
    fontSize: 12,
    color: '#333',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  // New styles for Project Management
  headerIconBtn: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  // Projects Modal
  newProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    marginBottom: 16,
  },
  newProjectBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  projectItemActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  projectItemLeft: {
    marginRight: 12,
  },
  projectItemCenter: {
    flex: 1,
  },
  projectItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  projectItemDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  projectItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  projectActionBtn: {
    padding: 6,
  },
  projectEditInput: {
    fontSize: 15,
    fontWeight: '600',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },
  // Templates Modal
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#eee',
  },
  templateIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  templateDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  templateStats: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
  // Settings Modal
  settingRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  settingDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  settingToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    padding: 2,
  },
  settingToggleActive: {
    backgroundColor: '#4CAF50',
  },
  settingToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  settingToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  gridSizeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  gridSizeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  gridSizeBtnActive: {
    backgroundColor: '#2196F3',
  },
  gridSizeBtnText: {
    fontSize: 13,
    color: '#666',
  },
  gridSizeBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  nodeTypeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  nodeTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  nodeTypeBtnActive: {
    backgroundColor: '#2196F3',
  },
  nodeTypeBtnText: {
    fontSize: 12,
    color: '#666',
  },
  nodeTypeBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  settingSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  settingSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    marginBottom: 8,
  },
  settingActionText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 100,
  },
  // Quick Actions Menu
  quickActionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  quickActionsMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  quickActionTextDisabled: {
    color: '#999',
  },
  quickActionDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  quickActionCancel: {
    marginTop: 4,
    backgroundColor: '#FFF5F5',
  },
  // Input Dialog styles
  inputDialogInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputDialogBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  inputDialogBtnCancel: {
    backgroundColor: '#F5F5F5',
  },
  inputDialogBtnCancelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  inputDialogBtnConfirm: {
    backgroundColor: '#2196F3',
  },
  inputDialogBtnConfirmText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  // Connection Edit Modal - Enhanced styles
  connectionInfoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  connectionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectionNodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  connectionNodeText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  relationTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  relationTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#F9F9F9',
  },
  relationTypeOptionActive: {
    backgroundColor: '#fff',
  },
  relationTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  relationTypeText: {
    fontSize: 13,
    color: '#666',
  },
  importanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  importanceBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  importanceBtnActive: {
    backgroundColor: '#E3F2FD',
  },
  importanceLine: {
    width: 30,
    borderRadius: 2,
    marginBottom: 6,
  },
  importanceText: {
    fontSize: 12,
    color: '#666',
  },
  importanceTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  importanceHint: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
  },
});
