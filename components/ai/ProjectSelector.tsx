/**
 * ProjectSelector Component - Select project for AI operations
 * Supports dropdown and modal modes
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface Project {
  id: number;
  name: string;
  address?: string;
  status?: 'active' | 'completed' | 'paused';
  progress?: number;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: number | null;
  onSelectProject: (projectId: number) => void;
  mode?: 'dropdown' | 'modal';
}

export default function ProjectSelector({
  projects,
  selectedProjectId,
  onSelectProject,
  mode = 'modal',
}: ProjectSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleSelectProject = (projectId: number) => {
    onSelectProject(projectId);
    setModalVisible(false);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return '#0066CC';
      case 'completed':
        return '#6B7280';
      case 'paused':
        return '#0066CC';
      default:
        return Colors.light.primary;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Đang thi công';
      case 'completed':
        return 'Hoàn thành';
      case 'paused':
        return 'Tạm dừng';
      default:
        return 'Không xác định';
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Ionicons name="folder-open" size={20} color={Colors.light.primary} />
          <View style={styles.textContainer}>
            <Text style={styles.label}>Dự án</Text>
            <Text style={styles.selectedText} numberOfLines={1}>
              {selectedProject ? selectedProject.name : 'Chọn dự án'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn dự án</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Project List */}
            <ScrollView style={styles.projectList}>
              {projects.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyText}>Chưa có dự án nào</Text>
                  <Text style={styles.emptySubtext}>
                    Tạo dự án mới để sử dụng AI Assistant
                  </Text>
                </View>
              ) : (
                projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectItem,
                      selectedProjectId === project.id && styles.selectedItem,
                    ]}
                    onPress={() => handleSelectProject(project.id)}
                  >
                    <View style={styles.projectInfo}>
                      <View style={styles.projectHeader}>
                        <Text style={styles.projectName}>{project.name}</Text>
                        {selectedProjectId === project.id && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={Colors.light.primary}
                          />
                        )}
                      </View>
                      {project.address && (
                        <Text style={styles.projectAddress} numberOfLines={1}>
                          📍 {project.address}
                        </Text>
                      )}
                      <View style={styles.projectMeta}>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(project.status) + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusColor(project.status) },
                            ]}
                          >
                            {getStatusText(project.status)}
                          </Text>
                        </View>
                        {project.progress !== undefined && (
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <View
                                style={[
                                  styles.progressFill,
                                  { width: `${project.progress}%` },
                                ]}
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {project.progress}%
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  setModalVisible(false);
                  // TODO: Navigate to create project screen
                }}
              >
                <Ionicons name="add-circle" size={20} color={Colors.light.primary} />
                <Text style={styles.createButtonText}>Tạo dự án mới</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  projectList: {
    maxHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  projectItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedItem: {
    backgroundColor: '#E8F4FF',
  },
  projectInfo: {
    flex: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  projectAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
    minWidth: 35,
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
