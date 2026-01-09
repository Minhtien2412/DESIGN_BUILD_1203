/**
 * ProjectTemplateSelector.tsx
 * Template selection for creating new construction projects
 * 
 * Features:
 * - Pre-defined project templates (Residential, Commercial, Infrastructure)
 * - Template preview with stages and tasks
 * - Custom template option
 * - Template details modal
 * - Visual template cards with icons
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category: 'residential' | 'commercial' | 'infrastructure' | 'custom';
  defaultStages: Array<{
    name: string;
    order: number;
    duration: number; // days
  }>;
  defaultTasks: Array<{
    name: string;
    stageIndex: number;
    duration: number;
    priority: 'Low' | 'Medium' | 'High';
  }>;
  estimatedDuration: number; // days
  complexity: 'simple' | 'medium' | 'complex';
}

interface ProjectTemplateSelectorProps {
  visible: boolean;
  onSelectTemplate: (template: ProjectTemplate) => void;
  onClose: () => void;
}

// Predefined templates
const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'residential-villa',
    name: 'Biệt Thự Cao Cấp',
    description: 'Dự án xây dựng biệt thự từ 2-3 tầng với đầy đủ tiện nghi',
    icon: 'home',
    color: '#0066CC',
    category: 'residential',
    estimatedDuration: 180,
    complexity: 'complex',
    defaultStages: [
      { name: 'Khảo sát & Thiết kế', order: 1, duration: 30 },
      { name: 'Xin phép xây dựng', order: 2, duration: 20 },
      { name: 'Móng & kết cấu', order: 3, duration: 45 },
      { name: 'Tường & mái', order: 4, duration: 30 },
      { name: 'Hoàn thiện nội thất', order: 5, duration: 40 },
      { name: 'Nghiệm thu', order: 6, duration: 15 },
    ],
    defaultTasks: [
      { name: 'Khảo sát địa chất', stageIndex: 0, duration: 7, priority: 'High' },
      { name: 'Thiết kế kiến trúc', stageIndex: 0, duration: 15, priority: 'High' },
      { name: 'Thiết kế kết cấu', stageIndex: 0, duration: 10, priority: 'High' },
      { name: 'Nộp hồ sơ xin phép', stageIndex: 1, duration: 5, priority: 'High' },
      { name: 'Đào móng', stageIndex: 2, duration: 10, priority: 'High' },
      { name: 'Đổ bê tông móng', stageIndex: 2, duration: 15, priority: 'High' },
    ],
  },
  {
    id: 'residential-apartment',
    name: 'Nhà Ở Đơn Giản',
    description: 'Nhà ở 1-2 tầng cho gia đình nhỏ',
    icon: 'business',
    color: '#3B82F6',
    category: 'residential',
    estimatedDuration: 120,
    complexity: 'medium',
    defaultStages: [
      { name: 'Thiết kế', order: 1, duration: 15 },
      { name: 'Xin phép', order: 2, duration: 10 },
      { name: 'Móng & cột', order: 3, duration: 30 },
      { name: 'Tường & mái', order: 4, duration: 25 },
      { name: 'Hoàn thiện', order: 5, duration: 30 },
      { name: 'Bàn giao', order: 6, duration: 10 },
    ],
    defaultTasks: [
      { name: 'Thiết kế bản vẽ', stageIndex: 0, duration: 10, priority: 'High' },
      { name: 'Đào móng', stageIndex: 2, duration: 7, priority: 'High' },
      { name: 'Đổ bê tông', stageIndex: 2, duration: 15, priority: 'High' },
      { name: 'Xây tường', stageIndex: 3, duration: 20, priority: 'Medium' },
    ],
  },
  {
    id: 'commercial-office',
    name: 'Văn Phòng Thương Mại',
    description: 'Tòa nhà văn phòng 3-5 tầng',
    icon: 'briefcase',
    color: '#0066CC',
    category: 'commercial',
    estimatedDuration: 240,
    complexity: 'complex',
    defaultStages: [
      { name: 'Khảo sát & Thiết kế', order: 1, duration: 45 },
      { name: 'Thủ tục pháp lý', order: 2, duration: 30 },
      { name: 'Kết cấu chính', order: 3, duration: 60 },
      { name: 'Hệ thống MEP', order: 4, duration: 40 },
      { name: 'Hoàn thiện', order: 5, duration: 50 },
      { name: 'Nghiệm thu & bàn giao', order: 6, duration: 15 },
    ],
    defaultTasks: [
      { name: 'Thiết kế kiến trúc', stageIndex: 0, duration: 20, priority: 'High' },
      { name: 'Thiết kế MEP', stageIndex: 0, duration: 15, priority: 'High' },
      { name: 'Thi công móng', stageIndex: 2, duration: 30, priority: 'High' },
      { name: 'Lắp đặt điện', stageIndex: 3, duration: 20, priority: 'Medium' },
    ],
  },
  {
    id: 'infrastructure-road',
    name: 'Hạ Tầng Giao Thông',
    description: 'Đường giao thông, cầu, hạ tầng kỹ thuật',
    icon: 'car',
    color: '#000000',
    category: 'infrastructure',
    estimatedDuration: 300,
    complexity: 'complex',
    defaultStages: [
      { name: 'Khảo sát địa hình', order: 1, duration: 20 },
      { name: 'Thiết kế kỹ thuật', order: 2, duration: 40 },
      { name: 'Giải phóng mặt bằng', order: 3, duration: 60 },
      { name: 'Thi công nền đường', order: 4, duration: 80 },
      { name: 'Thi công mặt đường', order: 5, duration: 70 },
      { name: 'Nghiệm thu', order: 6, duration: 30 },
    ],
    defaultTasks: [
      { name: 'Khảo sát đo đạc', stageIndex: 0, duration: 15, priority: 'High' },
      { name: 'Thiết kế nền đường', stageIndex: 1, duration: 20, priority: 'High' },
      { name: 'San nền', stageIndex: 3, duration: 40, priority: 'High' },
    ],
  },
  {
    id: 'custom',
    name: 'Tự Tạo Từ Đầu',
    description: 'Tạo dự án mới với cấu hình tùy chỉnh',
    icon: 'create-outline',
    color: '#6B7280',
    category: 'custom',
    estimatedDuration: 0,
    complexity: 'simple',
    defaultStages: [],
    defaultTasks: [],
  },
];

export const ProjectTemplateSelector: React.FC<ProjectTemplateSelectorProps> = ({
  visible,
  onSelectTemplate,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  const handleSelectTemplate = (template: ProjectTemplate) => {
    if (template.id === 'custom') {
      onSelectTemplate(template);
    } else {
      setSelectedTemplate(template);
      setShowDetails(true);
    }
  };

  const handleConfirmTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setShowDetails(false);
      setSelectedTemplate(null);
    }
  };

  const getComplexityLabel = (complexity: string): string => {
    switch (complexity) {
      case 'simple':
        return 'Đơn giản';
      case 'medium':
        return 'Trung bình';
      case 'complex':
        return 'Phức tạp';
      default:
        return '';
    }
  };

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case 'simple':
        return '#0066CC';
      case 'medium':
        return '#0066CC';
      case 'complex':
        return '#000000';
      default:
        return '#6B7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn Mẫu Dự Án</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>
            Chọn mẫu dự án phù hợp với công trình của bạn
          </Text>

          <View style={styles.templateGrid}>
            {TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleSelectTemplate(template)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.templateIcon,
                    { backgroundColor: `${template.color}20` },
                  ]}
                >
                  <Ionicons name={template.icon} size={32} color={template.color} />
                </View>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription} numberOfLines={2}>
                  {template.description}
                </Text>

                {template.id !== 'custom' && (
                  <View style={styles.templateStats}>
                    <View style={styles.statBadge}>
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text style={styles.statText}>
                        {template.estimatedDuration} ngày
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.complexityBadge,
                        {
                          backgroundColor: `${getComplexityColor(
                            template.complexity
                          )}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.complexityText,
                          { color: getComplexityColor(template.complexity) },
                        ]}
                      >
                        {getComplexityLabel(template.complexity)}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Template Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsContent}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>
                {selectedTemplate?.name || ''}
              </Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsScroll}>
              <Text style={styles.detailsDescription}>
                {selectedTemplate?.description}
              </Text>

              {/* Stats */}
              <View style={styles.detailsStats}>
                <View style={styles.detailsStat}>
                  <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                  <Text style={styles.detailsStatLabel}>Thời gian dự kiến</Text>
                  <Text style={styles.detailsStatValue}>
                    {selectedTemplate?.estimatedDuration} ngày
                  </Text>
                </View>
                <View style={styles.detailsStat}>
                  <Ionicons name="layers-outline" size={20} color="#0066CC" />
                  <Text style={styles.detailsStatLabel}>Số giai đoạn</Text>
                  <Text style={styles.detailsStatValue}>
                    {selectedTemplate?.defaultStages.length || 0}
                  </Text>
                </View>
                <View style={styles.detailsStat}>
                  <Ionicons name="list-outline" size={20} color="#0066CC" />
                  <Text style={styles.detailsStatLabel}>Công việc mẫu</Text>
                  <Text style={styles.detailsStatValue}>
                    {selectedTemplate?.defaultTasks.length || 0}
                  </Text>
                </View>
              </View>

              {/* Stages */}
              <Text style={styles.sectionLabel}>Các giai đoạn:</Text>
              {selectedTemplate?.defaultStages.map((stage, index) => (
                <View key={index} style={styles.stageItem}>
                  <View style={styles.stageNumber}>
                    <Text style={styles.stageNumberText}>{stage.order}</Text>
                  </View>
                  <View style={styles.stageInfo}>
                    <Text style={styles.stageName}>{stage.name}</Text>
                    <Text style={styles.stageDuration}>
                      {stage.duration} ngày
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Actions */}
            <View style={styles.detailsActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDetails(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmTemplate}
              >
                <Text style={styles.confirmButtonText}>Sử Dụng Mẫu Này</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6B7280',
    padding: 16,
    textAlign: 'center',
  },
  templateGrid: {
    padding: 16,
    gap: 16,
  },
  templateCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  templateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  templateDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  complexityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  complexityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailsContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  detailsScroll: {
    flex: 1,
    padding: 20,
  },
  detailsDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  detailsStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  detailsStat: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 6,
  },
  detailsStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  detailsStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  stageDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailsActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
