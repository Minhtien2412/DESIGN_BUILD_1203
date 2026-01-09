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
            
            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/tasks' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F620' }]}>
                    <Ionicons name="checkbox-outline" size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.quickActionLabel}>Tasks</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/leads' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#66666620' }]}>
                    <Ionicons name="funnel-outline" size={24} color="#666666" />
                  </View>
                  <Text style={styles.quickActionLabel}>Leads</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/invoices' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#0066CC20' }]}>
                    <Ionicons name="receipt-outline" size={24} color="#0066CC" />
                  </View>
                  <Text style={styles.quickActionLabel}>Hóa đơn</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/customers' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#0066CC20' }]}>
                    <Ionicons name="people-outline" size={24} color="#0066CC" />
                  </View>
                  <Text style={styles.quickActionLabel}>Khách hàng</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Enhanced CRM Features */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Quản lý nâng cao</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/time-tracking' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#22c55e20' }]}>
                    <Ionicons name="time-outline" size={24} color="#22c55e" />
                  </View>
                  <Text style={styles.quickActionLabel}>Chấm công</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/milestones' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b20' }]}>
                    <Ionicons name="flag-outline" size={24} color="#f59e0b" />
                  </View>
                  <Text style={styles.quickActionLabel}>Mốc dự án</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/expenses' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#ef444420' }]}>
                    <Ionicons name="wallet-outline" size={24} color="#ef4444" />
                  </View>
                  <Text style={styles.quickActionLabel}>Chi phí</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/project-management' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#8b5cf620' }]}>
                    <Ionicons name="briefcase-outline" size={24} color="#8b5cf6" />
                  </View>
                  <Text style={styles.quickActionLabel}>Dự án +</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Perfex CRM Features */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Tính năng Perfex CRM</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/gantt-chart' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#3b82f620' }]}>
                    <Ionicons name="bar-chart-outline" size={24} color="#3b82f6" />
                  </View>
                  <Text style={styles.quickActionLabel}>Gantt Chart</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/discussions' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#22c55e20' }]}>
                    <Ionicons name="chatbubbles-outline" size={24} color="#22c55e" />
                  </View>
                  <Text style={styles.quickActionLabel}>Trao đổi</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/files' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#8b5cf620' }]}>
                    <Ionicons name="folder-outline" size={24} color="#8b5cf6" />
                  </View>
                  <Text style={styles.quickActionLabel}>Tập tin</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/notes' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b20' }]}>
                    <Ionicons name="document-text-outline" size={24} color="#f59e0b" />
                  </View>
                  <Text style={styles.quickActionLabel}>Ghi chú</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/contracts' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#06b6d420' }]}>
                    <Ionicons name="document-attach-outline" size={24} color="#06b6d4" />
                  </View>
                  <Text style={styles.quickActionLabel}>Hợp đồng</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/sales' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#10b98120' }]}>
                    <Ionicons name="trending-up-outline" size={24} color="#10b981" />
                  </View>
                  <Text style={styles.quickActionLabel}>Doanh số</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/activity' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#ec489920' }]}>
                    <Ionicons name="pulse-outline" size={24} color="#ec4899" />
                  </View>
                  <Text style={styles.quickActionLabel}>Hoạt động</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/tickets' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#f4333320' }]}>
                    <Ionicons name="ticket-outline" size={24} color="#f43333" />
                  </View>
                  <Text style={styles.quickActionLabel}>Yêu cầu</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/mind-map' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#a855f720' }]}>
                    <Ionicons name="git-network-outline" size={24} color="#a855f7" />
                  </View>
                  <Text style={styles.quickActionLabel}>Sơ đồ TĐ</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/reports' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#0ea5e920' }]}>
                    <Ionicons name="analytics-outline" size={24} color="#0ea5e9" />
                  </View>
                  <Text style={styles.quickActionLabel}>Báo cáo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/crm/settings' as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#6b728020' }]}>
                    <Ionicons name="settings-outline" size={24} color="#6b7280" />
                  </View>
                  <Text style={styles.quickActionLabel}>Cài đặt</Text>
                </TouchableOpacity>
              </View>
            </View>

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
    color: '#0066CC',
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
    color: '#0066CC',
  },

  // Quick Actions Section
  quickActionsSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});
