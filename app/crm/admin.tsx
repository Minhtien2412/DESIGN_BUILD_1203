/**
 * Perfex CRM Admin Dashboard
 * ===========================
 * 
 * Bảng điều khiển quản trị với đầy đủ dữ liệu từ Perfex CRM
 * Hiển thị: Customers, Projects, Staff, Invoices, Leads, Tasks...
 * 
 * @author ThietKeResort Team
 * @since 2025-12-30
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { PerfexFullSyncProvider, usePerfexFullSync } from '@/context/PerfexFullSyncContext';
import { formatDate, formatVND, getStatusColor, getStatusName } from '@/services/perfexFullSync';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== MAIN CONTENT ====================

function AdminDashboardContent() {
  const {
    syncState,
    isLoading,
    error,
    customers,
    projects,
    staff,
    invoices,
    leads,
    tasks,
    tickets,
    dashboard,
    availableEndpoints,
    refreshAll,
  } = usePerfexFullSync();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Quản trị CRM</Text>
          <Text style={styles.headerSubtitle}>Perfex CRM Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          {syncState.isSyncing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="sync" size={22} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Sync Status Bar */}
      <SyncStatusBar syncState={syncState} availableEndpoints={availableEndpoints} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={18} color="#FFF" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Quick Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quan</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="people"
              label="Khách hàng"
              value={dashboard?.totalCustomers || customers.length}
              subValue={`${dashboard?.activeCustomers || 0} hoạt động`}
              color="#3B82F6"
            />
            <StatCard
              icon="folder"
              label="Dự án"
              value={dashboard?.totalProjects || projects.length}
              subValue={`${dashboard?.activeProjects || 0} đang thực hiện`}
              color="#0066CC"
            />
            <StatCard
              icon="person"
              label="Nhân viên"
              value={dashboard?.totalStaff || staff.length}
              subValue={availableEndpoints.includes('staff') ? `${dashboard?.activeStaff || 0} hoạt động` : 'Chưa kết nối'}
              color="#666666"
              disabled={!availableEndpoints.includes('staff')}
            />
            <StatCard
              icon="receipt"
              label="Hóa đơn"
              value={dashboard?.totalInvoices || invoices.length}
              subValue={availableEndpoints.includes('invoices') ? `${dashboard?.paidInvoices || 0} đã thanh toán` : 'Chưa kết nối'}
              color="#0066CC"
              disabled={!availableEndpoints.includes('invoices')}
            />
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài chính</Text>
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Giá trị dự án</Text>
                <Text style={[styles.financialValue, { color: '#3B82F6' }]}>
                  {formatVND(dashboard?.projectsValue || 0)}
                </Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Doanh thu</Text>
                <Text style={[styles.financialValue, { color: '#0066CC' }]}>
                  {formatVND(dashboard?.totalRevenue || 0)}
                </Text>
              </View>
            </View>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Chưa thu</Text>
                <Text style={[styles.financialValue, { color: '#0066CC' }]}>
                  {formatVND(dashboard?.totalOutstanding || 0)}
                </Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Chi phí</Text>
                <Text style={[styles.financialValue, { color: '#000000' }]}>
                  {formatVND(dashboard?.totalExpenseAmount || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="people"
              label="Khách hàng"
              count={customers.length}
              onPress={() => router.push('/crm/customers' as any)}
              color="#3B82F6"
            />
            <QuickActionButton
              icon="folder"
              label="Dự án"
              count={projects.length}
              onPress={() => router.push('/crm/projects' as any)}
              color="#0066CC"
            />
            <QuickActionButton
              icon="person-circle"
              label="Nhân viên"
              count={staff.length}
              onPress={() => router.push('/crm/staff' as any)}
              color="#666666"
              disabled={!availableEndpoints.includes('staff')}
            />
            <QuickActionButton
              icon="receipt"
              label="Hóa đơn"
              count={invoices.length}
              onPress={() => router.push('/crm/invoices' as any)}
              color="#0066CC"
              disabled={!availableEndpoints.includes('invoices')}
            />
            <QuickActionButton
              icon="flag"
              label="Leads"
              count={leads.length}
              onPress={() => router.push('/crm/leads' as any)}
              color="#666666"
              disabled={!availableEndpoints.includes('leads')}
            />
            <QuickActionButton
              icon="checkbox"
              label="Công việc"
              count={tasks.length}
              onPress={() => router.push('/crm/tasks' as any)}
              color="#666666"
              disabled={!availableEndpoints.includes('tasks')}
            />
            <QuickActionButton
              icon="chatbubbles"
              label="Tickets"
              count={tickets.length}
              onPress={() => router.push('/crm/tickets' as any)}
              color="#14B8A6"
              disabled={!availableEndpoints.includes('tickets')}
            />
            <QuickActionButton
              icon="settings"
              label="Cài đặt"
              onPress={() => router.push('/crm/settings' as any)}
              color="#6B7280"
            />
          </View>
        </View>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dự án gần đây</Text>
              <TouchableOpacity onPress={() => router.push('/crm/projects' as any)}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </View>
        )}

        {/* Recent Customers */}
        {customers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Khách hàng gần đây</Text>
              <TouchableOpacity onPress={() => router.push('/crm/customers' as any)}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {customers.slice(0, 3).map((customer) => (
              <CustomerCard key={customer.userid} customer={customer} />
            ))}
          </View>
        )}

        {/* API Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái API</Text>
          <View style={styles.apiStatusCard}>
            <APIStatusItem name="Customers" available={true} />
            <APIStatusItem name="Projects" available={true} />
            <APIStatusItem name="Staff" available={availableEndpoints.includes('staff')} />
            <APIStatusItem name="Invoices" available={availableEndpoints.includes('invoices')} />
            <APIStatusItem name="Leads" available={availableEndpoints.includes('leads')} />
            <APIStatusItem name="Tasks" available={availableEndpoints.includes('tasks')} />
            <APIStatusItem name="Tickets" available={availableEndpoints.includes('tickets')} />
            <APIStatusItem name="Estimates" available={availableEndpoints.includes('estimates')} />
            <APIStatusItem name="Contracts" available={availableEndpoints.includes('contracts')} />
            <APIStatusItem name="Expenses" available={availableEndpoints.includes('expenses')} />
          </View>
          
          {availableEndpoints.length < 5 && (
            <View style={styles.upgradeHint}>
              <Ionicons name="information-circle" size={18} color="#3B82F6" />
              <Text style={styles.upgradeHintText}>
                Cài đặt module "mobile_api" để mở khóa tất cả API endpoints
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== SYNC STATUS BAR ====================

interface SyncStatusBarProps {
  syncState: any;
  availableEndpoints: string[];
}

function SyncStatusBar({ syncState, availableEndpoints }: SyncStatusBarProps) {
  const lastSyncText = syncState.lastSyncTime
    ? `Cập nhật: ${new Date(syncState.lastSyncTime).toLocaleTimeString('vi-VN')}`
    : 'Chưa đồng bộ';

  return (
    <View style={styles.syncBar}>
      <View style={styles.syncInfo}>
        {syncState.isSyncing ? (
          <>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.syncText}>
              Đang đồng bộ {syncState.currentEntity || ''}... {syncState.syncProgress}%
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
            <Text style={styles.syncText}>{lastSyncText}</Text>
          </>
        )}
      </View>
      <Text style={styles.endpointCount}>
        {availableEndpoints.length}/10 API
      </Text>
    </View>
  );
}

// ==================== STAT CARD ====================

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  subValue?: string;
  color: string;
  disabled?: boolean;
}

function StatCard({ icon, label, value, subValue, color, disabled }: StatCardProps) {
  return (
    <View style={[styles.statCard, disabled && styles.statCardDisabled]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={disabled ? '#9CA3AF' : color} />
      </View>
      <Text style={[styles.statValue, disabled && styles.textDisabled]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subValue && (
        <Text style={[styles.statSubValue, disabled && styles.textDisabled]}>{subValue}</Text>
      )}
    </View>
  );
}

// ==================== QUICK ACTION BUTTON ====================

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  count?: number;
  onPress: () => void;
  color: string;
  disabled?: boolean;
}

function QuickActionButton({ icon, label, count, onPress, color, disabled }: QuickActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.quickActionButton, disabled && styles.quickActionDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: disabled ? '#E5E7EB' : color + '20' }]}>
        <Ionicons name={icon} size={22} color={disabled ? '#9CA3AF' : color} />
      </View>
      <Text style={[styles.quickActionLabel, disabled && styles.textDisabled]}>{label}</Text>
      {count !== undefined && (
        <Text style={[styles.quickActionCount, disabled && styles.textDisabled]}>{count}</Text>
      )}
    </TouchableOpacity>
  );
}

// ==================== PROJECT CARD ====================

function ProjectCard({ project }: { project: any }) {
  const statusColor = getStatusColor('project', project.status);
  const progress = parseInt(project.progress || '0');

  return (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.7}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle} numberOfLines={1}>{project.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusName('project', project.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.itemSubtitle}>{project.company}</Text>
      <View style={styles.itemFooter}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: statusColor }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
        <Text style={styles.itemValue}>{formatVND(parseFloat(project.project_cost || '0'))}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ==================== CUSTOMER CARD ====================

function CustomerCard({ customer }: { customer: any }) {
  return (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.7}>
      <View style={styles.itemHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>
            {customer.company.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{customer.company}</Text>
          <Text style={styles.itemSubtitle}>{customer.city}</Text>
        </View>
      </View>
      <View style={styles.itemFooter}>
        <View style={styles.contactRow}>
          <Ionicons name="call" size={14} color="#6B7280" />
          <Text style={styles.contactText}>{customer.phonenumber}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(customer.datecreated)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ==================== API STATUS ITEM ====================

function APIStatusItem({ name, available }: { name: string; available: boolean }) {
  return (
    <View style={styles.apiStatusItem}>
      <Text style={styles.apiStatusName}>{name}</Text>
      <View style={[styles.apiStatusDot, { backgroundColor: available ? '#0066CC' : '#000000' }]} />
    </View>
  );
}

// ==================== EXPORTED SCREEN ====================

export default function CrmAdminDashboard() {
  return (
    <PerfexFullSyncProvider>
      <AdminDashboardContent />
    </PerfexFullSyncProvider>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1E3A8A',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#0080FF',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  syncBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncText: {
    fontSize: 13,
    color: '#6B7280',
  },
  endpointCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    marginBottom: 0,
    padding: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#FFF',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardDisabled: {
    opacity: 0.6,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statSubValue: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  textDisabled: {
    color: '#9CA3AF',
  },
  financialCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  financialRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
  },
  financialDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  financialLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: (SCREEN_WIDTH - 60) / 4,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
  },
  quickActionCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
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
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    width: 35,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  customerInfo: {
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  apiStatusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  apiStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  apiStatusName: {
    fontSize: 12,
    color: '#374151',
  },
  apiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  upgradeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
  },
  upgradeHintText: {
    flex: 1,
    fontSize: 13,
    color: '#1D4ED8',
  },
});
