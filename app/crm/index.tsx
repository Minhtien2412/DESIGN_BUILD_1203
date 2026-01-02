/**
 * Perfex CRM Dashboard Screen
 * ============================
 * 
 * Màn hình hiển thị dữ liệu từ Perfex CRM với đồng bộ tự động
 * 
 * @author ThietKeResort Team
 * @since 2025-12-30
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    CustomerList,
    DashboardCards,
    ProjectList,
    SyncStatusBanner,
} from '@/components/PerfexCrmComponents';
import { PerfexSyncProvider, usePerfexSync } from '@/context/PerfexSyncContext';
import { Customer, formatDate, formatVND, getProjectStatusName, Project } from '@/services/perfexSync';

// ==================== MAIN SCREEN ====================

function CrmDashboardContent() {
  const { isLoading, error } = usePerfexSync();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'customers'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleProjectPress = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCustomerPress = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfex CRM</Text>
        <TouchableOpacity onPress={() => router.push('/crm/admin' as any)} style={styles.adminButton}>
          <Ionicons name="shield-checkmark" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Sync Status */}
      <View style={styles.syncContainer}>
        <SyncStatusBanner />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TabButton
          label="Tổng quan"
          icon="grid"
          active={activeTab === 'dashboard'}
          onPress={() => setActiveTab('dashboard')}
        />
        <TabButton
          label="Dự án"
          icon="folder"
          active={activeTab === 'projects'}
          onPress={() => setActiveTab('projects')}
        />
        <TabButton
          label="Khách hàng"
          icon="people"
          active={activeTab === 'customers'}
          onPress={() => setActiveTab('customers')}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <DashboardCards />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dự án gần đây</Text>
              <ProjectList onProjectPress={handleProjectPress} showHeader={false} />
            </View>
          </ScrollView>
        )}

        {activeTab === 'projects' && (
          <ProjectList onProjectPress={handleProjectPress} />
        )}

        {activeTab === 'customers' && (
          <CustomerList onCustomerPress={handleCustomerPress} />
        )}
      </View>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </SafeAreaView>
  );
}

// ==================== TAB BUTTON ====================

interface TabButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}

function TabButton({ label, icon, active, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={active ? '#3B82F6' : '#6B7280'}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ==================== PROJECT DETAIL MODAL ====================

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  if (!project) return null;

  return (
    <Modal
      visible={!!project}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chi tiết dự án</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.projectDetailName}>{project.name}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trạng thái</Text>
            <Text style={styles.detailValue}>{getProjectStatusName(project.status)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Khách hàng</Text>
            <Text style={styles.detailValue}>{project.company}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giá trị</Text>
            <Text style={styles.detailValueLarge}>
              {formatVND(parseFloat(project.project_cost || '0'))}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày bắt đầu</Text>
            <Text style={styles.detailValue}>{formatDate(project.start_date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hạn hoàn thành</Text>
            <Text style={styles.detailValue}>
              {project.deadline ? formatDate(project.deadline) : 'Chưa xác định'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tiến độ</Text>
            <View style={styles.progressWrapper}>
              <View style={styles.progressBarLarge}>
                <View style={[styles.progressFill, { width: `${project.progress}%` as any }]} />
              </View>
              <Text style={styles.progressLabel}>{project.progress}%</Text>
            </View>
          </View>

          {project.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.detailLabel}>Mô tả</Text>
              <Text style={styles.descriptionText}>{project.description}</Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ==================== CUSTOMER DETAIL MODAL ====================

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
}

function CustomerDetailModal({ customer, onClose }: CustomerDetailModalProps) {
  const { getProjectsByCustomer } = usePerfexSync();
  
  if (!customer) return null;

  const projects = getProjectsByCustomer(customer.userid);

  return (
    <Modal
      visible={!!customer}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chi tiết khách hàng</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.customerHeader}>
            <View style={styles.customerAvatarLarge}>
              <Text style={styles.customerAvatarTextLarge}>
                {customer.company.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.customerNameLarge}>{customer.company}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Điện thoại</Text>
            <Text style={styles.detailValue}>{customer.phonenumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thành phố</Text>
            <Text style={styles.detailValue}>{customer.city}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Địa chỉ</Text>
            <Text style={styles.detailValue}>{customer.address?.replace(/<br \/>/g, '\n')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Website</Text>
            <Text style={[styles.detailValue, styles.linkText]}>{customer.website}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày tạo</Text>
            <Text style={styles.detailValue}>{formatDate(customer.datecreated)}</Text>
          </View>

          {projects.length > 0 && (
            <View style={styles.projectsSection}>
              <Text style={styles.sectionTitle}>Dự án ({projects.length})</Text>
              {projects.map((project) => (
                <View key={project.id} style={styles.miniProjectCard}>
                  <Text style={styles.miniProjectName}>{project.name}</Text>
                  <Text style={styles.miniProjectValue}>
                    {formatVND(parseFloat(project.project_cost || '0'))}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ==================== EXPORTED SCREEN ====================

export default function PerfexCrmDashboard() {
  return (
    <PerfexSyncProvider>
      <CrmDashboardContent />
    </PerfexSyncProvider>
  );
}

// ==================== STYLES ====================

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
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  adminButton: {
    padding: 4,
  },
  headerRight: {
    width: 32,
  },
  syncContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  projectDetailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
  },
  detailValueLarge: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10B981',
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarLarge: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    width: 40,
  },
  descriptionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },

  // Customer Modal
  customerHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  customerAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerAvatarTextLarge: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFF',
  },
  customerNameLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  linkText: {
    color: '#3B82F6',
  },
  projectsSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  miniProjectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  miniProjectName: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  miniProjectValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
});
